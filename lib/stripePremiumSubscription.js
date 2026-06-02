/**
 * Accès Premium via abonnement Stripe (renouvellement annuel).
 */

/**
 * @param {import("stripe").Stripe.Subscription | { current_period_end?: number | null }} subscription
 * @returns {string | null} ISO 8601
 */
export function premiumUntilFromStripeSubscription(subscription) {
  const end = subscription?.current_period_end;
  if (typeof end === "number" && Number.isFinite(end)) {
    return new Date(end * 1000).toISOString();
  }
  return null;
}

/**
 * @param {import("stripe").Stripe.Subscription | { status?: string | null }} subscription
 */
export function subscriptionGrantsPremium(subscription) {
  const status = subscription?.status;
  return status === "active" || status === "trialing" || status === "past_due";
}

/**
 * @param {import("stripe").Stripe.Subscription} subscription
 * @param {string | null | undefined} [customerId]
 */
export function buildProfilePatchFromSubscription(subscription, customerId) {
  const patch = { is_premium: subscriptionGrantsPremium(subscription) };
  const premiumUntil = premiumUntilFromStripeSubscription(subscription);
  if (premiumUntil) {
    patch.premium_until = premiumUntil;
  }
  if (customerId) {
    patch.stripe_customer_id = customerId;
  }
  return patch;
}
