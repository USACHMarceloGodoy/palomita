-- Palomita · contenido inicial
-- Poemas: solo poetas mujeres de dominio público (ver sección). Sin Neruda ni
-- otros autores hombres: decisión de contenido, no técnica.
-- Frases de cine: citas cortas con atribución.
-- Notas: borradores en tu voz, para que los edites antes de que los vea.

-- ---------------------------------------------------------------------------
-- Poemas (tipo 'poema') — solo poetas mujeres de dominio público.
-- Sor Juana (m. 1695), Rosalía de Castro (m. 1885), Delmira Agustini (m. 1914),
-- Alfonsina Storni (m. 1938). Mistral entra al dominio público en Chile en 2027.
-- ---------------------------------------------------------------------------
insert into mensajes (texto, tipo) values
('Detente, sombra de mi bien esquivo,
imagen del hechizo que más quiero,
bella ilusión por quien alegre muero,
dulce ficción por quien penosa vivo.
— Sor Juana Inés de la Cruz', 'poema'),
('Hombres necios que acusáis
a la mujer sin razón,
sin ver que sois la ocasión
de lo mismo que culpáis.
— Sor Juana Inés de la Cruz, "Redondillas"', 'poema'),
('Al que ingrato me deja, busco amante;
al que amante me sigue, dejo ingrata;
constante adoro a quien mi amor maltrata;
maltrato a quien mi amor busca constante.
— Sor Juana Inés de la Cruz', 'poema'),
('Esta tarde, mi bien, cuando te hablaba,
como en tu rostro y tus acciones vía
que con palabras no te persuadía,
que el corazón me vieses deseaba.
— Sor Juana Inés de la Cruz', 'poema'),
('Tú me quieres alba,
me quieres de espumas,
me quieres de nácar.
— Alfonsina Storni, "Tú me quieres blanca"', 'poema'),
('Hombre pequeñito, hombre pequeñito,
suelta a tu canario que quiere volar...
Yo soy el canario, hombre pequeñito,
déjame saltar.
— Alfonsina Storni, "Hombre pequeñito"', 'poema'),
('Amor, la noche estaba trágica y sollozante
cuando tu llave de oro cantó en mi cerradura.
— Delmira Agustini, "El intruso"', 'poema'),
('Dicen que no hablan las plantas, ni las fuentes, ni los pájaros,
ni el onda con sus rumores, ni con su brillo los astros:
lo dicen, pero no es cierto, pues siempre, cuando yo paso,
de mí murmuran y exclaman: —Ahí va la loca, soñando.
— Rosalía de Castro', 'poema');

-- ---------------------------------------------------------------------------
-- Frases de cine (tipo 'extracto')
-- ---------------------------------------------------------------------------
insert into mensajes (texto, tipo) values
('"Cuando te das cuenta de que quieres pasar el resto de tu vida con alguien, deseas que empiece lo antes posible."
— Cuando Harry encontró a Sally (1989)', 'extracto'),
('"Todo cuanto he hecho en mi vida me ha estado conduciendo hacia ti."
— Los puentes de Madison (1995)', 'extracto'),
('"La muerte no detiene al amor. Lo único que puede hacer es demorarlo."
— La princesa prometida (1987)', 'extracto'),
('"Gracias por esta bella aventura. Ahora te toca vivir una nueva."
— Up (2009)', 'extracto'),
('"Todos tenemos un destino; tú eres el mío."
— Cuando te encuentre (2015)', 'extracto'),
('"Nuestro amor es como el viento; no puedo verlo, pero sí sentirlo."
— Un paseo para recordar (2002)', 'extracto'),
('"No sé de qué están hechas las almas, pero la tuya y la mía son una sola."
— Cumbres borrascosas (1992)', 'extracto'),
('"Creo que ella es mejor que la chica de mis sueños. Ella es real."
— 500 días con ella (2009)', 'extracto'),
('"Solo soy una chica delante de un chico pidiéndole que la quiera."
— Notting Hill (1999)', 'extracto'),
('"He cruzado océanos de tiempo para encontrarte."
— Drácula de Bram Stoker (1992)', 'extracto'),
('"No soy un hombre inteligente, pero sé lo que es el amor."
— Forrest Gump (1994)', 'extracto'),
('"Ninguna medida de tiempo contigo será suficiente, pero empecemos con un para siempre."
— Crepúsculo: Amanecer (2011)', 'extracto'),
('"Me enamoré de él como te quedas dormido: lentamente, y después de golpe."
— Bajo la misma estrella (2014)', 'extracto'),
('"Solamente una cosa me da miedo: pensar que no podríamos habernos conocido nunca."
— Otoño en Nueva York (2000)', 'extracto'),
('"El mejor tipo de amor despierta el alma y nos hace querer más."
— Diario de una pasión (2004)', 'extracto'),
('"Tú me completas."
— Jerry Maguire (1996)', 'extracto'),
('"Siempre te tendré a ti, y tú siempre me tendrás a mí."
— Titanic (1997), en la versión corta que yo recuerdo', 'extracto'),
('"Para mí, eres perfecta."
— Love Actually (2003)', 'extracto');

-- ---------------------------------------------------------------------------
-- Notas en tu voz (borradores: edítalas desde el panel antes de que salgan)
-- ---------------------------------------------------------------------------
insert into mensajes (texto, tipo) values
('Hoy desperté antes que la alarma solo para pensarte un rato con calma, sin apuro y sin que nadie me apurara.', 'nota'),
('No sé qué día tuviste, pero sé cómo termina: conmigo pensando en ti.', 'nota'),
('Si esto fuera un juego, tú serías el tutorial que no me quiero saltar.', 'nota'),
('Hay una versión de mí que existe solo cuando estás cerca. Es la que más me gusta.', 'nota'),
('Te escribo esto anoche para que lo leas hoy. Los dos yo estamos de acuerdo en quererte.', 'nota'),
('Tengo una lista de cosas que me gustan de ti. La abrí para agregar una y se me fue la tarde.', 'nota'),
('No necesito que hoy sea un gran día. Necesito que llegue a la noche y me cuentes cómo estuvo.', 'nota'),
('Prometo no arreglarte los problemas cuando no me lo pidas. Prometo estar mientras los arreglas tú.', 'nota'),
('A veces te miro cuando no te das cuenta. No es raro, es gratitud.', 'nota'),
('Si hoy te cuesta, avísame con una carita. No hace falta más.', 'nota'),
('Mi plan para el fin de semana: tú. Lo demás lo vemos.', 'nota'),
('Programé esta app para no tener que decirte lo mismo todos los días. Fracasé: te lo voy a decir igual.', 'nota'),
('Hoy no tengo nada profundo. Solo que me gusta cómo dices mi nombre cuando te ríes.', 'nota'),
('Que hoy alguien te trate tan bien como te mereces. Si no aparece nadie, me ofrezco.', 'nota'),
('No te cambio por nada. Ni por dormir hasta tarde, y eso ya es decir mucho.', 'nota'),
('Contigo aprendí que el silencio también puede ser cómodo.', 'nota'),
('Si estás leyendo esto en la cama, tápate bien. Si estás en el trabajo, respira. En los dos casos, te quiero.', 'nota'),
('Tengo una teoría: los días que no nos vemos duran un 20% más. Sigo recolectando datos.', 'nota'),
('Gracias por aguantar mis explicaciones largas. Esta es corta: te amo.', 'nota'),
('Hoy elijo quererte otra vez. Es la decisión más fácil de mi día.', 'nota'),
('Cuando no sepas qué hacer, abre el botiquín. Cuando sí sepas, cuéntame para aplaudirte.', 'nota'),
('Te dejé un besito escondido en esta app. Bueno, varios. Uno por cada día.', 'nota'),
('Si el mundo se acaba mañana, mi kit de supervivencia eres tú.', 'nota'),
('Ojalá hoy te pase algo pequeño y lindo. Y ojalá me lo cuentes con detalle.', 'nota'),
('No soy poeta, pero tengo un banco de poetas para los días en que no me salen las palabras. Hoy sí me salen: te amo.', 'nota'),
('Palomita está contenta porque abriste la app. Yo también, por lo mismo.', 'nota'),
('Prefiero un día normal contigo que uno extraordinario sin ti. Lo probé, no es tan bueno.', 'nota'),
('Hoy hazte un favor: sonríe una vez sin motivo. Si necesitas motivo, aquí estoy.', 'nota'),
('Te quiero en versión larga y en versión resumen. Esta es la resumen.', 'nota'),
('Lo mejor de mi semana tiene tu nombre. Lo segundo mejor también.', 'nota');

-- ---------------------------------------------------------------------------
-- Multiverso del te amo
-- ---------------------------------------------------------------------------
insert into multiverso (texto, categoria) values
-- idiomas
('I love you. Simple, sin adornos, como me sale cuando te miro.', 'idiomas'),
('Je t''aime. Suena mejor con acento, pero lo digo igual.', 'idiomas'),
('Ti amo. Lo de los italianos con las manos también aplica.', 'idiomas'),
('Eu te amo. Con la cadencia lenta del portugués de Brasil.', 'idiomas'),
('Ich liebe dich. Áspero por fuera, tierno por dentro. Como el pan alemán.', 'idiomas'),
('사랑해. Lo aprendí viendo tus dramas contigo al lado.', 'idiomas'),
('愛してる (aishiteru). Los japoneses casi nunca lo dicen; por eso pesa.', 'idiomas'),
('Munakuyki. En quechua, para que suene a cordillera.', 'idiomas'),
('Rohayhu. En guaraní, que se dice suave.', 'idiomas'),
('Te amo en morse: - . / .- -- ---', 'idiomas'),
('Te amo en lenguaje de señas: el gesto lo hacemos esta noche.', 'idiomas'),
-- código
('Te amo en binario: 01110100 01100101 00100000 01100001 01101101 01101111', 'código'),
('while (true) { teAmo(); } — nunca puse la condición de salida.', 'código'),
('SELECT * FROM personas WHERE amor = ''infinito''; -- 1 fila devuelta: tú.', 'código'),
('def te_amo(): return True  # sin condiciones, sin parámetros.', 'código'),
('git commit -m "te amo" && git push --force  # sobre cualquier duda que hayas tenido.', 'código'),
('Te amo con complejidad O(1): constante, no importa cuántos días pasen.', 'código'),
('Te amo en Power Fx: If(true; "te amo"; "te amo")', 'código'),
('=SI(VERDADERO;"te amo";"te amo")  — la fórmula siempre da lo mismo.', 'código'),
('Te amo en regex: ^(te amo)+$ — se repite y sigue siendo válido.', 'código'),
('HTTP 200 OK. Contigo todo responde bien.', 'código'),
('Te amo en Go: for { teAmo() } — sin break, a propósito.', 'código'),
('Te amo en Ruby: 1.upto(Float::INFINITY) { te_amo }', 'código'),
('Te amo como se ama un test que pasa a la primera: con sospecha y alegría.', 'código'),
('Eres mi try sin catch: no contemplo que falles.', 'código'),
('Te amo en JSON: {"te_amo": true, "desde": "siempre", "hasta": null}', 'código'),
-- matemáticas
('Te amo hasta el infinito, y como el infinito no es un número, hasta el siguiente también.', 'matemáticas'),
('Te amo con probabilidad 1. No es certeza matemática, pero es lo más cerca que se llega.', 'matemáticas'),
('Eres mi constante de integración: apareces en todas las soluciones.', 'matemáticas'),
('Te amo en base 2, en base 10 y en base a lo que eres.', 'matemáticas'),
('Mi amor por ti es una función creciente. Derivada positiva todos los días.', 'matemáticas'),
-- comparaciones
('Te amo como el café ama las siete de la mañana.', 'comparaciones'),
('Te amo en 8 bits, en HD y en cualquier resolución.', 'comparaciones'),
('Te amo como el gato ama la caja: sin explicación y con convicción.', 'comparaciones'),
('Te amo como el domingo ama la siesta.', 'comparaciones'),
('Te amo como los volantines aman septiembre.', 'comparaciones'),
('Te amo como la frutilla ama la crema. Juntos son otra cosa.', 'comparaciones'),
('Te amo como el capibara ama estar tranquilo: sin drama y todo el día.', 'comparaciones'),
('Te amo más que a dormir hasta tarde. Es mi unidad de medida más alta.', 'comparaciones'),
('Te amo como la manta ama el sillón en invierno.', 'comparaciones'),
('Te amo como la lana ama enredarse: sin remedio.', 'comparaciones'),
-- series y fandom
('Te amo como quien busca a alguien en el apocalipsis: primero tú, después las provisiones.', 'series'),
('Mi función de onda colapsa contigo. Bazinga, pero en serio.', 'series'),
('Te amo como en el episodio 12 de cualquier drama: cuando ya no se puede seguir disimulando.', 'series'),
('Te amo con paraguas rojo y lluvia de fondo. Cliché a propósito.', 'series'),
('Si esto fuera un drama coreano, ya habríamos tenido el segundo encuentro casual. Y el tercero.', 'series'),
('Te amo como un zombi ama el cerebro, pero con mejores modales.', 'series'),
-- juegos de rol y mesa
('Tiré un d20 para ver cuánto te amo. Salió 20 natural. Crítico.', 'D&D'),
('Eres mi cleric: me curas sin que te lo pida.', 'D&D'),
('Te amo con ventaja: tiro dos veces y me quedo con el mejor resultado, que siempre eres tú.', 'D&D'),
('En mi hoja de personaje, bajo "vínculos", solo hay un nombre.', 'D&D'),
-- absurdas
('Te amo en horario de verano y en horario de invierno, aunque Chile no se decida.', 'absurdas'),
('Te amo con la intensidad de un microondas en el segundo 59.', 'absurdas'),
('Te amo como se ama el último pedazo de pizza: lo comparto solo contigo.', 'absurdas'),
('Te amo más que el número de pestañas que tengo abiertas. Y son muchas.', 'absurdas'),
('Te amo en modo avión: sin señal, igual llega.', 'absurdas'),
('Te amo en letra Comic Sans: sin vergüenza.', 'absurdas'),
('Te amo con la seguridad de un gato caminando por una repisa llena de vasos.', 'absurdas'),
('Te amo como la impresora ama fallar: siempre, sin importar la hora.', 'absurdas'),
-- serias
('Te amo en los días buenos, que es fácil, y en los otros, que es donde vale.', 'serias'),
('Te amo con la parte de mí que no sabe hacer chistes.', 'serias'),
('Te amo y no necesito una variante ingeniosa para decirlo.', 'serias');

-- ---------------------------------------------------------------------------
-- Respuestas al check-in (3 por carita)
-- ---------------------------------------------------------------------------
insert into respuestas_checkin (emoji, texto) values
('fatal', 'No tienes que explicarlo. Si quieres que vaya, voy; si quieres silencio, también sé.'),
('fatal', 'Hoy no se arregla nada y está bien. Mañana lo vemos juntos.'),
('mal', 'Gracias por contarme. Hoy te toca a ti recibir; yo pongo el resto.'),
('mal', 'Un día malo no es una mala vida. Y no estás sola en este.'),
('normal', 'Normal también es un buen lugar. Desde ahí se puede ir a cualquier parte.'),
('normal', 'Un día tranquilo. Me lo guardo como una buena noticia.'),
('bien', 'Me alegro. Quiero saber qué fue lo mejor, con detalles innecesarios.'),
('bien', 'Bien te queda. Cuéntame qué pasó y te cuento qué pasó acá.'),
('genial', 'Ese ánimo me lo cuidas hasta que nos veamos.'),
('genial', 'Se te nota hasta por la app. Contagiame un poco.');

-- ---------------------------------------------------------------------------
-- Ruleta de citas (12) y cupones (10)
-- ---------------------------------------------------------------------------
insert into ruleta (titulo, descripcion, peso) values
('Noche de películas', 'Tú eliges, yo no me quejo del género.', 3),
('Desayuno a la cama', 'Un sábado, tú eliges cuál.', 2),
('Picnic', 'Aunque sea en el living si llueve.', 2),
('Tarde de juegos de mesa', 'Puedes hacer trampa una vez.', 3),
('Caminata al atardecer', 'Con paradas para fotos.', 2),
('Cocinar juntos', 'Receta nueva, resultado incierto.', 3),
('Maratón de dramas', 'Con snacks y sin interrupciones.', 2),
('Cita de helado', 'Doble sabor, sin excusas.', 3),
('Día sin celular', 'Solo la app cuenta.', 1),
('Tarde de librería', 'Cada uno elige un libro para el otro.', 2),
('Museo o exposición', 'La que tú quieras.', 1),
('Sesión de masajes', 'Media hora garantizada.', 2);

insert into cupones (titulo, descripcion, costo) values
('Una noche de películas a tu elección', 'Sin quejas por el género.', 150),
('Desayuno a la cama', 'Un sábado, tú eliges cuál.', 150),
('Abrazo de diez minutos', 'Sin soltarse, sin mirar el celular.', 60),
('Vale por una tarea doméstica', 'La que menos te guste, la hago yo.', 120),
('Cena cocinada por mí', 'Menú a elección, resultado bajo tu propio riesgo.', 200),
('Masaje de 30 minutos', 'Con música que elijas tú.', 150),
('Un día entero para ti', 'Tú planeas, yo sigo.', 300),
('Vale por escuchar sin opinar', 'Diez minutos de silencio activo.', 80),
('Salida sorpresa', 'Yo organizo, tú solo apareces.', 250),
('Una carta escrita a mano', 'Con sobre y todo.', 100);

-- ---------------------------------------------------------------------------
-- Stickers del gacha (dibujos propios del motor: img_path = 'figura:<forma>')
-- ---------------------------------------------------------------------------
insert into stickers (coleccion, nombre, rareza, img_path) values
('Flores', 'Flor rosa', 'comun', 'figura:flor:#FF6F91:#FFD93D'),
('Flores', 'Flor amarilla', 'comun', 'figura:flor:#FFD93D:#E09A1F'),
('Flores', 'Rosa', 'raro', 'figura:rosa:#D6336C:#FFB3C6'),
('Flores', 'Girasol', 'raro', 'figura:girasol:#FFD93D:#6B4A2A'),
('Flores', 'Flor lavanda', 'comun', 'figura:flor:#E2D5F8:#6B3FA0'),
('Flores', 'Rosa dorada', 'epico', 'figura:rosa:#FFD93D:#D6336C'),
('Bichitos', 'Gatito', 'comun', 'figura:gatito'),
('Bichitos', 'Conejito', 'comun', 'figura:conejito'),
('Bichitos', 'Capibara', 'raro', 'figura:capibara'),
('Bichitos', 'Zuricata', 'raro', 'figura:zuricata'),
('Bichitos', 'Oveja', 'comun', 'figura:oveja'),
('Bichitos', 'Capibara con corona', 'epico', 'figura:capibara:corona'),
('Comida', 'Frutilla', 'comun', 'figura:frutilla'),
('Comida', 'Hamburguesita', 'comun', 'figura:hamburguesa'),
('Comida', 'Frutilla con crema', 'raro', 'figura:frutilla:crema'),
('Comida', 'Hamburguesa doble', 'raro', 'figura:hamburguesa:doble'),
('Comida', 'Frutilla dorada', 'epico', 'figura:frutilla:dorada'),
('Kawaii', 'Lazo rosa', 'comun', 'figura:lazo:#FF6F91:#D6336C'),
('Kawaii', 'Lazo lavanda', 'comun', 'figura:lazo:#E2D5F8:#6B3FA0'),
('Kawaii', 'Lana', 'comun', 'figura:lana:#FFB3C6:#D6336C'),
('Kawaii', 'Corazón', 'comun', 'figura:corazon:#FF6F91:#FF6F91'),
('Kawaii', 'Corazón dorado', 'epico', 'figura:corazon:#FFD93D:#FFD93D'),
('Chile', 'Volantín', 'comun', 'figura:volantin:#FFD93D:#D6336C'),
('Chile', 'Volantín tricolor', 'raro', 'figura:volantin:#D6336C:#2B4C9B'),
('Chile', 'Flor amarilla de septiembre', 'raro', 'figura:flor:#FFD93D:#3E8A62'),
('Chile', 'Volantín dorado', 'epico', 'figura:volantin:#FFD93D:#FFD93D');

-- ---------------------------------------------------------------------------
-- Diccionario, trivia y k-drama: ejemplos para reemplazar con los suyos
-- ---------------------------------------------------------------------------
insert into diccionario (palabra, definicion, ejemplo) values
('Palomita', 's. f. 1. Mascota de esta app. 2. Forma de decir "te estoy pensando" sin decirlo.', '"Te dejé una palomita en el celular."'),
('Besito', 's. m. Unidad monetaria de curso legal solo dentro de esta app. No convertible a pesos, sí a abrazos.', '"Me faltan 20 besitos para el cupón."'),
('[palabra inventada]', 'Escribe aquí la definición en tono de diccionario académico.', '"[ejemplo de uso]"');

insert into trivia (pregunta, opciones, correcta) values
('¿Dónde fue nuestra primera cita?', '["[lugar A]", "[lugar B]", "[lugar C]", "[lugar D]"]', 0),
('¿Qué película vimos primero juntos?', '["[peli A]", "[peli B]", "[peli C]", "[peli D]"]', 1),
('¿Cuál fue el primer regalo que te hice?', '["[regalo A]", "[regalo B]", "[regalo C]", "[regalo D]"]', 2),
('¿Qué comida pedimos siempre cuando no sabemos qué comer?', '["[comida A]", "[comida B]", "[comida C]", "[comida D]"]', 0),
('¿Cómo se llama nuestro personaje favorito de D&D?', '["[nombre A]", "[nombre B]", "[nombre C]", "[nombre D]"]', 3);

insert into capitulos (numero, titulo, texto, publica_en) values
(1, 'Capítulo 1: El encuentro casual', 'Escribe aquí el primer capítulo, con ustedes dos de protagonistas y un cliffhanger al final. Se libera uno por semana.', now());
