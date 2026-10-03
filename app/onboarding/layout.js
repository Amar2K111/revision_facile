import { redirect } from "next/navigation";
import { POST_LOGIN_DEFAULT_PATH, resolvePostAuthPath } from "../../lib/authRedirects";
import { fetchProfileForRouting } from "../../lib/fetchProfileForRouting";
import { createSupabaseServerClient } from "../../lib/supabase/server";

export default async function OnboardingLayout({ children }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin?next=/onboarding");
  }

  const profile = await fetchProfileForRouting(supabase, user.id);
  const dest = resolvePostAuthPath(profile, POST_LOGIN_DEFAULT_PATH);
  if (dest !== "/onboarding" && !dest.startsWith("/onboarding?")) {
    redirect(dest);
  }

  return children;
}
