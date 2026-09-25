// Buzón entre el lienzo (/dibujar) y la pantalla que lo abrió. Un SVG no cabe
// en los parámetros de la ruta, así que el dibujo terminado se deja acá y la
// otra pantalla lo recoge al volver.
let pendiente: string | null = null;

export function dejarDibujo(svg: string) {
  pendiente = svg;
}

/** Devuelve el dibujo recién hecho (una sola vez) y vacía el buzón. */
export function tomarDibujo(): string | null {
  const v = pendiente;
  pendiente = null;
  return v;
}
