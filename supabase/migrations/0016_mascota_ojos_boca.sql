-- Palomita · mascota virtual: variantes de ojos y boca elegibles.
-- Con hocico 'pico' la app no dibuja boca (el pico ya lo es).

alter table mascota add column if not exists ojos text not null default 'redondos';
alter table mascota add column if not exists boca text not null default 'sonrisa';
