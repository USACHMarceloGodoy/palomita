import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Pantalla } from '@/components/Pantalla';
import { Tarjeta } from '@/components/Tarjeta';
import { Texto } from '@/components/Texto';
import { Flecha } from '@/components/Iconos';
import { Figura } from '@/components/Figuras';
import { capitulos, marcarCapituloLeido } from '@/lib/sorpresas';
import { colores, radios } from '@/lib/tema';
import type { Capitulo } from '@/lib/tipos';

// Una historia con ustedes dos de protagonistas. Un capítulo por semana, con cliffhanger.
export default function KDrama() {
  const router = useRouter();
  const [lista, setLista] = useState<Capitulo[]>([]);
  const [abierto, setAbierto] = useState<Capitulo | null>(null);

  useEffect(() => { capitulos().then(setLista).catch(() => {}); }, []);

  function abrir(c: Capitulo) {
    setAbierto(c);
    if (!c.leido_en) marcarCapituloLeido(c.id).catch(() => {});
  }

  return (
    <Pantalla fondo="#E8EEF5">
      <View style={estilos.cabecera}>
        <Pressable onPress={() => (abierto ? setAbierto(null) : router.back())} accessibilityLabel="Volver" style={estilos.volver}><Flecha color={colores.carbon} /></Pressable>
        <View style={{ flex: 1 }}>
          <Texto variante="titulo" style={{ fontSize: 21 }}>{abierto ? abierto.titulo : 'Nuestro drama'}</Texto>
          {!abierto ? <Texto variante="apoyo">Un capítulo por semana. Nadie sabe cómo termina.</Texto> : null}
        </View>
        <Figura forma="paraguas" c1={colores.rosaTinta} c2={colores.rosaTinta} size={36} />
      </View>

      {abierto ? (
        <Tarjeta>
          <Texto style={{ fontSize: 17, lineHeight: 27 }}>{abierto.texto}</Texto>
          <Texto variante="manuscrita" style={{ marginTop: 18, textAlign: 'right' }}>continuará…</Texto>
        </Tarjeta>
      ) : (
        <>
          {lista.map((c) => (
            <Pressable key={c.id} onPress={() => abrir(c)}>
              <Tarjeta sinSombra style={estilos.fila}>
                <View style={estilos.numero}><Texto variante="cuerpoBold" style={{ color: colores.crema }}>{c.numero}</Texto></View>
                <View style={{ flex: 1 }}>
                  <Texto variante="cuerpoBold">{c.titulo}</Texto>
                  <Texto variante="apoyo">{c.leido_en ? 'Leído' : 'Nuevo'}</Texto>
                </View>
              </Tarjeta>
            </Pressable>
          ))}
          {!lista.length ? <Tarjeta sinSombra><Texto variante="apoyo">El primer capítulo se está escribiendo.</Texto></Tarjeta> : null}
        </>
      )}
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  cabecera: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  volver: { width: 44, height: 44, borderRadius: radios.boton, backgroundColor: colores.crema, alignItems: 'center', justifyContent: 'center' },
  fila: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
  numero: { width: 40, height: 40, borderRadius: 999, backgroundColor: colores.rosaTinta, alignItems: 'center', justifyContent: 'center' },
});
