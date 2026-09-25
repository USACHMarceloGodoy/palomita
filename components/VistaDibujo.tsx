import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colores, radios } from '@/lib/tema';

// Pinta un dibujo guardado como SVG de trazos. No usa un parser de SVG
// completo a propósito: los dibujos los genera /dibujar con un formato fijo
// (solo <path> con stroke y stroke-width), así que basta con leer eso.
export function VistaDibujo({ svg, alto = 160, fondo = colores.cremaClaro }: { svg: string; alto?: number; fondo?: string }) {
  const vb = /viewBox="0 0 (\d+) (\d+)"/.exec(svg);
  const w = vb ? Number(vb[1]) : 320;
  const h = vb ? Number(vb[2]) : 420;
  const trazos = [...svg.matchAll(/<path d="([^"]+)" stroke="([^"]+)" stroke-width="([\d.]+)"/g)];
  return (
    <View style={[estilos.caja, { height: alto, backgroundColor: fondo }]}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid meet">
        {trazos.map((t, i) => (
          <Path key={i} d={t[1]} stroke={t[2]} strokeWidth={Number(t[3])} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        ))}
      </Svg>
    </View>
  );
}

const estilos = StyleSheet.create({
  caja: { borderRadius: radios.tarjetaChica, overflow: 'hidden' },
});
