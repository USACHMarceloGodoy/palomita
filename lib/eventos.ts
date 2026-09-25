// Calendario: una sola función que cruza la fecha del teléfono con la tabla `eventos`.
import { supabase } from './supabase';
import { conCache } from './cache';
import { hoyChile } from './fechas';
import type { TipoParticula } from '@/components/Particulas';

export type Evento = {
  id: string;
  fecha: string;          // YYYY-MM-DD
  tipo_particula: TipoParticula;
  mensaje: string | null;
  mensaje_dia: string | null;   // reemplaza el "Mensaje del día" ese día (ej: letra de una canción)
  recurrente: boolean;
};

export async function eventosDelCalendario(): Promise<Evento[]> {
  const v = await conCache('eventos', async () => {
    const { data, error } = await supabase.from('eventos').select('*');
    if (error) throw error;
    return data as Evento[];
  });
  return v ?? [];
}

/** El evento que manda hoy, o null si es un día cualquiera. */
export function eventoDeHoy(eventos: Evento[], hoy = hoyChile()): Evento | null {
  const mmdd = hoy.slice(5);
  return (
    eventos.find((e) => e.fecha === hoy) ??
    eventos.find((e) => e.recurrente && e.fecha.slice(5) === mmdd) ??
    null
  );
}

// Rotación de un día cualquiera: mezcla de lo que a ella le gusta.
const ROTACION: TipoParticula[] = ['sorpresa', 'kawaii', 'bichitos', 'comida', 'flores-rosas', 'rosas', 'girasoles', 'lazos', 'gatitos', 'capibaras', 'frutillas', 'lanas', 'lluvia'];

export function particulaDeHoy(eventos: Evento[], hoy = hoyChile()): { tipo: TipoParticula; nota: string | null } {
  const ev = eventoDeHoy(eventos, hoy);
  if (ev) return { tipo: ev.tipo_particula, nota: ev.mensaje };
  const dia = Number(hoy.replaceAll('-', ''));
  return { tipo: ROTACION[dia % ROTACION.length], nota: null };
}
