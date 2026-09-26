// Todo lo que se puede hacer con la mascota: cuidarla, comprar, vender,
// pescar, competir, cocinar, donar, visitar. Los besitos siempre pasan por
// economia.ts (y el tope diario lo aplica la base).
import { ganar, gastar } from '../economia';
import { hoyChile } from '../fechas';
import type { Rol } from '../sesion';
import { disponibleEstaSemana, item, PESO_RAREZA, RECETAS, itemsDe } from './catalogo';
import {
  agregarItem, cantidadDe, enviarRegalo, guardarPuntaje, marcarRecibido, otroRol, puntajeDe, quitarItem,
  registrarDonacion, regalosPendientes, donacionesDe,
} from './datos';
import { sumar } from './necesidades';
import { temporada } from './tiempo';
import type { Item, Necesidad, Regalo } from './tipos';

export const RECOMPENSAS_MASCOTA = {
  alimentar: 2, alimentarVecesDia: 3,
  banar: 5,
  acariciar: 3,
  pesca: { 1: 5, 2: 10, 3: 16, 4: 25 } as Record<1 | 2 | 3 | 4, number>, pescaTiradasDia: 3,
  estadio: { 1: 15, 2: 10, 3: 5 } as Record<1 | 2 | 3, number>,
  arbol: 5,
  cocinar: 6,
  donar: 8,
  visita: 5,
} as const;

// --------------------------------------------------------------------------
// Contadores diarios (viven en minijuego_puntajes con juego = 'cuidado')
// --------------------------------------------------------------------------
async function contadores(rol: Rol): Promise<Record<string, number>> {
  const p = await puntajeDe(rol, 'cuidado', hoyChile());
  return (p?.detalle as Record<string, number>) ?? {};
}

export async function vecesHoy(rol: Rol, clave: string): Promise<number> {
  return (await contadores(rol))[clave] ?? 0;
}

async function contar(rol: Rol, clave: string): Promise<number> {
  const c = await contadores(rol);
  const n = (c[clave] ?? 0) + 1;
  await guardarPuntaje({ rol, juego: 'cuidado', fecha: hoyChile(), puntaje: 0, detalle: { ...c, [clave]: n } });
  return n;
}

// --------------------------------------------------------------------------
// Cuidado
// --------------------------------------------------------------------------
/** Da un ítem de comida del inventario. Devuelve los besitos ganados (0 si ya pasó el tope de hoy). */
export async function alimentar(rol: Rol, itemId: string): Promise<{ ok: boolean; besitos: number }> {
  const it = item(itemId);
  if (!it?.efecto) return { ok: false, besitos: 0 };
  if (!(await quitarItem(rol, itemId))) return { ok: false, besitos: 0 };
  await sumar(rol, it.efecto);
  const n = await contar(rol, 'alimentar');
  const besitos = n <= RECOMPENSAS_MASCOTA.alimentarVecesDia ? RECOMPENSAS_MASCOTA.alimentar : 0;
  if (besitos) await ganar('mascota:alimentar', besitos).catch(() => {});
  return { ok: true, besitos };
}

export async function banar(rol: Rol): Promise<number> {
  await sumar(rol, { higiene: 45, afecto: 5 });
  const n = await contar(rol, 'banar');
  const besitos = n === 1 ? RECOMPENSAS_MASCOTA.banar : 0;
  if (besitos) await ganar('mascota:banar', besitos).catch(() => {});
  return besitos;
}

export async function acariciar(rol: Rol): Promise<number> {
  await sumar(rol, { afecto: 20 });
  const n = await contar(rol, 'acariciar');
  const besitos = n === 1 ? RECOMPENSAS_MASCOTA.acariciar : 0;
  if (besitos) await ganar('mascota:acariciar', besitos).catch(() => {});
  return besitos;
}

// --------------------------------------------------------------------------
// Tienda
// --------------------------------------------------------------------------
export function catalogoTienda(categoria: Item['categoria']): Item[] {
  const t = temporada();
  return itemsDe(categoria).filter((i) => i.precio > 0 && disponibleEstaSemana(i, t));
}

