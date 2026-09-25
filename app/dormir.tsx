import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useKeepAwake } from 'expo-keep-awake';
import { Texto } from '@/components/Texto';
import { Flecha } from '@/components/Iconos';
import { Mascota } from '@/components/Mascota';
import { cuentos, marcarCuentoEscuchado } from '@/lib/contenido';
import { urlFirmada } from '@/lib/supabase';
import { colores } from '@/lib/tema';
import type { Cuento } from '@/lib/tipos';

// Modo dormir: audios tuyos leyéndole, con temporizador que se apaga solo.
// Ella elige qué escuchar esa noche:
//   · Un cuento suelto  → suena en bucle hasta que se acaba el temporizador.
//   · Una serie (novela por capítulos) → arranca en el capítulo que sigue y
//     va encadenando los siguientes sola, sin repetir el mismo.
// El "dónde quedó" sale de cuentos.escuchado_en, que se marca al ponerlo.
const TIEMPOS = [10, 20, 30];

export default function Dormir() {
  useKeepAwake();
  const router = useRouter();
  const [lista, setLista] = useState<Cuento[]>([]);
  const [cola, setCola] = useState<Cuento[]>([]);
  const [indice, setIndice] = useState(0);
  const [uri, setUri] = useState<string | null>(null);
  const [minutos, setMinutos] = useState(20);
  const [restante, setRestante] = useState<number | null>(null);
  const player = useAudioPlayer(uri ? { uri } : null);
  const status = useAudioPlayerStatus(player);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const sonando = useRef(false);

  useEffect(() => {
    cuentos().then(setLista).catch(() => {});
    return () => { if (timer.current) clearInterval(timer.current); };
  }, []);

  // Al cambiar de pista: si veníamos sonando, seguimos sin que ella toque nada.
  useEffect(() => {
    if (!uri || !sonando.current) return;
    player.loop = cola.length === 1;
    player.play();
  }, [uri]);

  // Fin de un capítulo: pasa al siguiente de la serie, si queda alguno.
  useEffect(() => {
    if (!status.didJustFinish || !sonando.current) return;
    if (indice + 1 >= cola.length) return;
    const siguiente = cola[indice + 1];
    setIndice(indice + 1);
    cargarPista(siguiente);
  }, [status.didJustFinish]);

  async function cargarPista(c: Cuento) {
    const u = await urlFirmada(c.audio_path);
    setUri(u);
    marcarCuentoEscuchado(c.id).catch(() => {});
    setLista((prev) => prev.map((x) => (x.id === c.id ? { ...x, escuchado_en: new Date().toISOString() } : x)));
  }

  async function elegir(c: Cuento) {
    const nueva = c.serie
      ? lista.filter((x) => x.serie === c.serie && (x.numero ?? 0) >= (c.numero ?? 0))
      : [c];
    setCola(nueva);
    setIndice(0);
    await cargarPista(nueva[0]).catch(() => {});
  }

  function empezar() {
    if (!uri) return;
    sonando.current = true;
    player.loop = cola.length === 1;
    player.play();
    setRestante(minutos * 60);
    timer.current = setInterval(() => {
      setRestante((r) => {
        if (r === null) return null;
        if (r <= 1) { sonando.current = false; player.pause(); if (timer.current) clearInterval(timer.current); return 0; }
        return r - 1;
      });
    }, 1000);
  }

  function parar() {
    sonando.current = false;
    player.pause();
    if (timer.current) clearInterval(timer.current);
    setRestante(null);
  }

  function volverALista() {
    parar();
    setCola([]);
    setIndice(0);
    setUri(null);
  }

  const actual = cola[indice] ?? null;
  const mm = restante !== null ? `${Math.floor(restante / 60)}:${String(restante % 60).padStart(2, '0')}` : null;

  // --- Elegir qué escuchar --------------------------------------------------
  if (!actual) {
    return (
      <View style={estilos.raiz}>
        <Pressable onPress={() => router.back()} accessibilityLabel="Salir" style={estilos.volver}><Flecha color="#B9A6B2" /></Pressable>
        <ScrollView contentContainerStyle={estilos.scroll} showsVerticalScrollIndicator={false}>
          <View style={{ opacity: 0.55, alignSelf: 'center' }}><Mascota size={72} animo={0.5} /></View>
          <Texto style={estilos.titulo}>Modo dormir</Texto>
          <Texto style={estilos.texto}>
            {lista.length ? '¿Qué quieres escuchar esta noche?' : 'Todavía no hay cuentos grabados para esto.'}
          </Texto>
          <Selector lista={lista} onElegir={elegir} />
        </ScrollView>
      </View>
    );
  }

  // --- Reproducción ---------------------------------------------------------
  const enSerie = !!actual.serie && cola.length > 1;
  return (
    <View style={estilos.raiz}>
      <Pressable onPress={() => { parar(); router.back(); }} accessibilityLabel="Salir" style={estilos.volver}><Flecha color="#B9A6B2" /></Pressable>
      <View style={{ opacity: 0.55 }}><Mascota size={90} animo={0.5} /></View>
      <Texto style={estilos.titulo}>{actual.serie ?? 'Modo dormir'}</Texto>
      <Texto style={estilos.texto}>
        {actual.serie
          ? `Capítulo ${actual.numero ?? indice + 1} · ${actual.titulo}`
          : `${actual.titulo}, en bucle, hasta que se apague solo.`}
      </Texto>
      {enSerie ? (
        <Texto style={[estilos.texto, { fontSize: 13, opacity: 0.8 }]}>
          Quedan {cola.length - indice - 1} capítulos después de este. Siguen solos.
        </Texto>
      ) : null}

      {restante === null ? (
        <>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
            {TIEMPOS.map((t) => (
              <Pressable key={t} onPress={() => setMinutos(t)} style={[estilos.chip, minutos === t && estilos.chipActivo]}>
                <Texto style={[estilos.texto, minutos === t && { color: colores.carbon }]}>{t} min</Texto>
              </Pressable>
            ))}
          </View>
          <Pressable onPress={empezar} disabled={!uri} accessibilityLabel="Reproducir" style={[estilos.play, !uri && { opacity: 0.4 }]}>
            <View style={estilos.triangulo} />
          </Pressable>
          <Pressable onPress={volverALista} style={[estilos.chip, { marginTop: 18 }]}>
            <Texto style={estilos.texto}>Elegir otro</Texto>
          </Pressable>
        </>
      ) : (
        <>
          <Texto style={estilos.reloj}>{mm}</Texto>
          <Texto style={estilos.texto}>{status.playing ? 'sonando' : 'listo, buenas noches'}</Texto>
          <Pressable onPress={parar} style={[estilos.chip, { marginTop: 24 }]}><Texto style={estilos.texto}>Parar</Texto></Pressable>
        </>
      )}
    </View>
  );
}

