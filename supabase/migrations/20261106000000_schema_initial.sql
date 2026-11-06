-- Schéma initial de « Mes dépenses » (ARCHITECTURE.md §5 et §6).
-- À exécuter une seule fois dans l'éditeur SQL du projet Supabase.
-- La RLS est activée sur chaque table dès sa création.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.entreprises (
  id   uuid primary key default gen_random_uuid(),
  nom  text not null
);
alter table public.entreprises enable row level security;

create table public.membres (
  entreprise_id  uuid references public.entreprises on delete cascade,
  utilisateur_id uuid references auth.users on delete cascade,
  role           text not null default 'gerant' check (role in ('gerant', 'collaborateur')),
  primary key (entreprise_id, utilisateur_id)
);
alter table public.membres enable row level security;
-- Les politiques cherchent les entreprises d'un utilisateur : index dédié.
create index on public.membres (utilisateur_id);

create table public.depenses (
  id            uuid primary key default gen_random_uuid(), -- fourni par l'app
  entreprise_id uuid not null references public.entreprises on delete cascade,
  date          date not null,
  montant       integer not null check (montant > 0),
  categorie     text not null check (categorie in ('abonnement', 'fixe', 'salaires')),
  description   text check (char_length(description) <= 100),
  cree_par      uuid default auth.uid() references auth.users,
  cree_le       timestamptz not null default now(),
  modifie_le    timestamptz not null default now()
);
alter table public.depenses enable row level security;
create index on public.depenses (entreprise_id, date);

-- ---------------------------------------------------------------------------
-- Droits : rien pour les visiteurs non connectés (anon)
-- ---------------------------------------------------------------------------

revoke all on table public.entreprises, public.membres, public.depenses from anon;
grant select on table public.entreprises, public.membres to authenticated;
grant select, insert, update, delete on table public.depenses to authenticated;

-- ---------------------------------------------------------------------------
-- Politiques RLS
-- ---------------------------------------------------------------------------

-- Un utilisateur ne voit que ses propres adhésions.
-- (Pas de sous-requête sur membres ici : elle provoquerait une récursion infinie.)
create policy "lecture de ses adhésions" on public.membres
  for select to authenticated
  using (utilisateur_id = (select auth.uid()));

-- Un utilisateur ne voit que les entreprises dont il est membre.
create policy "lecture par les membres" on public.entreprises
  for select to authenticated
  using (id in (select entreprise_id from public.membres where utilisateur_id = (select auth.uid())));

-- Un utilisateur lit et écrit uniquement les dépenses des entreprises dont il est membre.
create policy "membres de l'entreprise" on public.depenses
  for all to authenticated
  using      (entreprise_id in (select entreprise_id from public.membres where utilisateur_id = (select auth.uid())))
  with check (entreprise_id in (select entreprise_id from public.membres where utilisateur_id = (select auth.uid())));

-- Aucune politique d'insertion sur entreprises et membres :
-- seule la fonction assurer_entreprise() ci-dessous y écrit.

-- ---------------------------------------------------------------------------
-- Rattachement automatique à une entreprise
-- ---------------------------------------------------------------------------

-- Renvoie l'entreprise de l'utilisateur connecté. S'il n'en a aucune, la crée
-- (« Mon entreprise ») et l'y ajoute comme gérant. Idempotente : deux appels
-- simultanés (deux onglets) ne créent qu'une entreprise grâce au verrou.
create or replace function public.assurer_entreprise()
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_utilisateur uuid := auth.uid();
  v_entreprise  uuid;
begin
  if v_utilisateur is null then
    raise exception 'Utilisateur non connecté' using errcode = '42501';
  end if;

  -- Verrou propre à cet utilisateur, libéré à la fin de la transaction.
  perform pg_advisory_xact_lock(hashtextextended(v_utilisateur::text, 0));

  select m.entreprise_id into v_entreprise
  from public.membres m
  where m.utilisateur_id = v_utilisateur
  limit 1;

  if v_entreprise is null then
    insert into public.entreprises (nom)
    values ('Mon entreprise')
    returning id into v_entreprise;

    insert into public.membres (entreprise_id, utilisateur_id, role)
    values (v_entreprise, v_utilisateur, 'gerant');
  end if;

  return v_entreprise;
end;
$$;

revoke execute on function public.assurer_entreprise() from public, anon;
grant execute on function public.assurer_entreprise() to authenticated;
