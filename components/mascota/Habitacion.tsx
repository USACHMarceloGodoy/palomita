// La casa: pared, suelo, ventana con el cielo real (hora y estación de Chile),
// muebles comprados y adornos de temporada. La mascota va encima, centrada.
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';
import { item } from '@/lib/mascota-virtual/catalogo';
import { estacion as estacionDe, momentoDia, temporada as temporadaDe } from '@/lib/mascota-virtual/tiempo';
import type { Decoracion, Estacion, MomentoDia, Temporada } from '@/lib/mascota-virtual/tipos';

const W = 360, H = 230, PISO = 150;
const TRAZO = '#4A3B45';

type Props = { decoracion: Decoracion; ancho: number; children?: ReactNode; momento?: MomentoDia; estacion?: Estacion; temporada?: Temporada | null };

export function Habitacion({ decoracion, ancho, children, momento = momentoDia(), estacion = estacionDe(), temporada = temporadaDe() }: Props) {
  const alto = (ancho * H) / W;
  const pared = item(decoracion.pared) ?? item('pared_rosa')!;
  const suelo = item(decoracion.suelo) ?? item('suelo_madera')!;
  const noche = momento === 'noche';
  const tinte = noche ? 'rgba(46,42,85,0.32)' : momento === 'atardecer' ? 'rgba(255,165,87,0.14)' : momento === 'amanecer' ? 'rgba(255,214,228,0.18)' : 'transparent';

  return (
    <View style={{ width: ancho, height: alto, borderRadius: 24, overflow: 'hidden' }}>
      <Svg width={ancho} height={alto} viewBox={`0 0 ${W} ${H}`}>
        <Rect x={0} y={0} width={W} height={PISO} fill={pared.c1} />
        <G fill={pared.c2} opacity={0.55}>
          {Array.from({ length: 24 }, (_, i) => <Circle key={i} cx={20 + (i % 8) * 46 + (Math.floor(i / 8) % 2) * 23} cy={18 + Math.floor(i / 8) * 40} r={3} />)}
        </G>
        <Rect x={0} y={PISO} width={W} height={H - PISO} fill={suelo.c1} />
        <G stroke={suelo.c2} strokeWidth={2}>
          {Array.from({ length: 4 }, (_, i) => <Path key={i} d={`M0 ${PISO + 20 + i * 20}H${W}`} />)}
          {Array.from({ length: 6 }, (_, i) => <Path key={`v${i}`} d={`M${30 + i * 60} ${PISO}v20M${60 + i * 60} ${PISO + 20}v20M${30 + i * 60} ${PISO + 40}v20M${60 + i * 60} ${PISO + 60}v20`} />)}
        </G>
        <Path d={`M0 ${PISO}H${W}`} stroke={TRAZO} strokeWidth={1.5} opacity={0.25} />
        <Ventana x={26} y={22} momento={momento} estacion={estacion} />
        {decoracion.muebles.map((id) => <G key={id}>{mueble(id)}</G>)}
        {temporada ? adorno(temporada) : null}
        {tinte !== 'transparent' ? <Rect x={0} y={0} width={W} height={H} fill={tinte} /> : null}
      </Svg>
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

function mueble(id: string) {
  const it = item(id);
  if (!it) return null;
  const c1 = it.c1 ?? '#FFB3C6', c2 = it.c2 ?? '#D6336C';
  const t = { stroke: TRAZO, strokeWidth: 1.5 };
  switch (it.dibujo) {
    case 'cama':
      return <G><Rect x={24} y={176} width={92} height={40} rx={18} fill={c1} {...t} /><Rect x={34} y={186} width={72} height={22} rx={12} fill={c2} /><Rect x={30} y={168} width={30} height={16} rx={7} fill="#FFFFFF" {...t} /></G>;
    case 'estante':
      return <G><Rect x={260} y={40} width={80} height={9} rx={4} fill={c1} {...t} /><Rect x={270} y={18} width={20} height={22} rx={5} fill={c2} {...t} /><Rect x={298} y={22} width={16} height={18} rx={8} fill="#9FD9C9" {...t} /><Rect x={260} y={92} width={80} height={9} rx={4} fill={c1} {...t} /><Rect x={272} y={74} width={26} height={18} rx={4} fill="#FFD93D" {...t} /></G>;
    case 'planta':
      return <G transform="translate(296 150)"><Path d="M8 32h32l-4 22H12z" fill={c2} {...t} /><Path d="M24 32V6" stroke={c1} strokeWidth={4} /><Path d="M24 22C12 20 6 10 10 0c10 2 16 10 14 22zM24 18c12-2 18-12 14-22-10 2-16 10-14 22z" fill={c1} {...t} /></G>;
    case 'lampara':
      return <G transform="translate(28 96)"><Path d="M4 28L14 2h20l10 26z" fill={c1} {...t} strokeLinejoin="round" /><Path d="M24 28v40" stroke={c2} strokeWidth={5} /><Rect x={10} y={66} width={28} height={8} rx={4} fill={c2} {...t} /><Ellipse cx={24} cy={30} rx={26} ry={10} fill="#FFF3C4" opacity={0.35} /></G>;
    case 'cuadro':
      return <G transform="translate(150 30)"><Rect x={0} y={0} width={64} height={52} rx={4} fill={c1} stroke={c2} strokeWidth={6} /><Path d="M8 44l14-18 12 12 8-8 12 14z" fill="#3E8A62" /><Circle cx={44} cy={16} r={7} fill="#FFD93D" /></G>;
    case 'alfombrita':
      return <G><Ellipse cx={180} cy={205} rx={80} ry={20} fill={c1} {...t} /><Ellipse cx={180} cy={205} rx={54} ry={12} fill="none" stroke={c2} strokeWidth={2.5} /></G>;
    case 'pecera':
      return <G transform="translate(236 104)"><Path d="M6 6h56v28a14 14 0 0 1-14 14H20A14 14 0 0 1 6 34z" fill={c1} opacity={0.7} {...t} /><Ellipse cx={30} cy={30} rx={9} ry={5} fill={c2} /><Path d="M39 30l7-5v10z" fill={c2} /><Circle cx={16} cy={16} r={2.5} fill="#FFFFFF" /><Circle cx={50} cy={20} r={2} fill="#FFFFFF" /></G>;
    case 'arbolito':
      return <G transform="translate(268 84)"><Path d="M36 0l18 24h-10l14 18H46l14 20H12l14-20H14l14-18H18z" fill={c1} {...t} strokeLinejoin="round" /><Rect x={30} y={62} width={12} height={10} fill="#8C6239" /><G fill={c2}><Circle cx={30} cy={26} r={3} /><Circle cx={44} cy={42} r={3} /><Circle cx={24} cy={54} r={3} /><Circle cx={50} cy={58} r={3} /></G><Path d="M36-6l2.5 5 5 .8-3.6 3.5.9 5.2L36 6l-4.8 2.5.9-5.2L28.5-.2l5-.8z" fill="#FFD93D" /></G>;
    case 'calabaza':
      return <G transform="translate(280 168)"><Ellipse cx={30} cy={30} rx={28} ry={22} fill={c1} {...t} /><Path d="M18 10c-2 12-2 28 0 40M42 10c2 12 2 28 0 40" stroke={TRAZO} opacity={0.4} /><Path d="M30 8c0-6 4-9 9-9" stroke={c2} strokeWidth={4} strokeLinecap="round" fill="none" /><Path d="M16 24l8 6-8 0zM44 24l-8 6 8 0zM18 38c6 6 18 6 24 0" fill={TRAZO} /></G>;
    case 'guirnalda':
      return <G><Path d="M0 14c60 40 120 40 180 0s120-40 180 0" fill="none" stroke={TRAZO} strokeWidth={1.5} /><G {...t} strokeLinejoin="round">{Array.from({ length: 9 }, (_, i) => <Path key={i} d={`M${20 + i * 40} ${18 + Math.sin((i / 8) * Math.PI) * 26}l7 22 7-22z`} fill={i % 2 ? c2 : c1} />)}</G></G>;
    case 'huevo_pascua':
      return <G transform="translate(200 170)"><Ellipse cx={20} cy={26} rx={16} ry={22} fill={c1} {...t} /><Path d="M6 20c5 3 9 3 14 0s9-3 14 0M6 32c5 3 9 3 14 0s9-3 14 0" fill="none" stroke={c2} strokeWidth={3} /></G>;
    case 'corazones_pared':
      return <G><Path d="M120 10c40 30 80 30 120 0" fill="none" stroke={TRAZO} strokeWidth={1.5} />{[140, 180, 220].map((x, i) => <Path key={x} d={`M${x} ${44 + (i % 2) * 6}s-12-8-12-16a6 6 0 0 1 12-2 6 6 0 0 1 12 2c0 8-12 16-12 16z`} fill={i === 1 ? c2 : c1} {...t} />)}</G>;
    default:
      return null;
  }
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
