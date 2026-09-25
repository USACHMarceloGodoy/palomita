-- Palomita · disparadores de notificación
-- Un insert en checkins / alertas llama a la Edge Function `notificar`
-- usando pg_net directamente (net.http_post), sin depender del schema
-- supabase_functions (que en proyectos nuevos puede no existir hasta que
-- crees un webhook una vez desde la UI). Esta versión funciona siempre.
--
-- Ya viene con tu project ref y tu WEBHOOK_SECRET reemplazados.
-- La función corre con verify_jwt = false y valida un secreto compartido
-- que pasa en el header.

create extension if not exists pg_net;

-- Función genérica: hace un POST a la Edge Function `notificar` avisando
-- qué tabla disparó el insert. net.http_post es asíncrono (encola la
-- petición y no bloquea el insert), así que es seguro llamarlo desde un
-- trigger AFTER INSERT.
create or replace function notificar_webhook()
returns trigger
language plpgsql
security definer
as $$
begin
  perform net.http_post(
    url := 'https://lfjlkdcmhenmqlgeywyc.supabase.co/functions/v1/notificar',
    headers := '{"Content-Type":"application/json","x-webhook-secret":"19b40a2bcd6a3053050f60e60741a02a73a4353a31e2cbff"}'::jsonb,
    body := jsonb_build_object('type', 'INSERT', 'table', TG_TABLE_NAME, 'record', to_jsonb(NEW))
  );
  return NEW;
end;
$$;

drop trigger if exists notificar_checkin on checkins;
create trigger notificar_checkin
  after insert on checkins
  for each row
  execute function notificar_webhook();

drop trigger if exists notificar_alerta on alertas;
create trigger notificar_alerta
  after insert on alertas
  for each row
  execute function notificar_webhook();

-- Mensaje del día programado: la función lo notifica a ella a la hora
-- configurada (`config.hora_mensaje`) usando pg_cron. Ver 0003_cron.sql.
