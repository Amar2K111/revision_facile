"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useId, useState } from "react";
import { mapAuthErrorMessage } from "../../lib/authErrorMessage";
import { POST_LOGIN_DEFAULT_PATH, sanitizeNextPath } from "../../lib/authRedirects";
import { createSupabaseBrowserClient } from "../../lib/supabase/client";
import { signInWithGoogleClient } from "../../lib/auth/signInWithGoogle";
import { AppLoadingScreen } from "../AppLoadingScreen";
import { AuthCard } from "./AuthCard";
import { AuthModeTabs } from "./AuthModeTabs";
import AuthPageShell from "./AuthPageShell";
import GoogleMark from "./GoogleMark";
import { PasswordInput } from "./PasswordInput";
import {
  authAlertClass,
  authDividerClass,
  authFieldClass,
  authFormClass,
  authGooglePrimaryBtnClass,
  authInputClass,
  authLabelClass,
  authPrimaryBtnClass,
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
  const nextEncoded = encodeURIComponent(next);
  const oauthFailed = searchParams.get("error") === "oauth";

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
        setFormError(mapAuthErrorMessage(error.message, "Connexion impossible pour le moment."));
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
      <AuthCard title="Bon retour" subtitle="Connecte-toi pour générer tes fiches.">
        <AuthModeTabs mode="signin" nextEncoded={nextEncoded} />

        {(oauthFailed || googleError || formError) && (
          <div className="mb-3 space-y-2">
            {(oauthFailed || googleError) && (
              <p className={`${authAlertClass} border-red-200 bg-red-50 text-red-800`} role="alert">
                {googleError ??
                  "La connexion Google a échoué. Réessaie ou utilise ton e-mail."}
              </p>
            )}
            {formError ? (
              <p className={`${authAlertClass} border-red-200 bg-red-50 text-red-800`} role="alert">
                {formError}
              </p>
            ) : null}
          </div>
        )}

        <button
          type="button"
          onClick={handleGoogle}
          disabled={googlePending || submitting}
          className={authGooglePrimaryBtnClass}
        >
          <GoogleMark />
          <span>{googlePending ? "Redirection…" : "Continuer avec Google"}</span>
        </button>

        <div className={authDividerClass}>
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-[11px] font-medium uppercase tracking-wide">
            <span className="bg-white px-2 text-slate-400">ou</span>
          </div>
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
              inputMode="email"
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
          <button type="submit" disabled={submitting || googlePending} className={authPrimaryBtnClass}>
            {submitting ? "Connexion…" : "Se connecter avec e-mail"}
          </button>
        </form>

        <p className="mt-3 text-center text-xs text-slate-500">
          Pas encore de compte ?{" "}
          <Link
            href={`/auth/signup?next=${nextEncoded}`}
            className="font-semibold text-indigo-600 hover:underline"
          >
            S’inscrire
          </Link>
        </p>
      </AuthCard>
    </AuthPageShell>
  );
}
