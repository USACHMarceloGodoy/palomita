-- Palomita · notas en los dos sentidos
--
-- Hasta ahora las notas iban solo de él para ella. Ahora ella también puede
-- escribirle y dibujarle. Cada nota sabe quién la mandó, y en Inicio cada uno
-- ve la última que le dejó el otro.

alter table notas add column if not exists autor_rol text not null default 'autor';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'notas_autor_rol_check') then
    alter table notas add constraint notas_autor_rol_check check (autor_rol in ('ella', 'autor'));
  end if;
end $$;

-- Permisos: cada uno escribe con su propio nombre, lee las dos, marca como
-- vista solo la del otro y borra solo las suyas.
drop policy if exists autor_todo on notas;
drop policy if exists ella_lee_notas on notas;
drop policy if exists ella_marca_notas on notas;

create policy notas_leer on notas for select using (es_ella() or es_autor());

create policy notas_escribir on notas for insert with check (
  (es_ella() and autor_rol = 'ella') or (es_autor() and autor_rol = 'autor')
);

create policy notas_marcar_vista on notas for update using (
  (es_ella() and autor_rol = 'autor') or (es_autor() and autor_rol = 'ella')
) with check (
  (es_ella() and autor_rol = 'autor') or (es_autor() and autor_rol = 'ella')
);

create policy notas_borrar_lo_suyo on notas for delete using (
  (es_ella() and autor_rol = 'ella') or (es_autor() and autor_rol = 'autor')
);

-- Ella necesita poder subir sus dibujos al bucket `media`. Las políticas de
-- storage viven en storage.objects, no en la tabla.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'ella_sube_dibujos'
  ) then
    create policy ella_sube_dibujos on storage.objects for insert to authenticated
      with check (bucket_id = 'media' and (storage.foldername(name))[1] = 'notas' and es_ella());
  end if;
end $$;
