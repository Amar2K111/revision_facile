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

export default function SignUpView() {
  const searchParams = useSearchParams();
  const nameId = useId();
  const emailId = useId();
  const passwordId = useId();
  const confirmId = useId();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [infoMessage, setInfoMessage] = useState(null);
  const [googlePending, setGooglePending] = useState(false);
  const [googleError, setGoogleError] = useState(null);
  const [redirecting, setRedirecting] = useState(false);

  const next = sanitizeNextPath(searchParams.get("next") ?? POST_LOGIN_DEFAULT_PATH);
  const signInHref = `/auth/signin?next=${encodeURIComponent(next)}`;

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setFormError(null);
      setInfoMessage(null);
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
          emailRedirectTo: origin ? `${origin}/auth/callback?next=${encodeURIComponent(next)}` : undefined,
          data: {
            full_name: name.trim() || undefined,
          },
        },
      });
      setSubmitting(false);
      if (error) {
        setFormError(
          error.message?.includes("already registered") || error.message?.includes("User already")
            ? "Un compte existe déjà avec cet e-mail."
            : error.message || "Inscription impossible pour le moment.",
        );
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
        setInfoMessage(
          "Compte créé ! Ouvre l’e-mail reçu et clique sur « Confirmer mon e-mail » (vérifie les spams).",
        );
        return;
      }
      setInfoMessage("Compte créé. Vérifie ta boîte mail pour finaliser l’inscription.");
    },
    [next, email, password, confirm, name],
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
      <div className={authCardClass}>
        <div className="mb-3 text-center">
          <h1 className={authTitleClass}>Crée ton compte Révision facile</h1>
          <p className={`${authSubtitleClass} max-[380px]:hidden`}>
            Retrouve tes fiches et progresse sur le programme.
          </p>
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
          {infoMessage ? (
            <p className={`${authAlertClass} border-indigo-200 bg-indigo-50 text-indigo-900`} role="status">
              {infoMessage}
            </p>
          ) : null}
        </div>

        <form className={authFormClass} onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <div className={`${authFieldClass} sm:col-span-2`}>
              <label htmlFor={nameId} className={authLabelClass}>
                Prénom ou pseudo
              </label>
              <input
                id={nameId}
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Camille"
                value={name}
                onChange={(ev) => setName(ev.target.value)}
                className={authInputClass}
              />
            </div>
            <div className={`${authFieldClass} sm:col-span-2`}>
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
          <span>{googlePending ? "Redirection…" : "S’inscrire avec Google"}</span>
        </button>

        <div className="mt-3 space-y-2 text-center">
          <p className="text-[11px] leading-snug text-slate-500">
            En créant un compte, tu acceptes les{" "}
            <Link href="/cgu" className="font-medium text-indigo-600 hover:underline">
              CGU
            </Link>{" "}
            et la{" "}
            <Link href="/confidentialite" className="font-medium text-indigo-600 hover:underline">
              confidentialité
            </Link>
            .
          </p>
          <p className="text-xs text-slate-500 sm:text-sm">
            Déjà un compte ?{" "}
            <Link
              href={signInHref}
              className="font-medium text-indigo-600 transition-colors hover:text-indigo-600/80 hover:underline"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </AuthPageShell>
  );
}
