# Sistema de mascota virtual

Implementación del documento "Sistema de Mascota Virtual — Documento de Diseño" y su mockup.
Fases A–D del documento, menos el pueblo 2D navegable (queda para después, con Skia) y la
herramienta de patrones propios.

## Dónde está en la app

- **Pestaña `Mascota`** (`app/(tabs)/mascota.tsx`): la casa. Habitación actual (con flechas para
  pasar de una a otra), la mascota, las tres barras (hambre, higiene, afecto), saldo de besitos,
  botones Alimentar / Bañar / Acariciar / Vestir y los regalos que dejó la pareja.
- **Cuidar** (`app/mascota/cuidar.tsx?modo=`): todo con gestos. *Acariciar* es pasar el dedo sobre ella
  (un toque no cuenta; salen corazones). *Alimentar* es arrastrar la comida desde la bandeja hasta la
  boca. *Bañar* es tomar el jabón del piso, frotarlo sobre ella hasta llenar la espuma, y después
  sostener la manguera encima para enjuagar.
- **Menú hamburguesa** (`components/mascota/MenuMascota.tsx`): botón redondo en la esquina inferior
  derecha, 16 px por encima del footer, que despliega hacia arriba: Tienda, Armario, Decorar la casa,
  Personalizar mascota, Cocina, Estadio, Pesca, Árbol de la amistad, Museo de Sócrates, Visitar a tu
  pareja. El footer sigue teniendo una sola pestaña de mascota.
- **Subpantallas** en `app/mascota/*.tsx` (pila propia con flecha de volver). Son pantallas y no
  modales por la lección de la granja: los gestos no llegan dentro de un `<Modal>` en Android. Los
  pocos modales que quedan (elegir comida, baño de burbujas, regalos) son solo toques (`Pressable`).

## La casa: varias habitaciones y muebles arrastrables

- `decoracion.habitaciones[]`: cada una con `tipo` (sala, dormitorio, cocina, baño, jardín, terraza,
  ático), `pared`, `suelo` y `muebles: [{ id, x, y }]` en coordenadas 0-1 del lienzo. La sala viene
  de regalo; las demás se compran en la tienda (pestaña Habitaciones) y se "construyen" en Decorar.
- **Decorar** (`app/mascota/decorar.tsx`): los muebles se sueltan desde la bandeja dentro de la
  habitación y se arrastran con el dedo (`react-native-gesture-handler` + Reanimated, patrón del
  laberinto). Tirar un mueble hacia abajo, fuera de la habitación, lo saca. Cada unidad comprada se
  coloca una vez en toda la casa.
- Jardín y terraza muestran cielo en vez de pared; el ático tiene techo inclinado; el baño, azulejos.
- Las decoraciones guardadas con el formato viejo (`{pared, suelo, muebles: string[]}`) se convierten
  al leer (`normalizarDecoracion`), sin migración.

## Minijuegos con mecánica

- **Pesca** (`components/mascota/MinijuegoPesca.tsx`), estilo Stardew Valley: al enganchar aparece
  una pista vertical con el pez moviéndose solo y una barra verde que sube mientras se mantiene
  apretado y cae al soltar (rebota en el fondo salvo con plomada). Si el pez está dentro del verde el
  medidor sube; si no, baja. Lleno = captura; vacío = se escapa. Física en worklets
  (`useFrameCallback`). Cada pez tiene `comportamiento` (suave, de fondo, dardo, escurridizo, mixto)
  y `dificultad` 1-5. Captura **perfecta** (nunca salió del verde) = ×2.4 de experiencia y +3
  besitos. A veces aparece un **cofre**: mantener la barra sobre él llena una barra secundaria; si
  luego se completa la captura, se conservan pez y cofre (ingrediente, insecto o cebo, +6 besitos).
  **Nivel** = `floor(sqrt(xp/30))` (guardado en `minijuego_puntajes`, `juego = 'pesca_xp'`); cada
  nivel agranda la barra 4,5 %. **Cañas** (bambú, fibra +15 %, iridio +30 % y drenaje ×0,8) y
  **aparejos** (corcho +20 % barra, plomada sin rebote, anzuelo trampa drenaje ×0,6) se compran en la
  tienda y se aplican solos.
- **Estadio**: además de tocar, cada 1,2-2,4 s aparece una flecha y hay que deslizar hacia arriba o
  hacia abajo dentro de 1,2 s, como un juego de ritmo. Acierto: +9 de avance; tarde o al revés:
  tropezón (−4).
- **Cocina** (`app/mascota/cocinar.tsx` + `components/mascota/PasosCocina.tsx`), estilo Cooking
  Mama: cada receta son 3-4 pasos con su mecánica y su tiempo: *cortar* (deslizar hacia abajo sobre
  las líneas punteadas), *picar* (tocar al ritmo cuando el marcador pasa por el centro), *mezclar*
  (círculos parejos; muy rápido salpica), *voltear* (deslizar hacia arriba cuando está dorado; tarde
  = quemado), *fuego* (perilla que sigue la zona de temperatura), *verter* (mantener y soltar en la
  línea) y *emplatar* (arrastrar cada pieza a su punto). Cada paso da 0-100 → bronce / plata / oro;
  la medalla final es el promedio y queda en el inventario. Si algo se quema, "Palomita lo arregla"
  y el paso queda en bronce. Oro/plata dan besitos extra las primeras tres recetas del día.
  18 recetas en `RECETAS`.

## Arte: todo vector, nada de PNG ni emoji

