// Toda la lógica de besitos vive aquí y en ningún otro archivo.
import { supabase } from './supabase';
import { conCache } from './cache';

export type Origen =
  | 'checkin'
  | 'granja'
  | 'laberinto'
  | 'laberinto_bonus'
  | 'trivia'
  | 'puzzle'
  | 'tesoro'
  | 'tienda:foto'
  | 'tienda:audio'
  | 'tienda:cupon'
  | 'tienda:sticker'
  | 'tienda:comida'
  // sistema de mascota virtual
  | 'tienda:mascota'
  | 'mascota:alimentar'
  | 'mascota:banar'
  | 'mascota:acariciar'
  | 'mascota:vender'
  | 'pesca'
  | 'estadio'
  | 'arbol'
  | 'cocina'
  | 'museo'
  | 'visita';

export const RECOMPENSAS = {
  checkin: 10,
  laberinto: 15,
  laberintoBonus: 30,
  trivia5: 20,
  puzzle: 12,
  tesoroDia: 5,
  granja: { vaca: 3, cerdo: 3, gato: 5, regar: 2, cosechar: 8 },
} as const;

export const PRECIOS = {
  foto: 40,
  audio: 60,
  cupon: 150,
  sticker: 25,
  comida: 10,
} as const;

export async function saldo(): Promise<number> {
  const v = await conCache('saldo', async () => {
    const { data, error } = await supabase.from('saldo_besitos').select('saldo').single();
    if (error) throw error;
    return data.saldo as number;
  });
  return v ?? 0;
}

export async function ganadoHoy(): Promise<number> {
  const { data } = await supabase.from('ganado_hoy').select('ganado').single();
  return (data?.ganado as number) ?? 0;
}

/** Suma besitos. El tope diario lo aplica el trigger en Postgres, no la app. */
export async function ganar(origen: Origen, monto: number) {
  if (monto <= 0) return;
  const { error } = await supabase.from('economia').insert({ origen, monto });
  if (error) throw error;
}

/** Gasta besitos si alcanza. Devuelve false si no alcanza. */
export async function gastar(origen: Origen, monto: number): Promise<boolean> {
  const actual = await saldo();
  if (actual < monto) return false;
  const { error } = await supabase.from('economia').insert({ origen, monto: -monto });
  if (error) throw error;
  return true;
}

export async function comprarCupon(cuponId: string, costo: number): Promise<boolean> {
  const ok = await gastar('tienda:cupon', costo);
  if (!ok) return false;
  const { error } = await supabase
    .from('cupones')
    .update({ comprado_en: new Date().toISOString() })
    .eq('id', cuponId)
    .is('comprado_en', null);
  if (error) throw error;
  return true;
}
