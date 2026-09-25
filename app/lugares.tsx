import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import MapView, { Circle, Marker } from 'react-native-maps';
import { Image } from 'expo-image';
import { Pantalla } from '@/components/Pantalla';
import { Tarjeta } from '@/components/Tarjeta';
import { Texto } from '@/components/Texto';
import { BotonKawaii } from '@/components/BotonKawaii';
import { Flecha } from '@/components/Iconos';
import { activarGeofences } from '@/lib/geofence';
import { lugares } from '@/lib/sorpresas';
import { recuerdos } from '@/lib/contenido';
import { urlFirmada } from '@/lib/supabase';
import { colores, radios } from '@/lib/tema';
import type { Lugar, Recuerdo } from '@/lib/tipos';

export default function Lugares() {
  const router = useRouter();
  const [lista, setLista] = useState<Lugar[]>([]);
  const [recs, setRecs] = useState<Recuerdo[]>([]);
  const [sel, setSel] = useState<Lugar | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [estado, setEstado] = useState<string | null>(null);

  useEffect(() => {
    lugares().then(setLista).catch(() => {});
    recuerdos().then(setRecs).catch(() => {});
  }, []);

  useEffect(() => {
    const r = recs.find((x) => x.id === sel?.recuerdo_id);
    if (r) urlFirmada(r.foto_path).then(setUrl); else setUrl(null);
  }, [sel?.id, recs.length]);

  async function activar() {
    const r = await activarGeofences().catch(() => 'sin-permiso' as const);
    setEstado(r === 'ok' ? 'Listo. Cuando pases cerca, el teléfono te avisa.' : r === 'sin-permiso' ? 'Necesita permiso de ubicación "siempre" para avisarte con la app cerrada.' : 'Ya desbloqueaste todos los lugares.');
  }

  const centro = lista[0] ?? { lat: -33.4489, lng: -70.6693 };
  const recuerdoSel = recs.find((x) => x.id === sel?.recuerdo_id);

  return (
    <Pantalla sinPadding scroll={false}>
      <View style={estilos.cabecera}>
        <Pressable onPress={() => router.back()} accessibilityLabel="Volver" style={estilos.volver}><Flecha color={colores.carbon} /></Pressable>
        <Texto variante="titulo" style={{ fontSize: 21 }}>Nuestros lugares</Texto>
      </View>
      <MapView
        style={{ flex: 1 }}
        initialRegion={{ latitude: centro.lat, longitude: centro.lng, latitudeDelta: 0.08, longitudeDelta: 0.08 }}
        onPress={() => setSel(null)}
      >
        {lista.map((l) => (
          <Marker key={l.id} coordinate={{ latitude: l.lat, longitude: l.lng }} title={l.titulo} pinColor={l.desbloqueado_en ? colores.rosaTinta : colores.rosaMedio} onPress={() => setSel(l)} />
        ))}
        {lista.map((l) => (
          <Circle key={l.id + 'c'} center={{ latitude: l.lat, longitude: l.lng }} radius={l.radio_m} strokeColor={colores.rosaFuerte} fillColor="rgba(255,111,145,0.15)" />
        ))}
      </MapView>
      <View style={estilos.panel}>
        {sel ? (
          <Tarjeta sinSombra fondo={colores.crema} style={{ gap: 8 }}>
            <Texto variante="titulo">{sel.titulo}</Texto>
            {sel.desbloqueado_en ? (
              <>
                {url ? <Image source={{ uri: url }} style={{ width: '100%', height: 140, borderRadius: 16 }} contentFit="cover" /> : null}
                <Texto variante="manuscritaGrande" style={{ fontSize: 22 }}>{recuerdoSel?.texto ?? 'Recuerdo desbloqueado.'}</Texto>
              </>
            ) : (
              <Texto variante="apoyo">Este recuerdo se abre solo cuando estás ahí. Ve y verás.</Texto>
            )}
          </Tarjeta>
        ) : (
          <Tarjeta sinSombra fondo={colores.crema} style={{ gap: 10 }}>
            <Texto variante="apoyo">{lista.length} lugares · {lista.filter((l) => l.desbloqueado_en).length} desbloqueados. Toca un pin.</Texto>
            <BotonKawaii titulo="Avisarme cuando pase cerca" variante="secundario" onPress={activar} />
            {estado ? <Texto variante="apoyo">{estado}</Texto> : null}
          </Tarjeta>
        )}
      </View>
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  cabecera: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 12 },
  volver: { width: 44, height: 44, borderRadius: radios.boton, backgroundColor: colores.crema, alignItems: 'center', justifyContent: 'center' },
  panel: { padding: 14 },
});
