// Decorar la casa: varias habitaciones, y los muebles se arrastran con el
// dedo. Desde la bandeja de abajo se sueltan dentro de la habitación; para
// sacar uno, se arrastra fuera (hacia abajo). Todo con gestos, sin modales.
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Pantalla } from '@/components/Pantalla';
import { Texto } from '@/components/Texto';
import { BotonKawaii } from '@/components/BotonKawaii';
import { Cabecera } from '@/components/mascota/Cabecera';
import { Habitacion, H as ALTO_VB, W as ANCHO_VB } from '@/components/mascota/Habitacion';
import { IconoItem, Objeto } from '@/components/mascota/IconosMascota';
import { SelectorHabitacion } from '@/components/mascota/SelectorHabitacion';
import { item } from '@/lib/mascota-virtual/catalogo';
import { guardarMascota } from '@/lib/mascota-virtual/datos';
import { NOMBRE_HABITACION, type Decoracion, type Habitacion as HabT, type Item, type MuebleColocado } from '@/lib/mascota-virtual/tipos';
import { useMascota } from '@/lib/mascota-virtual/useMascota';
import { colores, sombras } from '@/lib/tema';

type Rect = { x: number; y: number; w: number; h: number };

export default function Decorar() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { mascota, inventario, cantidad, recargar } = useMascota();
  const [deco, setDeco] = useState<Decoracion>({ habitaciones: [] });
  const [idx, setIdx] = useState(0);
  const [pestana, setPestana] = useState<'muebles' | 'pared' | 'suelo' | 'habitaciones'>('muebles');
  const [guardando, setGuardando] = useState(false);
  const salaRef = useRef<View>(null);
  const [rectSala, setRectSala] = useState<Rect | null>(null);

  useEffect(() => { if (mascota) setDeco(mascota.decoracion); }, [mascota?.actualizado_en]);

  const ancho = Math.min(width - 40, 420);
  const alto = (ancho * ALTO_VB) / ANCHO_VB;
  const hab = deco.habitaciones[idx];

  const medir = () => salaRef.current?.measureInWindow((x, y, w, h) => setRectSala({ x, y, w, h }));

  const tengo = (cat: Item['categoria']) => inventario.map((i) => item(i.item_id)).filter((it): it is Item => !!it && it.categoria === cat);
  const paredes = [item('pared_rosa')!, ...tengo('pared').filter((p) => p.id !== 'pared_rosa')];
  const suelos = [item('suelo_madera')!, ...tengo('suelo').filter((p) => p.id !== 'suelo_madera')];
  // Cada unidad de mueble se coloca una vez en toda la casa.
  const colocados = (id: string) => deco.habitaciones.reduce((a, h) => a + h.muebles.filter((m) => m.id === id).length, 0);
  const bandeja = tengo('mueble').filter((m) => cantidad(m.id) - colocados(m.id) > 0);
  const habitacionesDisponibles = tengo('habitacion').filter((h) => !deco.habitaciones.some((x) => x.tipo === h.habitacion));

  function editarHab(fn: (h: HabT) => HabT) {
    setDeco((d) => ({ habitaciones: d.habitaciones.map((h, i) => (i === idx ? fn(h) : h)) }));
  }
  function mover(i: number, x: number, y: number) {
    editarHab((h) => ({ ...h, muebles: h.muebles.map((m, k) => (k === i ? { ...m, x, y } : m)) }));
  }
  function sacar(i: number) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    editarHab((h) => ({ ...h, muebles: h.muebles.filter((_, k) => k !== i) }));
  }
  function soltarDesdeBandeja(id: string, absX: number, absY: number) {
    if (!rectSala) return;
    const x = (absX - rectSala.x) / rectSala.w, y = (absY - rectSala.y) / rectSala.h;
    if (x < 0 || x > 1 || y < 0 || y > 1) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    editarHab((h) => ({ ...h, muebles: [...h.muebles, { id, x: Math.min(0.95, Math.max(0.05, x)), y: Math.min(0.95, Math.max(0.08, y)) }] }));
  }
  function agregarHabitacion(it: Item) {
    if (!it.habitacion) return;
    const base: Record<string, { pared: string; suelo: string }> = {
      dormitorio: { pared: 'pared_lavanda', suelo: 'suelo_alfombra' }, cocina: { pared: 'pared_crema', suelo: 'suelo_baldosa' },
      bano: { pared: 'pared_cielo', suelo: 'suelo_baldosa' }, jardin: { pared: 'pared_menta', suelo: 'suelo_pasto' },
      terraza: { pared: 'pared_crema', suelo: 'suelo_madera' }, atico: { pared: 'pared_crema', suelo: 'suelo_madera_oscura' },
    };
    const b = base[it.habitacion] ?? { pared: 'pared_rosa', suelo: 'suelo_madera' };
    setDeco((d) => ({ habitaciones: [...d.habitaciones, { tipo: it.habitacion!, pared: b.pared, suelo: b.suelo, muebles: [] }] }));
    setIdx(deco.habitaciones.length);
    setPestana('muebles');
  }

  async function guardar() {
    if (!mascota) return;
    setGuardando(true);
    await guardarMascota({ ...mascota, decoracion: deco }).catch(() => {});
    setGuardando(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    await recargar();
    router.back();
  }

  if (!mascota || !hab) return <Pantalla fondo={colores.rosaBase}><Cabecera titulo="Decorar" /></Pantalla>;

  return (
    <Pantalla fondo={colores.rosaBase} scroll={false}>
      <Cabecera titulo="Decorar la casa" subtitulo="Arrastra los muebles. Para sacar uno, tíralo hacia abajo." />
      <SelectorHabitacion habitaciones={deco.habitaciones} actual={idx} onCambiar={setIdx} />

      <View ref={salaRef} onLayout={medir} collapsable={false} style={{ alignSelf: 'center', width: ancho, height: alto, ...sombras.rosada }}>
        <Habitacion habitacion={hab} ancho={ancho} sinMuebles />
        {hab.muebles.map((m, i) => (
          <MuebleArrastrable key={`${m.id}-${i}-${idx}`} m={m} ancho={ancho} alto={alto} onMover={(x, y) => mover(i, x, y)} onSacar={() => sacar(i)} />
        ))}
      </View>

      <View style={{ flexDirection: 'row', gap: 6 }}>
        {(['muebles', 'pared', 'suelo', 'habitaciones'] as const).map((p) => (
          <Pressable key={p} onPress={() => setPestana(p)} accessibilityRole="tab" accessibilityState={{ selected: pestana === p }} style={[estilos.pestana, pestana === p && { backgroundColor: colores.rosaTinta }]}>
            <Texto variante="cuerpoBold" style={{ fontSize: 12, color: pestana === p ? colores.crema : colores.rosaTinta }}>
              {p === 'muebles' ? 'Muebles' : p === 'pared' ? 'Pared' : p === 'suelo' ? 'Suelo' : 'Piezas'}
            </Texto>
          </Pressable>
        ))}
      </View>

      <View style={{ flex: 1 }}>
        {pestana === 'muebles' ? (
          <View style={{ flex: 1 }}>
            {bandeja.length === 0 ? <Texto variante="apoyo">Todo lo que tienes ya está puesto. La tienda tiene más, en la pestaña Casa.</Texto> : null}
            <View style={estilos.bandeja}>
              {bandeja.map((it) => <ItemBandeja key={it.id} it={it} restantes={cantidad(it.id) - colocados(it.id)} onSoltar={(x, y) => soltarDesdeBandeja(it.id, x, y)} />)}
            </View>
          </View>
        ) : pestana === 'habitaciones' ? (
          <ScrollView contentContainerStyle={{ gap: 8 }}>
            <Texto variante="apoyo" style={{ fontSize: 13 }}>Tienes {deco.habitaciones.length} {deco.habitaciones.length === 1 ? 'habitación' : 'habitaciones'}: {deco.habitaciones.map((h) => NOMBRE_HABITACION[h.tipo]).join(', ')}.</Texto>
            {habitacionesDisponibles.map((h) => (
              <Pressable key={h.id} onPress={() => agregarHabitacion(h)} accessibilityRole="button" style={estilos.filaHab}>
                <IconoItem item={h} size={36} />
                <View style={{ flex: 1 }}><Texto variante="cuerpoBold">{h.nombre}</Texto><Texto variante="apoyo" style={{ fontSize: 12 }}>{h.descripcion}</Texto></View>
                <Texto variante="cuerpoBold" style={{ color: colores.rosaTinta, fontSize: 13 }}>Construir</Texto>
              </Pressable>
            ))}
            {habitacionesDisponibles.length === 0 ? <BotonKawaii titulo="Comprar habitaciones en la tienda" variante="secundario" onPress={() => router.push('/mascota/tienda')} /> : null}
          </ScrollView>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingVertical: 4 }}>
            {(pestana === 'pared' ? paredes : suelos).map((p) => {
              const activa = pestana === 'pared' ? hab.pared === p.id : hab.suelo === p.id;
              return (
                <Pressable key={p.id} onPress={() => editarHab((h) => (pestana === 'pared' ? { ...h, pared: p.id } : { ...h, suelo: p.id }))} accessibilityRole="button" accessibilityLabel={p.nombre} accessibilityState={{ selected: activa }} style={[estilos.celda, activa && { borderColor: colores.rosaTinta }]}>
                  <IconoItem item={p} size={40} />
                  <Texto variante="apoyo" style={{ fontSize: 10 }} numberOfLines={1}>{p.nombre.replace('Pared ', '').replace('Piso ', '')}</Texto>
                </Pressable>
              );
            })}
          </ScrollView>
        )}
      </View>

      <BotonKawaii titulo="Guardar" onPress={guardar} disabled={guardando} />
    </Pantalla>
  );
}

