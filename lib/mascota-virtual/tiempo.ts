// El juego va al ritmo del mundo real, en la hora de Chile y con las
// estaciones del hemisferio sur (invierno en junio-agosto).
import { hoyChile } from '../fechas';
import type { Estacion, MomentoDia, Temporada } from './tipos';

const ZONA = 'America/Santiago';

export function horaChile(d = new Date()): number {
  return Number(d.toLocaleTimeString('en-GB', { timeZone: ZONA, hour: '2-digit', hour12: false }).slice(0, 2));
}

export function momentoDia(d = new Date()): MomentoDia {
  const h = horaChile(d);
  if (h >= 6 && h < 9) return 'amanecer';
  if (h >= 9 && h < 18) return 'dia';
  if (h >= 18 && h < 21) return 'atardecer';
  return 'noche';
}

export function estacion(fecha = hoyChile()): Estacion {
  const mes = Number(fecha.slice(5, 7));
  if (mes === 12 || mes <= 2) return 'verano';
  if (mes <= 5) return 'otono';
  if (mes <= 8) return 'invierno';
  return 'primavera';
}

/** Domingo de Pascua (algoritmo de Meeus) como 'YYYY-MM-DD'. */
function pascua(anio: number): string {
  const a = anio % 19, b = Math.floor(anio / 100), c = anio % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31), dia = ((h + l - 7 * m + 114) % 31) + 1;
  return `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}

function diaDelAnio(fecha: string): number {
  const [y, m, d] = fecha.split('-').map(Number);
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 1)) / 86_400_000);
}

/** Evento de temporada activo hoy, o null. Se anclan a fechas reales. */
export function temporada(fecha = hoyChile()): Temporada | null {
  const anio = Number(fecha.slice(0, 4));
  const md = fecha.slice(5);
  if (md >= '02-10' && md <= '02-16') return 'san_valentin';
  if (md >= '09-15' && md <= '09-21') return 'dieciocho';
  if (md >= '10-24' && md <= '10-31') return 'halloween';
  if (md >= '12-12' && md <= '12-26') return 'navidad';
  const p = diaDelAnio(pascua(anio));
  const hoy = diaDelAnio(fecha);
  if (hoy >= p - 6 && hoy <= p + 1) return 'pascua';
  return null;
}

export const NOMBRE_TEMPORADA: Record<Temporada, string> = {
  san_valentin: 'San Valentín',
  pascua: 'Pascua',
  dieciocho: 'Fiestas Patrias',
  halloween: 'Halloween',
  navidad: 'Navidad',
};

/** Número de semana ISO-ish, para rotar la tienda. */
export function semana(fecha = hoyChile()): number {
  return Math.floor(diaDelAnio(fecha) / 7) + Number(fecha.slice(0, 4)) * 53;
}

/** Días que faltan para la próxima rotación semanal. */
export function diasParaRotar(fecha = hoyChile()): number {
  return 7 - (diaDelAnio(fecha) % 7);
}
