// Acceso a las tablas del sistema de mascota. Sin Supabase (modo demo) todo
// vive en AsyncStorage, igual que el resto de la app.
import { supabase, supabaseConfigurado } from '../supabase';
import { leerCache, guardarCache } from '../cache';
import type { Rol } from '../sesion';
import type { Decoracion, Donacion, ItemInventario, Mascota, Necesidades, Puntaje, Regalo } from './tipos';

const demo = !supabaseConfigurado;

// --------------------------------------------------------------------------
// Rol
// --------------------------------------------------------------------------
let rolMemo: Rol | null = null;

export async function rolActual(): Promise<Rol> {
  if (demo) return 'ella';
  if (rolMemo) return rolMemo;
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return 'ella';
  const { data } = await supabase.from('usuarios').select('rol').eq('id', u.user.id).maybeSingle();
  rolMemo = ((data?.rol as Rol) ?? 'ella');
  return rolMemo;
}

export const otroRol = (r: Rol): Rol => (r === 'ella' ? 'autor' : 'ella');

// --------------------------------------------------------------------------
// Tablas demo: una lista por tabla en caché
// --------------------------------------------------------------------------
async function listaDemo<T>(tabla: string): Promise<T[]> {
  return (await leerCache<T[]>(`demo:mv:${tabla}`)) ?? [];
}
async function guardarDemo<T>(tabla: string, lista: T[]) {
  await guardarCache(`demo:mv:${tabla}`, lista);
}

// --------------------------------------------------------------------------
// Mascota
// --------------------------------------------------------------------------
const PAREJA_DEMO: Mascota = {
  rol: 'autor', especie: 'perro', orejas: 'caidas', hocico: 'trufa', ojos: 'grandes', boca: 'lengua', color_pelaje: '#C8ECD9', color_secundario: '#FFFFFF',
  nombre: 'Mote', look: { cuello: 'panuelo' },
  decoracion: { habitaciones: [
    { tipo: 'sala', pared: 'pared_cielo', suelo: 'suelo_madera', muebles: [{ id: 'cama_azul', x: 0.22, y: 0.82 }, { id: 'planta', x: 0.86, y: 0.78 }, { id: 'cuadro', x: 0.55, y: 0.28 }] },
    { tipo: 'jardin', pared: 'pared_cielo', suelo: 'suelo_pasto', muebles: [{ id: 'columpio', x: 0.3, y: 0.7 }, { id: 'planta_flor', x: 0.8, y: 0.8 }] },
  ] },
  creado_en: '2026-01-01T00:00:00Z', actualizado_en: '2026-01-01T00:00:00Z',
};

export const DECORACION_INICIAL: Decoracion = {
  habitaciones: [{ tipo: 'sala', pared: 'pared_rosa', suelo: 'suelo_madera', muebles: [{ id: 'cama', x: 0.25, y: 0.82 }] }],
};

/** La casa empezó siendo una sola habitación ({pared, suelo, muebles: string[]}); se convierte al vuelo. */
export function normalizarDecoracion(d: unknown): Decoracion {
  const v = d as { habitaciones?: Decoracion['habitaciones']; pared?: string; suelo?: string; muebles?: unknown[] } | null;
  if (v?.habitaciones?.length) return { habitaciones: v.habitaciones };
  if (v?.pared) {
    const muebles = (v.muebles ?? []).map((m, i) => (typeof m === 'string'
      ? { id: m, x: 0.2 + (i % 4) * 0.2, y: i < 4 ? 0.8 : 0.35 }
      : (m as Decoracion['habitaciones'][0]['muebles'][0])));
    return { habitaciones: [{ tipo: 'sala', pared: v.pared, suelo: v.suelo ?? 'suelo_madera', muebles }] };
  }
  return DECORACION_INICIAL;
}

function completar(m: Mascota): Mascota {
  // Ojos, boca (0016) y habitaciones llegaron después: una fila vieja se completa al leer.
  return { ...m, ojos: m.ojos ?? 'redondos', boca: m.boca ?? 'sonrisa', decoracion: normalizarDecoracion(m.decoracion) };
}

