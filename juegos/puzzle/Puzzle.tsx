import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { Texto } from '@/components/Texto';
import { Figura } from '@/components/Figuras';
import { recuerdos } from '@/lib/contenido';
import { urlFirmada } from '@/lib/supabase';
import { semillaDelDia } from '@/lib/fechas';
import { colores } from '@/lib/tema';

// Slider puzzle 3×3 con una foto del Baúl: cada puzzle es un recuerdo distinto.
const N = 3;

function mezclar(semilla: number): number[] {
  // Mezcla por movimientos válidos desde el estado resuelto, así siempre tiene solución.
  const tablero = [...Array(N * N).keys()]; // 8 = hueco
  let s = semilla;
  let hueco = N * N - 1;
  for (let k = 0; k < 80; k++) {
    s = (s * 1103515245 + 12345) >>> 0;
    const vecinos = [hueco - N, hueco + N, hueco % N ? hueco - 1 : -1, hueco % N !== N - 1 ? hueco + 1 : -1].filter((v) => v >= 0 && v < N * N);
    const v = vecinos[s % vecinos.length];
    [tablero[hueco], tablero[v]] = [tablero[v], tablero[hueco]];
    hueco = v;
  }
  return tablero;
}

export function Puzzle({ onResolver }: { onResolver: () => void }) {
  const { width } = useWindowDimensions();
  const lado = Math.min(width - 80, 320);
  const celda = lado / N;
  const [url, setUrl] = useState<string | null>(null);
  const [texto, setTexto] = useState('');
  const [tablero, setTablero] = useState<number[]>(() => mezclar(semillaDelDia()));
  const [movs, setMovs] = useState(0);
  const resuelto = useMemo(() => tablero.every((v, i) => v === i), [tablero]);

  useEffect(() => {
    recuerdos().then(async (r) => {
      if (!r.length) return;
      const elegido = r[semillaDelDia() % r.length];
      setTexto(elegido.texto);
      setUrl(await urlFirmada(elegido.foto_path));
    }).catch(() => {});
  }, []);

  useEffect(() => { if (resuelto && movs > 0) onResolver(); }, [resuelto]);

  function mover(i: number) {
    if (resuelto) return;
    const hueco = tablero.indexOf(N * N - 1);
    const adyacente = (Math.abs(i - hueco) === 1 && Math.floor(i / N) === Math.floor(hueco / N)) || Math.abs(i - hueco) === N;
    if (!adyacente) return;
    const t = [...tablero];
    [t[i], t[hueco]] = [t[hueco], t[i]];
    setTablero(t);
    setMovs((m) => m + 1);
    Haptics.selectionAsync().catch(() => {});
  }

  return (
    <View style={{ alignItems: 'center', gap: 10 }}>
      <View style={{ width: lado, height: lado, borderRadius: 16, overflow: 'hidden', backgroundColor: colores.rosaClaro }}>
        {tablero.map((pieza, pos) => {
          if (pieza === N * N - 1 && !resuelto) return null;
          const x = (pos % N) * celda;
          const y = Math.floor(pos / N) * celda;
          const px = (pieza % N) * celda;
          const py = Math.floor(pieza / N) * celda;
          return (
            <Pressable key={pieza} onPress={() => mover(pos)} style={{ position: 'absolute', left: x, top: y, width: celda - 2, height: celda - 2, overflow: 'hidden', borderRadius: 6, backgroundColor: colores.rosaMedio }}>
              {url ? (
                <Image source={{ uri: url }} style={{ position: 'absolute', left: -px, top: -py, width: lado, height: lado }} contentFit="cover" />
              ) : (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                  <Figura forma="corazon" c1={colores.rosaFuerte} c2={colores.rosaFuerte} size={celda * 0.4} />
                  <Texto variante="cuerpoBold" style={{ fontSize: 12, color: colores.crema }}>{pieza + 1}</Texto>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
      <Texto variante="apoyo">{resuelto ? texto || 'Listo.' : `${movs} movimientos`}</Texto>
    </View>
  );
}

const estilos = StyleSheet.create({});