function MuebleArrastrable({ m, ancho, alto, onMover, onSacar }: { m: MuebleColocado; ancho: number; alto: number; onMover: (x: number, y: number) => void; onSacar: () => void }) {
  const it = item(m.id);
  const tam = (it?.tam ?? 0.22) * ancho;
  const x = useSharedValue(m.x * ancho - tam / 2);
  const y = useSharedValue(m.y * alto - tam / 2);
  const ix = useSharedValue(0), iy = useSharedValue(0);
  const activo = useSharedValue(0);

  const pan = Gesture.Pan()
    .onBegin(() => { ix.value = x.value; iy.value = y.value; activo.value = 1; })
    .onUpdate((e) => { x.value = ix.value + e.translationX; y.value = iy.value + e.translationY; })
    .onEnd(() => {
      activo.value = 0;
      const cx = x.value + tam / 2, cy = y.value + tam / 2;
      if (cy > alto + tam * 0.3) { runOnJS(onSacar)(); return; }
      const nx = Math.min(0.95, Math.max(0.05, cx / ancho)), ny = Math.min(0.95, Math.max(0.08, cy / alto));
      x.value = withSpring(nx * ancho - tam / 2); y.value = withSpring(ny * alto - tam / 2);
      runOnJS(onMover)(nx, ny);
    });

  const estilo = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { translateY: y.value }, { scale: 1 + activo.value * 0.1 }],
    opacity: 0.85 + (1 - activo.value) * 0.15,
    zIndex: activo.value ? 10 : 1,
  }));

  if (!it) return null;
  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[{ position: 'absolute', left: 0, top: 0, width: tam, height: tam }, estilo]} accessible accessibilityLabel={`${it.nombre}, arrastrable`}>
        <Objeto clave={it.dibujo} c1={it.c1 ?? '#FFB3C6'} c2={it.c2 ?? '#D6336C'} size={tam} />
      </Animated.View>
    </GestureDetector>
  );
}

