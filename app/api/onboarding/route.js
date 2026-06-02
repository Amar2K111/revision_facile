import { NextResponse } from "next/server";
import { POST_LOGIN_DEFAULT_PATH, resolvePostAuthPath, sanitizeNextPath } from "../../../lib/authRedirects";
import { validateOnboardingPayload } from "../../../lib/onboardingValidation";
import { profileHasActivePremium } from "../../../lib/profilePremium";
import { createSupabaseServerClient } from "../../../lib/supabase/server";

export async function POST(request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide." }, { status: 400 });
  }

  const validated = validateOnboardingPayload(body);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from("profiles")
    .select("is_premium, premium_until, onboarding_completed_at")
    .eq("id", user.id)
    .maybeSingle();

  if (profileHasActivePremium(existing)) {
    return NextResponse.json({
      ok: true,
      redirect: sanitizeNextPath(body?.next ?? POST_LOGIN_DEFAULT_PATH),
    });
  }

  const now = new Date().toISOString();
  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      onboarding_answers: validated.answers,
      onboarding_completed_at: now,
    },
    { onConflict: "id" },
  );

  if (error) {
    console.error("[onboarding] upsert failed", error.message);
    return NextResponse.json(
      { error: "Impossible d’enregistrer ton profil. Réessaie." },
      { status: 500 },
    );
  }

  const redirectTo = resolvePostAuthPath(
    { ...existing, onboarding_completed_at: now },
    body?.next ?? POST_LOGIN_DEFAULT_PATH,
  );

  return NextResponse.json({ ok: true, redirect: redirectTo });
}
