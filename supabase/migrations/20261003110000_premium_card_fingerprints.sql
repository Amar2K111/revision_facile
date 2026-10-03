-- Empreintes de cartes déjà utilisées pour un essai / abonnement Premium (anti-abus multi-comptes).
create table if not exists public.premium_card_fingerprints (
  fingerprint text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  stripe_customer_id text,
  created_at timestamptz not null default now()
);

create index if not exists premium_card_fingerprints_user_id_idx
  on public.premium_card_fingerprints (user_id);

comment on table public.premium_card_fingerprints is
  'Empreinte Stripe (card.fingerprint) liée au premier compte ayant utilisé la carte pour Premium.';

alter table public.premium_card_fingerprints enable row level security;
