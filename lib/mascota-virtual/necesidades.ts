// Las tres barras: valor 0-100 + marca de tiempo. El valor real se recalcula
// con las horas transcurridas, igual que las macetas de la granja.
import type { Rol } from '../sesion';
import { guardarNecesidades, necesidadesDe } from './datos';
import type { Necesidad, Necesidades } from './tipos';

/** Puntos que baja cada barra por hora. Hambre: llena → vacía en ~25 h. */
export const TASA: Record<Necesidad, number> = { hambre: 4, higiene: 2, afecto: 3 };

export const NOMBRE_NECESIDAD: Record<Necesidad, string> = { hambre: 'Hambre', higiene: 'Higiene', afecto: 'Afecto' };
export const COLOR_NECESIDAD: Record<Necesidad, string> = { hambre: '#FFA557', higiene: '#6BC8E8', afecto: '#FF6F91' };

const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)));

export function valorActual(n: Necesidades, k: Necesidad, ahora = Date.now()): number {
  const horas = Math.max(0, (ahora - new Date(n[`${k}_en`]).getTime()) / 3_600_000);
  return clamp(n[k] - horas * TASA[k]);
}

export function actuales(n: Necesidades): Record<Necesidad, number> {
  return { hambre: valorActual(n, 'hambre'), higiene: valorActual(n, 'higiene'), afecto: valorActual(n, 'afecto') };
}

/** Promedio de las tres, para la expresión de la mascota y su frase. */
export function animoDe(a: Record<Necesidad, number>, nombre: string): { animo01: number; frase: string } {
  const prom = (a.hambre + a.higiene + a.afecto) / 3;
  const minima = Math.min(a.hambre, a.higiene, a.afecto);
  let frase: string;
  if (a.hambre < 20) frase = `${nombre} tiene hambre`;
  else if (a.higiene < 20) frase = `${nombre} quiere un baño`;
  else if (a.afecto < 20) frase = `${nombre} te extraña`;
  else if (prom > 80) frase = `${nombre} está feliz`;
  else if (prom > 55) frase = `${nombre} está contenta`;
  else frase = `${nombre} está tranquila`;
  return { animo01: Math.max(0.1, (prom * 0.7 + minima * 0.3) / 100), frase };
}

/** Sube (o baja) una barra y fija su marca de tiempo. */
export async function sumar(rol: Rol, cambios: Partial<Record<Necesidad, number>>): Promise<Necesidades> {
  const n = await necesidadesDe(rol);
  const t = new Date().toISOString();
  const nueva: Necesidades = { ...n };
  for (const k of Object.keys(cambios) as Necesidad[]) {
    nueva[k] = clamp(valorActual(n, k) + (cambios[k] ?? 0));
    nueva[`${k}_en`] = t;
  }
  await guardarNecesidades(nueva);
  return nueva;
}
