import { ScrollView, StyleSheet, View, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { colores } from '@/lib/tema';
import { FondoPuntos } from './FondoPuntos';

type Props = ViewProps & { fondo?: string; scroll?: boolean; sinPadding?: boolean };

// Toda pantalla entra con escala 0.96 → 1 en 200 ms, como pide el documento.
export function Pantalla({ fondo = colores.rosaBase, scroll = true, sinPadding, children, style, ...rest }: Props) {
  const insets = useSafeAreaInsets();
  const contenido = (
    <Animated.View entering={FadeIn.duration(200)} style={[estilos.contenido, !sinPadding && estilos.padding, style]}>
      {children}
    </Animated.View>
  );
  return (
    <View {...rest} style={[estilos.raiz, { backgroundColor: fondo, paddingTop: insets.top }]}>
      <FondoPuntos />
      {scroll ? (
        <ScrollView contentContainerStyle={estilos.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {contenido}
        </ScrollView>
      ) : (
        contenido
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  raiz: { flex: 1 },
  scroll: { flexGrow: 1, paddingBottom: 24 },
  contenido: { flex: 1, gap: 14 },
  padding: { paddingHorizontal: 20, paddingTop: 16 },
});
