// Árbol de la amistad: sacudirlo tres veces, una vez al día. Cae algo chico:
// besitos, un ingrediente o un bichito para el museo.
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';
import { Pantalla } from '@/components/Pantalla';
import { Texto } from '@/components/Texto';
import { Particulas, type TipoParticula } from '@/components/Particulas';
import { Cabecera } from '@/components/mascota/Cabecera';
import { IconoItem } from '@/components/mascota/IconosMascota';
import { arbolHecho, sacudirArbol } from '@/lib/mascota-virtual/acciones';
import { estacion } from '@/lib/mascota-virtual/tiempo';
import type { Item } from '@/lib/mascota-virtual/tipos';
import { useMascota } from '@/lib/mascota-virtual/useMascota';
import { colores, sombras } from '@/lib/tema';

export default function Arbol() {
  const { rol, saldo, recargar } = useMascota();
  const [hecho, setHecho] = useState(false);
  const [sacudidas, setSacudidas] = useState(0);
  const [premio, setPremio] = useState<{ tipo: 'besitos' | 'item'; item?: Item; besitos: number } | null>(null);
  const [festejo, setFestejo] = useState<TipoParticula | null>(null);
  const giro = useSharedValue(0);

  useEffect(() => { arbolHecho(rol).then(setHecho).catch(() => {}); }, [rol]);

  const estilo = useAnimatedStyle(() => ({ transform: [{ rotate: `${giro.value}deg` }] }));

  async function sacudir() {
    if (hecho || premio) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    giro.value = withSequence(withTiming(-5, { duration: 70 }), withTiming(5, { duration: 70 }), withTiming(-3, { duration: 70 }), withTiming(0, { duration: 70 }));
    const n = sacudidas + 1;
    setSacudidas(n);
    if (n < 3) return;
    const r = await sacudirArbol(rol).catch(() => null);
    if (!r) return;
    setPremio(r); setHecho(true);
    setFestejo(r.tipo === 'besitos' ? 'corazones' : 'flores-rosas');
    setTimeout(() => setFestejo(null), 2500);
    recargar();
  }

  const hojas = { verano: '#3E8A62', otono: '#E09A1F', invierno: '#9FB4C9', primavera: '#7BC47F' }[estacion()];
  const flores = estacion() === 'primavera';

  return (
    <Pantalla fondo={colores.menta}>
      {festejo ? <Particulas tipo={festejo} densidad={14} duracion={2200} /> : null}
      <Cabecera titulo="Árbol de la amistad" saldo={saldo} subtitulo={hecho ? 'Ya lo sacudiste hoy. Vuelve mañana.' : 'Sacúdelo tres veces y ve qué cae.'} />

      <Pressable onPress={sacudir} accessibilityRole="button" accessibilityLabel="Sacudir el árbol" disabled={hecho} style={{ alignItems: 'center', paddingVertical: 10 }}>
        <Animated.View style={[estilo, { transformOrigin: 'bottom' }]}>
          <Svg width={260} height={280} viewBox="0 0 260 280">
            <Ellipse cx={130} cy={266} rx={90} ry={10} fill="#4A3B45" opacity={0.12} />
            <Rect x={112} y={170} width={36} height={100} rx={10} fill="#8C6239" stroke="#4A3B45" strokeWidth={2.5} />
            <Path d="M130 200c-14-10-24-26-20-40" stroke="#6B4A2A" strokeWidth={3} fill="none" strokeLinecap="round" />
            <Circle cx={130} cy={110} r={78} fill={hojas} stroke="#4A3B45" strokeWidth={2.5} />
            <Circle cx={72} cy={140} r={44} fill={hojas} stroke="#4A3B45" strokeWidth={2.5} />
            <Circle cx={188} cy={140} r={44} fill={hojas} stroke="#4A3B45" strokeWidth={2.5} />
            <Circle cx={130} cy={70} r={48} fill={hojas} />
            <Circle cx={110} cy={120} r={60} fill={hojas} />
            <Circle cx={150} cy={120} r={60} fill={hojas} />
            {flores ? <>{[[90, 90], [150, 60], [185, 120], [70, 150], [130, 150]].map(([x, y]) => <Circle key={`${x}${y}`} cx={x} cy={y} r={7} fill="#FF6F91" />)}</> : null}
            {[[100, 100], [160, 80], [120, 140], [175, 150], [85, 160]].map(([x, y]) => <Circle key={`h${x}${y}`} cx={x} cy={y} r={4} fill="#FFFFFF" opacity={0.35} />)}
          </Svg>
        </Animated.View>
      </Pressable>

      {!hecho ? <Texto variante="cuerpoBold" style={{ textAlign: 'center', color: colores.mentaTexto }}>{3 - sacudidas} {3 - sacudidas === 1 ? 'sacudida' : 'sacudidas'} más</Texto> : null}

      {premio ? (
        <View style={estilos.tarjeta}>
          {premio.tipo === 'item' && premio.item ? <IconoItem item={premio.item} size={64} /> : null}
          <Texto variante="titulo">{premio.tipo === 'besitos' ? `Cayeron ${premio.besitos} besitos` : `Cayó: ${premio.item?.nombre}`}</Texto>
          <Texto variante="apoyo" style={{ textAlign: 'center' }}>
            {premio.tipo === 'besitos' ? 'Directo a tu saldo.' : premio.item?.categoria === 'insecto' ? 'Un bichito. Sócrates lo querría para el museo.' : 'Un ingrediente. Sirve para cocinar.'}
          </Texto>
        </View>
      ) : null}
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  tarjeta: { backgroundColor: colores.crema, borderRadius: 24, padding: 18, alignItems: 'center', gap: 6, ...sombras.rosada },
});
