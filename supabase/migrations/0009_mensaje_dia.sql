-- Palomita · mensaje del día especial por evento (ej: la letra de una canción
-- el 21 de septiembre en vez del mensaje al azar de siempre). Se llena desde
-- el panel (Calendario), no acá: por derechos de autor no se generan letras
-- de canciones por código.

alter table eventos add column if not exists mensaje_dia text;
