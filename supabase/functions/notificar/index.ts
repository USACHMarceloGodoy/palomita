// Palomita · Edge Function `notificar`
// Recibe webhooks de Postgres (insert en checkins / alertas) y llamadas de
// pg_cron (mensaje del día, cápsulas), y manda push por Expo.
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
