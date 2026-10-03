-- Marque qu’un compte a déjà consommé l’essai gratuit Premium (1 trial max).
alter table public.profiles
  add column if not exists premium_trial_used_at timestamptz;

comment on column public.profiles.premium_trial_used_at is
  'Date UTC du premier essai Premium consommé. Null = essai annuel encore disponible.';
