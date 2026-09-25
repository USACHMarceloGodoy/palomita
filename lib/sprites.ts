// Registro de sprites hechos por ti (Adobe Firefly u otro) que reemplazan los dibujos vectoriales.
// Regla: si una clave existe aquí, la app usa el PNG; si no, usa el vector de Figuras.tsx.
// Los PNG van en assets/sprites/, con fondo transparente, 512×512, misma vista (frente, 3/4).
//
// Para activar uno, descomenta la línea. Metro necesita el require estático.
import type { ImageSourcePropType } from 'react-native';

export type ClaveSprite =
  // partículas y stickers
  | 'flor' | 'rosa' | 'girasol' | 'corazon' | 'volantin' | 'lazo' | 'gatito' | 'capibara' | 'zuricata'
  | 'oveja' | 'conejito' | 'frutilla' | 'hamburguesa' | 'lana' | 'gota' | 'paraguas'
  // granja
  | 'vaca' | 'cerdo' | 'gato' | 'maceta_0' | 'maceta_1' | 'maceta_2' | 'maceta_3' | 'regadera'
  // mascota por ánimo
  | 'mascota_feliz' | 'mascota_normal' | 'mascota_triste';

export const SPRITES: Partial<Record<ClaveSprite, ImageSourcePropType>> = {
  // capibara: require('@/assets/sprites/capibara.png'),
  // vaca: require('@/assets/sprites/vaca.png'),
  // mascota_feliz: require('@/assets/sprites/mascota_feliz.png'),
};

export function sprite(clave: ClaveSprite): ImageSourcePropType | null {
  return SPRITES[clave] ?? null;
}
