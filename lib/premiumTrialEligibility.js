import { customerHasBlockedCardForTrial } from "./premiumCardFingerprint";
import { resolveStripeCustomerId } from "./syncPremiumFromStripe";

/**
 * @param {import("stripe").Stripe.Subscription | { trial_start?: number | null }} subscription
 */
export function subscriptionUsedTrial(subscription) {
  const start = subscription?.trial_start;
  return typeof start === "number" && Number.isFinite(start) && start > 0;
}

/**
 * @param {import("stripe").Stripe.Subscription | { trial_start?: number | null, created?: number | null }} subscription
 * @returns {{ premium_trial_used_at: string } | null}
 */
export function premiumTrialUsedPatchFromSubscription(subscription) {
  if (!subscriptionUsedTrial(subscription)) {
    return null;
  }
  const ts = subscription.trial_start ?? subscription.created;
  if (typeof ts === "number" && Number.isFinite(ts)) {
    return { premium_trial_used_at: new Date(ts * 1000).toISOString() };
  }
  return { premium_trial_used_at: new Date().toISOString() };
}

/**
 * @param {import("stripe").Stripe} stripe
 * @param {string} customerId
 */
export async function stripeCustomerHasUsedPremiumTrial(stripe, customerId) {
  if (!customerId?.trim()) {
    return false;
  }

  let startingAfter;
  for (;;) {
    const page = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      limit: 100,
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    });

    if (page.data.some((sub) => subscriptionUsedTrial(sub))) {
      return true;
    }

    if (!page.has_more || page.data.length === 0) {
      return false;
    }

    startingAfter = page.data[page.data.length - 1].id;
  }
}

/**
 * @param {import("stripe").Stripe} stripe
 * @param {import("@supabase/supabase-js").SupabaseClient | null | undefined} admin
 * @param {{ id?: string, stripe_customer_id?: string | null, premium_trial_used_at?: string | null }} profile
 * @param {string | null | undefined} email
 */
export async function userIsEligibleForPremiumTrial(stripe, admin, profile, email) {
  if (profile?.premium_trial_used_at) {
    return false;
  }

  const customerId = await resolveStripeCustomerId(stripe, profile?.stripe_customer_id, email);
  if (!customerId) {
    return true;
  }

  const used = await stripeCustomerHasUsedPremiumTrial(stripe, customerId);
  if (used) {
    return false;
  }

  if (admin) {
    const blockedCard = await customerHasBlockedCardForTrial(
      admin,
      stripe,
      customerId,
      profile?.id ?? null,
    );
    if (blockedCard) {
      return false;
    }
  }

  return true;
}
