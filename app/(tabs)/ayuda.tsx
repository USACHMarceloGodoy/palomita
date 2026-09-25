import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Tesorito } from '@/components/Tesorito';
import { Flecha } from '@/components/Iconos';
import * as Haptics from 'expo-haptics';
import { Pantalla } from '@/components/Pantalla';
import { Tarjeta } from '@/components/Tarjeta';
import { Texto } from '@/components/Texto';
import { BotonKawaii } from '@/components/BotonKawaii';
import { Figura, type Forma } from '@/components/Figuras';
import { Particulas } from '@/components/Particulas';
import { botiquinAlAzar, teNecesitoAhora } from '@/lib/contenido';
import { urlFirmada } from '@/lib/supabase';
import { colores, radios, sombras } from '@/lib/tema';
import type { CategoriaBotiquin, ItemBotiquin } from '@/lib/tipos';
import { ReproductorAudio } from '@/components/ReproductorAudio';

const BOTONES: { cat: CategoriaBotiquin; titulo: string; forma: Forma; c1: string; c2: string; fondo: string }[] = [
  { cat: 'animos', titulo: 'Necesito ánimos', forma: 'flor', c1: colores.amarillo, c2: colores.amarilloOscuro, fondo: '#FFF3C4' },
  { cat: 'feliz', titulo: 'Estoy feliz', forma: 'corazon', c1: colores.rosaFuerte, c2: colores.rosaFuerte, fondo: colores.rosaSuave },
  { cat: 'logro', titulo: 'Logré algo hoy', forma: 'girasol', c1: colores.amarillo, c2: '#6B4A2A', fondo: colores.menta },
  { cat: 'extrano', titulo: 'Te extraño', forma: 'gatito', c1: colores.crema, c2: colores.carbon, fondo: colores.lavanda },
];

export default function Ayuda() {
  const router = useRouter();
  const [abierto, setAbierto] = useState<{ item: ItemBotiquin; url: string | null; titulo: string } | null>(null);
  const [alerta, setAlerta] = useState<'no' | 'enviando' | 'ok' | 'error'>('no');

  async function abrir(b: (typeof BOTONES)[number]) {
    const item = await botiquinAlAzar(b.cat);
    if (!item) { setAbierto(null); return; }
    const url = item.media_path ? await urlFirmada(item.media_path) : null;
    setAbierto({ item, url, titulo: b.titulo });
  }

  async function teNecesito() {
    setAlerta('enviando');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    try { await teNecesitoAhora(); setAlerta('ok'); } catch { setAlerta('error'); }
  }

  return (
    <Pantalla>
      <Tesorito pantalla="ayuda" />
      {abierto ? <Particulas tipo="kawaii" densidad={12} duracion={2200} /> : null}
      <Texto variante="tituloGrande">Botiquín</Texto>
      <Texto variante="apoyo">Cuatro botones. Cada uno abre algo mío, al azar.</Texto>

      <View style={estilos.grilla}>
        {BOTONES.map((b) => (
          <Pressable key={b.cat} onPress={() => abrir(b)} accessibilityRole="button" style={[estilos.grande, { backgroundColor: b.fondo }]}>
            <Figura forma={b.forma} c1={b.c1} c2={b.c2} size={44} />
            <Texto variante="cuerpoBold" style={{ textAlign: 'center' }}>{b.titulo}</Texto>
          </Pressable>
        ))}
      </View>

      {abierto ? (
        <Tarjeta>
          <Texto variante="etiqueta" style={{ marginBottom: 10 }}>{abierto.titulo}</Texto>
          {abierto.item.texto ? <Texto variante="manuscritaGrande" style={{ fontSize: 25 }}>{abierto.item.texto}</Texto> : null}
          {abierto.item.tipo === 'audio' && abierto.url ? <ReproductorAudio uri={abierto.url} /> : null}
          {abierto.item.tipo === 'video' ? <Texto variante="apoyo" style={{ marginTop: 8 }}>El video se abre en la Fase 3.</Texto> : null}
          <BotonKawaii titulo="Otro" variante="secundario" onPress={() => abrir(BOTONES.find((b) => b.cat === abierto.item.categoria)!)} style={{ marginTop: 14, alignSelf: 'flex-start' }} />
        </Tarjeta>
      ) : null}

      <Pressable onPress={() => abrir({ cat: 'animos', titulo: 'Kit de supervivencia', forma: 'flor', c1: colores.amarillo, c2: colores.amarilloOscuro, fondo: '' })}>
        <Tarjeta fondo="#2E3A2F" sinSombra style={{ gap: 6 }}>
          <Texto variante="etiqueta" style={{ color: '#9BC49F' }}>Para días de apocalipsis</Texto>
          <Texto variante="titulo" style={{ color: colores.crema }}>Kit de supervivencia</Texto>
          <Texto variante="apoyo" style={{ color: '#C9D6CA' }}>Yo te cubro la espalda. Nadie pasa de mí. Toca para abrir una provisión.</Texto>
        </Tarjeta>
      </Pressable>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Pressable onPress={() => router.push('/dormir')} style={[estilos.atajo, { backgroundColor: '#1B1519' }]}>
          <Texto variante="cuerpoBold" style={{ color: '#E9DCE4', flex: 1 }}>Modo dormir</Texto>
          <Flecha color="#B9A6B2" dir="der" size={16} />
        </Pressable>
        <Pressable onPress={() => router.push('/acuerdo')} style={[estilos.atajo, { backgroundColor: colores.crema }]}>
          <Texto variante="cuerpoBold" style={{ flex: 1 }}>Acuerdo de relación</Texto>
          <Flecha color={colores.rosaTinta} dir="der" size={16} />
        </Pressable>
      </View>

      <Tarjeta fondo={colores.carbon} sinSombra style={{ gap: 10 }}>
        <Texto variante="titulo" style={{ color: colores.crema }}>Te necesito ahora</Texto>
        <Texto variante="apoyo" style={{ color: colores.rosaClaro }}>Este no tiene contenido. Le suena fuerte a él para que te llame.</Texto>
        <BotonKawaii
          titulo={alerta === 'enviando' ? 'Avisando…' : alerta === 'ok' ? 'Ya le avisé. Ahí viene.' : alerta === 'error' ? 'No salió. Llámalo directo.' : 'Avisarle'}
          color={colores.rosaFuerte}
          disabled={alerta === 'enviando' || alerta === 'ok'}
          onPress={teNecesito}
        />
      </Tarjeta>
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  grilla: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  atajo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 52, paddingHorizontal: 14, borderRadius: 18 },
  grande: { width: '47%', flexGrow: 1, minHeight: 120, borderRadius: radios.tarjeta, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 16, ...sombras.rosadaSuave },
});
