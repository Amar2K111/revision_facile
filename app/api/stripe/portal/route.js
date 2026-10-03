import { NextResponse } from "next/server";
import { getStripe } from "../../../../lib/stripe/server";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";

export const runtime = "nodejs";

const ALLOWED_RETURN_PATHS = new Set(["/", "/reviser", "/fiche", "/paywall"]);

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

function sanitizeReturnPath(raw) {
  if (typeof raw !== "string" || !raw.startsWith("/")) {
    return "/reviser";
  }
  const pathOnly = raw.split("?")[0].slice(0, 128);
  return ALLOWED_RETURN_PATHS.has(pathOnly) ? pathOnly : "/reviser";
}

/**
 * Portail client Stripe (abonnement, moyen de paiement, factures).
 * POST body optionnel : { "returnPath": "/reviser" } (chemins autorisés seulement).
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

  let returnPath = "/reviser";
  try {
    const body = await request.json();
    if (body && typeof body === "object" && typeof body.returnPath === "string") {
      returnPath = sanitizeReturnPath(body.returnPath);
    }
  } catch {
    /* corps vide ou JSON invalide */
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();

  let customerId = profile?.stripe_customer_id?.trim() || null;

  const stripe = getStripe();

  if (!customerId && user.email) {
    const list = await stripe.customers.list({ email: user.email, limit: 5 });
    if (list.data.length > 0) {
      const sorted = [...list.data].sort((a, b) => (b.created ?? 0) - (a.created ?? 0));
      customerId = sorted[0].id;
    }
  }

  if (!customerId) {
    return NextResponse.json(
      {
        error:
          "Aucun compte de paiement Stripe trouvé. Abonne-toi d’abord depuis la page Premium, ou réessaie après un achat.",
      },
      { status: 404 },
    );
  }

  const origin = resolveAppOrigin(request);
  const returnUrl = `${origin}${returnPath}`;

  try {
    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    if (!portal.url) {
      return NextResponse.json({ error: "Portail Stripe sans URL." }, { status: 502 });
    }
    return NextResponse.json({ url: portal.url });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Portail Stripe indisponible.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
