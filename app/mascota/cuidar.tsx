// Cuidar a la mascota con las manos: acariciarla pasando el dedo, arrastrarle
// la comida a la boca, enjabonarla con el jabón y mojarla con la manguera.
// Es una pantalla (no un modal) porque los gestos no llegan dentro de un Modal
// en Android.
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { FadeOut, runOnJS, useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming, ZoomIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Svg, { Ellipse, Path, Rect } from 'react-native-svg';
import { Pantalla } from '@/components/Pantalla';
import { Texto } from '@/components/Texto';
import { BotonKawaii } from '@/components/BotonKawaii';
import { Figura } from '@/components/Figuras';
import { Particulas, type TipoParticula } from '@/components/Particulas';
import { Cabecera } from '@/components/mascota/Cabecera';
import { Habitacion } from '@/components/mascota/Habitacion';
import { IconoItem, Objeto } from '@/components/mascota/IconosMascota';
import { MascotaVirtual } from '@/components/mascota/MascotaVirtual';
import { acariciar, alimentar, banar } from '@/lib/mascota-virtual/acciones';
import { item } from '@/lib/mascota-virtual/catalogo';
import type { Item, Mascota } from '@/lib/mascota-virtual/tipos';
import { useMascota } from '@/lib/mascota-virtual/useMascota';
import { colores, sombras } from '@/lib/tema';

type Modo = 'acariciar' | 'alimentar' | 'banar';

export default function Cuidar() {
  const { modo: m } = useLocalSearchParams<{ modo?: string }>();
  const modo: Modo = m === 'alimentar' || m === 'banar' ? m : 'acariciar';
  const router = useRouter();
  const { rol, mascota, valores, inventario, recargar } = useMascota();
  const [festejo, setFestejo] = useState<TipoParticula | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const { width } = useWindowDimensions();
  const ancho = Math.min(width - 40, 420);

  function celebrar(tipo: TipoParticula, texto: string) {
    setFestejo(tipo); setAviso(texto);
    setTimeout(() => { setFestejo(null); setAviso(null); }, 2600);
  }

  if (!mascota) return <Pantalla fondo={colores.rosaBase}><Cabecera titulo="Cuidar" /></Pantalla>;
  const titulo = { acariciar: `Acariciar a ${mascota.nombre}`, alimentar: `Alimentar a ${mascota.nombre}`, banar: `Bañar a ${mascota.nombre}` }[modo];
  const sub = {
    acariciar: 'Pasa el dedo por su cabeza, despacito.',
    alimentar: 'Arrastra la comida hasta su boca.',
    banar: 'Primero el jabón, después la manguera.',
  }[modo];

  return (
    <Pantalla fondo={modo === 'banar' ? '#E8F6FF' : colores.rosaBase} scroll={false}>
      {festejo ? <Particulas tipo={festejo} densidad={16} duracion={2200} /> : null}
      <Cabecera titulo={titulo} subtitulo={sub} />
      {aviso ? <View style={estilos.aviso}><Texto variante="cuerpoBold" style={{ color: colores.crema }}>{aviso}</Texto></View> : null}
      {modo === 'acariciar' ? (
        <Acariciar mascota={mascota} ancho={ancho} onListo={async () => {
          const b = await acariciar(rol).catch(() => 0);
          celebrar('corazones', b ? `Le encantó. +${b} besitos` : 'Le encantó.');
          recargar();
        }} />
      ) : modo === 'alimentar' ? (
        <Alimentar mascota={mascota} ancho={ancho} hambre={valores.hambre}
          comida={inventario.map((i) => ({ it: item(i.item_id), n: i.cantidad })).filter((x): x is { it: Item; n: number } => !!x.it && !!x.it.efecto)}
          onDar={async (id) => {
            const r = await alimentar(rol, id).catch(() => ({ ok: false, besitos: 0 }));
            if (!r.ok) return;
            celebrar('comida', r.besitos ? `Ñam. +${r.besitos} besitos` : 'Ñam.');
            recargar();
          }}
          irTienda={() => router.push('/mascota/tienda')}
        />
      ) : (
        <Banar mascota={mascota} ancho={ancho} onListo={async () => {
          const b = await banar(rol).catch(() => 0);
          celebrar('lluvia', b ? `Limpita. +${b} besitos` : 'Limpita.');
          recargar();
        }} />
      )}
    </Pantalla>
  );
}

function Mascotita({ mascota, size, animo, boca, quieta }: { mascota: Mascota; size: number; animo?: number; boca?: Mascota['boca']; quieta?: boolean }) {
  return (
    <MascotaVirtual
      especie={mascota.especie} orejas={mascota.orejas} hocico={mascota.hocico} ojos={mascota.ojos} boca={boca ?? mascota.boca}
      c1={mascota.color_pelaje} c2={mascota.color_secundario} look={mascota.look} animo={animo ?? 0.85} size={size} quieta={quieta}
    />
  );
}

// ---------------------------------------------------------------------------
// Acariciar: deslizar el dedo sobre ella. Un toque solo no cuenta.
// ---------------------------------------------------------------------------
const META_CARICIA = 1400;

function Acariciar({ mascota, ancho, onListo }: { mascota: Mascota; ancho: number; onListo: () => void }) {
  const [avance, setAvance] = useState(0);
  const [corazones, setCorazones] = useState<{ id: number; x: number; y: number }[]>([]);
  const [listo, setListo] = useState(false);
  const ultimo = useRef<{ x: number; y: number } | null>(null);
  const acumulado = useRef(0);
  const desdeCorazon = useRef(0);
  const alto = (ancho * 230) / 360;

  function mover(x: number, y: number) {
    if (listo) return;
    if (ultimo.current) {
      const d = Math.hypot(x - ultimo.current.x, y - ultimo.current.y);
      if (d < 60) {
        acumulado.current += d;
        desdeCorazon.current += d;
        if (desdeCorazon.current > 55) {
          desdeCorazon.current = 0;
          Haptics.selectionAsync().catch(() => {});
          setCorazones((c) => [...c.slice(-10), { id: Date.now() + Math.random(), x, y }]);
        }
        setAvance(Math.min(1, acumulado.current / META_CARICIA));
        if (acumulado.current >= META_CARICIA) { setListo(true); onListo(); }
      }
    }
    ultimo.current = { x, y };
  }
  function soltar() { ultimo.current = null; }

  const pan = Gesture.Pan().minDistance(0)
    .onBegin((e) => { runOnJS(mover)(e.x, e.y); })
    .onUpdate((e) => { runOnJS(mover)(e.x, e.y); })
    .onFinalize(() => { runOnJS(soltar)(); });

  useEffect(() => {
    if (!corazones.length) return;
    const t = setTimeout(() => setCorazones((c) => c.slice(1)), 900);
    return () => clearTimeout(t);
  }, [corazones]);

  return (
    <View style={{ flex: 1, gap: 14 }}>
      <GestureDetector gesture={pan}>
        <View style={{ alignSelf: 'center', width: ancho, height: alto, ...sombras.rosada }} accessible accessibilityLabel="Zona para acariciar: desliza el dedo">
          <Habitacion habitacion={mascota.decoracion.habitaciones[0]} ancho={ancho}>
            <Mascotita mascota={mascota} size={ancho * 0.5} animo={listo ? 1 : 0.6 + avance * 0.4} boca={listo ? 'sonrisa' : undefined} />
          </Habitacion>
          {corazones.map((c) => (
            <Animated.View key={c.id} entering={ZoomIn.duration(160)} exiting={FadeOut.duration(400)} pointerEvents="none" style={{ position: 'absolute', left: c.x - 12, top: c.y - 30 }}>
              <Figura forma="corazon" c1={colores.rosaFuerte} c2={colores.rosaFuerte} size={24} />
            </Animated.View>
          ))}
        </View>
      </GestureDetector>
      <View style={estilos.pista}><View style={[estilos.relleno, { width: `${avance * 100}%`, backgroundColor: colores.rosaFuerte }]} /></View>
      <Texto variante="apoyo" style={{ textAlign: 'center' }}>{listo ? 'Ronronea (a su manera).' : avance > 0 ? 'Sigue, sigue…' : 'Desliza el dedo sobre su cabeza.'}</Texto>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Alimentar: arrastrar un ítem de la bandeja hasta la boca.
// ---------------------------------------------------------------------------
function Alimentar({ mascota, ancho, hambre, comida, onDar, irTienda }: { mascota: Mascota; ancho: number; hambre: number; comida: { it: Item; n: number }[]; onDar: (id: string) => void; irTienda: () => void }) {
  const alto = (ancho * 230) / 360;
  const escenaRef = useRef<View>(null);
  const [rect, setRect] = useState<{ x: number; y: number } | null>(null);
  const [comiendo, setComiendo] = useState(false);
  const [ultima, setUltima] = useState<Item | null>(null);
  const tamMascota = ancho * 0.5;
  // Boca: centro de la mascota, un poco abajo. Coordenadas relativas a la escena.
  const boca = { x: ancho / 2, y: alto - 4 - tamMascota * 0.32 };

  function soltar(absX: number, absY: number, id: string): boolean {
    if (!rect || comiendo) return false;
    const x = absX - rect.x, y = absY - rect.y;
    if (Math.hypot(x - boca.x, y - boca.y) > tamMascota * 0.36) return false;
    const it = item(id) ?? null;
    setUltima(it); setComiendo(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setTimeout(() => setComiendo(false), 900);
    onDar(id);
    return true;
  }

  return (
    <View style={{ flex: 1, gap: 12 }}>
      <View ref={escenaRef} collapsable={false} onLayout={() => escenaRef.current?.measureInWindow((x, y) => setRect({ x, y }))} style={{ alignSelf: 'center', width: ancho, height: alto, ...sombras.rosada }}>
        <Habitacion habitacion={mascota.decoracion.habitaciones[0]} ancho={ancho}>
          <Mascotita mascota={mascota} size={tamMascota} animo={comiendo ? 1 : 0.7} boca={comiendo ? 'abierta' : undefined} />
        </Habitacion>
        {comiendo && ultima ? (
          <Animated.View entering={ZoomIn} exiting={FadeOut} pointerEvents="none" style={{ position: 'absolute', left: boca.x - 16, top: boca.y - 40 }}>
            <Texto variante="cuerpoBold" style={{ color: colores.rosaTinta }}>+{ultima.efecto?.hambre ?? 0}</Texto>
          </Animated.View>
        ) : null}
        {!comiendo ? <View pointerEvents="none" style={[estilos.blanco, { left: boca.x - 22, top: boca.y - 22 }]} /> : null}
      </View>
      <Texto variante="apoyo" style={{ textAlign: 'center', fontSize: 13 }}>Hambre al {hambre} %. {comida.length ? 'Arrastra algo al círculo.' : 'No tienes comida.'}</Texto>
      <View style={estilos.bandeja}>
        {comida.map(({ it, n }) => <Arrastrable key={it.id} onSoltar={(x, y) => soltar(x, y, it.id)}>
          <View style={estilos.itemBandeja}>
            <IconoItem item={it} size={40} />
            <Texto variante="apoyo" style={{ fontSize: 10 }} numberOfLines={1}>{it.nombre} ×{n}</Texto>
          </View>
        </Arrastrable>)}
      </View>
      {comida.length === 0 ? <BotonKawaii titulo="Ir a la tienda" variante="secundario" onPress={irTienda} /> : null}
    </View>
  );
}

/** Algo que se arrastra y vuelve a su lugar; avisa dónde se soltó (coordenadas de ventana). */
function Arrastrable({ children, onSoltar, deshabilitado }: { children: React.ReactNode; onSoltar: (absX: number, absY: number) => boolean | void; deshabilitado?: boolean }) {
  const tx = useSharedValue(0), ty = useSharedValue(0), activo = useSharedValue(0);
  const pan = Gesture.Pan().enabled(!deshabilitado)
    .onBegin(() => { activo.value = 1; })
    .onUpdate((e) => { tx.value = e.translationX; ty.value = e.translationY; })
    .onEnd((e) => { runOnJS(onSoltar)(e.absoluteX, e.absoluteY); })
    .onFinalize(() => { tx.value = withSpring(0); ty.value = withSpring(0); activo.value = 0; });
  const estilo = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: 1 + activo.value * 0.15 }],
    zIndex: activo.value ? 20 : 1,
    opacity: deshabilitado ? 0.4 : 1,
  }));
  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={estilo}>{children}</Animated.View>
    </GestureDetector>
  );
}

