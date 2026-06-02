import { redirect } from "next/navigation";
import { POST_LOGIN_DEFAULT_PATH, resolvePostAuthPath } from "../../lib/authRedirects";
import { fetchProfileForRouting } from "../../lib/fetchProfileForRouting";
import { createSupabaseServerClient } from "../../lib/supabase/server";

export const metadata = {
  title: {
    default: "Compte — Révision facile",
    template: "%s — Révision facile",
  },
  description: "Connexion et inscription à Révision facile.",
};

/** Déjà connecté : pas besoin du formulaire — envoi direct vers la page de révision. */
export default async function AuthLayout({ children }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const profile = await fetchProfileForRouting(supabase, user.id);
    redirect(resolvePostAuthPath(profile, POST_LOGIN_DEFAULT_PATH));
  }
  return children;
}
