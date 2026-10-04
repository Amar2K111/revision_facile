"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useId, useState } from "react";
import { POST_LOGIN_DEFAULT_PATH, sanitizeNextPath } from "../../lib/authRedirects";
import { createSupabaseBrowserClient } from "../../lib/supabase/client";
import { signInWithGoogleClient } from "../../lib/auth/signInWithGoogle";
import { AppLoadingScreen } from "../AppLoadingScreen";
import AuthPageShell from "./AuthPageShell";
import GoogleMark from "./GoogleMark";
import { PasswordInput } from "./PasswordInput";
import {
  authAlertClass,
  authCardClass,
  authDividerClass,
  authFieldClass,
  authFormClass,
  authGoogleBtnClass,
  authInputClass,
  authLabelClass,
  authPrimaryBtnClass,
  authSubtitleClass,
  authTitleClass,
} from "./authFormStyles";

export default function SignInView() {
  const searchParams = useSearchParams();
  const emailId = useId();
  const passwordId = useId();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [googlePending, setGooglePending] = useState(false);
  const [googleError, setGoogleError] = useState(null);
  const [redirecting, setRedirecting] = useState(false);

  const next = sanitizeNextPath(searchParams.get("next") ?? POST_LOGIN_DEFAULT_PATH);
  const oauthFailed = searchParams.get("error") === "oauth";

  const persistNextHref = `/auth/signup?next=${encodeURIComponent(next)}`;

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setFormError(null);
      setSubmitting(true);
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        setSubmitting(false);
        setFormError(
          error.message?.toLowerCase().includes("invalid login")
            ? "E-mail ou mot de passe incorrect."
            : error.message || "Connexion impossible pour le moment.",
        );
        return;
      }
      setRedirecting(true);
      const continueNext = sanitizeNextPath(searchParams.get("next") ?? POST_LOGIN_DEFAULT_PATH);
      window.location.replace(`/auth/continue?next=${encodeURIComponent(continueNext)}`);
    },
    [email, password, searchParams],
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

  if (redirecting) {
    return <AppLoadingScreen message="Connexion réussie…" />;
  }

  return (
    <AuthPageShell>
      <div className={authCardClass}>
        <div className="mb-3 text-center">
          <h1 className={authTitleClass}>Connecte-toi pour générer tes fiches</h1>
          <p className={`${authSubtitleClass} max-[380px]:hidden`}>
            Fiches, entraînement oral et quiz sur ton programme.
          </p>
          {(oauthFailed || googleError) && (
            <p className={`${authAlertClass} border-red-200 bg-red-50 text-red-800`} role="alert">
              {googleError ??
                "La connexion Google a échoué. Vérifie la configuration Supabase (provider Google, URL de redirection)."}
            </p>
          )}
          {formError ? (
            <p className={`${authAlertClass} border-red-200 bg-red-50 text-red-800`} role="alert">
              {formError}
            </p>
          ) : null}
        </div>

        <form className={authFormClass} onSubmit={handleSubmit}>
          <div className={authFieldClass}>
            <label htmlFor={emailId} className={authLabelClass}>
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
              className={authInputClass}
            />
          </div>
          <div className={authFieldClass}>
            <label htmlFor={passwordId} className={authLabelClass}>
              Mot de passe
            </label>
            <PasswordInput
              id={passwordId}
              name="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
            />
          </div>
          <button type="submit" disabled={submitting} className={authPrimaryBtnClass}>
            {submitting ? "Connexion…" : "Se connecter"}
          </button>
        </form>

        <div className={authDividerClass}>
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200/50" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-2 text-slate-500">Ou continuer avec</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={googlePending}
          className={authGoogleBtnClass}
        >
          <GoogleMark />
          <span>{googlePending ? "Redirection…" : "Se connecter avec Google"}</span>
        </button>

        <p className="mt-3 text-center text-xs text-slate-500 sm:text-sm">
          Pas encore de compte ?{" "}
          <Link
            href={persistNextHref}
            className="font-medium text-indigo-600 transition-colors hover:text-indigo-600/80 hover:underline"
          >
            S’inscrire
          </Link>
        </p>
      </div>
    </AuthPageShell>
  );
}
