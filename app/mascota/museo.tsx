// Museo de Sócrates, el búho curador: todo lo pescado, encontrado o comprado
// (peces, insectos, fósiles, arte) se dona una vez y queda en exhibición.
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Pantalla } from '@/components/Pantalla';
import { Texto } from '@/components/Texto';
import { Cabecera } from '@/components/mascota/Cabecera';
import { IconoItem, IconoUI } from '@/components/mascota/IconosMascota';
import { donar, vender } from '@/lib/mascota-virtual/acciones';
import { ESTRELLAS, item, itemsDe } from '@/lib/mascota-virtual/catalogo';
import { donacionesDe } from '@/lib/mascota-virtual/datos';
import type { CategoriaMuseo, Item } from '@/lib/mascota-virtual/tipos';
import { useMascota } from '@/lib/mascota-virtual/useMascota';
import { colores, sombras } from '@/lib/tema';

const SALAS: { id: CategoriaMuseo; titulo: string }[] = [
  { id: 'pez', titulo: 'Peces' }, { id: 'insecto', titulo: 'Insectos' }, { id: 'fosil', titulo: 'Fósiles' }, { id: 'arte', titulo: 'Arte' },
];
const FRASES = [
  'Todo lo que se guarda con cariño termina siendo historia.',
  'Un museo es una carta de amor al tiempo.',
  'No hay pez chico si alguien se acuerda de él.',
];

