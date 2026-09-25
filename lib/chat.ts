// El chat: leer, escribir y escuchar mensajes nuevos. Todo lo que sale de acá
// va cifrado (ver lib/cripto.ts); lo que llega se descifra en el momento de
// mostrarlo. Un mensaje puede traer texto, un sticker, o los dos.
import { supabase } from './supabase';
import { cifrar, descifrar, frasesCoinciden, TESTIGO } from './cripto';
import type { Rol } from './sesion';

export type MensajeChat = {
  id: string;
  autor_rol: Rol;
  creado_en: string;
  leido_en: string | null;
  texto: string | null;
  sticker_id: string | null;
  /** true cuando la clave de este teléfono no puede abrirlo. */
  ilegible: boolean;
};

type Fila = { id: string; autor_rol: Rol; cifrado: string; creado_en: string; leido_en: string | null };

function abrir(f: Fila, clave: Uint8Array): MensajeChat {
  const plano = descifrar(f.cifrado, clave);
  if (plano === null) {
    return { id: f.id, autor_rol: f.autor_rol, creado_en: f.creado_en, leido_en: f.leido_en, texto: null, sticker_id: null, ilegible: true };
  }
  let texto: string | null = null;
  let sticker_id: string | null = null;
  try {
    const cuerpo = JSON.parse(plano) as { t?: string | null; s?: string | null };
    texto = cuerpo.t?.trim() || null;
    sticker_id = cuerpo.s || null;
  } catch {
    texto = plano; // por si alguna vez se guardó texto suelto
  }
  return { id: f.id, autor_rol: f.autor_rol, creado_en: f.creado_en, leido_en: f.leido_en, texto, sticker_id, ilegible: false };
}

export async function historial(clave: Uint8Array, limite = 200): Promise<MensajeChat[]> {
  const { data, error } = await supabase
    .from('mensajes_chat')
    .select('*')
    .order('creado_en', { ascending: false })
    .limit(limite);
  if (error) throw error;
  return ((data ?? []) as Fila[]).reverse().map((f) => abrir(f, clave));
}

export async function enviar(clave: Uint8Array, rol: Rol, texto: string, stickerId?: string | null) {
  const limpio = texto.trim();
  if (!limpio && !stickerId) return;
  const cuerpo = JSON.stringify({ t: limpio || null, s: stickerId ?? null });
  const { error } = await supabase.from('mensajes_chat').insert({ autor_rol: rol, cifrado: cifrar(cuerpo, clave) });
  if (error) throw error;
}

export async function marcarLeidos(ids: string[]) {
  if (!ids.length) return;
  await supabase.from('mensajes_chat').update({ leido_en: new Date().toISOString() }).in('id', ids).is('leido_en', null);
}

/** Cuántos mensajes suyos quedan sin leer (para el globito de la pestaña). */
export async function sinLeer(rol: Rol): Promise<number> {
  const otro: Rol = rol === 'ella' ? 'autor' : 'ella';
  const { count } = await supabase
    .from('mensajes_chat')
    .select('id', { count: 'exact', head: true })
    .eq('autor_rol', otro)
    .is('leido_en', null);
  return count ?? 0;
}

/**
 * Escucha mensajes nuevos en vivo. Devuelve la función para cortar la
 * suscripción, que hay que llamar al salir de la pantalla.
 */
export function escuchar(clave: Uint8Array, alLlegar: (m: MensajeChat) => void): () => void {
  const canal = supabase
    .channel('chat')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mensajes_chat' }, (payload) => {
      alLlegar(abrir(payload.new as Fila, clave));
    })
    .subscribe();
  return () => { supabase.removeChannel(canal); };
}

// ---------------------------------------------------------------------------
// Testigo: comprobar que los dos escribieron la misma frase
// ---------------------------------------------------------------------------
export async function leerTestigo(): Promise<string | null> {
  const { data } = await supabase.from('config').select('valor').eq('clave', 'chat_testigo').maybeSingle();
  const v = (data as { valor: unknown } | null)?.valor;
  return typeof v === 'string' ? v : null;
}

export async function crearTestigo(clave: Uint8Array) {
  const valor = cifrar(TESTIGO, clave);
  await supabase.from('config').upsert({ clave: 'chat_testigo', valor }, { onConflict: 'clave' });
}

/**
 * Comprueba la frase contra el testigo que ya exista. Si no hay ninguno, esta
 * es la primera vez que se configura el chat: se crea con esta frase y queda
 * como la buena.
 */
export async function validarFrase(clave: Uint8Array): Promise<'ok' | 'no-coincide'> {
  const testigo = await leerTestigo();
  if (!testigo) {
    await crearTestigo(clave);
    return 'ok';
  }
  return frasesCoinciden(testigo, clave) ? 'ok' : 'no-coincide';
}
