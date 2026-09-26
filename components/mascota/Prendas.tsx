// Ropa y accesorios equipables. Cada prenda es un dibujo vectorial en el mismo
// lienzo 0-120 que MascotaVirtual, con slot fijo y colores por prop: un mismo
// gorro en tres colores es el mismo dibujo, no tres assets.
import { Circle, Ellipse, G, Line, Path, Rect } from 'react-native-svg';
import type { Especie, SlotPrenda } from '@/lib/mascota-virtual/tipos';

const TRAZO = '#4A3B45';

/** Ancla por especie: la cabeza del ratón es un poco más chica y baja. */
export const ANCLA: Record<Especie, Partial<Record<SlotPrenda, { dx?: number; dy?: number }>>> = {
  paloma: {},
  gato: {},
  perro: {},
  oso: { cabeza: { dy: -2 } },
  cerdito: {},
  raton: { cabeza: { dy: 4 }, cara: { dy: 2 } },
  vaca: { cabeza: { dy: -4 } },
};

export function dibujoPrenda(dibujo: string, c1: string, c2: string) {
  switch (dibujo) {
    // ---------------- cabeza ----------------
    case 'sombrero_paja':
      return (
        <G>
          <Ellipse cx={60} cy={26} rx={46} ry={11} fill={c1} stroke={TRAZO} strokeWidth={2.5} />
          <Path d="M32 24c0-16 8-26 28-26s28 10 28 26" fill={c1} stroke={TRAZO} strokeWidth={2.5} />
          <Rect x={31} y={14} width={58} height={8} fill={c2} />
        </G>
      );
    case 'sombrero_copa':
      return (
        <G>
          <Ellipse cx={60} cy={27} rx={40} ry={8} fill={c1} stroke={TRAZO} strokeWidth={2.5} />
          <Rect x={36} y={-10} width={48} height={38} rx={4} fill={c1} stroke={TRAZO} strokeWidth={2.5} />
          <Rect x={36} y={18} width={48} height={7} fill={c2} />
        </G>
      );
    case 'corona':
      return (
        <G>
          <Path d="M34 28l-4-24 14 12 16-18 16 18 14-12-4 24z" fill={c1} stroke={TRAZO} strokeWidth={2.5} strokeLinejoin="round" />
          <Circle cx={44} cy={20} r={3.5} fill={c2} />
          <Circle cx={60} cy={16} r={4} fill={c2} />
          <Circle cx={76} cy={20} r={3.5} fill={c2} />
        </G>
      );
    case 'lazo':
      return (
        <G transform="translate(28 6)">
          <Path d="M18 12L2 4c-2-1-4 .5-4 3v10c0 2.5 2 4 4 3l16-8z" fill={c1} stroke={TRAZO} strokeWidth={2} strokeLinejoin="round" />
          <Path d="M22 12l16-8c2-1 4 .5 4 3v10c0 2.5-2 4-4 3l-16-8z" fill={c1} stroke={TRAZO} strokeWidth={2} strokeLinejoin="round" />
          <Ellipse cx={20} cy={12} rx={5} ry={6} fill={c2} stroke={TRAZO} strokeWidth={2} />
        </G>
      );
    case 'gorro_lana':
      return (
        <G>
          <Path d="M20 30c0-24 18-32 40-32s40 8 40 32z" fill={c1} stroke={TRAZO} strokeWidth={2.5} />
          <Rect x={16} y={24} width={88} height={12} rx={6} fill={c2} stroke={TRAZO} strokeWidth={2.5} />
          <Circle cx={60} cy={-2} r={8} fill={c2} stroke={TRAZO} strokeWidth={2.5} />
        </G>
      );
    case 'gorra':
      return (
        <G>
          <Path d="M22 30c0-20 16-30 38-30s38 10 38 30z" fill={c1} stroke={TRAZO} strokeWidth={2.5} />
          <Path d="M58 30h50c4 0 6 3 6 6s-3 5-8 5H58z" fill={c2} stroke={TRAZO} strokeWidth={2.5} strokeLinejoin="round" />
          <Circle cx={60} cy={2} r={4} fill={c2} />
        </G>
      );
    case 'orejas_conejo':
      return (
        <G>
          <Ellipse cx={42} cy={2} rx={9} ry={26} fill={c1} stroke={TRAZO} strokeWidth={2.5} transform="rotate(-12 42 2)" />
          <Ellipse cx={78} cy={2} rx={9} ry={26} fill={c1} stroke={TRAZO} strokeWidth={2.5} transform="rotate(12 78 2)" />
          <Ellipse cx={42} cy={4} rx={4} ry={18} fill={c2} transform="rotate(-12 42 4)" />
          <Ellipse cx={78} cy={4} rx={4} ry={18} fill={c2} transform="rotate(12 78 4)" />
          <Path d="M32 30c10-6 46-6 56 0" fill="none" stroke={TRAZO} strokeWidth={2.5} />
        </G>
      );
    case 'gorro_navidad':
      return (
        <G>
          <Path d="M24 30C28 8 48-10 92-8c-4 8-4 16 0 20-16-2-30 6-36 18z" fill={c1} stroke={TRAZO} strokeWidth={2.5} strokeLinejoin="round" />
          <Circle cx={94} cy={4} r={8} fill={c2} stroke={TRAZO} strokeWidth={2.5} />
          <Rect x={18} y={24} width={84} height={12} rx={6} fill={c2} stroke={TRAZO} strokeWidth={2.5} />
        </G>
      );
    case 'sombrero_bruja':
      return (
        <G>
          <Ellipse cx={60} cy={28} rx={48} ry={9} fill={c1} stroke={TRAZO} strokeWidth={2.5} />
          <Path d="M34 28C40 6 52-14 70-30c-4 20 6 40 18 58z" fill={c1} stroke={TRAZO} strokeWidth={2.5} strokeLinejoin="round" />
          <Path d="M36 22h46" stroke={c2} strokeWidth={5} />
        </G>
      );

    // ---------------- cara ----------------
    case 'lentes_sol':
      return (
        <G>
          <Rect x={26} y={48} width={28} height={18} rx={8} fill={c1} stroke={TRAZO} strokeWidth={2.5} />
          <Rect x={66} y={48} width={28} height={18} rx={8} fill={c1} stroke={TRAZO} strokeWidth={2.5} />
          <Line x1={54} y1={54} x2={66} y2={54} stroke={TRAZO} strokeWidth={2.5} />
          <Path d="M32 54c4-3 8-3 12 0M72 54c4-3 8-3 12 0" stroke={c2} strokeWidth={2} strokeLinecap="round" fill="none" opacity={0.7} />
        </G>
      );
    case 'lentes_redondos':
      return (
        <G>
          <Circle cx={41} cy={57} r={12} fill={c2} fillOpacity={0.35} stroke={c1} strokeWidth={3} />
          <Circle cx={79} cy={57} r={12} fill={c2} fillOpacity={0.35} stroke={c1} strokeWidth={3} />
          <Line x1={53} y1={57} x2={67} y2={57} stroke={c1} strokeWidth={3} />
        </G>
      );

    // ---------------- cuello ----------------
    case 'bufanda':
      return (
        <G>
          <Rect x={26} y={90} width={68} height={16} rx={8} fill={c1} stroke={TRAZO} strokeWidth={2.5} />
          <Path d="M74 100l4 22h12l-4-22z" fill={c1} stroke={TRAZO} strokeWidth={2.5} strokeLinejoin="round" />
          <Path d="M36 98h48M78 110h10" stroke={c2} strokeWidth={2.5} strokeLinecap="round" />
        </G>
      );
    case 'panuelo':
      return (
        <G>
          <Path d="M28 92h64l-32 26z" fill={c1} stroke={TRAZO} strokeWidth={2.5} strokeLinejoin="round" />
          <Circle cx={48} cy={100} r={2.5} fill={c2} />
          <Circle cx={64} cy={104} r={2.5} fill={c2} />
          <Circle cx={72} cy={96} r={2.5} fill={c2} />
        </G>
      );
    case 'collar':
      return (
        <G>
          <Path d="M32 92c6 12 16 18 28 18s22-6 28-18" fill="none" stroke={c2} strokeWidth={2} />
          {[36, 44, 52, 60, 68, 76, 84].map((x, i) => (
            <Circle key={x} cx={x} cy={92 + [4, 10, 14, 16, 14, 10, 4][i]} r={4} fill={c1} stroke={TRAZO} strokeWidth={1.5} />
          ))}
        </G>
      );

    // ---------------- cuerpo ----------------
    case 'vestido':
      return (
        <G>
          <Path d="M40 96h40l12 24H28z" fill={c1} stroke={TRAZO} strokeWidth={2.5} strokeLinejoin="round" />
          <Path d="M46 104h28M42 112h36" stroke={c2} strokeWidth={2.5} strokeLinecap="round" />
          <Circle cx={60} cy={99} r={3} fill={c2} />
        </G>
      );
    case 'chaleco':
      return (
        <G>
          <Path d="M36 96h48l4 24H32z" fill={c1} stroke={TRAZO} strokeWidth={2.5} strokeLinejoin="round" />
          <Path d="M60 96v24" stroke={c2} strokeWidth={3} />
          <Circle cx={60} cy={104} r={2} fill={TRAZO} />
          <Circle cx={60} cy={112} r={2} fill={TRAZO} />
        </G>
      );
    case 'capa':
      return (
        <G>
          <Path d="M30 96c-6 10-8 18-6 26h72c2-8 0-16-6-26z" fill={c1} stroke={TRAZO} strokeWidth={2.5} strokeLinejoin="round" />
          <Path d="M40 94h40" stroke={c2} strokeWidth={5} strokeLinecap="round" />
          <Path d="M60 100l3 6-3 6-3-6z" fill={c2} />
        </G>
      );

    case 'boina':
      return (
        <G>
          <Path d="M22 28c-2-18 14-30 40-28 24 0 36 12 34 28z" fill={c1} stroke={TRAZO} strokeWidth={2.5} strokeLinejoin="round" />
          <Path d="M20 30c14-6 66-6 80 0" fill="none" stroke={c2} strokeWidth={5} strokeLinecap="round" />
          <Circle cx={62} cy={-2} r={4} fill={c2} stroke={TRAZO} strokeWidth={2} />
        </G>
      );
    case 'diadema':
      return (
        <G>
          <Path d="M18 34C26 14 44 4 60 4s34 10 42 30" fill="none" stroke={c1} strokeWidth={6} strokeLinecap="round" />
          <G transform="translate(84 10)">
            {[0, 72, 144, 216, 288].map((a) => <Ellipse key={a} cx={0} cy={-8} rx={4.5} ry={7} fill={c2} stroke={TRAZO} strokeWidth={1.5} transform={`rotate(${a})`} />)}
            <Circle cx={0} cy={0} r={4} fill="#FFFFFF" stroke={TRAZO} strokeWidth={1.5} />
          </G>
        </G>
      );
    case 'audifonos':
      return (
        <G>
          <Path d="M14 56C14 20 34 2 60 2s46 18 46 54" fill="none" stroke={c1} strokeWidth={7} strokeLinecap="round" />
          <Rect x={4} y={46} width={20} height={30} rx={9} fill={c1} stroke={TRAZO} strokeWidth={2.5} />
          <Rect x={96} y={46} width={20} height={30} rx={9} fill={c1} stroke={TRAZO} strokeWidth={2.5} />
          <Circle cx={14} cy={61} r={5} fill={c2} /><Circle cx={106} cy={61} r={5} fill={c2} />
        </G>
      );
    case 'sombrero_vaquero':
      return (
        <G>
          <Path d="M4 30c10 10 102 10 112 0-8-4-22-6-30-6H34c-8 0-22 2-30 6z" fill={c1} stroke={TRAZO} strokeWidth={2.5} strokeLinejoin="round" />
          <Path d="M34 24c-2-20 8-30 26-30s28 10 26 30z" fill={c1} stroke={TRAZO} strokeWidth={2.5} />
          <Path d="M34 22h52" stroke={c2} strokeWidth={5} />
          <Path d="M48-2c4-4 8-4 12 0 4-4 8-4 12 0" fill="none" stroke={TRAZO} strokeWidth={2} />
        </G>
      );
    case 'casco':
      return (
        <G>
          <Path d="M18 30c0-26 18-38 42-38s42 12 42 38z" fill={c1} stroke={TRAZO} strokeWidth={2.5} />
          <Path d="M32 24c4-14 14-22 28-22s24 8 28 22M60 2v22" stroke={c2} strokeWidth={4} fill="none" strokeLinecap="round" />
          <Rect x={16} y={26} width={88} height={8} rx={4} fill={c2} stroke={TRAZO} strokeWidth={2.5} />
        </G>
      );
    case 'cuernitos':
      return (
        <G>
          <Path d="M36 30c-10-6-14-16-10-28 8 4 14 14 14 26z" fill={c1} stroke={TRAZO} strokeWidth={2.5} strokeLinejoin="round" />
          <Path d="M84 30c10-6 14-16 10-28-8 4-14 14-14 26z" fill={c1} stroke={TRAZO} strokeWidth={2.5} strokeLinejoin="round" />
          <Path d="M30 12l4 8M90 12l-4 8" stroke={c2} strokeWidth={2.5} strokeLinecap="round" />
        </G>
      );
    case 'antifaz':
      return (
        <G>
          <Path d="M20 50c10-8 22-8 30-2 3 2 7 2 10 0 8-6 20-6 30 2 2 12-6 22-16 22-8 0-12-6-16-6h-6c-4 0-8 6-16 6-10 0-18-10-16-22z" fill={c1} stroke={TRAZO} strokeWidth={2.5} strokeLinejoin="round" />
          <Ellipse cx={42} cy={58} rx={9} ry={6} fill={c2} opacity={0.9} /><Ellipse cx={78} cy={58} rx={9} ry={6} fill={c2} opacity={0.9} />
        </G>
      );
    case 'monoculo':
      return (
        <G>
          <Circle cx={79} cy={57} r={13} fill={c2} fillOpacity={0.3} stroke={c1} strokeWidth={3.5} />
          <Path d="M90 66c6 8 8 18 6 30" fill="none" stroke={TRAZO} strokeWidth={1.8} />
        </G>
      );
    case 'pajarita':
      return (
        <G transform="translate(60 98)">
          <Path d="M-4 0l-22-12c-3-1.5-6 .5-6 4v16c0 3.5 3 5.5 6 4L-4 0zM4 0l22-12c3-1.5 6 .5 6 4v16c0 3.5-3 5.5-6 4L4 0z" fill={c1} stroke={TRAZO} strokeWidth={2.5} strokeLinejoin="round" />
          <Rect x={-6} y={-7} width={12} height={14} rx={4} fill={c2} stroke={TRAZO} strokeWidth={2} />
        </G>
      );
    case 'corbata':
      return (
        <G>
          <Path d="M52 92h16l-4 6 6 18-10 8-10-8 6-18z" fill={c1} stroke={TRAZO} strokeWidth={2.5} strokeLinejoin="round" />
          <Path d="M56 104l8 4M55 112l10 4" stroke={c2} strokeWidth={2.5} strokeLinecap="round" />
        </G>
      );
    case 'pijama':
      return (
        <G>
          <Path d="M32 96h56l4 24H28z" fill={c1} stroke={TRAZO} strokeWidth={2.5} strokeLinejoin="round" />
          <Path d="M60 96v24" stroke={c2} strokeWidth={2} />
          {[[42, 104], [52, 112], [70, 104], [78, 112], [60, 108]].map(([x, y]) => <Circle key={`${x}${y}`} cx={x} cy={y} r={2.6} fill={c2} />)}
        </G>
      );
    case 'chaqueta':
      return (
        <G>
          <Path d="M30 96h60l6 24H24z" fill={c1} stroke={TRAZO} strokeWidth={2.5} strokeLinejoin="round" />
          <Path d="M48 96l12 10 12-10" fill="none" stroke={c2} strokeWidth={3} strokeLinejoin="round" />
          <Path d="M60 106v14" stroke={c2} strokeWidth={2} />
          <Rect x={24} y={100} width={10} height={20} rx={3} fill={c1} stroke={TRAZO} strokeWidth={2.5} /><Rect x={86} y={100} width={10} height={20} rx={3} fill={c1} stroke={TRAZO} strokeWidth={2.5} />
        </G>
      );
    case 'delantal':
      return (
        <G>
          <Path d="M40 92h40v28H40z" fill={c1} stroke={TRAZO} strokeWidth={2.5} strokeLinejoin="round" />
          <Path d="M40 100c-4-2-6-6-6-10M80 100c4-2 6-6 6-10" fill="none" stroke={TRAZO} strokeWidth={2} />
          <Rect x={50} y={104} width={20} height={12} rx={3} fill={c2} stroke={TRAZO} strokeWidth={1.8} />
        </G>
      );
    case 'tutu':
      return (
        <G>
          <Path d="M36 98c-4 6-10 12-16 14 14 2 30 4 40 4s26-2 40-4c-6-2-12-8-16-14z" fill={c1} stroke={TRAZO} strokeWidth={2.5} strokeLinejoin="round" />
          <Path d="M28 108c10 3 54 3 64 0" fill="none" stroke={c2} strokeWidth={2} />
          <Rect x={40} y={92} width={40} height={8} rx={4} fill={c2} stroke={TRAZO} strokeWidth={2} />
        </G>
      );
    case 'alas':
      return (
        <G>
          <Path d="M28 92c-16-10-30-6-30 8 0 10 10 18 26 18z" fill={c1} fillOpacity={0.85} stroke={TRAZO} strokeWidth={2.5} strokeLinejoin="round" />
          <Path d="M92 92c16-10 30-6 30 8 0 10-10 18-26 18z" fill={c1} fillOpacity={0.85} stroke={TRAZO} strokeWidth={2.5} strokeLinejoin="round" />
          <Path d="M10 100c6 0 12 4 14 10M110 100c-6 0-12 4-14 10" fill="none" stroke={c2} strokeWidth={2.5} strokeLinecap="round" />
        </G>
      );
    case 'mochila':
      return (
        <G>
          <Path d="M34 96c-2-4-6-6-10-6v30h12z" fill={c2} stroke={TRAZO} strokeWidth={2.5} strokeLinejoin="round" />
          <Path d="M86 96c2-4 6-6 10-6v30H84z" fill={c2} stroke={TRAZO} strokeWidth={2.5} strokeLinejoin="round" />
          <Path d="M36 96h48v24H36z" fill={c1} stroke={TRAZO} strokeWidth={2.5} strokeLinejoin="round" />
          <Rect x={48} y={104} width={24} height={10} rx={3} fill={c2} stroke={TRAZO} strokeWidth={2} />
        </G>
      );
    default:
      return null;
  }
}

/** Región del lienzo que ocupa cada slot, para dibujar la prenda sola (tienda, armario). */
export const REGION_SLOT: Record<SlotPrenda, string> = {
  cabeza: '8 -34 104 74',
  cara: '20 40 80 34',
  cuello: '20 84 80 42',
  cuerpo: '20 86 80 40',
};
