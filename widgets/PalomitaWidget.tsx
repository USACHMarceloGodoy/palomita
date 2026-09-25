import { FlexWidget, SvgWidget, TextWidget } from 'react-native-android-widget';

// Widget de pantalla de inicio: contador de días, mensaje del día recortado y la mascota.
// Es lo que hace que la app exista para ella aunque no la abra.

const MASCOTA_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 78 78">
  <ellipse cx="39" cy="47" rx="22" ry="19" fill="#FFF8F0"/>
  <circle cx="39" cy="28" r="15" fill="#FFF8F0"/>
  <path d="M27 45c6-6 17-7 23-2-4 10-17 13-23 2z" fill="#FFB3C6"/>
  <path d="M53 27l8 3.4-8 3.4z" fill="#FFD93D"/>
  <circle cx="34" cy="26" r="2.1" fill="#4A3B45"/>
  <circle cx="45" cy="26" r="2.1" fill="#4A3B45"/>
  <ellipse cx="29" cy="32" rx="3.4" ry="2.1" fill="#FF6F91" opacity="0.5"/>
  <ellipse cx="50" cy="32" rx="3.4" ry="2.1" fill="#FF6F91" opacity="0.5"/>
  <path d="M35 33.5c1.8 2.2 4.6 2.2 6.4 0" stroke="#4A3B45" stroke-width="1.8" stroke-linecap="round" fill="none"/>
  <path d="M33 65l-3 6M46 65l3 6" stroke="#FFD93D" stroke-width="3.2" stroke-linecap="round"/>
</svg>`;

export function PalomitaWidget({ dias, mensaje, frase }: { dias: number; mensaje: string; frase: string }) {
  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{ height: 'match_parent', width: 'match_parent', backgroundColor: '#FFE4EC', borderRadius: 24, padding: 14, flexDirection: 'row', alignItems: 'center' }}
    >
      <FlexWidget style={{ width: 64, height: 64, backgroundColor: '#FFB3C6', borderRadius: 32, alignItems: 'center', justifyContent: 'center' }}>
        <SvgWidget svg={MASCOTA_SVG} style={{ width: 52, height: 52 }} />
      </FlexWidget>
      <FlexWidget style={{ flex: 1, flexDirection: 'column', marginLeft: 12 }}>
        <TextWidget text={`${dias} días juntos`} style={{ fontSize: 12, color: '#7A6670', fontWeight: '700' }} />
        <TextWidget text={mensaje} maxLines={3} style={{ fontSize: 15, color: '#4A3B45' }} />
        <TextWidget text={frase} style={{ fontSize: 11, color: '#D6336C', fontWeight: '700' }} />
      </FlexWidget>
    </FlexWidget>
  );
}
