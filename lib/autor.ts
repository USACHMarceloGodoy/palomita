// Modo autor: todo lo que tú puedes escribir desde tu propio teléfono.
// Es el panel de escritorio en chiquito, para lo que se hace a diario:
// dejarle una nota, programar el mensaje del día, sumar un ánimo al botiquín
// y ver cómo estuvo ella. Las RLS ya filtran: estas funciones solo corren
// bien si la sesión es la del autor.
import { supabase } from './supabase';
import type { Rol } from './sesion';
import type { CategoriaBotiquin, Checkin, Mensaje, TipoMensaje } from './tipos';

export type Nota = {
  id: string;
  texto: string | null;
  dibujo_path: string | null;
  autor_rol: Rol;
  creado_en: string;
  visto_en: string | null;
};

// ---------------------------------------------------------------------------
// Notas del día (texto y/o dibujo)
// ---------------------------------------------------------------------------
export async function notas(limite = 30): Promise<Nota[]> {
  const { data, error } = await supabase
    .from('notas')
    .select('*')
    .order('creado_en', { ascending: false })
    .limit(limite);
  if (error) throw error;
  return (data ?? []) as Nota[];
}

/**
 * La última nota que te dejó el otro, la hayas visto o no. Se queda fija en
 * Inicio, arriba del mensaje del día: no desaparece al abrirla, solo la pisa
 * la siguiente que llegue.
 */
