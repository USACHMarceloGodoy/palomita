// Catálogo curado del sistema de mascota. Crece por tandas, igual que la
// trivia o el diccionario. Los dibujos viven en components/mascota
// (IconosMascota y Prendas); aquí solo va la clave. Un mismo dibujo con
// distintos colores son ítems distintos: así la tienda se ve llena sin
// multiplicar el arte.
import { semana } from './tiempo';
import type { CategoriaItem, Item, Receta, Temporada } from './tipos';

const C = {
  rosa: '#FF6F91', rosaClaro: '#FFB3C6', tinta: '#D6336C', amarillo: '#FFD93D', ambar: '#E09A1F',
  menta: '#C8F0DC', verde: '#3E8A62', lavanda: '#E2D5F8', morado: '#8A6BD1', celeste: '#6BC8E8',
  azul: '#3B7DD8', crema: '#FFF8F0', cafe: '#8C6239', paja: '#FFD36B', negro: '#3D3A42', blanco: '#FFFFFF',
  rojo: '#E63950', naranja: '#FFA557', gris: '#CFCBD6', oliva: '#9AA84A', turquesa: '#4FB8B0', vino: '#8E2F4F',
  chocolate: '#5A3B2A', madera: '#C99A6B', cielo: '#BEE7FF', durazno: '#FFC9A8',
};

type Base = Omit<Item, 'id' | 'nombre' | 'c1' | 'c2'>;
/** Variantes de color de un mismo dibujo: [sufijo del id, nombre, c1, c2]. */
function variantes(idBase: string, nombreBase: string, base: Base, colores: [string, string, string, string][]): Item[] {
  return colores.map(([suf, nom, c1, c2]) => ({ ...base, id: `${idBase}_${suf}`, nombre: `${nombreBase} ${nom}`.trim(), c1, c2 }));
}
const ropa = (dibujo: string, slot: Item['slot'], precio: number): Base => ({ categoria: 'ropa', precio, venta: Math.round(precio / 4), dibujo, slot });
const mueble = (dibujo: string, precio: number, tam = 0.22): Base => ({ categoria: 'mueble', precio, venta: Math.round(precio / 4), dibujo, tam });

