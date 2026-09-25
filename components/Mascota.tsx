import Svg, { Circle, Ellipse, Path } from 'react-native-svg';
import { Image } from 'expo-image';
import { sprite } from '@/lib/sprites';

// Palomita: la mascota del diseño. Mismo dibujo que en Claude Design.
export function Mascota({ size = 78, animo = 0.7 }: { size?: number; animo?: number }) {
  // La boca cambia con el ánimo: triste (< 0.35), neutra, contenta.
  const png = sprite(animo < 0.35 ? 'mascota_triste' : animo < 0.6 ? 'mascota_normal' : 'mascota_feliz');
  if (png) return <Image source={png} style={{ width: size, height: size }} contentFit="contain" accessibilityLabel="Palomita" />;
  const boca = animo < 0.35 ? 'M35 35.5c1.8-2.2 4.6-2.2 6.4 0' : animo < 0.6 ? 'M34.5 34h7' : 'M35 33.5c1.8 2.2 4.6 2.2 6.4 0';
  return (
    <Svg width={size} height={size} viewBox="0 0 78 78" fill="none" accessibilityLabel="Palomita">
      <Ellipse cx={39} cy={47} rx={22} ry={19} fill="#FFF8F0" />
      <Circle cx={39} cy={28} r={15} fill="#FFF8F0" />
      <Path d="M27 45c6-6 17-7 23-2-4 10-17 13-23 2z" fill="#FFB3C6" />
      <Path d="M53 27l8 3.4-8 3.4z" fill="#FFD93D" />
      <Circle cx={34} cy={26} r={2.1} fill="#4A3B45" />
      <Circle cx={45} cy={26} r={2.1} fill="#4A3B45" />
      <Ellipse cx={29} cy={32} rx={3.4} ry={2.1} fill="#FF6F91" opacity={0.5} />
      <Ellipse cx={50} cy={32} rx={3.4} ry={2.1} fill="#FF6F91" opacity={0.5} />
      <Path d={boca} stroke="#4A3B45" strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M33 65l-3 6M46 65l3 6" stroke="#FFD93D" strokeWidth={3.2} strokeLinecap="round" />
    </Svg>
  );
}
