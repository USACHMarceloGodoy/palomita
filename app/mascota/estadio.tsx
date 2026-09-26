// Estadio: carrera de velocidad de diez segundos contra dos vecinos. Cada toque
// empuja a tu mascota. La primera carrera del día da trofeo y besitos.
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
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

export default function Estadio() {
  const { rol, mascota, saldo, cantidad, recargar } = useMascota();
  const [fase, setFase] = useState<'antes' | 'corriendo' | 'fin'>('antes');
  const [yo, setYo] = useState(0);
  const [vecinos, setVecinos] = useState([0, 0]);
  const [tiempo, setTiempo] = useState(DURACION);
  const [lugar, setLugar] = useState<1 | 2 | 3 | null>(null);
  const [ganado, setGanado] = useState(0);
  const [hechaHoy, setHechaHoy] = useState(false);
  const toques = useRef(0);
  const inicio = useRef(0);

  useEffect(() => { carreraDeHoy(rol).then((p) => setHechaHoy(!!p)).catch(() => {}); }, [rol]);

  useEffect(() => {
    if (fase !== 'corriendo') return;
    const velocidades = VECINOS.map(() => 0.55 + Math.random() * 0.5);
    const id = setInterval(() => {
      const t = Date.now() - inicio.current;
      setTiempo(Math.max(0, DURACION - t));
      setVecinos((v) => v.map((x, i) => Math.min(100, x + velocidades[i] * (0.7 + Math.random() * 0.6))));
      if (t >= DURACION) { clearInterval(id); setFase('fin'); }
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
    toques.current = 0; inicio.current = Date.now();
    setYo(0); setVecinos([0, 0]); setLugar(null); setGanado(0); setTiempo(DURACION);
    setFase('corriendo');
  }

  function correr() {
    if (fase !== 'corriendo') return;
    toques.current += 1;
    Haptics.selectionAsync().catch(() => {});
    setYo((y) => Math.min(100, y + 2.2));
  }

  return (
    <Pantalla fondo="#FFF3C4">
      <Cabecera titulo="Estadio" saldo={saldo} subtitulo={hechaHoy ? 'La carrera de hoy ya dio premio; las demás son por gusto.' : 'Una carrera al día con trofeo y besitos.'} />

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
        <Pressable onPress={correr} accessibilityRole="button" accessibilityLabel="Correr" style={estilos.botonCorrer}>
          <Texto variante="tituloGrande" style={{ color: colores.crema }}>¡Toca, toca!</Texto>
          <Texto variante="cuerpoBold" style={{ color: colores.crema }}>{(tiempo / 1000).toFixed(1)} s</Texto>
        </Pressable>
      ) : null}

      {fase === 'fin' && lugar ? (
        <View style={estilos.resultado}>
          <IconoItem item={lugar === 1 ? 'trofeo_oro' : lugar === 2 ? 'trofeo_plata' : 'trofeo_bronce'} size={64} />
          <Texto variante="tituloGrande" style={{ color: colores.crema }}>{lugar === 1 ? '¡Primer lugar!' : lugar === 2 ? '¡Segundo lugar!' : 'Tercer lugar'}</Texto>
          <Texto variante="cuerpoBold" style={{ color: colores.rosaBase }}>{ganado ? `+${ganado} besitos y trofeo` : 'Por gusto: sin premio, pero con orgullo.'}</Texto>
        </View>
      ) : null}

      {fase !== 'corriendo' ? <BotonKawaii titulo={fase === 'fin' ? 'Otra carrera' : 'Empezar'} onPress={empezar} /> : null}

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
  botonCorrer: { minHeight: 120, borderRadius: 28, backgroundColor: colores.rosaTinta, alignItems: 'center', justifyContent: 'center', gap: 4, ...sombras.rosada },
  resultado: { backgroundColor: colores.rosaTinta, borderRadius: 24, padding: 18, alignItems: 'center', gap: 6 },
  vitrina: { backgroundColor: colores.crema, borderRadius: 20, padding: 14, gap: 8, alignItems: 'center' },
});