export const ITEMS: Item[] = [
  // =========================================================================
  // Comida (tienda). efecto = lo que sube al comerla.
  // =========================================================================
  { id: 'manzana', nombre: 'Manzana', categoria: 'comida', precio: 8, venta: 0, dibujo: 'manzana', c1: C.rojo, c2: C.verde, efecto: { hambre: 20 } },
  { id: 'manzana_verde', nombre: 'Manzana verde', categoria: 'comida', precio: 8, venta: 0, dibujo: 'manzana', c1: '#8CD39A', c2: C.verde, efecto: { hambre: 20 } },
  { id: 'frutilla', nombre: 'Frutilla', categoria: 'comida', precio: 8, venta: 0, dibujo: 'frutilla', c1: C.rojo, c2: C.verde, efecto: { hambre: 15, afecto: 5 } },
  { id: 'zanahoria', nombre: 'Zanahoria', categoria: 'comida', precio: 6, venta: 0, dibujo: 'zanahoria', c1: C.naranja, c2: C.verde, efecto: { hambre: 18 } },
  { id: 'galleta', nombre: 'Galleta', categoria: 'comida', precio: 10, venta: 0, dibujo: 'galleta', c1: '#D9A066', c2: C.chocolate, efecto: { hambre: 25, afecto: 5 } },
  { id: 'galleta_rosa', nombre: 'Galleta glaseada', categoria: 'comida', precio: 12, venta: 0, dibujo: 'galleta', c1: C.rosaClaro, c2: C.blanco, efecto: { hambre: 25, afecto: 8 } },
  { id: 'pescado', nombre: 'Pescadito', categoria: 'comida', precio: 12, venta: 0, dibujo: 'pez', c1: C.celeste, c2: C.blanco, efecto: { hambre: 35 } },
  { id: 'leche', nombre: 'Lechita', categoria: 'comida', precio: 6, venta: 0, dibujo: 'leche', c1: C.blanco, c2: C.celeste, efecto: { hambre: 12 } },
  { id: 'chocolatada', nombre: 'Chocolatada', categoria: 'comida', precio: 8, venta: 0, dibujo: 'leche', c1: '#D9A066', c2: C.chocolate, efecto: { hambre: 14, afecto: 4 } },
  { id: 'helado', nombre: 'Helado de frutilla', categoria: 'comida', precio: 14, venta: 0, dibujo: 'helado', c1: C.rosaClaro, c2: '#D9A066', efecto: { hambre: 20, afecto: 12 } },
  { id: 'helado_menta', nombre: 'Helado de menta', categoria: 'comida', precio: 14, venta: 0, dibujo: 'helado', c1: C.menta, c2: '#D9A066', efecto: { hambre: 20, afecto: 12 } },
  { id: 'pan', nombre: 'Pancito', categoria: 'comida', precio: 7, venta: 0, dibujo: 'pan', c1: '#E8A33D', c2: C.crema, efecto: { hambre: 22 } },
  { id: 'queso', nombre: 'Quesito', categoria: 'comida', precio: 9, venta: 0, dibujo: 'queso', c1: C.amarillo, c2: C.ambar, efecto: { hambre: 24 } },
  { id: 'sandia', nombre: 'Sandía', categoria: 'comida', precio: 10, venta: 0, dibujo: 'sandia', c1: C.rojo, c2: C.verde, efecto: { hambre: 18, higiene: 3 } },
  { id: 'uvas', nombre: 'Uvas', categoria: 'comida', precio: 9, venta: 0, dibujo: 'uvas', c1: C.morado, c2: C.verde, efecto: { hambre: 16, afecto: 3 } },
  { id: 'donut', nombre: 'Donut', categoria: 'comida', precio: 13, venta: 0, dibujo: 'donut', c1: C.rosaClaro, c2: '#D9A066', efecto: { hambre: 26, afecto: 8 } },
  { id: 'croissant', nombre: 'Croissant', categoria: 'comida', precio: 12, venta: 0, dibujo: 'croissant', c1: '#E8A33D', c2: '#B5791F', efecto: { hambre: 28 } },
  { id: 'sandwich', nombre: 'Sándwich', categoria: 'comida', precio: 15, venta: 0, dibujo: 'sandwich', c1: '#E8A33D', c2: '#7BC47F', efecto: { hambre: 38 } },
  { id: 'palta', nombre: 'Palta', categoria: 'comida', precio: 11, venta: 0, dibujo: 'palta', c1: C.verde, c2: '#B5791F', efecto: { hambre: 22, higiene: 2 } },
  { id: 'cereal', nombre: 'Cereal con leche', categoria: 'comida', precio: 9, venta: 0, dibujo: 'cereal', c1: C.celeste, c2: '#E8A33D', efecto: { hambre: 24 } },
  { id: 'pastelito', nombre: 'Pastelito', categoria: 'comida', precio: 16, venta: 0, dibujo: 'pastelito', c1: C.rosaClaro, c2: C.amarillo, efecto: { hambre: 26, afecto: 12 } },
  { id: 'hotdog', nombre: 'Completito', categoria: 'comida', precio: 15, venta: 0, dibujo: 'hotdog', c1: '#E8A33D', c2: C.rojo, efecto: { hambre: 40 } },

  // =========================================================================
  // Ingredientes (tienda / árbol). Se cocinan en pasos.
  // =========================================================================
  { id: 'huevo', nombre: 'Huevo', categoria: 'ingrediente', precio: 5, venta: 2, dibujo: 'huevo', c1: C.crema, c2: C.amarillo },
  { id: 'harina', nombre: 'Harina', categoria: 'ingrediente', precio: 5, venta: 2, dibujo: 'harina', c1: C.crema, c2: '#D9A066' },
  { id: 'miel', nombre: 'Miel', categoria: 'ingrediente', precio: 8, venta: 3, dibujo: 'miel', c1: C.ambar, c2: C.amarillo },
  { id: 'chocolate', nombre: 'Chocolate', categoria: 'ingrediente', precio: 9, venta: 3, dibujo: 'chocolate', c1: C.chocolate, c2: C.cafe },
  { id: 'limon', nombre: 'Limón', categoria: 'ingrediente', precio: 5, venta: 2, dibujo: 'limon', c1: C.amarillo, c2: C.verde },
  { id: 'leche_ing', nombre: 'Leche', categoria: 'ingrediente', precio: 5, venta: 2, dibujo: 'leche', c1: C.blanco, c2: C.celeste },
  { id: 'frutilla_ing', nombre: 'Frutillas', categoria: 'ingrediente', precio: 7, venta: 3, dibujo: 'frutilla', c1: C.rojo, c2: C.verde },
  { id: 'tomate', nombre: 'Tomate', categoria: 'ingrediente', precio: 5, venta: 2, dibujo: 'tomate', c1: C.rojo, c2: C.verde },
  { id: 'queso_ing', nombre: 'Queso', categoria: 'ingrediente', precio: 8, venta: 3, dibujo: 'queso', c1: C.amarillo, c2: C.ambar },
  { id: 'zapallo', nombre: 'Zapallo', categoria: 'ingrediente', precio: 7, venta: 3, dibujo: 'zapallo', c1: C.naranja, c2: C.verde },
  { id: 'manzana_ing', nombre: 'Manzanas', categoria: 'ingrediente', precio: 6, venta: 2, dibujo: 'manzana', c1: C.rojo, c2: C.verde },
  { id: 'azucar', nombre: 'Azúcar', categoria: 'ingrediente', precio: 4, venta: 1, dibujo: 'harina', c1: C.blanco, c2: C.rosaClaro },
  { id: 'mantequilla', nombre: 'Mantequilla', categoria: 'ingrediente', precio: 6, venta: 2, dibujo: 'mantequilla', c1: '#FFF3C4', c2: C.amarillo },
  { id: 'arroz', nombre: 'Arroz', categoria: 'ingrediente', precio: 5, venta: 2, dibujo: 'arroz', c1: C.blanco, c2: C.gris },
  { id: 'platano', nombre: 'Plátano', categoria: 'ingrediente', precio: 5, venta: 2, dibujo: 'platano', c1: C.amarillo, c2: C.ambar },
  { id: 'canela', nombre: 'Canela', categoria: 'ingrediente', precio: 6, venta: 2, dibujo: 'canela', c1: C.cafe, c2: C.chocolate },
  { id: 'naranja', nombre: 'Naranja', categoria: 'ingrediente', precio: 5, venta: 2, dibujo: 'naranja', c1: C.naranja, c2: C.verde },
  { id: 'nueces', nombre: 'Nueces', categoria: 'ingrediente', precio: 8, venta: 3, dibujo: 'nueces', c1: C.cafe, c2: C.chocolate },
  { id: 'avena', nombre: 'Avena', categoria: 'ingrediente', precio: 5, venta: 2, dibujo: 'avena', c1: '#E8D4A8', c2: C.cafe },
  { id: 'cebolla', nombre: 'Cebolla', categoria: 'ingrediente', precio: 4, venta: 1, dibujo: 'cebolla', c1: C.lavanda, c2: C.morado },
  { id: 'masa', nombre: 'Masa lista', categoria: 'ingrediente', precio: 9, venta: 3, dibujo: 'masa', c1: '#F3E4C8', c2: '#D9A066' },

  // =========================================================================
  // Platos (solo por cocina)
  // =========================================================================
  { id: 'pastel_frutilla', nombre: 'Pastel de frutilla', categoria: 'plato', precio: 0, venta: 20, dibujo: 'pastel', c1: C.rosaClaro, c2: C.rojo, efecto: { hambre: 45, afecto: 30 } },
  { id: 'galletas_miel', nombre: 'Galletas de miel', categoria: 'plato', precio: 0, venta: 14, dibujo: 'galleta', c1: C.paja, c2: C.ambar, efecto: { hambre: 35, afecto: 15 } },
  { id: 'batido', nombre: 'Batido de frutilla', categoria: 'plato', precio: 0, venta: 14, dibujo: 'batido', c1: C.rosaClaro, c2: C.blanco, efecto: { hambre: 25, afecto: 20, higiene: 5 } },
  { id: 'brownie', nombre: 'Brownie', categoria: 'plato', precio: 0, venta: 18, dibujo: 'brownie', c1: C.chocolate, c2: C.crema, efecto: { hambre: 40, afecto: 25 } },
  { id: 'limonada', nombre: 'Limonada', categoria: 'plato', precio: 0, venta: 10, dibujo: 'batido', c1: '#FFF3C4', c2: C.amarillo, efecto: { hambre: 15, afecto: 15, higiene: 10 } },
  { id: 'panqueques', nombre: 'Panqueques', categoria: 'plato', precio: 0, venta: 18, dibujo: 'panqueque', c1: '#E8A33D', c2: C.ambar, efecto: { hambre: 42, afecto: 22 } },
  { id: 'tortilla', nombre: 'Tortilla de zapallo', categoria: 'plato', precio: 0, venta: 16, dibujo: 'tortilla', c1: C.amarillo, c2: C.naranja, efecto: { hambre: 45, afecto: 12 } },
  { id: 'sopa', nombre: 'Sopita de zapallo', categoria: 'plato', precio: 0, venta: 15, dibujo: 'sopa', c1: C.naranja, c2: C.crema, efecto: { hambre: 40, afecto: 18, higiene: 5 } },
  { id: 'ensalada_fruta', nombre: 'Ensalada de frutas', categoria: 'plato', precio: 0, venta: 16, dibujo: 'ensalada', c1: C.rojo, c2: C.amarillo, efecto: { hambre: 30, afecto: 20, higiene: 8 } },
  { id: 'sushi_dulce', nombre: 'Sushi de plátano', categoria: 'plato', precio: 0, venta: 22, dibujo: 'sushi', c1: C.blanco, c2: C.amarillo, efecto: { hambre: 38, afecto: 28 } },
  { id: 'pan_amasado', nombre: 'Pan amasado', categoria: 'plato', precio: 0, venta: 14, dibujo: 'pan', c1: '#E8A33D', c2: C.crema, efecto: { hambre: 45, afecto: 10 } },
  { id: 'choco_caliente', nombre: 'Chocolate caliente', categoria: 'plato', precio: 0, venta: 15, dibujo: 'taza', c1: C.rosaClaro, c2: C.chocolate, efecto: { hambre: 22, afecto: 30 } },
  { id: 'empanaditas', nombre: 'Empanaditas', categoria: 'plato', precio: 0, venta: 20, dibujo: 'empanada', c1: '#E8A33D', c2: '#B5791F', efecto: { hambre: 50, afecto: 15 } },
  { id: 'helado_casero', nombre: 'Helado casero', categoria: 'plato', precio: 0, venta: 18, dibujo: 'helado', c1: C.amarillo, c2: '#D9A066', efecto: { hambre: 24, afecto: 30 } },
  { id: 'pizza', nombre: 'Pizza casera', categoria: 'plato', precio: 0, venta: 24, dibujo: 'pizza', c1: '#E8A33D', c2: C.rojo, efecto: { hambre: 55, afecto: 20 } },
  { id: 'sopaipillas', nombre: 'Sopaipillas', categoria: 'plato', precio: 0, venta: 16, dibujo: 'sopaipilla', c1: '#E8A33D', c2: C.naranja, efecto: { hambre: 42, afecto: 18 } },
  { id: 'queque_platano', nombre: 'Queque de plátano', categoria: 'plato', precio: 0, venta: 17, dibujo: 'pastel', c1: '#E8D4A8', c2: C.cafe, efecto: { hambre: 40, afecto: 20 } },
  { id: 'avena_manzana', nombre: 'Avena con manzana', categoria: 'plato', precio: 0, venta: 12, dibujo: 'cereal', c1: '#E8D4A8', c2: C.rojo, efecto: { hambre: 35, afecto: 12, higiene: 6 } },

  // =========================================================================
  // Ropa. Cada dibujo en varios colores.
  // =========================================================================
  ...variantes('sombrero_paja', 'Sombrero de paja', ropa('sombrero_paja', 'cabeza', 40), [['', '', C.paja, C.rosa], ['azul', 'con cinta azul', C.paja, C.azul], ['verde', 'con cinta verde', '#F3E4C8', C.verde]]),
  ...variantes('sombrero_copa', 'Sombrero de copa', ropa('sombrero_copa', 'cabeza', 70), [['', '', C.negro, C.rojo], ['morado', 'morado', C.morado, C.amarillo], ['blanco', 'blanco', C.crema, C.rosa]]),
  ...variantes('corona', 'Coronita', ropa('corona', 'cabeza', 90), [['', '', C.amarillo, C.rosa], ['plata', 'de plata', C.gris, C.celeste], ['flores', 'de flores', C.rosaClaro, C.amarillo]]),
  ...variantes('lazo', 'Lazo', ropa('lazo', 'cabeza', 30), [['rosa', 'rosa', C.rosa, C.tinta], ['celeste', 'celeste', C.celeste, C.azul], ['amarillo', 'amarillo', C.amarillo, C.ambar], ['negro', 'negro', C.negro, C.gris]]),
  ...variantes('gorro_lana', 'Gorro de lana', ropa('gorro_lana', 'cabeza', 45), [['', '', C.lavanda, C.morado], ['rojo', 'rojo', C.rojo, C.crema], ['menta', 'menta', C.menta, C.verde]]),
  ...variantes('gorra', 'Gorra', ropa('gorra', 'cabeza', 35), [['', '', C.menta, C.verde], ['roja', 'roja', C.rojo, C.blanco], ['azul', 'azul', C.azul, C.amarillo]]),
  ...variantes('boina', 'Boina', ropa('boina', 'cabeza', 38), [['', '', C.rojo, C.negro], ['negra', 'negra', C.negro, C.gris], ['lila', 'lila', C.lavanda, C.morado]]),
  ...variantes('diadema', 'Diadema con flor', ropa('diadema', 'cabeza', 32), [['', '', C.rosaClaro, C.amarillo], ['girasol', 'de girasol', C.amarillo, C.chocolate], ['azul', 'azul', C.celeste, C.blanco]]),
  ...variantes('audifonos', 'Audífonos', ropa('audifonos', 'cabeza', 55), [['', '', C.negro, C.rosa], ['blancos', 'blancos', C.crema, C.celeste]]),
  ...variantes('sombrero_vaquero', 'Sombrero vaquero', ropa('sombrero_vaquero', 'cabeza', 60), [['', '', C.cafe, C.ambar], ['rosa', 'rosa', C.rosaClaro, C.tinta]]),
  ...variantes('casco', 'Casco de bici', ropa('casco', 'cabeza', 48), [['', '', C.celeste, C.blanco], ['naranja', 'naranja', C.naranja, C.crema]]),
  ...variantes('cuernitos', 'Cuernitos', ropa('cuernitos', 'cabeza', 42), [['', '', C.rojo, C.negro], ['dorados', 'dorados', C.amarillo, C.ambar]]),
  ...variantes('lentes_sol', 'Lentes de sol', ropa('lentes_sol', 'cara', 30), [['', '', C.negro, C.amarillo], ['rosa', 'rosa', C.rosa, C.blanco], ['azul', 'azules', C.azul, C.celeste]]),
  ...variantes('lentes_redondos', 'Lentes redondos', ropa('lentes_redondos', 'cara', 35), [['', '', C.cafe, C.celeste], ['dorados', 'dorados', C.amarillo, C.blanco]]),
  ...variantes('antifaz', 'Antifaz', ropa('antifaz', 'cara', 40), [['', '', C.negro, C.amarillo], ['rosa', 'rosa', C.rosa, C.blanco], ['morado', 'morado', C.morado, C.lavanda]]),
  ...variantes('monoculo', 'Monóculo', ropa('monoculo', 'cara', 45), [['', '', C.amarillo, C.celeste]]),
  ...variantes('bufanda', 'Bufanda', ropa('bufanda', 'cuello', 35), [['celeste', 'celeste', C.celeste, C.blanco], ['roja', 'roja', C.rojo, C.crema], ['verde', 'verde', C.verde, C.amarillo], ['rayas', 'a rayas', C.morado, C.amarillo]]),
  ...variantes('panuelo', 'Pañuelo', ropa('panuelo', 'cuello', 25), [['', '', C.rojo, C.blanco], ['azul', 'azul', C.azul, C.blanco], ['rosa', 'rosa', C.rosa, C.blanco]]),
  ...variantes('collar', 'Collar', ropa('collar', 'cuello', 60), [['perlas', 'de perlas', C.crema, C.rosa], ['dorado', 'dorado', C.amarillo, C.ambar], ['cuentas', 'de cuentas', C.turquesa, C.morado]]),
  ...variantes('pajarita', 'Pajarita', ropa('pajarita', 'cuello', 30), [['', '', C.rojo, C.negro], ['azul', 'azul', C.azul, C.negro], ['lunares', 'de lunares', C.rosa, C.blanco]]),
  ...variantes('corbata', 'Corbata', ropa('corbata', 'cuello', 32), [['', '', C.azul, C.celeste], ['roja', 'roja', C.rojo, C.amarillo]]),
  ...variantes('vestido', 'Vestido', ropa('vestido', 'cuerpo', 85), [['celeste', 'celeste', C.celeste, C.blanco], ['rosa', 'rosa', C.rosaClaro, C.tinta], ['amarillo', 'amarillo', C.amarillo, C.blanco], ['lila', 'lila', C.lavanda, C.morado]]),
  ...variantes('chaleco', 'Chaleco', ropa('chaleco', 'cuerpo', 55), [['', '', C.lavanda, C.morado], ['verde', 'verde', C.verde, C.menta], ['formal', 'de traje', C.negro, C.blanco]]),
  ...variantes('capa', 'Capa', ropa('capa', 'cuerpo', 95), [['heroe', 'de héroe', C.rojo, C.amarillo], ['noche', 'de noche', C.negro, C.morado], ['real', 'real', C.morado, C.amarillo]]),
  ...variantes('pijama', 'Pijama', ropa('pijama', 'cuerpo', 60), [['', '', C.celeste, C.blanco], ['rosa', 'rosa', C.rosaClaro, C.blanco], ['estrellas', 'de estrellas', C.azul, C.amarillo]]),
  ...variantes('chaqueta', 'Chaqueta', ropa('chaqueta', 'cuerpo', 75), [['', '', C.azul, C.crema], ['cuero', 'de cuero', C.negro, C.gris], ['rosa', 'rosa', C.rosa, C.crema]]),
  ...variantes('delantal', 'Delantal', ropa('delantal', 'cuerpo', 40), [['', '', C.crema, C.rosa], ['rayas', 'a rayas', C.celeste, C.blanco]]),
  ...variantes('tutu', 'Tutú', ropa('tutu', 'cuerpo', 70), [['', '', C.rosaClaro, C.rosa], ['lila', 'lila', C.lavanda, C.morado], ['blanco', 'blanco', C.crema, C.celeste]]),
  ...variantes('alas', 'Alitas', ropa('alas', 'cuerpo', 110), [['', 'de hada', C.lavanda, C.celeste], ['angel', 'de ángel', C.crema, C.amarillo], ['mariposa', 'de mariposa', C.rosa, C.amarillo]]),
  ...variantes('mochila', 'Mochila', ropa('mochila', 'cuerpo', 50), [['', '', C.rojo, C.amarillo], ['verde', 'verde', C.verde, C.crema]]),
  // de temporada
  { id: 'orejas_conejo', nombre: 'Orejas de conejo', categoria: 'ropa', precio: 50, venta: 12, dibujo: 'orejas_conejo', slot: 'cabeza', c1: C.blanco, c2: C.rosaClaro, temporada: 'pascua' },
  { id: 'gorro_navidad', nombre: 'Gorro navideño', categoria: 'ropa', precio: 50, venta: 12, dibujo: 'gorro_navidad', slot: 'cabeza', c1: C.rojo, c2: C.blanco, temporada: 'navidad' },
  { id: 'bufanda_navidad', nombre: 'Bufanda navideña', categoria: 'ropa', precio: 40, venta: 10, dibujo: 'bufanda', slot: 'cuello', c1: C.verde, c2: C.rojo, temporada: 'navidad' },
  { id: 'sombrero_bruja', nombre: 'Sombrero de bruja', categoria: 'ropa', precio: 60, venta: 15, dibujo: 'sombrero_bruja', slot: 'cabeza', c1: C.morado, c2: C.naranja, temporada: 'halloween' },
  { id: 'capa_vampiro', nombre: 'Capa de vampiro', categoria: 'ropa', precio: 70, venta: 18, dibujo: 'capa', slot: 'cuerpo', c1: C.negro, c2: C.rojo, temporada: 'halloween' },
  { id: 'chupalla', nombre: 'Chupalla', categoria: 'ropa', precio: 45, venta: 12, dibujo: 'sombrero_paja', slot: 'cabeza', c1: '#F3E4C8', c2: C.rojo, temporada: 'dieciocho' },
  { id: 'panuelo_huaso', nombre: 'Pañuelo de huaso', categoria: 'ropa', precio: 30, venta: 8, dibujo: 'panuelo', slot: 'cuello', c1: C.rojo, c2: C.blanco, temporada: 'dieciocho' },
  { id: 'corazon_collar', nombre: 'Collar de corazón', categoria: 'ropa', precio: 55, venta: 14, dibujo: 'collar', slot: 'cuello', c1: C.rosa, c2: C.rojo, temporada: 'san_valentin' },
  { id: 'alas_cupido', nombre: 'Alitas de cupido', categoria: 'ropa', precio: 90, venta: 22, dibujo: 'alas', slot: 'cuerpo', c1: C.blanco, c2: C.rosa, temporada: 'san_valentin' },

  // =========================================================================
  // Paredes y suelos
  // =========================================================================
  { id: 'pared_rosa', nombre: 'Pared rosa', categoria: 'pared', precio: 0, venta: 0, dibujo: 'pared', c1: '#FFE3EE', c2: '#FFC9DC' },
  ...variantes('pared', 'Pared', { categoria: 'pared', precio: 50, venta: 0, dibujo: 'pared' }, [
    ['lavanda', 'lavanda', '#E2D5F8', '#C3AEE8'], ['menta', 'menta', '#D6F3E4', '#B5E3CB'], ['cielo', 'cielo', '#E1ECFF', '#BFD6FF'],
    ['crema', 'crema', '#FFF6E0', '#F3E4C8'], ['durazno', 'durazno', '#FFE1D0', '#FFC9A8'], ['limon', 'limón', '#FBF7C8', '#F0E58A'],
    ['gris', 'gris perla', '#ECEBF0', '#D3D1DA'], ['turquesa', 'turquesa', '#D2F1EE', '#9FDCD6'], ['lila', 'lila', '#F0E0FF', '#D8B8FF'],
    ['coral', 'coral', '#FFD9D0', '#FFB0A0'], ['bosque', 'bosque', '#D9EBD3', '#A8CFA0'], ['rayas', 'a rayas', '#FFF0F5', '#FFB3C6'],
  ]),
  { id: 'pared_gotica', nombre: 'Pared gótica', categoria: 'pared', precio: 90, venta: 0, dibujo: 'pared', c1: '#3B2F4A', c2: '#5C4A70' },
  { id: 'pared_playa', nombre: 'Pared playera', categoria: 'pared', precio: 80, venta: 0, dibujo: 'pared', c1: '#BEE7FF', c2: '#FFF3C4' },
  { id: 'pared_noche', nombre: 'Pared noche estrellada', categoria: 'pared', precio: 95, venta: 0, dibujo: 'pared', c1: '#2E2A55', c2: '#FFE9A8' },
  { id: 'pared_ladrillo', nombre: 'Pared de ladrillo', categoria: 'pared', precio: 85, venta: 0, dibujo: 'pared', c1: '#D98B74', c2: '#B8674F' },
  { id: 'pared_navidad', nombre: 'Pared navideña', categoria: 'pared', precio: 80, venta: 0, dibujo: 'pared', c1: '#D9F0DF', c2: C.rojo, temporada: 'navidad' },
  { id: 'pared_halloween', nombre: 'Pared embrujada', categoria: 'pared', precio: 80, venta: 0, dibujo: 'pared', c1: '#4A3A5C', c2: C.naranja, temporada: 'halloween' },
  { id: 'pared_corazones', nombre: 'Pared de corazones', categoria: 'pared', precio: 70, venta: 0, dibujo: 'pared', c1: '#FFE3EE', c2: C.rosa, temporada: 'san_valentin' },
  { id: 'suelo_madera', nombre: 'Piso de madera', categoria: 'suelo', precio: 0, venta: 0, dibujo: 'suelo', c1: '#F3D9B8', c2: '#E3C39C' },
  ...variantes('suelo', 'Piso', { categoria: 'suelo', precio: 45, venta: 0, dibujo: 'suelo' }, [
    ['alfombra', 'de alfombra rosa', '#FFC9DC', '#FFB3C6'], ['pasto', 'de pasto', '#BFE8C6', '#8CD39A'], ['arena', 'de arena', '#FFEFC2', '#F3DDA0'],
    ['piedra', 'de piedra', '#CFCBD6', '#A9A3B5'], ['madera_oscura', 'de madera oscura', '#B98A5C', '#8C6239'], ['baldosa', 'de baldosas', '#E1ECFF', '#BFD6FF'],
    ['alfombra_lila', 'de alfombra lila', '#E2D5F8', '#C3AEE8'], ['alfombra_menta', 'de alfombra menta', '#D6F3E4', '#B5E3CB'], ['marmol', 'de mármol', '#F5F3F7', '#D9D5E0'],
    ['ajedrez', 'de ajedrez', '#FFF8F0', '#4A3B45'], ['agua', 'de agua', '#BEE7FF', '#6BC8E8'], ['nieve', 'de nieve', '#F7FBFF', '#DCEBF7'],
    ['tierra', 'de tierra', '#C9A66B', '#A8804A'], ['ladrillo', 'de ladrillo', '#E0A08A', '#C97C60'],
  ]),

  // =========================================================================
  // Habitaciones (la sala viene de regalo)
  // =========================================================================
  { id: 'hab_dormitorio', nombre: 'Dormitorio', categoria: 'habitacion', precio: 150, venta: 0, dibujo: 'puerta', c1: C.lavanda, c2: C.morado, habitacion: 'dormitorio', descripcion: 'Una pieza más para la casa.' },
  { id: 'hab_cocina', nombre: 'Cocina', categoria: 'habitacion', precio: 200, venta: 0, dibujo: 'puerta', c1: C.amarillo, c2: C.ambar, habitacion: 'cocina', descripcion: 'Con su propia ventana a la calle.' },
  { id: 'hab_bano', nombre: 'Baño', categoria: 'habitacion', precio: 180, venta: 0, dibujo: 'puerta', c1: C.celeste, c2: C.azul, habitacion: 'bano', descripcion: 'Para la tina y los patitos.' },
  { id: 'hab_jardin', nombre: 'Jardín', categoria: 'habitacion', precio: 250, venta: 0, dibujo: 'puerta', c1: C.menta, c2: C.verde, habitacion: 'jardin', descripcion: 'Pasto, cielo y espacio para plantas.' },
  { id: 'hab_terraza', nombre: 'Terraza', categoria: 'habitacion', precio: 300, venta: 0, dibujo: 'puerta', c1: C.durazno, c2: C.naranja, habitacion: 'terraza', descripcion: 'Atardeceres garantizados.' },
  { id: 'hab_atico', nombre: 'Ático', categoria: 'habitacion', precio: 350, venta: 0, dibujo: 'puerta', c1: C.madera, c2: C.cafe, habitacion: 'atico', descripcion: 'Techo inclinado y un telescopio esperando.' },

  // =========================================================================
  // Muebles (se arrastran por la habitación)
  // =========================================================================
  { id: 'cama', nombre: 'Camita', categoria: 'mueble', precio: 0, venta: 0, dibujo: 'cama', c1: C.rosa, c2: '#FFE1EC', tam: 0.3 },
  ...variantes('cama', 'Camita', mueble('cama', 60, 0.3), [['azul', 'azul', C.celeste, C.blanco], ['lila', 'lila', C.lavanda, C.crema], ['nube', 'nube', C.crema, C.cielo]]),
  ...variantes('estante', 'Estante', mueble('estante', 40, 0.24), [['', '', C.madera, C.rosaClaro], ['blanco', 'blanco', C.crema, C.celeste]]),
  ...variantes('planta', 'Planta', mueble('planta', 35, 0.18), [['', '', C.verde, '#C97C5A'], ['helecho', 'helecho', '#7BC47F', C.gris], ['flor', 'con flor', C.rosa, C.madera]]),
  ...variantes('lampara', 'Lámpara', mueble('lampara', 50, 0.16), [['', '', C.amarillo, C.madera], ['rosa', 'rosa', C.rosaClaro, C.tinta], ['moderna', 'moderna', C.crema, C.negro]]),
  ...variantes('cuadro', 'Cuadro', mueble('cuadro', 45, 0.2), [['', '', C.celeste, C.madera], ['dorado', 'con marco dorado', C.rosaClaro, C.amarillo], ['negro', 'con marco negro', C.menta, C.negro]]),
  ...variantes('alfombrita', 'Alfombrita', mueble('alfombrita', 30, 0.34), [['', '', C.lavanda, C.morado], ['roja', 'roja', C.rojo, C.amarillo], ['redonda', 'menta', C.menta, C.verde]]),
  ...variantes('pecera', 'Pecera', mueble('pecera', 80, 0.2), [['', '', C.celeste, C.naranja], ['grande', 'grande', C.cielo, C.rosa]]),
  ...variantes('silla', 'Silla', mueble('silla', 35, 0.16), [['', '', C.madera, C.rosaClaro], ['blanca', 'blanca', C.crema, C.celeste], ['negra', 'negra', C.negro, C.gris]]),
  ...variantes('mesa', 'Mesa', mueble('mesa', 55, 0.28), [['', '', C.madera, C.crema], ['redonda', 'blanca', C.crema, C.rosaClaro]]),
  ...variantes('sofa', 'Sofá', mueble('sofa', 90, 0.32), [['', '', C.rosaClaro, C.tinta], ['verde', 'verde', C.menta, C.verde], ['azul', 'azul', C.celeste, C.azul], ['gris', 'gris', C.gris, C.negro]]),
  ...variantes('tele', 'Tele', mueble('tele', 110, 0.24), [['', '', C.negro, C.celeste]]),
  ...variantes('reloj', 'Reloj de pared', mueble('reloj', 40, 0.14), [['', '', C.crema, C.madera], ['cucu', 'cucú', C.madera, C.rojo]]),
  ...variantes('espejo', 'Espejo', mueble('espejo', 50, 0.16), [['', '', C.cielo, C.amarillo], ['rosa', 'rosa', C.cielo, C.rosa]]),
  ...variantes('cojin', 'Cojín', mueble('cojin', 20, 0.14), [['', '', C.rosaClaro, C.rosa], ['amarillo', 'amarillo', C.amarillo, C.ambar], ['lila', 'lila', C.lavanda, C.morado]]),
  ...variantes('libros', 'Pila de libros', mueble('libros', 30, 0.14), [['', '', C.rojo, C.azul]]),
  ...variantes('florero', 'Florero', mueble('florero', 30, 0.12), [['', '', C.celeste, C.rosa], ['girasoles', 'con girasoles', C.crema, C.amarillo]]),
  ...variantes('chimenea', 'Chimenea', mueble('chimenea', 140, 0.3), [['', '', '#D98B74', C.naranja]]),
  ...variantes('cuna', 'Cuna de juguete', mueble('cuna', 70, 0.24), [['', '', C.crema, C.rosaClaro]]),
  ...variantes('poster', 'Póster', mueble('poster', 25, 0.18), [['', 'de k-drama', C.rosaClaro, C.tinta], ['luna', 'de la luna', '#2E2A55', C.amarillo]]),
  ...variantes('guitarra', 'Guitarra', mueble('guitarra', 85, 0.16), [['', '', C.madera, C.chocolate]]),
  ...variantes('radio', 'Radio', mueble('radio', 55, 0.18), [['', '', C.crema, C.rojo]]),
  ...variantes('cactus', 'Cactus', mueble('cactus', 30, 0.14), [['', '', '#7BC47F', C.durazno]]),
  ...variantes('osito', 'Osito de peluche', mueble('osito', 45, 0.15), [['', '', C.cafe, C.crema], ['rosa', 'rosa', C.rosaClaro, C.crema]]),
  ...variantes('tren', 'Trencito', mueble('tren', 50, 0.22), [['', '', C.rojo, C.azul]]),
  ...variantes('banera', 'Bañera', mueble('banera', 120, 0.32), [['', '', C.crema, C.celeste]]),
  ...variantes('lavamanos', 'Lavamanos', mueble('lavamanos', 70, 0.18), [['', '', C.crema, C.celeste]]),
  ...variantes('patito', 'Patito de goma', mueble('patito', 15, 0.1), [['', '', C.amarillo, C.naranja], ['rosa', 'rosa', C.rosaClaro, C.naranja]]),
  ...variantes('columpio', 'Columpio', mueble('columpio', 95, 0.28), [['', '', C.madera, C.rosa]]),
  ...variantes('fuente', 'Fuente', mueble('fuente', 130, 0.26), [['', '', C.gris, C.celeste]]),
  ...variantes('parrilla', 'Parrilla', mueble('parrilla', 110, 0.22), [['', '', C.negro, C.rojo]]),
  ...variantes('hamaca', 'Hamaca', mueble('hamaca', 80, 0.34), [['', '', C.rosaClaro, C.madera], ['rayas', 'a rayas', C.celeste, C.blanco]]),
  ...variantes('telescopio', 'Telescopio', mueble('telescopio', 150, 0.2), [['', '', C.negro, C.amarillo]]),
  ...variantes('farol', 'Farol', mueble('farol', 45, 0.12), [['', '', C.negro, C.amarillo]]),
  ...variantes('tobogan', 'Tobogán', mueble('tobogan', 100, 0.3), [['', '', C.rojo, C.celeste]]),
  ...variantes('mesita_te', 'Mesita de té', mueble('mesita_te', 65, 0.22), [['', '', C.crema, C.rosa]]),
  ...variantes('cocina_mueble', 'Cocinita', mueble('cocina_mueble', 120, 0.28), [['', '', C.crema, C.rojo], ['menta', 'menta', C.menta, C.verde]]),
  ...variantes('refrigerador', 'Refrigerador', mueble('refrigerador', 130, 0.18), [['', '', C.crema, C.celeste], ['rosa', 'rosa', C.rosaClaro, C.tinta]]),
  ...variantes('globo', 'Globos', mueble('globo', 20, 0.14), [['', '', C.rosa, C.celeste], ['amarillos', 'amarillos', C.amarillo, C.verde]]),
  // de temporada
  { id: 'arbol_navidad', nombre: 'Arbolito', categoria: 'mueble', precio: 70, venta: 18, dibujo: 'arbolito', c1: C.verde, c2: C.rojo, temporada: 'navidad', tam: 0.28 },
  { id: 'calabaza', nombre: 'Calabaza', categoria: 'mueble', precio: 40, venta: 10, dibujo: 'calabaza', c1: C.naranja, c2: C.verde, temporada: 'halloween', tam: 0.18 },
  { id: 'guirnalda', nombre: 'Guirnalda', categoria: 'mueble', precio: 35, venta: 9, dibujo: 'guirnalda', c1: C.rojo, c2: C.blanco, temporada: 'dieciocho', tam: 0.4 },
  { id: 'huevo_pascua', nombre: 'Huevo pintado', categoria: 'mueble', precio: 35, venta: 9, dibujo: 'huevo_pascua', c1: C.lavanda, c2: C.amarillo, temporada: 'pascua', tam: 0.14 },
  { id: 'corazones_pared', nombre: 'Corazones colgantes', categoria: 'mueble', precio: 35, venta: 9, dibujo: 'corazones_pared', c1: C.rosa, c2: C.rojo, temporada: 'san_valentin', tam: 0.3 },

  // =========================================================================
  // Pesca: cebo, cañas, aparejos y peces (con comportamiento y dificultad)
  // =========================================================================
  { id: 'cebo', nombre: 'Cebo', categoria: 'cebo', precio: 5, venta: 0, dibujo: 'cebo', c1: C.rosaClaro, c2: C.cafe, descripcion: 'Más suerte con los raros en una tirada.' },
  { id: 'cana_bambu', nombre: 'Caña de bambú', categoria: 'cana', precio: 0, venta: 0, dibujo: 'cana', c1: C.paja, c2: C.verde, bonus: { barra: 1 }, descripcion: 'La de siempre.' },
  { id: 'cana_fibra', nombre: 'Caña de fibra', categoria: 'cana', precio: 120, venta: 30, dibujo: 'cana', c1: C.celeste, c2: C.azul, bonus: { barra: 1.15 }, descripcion: 'Barra verde 15 % más grande.' },
  { id: 'cana_iridio', nombre: 'Caña de iridio', categoria: 'cana', precio: 260, venta: 65, dibujo: 'cana', c1: C.lavanda, c2: C.morado, bonus: { barra: 1.3, drenaje: 0.8 }, descripcion: 'Barra 30 % más grande y el pez se escapa más lento.' },
  { id: 'corcho', nombre: 'Corcho', categoria: 'aparejo', precio: 80, venta: 20, dibujo: 'corcho', c1: C.rojo, c2: C.blanco, bonus: { barra: 1.2 }, descripcion: 'Aparejo: barra verde 20 % más grande.' },
  { id: 'plomada', nombre: 'Plomada', categoria: 'aparejo', precio: 80, venta: 20, dibujo: 'plomada', c1: C.gris, c2: C.negro, bonus: { rebote: true }, descripcion: 'Aparejo: la barra no rebota en el fondo.' },
  { id: 'anzuelo_trampa', nombre: 'Anzuelo trampa', categoria: 'aparejo', precio: 100, venta: 25, dibujo: 'anzuelo', c1: C.amarillo, c2: C.ambar, bonus: { drenaje: 0.6 }, descripcion: 'Aparejo: el medidor baja mucho más lento.' },
  { id: 'pez_dorado', nombre: 'Pez dorado', categoria: 'pez', precio: 0, venta: 8, dibujo: 'pez', c1: C.naranja, c2: C.amarillo, rareza: 1, comportamiento: 'suave', dificultad: 1 },
  { id: 'pez_azul', nombre: 'Pez azul', categoria: 'pez', precio: 0, venta: 12, dibujo: 'pez', c1: C.celeste, c2: C.azul, rareza: 1, comportamiento: 'suave', dificultad: 2 },
  { id: 'carpa', nombre: 'Carpa', categoria: 'pez', precio: 0, venta: 10, dibujo: 'pez', c1: C.oliva, c2: C.verde, rareza: 1, comportamiento: 'fondo', dificultad: 1 },
  { id: 'pez_payaso', nombre: 'Pez payaso', categoria: 'pez', precio: 0, venta: 14, dibujo: 'pez', c1: C.naranja, c2: C.blanco, rareza: 2, comportamiento: 'dardo', dificultad: 2 },
  { id: 'pez_globo', nombre: 'Pez globo', categoria: 'pez', precio: 0, venta: 18, dibujo: 'pez_globo', c1: C.amarillo, c2: C.ambar, rareza: 2, comportamiento: 'fondo', dificultad: 3 },
  { id: 'cangrejo', nombre: 'Cangrejo', categoria: 'pez', precio: 0, venta: 15, dibujo: 'cangrejo', c1: C.rojo, c2: C.negro, rareza: 2, comportamiento: 'fondo', dificultad: 2 },
  { id: 'caballito', nombre: 'Caballito de mar', categoria: 'pez', precio: 0, venta: 20, dibujo: 'caballito', c1: C.amarillo, c2: C.naranja, rareza: 2, comportamiento: 'escurridizo', dificultad: 3 },
  { id: 'estrella', nombre: 'Estrella de mar', categoria: 'pez', precio: 0, venta: 22, dibujo: 'estrella', c1: C.rosa, c2: C.tinta, rareza: 3, comportamiento: 'suave', dificultad: 2 },
  { id: 'medusa', nombre: 'Medusa', categoria: 'pez', precio: 0, venta: 26, dibujo: 'medusa', c1: C.lavanda, c2: C.morado, rareza: 3, comportamiento: 'escurridizo', dificultad: 3 },
  { id: 'tortuga', nombre: 'Tortuguita', categoria: 'pez', precio: 0, venta: 24, dibujo: 'tortuga', c1: C.verde, c2: C.oliva, rareza: 3, comportamiento: 'suave', dificultad: 2 },
  { id: 'pulpo', nombre: 'Pulpito', categoria: 'pez', precio: 0, venta: 28, dibujo: 'pulpo', c1: C.rosa, c2: C.tinta, rareza: 3, comportamiento: 'mixto', dificultad: 4 },
  { id: 'anguila', nombre: 'Anguila', categoria: 'pez', precio: 0, venta: 26, dibujo: 'anguila', c1: C.turquesa, c2: C.azul, rareza: 3, comportamiento: 'dardo', dificultad: 4 },
  { id: 'tiburoncito', nombre: 'Tiburoncito', categoria: 'pez', precio: 0, venta: 35, dibujo: 'tiburon', c1: '#9FB4C9', c2: C.blanco, rareza: 4, comportamiento: 'dardo', dificultad: 5 },
  { id: 'pez_luna', nombre: 'Pez luna', categoria: 'pez', precio: 0, venta: 40, dibujo: 'pez_luna', c1: C.gris, c2: C.amarillo, rareza: 4, comportamiento: 'mixto', dificultad: 5 },
  { id: 'pez_espada', nombre: 'Pez espada', categoria: 'pez', precio: 0, venta: 38, dibujo: 'pez_espada', c1: C.azul, c2: C.gris, rareza: 4, comportamiento: 'escurridizo', dificultad: 5 },
  { id: 'bota', nombre: 'Bota vieja', categoria: 'pez', precio: 0, venta: 1, dibujo: 'bota', c1: C.cafe, c2: C.chocolate, rareza: 1, comportamiento: 'fondo', dificultad: 1, descripcion: 'Basura reciclable. Igual da un besito.' },

  // =========================================================================
  // Insectos (árbol)
  // =========================================================================
  { id: 'mariposa', nombre: 'Mariposa', categoria: 'insecto', precio: 0, venta: 10, dibujo: 'mariposa', c1: C.lavanda, c2: C.morado, rareza: 1 },
  { id: 'mariposa_naranja', nombre: 'Mariposa monarca', categoria: 'insecto', precio: 0, venta: 16, dibujo: 'mariposa', c1: C.naranja, c2: C.negro, rareza: 2 },
  { id: 'mariposa_azul', nombre: 'Mariposa azul', categoria: 'insecto', precio: 0, venta: 28, dibujo: 'mariposa', c1: C.celeste, c2: C.azul, rareza: 3 },
  { id: 'mariquita', nombre: 'Mariquita', categoria: 'insecto', precio: 0, venta: 10, dibujo: 'mariquita', c1: C.rojo, c2: C.negro, rareza: 1 },
  { id: 'abeja', nombre: 'Abejita', categoria: 'insecto', precio: 0, venta: 14, dibujo: 'abeja', c1: C.amarillo, c2: C.negro, rareza: 2 },
  { id: 'luciernaga', nombre: 'Luciérnaga', categoria: 'insecto', precio: 0, venta: 24, dibujo: 'luciernaga', c1: C.amarillo, c2: C.chocolate, rareza: 3 },
  { id: 'caracol', nombre: 'Caracol', categoria: 'insecto', precio: 0, venta: 12, dibujo: 'caracol', c1: C.paja, c2: C.cafe, rareza: 2 },
  { id: 'libelula', nombre: 'Libélula', categoria: 'insecto', precio: 0, venta: 20, dibujo: 'libelula', c1: C.turquesa, c2: C.azul, rareza: 3 },
  { id: 'saltamontes', nombre: 'Saltamontes', categoria: 'insecto', precio: 0, venta: 12, dibujo: 'saltamontes', c1: '#7BC47F', c2: C.verde, rareza: 1 },
  { id: 'escarabajo', nombre: 'Escarabajo dorado', categoria: 'insecto', precio: 0, venta: 40, dibujo: 'escarabajo', c1: C.amarillo, c2: C.ambar, rareza: 4 },
  { id: 'hormiga', nombre: 'Hormiguita', categoria: 'insecto', precio: 0, venta: 8, dibujo: 'hormiga', c1: C.chocolate, c2: C.negro, rareza: 1 },
  { id: 'polilla', nombre: 'Polilla luna', categoria: 'insecto', precio: 0, venta: 32, dibujo: 'mariposa', c1: C.menta, c2: C.verde, rareza: 4 },

  // =========================================================================
  // Fósiles (pesca profunda)
  // =========================================================================
  { id: 'fosil_concha', nombre: 'Concha fósil', categoria: 'fosil', precio: 0, venta: 20, dibujo: 'fosil_concha', c1: '#D9CBB0', c2: '#8C7B5E', rareza: 2 },
  { id: 'fosil_hueso', nombre: 'Huesito fósil', categoria: 'fosil', precio: 0, venta: 28, dibujo: 'fosil_hueso', c1: '#EFE6D2', c2: '#8C7B5E', rareza: 3 },
  { id: 'fosil_amonite', nombre: 'Amonite', categoria: 'fosil', precio: 0, venta: 40, dibujo: 'fosil_amonite', c1: '#C9B693', c2: '#6B5A3E', rareza: 4 },
  { id: 'fosil_hoja', nombre: 'Hoja fósil', categoria: 'fosil', precio: 0, venta: 22, dibujo: 'fosil_hoja', c1: '#D9CBB0', c2: '#6B7B4E', rareza: 2 },
  { id: 'fosil_diente', nombre: 'Diente fósil', categoria: 'fosil', precio: 0, venta: 34, dibujo: 'fosil_diente', c1: '#EFE6D2', c2: '#8C7B5E', rareza: 3 },
  { id: 'fosil_trilobite', nombre: 'Trilobite', categoria: 'fosil', precio: 0, venta: 45, dibujo: 'fosil_trilobite', c1: '#C9B693', c2: '#5A4A32', rareza: 4 },

  // =========================================================================
  // Arte (tienda, se dona al museo)
  // =========================================================================
  ...variantes('arte', 'Cuadro', { categoria: 'arte', precio: 70, venta: 18, dibujo: 'arte' }, [
    ['girasol', 'del girasol', C.amarillo, '#6B4A2A'], ['noche', 'de la noche', '#2E2A55', C.amarillo], ['corazon', 'del corazón', C.rosaClaro, C.rosa],
    ['mar', 'del mar', C.celeste, C.azul], ['bosque', 'del bosque', C.menta, C.verde], ['atardecer', 'del atardecer', C.durazno, C.naranja],
    ['gatito', 'del gatito', C.crema, C.negro], ['lluvia', 'de la lluvia', '#8FB3D9', C.rojo], ['montana', 'de la montaña', C.cielo, C.gris],
    ['primavera', 'de la primavera', C.amarillo, C.rosa], ['luna', 'de la luna', C.negro, C.crema], ['abstracto', 'abstracto', C.morado, C.amarillo],
  ]),

  // =========================================================================
  // Trofeos (estadio) y cofres (pesca)
  // =========================================================================
  { id: 'trofeo_oro', nombre: 'Trofeo de oro', categoria: 'trofeo', precio: 0, venta: 0, dibujo: 'trofeo', c1: C.amarillo, c2: C.ambar },
  { id: 'trofeo_plata', nombre: 'Trofeo de plata', categoria: 'trofeo', precio: 0, venta: 0, dibujo: 'trofeo', c1: '#D9D9E0', c2: '#9A9AA8' },
  { id: 'trofeo_bronce', nombre: 'Trofeo de bronce', categoria: 'trofeo', precio: 0, venta: 0, dibujo: 'trofeo', c1: '#D9A066', c2: C.cafe },
  { id: 'medalla_oro', nombre: 'Medalla de cocina (oro)', categoria: 'trofeo', precio: 0, venta: 0, dibujo: 'medalla', c1: C.amarillo, c2: C.rojo },
  { id: 'medalla_plata', nombre: 'Medalla de cocina (plata)', categoria: 'trofeo', precio: 0, venta: 0, dibujo: 'medalla', c1: '#D9D9E0', c2: C.azul },
  { id: 'medalla_bronce', nombre: 'Medalla de cocina (bronce)', categoria: 'trofeo', precio: 0, venta: 0, dibujo: 'medalla', c1: '#D9A066', c2: C.verde },
];

