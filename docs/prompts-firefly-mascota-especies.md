# Prompts Firefly — especies de la mascota personalizable

Sigue el mismo flujo de `docs/prompts-firefly.md`: generas en firefly.adobe.com → dejas los PNG en
`assets/entrada-sprites/` (dentro de este repo, ya conectado) → yo los limpio con Adobe (quitar fondo,
recortar, redimensionar a 512×512) → quedan en `assets/sprites/` y activo la clave en `lib/sprites.ts`.

Esto es para el sistema NUEVO de mascota personalizable (documento de diseño, sección "Creación y
personalización"), no para los animales de la granja que ya tienen prompt propio (`vaca`, `cerdo`, `gato`
en `docs/prompts-firefly.md` son los NPCs de la granja, distintos de estos).

## Estilo base (pégalo al inicio de cada prompt — el mismo de siempre)

> Kawaii sticker illustration, flat vector style, soft pastel palette (blush pink #FFE4EC, rose #FFB3C6, cream #FFF8F0, mint #C8F0DC, butter yellow #FFD93D), thick rounded outlines in dark plum #4A3B45, big shiny eyes, rosy cheeks, centered, front 3/4 view, sitting pose, plain white background, no text, no shadow.

En Firefly: tipo de contenido **Arte**, estilo **Vector** o **Diseño plano**, proporción 1:1. Genera 4,
elige 1. Para que las 7 especies se vean como una sola familia, genera primero `mascota_gato` y luego usa
**Referencia de estructura** con esa imagen para las otras 6 (misma pose y proporciones, solo cambia forma
de orejas/hocico y color).

## Paloma — mascota insignia (el nombre de la app)

Ya tienes 3 sprites aprobados de Palomita (`mascota_feliz`, `mascota_normal`, `mascota_triste`, en
`docs/prompts-firefly.md`). Para la pantalla de creación de mascota, reutiliza `mascota_normal` tal cual
como opción "Paloma" — no hace falta generarla de nuevo. Si prefieres una pose específica para esa pantalla:

| Clave | Prompt específico |
| --- | --- |
| `mascota_paloma` | ...a small round cream-colored dove chick with a tiny three-feather crest on top of the head, soft grey-lavender wings folded at the sides, pink belly patch, tiny orange-yellow beak, calm friendly expression, eyes open |

## Las 6 especies nuevas

| Clave | Prompt específico (después del estilo base) |
| --- | --- |
| `mascota_gato` | ...a round blush-pink kitten, small pointed rounded ears, tiny white oval snout, big friendly eyes, rosy cheeks |
| `mascota_perro` | ...a round mint-green puppy, small floppy rounded ears hanging at the sides, tiny white oval snout with a small dark nose, big friendly eyes |
| `mascota_oso` | ...a round caramel-brown bear cub, small round ears on top, tiny cream oval snout with a small dark nose, big friendly eyes |
| `mascota_cerdito` | ...a round butter-yellow piglet, small round ears, prominent rounded pink snout with two nostril dots, big friendly eyes |
| `mascota_raton` | ...a round cream-grey mouse, extra-large round ears on top, small pointed pink-white snout, long thin tail curled beside it, big friendly eyes |
| `mascota_vaca` | ...a round white calf with a few dark plum patches, small rounded ears sticking out sideways with pink inner ears, two tiny cream horn nubs, soft pink oval snout with two nostril dots, big friendly eyes |

## Guarda cada PNG como

`assets/entrada-sprites/mascota_paloma.png`, `mascota_gato.png`, `mascota_perro.png`, `mascota_oso.png`,
`mascota_cerdito.png`, `mascota_raton.png`, `mascota_vaca.png` — de a uno, en el orden que quieras. Avísame
cuando dejes uno (o varios) ahí y los proceso.

## Reglas (las mismas de siempre)

- Misma vista (frente 3/4, sentado) y mismo grosor de línea en las 7.
- Fondo blanco liso al generar; el recorte lo hago yo con `image_remove_background`.
- Exporta a 1024×1024 o más; yo bajo a 512.
- Si una sale más "3D" o desentona, se descarta y se regenera — no se ajusta a mano.
- Nada de personajes con derechos de autor.
