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

export default function SignUpView() {
  const router = useRouter();
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

  const next = sanitizeNextPath(searchParams.get("next") ?? "");
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
        const dest = await resolvePostAuthPathClient(supabase, data.user.id, searchParams.get("next") ?? "");
        router.refresh();
        router.replace(dest);
        return;
      }
      setInfoMessage(
        "Compte créé. Si tu ne te connectes pas tout de suite, vérifie ta boîte mail pour confirmer ton adresse (selon les réglages du projet).",
      );
    },
    [router, next, email, password, confirm, name],
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
            Crée ton compte Révision facile.
          </h1>
          <p className="mt-2 px-2 text-sm text-slate-500 sm:text-base">
            Enregistre-toi pour retrouver tes fiches et progresser sur le programme.
          </p>
          {googleError && (
            <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
              {googleError}
            </p>
          )}
          {formError ? (
            <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
              {formError}
            </p>
          ) : null}
          {infoMessage ? (
            <p className="mt-3 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm text-indigo-900" role="status">
              {infoMessage}
            </p>
          ) : null}
        </div>

        <form className="space-y-5 sm:space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor={nameId} className="block text-sm font-medium tracking-tight text-black">
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
              className={inputClass}
            />
          </div>
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
              autoComplete="new-password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor={confirmId} className="block text-sm font-medium tracking-tight text-black">
              Confirmer le mot de passe
            </label>
            <input
              id={confirmId}
              name="confirm"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              required
              value={confirm}
              onChange={(ev) => setConfirm(ev.target.value)}
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="relative w-full overflow-hidden rounded-[10px] bg-gradient-to-br from-indigo-600 via-indigo-600 to-blue-700 px-6 py-3.5 text-base font-medium text-white shadow-lg transition hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-12 sm:px-8 sm:text-lg min-h-[52px]"
          >
            <span className="relative z-10">{submitting ? "Création…" : "Créer mon compte"}</span>
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
          <span>{googlePending ? "Redirection…" : "S’inscrire avec Google"}</span>
        </button>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500 md:text-base">
            Déjà un compte ?{" "}
            <Link
              href={signInHref}
              className="font-medium text-indigo-600 transition-colors duration-300 hover:text-indigo-600/80 hover:underline"
            >
              Se connecter
            </Link>
          </p>
          <p className="mt-2 text-xs text-slate-400 md:text-sm">Révision facile</p>
        </div>
      </div>
    </AuthPageShell>
  );
}
