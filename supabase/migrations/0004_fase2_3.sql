-- Palomita · tablas de Fase 2 y 3

create table if not exists diccionario (
  id uuid primary key default gen_random_uuid(),
  palabra text not null,
  definicion text not null,
  ejemplo text,
  creado_en timestamptz not null default now()
);

create table if not exists capitulos (
  id uuid primary key default gen_random_uuid(),
  numero integer not null unique,
  titulo text not null,
  texto text not null,
  publica_en timestamptz not null,       -- un capítulo por semana, con cliffhanger
  leido_en timestamptz
);

create table if not exists tesoro (
  id uuid primary key default gen_random_uuid(),
  fecha date not null unique,            -- día en que lo encontró
  pantalla text not null
);

create table if not exists trivia_rondas (
  id uuid primary key default gen_random_uuid(),
  fecha date not null unique,
  correctas integer not null default 0
);

create table if not exists ruleta_giros (
  id uuid primary key default gen_random_uuid(),
  premio_id uuid references ruleta(id),
  fecha timestamptz not null default now(),
  canjeado_en timestamptz
);

-- Compras de la tienda que no son cupones: foto inédita, audio, comida.
create table if not exists compras (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('foto', 'audio', 'comida')),
  recuerdo_id uuid references recuerdos(id),
  botiquin_id uuid references botiquin(id),
  fecha timestamptz not null default now()
);

-- Contenido "inédito": recuerdos y audios marcados así solo se ven al comprarlos.
alter table recuerdos add column if not exists inedito boolean not null default false;
alter table botiquin add column if not exists inedito boolean not null default false;

-- Mascota: estado persistente (ánimo 0-100 y última comida).
insert into config (clave, valor) values
  ('mascota', '{"animo": 60, "ultima_comida": null, "ultimo_contenido": null}'),
  ('acuerdo_relacion', '["Cláusula 1: [escribe tu cláusula romántica]", "Cláusula 2: [otra]"]'),
  ('chiste_bazinga', '"[tu chiste interno aquí]"')
on conflict (clave) do nothing;

do $$
declare t text;
begin
  foreach t in array array['diccionario','capitulos','tesoro','trivia_rondas','ruleta_giros','compras'] loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists autor_todo on %I', t);
    execute format('create policy autor_todo on %I for all using (es_autor()) with check (es_autor())', t);
  end loop;
end $$;

create policy ella_lee_diccionario on diccionario for select using (es_ella());
-- Capítulos: solo los ya publicados. El filtro va en Postgres, como las cápsulas.
create policy ella_lee_capitulos on capitulos for select using (es_ella() and publica_en <= now());
create policy ella_marca_capitulos on capitulos for update using (es_ella() and publica_en <= now()) with check (es_ella());
create policy ella_tesoro on tesoro for select using (es_ella());
create policy ella_tesoro_insert on tesoro for insert with check (es_ella());
create policy ella_rondas on trivia_rondas for select using (es_ella());
create policy ella_rondas_insert on trivia_rondas for insert with check (es_ella());
create policy ella_giros on ruleta_giros for select using (es_ella());
create policy ella_giros_insert on ruleta_giros for insert with check (es_ella());
create policy ella_compras on compras for select using (es_ella());
create policy ella_compras_insert on compras for insert with check (es_ella());
create policy ella_edita_config_mascota on config for update using (es_ella() and clave = 'mascota') with check (es_ella() and clave = 'mascota');

-- Lo inédito no se ve hasta comprarlo (reemplaza las políticas de lectura de ella).
drop policy if exists ella_lee_recuerdos on recuerdos;
create policy ella_lee_recuerdos on recuerdos for select using (
  es_ella() and (not inedito or exists (select 1 from compras where compras.recuerdo_id = recuerdos.id))
);
drop policy if exists ella_lee_botiquin on botiquin;
create policy ella_lee_botiquin on botiquin for select using (
  es_ella() and (not inedito or exists (select 1 from compras where compras.botiquin_id = botiquin.id))
);

-- Comprar algo inédito al azar: elige, cobra y registra en una sola transacción.
create or replace function comprar_inedito(p_tipo text, p_costo integer) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_saldo integer;
  v_id uuid;
begin
  if not es_ella() then raise exception 'solo ella'; end if;
  select coalesce(sum(monto), 0) into v_saldo from economia;
  if v_saldo < p_costo then return null; end if;
  if p_tipo = 'foto' then
    select id into v_id from recuerdos r where inedito and not exists (select 1 from compras c where c.recuerdo_id = r.id) order by random() limit 1;
    if v_id is null then return null; end if;
    insert into compras (tipo, recuerdo_id) values ('foto', v_id);
  elsif p_tipo = 'audio' then
    select id into v_id from botiquin b where inedito and not exists (select 1 from compras c where c.botiquin_id = b.id) order by random() limit 1;
    if v_id is null then return null; end if;
    insert into compras (tipo, botiquin_id) values ('audio', v_id);
  else
    raise exception 'tipo desconocido';
  end if;
  insert into economia (origen, monto) values ('tienda:' || p_tipo, -p_costo);
  return v_id;
end $$;

grant execute on function comprar_inedito(text, integer) to authenticated;

-- Cápsulas futuras: ella solo ve título y fecha (candado con cuenta regresiva), nunca el contenido.
create or replace function capsulas_proximas() returns table (id uuid, titulo text, abre_en timestamptz)
language sql stable security definer set search_path = public as $$
  select id, titulo, abre_en from capsulas where abre_en > now() order by abre_en;
$$;
grant execute on function capsulas_proximas() to authenticated;
