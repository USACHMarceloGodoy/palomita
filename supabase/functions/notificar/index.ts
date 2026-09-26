// Palomita · Edge Function `notificar`
// Recibe webhooks de Postgres (insert en checkins / alertas / notas / chat /
// regalos de mascota) y llamadas de pg_cron (mensaje del día, cápsulas,
// necesidades de la mascota), y manda push por Expo.
//
// Deploy:  supabase functions deploy notificar --no-verify-jwt
// Secrets: supabase secrets set WEBHOOK_SECRET=... (el mismo que va en las migraciones)

import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const WEBHOOK_SECRET = Deno.env.get("WEBHOOK_SECRET") ?? "";

const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

type Payload = {
  type: "INSERT" | "UPDATE" | "DELETE" | "CRON";
  table: string;
  record?: Record<string, unknown>;
};

type Push = {
  to: string;
  title: string;
  body: string;
  priority?: "default" | "high";
  sound?: "default" | null;
  data?: Record<string, unknown>;
  channelId?: string;
};

async function tokenDe(rol: "ella" | "autor"): Promise<string | null> {
  const { data } = await db.from("usuarios").select("push_token").eq("rol", rol).maybeSingle();
  return data?.push_token ?? null;
}

async function enviar(msgs: Push[]) {
  const validos = msgs.filter((m) => m.to);
  if (!validos.length) return;
  const r = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(validos),
  });
  if (!r.ok) console.error("expo push", r.status, await r.text());
}

const etiquetas: Record<string, string> = {
  fatal: "fatal", mal: "mal", normal: "normal", bien: "bien", genial: "genial",
};

async function hoySantiago(): Promise<string> {
  const { data } = await db.rpc("hoy_santiago");
  if (data) return data as string;
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Santiago" });
}

