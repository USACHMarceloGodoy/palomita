// Contenido de muestra para correr la app sin Supabase configurado.
// Reemplázalo con lo tuyo desde el panel; esto nunca llega al APK real si
// EXPO_PUBLIC_SUPABASE_URL está definido.
import type { Cupon, Cuento, ItemBotiquin, Mensaje, Recuerdo, Variante } from './tipos';

export const mensajesMock: Mensaje[] = [
  { id: 'm1', texto: 'Hoy desperté antes que la alarma solo para pensarte un rato con calma, sin apuro y sin que nadie me apurara.', tipo: 'nota', fecha_publicacion: null, visto_en: null, creado_en: '2026-09-01' },
  { id: 'm2', texto: 'No sé qué día tuviste, pero sé cómo termina: conmigo pensando en ti.', tipo: 'nota', fecha_publicacion: null, visto_en: null, creado_en: '2026-09-02' },
  { id: 'm3', texto: 'Si esto fuera un juego, tú serías el tutorial que no me quiero saltar.', tipo: 'nota', fecha_publicacion: null, visto_en: null, creado_en: '2026-09-03' },
];

export const recuerdosMock: Recuerdo[] = [
  { id: 'r1', foto_path: '', thumb_path: null, texto: 'La primera vez que nos quedamos hablando hasta que cerraron el local.', fecha: '2024-03-15', lugar: 'Providencia', audio_path: null, tags: ['primeras veces'] },
  { id: 'r2', foto_path: '', thumb_path: null, texto: 'El día que te enseñé a jugar D&D y terminaste mandando tú.', fecha: '2024-06-02', lugar: 'Mi casa', audio_path: null, tags: ['juegos'] },
  { id: 'r3', foto_path: '', thumb_path: null, texto: 'Ese atardecer que no salió en la foto pero sí en la memoria.', fecha: '2025-01-20', lugar: 'Valparaíso', audio_path: null, tags: ['viajes'] },
];

export const botiquinMock: ItemBotiquin[] = [
  { id: 'b1', categoria: 'animos', tipo: 'texto', texto: 'Respira. Lo que sea que pasó hoy, no te define. Yo te cubro la espalda.', media_path: null },
  { id: 'b2', categoria: 'animos', tipo: 'texto', texto: 'No tienes que poder con todo. Con lo de hoy basta.', media_path: null },
  { id: 'b3', categoria: 'feliz', tipo: 'texto', texto: 'Me encanta cuando estás así. Guárdame un poco para la noche.', media_path: null },
  { id: 'b4', categoria: 'logro', tipo: 'texto', texto: 'Lo lograste. Yo lo sabía desde antes, pero igual me tienes orgulloso.', media_path: null },
  { id: 'b5', categoria: 'extrano', tipo: 'texto', texto: 'Yo también. Más de lo que cabe en esta pantalla.', media_path: null },
];

export const multiversoMock: Variante[] = [
  { id: 'v1', texto: 'Te amo en binario: 01110100 01100101 00100000 01100001 01101101 01101111', categoria: 'código', descubierto_en: null },
  { id: 'v2', texto: 'Te amo como el café ama las siete de la mañana.', categoria: 'comparaciones', descubierto_en: null },
  { id: 'v3', texto: 'while (true) { teAmo(); } — nunca puse la condición de salida.', categoria: 'código', descubierto_en: null },
  { id: 'v4', texto: '사랑해. Lo aprendí viendo tus dramas contigo al lado.', categoria: 'idiomas', descubierto_en: null },
  { id: 'v5', texto: 'Te amo en 8 bits, en HD y en cualquier resolución.', categoria: 'comparaciones', descubierto_en: null },
];

export const cuentosMock: Cuento[] = [
  { id: 'k1', titulo: 'Cuento de muestra (graba el tuyo)', audio_path: '', duracion_seg: null, serie: null, numero: null, escuchado_en: null },
  { id: 'k2', titulo: 'Donde empieza todo', audio_path: '', duracion_seg: null, serie: 'Novela de muestra', numero: 1, escuchado_en: null },
  { id: 'k3', titulo: 'La carta sin abrir', audio_path: '', duracion_seg: null, serie: 'Novela de muestra', numero: 2, escuchado_en: null },
];

export const cuponesMock: Cupon[] = [
  { id: 'c1', titulo: 'Una noche de películas a tu elección', descripcion: 'Sin quejas por el género.', costo: 150, comprado_en: null, usado_en: null, qr_token: 'demo1' },
  { id: 'c2', titulo: 'Desayuno a la cama', descripcion: 'Un sábado, tú eliges cuál.', costo: 150, comprado_en: null, usado_en: null, qr_token: 'demo2' },
];

export const respuestasMock: Record<string, string[]> = {
  fatal: ['Día feo. No tienes que explicarlo ni arreglarlo hoy. Yo me quedo acá mientras pasa.'],
  mal: ['Gracias por contarme igual. Si quieres, esta noche te llamo y no hablamos de nada importante.'],
  normal: ['Los días normales también cuentan. Igual me alegraste el mío con solo abrir esto.'],
  bien: ['Qué bueno. Cuéntame después qué fue lo mejor, quiero el detalle largo.'],
  genial: ['Te leí y me reí solo. Guárdame ese ánimo para el fin de semana.'],
};
