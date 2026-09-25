-- Palomita · esquema base
-- Dos usuarios en total: ella (lectora) y tú (autor). Se crean a mano en Auth
-- y se registran en `usuarios` con su rol.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Usuarios y helpers de rol
-- ---------------------------------------------------------------------------
create table if not exists usuarios (
  id uuid primary key references auth.users(id) on delete cascade,
  rol text not null check (rol in ('ella', 'autor')),
  nombre text not null,
  push_token text,
  creado_en timestamptz not null default now()
);

create or replace function es_autor() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from usuarios where id = auth.uid() and rol = 'autor');
$$;

create or replace function es_ella() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from usuarios where id = auth.uid() and rol = 'ella');
$$;

create or replace function hoy_santiago() returns date
language sql stable as $$
  select (now() at time zone 'America/Santiago')::date;
$$;

-- ---------------------------------------------------------------------------
-- Contenido que tú publicas
-- ---------------------------------------------------------------------------
create table if not exists mensajes (
  id uuid primary key default gen_random_uuid(),
  texto text not null,
  tipo text not null default 'nota' check (tipo in ('nota', 'poema', 'extracto')),
  fecha_publicacion timestamptz,          -- null = entra a la base rotativa
  visto_en timestamptz,
  creado_en timestamptz not null default now()
);

create table if not exists recuerdos (
  id uuid primary key default gen_random_uuid(),
  foto_path text not null,
  thumb_path text,
  texto text not null default '',
  fecha date,
  lugar text,
  audio_path text,
  tags text[] not null default '{}',
  creado_en timestamptz not null default now()
);

create table if not exists botiquin (
  id uuid primary key default gen_random_uuid(),
  categoria text not null check (categoria in ('animos', 'feliz', 'logro', 'extrano')),
  tipo text not null check (tipo in ('texto', 'audio', 'video')),
  texto text,
  media_path text,
  creado_en timestamptz not null default now()
);

create table if not exists multiverso (
  id uuid primary key default gen_random_uuid(),
  texto text not null,
  categoria text not null default 'general',
  descubierto_en timestamptz,
  creado_en timestamptz not null default now()
);

create table if not exists capsulas (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  contenido text,
  media_path text,
  abre_en timestamptz not null,
  abierta boolean not null default false,
  notificada_en timestamptz,
  creado_en timestamptz not null default now()
);

create table if not exists lugares (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  lat double precision not null,
  lng double precision not null,
  radio_m integer not null default 150,
  recuerdo_id uuid references recuerdos(id) on delete set null,
  desbloqueado_en timestamptz
);

create table if not exists trivia (
  id uuid primary key default gen_random_uuid(),
  pregunta text not null,
  opciones jsonb not null,                -- ["a","b","c","d"]
  correcta smallint not null,
  premio_id uuid
);

create table if not exists ruleta (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descripcion text,
  peso integer not null default 1,
  activo boolean not null default true
);

create table if not exists cupones (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descripcion text,
  costo integer not null,
  comprado_en timestamptz,
  usado_en timestamptz,
  qr_token text unique default encode(gen_random_bytes(12), 'hex')
);

create table if not exists stickers (
  id uuid primary key default gen_random_uuid(),
  coleccion text not null,
  nombre text not null,
  rareza text not null default 'comun' check (rareza in ('comun', 'raro', 'epico')),
  img_path text not null
);

create table if not exists eventos (
  id uuid primary key default gen_random_uuid(),
  fecha date not null,                    -- para recurrentes se compara mes/día
  tipo_particula text not null,           -- clave del motor: volantines, flores-amarillas, ...
  mensaje text,
  recurrente boolean not null default true
);

create table if not exists config (
  clave text primary key,
  valor jsonb not null
);

-- ---------------------------------------------------------------------------
-- Lo que ella genera
-- ---------------------------------------------------------------------------
create table if not exists checkins (
  id uuid primary key default gen_random_uuid(),
  fecha date not null default (now() at time zone 'America/Santiago')::date,
  emoji text not null check (emoji in ('fatal', 'mal', 'normal', 'bien', 'genial')),
  texto text,
  respondido boolean not null default false,
  creado_en timestamptz not null default now(),
  unique (fecha)
);

