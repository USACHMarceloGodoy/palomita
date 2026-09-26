// Iconografía vectorial del sistema de mascota: objetos del catálogo (comida,
// peces, muebles...) e íconos de interfaz (acciones y menú). Los emojis del
// mockup eran placeholders; esto los reemplaza.
import Svg, { Circle, Ellipse, G, Line, Path, Rect } from 'react-native-svg';
import { item } from '@/lib/mascota-virtual/catalogo';
import type { Item } from '@/lib/mascota-virtual/tipos';
import { PrendaSola } from './MascotaVirtual';

const TRAZO = '#4A3B45';

export function IconoItem({ item: it, size = 40 }: { item: Item | string; size?: number }) {
  const i = typeof it === 'string' ? item(it) : it;
  if (!i) return null;
  if (i.categoria === 'ropa') return <PrendaSola id={i.id} size={size} />;
  return <Objeto clave={i.dibujo} c1={i.c1 ?? '#FFB3C6'} c2={i.c2 ?? '#D6336C'} size={size} />;
}

export function Objeto({ clave, c1, c2, size = 40 }: { clave: string; c1: string; c2: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      {objeto(clave, c1, c2)}
    </Svg>
  );
}

function objeto(clave: string, c1: string, c2: string) {
  const t = { stroke: TRAZO, strokeWidth: 1.4 };
  switch (clave) {
    // -------- comida e ingredientes --------
    case 'manzana':
      return (
        <G>
          <Path d="M20 12c-8-6-15 2-13 11s7 12 13 11c6 1 11-2 13-11s-5-17-13-11z" fill={c1} {...t} />
          <Path d="M20 12V6" stroke="#6B4A2A" strokeWidth={2} strokeLinecap="round" />
          <Path d="M20 9c3-4 7-4 9-2-2 3-6 4-9 2z" fill={c2} />
        </G>
      );
    case 'frutilla':
      return (
        <G>
          <Path d="M20 36c-7 0-12-6-12-12 0-7 5-12 12-12s12 5 12 12c0 6-5 12-12 12z" fill={c1} {...t} />
          <Path d="M20 13c-3-4-8-5-10-4 1 4 5 6 10 4zM20 13c3-4 8-5 10-4-1 4-5 6-10 4z" fill={c2} />
          <G fill="#FFD93D"><Circle cx={15} cy={22} r={1.2} /><Circle cx={25} cy={22} r={1.2} /><Circle cx={20} cy={27} r={1.2} /><Circle cx={16} cy={31} r={1.2} /><Circle cx={24} cy={31} r={1.2} /></G>
        </G>
      );
    case 'zanahoria':
      return (
        <G>
          <Path d="M14 14l16 6-10 16z" fill={c1} {...t} strokeLinejoin="round" />
          <Path d="M13 13l-5-7M14 12l1-8M15 13l6-5" stroke={c2} strokeWidth={2.4} strokeLinecap="round" />
        </G>
      );
    case 'galleta':
      return (
        <G>
          <Circle cx={20} cy={21} r={13} fill={c1} {...t} />
          <G fill={c2}><Circle cx={14} cy={17} r={2} /><Circle cx={24} cy={15} r={2} /><Circle cx={26} cy={25} r={2} /><Circle cx={16} cy={27} r={2} /><Circle cx={20} cy={21} r={1.6} /></G>
        </G>
      );
    case 'leche':
      return (
        <G>
          <Path d="M13 12l3-6h8l3 6v20a3 3 0 0 1-3 3H16a3 3 0 0 1-3-3z" fill={c1} {...t} strokeLinejoin="round" />
          <Rect x={13} y={18} width={14} height={8} fill={c2} opacity={0.7} />
        </G>
      );
    case 'helado':
      return (
        <G>
          <Path d="M12 20h16l-8 16z" fill={c2} {...t} strokeLinejoin="round" />
          <Circle cx={20} cy={14} r={9} fill={c1} {...t} />
          <Circle cx={17} cy={11} r={2} fill="#FFFFFF" opacity={0.7} />
        </G>
      );
    case 'huevo':
      return <Ellipse cx={20} cy={21} rx={10} ry={13} fill={c1} {...t} />;
    case 'harina':
      return (
        <G>
          <Path d="M11 14h18l2 20H9z" fill={c1} {...t} strokeLinejoin="round" />
          <Path d="M13 8h14v6H13z" fill={c2} {...t} />
          <Path d="M14 24h12" stroke={c2} strokeWidth={2} strokeLinecap="round" />
        </G>
      );
    case 'miel':
      return (
        <G>
          <Path d="M12 16c0-4 3-6 8-6s8 2 8 6v14a4 4 0 0 1-4 4h-8a4 4 0 0 1-4-4z" fill={c1} {...t} />
          <Rect x={15} y={6} width={10} height={5} rx={1.5} fill={c2} {...t} />
          <Path d="M16 24h8" stroke={c2} strokeWidth={2} strokeLinecap="round" />
        </G>
      );
    case 'chocolate':
      return (
        <G>
          <Rect x={9} y={11} width={22} height={18} rx={2.5} fill={c1} {...t} />
          <Path d="M20 11v18M9 20h22" stroke={c2} strokeWidth={1.4} />
        </G>
      );
    case 'limon':
      return (
        <G>
          <Ellipse cx={20} cy={21} rx={12} ry={9} fill={c1} {...t} />
          <Path d="M8 21c-2-1-2-3 0-4M32 21c2-1 2-3 0-4" stroke={TRAZO} strokeWidth={1.4} />
          <Path d="M20 10c2-3 5-3 7-1" stroke={c2} strokeWidth={2} strokeLinecap="round" />
        </G>
      );
    case 'pastel':
      return (
        <G>
          <Path d="M8 22c0-5 5-8 12-8s12 3 12 8v8a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2z" fill={c1} {...t} />
          <Path d="M8 22c3 3 6 3 8 0 2 3 5 3 8 0 2 3 5 3 8 0" fill="none" stroke="#FFFFFF" strokeWidth={2} />
          <Circle cx={20} cy={11} r={3} fill={c2} {...t} />
        </G>
      );
    case 'batido':
      return (
        <G>
          <Path d="M13 12h14l-2 20a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2z" fill={c1} {...t} />
          <Path d="M13 12h14" stroke={c2} strokeWidth={3} />
          <Path d="M22 12l4-7" stroke={TRAZO} strokeWidth={1.6} strokeLinecap="round" />
        </G>
      );
    case 'brownie':
      return (
        <G>
          <Path d="M8 16l12-4 12 4v12l-12 4-12-4z" fill={c1} {...t} strokeLinejoin="round" />
          <Path d="M8 16l12 4 12-4M20 20v12" stroke={TRAZO} strokeWidth={1.2} />
          <Circle cx={15} cy={23} r={1.2} fill={c2} /><Circle cx={25} cy={25} r={1.2} fill={c2} />
        </G>
      );
    case 'cebo':
      return (
        <G>
          <Path d="M10 22c4-6 10-6 14 0s-4 10-8 8-8-2-6-8z" fill={c1} {...t} />
          <Circle cx={26} cy={20} r={4} fill={c2} {...t} />
        </G>
      );
    // -------- peces y mar --------
    case 'pez':
      return (
        <G>
          <Path d="M30 20l6-5v10z" fill={c2} {...t} strokeLinejoin="round" />
          <Ellipse cx={19} cy={20} rx={13} ry={8} fill={c1} {...t} />
          <Path d="M18 12c2 3 2 13 0 16" stroke={c2} strokeWidth={2} />
          <Circle cx={10} cy={19} r={1.5} fill={TRAZO} />
        </G>
      );
    case 'pez_globo':
      return (
        <G>
          <Circle cx={19} cy={21} r={12} fill={c1} {...t} />
          <Path d="M31 21l6-4v8z" fill={c2} {...t} strokeLinejoin="round" />
          <G stroke={c2} strokeWidth={1.4} strokeLinecap="round"><Path d="M10 12l-2-3M19 8V5M28 12l2-3M8 24l-3 1M9 30l-2 2" /></G>
          <Circle cx={14} cy={19} r={1.5} fill={TRAZO} />
        </G>
      );
    case 'estrella':
      return <Path d="M20 4l4.5 11 12 1-9 8 3 12-10.5-6.5L9.5 36l3-12-9-8 12-1z" fill={c1} {...t} strokeLinejoin="round" />;
    case 'tiburon':
      return (
        <G>
          <Path d="M4 22c6-8 18-10 30-4l-4 6c-10 4-20 4-26-2z" fill={c1} {...t} strokeLinejoin="round" />
          <Path d="M16 16l4-9 4 10z" fill={c1} {...t} strokeLinejoin="round" />
          <Path d="M34 18l4-6v10z" fill={c1} {...t} strokeLinejoin="round" />
          <Path d="M14 24h6" stroke={c2} strokeWidth={1.5} />
          <Circle cx={10} cy={21} r={1.4} fill={TRAZO} />
        </G>
      );
    case 'medusa':
      return (
        <G>
          <Path d="M8 20c0-8 5-13 12-13s12 5 12 13z" fill={c1} {...t} />
          <G stroke={c2} strokeWidth={2} strokeLinecap="round" fill="none"><Path d="M12 21c-1 4 1 8-1 12M20 21c1 4-1 8 1 12M28 21c-1 4 1 8-1 12" /></G>
        </G>
      );
    case 'bota':
      return (
        <G>
          <Path d="M13 6h10v14l8 6v6H13z" fill={c1} {...t} strokeLinejoin="round" />
          <Rect x={13} y={26} width={18} height={6} fill={c2} />
        </G>
      );
    // -------- insectos --------
    case 'mariposa':
      return (
        <G>
          <Path d="M20 20C14 8 4 8 6 18c1 5 8 6 14 2zM20 20c6-12 16-12 14-2-1 5-8 6-14 2zM20 20c-6 12-14 12-13 4 1-5 7-6 13-4zM20 20c6 12 14 12 13 4-1-5-7-6-13-4z" fill={c1} {...t} strokeLinejoin="round" />
          <Path d="M20 12v16" stroke={c2} strokeWidth={3} strokeLinecap="round" />
        </G>
      );
    case 'mariquita':
      return (
        <G>
          <Circle cx={20} cy={22} r={11} fill={c1} {...t} />
          <Circle cx={20} cy={13} r={5} fill={c2} />
          <Path d="M20 18v15" stroke={c2} strokeWidth={1.4} />
          <G fill={c2}><Circle cx={15} cy={22} r={2} /><Circle cx={25} cy={24} r={2} /><Circle cx={18} cy={29} r={1.6} /></G>
        </G>
      );
    case 'abeja':
      return (
        <G>
          <Ellipse cx={20} cy={23} rx={11} ry={8} fill={c1} {...t} />
          <Path d="M15 16v14M21 15v16M27 18v10" stroke={c2} strokeWidth={2.4} />
          <Ellipse cx={14} cy={12} rx={6} ry={4} fill="#FFFFFF" opacity={0.8} {...t} />
          <Ellipse cx={26} cy={12} rx={6} ry={4} fill="#FFFFFF" opacity={0.8} {...t} />
        </G>
      );
    case 'luciernaga':
      return (
        <G>
          <Circle cx={20} cy={26} r={8} fill={c1} opacity={0.5} />
          <Ellipse cx={20} cy={20} rx={5} ry={9} fill={c2} {...t} />
          <Circle cx={20} cy={26} r={4} fill={c1} />
          <Path d="M16 12l-3-4M24 12l3-4" stroke={TRAZO} strokeWidth={1.2} strokeLinecap="round" />
        </G>
      );
    case 'caracol':
      return (
        <G>
          <Path d="M8 30c4 0 12-4 18-2 3-2 6-8 8-14" fill="none" stroke={c2} strokeWidth={5} strokeLinecap="round" />
          <Circle cx={22} cy={22} r={9} fill={c1} {...t} />
          <Path d="M22 22a4 4 0 1 1 4-4" fill="none" stroke={c2} strokeWidth={1.6} />
        </G>
      );
    // -------- fósiles y arte --------
    case 'fosil_concha':
      return (
        <G>
          <Rect x={6} y={8} width={28} height={24} rx={4} fill={c1} {...t} />
          <Path d="M20 26c-6 0-8-5-6-9s8-5 10-1 0 10-4 10" fill="none" stroke={c2} strokeWidth={1.6} strokeLinecap="round" />
        </G>
      );
    case 'fosil_hueso':
      return (
        <G>
          <Rect x={6} y={8} width={28} height={24} rx={4} fill={c1} {...t} />
          <Path d="M12 14l16 12M13 26l14-12" stroke={c2} strokeWidth={3} strokeLinecap="round" />
        </G>
      );
    case 'fosil_amonite':
      return (
        <G>
          <Circle cx={20} cy={20} r={13} fill={c1} {...t} />
          <Path d="M20 20a2 2 0 0 1 4 0 4 4 0 0 1-8 0 6 6 0 0 1 12 0 8 8 0 0 1-16 0" fill="none" stroke={c2} strokeWidth={1.6} />
        </G>
      );
    case 'arte':
      return (
        <G>
          <Rect x={6} y={8} width={28} height={24} rx={2} fill={c1} stroke="#C99A6B" strokeWidth={3} />
          <Circle cx={20} cy={19} r={5} fill={c2} />
          <Path d="M9 29l8-8 6 6 4-3 4 5" stroke={c2} strokeWidth={1.6} fill="none" opacity={0.8} />
        </G>
      );
    case 'trofeo':
      return (
        <G>
          <Path d="M12 6h16v10a8 8 0 0 1-16 0z" fill={c1} {...t} />
          <Path d="M12 9H7v4a5 5 0 0 0 5 4M28 9h5v4a5 5 0 0 1-5 4" fill="none" stroke={TRAZO} strokeWidth={1.4} />
          <Path d="M17 24h6v5h-6zM13 30h14v4H13z" fill={c2} {...t} />
        </G>
      );
    // -------- casa --------
    case 'pared':
      return (
        <G>
          <Rect x={6} y={6} width={28} height={28} rx={4} fill={c1} {...t} />
          <G fill={c2}><Circle cx={13} cy={13} r={2} /><Circle cx={27} cy={13} r={2} /><Circle cx={20} cy={20} r={2} /><Circle cx={13} cy={27} r={2} /><Circle cx={27} cy={27} r={2} /></G>
        </G>
      );
    case 'suelo':
      return (
        <G>
          <Rect x={6} y={6} width={28} height={28} rx={4} fill={c1} {...t} />
          <Path d="M6 15h28M6 25h28M20 6v9M13 15v10M27 25v9" stroke={c2} strokeWidth={1.4} />
        </G>
      );
    case 'cama':
      return (
        <G>
          <Rect x={5} y={18} width={30} height={12} rx={6} fill={c1} {...t} />
          <Rect x={9} y={21} width={22} height={6} rx={3} fill={c2} />
          <Rect x={7} y={12} width={10} height={7} rx={3} fill="#FFFFFF" {...t} />
        </G>
      );
    case 'estante':
      return (
        <G>
          <Rect x={7} y={8} width={26} height={24} rx={2} fill={c1} {...t} />
          <Path d="M7 20h26" stroke={TRAZO} strokeWidth={1.4} />
          <Rect x={11} y={12} width={5} height={7} fill={c2} /><Rect x={18} y={11} width={4} height={8} fill="#9FD9C9" /><Rect x={12} y={23} width={8} height={7} fill="#FFD93D" />
        </G>
      );
    case 'planta':
      return (
        <G>
          <Path d="M12 26h16l-2 8H14z" fill={c2} {...t} strokeLinejoin="round" />
          <Path d="M20 26V14" stroke={c1} strokeWidth={2} />
          <Path d="M20 20c-6-2-8-8-6-12 5 1 7 6 6 12zM20 18c6-2 8-8 6-12-5 1-7 6-6 12z" fill={c1} {...t} />
        </G>
      );
    case 'lampara':
      return (
        <G>
          <Path d="M12 18l4-12h8l4 12z" fill={c1} {...t} strokeLinejoin="round" />
          <Path d="M20 18v12" stroke={c2} strokeWidth={2.5} />
          <Rect x={13} y={30} width={14} height={4} rx={2} fill={c2} {...t} />
        </G>
      );
    case 'cuadro':
      return (
        <G>
          <Rect x={8} y={8} width={24} height={24} rx={2} fill={c1} stroke={c2} strokeWidth={3} />
          <Path d="M11 27l6-8 5 5 3-3 4 6z" fill="#3E8A62" />
          <Circle cx={25} cy={15} r={3} fill="#FFD93D" />
        </G>
      );
    case 'alfombrita':
      return (
        <G>
          <Ellipse cx={20} cy={22} rx={15} ry={8} fill={c1} {...t} />
          <Ellipse cx={20} cy={22} rx={9} ry={4.5} fill="none" stroke={c2} strokeWidth={1.6} />
        </G>
      );
    case 'pecera':
      return (
        <G>
          <Path d="M8 12h24v16a8 8 0 0 1-8 8h-8a8 8 0 0 1-8-8z" fill={c1} opacity={0.75} {...t} />
          <Ellipse cx={19} cy={24} rx={5} ry={3} fill={c2} /><Path d="M24 24l4-3v6z" fill={c2} />
          <Circle cx={12} cy={17} r={1.5} fill="#FFFFFF" /><Circle cx={26} cy={15} r={1} fill="#FFFFFF" />
        </G>
      );
    case 'arbolito':
      return (
        <G>
          <Path d="M20 5l9 11h-5l7 8h-6l7 8H8l7-8H9l7-8h-5z" fill={c1} {...t} strokeLinejoin="round" />
          <Rect x={17} y={32} width={6} height={4} fill="#8C6239" />
          <G fill={c2}><Circle cx={17} cy={16} r={1.6} /><Circle cx={24} cy={23} r={1.6} /><Circle cx={14} cy={28} r={1.6} /></G>
          <Path d="M20 2l1.5 3 3 .5-2 2 .5 3-3-1.5-3 1.5.5-3-2-2 3-.5z" fill="#FFD93D" />
        </G>
      );
    case 'calabaza':
      return (
        <G>
          <Ellipse cx={20} cy={23} rx={14} ry={11} fill={c1} {...t} />
          <Path d="M14 13c-1 6-1 14 0 20M26 13c1 6 1 14 0 20" stroke={TRAZO} strokeWidth={1} opacity={0.5} />
          <Path d="M20 12c0-4 2-6 5-6" stroke={c2} strokeWidth={2.5} strokeLinecap="round" fill="none" />
          <Path d="M13 20l4 3-4 0zM27 20l-4 3 4 0zM14 27c3 3 9 3 12 0" fill={TRAZO} stroke={TRAZO} strokeWidth={1} />
        </G>
      );
    case 'guirnalda':
      return (
        <G>
          <Path d="M4 12c6 8 26 8 32 0" fill="none" stroke={TRAZO} strokeWidth={1.4} />
          <Path d="M9 16l3 8 3-8zM17 18l3 8 3-8zM25 16l3 8 3-8z" fill={c1} {...t} strokeLinejoin="round" />
          <Path d="M10 17h4M18 19h4M26 17h4" stroke={c2} strokeWidth={1.6} />
        </G>
      );
    case 'huevo_pascua':
      return (
        <G>
          <Ellipse cx={20} cy={21} rx={10} ry={13} fill={c1} {...t} />
          <Path d="M11 18c3 2 6 2 9 0s6-2 9 0M11 25c3 2 6 2 9 0s6-2 9 0" fill="none" stroke={c2} strokeWidth={2} />
        </G>
      );
    case 'corazones_pared':
      return (
        <G>
          <Path d="M4 8c6 6 26 6 32 0" fill="none" stroke={TRAZO} strokeWidth={1.4} />
          {[10, 20, 30].map((x, i) => (
            <Path key={x} d={`M${x} ${26 + (i % 2) * 2}s-6-4-6-8a3 3 0 0 1 6-1 3 3 0 0 1 6 1c0 4-6 8-6 8z`} fill={i === 1 ? c2 : c1} {...t} />
          ))}
        </G>
      );
    default:
      return <Circle cx={20} cy={20} r={12} fill={c1} {...t} />;
  }
}

