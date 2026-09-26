// Decorar la casa: pared, suelo y muebles ya comprados. Vista previa en vivo.
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Pantalla } from '@/components/Pantalla';
import { Texto } from '@/components/Texto';
import { BotonKawaii } from '@/components/BotonKawaii';
import { Cabecera } from '@/components/mascota/Cabecera';
import { Habitacion } from '@/components/mascota/Habitacion';
import { IconoItem } from '@/components/mascota/IconosMascota';
import { MascotaVirtual } from '@/components/mascota/MascotaVirtual';
import { item } from '@/lib/mascota-virtual/catalogo';
import { guardarMascota } from '@/lib/mascota-virtual/datos';
import type { Decoracion, Item } from '@/lib/mascota-virtual/tipos';
import { useMascota } from '@/lib/mascota-virtual/useMascota';
import { colores, sombras } from '@/lib/tema';

export default function Decorar() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { mascota, inventario, recargar } = useMascota();
  const [deco, setDeco] = useState<Decoracion>({ pared: 'pared_rosa', suelo: 'suelo_madera', muebles: [] });
  const [guardando, setGuardando] = useState(false);

  useEffect(() => { if (mascota) setDeco(mascota.decoracion); }, [mascota?.actualizado_en]);

  const tengo = (cat: Item['categoria']) => inventario.map((i) => item(i.item_id)).filter((it): it is Item => !!it && it.categoria === cat);
  const paredes = [item('pared_rosa')!, ...tengo('pared').filter((p) => p.id !== 'pared_rosa')];
  const suelos = [item('suelo_madera')!, ...tengo('suelo').filter((p) => p.id !== 'suelo_madera')];
  const muebles = tengo('mueble');

  async function guardar() {
    if (!mascota) return;
    setGuardando(true);
    await guardarMascota({ ...mascota, decoracion: deco }).catch(() => {});
    setGuardando(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    await recargar();
    router.back();
  }

  if (!mascota) return <Pantalla fondo={colores.rosaBase}><Cabecera titulo="Decorar" /></Pantalla>;
  const ancho = Math.min(width - 40, 420);

  return (
    <Pantalla fondo={colores.rosaBase}>
      <Cabecera titulo="Decorar la casa" subtitulo="Lo que compres en la tienda aparece aquí." />
      <View style={{ alignSelf: 'center', ...sombras.rosada }}>
        <Habitacion decoracion={deco} ancho={ancho}>
          <MascotaVirtual especie={mascota.especie} orejas={mascota.orejas} hocico={mascota.hocico} c1={mascota.color_pelaje} c2={mascota.color_secundario} look={mascota.look} size={ancho * 0.4} quieta />
        </Habitacion>
      </View>

      <Grupo titulo="Pared">
        {paredes.map((p) => <Celda key={p.id} it={p} activa={deco.pared === p.id} onPress={() => setDeco((d) => ({ ...d, pared: p.id }))} />)}
      </Grupo>
      <Grupo titulo="Suelo">
        {suelos.map((p) => <Celda key={p.id} it={p} activa={deco.suelo === p.id} onPress={() => setDeco((d) => ({ ...d, suelo: p.id }))} />)}
      </Grupo>
      <Grupo titulo="Muebles">
        {muebles.map((p) => (
          <Celda key={p.id} it={p} activa={deco.muebles.includes(p.id)} onPress={() => setDeco((d) => ({ ...d, muebles: d.muebles.includes(p.id) ? d.muebles.filter((m) => m !== p.id) : [...d.muebles, p.id] }))} />
        ))}
        {muebles.length === 0 ? <Texto variante="apoyo">Todavía no hay muebles. En la tienda, pestaña Casa.</Texto> : null}
      </Grupo>

      <BotonKawaii titulo="Guardar" onPress={guardar} disabled={guardando} />
    </Pantalla>
  );
}

function Grupo({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 8 }}>
      <Texto variante="etiqueta">{titulo}</Texto>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>{children}</View>
    </View>
  );
}

function Celda({ it, activa, onPress }: { it: Item; activa: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={it.nombre} accessibilityState={{ selected: activa }} style={[estilos.celda, activa && { borderColor: colores.rosaTinta }]}>
      <IconoItem item={it} size={44} />
      <Texto variante="apoyo" style={{ fontSize: 11 }} numberOfLines={1}>{it.nombre}</Texto>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  celda: { width: 80, height: 84, borderRadius: 16, backgroundColor: colores.crema, borderWidth: 2.5, borderColor: 'transparent', alignItems: 'center', justifyContent: 'center', gap: 4, padding: 6, ...sombras.rosadaSuave },
});
