// Visitar la casa de tu pareja: ver su mascota, acariciarla, darle de comer
// de tu inventario y dejarle un regalo con mensaje. Es la vida social del
// juego: son dos personas, no hace falta más.
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, TextInput, useWindowDimensions, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Pantalla } from '@/components/Pantalla';
import { Texto } from '@/components/Texto';
import { BotonKawaii } from '@/components/BotonKawaii';
import { Particulas, type TipoParticula } from '@/components/Particulas';
import { Barras } from '@/components/mascota/Barras';
import { Cabecera } from '@/components/mascota/Cabecera';
import { Habitacion } from '@/components/mascota/Habitacion';
import { SelectorHabitacion } from '@/components/mascota/SelectorHabitacion';
import { IconoItem, IconoUI } from '@/components/mascota/IconosMascota';
import { MascotaVirtual } from '@/components/mascota/MascotaVirtual';
import { acariciarVisita, alimentarVisita, regalar } from '@/lib/mascota-virtual/acciones';
import { item } from '@/lib/mascota-virtual/catalogo';
import type { Item } from '@/lib/mascota-virtual/tipos';
import { useMascota } from '@/lib/mascota-virtual/useMascota';
import { colores, fuentes, radios, sombras } from '@/lib/tema';

const REGALABLES = new Set<Item['categoria']>(['comida', 'plato', 'ropa', 'mueble', 'pared', 'suelo', 'pez', 'insecto', 'fosil', 'arte', 'ingrediente']);

