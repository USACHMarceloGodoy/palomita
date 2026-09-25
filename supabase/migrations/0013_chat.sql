-- Palomita · chat cifrado de extremo a extremo
--
-- La columna `cifrado` guarda base64(nonce || XSalsa20-Poly1305). Adentro va
-- un JSON {"t": texto, "s": sticker_id} — o sea que hasta el sticker viaja
-- cifrado. El servidor no tiene la clave: se deriva de una frase secreta que
-- ustedes dos escriben en su propio teléfono y vive solo en el llavero de
-- cada aparato. Desde el dashboard de Supabase esto no se puede leer.

create table if not exists mensajes_chat (
  id uuid primary key default gen_random_uuid(),
  autor_rol text not null check (autor_rol in ('ella', 'autor')),
  cifrado text not null,
  creado_en timestamptz not null default now(),
  leido_en timestamptz
);

create index if not exists mensajes_chat_fecha on mensajes_chat (creado_en desc);

alter table mensajes_chat enable row level security;

-- Los dos leen todo el hilo.
drop policy if exists chat_lee on mensajes_chat;
create policy chat_lee on mensajes_chat for select using (es_ella() or es_autor());

-- Cada uno solo puede escribir mensajes firmados con su propio rol: ella no
-- puede insertar un mensaje que parezca de él, ni al revés.
drop policy if exists chat_escribe on mensajes_chat;
create policy chat_escribe on mensajes_chat for insert with check (
  (es_ella() and autor_rol = 'ella') or (es_autor() and autor_rol = 'autor')
);

-- Marcar como leído: solo los mensajes que te mandó el otro.
drop policy if exists chat_marca_leido on mensajes_chat;
create policy chat_marca_leido on mensajes_chat for update using (
  (es_ella() and autor_rol = 'autor') or (es_autor() and autor_rol = 'ella')
) with check (
  (es_ella() and autor_rol = 'autor') or (es_autor() and autor_rol = 'ella')
);

-- Cada uno puede borrar lo que escribió él mismo.
drop policy if exists chat_borra_lo_suyo on mensajes_chat;
create policy chat_borra_lo_suyo on mensajes_chat for delete using (
  (es_ella() and autor_rol = 'ella') or (es_autor() and autor_rol = 'autor')
);

-- Mensajes al instante, sin recargar.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'mensajes_chat'
  ) then
    alter publication supabase_realtime add table mensajes_chat;
  end if;
end $$;

-- Push al otro cuando llega un mensaje. La notificación no puede mostrar el
-- texto: el servidor no sabe qué dice. Solo avisa que hay algo nuevo.
drop trigger if exists notificar_chat on mensajes_chat;
create trigger notificar_chat
  after insert on mensajes_chat
  for each row
  execute function notificar_webhook();

-- El "testigo" del cifrado: un texto conocido cifrado con la frase, que sirve
-- para avisarle al segundo que configure si se equivocó al escribirla (si no,
-- los mensajes saldrían ilegibles y nadie entendería por qué). Va en `config`
-- y cualquiera de los dos puede crearlo, el que llegue primero.
drop policy if exists ella_escribe_testigo on config;
create policy ella_escribe_testigo on config for insert
  with check (es_ella() and clave = 'chat_testigo');

drop policy if exists ella_actualiza_testigo on config;
create policy ella_actualiza_testigo on config for update
  using (es_ella() and clave = 'chat_testigo')
  with check (es_ella() and clave = 'chat_testigo');
