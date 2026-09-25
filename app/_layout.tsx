import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold } from '@expo-google-fonts/nunito';
import { Baloo2_600SemiBold, Baloo2_700Bold } from '@expo-google-fonts/baloo-2';
import { Caveat_500Medium, Caveat_600SemiBold } from '@expo-google-fonts/caveat';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useSesion } from '@/lib/sesion';
import { registrarPush } from '@/lib/notificaciones';
import { colores } from '@/lib/tema';
import '@/lib/geofence';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function Layout() {
  const [fuentesListas] = useFonts({
    Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold,
    Baloo2_600SemiBold, Baloo2_700Bold,
    Caveat_500Medium, Caveat_600SemiBold,
  });
  const { sesion, cargando, demo } = useSesion();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (fuentesListas && !cargando) SplashScreen.hideAsync().catch(() => {});
  }, [fuentesListas, cargando]);

  // Sin sesión → login. Con sesión → splash propio (una vez) y luego pestañas.
  const [splashHecho, setSplashHecho] = useState(false);
  useEffect(() => {
    if (!fuentesListas || cargando) return;
    const enLogin = segments[0] === 'login';
    const enSplash = segments[0] === 'splash';
    if (!demo && !sesion) {
      if (!enLogin) router.replace('/login');
      return;
    }
    if (!splashHecho && !enSplash) {
      setSplashHecho(true);
      router.replace('/splash');
    }
  }, [fuentesListas, cargando, sesion, demo, segments[0]]);

  useEffect(() => {
    if (sesion) registrarPush().catch(() => {});
  }, [sesion?.user.id]);

  if (!fuentesListas) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colores.rosaBase }, animation: 'fade' }}>
          <Stack.Screen name="splash" />
          <Stack.Screen name="login" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="checkin" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="multiverso" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="album" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="capsulas" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="lugares" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="diccionario" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="kdrama" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="acuerdo" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="autor" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="dibujar" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="nota" options={{ animation: 'fade' }} />
          <Stack.Screen name="dormir" options={{ animation: 'fade', contentStyle: { backgroundColor: '#1B1519' } }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
