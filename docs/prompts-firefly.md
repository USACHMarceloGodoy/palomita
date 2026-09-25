# Sprites con Adobe Firefly

Flujo: generas en firefly.adobe.com → me pasas los PNG (a la carpeta `Palomita/entrada-sprites/` o al chat)
→ yo los limpio con las herramientas de Adobe que sí tengo desde aquí (quitar fondo, recortar, redimensionar
a 512×512, vectorizar si conviene) → los dejo en `assets/sprites/` y activo la clave en `lib/sprites.ts`.

Cada clave con sprite reemplaza el dibujo vectorial automáticamente. Sin sprite, la app sigue usando el vector.

## Estilo base (pégalo al inicio de cada prompt)

> Kawaii sticker illustration, flat vector style, soft pastel palette (blush pink #FFE4EC, rose #FFB3C6, cream #FFF8F0, mint #C8F0DC, butter yellow #FFD93D), thick rounded outlines in dark plum #4A3B45, big shiny eyes, rosy cheeks, centered, front 3/4 view, plain white background, no text, no shadow.

En Firefly: tipo de contenido **Arte**, estilo **Vector** o **Diseño plano**, proporción 1:1. Genera 4, elige 1,
y para las variantes (por ejemplo la mascota en tres ánimos) usa **Referencia de estructura** con la primera
imagen para que se parezcan entre sí.

## Lista de sprites, por prioridad

### 1. Mascota (3 ánimos, misma pose)

| Clave | Prompt específico |
| --- | --- |
| `mascota_feliz` | ...a small round cream-colored dove chick "Palomita", pink belly patch, tiny yellow beak and legs, big happy closed-eye smile, one small pink heart floating above |
| `mascota_normal` | ...same dove chick, calm neutral expression, eyes open, no heart |
| `mascota_triste` | ...same dove chick, slightly sad droopy eyes, small tear, no heart |

### 2. Granja

| Clave | Prompt específico |
| --- | --- |
| `vaca` | ...a chubby cream cow with plum spots, pink muzzle, sitting, content expression |
| `cerdo` | ...a round blush-pink piglet with curly tail, sitting, cheerful |
| `gato` | ...a fluffy cream kitten with pink inner ears, sitting, purring with closed eyes |
| `maceta_0` | ...a small terracotta pot with a tiny green sprout |
| `maceta_1` | ...the same pot with a short stem and two leaves |
| `maceta_2` | ...the same pot with a taller stem and four leaves |
| `maceta_3` | ...the same pot with a big pink flower with yellow center, fully bloomed |
| `regadera` | ...a small mint-green watering can with a heart on the side |

### 3. Partículas y stickers (mismo estilo, fondo transparente)

`capibara`, `zuricata`, `oveja`, `conejito`, `gatito`, `frutilla`, `hamburguesa`, `lana`, `lazo`, `volantin`,
`flor`, `rosa`, `girasol`, `corazon`, `gota`, `paraguas`.

Para el gacha puedes crear stickers nuevos fuera de esta lista (por ejemplo `capibara_corona`,
`frutilla_crema`): se agregan a `lib/sprites.ts` y en la tabla `stickers` se usa `img_path = 'sprite:capibara_corona'`.

### 4. Ella (opcional, más adelante)

Un avatar chibi de ustedes dos para el drama y el Multiverso. Aquí Firefly funciona mejor con
**Referencia de estilo** usando uno de los sprites ya aprobados, para no cambiar de estilo.

## Reglas para que no se noten las costuras

- Todos con la misma vista (frente 3/4) y el mismo grosor de línea.
- Fondo blanco liso al generar; el recorte lo hago yo con `image_remove_background`.
- Exporta a 1024×1024 o más; yo bajo a 512.
- No mezcles estilos: si un sprite sale más "3D", se descarta, no se ajusta.
- Nada de personajes con derechos (Hello Kitty, Stardew, etc.): Firefly los rechaza y la app no debe tenerlos.
