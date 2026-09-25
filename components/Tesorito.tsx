import { useEffect, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Figura } from './Figuras';
import { Texto } from './Texto';
import { diasEncontrados, encontrarTesoro, pantallaDelTesoro, type PantallaTesoro } from '@/lib/juegos';
import { hoyChile, semillaDelDia } from '@/lib/fechas';
import { colores } from '@/lib/tema';

// Un lacito chiquito escondido en una pantalla al azar, que rota cada día.
// No se anuncia. Encontrarlo siete días distintos da un cupón real.
export function Tesorito({ pantalla }: { pantalla: PantallaTesoro }) {
  const [visible, setVisible] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  useEffect(() => {
    if (pantallaDelTesoro() !== pantalla) return;
    diasEncontrados().then((d) => setVisible(!d.includes(hoyChile()))).catch(() => {});
  }, [pantalla]);

  if (!visible && !mensaje) return null;

  const s = semillaDelDia();
  const top = 120 + (s % 400);
  const right = 8 + ((s >> 3) % 40);

  async function tocar() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setVisible(false);
    const r = await encontrarTesoro();
    setMensaje(r.cupon ? `¡Siete! Tienes un cupón nuevo en Tesoro.` : `Lacito ${r.dias % 7 || 7} de 7`);
    setTimeout(() => setMensaje(null), 2500);
  }

  return (
    <>
      {visible ? (
        <Pressable onPress={tocar} accessibilityLabel="Lacito escondido" style={[estilos.lacito, { top, right }]}>
          <Figura forma="lazo" c1={colores.rosaMedio} c2={colores.rosaTinta} size={22} />
        </Pressable>
      ) : null}
      {mensaje ? (
        <Texto variante="cuerpoBold" style={estilos.aviso}>{mensaje}</Texto>
      ) : null}
    </>
  );
}

const estilos = StyleSheet.create({
  lacito: { position: 'absolute', zIndex: 20, width: 44, height: 44, alignItems: 'center', justifyContent: 'center', opacity: 0.8 },
  aviso: { position: 'absolute', zIndex: 21, alignSelf: 'center', top: 80, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 999, backgroundColor: colores.carbon, color: colores.crema, overflow: 'hidden' },
});