/** Ítems de temporada disponibles hoy, de cualquier categoría. */
export function catalogoTemporada(): Item[] {
  const t = temporada();
  if (!t) return [];
  return itemsDe('ropa').concat(itemsDe('mueble'), itemsDe('pared'), itemsDe('suelo')).filter((i) => i.temporada === t);
}

export async function comprar(rol: Rol, itemId: string): Promise<boolean> {
  const it = item(itemId);
  if (!it || it.precio <= 0) return false;
  const ok = await gastar('tienda:mascota', it.precio);
  if (!ok) return false;
  await agregarItem(rol, itemId);
  return true;
}

export async function vender(rol: Rol, itemId: string): Promise<number> {
  const it = item(itemId);
  if (!it || it.venta <= 0) return 0;
  if (!(await quitarItem(rol, itemId))) return 0;
  await ganar('mascota:vender', it.venta).catch(() => {});
  return it.venta;
}

// --------------------------------------------------------------------------
// Pesca: elige qué pica según rareza; el cebo mejora la suerte.
// --------------------------------------------------------------------------
export async function tiradasHoy(rol: Rol) { return vecesHoy(rol, 'pesca'); }

export async function pescar(rol: Rol, conCebo: boolean): Promise<{ item: Item; besitos: number; conRecompensa: boolean }> {
  if (conCebo) await quitarItem(rol, 'cebo');
  const posibles = itemsDe('pez').concat(itemsDe('fosil'));
  const peso = (i: Item) => {
    const r = i.rareza ?? 1;
    let p = PESO_RAREZA[r];
    if (conCebo && r >= 2) p *= 2;
    if (i.categoria === 'fosil') p *= 0.35;
    return p;
  };
  const total = posibles.reduce((a, i) => a + peso(i), 0);
  let x = Math.random() * total;
  let elegido = posibles[0];
  for (const i of posibles) { x -= peso(i); if (x <= 0) { elegido = i; break; } }
  await agregarItem(rol, elegido.id);
  const n = await contar(rol, 'pesca');
  const conRecompensa = n <= RECOMPENSAS_MASCOTA.pescaTiradasDia;
  const besitos = conRecompensa ? (elegido.id === 'bota' ? 1 : RECOMPENSAS_MASCOTA.pesca[elegido.rareza ?? 1]) : 0;
  if (besitos) await ganar('pesca', besitos).catch(() => {});
  return { item: elegido, besitos, conRecompensa };
}

// --------------------------------------------------------------------------
// Estadio: una carrera al día con premio; las demás por gusto.
// --------------------------------------------------------------------------
export async function carreraDeHoy(rol: Rol) { return puntajeDe(rol, 'estadio', hoyChile()); }

export async function registrarCarrera(rol: Rol, lugar: 1 | 2 | 3, toques: number): Promise<number> {
  const previa = await carreraDeHoy(rol);
  if (previa) return 0;
  const besitos = RECOMPENSAS_MASCOTA.estadio[lugar];
  await guardarPuntaje({ rol, juego: 'estadio', fecha: hoyChile(), puntaje: toques, detalle: { lugar } });
  await agregarItem(rol, lugar === 1 ? 'trofeo_oro' : lugar === 2 ? 'trofeo_plata' : 'trofeo_bronce');
  await ganar('estadio', besitos).catch(() => {});
  return besitos;
}

// --------------------------------------------------------------------------
// Árbol de la amistad: sacudirlo una vez al día.
// --------------------------------------------------------------------------
export async function arbolHecho(rol: Rol) { return (await vecesHoy(rol, 'arbol')) > 0; }

