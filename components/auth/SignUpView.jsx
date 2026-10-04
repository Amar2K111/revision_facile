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
  authGoogleBtnClass,
  authInputClass,
  authLabelClass,
  authPrimaryBtnClass,
} from "./authFormStyles";

export default function SignUpView() {
  const searchParams = useSearchParams();
  const emailId = useId();
  const passwordId = useId();
  const confirmId = useId();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [googlePending, setGooglePending] = useState(false);
  const [googleError, setGoogleError] = useState(null);
  const [redirecting, setRedirecting] = useState(false);

  const next = sanitizeNextPath(searchParams.get("next") ?? POST_LOGIN_DEFAULT_PATH);
  const nextEncoded = encodeURIComponent(next);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setFormError(null);
      if (password !== confirm) {
        setFormError("Les mots de passe ne correspondent pas.");
        return;
      }
      if (password.length < 6) {
        setFormError("Le mot de passe doit contenir au moins 6 caractères.");
        return;
      }
      setSubmitting(true);
      const supabase = createSupabaseBrowserClient();
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: origin ? `${origin}/auth/callback?next=${nextEncoded}` : undefined,
        },
      });
      setSubmitting(false);
      if (error) {
        setFormError(mapAuthErrorMessage(error.message, "Inscription impossible pour le moment."));
        return;
      }
      if (data.session && data.user?.id) {
        setRedirecting(true);
        window.location.replace(
          `/auth/continue?next=${encodeURIComponent(POST_LOGIN_DEFAULT_PATH)}`,
        );
        return;
      }
      if (data.user?.id) {
        setRedirecting(true);
        const params = new URLSearchParams({ next });
        if (email.trim()) {
          params.set("email", email.trim());
        }
        window.location.replace(`/auth/check-email?${params.toString()}`);
        return;
      }
    },
    [nextEncoded, email, password, confirm],
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
    return <AppLoadingScreen message="Création de ton espace…" />;
  }

  return (
    <AuthPageShell>
      <AuthCard title="Crée ton compte" subtitle="Gratuit — ton prénom sera demandé juste après.">
        <AuthModeTabs mode="signup" nextEncoded={nextEncoded} />

        {(googleError || formError) && (
          <div className="mb-3 space-y-2">
            {googleError && (
              <p className={`${authAlertClass} border-red-200 bg-red-50 text-red-800`} role="alert">
                {googleError}
              </p>
            )}
            {formError ? (
              <p className={`${authAlertClass} border-red-200 bg-red-50 text-red-800`} role="alert">
                {formError}
              </p>
            ) : null}
          </div>
        )}

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
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className={authFieldClass}>
              <label htmlFor={passwordId} className={authLabelClass}>
                Mot de passe
              </label>
              <PasswordInput
                id={passwordId}
                name="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
              />
            </div>
            <div className={authFieldClass}>
              <label htmlFor={confirmId} className={authLabelClass}>
                Confirmer
              </label>
              <PasswordInput
                id={confirmId}
                name="confirm"
                autoComplete="new-password"
                required
                value={confirm}
                onChange={(ev) => setConfirm(ev.target.value)}
              />
            </div>
          </div>
          <button type="submit" disabled={submitting} className={authPrimaryBtnClass}>
            {submitting ? "Création…" : "Créer mon compte"}
          </button>
        </form>

        <div className={authDividerClass}>
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-[11px] font-medium uppercase tracking-wide">
            <span className="bg-white px-2 text-slate-400">ou</span>
          </div>
        </div>

        <button type="button" onClick={handleGoogle} disabled={googlePending} className={authGoogleBtnClass}>
          <GoogleMark />
          <span>{googlePending ? "Redirection…" : "Continuer avec Google"}</span>
        </button>

        <p className="mt-3 text-center text-[11px] leading-snug text-slate-400">
          En t’inscrivant, tu acceptes les{" "}
          <Link href="/cgu" className="text-slate-500 underline-offset-2 hover:text-indigo-600 hover:underline">
            CGU
          </Link>{" "}
          et la{" "}
          <Link
            href="/confidentialite"
            className="text-slate-500 underline-offset-2 hover:text-indigo-600 hover:underline"
          >
            confidentialité
          </Link>
          .
        </p>
      </AuthCard>
    </AuthPageShell>
  );
}
