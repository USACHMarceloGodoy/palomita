// Pesca en el muelle: lanzar, esperar que pique y tirar a tiempo. Tres tiradas
// al día dan besitos; las demás son por gusto (y por el museo).
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withSpring, withTiming, cancelAnimation } from 'react-native-reanimated';
import Svg, { Path, Rect } from 'react-native-svg';
import { Pantalla } from '@/components/Pantalla';
import { Texto } from '@/components/Texto';
import { BotonKawaii } from '@/components/BotonKawaii';
import { Cabecera } from '@/components/mascota/Cabecera';
import { IconoItem, Objeto } from '@/components/mascota/IconosMascota';
import { MascotaVirtual } from '@/components/mascota/MascotaVirtual';
import { pescar, RECOMPENSAS_MASCOTA, tiradasHoy } from '@/lib/mascota-virtual/acciones';
import { ESTRELLAS } from '@/lib/mascota-virtual/catalogo';
import type { Item } from '@/lib/mascota-virtual/tipos';
import { useMascota } from '@/lib/mascota-virtual/useMascota';
import { colores, sombras } from '@/lib/tema';

type Estado = 'listo' | 'esperando' | 'pica' | 'escapo' | 'resultado';

export default function Pesca() {
  const { width } = useWindowDimensions();
  const { rol, mascota, saldo, cantidad, recargar } = useMascota();
  const [estado, setEstado] = useState<Estado>('listo');
  const [tiradas, setTiradas] = useState(0);
  const [usarCebo, setUsarCebo] = useState(false);
  const [captura, setCaptura] = useState<{ item: Item; besitos: number; conRecompensa: boolean } | null>(null);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);
  const boya = useSharedValue(0);

  useEffect(() => { tiradasHoy(rol).then(setTiradas).catch(() => {}); }, [rol]);
  useEffect(() => () => { if (temporizador.current) clearTimeout(temporizador.current); }, []);

  const estiloBoya = useAnimatedStyle(() => ({ transform: [{ translateY: boya.value }] }));

  function lanzar() {
    setCaptura(null);
    setEstado('esperando');
    boya.value = withRepeat(withSequence(withTiming(-3, { duration: 700 }), withTiming(3, { duration: 700 })), -1, true);
    temporizador.current = setTimeout(() => {
      setEstado('pica');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      cancelAnimation(boya);
      boya.value = withRepeat(withSequence(withTiming(10, { duration: 90 }), withTiming(-6, { duration: 90 })), -1, true);
      temporizador.current = setTimeout(() => { cancelAnimation(boya); boya.value = withSpring(0); setEstado('escapo'); }, 1100);
    }, 1500 + Math.random() * 3000);
  }

  async function tirar() {
    if (estado !== 'pica') return;
    if (temporizador.current) clearTimeout(temporizador.current);
    cancelAnimation(boya);
    boya.value = withSpring(-40);
    const conCebo = usarCebo && cantidad('cebo') > 0;
    const r = await pescar(rol, conCebo).catch(() => null);
    if (!r) { setEstado('listo'); return; }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setCaptura(r); setEstado('resultado'); setTiradas((t) => t + 1);
    recargar();
  }

  const restantes = Math.max(0, RECOMPENSAS_MASCOTA.pescaTiradasDia - tiradas);
  const ancho = Math.min(width - 40, 420);

  return (
    <Pantalla fondo="#BEE7FF">
      <Cabecera titulo="Pesca" saldo={saldo} subtitulo={restantes ? `${restantes} ${restantes === 1 ? 'tirada' : 'tiradas'} con besitos hoy` : 'Las de hoy ya dieron besitos; ahora por gusto'} />

      <View style={[estilos.escena, { width: ancho, height: ancho * 0.9, alignSelf: 'center' }]}>
        <Svg width={ancho} height={ancho * 0.9} viewBox="0 0 360 324" style={StyleSheet.absoluteFill}>
          <Rect x={0} y={0} width={360} height={324} fill="#6FC7E8" />
          <Rect x={0} y={0} width={360} height={90} fill="#BEE7FF" />
          <Path d="M0 90c40-14 80-14 120 0s80 14 120 0 80-14 120 0v234H0z" fill="#4FA8CC" />
          <Path d="M0 130c40 10 80 10 120 0s80-10 120 0 80 10 120 0" fill="none" stroke="#FFFFFF" strokeWidth={2} opacity={0.5} />
          <Path d="M0 200c40 10 80 10 120 0s80-10 120 0 80 10 120 0" fill="none" stroke="#FFFFFF" strokeWidth={2} opacity={0.35} />
          <Rect x={0} y={96} width={150} height={16} fill="#B98A5C" />
          <Rect x={0} y={112} width={150} height={40} rx={6} fill="#C9A66B" />
          <Rect x={30} y={150} width={10} height={60} fill="#8C6239" /><Rect x={110} y={150} width={10} height={60} fill="#8C6239" />
        </Svg>
        <View style={{ position: 'absolute', left: ancho * 0.05, top: ancho * 0.06 }}>
          {mascota ? <MascotaVirtual especie={mascota.especie} orejas={mascota.orejas} hocico={mascota.hocico} c1={mascota.color_pelaje} c2={mascota.color_secundario} look={mascota.look} size={ancho * 0.3} animo={estado === 'escapo' ? 0.3 : 0.9} /> : null}
        </View>
        <View style={{ position: 'absolute', left: ancho * 0.32, top: ancho * 0.12, width: 3, height: ancho * 0.5, backgroundColor: 'rgba(255,255,255,0.8)', transform: [{ rotate: '-12deg' }] }} />
        <Animated.View style={[{ position: 'absolute', left: ancho * 0.36, top: ancho * 0.56 }, estiloBoya]}>
          <View style={[estilos.boya, estado === 'pica' && { backgroundColor: colores.amarillo }]} />
        </Animated.View>
        <View style={{ position: 'absolute', left: ancho * 0.55, top: ancho * 0.66, opacity: 0.45 }}><Objeto clave="pez" c1="#2E86AB" c2="#1B5E7A" size={34} /></View>
        <View style={{ position: 'absolute', left: ancho * 0.2, top: ancho * 0.78, opacity: 0.35 }}><Objeto clave="pez_globo" c1="#2E86AB" c2="#1B5E7A" size={40} /></View>
        <View style={{ position: 'absolute', left: ancho * 0.75, top: ancho * 0.5, opacity: 0.4 }}><Objeto clave="medusa" c1="#7FA8D9" c2="#5C82B8" size={30} /></View>

        {estado === 'pica' ? (
          <Pressable onPress={tirar} accessibilityRole="button" accessibilityLabel="Tirar la caña" style={StyleSheet.absoluteFill}>
            <View style={estilos.pica}><Texto variante="tituloGrande" style={{ color: colores.crema }}>¡Pica! Toca ya</Texto></View>
          </Pressable>
        ) : null}
      </View>

      {estado === 'resultado' && captura ? (
        <View style={estilos.tarjeta}>
          <IconoItem item={captura.item} size={72} />
          <Texto variante="titulo">{captura.item.categoria === 'fosil' ? '¡Un fósil!' : `¡${captura.item.nombre}!`}</Texto>
          <Texto variante="cuerpoBold" style={{ color: colores.amarilloOscuro, fontSize: 13 }}>{'★'.repeat(captura.item.rareza ?? 1)}{'☆'.repeat(4 - (captura.item.rareza ?? 1))} {ESTRELLAS[captura.item.rareza ?? 1]}</Texto>
          {captura.item.descripcion ? <Texto variante="apoyo" style={{ textAlign: 'center' }}>{captura.item.descripcion}</Texto> : null}
          <Texto variante="apoyo">{captura.besitos ? `+${captura.besitos} besitos` : 'Sin besitos (ya pescaste tres hoy), pero va al inventario.'}</Texto>
          <Texto variante="apoyo" style={{ fontSize: 12 }}>Puedes donarlo al museo o venderlo ahí mismo.</Texto>
        </View>
      ) : null}
      {estado === 'escapo' ? <Texto variante="cuerpoBold" style={{ textAlign: 'center', color: colores.rosaTinta }}>Se escapó. Hay que tirar apenas pica.</Texto> : null}

      {estado === 'listo' || estado === 'escapo' || estado === 'resultado' ? (
        <View style={{ gap: 10 }}>
          {cantidad('cebo') > 0 ? (
            <Pressable onPress={() => setUsarCebo((v) => !v)} accessibilityRole="checkbox" accessibilityState={{ checked: usarCebo }} style={estilos.cebo}>
              <View style={[estilos.caja, usarCebo && { backgroundColor: colores.rosaTinta }]} />
              <Texto variante="cuerpoBold" style={{ fontSize: 14 }}>Usar cebo (tienes {cantidad('cebo')}) · más suerte con los raros</Texto>
            </Pressable>
          ) : null}
          <BotonKawaii titulo={estado === 'listo' ? 'Lanzar la caña' : 'Otra vez'} onPress={lanzar} />
        </View>
      ) : estado === 'esperando' ? (
        <Texto variante="apoyo" style={{ textAlign: 'center' }}>Esperando que pique…</Texto>
      ) : null}
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  escena: { borderRadius: 24, overflow: 'hidden', ...sombras.rosada },
  boya: { width: 22, height: 22, borderRadius: 11, backgroundColor: colores.rosaFuerte, borderWidth: 4, borderColor: 'rgba(255,255,255,0.7)' },
  pica: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 18, backgroundColor: 'rgba(214,51,108,0.18)' },
  tarjeta: { backgroundColor: colores.crema, borderRadius: 24, padding: 18, alignItems: 'center', gap: 6, ...sombras.rosada },
  cebo: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44, paddingHorizontal: 4 },
  caja: { width: 22, height: 22, borderRadius: 7, borderWidth: 2, borderColor: colores.rosaTinta, backgroundColor: colores.crema },
});
