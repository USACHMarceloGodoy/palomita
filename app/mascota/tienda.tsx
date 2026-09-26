// Tienda de la mascota. Se paga con besitos. Ropa y muebles rotan cada
// semana; los ítems de temporada solo aparecen durante su evento.
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Pantalla } from '@/components/Pantalla';
import { Texto } from '@/components/Texto';
import { Cabecera } from '@/components/mascota/Cabecera';
import { IconoItem } from '@/components/mascota/IconosMascota';
import { catalogoTemporada, catalogoTienda, comprar } from '@/lib/mascota-virtual/acciones';
import { diasParaRotar, NOMBRE_TEMPORADA, temporada } from '@/lib/mascota-virtual/tiempo';
import type { CategoriaItem, Item } from '@/lib/mascota-virtual/tipos';
import { useMascota } from '@/lib/mascota-virtual/useMascota';
import { colores, sombras } from '@/lib/tema';

type Pestana = { id: string; titulo: string; categorias: CategoriaItem[] };
const PESTANAS: Pestana[] = [
  { id: 'comida', titulo: 'Comida', categorias: ['comida'] },
  { id: 'ropa', titulo: 'Ropa', categorias: ['ropa'] },
  { id: 'casa', titulo: 'Casa', categorias: ['mueble', 'pared', 'suelo'] },
  { id: 'cocina', titulo: 'Ingredientes', categorias: ['ingrediente'] },
  { id: 'arte', titulo: 'Arte', categorias: ['arte'] },
  { id: 'pesca', titulo: 'Pesca', categorias: ['cebo'] },
];
const UNICOS: CategoriaItem[] = ['ropa', 'mueble', 'pared', 'suelo', 'arte'];

export default function Tienda() {
  const { rol, saldo, cantidad, recargar } = useMascota();
  const evento = temporada();
  const [pestana, setPestana] = useState(evento ? 'temporada' : 'comida');
  const [aviso, setAviso] = useState<string | null>(null);

  const pestanas = evento ? [{ id: 'temporada', titulo: NOMBRE_TEMPORADA[evento], categorias: [] as CategoriaItem[] }, ...PESTANAS] : PESTANAS;
  const actual = pestanas.find((p) => p.id === pestana) ?? pestanas[0];
  const lista: Item[] = actual.id === 'temporada' ? catalogoTemporada() : actual.categorias.flatMap(catalogoTienda);

  async function comprarItem(it: Item) {
    const ok = await comprar(rol, it.id).catch(() => false);
    if (!ok) { avisar(`Te faltan ${Math.max(0, it.precio - saldo)} besitos.`); return; }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    avisar(`${it.nombre}: tuyo.`);
    recargar();
  }
  function avisar(t: string) { setAviso(t); setTimeout(() => setAviso(null), 2200); }

  return (
    <Pantalla fondo={colores.rosaBase}>
      <Cabecera titulo="Tienda" saldo={saldo} subtitulo={`La ropa y los muebles rotan en ${diasParaRotar()} ${diasParaRotar() === 1 ? 'día' : 'días'}.`} />
      {aviso ? <View style={estilos.aviso}><Texto variante="cuerpoBold" style={{ color: colores.crema }}>{aviso}</Texto></View> : null}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {pestanas.map((p) => (
          <Pressable key={p.id} onPress={() => setPestana(p.id)} accessibilityRole="tab" accessibilityState={{ selected: pestana === p.id }} style={[estilos.pestana, pestana === p.id && { backgroundColor: colores.rosaTinta }]}>
            <Texto variante="cuerpoBold" style={{ fontSize: 13, color: pestana === p.id ? colores.crema : colores.rosaTinta }}>{p.titulo}</Texto>
          </Pressable>
        ))}
      </ScrollView>

      <View style={estilos.rejilla}>
        {lista.map((it) => {
          const tengo = cantidad(it.id);
          const unico = UNICOS.includes(it.categoria);
          const yaLoTienes = unico && tengo > 0;
          return (
            <View key={it.id} style={[estilos.tarjeta, yaLoTienes && { opacity: 0.6 }]}>
              <View style={estilos.vitrina}><IconoItem item={it} size={54} /></View>
              <Texto variante="cuerpoBold" style={{ fontSize: 13 }} numberOfLines={1}>{it.nombre}</Texto>
              {it.efecto ? <Texto variante="apoyo" style={{ fontSize: 11 }}>+{it.efecto.hambre ?? 0} hambre{it.efecto.afecto ? ` · +${it.efecto.afecto} afecto` : ''}</Texto> : null}
              {it.descripcion ? <Texto variante="apoyo" style={{ fontSize: 11 }} numberOfLines={2}>{it.descripcion}</Texto> : null}
              {!unico && tengo > 0 ? <Texto variante="apoyo" style={{ fontSize: 11 }}>Tienes ×{tengo}</Texto> : null}
              <View style={estilos.pie}>
                <Texto variante="cuerpoBold" style={{ color: colores.rosaTinta, fontSize: 13 }}>♥ {it.precio}</Texto>
                {yaLoTienes ? (
                  <Texto variante="apoyo" style={{ fontSize: 12 }}>Ya lo tienes</Texto>
                ) : (
                  <Pressable onPress={() => comprarItem(it)} accessibilityRole="button" accessibilityLabel={`Comprar ${it.nombre}`} style={estilos.comprar}>
                    <Texto variante="cuerpoBold" style={{ fontSize: 12, color: colores.crema }}>Comprar</Texto>
                  </Pressable>
                )}
              </View>
            </View>
          );
        })}
        {lista.length === 0 ? <Texto variante="apoyo">Nada por aquí esta semana.</Texto> : null}
      </View>
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  aviso: { alignSelf: 'center', paddingVertical: 8, paddingHorizontal: 18, borderRadius: 999, backgroundColor: colores.rosaTinta },
  pestana: { minHeight: 40, paddingHorizontal: 14, borderRadius: 999, backgroundColor: colores.crema, alignItems: 'center', justifyContent: 'center' },
  rejilla: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tarjeta: { width: '47%', flexGrow: 1, backgroundColor: colores.crema, borderRadius: 20, padding: 12, gap: 4, ...sombras.rosadaSuave },
  vitrina: { height: 76, borderRadius: 14, backgroundColor: colores.rosaSuave, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  pie: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  comprar: { minHeight: 34, paddingHorizontal: 12, borderRadius: 999, backgroundColor: colores.rosaTinta, alignItems: 'center', justifyContent: 'center' },
});
