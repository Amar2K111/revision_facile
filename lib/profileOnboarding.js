import { profileHasActivePremium } from "./profilePremium";

/** Colonnes minimales pour routage auth / proxy. */
export const PROFILE_ROUTING_SELECT =
  "onboarding_completed_at,is_premium,premium_until";

/**
 * @param {{ onboarding_completed_at?: string | null, is_premium?: boolean | null, premium_until?: string | null } | null | undefined} profile
 */
export function profileNeedsOnboarding(profile) {
  if (profileHasActivePremium(profile)) {
    return false;
  }
  return profile?.onboarding_completed_at == null;
}
