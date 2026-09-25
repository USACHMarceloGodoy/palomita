// Modo autor: todo lo que tú puedes escribir desde tu propio teléfono.
// Es el panel de escritorio en chiquito, para lo que se hace a diario:
// dejarle una nota, programar el mensaje del día, sumar un ánimo al botiquín
// y ver cómo estuvo ella. Las RLS ya filtran: estas funciones solo corren
// bien si la sesión es la del autor.
import { supabase } from './supabase';
import type { CategoriaBotiquin, Checkin, Mensaje, TipoMensaje } from './tipos';

export type Nota = {
  id: string;
  texto: string | null;
  dibujo_path: string | null;
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
 * La nota más reciente, la haya visto o no. Se queda fija en Inicio, arriba
 * del mensaje del día: no desaparece al abrirla, solo la pisa la siguiente.
 */
export async function ultimaNota(): Promise<Nota | null> {
  const { data } = await supabase
    .from('notas')
    .select('*')
    .order('creado_en', { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as Nota) ?? null;
}

export async function marcarNotaVista(id: string) {
  await supabase.from('notas').update({ visto_en: new Date().toISOString() }).eq('id', id).is('visto_en', null);
}

export async function crearNota(texto: string, dibujoSvg?: string | null): Promise<void> {
  const limpio = texto.trim();
  let dibujo_path: string | null = null;
  if (dibujoSvg) dibujo_path = await subirDibujo(dibujoSvg);
  if (!limpio && !dibujo_path) throw new Error('La nota está vacía');
  const { error } = await supabase.from('notas').insert({ texto: limpio || null, dibujo_path });
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