create table if not exists respuestas_checkin (
  id uuid primary key default gen_random_uuid(),
  emoji text not null check (emoji in ('fatal', 'mal', 'normal', 'bien', 'genial')),
  texto text not null
);

create table if not exists economia (
  id uuid primary key default gen_random_uuid(),
  fecha timestamptz not null default now(),
  origen text not null,                   -- checkin, granja, laberinto, tienda:cupon, ...
  monto integer not null                  -- positivo gana, negativo gasta
);

create or replace view saldo_besitos as
  select coalesce(sum(monto), 0)::integer as saldo from economia;

create or replace view ganado_hoy as
  select coalesce(sum(monto), 0)::integer as ganado
  from economia
  where monto > 0
    and (fecha at time zone 'America/Santiago')::date = (now() at time zone 'America/Santiago')::date;

create table if not exists album (
  id uuid primary key default gen_random_uuid(),
  sticker_id uuid not null references stickers(id) on delete cascade,
  obtenido_en timestamptz not null default now()
);

create table if not exists granja (
  id uuid primary key default gen_random_uuid(),
  entidad text not null,                  -- vaca, cerdo, gato, maceta_1, ...
  tipo text not null check (tipo in ('animal', 'planta')),
  ultima_interaccion timestamptz,
  nivel_crecimiento integer not null default 0,
  unique (entidad)
);

create table if not exists alertas (
  id uuid primary key default gen_random_uuid(),
  tipo text not null,                     -- te_necesito
  creado_en timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- RLS: activo en todo desde el primer día
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'usuarios','mensajes','recuerdos','botiquin','multiverso','capsulas','lugares',
    'trivia','ruleta','cupones','stickers','eventos','config','checkins',
    'respuestas_checkin','economia','album','granja','alertas'
  ] loop
    execute format('alter table %I enable row level security', t);
  end loop;
end $$;

-- El autor puede todo, en todas las tablas.
do $$
declare t text;
begin
  foreach t in array array[
    'usuarios','mensajes','recuerdos','botiquin','multiverso','capsulas','lugares',
    'trivia','ruleta','cupones','stickers','eventos','config','checkins',
    'respuestas_checkin','economia','album','granja','alertas'
  ] loop
    execute format('drop policy if exists autor_todo on %I', t);
    execute format('create policy autor_todo on %I for all using (es_autor()) with check (es_autor())', t);
  end loop;
end $$;

-- Ella: leer contenido y marcar visto.
create policy ella_lee_usuarios on usuarios for select using (es_ella());
create policy ella_edita_su_usuario on usuarios for update using (es_ella() and id = auth.uid());

create policy ella_lee_mensajes on mensajes for select using (es_ella());
create policy ella_marca_mensajes on mensajes for update using (es_ella()) with check (es_ella());

create policy ella_lee_recuerdos on recuerdos for select using (es_ella());
create policy ella_lee_botiquin on botiquin for select using (es_ella());

create policy ella_lee_multiverso on multiverso for select using (es_ella());
create policy ella_marca_multiverso on multiverso for update using (es_ella()) with check (es_ella());

-- La cápsula solo existe para ella cuando ya es hora. El filtro va aquí, no en la app.
create policy ella_lee_capsulas on capsulas for select using (es_ella() and abre_en <= now());
create policy ella_abre_capsulas on capsulas for update using (es_ella() and abre_en <= now()) with check (es_ella());

create policy ella_lee_lugares on lugares for select using (es_ella());
create policy ella_marca_lugares on lugares for update using (es_ella()) with check (es_ella());
create policy ella_lee_trivia on trivia for select using (es_ella());
create policy ella_lee_ruleta on ruleta for select using (es_ella());
create policy ella_lee_stickers on stickers for select using (es_ella());
create policy ella_lee_eventos on eventos for select using (es_ella());
create policy ella_lee_respuestas on respuestas_checkin for select using (es_ella());
create policy ella_lee_config on config for select using (es_ella() and clave not like 'privado:%');

