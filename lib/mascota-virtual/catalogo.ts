// Catálogo curado del sistema de mascota: núcleo chico por categoría que crece
// por tandas, igual que la trivia o el diccionario. Los dibujos viven en
// components/mascota (IconosMascota y Prendas); aquí solo va la clave.
import { semana } from './tiempo';
import type { CategoriaItem, Item, Receta, Temporada } from './tipos';

const C = colores();
function colores() {
  return {
    rosa: '#FF6F91', rosaClaro: '#FFB3C6', tinta: '#D6336C', amarillo: '#FFD93D', ambar: '#E09A1F',
    menta: '#C8F0DC', verde: '#3E8A62', lavanda: '#E2D5F8', morado: '#8A6BD1', celeste: '#6BC8E8',
    azul: '#3B7DD8', crema: '#FFF8F0', cafe: '#8C6239', paja: '#FFD36B', negro: '#3D3A42', blanco: '#FFFFFF',
    rojo: '#E63950', naranja: '#FFA557',
  };
}

export const ITEMS: Item[] = [
  // ---- comida (tienda) ----
  { id: 'manzana', nombre: 'Manzana', categoria: 'comida', precio: 8, venta: 0, dibujo: 'manzana', c1: C.rojo, c2: C.verde, efecto: { hambre: 20 } },
  { id: 'frutilla', nombre: 'Frutilla', categoria: 'comida', precio: 8, venta: 0, dibujo: 'frutilla', c1: C.rojo, c2: C.verde, efecto: { hambre: 15, afecto: 5 } },
  { id: 'zanahoria', nombre: 'Zanahoria', categoria: 'comida', precio: 6, venta: 0, dibujo: 'zanahoria', c1: C.naranja, c2: C.verde, efecto: { hambre: 18 } },
  { id: 'galleta', nombre: 'Galleta', categoria: 'comida', precio: 10, venta: 0, dibujo: 'galleta', c1: '#D9A066', c2: '#5A3B2A', efecto: { hambre: 25, afecto: 5 } },
  { id: 'pescado', nombre: 'Pescadito', categoria: 'comida', precio: 12, venta: 0, dibujo: 'pez', c1: C.celeste, c2: C.blanco, efecto: { hambre: 35 } },
  { id: 'leche', nombre: 'Lechita', categoria: 'comida', precio: 6, venta: 0, dibujo: 'leche', c1: C.blanco, c2: C.celeste, efecto: { hambre: 12, higiene: 0 } },
  { id: 'helado', nombre: 'Helado', categoria: 'comida', precio: 14, venta: 0, dibujo: 'helado', c1: C.rosaClaro, c2: '#D9A066', efecto: { hambre: 20, afecto: 12 } },

  // ---- ingredientes (tienda / árbol) ----
  { id: 'huevo', nombre: 'Huevo', categoria: 'ingrediente', precio: 5, venta: 2, dibujo: 'huevo', c1: C.crema, c2: C.amarillo },
  { id: 'harina', nombre: 'Harina', categoria: 'ingrediente', precio: 5, venta: 2, dibujo: 'harina', c1: C.crema, c2: '#D9A066' },
  { id: 'miel', nombre: 'Miel', categoria: 'ingrediente', precio: 8, venta: 3, dibujo: 'miel', c1: C.ambar, c2: C.amarillo },
  { id: 'chocolate', nombre: 'Chocolate', categoria: 'ingrediente', precio: 9, venta: 3, dibujo: 'chocolate', c1: '#5A3B2A', c2: '#8C6239' },
  { id: 'limon', nombre: 'Limón', categoria: 'ingrediente', precio: 5, venta: 2, dibujo: 'limon', c1: C.amarillo, c2: C.verde },
  { id: 'leche_ing', nombre: 'Leche', categoria: 'ingrediente', precio: 5, venta: 2, dibujo: 'leche', c1: C.blanco, c2: C.celeste },
  { id: 'frutilla_ing', nombre: 'Frutillas', categoria: 'ingrediente', precio: 7, venta: 3, dibujo: 'frutilla', c1: C.rojo, c2: C.verde },

  // ---- platos (solo por cocina) ----
  { id: 'pastel_frutilla', nombre: 'Pastel de frutilla', categoria: 'plato', precio: 0, venta: 20, dibujo: 'pastel', c1: C.rosaClaro, c2: C.rojo, efecto: { hambre: 45, afecto: 30 } },
  { id: 'galletas_miel', nombre: 'Galletas de miel', categoria: 'plato', precio: 0, venta: 14, dibujo: 'galleta', c1: C.paja, c2: C.ambar, efecto: { hambre: 35, afecto: 15 } },
  { id: 'batido', nombre: 'Batido de frutilla', categoria: 'plato', precio: 0, venta: 14, dibujo: 'batido', c1: C.rosaClaro, c2: C.blanco, efecto: { hambre: 25, afecto: 20, higiene: 5 } },
  { id: 'brownie', nombre: 'Brownie', categoria: 'plato', precio: 0, venta: 18, dibujo: 'brownie', c1: '#5A3B2A', c2: C.crema, efecto: { hambre: 40, afecto: 25 } },
  { id: 'limonada', nombre: 'Limonada', categoria: 'plato', precio: 0, venta: 10, dibujo: 'batido', c1: '#FFF3C4', c2: C.amarillo, efecto: { hambre: 15, afecto: 15, higiene: 10 } },

  // ---- ropa ----
  { id: 'sombrero_paja', nombre: 'Sombrero de paja', categoria: 'ropa', precio: 40, venta: 10, dibujo: 'sombrero_paja', slot: 'cabeza', c1: C.paja, c2: C.rosa },
  { id: 'sombrero_copa', nombre: 'Sombrero de copa', categoria: 'ropa', precio: 70, venta: 18, dibujo: 'sombrero_copa', slot: 'cabeza', c1: C.negro, c2: C.rojo },
  { id: 'corona', nombre: 'Coronita', categoria: 'ropa', precio: 90, venta: 25, dibujo: 'corona', slot: 'cabeza', c1: C.amarillo, c2: C.rosa },
  { id: 'lazo_rosa', nombre: 'Lazo rosa', categoria: 'ropa', precio: 30, venta: 8, dibujo: 'lazo', slot: 'cabeza', c1: C.rosa, c2: C.tinta },
  { id: 'lazo_celeste', nombre: 'Lazo celeste', categoria: 'ropa', precio: 30, venta: 8, dibujo: 'lazo', slot: 'cabeza', c1: C.celeste, c2: C.azul },
  { id: 'gorro_lana', nombre: 'Gorro de lana', categoria: 'ropa', precio: 45, venta: 12, dibujo: 'gorro_lana', slot: 'cabeza', c1: C.lavanda, c2: C.morado },
  { id: 'gorra', nombre: 'Gorra', categoria: 'ropa', precio: 35, venta: 9, dibujo: 'gorra', slot: 'cabeza', c1: C.menta, c2: C.verde },
  { id: 'lentes_sol', nombre: 'Lentes de sol', categoria: 'ropa', precio: 30, venta: 8, dibujo: 'lentes_sol', slot: 'cara', c1: C.negro, c2: C.amarillo },
  { id: 'lentes_redondos', nombre: 'Lentes redondos', categoria: 'ropa', precio: 35, venta: 9, dibujo: 'lentes_redondos', slot: 'cara', c1: C.cafe, c2: C.celeste },
  { id: 'bufanda_celeste', nombre: 'Bufanda celeste', categoria: 'ropa', precio: 35, venta: 9, dibujo: 'bufanda', slot: 'cuello', c1: C.celeste, c2: C.blanco },
  { id: 'bufanda_roja', nombre: 'Bufanda roja', categoria: 'ropa', precio: 35, venta: 9, dibujo: 'bufanda', slot: 'cuello', c1: C.rojo, c2: C.crema },
  { id: 'panuelo', nombre: 'Pañuelo', categoria: 'ropa', precio: 25, venta: 6, dibujo: 'panuelo', slot: 'cuello', c1: C.rojo, c2: C.blanco },
  { id: 'collar_perlas', nombre: 'Collar de perlas', categoria: 'ropa', precio: 60, venta: 15, dibujo: 'collar', slot: 'cuello', c1: C.crema, c2: C.rosa },
  { id: 'vestido_celeste', nombre: 'Vestido celeste', categoria: 'ropa', precio: 85, venta: 22, dibujo: 'vestido', slot: 'cuerpo', c1: C.celeste, c2: C.blanco },
  { id: 'vestido_rosa', nombre: 'Vestido rosa', categoria: 'ropa', precio: 85, venta: 22, dibujo: 'vestido', slot: 'cuerpo', c1: C.rosaClaro, c2: C.tinta },
  { id: 'chaleco', nombre: 'Chaleco', categoria: 'ropa', precio: 55, venta: 14, dibujo: 'chaleco', slot: 'cuerpo', c1: C.lavanda, c2: C.morado },
  { id: 'capa', nombre: 'Capa de héroe', categoria: 'ropa', precio: 95, venta: 25, dibujo: 'capa', slot: 'cuerpo', c1: C.rojo, c2: C.amarillo },
  { id: 'traje_formal', nombre: 'Traje formal', categoria: 'ropa', precio: 110, venta: 30, dibujo: 'chaleco', slot: 'cuerpo', c1: C.negro, c2: C.blanco },
  // de temporada
  { id: 'orejas_conejo', nombre: 'Orejas de conejo', categoria: 'ropa', precio: 50, venta: 12, dibujo: 'orejas_conejo', slot: 'cabeza', c1: C.blanco, c2: C.rosaClaro, temporada: 'pascua' },
  { id: 'gorro_navidad', nombre: 'Gorro navideño', categoria: 'ropa', precio: 50, venta: 12, dibujo: 'gorro_navidad', slot: 'cabeza', c1: C.rojo, c2: C.blanco, temporada: 'navidad' },
  { id: 'sombrero_bruja', nombre: 'Sombrero de bruja', categoria: 'ropa', precio: 60, venta: 15, dibujo: 'sombrero_bruja', slot: 'cabeza', c1: C.morado, c2: C.naranja, temporada: 'halloween' },
  { id: 'chupalla', nombre: 'Chupalla', categoria: 'ropa', precio: 45, venta: 12, dibujo: 'sombrero_paja', slot: 'cabeza', c1: '#F3E4C8', c2: C.rojo, temporada: 'dieciocho' },
  { id: 'corazon_collar', nombre: 'Collar de corazón', categoria: 'ropa', precio: 55, venta: 14, dibujo: 'collar', slot: 'cuello', c1: C.rosa, c2: C.rojo, temporada: 'san_valentin' },

  // ---- paredes y suelos ----
  { id: 'pared_rosa', nombre: 'Pared rosa', categoria: 'pared', precio: 0, venta: 0, dibujo: 'pared', c1: '#FFE3EE', c2: '#FFC9DC' },
  { id: 'pared_lavanda', nombre: 'Pared lavanda', categoria: 'pared', precio: 50, venta: 0, dibujo: 'pared', c1: '#E2D5F8', c2: '#C3AEE8' },
  { id: 'pared_menta', nombre: 'Pared menta', categoria: 'pared', precio: 50, venta: 0, dibujo: 'pared', c1: '#D6F3E4', c2: '#B5E3CB' },
  { id: 'pared_cielo', nombre: 'Pared cielo', categoria: 'pared', precio: 60, venta: 0, dibujo: 'pared', c1: '#E1ECFF', c2: '#BFD6FF' },
  { id: 'pared_gotica', nombre: 'Pared gótica', categoria: 'pared', precio: 90, venta: 0, dibujo: 'pared', c1: '#3B2F4A', c2: '#5C4A70' },
  { id: 'pared_playa', nombre: 'Pared playera', categoria: 'pared', precio: 80, venta: 0, dibujo: 'pared', c1: '#BEE7FF', c2: '#FFF3C4' },
  { id: 'pared_navidad', nombre: 'Pared navideña', categoria: 'pared', precio: 80, venta: 0, dibujo: 'pared', c1: '#D9F0DF', c2: C.rojo, temporada: 'navidad' },
  { id: 'suelo_madera', nombre: 'Piso de madera', categoria: 'suelo', precio: 0, venta: 0, dibujo: 'suelo', c1: '#F3D9B8', c2: '#E3C39C' },
  { id: 'suelo_alfombra', nombre: 'Alfombra rosa', categoria: 'suelo', precio: 45, venta: 0, dibujo: 'suelo', c1: '#FFC9DC', c2: '#FFB3C6' },
  { id: 'suelo_pasto', nombre: 'Pasto', categoria: 'suelo', precio: 55, venta: 0, dibujo: 'suelo', c1: '#BFE8C6', c2: '#8CD39A' },
  { id: 'suelo_arena', nombre: 'Arena', categoria: 'suelo', precio: 55, venta: 0, dibujo: 'suelo', c1: '#FFEFC2', c2: '#F3DDA0' },
  { id: 'suelo_piedra', nombre: 'Piedra', categoria: 'suelo', precio: 70, venta: 0, dibujo: 'suelo', c1: '#CFCBD6', c2: '#A9A3B5' },

  // ---- muebles ----
  { id: 'cama', nombre: 'Camita', categoria: 'mueble', precio: 0, venta: 0, dibujo: 'cama', c1: C.rosa, c2: '#FFE1EC' },
  { id: 'estante', nombre: 'Estante', categoria: 'mueble', precio: 40, venta: 10, dibujo: 'estante', c1: '#C99A6B', c2: C.rosaClaro },
  { id: 'planta', nombre: 'Planta', categoria: 'mueble', precio: 35, venta: 9, dibujo: 'planta', c1: C.verde, c2: '#C97C5A' },
  { id: 'lampara', nombre: 'Lámpara', categoria: 'mueble', precio: 50, venta: 12, dibujo: 'lampara', c1: C.amarillo, c2: '#C99A6B' },
  { id: 'cuadro', nombre: 'Cuadro', categoria: 'mueble', precio: 45, venta: 11, dibujo: 'cuadro', c1: C.celeste, c2: '#C99A6B' },
  { id: 'alfombrita', nombre: 'Alfombrita', categoria: 'mueble', precio: 30, venta: 8, dibujo: 'alfombrita', c1: C.lavanda, c2: C.morado },
  { id: 'pecera', nombre: 'Pecera', categoria: 'mueble', precio: 80, venta: 20, dibujo: 'pecera', c1: C.celeste, c2: C.naranja },
  { id: 'arbol_navidad', nombre: 'Arbolito', categoria: 'mueble', precio: 70, venta: 18, dibujo: 'arbolito', c1: C.verde, c2: C.rojo, temporada: 'navidad' },
  { id: 'calabaza', nombre: 'Calabaza', categoria: 'mueble', precio: 40, venta: 10, dibujo: 'calabaza', c1: C.naranja, c2: C.verde, temporada: 'halloween' },
  { id: 'guirnalda', nombre: 'Guirnalda', categoria: 'mueble', precio: 35, venta: 9, dibujo: 'guirnalda', c1: C.rojo, c2: C.blanco, temporada: 'dieciocho' },
  { id: 'huevo_pascua', nombre: 'Huevo pintado', categoria: 'mueble', precio: 35, venta: 9, dibujo: 'huevo_pascua', c1: C.lavanda, c2: C.amarillo, temporada: 'pascua' },
  { id: 'corazones_pared', nombre: 'Corazones colgantes', categoria: 'mueble', precio: 35, venta: 9, dibujo: 'corazones_pared', c1: C.rosa, c2: C.rojo, temporada: 'san_valentin' },

  // ---- pesca ----
  { id: 'cebo', nombre: 'Cebo', categoria: 'cebo', precio: 5, venta: 0, dibujo: 'cebo', c1: C.rosaClaro, c2: C.cafe, descripcion: 'Mejora la suerte en una tirada.' },
  { id: 'pez_dorado', nombre: 'Pez dorado', categoria: 'pez', precio: 0, venta: 8, dibujo: 'pez', c1: C.naranja, c2: C.amarillo, rareza: 1 },
  { id: 'pez_payaso', nombre: 'Pez payaso', categoria: 'pez', precio: 0, venta: 14, dibujo: 'pez', c1: C.naranja, c2: C.blanco, rareza: 2 },
  { id: 'pez_globo', nombre: 'Pez globo', categoria: 'pez', precio: 0, venta: 18, dibujo: 'pez_globo', c1: C.amarillo, c2: C.ambar, rareza: 2 },
  { id: 'pez_azul', nombre: 'Pez azul', categoria: 'pez', precio: 0, venta: 12, dibujo: 'pez', c1: C.celeste, c2: C.azul, rareza: 1 },
  { id: 'estrella', nombre: 'Estrella de mar', categoria: 'pez', precio: 0, venta: 22, dibujo: 'estrella', c1: C.rosa, c2: C.tinta, rareza: 3 },
  { id: 'tiburoncito', nombre: 'Tiburoncito', categoria: 'pez', precio: 0, venta: 35, dibujo: 'tiburon', c1: '#9FB4C9', c2: C.blanco, rareza: 4 },
  { id: 'medusa', nombre: 'Medusa', categoria: 'pez', precio: 0, venta: 26, dibujo: 'medusa', c1: C.lavanda, c2: C.morado, rareza: 3 },
  { id: 'bota', nombre: 'Bota vieja', categoria: 'pez', precio: 0, venta: 1, dibujo: 'bota', c1: C.cafe, c2: '#5A3B2A', rareza: 1, descripcion: 'Basura reciclable. Igual da un besito.' },

  // ---- insectos (árbol) ----
  { id: 'mariposa', nombre: 'Mariposa', categoria: 'insecto', precio: 0, venta: 10, dibujo: 'mariposa', c1: C.lavanda, c2: C.morado, rareza: 1 },
  { id: 'mariquita', nombre: 'Mariquita', categoria: 'insecto', precio: 0, venta: 10, dibujo: 'mariquita', c1: C.rojo, c2: C.negro, rareza: 1 },
  { id: 'abeja', nombre: 'Abejita', categoria: 'insecto', precio: 0, venta: 14, dibujo: 'abeja', c1: C.amarillo, c2: C.negro, rareza: 2 },
  { id: 'luciernaga', nombre: 'Luciérnaga', categoria: 'insecto', precio: 0, venta: 24, dibujo: 'luciernaga', c1: C.amarillo, c2: '#5A3B2A', rareza: 3 },
  { id: 'caracol', nombre: 'Caracol', categoria: 'insecto', precio: 0, venta: 12, dibujo: 'caracol', c1: C.paja, c2: C.cafe, rareza: 2 },

  // ---- fósiles (pesca profunda) ----
  { id: 'fosil_concha', nombre: 'Concha fósil', categoria: 'fosil', precio: 0, venta: 20, dibujo: 'fosil_concha', c1: '#D9CBB0', c2: '#8C7B5E', rareza: 2 },
  { id: 'fosil_hueso', nombre: 'Huesito fósil', categoria: 'fosil', precio: 0, venta: 28, dibujo: 'fosil_hueso', c1: '#EFE6D2', c2: '#8C7B5E', rareza: 3 },
  { id: 'fosil_amonite', nombre: 'Amonite', categoria: 'fosil', precio: 0, venta: 40, dibujo: 'fosil_amonite', c1: '#C9B693', c2: '#6B5A3E', rareza: 4 },

  // ---- arte (tienda, se dona al museo) ----
  { id: 'arte_girasol', nombre: 'Cuadro del girasol', categoria: 'arte', precio: 60, venta: 15, dibujo: 'arte', c1: C.amarillo, c2: '#6B4A2A' },
  { id: 'arte_noche', nombre: 'Cuadro de la noche', categoria: 'arte', precio: 80, venta: 20, dibujo: 'arte', c1: '#2E2A55', c2: C.amarillo },
  { id: 'arte_corazon', nombre: 'Cuadro del corazón', categoria: 'arte', precio: 70, venta: 18, dibujo: 'arte', c1: C.rosaClaro, c2: C.rosa },
  { id: 'arte_mar', nombre: 'Cuadro del mar', categoria: 'arte', precio: 75, venta: 18, dibujo: 'arte', c1: C.celeste, c2: C.azul },

  // ---- trofeos (estadio) ----
  { id: 'trofeo_oro', nombre: 'Trofeo de oro', categoria: 'trofeo', precio: 0, venta: 0, dibujo: 'trofeo', c1: C.amarillo, c2: C.ambar },
  { id: 'trofeo_plata', nombre: 'Trofeo de plata', categoria: 'trofeo', precio: 0, venta: 0, dibujo: 'trofeo', c1: '#D9D9E0', c2: '#9A9AA8' },
  { id: 'trofeo_bronce', nombre: 'Trofeo de bronce', categoria: 'trofeo', precio: 0, venta: 0, dibujo: 'trofeo', c1: '#D9A066', c2: '#8C6239' },
];

