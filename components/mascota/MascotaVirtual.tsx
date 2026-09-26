// La mascota personalizable: capas de SVG (cuerpo + orejas + cabeza + hocico +
// prendas) con color_pelaje (c1) y color_secundario (c2) aplicados en vivo.
// Nunca una imagen: cambiar de color o de orejas es cambiar un prop.
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming, cancelAnimation } from 'react-native-reanimated';
import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';
import { item } from '@/lib/mascota-virtual/catalogo';
import type { Boca, Especie, Hocico, Look, Ojos, Orejas } from '@/lib/mascota-virtual/tipos';
import { ANCLA, dibujoPrenda } from './Prendas';

const TRAZO = '#4A3B45';
const OJO = '#5C4B63';

export type PropsMascota = {
  especie: Especie;
  orejas: Orejas;
  hocico: Hocico;
  ojos?: Ojos;
  boca?: Boca;
  c1: string;
  c2: string;
  look?: Look;
  animo?: number;        // 0-1: cambia boca y ojos
  size?: number;
  quieta?: boolean;      // sin rebote ni parpadeo (listas, miniaturas)
  durmiendo?: boolean;
};

export function MascotaVirtual({ especie, orejas, hocico, ojos = 'redondos', boca = 'sonrisa', c1, c2, look = {}, animo = 0.8, size = 160, quieta, durmiendo }: PropsMascota) {
  const [parpadeo, setParpadeo] = useState(false);
  const rebote = useSharedValue(0);

  useEffect(() => {
    if (quieta) return;
    rebote.value = withRepeat(withSequence(
      withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.quad) }),
      withTiming(0, { duration: 1400, easing: Easing.inOut(Easing.quad) }),
    ), -1);
    let vivo = true;
    let t: ReturnType<typeof setTimeout>;
    const ciclo = () => {
      t = setTimeout(() => {
        if (!vivo) return;
        setParpadeo(true);
        setTimeout(() => { if (vivo) setParpadeo(false); ciclo(); }, 140);
      }, 2600 + Math.random() * 2600);
    };
    ciclo();
    return () => { vivo = false; clearTimeout(t); cancelAnimation(rebote); };
  }, [quieta]);

  const estilo = useAnimatedStyle(() => ({
    transform: [{ translateY: rebote.value * -3 }, { scaleX: 1 + rebote.value * 0.015 }, { scaleY: 1 - rebote.value * 0.015 }],
  }));

  const cerrados = durmiendo || parpadeo;
  const ancla = ANCLA[especie];
  const prenda = (slot: keyof Look) => {
    const id = look[slot];
    const it = id ? item(id) : undefined;
    if (!it?.slot) return null;
    const a = ancla[slot] ?? {};
    return <G transform={`translate(${a.dx ?? 0} ${a.dy ?? 0})`}>{dibujoPrenda(it.dibujo, it.c1 ?? c1, it.c2 ?? c2)}</G>;
  };
  const raton = especie === 'raton';
  const cabezaTop = raton ? 24 : 20;

  return (
    <Animated.View style={[{ width: size, height: size }, quieta ? null : estilo]}>
      <Svg width={size} height={size} viewBox="0 0 120 120">
        {/* sombra */}
        <Ellipse cx={60} cy={116} rx={34} ry={4} fill={TRAZO} opacity={0.12} />
        {/* cola del ratón */}
        {raton ? <Path d="M84 108c14 2 22-6 18-16" fill="none" stroke={c1} strokeWidth={5} strokeLinecap="round" /> : null}
        {raton ? <Path d="M84 108c14 2 22-6 18-16" fill="none" stroke={TRAZO} strokeWidth={1.5} strokeLinecap="round" opacity={0.5} /> : null}
        {/* cuerpo */}
        <Ellipse cx={60} cy={102} rx={32} ry={15} fill={c1} stroke={TRAZO} strokeWidth={2.5} />
        <Ellipse cx={60} cy={106} rx={16} ry={8} fill={c2} opacity={0.8} />
        {/* alas de la paloma */}
        {especie === 'paloma' ? (
          <G>
            <Ellipse cx={18} cy={78} rx={14} ry={22} fill={c2} stroke={TRAZO} strokeWidth={2.5} transform="rotate(-14 18 78)" />
            <Ellipse cx={102} cy={78} rx={14} ry={22} fill={c2} stroke={TRAZO} strokeWidth={2.5} transform="rotate(14 102 78)" />
          </G>
        ) : null}
        {prenda('cuerpo')}
        {/* orejas */}
        {orejasDe(orejas, especie, c1, c2)}
        {/* cabeza */}
        {raton
          ? <Ellipse cx={60} cy={62} rx={40} ry={38} fill={c1} stroke={TRAZO} strokeWidth={2.5} />
          : <Ellipse cx={60} cy={62} rx={45} ry={42} fill={c1} stroke={TRAZO} strokeWidth={2.5} />}
        {/* manchas de la vaca */}
        {especie === 'vaca' ? (
          <G fill={c2}>
            <Path d="M22 44c6-8 18-8 22 0 2 6-4 12-12 12s-14-4-10-12z" />
            <Path d="M76 84c2-8 14-10 20-4 4 6-2 12-10 12s-12-2-10-8z" />
          </G>
        ) : null}
        {/* rubor */}
        <Ellipse cx={30} cy={72} rx={8} ry={5} fill="#FFC7D6" opacity={0.75} />
        <Ellipse cx={90} cy={72} rx={8} ry={5} fill="#FFC7D6" opacity={0.75} />
        {/* ojos */}
        {cerrados || ojos === 'felices' ? (
          <G stroke={OJO} strokeWidth={2.5} strokeLinecap="round" fill="none">
            {ojos === 'felices' && !cerrados
              ? <><Path d="M36 59c3-4 8-4 11 0" /><Path d="M73 59c3-4 8-4 11 0" /></>
              : <><Path d="M36 58c3 3 8 3 11 0" /><Path d="M73 58c3 3 8 3 11 0" /></>}
          </G>
        ) : (
          <G>
            {ojosDe(ojos, c1)}
            {animo < 0.35 ? (
              <G stroke={OJO} strokeWidth={2} strokeLinecap="round">
                <Path d="M34 49l10 3" /><Path d="M86 49l-10 3" />
              </G>
            ) : null}
          </G>
        )}
        {/* hocico / pico */}
        {hocicoDe(hocico, c2)}
        {/* boca: con pico no va, el pico ya es la boca */}
        {hocico !== 'pico' ? bocaDe(boca, animo, hocico) : null}
        {durmiendo ? (
          <G fill="none" stroke={OJO} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M96 34h8l-8 8h8" /><Path d="M106 22h6l-6 6h6" />
          </G>
        ) : null}
        {prenda('cara')}
        {prenda('cuello')}
        <G transform={`translate(0 ${cabezaTop - 20})`}>{prenda('cabeza')}</G>
      </Svg>
    </Animated.View>
  );
}

