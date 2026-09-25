import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Particulas, CONFIG_PARTICULAS, type TipoParticula } from '@/components/Particulas';
import { FondoPuntos } from '@/components/FondoPuntos';
import { Mascota } from '@/components/Mascota';
import { Figura } from '@/components/Figuras';
import { Texto } from '@/components/Texto';
import { eventosDelCalendario, particulaDeHoy } from '@/lib/eventos';
import { colores, fuentes, sombras } from '@/lib/tema';

export default function Splash() {
  const router = useRouter();
  const [estado, setEstado] = useState<{ tipo: TipoParticula; nota: string | null } | null>(null);

  useEffect(() => {
    let vivo = true;
    eventosDelCalendario()
      .then((ev) => { if (vivo) setEstado(particulaDeHoy(ev)); })
      .catch(() => { if (vivo) setEstado({ tipo: 'sorpresa', nota: null }); });
    const t = setTimeout(() => router.replace('/(tabs)'), 4200);
    return () => { vivo = false; clearTimeout(t); };
  }, []);

  const tipo = estado?.tipo ?? 'sorpresa';
  const cfg = CONFIG_PARTICULAS[tipo];

  return (
    <View style={[estilos.raiz, { backgroundColor: cfg.bg }]}>
      <FondoPuntos color={cfg.dot} />
      <Particulas tipo={tipo} densidad={26} />
      <Animated.View entering={FadeIn.duration(240)} style={estilos.centro}>
        <View style={estilos.medallon}>
          <Mascota size={118} animo={0.9} />
          {tipo === 'lluvia' ? (
            <View style={{ position: 'absolute', top: -34, right: -18 }}>
              <Figura forma="paraguas" c1="#D6336C" c2="#D6336C" size={96} />
            </View>
          ) : null}
        </View>
        <Texto style={estilos.nombre}>Palomita</Texto>
        {estado?.nota ? (
          <View style={estilos.nota}><Texto variante="cuerpoBold" style={{ color: colores.crema, fontSize: 15 }}>{estado.nota}</Texto></View>
        ) : null}
      </Animated.View>
      <Texto variante="manuscrita" style={estilos.pie}>hecho a mano, solo para ti</Texto>
    </View>
  );
}

const estilos = StyleSheet.create({
  raiz: { flex: 1 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 18, paddingBottom: 120 },
  medallon: { width: 176, height: 176, borderRadius: 999, backgroundColor: colores.crema, alignItems: 'center', justifyContent: 'center', ...sombras.rosada },
  nombre: { fontFamily: fuentes.tituloBold, fontSize: 46, lineHeight: 52, color: colores.carbon },
  nota: { paddingVertical: 9, paddingHorizontal: 18, borderRadius: 999, backgroundColor: colores.carbon },
  pie: { position: 'absolute', bottom: 42, left: 0, right: 0, textAlign: 'center', fontSize: 23, color: '#6B5560' },
});
