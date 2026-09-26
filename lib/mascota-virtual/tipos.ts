// Tipos del sistema de mascota virtual (documento "Sistema de Mascota Virtual").
// Todo lo que la persona puede elegir es un id de variante + colores: nunca una imagen.
import type { Rol } from '../sesion';

export type Especie = 'paloma' | 'gato' | 'perro' | 'oso' | 'cerdito' | 'raton' | 'vaca';
export type Orejas = 'puntiagudas' | 'caidas' | 'redondas' | 'grandes' | 'laterales' | 'cresta';
export type Hocico = 'chico' | 'trufa' | 'chancho' | 'pico' | 'ancho';
export type Ojos = 'redondos' | 'grandes' | 'puntitos' | 'felices' | 'somnolientos' | 'brillantes';
/** Con hocico 'pico' la boca no se dibuja: el pico ya es la boca. */
export type Boca = 'sonrisa' | 'gatuna' | 'chica' | 'lengua' | 'abierta' | 'ninguna';

export const ESPECIES: { id: Especie; nombre: string; orejas: Orejas; hocico: Hocico; c1: string; c2: string }[] = [
  { id: 'paloma', nombre: 'Paloma', orejas: 'cresta', hocico: 'pico', c1: '#F3F0F6', c2: '#D9D3E0' },
  { id: 'gato', nombre: 'Gato', orejas: 'puntiagudas', hocico: 'chico', c1: '#FFB6D5', c2: '#FFDDEB' },
  { id: 'perro', nombre: 'Perro', orejas: 'caidas', hocico: 'trufa', c1: '#C8ECD9', c2: '#FFFFFF' },
  { id: 'oso', nombre: 'Oso', orejas: 'redondas', hocico: 'ancho', c1: '#C9A66B', c2: '#F3E4C8' },
  { id: 'cerdito', nombre: 'Cerdito', orejas: 'laterales', hocico: 'chancho', c1: '#FFF3C4', c2: '#FFB6D5' },
  { id: 'raton', nombre: 'Ratón', orejas: 'grandes', hocico: 'chico', c1: '#E9E9EE', c2: '#FFD6E4' },
  { id: 'vaca', nombre: 'Vaca', orejas: 'laterales', hocico: 'ancho', c1: '#FFFFFF', c2: '#3D3A42' },
];

export const OREJAS: { id: Orejas; nombre: string }[] = [
  { id: 'puntiagudas', nombre: 'Puntiagudas' },
  { id: 'caidas', nombre: 'Caídas' },
  { id: 'redondas', nombre: 'Redondas' },
  { id: 'grandes', nombre: 'Grandes' },
  { id: 'laterales', nombre: 'Laterales' },
  { id: 'cresta', nombre: 'Cresta' },
];

export const HOCICOS: { id: Hocico; nombre: string }[] = [
  { id: 'chico', nombre: 'Chico' },
  { id: 'trufa', nombre: 'Trufa' },
  { id: 'chancho', nombre: 'Chancho' },
  { id: 'pico', nombre: 'Pico' },
  { id: 'ancho', nombre: 'Ancho' },
];

export const OJOS: { id: Ojos; nombre: string }[] = [
  { id: 'redondos', nombre: 'Redondos' },
  { id: 'grandes', nombre: 'Grandes' },
  { id: 'puntitos', nombre: 'Puntitos' },
  { id: 'felices', nombre: 'Felices' },
  { id: 'somnolientos', nombre: 'Somnolientos' },
  { id: 'brillantes', nombre: 'Brillantes' },
];

export const BOCAS: { id: Boca; nombre: string }[] = [
  { id: 'sonrisa', nombre: 'Sonrisa' },
  { id: 'gatuna', nombre: 'Gatuna' },
  { id: 'chica', nombre: 'Chiquita' },
  { id: 'lengua', nombre: 'Con lengua' },
  { id: 'abierta', nombre: 'Abierta' },
  { id: 'ninguna', nombre: 'Sin boca' },
];

// Paleta cerrada de pelaje: pastel, la misma del mockup.
export const PALETA_PELAJE = ['#FFB6D5', '#FFF3C4', '#D8D2FF', '#C8ECD9', '#B98A6A', '#E9E9EE', '#F3F0F6', '#C9A66B', '#FFFFFF', '#BEE7FF'];
export const PALETA_SECUNDARIA = ['#FFDDEB', '#FFFFFF', '#F3E4C8', '#FFD6E4', '#D9D3E0', '#3D3A42', '#FFB6D5', '#6B4A38'];

export type SlotPrenda = 'cabeza' | 'cara' | 'cuello' | 'cuerpo';
export const SLOTS: SlotPrenda[] = ['cabeza', 'cara', 'cuello', 'cuerpo'];

/** Lo equipado: slot → id de ítem del catálogo. */
export type Look = Partial<Record<SlotPrenda, string>>;

export type Decoracion = { pared: string; suelo: string; muebles: string[] };

export type Mascota = {
  rol: Rol;
  especie: Especie;
  orejas: Orejas;
  hocico: Hocico;
  ojos: Ojos;
  boca: Boca;
  color_pelaje: string;
  color_secundario: string;
  nombre: string;
  look: Look;
  decoracion: Decoracion;
  creado_en: string;
  actualizado_en: string;
};

export type Necesidad = 'hambre' | 'higiene' | 'afecto';
export const NECESIDADES: Necesidad[] = ['hambre', 'higiene', 'afecto'];

/** Valor 0-100 en el instante `*_en`; el valor actual se recalcula con el tiempo transcurrido. */
export type Necesidades = {
  rol: Rol;
  hambre: number; hambre_en: string;
  higiene: number; higiene_en: string;
  afecto: number; afecto_en: string;
};

export type CategoriaItem = 'comida' | 'ropa' | 'mueble' | 'pared' | 'suelo' | 'ingrediente' | 'plato' | 'pez' | 'insecto' | 'fosil' | 'arte' | 'cebo' | 'trofeo';
export type CategoriaMuseo = 'pez' | 'insecto' | 'fosil' | 'arte';

export type Item = {
  id: string;
  nombre: string;
  categoria: CategoriaItem;
  precio: number;            // 0 = no se vende en la tienda
  venta: number;             // lo que da venderlo (0 = no se vende)
  dibujo: string;            // clave del dibujo vectorial (IconosMascota o Prendas)
  c1?: string;
  c2?: string;
  slot?: SlotPrenda;         // solo ropa
  efecto?: Partial<Record<Necesidad, number>>;  // comida/platos
  rareza?: 1 | 2 | 3 | 4;    // peces/insectos/fósiles
  temporada?: Temporada;     // solo disponible durante ese evento
  descripcion?: string;
};

export type Receta = { id: string; nombre: string; ingredientes: string[]; resultado: string };

export type ItemInventario = { rol: Rol; item_id: string; cantidad: number; obtenido_en: string };
export type Donacion = { rol: Rol; item_id: string; donado_en: string };
export type Puntaje = { rol: Rol; juego: string; fecha: string; puntaje: number; detalle: Record<string, unknown> };
export type Regalo = { id: string; de_rol: Rol; para_rol: Rol; item_id: string; mensaje: string | null; creado_en: string; recibido_en: string | null };

export type Temporada = 'san_valentin' | 'pascua' | 'dieciocho' | 'halloween' | 'navidad';
export type Estacion = 'verano' | 'otono' | 'invierno' | 'primavera';
export type MomentoDia = 'amanecer' | 'dia' | 'atardecer' | 'noche';