function ojosDe(tipo: Ojos, c1: string) {
  const L = 41.5, R = 78.5, Y = 56.5;
  switch (tipo) {
    case 'grandes':
      return (
        <G>
          <Ellipse cx={L} cy={Y} rx={5.6} ry={6.8} fill={OJO} /><Ellipse cx={R} cy={Y} rx={5.6} ry={6.8} fill={OJO} />
          <Circle cx={L + 2} cy={Y - 2.6} r={1.9} fill="#FFFFFF" /><Circle cx={R + 2} cy={Y - 2.6} r={1.9} fill="#FFFFFF" />
          <Circle cx={L - 1.8} cy={Y + 2.6} r={1} fill="#FFFFFF" /><Circle cx={R - 1.8} cy={Y + 2.6} r={1} fill="#FFFFFF" />
        </G>
      );
    case 'puntitos':
      return <G><Circle cx={L} cy={Y} r={2.6} fill={OJO} /><Circle cx={R} cy={Y} r={2.6} fill={OJO} /></G>;
    case 'somnolientos':
      return (
        <G>
          <Ellipse cx={L} cy={Y} rx={4} ry={5} fill={OJO} /><Ellipse cx={R} cy={Y} rx={4} ry={5} fill={OJO} />
          <Path d={`M${L - 5} ${Y - 6}h10v5h-10z`} fill={c1} /><Path d={`M${R - 5} ${Y - 6}h10v5h-10z`} fill={c1} />
          <Path d={`M${L - 5} ${Y - 1}h10M${R - 5} ${Y - 1}h10`} stroke={OJO} strokeWidth={2} strokeLinecap="round" />
          <Circle cx={L + 1.5} cy={Y + 1} r={1.1} fill="#FFFFFF" /><Circle cx={R + 1.5} cy={Y + 1} r={1.1} fill="#FFFFFF" />
        </G>
      );
    case 'brillantes':
      return (
        <G>
          <Ellipse cx={L} cy={Y} rx={5} ry={6.2} fill={OJO} /><Ellipse cx={R} cy={Y} rx={5} ry={6.2} fill={OJO} />
          <Path d={`M${L + 1} ${Y - 5}l1 2.2 2.2 1-2.2 1-1 2.2-1-2.2-2.2-1 2.2-1z`} fill="#FFFFFF" />
          <Path d={`M${R + 1} ${Y - 5}l1 2.2 2.2 1-2.2 1-1 2.2-1-2.2-2.2-1 2.2-1z`} fill="#FFFFFF" />
          <Circle cx={L - 1.8} cy={Y + 3} r={1.1} fill="#FFFFFF" /><Circle cx={R - 1.8} cy={Y + 3} r={1.1} fill="#FFFFFF" />
        </G>
      );
    default:
      return (
        <G>
          <Ellipse cx={L} cy={Y} rx={3.6} ry={4.6} fill={OJO} /><Ellipse cx={R} cy={Y} rx={3.6} ry={4.6} fill={OJO} />
          <Circle cx={L + 1.3} cy={Y - 1.5} r={1.3} fill="#FFFFFF" /><Circle cx={R + 1.3} cy={Y - 1.5} r={1.3} fill="#FFFFFF" />
        </G>
      );
  }
}