// --- Lista de cuentos y series ---------------------------------------------
function Selector({ lista, onElegir }: { lista: Cuento[]; onElegir: (c: Cuento) => void }) {
  const series = useMemo(() => {
    const m = new Map<string, Cuento[]>();
    for (const c of lista) {
      if (!c.serie) continue;
      m.set(c.serie, [...(m.get(c.serie) ?? []), c]);
    }
    return [...m.entries()];
  }, [lista]);
  const sueltos = useMemo(() => lista.filter((c) => !c.serie), [lista]);

  return (
    <View style={{ gap: 14, marginTop: 8 }}>
      {series.map(([nombre, caps]) => {
        // Donde quedó: el primer capítulo sin escuchar. Si escuchó todos,
        // vuelve a ofrecer el primero.
        const siguiente = caps.find((c) => !c.escuchado_en) ?? caps[0];
        const escuchados = caps.filter((c) => c.escuchado_en).length;
        return (
          <View key={nombre} style={estilos.tarjeta}>
            <Texto style={estilos.nombreSerie}>{nombre}</Texto>
            <Texto style={[estilos.texto, { textAlign: 'left', fontSize: 13 }]}>
              {escuchados === 0
                ? `${caps.length} capítulos, sin empezar`
                : escuchados >= caps.length
                  ? `${caps.length} capítulos, los escuchaste todos`
                  : `Vas en ${escuchados} de ${caps.length}`}
            </Texto>
            <Pressable onPress={() => onElegir(siguiente)} style={estilos.botonSerie}>
              <Texto style={{ color: '#FFF8F0', fontSize: 15 }}>
                {escuchados === 0 ? 'Empezar' : 'Seguir'} · Cap. {siguiente.numero ?? 1} — {siguiente.titulo}
              </Texto>
            </Pressable>
            <View style={estilos.capitulos}>
              {caps.map((c) => (
                <Pressable key={c.id} onPress={() => onElegir(c)} style={[estilos.numero, c.escuchado_en && estilos.numeroVisto]}>
                  <Texto style={{ color: c.escuchado_en ? '#8E7C88' : '#E9DCE4', fontSize: 13 }}>{c.numero ?? '·'}</Texto>
                </Pressable>
              ))}
            </View>
          </View>
        );
      })}

      {sueltos.length ? (
        <View style={estilos.tarjeta}>
          <Texto style={estilos.nombreSerie}>Cuentos sueltos</Texto>
          {sueltos.map((c) => (
            <Pressable key={c.id} onPress={() => onElegir(c)} style={estilos.filaSuelto}>
              <Texto style={{ color: '#E9DCE4', fontSize: 15, flex: 1 }}>{c.titulo}</Texto>
              {c.escuchado_en ? <Texto style={{ color: '#8E7C88', fontSize: 12 }}>ya escuchado</Texto> : null}
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  raiz: { flex: 1, backgroundColor: '#1B1519', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 28 },
  scroll: { paddingTop: 70, paddingBottom: 40, gap: 12 },
  volver: { position: 'absolute', top: 54, left: 20, width: 44, height: 44, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  titulo: { fontFamily: 'Baloo2_600SemiBold', fontSize: 26, lineHeight: 32, color: '#E9DCE4', textAlign: 'center' },
  texto: { color: '#B9A6B2', fontSize: 15, textAlign: 'center' },
  chip: { minHeight: 44, paddingHorizontal: 16, borderRadius: 999, borderWidth: 1.5, borderColor: '#4A3B45', justifyContent: 'center' },
  chipActivo: { backgroundColor: '#E9DCE4', borderColor: '#E9DCE4' },
  play: { marginTop: 28, width: 92, height: 92, borderRadius: 999, backgroundColor: '#D6336C', alignItems: 'center', justifyContent: 'center' },
  triangulo: { width: 0, height: 0, marginLeft: 8, borderTopWidth: 16, borderBottomWidth: 16, borderLeftWidth: 28, borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: '#FFF8F0' },
  reloj: { fontFamily: 'Baloo2_700Bold', fontSize: 64, lineHeight: 72, color: '#E9DCE4', marginTop: 20 },
  tarjeta: { gap: 8, padding: 16, borderRadius: 20, backgroundColor: '#251E23', borderWidth: 1.5, borderColor: '#3A2F37' },
  nombreSerie: { fontFamily: 'Baloo2_600SemiBold', fontSize: 18, color: '#E9DCE4' },
  botonSerie: { minHeight: 48, justifyContent: 'center', paddingHorizontal: 14, borderRadius: 14, backgroundColor: '#D6336C' },
  capitulos: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 2 },
  numero: { width: 40, height: 40, borderRadius: 999, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#4A3B45' },
  numeroVisto: { borderColor: '#332A30', backgroundColor: '#201A1E' },
  filaSuelto: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 48, paddingVertical: 6 },
});
