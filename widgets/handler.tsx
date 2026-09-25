import React from 'react';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { PalomitaWidget } from './PalomitaWidget';
import { leerCache } from '@/lib/cache';
import { diasEntre, hoyChile } from '@/lib/fechas';
import type { Config, Mensaje } from '@/lib/tipos';

// Corre en segundo plano, sin UI: solo lee la caché que la app dejó al abrir.
export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const cfg = await leerCache<Partial<Config>>('config');
  const m = await leerCache<Mensaje | null>('mensaje:' + hoyChile());
  const mascota = await leerCache<{ animo: number }>('demo:mascota');
  const dias = cfg?.fecha_inicio ? diasEntre(cfg.fecha_inicio) : 0;
  const mensaje = m?.texto?.split('\n')[0] ?? 'Abre Palomita: hay algo para ti.';
  const frase = mascota && mascota.animo < 35 ? 'Palomita te extraña' : 'Palomita te espera';

  switch (props.widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED':
      props.renderWidget(<PalomitaWidget dias={dias} mensaje={mensaje} frase={frase} />);
      break;
    default:
      break;
  }
}
