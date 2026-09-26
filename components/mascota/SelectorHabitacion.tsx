// Flechas para pasar de una habitación a otra de la casa.
import { Pressable, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Flecha } from '@/components/Iconos';
import { Texto } from '@/components/Texto';
import { NOMBRE_HABITACION, type Habitacion } from '@/lib/mascota-virtual/tipos';
import { colores } from '@/lib/tema';

export function SelectorHabitacion({ habitaciones, actual, onCambiar }: { habitaciones: Habitacion[]; actual: number; onCambiar: (i: number) => void }) {
  const n = habitaciones.length;
  const ir = (d: number) => { Haptics.selectionAsync().catch(() => {}); onCambiar((actual + d + n) % n); };
  return (
    <View style={estilos.fila}>
      <Pressable onPress={() => ir(-1)} disabled={n < 2} accessibilityRole="button" accessibilityLabel="Habitación anterior" style={[estilos.flecha, n < 2 && { opacity: 0.3 }]}>
        <Flecha color={colores.rosaTinta} />
      </Pressable>
      <View style={{ alignItems: 'center' }}>
        <Texto variante="cuerpoBold">{NOMBRE_HABITACION[habitaciones[actual]?.tipo ?? 'sala']}</Texto>
        <View style={{ flexDirection: 'row', gap: 4, marginTop: 2 }}>
          {habitaciones.map((_, i) => <View key={i} style={[estilos.punto, i === actual && { backgroundColor: colores.rosaTinta, width: 16 }]} />)}
        </View>
      </View>
      <Pressable onPress={() => ir(1)} disabled={n < 2} accessibilityRole="button" accessibilityLabel="Habitación siguiente" style={[estilos.flecha, n < 2 && { opacity: 0.3 }]}>
        <Flecha color={colores.rosaTinta} dir="der" />
      </Pressable>
    </View>
  );
}

const estilos = StyleSheet.create({
  fila: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  flecha: { width: 44, height: 44, borderRadius: 14, backgroundColor: colores.crema, alignItems: 'center', justifyContent: 'center' },
  punto: { width: 6, height: 6, borderRadius: 3, backgroundColor: colores.rosaClaro },
});
