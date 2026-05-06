import { redirect } from "next/navigation";
import { POST_LOGIN_DEFAULT_PATH } from "../../lib/authRedirects";
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
    redirect(POST_LOGIN_DEFAULT_PATH);
  }
  return children;
}
