import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { AppState } from 'react-native';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const anon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabaseConfigurado = url.startsWith('https://') && anon.length > 20;

// SecureStore tiene tope de 2 KB por clave; el JWT de Supabase cabe, pero
// se trocea igual por seguridad.
const TROZO = 1800;
const storageSeguro = {
  async getItem(key: string) {
    const n = Number((await SecureStore.getItemAsync(`${key}.n`)) ?? '0');
    if (!n) return null;
    let out = '';
    for (let i = 0; i < n; i++) out += (await SecureStore.getItemAsync(`${key}.${i}`)) ?? '';
    return out;
  },
  async setItem(key: string, value: string) {
    const partes = value.match(new RegExp(`.{1,${TROZO}}`, 'g')) ?? [];
    await SecureStore.setItemAsync(`${key}.n`, String(partes.length));
    await Promise.all(partes.map((p, i) => SecureStore.setItemAsync(`${key}.${i}`, p)));
  },
  async removeItem(key: string) {
    const n = Number((await SecureStore.getItemAsync(`${key}.n`)) ?? '0');
    await SecureStore.deleteItemAsync(`${key}.n`);
    for (let i = 0; i < n; i++) await SecureStore.deleteItemAsync(`${key}.${i}`);
  },
};

export const supabase = createClient(url || 'https://sin-configurar.supabase.co', anon || 'anon', {
  auth: {
    storage: storageSeguro,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

AppState.addEventListener('change', (estado) => {
  if (estado === 'active') supabase.auth.startAutoRefresh();
  else supabase.auth.stopAutoRefresh();
});

/** URL firmada de corta duración para un archivo del bucket privado `media`. */
export async function urlFirmada(path: string | null | undefined, segundos = 60 * 60) {
  if (!path) return null;
  const { data } = await supabase.storage.from('media').createSignedUrl(path, segundos);
  return data?.signedUrl ?? null;
}
