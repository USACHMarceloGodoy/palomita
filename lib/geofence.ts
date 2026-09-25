// Nuestros lugares: cuando pasa cerca de un pin, el teléfono vibra y se desbloquea
// un recuerdo que solo existe ahí. Todo local: no pasa por la nube.
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import { desbloquearLugar, lugares } from './sorpresas';

export const TAREA_GEOFENCE = 'palomita-geofence';

TaskManager.defineTask(TAREA_GEOFENCE, async ({ data, error }: TaskManager.TaskManagerTaskBody<any>) => {
  if (error || !data) return;
  const { eventType, region } = data as { eventType: Location.GeofencingEventType; region: Location.LocationRegion };
  if (eventType !== Location.GeofencingEventType.Enter || !region.identifier) return;
  const lista = await lugares().catch(() => []);
  const lugar = lista.find((l) => l.id === region.identifier);
  if (!lugar || lugar.desbloqueado_en) return;
  await desbloquearLugar(lugar.id).catch(() => {});
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Estás en un lugar nuestro',
      body: `${lugar.titulo}. Hay un recuerdo que solo existe aquí.`,
      data: { tipo: 'lugar', id: lugar.id },
    },
    trigger: null,
  });
});

/** Pide permisos y registra los geofences. Se llama al abrir la app con sesión. */
export async function activarGeofences(): Promise<'ok' | 'sin-permiso' | 'sin-lugares'> {
  const { status: fg } = await Location.requestForegroundPermissionsAsync();
  if (fg !== 'granted') return 'sin-permiso';
  const { status: bg } = await Location.requestBackgroundPermissionsAsync();
  if (bg !== 'granted') return 'sin-permiso';
  const lista = (await lugares()).filter((l) => !l.desbloqueado_en);
  if (!lista.length) {
    if (await Location.hasStartedGeofencingAsync(TAREA_GEOFENCE)) await Location.stopGeofencingAsync(TAREA_GEOFENCE);
    return 'sin-lugares';
  }
  await Location.startGeofencingAsync(
    TAREA_GEOFENCE,
    lista.slice(0, 20).map((l) => ({ identifier: l.id, latitude: l.lat, longitude: l.lng, radius: l.radio_m, notifyOnEnter: true, notifyOnExit: false })),
  );
  return 'ok';
}
