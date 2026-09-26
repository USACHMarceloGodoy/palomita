// Pesca en el muelle: lanzar, esperar que pique, enganchar a tiempo y luego
// el minijuego de la barra verde (MinijuegoPesca). Tres tiradas al día dan
// besitos; todas dan experiencia, y el nivel agranda la barra.
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
import { MinijuegoPesca, type ResultadoMinijuego } from '@/components/mascota/MinijuegoPesca';
import { elegirPez, equipoPesca, nivelPesca, RECOMPENSAS_MASCOTA, registrarCaptura, registrarEscape, tiradasHoy, type ResultadoCaptura } from '@/lib/mascota-virtual/acciones';
import { ESTRELLAS } from '@/lib/mascota-virtual/catalogo';
import type { Item } from '@/lib/mascota-virtual/tipos';
import { useMascota } from '@/lib/mascota-virtual/useMascota';
import { colores, sombras } from '@/lib/tema';

type Estado = 'listo' | 'esperando' | 'pica' | 'minijuego' | 'escapo' | 'resultado';
const COMPORTAMIENTO = { suave: 'Suave', fondo: 'De fondo', dardo: 'Dardo', escurridizo: 'Escurridizo', mixto: 'Mixto' } as const;

export default function Pesca() {
  const { width } = useWindowDimensions();
  const { rol, mascota, saldo, inventario, cantidad, recargar } = useMascota();
  const [estado, setEstado] = useState<Estado>('listo');
  const [tiradas, setTiradas] = useState(0);
  const [nivel, setNivel] = useState({ xp: 0, nivel: 0 });
  const [usarCebo, setUsarCebo] = useState(false);
  const [pez, setPez] = useState<Item | null>(null);
  const [captura, setCaptura] = useState<(ResultadoCaptura & { pez: Item; perfecto: boolean }) | null>(null);
  const cebo = useRef(false);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);
  const boya = useSharedValue(0);

  useEffect(() => {
    tiradasHoy(rol).then(setTiradas).catch(() => {});
    nivelPesca(rol).then(setNivel).catch(() => {});
  }, [rol]);
  useEffect(() => () => { if (temporizador.current) clearTimeout(temporizador.current); }, []);

  const estiloBoya = useAnimatedStyle(() => ({ transform: [{ translateY: boya.value }] }));
  const equipo = equipoPesca(inventario);

  function lanzar() {
    setCaptura(null); setPez(null);
    cebo.current = usarCebo && cantidad('cebo') > 0;
    setEstado('esperando');
    boya.value = withRepeat(withSequence(withTiming(-3, { duration: 700 }), withTiming(3, { duration: 700 })), -1, true);
    temporizador.current = setTimeout(() => {
      setEstado('pica');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      cancelAnimation(boya);
      boya.value = withRepeat(withSequence(withTiming(10, { duration: 90 }), withTiming(-6, { duration: 90 })), -1, true);
      temporizador.current = setTimeout(() => { cancelAnimation(boya); boya.value = withSpring(0); setEstado('escapo'); registrarEscape(rol, cebo.current).catch(() => {}); }, 1300);
    }, 1500 + Math.random() * 3000);
  }

  function enganchar() {
    if (estado !== 'pica') return;
    if (temporizador.current) clearTimeout(temporizador.current);
    cancelAnimation(boya); boya.value = withSpring(-30);
    const p = elegirPez(cebo.current);
    setPez(p);
    setEstado('minijuego');
  }

  async function terminarMinijuego(r: ResultadoMinijuego) {
    if (!pez) return;
    if (!r.exito) {
      await registrarEscape(rol, cebo.current).catch(() => {});
      setTiradas((t) => t + 1);
      setTimeout(() => setEstado('escapo'), 900);
      return;
    }
    const res = await registrarCaptura(rol, pez, { perfecto: r.perfecto, tesoro: r.tesoro, conCebo: cebo.current }).catch(() => null);
    if (!res) { setEstado('listo'); return; }
    setCaptura({ ...res, pez, perfecto: r.perfecto });
    setTiradas((t) => t + 1);
    setNivel((n) => ({ xp: n.xp + res.xp, nivel: res.nivel }));
    setTimeout(() => setEstado('resultado'), 900);
    recargar();
  }

  const restantes = Math.max(0, RECOMPENSAS_MASCOTA.pescaTiradasDia - tiradas);
  const ancho = Math.min(width - 40, 420);

  return (
    <Pantalla fondo="#BEE7FF" scroll={estado !== 'minijuego'}>
      <Cabecera titulo="Pesca" saldo={saldo} subtitulo={`Nivel ${nivel.nivel} · ${restantes ? `${restantes} ${restantes === 1 ? 'tirada' : 'tiradas'} con besitos hoy` : 'hoy ya diste las tres con besitos'}`} />

      {estado === 'minijuego' && pez ? (
        <View style={estilos.tarjetaJuego}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <IconoItem item={pez} size={36} />
            <View style={{ flex: 1 }}>
              <Texto variante="cuerpoBold">¡Algo picó!</Texto>
              <Texto variante="apoyo" style={{ fontSize: 12 }}>{COMPORTAMIENTO[pez.comportamiento ?? 'suave']} · dificultad {pez.dificultad ?? 1}/5 · {equipo.cana.nombre}{equipo.aparejos.length ? ` + ${equipo.aparejos.map((a) => a.nombre.toLowerCase()).join(', ')}` : ''}</Texto>
            </View>
          </View>
          <MinijuegoPesca pez={pez} nivel={nivel.nivel} barra={equipo.barra} drenaje={equipo.drenaje} rebote={equipo.rebote} onFin={terminarMinijuego} />
        </View>
      ) : (
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
            {mascota ? <MascotaVirtual especie={mascota.especie} orejas={mascota.orejas} hocico={mascota.hocico} ojos={mascota.ojos} boca={mascota.boca} c1={mascota.color_pelaje} c2={mascota.color_secundario} look={mascota.look} size={ancho * 0.3} animo={estado === 'escapo' ? 0.3 : 0.9} /> : null}
          </View>
          <View style={{ position: 'absolute', left: ancho * 0.32, top: ancho * 0.12, width: 3, height: ancho * 0.5, backgroundColor: 'rgba(255,255,255,0.8)', transform: [{ rotate: '-12deg' }] }} />
          <Animated.View style={[{ position: 'absolute', left: ancho * 0.36, top: ancho * 0.56 }, estiloBoya]}>
            <View style={[estilos.boya, estado === 'pica' && { backgroundColor: colores.amarillo }]} />
          </Animated.View>
          <View style={{ position: 'absolute', left: ancho * 0.55, top: ancho * 0.66, opacity: 0.45 }}><Objeto clave="pez" c1="#2E86AB" c2="#1B5E7A" size={34} /></View>
          <View style={{ position: 'absolute', left: ancho * 0.2, top: ancho * 0.78, opacity: 0.35 }}><Objeto clave="pez_globo" c1="#2E86AB" c2="#1B5E7A" size={40} /></View>
          <View style={{ position: 'absolute', left: ancho * 0.75, top: ancho * 0.5, opacity: 0.4 }}><Objeto clave="medusa" c1="#7FA8D9" c2="#5C82B8" size={30} /></View>
          {estado === 'pica' ? (
            <Pressable onPress={enganchar} accessibilityRole="button" accessibilityLabel="Enganchar" style={StyleSheet.absoluteFill}>
              <View style={estilos.pica}><Texto variante="tituloGrande" style={{ color: colores.crema }}>¡Pica! Toca ya</Texto></View>
            </Pressable>
          ) : null}
        </View>
      )}

      {estado === 'resultado' && captura ? (
        <View style={estilos.tarjeta}>
          <IconoItem item={captura.pez} size={72} />
          <Texto variante="titulo">{captura.pez.categoria === 'fosil' ? '¡Un fósil!' : `¡${captura.pez.nombre}!`}</Texto>
          <Texto variante="cuerpoBold" style={{ color: colores.amarilloOscuro, fontSize: 13 }}>{'★'.repeat(captura.pez.rareza ?? 1)}{'☆'.repeat(4 - (captura.pez.rareza ?? 1))} {ESTRELLAS[captura.pez.rareza ?? 1]}{captura.perfecto ? ' · ¡PERFECTO!' : ''}</Texto>
          {captura.regaloCofre ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFF3C4', borderRadius: 14, padding: 8 }}>
              <Objeto clave="cofre" c1="#C99A6B" c2="#FFD93D" size={28} /><Texto variante="cuerpoBold" style={{ fontSize: 13 }}>Cofre: {captura.regaloCofre.nombre}</Texto>
            </View>
          ) : null}
          <Texto variante="apoyo">{captura.besitos ? `+${captura.besitos} besitos · ` : ''}+{captura.xp} xp{captura.subioNivel ? ` · ¡Nivel ${captura.nivel}!` : ''}</Texto>
          {!captura.conRecompensa ? <Texto variante="apoyo" style={{ fontSize: 12 }}>Sin besitos (ya van tres hoy), pero va al inventario y suma experiencia.</Texto> : null}
        </View>
      ) : null}
      {estado === 'escapo' ? <Texto variante="cuerpoBold" style={{ textAlign: 'center', color: colores.rosaTinta }}>Se escapó. La próxima vez, mantén al pez dentro del verde.</Texto> : null}

      {estado === 'listo' || estado === 'escapo' || estado === 'resultado' ? (
        <View style={{ gap: 10 }}>
          {cantidad('cebo') > 0 ? (
            <Pressable onPress={() => setUsarCebo((v) => !v)} accessibilityRole="checkbox" accessibilityState={{ checked: usarCebo }} style={estilos.cebo}>
              <View style={[estilos.caja, usarCebo && { backgroundColor: colores.rosaTinta }]} />
              <Texto variante="cuerpoBold" style={{ fontSize: 14 }}>Usar cebo (tienes {cantidad('cebo')}) · más suerte con los raros</Texto>
            </Pressable>
          ) : null}
          <Texto variante="apoyo" style={{ fontSize: 12, textAlign: 'center' }}>{equipo.cana.nombre}{equipo.aparejos.length ? ` · ${equipo.aparejos.map((a) => a.nombre).join(' · ')}` : ' · sin aparejos'} · barra ×{(equipo.barra * (1 + nivel.nivel * 0.045)).toFixed(2)}</Texto>
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
  tarjetaJuego: { backgroundColor: colores.crema, borderRadius: 24, padding: 14, gap: 12, alignItems: 'stretch', ...sombras.rosada },
  boya: { width: 22, height: 22, borderRadius: 11, backgroundColor: colores.rosaFuerte, borderWidth: 4, borderColor: 'rgba(255,255,255,0.7)' },
  pica: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 18, backgroundColor: 'rgba(214,51,108,0.18)' },
  tarjeta: { backgroundColor: colores.crema, borderRadius: 24, padding: 18, alignItems: 'center', gap: 6, ...sombras.rosada },
  cebo: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44, paddingHorizontal: 4 },
  caja: { width: 22, height: 22, borderRadius: 7, borderWidth: 2, borderColor: colores.rosaTinta, backgroundColor: colores.crema },
});
