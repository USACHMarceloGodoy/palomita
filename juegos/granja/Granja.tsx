import { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Svg, { Path, Rect, Ellipse, Circle } from 'react-native-svg';
import { Figura, type Forma } from '@/components/Figuras';
import { Texto } from '@/components/Texto';
import { crecimiento, diasSinVisita, granja, hechoHoy, interactuar, varianteFlor } from '@/lib/juegos';
import { colores, radios } from '@/lib/tema';
import { Image } from 'expo-image';
import { sprite } from '@/lib/sprites';
import type { EntidadGranja } from '@/lib/tipos';

// No es un juego de granja completo: interacciones sueltas de veinte segundos.
// Toca el animal chico y se abre grande, con su minijuego propio:
//   Vaca  → darle heno, un montoncito a la vez.
//   Cerdo → toquecitos en el lomo.
//   Gato  → hacer saltar al ratón de juguete diez segundos.
// Todo con toques (Pressable), nunca con gestos: los gestos de
// react-native-gesture-handler no llegan dentro de un <Modal> en Android.
// Macetas: mantener apretado para regar; al tercer riego florece, y la flor
// que sale es distinta cada ciclo. Cosechar con un toque cuando está madura.

export function Granja({ onRecompensa }: { onRecompensa: (monto: number, quien: string) => void }) {
  const [lista, setLista] = useState<EntidadGranja[]>([]);
  const cargar = () => granja().then(setLista).catch(() => {});
  useEffect(() => { cargar(); }, []);

  async function hecho(e: EntidadGranja, accion: 'acariciar' | 'regar' | 'cosechar') {
    const monto = await interactuar(e, accion);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    onRecompensa(monto, e.entidad);
    cargar();
  }

  const animales = lista.filter((e) => e.tipo === 'animal');
  const plantas = lista.filter((e) => e.tipo === 'planta');

  return (
    <View style={{ gap: 14 }}>
      <View style={estilos.fila}>
        {animales.map((e) => <Animal key={e.entidad} e={e} onListo={() => hecho(e, 'acariciar')} />)}
      </View>
      <View style={estilos.fila}>
        {plantas.map((e) => <Maceta key={e.entidad} e={e} onRegar={() => hecho(e, 'regar')} onCosechar={() => hecho(e, 'cosechar')} />)}
      </View>
    </View>
  );
}

const NOMBRE: Record<string, string> = { vaca: 'Vaca', cerdo: 'Cerdo', gato: 'Gato' };
const PISTA: Record<string, string> = {
  vaca: 'dale heno: toca cada montoncito',
  cerdo: 'hazle cariño con toquecitos',
  gato: 'toca el ratón para que salte',
};
const LISTO_TXT: Record<string, string> = {
  vaca: '¡Comió feliz! Vuelve mañana.',
  cerdo: '¡Le encantó! Vuelve mañana.',
  gato: '¡Jugaron un montón! Vuelve mañana.',
};

function Animal({ e, onListo }: { e: EntidadGranja; onListo: () => void }) {
  const triste = (diasSinVisita(e) ?? 99) > 3;
  const listo = hechoHoy(e);
  const [abierto, setAbierto] = useState(false);
  const [corazones, setCorazones] = useState(0);
  const forma: Forma = e.entidad === 'gato' ? 'gatito' : (e.entidad as Forma);

  return (
    <>
      <Pressable onPress={() => setAbierto(true)} style={estilos.celda}>
        {sprite(e.entidad as 'vaca' | 'cerdo' | 'gato') ? (
          <Image source={sprite(e.entidad as 'vaca' | 'cerdo' | 'gato')!} style={{ width: 64, height: 64 }} contentFit="contain" />
        ) : (
          <Figura forma={forma} c1={colores.crema} c2={colores.carbon} size={64} />
        )}
        {triste && !listo ? (
          <View style={estilos.corazonVacio}><Figura forma="corazon" c1={colores.rosaClaro} c2={colores.rosaClaro} size={18} /></View>
        ) : null}
        {corazones > 0 || listo ? (
          <View style={estilos.corazonVacio}><Figura forma="corazon" c1={colores.rosaFuerte} c2={colores.rosaFuerte} size={18} /></View>
        ) : null}
        <Texto variante="cuerpoBold" style={{ fontSize: 13 }}>{NOMBRE[e.entidad]}</Texto>
        <Texto variante="apoyo" style={{ fontSize: 11, textAlign: 'center' }}>{listo ? 'feliz por hoy' : 'toca para jugar'}</Texto>
      </Pressable>
      <Modal visible={abierto} transparent animationType="fade" onRequestClose={() => setAbierto(false)}>
        <AnimalGrande
          e={e}
          forma={forma}
          yaHecho={listo}
          onCerrar={() => setAbierto(false)}
          onListo={() => {
            setCorazones((c) => c + 1);
            onListo();
            setTimeout(() => setAbierto(false), 1100);
          }}
        />
      </Modal>
    </>
  );
}

function AnimalGrande({
  e, forma, yaHecho, onCerrar, onListo,
}: {
  e: EntidadGranja; forma: Forma; yaHecho: boolean; onCerrar: () => void; onListo: () => void;
}) {
  const [hecho, setHecho] = useState(yaHecho);
  const [empezo, setEmpezo] = useState(false);
  const escala = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: escala.value }] }));

  function completar() {
    if (hecho) return;
    setHecho(true);
    escala.value = withSequence(withSpring(1.18), withSpring(1));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    onListo();
  }

  function latir() {
    if (!empezo) setEmpezo(true);
    escala.value = withSequence(withSpring(1.09), withSpring(1));
    Haptics.selectionAsync().catch(() => {});
  }

  const animal = (
    <Animated.View style={anim}>
      {sprite(e.entidad as 'vaca' | 'cerdo' | 'gato') ? (
        <Image source={sprite(e.entidad as 'vaca' | 'cerdo' | 'gato')!} style={{ width: 150, height: 150 }} contentFit="contain" />
      ) : (
        <Figura forma={forma} c1={colores.crema} c2={colores.carbon} size={150} />
      )}
    </Animated.View>
  );

  return (
    <View style={estilosGrande.fondo}>
      <Pressable accessibilityLabel="Cerrar" onPress={onCerrar} style={estilosGrande.cerrar}>
        <Texto variante="cuerpoBold" style={{ fontSize: 22, color: colores.carbon }}>×</Texto>
      </Pressable>
      <View style={estilosGrande.tarjeta}>
        {hecho ? (
          <View style={estilosGrande.escena}>{animal}</View>
        ) : e.entidad === 'vaca' ? (
          <JuegoHeno animal={animal} mostrarMano={!empezo} onGolpe={latir} onListo={completar} />
        ) : e.entidad === 'cerdo' ? (
          <JuegoCerdo animal={animal} mostrarMano={!empezo} onGolpe={latir} onListo={completar} />
        ) : (
          <JuegoRaton animal={animal} mostrarMano={!empezo} onGolpe={latir} onListo={completar} />
        )}
        <Texto variante="titulo" style={{ marginTop: 10 }}>{NOMBRE[e.entidad]}</Texto>
        <Texto variante="apoyo" style={{ textAlign: 'center', marginTop: 4 }}>
          {hecho ? LISTO_TXT[e.entidad] : PISTA[e.entidad]}
        </Texto>
      </View>
    </View>
  );
}

