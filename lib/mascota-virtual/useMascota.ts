// Hook único para las pantallas de la mascota: rol, mascota, barras (ya
// recalculadas), saldo e inventario. Se recarga al enfocar cada pantalla.
import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { saldo as saldoBesitos } from '../economia';
import type { Rol } from '../sesion';
import { inventarioDe, mascotaDe, necesidadesDe, otroRol, rolActual } from './datos';
import { actuales, animoDe } from './necesidades';
import type { ItemInventario, Mascota, Necesidad, Necesidades } from './tipos';

export function useMascota(quien: 'propia' | 'pareja' = 'propia') {
  const [rol, setRol] = useState<Rol>('ella');
  const [mascota, setMascota] = useState<Mascota | null>(null);
  const [necesidades, setNecesidades] = useState<Necesidades | null>(null);
  const [saldo, setSaldo] = useState(0);
  const [inventario, setInventario] = useState<ItemInventario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [tick, setTick] = useState(0);

  const recargar = useCallback(async () => {
    const yo = await rolActual();
    const objetivo = quien === 'propia' ? yo : otroRol(yo);
    const [m, n, s, inv] = await Promise.all([
      mascotaDe(objetivo),
      necesidadesDe(objetivo),
      saldoBesitos().catch(() => 0),
      inventarioDe(yo),
    ]);
    setRol(yo); setMascota(m); setNecesidades(n); setSaldo(s); setInventario(inv);
    setCargando(false);
  }, [quien]);

  useFocusEffect(useCallback(() => { recargar().catch(() => setCargando(false)); }, [recargar]));

  // Las barras bajan solas: refrescamos el cálculo cada minuto sin ir a la red.
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  const valores: Record<Necesidad, number> = necesidades ? actuales(necesidades) : { hambre: 0, higiene: 0, afecto: 0 };
  void tick;
  const animo = animoDe(valores, mascota?.nombre ?? 'Tu mascota');
  const cantidad = (itemId: string) => inventario.find((i) => i.item_id === itemId)?.cantidad ?? 0;

  return { rol, mascota, necesidades, valores, animo, saldo, inventario, cantidad, cargando, recargar };
}
