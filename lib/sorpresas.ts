// Cápsula del tiempo, nuestros lugares, diccionario, k-drama episódico, easter eggs.
import { supabase, supabaseConfigurado } from './supabase';
import { conCache, leerCache, guardarCache } from './cache';
import * as mock from './mock2';
import type { Capitulo, Capsula, Entrada, Lugar } from './tipos';

const demo = !supabaseConfigurado;

// Cápsulas: RLS solo entrega las que ya se pueden abrir; las futuras se listan aparte con `proximas`.
export async function capsulas(): Promise<{ abiertas: Capsula[]; proximas: { id: string; titulo: string; abre_en: string }[] }> {
  if (demo) {
    const ahora = Date.now();
    const todas = mock.capsulasMock;
    return {
      abiertas: todas.filter((c) => new Date(c.abre_en).getTime() <= ahora),
      proximas: todas.filter((c) => new Date(c.abre_en).getTime() > ahora).map(({ id, titulo, abre_en }) => ({ id, titulo, abre_en })),
    };
  }
  const { data } = await supabase.from('capsulas').select('*').order('abre_en', { ascending: false });
  // Las futuras: solo título y fecha, por una función security definer.
  const { data: prox } = await supabase.rpc('capsulas_proximas');
  return { abiertas: (data ?? []) as Capsula[], proximas: (prox ?? []) as { id: string; titulo: string; abre_en: string }[] };
}

export async function marcarCapsulaAbierta(id: string) {
  if (demo) return;
  await supabase.from('capsulas').update({ abierta: true }).eq('id', id);
}

export async function lugares(): Promise<Lugar[]> {
  if (demo) return (await leerCache<Lugar[]>('demo:lugares')) ?? mock.lugaresMock;
  const v = await conCache('lugares', async () => {
    const { data, error } = await supabase.from('lugares').select('*');
    if (error) throw error;
    return data as Lugar[];
  });
  return v ?? [];
}

export async function desbloquearLugar(id: string) {
  const ahora = new Date().toISOString();
  if (demo) {
    const l = await lugares();
    await guardarCache('demo:lugares', l.map((x) => (x.id === id ? { ...x, desbloqueado_en: ahora } : x)));
    return;
  }
  await supabase.from('lugares').update({ desbloqueado_en: ahora }).eq('id', id).is('desbloqueado_en', null);
}

export async function diccionario(): Promise<Entrada[]> {
  if (demo) return mock.diccionarioMock;
  const v = await conCache('diccionario', async () => {
    const { data, error } = await supabase.from('diccionario').select('*').order('palabra');
    if (error) throw error;
    return data as Entrada[];
  });
  return v ?? [];
}

export async function capitulos(): Promise<Capitulo[]> {
  if (demo) return mock.capitulosMock;
  const v = await conCache('capitulos', async () => {
    const { data, error } = await supabase.from('capitulos').select('*').order('numero');
    if (error) throw error;
    return data as Capitulo[];
  });
  return v ?? [];
}

export async function marcarCapituloLeido(id: string) {
  if (demo) return;
  await supabase.from('capitulos').update({ leido_en: new Date().toISOString() }).eq('id', id).is('leido_en', null);
}

/** Easter eggs de texto: chiste del Bazinga y cláusulas del acuerdo de relación. */
export async function extras(): Promise<{ chiste: string; acuerdo: string[] }> {
  const base = { chiste: 'Bazinga. (Escribe tu chiste interno en el panel, clave chiste_bazinga.)', acuerdo: ['Cláusula 1: escribe tus cláusulas en el panel, clave acuerdo_relacion.'] };
  if (demo) return base;
  const { data } = await supabase.from('config').select('clave, valor').in('clave', ['chiste_bazinga', 'acuerdo_relacion']);
  const out = { ...base };
  for (const r of data ?? []) {
    if (r.clave === 'chiste_bazinga' && typeof r.valor === 'string') out.chiste = r.valor;
    if (r.clave === 'acuerdo_relacion' && Array.isArray(r.valor)) out.acuerdo = r.valor as string[];
  }
  return out;
}