// ---------------------------------------------------------------------------
// Bañar: jabón (frotar sobre ella) y después manguera (sostener encima).
// ---------------------------------------------------------------------------
function Banar({ mascota, ancho, onListo }: { mascota: Mascota; ancho: number; onListo: () => void }) {
  const alto = ancho * 0.8;
  const [espuma, setEspuma] = useState(0);
  const [agua, setAgua] = useState(0);
  const [fase, setFase] = useState<'jabon' | 'manguera' | 'listo'>('jabon');
  const [burbujas, setBurbujas] = useState<{ id: number; x: number; y: number; s: number }[]>([]);
  const [gotas, setGotas] = useState<{ id: number; x: number; y: number }[]>([]);
  const ultimo = useRef<{ x: number; y: number } | null>(null);
  const mojando = useRef(false);
  const tam = ancho * 0.46;
  const centro = { x: ancho / 2, y: alto * 0.5 };
  const dentro = (x: number, y: number) => Math.hypot(x - centro.x, y - centro.y) < tam * 0.42;

  // Jabón: frotar dentro de la mascota va sumando espuma.
  function frotar(x: number, y: number) {
    if (fase !== 'jabon') return;
    if (ultimo.current && dentro(x, y)) {
      const d = Math.hypot(x - ultimo.current.x, y - ultimo.current.y);
      if (d < 60 && d > 1) {
        setEspuma((e) => {
          const n = Math.min(100, e + d / 9);
          if (n >= 100) { setFase('manguera'); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}); }
          return n;
        });
        if (Math.random() < 0.35) setBurbujas((b) => [...b.slice(-28), { id: Date.now() + Math.random(), x: x + (Math.random() - 0.5) * 30, y: y + (Math.random() - 0.5) * 30, s: 10 + Math.random() * 16 }]);
      }
    }
    ultimo.current = { x, y };
  }

  // Manguera: sostenerla encima va mojando (y se lleva la espuma).
  useEffect(() => {
    if (fase !== 'manguera') return;
    const id = setInterval(() => {
      if (!mojando.current) return;
      setAgua((a) => {
        const n = Math.min(100, a + 2.2);
        if (n >= 100) { setFase('listo'); onListo(); }
        return n;
      });
      setEspuma((e) => Math.max(0, e - 2.5));
      setGotas((g) => [...g.slice(-16), { id: Date.now() + Math.random(), x: centro.x + (Math.random() - 0.5) * tam * 0.8, y: centro.y - tam * 0.4 + Math.random() * 20 }]);
    }, 80);
    return () => clearInterval(id);
  }, [fase]);

  useEffect(() => {
    if (!gotas.length) return;
    const t = setTimeout(() => setGotas((g) => g.slice(4)), 500);
    return () => clearTimeout(t);
  }, [gotas]);

  const visibles = burbujas.slice(0, Math.round((espuma / 100) * burbujas.length));

  return (
    <View style={{ flex: 1, gap: 12 }}>
      <View style={{ alignSelf: 'center', width: ancho, height: alto, borderRadius: 24, overflow: 'hidden', backgroundColor: '#D6EEFF', ...sombras.rosada }}>
        <Svg width={ancho} height={alto} viewBox="0 0 360 288" style={StyleSheet.absoluteFill}>
          <Rect x={0} y={0} width={360} height={288} fill="#D6EEFF" />
          <Rect x={0} y={0} width={360} height={180} fill="#E8F6FF" />
          {Array.from({ length: 5 }, (_, i) => <Path key={i} d={`M0 ${30 + i * 30}h360`} stroke="#FFFFFF" strokeWidth={2} opacity={0.6} />)}
          <Ellipse cx={180} cy={232} rx={130} ry={30} fill="#FFFFFF" stroke="#4A3B45" strokeWidth={2.5} />
          <Rect x={50} y={180} width={260} height={52} fill="#FFFFFF" stroke="#4A3B45" strokeWidth={2.5} />
          <Ellipse cx={180} cy={180} rx={130} ry={30} fill="#BEE7FF" stroke="#4A3B45" strokeWidth={2.5} />
          <Path d="M300 176V150a12 12 0 0 0-24 0" fill="none" stroke="#9A9AA8" strokeWidth={5} strokeLinecap="round" />
        </Svg>
        <View pointerEvents="none" style={{ position: 'absolute', left: centro.x - tam / 2, top: centro.y - tam * 0.55 }}>
          <Mascotita mascota={mascota} size={tam} animo={fase === 'listo' ? 1 : 0.7} boca={fase === 'listo' ? 'sonrisa' : undefined} />
        </View>
        {/* agua de la tina por delante, tapa la mitad de abajo */}
        <Svg width={ancho} height={alto} viewBox="0 0 360 288" pointerEvents="none" style={StyleSheet.absoluteFill}>
          <Ellipse cx={180} cy={180} rx={126} ry={26} fill="#BEE7FF" opacity={0.85} />
          <Rect x={54} y={180} width={252} height={50} fill="#BEE7FF" opacity={0.85} />
          <Ellipse cx={180} cy={232} rx={126} ry={28} fill="#BEE7FF" opacity={0.85} />
        </Svg>
        {visibles.map((b) => (
          <View key={b.id} pointerEvents="none" style={{ position: 'absolute', left: b.x - b.s / 2, top: b.y - b.s / 2, width: b.s, height: b.s, borderRadius: b.s / 2, backgroundColor: 'rgba(255,255,255,0.85)', borderWidth: 1.5, borderColor: '#BEE7FF' }} />
        ))}
        {gotas.map((g) => (
          <Animated.View key={g.id} entering={ZoomIn.duration(80)} exiting={FadeOut.duration(200)} pointerEvents="none" style={{ position: 'absolute', left: g.x, top: g.y, width: 6, height: 10, borderRadius: 4, backgroundColor: '#6BC8E8' }} />
        ))}
        {/* herramientas en el piso */}
        <Herramienta x={24} y={alto - 74} activa={fase === 'jabon'} onMover={frotar} onFin={() => { ultimo.current = null; }} etiqueta="Jabón">
          <Objeto clave="jabon" c1="#FFB3C6" c2="#FFFFFF" size={56} />
        </Herramienta>
        <Herramienta x={ancho - 84} y={alto - 74} activa={fase === 'manguera'} onMover={(x, y) => { mojando.current = dentro(x, y - 20); }} onFin={() => { mojando.current = false; }} etiqueta="Manguera">
          <Objeto clave="manguera" c1="#3E8A62" c2="#9A9AA8" size={60} />
        </Herramienta>
      </View>
      <View style={{ gap: 6 }}>
        <View style={estilos.pista}><View style={[estilos.relleno, { width: `${espuma}%`, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#BEE7FF' }]} /></View>
        <View style={estilos.pista}><View style={[estilos.relleno, { width: `${agua}%`, backgroundColor: '#6BC8E8' }]} /></View>
      </View>
      <Texto variante="apoyo" style={{ textAlign: 'center' }}>
        {fase === 'jabon' ? 'Toma el jabón y frótalo sobre ella.' : fase === 'manguera' ? 'Ahora la manguera: sostenla encima para enjuagar.' : 'Limpita y contenta.'}
      </Texto>
    </View>
  );
}

function Herramienta({ x, y, activa, onMover, onFin, etiqueta, children }: { x: number; y: number; activa: boolean; onMover: (x: number, y: number) => void; onFin: () => void; etiqueta: string; children: React.ReactNode }) {
  const tx = useSharedValue(0), ty = useSharedValue(0), act = useSharedValue(0);
  const pan = Gesture.Pan().enabled(activa).minDistance(0)
    .onBegin(() => { act.value = 1; })
    .onUpdate((e) => { tx.value = e.translationX; ty.value = e.translationY; runOnJS(onMover)(x + 28 + e.translationX, y + 28 + e.translationY); })
    .onFinalize(() => { tx.value = withSpring(0); ty.value = withSpring(0); act.value = 0; runOnJS(onFin)(); });
  const estilo = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }, { rotate: `${act.value * -15}deg` }],
    zIndex: act.value ? 20 : 2,
  }));
  const brillo = useSharedValue(0);
  useEffect(() => { brillo.value = activa ? withSequence(withTiming(1, { duration: 400 }), withTiming(0.4, { duration: 400 }), withTiming(1, { duration: 400 })) : withTiming(0, { duration: 200 }); }, [activa]);
  const halo = useAnimatedStyle(() => ({ opacity: brillo.value }));
  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[{ position: 'absolute', left: x, top: y, width: 60, height: 60, alignItems: 'center', justifyContent: 'center', opacity: activa ? 1 : 0.45 }, estilo]} accessible accessibilityLabel={`${etiqueta}${activa ? ', arrástralo' : ''}`}>
        <Animated.View style={[StyleSheet.absoluteFill, { borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.7)' }, halo]} />
        {children}
      </Animated.View>
    </GestureDetector>
  );
}

const estilos = StyleSheet.create({
  aviso: { alignSelf: 'center', paddingVertical: 8, paddingHorizontal: 18, borderRadius: 999, backgroundColor: colores.rosaTinta },
  pista: { height: 12, borderRadius: 6, backgroundColor: colores.rosaClaro, overflow: 'hidden' },
  relleno: { height: '100%', borderRadius: 6 },
  bandeja: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, overflow: 'visible' },
  itemBandeja: { width: 66, height: 70, borderRadius: 14, backgroundColor: colores.crema, alignItems: 'center', justifyContent: 'center', gap: 2, ...sombras.rosadaSuave },
  blanco: { position: 'absolute', width: 44, height: 44, borderRadius: 22, borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.85)', borderStyle: 'dashed' },
});
