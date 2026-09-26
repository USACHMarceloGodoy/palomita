// Cabecera de las subpantallas de la mascota: volver, título y saldo.
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Corazon, Flecha } from '@/components/Iconos';
import { Texto } from '@/components/Texto';
import { colores, radios, sombras } from '@/lib/tema';

export function Cabecera({ titulo, saldo, subtitulo }: { titulo: string; saldo?: number; subtitulo?: string }) {
  const router = useRouter();
  return (
    <View style={estilos.fila}>
      <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Volver" style={estilos.volver}>
        <Flecha color={colores.rosaTinta} />
      </Pressable>
      <View style={{ flex: 1 }}>
        <Texto variante="titulo" numberOfLines={1}>{titulo}</Texto>
        {subtitulo ? <Texto variante="apoyo" style={{ fontSize: 12, lineHeight: 16 }}>{subtitulo}</Texto> : null}
      </View>
      {saldo !== undefined ? (
        <View style={estilos.saldo} accessibilityLabel={`${saldo} besitos`}>
          <Corazon color={colores.rosaTinta} fill={colores.rosaFuerte} size={16} />
          <Texto variante="cuerpoBold" style={{ color: colores.rosaTinta, fontSize: 14 }}>{saldo}</Texto>
        </View>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  fila: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  volver: { width: 44, height: 44, borderRadius: 14, backgroundColor: colores.crema, alignItems: 'center', justifyContent: 'center', ...sombras.rosadaSuave },
  saldo: { flexDirection: 'row', alignItems: 'center', gap: 5, minHeight: 40, paddingHorizontal: 12, borderRadius: radios.boton, backgroundColor: colores.crema, ...sombras.rosadaSuave },
});
