// Pestaña Mascota = la casa. Todo lo demás (tienda, armario, minijuegos...)
// cuelga del menú hamburguesa de la esquina inferior derecha. Cuidarla
// (acariciar, alimentar, bañar) abre una pantalla con gestos.
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Pantalla } from '@/components/Pantalla';
import { Tarjeta } from '@/components/Tarjeta';
import { Texto } from '@/components/Texto';
import { Corazon } from '@/components/Iconos';
import { Particulas, type TipoParticula } from '@/components/Particulas';
import { Barras } from '@/components/mascota/Barras';
import { Habitacion } from '@/components/mascota/Habitacion';
import { IconoUI } from '@/components/mascota/IconosMascota';
import { MascotaVirtual } from '@/components/mascota/MascotaVirtual';
import { MenuMascota } from '@/components/mascota/MenuMascota';
import { SelectorHabitacion } from '@/components/mascota/SelectorHabitacion';
import { abrirRegalo, regalosNuevos } from '@/lib/mascota-virtual/acciones';
import { item } from '@/lib/mascota-virtual/catalogo';
import { momentoDia, NOMBRE_TEMPORADA, temporada } from '@/lib/mascota-virtual/tiempo';
import type { Regalo } from '@/lib/mascota-virtual/tipos';
import { useMascota } from '@/lib/mascota-virtual/useMascota';
import { colores, radios, sombras } from '@/lib/tema';

