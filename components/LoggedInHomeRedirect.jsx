"use client";

import { useEffect, useRef } from "react";
import { POST_LOGIN_DEFAULT_PATH } from "../lib/authRedirects";
import { resolvePostAuthPathClient } from "../lib/postAuthRedirectClient";
import { createSupabaseBrowserClient } from "../lib/supabase/client";

/** Si une session existe sur l’accueil, redirige vers /reviser (ou onboarding). */
export function LoggedInHomeRedirect() {
  const redirecting = useRef(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    const go = async (session) => {
      if (!session?.user?.id || redirecting.current) {
        return;
      }
      redirecting.current = true;
      const dest = await resolvePostAuthPathClient(
        supabase,
        session.user.id,
        POST_LOGIN_DEFAULT_PATH,
      );
      window.location.assign(dest);
    };

    void supabase.auth.getSession().then(({ data }) => go(data.session));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
        void go(session);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return null;
}
