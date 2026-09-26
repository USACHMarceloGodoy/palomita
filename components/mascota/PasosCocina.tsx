// Los pasos de una receta, estilo Cooking Mama: cada uno es una mecánica
// concreta con tiempo. Devuelven un puntaje 0-100 que se convierte en medalla.
//   cortar   → deslizar hacia abajo siguiendo las líneas punteadas
//   picar    → tocar al ritmo cuando el marcador pasa por el centro
//   mezclar  → movimientos circulares parejos; muy rápido salpica
//   voltear  → deslizar hacia arriba justo cuando está dorado; tarde = quemado
//   fuego    → mover la perilla para seguir la zona de temperatura
//   verter   → mantener apretado y soltar en la línea
//   emplatar → arrastrar cada pieza a su lugar del plato
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { cancelAnimation, Easing, runOnJS, useAnimatedStyle, useSharedValue, withRepeat, withSpring, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';
import { Texto } from '@/components/Texto';
import { item } from '@/lib/mascota-virtual/catalogo';
import type { Paso } from '@/lib/mascota-virtual/tipos';
import { colores, sombras } from '@/lib/tema';
import { IconoItem, Objeto } from './IconosMascota';

type Props = { paso: Paso; onTerminar: (puntaje: number, quemado?: boolean) => void };

export function PasoJuego({ paso, onTerminar }: Props) {
  switch (paso.tipo) {
    case 'cortar': return <Cortar paso={paso} onTerminar={onTerminar} />;
    case 'picar': return <Picar paso={paso} onTerminar={onTerminar} />;
    case 'mezclar': return <Mezclar paso={paso} onTerminar={onTerminar} />;
    case 'voltear': return <Voltear paso={paso} onTerminar={onTerminar} />;
    case 'fuego': return <Fuego paso={paso} onTerminar={onTerminar} />;
    case 'verter': return <Verter paso={paso} onTerminar={onTerminar} />;
    case 'emplatar': return <Emplatar paso={paso} onTerminar={onTerminar} />;
  }
}

/** Cuenta atrás en segundos; llama onFin una vez al llegar a cero. */
function useCuentaAtras(segundos: number, activo: boolean, onFin: () => void) {
  const [restante, setRestante] = useState(segundos);
  const fin = useRef(onFin); fin.current = onFin;
  useEffect(() => {
    if (!activo) return;
    const inicio = Date.now();
    const id = setInterval(() => {
      const r = Math.max(0, segundos - (Date.now() - inicio) / 1000);
      setRestante(r);
      if (r <= 0) { clearInterval(id); fin.current(); }
    }, 100);
    return () => clearInterval(id);
  }, [activo, segundos]);
  return restante;
}

function Tiempo({ restante, total }: { restante: number; total: number }) {
  return (
    <View style={estilos.tiempo}>
      <View style={[estilos.tiempoRelleno, { width: `${(restante / total) * 100}%`, backgroundColor: restante < total * 0.25 ? colores.rosaTinta : colores.amarillo }]} />
    </View>
  );
}

function useAncho() { const { width } = useWindowDimensions(); return Math.min(width - 40, 420); }

// ---------------------------------------------------------------------------
// Cortar
// ---------------------------------------------------------------------------
function Cortar({ paso, onTerminar }: Props) {
  const ancho = useAncho();
  const n = paso.n ?? 4;
  const total = paso.tiempo ?? 12;
  const [cortes, setCortes] = useState<boolean[]>(Array(n).fill(false));
  const [fallos, setFallos] = useState(0);
  const [listo, setListo] = useState(false);
  const it = item(paso.ingrediente ?? 'manzana');
  const alto = 230;
  const zonaX0 = ancho * 0.22, zonaX1 = ancho * 0.78;
  const lineas = Array.from({ length: n }, (_, i) => zonaX0 + ((i + 1) / (n + 1)) * (zonaX1 - zonaX0));
  const inicioX = useSharedValue(0);
  const tajo = useSharedValue(-100);

  const restante = useCuentaAtras(total, !listo, () => terminar(cortes));

  function terminar(c: boolean[]) {
    if (listo) return;
    setListo(true);
    const hechos = c.filter(Boolean).length;
    onTerminar(Math.max(0, Math.min(100, Math.round((hechos / n) * 100 - fallos * 8 + (restante / total) * 10))));
  }
  function cortar(x0: number, ty: number, tx: number) {
    if (listo) return;
    if (ty < 70 || Math.abs(tx) > 50) { setFallos((f) => f + 1); return; }
    const i = lineas.findIndex((lx, k) => !cortes[k] && Math.abs(lx - x0) < 24);
    if (i < 0) { setFallos((f) => f + 1); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {}); return; }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    tajo.value = lineas[i]; tajo.value = withTiming(-100, { duration: 300 });
    const nuevos = cortes.map((c, k) => (k === i ? true : c));
    setCortes(nuevos);
    if (nuevos.every(Boolean)) setTimeout(() => terminar(nuevos), 250);
  }

  const pan = Gesture.Pan()
    .onBegin((e) => { inicioX.value = e.x; })
    .onEnd((e) => { runOnJS(cortar)(inicioX.value, e.translationY, e.translationX); });

  return (
    <View style={{ gap: 10 }}>
      <Tiempo restante={restante} total={total} />
      <GestureDetector gesture={pan}>
        <View style={[estilos.tabla, { width: ancho, height: alto }]} accessible accessibilityLabel="Desliza hacia abajo sobre cada línea punteada">
          <Svg width={ancho} height={alto} style={StyleSheet.absoluteFill}>
            <Rect x={0} y={0} width={ancho} height={alto} rx={20} fill="#E8D4A8" />
            <Rect x={12} y={12} width={ancho - 24} height={alto - 24} rx={14} fill="#F3E4C8" />
          </Svg>
          {cortes.map((c, i) => (
            <View key={i} pointerEvents="none" style={{ position: 'absolute', left: lineas[i] - 1, top: 40, height: alto - 80, borderLeftWidth: 3, borderColor: c ? colores.verde : colores.rosaTinta, borderStyle: c ? 'solid' : 'dashed', opacity: c ? 0.9 : 0.8 }} />
          ))}
          <View pointerEvents="none" style={{ position: 'absolute', left: ancho / 2 - 80, top: alto / 2 - 80, flexDirection: 'row' }}>
            {cortes.map((c, i) => (
              <View key={i} style={{ width: 160 / n, overflow: 'hidden', transform: [{ translateX: c ? (i - n / 2) * 4 : 0 }] }}>
                <View style={{ marginLeft: -(160 / n) * i }}>{it ? <Objeto clave={it.dibujo} c1={it.c1 ?? '#FFB3C6'} c2={it.c2 ?? '#D6336C'} size={160} /> : null}</View>
              </View>
            ))}
          </View>
        </View>
      </GestureDetector>
      <Texto variante="apoyo" style={{ textAlign: 'center' }}>{cortes.filter(Boolean).length} de {n} cortes{fallos ? ` · ${fallos} ${fallos === 1 ? 'fallo' : 'fallos'}` : ''}</Texto>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Picar (ritmo)
// ---------------------------------------------------------------------------
function Picar({ paso, onTerminar }: Props) {
  const ancho = useAncho();
  const n = paso.n ?? 8;
  const total = paso.tiempo ?? 14;
  const [hechos, setHechos] = useState(0);
  const [fallos, setFallos] = useState(0);
  const [listo, setListo] = useState(false);
  const [ultimo, setUltimo] = useState<'bien' | 'mal' | null>(null);
  const pos = useSharedValue(0);
  const golpe = useSharedValue(0);
  const it = item(paso.ingrediente ?? 'cebolla');
  const pistaW = ancho - 40;

  useEffect(() => {
    pos.value = withRepeat(withTiming(1, { duration: 650, easing: Easing.inOut(Easing.sin) }), -1, true);
    return () => cancelAnimation(pos);
  }, []);
  const restante = useCuentaAtras(total, !listo, () => terminar(hechos, fallos));

  function terminar(h: number, f: number) {
    if (listo) return;
    setListo(true);
    onTerminar(Math.max(0, Math.min(100, Math.round((h / n) * 100 - f * 6))));
  }
  function evaluar(p: number) {
    if (listo) return;
    golpe.value = withSpring(1, {}, () => { golpe.value = withSpring(0); });
    if (Math.abs(p - 0.5) < 0.17) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
      setUltimo('bien');
      const h = hechos + 1; setHechos(h);
      if (h >= n) setTimeout(() => terminar(h, fallos), 200);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      setUltimo('mal'); setFallos((f) => f + 1);
    }
  }
  const tap = Gesture.Tap().onStart(() => { runOnJS(evaluar)(pos.value); });
  const marcador = useAnimatedStyle(() => ({ transform: [{ translateX: pos.value * (pistaW - 18) }] }));
  const cuchillo = useAnimatedStyle(() => ({ transform: [{ rotate: `${-25 + golpe.value * 25}deg` }, { translateY: golpe.value * 16 }] }));

  return (
    <View style={{ gap: 10 }}>
      <Tiempo restante={restante} total={total} />
      <GestureDetector gesture={tap}>
        <View style={[estilos.tabla, { width: ancho, height: 230, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3E4C8' }]} accessible accessibilityLabel="Toca cuando el marcador esté en el centro">
          <Animated.View style={[{ position: 'absolute', top: 40, right: ancho * 0.28 }, cuchillo]}>
            <Svg width={70} height={70} viewBox="0 0 40 40"><Path d="M6 30l16-22 6 4-14 20z" fill="#D9D9E0" stroke="#4A3B45" strokeWidth={1.4} /><Path d="M22 8l6 4 4-4-4-4z" fill="#8C6239" stroke="#4A3B45" strokeWidth={1.4} /></Svg>
          </Animated.View>
          <View style={{ marginTop: 30 }}>{it ? <IconoItem item={it} size={110} /> : null}</View>
          <View style={[estilos.pistaRitmo, { width: pistaW }]}>
            <View style={{ position: 'absolute', left: pistaW * 0.33, width: pistaW * 0.34, top: 0, bottom: 0, backgroundColor: 'rgba(123,196,127,0.45)', borderRadius: 8 }} />
            <View style={{ position: 'absolute', left: pistaW / 2 - 1, top: 0, bottom: 0, width: 2, backgroundColor: colores.verde }} />
            <Animated.View style={[estilos.marcador, marcador]} />
          </View>
          {ultimo ? <Texto variante="cuerpoBold" style={{ color: ultimo === 'bien' ? colores.verde : colores.rosaTinta, position: 'absolute', top: 14 }}>{ultimo === 'bien' ? '¡Tac!' : 'Fuera de ritmo'}</Texto> : null}
        </View>
      </GestureDetector>
      <Texto variante="apoyo" style={{ textAlign: 'center' }}>{hechos} de {n} cortes al ritmo</Texto>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Mezclar (círculos)
// ---------------------------------------------------------------------------
function Mezclar({ paso, onTerminar }: Props) {
  const ancho = useAncho();
  const n = paso.n ?? 6;
  const total = paso.tiempo ?? 14;
  const [vueltas, setVueltas] = useState(0);
  const [salpicones, setSalpicones] = useState(0);
  const [aviso, setAviso] = useState<string | null>(null);
  const [listo, setListo] = useState(false);
  const acum = useRef(0);
  const ultimo = useRef<{ a: number; t: number } | null>(null);
  const ultimoSalpicon = useRef(0);
  const cx = ancho / 2, cy = 115;
  const angulo = useSharedValue(0);

  const restante = useCuentaAtras(total, !listo, () => terminar(acum.current));

  function terminar(a: number) {
    if (listo) return;
    setListo(true);
    const v = a / (Math.PI * 2);
    onTerminar(Math.max(0, Math.min(100, Math.round(Math.min(1, v / n) * 100 - salpicones * 12))));
  }
  function mover(x: number, y: number) {
    if (listo) return;
    const a = Math.atan2(y - cy, x - cx);
    const t = Date.now();
    if (ultimo.current) {
      let d = a - ultimo.current.a;
      if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2;
      const dt = Math.max(1, t - ultimo.current.t) / 1000;
      const vel = Math.abs(d) / dt;
      if (vel > 15 && t - ultimoSalpicon.current > 600) {
        ultimoSalpicon.current = t; setSalpicones((s) => s + 1); setAviso('¡Se derrama! Más suave.');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
        setTimeout(() => setAviso(null), 900);
      } else if (vel <= 15) {
        acum.current += Math.abs(d);
        angulo.value = acum.current;
        const v = acum.current / (Math.PI * 2);
        setVueltas(v);
        if (v >= n) terminar(acum.current);
      }
    }
    ultimo.current = { a, t };
  }
  const pan = Gesture.Pan().minDistance(0)
    .onBegin((e) => { runOnJS(mover)(e.x, e.y); })
    .onUpdate((e) => { runOnJS(mover)(e.x, e.y); })
    .onFinalize(() => { runOnJS(() => { ultimo.current = null; })(); });
  const cuchara = useAnimatedStyle(() => ({ transform: [{ rotate: `${angulo.value}rad` }] }));

  return (
    <View style={{ gap: 10 }}>
      <Tiempo restante={restante} total={total} />
      <GestureDetector gesture={pan}>
        <View style={[estilos.tabla, { width: ancho, height: 230, backgroundColor: '#FFF3F7' }]} accessible accessibilityLabel="Haz círculos sobre el bol">
          <Svg width={ancho} height={230} style={StyleSheet.absoluteFill}>
            <Ellipse cx={cx} cy={cy + 70} rx={92} ry={18} fill="#4A3B45" opacity={0.1} />
            <Circle cx={cx} cy={cy} r={88} fill="#FFFFFF" stroke="#4A3B45" strokeWidth={2.5} />
            <Circle cx={cx} cy={cy} r={72} fill="#F3E4C8" />
            <Circle cx={cx} cy={cy} r={72} fill={colores.rosaClaro} opacity={Math.min(0.9, vueltas / n)} />
          </Svg>
          <Animated.View style={[{ position: 'absolute', left: cx - 8, top: cy - 8, width: 16, height: 16 }, cuchara]}>
            <View style={{ position: 'absolute', left: 4, top: -60, width: 8, height: 70, borderRadius: 4, backgroundColor: '#C99A6B', borderWidth: 1.5, borderColor: '#4A3B45' }} />
            <View style={{ position: 'absolute', left: -2, top: -78, width: 20, height: 24, borderRadius: 10, backgroundColor: '#D9A066', borderWidth: 1.5, borderColor: '#4A3B45' }} />
          </Animated.View>
          {aviso ? <Texto variante="cuerpoBold" style={{ color: colores.rosaTinta, position: 'absolute', top: 12, alignSelf: 'center' }}>{aviso}</Texto> : null}
        </View>
      </GestureDetector>
      <Texto variante="apoyo" style={{ textAlign: 'center' }}>{Math.min(n, Math.floor(vueltas))} de {n} vueltas{salpicones ? ` · ${salpicones} ${salpicones === 1 ? 'salpicón' : 'salpicones'}` : ''}</Texto>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Voltear (sartén)
// ---------------------------------------------------------------------------
function Voltear({ paso, onTerminar }: Props) {
  const ancho = useAncho();
  const n = paso.n ?? 2;
  const [coccion, setCoccion] = useState(0);
  const [lado, setLado] = useState(0);
  const [puntos, setPuntos] = useState<number[]>([]);
  const [listo, setListo] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const activo = useRef(true);
  const salto = useSharedValue(0);

  useEffect(() => {
    const id = setInterval(() => {
      if (!activo.current) return;
      setCoccion((c) => {
        const v = c + 1.1;
        if (v > 100) { activo.current = false; setListo(true); setAviso('¡Se quemó!'); setTimeout(() => onTerminar(25, true), 700); return 100; }
        return v;
      });
    }, 50);
    return () => clearInterval(id);
  }, []);

  function voltear() {
    if (!activo.current || listo) return;
    salto.value = withSpring(1, { damping: 8 }, () => { salto.value = withSpring(0); });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    const enZona = coccion >= 58 && coccion <= 86;
    const p = enZona ? 100 : coccion < 58 ? Math.max(30, Math.round(coccion)) : 60;
    setAviso(enZona ? '¡Justo!' : coccion < 58 ? 'Un poco crudo' : 'Casi tarde');
    setTimeout(() => setAviso(null), 700);
    const nuevos = [...puntos, p]; setPuntos(nuevos);
    const l = lado + 1; setLado(l);
    setCoccion(0);
    if (l >= n) { activo.current = false; setListo(true); setTimeout(() => onTerminar(Math.round(nuevos.reduce((a, b) => a + b, 0) / nuevos.length)), 500); }
  }
  const pan = Gesture.Pan().onEnd((e) => { if (e.translationY < -50) runOnJS(voltear)(); });
  const panqueque = useAnimatedStyle(() => ({ transform: [{ translateY: -salto.value * 90 }, { rotateX: `${salto.value * 180}deg` }] }));
  const color = coccion < 58 ? '#F3E4C8' : coccion <= 86 ? '#E8A33D' : '#5A3B2A';

  return (
    <View style={{ gap: 10 }}>
      <View style={estilos.tiempo}>
        <View style={{ position: 'absolute', left: '58%', width: '28%', top: 0, bottom: 0, backgroundColor: 'rgba(123,196,127,0.5)' }} />
        <View style={[estilos.tiempoRelleno, { width: `${coccion}%`, backgroundColor: coccion > 86 ? colores.rosaTinta : colores.amarillo }]} />
      </View>
      <GestureDetector gesture={pan}>
        <View style={[estilos.tabla, { width: ancho, height: 230, backgroundColor: '#FFF3F7', alignItems: 'center', justifyContent: 'flex-end' }]} accessible accessibilityLabel="Desliza hacia arriba para voltear cuando esté dorado">
          <Svg width={ancho} height={230} style={StyleSheet.absoluteFill}>
            <Ellipse cx={ancho / 2} cy={190} rx={100} ry={22} fill="#3D3A42" stroke="#4A3B45" strokeWidth={2.5} />
            <Ellipse cx={ancho / 2} cy={186} rx={88} ry={16} fill="#5C5A66" />
            <Rect x={ancho / 2 + 96} y={180} width={60} height={12} rx={6} fill="#4A3B45" />
            {coccion > 30 ? <Path d={`M${ancho / 2 - 30} 120c0-10 6-10 6-20M${ancho / 2} 115c0-10 6-10 6-20M${ancho / 2 + 30} 120c0-10 6-10 6-20`} stroke="#9A9AA8" strokeWidth={2} fill="none" strokeLinecap="round" opacity={0.6} /> : null}
          </Svg>
          <Animated.View style={[{ position: 'absolute', bottom: 34 }, panqueque]}>
            <Svg width={130} height={44} viewBox="0 0 130 44"><Ellipse cx={65} cy={22} rx={60} ry={18} fill={color} stroke="#4A3B45" strokeWidth={2.5} /><Ellipse cx={65} cy={18} rx={44} ry={9} fill="#FFFFFF" opacity={0.25} /></Svg>
          </Animated.View>
          {aviso ? <Texto variante="cuerpoBold" style={{ color: aviso === '¡Justo!' ? colores.verde : colores.rosaTinta, position: 'absolute', top: 14 }}>{aviso}</Texto> : null}
        </View>
      </GestureDetector>
      <Texto variante="apoyo" style={{ textAlign: 'center' }}>Lado {Math.min(n, lado + 1)} de {n} · voltea en la zona verde</Texto>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Fuego (perilla)
// ---------------------------------------------------------------------------
function Fuego({ paso, onTerminar }: Props) {
  const ancho = useAncho();
  const total = paso.tiempo ?? 10;
  const [temp, setTemp] = useState(0.5);
  const [zona, setZona] = useState(0.5);
  const [enZona, setEnZona] = useState(0);
  const [listo, setListo] = useState(false);
  const tempRef = useRef(0.5);
  const pistaW = ancho - 40;
  const pos = useSharedValue(pistaW * 0.5), inicioPos = useSharedValue(0);

  useEffect(() => {
    const t0 = Date.now();
    const id = setInterval(() => {
      const t = (Date.now() - t0) / 1000;
      const z = 0.5 + Math.sin(t * 0.9) * 0.28 + Math.sin(t * 2.3) * 0.1;
      setZona(z);
      if (Math.abs(tempRef.current - z) < 0.11) setEnZona((e) => e + 0.05);
    }, 50);
    return () => clearInterval(id);
  }, []);
  const restante = useCuentaAtras(total, !listo, () => { setListo(true); onTerminar(Math.round(Math.min(1, enZona / (total * 0.6)) * 100)); });

  function fijar(v: number) { const c = Math.max(0, Math.min(1, v)); tempRef.current = c; setTemp(c); }
  const pan = Gesture.Pan().minDistance(0)
    .onBegin(() => { inicioPos.value = pos.value; })
    .onUpdate((e) => { pos.value = Math.max(0, Math.min(pistaW, inicioPos.value + e.translationX)); runOnJS(fijar)(pos.value / pistaW); });
  const perilla = useAnimatedStyle(() => ({ transform: [{ translateX: pos.value - 22 }] }));
  const dentro = Math.abs(temp - zona) < 0.11;

  return (
    <View style={{ gap: 10 }}>
      <Tiempo restante={restante} total={total} />
      <View style={[estilos.tabla, { width: ancho, height: 230, backgroundColor: '#FFF3F7', alignItems: 'center', justifyContent: 'center', gap: 18 }]}>
        <Svg width={140} height={110} viewBox="0 0 140 110">
          <Rect x={20} y={40} width={100} height={50} rx={10} fill="#D9D9E0" stroke="#4A3B45" strokeWidth={2.5} />
          <Path d="M20 50h100" stroke="#4A3B45" strokeWidth={2} />
          {[40, 70, 100].map((x) => <Path key={x} d={`M${x} 100c-10-10 0-18 4-26 4 8 14 16 4 26z`} fill={dentro ? '#FFA557' : temp > zona ? '#E63950' : '#6BC8E8'} opacity={0.35 + temp * 0.65} />)}
        </Svg>
        <View style={[estilos.pistaRitmo, { width: pistaW, height: 26 }]}>
          <View style={{ position: 'absolute', left: (zona - 0.11) * pistaW, width: 0.22 * pistaW, top: 0, bottom: 0, backgroundColor: 'rgba(123,196,127,0.55)', borderRadius: 8 }} />
          <GestureDetector gesture={pan}>
            <Animated.View style={[estilos.perilla, perilla]} accessible accessibilityLabel="Perilla de temperatura, arrástrala" />
          </GestureDetector>
        </View>
        <Texto variante="cuerpoBold" style={{ color: dentro ? colores.verde : colores.rosaTinta }}>{dentro ? 'Temperatura justa' : temp > zona ? 'Muy fuerte' : 'Muy suave'}</Texto>
      </View>
      <Texto variante="apoyo" style={{ textAlign: 'center' }}>Sigue la zona verde con la perilla. {Math.round(Math.min(100, (enZona / (total * 0.6)) * 100))} %</Texto>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Verter (mantener y soltar en la línea)
// ---------------------------------------------------------------------------
function Verter({ paso, onTerminar }: Props) {
  const ancho = useAncho();
  const [nivel, setNivel] = useState(0);
  const [listo, setListo] = useState(false);
  const vertiendo = useRef(false);
  const it = item(paso.ingrediente ?? 'leche_ing');
  const color = it?.c1 ?? '#FFFFFF';

  useEffect(() => {
    const id = setInterval(() => {
      if (!vertiendo.current || listo) return;
      setNivel((v) => {
        const n = v + 1.4;
        if (n >= 110) { setListo(true); setTimeout(() => onTerminar(20), 500); vertiendo.current = false; return 110; }
        return n;
      });
    }, 50);
    return () => clearInterval(id);
  }, [listo]);

  function soltar() {
    if (listo || !vertiendo.current) return;
    vertiendo.current = false;
    if (nivel < 8) return;
    setListo(true);
    const p = nivel >= 82 && nivel <= 96 ? 100 : nivel >= 72 && nivel <= 100 ? 70 : nivel > 100 ? 30 : Math.max(20, Math.round(nivel * 0.6));
    Haptics.notificationAsync(p === 100 ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning).catch(() => {});
    setTimeout(() => onTerminar(p), 500);
  }
  const H = 150;

  return (
    <View style={{ gap: 10 }}>
      <Pressable
        onPressIn={() => { vertiendo.current = true; Haptics.selectionAsync().catch(() => {}); }}
        onPressOut={soltar}
        disabled={listo}
        accessibilityRole="button" accessibilityLabel="Mantén apretado para verter; suelta en la línea"
        style={[estilos.tabla, { width: ancho, height: 260, backgroundColor: '#FFF3F7', alignItems: 'center', justifyContent: 'center' }]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 30 }}>
          <View style={{ transform: [{ rotate: vertiendo.current && !listo ? '-35deg' : '0deg' }], marginBottom: 90 }}>{it ? <IconoItem item={it} size={70} /> : null}</View>
          <View style={{ width: 90, height: H, borderWidth: 3, borderColor: '#4A3B45', borderRadius: 12, borderTopWidth: 0, overflow: 'hidden', justifyContent: 'flex-end', backgroundColor: '#FFFFFF' }}>
            <View style={{ position: 'absolute', left: 0, right: 0, top: H * (1 - 0.89), borderTopWidth: 2, borderColor: colores.rosaTinta, borderStyle: 'dashed' }} />
            <View style={{ position: 'absolute', left: 0, right: 0, top: H * (1 - 0.96), height: H * 0.14, backgroundColor: 'rgba(123,196,127,0.35)' }} />
            <View style={{ height: `${Math.min(100, nivel)}%`, backgroundColor: color, opacity: 0.9 }} />
          </View>
        </View>
        {nivel > 100 ? <Texto variante="cuerpoBold" style={{ color: colores.rosaTinta, position: 'absolute', top: 14 }}>¡Se rebalsó!</Texto> : null}
      </Pressable>
      <Texto variante="apoyo" style={{ textAlign: 'center' }}>{listo ? (nivel > 100 ? 'Demasiado.' : nivel >= 82 && nivel <= 96 ? 'Perfecto.' : 'Más o menos.') : 'Mantén apretado y suelta justo en la línea.'}</Texto>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Emplatar (arrastrar a los puntos)
// ---------------------------------------------------------------------------
function Emplatar({ paso, onTerminar }: Props) {
  const ancho = useAncho();
  const n = paso.n ?? 3;
  const total = paso.tiempo ?? 14;
  const [puestas, setPuestas] = useState<number[]>([]);
  const [listo, setListo] = useState(false);
  const it = item(paso.ingrediente ?? 'frutilla_ing');
  const ref = useRef<View>(null);
  const [origen, setOrigen] = useState<{ x: number; y: number } | null>(null);
  const cx = ancho / 2, cy = 100;
  const puntos = Array.from({ length: n }, (_, i) => {
    const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
    return { x: cx + Math.cos(a) * 46, y: cy + Math.sin(a) * 36 };
  });
  const restante = useCuentaAtras(total, !listo, () => terminar(puestas.length));

  function terminar(k: number) {
    if (listo) return;
    setListo(true);
    onTerminar(Math.round((k / n) * 70 + (restante / total) * 30));
  }
  function soltar(absX: number, absY: number, i: number): boolean {
    if (!origen || listo) return false;
    const x = absX - origen.x, y = absY - origen.y;
    const libre = puntos.findIndex((p, k) => !puestas.includes(k) && Math.hypot(p.x - x, p.y - y) < 34);
    if (libre < 0) return false;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const nuevas = [...puestas, libre]; setPuestas(nuevas);
    if (nuevas.length >= n) setTimeout(() => terminar(nuevas.length), 300);
    return true;
  }

  return (
    <View style={{ gap: 10 }}>
      <Tiempo restante={restante} total={total} />
      <View ref={ref} collapsable={false} onLayout={() => ref.current?.measureInWindow((x, y) => setOrigen({ x, y }))} style={[estilos.tabla, { width: ancho, height: 250, backgroundColor: '#FFF3F7' }]}>
        <Svg width={ancho} height={250} style={StyleSheet.absoluteFill}>
          <Ellipse cx={cx} cy={cy} rx={100} ry={70} fill="#FFFFFF" stroke="#4A3B45" strokeWidth={2.5} />
          <Ellipse cx={cx} cy={cy} rx={80} ry={54} fill="none" stroke={colores.rosaClaro} strokeWidth={2} />
          {puntos.map((p, i) => (puestas.includes(i) ? null : <Circle key={i} cx={p.x} cy={p.y} r={16} fill="none" stroke={colores.rosaTinta} strokeWidth={2} strokeDasharray="4 4" />))}
        </Svg>
        {puestas.map((k) => (
          <View key={k} pointerEvents="none" style={{ position: 'absolute', left: puntos[k].x - 18, top: puntos[k].y - 18 }}>{it ? <IconoItem item={it} size={36} /> : null}</View>
        ))}
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 12, flexDirection: 'row', justifyContent: 'center', gap: 14 }}>
          {Array.from({ length: n - puestas.length }, (_, i) => (
            <Pieza key={`${i}-${puestas.length}`} onSoltar={(x, y) => soltar(x, y, i)}>{it ? <IconoItem item={it} size={44} /> : null}</Pieza>
          ))}
        </View>
      </View>
      <Texto variante="apoyo" style={{ textAlign: 'center' }}>{puestas.length} de {n} en su lugar</Texto>
    </View>
  );
}

function Pieza({ children, onSoltar }: { children: React.ReactNode; onSoltar: (x: number, y: number) => boolean }) {
  const tx = useSharedValue(0), ty = useSharedValue(0);
  const pan = Gesture.Pan()
    .onUpdate((e) => { tx.value = e.translationX; ty.value = e.translationY; })
    .onEnd((e) => { runOnJS(onSoltar)(e.absoluteX, e.absoluteY); })
    .onFinalize(() => { tx.value = withSpring(0); ty.value = withSpring(0); });
  const estilo = useAnimatedStyle(() => ({ transform: [{ translateX: tx.value }, { translateY: ty.value }] }));
  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[estilos.pieza, estilo]} accessible accessibilityLabel="Pieza, arrástrala al plato">{children}</Animated.View>
    </GestureDetector>
  );
}

const estilos = StyleSheet.create({
  tiempo: { height: 10, borderRadius: 5, backgroundColor: colores.rosaClaro, overflow: 'hidden' },
  tiempoRelleno: { height: '100%', borderRadius: 5 },
  tabla: { alignSelf: 'center', borderRadius: 20, overflow: 'hidden', ...sombras.rosadaSuave },
  pistaRitmo: { height: 22, borderRadius: 11, backgroundColor: '#FFFFFF', marginTop: 16, overflow: 'visible', borderWidth: 2, borderColor: colores.rosaClaro },
  marcador: { position: 'absolute', top: -4, width: 18, height: 26, borderRadius: 9, backgroundColor: colores.rosaTinta },
  perilla: { position: 'absolute', top: -11, width: 44, height: 44, borderRadius: 22, backgroundColor: colores.rosaTinta, borderWidth: 3, borderColor: colores.crema, ...sombras.rosadaSuave },
  pieza: { width: 56, height: 56, borderRadius: 14, backgroundColor: colores.crema, alignItems: 'center', justifyContent: 'center', ...sombras.rosadaSuave },
});