type PropsJuego = { animal: React.ReactNode; mostrarMano: boolean; onGolpe: () => void; onListo: () => void };

// --- Vaca: cinco montoncitos de heno alrededor. Toca uno y se lo come. ------
const HENO: { left: number; top: number }[] = [
  { left: 6, top: 18 }, { left: 6, top: 104 }, { left: 112, top: 148 },
  { left: 214, top: 104 }, { left: 214, top: 18 },
];

function JuegoHeno({ animal, mostrarMano, onGolpe, onListo }: PropsJuego) {
  const [dados, setDados] = useState<number[]>([]);

  function dar(i: number) {
    if (dados.includes(i)) return;
    const nuevos = [...dados, i];
    setDados(nuevos);
    onGolpe();
    if (nuevos.length >= HENO.length) setTimeout(onListo, 260);
  }

  return (
    <View style={estilosGrande.escena}>
      {animal}
      {HENO.map((p, i) => (
        dados.includes(i) ? null : (
          <Pressable
            key={i}
            accessibilityLabel="Darle heno"
            onPress={() => dar(i)}
            hitSlop={10}
            style={[estilosGrande.pieza, { left: p.left, top: p.top }]}
          >
            <Texto style={{ fontSize: 30 }}>🌾</Texto>
          </Pressable>
        )
      ))}
      {mostrarMano ? <ManoEjemplo left={HENO[0].left + 6} top={HENO[0].top + 30} /> : null}
      <Contador hechos={dados.length} total={HENO.length} />
    </View>
  );
}

// --- Cerdo: toquecitos en el lomo. ----------------------------------------
const TOQUES_CERDO = 6;

function JuegoCerdo({ animal, mostrarMano, onGolpe, onListo }: PropsJuego) {
  const [toques, setToques] = useState(0);

  function tocar() {
    const n = toques + 1;
    setToques(n);
    onGolpe();
    if (n >= TOQUES_CERDO) setTimeout(onListo, 260);
  }

  return (
    <View style={estilosGrande.escena}>
      <Pressable accessibilityLabel="Hacerle cariño" onPress={tocar} style={estilosGrande.zonaAnimal}>
        {animal}
      </Pressable>
      {mostrarMano ? <ManoEjemplo left={150} top={118} /> : null}
      <Contador hechos={toques} total={TOQUES_CERDO} />
    </View>
  );
}

