import Stripe from "stripe";

/** @returns {Stripe} */
export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY manquante dans .env.local");
  }
  return new Stripe(key);
}
