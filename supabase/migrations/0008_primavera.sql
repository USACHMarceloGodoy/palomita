-- Palomita · 21 de septiembre, inicio de la primavera.
-- Se repite cada año (recurrente = true, se compara por mes/día). Dispara en
-- Inicio: girasol gigante + partículas de flores amarillas + mensaje, con X
-- para cerrarlo. También cambia el splash de ese día.

insert into eventos (fecha, tipo_particula, mensaje, recurrente)
select '2026-09-21', 'girasoles', 'FELIZ INICIO DE LA PRIMAVERA AMOR, PERDÓN POR NO PODER LLEVARTE TUS FLORES AMARILLAS, TE AMO.', true
where not exists (
  select 1 from eventos where recurrente and to_char(fecha, 'MM-DD') = '09-21'
);
