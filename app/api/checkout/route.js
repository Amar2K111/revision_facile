import { NextResponse } from "next/server";
import {
  resolvePremiumMonthlyEur,
  resolvePremiumTrialDays,
  resolvePremiumYearlyEur,
} from "../../../lib/premiumPricing";
import { SITE_BRAND_NAME, SITE_NAME } from "../../../lib/site";
import { getStripe } from "../../../lib/stripe/server";
import { createSupabaseServerClient } from "../../../lib/supabase/server";

const CHECKOUT_BRAND_NAME = SITE_BRAND_NAME;
const CHECKOUT_PRODUCT_NAME = `${SITE_BRAND_NAME} Premium`;

export const runtime = "nodejs";

/** EUR → centimes Stripe (arrondi). */
function eurToUnitAmount(eur) {
  return Math.round(eur * 100);
}

function buildYearlyLineItem(priceIdYearly) {
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
      product_data: { name: `${CHECKOUT_PRODUCT_NAME} — abonnement annuel` },
    },
    quantity: 1,
  };
}

function buildMonthlyLineItem(priceIdMonthly) {
  if (priceIdMonthly) {
    return { price: priceIdMonthly, quantity: 1 };
  }

  const eur = resolvePremiumMonthlyEur();
  const unitAmount = eurToUnitAmount(eur);
  if (unitAmount < 50) {
    return null;
  }

  return {
    price_data: {
      currency: "eur",
      unit_amount: unitAmount,
      recurring: { interval: "month" },
      product_data: { name: `${CHECKOUT_PRODUCT_NAME} — abonnement mensuel` },
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
 * Checkout Premium : annuel (essai 3 jours) ou mensuel.
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

  let plan = "yearly";
  try {
    const body = await request.json();
    if (body?.plan === "monthly") {
      plan = "monthly";
    }
  } catch {
    /* corps optionnel */
  }

  const priceIdYearly =
    process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID?.trim() ||
    process.env.STRIPE_PREMIUM_PASS_PRICE_ID?.trim() ||
    process.env.STRIPE_PREMIUM_PRICE_ID?.trim();
  const priceIdMonthly = process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID?.trim();

  const lineItem =
    plan === "monthly"
      ? buildMonthlyLineItem(priceIdMonthly)
      : buildYearlyLineItem(priceIdYearly);

  if (!lineItem) {
    return NextResponse.json(
      {
        error:
          plan === "monthly"
            ? "Configure STRIPE_PREMIUM_MONTHLY_PRICE_ID ou STRIPE_PREMIUM_MONTHLY_EUR."
            : "Configure STRIPE_PREMIUM_YEARLY_PRICE_ID ou STRIPE_PREMIUM_YEARLY_EUR.",
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
  const trialDays = plan === "yearly" ? resolvePremiumTrialDays() : 0;

  const baseSession = {
    locale: "fr",
    success_url: `${origin}/reviser?checkout=success`,
    cancel_url: `${origin}/paywall?checkout=cancel`,
    client_reference_id: user.id,
    metadata: { supabase_user_id: user.id, premium_plan: plan },
    branding_settings: {
      display_name: CHECKOUT_BRAND_NAME,
    },
    custom_text: {
      submit: {
        message: `Abonnement ${CHECKOUT_BRAND_NAME} — annule quand tu veux depuis ton espace client.`,
      },
    },
    subscription_data: {
      metadata: { supabase_user_id: user.id, premium_plan: plan },
      ...(trialDays > 0 ? { trial_period_days: trialDays } : {}),
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