export default function Museo() {
  const { rol, saldo, inventario, recargar } = useMascota();
  const [sala, setSala] = useState<CategoriaMuseo>('pez');
  const [donados, setDonados] = useState<string[]>([]);
  const [aviso, setAviso] = useState<string | null>(null);

  const cargarDonados = () => donacionesDe(rol).then((d) => setDonados(d.map((x) => x.item_id))).catch(() => {});
  useEffect(() => { cargarDonados(); }, [rol]);

  const coleccion = itemsDe(sala).filter((i) => i.id !== 'bota');
  const total = SALAS.reduce((a, s) => a + itemsDe(s.id).filter((i) => i.id !== 'bota').length, 0);
  const pendientes = inventario
    .map((i) => ({ it: item(i.item_id), n: i.cantidad }))
    .filter((x): x is { it: Item; n: number } => !!x.it && (SALAS.some((s) => s.id === x.it!.categoria)));

  function avisar(t: string) { setAviso(t); setTimeout(() => setAviso(null), 2200); }

  async function donarItem(it: Item) {
    const r = await donar(rol, it.id).catch(() => ({ ok: false, besitos: 0, repetido: false }));
    if (!r.ok) { avisar(r.repetido ? 'Ya está en exhibición; puedes venderlo.' : 'No se pudo.'); return; }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    avisar(`Sócrates lo agradece. +${r.besitos} besitos`);
    await cargarDonados(); recargar();
  }

  async function venderItem(it: Item) {
    const b = await vender(rol, it.id).catch(() => 0);
    if (!b) { avisar('Eso no se vende.'); return; }
    avisar(`Vendido. +${b} besitos`);
    recargar();
  }

  return (
    <Pantalla fondo="#FFF8F0">
      <Cabecera titulo="Museo de Sócrates" saldo={saldo} subtitulo={`Colección: ${donados.length} / ${total}`} />
      <View style={estilos.curador}>
        <View style={estilos.buho}><IconoUI clave="buho" color="#6B4A2A" size={30} /></View>
        <Texto variante="manuscrita" style={{ flex: 1, color: '#6B4A2A' }}>{FRASES[donados.length % FRASES.length]}</Texto>
      </View>
      {aviso ? <View style={estilos.aviso}><Texto variante="cuerpoBold" style={{ color: colores.crema }}>{aviso}</Texto></View> : null}

      <View style={estilos.progreso}><View style={[estilos.barra, { width: `${total ? (donados.length / total) * 100 : 0}%` }]} /></View>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        {SALAS.map((s) => (
          <Pressable key={s.id} onPress={() => setSala(s.id)} accessibilityRole="tab" accessibilityState={{ selected: sala === s.id }} style={[estilos.pestana, sala === s.id && { backgroundColor: '#C9A66B' }]}>
            <Texto variante="cuerpoBold" style={{ fontSize: 13, color: sala === s.id ? colores.crema : '#8C6239' }}>{s.titulo}</Texto>
          </Pressable>
        ))}
      </View>

      <View style={estilos.vitrina}>
        {coleccion.map((it) => {
          const tiene = donados.includes(it.id);
          return (
            <View key={it.id} style={[estilos.celda, !tiene && { backgroundColor: '#F3ECDD' }]} accessibilityLabel={tiene ? it.nombre : 'Sin descubrir'}>
              {tiene ? <IconoItem item={it} size={38} /> : <Texto variante="tituloGrande" style={{ color: '#C9AB7B' }}>?</Texto>}
              <Texto variante="apoyo" style={{ fontSize: 10 }} numberOfLines={1}>{tiene ? it.nombre : ESTRELLAS[it.rareza ?? 1]}</Texto>
            </View>
          );
        })}
      </View>

      <Texto variante="etiqueta">Para donar o vender</Texto>
      {pendientes.length === 0 ? <Texto variante="apoyo">Nada en el bolsillo. La pesca y el árbol dan cosas; el arte se compra en la tienda.</Texto> : null}
      {pendientes.map(({ it, n }) => {
        const ya = donados.includes(it.id);
        return (
          <View key={it.id} style={estilos.fila}>
            <IconoItem item={it} size={36} />
            <View style={{ flex: 1 }}>
              <Texto variante="cuerpoBold" style={{ fontSize: 14 }}>{it.nombre} ×{n}</Texto>
              <Texto variante="apoyo" style={{ fontSize: 12 }}>{ya ? 'Ya exhibido' : `Donar: +8 besitos`}{it.venta ? ` · Vender: +${it.venta}` : ''}</Texto>
            </View>
            {!ya ? (
              <Pressable onPress={() => donarItem(it)} accessibilityRole="button" accessibilityLabel={`Donar ${it.nombre}`} style={estilos.boton}>
                <Texto variante="cuerpoBold" style={{ fontSize: 12, color: colores.crema }}>Donar</Texto>
              </Pressable>
            ) : null}
            {it.venta ? (
              <Pressable onPress={() => venderItem(it)} accessibilityRole="button" accessibilityLabel={`Vender ${it.nombre}`} style={[estilos.boton, { backgroundColor: colores.crema, borderWidth: 1.5, borderColor: '#C9A66B' }]}>
                <IconoUI clave="vender" color="#8C6239" size={18} />
              </Pressable>
            ) : null}
          </View>
        );
      })}
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  curador: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#F3ECDD', borderRadius: 20, padding: 12 },
  buho: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#E9D9BE', alignItems: 'center', justifyContent: 'center' },
  aviso: { alignSelf: 'center', paddingVertical: 8, paddingHorizontal: 18, borderRadius: 999, backgroundColor: '#8C6239' },
  progreso: { height: 8, borderRadius: 6, backgroundColor: '#EFE1C8', overflow: 'hidden' },
  barra: { height: '100%', backgroundColor: '#C9A66B', borderRadius: 6 },
  pestana: { flex: 1, minHeight: 40, borderRadius: 999, backgroundColor: colores.crema, alignItems: 'center', justifyContent: 'center' },
  vitrina: { backgroundColor: '#F3ECDD', borderRadius: 20, padding: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  celda: { width: '22%', flexGrow: 1, aspectRatio: 1, borderRadius: 12, backgroundColor: colores.crema, alignItems: 'center', justifyContent: 'center', gap: 2, borderWidth: 1, borderColor: '#E3D3B0' },
  fila: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colores.crema, borderRadius: 16, padding: 10, ...sombras.rosadaSuave },
  boton: { minHeight: 36, minWidth: 44, paddingHorizontal: 12, borderRadius: 999, backgroundColor: '#C9A66B', alignItems: 'center', justifyContent: 'center' },
});