- `components/mascota/MascotaVirtual.tsx`: la mascota por capas en un SVG 0-120 — cuerpo, orejas
  (6 variantes), cabeza, hocico/pico (5 variantes), rubor, ojos (6 variantes, parpadean), boca (6 variantes, curva según ánimo; con pico no se dibuja), alas
  (paloma), cola (ratón), manchas (vaca) — con `c1` (pelaje) y `c2` (secundario) como props.
  7 especies: paloma, gato, perro, oso, cerdito, ratón, vaca. Geometría tomada del board
  "Variaciones de especie y color".
- `components/mascota/Prendas.tsx`: cada prenda es un `<G>` en el mismo lienzo, con `slot`
  (cabeza / cara / cuello / cuerpo), orden de capa fijo y ancla por especie (`ANCLA`). Un mismo
  dibujo con distintos `c1/c2` son ítems distintos del catálogo (lazo rosa / lazo celeste).
- `components/mascota/IconosMascota.tsx`: comida, ingredientes, platos, peces, insectos, fósiles,
  arte, trofeos, muebles (`Objeto`) e íconos de interfaz (`IconoUI`). Reemplazan los emojis del mockup.
- `components/mascota/Habitacion.tsx`: pared, suelo, ventana con el cielo real (hora de Chile:
  amanecer / día / atardecer / noche) y la estación del hemisferio sur, muebles y adornos de temporada.
- `components/Figuras.tsx`: las formas de personaje (gatito, capibara, zuricata, oveja, conejito,
  vaca, cerdo) ahora reciben `c1/c2` como pedía el documento.
- Los sprites PNG fijos (`lib/sprites.ts`) siguen valiendo para Palomita insignia y los NPC de granja.

## Datos (`supabase/migrations/0015_mascota_virtual.sql`)

| tabla | qué guarda |
| --- | --- |
| `mascota` | una fila por rol: especie, orejas, hocico, ojos, boca (0016), colores, nombre, `look` (jsonb), `decoracion` (jsonb) |
| `mascota_necesidades` | hambre / higiene / afecto (0-100) + marca de tiempo de cada una, `avisado_en` |
| `inventario` | `(rol, item_id) → cantidad` |
| `museo_donaciones` | qué donó cada uno |
| `minijuego_puntajes` | estadio, pesca, árbol y los contadores diarios de cuidado (`juego = 'cuidado'`) |
| `regalos_mascota` | regalos entre mascotas, con mensaje y `recibido_en` |

- Los dos leen todo (para las visitas); cada uno escribe lo suyo. Las necesidades de la pareja se
  pueden subir (acariciar / alimentar en la visita).
- El **catálogo** vive en `lib/mascota-virtual/catalogo.ts`: ~300 ítems (variantes de color de un
  mismo dibujo son ítems distintos: `variantes()`). Ropa, muebles, paredes y pisos rotan por semana
  (hash del id + número de semana, 4 de cada 5 visibles); los de temporada solo en su evento.
- **Moneda**: los besitos de siempre (`economia`). Orígenes nuevos: `mascota:alimentar`,
  `mascota:banar`, `mascota:acariciar`, `mascota:vender`, `tienda:mascota`, `pesca`, `estadio`,
  `arbol`, `cocina`, `museo`, `visita`. El tope diario de 60 lo sigue aplicando el trigger.
- **Modo demo** (sin Supabase): todo en AsyncStorage (`demo:mv:*`), con una mascota de pareja
  ficticia para poder probar la visita.

## Barras y tiempo real

- Cada barra baja sola: hambre 4/h, higiene 2/h, afecto 3/h (`lib/mascota-virtual/necesidades.ts`).
  El valor mostrado se recalcula en el cliente a partir de la marca de tiempo, como las macetas.
- Hora y estación en `America/Santiago` (`lib/mascota-virtual/tiempo.ts`): invierno jun-ago,
  verano dic-feb. Eventos anclados a fechas reales: San Valentín (10-16 feb), Pascua (semana santa,
  calculada), Fiestas Patrias (15-21 sep), Halloween (24-31 oct), Navidad (12-26 dic). Cambian la
  casa, agregan una pestaña temporal en la tienda y ropa/muebles exclusivos.
- Push: el cron `palomita_mascota` (cada 2 h) llama a `notificar` con `{"table":"mascota"}`; si una
  barra está bajo 20 % manda "X te necesita" (máximo cada 8 h). Un regalo nuevo dispara un push
  al que lo recibe (trigger `notificar_regalo`).

## Recompensas (besitos)

| acción | besitos | límite |
| --- | --- | --- |
| alimentar | 2 | 3 veces al día |
| bañar / acariciar | 5 / 3 | una vez al día cada una |
| pesca | 5 · 10 · 16 · 25 por rareza (bota: 1) | 3 tiradas al día |
| estadio | 15 / 10 / 5 (oro / plata / bronce) + trofeo | una carrera al día |
| árbol | 5 besitos o un ingrediente / insecto | una vez al día |
| cocinar | 6 | primera receta del día |
| donar al museo | 8 | una vez por ítem |
| visitar a la pareja | 5 | primera visita del día |
| vender (peces, insectos, ropa…) | según `venta` del ítem | — |

## Para desplegar

1. Correr `supabase/migrations/0015_mascota_virtual.sql` (crea tablas, RLS, trigger y cron) y `0016_mascota_ojos_boca.sql`.
2. `supabase functions deploy notificar --no-verify-jwt` (nuevo manejo de `regalos_mascota` y cron `mascota`).
3. La app no necesita build nativo: es todo JS/SVG, sale por `eas update`.

## Lo que queda para después

- Pueblo 2D navegable con cámara (Skia), museo con curador animado, patrones propios.
- Vecinos curados (2-5 con frases fijas): hoy solo aparecen dos como rivales del Estadio.
- Sprites Firefly opcionales por especie (`docs/prompts-firefly-mascota-especies.md`) siguen siendo
  posibles como *retrato* en la pantalla de creación, pero la mascota jugable es vectorial.
