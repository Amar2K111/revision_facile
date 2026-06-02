-- Onboarding : complétion + réponses (analytics / produit ; pas affichées sur le paywall).
alter table public.profiles
  add column if not exists onboarding_completed_at timestamptz,
  add column if not exists onboarding_answers jsonb not null default '{}'::jsonb;

comment on column public.profiles.onboarding_completed_at is
  'Null = l’utilisateur doit passer l’onboarding (sauf Premium actif côté app).';

comment on column public.profiles.onboarding_answers is
  'Réponses du questionnaire onboarding (~15 étapes), JSON libre.';

-- Ligne profil à chaque inscription auth (si la table existe déjà).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- RLS : lecture / mise à jour de son propre profil (idempotent si déjà en place).
alter table public.profiles enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);
