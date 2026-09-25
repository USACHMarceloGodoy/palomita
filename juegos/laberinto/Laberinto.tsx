import { useMemo, useRef, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, runOnJS } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Figura } from '@/components/Figuras';
import { Mascota } from '@/components/Mascota';
import { generar, puedeMover } from './generador';
import { colores } from '@/lib/tema';

type Props = { n: number; semilla: number; onGanar: (segundos: number) => void };

// Ella arrastra un corazón desde la entrada (0,0) hasta ti (n-1,n-1).
export function Laberinto({ n, semilla, onGanar }: Props) {
  const { width } = useWindowDimensions();
  const lado = Math.min(width - 40, 360);
  const celda = lado / n;
  const lab = useMemo(() => generar(n, semilla), [n, semilla]);

  const pos = useRef({ f: 0, c: 0 });
  const [ganado, setGanado] = useState(false);
  const inicio = useRef<number | null>(null);
  const x = useSharedValue(celda / 2);
  const y = useSharedValue(celda / 2);

  function intentar(px: number, py: number) {
    if (ganado) return;
    if (inicio.current === null) inicio.current = Date.now();
    const nf = Math.floor(py / celda);
    const nc = Math.floor(px / celda);
    const { f, c } = pos.current;
    if (nf === f && nc === c) return;
    if (puedeMover(lab, f, c, nf, nc)) {
      pos.current = { f: nf, c: nc };
      x.value = withSpring(nc * celda + celda / 2, { damping: 16 });
      y.value = withSpring(nf * celda + celda / 2, { damping: 16 });
      Haptics.selectionAsync().catch(() => {});
      if (nf === n - 1 && nc === n - 1) {
        setGanado(true);
        onGanar((Date.now() - (inicio.current ?? Date.now())) / 1000);
      }
    }
  }

  const pan = Gesture.Pan()
    .onBegin((e) => { runOnJS(intentar)(e.x, e.y); })
    .onUpdate((e) => { runOnJS(intentar)(e.x, e.y); });

  const corazon = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value - celda * 0.35 }, { translateY: y.value - celda * 0.35 }],
  }));

  return (
    <GestureDetector gesture={pan}>
      <View style={[estilos.tablero, { width: lado, height: lado }]}>
        {lab.celdas.map((fila, f) =>
          fila.map((cel, c) => (
            <View
              key={`${f}-${c}`}
              style={{
                position: 'absolute', left: c * celda, top: f * celda, width: celda, height: celda,
                borderTopWidth: cel.arriba ? 2 : 0, borderBottomWidth: cel.abajo ? 2 : 0,
                borderLeftWidth: cel.izq ? 2 : 0, borderRightWidth: cel.der ? 2 : 0,
                borderColor: colores.rosaTinta,
              }}
            />
          )),
        )}
        <View style={{ position: 'absolute', left: (n - 1) * celda + celda * 0.1, top: (n - 1) * celda + celda * 0.1 }}>
          <Mascota size={celda * 0.8} animo={ganado ? 1 : 0.7} />
        </View>
        <Animated.View style={[{ position: 'absolute', left: 0, top: 0 }, corazon]}>
          <Figura forma="corazon" c1={colores.rosaFuerte} c2={colores.rosaFuerte} size={celda * 0.7} />
        </Animated.View>
      </View>
    </GestureDetector>
  );
}

const estilos = StyleSheet.create({
  tablero: { alignSelf: 'center', backgroundColor: colores.crema, borderRadius: 16, overflow: 'hidden' },
});
