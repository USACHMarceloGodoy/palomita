import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Pantalla } from '@/components/Pantalla';
import { Tarjeta } from '@/components/Tarjeta';
import { Texto } from '@/components/Texto';
import { Flecha } from '@/components/Iconos';
import { Tesorito } from '@/components/Tesorito';
import { diccionario } from '@/lib/sorpresas';
import { colores, fuentes, radios } from '@/lib/tema';
import type { Entrada } from '@/lib/tipos';

// Las palabras inventadas de ustedes, con definición en tono de diccionario académico.
export default function Diccionario() {
  const router = useRouter();
  const [lista, setLista] = useState<Entrada[]>([]);
  useEffect(() => { diccionario().then(setLista).catch(() => {}); }, []);

  return (
    <Pantalla fondo={colores.crema}>
      <Tesorito pantalla="diccionario" />
      <View style={estilos.cabecera}>
        <Pressable onPress={() => router.back()} accessibilityLabel="Volver" style={estilos.volver}><Flecha color={colores.carbon} /></Pressable>
        <View>
          <Texto variante="titulo" style={{ fontSize: 21 }}>Nuestro diccionario</Texto>
          <Texto variante="apoyo">{lista.length} entradas · edición no venal</Texto>
        </View>
      </View>
      {lista.map((e) => (
        <Tarjeta key={e.id} sinSombra fondo={colores.cremaClaro} borde={colores.rosaClaro}>
          <Texto style={{ fontFamily: fuentes.tituloBold, fontSize: 22, lineHeight: 28 }}>{e.palabra}</Texto>
          <Texto style={{ marginTop: 6 }}>{e.definicion}</Texto>
          {e.ejemplo ? <Texto variante="apoyo" style={{ marginTop: 6, fontStyle: 'italic' }}>{e.ejemplo}</Texto> : null}
        </Tarjeta>
      ))}
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  cabecera: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  volver: { width: 44, height: 44, borderRadius: radios.boton, backgroundColor: colores.rosaBase, alignItems: 'center', justifyContent: 'center' },
});