Deno.serve(async (req) => {
  if (WEBHOOK_SECRET && req.headers.get("x-webhook-secret") !== WEBHOOK_SECRET) {
    return new Response("no", { status: 401 });
  }
  const p = (await req.json()) as Payload;

  // Ella hizo check-in → a ti
  if (p.table === "checkins" && p.type === "INSERT" && p.record) {
    const to = await tokenDe("autor");
    const emoji = etiquetas[String(p.record.emoji)] ?? String(p.record.emoji);
    const texto = (p.record.texto as string | null)?.trim();
    await enviar([{
      to: to ?? "",
      title: `Check-in: ${emoji}`,
      body: texto || "Sin texto hoy.",
      data: { tipo: "checkin", id: p.record.id },
    }]);
    return Response.json({ ok: true });
  }

  // "Te necesito ahora" → a ti, prioridad alta
  if (p.table === "alertas" && p.type === "INSERT") {
    const to = await tokenDe("autor");
    await enviar([{
      to: to ?? "",
      title: "Te necesita ahora",
      body: "Llámala.",
      priority: "high",
      sound: "default",
      channelId: "urgente",
      data: { tipo: "te_necesito" },
    }]);
    return Response.json({ ok: true });
  }

  // Mensaje de chat → al otro. Ojo: el contenido va cifrado de punta a punta,
  // así que el servidor no sabe qué dice. La notificación solo avisa.
  if (p.table === "mensajes_chat" && p.type === "INSERT" && p.record) {
    const de = String(p.record.autor_rol) as "ella" | "autor";
    const para = de === "ella" ? "autor" : "ella";
    const to = await tokenDe(para);
    await enviar([{
      to: to ?? "",
      title: "Mensaje nuevo",
      body: de === "ella" ? "Te escribió." : "Te escribió.",
      data: { tipo: "chat" },
    }]);
    return Response.json({ ok: true });
  }

  // Nota nueva → al otro. Las notas van en los dos sentidos: `autor_rol` dice
  // quién la escribió, así que el aviso va para el que falta.
  if (p.table === "notas" && p.type === "INSERT" && p.record) {
    const de = (String(p.record.autor_rol ?? "autor")) as "ella" | "autor";
    const to = await tokenDe(de === "ella" ? "autor" : "ella");
    const texto = (p.record.texto as string | null)?.trim();
    const hayDibujo = !!p.record.dibujo_path;
    await enviar([{
      to: to ?? "",
      title: hayDibujo && !texto ? "Te dibujó algo" : "Te dejó una nota",
      body: texto ? (texto.length > 120 ? texto.slice(0, 117) + "..." : texto) : "Ábrela para verla.",
      data: { tipo: "nota", id: p.record.id },
    }]);
    return Response.json({ ok: true });
  }

  // Regalo entre mascotas → al que lo recibe
  if (p.table === "regalos_mascota" && p.type === "INSERT" && p.record) {
    const para = String(p.record.para_rol) as "ella" | "autor";
    const to = await tokenDe(para);
    await enviar([{
      to: to ?? "",
      title: "Tu mascota recibió un regalo",
      body: (p.record.mensaje as string | null)?.trim() || "Tu pareja le dejó algo. Ábrelo en su casa.",
      data: { tipo: "regalo_mascota" },
    }]);
    return Response.json({ ok: true });
  }

  // Cron cada 2 h → "tu mascota te necesita" si alguna barra está bajo 20 %.
  // El valor real se recalcula igual que en la app: puntos por hora desde la
  // última marca de tiempo. Máximo un aviso cada 8 h por persona.
  if (p.table === "mascota" && p.type === "CRON") {
    const TASA = { hambre: 4, higiene: 2, afecto: 3 } as const;
    const { data: filas } = await db.from("mascota_necesidades").select("*");
    const { data: mascotas } = await db.from("mascota").select("rol, nombre");
    const ahora = Date.now();
    const avisos: Push[] = [];
    const avisados: string[] = [];
    for (const n of filas ?? []) {
      if (n.avisado_en && ahora - new Date(n.avisado_en).getTime() < 8 * 3_600_000) continue;
      const bajas: string[] = [];
      for (const k of ["hambre", "higiene", "afecto"] as const) {
        const horas = Math.max(0, (ahora - new Date(n[`${k}_en`]).getTime()) / 3_600_000);
        const v = Math.max(0, Math.min(100, Math.round(n[k] - horas * TASA[k])));
        if (v < 20) bajas.push(k === "hambre" ? "tiene hambre" : k === "higiene" ? "quiere un baño" : "te extraña");
      }
      if (!bajas.length) continue;
      const to = await tokenDe(n.rol as "ella" | "autor");
      if (!to) continue;
      const nombre = mascotas?.find((m) => m.rol === n.rol)?.nombre ?? "Tu mascota";
      avisos.push({ to, title: `${nombre} te necesita`, body: `${nombre} ${bajas.join(" y ")}.`, data: { tipo: "mascota" } });
      avisados.push(n.rol as string);
    }
    if (avisos.length) {
      await enviar(avisos);
      await db.from("mascota_necesidades").update({ avisado_en: new Date().toISOString() }).in("rol", avisados);
    }
    return Response.json({ ok: true, n: avisos.length });
  }

  // Cron 09:00 → a ella si hay mensaje con fecha de hoy y aún no visto
  if (p.table === "mensajes" && p.type === "CRON") {
    const hoy = await hoySantiago();
    const { data: m } = await db
      .from("mensajes")
      .select("id")
      .gte("fecha_publicacion", `${hoy}T00:00:00-03:00`)
      .lt("fecha_publicacion", `${hoy}T23:59:59-03:00`)
      .is("visto_en", null)
      .limit(1)
      .maybeSingle();
    if (!m) return Response.json({ ok: true, skip: "sin mensaje hoy" });
    const to = await tokenDe("ella");
    await enviar([{
      to: to ?? "",
      title: "Palomita",
      body: "Hay algo nuevo para ti.",
      data: { tipo: "mensaje", id: m.id },
    }]);
    return Response.json({ ok: true });
  }

  // Cron cada 30 min → cápsulas que ya se pueden abrir
  if (p.table === "capsulas" && p.type === "CRON") {
    const { data: caps } = await db
      .from("capsulas")
      .select("id, titulo")
      .lte("abre_en", new Date().toISOString())
      .eq("abierta", false)
      .is("notificada_en", null);
    if (!caps?.length) return Response.json({ ok: true, skip: "nada" });
    const to = await tokenDe("ella");
    await enviar(caps.map((c) => ({
      to: to ?? "",
      title: "Se abrió una cápsula",
      body: c.titulo,
      data: { tipo: "capsula", id: c.id },
    })));
    await db.from("capsulas").update({ notificada_en: new Date().toISOString() })
      .in("id", caps.map((c) => c.id));
    return Response.json({ ok: true, n: caps.length });
  }

  return Response.json({ ok: true, ignorado: p.table });
});