export async function sacudirArbol(rol: Rol): Promise<{ tipo: 'besitos' | 'item'; item?: Item; besitos: number }> {
  await contar(rol, 'arbol');
  const r = Math.random();
  if (r < 0.4) {
    await ganar('arbol', RECOMPENSAS_MASCOTA.arbol).catch(() => {});
    return { tipo: 'besitos', besitos: RECOMPENSAS_MASCOTA.arbol };
  }
  const bolsa = r < 0.75 ? itemsDe('ingrediente') : itemsDe('insecto');
  const pesos = bolsa.map((i) => PESO_RAREZA[i.rareza ?? 1]);
  let x = Math.random() * pesos.reduce((a, b) => a + b, 0);
  let elegido = bolsa[0];
  for (let k = 0; k < bolsa.length; k++) { x -= pesos[k]; if (x <= 0) { elegido = bolsa[k]; break; } }
  await agregarItem(rol, elegido.id);
  return { tipo: 'item', item: elegido, besitos: 0 };
}

// --------------------------------------------------------------------------
// Cocina
// --------------------------------------------------------------------------
export async function puedeCocinar(rol: Rol, recetaId: string): Promise<boolean> {
  const r = RECETAS.find((x) => x.id === recetaId);
  if (!r) return false;
  for (const ing of r.ingredientes) if ((await cantidadDe(rol, ing)) < 1) return false;
  return true;
}

export async function cocinar(rol: Rol, recetaId: string): Promise<{ ok: boolean; besitos: number; plato?: Item }> {
  const r = RECETAS.find((x) => x.id === recetaId);
  if (!r || !(await puedeCocinar(rol, recetaId))) return { ok: false, besitos: 0 };
  for (const ing of r.ingredientes) await quitarItem(rol, ing);
  await agregarItem(rol, r.resultado);
  const n = await contar(rol, 'cocinar');
  const besitos = n === 1 ? RECOMPENSAS_MASCOTA.cocinar : 0;
  if (besitos) await ganar('cocina', besitos).catch(() => {});
  return { ok: true, besitos, plato: item(r.resultado) };
}

// --------------------------------------------------------------------------
// Museo
// --------------------------------------------------------------------------
export async function donar(rol: Rol, itemId: string): Promise<{ ok: boolean; besitos: number; repetido: boolean }> {
  const ya = (await donacionesDe(rol)).some((d) => d.item_id === itemId);
  if (ya) return { ok: false, besitos: 0, repetido: true };
  if (!(await quitarItem(rol, itemId))) return { ok: false, besitos: 0, repetido: false };
  await registrarDonacion(rol, itemId);
  await ganar('museo', RECOMPENSAS_MASCOTA.donar).catch(() => {});
  return { ok: true, besitos: RECOMPENSAS_MASCOTA.donar, repetido: false };
}

// --------------------------------------------------------------------------
// Visita a la mascota de la pareja
// --------------------------------------------------------------------------
export async function visitaHecha(rol: Rol) { return (await vecesHoy(rol, 'visita')) > 0; }

/** Acariciar a la mascota del otro: sube su afecto; la primera visita del día da besitos. */
export async function acariciarVisita(rol: Rol): Promise<number> {
  await sumar(otroRol(rol), { afecto: 15 });
  const n = await contar(rol, 'visita');
  const besitos = n === 1 ? RECOMPENSAS_MASCOTA.visita : 0;
  if (besitos) await ganar('visita', besitos).catch(() => {});
  return besitos;
}

export async function alimentarVisita(rol: Rol, itemId: string): Promise<boolean> {
  const it = item(itemId);
  if (!it?.efecto) return false;
  if (!(await quitarItem(rol, itemId))) return false;
  await sumar(otroRol(rol), it.efecto as Partial<Record<Necesidad, number>>);
  return true;
}

export async function regalar(rol: Rol, itemId: string, mensaje: string | null): Promise<boolean> {
  if (!(await quitarItem(rol, itemId))) return false;
  await enviarRegalo(rol, otroRol(rol), itemId, mensaje);
  return true;
}

export async function regalosNuevos(rol: Rol): Promise<Regalo[]> { return regalosPendientes(rol); }

export async function abrirRegalo(rol: Rol, r: Regalo) {
  await marcarRecibido(r.id);
  await agregarItem(rol, r.item_id);
  await sumar(rol, { afecto: 10 });
}
