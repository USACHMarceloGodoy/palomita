-- Palomita · cuentos para Modo dormir
-- Audios tuyos leyéndole un cuento, en bucle, en /dormir. Antes esa pantalla
-- reciclaba los audios de "Necesito ánimos" del Botiquín; ahora tiene su
-- propia tabla para no mezclar los dos usos.

create table if not exists cuentos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  audio_path text not null,
  duracion_seg integer,
  creado_en timestamptz not null default now()
);

alter table cuentos enable row level security;

drop policy if exists autor_todo on cuentos;
create policy autor_todo on cuentos for all using (es_autor()) with check (es_autor());

create policy ella_lee_cuentos on cuentos for select using (es_ella());