// --- Gato: el ratón de juguete salta cada vez que lo tocas. Diez segundos. --
const SEGUNDOS_GATO = 10;
const POSES_RATON: { left: number; top: number }[] = [
  { left: 16, top: 12 }, { left: 206, top: 20 }, { left: 26, top: 92 },
  { left: 198, top: 100 }, { left: 116, top: 6 }, { left: 60, top: 140 },
  { left: 176, top: 148 }, { left: 116, top: 96 },
];

function JuegoRaton({ animal, mostrarMano, onGolpe, onListo }: PropsJuego) {
  const [pos, setPos] = useState(0);
  const [corriendo, setCorriendo] = useState(false);
  const [avance, setAvance] = useState(0); // 0..1
  const listo = useRef(false);

  useEffect(() => {
    if (!corriendo) return;
    const inicio = Date.now();
    const id = setInterval(() => {
      const v = Math.min(1, (Date.now() - inicio) / (SEGUNDOS_GATO * 1000));
      setAvance(v);
      if (v >= 1 && !listo.current) { listo.current = true; clearInterval(id); onListo(); }
    }, 100);
    return () => clearInterval(id);
  }, [corriendo]);

  function saltar() {
    if (!corriendo) setCorriendo(true);
    setPos((p) => {
      let n = p;
      while (n === p) n = Math.floor(Math.random() * POSES_RATON.length);
      return n;
    });
    onGolpe();
  }

  const p = POSES_RATON[pos];

  return (
    <View style={estilosGrande.escena}>
      {animal}
      <Pressable
        accessibilityLabel="Hacer saltar al ratón"
        onPress={saltar}
        hitSlop={14}
        style={[estilosGrande.pieza, { left: p.left, top: p.top }]}
      >
        <Texto style={{ fontSize: 30 }}>🐭</Texto>
      </Pressable>
      {mostrarMano ? <ManoEjemplo left={p.left + 6} top={p.top + 30} /> : null}
      <View style={estilosGrande.barra}>
        <View style={[estilosGrande.barraLlena, { width: `${Math.round(avance * 100)}%` }]} />
      </View>
    </View>
  );
}

// --- Piezas compartidas ----------------------------------------------------
function Contador({ hechos, total }: { hechos: number; total: number }) {
  return (
    <View style={estilosGrande.contador}>
      {Array.from({ length: total }, (_, i) => (
        <Figura
          key={i}
          forma="corazon"
          c1={i < hechos ? colores.rosaFuerte : colores.rosaClaro}
          c2={i < hechos ? colores.rosaFuerte : colores.rosaClaro}
          size={16}
        />
      ))}
    </View>
  );
}

function ManoEjemplo({ left, top }: { left: number; top: number }) {
  const escala = useSharedValue(1);
  useEffect(() => {
    escala.value = withRepeat(withSequence(withTiming(0.72, { duration: 300 }), withTiming(1, { duration: 300 })), -1);
  }, []);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: escala.value }] }));
  return (
    <Animated.View style={[estilosGrande.pieza, { left, top }, anim]} pointerEvents="none">
      <Texto style={{ fontSize: 30 }}>👆</Texto>
    </Animated.View>
  );
}

// --- Macetas ---------------------------------------------------------------
function Maceta({ e, onRegar, onCosechar }: { e: EntidadGranja; onRegar: () => void; onCosechar: () => void }) {
  const nivel = crecimiento(e);
  const regadaHoy = hechoHoy(e);
  const madura = nivel >= 3;
  const agua = useSharedValue(0);
  const animAgua = useAnimatedStyle(() => ({ opacity: agua.value }));

  function regar() {
    if (regadaHoy || madura) return;
    agua.value = withSequence(withTiming(1, { duration: 260 }), withTiming(0, { duration: 700 }));
    onRegar();
  }

  return (
    <Pressable
      onPress={() => madura && onCosechar()}
      onLongPress={regar}
      delayLongPress={700}
      style={[estilos.celda, regadaHoy && estilos.celdaLista]}
    >
      <Animated.View style={[{ position: 'absolute', top: 6, right: 10 }, animAgua]}>
        <Figura forma="gota" c1="#5B9BD5" c2="#5B9BD5" size={22} />
      </Animated.View>
      <Planta e={e} nivel={nivel} />
      <Texto variante="cuerpoBold" style={{ fontSize: 13 }}>{madura ? '¡Floreció!' : `Nivel ${nivel}`}</Texto>
      <Texto variante="apoyo" style={{ fontSize: 11, textAlign: 'center' }}>
        {madura ? 'toca para cosechar' : regadaHoy ? 'regada hoy' : 'mantén para regar'}
      </Texto>
    </Pressable>
  );
}

