# Palomita

App Android privada para una sola usuaria. Expo (React Native) + Supabase + panel Vue.
El documento de diseño y el de desarrollo mandan; este README es solo cómo echarla a andar.

## Estructura

```
palomita/
  app/                 Expo Router: (tabs)/ con las 5 pestañas, splash, login, checkin, multiverso
  components/          Particulas (motor único), Figuras (14 formas), TarjetaVolteable, BotonKawaii, Mascota…
  juegos/laberinto/    generador.ts (recursive backtracker, semilla por fecha) + Laberinto.tsx
  lib/                 supabase.ts · contenido.ts · economia.ts · eventos.ts · cache.ts · notificaciones.ts
  assets/              íconos generados desde la mascota (scripts/generar-iconos.mjs)
  panel/               Vue 3 + Vite, se despliega en Vercel
  supabase/            migrations/ (esquema, RLS, webhooks, cron) + functions/notificar
```

Reglas que ya están aplicadas en el código: toda la lógica de besitos vive en `lib/economia.ts`;
ninguna pantalla habla con Supabase directo, solo a través de `lib/`; el tope diario de besitos y
el candado de las cápsulas se aplican en Postgres, no en la app.

## 1. Supabase (una vez)

1. Crea un proyecto en supabase.com (plan gratis, región São Paulo).
2. SQL Editor → pega y corre `supabase/migrations/0001_esquema.sql`.
3. Authentication → Users → **Add user** dos veces (ella y tú), con correo y clave. Desactiva
   "Confirm email" en Auth > Providers > Email para no tener que verificar.
4. SQL Editor:
   ```sql
   insert into usuarios (id, rol, nombre) values
     ('<uuid de ella>', 'ella', 'Su nombre'),
     ('<uuid tuyo>',    'autor', 'Marcelo');
   update config set valor = '"Su nombre"' where clave = 'nombre_ella';
   update config set valor = '"2024-03-15"' where clave = 'fecha_inicio';
   ```
5. Notificaciones:
   ```bash
   npm i -g supabase
   supabase login && supabase link --project-ref <PROJECT_REF>
   supabase secrets set WEBHOOK_SECRET=<un-string-largo-al-azar>
   supabase functions deploy notificar --no-verify-jwt
   ```
   Luego reemplaza `<PROJECT_REF>` y `<WEBHOOK_SECRET>` en `0002_notificaciones.sql` y
   `0003_cron.sql` y córrelos en el SQL Editor (habilita `pg_net` y `pg_cron` en Database > Extensions).

## 2. App

```bash
cp .env.example .env        # pega URL y anon key
npm install
npx expo start              # con Expo Go para ver pantallas; los juegos y push necesitan el APK
```

Sin `.env` la app corre en **modo demo** con contenido de muestra (`lib/mock.ts`), útil para
revisar diseño sin backend.

### Primer APK (una vez)

```bash
npm i -g eas-cli && eas login
eas init                     # escribe el projectId en app.json (reemplaza <EAS_PROJECT_ID>)
# pon URL y anon key en eas.json > build.preview.env
eas build -p android --profile preview
```

Le mandas el link del APK por WhatsApp. Todas las librerías nativas ya van en este primer build
(push, ubicación, mapa, audio, Skia), así que lo que sigue viaja por OTA:

```bash
eas update --branch production --message "granja: gato nuevo"
```

Solo necesitas un APK nuevo si agregas otra librería nativa o cambias `version` en app.json.

## 3. Panel

```bash
cd panel
cp .env.example .env         # misma URL y anon key
npm install && npm run dev
```

Deploy: importa la carpeta `panel/` en Vercel, agrega las dos variables de entorno, listo.
El panel entra con **tu** cuenta (rol `autor`); con la de ella RLS no deja escribir.

## 4. Fase 0 antes de regalarla

El panel muestra en Inicio el inventario contra los mínimos del documento
(60 mensajes, 40 fotos, 16 audios, 100 variantes, 50 trivias, 12 premios, 15 respuestas, 10 cupones, 6 eventos)
y avisa cuando quedan menos de 15 mensajes en cola.

## Estado

- **Fase 1**: 5 pestañas, sistema visual, motor de partículas (16 figuras + lluvia k-drama), mensaje del día, Baúl, check-in con push, botiquín + "te necesito ahora", Multiverso, mascota. Panel completo.
- **Fase 2**: economía y tienda completa (foto inédita, audio inédito, cupones con QR real, gacha de stickers con álbum, comida), granja (vaca, cerdo, gato, tres macetas), laberinto del día con bonus, trivia diaria, puzzle 3×3 con fotos del Baúl, ruleta de citas semanal, mascota alimentable.
- **Fase 3**: cápsula del tiempo (candado en Postgres), nuestros lugares con geofencing local, widget de Android (`react-native-android-widget`), búsqueda del tesoro (lacito escondido, 7 días → cupón), easter eggs (Bazinga con toque largo en el saludo, kit de supervivencia, acuerdo de relación, splash con lluvia y paraguas rojo), diccionario, drama por capítulos, modo dormir.
- **Fase 4 — mascota virtual** (`docs/mascota-virtual.md`): pestaña Mascota con casa, tres barras y menú hamburguesa propio; mascota vectorial personalizable (7 especies, orejas, hocico, dos colores, nombre), ropa y muebles por capas, tienda con rotación semanal y temporadas, cocina, museo de Sócrates, estadio, pesca, árbol de la amistad, visita a la mascota de la pareja con regalos, día/noche y estaciones del hemisferio sur, push cuando una barra está baja. Migración `0015`.
- **Contenido inicial** (`0005_contenido.sql`): 8 poemas de poetas mujeres en dominio público, 18 frases de cine, 30 notas borrador en tu voz, 62 variantes del Multiverso, 15 respuestas al check-in, 12 premios de ruleta, 10 cupones, 26 stickers, ejemplos de trivia/diccionario/capítulo con marcadores `[...]` para reemplazar.

### Lo que no pude probar desde aquí
El APK real (widget, geofencing, push, mapa, audio) necesita `eas build` en tu máquina: acá solo se verificó que compila (`tsc`) y que Metro genera el bundle. `react-native-android-widget` y el geofencing en segundo plano son las dos piezas con más probabilidad de pedir ajustes en el primer build.

### Nota sobre los poemas
Solo poetas mujeres de dominio público: Sor Juana, Rosalía de Castro, Delmira Agustini y Alfonsina Storni. Mistral entra al dominio público en Chile en 2027. Sin autores hombres, por decisión de contenido.

### Sprites propios
`docs/prompts-firefly.md` tiene el estilo base y la lista de sprites por prioridad. Los PNG van en `assets/sprites/` y se activan en `lib/sprites.ts`; cada clave reemplaza su vector automáticamente.
