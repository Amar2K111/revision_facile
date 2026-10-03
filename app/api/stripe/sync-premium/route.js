import { NextResponse } from "next/server";
import { profileHasActivePremium } from "../../../../lib/profilePremium";
import { getStripe } from "../../../../lib/stripe/server";
import { syncPremiumFromStripeForUser } from "../../../../lib/syncPremiumFromStripe";
import { createSupabaseAdminClient } from "../../../../lib/supabase/admin";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";

export const runtime = "nodejs";

/** Secours post-checkout : lit l’abonnement Stripe et met à jour le profil Supabase. */
export async function POST() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json(
      { error: "Configuration serveur incomplète (SUPABASE_SERVICE_ROLE_KEY)." },
      { status: 500 },
    );
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("is_premium, premium_until, stripe_customer_id, email")
    .eq("id", user.id)
    .maybeSingle();

  const email = profile?.email ?? user.email ?? null;

  try {
    const stripe = getStripe();
    const result = await syncPremiumFromStripeForUser(admin, stripe, user.id, {
      ...profile,
      email,
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: result.reason ?? "Synchronisation Stripe impossible." },
        { status: 502 },
      );
    }

    const { data: updated } = await admin
      .from("profiles")
      .select("is_premium, premium_until, stripe_customer_id")
      .eq("id", user.id)
      .maybeSingle();

    return NextResponse.json({
      premium: profileHasActivePremium(updated),
      synced: result.synced,
      subscription_status: result.subscription_status ?? null,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur Stripe.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
