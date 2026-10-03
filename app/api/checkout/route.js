import { NextResponse } from "next/server";
import { getStripe } from "../../../lib/stripe/server";
import { createSupabaseServerClient } from "../../../lib/supabase/server";

export const runtime = "nodejs";

/** EUR → centimes Stripe (arrondi). */
function eurToUnitAmount(eur) {
  return Math.round(eur * 100);
}

function parsePositiveEur(raw) {
  if (raw == null || typeof raw !== "string") {
    return null;
  }
  const t = raw.trim();
  if (!t) {
    return null;
  }
  const n = Number(t.replace(",", "."));
  if (!Number.isFinite(n) || n <= 0) {
    return null;
  }
  return n;
}

/** Montant de l’abonnement annuel Premium en €. */
function resolvePremiumYearlyEur() {
  return (
    parsePositiveEur(process.env.STRIPE_PREMIUM_YEARLY_EUR) ??
    parsePositiveEur(process.env.STRIPE_PREMIUM_MONTHLY_EUR) ??
    parsePositiveEur(process.env.NEXT_PUBLIC_PREMIUM_YEARLY_EUR) ??
    parsePositiveEur(process.env.NEXT_PUBLIC_PREMIUM_MONTHLY_EUR) ??
    5.0
  );
}

/**
 * Ligne Checkout en abonnement annuel : Price Stripe récurrent si ID renseigné, sinon `price_data`.
 */
function buildPremiumSubscriptionLineItem(priceIdYearly) {
  if (priceIdYearly) {
    return { price: priceIdYearly, quantity: 1 };
  }

  const eur = resolvePremiumYearlyEur();
  const unitAmount = eurToUnitAmount(eur);
  if (unitAmount < 50) {
    return null;
  }

  return {
    price_data: {
      currency: "eur",
      unit_amount: unitAmount,
      recurring: { interval: "year" },
      product_data: { name: "Premium — abonnement 12 mois" },
    },
    quantity: 1,
  };
}

function resolveAppOrigin(request) {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }
  const host = request.headers.get("host");
  if (!host) {
    return "http://localhost:3000";
  }
  const proto = host.startsWith("localhost") ? "http" : "https";
  return `${proto}://${host}`;
}

/**
 * Checkout Premium : abonnement annuel (défaut 5,00 € / an), accès activé après validation (webhook).
 */
export async function POST(request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }

  try {
    await request.json();
  } catch {
    /* corps optionnel, ignoré */
  }

  const priceIdYearly =
    process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID?.trim() ||
    process.env.STRIPE_PREMIUM_PASS_PRICE_ID?.trim() ||
    process.env.STRIPE_PREMIUM_PRICE_ID?.trim() ||
    process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID?.trim();

  const lineItem = buildPremiumSubscriptionLineItem(priceIdYearly);
  if (!lineItem) {
    return NextResponse.json(
      {
        error:
          "Configure STRIPE_PREMIUM_YEARLY_PRICE_ID (prix Stripe récurrent annuel) ou un montant valide (STRIPE_PREMIUM_YEARLY_EUR / NEXT_PUBLIC_PREMIUM_YEARLY_EUR).",
      },
      { status: 500 },
    );
  }

  const origin = resolveAppOrigin(request);
  const stripe = getStripe();

  const { data: profileRow } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();

  const existingCustomerId = profileRow?.stripe_customer_id?.trim();

  const baseSession = {
    success_url: `${origin}/reviser?checkout=success`,
    cancel_url: `${origin}/paywall?checkout=cancel`,
    client_reference_id: user.id,
    metadata: { supabase_user_id: user.id, premium_plan: "yearly" },
    subscription_data: {
      metadata: { supabase_user_id: user.id, premium_plan: "yearly" },
    },
  };

  if (existingCustomerId) {
    baseSession.customer = existingCustomerId;
  } else if (user.email) {
    baseSession.customer_email = user.email;
  }

  try {
    const session = await stripe.checkout.sessions.create({
      ...baseSession,
      mode: "subscription",
      line_items: [lineItem],
    });

    if (!session.url) {
      return NextResponse.json({ error: "Session Checkout sans URL." }, { status: 502 });
    }

    return NextResponse.json({ url: session.url });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Échec Stripe Checkout.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