function bocaDe(tipo: Boca, animo: number, hocico: Hocico) {
  if (tipo === 'ninguna') return null;
  const y = hocico === 'ancho' || hocico === 'chancho' ? 94 : 90;
  const t = { fill: 'none' as const, stroke: TRAZO, strokeWidth: 2, strokeLinecap: 'round' as const };
  // Curva según ánimo: triste hacia abajo, neutra recta, contenta hacia arriba.
  const curva = (ancho: number, x0: number) =>
    animo < 0.35 ? `M${x0} ${y + 3}c${ancho * 0.2}-3 ${ancho * 0.8}-3 ${ancho} 0`
      : animo < 0.6 ? `M${x0 + 1} ${y}h${ancho - 2}`
        : `M${x0} ${y - 1}c${ancho * 0.2} 4 ${ancho * 0.8} 4 ${ancho} 0`;
  switch (tipo) {
    case 'gatuna':
      return <Path d={animo < 0.35 ? `M50 ${y + 2}c3-3 7-3 10 0c3-3 7-3 10 0` : `M50 ${y - 1}c3 3 7 3 10 0c3 3 7 3 10 0`} {...t} />;
    case 'chica':
      return <Path d={curva(8, 56)} {...t} />;
    case 'lengua':
      return (
        <G>
          <Path d={curva(16, 52)} {...t} />
          <Path d={`M57 ${y + 1}c0 5 6 5 6 0z`} fill="#FF8FAA" stroke={TRAZO} strokeWidth={1.4} strokeLinejoin="round" />
        </G>
      );
    case 'abierta':
      return (
        <G>
          <Ellipse cx={60} cy={y + 1} rx={5} ry={animo < 0.35 ? 2.5 : 4} fill={TRAZO} />
          <Ellipse cx={60} cy={y + 3} rx={3} ry={1.6} fill="#FF8FAA" />
        </G>
      );
    default:
      return <Path d={curva(16, 52)} {...t} />;
  }
}