export async function ultimaNota(miRol: Rol): Promise<Nota | null> {
  const { data } = await supabase
    .from('notas')
    .select('*')
    .neq('autor_rol', miRol)
    .order('creado_en', { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as Nota) ?? null;
}

/** Todas las notas del hilo, de los dos, para el buzón. */
export async function hiloDeNotas(limite = 40): Promise<Nota[]> {
  const { data } = await supabase
    .from('notas')
    .select('*')
    .order('creado_en', { ascending: false })
    .limit(limite);
  return (data ?? []) as Nota[];
}

export async function marcarNotaVista(id: string) {
  await supabase.from('notas').update({ visto_en: new Date().toISOString() }).eq('id', id).is('visto_en', null);
}

export async function crearNota(rol: Rol, texto: string, dibujoSvg?: string | null): Promise<void> {
  const limpio = texto.trim();
  let dibujo_path: string | null = null;
  if (dibujoSvg) dibujo_path = await subirDibujo(dibujoSvg);
  if (!limpio && !dibujo_path) throw new Error('La nota está vacía');
  const { error } = await supabase.from('notas').insert({ texto: limpio || null, dibujo_path, autor_rol: rol });
  if (error) throw error;
}

export async function borrarNota(id: string) {
  const { error } = await supabase.from('notas').delete().eq('id', id);
  if (error) throw error;
}

/**
 * Sube el dibujo como SVG al bucket privado `media`. Va como texto plano, sin
 * pasar por base64 ni por el sistema de archivos: un SVG de trazos pesa pocos
 * kilobytes y el cliente de Supabase acepta un string directo.
 */
async function subirDibujo(svg: string): Promise<string> {
  const nombre = `notas/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.svg`;
  const { error } = await supabase.storage
    .from('media')
    .upload(nombre, svg, { contentType: 'image/svg+xml', upsert: false });
  if (error) throw error;
  return nombre;
}

/** Descarga el SVG de una nota para pintarlo con react-native-svg. */
export async function leerDibujo(path: string): Promise<string | null> {
  const { data, error } = await supabase.storage.from('media').download(path);
  if (error || !data) return null;
  return await new Response(data).text();
}

// ---------------------------------------------------------------------------
// Mensaje del día y base de mensajes
// ---------------------------------------------------------------------------
/**
 * Escribe un mensaje. Con `fecha` sale ese día concreto (y dispara el push de
 * las 09:00); sin fecha entra a la base rotativa de la que Inicio saca uno
 * cualquiera cuando no hay nada programado.
 */
export async function crearMensaje(texto: string, tipo: TipoMensaje, fecha?: string | null) {
  const limpio = texto.trim();
  if (!limpio) throw new Error('El mensaje está vacío');
  const { error } = await supabase.from('mensajes').insert({
    texto: limpio,
    tipo,
    fecha_publicacion: fecha ? `${fecha}T09:00:00-03:00` : null,
  });
  if (error) throw error;
}

/** Los próximos mensajes con fecha, para no escribir dos veces el mismo día. */
export async function mensajesProgramados(): Promise<Mensaje[]> {
  const { data } = await supabase
    .from('mensajes')
    .select('*')
    .not('fecha_publicacion', 'is', null)
    .gte('fecha_publicacion', new Date().toISOString())
    .order('fecha_publicacion')
    .limit(20);
  return (data ?? []) as Mensaje[];
}

// ---------------------------------------------------------------------------
// Botiquín: los cuatro botones de "Ayuda"
// ---------------------------------------------------------------------------
export async function crearAnimo(categoria: CategoriaBotiquin, texto: string) {
  const limpio = texto.trim();
  if (!limpio) throw new Error('El texto está vacío');
  const { error } = await supabase.from('botiquin').insert({ categoria, tipo: 'texto', texto: limpio });
  if (error) throw error;
}

/** Cuántas cosas hay en cada categoría del botiquín, para saber qué falta. */
export async function inventarioBotiquin(): Promise<Record<string, number>> {
  const { data } = await supabase.from('botiquin').select('categoria');
  const out: Record<string, number> = { animos: 0, feliz: 0, logro: 0, extrano: 0 };
  for (const r of data ?? []) out[(r as { categoria: string }).categoria] = (out[(r as { categoria: string }).categoria] ?? 0) + 1;
  return out;
}

// ---------------------------------------------------------------------------
// Cómo está ella
// ---------------------------------------------------------------------------
export async function ultimosCheckins(limite = 14): Promise<Checkin[]> {
  const { data } = await supabase
    .from('checkins')
    .select('*')
    .order('fecha', { ascending: false })
    .limit(limite);
  return (data ?? []) as Checkin[];
}

export type Alerta = { id: string; tipo: string; creado_en: string };

export async function ultimasAlertas(limite = 5): Promise<Alerta[]> {
  const { data } = await supabase
    .from('alertas')
    .select('*')
    .order('creado_en', { ascending: false })
    .limit(limite);
  return (data ?? []) as Alerta[];
}

/** Saldo de besitos de ella, por curiosidad tuya. */
export async function saldoDeElla(): Promise<number> {
  const { data } = await supabase.from('saldo_besitos').select('saldo').maybeSingle();
  return (data as { saldo: number } | null)?.saldo ?? 0;
}

// ---------------------------------------------------------------------------
// El panel completo, desde el teléfono
// ---------------------------------------------------------------------------

/** Sube un archivo del teléfono al bucket privado `media`. */
export async function subirArchivo(uri: string, nombre: string, contentType: string, carpeta: string): Promise<string> {
  const limpio = nombre.replace(/[^\w.\-]/g, '_');
  const destino = `${carpeta}/${Date.now()}-${limpio}`;
  // fetch sobre un file:// local devuelve el binario; así no hace falta
  // pasar por base64 ni por el sistema de archivos.
  const bytes = await (await fetch(uri)).arrayBuffer();
  const { error } = await supabase.storage.from('media').upload(destino, bytes, { contentType, upsert: false });
  if (error) throw error;
  return destino;
}

export async function crearVariante(texto: string, categoria: string) {
  const { error } = await supabase.from('multiverso').insert({ texto: texto.trim(), categoria: categoria || 'general' });
  if (error) throw error;
}

export async function crearPregunta(pregunta: string, opciones: string[], correcta: number) {
  const { error } = await supabase.from('trivia').insert({ pregunta: pregunta.trim(), opciones, correcta });
  if (error) throw error;
}

export async function crearPalabra(palabra: string, definicion: string, ejemplo: string | null) {
  const { error } = await supabase.from('diccionario').insert({
    palabra: palabra.trim(), definicion: definicion.trim(), ejemplo: ejemplo?.trim() || null,
  });
  if (error) throw error;
}

export async function crearCapitulo(numero: number, titulo: string, texto: string, publicaEn: string) {
  const { error } = await supabase.from('capitulos').insert({
    numero, titulo: titulo.trim(), texto: texto.trim(), publica_en: `${publicaEn}T09:00:00-03:00`,
  });
  if (error) throw error;
}

export async function crearCapsula(titulo: string, contenido: string, abreEn: string, mediaPath: string | null) {
  const { error } = await supabase.from('capsulas').insert({
    titulo: titulo.trim(), contenido: contenido.trim() || null, media_path: mediaPath, abre_en: `${abreEn}T09:00:00-03:00`,
  });
  if (error) throw error;
}

export async function crearCupon(titulo: string, descripcion: string, costo: number) {
  const { error } = await supabase.from('cupones').insert({
    titulo: titulo.trim(), descripcion: descripcion.trim() || null, costo,
  });
  if (error) throw error;
}

export async function crearPremioRuleta(titulo: string, descripcion: string, peso: number) {
  const { error } = await supabase.from('ruleta').insert({
    titulo: titulo.trim(), descripcion: descripcion.trim() || null, peso, activo: true,
  });
  if (error) throw error;
}

export async function crearEvento(fecha: string, tipoParticula: string, mensaje: string, mensajeDia: string, recurrente: boolean) {
  const { error } = await supabase.from('eventos').insert({
    fecha, tipo_particula: tipoParticula, mensaje: mensaje.trim() || null,
    mensaje_dia: mensajeDia.trim() || null, recurrente,
  });
  if (error) throw error;
}

export async function crearRecuerdo(fotoPath: string, texto: string, fecha: string, lugar: string, inedito: boolean) {
  const { error } = await supabase.from('recuerdos').insert({
    foto_path: fotoPath, texto: texto.trim(), fecha: fecha || null, lugar: lugar.trim() || null, inedito,
  });
  if (error) throw error;
}

export async function crearAnimoAudio(categoria: CategoriaBotiquin, mediaPath: string, inedito: boolean) {
  const { error } = await supabase.from('botiquin').insert({
    categoria, tipo: 'audio', media_path: mediaPath, inedito,
  });
  if (error) throw error;
}

export async function crearCuento(titulo: string, audioPath: string, serie: string | null, numero: number | null) {
  const { error } = await supabase.from('cuentos').insert({
    titulo: titulo.trim(), audio_path: audioPath, serie: serie?.trim() || null,
    numero: serie?.trim() ? numero ?? 1 : null,
  });
  if (error) throw error;
}

export async function crearLugar(titulo: string, lat: number, lng: number, radio: number) {
  const { error } = await supabase.from('lugares').insert({ titulo: titulo.trim(), lat, lng, radio_m: radio });
  if (error) throw error;
}

export async function crearRespuestaCheckin(emoji: string, texto: string) {
  const { error } = await supabase.from('respuestas_checkin').insert({ emoji, texto: texto.trim() });
  if (error) throw error;
}

/** Cuántas filas hay en cada tabla, para ver de un vistazo qué falta llenar. */
export async function inventario(): Promise<Record<string, number>> {
  const tablas = ['mensajes', 'recuerdos', 'botiquin', 'multiverso', 'capsulas', 'lugares', 'trivia', 'cupones', 'ruleta', 'diccionario', 'capitulos', 'cuentos', 'eventos', 'notas'];
  const out: Record<string, number> = {};
  await Promise.all(tablas.map(async (t) => {
    const { count } = await supabase.from(t).select('id', { count: 'exact', head: true });
    out[t] = count ?? 0;
  }));
  return out;
}
