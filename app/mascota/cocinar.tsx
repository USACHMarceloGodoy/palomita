// Cocinar una receta paso a paso. Cada paso da un puntaje → medalla; la
// medalla final es el promedio. Si algo se quema, Palomita lo arregla
// (el paso queda en bronce) y la receta sigue.
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Pantalla } from '@/components/Pantalla';
import { Texto } from '@/components/Texto';
import { BotonKawaii } from '@/components/BotonKawaii';
import { Mascota } from '@/components/Mascota';
import { Particulas } from '@/components/Particulas';
import { Cabecera } from '@/components/mascota/Cabecera';
import { IconoItem } from '@/components/mascota/IconosMascota';
import { PasoJuego } from '@/components/mascota/PasosCocina';
import { cocinar } from '@/lib/mascota-virtual/acciones';
import { item, RECETAS } from '@/lib/mascota-virtual/catalogo';
import type { Item, Medalla } from '@/lib/mascota-virtual/tipos';
import { useMascota } from '@/lib/mascota-virtual/useMascota';
import { colores, sombras } from '@/lib/tema';

const NOMBRE_PASO = { cortar: 'Cortar', picar: 'Picar', mezclar: 'Mezclar', voltear: 'Voltear', fuego: 'Fuego', verter: 'Verter', emplatar: 'Emplatar' } as const;
const medallaDe = (p: number): Medalla => (p >= 85 ? 'oro' : p >= 60 ? 'plata' : 'bronce');
const NOMBRE_MEDALLA: Record<Medalla, string> = { oro: 'Oro', plata: 'Plata', bronce: 'Bronce' };

export default function Cocinar() {
  const { receta: id } = useLocalSearchParams<{ receta?: string }>();
  const router = useRouter();
  const { rol, recargar } = useMascota();
  const receta = RECETAS.find((r) => r.id === id);
  const [paso, setPaso] = useState(0);
  const [puntajes, setPuntajes] = useState<number[]>([]);
  const [transicion, setTransicion] = useState<{ puntaje: number; quemado: boolean } | null>(null);
  const [fin, setFin] = useState<{ medalla: Medalla; besitos: number; plato?: Item } | null>(null);
  const [festejo, setFestejo] = useState(false);

  if (!receta) return <Pantalla fondo={colores.rosaBase}><Cabecera titulo="Cocina" /><Texto variante="apoyo">No encuentro esa receta.</Texto></Pantalla>;

  async function terminarPaso(p: number, quemado?: boolean) {
    const puntaje = quemado ? 25 : p;
    const nuevos = [...puntajes, puntaje];
    setPuntajes(nuevos);
    setTransicion({ puntaje, quemado: !!quemado });
    Haptics.notificationAsync(puntaje >= 85 ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning).catch(() => {});
    setTimeout(async () => {
      setTransicion(null);
      if (paso + 1 < receta!.pasos.length) { setPaso(paso + 1); return; }
      const promedio = nuevos.reduce((a, b) => a + b, 0) / nuevos.length;
      const medalla = medallaDe(promedio);
      const r = await cocinar(rol, receta!.id, medalla).catch(() => ({ ok: false, besitos: 0 } as { ok: boolean; besitos: number; plato?: Item }));
      setFin({ medalla, besitos: r.besitos, plato: r.plato ?? item(receta!.resultado) });
      setFestejo(true); setTimeout(() => setFestejo(false), 2500);
      recargar();
    }, quemado ? 1800 : 1100);
  }

  const actual = receta.pasos[paso];

  return (
    <Pantalla fondo={colores.rosaBase} scroll={!!fin}>
      {festejo ? <Particulas tipo="comida" densidad={16} duracion={2200} /> : null}
      <Cabecera titulo={receta.nombre} subtitulo={fin ? 'Lista' : `Paso ${paso + 1} de ${receta.pasos.length} · ${NOMBRE_PASO[actual.tipo]}`} />

      <View style={{ flexDirection: 'row', gap: 6 }}>
        {receta.pasos.map((p, i) => (
          <View key={i} style={[estilos.punto, i < puntajes.length && { backgroundColor: puntajes[i] >= 85 ? colores.amarillo : puntajes[i] >= 60 ? '#D9D9E0' : '#D9A066' }, i === paso && !fin && { borderColor: colores.rosaTinta, borderWidth: 2 }]} />
        ))}
      </View>

      {fin ? (
        <Animated.View entering={FadeIn} style={estilos.tarjeta}>
          {fin.plato ? <IconoItem item={fin.plato} size={80} /> : null}
          <Texto variante="tituloGrande">{fin.plato?.nombre ?? receta.nombre}</Texto>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <IconoItem item={`medalla_${fin.medalla}`} size={40} />
            <Texto variante="titulo">Medalla de {NOMBRE_MEDALLA[fin.medalla].toLowerCase()}</Texto>
          </View>
          <Texto variante="apoyo" style={{ textAlign: 'center' }}>
            {fin.plato?.efecto ? `+${fin.plato.efecto.hambre} hambre · +${fin.plato.efecto.afecto} afecto al servirlo` : ''}{fin.besitos ? ` · +${fin.besitos} besitos` : ''}
          </Texto>
          <Texto variante="apoyo" style={{ fontSize: 12, textAlign: 'center' }}>Pasos: {puntajes.map((p) => NOMBRE_MEDALLA[medallaDe(p)]).join(' · ')}</Texto>
          <View style={{ flexDirection: 'row', gap: 10, alignSelf: 'stretch' }}>
            <BotonKawaii titulo="Otra receta" variante="secundario" style={{ flex: 1 }} onPress={() => router.back()} />
            <BotonKawaii titulo="Servirla" style={{ flex: 1 }} onPress={() => router.replace('/mascota/cuidar?modo=alimentar')} />
          </View>
        </Animated.View>
      ) : transicion ? (
        <Animated.View entering={ZoomIn} style={[estilos.tarjeta, transicion.quemado && { backgroundColor: '#FFE3EE' }]}>
          {transicion.quemado ? (
            <>
              <Mascota size={90} animo={0.9} />
              <Texto variante="titulo">Se quemó… ¡No te preocupes!</Texto>
              <Texto variante="manuscrita">Palomita lo arregla.</Texto>
            </>
          ) : (
            <>
              <IconoItem item={`medalla_${medallaDe(transicion.puntaje)}`} size={64} />
              <Texto variante="titulo">{NOMBRE_MEDALLA[medallaDe(transicion.puntaje)]} · {transicion.puntaje} pts</Texto>
              <Texto variante="apoyo">{transicion.puntaje >= 85 ? '¡Como una chef!' : transicion.puntaje >= 60 ? 'Bien, con práctica sale mejor.' : 'Bueno… comestible.'}</Texto>
            </>
          )}
        </Animated.View>
      ) : (
        <View style={{ flex: 1, gap: 10 }} key={paso}>
          <Texto variante="cuerpoBold" style={{ textAlign: 'center' }}>{actual.texto}</Texto>
          <PasoJuego paso={actual} onTerminar={terminarPaso} />
        </View>
      )}
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  punto: { flex: 1, height: 10, borderRadius: 5, backgroundColor: colores.rosaClaro },
  tarjeta: { backgroundColor: colores.crema, borderRadius: 24, padding: 18, alignItems: 'center', gap: 8, ...sombras.rosada },
});
