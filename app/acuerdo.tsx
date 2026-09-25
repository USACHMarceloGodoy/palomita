import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Pantalla } from '@/components/Pantalla';
import { Tarjeta } from '@/components/Tarjeta';
import { Texto } from '@/components/Texto';
import { Flecha } from '@/components/Iconos';
import { extras } from '@/lib/sorpresas';
import { colores, fuentes, radios } from '@/lib/tema';

// El Acuerdo de Relación: cláusulas románticas tuyas, en tono de contrato.
export default function Acuerdo() {
  const router = useRouter();
  const [clausulas, setClausulas] = useState<string[]>([]);
  useEffect(() => { extras().then((e) => setClausulas(e.acuerdo)).catch(() => {}); }, []);

  return (
    <Pantalla fondo={colores.crema}>
      <View style={estilos.cabecera}>
        <Pressable onPress={() => router.back()} accessibilityLabel="Volver" style={estilos.volver}><Flecha color={colores.carbon} /></Pressable>
        <Texto variante="titulo" style={{ fontSize: 21 }}>Acuerdo de relación</Texto>
      </View>
      <Tarjeta sinSombra fondo={colores.cremaClaro} borde={colores.rosaClaro} style={{ gap: 14 }}>
        <Texto style={{ fontFamily: fuentes.tituloBold, fontSize: 20 }}>Las partes acuerdan:</Texto>
        {clausulas.map((c, i) => (
          <Texto key={i} style={{ fontSize: 16, lineHeight: 24 }}>{c}</Texto>
        ))}
        <Texto variante="manuscrita" style={{ marginTop: 10, textAlign: 'right' }}>Firmado con un besito.</Texto>
      </Tarjeta>
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  cabecera: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  volver: { width: 44, height: 44, borderRadius: radios.boton, backgroundColor: colores.rosaBase, alignItems: 'center', justifyContent: 'center' },
});
