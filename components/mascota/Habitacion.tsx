// Una habitación de la casa: fondo (pared o cielo según el tipo), suelo,
// ventana con el cielo real (hora y estación de Chile), adornos de temporada
// y los muebles puestos donde la persona los arrastró. La mascota va encima.
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';
import { item } from '@/lib/mascota-virtual/catalogo';
import { estacion as estacionDe, momentoDia, temporada as temporadaDe } from '@/lib/mascota-virtual/tiempo';
import type { Estacion, Habitacion as HabitacionT, MomentoDia, Temporada } from '@/lib/mascota-virtual/tipos';
import { Objeto } from './IconosMascota';

export const W = 360, H = 230, PISO = 150;
const TRAZO = '#4A3B45';

type Props = {
  habitacion: HabitacionT;
  ancho: number;
  children?: ReactNode;
  sinMuebles?: boolean;          // el que decora dibuja los muebles él mismo (arrastrables)
  momento?: MomentoDia; estacion?: Estacion; temporada?: Temporada | null;
};

export function Habitacion({ habitacion, ancho, children, sinMuebles, momento = momentoDia(), estacion = estacionDe(), temporada = temporadaDe() }: Props) {
  const alto = (ancho * H) / W;
  const pared = item(habitacion.pared) ?? item('pared_rosa')!;
  const suelo = item(habitacion.suelo) ?? item('suelo_madera')!;
  const exterior = habitacion.tipo === 'jardin' || habitacion.tipo === 'terraza';
  const noche = momento === 'noche';
  const tinte = noche ? 'rgba(46,42,85,0.32)' : momento === 'atardecer' ? 'rgba(255,165,87,0.14)' : momento === 'amanecer' ? 'rgba(255,214,228,0.18)' : 'transparent';
  const cielo = { amanecer: '#FFD6E4', dia: '#BEE7FF', atardecer: '#FFB07A', noche: '#2E2A55' }[momento];

  return (
    <View style={{ width: ancho, height: alto, borderRadius: 24, overflow: 'hidden' }}>
      <Svg width={ancho} height={alto} viewBox={`0 0 ${W} ${H}`}>
        {exterior ? (
          <G>
            <Rect x={0} y={0} width={W} height={PISO} fill={cielo} />
            {noche ? <G fill="#FFE9A8"><Circle cx={60} cy={30} r={2} /><Circle cx={140} cy={60} r={1.5} /><Circle cx={250} cy={24} r={2} /><Circle cx={320} cy={70} r={1.5} /><Circle cx={300} cy={40} r={14} fill="#FFF3C4" /><Circle cx={306} cy={35} r={11} fill={cielo} /></G>
              : <Circle cx={300} cy={40} r={momento === 'atardecer' ? 18 : 14} fill={momento === 'atardecer' ? '#FF8A5B' : '#FFD93D'} />}
            <G fill="#FFFFFF" opacity={0.8}><Ellipse cx={80} cy={50} rx={30} ry={12} /><Ellipse cx={100} cy={44} rx={22} ry={12} /><Ellipse cx={220} cy={80} rx={26} ry={10} /></G>
            {habitacion.tipo === 'jardin' ? <Path d="M0 150c40-30 80-30 120 0s80 30 120 0 80-30 120 0z" fill={pared.c2} opacity={0.6} /> : <Path d={`M0 ${PISO - 40}h${W}v40H0z`} fill={pared.c1} />}
            {habitacion.tipo === 'terraza' ? <G stroke={pared.c2} strokeWidth={3}>{Array.from({ length: 12 }, (_, i) => <Path key={i} d={`M${15 + i * 30} ${PISO - 40}v40`} />)}<Path d={`M0 ${PISO - 40}h${W}`} strokeWidth={5} /></G> : null}
          </G>
        ) : (
          <G>
            <Rect x={0} y={0} width={W} height={PISO} fill={pared.c1} />
            {habitacion.tipo === 'atico'
              ? <Path d={`M0 60L${W / 2} -10L${W} 60V0H0z`} fill={pared.c2} opacity={0.5} />
              : <G fill={pared.c2} opacity={0.55}>{Array.from({ length: 24 }, (_, i) => <Circle key={i} cx={20 + (i % 8) * 46 + (Math.floor(i / 8) % 2) * 23} cy={18 + Math.floor(i / 8) * 40} r={3} />)}</G>}
            <Ventana x={habitacion.tipo === 'dormitorio' ? 260 : 26} y={22} momento={momento} estacion={estacion} />
            {habitacion.tipo === 'bano' ? <G stroke={pared.c2} strokeWidth={1.5} opacity={0.6}>{Array.from({ length: 6 }, (_, i) => <Path key={i} d={`M0 ${100 + i * 10}h${W}`} />)}</G> : null}
          </G>
        )}
        <Rect x={0} y={PISO} width={W} height={H - PISO} fill={suelo.c1} />
        <G stroke={suelo.c2} strokeWidth={2}>
          {Array.from({ length: 4 }, (_, i) => <Path key={i} d={`M0 ${PISO + 20 + i * 20}H${W}`} />)}
          {Array.from({ length: 6 }, (_, i) => <Path key={`v${i}`} d={`M${30 + i * 60} ${PISO}v20M${60 + i * 60} ${PISO + 20}v20M${30 + i * 60} ${PISO + 40}v20M${60 + i * 60} ${PISO + 60}v20`} />)}
        </G>
        <Path d={`M0 ${PISO}H${W}`} stroke={TRAZO} strokeWidth={1.5} opacity={0.25} />
        {temporada ? adorno(temporada) : null}
        {tinte !== 'transparent' ? <Rect x={0} y={0} width={W} height={H} fill={tinte} /> : null}
      </Svg>
      {!sinMuebles ? habitacion.muebles.map((m, i) => {
        const it = item(m.id);
        if (!it) return null;
        const tam = (it.tam ?? 0.22) * ancho;
        return (
          <View key={`${m.id}-${i}`} pointerEvents="none" style={{ position: 'absolute', left: m.x * ancho - tam / 2, top: m.y * alto - tam / 2 }}>
            <Objeto clave={it.dibujo} c1={it.c1 ?? '#FFB3C6'} c2={it.c2 ?? '#D6336C'} size={tam} />
          </View>
        );
      }) : null}
      <View style={estilos.mascota} pointerEvents="box-none">{children}</View>
      {noche ? <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(30,26,60,0.10)' }]} /> : null}
    </View>
  );
}

function Ventana({ x, y, momento, estacion }: { x: number; y: number; momento: MomentoDia; estacion: Estacion }) {
  const cielo = { amanecer: '#FFD6E4', dia: '#BEE7FF', atardecer: '#FFB07A', noche: '#2E2A55' }[momento];
  return (
    <G transform={`translate(${x} ${y})`}>
      <Rect x={0} y={0} width={70} height={84} rx={10} fill={cielo} stroke="#FFF7EE" strokeWidth={6} />
      {momento === 'noche' ? (
        <G>
          <Circle cx={48} cy={24} r={11} fill="#FFF3C4" /><Circle cx={53} cy={20} r={9} fill={cielo} />
          <Circle cx={16} cy={16} r={1.8} fill="#FFE9A8" /><Circle cx={28} cy={40} r={1.4} fill="#FFE9A8" /><Circle cx={14} cy={54} r={1.2} fill="#FFE9A8" />
        </G>
      ) : (
        <Circle cx={momento === 'dia' ? 48 : 22} cy={momento === 'dia' ? 22 : 40} r={momento === 'atardecer' ? 12 : 9} fill={momento === 'atardecer' ? '#FF8A5B' : '#FFD93D'} />
      )}
      {estacion === 'invierno' ? <G fill="#FFFFFF"><Circle cx={12} cy={30} r={2} /><Circle cx={40} cy={50} r={2} /><Circle cx={58} cy={64} r={2} /><Circle cx={24} cy={68} r={2} /><Path d="M3 78h64v6H3z" opacity={0.9} /></G> : null}
      {estacion === 'otono' ? <G fill="#E09A1F"><Ellipse cx={14} cy={70} rx={4} ry={2.5} /><Ellipse cx={50} cy={60} rx={4} ry={2.5} transform="rotate(30 50 60)" /><Ellipse cx={34} cy={76} rx={4} ry={2.5} /></G> : null}
      {estacion === 'primavera' ? <G><Path d="M8 84c4-14 10-18 16-14-4 4-6 10-16 14z" fill="#3E8A62" /><Circle cx={22} cy={68} r={4} fill="#FF6F91" /><Circle cx={22} cy={68} r={1.6} fill="#FFD93D" /><Circle cx={56} cy={74} r={3.5} fill="#FFD93D" /></G> : null}
      {estacion === 'verano' && momento !== 'noche' ? <Path d="M0 60c10-8 20-8 30 0s20 8 40 0" fill="none" stroke="#6BC8E8" strokeWidth={4} opacity={0.6} /> : null}
      <Path d="M35 0v84M0 42h70" stroke="#FFF7EE" strokeWidth={4} />
    </G>
  );
}

function adorno(t: Temporada) {
  switch (t) {
    case 'dieciocho':
      return <G>{Array.from({ length: 10 }, (_, i) => <Path key={i} d={`M${18 + i * 36} 0l8 18 8-18z`} fill={i % 3 === 0 ? '#E63950' : i % 3 === 1 ? '#FFFFFF' : '#3B7DD8'} stroke={TRAZO} strokeWidth={1.2} strokeLinejoin="round" />)}</G>;
    case 'navidad':
      return <G>{Array.from({ length: 12 }, (_, i) => <Circle key={i} cx={15 + i * 30} cy={8 + (i % 2) * 8} r={4} fill={['#E63950', '#FFD93D', '#3E8A62', '#6BC8E8'][i % 4]} stroke={TRAZO} strokeWidth={1} />)}<Path d="M0 4c60 14 120 14 180 0s120-14 180 0" fill="none" stroke="#3E8A62" strokeWidth={2} /></G>;
    case 'halloween':
      return <G><Path d="M300 0v30M310 0v40M320 0v26" stroke="#FFFFFF" strokeWidth={1} opacity={0.7} /><Ellipse cx={310} cy={44} rx={10} ry={12} fill="#FFFFFF" stroke={TRAZO} strokeWidth={1.2} /><Circle cx={306} cy={42} r={1.6} fill={TRAZO} /><Circle cx={314} cy={42} r={1.6} fill={TRAZO} /></G>;
    case 'san_valentin':
      return <G>{[40, 100, 160, 220, 280].map((x, i) => <Path key={x} d={`M${x} ${20 + (i % 2) * 8}s-8-5-8-11a4 4 0 0 1 8-1.5 4 4 0 0 1 8 1.5c0 6-8 11-8 11z`} fill={i % 2 ? '#FF6F91' : '#FFB3C6'} stroke={TRAZO} strokeWidth={1.2} />)}</G>;
    case 'pascua':
      return <G>{[60, 200, 330].map((x, i) => <Ellipse key={x} cx={x} cy={PISO + 60} rx={8} ry={11} fill={['#E2D5F8', '#C8F0DC', '#FFF3C4'][i]} stroke={TRAZO} strokeWidth={1.2} />)}</G>;
  }
}

const estilos = StyleSheet.create({
  mascota: { position: 'absolute', left: 0, right: 0, bottom: 4, alignItems: 'center' },
});
