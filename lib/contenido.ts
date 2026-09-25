// Única puerta de la app a las tablas de contenido. Ninguna pantalla habla con Supabase directo.
import { supabase, supabaseConfigurado } from './supabase';
import { conCache, leerCache, guardarCache } from './cache';
import { hoyChile } from './fechas';
import * as mock from './mock';
import type { Checkin, Config, Cupon, Cuento, Emoji, ItemBotiquin, Mensaje, Recuerdo, Variante, CategoriaBotiquin } from './tipos';

const demo = !supabaseConfigurado;

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
export async function config(): Promise<Config> {
  const base: Config = { nombre_ella: '[NOMBRE]', fecha_inicio: '2024-01-01', hora_mensaje: '09:00' };
  if (demo) return base;
  const v = await conCache('config', async () => {
    const { data, error } = await supabase.from('config').select('clave, valor');
    if (error) throw error;
    const out: Record<string, unknown> = {};
    for (const r of data) out[r.clave] = r.valor;
    return out;
  });
  return { ...base, ...(v as Partial<Config>) };
}

// ---------------------------------------------------------------------------
// Mensaje del día
// Prioridad: nota manual con fecha de hoy > primer mensaje de la base no visto.
// ---------------------------------------------------------------------------
export async function mensajeDelDia(): Promise<Mensaje | null> {
  if (demo) {
    const vistoId = await leerCache<string>('demo:mensaje:' + hoyChile());
    return mock.mensajesMock.find((m) => m.id === vistoId) ?? mock.mensajesMock[0];
  }
  return conCache('mensaje:' + hoyChile(), async () => {
    const hoy = hoyChile();
    const { data: manual } = await supabase
      .from('mensajes')
      .select('*')
      .gte('fecha_publicacion', `${hoy}T00:00:00-03:00`)
      .lte('fecha_publicacion', `${hoy}T23:59:59-03:00`)
      .order('fecha_publicacion', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (manual) return manual as Mensaje;

    // ¿Ya se le asignó uno hoy? (visto hoy)
    const { data: vistoHoy } = await supabase
      .from('mensajes')
      .select('*')
      .gte('visto_en', `${hoy}T00:00:00-03:00`)
      .limit(1)
      .maybeSingle();
    if (vistoHoy) return vistoHoy as Mensaje;

    const { data: siguiente, error } = await supabase
      .from('mensajes')
      .select('*')
      .is('fecha_publicacion', null)
      .is('visto_en', null)
      .order('creado_en', { ascending: true })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return (siguiente as Mensaje) ?? null;
  });
}

export async function marcarVisto(id: string) {
  if (demo) return;
  await supabase.from('mensajes').update({ visto_en: new Date().toISOString() }).eq('id', id).is('visto_en', null);
}

// ---------------------------------------------------------------------------
// Baúl
// ---------------------------------------------------------------------------
export async function recuerdos(): Promise<Recuerdo[]> {
  if (demo) return mock.recuerdosMock;
  const v = await conCache('recuerdos', async () => {
    const { data, error } = await supabase.from('recuerdos').select('*').order('fecha', { ascending: false });
    if (error) throw error;
    return data as Recuerdo[];
  });
  return v ?? [];
}

// ---------------------------------------------------------------------------
// Check-in
// ---------------------------------------------------------------------------
export async function checkinDeHoy(): Promise<Checkin | null> {
  const hoy = hoyChile();
  if (demo) return leerCache<Checkin>('demo:checkin:' + hoy);
  const { data } = await supabase.from('checkins').select('*').eq('fecha', hoy).maybeSingle();
  return (data as Checkin) ?? null;
}

export async function enviarCheckin(emoji: Emoji, texto: string): Promise<Checkin> {
  const hoy = hoyChile();
  const limpio = texto.trim() || null;
  if (demo) {
    const c: Checkin = { id: 'demo', fecha: hoy, emoji, texto: limpio, respondido: false, creado_en: new Date().toISOString() };
    await guardarCache('demo:checkin:' + hoy, c);
    return c;
  }
  const { data, error } = await supabase
    .from('checkins')
    .insert({ fecha: hoy, emoji, texto: limpio })
    .select()
    .single();
  if (error) throw error;
  return data as Checkin;
}

export async function respuestaPara(emoji: Emoji): Promise<string> {
  if (demo) return mock.respuestasMock[emoji][0];
  const v = await conCache('respuestas', async () => {
    const { data, error } = await supabase.from('respuestas_checkin').select('emoji, texto');
    if (error) throw error;
    return data as { emoji: Emoji; texto: string }[];
  });
  const lista = (v ?? []).filter((r) => r.emoji === emoji);
  if (!lista.length) return 'Gracias por contarme.';
  // Rota por día para no repetir seguido.
  const idx = Number(hoyChile().replaceAll('-', '')) % lista.length;
  return lista[idx].texto;
}

// ---------------------------------------------------------------------------
// Botiquín
// ---------------------------------------------------------------------------
export async function botiquinAlAzar(categoria: CategoriaBotiquin): Promise<ItemBotiquin | null> {
  let lista: ItemBotiquin[];
  if (demo) {
    lista = mock.botiquinMock.filter((b) => b.categoria === categoria);
  } else {
    const v = await conCache('botiquin', async () => {
      const { data, error } = await supabase.from('botiquin').select('*');
      if (error) throw error;
      return data as ItemBotiquin[];
    });
    lista = (v ?? []).filter((b) => b.categoria === categoria);
  }
  if (!lista.length) return null;
  return lista[Math.floor(Math.random() * lista.length)];
}

// ---------------------------------------------------------------------------
// Cuentos (Modo dormir)
// ---------------------------------------------------------------------------
/**
 * Todos los cuentos, ordenados: primero las series (por nombre y número de
 * capítulo), después los sueltos. La pantalla de dormir los agrupa.
 */
export async function cuentos(): Promise<Cuento[]> {
  let lista: Cuento[];
  if (demo) {
    lista = mock.cuentosMock;
  } else {
    const v = await conCache('cuentos', async () => {
      const { data, error } = await supabase.from('cuentos').select('*');
      if (error) throw error;
      return data as Cuento[];
    });
    lista = v ?? [];
  }
  return [...lista].sort((a, b) => {
    if (a.serie !== b.serie) return (a.serie ?? '\uffff').localeCompare(b.serie ?? '\uffff');
    return (a.numero ?? 0) - (b.numero ?? 0);
  });
}

/** Deja constancia de que puso este capítulo, para el "seguir donde quedaste". */
export async function marcarCuentoEscuchado(id: string) {
  if (demo) return;
  await supabase.from('cuentos').update({ escuchado_en: new Date().toISOString() }).eq('id', id);
}

export async function teNecesitoAhora() {
  if (demo) return;
  const { error } = await supabase.from('alertas').insert({ tipo: 'te_necesito' });
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Multiverso
// ---------------------------------------------------------------------------
export async function multiverso(): Promise<Variante[]> {
  if (demo) {
    const guardado = await leerCache<Variante[]>('demo:multiverso');
    return guardado ?? mock.multiversoMock;
  }
  const v = await conCache('multiverso', async () => {
    const { data, error } = await supabase.from('multiverso').select('*').order('creado_en');
    if (error) throw error;
    return data as Variante[];
  });
  return v ?? [];
}

/** Entrega una variante nueva (no descubierta) y la marca. Si se agotaron, repite una al azar. */
export async function nuevaVariante(): Promise<Variante | null> {
  const todas = await multiverso();
  if (!todas.length) return null;
  const pendientes = todas.filter((v) => !v.descubierto_en);
  const elegida = pendientes.length
    ? pendientes[Math.floor(Math.random() * pendientes.length)]
    : todas[Math.floor(Math.random() * todas.length)];
  if (!elegida.descubierto_en) {
    const ahora = new Date().toISOString();
    elegida.descubierto_en = ahora;
    if (demo) await guardarCache('demo:multiverso', todas);
    else await supabase.from('multiverso').update({ descubierto_en: ahora }).eq('id', elegida.id);
  }
  return elegida;
}

// ---------------------------------------------------------------------------
// Cupones
// ---------------------------------------------------------------------------
export async function cupones(): Promise<Cupon[]> {
  if (demo) return mock.cuponesMock;
  const v = await conCache('cupones', async () => {
    const { data, error } = await supabase.from('cupones').select('*').order('costo');
    if (error) throw error;
    return data as Cupon[];
  });
  return v ?? [];
}
