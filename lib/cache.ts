// Caché offline muy simple: lo último que se leyó de Supabase queda en
// AsyncStorage y se muestra mientras no haya señal.
import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIJO = 'palomita:cache:';

export async function leerCache<T>(clave: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(PREFIJO + clave);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export async function guardarCache<T>(clave: string, valor: T) {
  try {
    await AsyncStorage.setItem(PREFIJO + clave, JSON.stringify(valor));
  } catch {
    // sin espacio o sin permiso: no importa, es caché
  }
}

/** Intenta la red; si falla, devuelve la caché. Si la red responde, la actualiza. */
export async function conCache<T>(clave: string, cargar: () => Promise<T>): Promise<T | null> {
  try {
    const v = await cargar();
    await guardarCache(clave, v);
    return v;
  } catch {
    return leerCache<T>(clave);
  }
}
