-- Palomita · dejar la app "recién estrenada" antes de entregársela.
-- NO borra nada del contenido que tú escribiste (mensajes, recuerdos,
-- botiquín, multiverso, cápsulas, cupones, trivia, etc.): solo borra las
-- marcas de "ya lo vio" y la actividad generada mientras probabas.
-- Correr una sola vez, en el SQL Editor de Supabase.

-- ---------------------------------------------------------------------------
-- A. Marcas de "ya lo vio / ya lo abrió"
-- ---------------------------------------------------------------------------
update mensajes   set visto_en = null        where visto_en is not null;
update multiverso set descubierto_en = null  where descubierto_en is not null;
update capitulos  set leido_en = null        where leido_en is not null;
update lugares    set desbloqueado_en = null where desbloqueado_en is not null;
update capsulas   set abierta = false, notificada_en = null
  where abierta or notificada_en is not null;

-- Cupones: vuelven a estar a la venta, sin comprar ni usar.
update cupones set comprado_en = null, usado_en = null
  where comprado_en is not null or usado_en is not null;

-- Cupones que se generaron solos al encontrar el tesoro siete veces.
delete from cupones where titulo = 'Cupón del tesoro';

-- ---------------------------------------------------------------------------
-- B. Actividad generada mientras probabas (besitos, juegos, check-ins)
-- ---------------------------------------------------------------------------
delete from economia;        -- saldo de besitos vuelve a 0
delete from granja;          -- animales y macetas vuelven a empezar
delete from checkins;        -- los "¿cómo estuvo tu día?" de prueba
delete from trivia_rondas;   -- la trivia vuelve a estar disponible hoy
delete from ruleta_giros;    -- la ruleta vuelve a poder girarse
delete from tesoro;          -- la búsqueda del tesoro parte de cero
delete from album;           -- álbum de stickers vacío
delete from compras;         -- compras de fotos/audios/comida
delete from alertas;         -- alertas "te necesito"

-- La mascota vuelve a su ánimo inicial.
update config
set valor = '{"animo": 60, "ultima_comida": null, "ultimo_contenido": null}'::jsonb
where clave = 'mascota';