// --------------------------------------------------------------------------
// Íconos de interfaz (trazo, un color), estilo Iconos.tsx.
// --------------------------------------------------------------------------
export type ClaveUI =
  | 'pata' | 'alimentar' | 'banar' | 'acariciar' | 'vestir' | 'tienda' | 'decorar' | 'personalizar'
  | 'cocina' | 'estadio' | 'pesca' | 'museo' | 'arbol' | 'visita' | 'buho' | 'menu' | 'cerrar' | 'vender' | 'regalo' | 'luna' | 'sol';

export function IconoUI({ clave, color, size = 22 }: { clave: ClaveUI; color: string; size?: number }) {
  const s = { stroke: color, strokeWidth: 1.9, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {ui(clave, s, color)}
    </Svg>
  );
}

function ui(clave: ClaveUI, s: object, color: string) {
  switch (clave) {
    case 'pata':
      return (
        <G {...s}>
          <Ellipse cx={12} cy={15.5} rx={4.6} ry={3.8} />
          <Ellipse cx={6.2} cy={10.5} rx={1.8} ry={2.3} /><Ellipse cx={17.8} cy={10.5} rx={1.8} ry={2.3} />
          <Ellipse cx={9.4} cy={6.6} rx={1.8} ry={2.3} /><Ellipse cx={14.6} cy={6.6} rx={1.8} ry={2.3} />
        </G>
      );
    case 'alimentar':
      return <G {...s}><Ellipse cx={12} cy={14} rx={8.5} ry={3.5} /><Path d="M3.5 14c0 3 4 5.5 8.5 5.5s8.5-2.5 8.5-5.5M9 10c1-2 5-2 6 0" /></G>;
    case 'banar':
      return <G {...s}><Circle cx={10} cy={13} r={5.5} /><Circle cx={17} cy={7.5} r={2.5} /><Circle cx={17.5} cy={16} r={1.6} /><Path d="M7.5 11.5c.5-1 1.5-1.8 2.5-2" /></G>;
    case 'acariciar':
      return <G {...s}><Path d="M12 20S4.5 15 4.5 9.8A3.8 3.8 0 0 1 12 8a3.8 3.8 0 0 1 7.5 1.8C19.5 15 12 20 12 20z" /><Path d="M9 12l2 2 4-4" /></G>;
    case 'vestir':
      return <G {...s}><Path d="M12 4a1.8 1.8 0 1 0-1.8-1.8M12 4v3l-8.5 7v2h17v-2L12 7" /></G>;
    case 'tienda':
      return <G {...s}><Path d="M4 9h16l-1 11H5zM8 9V7a4 4 0 0 1 8 0v2" /></G>;
    case 'decorar':
      return <G {...s}><Path d="M4 20l3-1 10-10-2-2L5 17zM14 6l2-2 4 4-2 2" /></G>;
    case 'personalizar':
      return <G {...s}><Path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4zM5 17l.8 2 2 .8-2 .8L5 22l-.8-1.4-2-.8 2-.8zM19 15l.6 1.4 1.4.6-1.4.6L19 19l-.6-1.4-1.4-.6 1.4-.6z" /></G>;
    case 'cocina':
      return <G {...s}><Path d="M4 10h16v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4zM2 10h20M9 7c0-2 2-2 2-4M14 7c0-2 2-2 2-4" /></G>;
    case 'estadio':
      return <G {...s}><Path d="M5 21V4M5 4h12l-2 4 2 4H5" /></G>;
    case 'pesca':
      return <G {...s}><Path d="M4 4c8 0 14 5 14 12M18 16a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0zM13 16l-1 4" /></G>;
    case 'museo':
      return <G {...s}><Path d="M3 9l9-5 9 5H3zM5 9v9M10 9v9M14 9v9M19 9v9M3 18h18v2H3z" /></G>;
    case 'arbol':
      return <G {...s}><Path d="M12 21v-6M12 15c-5 0-8-3-8-7 0-3 3-5 5-4 0-2 2-3 3-3s3 1 3 3c2-1 5 1 5 4 0 4-3 7-8 7z" /></G>;
    case 'visita':
      return <G {...s}><Path d="M4 11l8-7 8 7v9H4z" /><Path d="M12 17s-3-2-3-4a1.5 1.5 0 0 1 3-.7 1.5 1.5 0 0 1 3 .7c0 2-3 4-3 4z" /></G>;
    case 'buho':
      return <G {...s}><Ellipse cx={12} cy={13} rx={7} ry={8} /><Circle cx={9.5} cy={11} r={1.8} /><Circle cx={14.5} cy={11} r={1.8} /><Path d="M12 14l-1.2 1.6h2.4zM6 6l2 3M18 6l-2 3" /></G>;
    case 'menu':
      return <G {...s}><Path d="M5 7h14M5 12h14M5 17h14" /></G>;
    case 'cerrar':
      return <G {...s}><Path d="M6 6l12 12M18 6L6 18" /></G>;
    case 'vender':
      return <G {...s}><Circle cx={12} cy={12} r={8} /><Path d="M12 7v10M14.5 9.5c0-1-1-1.5-2.5-1.5S9.5 9 9.5 10s1 1.5 2.5 2 2.5 1 2.5 2-1 1.5-2.5 1.5-2.5-.5-2.5-1.5" /></G>;
    case 'regalo':
      return <G {...s}><Rect x={4} y={10} width={16} height={10} rx={2} /><Path d="M3 10h18M12 10v10M12 10S10 5 8 5a2.5 2.5 0 0 0 0 5zM12 10s2-5 4-5a2.5 2.5 0 0 1 0 5z" /></G>;
    case 'luna':
      return <G {...s}><Path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5z" /></G>;
    case 'sol':
      return <G {...s}><Circle cx={12} cy={12} r={4} /><Path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4" /></G>;
  }
  return <Circle cx={12} cy={12} r={6} stroke={color} />;
}

export { Line };