export async function mascotaDe(rol: Rol): Promise<Mascota | null> {
  if (demo) {
    const l = await listaDemo<Mascota>('mascota');
    const m = l.find((x) => x.rol === rol) ?? (rol === 'autor' ? PAREJA_DEMO : null);
    return m ? completar(m) : null;
  }
  const { data } = await supabase.from('mascota').select('*').eq('rol', rol).maybeSingle();
  if (!data) return null;
  return completar(data as Mascota);
}

export async function guardarMascota(m: Omit<Mascota, 'creado_en' | 'actualizado_en'>) {
  const ahora = new Date().toISOString();
  if (demo) {
    const l = await listaDemo<Mascota>('mascota');
    const previa = l.find((x) => x.rol === m.rol);
    const nueva: Mascota = { ...m, creado_en: previa?.creado_en ?? ahora, actualizado_en: ahora };
    await guardarDemo('mascota', [...l.filter((x) => x.rol !== m.rol), nueva]);
    return;
  }
  const { error } = await supabase.from('mascota').upsert({ ...m, actualizado_en: ahora }, { onConflict: 'rol' });
  if (error) throw error;
}

// --------------------------------------------------------------------------
// Necesidades
// --------------------------------------------------------------------------
function necesidadesBase(rol: Rol): Necesidades {
  const t = new Date().toISOString();
  return { rol, hambre: 80, hambre_en: t, higiene: 80, higiene_en: t, afecto: 80, afecto_en: t };
}

export async function necesidadesDe(rol: Rol): Promise<Necesidades> {
  if (demo) {
    const l = await listaDemo<Necesidades>('necesidades');
    return l.find((n) => n.rol === rol) ?? necesidadesBase(rol);
  }
  const { data } = await supabase.from('mascota_necesidades').select('*').eq('rol', rol).maybeSingle();
  return (data as Necesidades | null) ?? necesidadesBase(rol);
}

export async function guardarNecesidades(n: Necesidades) {
  if (demo) {
    const l = await listaDemo<Necesidades>('necesidades');
    await guardarDemo('necesidades', [...l.filter((x) => x.rol !== n.rol), n]);
    return;
  }
  const { error } = await supabase.from('mascota_necesidades').upsert(n, { onConflict: 'rol' });
  if (error) throw error;
}

// --------------------------------------------------------------------------
// Inventario
// --------------------------------------------------------------------------
export async function inventarioDe(rol: Rol): Promise<ItemInventario[]> {
  if (demo) return (await listaDemo<ItemInventario>('inventario')).filter((i) => i.rol === rol && i.cantidad > 0);
  const { data } = await supabase.from('inventario').select('*').eq('rol', rol).gt('cantidad', 0);
  return (data ?? []) as ItemInventario[];
}

export async function cantidadDe(rol: Rol, item_id: string): Promise<number> {
  const inv = await inventarioDe(rol);
  return inv.find((i) => i.item_id === item_id)?.cantidad ?? 0;
}

export async function agregarItem(rol: Rol, item_id: string, cantidad = 1) {
  const actual = await cantidadDe(rol, item_id);
  const fila: ItemInventario = { rol, item_id, cantidad: actual + cantidad, obtenido_en: new Date().toISOString() };
  if (demo) {
    const l = await listaDemo<ItemInventario>('inventario');
    await guardarDemo('inventario', [...l.filter((i) => !(i.rol === rol && i.item_id === item_id)), fila]);
    return;
  }
  const { error } = await supabase.from('inventario').upsert(fila, { onConflict: 'rol,item_id' });
  if (error) throw error;
}

/** Quita unidades. Devuelve false si no había suficientes. */
export async function quitarItem(rol: Rol, item_id: string, cantidad = 1): Promise<boolean> {
  const actual = await cantidadDe(rol, item_id);
  if (actual < cantidad) return false;
  await agregarItem(rol, item_id, -cantidad);
  return true;
}

