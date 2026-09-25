import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Pantalla } from '@/components/Pantalla';
import { Tarjeta } from '@/components/Tarjeta';
import { Texto } from '@/components/Texto';
import { Flecha } from '@/components/Iconos';
import { StickerFigura } from '@/components/StickerFigura';
import { album, stickers } from '@/lib/tienda';
import { colores, radios } from '@/lib/tema';
import type { ItemAlbum, Sticker } from '@/lib/tipos';

// Álbum con casillas visibles y vacías. Las vacías son lo que engancha.
export default function Album() {
  const router = useRouter();
  const [todos, setTodos] = useState<Sticker[]>([]);
  const [mios, setMios] = useState<ItemAlbum[]>([]);

  useEffect(() => {
    stickers().then(setTodos).catch(() => {});
    album().then(setMios).catch(() => {});
  }, []);

  const colecciones = [...new Set(todos.map((s) => s.coleccion))];
  const cuenta = (id: string) => mios.filter((m) => m.sticker_id === id).length;
  const tengo = new Set(mios.map((m) => m.sticker_id));

  return (
    <Pantalla fondo={colores.lavanda}>
      <View style={estilos.cabecera}>
        <Pressable onPress={() => router.back()} accessibilityLabel="Volver" style={estilos.volver}><Flecha color={colores.carbon} /></Pressable>
        <View>
          <Texto variante="titulo" style={{ fontSize: 21 }}>Álbum de stickers</Texto>
          <Texto variante="apoyo">{tengo.size} de {todos.length} distintos</Texto>
        </View>
      </View>
      {colecciones.map((col) => {
        const lista = todos.filter((s) => s.coleccion === col);
        const completa = lista.every((s) => tengo.has(s.id));
        return (
          <Tarjeta key={col} sinSombra>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Texto variante="titulo">{col}</Texto>
              <Texto variante="cuerpoBold" style={{ fontSize: 13, color: completa ? colores.mentaTexto : colores.gris }}>{completa ? 'completa' : `${lista.filter((s) => tengo.has(s.id)).length}/${lista.length}`}</Texto>
            </View>
            <View style={estilos.grilla}>
              {lista.map((s) => {
                const n = cuenta(s.id);
                return (
                  <View key={s.id} style={[estilos.casilla, s.rareza === 'epico' && estilos.epico, s.rareza === 'raro' && estilos.raro]}>
                    <StickerFigura path={s.img_path} size={48} apagado={n === 0} />
                    <Texto variante="apoyo" style={{ fontSize: 11, textAlign: 'center' }} numberOfLines={1}>{n ? s.nombre : '???'}</Texto>
                    {n > 1 ? <View style={estilos.badge}><Texto variante="cuerpoBold" style={{ fontSize: 10, color: colores.crema }}>×{n}</Texto></View> : null}
                  </View>
                );
              })}
            </View>
          </Tarjeta>
        );
      })}
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  cabecera: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  volver: { width: 44, height: 44, borderRadius: radios.boton, backgroundColor: colores.crema, alignItems: 'center', justifyContent: 'center' },
  grilla: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  casilla: { width: '30%', flexGrow: 1, alignItems: 'center', gap: 4, padding: 8, borderRadius: 16, backgroundColor: colores.cremaClaro, borderWidth: 2, borderColor: colores.rosaClaro },
  raro: { borderColor: colores.lavandaBorde },
  epico: { borderColor: colores.amarillo, backgroundColor: '#FFF3C4' },
  badge: { position: 'absolute', top: 4, right: 4, paddingHorizontal: 6, paddingVertical: 1, borderRadius: 999, backgroundColor: colores.rosaTinta },
});
