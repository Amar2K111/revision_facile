-- Fin d'accès pour le pass Premium payé en une fois (ex. 3 mois après paiement).
alter table public.profiles
  add column if not exists premium_until timestamptz;

comment on column public.profiles.premium_until is
  'Date/heure UTC après laquelle le pass prépayé expire. Null = pas de pass actif (accès éventuellement via is_premium seul, ex. ancien abonnement).';
