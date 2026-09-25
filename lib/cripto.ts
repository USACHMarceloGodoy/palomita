// Cifrado de extremo a extremo del chat.
//
// Cómo funciona: ustedes dos escriben la misma frase secreta, una vez, en su
// propio teléfono. De esa frase se deriva una clave de 32 bytes que se guarda
// en SecureStore (el llavero del sistema) y nunca sale del aparato. Cada
// mensaje se cifra acá con XSalsa20-Poly1305 (nacl.secretbox) antes de salir:
// a Supabase solo llega un bloque de bytes ilegible. Ni desde el dashboard se
// puede leer la conversación.
//
// Dos decisiones que conviene tener anotadas:
//
// 1. Todo es JavaScript puro (tweetnacl). Nada de módulos nativos, así que
//    estos cambios viajan por `eas update` sin recompilar el APK.
//
// 2. Sin módulo nativo no hay una fuente de azar del sistema, así que el nonce
//    de cada mensaje no se saca de un generador aleatorio: se deriva hasheando
//    la clave secreta junto con el reloj, un contador y algo de azar débil. Un
//    atacante no puede predecirlo (no conoce la clave) y el reloj + contador
//    garantizan que no se repita, que es lo que un nonce necesita.
import nacl from 'tweetnacl';
import * as SecureStore from 'expo-secure-store';

const LLAVERO = 'palomita.chat.clave';
const SAL = 'palomita·chat·v1';
const ITERACIONES = 50_000;
/** Texto conocido que sirve para comprobar que los dos escribieron la misma frase. */
export const TESTIGO = 'palomita';

// ---------------------------------------------------------------------------
// Bytes <-> texto. A mano para no depender de TextEncoder ni de Buffer, que en
// Hermes no siempre están.
// ---------------------------------------------------------------------------
function aUtf8(s: string): Uint8Array {
  const out: number[] = [];
  for (const car of s) {
    let c = car.codePointAt(0)!;
    if (c < 0x80) out.push(c);
    else if (c < 0x800) out.push(0xc0 | (c >> 6), 0x80 | (c & 63));
    else if (c < 0x10000) out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
    else out.push(0xf0 | (c >> 18), 0x80 | ((c >> 12) & 63), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
  }
  return Uint8Array.from(out);
}

function deUtf8(b: Uint8Array): string {
  let s = '';
  for (let i = 0; i < b.length;) {
    const c = b[i];
    if (c < 0x80) { s += String.fromCodePoint(c); i += 1; }
    else if (c < 0xe0) { s += String.fromCodePoint(((c & 31) << 6) | (b[i + 1] & 63)); i += 2; }
    else if (c < 0xf0) { s += String.fromCodePoint(((c & 15) << 12) | ((b[i + 1] & 63) << 6) | (b[i + 2] & 63)); i += 3; }
    else { s += String.fromCodePoint(((c & 7) << 18) | ((b[i + 1] & 63) << 12) | ((b[i + 2] & 63) << 6) | (b[i + 3] & 63)); i += 4; }
  }
  return s;
}

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function aBase64(b: Uint8Array): string {
  let s = '';
  for (let i = 0; i < b.length; i += 3) {
    const n = (b[i] << 16) | ((b[i + 1] ?? 0) << 8) | (b[i + 2] ?? 0);
    s += B64[(n >> 18) & 63] + B64[(n >> 12) & 63];
    s += i + 1 < b.length ? B64[(n >> 6) & 63] : '=';
    s += i + 2 < b.length ? B64[n & 63] : '=';
  }
  return s;
}

function deBase64(s: string): Uint8Array {
  const limpio = s.replace(/[^A-Za-z0-9+/]/g, '');
  const out = new Uint8Array(Math.floor((limpio.length * 3) / 4));
  let p = 0;
  for (let i = 0; i < limpio.length; i += 4) {
    const n = (B64.indexOf(limpio[i]) << 18) | (B64.indexOf(limpio[i + 1]) << 12)
      | ((B64.indexOf(limpio[i + 2]) & 63) << 6) | (B64.indexOf(limpio[i + 3]) & 63);
    out[p++] = (n >> 16) & 255;
    if (i + 2 < limpio.length) out[p++] = (n >> 8) & 255;
    if (i + 3 < limpio.length) out[p++] = n & 255;
  }
  return out.slice(0, p);
}

function unir(a: Uint8Array, b: Uint8Array): Uint8Array {
  const out = new Uint8Array(a.length + b.length);
  out.set(a);
  out.set(b, a.length);
  return out;
}

// ---------------------------------------------------------------------------
// Clave
// ---------------------------------------------------------------------------
/**
 * Deriva la clave de la frase estirándola con 50.000 pasadas de SHA-512. La
 * idea es que probar frases a la fuerza bruta salga caro. Tarda alrededor de
 * un segundo y solo se hace al configurar.
 */
export function derivarClave(frase: string): Uint8Array {
  let h = aUtf8(`${SAL}|${frase.normalize('NFKC').trim().toLowerCase()}`);
  for (let i = 0; i < ITERACIONES; i++) h = nacl.hash(h);
  return h.slice(0, nacl.secretbox.keyLength);
}

let contador = 0;

function nonce(clave: Uint8Array): Uint8Array {
  const semilla = aUtf8(`${Date.now()}|${contador++}|${Math.random()}`);
  return nacl.hash(unir(clave, semilla)).slice(0, nacl.secretbox.nonceLength);
}

// ---------------------------------------------------------------------------
// Cifrar y descifrar
// ---------------------------------------------------------------------------
export function cifrar(texto: string, clave: Uint8Array): string {
  const n = nonce(clave);
  const caja = nacl.secretbox(aUtf8(texto), n, clave);
  return aBase64(unir(n, caja));
}

/** Devuelve null si la clave no corresponde o el mensaje viene alterado. */
export function descifrar(paquete: string, clave: Uint8Array): string | null {
  try {
    const todo = deBase64(paquete);
    const n = todo.slice(0, nacl.secretbox.nonceLength);
    const caja = todo.slice(nacl.secretbox.nonceLength);
    const abierto = nacl.secretbox.open(caja, n, clave);
    return abierto ? deUtf8(abierto) : null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Guardar la clave en el llavero del teléfono
// ---------------------------------------------------------------------------
export async function guardarClave(clave: Uint8Array) {
  await SecureStore.setItemAsync(LLAVERO, aBase64(clave));
}

export async function leerClave(): Promise<Uint8Array | null> {
  const v = await SecureStore.getItemAsync(LLAVERO);
  return v ? deBase64(v) : null;
}

export async function olvidarClave() {
  await SecureStore.deleteItemAsync(LLAVERO);
}

/** ¿La frase que escribió coincide con la que se usó para crear el testigo? */
export function frasesCoinciden(testigoCifrado: string, clave: Uint8Array): boolean {
  return descifrar(testigoCifrado, clave) === TESTIGO;
}
