// Estadio: carrera de diez segundos contra dos vecinos. Cada toque empuja; de
// vez en cuando aparece una flecha y hay que deslizar hacia arriba o hacia
// abajo a tiempo, como en un juego de ritmo: acierto = impulso, error = tropezón.
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { FadeOut, runOnJS, ZoomIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Svg, { Path } from 'react-native-svg';
import { Pantalla } from '@/components/Pantalla';
import { Texto } from '@/components/Texto';
import { BotonKawaii } from '@/components/BotonKawaii';
import { Figura } from '@/components/Figuras';
import { Cabecera } from '@/components/mascota/Cabecera';
import { IconoItem } from '@/components/mascota/IconosMascota';
import { MascotaVirtual } from '@/components/mascota/MascotaVirtual';
import { carreraDeHoy, RECOMPENSAS_MASCOTA, registrarCarrera } from '@/lib/mascota-virtual/acciones';
import { useMascota } from '@/lib/mascota-virtual/useMascota';
import { colores, sombras } from '@/lib/tema';

const DURACION = 10_000;
const VECINOS = [
  { nombre: 'Tomás el gato', forma: 'gatito' as const, c1: '#FFF8F0', c2: '#FFB3C6', fondo: '#E1ECFF' },
  { nombre: 'Lupe la coneja', forma: 'conejito' as const, c1: '#FFF8F0', c2: '#FFB3C6', fondo: '#FFF3C4' },
];
type Pista = { dir: 'arriba' | 'abajo'; hasta: number; id: number };

export default function Estadio() {
  const { rol, mascota, saldo, cantidad, recargar } = useMascota();
  const [fase, setFase] = useState<'antes' | 'corriendo' | 'fin'>('antes');
  const [yo, setYo] = useState(0);
  const [vecinos, setVecinos] = useState([0, 0]);
  const [tiempo, setTiempo] = useState(DURACION);
  const [lugar, setLugar] = useState<1 | 2 | 3 | null>(null);
  const [ganado, setGanado] = useState(0);
  const [hechaHoy, setHechaHoy] = useState(false);
  const [pista, setPista] = useState<Pista | null>(null);
  const [feedback, setFeedback] = useState<{ texto: string; bueno: boolean; id: number } | null>(null);
  const [aciertos, setAciertos] = useState(0);
  const toques = useRef(0);
  const inicio = useRef(0);
  const pistaRef = useRef<Pista | null>(null);
  const proximaPista = useRef(0);

  useEffect(() => { carreraDeHoy(rol).then((p) => setHechaHoy(!!p)).catch(() => {}); }, [rol]);

  useEffect(() => {
    if (fase !== 'corriendo') return;
    const velocidades = VECINOS.map(() => 0.6 + Math.random() * 0.5);
    proximaPista.current = 1200 + Math.random() * 800;
    const id = setInterval(() => {
      const t = Date.now() - inicio.current;
      setTiempo(Math.max(0, DURACION - t));
      setVecinos((v) => v.map((x, i) => Math.min(100, x + velocidades[i] * (0.7 + Math.random() * 0.6))));
      // pistas de ritmo
      const p = pistaRef.current;
      if (p && Date.now() > p.hasta) { fallar('Tarde…'); }
      if (!p && t > proximaPista.current && t < DURACION - 1300) {
        const nueva: Pista = { dir: Math.random() < 0.5 ? 'arriba' : 'abajo', hasta: Date.now() + 1200, id: Date.now() };
        pistaRef.current = nueva; setPista(nueva);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      }
      if (t >= DURACION) { clearInterval(id); pistaRef.current = null; setPista(null); setFase('fin'); }
    }, 100);
    return () => clearInterval(id);
  }, [fase]);

  useEffect(() => {
    if (fase !== 'fin') return;
    const orden = [yo, ...vecinos].map((d, i) => ({ d, i })).sort((a, b) => b.d - a.d);
    const pos = (orden.findIndex((o) => o.i === 0) + 1) as 1 | 2 | 3;
    setLugar(pos);
    Haptics.notificationAsync(pos === 1 ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning).catch(() => {});
    registrarCarrera(rol, pos, toques.current).then((b) => { setGanado(b); if (b) setHechaHoy(true); recargar(); }).catch(() => {});
  }, [fase]);

  function empezar() {
    toques.current = 0; inicio.current = Date.now(); pistaRef.current = null;
    setYo(0); setVecinos([0, 0]); setLugar(null); setGanado(0); setTiempo(DURACION); setPista(null); setAciertos(0);
    setFase('corriendo');
  }
  function mostrar(texto: string, bueno: boolean) { setFeedback({ texto, bueno, id: Date.now() }); }
  function fallar(texto: string) {
    pistaRef.current = null; setPista(null);
    proximaPista.current = Date.now() - inicio.current + 1200 + Math.random() * 1000;
    setYo((y) => Math.max(0, y - 4));
    mostrar(texto, false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
  }

  function gesto(dir: 'arriba' | 'abajo' | 'toque') {
    if (fase !== 'corriendo') return;
    const p = pistaRef.current;
    if (dir === 'toque') {
      toques.current += 1;
      Haptics.selectionAsync().catch(() => {});
      setYo((y) => Math.min(100, y + 2));
      return;
    }
    if (p && p.dir === dir) {
      pistaRef.current = null; setPista(null);
      proximaPista.current = Date.now() - inicio.current + 1200 + Math.random() * 1000;
      setYo((y) => Math.min(100, y + 9)); setAciertos((a) => a + 1);
      mostrar('¡Perfecto!', true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } else {
      fallar(p ? '¡Al revés!' : 'Tropezón');
    }
  }

  const pan = Gesture.Pan().minDistance(0)
    .onEnd((e) => {
      if (e.translationY < -40) runOnJS(gesto)('arriba');
      else if (e.translationY > 40) runOnJS(gesto)('abajo');
      else runOnJS(gesto)('toque');
    });

  return (
    <Pantalla fondo="#FFF3C4" scroll={fase !== 'corriendo'}>
      <Cabecera titulo="Estadio" saldo={saldo} subtitulo={hechaHoy ? 'La carrera de hoy ya dio premio; las demás son por gusto.' : 'Toca para correr; cuando salga la flecha, desliza.'} />

      <View style={estilos.pista}>
        <Carril nombre={mascota?.nombre ?? 'Tú'} avance={yo} fondo={colores.rosaClaro}>
          {mascota ? <MascotaVirtual especie={mascota.especie} orejas={mascota.orejas} hocico={mascota.hocico} ojos={mascota.ojos} boca={mascota.boca} c1={mascota.color_pelaje} c2={mascota.color_secundario} look={mascota.look} size={40} quieta /> : null}
        </Carril>
        {VECINOS.map((v, i) => (
          <Carril key={v.nombre} nombre={v.nombre} avance={vecinos[i]} fondo={v.fondo}>
            <Figura forma={v.forma} c1={v.c1} c2={v.c2} size={36} />
          </Carril>
        ))}
        <Texto variante="apoyo" style={{ textAlign: 'right', fontSize: 12 }}>Meta →</Texto>
      </View>

      {fase === 'corriendo' ? (
        <GestureDetector gesture={pan}>
          <View style={[estilos.botonCorrer, pista && { backgroundColor: pista.dir === 'arriba' ? '#3B7DD8' : '#8A6BD1' }]} accessible accessibilityLabel={pista ? `Desliza hacia ${pista.dir}` : 'Toca para correr'}>
            {pista ? (
              <Animated.View key={pista.id} entering={ZoomIn.duration(150)} style={{ alignItems: 'center' }}>
                <Svg width={64} height={64} viewBox="0 0 24 24" fill="none">
                  <Path d={pista.dir === 'arriba' ? 'M12 20V4M5 11l7-7 7 7' : 'M12 4v16M5 13l7 7 7-7'} stroke={colores.crema} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
                <Texto variante="tituloGrande" style={{ color: colores.crema }}>¡Desliza {pista.dir}!</Texto>
              </Animated.View>
            ) : (
              <Texto variante="tituloGrande" style={{ color: colores.crema }}>¡Toca, toca!</Texto>
            )}
            <Texto variante="cuerpoBold" style={{ color: colores.crema }}>{(tiempo / 1000).toFixed(1)} s</Texto>
            {feedback ? (
              <Animated.View key={feedback.id} entering={ZoomIn.duration(120)} exiting={FadeOut.duration(300)} style={[estilos.feedback, { backgroundColor: feedback.bueno ? colores.amarillo : colores.crema }]}>
                <Texto variante="cuerpoBold" style={{ fontSize: 13, color: feedback.bueno ? colores.carbon : colores.rosaTinta }}>{feedback.texto}</Texto>
              </Animated.View>
            ) : null}
          </View>
        </GestureDetector>
      ) : null}

      {fase === 'fin' && lugar ? (
        <View style={estilos.resultado}>
          <IconoItem item={lugar === 1 ? 'trofeo_oro' : lugar === 2 ? 'trofeo_plata' : 'trofeo_bronce'} size={64} />
          <Texto variante="tituloGrande" style={{ color: colores.crema }}>{lugar === 1 ? '¡Primer lugar!' : lugar === 2 ? '¡Segundo lugar!' : 'Tercer lugar'}</Texto>
          <Texto variante="cuerpoBold" style={{ color: colores.rosaBase }}>{aciertos} {aciertos === 1 ? 'flecha perfecta' : 'flechas perfectas'} · {ganado ? `+${ganado} besitos y trofeo` : 'por gusto: sin premio, pero con orgullo.'}</Texto>
        </View>
      ) : null}

      {fase !== 'corriendo' ? <BotonKawaii titulo={fase === 'fin' ? 'Otra carrera' : 'Empezar'} onPress={empezar} /> : null}

      {fase !== 'corriendo' ? (
        <View style={estilos.vitrina}>
          <Texto variante="etiqueta">Tus trofeos</Texto>
          <View style={{ flexDirection: 'row', gap: 14 }}>
            {(['trofeo_oro', 'trofeo_plata', 'trofeo_bronce'] as const).map((t) => (
              <View key={t} style={{ alignItems: 'center', gap: 2 }}>
                <IconoItem item={t} size={40} />
                <Texto variante="cuerpoBold" style={{ fontSize: 13 }}>×{cantidad(t)}</Texto>
              </View>
            ))}
          </View>
          <Texto variante="apoyo" style={{ fontSize: 12 }}>Oro {RECOMPENSAS_MASCOTA.estadio[1]} · Plata {RECOMPENSAS_MASCOTA.estadio[2]} · Bronce {RECOMPENSAS_MASCOTA.estadio[3]} besitos</Texto>
        </View>
      ) : null}
    </Pantalla>
  );
}

function Carril({ nombre, avance, fondo, children }: { nombre: string; avance: number; fondo: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 2 }}>
      <Texto variante="apoyo" style={{ fontSize: 11 }}>{nombre}</Texto>
      <View style={[estilos.carril, { backgroundColor: fondo }]}>
        <View style={{ position: 'absolute', left: `${Math.min(avance, 100) * 0.88}%`, top: 2 }}>{children}</View>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  pista: { backgroundColor: colores.crema, borderRadius: 24, padding: 16, gap: 8, ...sombras.rosada },
  carril: { height: 44, borderRadius: 12, overflow: 'hidden' },
  botonCorrer: { flex: 1, minHeight: 180, borderRadius: 28, backgroundColor: colores.rosaTinta, alignItems: 'center', justifyContent: 'center', gap: 6, ...sombras.rosada },
  feedback: { position: 'absolute', top: 12, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999 },
  resultado: { backgroundColor: colores.rosaTinta, borderRadius: 24, padding: 18, alignItems: 'center', gap: 6 },
  vitrina: { backgroundColor: colores.crema, borderRadius: 20, padding: 14, gap: 8, alignItems: 'center' },
});
