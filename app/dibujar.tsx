import { useRef, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { Texto } from '@/components/Texto';
import { Flecha } from '@/components/Iconos';
import { dejarDibujo } from '@/lib/dibujo';
import { colores, radios } from '@/lib/tema';

// Lienzo para dibujarle a dedo. Usa PanResponder de React Native (no
// react-native-gesture-handler): es el que nunca falla, y acá el trazo tiene
// que salir sí o sí. Cada trazo es un path SVG; al guardar, todo se serializa
// a un SVG de texto que pesa un par de kilobytes.
const COLORES = ['#D6336C', '#FF6F91', '#FFD93D', '#3E8A62', '#5B9BD5', '#6B3FA0', '#4A3B45'];
const GROSORES = [3, 6, 11];

type Trazo = { d: string; color: string; grosor: number };

export default function Dibujar() {
  const router = useRouter();
  const [trazos, setTrazos] = useState<Trazo[]>([]);
  const [actual, setActual] = useState<Trazo | null>(null);
  const [color, setColor] = useState(COLORES[0]);
  const [grosor, setGrosor] = useState(GROSORES[1]);
  const [lienzo, setLienzo] = useState({ w: 320, h: 420 });

  // Los refs guardan el estilo vigente para el trazo en curso: el
  // PanResponder se crea una sola vez y no ve los estados nuevos.
  const colorRef = useRef(color);
  const grosorRef = useRef(grosor);
  colorRef.current = color;
  grosorRef.current = grosor;
  const enCurso = useRef<Trazo | null>(null);

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        const { locationX, locationY } = e.nativeEvent;
        const t = { d: `M${r(locationX)} ${r(locationY)}`, color: colorRef.current, grosor: grosorRef.current };
        enCurso.current = t;
        setActual(t);
      },
      onPanResponderMove: (e) => {
        if (!enCurso.current) return;
        const { locationX, locationY } = e.nativeEvent;
        const t = { ...enCurso.current, d: `${enCurso.current.d} L${r(locationX)} ${r(locationY)}` };
        enCurso.current = t;
        setActual(t);
      },
      onPanResponderRelease: () => {
        const t = enCurso.current;
        enCurso.current = null;
        setActual(null);
        if (t && t.d.includes('L')) setTrazos((prev) => [...prev, t]);
      },
    }),
  ).current;

  function deshacer() {
    setTrazos((prev) => prev.slice(0, -1));
    Haptics.selectionAsync().catch(() => {});
  }

  function limpiar() {
    setTrazos([]);
    Haptics.selectionAsync().catch(() => {});
  }

  // El dibujo terminado se deja en el buzón de lib/dibujo y la pantalla de
  // autor lo recoge al volver.
  function listo() {
    if (!trazos.length) { router.back(); return; }
    dejarDibujo(aSvg(trazos, lienzo.w, lienzo.h));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    router.back();
  }

  const todos = actual ? [...trazos, actual] : trazos;

  return (
    <View style={estilos.raiz}>
      <View style={estilos.cabecera}>
        <Pressable onPress={() => router.back()} accessibilityLabel="Volver" style={estilos.volver}><Flecha color={colores.carbon} /></Pressable>
        <Texto variante="titulo" style={{ fontSize: 20 }}>Dibújale algo</Texto>
      </View>

      <View
        style={estilos.lienzo}
        onLayout={(e) => setLienzo({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
        {...pan.panHandlers}
      >
        <Svg width="100%" height="100%">
          {todos.map((t, i) => (
            <Path key={i} d={t.d} stroke={t.color} strokeWidth={t.grosor} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          ))}
        </Svg>
        {!todos.length ? (
          <View style={estilos.vacio} pointerEvents="none">
            <Texto variante="manuscritaGrande" style={{ color: colores.gris, fontSize: 22 }}>dibuja acá con el dedo</Texto>
          </View>
        ) : null}
      </View>

      <View style={estilos.paleta}>
        {COLORES.map((c) => (
          <Pressable key={c} onPress={() => setColor(c)} accessibilityLabel={`Color ${c}`} style={[estilos.tinta, { backgroundColor: c }, color === c && estilos.tintaActiva]} />
        ))}
      </View>

      <View style={estilos.barra}>
        {GROSORES.map((g) => (
          <Pressable key={g} onPress={() => setGrosor(g)} style={[estilos.chip, grosor === g && estilos.chipActivo]}>
            <View style={{ width: g * 2 + 6, height: g + 2, borderRadius: 999, backgroundColor: grosor === g ? colores.crema : colores.carbon }} />
          </Pressable>
        ))}
        <Pressable onPress={deshacer} disabled={!trazos.length} style={[estilos.chip, !trazos.length && { opacity: 0.4 }]}>
          <Texto variante="cuerpoBold" style={{ fontSize: 13 }}>Deshacer</Texto>
        </Pressable>
        <Pressable onPress={limpiar} disabled={!trazos.length} style={[estilos.chip, !trazos.length && { opacity: 0.4 }]}>
          <Texto variante="cuerpoBold" style={{ fontSize: 13 }}>Borrar todo</Texto>
        </Pressable>
      </View>

      <Pressable onPress={listo} disabled={!trazos.length} style={[estilos.guardar, !trazos.length && { opacity: 0.4 }]}>
        <Texto variante="cuerpoBold" style={{ color: colores.crema, fontSize: 16 }}>
          {trazos.length ? 'Usar este dibujo' : 'Todavía no hay nada'}
        </Texto>
      </Pressable>
    </View>
  );
}

function r(n: number) {
  return Math.round(n * 10) / 10;
}

function aSvg(trazos: Trazo[], w: number, h: number) {
  const paths = trazos
    .map((t) => `<path d="${t.d}" stroke="${t.color}" stroke-width="${t.grosor}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`)
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${Math.round(w)} ${Math.round(h)}" width="${Math.round(w)}" height="${Math.round(h)}">${paths}</svg>`;
}

const estilos = StyleSheet.create({
  raiz: { flex: 1, backgroundColor: colores.rosaBase, padding: 16, paddingTop: 60, gap: 12 },
  cabecera: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  volver: { width: 44, height: 44, borderRadius: radios.boton, backgroundColor: colores.crema, alignItems: 'center', justifyContent: 'center' },
  lienzo: { flex: 1, borderRadius: radios.tarjeta, backgroundColor: colores.cremaClaro, borderWidth: 2, borderColor: colores.rosaClaro, overflow: 'hidden' },
  vacio: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  paleta: { flexDirection: 'row', gap: 10, justifyContent: 'center' },
  tinta: { width: 34, height: 34, borderRadius: 999, borderWidth: 3, borderColor: 'transparent' },
  tintaActiva: { borderColor: colores.carbon },
  barra: { flexDirection: 'row', gap: 8, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' },
  chip: { minHeight: 44, minWidth: 48, paddingHorizontal: 12, borderRadius: 999, backgroundColor: colores.crema, alignItems: 'center', justifyContent: 'center' },
  chipActivo: { backgroundColor: colores.carbon },
  guardar: { minHeight: 54, borderRadius: radios.boton, backgroundColor: colores.rosaFuerte, alignItems: 'center', justifyContent: 'center' },
});
