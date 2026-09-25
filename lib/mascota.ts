// Palomita, la mascota. Su ánimo (0-100) sube cuando ella lee el mensaje del día,
// cuando tú publicas contenido nuevo y cuando la alimenta. Baja lento sola.
import { supabase, supabaseConfigurado } from './supabase';
import { leerCache, guardarCache } from './cache';
import type { EstadoMascota } from './tipos';

const demo = !supabaseConfigurado;
const BASE: EstadoMascota = { animo: 60, ultima_comida: null, ultimo_contenido: null };

async function leer(): Promise<EstadoMascota> {
  if (demo) return (await leerCache<EstadoMascota>('demo:mascota')) ?? BASE;
  const { data } = await supabase.from('config').select('valor').eq('clave', 'mascota').maybeSingle();
  return { ...BASE, ...((data?.valor as Partial<EstadoMascota>) ?? {}) };
}

async function escribir(e: EstadoMascota) {
  if (demo) await guardarCache('demo:mascota', e);
  else await supabase.from('config').update({ valor: e }).eq('clave', 'mascota');
}

/** Ánimo actual con la bajada por tiempo aplicada (−4 por día sin comer, mínimo 10). */
export async function estadoMascota(): Promise<EstadoMascota & { animo01: number; frase: string }> {
  const e = await leer();
  const dias = e.ultima_comida ? (Date.now() - new Date(e.ultima_comida).getTime()) / 86_400_000 : 3;
  const animo = Math.max(10, Math.round(e.animo - dias * 4));
  const frase = animo > 75 ? 'Palomita está feliz' : animo > 50 ? 'Palomita está contenta' : animo > 30 ? 'Palomita está tranquila' : 'Palomita te extraña';
  return { ...e, animo, animo01: animo / 100, frase };
}

export async function subirAnimo(cuanto: number, motivo: 'mensaje' | 'checkin' | 'comida' | 'contenido') {
  const e = await leer();
  const nuevo: EstadoMascota = {
    ...e,
    animo: Math.min(100, e.animo + cuanto),
    ultima_comida: motivo === 'comida' ? new Date().toISOString() : e.ultima_comida,
    ultimo_contenido: motivo === 'contenido' ? new Date().toISOString() : e.ultimo_contenido,
  };
  await escribir(nuevo);
}

export const alimentar = () => subirAnimo(15, 'comida');
