import { StyleSheet, View } from 'react-native';
import { Texto } from '@/components/Texto';
import { COLOR_NECESIDAD, NOMBRE_NECESIDAD } from '@/lib/mascota-virtual/necesidades';
import { NECESIDADES, type Necesidad } from '@/lib/mascota-virtual/tipos';
import { colores } from '@/lib/tema';
import { IconoUI } from './IconosMascota';

const ICONO: Record<Necesidad, 'alimentar' | 'banar' | 'acariciar'> = { hambre: 'alimentar', higiene: 'banar', afecto: 'acariciar' };

export function Barras({ valores, compactas }: { valores: Record<Necesidad, number>; compactas?: boolean }) {
  if (compactas) {
    return (
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {NECESIDADES.map((k) => (
          <View key={k} style={estilos.celda}>
            <IconoUI clave={ICONO[k]} color={COLOR_NECESIDAD[k]} size={20} />
            <Texto variante="cuerpoBold" style={{ fontSize: 13 }}>{valores[k]}%</Texto>
          </View>
        ))}
      </View>
    );
  }
  return (
    <View style={{ gap: 10 }}>
      {NECESIDADES.map((k) => (
        <View key={k} accessibilityLabel={`${NOMBRE_NECESIDAD[k]} ${valores[k]} por ciento`}>
          <View style={estilos.fila}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <IconoUI clave={ICONO[k]} color={COLOR_NECESIDAD[k]} size={18} />
              <Texto variante="cuerpoBold" style={{ fontSize: 13, color: colores.gris }}>{NOMBRE_NECESIDAD[k]}</Texto>
            </View>
            <Texto variante="cuerpoBold" style={{ fontSize: 13, color: valores[k] < 20 ? colores.rosaTinta : colores.gris }}>{valores[k]}%</Texto>
          </View>
          <View style={estilos.pista}>
            <View style={[estilos.relleno, { width: `${valores[k]}%`, backgroundColor: COLOR_NECESIDAD[k] }]} />
          </View>
        </View>
      ))}
    </View>
  );
}

const estilos = StyleSheet.create({
  fila: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  pista: { height: 10, borderRadius: 6, backgroundColor: colores.rosaClaro, overflow: 'hidden' },
  relleno: { height: '100%', borderRadius: 6 },
  celda: { flex: 1, backgroundColor: colores.crema, borderRadius: 14, paddingVertical: 8, alignItems: 'center', gap: 2 },
});