export default function PantallaMascota() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { rol, mascota, valores, animo, saldo, cargando, recargar } = useMascota();
  const [festejo, setFestejo] = useState<TipoParticula | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [regalos, setRegalos] = useState<Regalo[]>([]);
  const [hab, setHab] = useState(0);

  useEffect(() => {
    if (!cargando && !mascota) router.replace('/mascota/personalizar?nueva=1');
  }, [cargando, mascota]);

  useEffect(() => { regalosNuevos(rol).then(setRegalos).catch(() => {}); }, [rol, cargando]);

  function celebrar(tipo: TipoParticula, texto: string) {
    setFestejo(tipo); setAviso(texto);
    setTimeout(() => { setFestejo(null); setAviso(null); }, 2600);
  }

  async function abrir(r: Regalo) {
    await abrirRegalo(rol, r).catch(() => {});
    setRegalos((l) => l.filter((x) => x.id !== r.id));
    celebrar('kawaii', `Regalo de tu pareja: ${item(r.item_id)?.nombre ?? 'algo lindo'}`);
    recargar();
  }

  const anchoCasa = Math.min(width - 40, 420);
  const evento = temporada();
  const noche = momentoDia() === 'noche';

  if (!mascota) return <Pantalla fondo={colores.rosaBase} />;
  const habitaciones = mascota.decoracion.habitaciones;
  const habitacion = habitaciones[Math.min(hab, habitaciones.length - 1)];

  return (
    <View style={{ flex: 1 }}>
      <Pantalla fondo={colores.rosaBase}>
        {festejo ? <Particulas tipo={festejo} densidad={16} duracion={2200} /> : null}

        <View style={estilos.cabecera}>
          <View style={{ flex: 1 }}>
            <Texto variante="tituloGrande">{mascota.nombre}</Texto>
            <Texto variante="apoyo">{animo.frase}{evento ? ` · ${NOMBRE_TEMPORADA[evento]}` : ''}</Texto>
          </View>
          <View style={estilos.saldo} accessibilityLabel={`${saldo} besitos`}>
            <Corazon color={colores.rosaTinta} fill={colores.rosaFuerte} size={18} />
            <Texto variante="cuerpoBold" style={{ color: colores.rosaTinta }}>{saldo}</Texto>
          </View>
        </View>

        {aviso ? <View style={estilos.aviso}><Texto variante="cuerpoBold" style={{ color: colores.crema }}>{aviso}</Texto></View> : null}

        <SelectorHabitacion habitaciones={habitaciones} actual={Math.min(hab, habitaciones.length - 1)} onCambiar={setHab} />
        <View style={{ alignSelf: 'center', ...sombras.rosada }}>
          <Habitacion habitacion={habitacion} ancho={anchoCasa}>
            <Pressable onPress={() => router.push('/mascota/cuidar?modo=acariciar')} accessibilityRole="button" accessibilityLabel={`Acariciar a ${mascota.nombre}`}>
              <MascotaVirtual
                especie={mascota.especie} orejas={mascota.orejas} hocico={mascota.hocico} ojos={mascota.ojos} boca={mascota.boca}
                c1={mascota.color_pelaje} c2={mascota.color_secundario} look={mascota.look}
                animo={animo.animo01} size={anchoCasa * 0.4} durmiendo={noche && valores.afecto > 30}
              />
            </Pressable>
          </Habitacion>
        </View>

        {regalos.length ? (
          <Tarjeta fondo={colores.rosaSuave} borde={colores.rosaClaro} sinSombra style={{ padding: 14, gap: 8 }}>
            <Texto variante="cuerpoBold">Tu pareja te dejó {regalos.length === 1 ? 'un regalo' : `${regalos.length} regalos`}</Texto>
            {regalos.map((r) => (
              <Pressable key={r.id} onPress={() => abrir(r)} style={estilos.regalo} accessibilityRole="button">
                <IconoUI clave="regalo" color={colores.rosaTinta} />
                <View style={{ flex: 1 }}>
                  <Texto variante="cuerpoBold" style={{ fontSize: 14 }}>{item(r.item_id)?.nombre ?? 'Regalo'}</Texto>
                  {r.mensaje ? <Texto variante="apoyo" style={{ fontSize: 13 }}>{r.mensaje}</Texto> : null}
                </View>
                <Texto variante="cuerpoBold" style={{ color: colores.rosaTinta, fontSize: 13 }}>Abrir</Texto>
              </Pressable>
            ))}
          </Tarjeta>
        ) : null}

        <Tarjeta fondo={colores.crema} sinSombra>
          <Barras valores={valores} />
        </Tarjeta>

        <View style={estilos.acciones}>
          <Accion clave="alimentar" titulo="Alimentar" onPress={() => router.push('/mascota/cuidar?modo=alimentar')} destacada={valores.hambre < 30} />
          <Accion clave="banar" titulo="Bañar" onPress={() => router.push('/mascota/cuidar?modo=banar')} destacada={valores.higiene < 30} />
          <Accion clave="acariciar" titulo="Acariciar" onPress={() => router.push('/mascota/cuidar?modo=acariciar')} destacada={valores.afecto < 30} />
          <Accion clave="vestir" titulo="Vestir" onPress={() => router.push('/mascota/armario')} />
        </View>
        <Texto variante="apoyo" style={{ textAlign: 'center', fontSize: 13 }}>Acariciar es pasar el dedo; alimentar, arrastrar la comida; bañar, jabón y manguera.</Texto>
        <View style={{ height: 70 }} />
      </Pantalla>

      <MenuMascota avisos={regalos.length ? { visita: String(regalos.length) } : {}} />
    </View>
  );
}

function Accion({ clave, titulo, onPress, destacada }: { clave: 'alimentar' | 'banar' | 'acariciar' | 'vestir'; titulo: string; onPress: () => void; destacada?: boolean }) {
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
  cabecera: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  saldo: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44, paddingHorizontal: 14, borderRadius: radios.boton, backgroundColor: colores.crema, ...sombras.rosadaSuave },
  aviso: { alignSelf: 'center', paddingVertical: 8, paddingHorizontal: 18, borderRadius: 999, backgroundColor: colores.rosaTinta },
  acciones: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 4 },
  botonAccion: { width: 56, height: 56, borderRadius: 18, backgroundColor: colores.crema, alignItems: 'center', justifyContent: 'center', ...sombras.rosadaSuave },
  regalo: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colores.crema, borderRadius: 16, padding: 12, minHeight: 48 },
});
