import Svg, { Circle, Path } from 'react-native-svg';
import type { Emoji } from '@/lib/tipos';
import { colores } from '@/lib/tema';

const BOCAS: Record<Emoji, string> = {
  fatal: 'M13 26c3-4.5 7-4.5 10 0',
  mal: 'M13 25c3-2.5 7-2.5 10 0',
  normal: 'M13.5 24.5h9',
  bien: 'M13 23c3 3 7 3 10 0',
  genial: 'M12 22c4 6 8 6 12 0',
};

export const ETIQUETA_EMOJI: Record<Emoji, string> = { fatal: 'fatal', mal: 'mal', normal: 'normal', bien: 'bien', genial: 'genial' };

export function Carita({ emoji, size = 36, fondo }: { emoji: Emoji; size?: number; fondo?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      {fondo ? <Circle cx={18} cy={18} r={16} fill={fondo} stroke={colores.rosaMedio} strokeWidth={2} /> : null}
      <Circle cx={13} cy={15} r={1.7} fill={colores.carbon} />
      <Circle cx={23} cy={15} r={1.7} fill={colores.carbon} />
      <Path d={BOCAS[emoji]} stroke={colores.carbon} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}
