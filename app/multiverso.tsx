import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Pantalla } from '@/components/Pantalla';
import { Tarjeta } from '@/components/Tarjeta';
import { Texto } from '@/components/Texto';
import { Flecha } from '@/components/Iconos';
import { multiverso } from '@/lib/contenido';
import { colores, radios, sombras } from '@/lib/tema';
import type { Variante } from '@/lib/tipos';

export default function MultiversoPantalla() {
  const router = useRouter();
  const [lista, setLista] = useState<Variante[]>([]);

  useEffect(() => { multiverso().then(setLista).catch(() => {}); }, []);

  const descubiertas = lista.filter((v) => v.descubierto_en).sort((a, b) => (b.descubierto_en! > a.descubierto_en! ? 1 : -1));

  return (
    <Pantalla fondo={colores.lavanda}>
      <View style={estilos.cabecera}>
        <Pressable onPress={() => router.back()} accessibilityLabel="Volver" style={estilos.volver}><Flecha color={colores.carbon} /></Pressable>
        <View>
          <Texto variante="titulo" style={{ fontSize: 21 }}>Multiverso del te amo</Texto>
          <Texto variante="apoyo">{descubiertas.length} de {lista.length} descubiertas</Texto>
        </View>
      </View>
      {descubiertas.length === 0 ? (
        <Tarjeta><Texto variante="apoyo">Todavía nada. Vuelve a Inicio y toca "Dame otra forma".</Texto></Tarjeta>
      ) : (
        descubiertas.map((v) => (
          <Tarjeta key={v.id} sinSombra style={sombras.rosadaSuave}>
            <Texto variante="etiqueta" style={{ color: colores.lavandaTexto, marginBottom: 6 }}>{v.categoria}</Texto>
            <Texto>{v.texto}</Texto>
          </Tarjeta>
        ))
      )}
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  cabecera: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  volver: { width: 44, height: 44, borderRadius: radios.boton, backgroundColor: colores.crema, alignItems: 'center', justifyContent: 'center' },
});
