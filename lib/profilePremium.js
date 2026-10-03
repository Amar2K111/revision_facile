/**
 * Accès Premium actif : soit pass prépayé (`premium_until` dans le futur),
 * soit ancien modèle abonnement Stripe uniquement (`is_premium` sans date de fin).
 *
 * @param {{ is_premium?: boolean | null, premium_until?: string | null } | null | undefined} profile
 */
export function profileHasActivePremium(profile) {
  if (!profile) {
    return false;
  }
  const untilRaw = profile.premium_until;
  if (untilRaw != null && String(untilRaw).trim() !== "") {
    const t = new Date(String(untilRaw)).getTime();
    return Number.isFinite(t) && t > Date.now();
  }
  return !!profile.is_premium;
}
