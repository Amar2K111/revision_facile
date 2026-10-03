import { NextResponse } from "next/server";
import { userIsEligibleForPremiumTrial } from "../../../../lib/premiumTrialEligibility";
import { resolvePremiumTrialDays } from "../../../../lib/premiumPricing";
import { getStripe } from "../../../../lib/stripe/server";
import { createSupabaseAdminClient } from "../../../../lib/supabase/admin";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";

export const runtime = "nodejs";

/** Indique si le compte connecté peut encore bénéficier de l’essai annuel. */
export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ eligible: false, trialDays: 0 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id, premium_trial_used_at")
    .eq("id", user.id)
    .maybeSingle();

  try {
    const eligible = await userIsEligibleForPremiumTrial(
      getStripe(),
      createSupabaseAdminClient(),
      { ...profile, id: user.id },
      user.email,
    );
    const trialDays = eligible ? resolvePremiumTrialDays() : 0;
    return NextResponse.json({ eligible, trialDays });
  } catch {
    return NextResponse.json({ eligible: false, trialDays: 0 });
  }
}
