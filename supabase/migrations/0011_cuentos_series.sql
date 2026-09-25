-- Palomita · cuentos por serie (novelas por capítulos)
-- Ahora ella elige qué escuchar esa noche: un cuento suelto, o una serie que
-- avanza capítulo por capítulo y recuerda dónde quedó.
--   serie  → null = cuento suelto; con texto = nombre de la novela.
--   numero → orden del capítulo dentro de la serie (1, 2, 3...).
--   escuchado_en → la última vez que ella lo puso. Sirve para "seguir donde
--                  quedaste" y no se borra al escucharlo de nuevo.

alter table cuentos add column if not exists serie text;
alter table cuentos add column if not exists numero integer;
alter table cuentos add column if not exists escuchado_en timestamptz;

-- Ella necesita poder marcar el capítulo como escuchado (igual que hace con
-- los mensajes y el multiverso).
drop policy if exists ella_marca_cuentos on cuentos;
create policy ella_marca_cuentos on cuentos for update using (es_ella()) with check (es_ella());

-- Un capítulo por número dentro de cada serie. Los cuentos sueltos (serie
-- null) no entran en el índice, así que no se estorban entre ellos.
create unique index if not exists cuentos_serie_numero
  on cuentos (serie, numero)
  where serie is not null and numero is not null;
