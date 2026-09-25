import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pantalla } from '@/components/Pantalla';
import { Tarjeta } from '@/components/Tarjeta';
import { Texto } from '@/components/Texto';
import { BotonKawaii } from '@/components/BotonKawaii';
import { Carita } from '@/components/Carita';
import { Check, Flecha } from '@/components/Iconos';
import { Particulas } from '@/components/Particulas';
import { checkinDeHoy, enviarCheckin, respuestaPara } from '@/lib/contenido';
import { ganar, RECOMPENSAS } from '@/lib/economia';
import { subirAnimo } from '@/lib/mascota';
import { colores, fuentes, radios, sombras } from '@/lib/tema';
import { EMOJIS, type Checkin, type Emoji } from '@/lib/tipos';

export default function CheckinPantalla() {
  const router = useRouter();
  const { emoji: inicial } = useLocalSearchParams<{ emoji?: Emoji }>();
  const [elegido, setElegido] = useState<Emoji | null>(inicial ?? null);
  const [texto, setTexto] = useState('');
  const [hecho, setHecho] = useState<Checkin | null>(null);
  const [respuesta, setRespuesta] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkinDeHoy().then(async (c) => {
      if (c) { setHecho(c); setRespuesta(await respuestaPara(c.emoji)); }
    }).catch(() => {});
  }, []);

  async function enviar() {
    if (!elegido) return;
    setOcupado(true);
    setError(null);
    try {
      const c = await enviarCheckin(elegido, texto);
      await ganar('checkin', RECOMPENSAS.checkin).catch(() => {});
      await subirAnimo(8, 'checkin').catch(() => {});
      setRespuesta(await respuestaPara(elegido));
      setHecho(c);
    } catch {
      setError('No se pudo enviar. ¿Hay señal? Se guarda cuando vuelva.');
    } finally {
      setOcupado(false);
    }
  }

  return (
    <Pantalla>
      {hecho ? <Particulas tipo="corazones" densidad={14} duracion={2500} /> : null}
      <View style={estilos.cabecera}>
        <Pressable onPress={() => router.back()} accessibilityLabel="Volver a Inicio" style={estilos.volver}>
          <Flecha color={colores.carbon} />
        </Pressable>
        <Texto variante="titulo" style={{ fontSize: 21 }}>Check-in de hoy</Texto>
      </View>

      {!hecho ? (
        <>
          <Tarjeta>
            <Texto variante="tituloGrande" style={{ fontSize: 28 }}>¿Cómo estuvo tu día?</Texto>
            <Texto variante="apoyo" style={{ fontSize: 16, marginBottom: 20 }}>Una sola pregunta al día. Nada más.</Texto>
            <View style={estilos.caritas}>
              {EMOJIS.map((e) => (
                <Pressable key={e} accessibilityLabel={e} onPress={() => setElegido(e)} style={[estilos.carita, elegido === e && estilos.caritaActiva]}>
                  <Carita emoji={e} size={42} />
                  <Texto variante="cuerpoBold" style={{ fontSize: 13, color: colores.gris }}>{e}</Texto>
                </Pressable>
              ))}
            </View>
          </Tarjeta>

          <Tarjeta sinSombra style={sombras.rosadaSuave}>
            <Texto variante="cuerpoBold">¿Quieres contarme algo?</Texto>
            <Texto variante="apoyo" style={{ marginBottom: 12 }}>Opcional. Puedes mandarlo vacío.</Texto>
            <TextInput
              value={texto}
              onChangeText={setTexto}
              multiline
              numberOfLines={4}
              placeholder="Escribe lo que quieras…"
              placeholderTextColor={colores.gris}
              style={estilos.area}
            />
          </Tarjeta>

          {error ? <Texto variante="apoyo" style={{ color: colores.rosaTinta, textAlign: 'center' }}>{error}</Texto> : null}
          <BotonKawaii titulo={elegido ? (ocupado ? 'Enviando…' : 'Enviar') : 'Elige una carita'} disabled={!elegido || ocupado} onPress={enviar} style={{ minHeight: 54 }} />
          <Texto variante="apoyo" style={{ textAlign: 'center' }}>Le llega a él al toque. Te da {RECOMPENSAS.checkin} besitos.</Texto>
        </>
      ) : (
        <>
          <Tarjeta>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <Carita emoji={hecho.emoji} size={46} fondo={colores.rosaBase} />
              <View>
                <Texto variante="etiqueta">Hoy dijiste</Texto>
                <Texto variante="titulo" style={{ fontSize: 22, textTransform: 'capitalize' }}>{hecho.emoji}</Texto>
              </View>
            </View>
            <Texto variante="manuscritaGrande" style={{ fontSize: 26 }}>{respuesta}</Texto>
          </Tarjeta>

          <View style={estilos.listo}>
            <Check color={colores.mentaTexto} />
            <Texto variante="cuerpoBold" style={{ color: colores.mentaTexto }}>Ya le llegó a él · +{RECOMPENSAS.checkin} besitos</Texto>
          </View>

          <Pressable onPress={() => router.replace('/(tabs)/ayuda')} style={estilos.enlaceBotiquin}>
            <Texto variante="cuerpoBold">¿Quieres abrir el botiquín?</Texto>
            <Flecha color={colores.rosaTinta} dir="der" />
          </Pressable>
        </>
      )}
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  cabecera: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  volver: { width: 44, height: 44, borderRadius: radios.boton, backgroundColor: colores.crema, alignItems: 'center', justifyContent: 'center', ...sombras.rosadaSuave },
  caritas: { flexDirection: 'row', justifyContent: 'space-between', gap: 6 },
  carita: { alignItems: 'center', gap: 6, width: 60, minHeight: 86, paddingVertical: 10, borderRadius: 22, borderWidth: 2, borderColor: colores.rosaClaro },
  caritaActiva: { backgroundColor: colores.rosaBase, borderColor: colores.rosaTinta },
  area: { minHeight: 110, padding: 14, borderRadius: 20, borderWidth: 2, borderColor: colores.rosaClaro, backgroundColor: colores.cremaClaro, color: colores.carbon, fontFamily: fuentes.cuerpo, fontSize: 16, textAlignVertical: 'top' },
  listo: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 24, backgroundColor: colores.menta },
  enlaceBotiquin: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, borderRadius: 24, backgroundColor: colores.crema, borderWidth: 2, borderColor: colores.rosaClaro },
});
