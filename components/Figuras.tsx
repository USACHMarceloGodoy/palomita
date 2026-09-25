// Las 14 figuras del motor de partículas, portadas del artboard "Splash · motor".
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';
import { Image } from 'expo-image';
import { sprite } from '@/lib/sprites';

export type Forma =
  | 'flor' | 'rosa' | 'girasol' | 'corazon' | 'volantin' | 'lazo' | 'gatito'
  | 'capibara' | 'zuricata' | 'oveja' | 'conejito' | 'frutilla' | 'hamburguesa' | 'lana'
  | 'vaca' | 'cerdo' | 'gota' | 'paraguas';

export const FORMAS_GRANDES: Partial<Record<Forma, true>> = {
  capibara: true, zuricata: true, oveja: true, conejito: true, gatito: true, hamburguesa: true,
};

type Props = { forma: Forma; c1: string; c2: string; size: number };

export function Figura({ forma, c1, c2, size }: Props) {
  const png = sprite(forma);
  if (png) return <Image source={png} style={{ width: size, height: size }} contentFit="contain" />;
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40">
      {cuerpo(forma, c1, c2)}
    </Svg>
  );
}

function cuerpo(forma: Forma, c1: string, c2: string) {
  switch (forma) {
    case 'flor':
      return (
        <G>
          <Circle cx={20} cy={11.5} r={7.6} fill={c1} />
          <Circle cx={12} cy={17.4} r={7.6} fill={c1} />
          <Circle cx={15} cy={26.9} r={7.6} fill={c1} />
          <Circle cx={25} cy={26.9} r={7.6} fill={c1} />
          <Circle cx={28} cy={17.4} r={7.6} fill={c1} />
          <Circle cx={20} cy={20} r={5.6} fill={c2} />
        </G>
      );
    case 'corazon':
      return <Path d="M20 34S6 25.6 6 16.4A6.8 6.8 0 0 1 20 12.6 6.8 6.8 0 0 1 34 16.4C34 25.6 20 34 20 34z" fill={c1} />;
    case 'rosa':
      return (
        <G>
          <Path d="M6 31c4.6 1.4 8-0.8 9-4.4-4.6-1.4-8 0.8-9 4.4z" fill="#3E8A62" />
          <Circle cx={20} cy={19} r={13} fill={c1} />
          <Path d="M26.5 13.5a8.5 8.5 0 1 1-11.6 11.6" fill="none" stroke={c2} strokeWidth={2.4} strokeLinecap="round" />
          <Path d="M23.4 17.6a4.6 4.6 0 1 0-4.2 6.2" fill="none" stroke={c2} strokeWidth={2.2} strokeLinecap="round" />
        </G>
      );
    case 'girasol':
      return (
        <G>
          <G fill={c1}>
            {Array.from({ length: 10 }, (_, i) => (
              <Ellipse key={i} cx={20} cy={10} rx={3.3} ry={7.4} transform={`rotate(${i * 36} 20 20)`} />
            ))}
          </G>
          <Circle cx={20} cy={20} r={6.4} fill={c2} />
        </G>
      );
    case 'volantin':
      return (
        <G>
          <Path d="M20 26c3.4 4-3.4 6.4 0 10" fill="none" stroke={c2} strokeWidth={1.8} strokeLinecap="round" />
          <Path d="M20 4L9.5 16 20 28z" fill={c1} />
          <Path d="M20 4l10.5 12L20 28z" fill={c2} />
          <Path d="M20 4L9.5 16 20 28l10.5-12z" fill="none" stroke="#4A3B45" strokeWidth={1.6} strokeLinejoin="round" />
          <Path d="M9.5 16h21M20 4v24" stroke="#4A3B45" strokeWidth={1.2} opacity={0.5} />
        </G>
      );
    case 'lazo':
      return (
        <G stroke="#4A3B45" strokeWidth={1.3} strokeLinejoin="round">
          <Path d="M19 20L7.5 13.4c-2-1.2-4.5.3-4.5 2.9v7.4c0 2.6 2.5 4.1 4.5 2.9L19 20z" fill={c1} />
          <Path d="M21 20l11.5-6.6c2-1.2 4.5.3 4.5 2.9v7.4c0 2.6-2.5 4.1-4.5 2.9L21 20z" fill={c1} />
          <Ellipse cx={20} cy={20} rx={4.4} ry={5.2} fill={c2} />
        </G>
      );
    case 'gatito':
      return (
        <G>
          <Path d="M11.5 13.5L9.5 5.5l7.5 3.8M28.5 13.5l2-8-7.5 3.8" fill="#FFF8F0" stroke="#4A3B45" strokeWidth={1.4} strokeLinejoin="round" />
          <Circle cx={20} cy={22.5} r={12.8} fill="#FFF8F0" stroke="#4A3B45" strokeWidth={1.4} />
          <Circle cx={15.4} cy={21} r={1.8} fill="#4A3B45" />
          <Circle cx={24.6} cy={21} r={1.8} fill="#4A3B45" />
          <Ellipse cx={20} cy={25} rx={1.9} ry={1.4} fill="#FF6F91" />
          <Path d="M17.6 28c1.4 1.3 3.4 1.3 4.8 0" fill="none" stroke="#4A3B45" strokeWidth={1.3} strokeLinecap="round" />
          <Path d="M3.5 21.5h5M31.5 21.5h5M4.5 26h4.5M30.5 26h4.5" stroke="#4A3B45" strokeWidth={1.1} strokeLinecap="round" />
          <Ellipse cx={11.5} cy={26.5} rx={2.4} ry={1.7} fill="#FFB3C6" />
          <Ellipse cx={28.5} cy={26.5} rx={2.4} ry={1.7} fill="#FFB3C6" />
        </G>
      );
    case 'capibara':
      return (
        <G>
          <Ellipse cx={11.5} cy={11.5} rx={3} ry={2.6} fill="#8C6239" />
          <Ellipse cx={28.5} cy={11.5} rx={3} ry={2.6} fill="#8C6239" />
          <Rect x={6.5} y={12} width={27} height={21} rx={9.5} fill="#B98B5E" stroke="#6B4A2A" strokeWidth={1.4} />
          <Circle cx={14} cy={20} r={1.7} fill="#4A3B45" />
          <Circle cx={26} cy={20} r={1.7} fill="#4A3B45" />
          <Ellipse cx={20} cy={27} rx={7.5} ry={4.8} fill="#CBA075" />
          <Path d="M17.2 25.4h1.4M21.4 25.4h1.4" stroke="#6B4A2A" strokeWidth={1.4} strokeLinecap="round" />
          <Path d="M17.6 28.6c1.4 1.1 3.4 1.1 4.8 0" fill="none" stroke="#6B4A2A" strokeWidth={1.3} strokeLinecap="round" />
        </G>
      );
    case 'zuricata':
      return (
        <G>
          <Path d="M28 32c4.5 1 6.5-2.5 5-6" fill="none" stroke="#C9A97E" strokeWidth={2.6} strokeLinecap="round" />
          <Path d="M20 38c-4.5 0-7-2.4-7-7v-8.5h14V31c0 4.6-2.5 7-7 7z" fill="#C9A97E" stroke="#6B4A2A" strokeWidth={1.3} />
          <Circle cx={12.5} cy={10.5} r={2.7} fill="#A8875E" stroke="#6B4A2A" strokeWidth={1.1} />
          <Circle cx={27.5} cy={10.5} r={2.7} fill="#A8875E" stroke="#6B4A2A" strokeWidth={1.1} />
          <Ellipse cx={20} cy={15.5} rx={8.4} ry={9.2} fill="#D9BC94" stroke="#6B4A2A" strokeWidth={1.3} />
          <Ellipse cx={16.3} cy={14.5} rx={2.6} ry={2.2} fill="#4A3B45" />
          <Ellipse cx={23.7} cy={14.5} rx={2.6} ry={2.2} fill="#4A3B45" />
          <Ellipse cx={20} cy={20} rx={1.8} ry={1.3} fill="#4A3B45" />
          <Path d="M20 21.3v1.6" stroke="#6B4A2A" strokeWidth={1.1} strokeLinecap="round" />
        </G>
      );
    case 'oveja':
      return (
        <G>
          <Path d="M13 30v5M22 31v4.5" stroke="#4A3B45" strokeWidth={2.2} strokeLinecap="round" />
          <G fill="#FFF8F0" stroke="#D6C2CB" strokeWidth={1.2}>
            <Circle cx={13} cy={21} r={7.2} />
            <Circle cx={21.5} cy={17.5} r={7.6} />
            <Circle cx={26} cy={24.5} r={6.6} />
            <Circle cx={17} cy={27} r={7} />
          </G>
          <Ellipse cx={25.5} cy={12.5} rx={2.8} ry={1.7} fill="#4A3B45" transform="rotate(-24 25.5 12.5)" />
          <Ellipse cx={30.5} cy={13.5} rx={5.6} ry={6.2} fill="#4A3B45" />
          <Circle cx={28.8} cy={12.6} r={1.2} fill="#FFF8F0" />
          <Circle cx={32.6} cy={13.2} r={1.2} fill="#FFF8F0" />
        </G>
      );
    case 'conejito':
      return (
        <G>
          <Ellipse cx={14.8} cy={10.5} rx={3.2} ry={8.4} fill="#FFF8F0" stroke="#E0C2CE" strokeWidth={1.3} />
          <Ellipse cx={25.2} cy={10.5} rx={3.2} ry={8.4} fill="#FFF8F0" stroke="#E0C2CE" strokeWidth={1.3} />
          <Ellipse cx={14.8} cy={11} rx={1.4} ry={5.4} fill="#FFB3C6" />
          <Ellipse cx={25.2} cy={11} rx={1.4} ry={5.4} fill="#FFB3C6" />
          <Circle cx={20} cy={26} r={10.4} fill="#FFF8F0" stroke="#E0C2CE" strokeWidth={1.3} />
          <Circle cx={16.4} cy={24.6} r={1.7} fill="#4A3B45" />
          <Circle cx={23.6} cy={24.6} r={1.7} fill="#4A3B45" />
          <Path d="M20 28l-1.7 1.6h3.4z" fill="#FF6F91" />
          <Ellipse cx={12.6} cy={28.6} rx={2.2} ry={1.6} fill="#FFB3C6" />
          <Ellipse cx={27.4} cy={28.6} rx={2.2} ry={1.6} fill="#FFB3C6" />
        </G>
      );
    case 'frutilla':
      return (
        <G>
          <Path d="M20 12.5V7.5" stroke="#3E8A62" strokeWidth={2.2} strokeLinecap="round" />
          <Path d="M20 36.5c-6.6 0-11.4-5.2-11.4-11.6 0-6.6 5.1-11.2 11.4-11.2s11.4 4.6 11.4 11.2c0 6.4-4.8 11.6-11.4 11.6z" fill="#E63950" stroke="#B4212F" strokeWidth={1.2} />
          <Path d="M20 13.5c-3.2-4.2-7.6-4.8-9.8-4.2 1 3.8 4.4 6 9.8 4.2zM20 13.5c3.2-4.2 7.6-4.8 9.8-4.2-1 3.8-4.4 6-9.8 4.2z" fill="#3E8A62" />
          <G fill="#FFD93D">
            <Ellipse cx={15} cy={21} rx={1.1} ry={1.5} />
            <Ellipse cx={25} cy={21} rx={1.1} ry={1.5} />
            <Ellipse cx={20} cy={24.5} rx={1.1} ry={1.5} />
            <Ellipse cx={13.5} cy={27.5} rx={1.1} ry={1.5} />
            <Ellipse cx={26.5} cy={27.5} rx={1.1} ry={1.5} />
            <Ellipse cx={20} cy={31.5} rx={1.1} ry={1.5} />
          </G>
        </G>
      );
    case 'hamburguesa':
      return (
        <G>
          <Path d="M5.5 20c0-6.4 6.2-10.5 14.5-10.5S34.5 13.6 34.5 20z" fill="#E8A33D" stroke="#B5791F" strokeWidth={1.2} />
          <G fill="#FFF8F0">
            <Ellipse cx={14} cy={15.5} rx={1.5} ry={1} />
            <Ellipse cx={21} cy={13.5} rx={1.5} ry={1} />
            <Ellipse cx={27} cy={16.5} rx={1.5} ry={1} />
          </G>
          <Path d="M4.5 21.2c2.2-1.8 4.4-1.8 6.6 0s4.4 1.8 6.6 0 4.4-1.8 6.6 0 4.4 1.8 6.6 0 3.2-1 4.6 0v2.4H4.5z" fill="#7BC47F" />
          <Rect x={6.5} y={23.4} width={27} height={4.2} rx={1.6} fill="#FFD93D" />
          <Rect x={6} y={27} width={28} height={5.4} rx={2.4} fill="#8A5A3B" />
          <Path d="M5.5 32h29c0 3-2.2 4.6-5.2 4.6H10.7c-3 0-5.2-1.6-5.2-4.6z" fill="#E8A33D" stroke="#B5791F" strokeWidth={1.2} />
        </G>
      );
    case 'vaca':
      return (
        <G>
          <Rect x={6} y={13} width={28} height={20} rx={8} fill="#FFF8F0" stroke="#4A3B45" strokeWidth={1.3} />
          <Path d="M10 16c3-2 6 1 5 4-2 2-6 1-5-4zM24 25c2-3 7-2 6 2-1 3-7 2-6-2z" fill="#4A3B45" />
          <Ellipse cx={11} cy={10} rx={3} ry={2} fill="#FFB3C6" stroke="#4A3B45" strokeWidth={1} />
          <Ellipse cx={29} cy={10} rx={3} ry={2} fill="#FFB3C6" stroke="#4A3B45" strokeWidth={1} />
          <Circle cx={15} cy={19} r={1.6} fill="#4A3B45" />
          <Circle cx={25} cy={19} r={1.6} fill="#4A3B45" />
          <Ellipse cx={20} cy={27} rx={7} ry={4.5} fill="#FFB3C6" stroke="#4A3B45" strokeWidth={1} />
          <Circle cx={17.5} cy={27} r={1} fill="#4A3B45" />
          <Circle cx={22.5} cy={27} r={1} fill="#4A3B45" />
          <Path d="M11 33v4M29 33v4" stroke="#4A3B45" strokeWidth={2.2} strokeLinecap="round" />
        </G>
      );
    case 'cerdo':
      return (
        <G>
          <Path d="M9 12l3-5 4 4M31 12l-3-5-4 4" fill="#FFB3C6" stroke="#D6336C" strokeWidth={1.2} strokeLinejoin="round" />
          <Circle cx={20} cy={22} r={13} fill="#FFB3C6" stroke="#D6336C" strokeWidth={1.3} />
          <Circle cx={15} cy={19} r={1.6} fill="#4A3B45" />
          <Circle cx={25} cy={19} r={1.6} fill="#4A3B45" />
          <Ellipse cx={20} cy={26} rx={5} ry={3.5} fill="#FF8FAA" stroke="#D6336C" strokeWidth={1.1} />
          <Circle cx={18} cy={26} r={1} fill="#4A3B45" />
          <Circle cx={22} cy={26} r={1} fill="#4A3B45" />
          <Path d="M32 24c3 0 3 3 1 4" fill="none" stroke="#D6336C" strokeWidth={1.4} strokeLinecap="round" />
        </G>
      );
    case 'gota':
      return <Path d="M20 4C14 14 10 19 10 25a10 10 0 0 0 20 0c0-6-4-11-10-21z" fill={c1} opacity={0.75} />;
    case 'paraguas':
      return (
        <G>
          <Path d="M3 22C5 10 12 5 20 5s15 5 17 17c-3-3-6-3-8.5 0-2.5-3-5.5-3-8.5 0-3-3-6-3-8.5 0C9 19 6 19 3 22z" fill={c1} stroke="#4A3B45" strokeWidth={1.2} strokeLinejoin="round" />
          <Path d="M20 22v11a3 3 0 0 1-6 0" fill="none" stroke="#4A3B45" strokeWidth={1.6} strokeLinecap="round" />
        </G>
      );
    case 'lana':
      return (
        <G>
          <Path d="M31 27c4.2 2.2 5 6.2 3 9.4" fill="none" stroke={c1} strokeWidth={2.2} strokeLinecap="round" />
          <Circle cx={19} cy={20} r={13} fill={c1} stroke="#4A3B45" strokeWidth={1.2} />
          <G fill="none" stroke={c2} strokeWidth={1.5} strokeLinecap="round">
            <Path d="M8 14c7 1.6 13.5 8 15.5 15.6" />
            <Path d="M8.5 25.5c3.6-8.4 10-12.6 16.6-13.4" />
            <Path d="M14 31.2c1.4-8.6 6-13.4 13.6-15.2" />
          </G>
        </G>
      );
  }
}
