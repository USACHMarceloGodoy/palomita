// Trivia, ruleta, granja y búsqueda del tesoro. Los besitos siempre pasan por economia.ts.
import { supabase, supabaseConfigurado } from './supabase';
import { conCache, leerCache, guardarCache } from './cache';
import { hoyChile, semillaDelDia } from './fechas';
import { ganar, RECOMPENSAS } from './economia';
import * as mock from './mock2';
import type { EntidadGranja, Pregunta, Premio } from './tipos';

const demo = !supabaseConfigurado;

// ---------------------------------------------------------------------------
// Trivia: 5 por ronda, una ronda al día. 5 correctas → foto inédita.
// ---------------------------------------------------------------------------
export async function preguntas(): Promise<Pregunta[]> {
  if (demo) return mock.triviaMock;
  const v = await conCache('trivia', async () => {
    const { data, error } = await supabase.from('trivia').select('id, pregunta, opciones, correcta');
    if (error) throw error;
    return data as Pregunta[];
  });
  return v ?? [];
}

/** Cinco preguntas del día, elegidas con la semilla de la fecha. */
export async function rondaDeHoy(): Promise<Pregunta[]> {
  const todas = await preguntas();
  if (todas.length <= 5) return todas;
  let s = semillaDelDia();
  const copia = [...todas];
  const out: Pregunta[] = [];
  while (out.length < 5 && copia.length) {
    s = (s * 1103515245 + 12345) >>> 0;
    out.push(copia.splice(s % copia.length, 1)[0]);
  }
  return out;
}

export async function rondaHecha(): Promise<number | null> {
  const hoy = hoyChile();
  if (demo) return leerCache<number>('demo:trivia:' + hoy);
  const { data } = await supabase.from('trivia_rondas').select('correctas').eq('fecha', hoy).maybeSingle();
  return data?.correctas ?? null;
}

export async function cerrarRonda(correctas: number) {
  const hoy = hoyChile();
  if (demo) await guardarCache('demo:trivia:' + hoy, correctas);
  else await supabase.from('trivia_rondas').insert({ fecha: hoy, correctas });
  if (correctas === 5) await ganar('trivia', RECOMPENSAS.trivia5).catch(() => {});
  else if (correctas >= 3) await ganar('trivia', Math.round(RECOMPENSAS.trivia5 / 2)).catch(() => {});
}

// ---------------------------------------------------------------------------
// Ruleta de citas: un giro por semana, ponderado por `peso`.
// ---------------------------------------------------------------------------
export async function premios(): Promise<Premio[]> {
  if (demo) return mock.ruletaMock;
  const v = await conCache('ruleta', async () => {
    const { data, error } = await supabase.from('ruleta').select('*').eq('activo', true);
    if (error) throw error;
    return data as Premio[];
  });
  return v ?? [];
}

export async function ultimoGiro(): Promise<{ premio: Premio; fecha: string } | null> {
  if (demo) return leerCache('demo:giro');
  const { data } = await supabase.from('ruleta_giros').select('fecha, premio:ruleta(*)').order('fecha', { ascending: false }).limit(1).maybeSingle();
  if (!data) return null;
  return { premio: (data as any).premio as Premio, fecha: (data as any).fecha };
}

export function puedeGirar(ultimo: { fecha: string } | null) {
  if (!ultimo) return true;
  return Date.now() - new Date(ultimo.fecha).getTime() > 6 * 86_400_000;
}

export async function girar(): Promise<Premio | null> {
  const lista = await premios();
  if (!lista.length) return null;
  const total = lista.reduce((a, p) => a + p.peso, 0);
  let r = Math.random() * total;
  let elegido = lista[lista.length - 1];
  for (const p of lista) { r -= p.peso; if (r <= 0) { elegido = p; break; } }
  const fecha = new Date().toISOString();
  if (demo) await guardarCache('demo:giro', { premio: elegido, fecha });
  else await supabase.from('ruleta_giros').insert({ premio_id: elegido.id });
  return elegido;
}

// ---------------------------------------------------------------------------
// Granja: una fila por animal o maceta. El crecimiento se calcula al leer.
// ---------------------------------------------------------------------------
export const ENTIDADES: EntidadGranja[] = [
  { entidad: 'vaca', tipo: 'animal', ultima_interaccion: null, nivel_crecimiento: 0 },
  { entidad: 'cerdo', tipo: 'animal', ultima_interaccion: null, nivel_crecimiento: 0 },
  { entidad: 'gato', tipo: 'animal', ultima_interaccion: null, nivel_crecimiento: 0 },
  { entidad: 'maceta_1', tipo: 'planta', ultima_interaccion: null, nivel_crecimiento: 0 },
  { entidad: 'maceta_2', tipo: 'planta', ultima_interaccion: null, nivel_crecimiento: 0 },
  { entidad: 'maceta_3', tipo: 'planta', ultima_interaccion: null, nivel_crecimiento: 0 },
];

export async function granja(): Promise<EntidadGranja[]> {
  if (demo) return (await leerCache<EntidadGranja[]>('demo:granja')) ?? ENTIDADES;
  const { data } = await supabase.from('granja').select('*');
  const filas = (data ?? []) as EntidadGranja[];
  return ENTIDADES.map((e) => filas.find((f) => f.entidad === e.entidad) ?? e);
}