function ItemBandeja({ it, restantes, onSoltar }: { it: Item; restantes: number; onSoltar: (absX: number, absY: number) => void }) {
  const tx = useSharedValue(0), ty = useSharedValue(0), activo = useSharedValue(0);
  const pan = Gesture.Pan()
    .onBegin(() => { activo.value = 1; })
    .onUpdate((e) => { tx.value = e.translationX; ty.value = e.translationY; })
    .onEnd((e) => {
      runOnJS(onSoltar)(e.absoluteX, e.absoluteY);
      tx.value = withSpring(0); ty.value = withSpring(0); activo.value = 0;
    })
    .onFinalize(() => { tx.value = withSpring(0); ty.value = withSpring(0); activo.value = 0; });
  const estilo = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: 1 + activo.value * 0.15 }],
    zIndex: activo.value ? 20 : 1,
  }));
  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[estilos.itemBandeja, estilo]} accessible accessibilityLabel={`${it.nombre}, arrastra a la habitación`}>
        <IconoItem item={it} size={38} />
        <Texto variante="apoyo" style={{ fontSize: 10 }} numberOfLines={1}>{restantes > 1 ? `×${restantes}` : it.nombre}</Texto>
      </Animated.View>
    </GestureDetector>
  );
}

const estilos = StyleSheet.create({
  pestana: { flex: 1, minHeight: 38, borderRadius: 999, backgroundColor: colores.crema, alignItems: 'center', justifyContent: 'center' },
  bandeja: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, overflow: 'visible' },
  itemBandeja: { width: 64, height: 64, borderRadius: 14, backgroundColor: colores.crema, alignItems: 'center', justifyContent: 'center', gap: 2, ...sombras.rosadaSuave },
  celda: { width: 70, height: 76, borderRadius: 14, backgroundColor: colores.crema, borderWidth: 2.5, borderColor: 'transparent', alignItems: 'center', justifyContent: 'center', gap: 2, padding: 4 },
  filaHab: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colores.crema, borderRadius: 16, padding: 12 },
});
