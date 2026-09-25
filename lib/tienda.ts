// Tienda de besitos: gacha de stickers, foto inédita, audio inédito, comida para la mascota.
import { supabase, supabaseConfigurado } from './supabase';
import { conCache, leerCache, guardarCache } from './cache';
import { hoyChile } from './fechas';
import { gastar, PRECIOS } from './economia';
import { alimentar } from './mascota';
import * as mock from './mock2';
import type { ItemAlbum, Rareza, Sticker } from './tipos';

const demo = !supabaseConfigurado;

export async function stickers(): Promise<Sticker[]> {
  if (demo) return mock.stickersMock;
  const v = await conCache('stickers', async () => {
    const { data, error } = await supabase.from('stickers').select('*').order('coleccion');
    if (error) throw error;
    return data as Sticker[];
  });
  return v ?? [];
}

export async function album(): Promise<ItemAlbum[]> {
  if (demo) return (await leerCache<ItemAlbum[]>('demo:album')) ?? [];
  const { data } = await supabase.from('album').select('*').order('obtenido_en');
  return (data ?? []) as ItemAlbum[];
}

const PESO_RAREZA: Record<Rareza, number> = { comun: 70, raro: 25, epico: 5 };

/** Una cápsula gratis al día; las demás cuestan PRECIOS.sticker. */
export async function capsulaGratisDisponible(): Promise<boolean> {
  const ultima = await leerCache<string>('gacha:gratis');
  return ultima !== hoyChile();
}

export async function abrirCapsula(gratis: boolean): Promise<Sticker | null> {
  const todos = await stickers();
  if (!todos.length) return null;
  if (!gratis) {
    const ok = await gastar('tienda:sticker', PRECIOS.sticker);
    if (!ok) return null;
  } else {
    await guardarCache('gacha:gratis', hoyChile());
  }
  // Rareza primero, sticker después. Los repetidos cuentan igual: coleccionar es la gracia.
  const total = todos.reduce((a, s) => a + PESO_RAREZA[s.rareza], 0);
  let r = Math.random() * total;
  let elegido = todos[0];
  for (const s of todos) { r -= PESO_RAREZA[s.rareza]; if (r <= 0) { elegido = s; break; } }
  const item: ItemAlbum = { id: `${Date.now()}`, sticker_id: elegido.id, obtenido_en: new Date().toISOString() };
  if (demo) await guardarCache('demo:album', [...(await album()), item]);
  else await supabase.from('album').insert({ sticker_id: elegido.id });
  return elegido;
}

/** Compra una foto o audio inédito al azar. Devuelve el id del contenido, o null si no alcanza o no queda nada. */
export async function comprarInedito(tipo: 'foto' | 'audio'): Promise<string | null> {
  const costo = tipo === 'foto' ? PRECIOS.foto : PRECIOS.audio;
  if (demo) {
    const ok = await gastar(tipo === 'foto' ? 'tienda:foto' : 'tienda:audio', costo);
    return ok ? 'demo' : null;
  }
  const { data, error } = await supabase.rpc('comprar_inedito', { p_tipo: tipo, p_costo: costo });
  if (error) throw error;
  return (data as string | null) ?? null;
}

export async function comprarComida(): Promise<boolean> {
  const ok = await gastar('tienda:comida', PRECIOS.comida);
  if (ok) await alimentar();
  return ok;
}
