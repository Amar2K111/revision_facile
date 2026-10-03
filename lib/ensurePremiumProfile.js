import { profileHasActivePremium } from "./profilePremium";
import { syncPremiumFromStripeForUser } from "./syncPremiumFromStripe";

/**
 * Si le profil n’est pas Premium, tente une sync Stripe → Supabase puis relit le profil.
 * @param {import("@supabase/supabase-js").SupabaseClient} admin
 * @param {import("stripe").Stripe} stripe
 * @param {string} userId
 * @param {string | null | undefined} userEmail
 * @param {{ is_premium?: boolean | null, premium_until?: string | null, stripe_customer_id?: string | null, email?: string | null } | null | undefined} profile
 */
export async function ensurePremiumProfile(admin, stripe, userId, userEmail, profile) {
  if (profileHasActivePremium(profile)) {
    return profile;
  }

  const result = await syncPremiumFromStripeForUser(admin, stripe, userId, {
    ...profile,
    email: profile?.email ?? userEmail ?? null,
  });

  if (!result.ok || !result.premium) {
    return profile;
  }

  const { data: updated } = await admin
    .from("profiles")
    .select("is_premium, premium_until")
    .eq("id", userId)
    .maybeSingle();

  return updated ?? profile;
}
