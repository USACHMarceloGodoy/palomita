import { StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Circle, Defs, Pattern, Rect } from 'react-native-svg';
import { colores } from '@/lib/tema';

// La trama de puntitos rosados del diseño (radial-gradient 22px en el mockup).
export function FondoPuntos({ color = colores.rosaClaro }: { color?: string }) {
  const { width, height } = useWindowDimensions();
  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <Pattern id="puntos" patternUnits="userSpaceOnUse" width={22} height={22}>
          <Circle cx={1.5} cy={1.5} r={1.4} fill={color} />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#puntos)" />
    </Svg>
  );
}