export const RECETAS: Receta[] = [
  { id: 'pastel_frutilla', nombre: 'Pastel de frutilla', ingredientes: ['frutilla_ing', 'huevo', 'harina'], resultado: 'pastel_frutilla' },
  { id: 'galletas_miel', nombre: 'Galletas de miel', ingredientes: ['harina', 'miel'], resultado: 'galletas_miel' },
  { id: 'batido', nombre: 'Batido de frutilla', ingredientes: ['frutilla_ing', 'leche_ing'], resultado: 'batido' },
  { id: 'brownie', nombre: 'Brownie', ingredientes: ['chocolate', 'huevo', 'harina'], resultado: 'brownie' },
  { id: 'limonada', nombre: 'Limonada', ingredientes: ['limon', 'miel'], resultado: 'limonada' },
];

const porId = new Map(ITEMS.map((i) => [i.id, i]));
export const item = (id: string): Item | undefined => porId.get(id);
export const itemsDe = (categoria: CategoriaItem) => ITEMS.filter((i) => i.categoria === categoria);

/** Ropa y muebles rotan: cada semana se ven ~dos tercios del catálogo. Los de temporada solo en su evento. */
export function disponibleEstaSemana(i: Item, temporadaActiva: Temporada | null): boolean {
  if (i.temporada) return i.temporada === temporadaActiva;
  if (i.categoria !== 'ropa' && i.categoria !== 'mueble') return true;
  let h = semana();
  for (const c of i.id) h = (Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0);
  return h % 3 !== 0;
}

export const PESO_RAREZA: Record<1 | 2 | 3 | 4, number> = { 1: 60, 2: 27, 3: 10, 4: 3 };
export const ESTRELLAS: Record<1 | 2 | 3 | 4, string> = { 1: 'Común', 2: 'Poco común', 3: 'Raro', 4: 'Legendario' };
