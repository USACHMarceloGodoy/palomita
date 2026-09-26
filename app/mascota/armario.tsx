// Armario: vestir a la mascota con la ropa que ya compró. Un slot por zona;
// tocar la prenda puesta la quita.
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Pantalla } from '@/components/Pantalla';
import { Texto } from '@/components/Texto';
import { BotonKawaii } from '@/components/BotonKawaii';
import { Cabecera } from '@/components/mascota/Cabecera';
import { IconoItem } from '@/components/mascota/IconosMascota';
import { MascotaVirtual } from '@/components/mascota/MascotaVirtual';
import { item } from '@/lib/mascota-virtual/catalogo';
import { guardarMascota } from '@/lib/mascota-virtual/datos';
import { SLOTS, type Look, type SlotPrenda } from '@/lib/mascota-virtual/tipos';
import { useMascota } from '@/lib/mascota-virtual/useMascota';
import { colores, sombras } from '@/lib/tema';

const NOMBRE_SLOT: Record<SlotPrenda, string> = { cabeza: 'Cabeza', cara: 'Cara', cuello: 'Cuello', cuerpo: 'Cuerpo' };

export default function Armario() {
  const router = useRouter();
  const { mascota, inventario, recargar } = useMascota();
  const [slot, setSlot] = useState<SlotPrenda>('cabeza');
  const [look, setLook] = useState<Look>({});
  const [guardando, setGuardando] = useState(false);

  useEffect(() => { if (mascota) setLook(mascota.look ?? {}); }, [mascota?.actualizado_en]);

  const prendas = inventario.map((i) => item(i.item_id)).filter((it): it is NonNullable<typeof it> => !!it && it.categoria === 'ropa' && it.slot === slot);

  function alternar(id: string) {
    Haptics.selectionAsync().catch(() => {});
    setLook((l) => ({ ...l, [slot]: l[slot] === id ? undefined : id }));
  }

  async function guardar() {
    if (!mascota) return;
    setGuardando(true);
    const limpio: Look = {};
    for (const s of SLOTS) if (look[s]) limpio[s] = look[s];
    await guardarMascota({ ...mascota, look: limpio }).catch(() => {});
    setGuardando(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    await recargar();
    router.back();
  }

  if (!mascota) return <Pantalla fondo={colores.rosaBase}><Cabecera titulo="Armario" /></Pantalla>;

  return (
    <Pantalla fondo={colores.rosaBase}>
      <Cabecera titulo={`Vestir a ${mascota.nombre}`} />
      <View style={{ alignItems: 'center' }}>
        <MascotaVirtual especie={mascota.especie} orejas={mascota.orejas} hocico={mascota.hocico} ojos={mascota.ojos} boca={mascota.boca} c1={mascota.color_pelaje} c2={mascota.color_secundario} look={look} size={210} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {SLOTS.map((s) => (
          <Pressable key={s} onPress={() => setSlot(s)} accessibilityRole="tab" accessibilityState={{ selected: slot === s }} style={[estilos.pestana, slot === s && { backgroundColor: colores.rosaTinta }]}>
            <Texto variante="cuerpoBold" style={{ fontSize: 13, color: slot === s ? colores.crema : colores.rosaTinta }}>{NOMBRE_SLOT[s]}</Texto>
          </Pressable>
        ))}
      </ScrollView>

      <View style={estilos.fila}>
        {prendas.map((p) => {
          const puesta = look[slot] === p.id;
          return (
            <Pressable key={p.id} onPress={() => alternar(p.id)} accessibilityRole="button" accessibilityLabel={p.nombre} accessibilityState={{ selected: puesta }} style={[estilos.celda, puesta && { borderColor: colores.rosaTinta }]}>
              <IconoItem item={p} size={52} />
              <Texto variante="apoyo" style={{ fontSize: 11 }} numberOfLines={1}>{p.nombre}</Texto>
            </Pressable>
          );
        })}
        {prendas.length === 0 ? (
          <View style={{ flex: 1, gap: 8 }}>
            <Texto variante="apoyo">Nada para {NOMBRE_SLOT[slot].toLowerCase()} todavía.</Texto>
            <BotonKawaii titulo="Ver la tienda" variante="secundario" onPress={() => router.push('/mascota/tienda')} />
          </View>
        ) : null}
      </View>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <BotonKawaii titulo="Quitar todo" variante="secundario" style={{ flex: 1 }} onPress={() => setLook({})} />
        <BotonKawaii titulo="Guardar look" style={{ flex: 1 }} onPress={guardar} disabled={guardando} />
      </View>
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  pestana: { minHeight: 40, paddingHorizontal: 16, borderRadius: 999, backgroundColor: colores.crema, alignItems: 'center', justifyContent: 'center' },
  fila: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, minHeight: 90 },
  celda: { width: 84, height: 90, borderRadius: 16, backgroundColor: colores.crema, borderWidth: 2.5, borderColor: 'transparent', alignItems: 'center', justifyContent: 'center', gap: 4, padding: 6, ...sombras.rosadaSuave },
});
