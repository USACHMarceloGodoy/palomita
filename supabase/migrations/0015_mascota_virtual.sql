-- Palomita · sistema de mascota virtual
--
-- Una mascota por persona (rol 'ella' / 'autor'), tres barras de necesidades
-- con marca de tiempo (el valor real se recalcula con las horas transcurridas),
-- inventario, museo, puntajes de minijuegos y regalos entre mascotas.
-- La moneda son los besitos de siempre (tabla `economia`, tope diario incluido).
-- El catálogo de ítems vive en la app (lib/mascota-virtual/catalogo.ts), como
-- la trivia o el diccionario: se llena por tandas.

create or replace function rol_actual() returns text
language sql stable security definer set search_path = public as $$
  select rol from usuarios where id = auth.uid();
$$;

-- ---------------------------------------------------------------------------
-- Mascota: especie, variantes de orejas/hocico, colores, nombre, look y casa
-- ---------------------------------------------------------------------------
create table if not exists mascota (
  rol text primary key check (rol in ('ella', 'autor')),
  especie text not null check (especie in ('paloma', 'gato', 'perro', 'oso', 'cerdito', 'raton', 'vaca')),
  orejas text not null,
  hocico text not null,
  color_pelaje text not null,
  color_secundario text not null,
  nombre text not null,
  look jsonb not null default '{}'::jsonb,          -- {"cabeza": "sombrero_paja", ...}
  decoracion jsonb not null default '{"pared":"pared_rosa","suelo":"suelo_madera","muebles":["cama"]}'::jsonb,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create table if not exists mascota_necesidades (
  rol text primary key check (rol in ('ella', 'autor')),
  hambre integer not null default 80 check (hambre between 0 and 100),
  hambre_en timestamptz not null default now(),
  higiene integer not null default 80 check (higiene between 0 and 100),
  higiene_en timestamptz not null default now(),
  afecto integer not null default 80 check (afecto between 0 and 100),
  afecto_en timestamptz not null default now(),
  avisado_en timestamptz                           -- último push "tu mascota te necesita"
);

create table if not exists inventario (
  rol text not null check (rol in ('ella', 'autor')),
  item_id text not null,
  cantidad integer not null default 0 check (cantidad >= 0),
  obtenido_en timestamptz not null default now(),
  primary key (rol, item_id)
);

create table if not exists museo_donaciones (
  rol text not null check (rol in ('ella', 'autor')),
  item_id text not null,
  donado_en timestamptz not null default now(),
  primary key (rol, item_id)
);

-- Estadio, pesca, árbol y contadores diarios de cuidado (juego = 'cuidado').
create table if not exists minijuego_puntajes (
  rol text not null check (rol in ('ella', 'autor')),
  juego text not null,
  fecha date not null,
  puntaje integer not null default 0,
  detalle jsonb not null default '{}'::jsonb,
  primary key (rol, juego, fecha)
);

create table if not exists regalos_mascota (
  id uuid primary key default gen_random_uuid(),
  de_rol text not null check (de_rol in ('ella', 'autor')),
  para_rol text not null check (para_rol in ('ella', 'autor')),
  item_id text not null,
  mensaje text,
  creado_en timestamptz not null default now(),
  recibido_en timestamptz
);

-- ---------------------------------------------------------------------------
-- RLS. Los dos ven todo (para las visitas); cada uno escribe lo suyo. Las
-- necesidades de la pareja también se pueden subir (acariciar / alimentar
-- en visita), y los regalos se marcan recibidos solo por quien los recibe.
-- ---------------------------------------------------------------------------
alter table mascota enable row level security;
alter table mascota_necesidades enable row level security;
alter table inventario enable row level security;
alter table museo_donaciones enable row level security;
alter table minijuego_puntajes enable row level security;
alter table regalos_mascota enable row level security;

drop policy if exists mascota_lee on mascota;
create policy mascota_lee on mascota for select using (rol_actual() is not null);
drop policy if exists mascota_escribe on mascota;
create policy mascota_escribe on mascota for all using (rol = rol_actual()) with check (rol = rol_actual());

drop policy if exists necesidades_lee on mascota_necesidades;
create policy necesidades_lee on mascota_necesidades for select using (rol_actual() is not null);
drop policy if exists necesidades_escribe on mascota_necesidades;
create policy necesidades_escribe on mascota_necesidades for all using (rol_actual() is not null) with check (rol_actual() is not null);

drop policy if exists inventario_propio on inventario;
create policy inventario_propio on inventario for all using (rol = rol_actual()) with check (rol = rol_actual());

drop policy if exists museo_lee on museo_donaciones;
create policy museo_lee on museo_donaciones for select using (rol_actual() is not null);
drop policy if exists museo_escribe on museo_donaciones;
create policy museo_escribe on museo_donaciones for all using (rol = rol_actual()) with check (rol = rol_actual());

drop policy if exists puntajes_lee on minijuego_puntajes;
create policy puntajes_lee on minijuego_puntajes for select using (rol_actual() is not null);
drop policy if exists puntajes_escribe on minijuego_puntajes;
create policy puntajes_escribe on minijuego_puntajes for all using (rol = rol_actual()) with check (rol = rol_actual());

drop policy if exists regalos_lee on regalos_mascota;
create policy regalos_lee on regalos_mascota for select using (de_rol = rol_actual() or para_rol = rol_actual());
drop policy if exists regalos_envia on regalos_mascota;
create policy regalos_envia on regalos_mascota for insert with check (de_rol = rol_actual() and para_rol <> de_rol);
drop policy if exists regalos_recibe on regalos_mascota;
create policy regalos_recibe on regalos_mascota for update using (para_rol = rol_actual()) with check (para_rol = rol_actual());

-- El autor ya podía insertar en `economia`; ella también (política de 0001).
-- Los nuevos orígenes (pesca, estadio, mascota:*) pasan por el mismo tope diario.

-- ---------------------------------------------------------------------------
-- Push: regalo nuevo → aviso al que lo recibe (misma Edge Function `notificar`).
-- ---------------------------------------------------------------------------
drop trigger if exists notificar_regalo on regalos_mascota;
create trigger notificar_regalo
  after insert on regalos_mascota
  for each row
  execute function notificar_webhook();

-- Cada dos horas la función revisa si alguna barra está bajo 20 % y avisa
-- (como máximo una vez cada 8 h por persona). Mismo patrón que el mensaje del día.
select cron.unschedule('palomita_mascota') where exists (
  select 1 from cron.job where jobname = 'palomita_mascota');

select cron.schedule(
  'palomita_mascota',
  '15 */2 * * *',
  $$
  select net.http_post(
    url := 'https://lfjlkdcmhenmqlgeywyc.supabase.co/functions/v1/notificar',
    headers := '{"Content-Type":"application/json","x-webhook-secret":"19b40a2bcd6a3053050f60e60741a02a73a4353a31e2cbff"}'::jsonb,
    body := '{"type":"CRON","table":"mascota"}'::jsonb
  );
  $$
);