function orejasDe(tipo: Orejas, especie: Especie, c1: string, c2: string) {
  const t = { stroke: TRAZO, strokeWidth: 2.5 };
  switch (tipo) {
    case 'puntiagudas':
      return (
        <G>
          <Path d="M26 44L22 10l26 14z" fill={c1} {...t} strokeLinejoin="round" />
          <Path d="M94 44l4-34-26 14z" fill={c1} {...t} strokeLinejoin="round" />
          <Path d="M30 36l-3-18 14 9z" fill={c2} />
          <Path d="M90 36l3-18-14 9z" fill={c2} />
        </G>
      );
    case 'caidas':
      return (
        <G>
          <Ellipse cx={17} cy={52} rx={13} ry={24} fill={c1} {...t} transform="rotate(-8 17 52)" />
          <Ellipse cx={103} cy={52} rx={13} ry={24} fill={c1} {...t} transform="rotate(8 103 52)" />
          <Ellipse cx={17} cy={56} rx={6} ry={14} fill={c2} transform="rotate(-8 17 56)" />
          <Ellipse cx={103} cy={56} rx={6} ry={14} fill={c2} transform="rotate(8 103 56)" />
        </G>
      );
    case 'redondas':
      return (
        <G>
          <Circle cx={25} cy={20} r={15} fill={c1} {...t} />
          <Circle cx={95} cy={20} r={15} fill={c1} {...t} />
          <Circle cx={25} cy={21} r={7} fill={c2} />
          <Circle cx={95} cy={21} r={7} fill={c2} />
        </G>
      );
    case 'grandes':
      return (
        <G>
          <Circle cx={22} cy={16} r={19} fill={c1} {...t} />
          <Circle cx={98} cy={16} r={19} fill={c1} {...t} />
          <Circle cx={22} cy={17} r={11} fill={c2} />
          <Circle cx={98} cy={17} r={11} fill={c2} />
        </G>
      );
    case 'laterales':
      return (
        <G>
          {especie === 'vaca' ? (
            <G>
              <Path d="M38 22c-4-8-2-16 2-20 4 4 6 12 4 20z" fill="#F3E8D2" {...t} strokeWidth={2} />
              <Path d="M82 22c4-8 2-16-2-20-4 4-6 12-4 20z" fill="#F3E8D2" {...t} strokeWidth={2} />
            </G>
          ) : null}
          <Ellipse cx={14} cy={44} rx={15} ry={11} fill={c1} {...t} transform="rotate(-18 14 44)" />
          <Ellipse cx={106} cy={44} rx={15} ry={11} fill={c1} {...t} transform="rotate(18 106 44)" />
          <Ellipse cx={13} cy={45} rx={8} ry={5.5} fill={c2} transform="rotate(-18 13 45)" />
          <Ellipse cx={107} cy={45} rx={8} ry={5.5} fill={c2} transform="rotate(18 107 45)" />
        </G>
      );
    case 'cresta':
      return (
        <G>
          <Ellipse cx={51} cy={20} rx={5} ry={9} fill={c2} {...t} strokeWidth={2} transform="rotate(-10 51 20)" />
          <Ellipse cx={69} cy={20} rx={5} ry={9} fill={c2} {...t} strokeWidth={2} transform="rotate(10 69 20)" />
          <Ellipse cx={60} cy={17} rx={5} ry={10} fill={c2} {...t} strokeWidth={2} />
        </G>
      );
  }
}

function hocicoDe(tipo: Hocico, c2: string) {
  const t = { stroke: TRAZO, strokeWidth: 2 };
  switch (tipo) {
    case 'chico':
      return (
        <G>
          <Ellipse cx={60} cy={78} rx={12} ry={8.5} fill="#FFFFFF" {...t} />
          <Ellipse cx={60} cy={75} rx={3} ry={2} fill="#E0899F" />
        </G>
      );
    case 'trufa':
      return (
        <G>
          <Ellipse cx={60} cy={80} rx={15} ry={11} fill="#FFFFFF" {...t} />
          <Ellipse cx={60} cy={76} rx={4.5} ry={3.2} fill={TRAZO} />
        </G>
      );
    case 'chancho':
      return (
        <G>
          <Ellipse cx={60} cy={82} rx={18} ry={13} fill={c2} {...t} />
          <Ellipse cx={54} cy={82} rx={3} ry={4} fill="#D98BAA" />
          <Ellipse cx={66} cy={82} rx={3} ry={4} fill="#D98BAA" />
        </G>
      );
    case 'pico':
      return <Path d="M60 70l12 8-12 12-12-12z" fill="#FFB454" {...t} strokeLinejoin="round" />;
    case 'ancho':
      return (
        <G>
          <Ellipse cx={60} cy={82} rx={20} ry={14} fill={c2} {...t} />
          <Ellipse cx={60} cy={76} rx={5} ry={3.5} fill={TRAZO} />
        </G>
      );
  }
}

/** Solo una prenda, aislada, para tarjetas de tienda y armario. */
export function PrendaSola({ id, size = 48 }: { id: string; size?: number }) {
  const it = item(id);
  if (!it?.slot) return <View style={{ width: size, height: size }} />;
  const region = { cabeza: '8 -34 104 74', cara: '20 40 80 34', cuello: '20 84 80 42', cuerpo: '20 86 80 40' }[it.slot];
  return (
    <Svg width={size} height={size} viewBox={region} preserveAspectRatio="xMidYMid meet">
      {dibujoPrenda(it.dibujo, it.c1 ?? '#FFB3C6', it.c2 ?? '#D6336C')}
    </Svg>
  );
}
