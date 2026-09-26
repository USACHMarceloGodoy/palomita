import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Baul, Botiquin, Burbuja, Corazon, Hoja, Regalo } from '@/components/Iconos';
import { IconoUI } from '@/components/mascota/IconosMascota';
import { colores, fuentes } from '@/lib/tema';

// Siete pestañas abajo, nada más. Todo lo demás cuelga de ellas: lo de la
// mascota (tienda, armario, minijuegos...) vive en su propio menú, no aquí.
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colores.rosaTinta,
        tabBarInactiveTintColor: colores.gris,
        tabBarLabelStyle: { fontFamily: fuentes.cuerpoBold, fontSize: 11 },
        tabBarStyle: {
          backgroundColor: colores.crema,
          borderTopWidth: 1.5,
          borderTopColor: colores.rosaClaro,
          height: Platform.OS === 'android' ? 72 : 84,
          paddingTop: 8,
          paddingBottom: 12,
        },
        tabBarItemStyle: { borderRadius: 18, marginHorizontal: 2 },
        tabBarActiveBackgroundColor: colores.rosaBase,
        sceneStyle: { backgroundColor: colores.rosaBase },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Inicio', tabBarIcon: ({ color }) => <Corazon color={String(color)} /> }} />
      <Tabs.Screen name="baul" options={{ title: 'Baúl', tabBarIcon: ({ color }) => <Baul color={String(color)} /> }} />
      <Tabs.Screen name="jardin" options={{ title: 'Jardín', tabBarIcon: ({ color }) => <Hoja color={String(color)} /> }} />
      <Tabs.Screen name="mascota" options={{ title: 'Mascota', tabBarIcon: ({ color }) => <IconoUI clave="pata" color={String(color)} /> }} />
      <Tabs.Screen name="ayuda" options={{ title: 'Ayuda', tabBarIcon: ({ color }) => <Botiquin color={String(color)} /> }} />
      <Tabs.Screen name="chat" options={{ title: 'Chat', tabBarIcon: ({ color }) => <Burbuja color={String(color)} /> }} />
      <Tabs.Screen name="tesoro" options={{ title: 'Tesoro', tabBarIcon: ({ color }) => <Regalo color={String(color)} /> }} />
    </Tabs>
  );
}
