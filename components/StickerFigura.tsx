import { View } from 'react-native';
import { Figura, type Forma } from './Figuras';
import { colores } from '@/lib/tema';
import { Image } from 'expo-image';
import { sprite, type ClaveSprite } from '@/lib/sprites';

// img_path = 'figura:<forma>[:c1[:c2]]' → dibujo del motor. Cualquier otra cosa se trata como imagen subida.
export function StickerFigura({ path, size = 56, apagado }: { path: string; size?: number; apagado?: boolean }) {
  const partes = path.split(':');
  if (partes[0] === 'sprite') {
    const png = sprite(partes[1] as ClaveSprite);
    if (png) return <Image source={png} style={{ width: size, height: size, opacity: apagado ? 0.18 : 1 }} contentFit="contain" />;
  }
  if (partes[0] !== 'figura') return <View style={{ width: size, height: size, borderRadius: 12, backgroundColor: colores.rosaClaro }} />;
  const forma = partes[1] as Forma;
  const c1 = partes[2]?.startsWith('#') ? partes[2] : colores.rosaFuerte;
  const c2 = partes[3]?.startsWith('#') ? partes[3] : colores.amarillo;
  return (
    <View style={{ opacity: apagado ? 0.18 : 1 }}>
      <Figura forma={forma} c1={apagado ? colores.gris : c1} c2={apagado ? colores.gris : c2} size={size} />
    </View>
  );
}
