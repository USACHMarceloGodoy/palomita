import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colores, radios, sombras } from '@/lib/tema';

type Props = { caraA: React.ReactNode; caraB: React.ReactNode; alto?: number; fondoB?: string };

// Cara A la foto, cara B tu texto. Un toque la voltea.
export function TarjetaVolteable({ caraA, caraB, alto = 300, fondoB = colores.crema }: Props) {
  const giro = useSharedValue(0);
  const [volteada, setVolteada] = useState(false);

  const frente = useAnimatedStyle(() => ({
    transform: [{ perspective: 1000 }, { rotateY: `${interpolate(giro.value, [0, 1], [0, 180])}deg` }],
    backfaceVisibility: 'hidden',
  }));
  const dorso = useAnimatedStyle(() => ({
    transform: [{ perspective: 1000 }, { rotateY: `${interpolate(giro.value, [0, 1], [180, 360])}deg` }],
    backfaceVisibility: 'hidden',
  }));

  function voltear() {
    Haptics.selectionAsync().catch(() => {});
    giro.value = withTiming(volteada ? 0 : 1, { duration: 420 });
    setVolteada(!volteada);
  }

  return (
    <Pressable onPress={voltear} accessibilityRole="button" accessibilityLabel={volteada ? 'Ver foto' : 'Ver texto'}>
      <View style={{ height: alto }}>
        <Animated.View style={[estilos.cara, frente]}>{caraA}</Animated.View>
        <Animated.View style={[estilos.cara, { backgroundColor: fondoB }, dorso]}>{caraB}</Animated.View>
      </View>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  cara: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, borderRadius: radios.tarjeta, overflow: 'hidden', backgroundColor: colores.rosaMedio, ...sombras.rosada },
});