/** Días desde la última interacción; null si nunca. */
export function diasSinVisita(e: EntidadGranja) {
  if (!e.ultima_interaccion) return null;
  return (Date.now() - new Date(e.ultima_interaccion).getTime()) / 86_400_000;
}

/** Crecimiento de planta 0-3: sube un nivel por cada riego (uno al día). */
export function crecimiento(e: EntidadGranja) {
  if (e.tipo !== 'planta' || !e.ultima_interaccion) return 0;
  const dias = diasSinVisita(e) ?? 0;
  if (dias > 4) return Math.max(0, e.nivel_crecimiento - 1); // se marchita un poco, nunca muere
  return Math.min(3, e.nivel_crecimiento);
}

/**
 * Qué flor le toca a esta maceta en el ciclo actual. Se deriva de la fecha de
 * la última interacción, así que al cosechar (que la deja en cero y cambia esa
 * fecha) el siguiente ciclo florece distinto. El componente hace el módulo
 * contra su propia lista de flores.
 */
export function varianteFlor(e: EntidadGranja): number {
  if (!e.ultima_interaccion) return 0;
  const minutos = Math.floor(new Date(e.ultima_interaccion).getTime() / 60_000);
  let s = minutos;
  for (let i = 0; i < e.entidad.length; i++) s = (s * 31 + e.entidad.charCodeAt(i)) >>> 0;
  return s % 1000;
}

/** ¿Ya interactuó hoy con esta entidad? (una recompensa por día por entidad) */
export function hechoHoy(e: EntidadGranja) {
  return !!e.ultima_interaccion && hoyChile(new Date(e.ultima_interaccion)) === hoyChile();
}

export async function interactuar(e: EntidadGranja, accion: 'acariciar' | 'regar' | 'cosechar'): Promise<number> {
  const yaHoy = hechoHoy(e);
  let nivel = crecimiento(e);
  let monto = 0;
  if (accion === 'acariciar' && !yaHoy) monto = e.entidad === 'gato' ? RECOMPENSAS.granja.gato : e.entidad === 'vaca' ? RECOMPENSAS.granja.vaca : RECOMPENSAS.granja.cerdo;
  if (accion === 'regar' && !yaHoy) { monto = RECOMPENSAS.granja.regar; nivel = Math.min(3, nivel + 1); }
  if (accion === 'cosechar' && nivel >= 3) { monto = RECOMPENSAS.granja.cosechar; nivel = 0; }
  const actualizado: EntidadGranja = { ...e, ultima_interaccion: new Date().toISOString(), nivel_crecimiento: nivel };

  if (demo) {
    const lista = await granja();
    await guardarCache('demo:granja', lista.map((x) => (x.entidad === e.entidad ? actualizado : x)));
  } else {
    await supabase.from('granja').upsert({ entidad: e.entidad, tipo: e.tipo, ultima_interaccion: actualizado.ultima_interaccion, nivel_crecimiento: nivel }, { onConflict: 'entidad' });
  }
  if (monto > 0) await ganar('granja', monto).catch(() => {});
  return monto;
}

// ---------------------------------------------------------------------------
// Búsqueda del tesoro: un lacito escondido en una pantalla al azar por día.
// Siete días distintos → cupón real.
// ---------------------------------------------------------------------------
export const PANTALLAS_TESORO = ['inicio', 'baul', 'jardin', 'ayuda', 'tesoro', 'diccionario', 'capsulas'] as const;
export type PantallaTesoro = (typeof PANTALLAS_TESORO)[number];

export function pantallaDelTesoro(): PantallaTesoro {
  return PANTALLAS_TESORO[semillaDelDia() % PANTALLAS_TESORO.length];
}

export async function diasEncontrados(): Promise<string[]> {
  if (demo) return (await leerCache<string[]>('demo:tesoro')) ?? [];
  const { data } = await supabase.from('tesoro').select('fecha');
  return (data ?? []).map((d) => d.fecha as string);
}

/** Registra el hallazgo de hoy. Devuelve cuántos días lleva y si ganó el cupón. */
export async function encontrarTesoro(): Promise<{ dias: number; cupon: boolean }> {
  const hoy = hoyChile();
  const antes = await diasEncontrados();
  if (antes.includes(hoy)) return { dias: antes.length, cupon: false };
  if (demo) await guardarCache('demo:tesoro', [...antes, hoy]);
  else await supabase.from('tesoro').insert({ fecha: hoy, pantalla: pantallaDelTesoro() });
  await ganar('tesoro', RECOMPENSAS.tesoroDia).catch(() => {});
  const dias = antes.length + 1;
  const cupon = dias % 7 === 0;
  if (cupon && !demo) {
    await supabase.from('cupones').insert({ titulo: 'Cupón del tesoro', descripcion: 'Siete lacitos encontrados. Canjeable por lo que tú digas.', costo: 0, comprado_en: new Date().toISOString() });
  }
  return { dias, cupon };
}
