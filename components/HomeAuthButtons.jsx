"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AuthUserAvatar from "./AuthUserAvatar";
import { createSupabaseBrowserClient } from "../lib/supabase/client";

const SIGNIN = "/auth/signin?next=/reviser";
const SIGNUP = "/auth/signup?next=/reviser";
const REVISER = "/reviser";

export function HomeHeaderAuth() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    void supabase.auth.getSession().then(({ data }) => {
      setLoggedIn(!!data.session);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (loggedIn) {
    return (
      <div className="flex items-center gap-2 sm:gap-3">
        <AuthUserAvatar />
        <Link
          href={REVISER}
          className="inline-flex min-h-11 items-center rounded-full bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 transition hover:bg-indigo-500 active:bg-indigo-600"
        >
          Commencer
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <Link
        href={SIGNIN}
        className="inline-flex min-h-11 items-center rounded-full px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 active:bg-slate-200 sm:px-4"
      >
        Se connecter
      </Link>
      <Link
        href={SIGNUP}
        className="inline-flex min-h-11 items-center rounded-full bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 transition hover:bg-indigo-500 active:bg-indigo-600"
      >
        Commencer
      </Link>
    </div>
  );
}

export function HomeHeroAuth() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    void supabase.auth.getSession().then(({ data }) => {
      setLoggedIn(!!data.session);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (loggedIn) {
    return (
      <Link
        href={REVISER}
        className="inline-flex min-h-[3.25rem] w-full items-center justify-center rounded-full bg-indigo-600 px-8 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500 active:bg-indigo-600 sm:w-auto"
      >
        Commencer
      </Link>
    );
  }

  return (
    <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
      <Link
        href={SIGNUP}
        className="inline-flex min-h-[3.25rem] w-full items-center justify-center rounded-full bg-indigo-600 px-8 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500 active:bg-indigo-600 sm:w-auto"
      >
        Commencer
      </Link>
      <Link
        href={SIGNIN}
        className="inline-flex min-h-[3.25rem] w-full items-center justify-center rounded-full border border-slate-300/90 bg-white px-8 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 active:bg-slate-100 sm:w-auto"
      >
        Se connecter
      </Link>
    </div>
  );
}

export function HomeCtaAuth() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    void supabase.auth.getSession().then(({ data }) => {
      setLoggedIn(!!data.session);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="mt-8 flex flex-col items-center gap-3">
      <Link
        href={loggedIn ? REVISER : SIGNUP}
        className="inline-flex min-h-[3.25rem] items-center justify-center rounded-full bg-white px-8 text-sm font-semibold text-indigo-700 shadow-lg transition hover:bg-indigo-50 active:bg-indigo-100"
      >
        Commencer
      </Link>
      {!loggedIn ? (
        <p className="text-sm text-indigo-100">
          Déjà un compte ?{" "}
          <Link href={SIGNIN} className="font-semibold text-white underline underline-offset-2 hover:text-indigo-50">
            Se connecter
          </Link>
        </p>
      ) : null}
    </div>
  );
}