// ===========================================================================
// Recetas por pasos (Cooking Mama). Cada paso es una mecánica concreta.
// ===========================================================================
export const RECETAS: Receta[] = [
  { id: 'pastel_frutilla', nombre: 'Pastel de frutilla', ingredientes: ['frutilla_ing', 'huevo', 'harina'], resultado: 'pastel_frutilla', pasos: [
    { tipo: 'cortar', texto: 'Corta las frutillas siguiendo las líneas', ingrediente: 'frutilla_ing', n: 4 },
    { tipo: 'mezclar', texto: 'Mezcla la masa, sin salpicar', n: 6 },
    { tipo: 'fuego', texto: 'Hornea: mantén la aguja en la zona', tiempo: 10 },
    { tipo: 'emplatar', texto: 'Decora con las frutillas', ingrediente: 'frutilla_ing', n: 3 },
  ] },
  { id: 'galletas_miel', nombre: 'Galletas de miel', ingredientes: ['harina', 'miel'], resultado: 'galletas_miel', pasos: [
    { tipo: 'verter', texto: 'Vierte la miel hasta la línea', ingrediente: 'miel' },
    { tipo: 'mezclar', texto: 'Mezcla la masa', n: 5 },
    { tipo: 'cortar', texto: 'Corta las galletas', ingrediente: 'masa', n: 5 },
    { tipo: 'fuego', texto: 'Hornea sin quemarlas', tiempo: 8 },
  ] },
  { id: 'batido', nombre: 'Batido de frutilla', ingredientes: ['frutilla_ing', 'leche_ing'], resultado: 'batido', pasos: [
    { tipo: 'cortar', texto: 'Corta las frutillas', ingrediente: 'frutilla_ing', n: 3 },
    { tipo: 'verter', texto: 'Vierte la leche hasta la línea', ingrediente: 'leche_ing' },
    { tipo: 'mezclar', texto: 'Bate rápido pero parejo', n: 7 },
  ] },
  { id: 'brownie', nombre: 'Brownie', ingredientes: ['chocolate', 'huevo', 'harina'], resultado: 'brownie', pasos: [
    { tipo: 'picar', texto: 'Pica el chocolate al ritmo', ingrediente: 'chocolate', n: 8 },
    { tipo: 'mezclar', texto: 'Mezcla la masa', n: 6 },
    { tipo: 'fuego', texto: 'Hornea a fuego medio', tiempo: 10 },
    { tipo: 'cortar', texto: 'Corta en cuadraditos', ingrediente: 'brownie', n: 4 },
  ] },
  { id: 'limonada', nombre: 'Limonada', ingredientes: ['limon', 'miel'], resultado: 'limonada', pasos: [
    { tipo: 'cortar', texto: 'Corta los limones', ingrediente: 'limon', n: 3 },
    { tipo: 'verter', texto: 'Vierte la miel', ingrediente: 'miel' },
    { tipo: 'mezclar', texto: 'Revuelve', n: 4 },
  ] },
  { id: 'panqueques', nombre: 'Panqueques', ingredientes: ['harina', 'huevo', 'leche_ing'], resultado: 'panqueques', pasos: [
    { tipo: 'verter', texto: 'Vierte la leche', ingrediente: 'leche_ing' },
    { tipo: 'mezclar', texto: 'Bate la mezcla', n: 5 },
    { tipo: 'voltear', texto: 'Voltea el panqueque en el momento justo', n: 2 },
    { tipo: 'emplatar', texto: 'Apila y decora', ingrediente: 'miel', n: 3 },
  ] },
  { id: 'tortilla', nombre: 'Tortilla de zapallo', ingredientes: ['zapallo', 'huevo', 'cebolla'], resultado: 'tortilla', pasos: [
    { tipo: 'cortar', texto: 'Corta el zapallo', ingrediente: 'zapallo', n: 4 },
    { tipo: 'picar', texto: 'Pica la cebolla al ritmo', ingrediente: 'cebolla', n: 8 },
    { tipo: 'mezclar', texto: 'Bate los huevos', n: 4 },
    { tipo: 'voltear', texto: 'Voltea la tortilla', n: 1 },
  ] },
  { id: 'sopa', nombre: 'Sopita de zapallo', ingredientes: ['zapallo', 'cebolla', 'leche_ing'], resultado: 'sopa', pasos: [
    { tipo: 'cortar', texto: 'Corta el zapallo', ingrediente: 'zapallo', n: 4 },
    { tipo: 'picar', texto: 'Pica la cebolla', ingrediente: 'cebolla', n: 6 },
    { tipo: 'fuego', texto: 'Cocina a fuego lento', tiempo: 10 },
    { tipo: 'verter', texto: 'Agrega la leche hasta la línea', ingrediente: 'leche_ing' },
  ] },
  { id: 'ensalada_fruta', nombre: 'Ensalada de frutas', ingredientes: ['manzana_ing', 'platano', 'naranja'], resultado: 'ensalada_fruta', pasos: [
    { tipo: 'cortar', texto: 'Corta la manzana', ingrediente: 'manzana_ing', n: 4 },
    { tipo: 'cortar', texto: 'Corta el plátano', ingrediente: 'platano', n: 5 },
    { tipo: 'emplatar', texto: 'Arma el bol', ingrediente: 'naranja', n: 3 },
  ] },
  { id: 'sushi_dulce', nombre: 'Sushi de plátano', ingredientes: ['arroz', 'platano', 'chocolate'], resultado: 'sushi_dulce', pasos: [
    { tipo: 'fuego', texto: 'Cocina el arroz', tiempo: 8 },
    { tipo: 'cortar', texto: 'Corta el plátano', ingrediente: 'platano', n: 5 },
    { tipo: 'emplatar', texto: 'Arma los rollitos', ingrediente: 'sushi_dulce', n: 4 },
  ] },
  { id: 'pan_amasado', nombre: 'Pan amasado', ingredientes: ['harina', 'mantequilla', 'leche_ing'], resultado: 'pan_amasado', pasos: [
    { tipo: 'mezclar', texto: 'Amasa con calma', n: 8 },
    { tipo: 'emplatar', texto: 'Forma los panes en la bandeja', ingrediente: 'masa', n: 4 },
    { tipo: 'fuego', texto: 'Hornea', tiempo: 10 },
  ] },
  { id: 'choco_caliente', nombre: 'Chocolate caliente', ingredientes: ['chocolate', 'leche_ing', 'canela'], resultado: 'choco_caliente', pasos: [
    { tipo: 'picar', texto: 'Pica el chocolate', ingrediente: 'chocolate', n: 6 },
    { tipo: 'verter', texto: 'Vierte la leche', ingrediente: 'leche_ing' },
    { tipo: 'fuego', texto: 'Calienta sin que hierva', tiempo: 8 },
    { tipo: 'mezclar', texto: 'Revuelve con la canela', n: 4 },
  ] },
  { id: 'empanaditas', nombre: 'Empanaditas', ingredientes: ['masa', 'queso_ing', 'cebolla'], resultado: 'empanaditas', pasos: [
    { tipo: 'picar', texto: 'Pica la cebolla', ingrediente: 'cebolla', n: 8 },
    { tipo: 'cortar', texto: 'Corta el queso', ingrediente: 'queso_ing', n: 4 },
    { tipo: 'emplatar', texto: 'Rellena y cierra las empanadas', ingrediente: 'empanaditas', n: 4 },
    { tipo: 'fuego', texto: 'Hornea', tiempo: 10 },
  ] },
  { id: 'helado_casero', nombre: 'Helado casero', ingredientes: ['platano', 'leche_ing', 'miel'], resultado: 'helado_casero', pasos: [
    { tipo: 'cortar', texto: 'Corta el plátano', ingrediente: 'platano', n: 5 },
    { tipo: 'verter', texto: 'Vierte la leche', ingrediente: 'leche_ing' },
    { tipo: 'mezclar', texto: 'Bate hasta que espese', n: 8 },
    { tipo: 'emplatar', texto: 'Sirve las bolitas', ingrediente: 'helado_casero', n: 3 },
  ] },
  { id: 'pizza', nombre: 'Pizza casera', ingredientes: ['masa', 'tomate', 'queso_ing'], resultado: 'pizza', pasos: [
    { tipo: 'mezclar', texto: 'Estira la masa con movimientos circulares', n: 5 },
    { tipo: 'cortar', texto: 'Corta el tomate', ingrediente: 'tomate', n: 4 },
    { tipo: 'emplatar', texto: 'Pon el queso y el tomate', ingrediente: 'queso_ing', n: 4 },
    { tipo: 'fuego', texto: 'Hornea a fuego fuerte', tiempo: 9 },
  ] },
  { id: 'sopaipillas', nombre: 'Sopaipillas', ingredientes: ['zapallo', 'harina', 'mantequilla'], resultado: 'sopaipillas', pasos: [
    { tipo: 'mezclar', texto: 'Amasa el zapallo con la harina', n: 6 },
    { tipo: 'cortar', texto: 'Corta las sopaipillas', ingrediente: 'masa', n: 5 },
    { tipo: 'voltear', texto: 'Fríe y voltea', n: 2 },
  ] },
  { id: 'queque_platano', nombre: 'Queque de plátano', ingredientes: ['platano', 'harina', 'nueces'], resultado: 'queque_platano', pasos: [
    { tipo: 'picar', texto: 'Pica las nueces', ingrediente: 'nueces', n: 8 },
    { tipo: 'mezclar', texto: 'Mezcla el plátano con la harina', n: 6 },
    { tipo: 'verter', texto: 'Vierte la mezcla en el molde', ingrediente: 'masa' },
    { tipo: 'fuego', texto: 'Hornea', tiempo: 10 },
  ] },
  { id: 'avena_manzana', nombre: 'Avena con manzana', ingredientes: ['avena', 'manzana_ing', 'canela'], resultado: 'avena_manzana', pasos: [
    { tipo: 'cortar', texto: 'Corta la manzana', ingrediente: 'manzana_ing', n: 4 },
    { tipo: 'fuego', texto: 'Cocina la avena a fuego suave', tiempo: 8 },
    { tipo: 'mezclar', texto: 'Revuelve con canela', n: 4 },
  ] },
];

const porId = new Map(ITEMS.map((i) => [i.id, i]));
export const item = (id: string): Item | undefined => porId.get(id);
export const itemsDe = (categoria: CategoriaItem) => ITEMS.filter((i) => i.categoria === categoria);

/** Ropa y muebles rotan: cada semana se ve ~la mitad del catálogo. Los de temporada solo en su evento. */
export function disponibleEstaSemana(i: Item, temporadaActiva: Temporada | null): boolean {
  if (i.temporada) return i.temporada === temporadaActiva;
  if (i.categoria !== 'ropa' && i.categoria !== 'mueble' && i.categoria !== 'pared' && i.categoria !== 'suelo') return true;
  let h = semana();
  for (const c of i.id) h = (Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0);
  return h % 5 !== 0;
}

export const PESO_RAREZA: Record<1 | 2 | 3 | 4, number> = { 1: 60, 2: 27, 3: 10, 4: 3 };
export const ESTRELLAS: Record<1 | 2 | 3 | 4, string> = { 1: 'Común', 2: 'Poco común', 3: 'Raro', 4: 'Legendario' };
