-- Palomita · notas del día (modo autor desde el celular)
-- Notas sueltas que le dejas desde tu teléfono: texto, un dibujo hecho a
-- dedo (SVG en el bucket `media`), o las dos cosas. Aparecen en Inicio
-- mientras no las vea, y después quedan guardadas en el Baúl.

create table if not exists notas (
  id uuid primary key default gen_random_uuid(),
  texto text,
  dibujo_path text,                       -- SVG en el bucket media, opcional
  creado_en timestamptz not null default now(),
  visto_en timestamptz,
  -- Al menos una de las dos cosas: no tiene sentido una nota vacía.
  constraint nota_con_algo check (texto is not null or dibujo_path is not null)
);

alter table notas enable row level security;

drop policy if exists autor_todo on notas;
create policy autor_todo on notas for all using (es_autor()) with check (es_autor());

drop policy if exists ella_lee_notas on notas;
create policy ella_lee_notas on notas for select using (es_ella());

drop policy if exists ella_marca_notas on notas;
create policy ella_marca_notas on notas for update using (es_ella()) with check (es_ella());

-- Cuando le dejas una nota, le llega push. Reusa la misma función de
-- webhook que ya usan checkins y alertas (0002).
drop trigger if exists notificar_nota on notas;
create trigger notificar_nota
  after insert on notas
  for each row
  execute function notificar_webhook();

-- Ella necesita poder escribirte de vuelta un "estoy pensando en ti" sin que
-- sea un check-in del día. Las alertas ya existen; esto solo permite que el
-- autor las lea (antes solo las insertaba ella y las leía la Edge Function).
drop policy if exists ella_inserta_alertas on alertas;
create policy ella_inserta_alertas on alertas for insert with check (es_ella());