export default function Visita() {
  const { width } = useWindowDimensions();
  const { rol, mascota, valores, animo, saldo, inventario, recargar } = useMascota('pareja');
  const [festejo, setFestejo] = useState<TipoParticula | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [selector, setSelector] = useState<'comida' | 'regalo' | null>(null);
  const [elegido, setElegido] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState('');
  const [caricias, setCaricias] = useState(0);
  const [hab, setHab] = useState(0);

  function celebrar(tipo: TipoParticula, texto: string) {
    setFestejo(tipo); setAviso(texto);
    setTimeout(() => { setFestejo(null); setAviso(null); }, 2600);
  }

  async function cariño() {
    const n = caricias + 1;
    setCaricias(n);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (n < 5) return;
    setCaricias(0);
    const b = await acariciarVisita(rol).catch(() => 0);
    celebrar('corazones', b ? `Le gustó. +${b} besitos por visitar` : 'Le gustó.');
    recargar();
  }

  async function dar(id: string) {
    setSelector(null);
    const ok = await alimentarVisita(rol, id).catch(() => false);
    if (!ok) return;
    celebrar('comida', `${mascota?.nombre ?? 'Su mascota'} comió feliz.`);
    recargar();
  }

  async function enviar() {
    if (!elegido) return;
    const ok = await regalar(rol, elegido, mensaje.trim() || null).catch(() => false);
    setSelector(null); setElegido(null); setMensaje('');
    if (!ok) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    celebrar('kawaii', 'Regalo enviado. Lo verá al entrar a su casa.');
    recargar();
  }

  const comida = inventario.map((i) => ({ it: item(i.item_id), n: i.cantidad })).filter((x): x is { it: Item; n: number } => !!x.it && !!x.it.efecto);
  const regalables = inventario.map((i) => ({ it: item(i.item_id), n: i.cantidad })).filter((x): x is { it: Item; n: number } => !!x.it && REGALABLES.has(x.it.categoria));
  const ancho = Math.min(width - 40, 420);

  if (!mascota) {
    return (
      <Pantalla fondo="#E1ECFF">
        <Cabecera titulo="Casa de tu pareja" saldo={saldo} />
        <Texto variante="apoyo">Todavía no creó su mascota. Cuando lo haga, aquí vas a poder visitarla, acariciarla y dejarle regalos.</Texto>
      </Pantalla>
    );
  }

  return (
    <Pantalla fondo="#E1ECFF">
      {festejo ? <Particulas tipo={festejo} densidad={14} duracion={2200} /> : null}
      <Cabecera titulo={`Casa de ${mascota.nombre}`} saldo={saldo} subtitulo={animo.frase} />
      {aviso ? <View style={estilos.aviso}><Texto variante="cuerpoBold" style={{ color: colores.crema }}>{aviso}</Texto></View> : null}

      <SelectorHabitacion habitaciones={mascota.decoracion.habitaciones} actual={Math.min(hab, mascota.decoracion.habitaciones.length - 1)} onCambiar={setHab} />
      <View style={{ alignSelf: 'center', ...sombras.rosada }}>
        <Habitacion habitacion={mascota.decoracion.habitaciones[Math.min(hab, mascota.decoracion.habitaciones.length - 1)]} ancho={ancho}>
          <Pressable onPress={cariño} accessibilityRole="button" accessibilityLabel={`Acariciar a ${mascota.nombre}`}>
            <MascotaVirtual especie={mascota.especie} orejas={mascota.orejas} hocico={mascota.hocico} ojos={mascota.ojos} boca={mascota.boca} c1={mascota.color_pelaje} c2={mascota.color_secundario} look={mascota.look} animo={animo.animo01} size={ancho * 0.42} />
          </Pressable>
        </Habitacion>
      </View>

      <View style={{ gap: 6 }}>
        <Texto variante="etiqueta">Cómo está</Texto>
        <Barras valores={valores} compactas />
      </View>

      <View style={estilos.acciones}>
        <Accion clave="acariciar" titulo={caricias ? `${5 - caricias} más` : 'Acariciar'} onPress={cariño} destacada />
        <Accion clave="alimentar" titulo="Alimentar" onPress={() => setSelector('comida')} />
        <Accion clave="regalo" titulo="Regalar" onPress={() => setSelector('regalo')} />
      </View>
      <Texto variante="apoyo" style={{ textAlign: 'center', fontSize: 12 }}>La primera visita del día da besitos. Lo que le des sale de tu inventario.</Texto>

      <Modal visible={selector !== null} transparent animationType="fade" onRequestClose={() => setSelector(null)}>
        <Pressable style={estilos.velo} onPress={() => setSelector(null)}>
          <Pressable style={estilos.hoja} onPress={() => {}}>
            <Texto variante="titulo">{selector === 'comida' ? `¿Qué le damos a ${mascota.nombre}?` : 'Elige un regalo'}</Texto>
            <View style={estilos.rejilla}>
              {(selector === 'comida' ? comida : regalables).map(({ it, n }) => (
                <Pressable
                  key={it.id}
                  onPress={() => (selector === 'comida' ? dar(it.id) : setElegido(it.id))}
                  accessibilityRole="button" accessibilityLabel={`${it.nombre}, ${n}`}
                  style={[estilos.celda, elegido === it.id && selector === 'regalo' && { borderColor: colores.rosaTinta }]}
                >
                  <IconoItem item={it} size={40} />
                  <Texto variante="apoyo" style={{ fontSize: 11 }} numberOfLines={1}>{it.nombre} ×{n}</Texto>
                </Pressable>
              ))}
              {(selector === 'comida' ? comida : regalables).length === 0 ? <Texto variante="apoyo">No tienes nada para eso ahora.</Texto> : null}
            </View>
            {selector === 'regalo' ? (
              <>
                <TextInput value={mensaje} onChangeText={setMensaje} placeholder="Un mensajito (opcional)" placeholderTextColor={colores.gris} maxLength={120} style={estilos.campo} accessibilityLabel="Mensaje del regalo" />
                <BotonKawaii titulo="Enviar regalo" onPress={enviar} disabled={!elegido} />
              </>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </Pantalla>
  );
}

function Accion({ clave, titulo, onPress, destacada }: { clave: 'alimentar' | 'acariciar' | 'regalo'; titulo: string; onPress: () => void; destacada?: boolean }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={titulo} style={{ alignItems: 'center', gap: 6 }}>
      <View style={[estilos.botonAccion, destacada && { backgroundColor: colores.rosaTinta }]}>
        <IconoUI clave={clave} color={destacada ? colores.crema : colores.rosaTinta} size={24} />
      </View>
      <Texto variante="cuerpoBold" style={{ fontSize: 12, color: colores.gris }}>{titulo}</Texto>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  aviso: { alignSelf: 'center', paddingVertical: 8, paddingHorizontal: 18, borderRadius: 999, backgroundColor: colores.rosaTinta },
  acciones: { flexDirection: 'row', justifyContent: 'space-around' },
  botonAccion: { width: 56, height: 56, borderRadius: 18, backgroundColor: colores.crema, alignItems: 'center', justifyContent: 'center', ...sombras.rosadaSuave },
  velo: { flex: 1, backgroundColor: 'rgba(74,59,69,0.35)', justifyContent: 'flex-end' },
  hoja: { backgroundColor: colores.crema, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, paddingBottom: 32, gap: 14, maxHeight: '80%' },
  rejilla: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  celda: { width: '22%', flexGrow: 1, backgroundColor: colores.rosaSuave, borderRadius: 14, padding: 8, alignItems: 'center', gap: 2, borderWidth: 2, borderColor: 'transparent' },
  campo: { backgroundColor: colores.rosaSuave, borderRadius: radios.tarjetaChica, paddingHorizontal: 14, minHeight: 48, fontFamily: fuentes.cuerpoSemi, fontSize: 15, color: colores.carbon },
});
