"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { AppLoadingScreen } from "../AppLoadingScreen";
import { POST_LOGIN_DEFAULT_PATH, sanitizeNextPath } from "../../lib/authRedirects";
import { resolvePostAuthPathClient } from "../../lib/postAuthRedirectClient";
import { createSupabaseBrowserClient } from "../../lib/supabase/client";

async function waitForUser(supabase, attempts = 8, delayMs = 200) {
  for (let i = 0; i < attempts; i += 1) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user?.id) {
      return user;
    }
    await new Promise((resolve) => {
      setTimeout(resolve, delayMs);
    });
  }
  return null;
}

export default function AuthContinueClient() {
  const searchParams = useSearchParams();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) {
      return undefined;
    }
    started.current = true;

    const rawNext = searchParams.get("next") ?? POST_LOGIN_DEFAULT_PATH;
    const next = sanitizeNextPath(rawNext);

    void (async () => {
      const supabase = createSupabaseBrowserClient();
      const user = await waitForUser(supabase);

      if (!user) {
        window.location.replace(`/auth/signin?next=${encodeURIComponent(next)}`);
        return;
      }

      const dest = await resolvePostAuthPathClient(supabase, user.id, next, {
        profileRetries: 3,
      });
      window.location.replace(dest);
    })();

    return undefined;
  }, [searchParams]);

  return <AppLoadingScreen message="Préparation de ton espace…" />;
}
