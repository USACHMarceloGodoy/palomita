// Registro del token de Expo Push y canales de Android.
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { supabase, supabaseConfigurado } from './supabase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export type DiagnosticoPush = {
  paso: string;              // dónde se quedó
  ok: boolean;
  detalle: string;
};

/**
 * Lo mismo que registrarPush pero contando en voz alta dónde falla. El
 * registro normal se traga los errores (no queremos que la app reviente por
 * una notificación), así que sin esto un token que nunca se guarda es
 * invisible. Se usa desde el Modo autor.
 */
export async function diagnosticoPush(): Promise<DiagnosticoPush> {
  try {
    if (!Device.isDevice) return { paso: 'dispositivo', ok: false, detalle: 'Esto es un emulador: el push solo funciona en un teléfono de verdad.' };

    const { status: actual } = await Notifications.getPermissionsAsync();
    let status = actual;
    if (status !== 'granted') ({ status } = await Notifications.requestPermissionsAsync());
    if (status !== 'granted') {
      return { paso: 'permiso', ok: false, detalle: `Permiso de notificaciones: ${status}. Actívalo en Ajustes → Apps → Palomita → Notificaciones.` };
    }

    const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
    if (!projectId || projectId.startsWith('<')) {
      return { paso: 'projectId', ok: false, detalle: 'No encuentro el projectId de EAS en la configuración de la app.' };
    }

    let token: string;
    try {
      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      // El caso típico: falta google-services.json / credenciales FCM y hay
      // que recompilar el APK. Por OTA no se arregla.
      return { paso: 'token', ok: false, detalle: `No pude obtener el token: ${msg}` };
    }

    if (!supabaseConfigurado) return { paso: 'supabase', ok: false, detalle: 'La app está en modo demo, sin Supabase.' };
    const { data } = await supabase.auth.getUser();
    if (!data.user) return { paso: 'sesion', ok: false, detalle: 'No hay sesión iniciada.' };

    const { error } = await supabase.from('usuarios').update({ push_token: token }).eq('id', data.user.id);
    if (error) return { paso: 'guardar', ok: false, detalle: `No pude guardarlo: ${error.message}` };

    return { paso: 'listo', ok: true, detalle: `Token guardado: ${token.slice(0, 30)}…` };
  } catch (e) {
    return { paso: 'inesperado', ok: false, detalle: e instanceof Error ? e.message : String(e) };
  }
}

export async function registrarPush(): Promise<string | null> {
  if (!Device.isDevice) return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Palomita',
      importance: Notifications.AndroidImportance.DEFAULT,
      lightColor: '#FF6F91',
    });
    await Notifications.setNotificationChannelAsync('urgente', {
      name: 'Te necesito ahora',
      importance: Notifications.AndroidImportance.MAX,
      sound: 'default',
      vibrationPattern: [0, 400, 200, 400],
      lightColor: '#D6336C',
    });
  }

  const { status: actual } = await Notifications.getPermissionsAsync();
  let status = actual;
  if (status !== 'granted') {
    ({ status } = await Notifications.requestPermissionsAsync());
  }
  if (status !== 'granted') return null;

  const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
  if (!projectId || projectId.startsWith('<')) return null;

  const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;

  if (supabaseConfigurado) {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      await supabase.from('usuarios').update({ push_token: token }).eq('id', data.user.id);
    }
  }
  return token;
}
