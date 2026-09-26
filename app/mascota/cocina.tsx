// Cocina: combinar ingredientes de la despensa en un plato. Los platos alimentan
// más que la comida de la tienda y se pueden regalar a la mascota del otro.
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Pantalla } from '@/components/Pantalla';
import { Texto } from '@/components/Texto';
import { BotonKawaii } from '@/components/BotonKawaii';
import { Particulas } from '@/components/Particulas';
import { Cabecera } from '@/components/mascota/Cabecera';
import { IconoItem } from '@/components/mascota/IconosMascota';
import { cocinar } from '@/lib/mascota-virtual/acciones';
import { item, RECETAS } from '@/lib/mascota-virtual/catalogo';
import type { Item } from '@/lib/mascota-virtual/tipos';
import { useMascota } from '@/lib/mascota-virtual/useMascota';
import { colores, sombras } from '@/lib/tema';

export default function Cocina() {
  const router = useRouter();
  const { rol, saldo, inventario, cantidad, recargar } = useMascota();
  const [hecho, setHecho] = useState<{ plato: Item; besitos: number } | null>(null);
  const [festejo, setFestejo] = useState(false);

  const despensa = inventario.map((i) => ({ it: item(i.item_id), n: i.cantidad })).filter((x): x is { it: Item; n: number } => !!x.it && x.it.categoria === 'ingrediente');
  const platos = inventario.map((i) => ({ it: item(i.item_id), n: i.cantidad })).filter((x): x is { it: Item; n: number } => !!x.it && x.it.categoria === 'plato');

  async function preparar(recetaId: string) {
    const r = await cocinar(rol, recetaId).catch((): { ok: boolean; besitos: number; plato?: Item } => ({ ok: false, besitos: 0 }));
    if (!r.ok || !r.plato) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setHecho({ plato: r.plato, besitos: r.besitos });
    setFestejo(true); setTimeout(() => setFestejo(false), 2200);
    recargar();
  }

  return (
    <Pantalla fondo={colores.rosaBase}>
      {festejo ? <Particulas tipo="comida" densidad={14} duracion={2000} /> : null}
      <Cabecera titulo="Cocina" saldo={saldo} subtitulo="Los ingredientes se compran en la tienda o caen del árbol." />

      {hecho ? (
        <View style={estilos.resultado}>
          <IconoItem item={hecho.plato} size={64} />
          <Texto variante="titulo">{hecho.plato.nombre}, listo</Texto>
          <Texto variante="apoyo" style={{ textAlign: 'center' }}>+{hecho.plato.efecto?.hambre} hambre · +{hecho.plato.efecto?.afecto} afecto al servirlo{hecho.besitos ? ` · +${hecho.besitos} besitos` : ''}</Texto>
        </View>
      ) : null}

      <Texto variante="etiqueta">Recetas</Texto>
      {RECETAS.map((r) => {
        const puede = r.ingredientes.every((i) => cantidad(i) >= r.ingredientes.filter((x) => x === i).length);
        const plato = item(r.resultado)!;
        return (
          <View key={r.id} style={[estilos.receta, !puede && { opacity: 0.7 }]}>
            <IconoItem item={plato} size={48} />
            <View style={{ flex: 1, gap: 4 }}>
              <Texto variante="cuerpoBold">{r.nombre}</Texto>
              <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                {r.ingredientes.map((ing, k) => (
                  <View key={`${ing}${k}`} style={[estilos.ingrediente, cantidad(ing) < 1 && { backgroundColor: colores.rosaBase }]}>
                    <IconoItem item={ing} size={22} />
                    <Texto variante="apoyo" style={{ fontSize: 11 }}>{cantidad(ing)}</Texto>
                  </View>
                ))}
              </View>
            </View>
            <Pressable onPress={() => preparar(r.id)} disabled={!puede} accessibilityRole="button" accessibilityLabel={`Cocinar ${r.nombre}`} style={[estilos.cocinar, !puede && { backgroundColor: colores.rosaClaro }]}>
              <Texto variante="cuerpoBold" style={{ fontSize: 12, color: puede ? colores.crema : colores.gris }}>Cocinar</Texto>
            </Pressable>
          </View>
        );
      })}

      <Texto variante="etiqueta">Despensa</Texto>
      <View style={estilos.rejilla}>
        {despensa.map(({ it, n }) => (
          <View key={it.id} style={estilos.celda}>
            <IconoItem item={it} size={36} />
            <Texto variante="apoyo" style={{ fontSize: 11 }} numberOfLines={1}>{it.nombre} ×{n}</Texto>
          </View>
        ))}
        {despensa.length === 0 ? <Texto variante="apoyo">Vacía. La tienda tiene una pestaña de ingredientes.</Texto> : null}
      </View>
      {despensa.length === 0 ? <BotonKawaii titulo="Ir a la tienda" variante="secundario" onPress={() => router.push('/mascota/tienda')} /> : null}

      {platos.length ? (
        <>
          <Texto variante="etiqueta">Platos listos</Texto>
          <View style={estilos.rejilla}>
            {platos.map(({ it, n }) => (
              <View key={it.id} style={estilos.celda}>
                <IconoItem item={it} size={36} />
                <Texto variante="apoyo" style={{ fontSize: 11 }} numberOfLines={1}>{it.nombre} ×{n}</Texto>
              </View>
            ))}
          </View>
          <Texto variante="apoyo" style={{ fontSize: 12 }}>Se sirven desde la casa (Alimentar) o se regalan en la visita.</Texto>
        </>
      ) : null}
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  resultado: { backgroundColor: colores.crema, borderRadius: 24, padding: 18, alignItems: 'center', gap: 6, ...sombras.rosada },
  receta: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colores.crema, borderRadius: 20, padding: 12 },
  ingrediente: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: colores.menta, borderRadius: 10, paddingHorizontal: 6, paddingVertical: 3 },
  cocinar: { minHeight: 36, paddingHorizontal: 12, borderRadius: 999, backgroundColor: colores.rosaTinta, alignItems: 'center', justifyContent: 'center' },
  rejilla: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  celda: { width: '22%', flexGrow: 1, backgroundColor: colores.crema, borderRadius: 14, padding: 8, alignItems: 'center', gap: 2 },
});
