-- Palomita · contenido del Acuerdo de relación (easter egg de Ayuda).
-- Reemplaza los placeholders de 0004. Edítalas cuando quieras desde el panel
-- o corriendo otro update sobre config.

update config
set valor = '["Cláusula 1 — De los abrazos: ningún abrazo termina hasta que ambas partes estén de acuerdo. En caso de duda, se extiende.", "Cláusula 2 — De los días malos: cuando una parte tenga un día horrible, la otra se compromete a escuchar primero y a ofrecer soluciones solo si se las piden.", "Cláusula 3 — Del último pedazo: el último pedazo de cualquier cosa rica se ofrece siempre a la otra parte, aunque las dos sepamos perfectamente cómo va a terminar esa negociación.", "Cláusula 4 — De las discusiones: ninguna pelea sobrevive a la noche sin un “igual te amo”. Se discute siempre del mismo lado de la mesa, nunca en lados opuestos.", "Cláusula 5 — De las tonteras: se garantiza el derecho a contar la misma historia todas las veces que se quiera, y la obligación correlativa de reírse igual.", "Cláusula 6 — De la distancia: la distancia se declara un inconveniente temporal, sin efecto alguno sobre lo que sentimos. Ninguna cantidad de kilómetros modifica lo pactado.", "Cláusula 7 — Del frío: quien tenga las manos más tibias las cede sin reclamar.", "Cláusula 8 — De las flores: toda ocasión es motivo suficiente. No se requiere justificación, permiso ni fecha especial.", "Cláusula 9 — De los miedos: ninguna parte tiene que ser fuerte todo el tiempo. Está permitido llegar rota y que la reciban igual de completa.", "Cláusula 10 — De la vigencia: este acuerdo no tiene fecha de término. Se renueva solo, todos los días, sin necesidad de firma."]'::jsonb
where clave = 'acuerdo_relacion';

-- Chiste del Bazinga: texto puente hasta que pongas el chiste interno real.
update config
set valor = '"Bazinga. Te amo. Las dos cosas van en serio, adivina cuál."'::jsonb
where clave = 'chiste_bazinga';
