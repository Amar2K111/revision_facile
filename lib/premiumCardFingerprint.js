import { subscriptionUsedTrial } from "./premiumTrialEligibility";

/**
 * @param {import("stripe").Stripe.PaymentMethod | string | null | undefined} paymentMethod
 */
export function extractCardFingerprint(paymentMethod) {
  if (!paymentMethod || typeof paymentMethod === "string") {
    return null;
  }
  if (paymentMethod.type !== "card") {
    return null;
  }
  const fingerprint = paymentMethod.card?.fingerprint;
  return typeof fingerprint === "string" && fingerprint.trim() ? fingerprint.trim() : null;
}

/**
 * @param {import("stripe").Stripe} stripe
 * @param {import("stripe").Stripe.Subscription | string} subscription
 */
export async function resolveSubscriptionPaymentMethod(stripe, subscription) {
  const sub =
    typeof subscription === "string"
      ? await stripe.subscriptions.retrieve(subscription, {
          expand: ["default_payment_method"],
        })
      : subscription;

  const defaultPm = sub.default_payment_method;
  if (defaultPm && typeof defaultPm === "object") {
    return defaultPm;
  }
  if (typeof defaultPm === "string") {
    return stripe.paymentMethods.retrieve(defaultPm);
  }

  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer?.id ?? null;
  if (!customerId) {
    return null;
  }

  const list = await stripe.paymentMethods.list({
    customer: customerId,
    type: "card",
    limit: 10,
  });
  return list.data[0] ?? null;
}

/**
 * @param {import("@supabase/supabase-js").SupabaseClient} admin
 * @param {string} fingerprint
 */
export async function findCardFingerprintOwner(admin, fingerprint) {
  const { data } = await admin
    .from("premium_card_fingerprints")
    .select("user_id, stripe_customer_id")
    .eq("fingerprint", fingerprint)
    .maybeSingle();
  return data ?? null;
}

/**
 * @param {import("@supabase/supabase-js").SupabaseClient} admin
 * @param {import("stripe").Stripe} stripe
 * @param {string | null | undefined} customerId
 * @param {string | null | undefined} [currentUserId]
 */
export async function customerHasBlockedCardForTrial(admin, stripe, customerId, currentUserId) {
  if (!admin || !customerId?.trim()) {
    return false;
  }

  const list = await stripe.paymentMethods.list({
    customer: customerId.trim(),
    type: "card",
    limit: 20,
  });

  for (const pm of list.data) {
    const fingerprint = extractCardFingerprint(pm);
    if (!fingerprint) {
      continue;
    }
    const owner = await findCardFingerprintOwner(admin, fingerprint);
    if (owner) {
      return true;
    }
  }

  return false;
}

/**
 * @param {import("@supabase/supabase-js").SupabaseClient} admin
 * @param {{ fingerprint: string, userId: string, customerId?: string | null }} params
 */
export async function registerCardFingerprint(admin, { fingerprint, userId, customerId }) {
  const { error } = await admin.from("premium_card_fingerprints").insert({
    fingerprint,
    user_id: userId,
    stripe_customer_id: customerId ?? null,
  });
  if (error && error.code !== "23505") {
    console.error("[premium card] Enregistrement empreinte:", error.message);
  }
}

/**
 * Bloque un essai si la carte a déjà servi sur un autre compte ; enregistre sinon.
 * @param {import("@supabase/supabase-js").SupabaseClient} admin
 * @param {import("stripe").Stripe} stripe
 * @param {import("stripe").Stripe.Subscription} subscription
 * @param {string} userId
 * @param {string | null | undefined} customerId
 */
export async function enforceUniqueCardForSubscription(admin, stripe, subscription, userId, customerId) {
  const paymentMethod = await resolveSubscriptionPaymentMethod(stripe, subscription);
  const fingerprint = extractCardFingerprint(paymentMethod);
  if (!fingerprint) {
    return { ok: true, registered: false };
  }

  const owner = await findCardFingerprintOwner(admin, fingerprint);
  const isTrialing =
    subscription.status === "trialing" || subscriptionUsedTrial(subscription);

  if (owner && owner.user_id !== userId && isTrialing) {
    try {
      await stripe.subscriptions.cancel(subscription.id);
    } catch (e) {
      console.error("[premium card] Annulation abo (carte dupliquée):", e);
    }
    return { ok: false, reason: "duplicate_card", fingerprint };
  }

  if (!owner) {
    await registerCardFingerprint(admin, {
      fingerprint,
      userId,
      customerId: customerId ?? null,
    });
    return { ok: true, registered: true, fingerprint };
  }

  return { ok: true, registered: false, fingerprint };
}
