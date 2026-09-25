import Svg, { Circle, Path, Rect } from 'react-native-svg';

type P = { color: string; size?: number; fill?: string };
const base = (size: number) => ({ width: size, height: size, viewBox: '0 0 24 24', fill: 'none' as const });
const trazo = (color: string) => ({ stroke: color, strokeWidth: 1.9, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const });

export const Corazon = ({ color, size = 23, fill }: P) => (
  <Svg {...base(size)}>
    <Path d="M12 20.4S3.6 15.6 3.6 9.9A4.3 4.3 0 0 1 12 7.8a4.3 4.3 0 0 1 8.4 2.1c0 5.7-8.4 10.5-8.4 10.5z" {...trazo(color)} fill={fill ?? 'none'} />
  </Svg>
);

export const Baul = ({ color, size = 23 }: P) => (
  <Svg {...base(size)}>
    <Rect x={3.2} y={8} width={17.6} height={12} rx={2.6} {...trazo(color)} />
    <Path d="M3.2 12.4h17.6M6 8V6.4A2.4 2.4 0 0 1 8.4 4h7.2A2.4 2.4 0 0 1 18 6.4V8M10.8 12.4h2.4v3.2h-2.4z" {...trazo(color)} />
  </Svg>
);

export const Hoja = ({ color, size = 23 }: P) => (
  <Svg {...base(size)}>
    <Path d="M20 4c0 8.8-4.6 13.2-9.6 13.2A5.6 5.6 0 0 1 4.8 11.6C4.8 6.6 9.2 4 20 4zM4 20c2.8-4 6-6.4 9.6-8" {...trazo(color)} />
  </Svg>
);

export const Botiquin = ({ color, size = 23 }: P) => (
  <Svg {...base(size)}>
    <Rect x={3.2} y={7.2} width={17.6} height={13.2} rx={3} {...trazo(color)} />
    <Path d="M8.8 7.2V5.8A1.8 1.8 0 0 1 10.6 4h2.8a1.8 1.8 0 0 1 1.8 1.8v1.4M12 11.4v5.6M9.2 14.2h5.6" {...trazo(color)} />
  </Svg>
);

export const Regalo = ({ color, size = 23 }: P) => (
  <Svg {...base(size)}>
    <Rect x={3.6} y={9.6} width={16.8} height={10.8} rx={2.4} {...trazo(color)} />
    <Path d="M2.8 9.6h18.4M12 9.6v10.8M12 9.6S10.4 4 8 4a2.6 2.6 0 0 0 0 5.6zM12 9.6S13.6 4 16 4a2.6 2.6 0 0 1 0 5.6z" {...trazo(color)} />
  </Svg>
);

export const Flecha = ({ color, size = 20, dir = 'izq' }: P & { dir?: 'izq' | 'der' }) => (
  <Svg {...base(size)}>
    <Path d={dir === 'izq' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'} {...trazo(color)} strokeWidth={2.1} />
  </Svg>
);

export const Marcador = ({ color, size = 20 }: P) => (
  <Svg {...base(size)}>
    <Path d="M6 4h12a1 1 0 0 1 1 1v15l-7-4-7 4V5a1 1 0 0 1 1-1z" {...trazo(color)} />
  </Svg>
);

export const Burbuja = ({ color, size = 23 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 11.5c0 4.1-4 7.4-9 7.4-1 0-2-.1-2.9-.4L4 20l1.3-3.3C3.9 15.4 3 13.6 3 11.5 3 7.4 7 4.1 12 4.1s9 3.3 9 7.4z"
      stroke={color} strokeWidth={1.9} strokeLinejoin="round"
    />
    <Circle cx={8.6} cy={11.5} r={1.1} fill={color} />
    <Circle cx={12} cy={11.5} r={1.1} fill={color} />
    <Circle cx={15.4} cy={11.5} r={1.1} fill={color} />
  </Svg>
);

export const Check = ({ color, size = 24 }: P) => (
  <Svg {...base(size)}>
    <Path d="M4 12.6l5 5L20 6.6" {...trazo(color)} strokeWidth={2.2} />
  </Svg>
);
