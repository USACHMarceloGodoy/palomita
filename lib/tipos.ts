export type Emoji = 'fatal' | 'mal' | 'normal' | 'bien' | 'genial';
export const EMOJIS: Emoji[] = ['fatal', 'mal', 'normal', 'bien', 'genial'];

export type TipoMensaje = 'nota' | 'poema' | 'extracto';

export type Mensaje = {
  id: string;
  texto: string;
  tipo: TipoMensaje;
  fecha_publicacion: string | null;
  visto_en: string | null;
  creado_en: string;
};

export type Recuerdo = {
  id: string;
  foto_path: string;
  thumb_path: string | null;
  texto: string;
  fecha: string | null;
  lugar: string | null;
  audio_path: string | null;
  tags: string[];
};

export type Checkin = {
  id: string;
  fecha: string;
  emoji: Emoji;
  texto: string | null;
  respondido: boolean;
  creado_en: string;
};

export type CategoriaBotiquin = 'animos' | 'feliz' | 'logro' | 'extrano';

export type ItemBotiquin = {
  id: string;
  categoria: CategoriaBotiquin;
  tipo: 'texto' | 'audio' | 'video';
  texto: string | null;
  media_path: string | null;
};

export type Variante = {
  id: string;
  texto: string;
  categoria: string;
  descubierto_en: string | null;
};

export type Cuento = {
  id: string;
  titulo: string;
  audio_path: string;
  duracion_seg: number | null;
  serie: string | null;       // null = cuento suelto
  numero: number | null;      // orden del capítulo dentro de la serie
  escuchado_en: string | null;
};

export type Cupon = {
  id: string;
  titulo: string;
  descripcion: string | null;
  costo: number;
  comprado_en: string | null;
  usado_en: string | null;
  qr_token: string;
};

export type Config = {
  nombre_ella: string;
  fecha_inicio: string;
  hora_mensaje: string;
};

export type Pregunta = { id: string; pregunta: string; opciones: string[]; correcta: number };
export type Premio = { id: string; titulo: string; descripcion: string | null; peso: number; activo: boolean };
export type Rareza = 'comun' | 'raro' | 'epico';
export type Sticker = { id: string; coleccion: string; nombre: string; rareza: Rareza; img_path: string };
export type ItemAlbum = { id: string; sticker_id: string; obtenido_en: string };
export type Entrada = { id: string; palabra: string; definicion: string; ejemplo: string | null };
export type Capitulo = { id: string; numero: number; titulo: string; texto: string; publica_en: string; leido_en: string | null };
export type Capsula = { id: string; titulo: string; contenido: string | null; media_path: string | null; abre_en: string; abierta: boolean };
export type Lugar = { id: string; titulo: string; lat: number; lng: number; radio_m: number; recuerdo_id: string | null; desbloqueado_en: string | null };
export type EntidadGranja = { id?: string; entidad: string; tipo: 'animal' | 'planta'; ultima_interaccion: string | null; nivel_crecimiento: number };
export type EstadoMascota = { animo: number; ultima_comida: string | null; ultimo_contenido: string | null };
