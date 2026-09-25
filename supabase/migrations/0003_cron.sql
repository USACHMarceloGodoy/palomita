-- Palomita · tareas programadas
-- Aviso diario a ella a las 09:00 de Chile si hay mensaje nuevo para hoy,
-- y apertura automática de cápsulas cuya fecha ya llegó.
--
-- Requiere habilitar pg_cron en Database > Extensions.
-- Ya viene con tu project ref y tu WEBHOOK_SECRET reemplazados.

create extension if not exists pg_cron;

-- 09:00 America/Santiago ≈ 12:00 UTC (13:00 en horario de invierno).
-- pg_cron corre en UTC; se usa 12:00 y la función decide si ya avisó hoy.
select cron.unschedule('palomita_mensaje_del_dia') where exists (
  select 1 from cron.job where jobname = 'palomita_mensaje_del_dia');

select cron.schedule(
  'palomita_mensaje_del_dia',
  '0 12 * * *',
  $$
  select net.http_post(
    url := 'https://lfjlkdcmhenmqlgeywyc.supabase.co/functions/v1/notificar',
    headers := '{"Content-Type":"application/json","x-webhook-secret":"19b40a2bcd6a3053050f60e60741a02a73a4353a31e2cbff"}'::jsonb,
    body := '{"type":"CRON","table":"mensajes"}'::jsonb
  );
  $$
);

select cron.unschedule('palomita_capsulas') where exists (
  select 1 from cron.job where jobname = 'palomita_capsulas');

select cron.schedule(
  'palomita_capsulas',
  '*/30 * * * *',
  $$
  select net.http_post(
    url := 'https://lfjlkdcmhenmqlgeywyc.supabase.co/functions/v1/notificar',
    headers := '{"Content-Type":"application/json","x-webhook-secret":"19b40a2bcd6a3053050f60e60741a02a73a4353a31e2cbff"}'::jsonb,
    body := '{"type":"CRON","table":"capsulas"}'::jsonb
  );
  $$
);
