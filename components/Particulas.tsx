// Un solo motor de partículas, configurable por tipo, densidad y duración.
// Se usa en el splash, al ganar un minijuego y en los eventos de calendario.
import { useEffect, useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated';
import { COLORES_PERSONAJE, Figura, FORMAS_GRANDES, type Forma } from './Figuras';

export type TipoParticula =
  | 'sorpresa' | 'kawaii' | 'bichitos' | 'comida' | 'flores-rosas' | 'flores-amarillas'
  | 'rosas' | 'girasoles' | 'corazones' | 'volantines' | 'lazos' | 'gatitos'
  | 'capibaras' | 'zuricatas' | 'ovejas' | 'conejitos' | 'frutillas' | 'hamburguesitas' | 'lanas' | 'lluvia';

type Cfg = { mix?: Forma[]; shape?: Forma; c1?: string; c2?: string; bg: string; dot: string };

export const CONFIG_PARTICULAS: Record<TipoParticula, Cfg> = {
  sorpresa: { mix: ['lazo', 'gatito', 'corazon', 'capibara', 'frutilla', 'flor', 'conejito', 'lana', 'oveja', 'hamburguesa', 'zuricata', 'rosa'], bg: '#FFE4EC', dot: '#FFD3E1' },
  kawaii: { mix: ['lazo', 'gatito', 'lana', 'conejito', 'corazon'], bg: '#FFE4EC', dot: '#FFD3E1' },
  bichitos: { mix: ['capibara', 'zuricata', 'oveja', 'conejito', 'gatito'], bg: '#FFF8F0', dot: '#FFE0EA' },
  comida: { mix: ['frutilla', 'hamburguesa', 'frutilla', 'corazon'], bg: '#FFE4EC', dot: '#FFD3E1' },
  'flores-rosas': { shape: 'flor', c1: '#FF6F91', c2: '#FFD93D', bg: '#FFE4EC', dot: '#FFD3E1' },
  'flores-amarillas': { shape: 'flor', c1: '#FFD93D', c2: '#E09A1F', bg: '#FFF8F0', dot: '#FFE9BF' },
  rosas: { shape: 'rosa', c1: '#D6336C', c2: '#FFB3C6', bg: '#FFE4EC', dot: '#FFD3E1' },
  girasoles: { shape: 'girasol', c1: '#FFD93D', c2: '#6B4A2A', bg: '#FFF8F0', dot: '#FFE9BF' },
  corazones: { shape: 'corazon', c1: '#FF6F91', c2: '#FF6F91', bg: '#FFE4EC', dot: '#FFD3E1' },
  volantines: { shape: 'volantin', c1: '#FFD93D', c2: '#D6336C', bg: '#FFF8F0', dot: '#FFE9BF' },
  lazos: { shape: 'lazo', c1: '#FF6F91', c2: '#D6336C', bg: '#FFE4EC', dot: '#FFD3E1' },
  gatitos: { shape: 'gatito', bg: '#FFE4EC', dot: '#FFD3E1' },
  capibaras: { shape: 'capibara', bg: '#FFF8F0', dot: '#FFE0EA' },
  zuricatas: { shape: 'zuricata', bg: '#FFF8F0', dot: '#FFE0EA' },
  ovejas: { shape: 'oveja', bg: '#FFE4EC', dot: '#FFD3E1' },
  conejitos: { shape: 'conejito', bg: '#FFE4EC', dot: '#FFD3E1' },
  frutillas: { shape: 'frutilla', bg: '#FFE4EC', dot: '#FFD3E1' },
  hamburguesitas: { shape: 'hamburguesa', bg: '#FFE4EC', dot: '#FFD3E1' },
  lanas: { shape: 'lana', c1: '#FFB3C6', c2: '#D6336C', bg: '#FFE4EC', dot: '#FFD3E1' },
  // K-drama: lluvia con paraguas rojo. Sale al azar en el splash, un día de cada siete.
  lluvia: { shape: 'gota', c1: '#8FB3D9', c2: '#8FB3D9', bg: '#E8EEF5', dot: '#D5DFEA' },
};

const PARES: [string, string][] = [
  ['#FF6F91', '#FFD93D'],
  ['#D6336C', '#FFB3C6'],
  ['#FFB3C6', '#D6336C'],
  ['#FFD93D', '#E09A1F'],
  ['#E2D5F8', '#6B3FA0'],
];

type Particula = {
  forma: Forma; c1: string; c2: string; left: number; size: number;
  dur: number; inicio: number; op: number; grande: boolean;
};

type Props = {
  tipo?: TipoParticula;
  densidad?: number;
  /** ms; undefined = infinito */
  duracion?: number;
  style?: object;
};

export function Particulas({ tipo = 'sorpresa', densidad = 26, duracion, style }: Props) {
  const c = CONFIG_PARTICULAS[tipo] ?? CONFIG_PARTICULAS.sorpresa;
  const parts = useMemo<Particula[]>(() => {
    const out: Particula[] = [];
    for (let i = 0; i < densidad; i++) {
      const forma = c.mix ? c.mix[i % c.mix.length] : (c.shape as Forma);
      const par = PARES[i % PARES.length];
      const grande = !!FORMAS_GRANDES[forma];
      let size = 17 + ((i * 53) % 27);
      if (grande) size = Math.round(size * 1.3);
      out.push({
        forma,
        c1: COLORES_PERSONAJE[forma]?.[0] ?? (c.mix ? par[0] : c.c1 ?? '#FF6F91'),
        c2: COLORES_PERSONAJE[forma]?.[1] ?? (c.mix ? par[1] : c.c2 ?? '#FFD93D'),
        left: (((i * 37) % 97) - 4) / 100,
        size,
        dur: (forma === 'gota' ? 2.2 + ((i * 29) % 30) / 10 : 7 + ((i * 29) % 65) / 10) * 1000,
        inicio: ((i * 41) % 71) / 71,
        op: 0.58 + ((i * 23) % 40) / 100,
        grande,
      });
    }
    return out;
  }, [tipo, densidad]);

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
      {parts.map((p, i) => <Caida key={`${tipo}-${i}`} p={p} duracion={duracion} />)}
    </View>
  );
}

function Caida({ p, duracion }: { p: Particula; duracion?: number }) {
  const { width, height } = useWindowDimensions();
  const t = useSharedValue(p.inicio);
  const visible = useSharedValue(1);

  useEffect(() => {
    const lineal = { easing: Easing.linear };
    t.value = withSequence(
      withTiming(1, { duration: p.dur * (1 - p.inicio), ...lineal }),
      withRepeat(withSequence(withTiming(0, { duration: 0 }), withTiming(1, { duration: p.dur, ...lineal })), -1),
    );
    if (duracion) visible.value = withSequence(withTiming(1, { duration: duracion }), withTiming(0, { duration: 600 }));
    return () => { cancelAnimation(t); cancelAnimation(visible); };
  }, []);

  const estilo = useAnimatedStyle(() => {
    const y = -90 + t.value * (height + 180);
    const rot = p.forma === 'gota' ? 0 : p.grande ? -14 + t.value * 28 : t.value * 300;
    return {
      transform: [{ translateY: y }, { rotate: `${rot}deg` }],
      opacity: p.op * visible.value,
    };
  });

  return (
    <Animated.View style={[{ position: 'absolute', top: 0, left: p.left * width, width: p.size, height: p.size }, estilo]}>
      <Figura forma={p.forma} c1={p.c1} c2={p.c2} size={p.size} />
    </Animated.View>
  );
}
