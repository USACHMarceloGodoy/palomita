import { Stack } from 'expo-router';
import { colores } from '@/lib/tema';

// Subpantallas de la mascota: se abren sobre la pestaña, con flecha de volver.
// Pantallas y no modales: los gestos no llegan dentro de un Modal en Android.
export default function MascotaLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right', contentStyle: { backgroundColor: colores.rosaBase } }} />
  );
}
