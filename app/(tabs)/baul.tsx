import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Tesorito } from '@/components/Tesorito';
import { Tarjeta } from '@/components/Tarjeta';
import { Flecha } from '@/components/Iconos';
import { Image } from 'expo-image';
import { Pantalla } from '@/components/Pantalla';
import { Texto } from '@/components/Texto';
import { TarjetaVolteable } from '@/components/TarjetaVolteable';
import { Figura } from '@/components/Figuras';
import { recuerdos } from '@/lib/contenido';
import { urlFirmada } from '@/lib/supabase';
import { colores, radios } from '@/lib/tema';
import type { Recuerdo } from '@/lib/tipos';

export default function Baul() {
  const router = useRouter();
  const [lista, setLista] = useState<Recuerdo[]>([]);
  const [urls, setUrls] = useState<Record<string, string | null>>({});
  const [anio, setAnio] = useState<string | null>(null);
  const [tag, setTag] = useState<string | null>(null);

  useEffect(() => {
    recuerdos().then(async (r) => {
      setLista(r);
      const pares = await Promise.all(r.map(async (x) => [x.id, await urlFirmada(x.foto_path)] as const));
      setUrls(Object.fromEntries(pares));
    }).catch(() => {});
  }, []);

  const anios = useMemo(() => [...new Set(lista.map((r) => r.fecha?.slice(0, 4)).filter(Boolean))] as string[], [lista]);
  const tags = useMemo(() => [...new Set(lista.flatMap((r) => r.tags))], [lista]);
  const filtrados = lista.filter((r) => (!anio || r.fecha?.startsWith(anio)) && (!tag || r.tags.includes(tag)));

  return (
    <Pantalla fondo={colores.lavanda}>
      <Tesorito pantalla="baul" />
      <Texto variante="tituloGrande">Baúl de los recuerdos</Texto>
      <Texto variante="apoyo">Toca una tarjeta para darla vuelta.</Texto>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.filtros}>
        <Chip activo={!anio && !tag} onPress={() => { setAnio(null); setTag(null); }} texto="Todo" />
        {anios.map((a) => <Chip key={a} activo={anio === a} onPress={() => setAnio(anio === a ? null : a)} texto={a} />)}
        {tags.map((t) => <Chip key={t} activo={tag === t} onPress={() => setTag(tag === t ? null : t)} texto={`#${t}`} />)}
      </ScrollView>

      {filtrados.length === 0 ? (
        <View style={estilos.vacio}>
          <Figura forma="lazo" c1={colores.rosaMedio} c2={colores.rosaTinta} size={56} />
          <Texto variante="apoyo" style={{ textAlign: 'center' }}>Todavía no hay recuerdos aquí. Van llegando.</Texto>
        </View>
      ) : null}

      <View style={estilos.atajos}>
        {ATAJOS.map((a) => (
          <Pressable key={a.ruta} onPress={() => router.push(a.ruta as any)} style={estilos.atajo}>
            <Figura forma={a.forma} c1={a.c1} c2={a.c2} size={30} />
            <Texto variante="cuerpoBold" style={{ fontSize: 13, flex: 1 }}>{a.titulo}</Texto>
            <Flecha color={colores.lavandaTexto} dir="der" size={16} />
          </Pressable>
        ))}
      </View>

      {filtrados.map((r) => (
        <TarjetaVolteable
          key={r.id}
          caraA={
            urls[r.id] ? (
              <Image source={{ uri: urls[r.id]! }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
            ) : (
              <View style={estilos.sinFoto}><Figura forma="corazon" c1={colores.rosaFuerte} c2={colores.rosaFuerte} size={64} /></View>
            )
          }
          caraB={
            <View style={estilos.dorso}>
              <Texto variante="manuscritaGrande" style={{ fontSize: 24 }}>{r.texto}</Texto>
              <View style={{ marginTop: 'auto', gap: 2 }}>
                {r.fecha ? <Texto variante="cuerpoBold" style={{ color: colores.lavandaTexto }}>{formatear(r.fecha)}</Texto> : null}
                {r.lugar ? <Texto variante="apoyo">{r.lugar}</Texto> : null}
              </View>
            </View>
          }
        />
      ))}
    </Pantalla>
  );
}

const ATAJOS = [
  { ruta: '/capsulas', titulo: 'Cápsula del tiempo', forma: 'lazo' as const, c1: colores.rosaFuerte, c2: colores.rosaTinta },
  { ruta: '/lugares', titulo: 'Nuestros lugares', forma: 'flor' as const, c1: colores.rosaFuerte, c2: colores.amarillo },
  { ruta: '/kdrama', titulo: 'Nuestro drama', forma: 'paraguas' as const, c1: colores.rosaTinta, c2: colores.rosaTinta },
  { ruta: '/diccionario', titulo: 'Nuestro diccionario', forma: 'lana' as const, c1: colores.lavandaBorde, c2: colores.lavandaTexto },
];

function Chip({ texto, activo, onPress }: { texto: string; activo: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[estilos.chip, activo && estilos.chipActivo]}>
      <Texto variante="cuerpoBold" style={{ fontSize: 13, color: activo ? colores.crema : colores.lavandaTexto }}>{texto}</Texto>
    </Pressable>
  );
}

function formatear(iso: string) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' });
}

const estilos = StyleSheet.create({
  filtros: { gap: 8, paddingVertical: 4 },
  atajos: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  atajo: { width: '48%', flexGrow: 1, flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 52, paddingHorizontal: 12, borderRadius: 18, backgroundColor: colores.crema },
  chip: { minHeight: 40, paddingHorizontal: 14, borderRadius: radios.boton, backgroundColor: colores.crema, justifyContent: 'center' },
  chipActivo: { backgroundColor: colores.lavandaTexto },
  vacio: { alignItems: 'center', gap: 12, padding: 32 },
  sinFoto: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colores.rosaMedio },
  dorso: { flex: 1, padding: 22 },
});
