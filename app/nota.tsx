import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pantalla } from '@/components/Pantalla';
import { Tarjeta } from '@/components/Tarjeta';
import { Texto } from '@/components/Texto';
import { VistaDibujo } from '@/components/VistaDibujo';
import { Particulas } from '@/components/Particulas';
import { Flecha } from '@/components/Iconos';
import { leerDibujo, marcarNotaVista, notas, type Nota } from '@/lib/autor';
import { fechaCorta } from '@/lib/fechas';
import { colores, radios } from '@/lib/tema';

// Una nota suya, abierta. Se marca como vista al entrar: así deja de
// aparecer en Inicio y él ve en su teléfono que ya la leyó.
export default function VerNota() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [nota, setNota] = useState<Nota | null>(null);
  const [dibujo, setDibujo] = useState<string | null>(null);

  useEffect(() => {
    let vivo = true;
    (async () => {
      const todas = await notas(30);
      const n = id ? todas.find((x) => x.id === id) : todas[0];
      if (!vivo || !n) return;
      setNota(n);
      marcarNotaVista(n.id).catch(() => {});
      if (n.dibujo_path) {
        const svg = await leerDibujo(n.dibujo_path);
        if (vivo) setDibujo(svg);
      }
    })().catch(() => {});
    return () => { vivo = false; };
  }, [id]);

  return (
    <Pantalla>
      <Particulas tipo="corazones" densidad={14} duracion={2600} />
      <View style={estilos.cabecera}>
        <Pressable onPress={() => router.back()} accessibilityLabel="Volver" style={estilos.volver}><Flecha color={colores.carbon} /></Pressable>
        <Texto variante="titulo" style={{ fontSize: 21 }}>Una nota para ti</Texto>
      </View>

      <Tarjeta style={{ gap: 14 }}>
        {dibujo ? <VistaDibujo svg={dibujo} alto={280} /> : null}
        {nota?.texto ? (
          <Texto variante="manuscritaGrande" style={{ fontSize: 22, lineHeight: 30 }}>{nota.texto}</Texto>
        ) : null}
        {!nota ? <Texto variante="apoyo">Cargando…</Texto> : null}
        {nota ? <Texto variante="apoyo" style={{ textAlign: 'right' }}>{fechaCorta(nota.creado_en)}</Texto> : null}
      </Tarjeta>
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  cabecera: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  volver: { width: 44, height: 44, borderRadius: radios.boton, backgroundColor: colores.crema, alignItems: 'center', justifyContent: 'center' },
});
