import {
  buildProfilePatchFromSubscription,
  buildRevokePremiumPatch,
  subscriptionGrantsPremium,
} from "./stripePremiumSubscription";

/**
 * Trouve le customer Stripe (profil ou e-mail).
 * @param {import("stripe").Stripe} stripe
 * @param {string | null | undefined} customerId
 * @param {string | null | undefined} email
 */
export async function resolveStripeCustomerId(stripe, customerId, email) {
  const fromProfile = customerId?.trim() || null;
  if (fromProfile) {
    return fromProfile;
  }
  if (!email?.trim()) {
    return null;
  }
  const list = await stripe.customers.list({ email: email.trim(), limit: 5 });
  if (list.data.length === 0) {
    return null;
  }
  const sorted = [...list.data].sort((a, b) => (b.created ?? 0) - (a.created ?? 0));
  return sorted[0].id;
}

/**
 * Synchronise is_premium / premium_until depuis Stripe (secours si webhook en retard ou en échec).
 * @param {import("@supabase/supabase-js").SupabaseClient} admin
 * @param {import("stripe").Stripe} stripe
 * @param {string} userId
 * @param {{ stripe_customer_id?: string | null, email?: string | null }} profile
 */
export async function syncPremiumFromStripeForUser(admin, stripe, userId, profile) {
  const customerId = await resolveStripeCustomerId(
    stripe,
    profile?.stripe_customer_id,
    profile?.email,
  );

  if (!customerId) {
    return { ok: true, premium: false, synced: false, reason: "no_stripe_customer" };
  }

  const subs = await stripe.subscriptions.list({
    customer: customerId,
    status: "all",
    limit: 20,
  });

  const granting = subs.data.filter((s) => subscriptionGrantsPremium(s));
  if (granting.length === 0) {
    const { error } = await admin.from("profiles").update(buildRevokePremiumPatch()).eq("id", userId);
    if (error) {
      return { ok: false, premium: false, synced: false, reason: error.message };
    }
    return { ok: true, premium: false, synced: true, stripe_customer_id: customerId };
  }

  granting.sort((a, b) => (b.created ?? 0) - (a.created ?? 0));
  const subscription = granting[0];
  const patch = buildProfilePatchFromSubscription(subscription, customerId);
  const { error } = await admin.from("profiles").update(patch).eq("id", userId);
  if (error) {
    return { ok: false, premium: false, synced: false, reason: error.message };
  }

  return {
    ok: true,
    premium: true,
    synced: true,
    stripe_customer_id: customerId,
    subscription_status: subscription.status,
  };
}
