"use client";

import { useEffect, useRef, useState } from "react";
import { AppLoadingScreen } from "./AppLoadingScreen";
import { POST_LOGIN_DEFAULT_PATH } from "../lib/authRedirects";
import { resolvePostAuthPathClient } from "../lib/postAuthRedirectClient";
import { createSupabaseBrowserClient } from "../lib/supabase/client";

/**
 * Accueil : loader pendant la vérif session, puis redirection ou contenu invité.
 */
export function HomePageGate({ children }) {
  const [phase, setPhase] = useState("checking");
  const redirecting = useRef(false);

  useEffect(() => {
    const hasSessionCookie =
      typeof document !== "undefined" && /(?:^|;\s*)sb-[^=]+-auth-token=/.test(document.cookie);

    if (!hasSessionCookie) {
      setPhase("guest");
      return undefined;
    }

    const supabase = createSupabaseBrowserClient();

    const redirectLoggedIn = async (session) => {
      if (!session?.user?.id || redirecting.current) {
        return false;
      }
      redirecting.current = true;
      setPhase("redirecting");
      const dest = await resolvePostAuthPathClient(
        supabase,
        session.user.id,
        POST_LOGIN_DEFAULT_PATH,
      );
      window.location.assign(dest);
      return true;
    };

    void supabase.auth.getSession().then(async ({ data }) => {
      if (await redirectLoggedIn(data.session)) {
        return;
      }
      setPhase("guest");
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
        void redirectLoggedIn(session);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (phase === "checking") {
    return <AppLoadingScreen message="Chargement…" />;
  }

  if (phase === "redirecting") {
    return <AppLoadingScreen message="Redirection vers ton espace…" />;
  }

  return children;
}
