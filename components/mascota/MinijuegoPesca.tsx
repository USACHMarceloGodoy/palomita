// Minijuego de pesca tipo Stardew: una barra vertical con un pez que se mueve
// solo y un rectángulo verde que se controla manteniendo apretado (sube) o
// soltando (cae). Si el pez está dentro del verde, el medidor de captura sube;
// si no, baja. Física en el hilo de UI (worklets), sin pasar por JS.
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { runOnJS, useAnimatedStyle, useFrameCallback, useSharedValue } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Texto } from '@/components/Texto';
import type { ComportamientoPez, Item } from '@/lib/mascota-virtual/tipos';
import { colores } from '@/lib/tema';
import { IconoItem, Objeto } from './IconosMascota';

export type ResultadoMinijuego = { exito: boolean; perfecto: boolean; tesoro: boolean };

type Props = {
  pez: Item;
  nivel: number;
  barra: number;      // multiplicador del tamaño de la barra verde (caña + aparejos)
  drenaje: number;    // multiplicador de lo rápido que baja el medidor
  rebote: boolean;    // si la barra rebota en el fondo
  alto?: number;
  onFin: (r: ResultadoMinijuego) => void;
};

const ANCHO_PISTA = 56;

export function MinijuegoPesca({ pez, nivel, barra, drenaje, rebote, alto = 340, onFin }: Props) {
  const H = alto;
  const dificultad = pez.dificultad ?? 1;
  const comportamiento: ComportamientoPez = pez.comportamiento ?? 'suave';
  const barH = Math.min(H * 0.62, H * 0.26 * barra * (1 + nivel * 0.045));
  const PEZ = 34;

  const sostenido = useSharedValue(0);
  const barY = useSharedValue(H - barH);
  const barV = useSharedValue(0);
  const pezY = useSharedValue(H * 0.5);
  const objetivo = useSharedValue(H * 0.5);
  const velocidadPez = useSharedValue(80);
  const proximoCambio = useSharedValue(0.8);
  const modoMixto = useSharedValue(0);
  const medidor = useSharedValue(0.3);
  const perfecto = useSharedValue(1);
  const tiempo = useSharedValue(0);
  const cofreY = useSharedValue(-1);
  const cofreAparece = useSharedValue(Math.random() < 0.28 ? 1.5 + Math.random() * 2.5 : -1);
  const cofreProg = useSharedValue(0);
  const cofreTomado = useSharedValue(0);
  const terminado = useSharedValue(0);
  const [estado, setEstado] = useState<'jugando' | 'exito' | 'escapo'>('jugando');

  function finalizar(exito: boolean, fuePerfecto: boolean, tesoro: boolean) {
    setEstado(exito ? 'exito' : 'escapo');
    Haptics.notificationAsync(exito ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error).catch(() => {});
    onFin({ exito, perfecto: exito && fuePerfecto, tesoro: exito && tesoro });
  }
  function vibrar() { Haptics.selectionAsync().catch(() => {}); }

  const cuadro = useFrameCallback((info) => {
    'worklet';
    if (terminado.value) return;
    const dt = Math.min(0.05, (info.timeSincePreviousFrame ?? 16) / 1000);
    tiempo.value += dt;

    // --- barra verde: sube al sostener, cae por gravedad ---
    barV.value += (sostenido.value ? -1500 : 1500) * dt;
    barV.value = Math.max(-900, Math.min(900, barV.value));
    barY.value += barV.value * dt;
    if (barY.value < 0) { barY.value = 0; barV.value = 0; }
    if (barY.value > H - barH) { barY.value = H - barH; barV.value = rebote ? -barV.value * 0.35 : 0; }

    // --- pez: elige objetivos según su comportamiento ---
    proximoCambio.value -= dt;
    if (proximoCambio.value <= 0) {
      const dif = dificultad;
      let modo = comportamiento;
      if (modo === 'mixto') { modoMixto.value = 1 - modoMixto.value; modo = modoMixto.value ? 'dardo' : 'suave'; }
      const r = Math.random();
      if (modo === 'suave') {
        objetivo.value = pezY.value + (r - 0.5) * H * 0.5;
        velocidadPez.value = 60 + 30 * dif; proximoCambio.value = 1.2 + Math.random() * 1.3;
      } else if (modo === 'fondo') {
        objetivo.value = r < 0.12 ? Math.random() * H * 0.4 : H * 0.55 + Math.random() * H * 0.45;
        velocidadPez.value = 90 + 35 * dif; proximoCambio.value = 1.4 + Math.random() * 1.6;
      } else if (modo === 'dardo') {
        objetivo.value = Math.random() * H;
        velocidadPez.value = 300 + 70 * dif; proximoCambio.value = 0.7 + Math.random() * 0.9;
      } else {
        objetivo.value = pezY.value + (r < 0.5 ? -1 : 1) * (H * 0.2 + Math.random() * H * 0.25);
        velocidadPez.value = 200 + 50 * dif; proximoCambio.value = 0.4 + Math.random() * 0.5;
      }
      objetivo.value = Math.max(PEZ / 2, Math.min(H - PEZ / 2, objetivo.value));
    }
    const d = objetivo.value - pezY.value;
    const paso = velocidadPez.value * dt;
    pezY.value += Math.abs(d) <= paso ? d : Math.sign(d) * paso;

    // --- medidor ---
    const dentro = pezY.value >= barY.value - 4 && pezY.value <= barY.value + barH + 4;
    if (dentro) medidor.value = Math.min(1, medidor.value + 0.26 * dt);
    else { medidor.value = Math.max(0, medidor.value - 0.2 * drenaje * (0.8 + dificultad * 0.12) * dt); perfecto.value = 0; }

    // --- cofre del tesoro ---
    if (cofreAparece.value > 0 && tiempo.value >= cofreAparece.value && cofreY.value < 0 && !cofreTomado.value) {
      cofreY.value = 30 + Math.random() * (H - 60); cofreAparece.value = -1;
    }
    if (cofreY.value >= 0 && !cofreTomado.value) {
      const sobre = cofreY.value >= barY.value && cofreY.value <= barY.value + barH;
      cofreProg.value = Math.max(0, Math.min(1, cofreProg.value + (sobre ? 0.4 : -0.3) * dt));
      if (cofreProg.value >= 1) { cofreTomado.value = 1; cofreY.value = -1; runOnJS(vibrar)(); }
    }

    if (medidor.value >= 1) { terminado.value = 1; runOnJS(finalizar)(true, perfecto.value === 1, cofreTomado.value === 1); }
    else if (medidor.value <= 0) { terminado.value = 1; runOnJS(finalizar)(false, false, false); }
  }, true);

  useEffect(() => { if (estado !== 'jugando') cuadro.setActive(false); }, [estado]);

  const estiloBarra = useAnimatedStyle(() => ({ transform: [{ translateY: barY.value }], height: barH }));
  const estiloPez = useAnimatedStyle(() => ({ transform: [{ translateY: pezY.value - PEZ / 2 }] }));
  const estiloMedidor = useAnimatedStyle(() => ({
    height: `${medidor.value * 100}%`,
    backgroundColor: medidor.value > 0.5 ? '#7BC47F' : medidor.value > 0.25 ? '#FFD93D' : '#E63950',
  }));
  const estiloCofre = useAnimatedStyle(() => ({ opacity: cofreY.value >= 0 ? 1 : 0, transform: [{ translateY: Math.max(0, cofreY.value) - 16 }] }));
  const estiloCofreProg = useAnimatedStyle(() => ({ width: `${cofreProg.value * 100}%` }));
  const estiloPerfecto = useAnimatedStyle(() => ({ opacity: perfecto.value }));

  return (
    <View style={{ alignItems: 'center', gap: 10 }}>
      <View style={{ flexDirection: 'row', gap: 14, alignItems: 'flex-end' }}>
        <Pressable
          onPressIn={() => { sostenido.value = 1; }}
          onPressOut={() => { sostenido.value = 0; }}
          disabled={estado !== 'jugando'}
          accessibilityRole="button"
          accessibilityLabel="Mantén apretado para subir la barra verde"
          style={[estilos.pista, { height: H }]}
        >
          <View pointerEvents="none" style={StyleSheet.absoluteFill}>
            {Array.from({ length: 6 }, (_, i) => <View key={i} style={{ position: 'absolute', left: 0, right: 0, top: (i + 1) * (H / 7), height: 1, backgroundColor: 'rgba(255,255,255,0.25)' }} />)}
            <Animated.View style={[estilos.barra, estiloBarra]} />
            <Animated.View style={[{ position: 'absolute', left: (ANCHO_PISTA - 32) / 2, top: 0 }, estiloCofre]}>
              <Objeto clave="cofre" c1="#C99A6B" c2="#FFD93D" size={32} />
            </Animated.View>
            <Animated.View style={[{ position: 'absolute', left: (ANCHO_PISTA - PEZ) / 2, top: 0 }, estiloPez]}>
              <IconoItem item={pez} size={PEZ} />
            </Animated.View>
          </View>
        </Pressable>
        <View style={{ alignItems: 'center', gap: 6 }}>
          <View style={[estilos.medidor, { height: H }]}>
            <Animated.View style={[estilos.medidorRelleno, estiloMedidor]} />
          </View>
        </View>
      </View>
      <View style={{ width: ANCHO_PISTA + 14 + 22, gap: 4 }}>
        <View style={estilos.cofrePista}><Animated.View style={[estilos.cofreRelleno, estiloCofreProg]} /></View>
        <Animated.View style={estiloPerfecto}><Texto variante="apoyo" style={{ fontSize: 11, textAlign: 'center', color: colores.amarilloOscuro }}>Perfecto hasta ahora</Texto></Animated.View>
      </View>
      <Texto variante="apoyo" style={{ textAlign: 'center', fontSize: 13 }}>
        {estado === 'jugando' ? 'Mantén apretado para subir; suelta para bajar. Toques cortos para quedarte quieto.' : estado === 'exito' ? '¡Lo atrapaste!' : 'Se escapó.'}
      </Texto>
    </View>
  );
}

const estilos = StyleSheet.create({
  pista: { width: ANCHO_PISTA, borderRadius: 14, backgroundColor: '#2E86AB', overflow: 'hidden', borderWidth: 3, borderColor: '#1B5E7A' },
  barra: { position: 'absolute', left: 4, right: 4, borderRadius: 8, backgroundColor: 'rgba(123,196,127,0.85)', borderWidth: 2, borderColor: '#3E8A62' },
  medidor: { width: 18, borderRadius: 9, backgroundColor: '#E1ECFF', overflow: 'hidden', justifyContent: 'flex-end', borderWidth: 2, borderColor: '#BFD6FF' },
  medidorRelleno: { width: '100%', borderRadius: 9 },
  cofrePista: { height: 8, borderRadius: 4, backgroundColor: '#F3E4C8', overflow: 'hidden' },
  cofreRelleno: { height: '100%', backgroundColor: '#E09A1F', borderRadius: 4 },
});
