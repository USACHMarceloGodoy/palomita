const ZONA = 'America/Santiago';

/** Fecha de hoy en Chile como 'YYYY-MM-DD'. */
export function hoyChile(d = new Date()): string {
  return d.toLocaleDateString('en-CA', { timeZone: ZONA });
}

/** 'viernes 18 de septiembre' */
export function fechaLarga(d = new Date()): string {
  return d.toLocaleDateString('es-CL', { timeZone: ZONA, weekday: 'long', day: 'numeric', month: 'long' });
}

/** '18 sep' para una fecha suelta, '18 sep · 14:30' si trae hora. */
export function fechaCorta(iso: string): string {
  const soloFecha = /^\d{4}-\d{2}-\d{2}$/.test(iso);
  const d = new Date(soloFecha ? `${iso}T12:00:00-03:00` : iso);
  const dia = d.toLocaleDateString('es-CL', { timeZone: ZONA, day: 'numeric', month: 'short' });
  if (soloFecha) return dia;
  return `${dia} · ${d.toLocaleTimeString('es-CL', { timeZone: ZONA, hour: '2-digit', minute: '2-digit' })}`;
}

export function diasEntre(desdeISO: string, hasta = new Date()): number {
  const desde = new Date(desdeISO + 'T00:00:00-03:00');
  return Math.max(0, Math.floor((hasta.getTime() - desde.getTime()) / 86_400_000));
}

/** Semilla numérica reproducible por fecha (para el laberinto del día). */
export function semillaDelDia(fecha = hoyChile()): number {
  let h = 2166136261;
  for (const c of fecha) {
    h ^= c.charCodeAt(0);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}
