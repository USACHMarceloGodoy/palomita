import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming, runOnJS } from 'react-native-reanimated';
import Svg, { Path, Text as SvgText } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { Texto } from '@/components/Texto';
import { BotonKawaii } from '@/components/BotonKawaii';
import { Figura } from '@/components/Figuras';
import { girar, premios, puedeGirar, ultimoGiro } from '@/lib/juegos';
import { colores } from '@/lib/tema';
import type { Premio } from '@/lib/tipos';

// Ruleta de citas: un giro por semana. Los premios se canjean cara a cara.
const COLORES = ['#FFB3C6', '#FFD93D', '#E2D5F8', '#C8F0DC', '#FF6F91', '#FFF8F0'];

export function Ruleta() {
  const [lista, setLista] = useState<Premio[]>([]);
  const [ultimo, setUltimo] = useState<{ premio: Premio; fecha: string } | null>(null);
  const [girando, setGirando] = useState(false);
  const [resultado, setResultado] = useState<Premio | null>(null);
  const rot = useSharedValue(0);
  const anim = useAnimatedStyle(() => ({ transform: [{ rotate: `${rot.value}deg` }] }));

  useEffect(() => {
    premios().then(setLista).catch(() => {});
    ultimoGiro().then(setUltimo).catch(() => {});
  }, []);

  const R = 130;
  const n = lista.length || 1;
  const paso = 360 / n;

  function sector(i: number) {
    const a0 = ((i * paso - 90) * Math.PI) / 180;
    const a1 = (((i + 1) * paso - 90) * Math.PI) / 180;
    const x0 = R + R * Math.cos(a0), y0 = R + R * Math.sin(a0);
    const x1 = R + R * Math.cos(a1), y1 = R + R * Math.sin(a1);
    return `M${R},${R} L${x0},${y0} A${R},${R} 0 ${paso > 180 ? 1 : 0} 1 ${x1},${y1} Z`;
  }

  async function tirar() {
    if (girando || !lista.length) return;
    setGirando(true);
    setResultado(null);
    const p = await girar();
    if (!p) { setGirando(false); return; }
    const idx = lista.findIndex((x) => x.id === p.id);
    // El puntero está arriba: giramos para dejar el centro del sector idx en 0°.
    const destino = 360 * 5 + (360 - (idx * paso + paso / 2));
    rot.value = 0;
    rot.value = withTiming(destino, { duration: 4200, easing: Easing.out(Easing.cubic) }, (fin) => {
      if (fin) {
        runOnJS(setResultado)(p);
        runOnJS(setGirando)(false);
        runOnJS(setUltimo)({ premio: p, fecha: new Date().toISOString() });
        runOnJS(Haptics.notificationAsync)(Haptics.NotificationFeedbackType.Success);
      }
    });
  }

  const disponible = puedeGirar(ultimo);

  return (
    <View style={{ alignItems: 'center', gap: 14 }}>
      <View style={{ width: R * 2, height: R * 2 + 16, alignItems: 'center' }}>
        <View style={estilos.puntero}><Figura forma="corazon" c1={colores.rosaTinta} c2={colores.rosaTinta} size={28} /></View>
        <Animated.View style={[{ width: R * 2, height: R * 2, marginTop: 10 }, anim]}>
          <Svg width={R * 2} height={R * 2}>
            {lista.map((p, i) => (
              <Path key={p.id} d={sector(i)} fill={COLORES[i % COLORES.length]} stroke={colores.crema} strokeWidth={2} />
            ))}
            {lista.map((p, i) => {
              const a = ((i * paso + paso / 2 - 90) * Math.PI) / 180;
              const x = R + R * 0.62 * Math.cos(a), y = R + R * 0.62 * Math.sin(a);
              return (
                <SvgText key={p.id + 't'} x={x} y={y} fontSize={10} fontWeight="700" fill={colores.carbon} textAnchor="middle" transform={`rotate(${i * paso + paso / 2} ${x} ${y})`}>
                  {p.titulo.length > 14 ? p.titulo.slice(0, 13) + '…' : p.titulo}
                </SvgText>
              );
            })}
          </Svg>
        </Animated.View>
      </View>

      {resultado ? (
        <View style={{ alignItems: 'center', gap: 4 }}>
          <Texto variante="titulo">{resultado.titulo}</Texto>
          {resultado.descripcion ? <Texto variante="apoyo" style={{ textAlign: 'center' }}>{resultado.descripcion}</Texto> : null}
          <Texto variante="apoyo">Muéstraselo. Se canjea en persona.</Texto>
        </View>
      ) : ultimo && !disponible ? (
        <View style={{ alignItems: 'center', gap: 4 }}>
          <Texto variante="cuerpoBold">Esta semana salió: {ultimo.premio.titulo}</Texto>
          <Texto variante="apoyo">Un giro por semana. La próxima es el fin de semana.</Texto>
        </View>
      ) : null}

      <BotonKawaii titulo={girando ? 'Girando…' : 'Girar'} onPress={tirar} disabled={girando || !disponible || !lista.length} />
    </View>
  );
}

const estilos = StyleSheet.create({
  puntero: { position: 'absolute', top: -4, zIndex: 2 },
});
