import { View, type ViewProps, StyleSheet } from 'react-native';
import { colores, radios, sombras } from '@/lib/tema';

type Props = ViewProps & { fondo?: string; sinSombra?: boolean; borde?: string };

export function Tarjeta({ fondo = colores.crema, sinSombra, borde, style, ...rest }: Props) {
  return (
    <View
      {...rest}
      style={[
        estilos.tarjeta,
        { backgroundColor: fondo },
        !sinSombra && sombras.rosada,
        borde ? { borderWidth: 1.5, borderColor: borde } : null,
        style,
      ]}
    />
  );
}

const estilos = StyleSheet.create({
  tarjeta: { borderRadius: radios.tarjeta, padding: 20 },
});
