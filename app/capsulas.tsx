import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Pantalla } from '@/components/Pantalla';
import { Tarjeta } from '@/components/Tarjeta';
import { Texto } from '@/components/Texto';
import { Flecha } from '@/components/Iconos';
import { Figura } from '@/components/Figuras';
import { Particulas } from '@/components/Particulas';
import { ReproductorAudio } from '@/components/ReproductorAudio';
import { Tesorito } from '@/components/Tesorito';
import { capsulas, marcarCapsulaAbierta } from '@/lib/sorpresas';
import { urlFirmada } from '@/lib/supabase';
import { colores, radios } from '@/lib/tema';
import type { Capsula } from '@/lib/tipos';

// Cartas y audios con fecha de apertura. Candado y cuenta regresiva hasta que llega el día.
export default function Capsulas() {
  const router = useRouter();
  const [abiertas, setAbiertas] = useState<Capsula[]>([]);
  const [proximas, setProximas] = useState<{ id: string; titulo: string; abre_en: string }[]>([]);
  const [leyendo, setLeyendo] = useState<(Capsula & { url: string | null }) | null>(null);
  const [festejo, setFestejo] = useState(false);

  useEffect(() => { capsulas().then((c) => { setAbiertas(c.abiertas); setProximas(c.proximas); }).catch(() => {}); }, []);

  async function abrir(c: Capsula) {
    const url = await urlFirmada(c.media_path);
    setLeyendo({ ...c, url });
    if (!c.abierta) { setFestejo(true); setTimeout(() => setFestejo(false), 3000); await marcarCapsulaAbierta(c.id); }
  }

  function faltan(iso: string) {
    const ms = new Date(iso).getTime() - Date.now();
    const d = Math.floor(ms / 86_400_000);
    if (d > 0) return `${d} día${d === 1 ? '' : 's'}`;
    const h = Math.floor(ms / 3_600_000);
    return h > 0 ? `${h} h` : 'hoy';
  }

  return (
    <Pantalla fondo={colores.lavanda}>
      <Tesorito pantalla="capsulas" />
      {festejo ? <Particulas tipo="corazones" densidad={16} duracion={2500} /> : null}
      <View style={estilos.cabecera}>
        <Pressable onPress={() => router.back()} accessibilityLabel="Volver" style={estilos.volver}><Flecha color={colores.carbon} /></Pressable>
        <Texto variante="titulo" style={{ fontSize: 21 }}>Cápsula del tiempo</Texto>
      </View>

      {leyendo ? (
        <Tarjeta>
          <Texto variante="etiqueta" style={{ marginBottom: 8 }}>{leyendo.titulo}</Texto>
          {leyendo.contenido ? <Texto variante="manuscritaGrande">{leyendo.contenido}</Texto> : null}
          {leyendo.url ? <ReproductorAudio uri={leyendo.url} /> : null}
        </Tarjeta>
      ) : null}

      {abiertas.map((c) => (
        <Pressable key={c.id} onPress={() => abrir(c)}>
          <Tarjeta sinSombra style={estilos.fila}>
            <Figura forma="lazo" c1={colores.rosaFuerte} c2={colores.rosaTinta} size={36} />
            <View style={{ flex: 1 }}>
              <Texto variante="cuerpoBold">{c.titulo}</Texto>
              <Texto variante="apoyo">{c.abierta ? 'Abierta' : 'Se abrió. Toca para leerla.'}</Texto>
            </View>
          </Tarjeta>
        </Pressable>
      ))}

      {proximas.map((c) => (
        <Tarjeta key={c.id} sinSombra fondo={colores.cremaClaro} style={[estilos.fila, { opacity: 0.85 }]}>
          <View style={estilos.candado}><Texto variante="cuerpoBold" style={{ color: colores.crema, fontSize: 12 }}>{faltan(c.abre_en)}</Texto></View>
          <View style={{ flex: 1 }}>
            <Texto variante="cuerpoBold">{c.titulo}</Texto>
            <Texto variante="apoyo">Se abre el {new Date(c.abre_en).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}</Texto>
          </View>
        </Tarjeta>
      ))}

      {!abiertas.length && !proximas.length ? <Tarjeta sinSombra><Texto variante="apoyo">Todavía no hay cápsulas. Van a llegar.</Texto></Tarjeta> : null}
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  cabecera: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  volver: { width: 44, height: 44, borderRadius: radios.boton, backgroundColor: colores.crema, alignItems: 'center', justifyContent: 'center' },
  fila: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
  candado: { minWidth: 56, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, backgroundColor: colores.carbon, alignItems: 'center' },
});
