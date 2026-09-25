-- Palomita · fandom: Hollow Knight, Zelda, Sonic, Mario, Stardew Valley,
-- The Walking Dead, The Big Bang Theory y k-dramas.
--
-- Dos bloques:
--  1. Citas textuales (tipo 'extracto'): solo las que están verificadas palabra por palabra.
--  2. Variantes del Multiverso (categoría 'fandom'): escritas a propósito para ustedes,
--     con referencias al mundo de cada obra. No son citas, así que no hay riesgo de inventar.
-- Si recuerdas una línea exacta de tu drama favorito, agrégala desde el panel.

-- ---------------------------------------------------------------------------
-- 1. Citas verificadas
-- ---------------------------------------------------------------------------
insert into mensajes (texto, tipo) values
('"It''s dangerous to go alone! Take this."
— The Legend of Zelda (1986). Traducción libre: no vayas sola por la vida; llévame.', 'extracto'),
('"Open your eyes... Wake up, Link."
— Zelda, Breath of the Wild. La primera voz que oye al despertar. Yo quiero ser esa para ti.', 'extracto'),
('"Thank you Mario! But our princess is in another castle!"
— Super Mario Bros. Yo ya te encontré, no tengo que seguir buscando castillos.', 'extracto'),
('"Should I apologize, or should I confess?"
— Yoo Si-jin, Descendants of the Sun. Elijo confesar: te amo.', 'extracto'),
('"Every day was good... because of you."
— Kim Shin, Goblin (Guardian: The Lonely and Great God), sobre los días con clima bueno, malo y regular.', 'extracto');

-- ---------------------------------------------------------------------------
-- 2. Multiverso · fandom
-- ---------------------------------------------------------------------------
insert into multiverso (texto, categoria) values
-- Hollow Knight
('Te amo como Hallownest guarda su Alma: en cada rincón, aunque parezca vacío.', 'Hollow Knight'),
('Eres mi banco en Dirtmouth: donde me siento, guardo la partida y todo se arregla.', 'Hollow Knight'),
('Te llevaría la flor delicada por todo el reino sin recibir un solo golpe. Esa es mi prueba de amor.', 'Hollow Knight'),
('Si tuviera Máscaras de Ancestro, todas serían por ti. Nunca me falta vida contigo cerca.', 'Hollow Knight'),
('No soy hueco. Tú me llenaste.', 'Hollow Knight'),
('Te amo con la calma de Quirrel frente al Lago Azul: sin apuro, mirando algo hermoso.', 'Hollow Knight'),
-- Zelda
('Eres mi Trifuerza completa: valor, sabiduría y poder, y a mí me sobra amor.', 'Zelda'),
('Cada vez que te veo suena el jingle de "objeto encontrado".', 'Zelda'),
('Tú eres mi Espada Maestra: te elijo para siempre, y nadie más puede sacarte de mi vida.', 'Zelda'),
('Cruzaría todo Hyrule a pie, sin caballo y sin viaje rápido, solo para llegar a ti.', 'Zelda'),
('Te amo con tres corazones llenos y ninguno de reserva: todos van contigo.', 'Zelda'),
('Eres la Zelda que no necesita rescate: te amo por cómo te rescatas sola y aun así me dejas estar.', 'Zelda'),
-- Sonic
('Te amo a la velocidad del sonido. Y si me choco, me levanto y sigo.', 'Sonic'),
('Eres mi anillo dorado: contigo no me duele nada.', 'Sonic'),
('Si perdiera todos mis anillos, igual me quedaría el más importante: tú.', 'Sonic'),
('Te amo como Tails sigue a Sonic: sin que me lo pidan y sin quedarme atrás.', 'Sonic'),
('Voy tan rápido hacia ti que ni el Chaos Emerald me alcanza.', 'Sonic'),
-- Mario
('Te amo como Mario a la moneda: la busco en cada bloque y celebro cada una.', 'Mario'),
('Contigo tengo estrella de invencibilidad permanente.', 'Mario'),
('Mi princesa no está en otro castillo. Está leyendo esto.', 'Mario'),
('Eres mi 1-UP: contigo siempre tengo una vida más.', 'Mario'),
('Te amo como Luigi a su hermano: desde el segundo jugador, sin protagonismo y sin dudar.', 'Mario'),
('En Odyssey, Peach rechazó a los dos y se fue a viajar sola. Te amo así: libre, y eligiéndome cada día.', 'Mario'),
-- Stardew Valley
('Te daría el ramo, el colgante de sirena y todos mis diamantes. Y aun así me quedaría corto.', 'Stardew Valley'),
('Eres mi Fruta Estelar: la cosecha más valiosa de mi granja.', 'Stardew Valley'),
('Contigo tengo diez corazones y el evento secreto desbloqueado.', 'Stardew Valley'),
('Te amo como el granjero al primer día de primavera: con todo por sembrar.', 'Stardew Valley'),
('Dejaría Joja para vivir contigo en una granja llena de gatos, vacas y cerdos. Ya lo hice: esta app es la granja.', 'Stardew Valley'),
('Cada mañana me despierto a las 6:00 y lo primero que riego es mi cariño por ti.', 'Stardew Valley'),
('Eres mi regalo favorito: nunca fallo cuando te elijo.', 'Stardew Valley'),
-- The Walking Dead
('En el apocalipsis, tú serías la primera persona que buscaría. Y la última que soltaría.', 'The Walking Dead'),
('Yo te cubro la espalda. Nadie pasa de mí.', 'The Walking Dead'),
('Sobreviviría a todos los caminantes solo para llegar a tu puerta.', 'The Walking Dead'),
('Te amo como se cuida un refugio seguro: todos los días, sin bajar la guardia.', 'The Walking Dead'),
('Si el mundo se acaba, mi grupo tiene una sola persona y eres tú.', 'The Walking Dead'),
-- The Big Bang Theory
('Mi función de onda colapsa contigo. Bazinga, pero en serio.', 'The Big Bang Theory'),
('Tú eres mi lugar en el sofá: el punto exacto donde todo está bien.', 'The Big Bang Theory'),
('Según el Acuerdo de Relación, cláusula uno: te amo. Las demás cláusulas están en Ayuda.', 'The Big Bang Theory'),
('Piedra, papel, tijera, lagarto, Spock: contigo gano en cualquier combinación.', 'The Big Bang Theory'),
('Te tocaría la puerta tres veces diciendo tu nombre. Y una cuarta, por si acaso.', 'The Big Bang Theory'),
('Soft kitty, warm kitty: tú cuando tienes sueño. Y yo cantándotelo.', 'The Big Bang Theory'),
-- K-dramas
('Si esto fuera un drama, ya habríamos tenido el segundo encuentro casual. Y el tercero.', 'K-drama'),
('Te amo con paraguas rojo y lluvia de fondo. Cliché a propósito.', 'K-drama'),
('Eres el episodio 16: donde todo se resuelve y nadie se va.', 'K-drama'),
('Te amo como el protagonista que aparece justo cuando empieza a llover.', 'K-drama'),
('Contigo hasta el ramyeon de conveniencia sabe a cena de aniversario.', 'K-drama'),
('Si aterrizara en otro país por accidente, te buscaría igual que en Crash Landing on You.', 'K-drama'),
('No necesito un goblin inmortal ni un alienígena de otra estrella: tú eres mi trama principal.', 'K-drama'),
('Te amo como el primer beso bajo los cerezos: en cámara lenta, con música de fondo.', 'K-drama'),
('Sé el "piggyback" de tu drama favorito: cuando estés cansada, te cargo a casa.', 'K-drama');