// Cada ciclo de la maceta saca una flor distinta: la variante se deriva de la
// fecha de la última interacción, así que al cosechar y empezar de nuevo
// siempre toca otra.
const FLORES: { forma: Forma; c1: string; c2: string }[] = [
  { forma: 'flor', c1: '#FF6F91', c2: '#FFD93D' },
  { forma: 'flor', c1: '#E2D5F8', c2: '#6B3FA0' },
  { forma: 'flor', c1: '#FFB3C6', c2: '#D6336C' },
  { forma: 'flor', c1: '#8FD3C7', c2: '#FFF8F0' },
  { forma: 'flor', c1: '#FFD93D', c2: '#E09A1F' },
  { forma: 'rosa', c1: '#D6336C', c2: '#FFB3C6' },
  { forma: 'rosa', c1: '#FF6F91', c2: '#FFE4EC' },
  { forma: 'girasol', c1: '#FFD93D', c2: '#6B4A2A' },
];

function Planta({ e, nivel }: { e: EntidadGranja; nivel: number }) {
  const flor = FLORES[varianteFlor(e) % FLORES.length];
  const png = sprite(`maceta_${Math.min(3, Math.max(0, nivel))}` as 'maceta_0');
  if (png && nivel < 3) return <Image source={png} style={{ width: 64, height: 64 }} contentFit="contain" />;

  return (
    <View style={{ width: 64, height: 64, alignItems: 'center', justifyContent: 'flex-end' }}>
      <Svg width={64} height={64} viewBox="0 0 40 40" style={StyleSheet.absoluteFill}>
        <Path d="M10 28h20l-2 9H12z" fill="#C97B4A" stroke="#8A5A3B" strokeWidth={1.2} />
        <Rect x={8} y={25} width={24} height={4} rx={2} fill="#D98F5B" stroke="#8A5A3B" strokeWidth={1.2} />
        {nivel >= 1 ? <Path d="M20 25V16" stroke="#3E8A62" strokeWidth={2.2} strokeLinecap="round" /> : null}
        {nivel >= 1 ? <Ellipse cx={16} cy={20} rx={4} ry={2.4} fill="#7BC47F" transform="rotate(-30 16 20)" /> : null}
        {nivel >= 2 ? <Ellipse cx={24} cy={17} rx={4} ry={2.4} fill="#7BC47F" transform="rotate(30 24 17)" /> : null}
        {nivel >= 2 ? <Path d="M20 16V9" stroke="#3E8A62" strokeWidth={2.2} strokeLinecap="round" /> : null}
        {nivel === 0 ? <Path d="M20 25v-3" stroke="#7BC47F" strokeWidth={2} strokeLinecap="round" /> : null}
        {nivel === 2 ? <Circle cx={20} cy={7} r={3} fill="#9AD3A7" /> : null}
      </Svg>
      {nivel >= 3 ? (
        <View style={{ position: 'absolute', top: -2, left: 14 }}>
          <Figura forma={flor.forma} c1={flor.c1} c2={flor.c2} size={36} />
        </View>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  fila: { flexDirection: 'row', gap: 10 },
  celda: { flex: 1, minHeight: 130, alignItems: 'center', justifyContent: 'center', gap: 4, padding: 10, borderRadius: radios.tarjetaChica, backgroundColor: colores.crema, borderWidth: 2, borderColor: colores.menta },
  celdaLista: { borderColor: colores.rosaMedio, backgroundColor: colores.rosaSuave },
  corazonVacio: { position: 'absolute', top: 8, right: 8 },
});

const estilosGrande = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: 'rgba(74,59,69,0.55)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  cerrar: { position: 'absolute', top: 54, right: 24, width: 44, height: 44, borderRadius: 22, backgroundColor: colores.crema, alignItems: 'center', justifyContent: 'center' },
  tarjeta: { width: '100%', maxWidth: 320, alignItems: 'center', paddingVertical: 22, paddingHorizontal: 18, borderRadius: radios.tarjetaChica, backgroundColor: colores.rosaSuave, borderWidth: 2, borderColor: colores.rosaMedio },
  escena: { width: 268, height: 196, alignItems: 'center', justifyContent: 'center' },
  zonaAnimal: { alignItems: 'center', justifyContent: 'center' },
  pieza: { position: 'absolute', width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  contador: { position: 'absolute', bottom: 0, flexDirection: 'row', gap: 6 },
  barra: { position: 'absolute', bottom: 0, width: 180, height: 10, borderRadius: 999, backgroundColor: colores.rosaClaro, overflow: 'hidden' },
  barraLlena: { height: '100%', borderRadius: 999, backgroundColor: colores.rosaFuerte },
});
