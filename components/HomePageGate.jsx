"use client";

import { useEffect, useRef, useState } from "react";
import { AppLoadingScreen } from "./AppLoadingScreen";
import { POST_LOGIN_DEFAULT_PATH } from "../lib/authRedirects";
import { createSupabaseBrowserClient } from "../lib/supabase/client";

/**
 * Accueil : si session détectée, passe par /auth/continue (jamais l’accueil connecté).
 */
export function HomePageGate({ children }) {
  const [phase, setPhase] = useState("checking");
  const handled = useRef(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    const sendToContinue = () => {
      if (handled.current) {
        return;
      }
      handled.current = true;
      setPhase("redirecting");
      const url = `/auth/continue?next=${encodeURIComponent(POST_LOGIN_DEFAULT_PATH)}`;
      window.location.replace(url);
    };

    void supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.id) {
        sendToContinue();
        return;
      }
      setPhase("guest");
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session?.user?.id) {
        sendToContinue();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (phase === "checking" || phase === "redirecting") {
    return (
      <AppLoadingScreen
        message={phase === "redirecting" ? "Redirection vers ton espace…" : "Chargement…"}
      />
    );
  }

  return children;
}
