// Laberinto por recursive backtracker sobre una grilla. Semilla = fecha,
// así el laberinto del día es único pero reproducible.

export type Celda = { arriba: boolean; abajo: boolean; izq: boolean; der: boolean; visitada: boolean };
export type Laberinto = { n: number; celdas: Celda[][]; semilla: number };

// mulberry32: PRNG chico y determinista.
function rng(semilla: number) {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generar(n: number, semilla: number): Laberinto {
  const rand = rng(semilla);
  const celdas: Celda[][] = Array.from({ length: n }, () =>
    Array.from({ length: n }, () => ({ arriba: true, abajo: true, izq: true, der: true, visitada: false })),
  );
  const pila: [number, number][] = [[0, 0]];
  celdas[0][0].visitada = true;

  while (pila.length) {
    const [f, c] = pila[pila.length - 1];
    const vecinos: [number, number, keyof Celda, keyof Celda][] = [];
    if (f > 0 && !celdas[f - 1][c].visitada) vecinos.push([f - 1, c, 'arriba', 'abajo']);
    if (f < n - 1 && !celdas[f + 1][c].visitada) vecinos.push([f + 1, c, 'abajo', 'arriba']);
    if (c > 0 && !celdas[f][c - 1].visitada) vecinos.push([f, c - 1, 'izq', 'der']);
    if (c < n - 1 && !celdas[f][c + 1].visitada) vecinos.push([f, c + 1, 'der', 'izq']);
    if (!vecinos.length) { pila.pop(); continue; }
    const [nf, nc, pared, opuesta] = vecinos[Math.floor(rand() * vecinos.length)];
    (celdas[f][c] as Record<string, boolean>)[pared] = false;
    (celdas[nf][nc] as Record<string, boolean>)[opuesta] = false;
    celdas[nf][nc].visitada = true;
    pila.push([nf, nc]);
  }
  return { n, celdas, semilla };
}

/** Tamaño según días desde el primer uso: 8 la primera semana, 14 al mes. */
export function tamanoPorDias(dias: number) {
  if (dias < 7) return 8;
  if (dias < 30) return 8 + Math.floor(((dias - 7) / 23) * 6);
  return 14;
}

export function puedeMover(l: Laberinto, f: number, c: number, nf: number, nc: number) {
  if (nf < 0 || nc < 0 || nf >= l.n || nc >= l.n) return false;
  const celda = l.celdas[f][c];
  if (nf === f - 1 && nc === c) return !celda.arriba;
  if (nf === f + 1 && nc === c) return !celda.abajo;
  if (nf === f && nc === c - 1) return !celda.izq;
  if (nf === f && nc === c + 1) return !celda.der;
  return false;
}
