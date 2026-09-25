// Stickers para el chat. Ella solo puede mandar los que tiene desbloqueados en
// el álbum; él los tiene todos, porque él los puso ahí.
import { supabase } from './supabase';
import type { Rol } from './sesion';

export type StickerDisponible = { id: string; nombre: string; img_path: string };

export async function misStickers(rol: Rol): Promise<StickerDisponible[]> {
  const { data: todos } = await supabase.from('stickers').select('id, nombre, img_path').order('nombre');
  const catalogo = (todos ?? []) as StickerDisponible[];
  if (rol === 'autor') return catalogo;

  const { data: album } = await supabase.from('album').select('sticker_id');
  const tengo = new Set((album ?? []).map((a) => (a as { sticker_id: string }).sticker_id));
  return catalogo.filter((s) => tengo.has(s.id));
}

/** id → img_path de todos los stickers, para pintar los que llegan por el chat. */
export async function catalogoStickers(): Promise<Record<string, string>> {
  const { data } = await supabase.from('stickers').select('id, img_path');
  const out: Record<string, string> = {};
  for (const s of (data ?? []) as { id: string; img_path: string }[]) out[s.id] = s.img_path;
  return out;
}
