// Contenido de muestra para Fase 2 y 3 en modo demo (sin Supabase).
import type { Capitulo, Capsula, Entrada, Lugar, Premio, Pregunta, Sticker } from './tipos';

export const triviaMock: Pregunta[] = [
  { id: 't1', pregunta: '¿Dónde fue nuestra primera cita?', opciones: ['Providencia', 'Ñuñoa', 'Valparaíso', 'Maipú'], correcta: 0 },
  { id: 't2', pregunta: '¿Qué comemos cuando no sabemos qué comer?', opciones: ['Sushi', 'Pizza', 'Completos', 'Ramen'], correcta: 1 },
  { id: 't3', pregunta: '¿Cuál fue la primera serie que vimos juntos?', opciones: ['Una de zombis', 'Una de física', 'Un drama coreano', 'Ninguna, siempre discutimos'], correcta: 2 },
  { id: 't4', pregunta: '¿Qué animal te gusta más?', opciones: ['Capibara', 'Zuricata', 'Oveja', 'Gato'], correcta: 0 },
  { id: 't5', pregunta: '¿Cuántos besitos da el check-in?', opciones: ['5', '10', '15', '20'], correcta: 1 },
];

export const ruletaMock: Premio[] = [
  { id: 'p1', titulo: 'Noche de películas', descripcion: 'Tú eliges, yo no me quejo del género.', peso: 3, activo: true },
  { id: 'p2', titulo: 'Desayuno a la cama', descripcion: 'Un sábado, tú eliges cuál.', peso: 2, activo: true },
  { id: 'p3', titulo: 'Picnic', descripcion: 'Aunque sea en el living si llueve.', peso: 2, activo: true },
  { id: 'p4', titulo: 'Tarde de juegos de mesa', descripcion: 'Puedes hacer trampa una vez.', peso: 3, activo: true },
  { id: 'p5', titulo: 'Cita de helado', descripcion: 'Doble sabor, sin excusas.', peso: 3, activo: true },
  { id: 'p6', titulo: 'Maratón de dramas', descripcion: 'Con snacks y sin interrupciones.', peso: 2, activo: true },
];

export const stickersMock: Sticker[] = [
  { id: 's1', coleccion: 'Flores', nombre: 'Flor rosa', rareza: 'comun', img_path: 'figura:flor:#FF6F91:#FFD93D' },
  { id: 's2', coleccion: 'Flores', nombre: 'Rosa', rareza: 'raro', img_path: 'figura:rosa:#D6336C:#FFB3C6' },
  { id: 's3', coleccion: 'Flores', nombre: 'Girasol', rareza: 'raro', img_path: 'figura:girasol:#FFD93D:#6B4A2A' },
  { id: 's4', coleccion: 'Bichitos', nombre: 'Gatito', rareza: 'comun', img_path: 'figura:gatito' },
  { id: 's5', coleccion: 'Bichitos', nombre: 'Capibara', rareza: 'raro', img_path: 'figura:capibara' },
  { id: 's6', coleccion: 'Bichitos', nombre: 'Zuricata', rareza: 'raro', img_path: 'figura:zuricata' },
  { id: 's7', coleccion: 'Bichitos', nombre: 'Oveja', rareza: 'comun', img_path: 'figura:oveja' },
  { id: 's8', coleccion: 'Comida', nombre: 'Frutilla', rareza: 'comun', img_path: 'figura:frutilla' },
  { id: 's9', coleccion: 'Comida', nombre: 'Hamburguesita', rareza: 'comun', img_path: 'figura:hamburguesa' },
  { id: 's10', coleccion: 'Kawaii', nombre: 'Lazo', rareza: 'comun', img_path: 'figura:lazo:#FF6F91:#D6336C' },
  { id: 's11', coleccion: 'Kawaii', nombre: 'Corazón dorado', rareza: 'epico', img_path: 'figura:corazon:#FFD93D:#FFD93D' },
  { id: 's12', coleccion: 'Chile', nombre: 'Volantín', rareza: 'comun', img_path: 'figura:volantin:#FFD93D:#D6336C' },
];

export const diccionarioMock: Entrada[] = [
  { id: 'd1', palabra: 'Palomita', definicion: 's. f. 1. Mascota de esta app. 2. Forma de decir "te estoy pensando" sin decirlo.', ejemplo: '"Te dejé una palomita en el celular."' },
  { id: 'd2', palabra: 'Besito', definicion: 's. m. Unidad monetaria de curso legal solo dentro de esta app. No convertible a pesos, sí a abrazos.', ejemplo: '"Me faltan 20 besitos para el cupón."' },
];

export const capitulosMock: Capitulo[] = [
  { id: 'k1', numero: 1, titulo: 'Capítulo 1: El encuentro casual', texto: 'Ella entró al café con el paraguas rojo goteando. Él, que llevaba veinte minutos fingiendo leer, cerró el libro demasiado rápido...\n\n(continuará)', publica_en: '2026-09-01T00:00:00Z', leido_en: null },
];

export const capsulasMock: Capsula[] = [
  { id: 'c1', titulo: 'Para cuando cumplamos un año', contenido: null, media_path: null, abre_en: '2027-03-15T12:00:00-03:00', abierta: false },
  { id: 'c2', titulo: 'Léeme cuando tengas un mal día', contenido: 'Si abriste esto, hoy no fue fácil. Está bien. Yo estoy acá igual.', media_path: null, abre_en: '2026-09-01T12:00:00-03:00', abierta: false },
];

export const lugaresMock: Lugar[] = [
  { id: 'l1', titulo: 'Donde nos conocimos', lat: -33.4372, lng: -70.6506, radio_m: 150, recuerdo_id: null, desbloqueado_en: null },
  { id: 'l2', titulo: 'La primera cita', lat: -33.4262, lng: -70.6152, radio_m: 150, recuerdo_id: 'r1', desbloqueado_en: null },
];
