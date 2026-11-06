-- Date de modification des dépenses, tenue par la base (et non par l'horloge
-- du téléphone). Protège aussi la date et l'auteur de création.
-- À exécuter après 20261106000000_schema_initial.sql.
-- Retour arrière :
--   drop trigger avant_modification on public.depenses;
--   drop function public.avant_modification_depense();

create or replace function public.avant_modification_depense()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.modifie_le := now();
  new.cree_le    := old.cree_le;
  new.cree_par   := old.cree_par;
  return new;
end;
$$;

create trigger avant_modification
  before update on public.depenses
  for each row execute function public.avant_modification_depense();
