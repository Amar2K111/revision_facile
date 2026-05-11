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

/** Montant du pass 3 mois (paiement unique) en €. */
function resolvePremiumPassEur() {
  return (
    parsePositiveEur(process.env.STRIPE_PREMIUM_MONTHLY_EUR) ??
    parsePositiveEur(process.env.NEXT_PUBLIC_PREMIUM_MONTHLY_EUR) ??
    9.99
  );
}

/**
 * Ligne Checkout en paiement unique : Price Stripe one-time si ID renseigné, sinon `price_data`.
 */
function buildPremiumPassLineItem(priceIdPass) {
  if (priceIdPass) {
    return { price: priceIdPass, quantity: 1 };
  }

  const eur = resolvePremiumPassEur();
  const unitAmount = eurToUnitAmount(eur);
  if (unitAmount < 50) {
    return null;
  }

  return {
    price_data: {
      currency: "eur",
      unit_amount: unitAmount,
      product_data: { name: "Premium — accès 3 mois" },
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
 * Checkout Premium : paiement unique (défaut 9,99 €), accès activé 3 mois après validation (webhook).
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

  const priceIdPass =
    process.env.STRIPE_PREMIUM_PASS_PRICE_ID?.trim() ||
    process.env.STRIPE_PREMIUM_PRICE_ID?.trim() ||
    process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID?.trim();

  const lineItem = buildPremiumPassLineItem(priceIdPass);
  if (!lineItem) {
    return NextResponse.json(
      {
        error:
          "Configure STRIPE_PREMIUM_PASS_PRICE_ID (prix Stripe en paiement unique) ou un montant valide (STRIPE_PREMIUM_MONTHLY_EUR / NEXT_PUBLIC_PREMIUM_MONTHLY_EUR).",
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
    metadata: { supabase_user_id: user.id, premium_pass: "3m" },
  };

  if (existingCustomerId) {
    baseSession.customer = existingCustomerId;
  } else if (user.email) {
    baseSession.customer_email = user.email;
  }

  try {
    const session = await stripe.checkout.sessions.create({
      ...baseSession,
      mode: "payment",
      line_items: [lineItem],
      ...(!existingCustomerId ? { customer_creation: "always" } : {}),
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
