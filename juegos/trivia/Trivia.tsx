import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Texto } from '@/components/Texto';
import { BotonKawaii } from '@/components/BotonKawaii';
import { cerrarRonda, rondaDeHoy, rondaHecha } from '@/lib/juegos';
import { RECOMPENSAS } from '@/lib/economia';
import { colores, radios } from '@/lib/tema';
import type { Pregunta } from '@/lib/tipos';

// Cinco preguntas por ronda, una ronda al día. Cinco correctas → foto inédita + besitos.
export function Trivia({ onTerminar }: { onTerminar: (correctas: number) => void }) {
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [i, setI] = useState(0);
  const [elegida, setElegida] = useState<number | null>(null);
  const [correctas, setCorrectas] = useState(0);
  const [hecha, setHecha] = useState<number | null>(null);
  const [fin, setFin] = useState(false);

  useEffect(() => {
    rondaHecha().then(setHecha);
    rondaDeHoy().then(setPreguntas).catch(() => {});
  }, []);

  if (hecha !== null) {
    return (
      <View style={{ gap: 8 }}>
        <Texto variante="cuerpoBold">Hoy ya jugaste: {hecha} de 5.</Texto>
        <Texto variante="apoyo">Mañana hay otra ronda. Las preguntas cambian con la fecha.</Texto>
      </View>
    );
  }
  if (!preguntas.length) return <Texto variante="apoyo">Todavía no hay preguntas. Él tiene que escribirlas.</Texto>;

  const p = preguntas[i];

  function responder(idx: number) {
    if (elegida !== null) return;
    setElegida(idx);
    const ok = idx === p.correcta;
    if (ok) setCorrectas((c) => c + 1);
    Haptics.notificationAsync(ok ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error).catch(() => {});
  }

  async function siguiente() {
    if (i + 1 < preguntas.length) { setI(i + 1); setElegida(null); return; }
    setFin(true);
    await cerrarRonda(correctas);
    onTerminar(correctas);
  }

  if (fin) {
    return (
      <View style={{ gap: 8 }}>
        <Texto variante="titulo">{correctas} de {preguntas.length}</Texto>
        <Texto variante="apoyo">
          {correctas === 5 ? `Racha perfecta: +${RECOMPENSAS.trivia5} besitos y una foto inédita te espera en el Tesoro.` : correctas >= 3 ? `Bien. +${Math.round(RECOMPENSAS.trivia5 / 2)} besitos.` : 'Mañana te va mejor. Él igual te quiere.'}
        </Texto>
      </View>
    );
  }

  return (
    <View style={{ gap: 10 }}>
      <Texto variante="etiqueta">Pregunta {i + 1} de {preguntas.length}</Texto>
      <Texto variante="titulo">{p.pregunta}</Texto>
      {p.opciones.map((op, idx) => {
        const estado = elegida === null ? 'neutro' : idx === p.correcta ? 'ok' : idx === elegida ? 'mal' : 'neutro';
        return (
          <Pressable key={idx} onPress={() => responder(idx)} style={[estilos.opcion, estado === 'ok' && estilos.ok, estado === 'mal' && estilos.mal]}>
            <Texto variante="cuerpoBold">{op}</Texto>
          </Pressable>
        );
      })}
      {elegida !== null ? <BotonKawaii titulo={i + 1 < preguntas.length ? 'Siguiente' : 'Terminar'} onPress={siguiente} /> : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  opcion: { minHeight: 48, justifyContent: 'center', paddingHorizontal: 16, borderRadius: radios.tarjetaChica, backgroundColor: colores.cremaClaro, borderWidth: 2, borderColor: colores.rosaClaro },
  ok: { backgroundColor: colores.menta, borderColor: colores.mentaTexto },
  mal: { backgroundColor: colores.rosaSuave, borderColor: colores.rosaTinta },
});
