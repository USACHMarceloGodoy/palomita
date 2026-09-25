// Genera icon.png, android-icon-foreground.png, android-icon-monochrome.png,
// splash-icon.png y favicon.png a partir de la mascota vectorial.
// Uso: node scripts/generar-iconos.mjs
import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'node:fs';

const MASCOTA = `
  <ellipse cx="39" cy="47" rx="22" ry="19" fill="#FFF8F0"/>
  <circle cx="39" cy="28" r="15" fill="#FFF8F0"/>
  <path d="M27 45c6-6 17-7 23-2-4 10-17 13-23 2z" fill="#FFB3C6"/>
  <path d="M53 27l8 3.4-8 3.4z" fill="#FFD93D"/>
  <circle cx="34" cy="26" r="2.1" fill="#4A3B45"/>
  <circle cx="45" cy="26" r="2.1" fill="#4A3B45"/>
  <ellipse cx="29" cy="32" rx="3.4" ry="2.1" fill="#FF6F91" opacity="0.5"/>
  <ellipse cx="50" cy="32" rx="3.4" ry="2.1" fill="#FF6F91" opacity="0.5"/>
  <path d="M35 33.5c1.8 2.2 4.6 2.2 6.4 0" stroke="#4A3B45" stroke-width="1.8" stroke-linecap="round" fill="none"/>
  <path d="M33 65l-3 6M46 65l3 6" stroke="#FFD93D" stroke-width="3.2" stroke-linecap="round"/>`;

const MASCOTA_MONO = MASCOTA.replace(/fill="#[0-9A-Fa-f]{6}"/g, 'fill="#000"').replace(/stroke="#[0-9A-Fa-f]{6}"/g, 'stroke="#000"').replace(/opacity="0.5"/g, '');

const corazon = (x, y, s, o) =>
  `<g transform="translate(${x} ${y}) scale(${s})" opacity="${o}"><path d="M12 20.4S3.6 15.6 3.6 9.9A4.3 4.3 0 0 1 12 7.8a4.3 4.3 0 0 1 8.4 2.1c0 5.7-8.4 10.5-8.4 10.5z" fill="#FF6F91"/></g>`;

function svg({ fondo, escala, sinFondo, mono }) {
  const s = 1024;
  const cuerpo = mono ? MASCOTA_MONO : MASCOTA;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
    ${sinFondo ? '' : `<rect width="${s}" height="${s}" fill="${fondo}"/>`}
    ${sinFondo || mono ? '' : `<circle cx="512" cy="512" r="380" fill="#FFB3C6"/>
      ${corazon(150, 170, 3.2, 0.9)}${corazon(770, 210, 2.4, 0.8)}${corazon(180, 720, 2.2, 0.7)}${corazon(790, 700, 3, 0.85)}`}
    <g transform="translate(${512 - 39 * escala} ${512 - 40 * escala}) scale(${escala})">${cuerpo}</g>
  </svg>`;
}

mkdirSync('assets', { recursive: true });
const salidas = [
  ['assets/icon.png', svg({ fondo: '#FFE4EC', escala: 7.6 }), 1024],
  ['assets/android-icon-foreground.png', svg({ fondo: '', escala: 5.6, sinFondo: true }), 1024],
  ['assets/android-icon-monochrome.png', svg({ fondo: '', escala: 5.6, sinFondo: true, mono: true }), 1024],
  ['assets/splash-icon.png', svg({ fondo: '', escala: 9, sinFondo: true }), 1024],
  ['assets/favicon.png', svg({ fondo: '#FFE4EC', escala: 7.6 }), 64],
];
for (const [ruta, s, tam] of salidas) {
  const png = await sharp(Buffer.from(s)).resize(tam, tam).png().toBuffer();
  writeFileSync(ruta, png);
  console.log('ok', ruta);
}