create policy ella_lee_cupones on cupones for select using (es_ella());
create policy ella_compra_cupones on cupones for update using (es_ella() and comprado_en is null) with check (es_ella());

create policy ella_checkins on checkins for select using (es_ella());
create policy ella_inserta_checkins on checkins for insert with check (es_ella());

create policy ella_economia on economia for select using (es_ella());
create policy ella_gana_besitos on economia for insert with check (es_ella());

create policy ella_album on album for select using (es_ella());
create policy ella_obtiene_sticker on album for insert with check (es_ella());

create policy ella_granja on granja for select using (es_ella());
create policy ella_granja_insert on granja for insert with check (es_ella());
create policy ella_granja_update on granja for update using (es_ella()) with check (es_ella());

create policy ella_alerta on alertas for insert with check (es_ella());

-- Las vistas heredan las políticas de `economia`.
grant select on saldo_besitos, ganado_hoy to authenticated;

-- ---------------------------------------------------------------------------
-- Tope diario de besitos (~60): se aplica en la base, no en la app.
-- ---------------------------------------------------------------------------
create or replace function limitar_ganancia_diaria() returns trigger
language plpgsql as $$
declare
  tope integer := coalesce((select (valor->>0)::int from config where clave = 'tope_diario'), 60);
  ganado integer;
begin
  if new.monto <= 0 then return new; end if;
  select coalesce(sum(monto), 0) into ganado from economia
   where monto > 0
     and (fecha at time zone 'America/Santiago')::date = (now() at time zone 'America/Santiago')::date;
  if ganado >= tope then
    return null;                          -- silencioso: no se inserta
  end if;
  new.monto := least(new.monto, tope - ganado);
  return new;
end $$;

drop trigger if exists trg_tope_diario on economia;
create trigger trg_tope_diario before insert on economia
  for each row execute function limitar_ganancia_diaria();

-- ---------------------------------------------------------------------------
-- Storage: un bucket privado. Las URLs se firman desde la app.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
  values ('media', 'media', false)
  on conflict (id) do nothing;

drop policy if exists media_lee_autenticado on storage.objects;
create policy media_lee_autenticado on storage.objects
  for select using (bucket_id = 'media' and auth.role() = 'authenticated');

drop policy if exists media_escribe_autor on storage.objects;
create policy media_escribe_autor on storage.objects
  for all using (bucket_id = 'media' and es_autor()) with check (bucket_id = 'media' and es_autor());

-- ---------------------------------------------------------------------------
-- Semillas mínimas
-- ---------------------------------------------------------------------------
insert into config (clave, valor) values
  ('tope_diario', '60'),
  ('nombre_ella', '"[NOMBRE]"'),
  ('fecha_inicio', '"2024-01-01"'),
  ('hora_mensaje', '"09:00"')
on conflict (clave) do nothing;

insert into eventos (fecha, tipo_particula, mensaje, recurrente) values
  ('2026-09-18', 'volantines', 'Feliz 18, mi amor', true),
  ('2026-09-21', 'flores-amarillas', 'Flores amarillas, como en la canción', true),
  ('2026-02-14', 'corazones', 'Feliz día de los enamorados', true)
on conflict do nothing;

insert into respuestas_checkin (emoji, texto) values
  ('fatal', 'Día feo. No tienes que explicarlo ni arreglarlo hoy. Yo me quedo acá mientras pasa.'),
  ('mal', 'Gracias por contarme igual. Si quieres, esta noche te llamo y no hablamos de nada importante.'),
  ('normal', 'Los días normales también cuentan. Igual me alegraste el mío con solo abrir esto.'),
  ('bien', 'Qué bueno. Cuéntame después qué fue lo mejor, quiero el detalle largo.'),
  ('genial', 'Te leí y me reí solo. Guárdame ese ánimo para el fin de semana.');

insert into granja (entidad, tipo) values
  ('vaca', 'animal'), ('cerdo', 'animal'), ('gato', 'animal'),
  ('maceta_1', 'planta'), ('maceta_2', 'planta'), ('maceta_3', 'planta')
on conflict (entidad) do nothing;
