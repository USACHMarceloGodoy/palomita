// Menú hamburguesa de la mascota: un botón redondo en la esquina inferior
// derecha, un poco por encima del footer, que despliega hacia arriba todo lo
// relacionado a ella (tienda, armario, minijuegos...). Así el footer no crece.
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming, type SharedValue } from 'react-native-reanimated';
import { Texto } from '@/components/Texto';
import { colores, sombras } from '@/lib/tema';
import { IconoUI, type ClaveUI } from './IconosMascota';

type Opcion = { clave: ClaveUI; titulo: string; ruta: Href; aviso?: string };

const OPCIONES: Opcion[] = [
  { clave: 'tienda', titulo: 'Tienda', ruta: '/mascota/tienda' },
  { clave: 'vestir', titulo: 'Armario', ruta: '/mascota/armario' },
  { clave: 'decorar', titulo: 'Decorar la casa', ruta: '/mascota/decorar' },
  { clave: 'personalizar', titulo: 'Personalizar mascota', ruta: '/mascota/personalizar' },
  { clave: 'cocina', titulo: 'Cocina', ruta: '/mascota/cocina' },
  { clave: 'estadio', titulo: 'Estadio', ruta: '/mascota/estadio' },
  { clave: 'pesca', titulo: 'Pesca', ruta: '/mascota/pesca' },
  { clave: 'arbol', titulo: 'Árbol de la amistad', ruta: '/mascota/arbol' },
  { clave: 'museo', titulo: 'Museo de Sócrates', ruta: '/mascota/museo' },
  { clave: 'visita', titulo: 'Visitar a tu pareja', ruta: '/mascota/visita' },
];

export function MenuMascota({ avisos = {} }: { avisos?: Partial<Record<ClaveUI, string>> }) {
  const [abierto, setAbierto] = useState(false);
  const router = useRouter();
  const v = useSharedValue(0);

  useEffect(() => { v.value = withTiming(abierto ? 1 : 0, { duration: 180 }); }, [abierto]);

  const fondo = useAnimatedStyle(() => ({ opacity: v.value, pointerEvents: v.value > 0.01 ? 'auto' : 'none' }));
  const rotacion = useAnimatedStyle(() => ({ transform: [{ rotate: `${v.value * 90}deg` }] }));

  function ir(o: Opcion) {
    Haptics.selectionAsync().catch(() => {});
    setAbierto(false);
    router.push(o.ruta);
  }

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <Animated.View style={[StyleSheet.absoluteFill, estilos.fondo, fondo]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setAbierto(false)} accessibilityLabel="Cerrar menú" />
      </Animated.View>

      <View pointerEvents="box-none" style={estilos.columna}>
        {OPCIONES.map((o, i) => (
          <Item key={o.clave} o={o} i={OPCIONES.length - 1 - i} v={v} abierto={abierto} aviso={avisos[o.clave]} onPress={() => ir(o)} />
        ))}
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}); setAbierto((a) => !a); }}
          accessibilityRole="button"
          accessibilityLabel={abierto ? 'Cerrar menú de la mascota' : 'Abrir menú de la mascota'}
          style={estilos.fab}
        >
          <Animated.View style={rotacion}>
            <IconoUI clave={abierto ? 'cerrar' : 'menu'} color={colores.crema} size={26} />
          </Animated.View>
        </Pressable>
      </View>
    </View>
  );
}

function Item({ o, i, v, abierto, aviso, onPress }: { o: Opcion; i: number; v: SharedValue<number>; abierto: boolean; aviso?: string; onPress: () => void }) {
  const estilo = useAnimatedStyle(() => ({
    opacity: v.value,
    transform: [{ translateY: (1 - v.value) * (18 + i * 6) }, { scale: 0.85 + v.value * 0.15 }],
  }));
  const local = useSharedValue(0);
  useEffect(() => { local.value = abierto ? withDelay(i * 22, withSpring(1, { damping: 14 })) : withTiming(0, { duration: 120 }); }, [abierto]);
  const salto = useAnimatedStyle(() => ({ transform: [{ translateX: (1 - local.value) * 24 }] }));

  return (
    <Animated.View style={[estilo, salto]} pointerEvents={abierto ? 'auto' : 'none'}>
      <Pressable onPress={onPress} accessibilityRole="button" style={estilos.item}>
        {aviso ? <View style={estilos.punto}><Texto variante="cuerpoBold" style={{ fontSize: 10, color: colores.crema, lineHeight: 12 }}>{aviso}</Texto></View> : null}
        <Texto variante="cuerpoBold" style={{ fontSize: 14, color: colores.carbon }}>{o.titulo}</Texto>
        <View style={estilos.icono}><IconoUI clave={o.clave} color={colores.rosaTinta} size={20} /></View>
      </Pressable>
    </Animated.View>
  );
}

const estilos = StyleSheet.create({
  fondo: { backgroundColor: 'rgba(74,59,69,0.28)' },
  columna: { position: 'absolute', right: 16, bottom: 16, alignItems: 'flex-end', gap: 6 },
  fab: {
    width: 58, height: 58, borderRadius: 29, marginTop: 6,
    backgroundColor: colores.rosaTinta, alignItems: 'center', justifyContent: 'center',
    ...sombras.rosada,
  },
  item: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    minHeight: 44, paddingLeft: 16, paddingRight: 6, borderRadius: 999,
    backgroundColor: colores.crema, ...sombras.rosadaSuave,
  },
  icono: { width: 34, height: 34, borderRadius: 17, backgroundColor: colores.rosaBase, alignItems: 'center', justifyContent: 'center' },
  punto: { minWidth: 20, height: 20, borderRadius: 10, paddingHorizontal: 6, backgroundColor: colores.rosaTinta, alignItems: 'center', justifyContent: 'center' },
});
