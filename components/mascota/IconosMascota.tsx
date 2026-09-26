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

    // -------- comida nueva --------
    case 'pan':
      return <G><Path d="M6 22c0-7 6-11 14-11s14 4 14 11v6a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3z" fill={c1} {...t} /><Path d="M12 18c3-3 5-3 8 0s5 3 8 0" fill="none" stroke={c2} strokeWidth={2} strokeLinecap="round" /></G>;
    case 'queso':
      return <G><Path d="M5 28L20 10l15 6v12H5z" fill={c1} {...t} strokeLinejoin="round" /><G fill={c2}><Circle cx={14} cy={22} r={2.2} /><Circle cx={24} cy={19} r={1.8} /><Circle cx={27} cy={25} r={2} /></G></G>;
    case 'sandia':
      return <G><Path d="M4 16h32a16 16 0 0 1-32 0z" fill={c2} {...t} /><Path d="M8 17h24a12 12 0 0 1-24 0z" fill={c1} /><G fill={TRAZO}><Ellipse cx={14} cy={22} rx={1.2} ry={2} /><Ellipse cx={20} cy={25} rx={1.2} ry={2} /><Ellipse cx={26} cy={22} rx={1.2} ry={2} /></G></G>;
    case 'uvas':
      return <G><Path d="M20 8V4M20 8c3-3 7-2 8 0" stroke={c2} strokeWidth={2} strokeLinecap="round" fill="none" /><G fill={c1} {...t}><Circle cx={13} cy={15} r={4.5} /><Circle cx={22} cy={14} r={4.5} /><Circle cx={30} cy={17} r={4.5} /><Circle cx={17} cy={23} r={4.5} /><Circle cx={26} cy={24} r={4.5} /><Circle cx={21} cy={31} r={4.5} /></G></G>;
    case 'donut':
      return <G><Circle cx={20} cy={21} r={13} fill={c2} {...t} /><Path d="M8 19c3-4 8-6 12-6s9 2 12 6c-1 3-3 4-5 3-2 2-4 2-7 2s-5 0-7-2c-2 1-4 0-5-3z" fill={c1} /><Circle cx={20} cy={21} r={4.5} fill="#FFF3F7" {...t} /><G stroke="#FFFFFF" strokeWidth={1.6} strokeLinecap="round"><Path d="M13 16l2-1M24 14l2 1M18 18l1-2" /></G></G>;
    case 'croissant':
      return <G><Path d="M6 26c2-8 8-14 14-14s12 6 14 14c-3 2-6 2-8 0-2 3-10 3-12 0-2 2-5 2-8 0z" fill={c1} {...t} strokeLinejoin="round" /><Path d="M14 14v12M26 14v12M20 12v14" stroke={c2} strokeWidth={1.4} /></G>;
    case 'sandwich':
      return <G><Path d="M6 14h28l-2 5H8z" fill={c1} {...t} /><Path d="M6 19h28l1 3H5z" fill={c2} /><Path d="M6 22h28v3H6z" fill="#FFD93D" /><Path d="M6 25h28l-3 6H9z" fill={c1} {...t} /></G>;
    case 'palta':
      return <G><Path d="M20 5c-8 0-13 8-13 15s5 15 13 15 13-8 13-15S28 5 20 5z" fill={c1} {...t} /><Path d="M20 10c-5 0-8 6-8 10s3 10 8 10 8-6 8-10-3-10-8-10z" fill="#DDEFA6" /><Circle cx={20} cy={22} r={5} fill={c2} /></G>;
    case 'cereal':
      return <G><Path d="M6 18h28l-3 12a4 4 0 0 1-4 4H13a4 4 0 0 1-4-4z" fill={c1} {...t} /><Ellipse cx={20} cy={18} rx={14} ry={4} fill="#FFFFFF" {...t} /><G fill={c2}><Circle cx={13} cy={17} r={2} /><Circle cx={20} cy={16} r={2} /><Circle cx={27} cy={17} r={2} /></G></G>;
    case 'pastelito':
      return <G><Path d="M10 22h20l-2 12H12z" fill={c2} {...t} /><Path d="M12 26h16M13 30h14" stroke={TRAZO} strokeWidth={1} opacity={0.4} /><Path d="M8 22c0-8 6-12 12-12s12 4 12 12c-2 2-5 2-6 0-2 2-4 2-6 0-2 2-4 2-6 0-1 2-4 2-6 0z" fill={c1} {...t} /><Circle cx={20} cy={9} r={2.5} fill="#E63950" /></G>;
    case 'hotdog':
      return <G><Path d="M4 22c0-6 5-9 16-9s16 3 16 9-5 9-16 9S4 28 4 22z" fill={c1} {...t} /><Path d="M6 20c3-4 25-4 28 0" stroke={c2} strokeWidth={5} strokeLinecap="round" fill="none" /><Path d="M9 19c4 2 8-2 12 0s8-2 11 0" stroke="#FFD93D" strokeWidth={1.8} fill="none" strokeLinecap="round" /></G>;
    // -------- ingredientes nuevos --------
    case 'tomate':
      return <G><Circle cx={20} cy={22} r={12} fill={c1} {...t} /><Path d="M20 11c-3-4-7-3-8-1 3 0 5 2 8 1zM20 11c3-4 7-3 8-1-3 0-5 2-8 1z" fill={c2} /><Path d="M20 10V6" stroke={c2} strokeWidth={2} strokeLinecap="round" /></G>;
    case 'zapallo':
      return <G><Ellipse cx={20} cy={23} rx={14} ry={11} fill={c1} {...t} /><Path d="M14 13c-1 6-1 14 0 20M26 13c1 6 1 14 0 20" stroke={TRAZO} strokeWidth={1} opacity={0.4} /><Path d="M20 12c0-4 2-6 5-6" stroke={c2} strokeWidth={2.5} strokeLinecap="round" fill="none" /></G>;
    case 'mantequilla':
      return <G><Path d="M6 16l8-6h20l-8 6z" fill={c2} {...t} strokeLinejoin="round" /><Rect x={6} y={16} width={20} height={14} rx={2} fill={c1} {...t} /><Path d="M26 16l8-6v14l-8 6z" fill={c2} {...t} strokeLinejoin="round" /></G>;
    case 'arroz':
      return <G><Path d="M8 22h24l-3 10a3 3 0 0 1-3 3H14a3 3 0 0 1-3-3z" fill="#C97C60" {...t} /><Path d="M6 22c4-8 24-8 28 0z" fill={c1} {...t} /><G fill={c2}><Ellipse cx={14} cy={18} rx={2} ry={1} /><Ellipse cx={22} cy={16} rx={2} ry={1} /><Ellipse cx={27} cy={19} rx={2} ry={1} /></G></G>;
    case 'platano':
      return <G><Path d="M8 12c2 14 10 22 24 22 2 0 3-2 2-4-12-2-18-8-20-20-1-2-6-1-6 2z" fill={c1} {...t} strokeLinejoin="round" /><Path d="M30 32l4 1" stroke={c2} strokeWidth={2.5} strokeLinecap="round" /></G>;
    case 'canela':
      return <G><Rect x={8} y={10} width={9} height={22} rx={4} fill={c1} {...t} transform="rotate(-15 12 21)" /><Rect x={20} y={8} width={9} height={22} rx={4} fill={c1} {...t} transform="rotate(15 24 19)" /><Path d="M12 14v14M24 12v14" stroke={c2} strokeWidth={1.6} strokeLinecap="round" /></G>;
    case 'naranja':
      return <G><Circle cx={20} cy={22} r={13} fill={c1} {...t} /><Path d="M20 9c1-3 4-4 6-3-1 2-3 3-6 3z" fill={c2} /><G fill="#FFFFFF" opacity={0.35}><Circle cx={15} cy={18} r={1.5} /><Circle cx={24} cy={16} r={1.2} /></G></G>;
    case 'nueces':
      return <G><Ellipse cx={13} cy={22} rx={8} ry={9} fill={c1} {...t} /><Ellipse cx={27} cy={20} rx={8} ry={9} fill={c1} {...t} /><Path d="M13 14v16M27 12v16" stroke={c2} strokeWidth={1.6} /><Path d="M9 22c2-2 6-2 8 0M23 20c2-2 6-2 8 0" stroke={c2} strokeWidth={1.4} fill="none" /></G>;
    case 'avena':
      return <G><Path d="M12 8h16v24a4 4 0 0 1-4 4h-8a4 4 0 0 1-4-4z" fill={c1} {...t} /><Rect x={12} y={14} width={16} height={9} fill={c2} opacity={0.8} /><Circle cx={20} cy={18.5} r={2.5} fill="#FFFFFF" /></G>;
    case 'cebolla':
      return <G><Path d="M20 9c-8 4-13 9-13 15 0 7 6 11 13 11s13-4 13-11c0-6-5-11-13-15z" fill={c1} {...t} /><Path d="M20 9v26M14 14c-2 8-2 14 0 20M26 14c2 8 2 14 0 20" stroke={c2} strokeWidth={1.4} opacity={0.7} /><Path d="M18 9c1-3 3-4 5-5-1 2-2 4-3 5z" fill="#7BC47F" /></G>;
    case 'masa':
      return <G><Ellipse cx={20} cy={26} rx={15} ry={8} fill={c2} opacity={0.5} /><Ellipse cx={20} cy={21} rx={13} ry={10} fill={c1} {...t} /><Path d="M12 18c3-3 6-3 8 0s5 3 8 0" fill="none" stroke={c2} strokeWidth={1.6} strokeLinecap="round" /></G>;
    // -------- platos nuevos --------
    case 'panqueque':
      return <G><Ellipse cx={20} cy={30} rx={15} ry={5} fill={c1} {...t} /><Ellipse cx={20} cy={25} rx={15} ry={5} fill={c1} {...t} /><Ellipse cx={20} cy={20} rx={15} ry={5} fill={c1} {...t} /><Path d="M10 18c4 4 16 4 20 0v3c-4 3-16 3-20 0z" fill={c2} /><Rect x={17} y={12} width={6} height={5} rx={1.5} fill="#FFF3C4" {...t} strokeWidth={1} /></G>;
    case 'tortilla':
      return <G><Ellipse cx={20} cy={22} rx={15} ry={10} fill={c1} {...t} /><Path d="M8 22c4-4 20-4 24 0" fill="none" stroke={c2} strokeWidth={2} strokeLinecap="round" /><Path d="M20 12l2 6-4 4 6 6" fill="none" stroke={c2} strokeWidth={1.6} /></G>;
    case 'sopa':
      return <G><Path d="M6 20h28l-2 8a6 6 0 0 1-6 6H14a6 6 0 0 1-6-6z" fill={c2} {...t} /><Ellipse cx={20} cy={20} rx={14} ry={4} fill={c1} {...t} /><Path d="M14 12c0-3 2-3 2-6M20 12c0-3 2-3 2-6M26 12c0-3 2-3 2-6" stroke={TRAZO} strokeWidth={1.2} strokeLinecap="round" opacity={0.5} /></G>;
    case 'ensalada':
      return <G><Path d="M6 22h28l-3 9a4 4 0 0 1-4 4H13a4 4 0 0 1-4-4z" fill="#FFFFFF" {...t} /><G {...t} strokeWidth={1}><Circle cx={13} cy={19} r={4} fill={c1} /><Circle cx={21} cy={16} r={4.5} fill={c2} /><Circle cx={28} cy={19} r={4} fill="#7BC47F" /><Circle cx={19} cy={21} r={3} fill="#FFA557" /></G></G>;
    case 'sushi':
      return <G><Circle cx={20} cy={21} r={13} fill={TRAZO} /><Circle cx={20} cy={21} r={10} fill={c1} /><Circle cx={20} cy={21} r={5} fill={c2} /><Circle cx={18} cy={19} r={1.5} fill="#5A3B2A" /></G>;
    case 'taza':
      return <G><Path d="M8 14h20v12a6 6 0 0 1-6 6H14a6 6 0 0 1-6-6z" fill={c1} {...t} /><Path d="M28 17h3a4 4 0 0 1 0 8h-3" fill="none" {...t} /><Ellipse cx={18} cy={15} rx={9} ry={2.5} fill={c2} /><Path d="M13 10c0-3 2-3 2-6M20 10c0-3 2-3 2-6" stroke={TRAZO} strokeWidth={1.2} strokeLinecap="round" opacity={0.5} /></G>;
    case 'empanada':
      return <G><Path d="M5 26c0-9 7-15 15-15s15 6 15 15z" fill={c1} {...t} /><Path d="M5 26h30" stroke={c2} strokeWidth={3} strokeLinecap="round" /><G fill={c2}><Circle cx={9} cy={26} r={2} /><Circle cx={15} cy={26} r={2} /><Circle cx={21} cy={26} r={2} /><Circle cx={27} cy={26} r={2} /></G></G>;
    case 'pizza':
      return <G><Circle cx={20} cy={21} r={14} fill={c1} {...t} /><Circle cx={20} cy={21} r={10.5} fill="#FFD93D" /><G fill={c2}><Circle cx={15} cy={18} r={2.5} /><Circle cx={24} cy={17} r={2.5} /><Circle cx={22} cy={25} r={2.5} /><Circle cx={15} cy={25} r={2} /></G><Path d="M6 21h28M20 7v28" stroke={TRAZO} strokeWidth={1} opacity={0.35} /></G>;
    case 'sopaipilla':
      return <G><Circle cx={16} cy={24} r={10} fill={c1} {...t} /><Circle cx={26} cy={18} r={10} fill={c1} {...t} /><G fill={c2}><Circle cx={13} cy={22} r={1.2} /><Circle cx={18} cy={27} r={1.2} /><Circle cx={24} cy={16} r={1.2} /><Circle cx={29} cy={21} r={1.2} /></G></G>;
    // -------- pesca --------
    case 'cana':
      return <G><Path d="M6 34C10 22 18 12 34 6" stroke={c1} strokeWidth={3} strokeLinecap="round" fill="none" /><Path d="M34 6c0 8-2 14-6 20" stroke={TRAZO} strokeWidth={1} fill="none" /><Circle cx={28} cy={27} r={3} fill={c2} {...t} /><Rect x={5} y={28} width={7} height={8} rx={2} fill={c2} {...t} transform="rotate(-50 8 32)" /></G>;
    case 'corcho':
      return <G><Path d="M12 22a8 10 0 0 1 16 0z" fill={c1} {...t} /><Path d="M12 22a8 10 0 0 0 16 0z" fill={c2} {...t} /><Path d="M20 8v4M20 32v4" stroke={TRAZO} strokeWidth={2} strokeLinecap="round" /></G>;
    case 'plomada':
      return <G><Path d="M20 8l8 12-8 14-8-14z" fill={c1} {...t} strokeLinejoin="round" /><Path d="M16 20h8" stroke={c2} strokeWidth={2} /><Circle cx={20} cy={6} r={2} fill="none" {...t} /></G>;
    case 'anzuelo':
      return <G><Path d="M22 6v16a6 6 0 0 1-12 0v-2" stroke={c1} strokeWidth={3} strokeLinecap="round" fill="none" /><Path d="M10 20l-3-4" stroke={c1} strokeWidth={3} strokeLinecap="round" /><Circle cx={22} cy={6} r={2.5} fill={c2} {...t} /></G>;
    case 'cofre':
      return <G><Rect x={6} y={16} width={28} height={16} rx={3} fill={c1} {...t} /><Path d="M6 20c0-6 6-10 14-10s14 4 14 10z" fill={c1} {...t} /><Rect x={6} y={19} width={28} height={3} fill={c2} /><Rect x={17} y={18} width={6} height={7} rx={1.5} fill={c2} {...t} strokeWidth={1} /></G>;
    case 'cangrejo':
      return <G><Path d="M8 14c-3-3-3-7 0-8 1 3 4 4 6 3M32 14c3-3 3-7 0-8-1 3-4 4-6 3" fill={c1} {...t} /><Ellipse cx={20} cy={22} rx={12} ry={8} fill={c1} {...t} /><Path d="M8 26l-3 4M12 29l-2 5M28 29l2 5M32 26l3 4" stroke={c1} strokeWidth={2.5} strokeLinecap="round" /><Circle cx={16} cy={19} r={1.8} fill={c2} /><Circle cx={24} cy={19} r={1.8} fill={c2} /></G>;
    case 'caballito':
      return <G><Path d="M22 6c6 0 8 4 8 8s-3 6-3 10 2 8-2 12c-3-2-3-6-3-10s3-6 0-8c-2 2-6 2-8 0 0-6 3-12 8-12z" fill={c1} {...t} strokeLinejoin="round" /><Circle cx={24} cy={11} r={1.6} fill={TRAZO} /><Path d="M28 10l4-1" stroke={c2} strokeWidth={2} strokeLinecap="round" /><Path d="M16 30c-3 2-2 6 1 6" stroke={c1} strokeWidth={3} fill="none" strokeLinecap="round" /></G>;
    case 'tortuga':
      return <G><Ellipse cx={20} cy={22} rx={13} ry={9} fill={c1} {...t} /><Path d="M12 24l-3 4M28 24l3 4M11 18l-4 0M29 18l4 0" stroke={c1} strokeWidth={3.5} strokeLinecap="round" /><Circle cx={32} cy={16} r={4} fill={c1} {...t} /><Circle cx={33} cy={15} r={1} fill={TRAZO} /><Path d="M14 20l6-4 6 4-6 4z" fill={c2} /><Path d="M14 20l-2 5M26 20l2 5" stroke={c2} strokeWidth={1.4} /></G>;
    case 'pulpo':
      return <G><Circle cx={20} cy={15} r={10} fill={c1} {...t} /><G stroke={c1} strokeWidth={4} strokeLinecap="round" fill="none"><Path d="M11 22c-3 4-4 8-1 12M16 24c-1 4-1 8 2 10M24 24c1 4 1 8-2 10M29 22c3 4 4 8 1 12" /></G><Circle cx={16} cy={14} r={2} fill={TRAZO} /><Circle cx={24} cy={14} r={2} fill={TRAZO} /><Ellipse cx={13} cy={18} rx={2} ry={1.2} fill={c2} /><Ellipse cx={27} cy={18} rx={2} ry={1.2} fill={c2} /></G>;
    case 'anguila':
      return <G><Path d="M6 26c4-8 10-8 14 0s10 8 14 0" stroke={c1} strokeWidth={6} strokeLinecap="round" fill="none" /><Path d="M6 26c4-8 10-8 14 0s10 8 14 0" stroke={TRAZO} strokeWidth={8.5} strokeLinecap="round" fill="none" opacity={0} /><Circle cx={33} cy={26} r={4.5} fill={c1} {...t} /><Circle cx={34.5} cy={25} r={1.2} fill={TRAZO} /><Path d="M10 22c4-2 8-2 12 0" stroke={c2} strokeWidth={1.4} fill="none" /></G>;
    case 'pez_luna':
      return <G><Circle cx={19} cy={21} r={12} fill={c1} {...t} /><Path d="M19 9l-2-6 6 2zM19 33l-2 6 6-2z" fill={c1} {...t} strokeLinejoin="round" /><Path d="M31 21l5-3v6z" fill={c2} {...t} strokeLinejoin="round" /><Circle cx={12} cy={19} r={1.6} fill={TRAZO} /><Path d="M15 24c2 2 5 2 7 0" stroke={c2} strokeWidth={1.4} fill="none" /></G>;
    case 'pez_espada':
      return <G><Path d="M2 20h12" stroke={c2} strokeWidth={2.5} strokeLinecap="round" /><Ellipse cx={22} cy={20} rx={11} ry={6} fill={c1} {...t} /><Path d="M33 20l5-5v10z" fill={c1} {...t} strokeLinejoin="round" /><Path d="M20 14l4-6 2 6" fill={c2} {...t} strokeLinejoin="round" /><Circle cx={15} cy={19} r={1.4} fill={TRAZO} /></G>;
    // -------- insectos nuevos --------
    case 'libelula':
      return <G><Path d="M20 12v24" stroke={c2} strokeWidth={3} strokeLinecap="round" /><Circle cx={20} cy={10} r={3.5} fill={c2} {...t} /><G fill={c1} opacity={0.85} {...t} strokeWidth={1}><Ellipse cx={11} cy={17} rx={9} ry={3.5} transform="rotate(-15 11 17)" /><Ellipse cx={29} cy={17} rx={9} ry={3.5} transform="rotate(15 29 17)" /><Ellipse cx={12} cy={23} rx={8} ry={3} transform="rotate(10 12 23)" /><Ellipse cx={28} cy={23} rx={8} ry={3} transform="rotate(-10 28 23)" /></G></G>;
    case 'saltamontes':
      return <G><Ellipse cx={20} cy={22} rx={12} ry={5} fill={c1} {...t} /><Circle cx={31} cy={20} r={4} fill={c1} {...t} /><Circle cx={32} cy={19} r={1.2} fill={TRAZO} /><Path d="M14 24l-4 8M12 22l-8 2M22 26l0 8M8 20l6 1" stroke={c2} strokeWidth={2} strokeLinecap="round" /><Path d="M12 20c4-6 12-6 16-2" fill="none" stroke={c2} strokeWidth={2} strokeLinecap="round" /><Path d="M33 17l4-5" stroke={TRAZO} strokeWidth={1.2} strokeLinecap="round" /></G>;
    case 'escarabajo':
      return <G><Ellipse cx={20} cy={23} rx={10} ry={11} fill={c1} {...t} /><Path d="M20 12v22" stroke={c2} strokeWidth={1.6} /><Circle cx={20} cy={10} r={4} fill={c2} {...t} /><Path d="M10 20l-5-3M10 26l-5 2M30 20l5-3M30 26l5 2M17 7l-2-4M23 7l2-4" stroke={TRAZO} strokeWidth={1.4} strokeLinecap="round" /></G>;
    case 'hormiga':
      return <G><Circle cx={9} cy={22} r={5} fill={c1} {...t} /><Circle cx={19} cy={21} r={4} fill={c1} {...t} /><Ellipse cx={30} cy={22} rx={7} ry={5} fill={c1} {...t} /><Path d="M14 18l-2-5M18 25l-3 6M22 25l3 6M6 18l-3-4" stroke={c2} strokeWidth={1.6} strokeLinecap="round" /><Circle cx={7} cy={21} r={1} fill="#FFFFFF" /></G>;
    // -------- fósiles nuevos --------
    case 'fosil_hoja':
      return <G><Rect x={6} y={8} width={28} height={24} rx={4} fill={c1} {...t} /><Path d="M20 12c-8 4-8 14 0 16 8-2 8-12 0-16zM20 12v16M15 19l5 2 5-2" fill="none" stroke={c2} strokeWidth={1.6} strokeLinecap="round" /></G>;
    case 'fosil_diente':
      return <G><Rect x={6} y={8} width={28} height={24} rx={4} fill={c1} {...t} /><Path d="M14 12h12l-6 18z" fill="#FFFFFF" stroke={c2} strokeWidth={1.6} strokeLinejoin="round" /><Path d="M16 14l2 6M24 14l-2 6" stroke={c2} strokeWidth={1} /></G>;
    case 'fosil_trilobite':
      return <G><Rect x={6} y={8} width={28} height={24} rx={4} fill={c1} {...t} /><Ellipse cx={20} cy={21} rx={8} ry={10} fill="none" stroke={c2} strokeWidth={1.6} /><Path d="M12 16h16M12 20h16M12 24h16M13 28h14M20 11v20" stroke={c2} strokeWidth={1.2} /></G>;
    case 'medalla':
      return <G><Path d="M14 4h5l3 10h-5zM26 4h-5l-3 10h5z" fill={c2} {...t} strokeLinejoin="round" /><Circle cx={20} cy={24} r={11} fill={c1} {...t} /><Circle cx={20} cy={24} r={7} fill="none" stroke={TRAZO} strokeWidth={1} opacity={0.4} /><Path d="M20 18l1.8 3.6 4 .6-2.9 2.8.7 4L20 27l-3.6 1.9.7-4-2.9-2.8 4-.6z" fill="#FFFFFF" opacity={0.8} /></G>;
    // -------- casa: puerta (habitación) y muebles nuevos --------
    case 'puerta':
      return <G><Path d="M9 36V12a11 11 0 0 1 22 0v24z" fill={c1} {...t} /><Path d="M13 36V13a7 7 0 0 1 14 0v23z" fill={c2} opacity={0.5} /><Circle cx={25} cy={24} r={1.8} fill={TRAZO} /></G>;
    case 'silla':
      return <G><Path d="M12 6h4v18h-4zM24 6h4v18h-4z" fill={c1} {...t} /><Rect x={12} y={8} width={16} height={6} rx={2} fill={c1} {...t} /><Rect x={9} y={22} width={22} height={5} rx={2} fill={c2} {...t} /><Path d="M11 27v9M29 27v9" stroke={c1} strokeWidth={3.5} strokeLinecap="round" /></G>;
    case 'mesa':
      return <G><Rect x={4} y={14} width={32} height={6} rx={3} fill={c1} {...t} /><Path d="M8 20v14M32 20v14" stroke={c1} strokeWidth={4} strokeLinecap="round" /><Ellipse cx={20} cy={13} rx={6} ry={2.5} fill={c2} /></G>;
    case 'sofa':
      return <G><Rect x={4} y={16} width={32} height={14} rx={5} fill={c1} {...t} /><Rect x={8} y={10} width={24} height={9} rx={4} fill={c1} {...t} /><Rect x={4} y={18} width={7} height={12} rx={3.5} fill={c2} {...t} /><Rect x={29} y={18} width={7} height={12} rx={3.5} fill={c2} {...t} /><Path d="M9 30v4M31 30v4" stroke={TRAZO} strokeWidth={2.5} strokeLinecap="round" /></G>;
    case 'tele':
      return <G><Rect x={4} y={8} width={32} height={22} rx={3} fill={c1} {...t} /><Rect x={7} y={11} width={26} height={16} rx={2} fill={c2} /><Path d="M14 34h12M20 30v4" stroke={c1} strokeWidth={3} strokeLinecap="round" /><Path d="M12 22l5-5 4 4 3-3 5 5" stroke="#FFFFFF" strokeWidth={1.4} fill="none" opacity={0.7} /></G>;
    case 'reloj':
      return <G><Circle cx={20} cy={20} r={14} fill={c2} {...t} /><Circle cx={20} cy={20} r={11} fill={c1} /><Path d="M20 12v8l5 3" stroke={TRAZO} strokeWidth={2} strokeLinecap="round" fill="none" /><Circle cx={20} cy={20} r={1.4} fill={TRAZO} /></G>;
    case 'espejo':
      return <G><Ellipse cx={20} cy={19} rx={12} ry={15} fill={c2} {...t} /><Ellipse cx={20} cy={19} rx={9} ry={12} fill={c1} /><Path d="M15 12c2-2 4-3 6-3" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" /><Path d="M14 34h12" stroke={c2} strokeWidth={3} strokeLinecap="round" /></G>;
    case 'cojin':
      return <G><Path d="M8 10c8 2 16 2 24 0-2 8-2 12 0 20-8-2-16-2-24 0 2-8 2-12 0-20z" fill={c1} {...t} strokeLinejoin="round" /><Circle cx={20} cy={20} r={2.5} fill={c2} /></G>;
    case 'libros':
      return <G><Rect x={8} y={26} width={26} height={7} rx={1.5} fill={c1} {...t} /><Rect x={6} y={18} width={26} height={7} rx={1.5} fill={c2} {...t} /><Rect x={10} y={10} width={24} height={7} rx={1.5} fill="#FFD93D" {...t} /><Path d="M12 29h4M10 21h4M14 13h4" stroke="#FFFFFF" strokeWidth={1.4} strokeLinecap="round" /></G>;
    case 'florero':
      return <G><Path d="M14 18h12l3 14a3 3 0 0 1-3 3H14a3 3 0 0 1-3-3z" fill={c1} {...t} /><Path d="M20 18V8M15 12c-3-4 0-8 3-6M25 12c3-4 0-8-3-6" stroke="#3E8A62" strokeWidth={1.8} strokeLinecap="round" fill="none" /><Circle cx={14} cy={6} r={3} fill={c2} /><Circle cx={26} cy={6} r={3} fill={c2} /><Circle cx={20} cy={5} r={3} fill={c2} /></G>;
    case 'chimenea':
      return <G><Rect x={5} y={8} width={30} height={28} rx={2} fill={c1} {...t} /><Rect x={11} y={14} width={18} height={22} fill={TRAZO} /><Path d="M15 36c-2-6 2-10 5-14 3 4 7 8 5 14z" fill={c2} /><Path d="M18 36c-1-3 1-5 2-7 1 2 3 4 2 7z" fill="#FFD93D" /><Path d="M5 8h30" stroke={TRAZO} strokeWidth={3} /></G>;
    case 'cuna':
      return <G><Path d="M6 10v18h28V10" fill={c1} {...t} /><Path d="M10 10v18M16 10v18M24 10v18M30 10v18" stroke={TRAZO} strokeWidth={1.2} opacity={0.5} /><Rect x={6} y={26} width={28} height={6} rx={2} fill={c2} {...t} /><Path d="M4 34c8-4 24-4 32 0" stroke={c1} strokeWidth={3} fill="none" strokeLinecap="round" /></G>;
    case 'poster':
      return <G><Rect x={9} y={5} width={22} height={30} rx={1} fill={c1} {...t} /><Circle cx={20} cy={16} r={5} fill={c2} /><Path d="M12 30h16M12 26h10" stroke={c2} strokeWidth={2} strokeLinecap="round" /><Circle cx={11} cy={7} r={1.2} fill={TRAZO} /><Circle cx={29} cy={7} r={1.2} fill={TRAZO} /></G>;
    case 'guitarra':
      return <G><Path d="M22 6l4 2-6 12-4-2z" fill={c2} {...t} /><Path d="M14 18c-6 0-9 5-9 9s4 9 10 9 8-4 8-8c0-3-2-4-2-7s-3-3-7-3z" fill={c1} {...t} /><Circle cx={15} cy={26} r={3} fill={TRAZO} /><Path d="M17 16l7-10" stroke="#FFFFFF" strokeWidth={0.8} /></G>;
    case 'radio':
      return <G><Rect x={5} y={12} width={30} height={20} rx={4} fill={c1} {...t} /><Circle cx={14} cy={22} r={5} fill={c2} {...t} /><Rect x={22} y={17} width={9} height={3} rx={1.5} fill={c2} /><Rect x={22} y={23} width={9} height={3} rx={1.5} fill={c2} /><Path d="M28 12l4-7" stroke={TRAZO} strokeWidth={1.6} strokeLinecap="round" /></G>;
    case 'cactus':
      return <G><Path d="M12 26h16l-2 8H14z" fill={c2} {...t} /><Rect x={16} y={6} width={8} height={22} rx={4} fill={c1} {...t} /><Path d="M16 16c-4 0-6-2-6-6M24 14c4 0 6-2 6-6" stroke={c1} strokeWidth={5} strokeLinecap="round" fill="none" /><Circle cx={20} cy={5} r={2.5} fill="#FF6F91" /></G>;
    case 'osito':
      return <G><Circle cx={12} cy={12} r={4} fill={c1} {...t} /><Circle cx={28} cy={12} r={4} fill={c1} {...t} /><Circle cx={20} cy={16} r={9} fill={c1} {...t} /><Ellipse cx={20} cy={29} rx={9} ry={7} fill={c1} {...t} /><Ellipse cx={20} cy={19} rx={4} ry={3} fill={c2} /><Circle cx={17} cy={14} r={1.2} fill={TRAZO} /><Circle cx={23} cy={14} r={1.2} fill={TRAZO} /><Ellipse cx={20} cy={30} rx={4} ry={3} fill={c2} /></G>;
    case 'tren':
      return <G><Rect x={4} y={16} width={18} height={12} rx={2} fill={c1} {...t} /><Rect x={22} y={10} width={12} height={18} rx={2} fill={c2} {...t} /><Rect x={25} y={13} width={6} height={5} rx={1} fill="#BEE7FF" /><Circle cx={9} cy={30} r={3.5} fill={TRAZO} /><Circle cx={17} cy={30} r={3.5} fill={TRAZO} /><Circle cx={28} cy={30} r={3.5} fill={TRAZO} /><Rect x={6} y={8} width={5} height={8} fill={c2} {...t} /></G>;
    case 'banera':
      return <G><Path d="M4 18h32v6a10 10 0 0 1-10 10H14A10 10 0 0 1 4 24z" fill={c1} {...t} /><Path d="M6 18c6 3 22 3 28 0" stroke={c2} strokeWidth={3} strokeLinecap="round" fill="none" /><Path d="M30 18V10a3 3 0 0 0-6 0" fill="none" {...t} /><Circle cx={12} cy={15} r={1.5} fill={c2} /><Circle cx={18} cy={13} r={1} fill={c2} /><Path d="M10 34v3M30 34v3" stroke={TRAZO} strokeWidth={2} strokeLinecap="round" /></G>;
    case 'lavamanos':
      return <G><Path d="M6 16h28v4a10 10 0 0 1-10 10H16A10 10 0 0 1 6 20z" fill={c1} {...t} /><Path d="M20 30v6M14 36h12" stroke={c1} strokeWidth={3} strokeLinecap="round" /><Path d="M20 16V8a4 4 0 0 1 8 0" fill="none" {...t} /><Ellipse cx={20} cy={18} rx={9} ry={2} fill={c2} /></G>;
    case 'patito':
      return <G><Ellipse cx={20} cy={26} rx={13} ry={8} fill={c1} {...t} /><Circle cx={13} cy={16} r={7} fill={c1} {...t} /><Path d="M6 17l-4 1 4 2z" fill={c2} {...t} strokeWidth={1} /><Circle cx={11} cy={15} r={1.2} fill={TRAZO} /><Path d="M30 22c4-2 5-6 3-8" stroke={c1} strokeWidth={3} fill="none" strokeLinecap="round" /></G>;
    case 'columpio':
      return <G><Path d="M6 36L14 6h12l8 30" fill="none" stroke={c1} strokeWidth={3} strokeLinecap="round" /><Path d="M14 6h12" stroke={c1} strokeWidth={4} strokeLinecap="round" /><Path d="M16 8v18M24 8v18" stroke={TRAZO} strokeWidth={1.2} /><Rect x={13} y={25} width={14} height={4} rx={2} fill={c2} {...t} /></G>;
    case 'fuente':
      return <G><Path d="M4 28h32v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" fill={c1} {...t} /><Path d="M6 28c6-4 22-4 28 0" fill={c2} /><Path d="M14 20h12v8H14z" fill={c1} {...t} /><Path d="M20 20V8" stroke={c2} strokeWidth={3} strokeLinecap="round" /><Path d="M20 8c-4 2-6 6-5 10M20 8c4 2 6 6 5 10" stroke={c2} strokeWidth={2} fill="none" strokeLinecap="round" /></G>;
    case 'parrilla':
      return <G><Path d="M6 14h28a14 14 0 0 1-28 0z" fill={c1} {...t} /><Path d="M6 14h28" stroke={c2} strokeWidth={3} /><Path d="M10 14h20" stroke="#9A9AA8" strokeWidth={1} /><Path d="M14 28l-4 8M26 28l4 8" stroke={c1} strokeWidth={3} strokeLinecap="round" /><Path d="M16 10c-1-3 1-4 1-7M22 10c-1-3 1-4 1-7" stroke={TRAZO} strokeWidth={1.2} strokeLinecap="round" opacity={0.5} /></G>;
    case 'hamaca':
      return <G><Path d="M4 10c6 16 26 16 32 0" fill="none" stroke={c1} strokeWidth={5} strokeLinecap="round" /><Path d="M8 14c5 9 19 9 24 0" fill="none" stroke={c2} strokeWidth={2} /><Path d="M4 10v26M36 10v26" stroke={c2} strokeWidth={3} strokeLinecap="round" /></G>;
    case 'telescopio':
      return <G><Path d="M8 22L30 8l4 6L12 28z" fill={c1} {...t} strokeLinejoin="round" /><Circle cx={32} cy={11} r={3} fill={c2} {...t} strokeWidth={1} /><Path d="M14 26l-4 10M18 26l4 10M16 26v10" stroke={c1} strokeWidth={2.5} strokeLinecap="round" /></G>;
    case 'farol':
      return <G><Path d="M14 12h12v14a6 6 0 0 1-12 0z" fill={c2} {...t} /><Path d="M12 12h16l-2-4H14z" fill={c1} {...t} strokeLinejoin="round" /><Path d="M20 8V4M20 32v4M16 36h8" stroke={c1} strokeWidth={2.5} strokeLinecap="round" /><Path d="M20 16c-2 3-2 6 0 8 2-2 2-5 0-8z" fill="#FFA557" /></G>;
    case 'tobogan':
      return <G><Path d="M8 34V10h6" fill="none" stroke={c1} strokeWidth={3.5} strokeLinecap="round" /><Path d="M14 10c0 12 8 18 20 22" fill="none" stroke={c2} strokeWidth={6} strokeLinecap="round" /><Path d="M8 14h6M8 20h6M8 26h6" stroke={c1} strokeWidth={2.5} strokeLinecap="round" /><Path d="M30 30l2 6" stroke={c1} strokeWidth={3} strokeLinecap="round" /></G>;
    case 'mesita_te':
      return <G><Ellipse cx={20} cy={16} rx={15} ry={5} fill={c1} {...t} /><Path d="M20 21v14M12 35h16" stroke={c1} strokeWidth={3} strokeLinecap="round" /><Path d="M12 13h6v3a3 3 0 0 1-6 0zM23 13h6v3a3 3 0 0 1-6 0z" fill={c2} {...t} strokeWidth={1} /></G>;
    case 'cocina_mueble':
      return <G><Rect x={4} y={14} width={32} height={20} rx={2} fill={c1} {...t} /><Rect x={4} y={12} width={32} height={4} rx={1} fill={c2} /><Circle cx={12} cy={10} r={3.5} fill="none" stroke={TRAZO} strokeWidth={1.4} /><Circle cx={24} cy={10} r={3.5} fill="none" stroke={TRAZO} strokeWidth={1.4} /><Rect x={10} y={20} width={20} height={10} rx={1} fill="none" stroke={TRAZO} strokeWidth={1.2} /><Path d="M14 22h12" stroke={c2} strokeWidth={2} /></G>;
    case 'refrigerador':
      return <G><Rect x={9} y={4} width={22} height={32} rx={3} fill={c1} {...t} /><Path d="M9 16h22" stroke={TRAZO} strokeWidth={1.2} /><Path d="M27 8v5M27 20v8" stroke={c2} strokeWidth={2.5} strokeLinecap="round" /></G>;
    case 'globo':
      return <G><Path d="M14 22v12M26 22v12" stroke={TRAZO} strokeWidth={1.2} /><Ellipse cx={14} cy={14} rx={7} ry={9} fill={c1} {...t} /><Ellipse cx={26} cy={12} rx={7} ry={9} fill={c2} {...t} /><Path d="M11 9c1-2 2-3 3-3M23 7c1-2 2-3 3-3" stroke="#FFFFFF" strokeWidth={1.4} strokeLinecap="round" /></G>;

    case 'jabon':
      return <G><Rect x={6} y={12} width={28} height={18} rx={7} fill={c1} {...t} /><Path d="M12 20h10" stroke={c2} strokeWidth={2.5} strokeLinecap="round" /><Circle cx={30} cy={9} r={3} fill={c2} opacity={0.8} {...t} strokeWidth={1} /><Circle cx={24} cy={6} r={2} fill={c2} opacity={0.8} {...t} strokeWidth={1} /></G>;
    case 'manguera':
      return <G><Path d="M8 30c-6-10 4-18 12-14s14-2 12-10" fill="none" stroke={c1} strokeWidth={5} strokeLinecap="round" /><Rect x={28} y={2} width={8} height={12} rx={3} fill={c2} {...t} transform="rotate(20 32 8)" /><Circle cx={8} cy={30} r={4} fill={c2} {...t} /><Path d="M36 4l4-3M38 8l4 0" stroke="#6BC8E8" strokeWidth={2} strokeLinecap="round" /></G>;
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