// --------------------------------------------------------------------------
// Museo
// --------------------------------------------------------------------------
export async function donacionesDe(rol: Rol): Promise<Donacion[]> {
  if (demo) return (await listaDemo<Donacion>('museo')).filter((d) => d.rol === rol);
  const { data } = await supabase.from('museo_donaciones').select('*').eq('rol', rol);
  return (data ?? []) as Donacion[];
}

export async function registrarDonacion(rol: Rol, item_id: string) {
  const d: Donacion = { rol, item_id, donado_en: new Date().toISOString() };
  if (demo) {
    const l = await listaDemo<Donacion>('museo');
    if (l.some((x) => x.rol === rol && x.item_id === item_id)) return;
    await guardarDemo('museo', [...l, d]);
    return;
  }
  const { error } = await supabase.from('museo_donaciones').upsert(d, { onConflict: 'rol,item_id', ignoreDuplicates: true });
  if (error) throw error;
}

// --------------------------------------------------------------------------
// Puntajes y contadores diarios (estadio, pesca, cuidado, árbol, visita...)
// --------------------------------------------------------------------------
export async function puntajeDe(rol: Rol, juego: string, fecha: string): Promise<Puntaje | null> {
  if (demo) return (await listaDemo<Puntaje>('puntajes')).find((p) => p.rol === rol && p.juego === juego && p.fecha === fecha) ?? null;
  const { data } = await supabase.from('minijuego_puntajes').select('*').eq('rol', rol).eq('juego', juego).eq('fecha', fecha).maybeSingle();
  return (data as Puntaje | null) ?? null;
}

export async function guardarPuntaje(p: Puntaje) {
  if (demo) {
    const l = await listaDemo<Puntaje>('puntajes');
    await guardarDemo('puntajes', [...l.filter((x) => !(x.rol === p.rol && x.juego === p.juego && x.fecha === p.fecha)), p]);
    return;
  }
  const { error } = await supabase.from('minijuego_puntajes').upsert(p, { onConflict: 'rol,juego,fecha' });
  if (error) throw error;
}

export async function trofeosDe(rol: Rol): Promise<Puntaje[]> {
  if (demo) return (await listaDemo<Puntaje>('puntajes')).filter((p) => p.rol === rol && p.juego === 'estadio');
  const { data } = await supabase.from('minijuego_puntajes').select('*').eq('rol', rol).eq('juego', 'estadio').order('fecha', { ascending: false }).limit(30);
  return (data ?? []) as Puntaje[];
}

// --------------------------------------------------------------------------
// Regalos entre mascotas
// --------------------------------------------------------------------------
export async function regalosPendientes(para: Rol): Promise<Regalo[]> {
  if (demo) return (await listaDemo<Regalo>('regalos')).filter((r) => r.para_rol === para && !r.recibido_en);
  const { data } = await supabase.from('regalos_mascota').select('*').eq('para_rol', para).is('recibido_en', null).order('creado_en');
  return (data ?? []) as Regalo[];
}

export async function enviarRegalo(de: Rol, para: Rol, item_id: string, mensaje: string | null) {
  const r: Regalo = { id: `${Date.now()}`, de_rol: de, para_rol: para, item_id, mensaje, creado_en: new Date().toISOString(), recibido_en: null };
  if (demo) {
    const l = await listaDemo<Regalo>('regalos');
    await guardarDemo('regalos', [...l, r]);
    return;
  }
  const { error } = await supabase.from('regalos_mascota').insert({ de_rol: de, para_rol: para, item_id, mensaje });
  if (error) throw error;
}

export async function marcarRecibido(id: string) {
  const ahora = new Date().toISOString();
  if (demo) {
    const l = await listaDemo<Regalo>('regalos');
    await guardarDemo('regalos', l.map((r) => (r.id === id ? { ...r, recibido_en: ahora } : r)));
    return;
  }
  const { error } = await supabase.from('regalos_mascota').update({ recibido_en: ahora }).eq('id', id);
  if (error) throw error;
}
