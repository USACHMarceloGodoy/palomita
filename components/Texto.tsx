import { Text, type TextProps, StyleSheet } from 'react-native';
import { colores, fuentes } from '@/lib/tema';

type Variante = 'titulo' | 'tituloGrande' | 'cuerpo' | 'cuerpoBold' | 'apoyo' | 'etiqueta' | 'manuscrita' | 'manuscritaGrande';

export function Texto({ variante = 'cuerpo', style, ...rest }: TextProps & { variante?: Variante }) {
  return <Text {...rest} style={[estilos.base, estilos[variante], style]} />;
}

const estilos = StyleSheet.create({
  base: { color: colores.carbon, fontFamily: fuentes.cuerpo, fontSize: 16, lineHeight: 22 },
  titulo: { fontFamily: fuentes.titulo, fontSize: 19, lineHeight: 24 },
  tituloGrande: { fontFamily: fuentes.titulo, fontSize: 27, lineHeight: 32 },
  cuerpo: {},
  cuerpoBold: { fontFamily: fuentes.cuerpoBold },
  apoyo: { fontSize: 14, lineHeight: 19, color: colores.gris },
  etiqueta: { fontFamily: fuentes.cuerpoBold, fontSize: 12, lineHeight: 16, letterSpacing: 1.2, textTransform: 'uppercase', color: colores.gris },
  manuscrita: { fontFamily: fuentes.manuscrita, fontSize: 21, lineHeight: 24, color: colores.rosaTinta },
  manuscritaGrande: { fontFamily: fuentes.manuscrita, fontSize: 27, lineHeight: 34 },
});
