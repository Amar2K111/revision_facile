"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useId, useState } from "react";
import { sanitizeNextPath } from "../../lib/authRedirects";
import { resolvePostAuthPathClient } from "../../lib/postAuthRedirectClient";
import { createSupabaseBrowserClient } from "../../lib/supabase/client";
import { signInWithGoogleClient } from "../../lib/auth/signInWithGoogle";
import AuthPageShell from "./AuthPageShell";
import GoogleMark from "./GoogleMark";

const inputClass =
  "w-full cursor-text rounded-lg border border-gray-200 bg-white px-4 py-3 text-base text-neutral-950 placeholder:text-slate-400 focus:border-indigo-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 min-h-[44px] transition-all duration-200";

export default function SignInView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailId = useId();
  const passwordId = useId();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [googlePending, setGooglePending] = useState(false);
  const [googleError, setGoogleError] = useState(null);

  const next = sanitizeNextPath(searchParams.get("next") ?? "");
  const oauthFailed = searchParams.get("error") === "oauth";

  const persistNextHref = `/auth/signup?next=${encodeURIComponent(next)}`;

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setFormError(null);
      setSubmitting(true);
      const supabase = createSupabaseBrowserClient();
      const { data: signInData, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      setSubmitting(false);
      if (error) {
        setFormError(
          error.message?.toLowerCase().includes("invalid login")
            ? "E-mail ou mot de passe incorrect."
            : error.message || "Connexion impossible pour le moment.",
        );
        return;
      }
      const userId = signInData.user?.id;
      const dest = userId
        ? await resolvePostAuthPathClient(supabase, userId, searchParams.get("next") ?? "")
        : next;
      router.refresh();
      router.replace(dest);
    },
    [router, next, email, password, searchParams],
  );

  const handleGoogle = useCallback(async () => {
    setGoogleError(null);
    setGooglePending(true);
    const result = await signInWithGoogleClient(next);
    setGooglePending(false);
    if (!result.ok) {
      setGoogleError(result.message);
    }
  }, [next]);

  return (
    <AuthPageShell>
      <div className="rounded-[2rem] border border-gray-200 bg-white p-5 shadow-lg sm:p-6 md:p-8">
        <div className="mb-5 text-center sm:mb-6">
          <h1 className="bg-gradient-to-r from-slate-900 to-indigo-800 bg-clip-text px-2 font-[family-name:var(--font-geist-sans)] text-xl font-medium tracking-tight text-transparent sm:text-2xl md:text-3xl">
            Connecte-toi pour générer tes fiches.
          </h1>
          <p className="mt-2 px-2 text-sm text-slate-500 sm:text-base">
            Fiches complètes, entraînement oral et quiz sur le programme.
          </p>
          {(oauthFailed || googleError) && (
            <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
              {googleError ??
                "La connexion Google a échoué. Vérifie la configuration Supabase (provider Google, URL de redirection)."}
            </p>
          )}
          {formError ? (
            <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
              {formError}
            </p>
          ) : null}
        </div>

        <form className="space-y-5 sm:space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor={emailId} className="block text-sm font-medium tracking-tight text-black">
              E-mail
            </label>
            <input
              id={emailId}
              name="email"
              type="email"
              autoComplete="email"
              placeholder="ton@email.com"
              required
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor={passwordId}
              className="block text-sm font-medium tracking-tight text-black"
            >
              Mot de passe
            </label>
            <input
              id={passwordId}
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="relative w-full overflow-hidden rounded-[10px] bg-gradient-to-br from-indigo-600 via-indigo-600 to-blue-700 px-6 py-3.5 text-base font-medium text-white shadow-lg transition hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-12 sm:px-8 sm:text-lg min-h-[52px]"
          >
            <span className="relative z-10">{submitting ? "Connexion…" : "Se connecter"}</span>
          </button>
        </form>

        <div className="relative my-5 sm:my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200/50" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-slate-500">Ou continuer avec</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={googlePending}
          className="flex w-full min-h-[52px] items-center justify-center space-x-2 rounded-[10px] border border-gray-100 bg-white px-6 py-3.5 text-base font-medium text-black shadow-sm transition hover:bg-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:ring-offset-white enabled:cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-12 sm:px-8 sm:text-lg"
        >
          <GoogleMark />
          <span>{googlePending ? "Redirection…" : "Se connecter avec Google"}</span>
        </button>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500 md:text-base">
            Pas encore de compte ?{" "}
            <Link
              href={persistNextHref}
              className="font-medium text-indigo-600 transition-colors duration-300 hover:text-indigo-600/80 hover:underline"
            >
              S’inscrire
            </Link>
          </p>
          <p className="mt-2 text-xs text-slate-400 md:text-sm">Révision facile</p>
        </div>
      </div>
    </AuthPageShell>
  );
}
