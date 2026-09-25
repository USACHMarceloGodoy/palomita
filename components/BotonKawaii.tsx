import { Pressable, StyleSheet, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Texto } from './Texto';
import { colores, radios } from '@/lib/tema';

type Props = Omit<PressableProps, 'style'> & {
  titulo?: string;
  variante?: 'primario' | 'secundario' | 'fantasma';
  color?: string;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Cada toque devuelve algo: escala + vibración corta.
export function BotonKawaii({ titulo, variante = 'primario', color = colores.rosaTinta, style, children, onPress, disabled, ...rest }: Props) {
  const escala = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: escala.value }] }));

  const fondo = variante === 'primario' ? color : variante === 'secundario' ? colores.rosaBase : 'transparent';
  const texto = variante === 'primario' ? colores.crema : color;

  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      accessibilityRole="button"
      onPressIn={() => { escala.value = withSpring(0.96, { damping: 14 }); }}
      onPressOut={() => { escala.value = withSpring(1, { damping: 12 }); }}
      onPress={(e) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        onPress?.(e);
      }}
      style={[estilos.boton, { backgroundColor: fondo, opacity: disabled ? 0.55 : 1 }, anim, style]}
    >
      {children ?? <Texto variante="cuerpoBold" style={{ color: texto, fontSize: 16 }}>{titulo}</Texto>}
    </AnimatedPressable>
  );
}

const estilos = StyleSheet.create({
  boton: {
    minHeight: 48,
    paddingHorizontal: 20,
    borderRadius: radios.boton,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
});
