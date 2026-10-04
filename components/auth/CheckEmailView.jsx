"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { POST_LOGIN_DEFAULT_PATH, sanitizeNextPath } from "../../lib/authRedirects";
import { createSupabaseBrowserClient } from "../../lib/supabase/client";
import { SiteLogo } from "../SiteLogo";
import AuthPageShell from "./AuthPageShell";
import {
  authCardBodyClass,
  authCardClass,
  authGoogleBtnClass,
  authPrimaryBtnClass,
  authSubtitleClass,
  authTitleClass,
} from "./authFormStyles";

function MailIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0l-7.5-4.615a2.25 2.25 0 01-1.07-1.916V6.75"
      />
    </svg>
  );
}

export default function CheckEmailView() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email")?.trim() ?? "";
  const next = sanitizeNextPath(searchParams.get("next") ?? POST_LOGIN_DEFAULT_PATH);
  const nextEncoded = encodeURIComponent(next);
  const signInHref = `/auth/signin?next=${nextEncoded}`;

  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [resendError, setResendError] = useState(null);

  const handleResend = useCallback(async () => {
    if (!email) {
      return;
    }
    setResendError(null);
    setResending(true);
    const supabase = createSupabaseBrowserClient();
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: origin ? `${origin}/auth/callback?next=${nextEncoded}` : undefined,
      },
    });
    setResending(false);
    if (error) {
      setResendError("Impossible de renvoyer l’e-mail pour le moment. Réessaie dans quelques minutes.");
      return;
    }
    setResent(true);
  }, [email, nextEncoded]);

  const mailProviderHref = email.endsWith("@gmail.com")
    ? "https://mail.google.com"
    : email.includes("@outlook.") || email.includes("@hotmail.") || email.includes("@live.")
      ? "https://outlook.live.com/mail"
      : email.includes("@icloud.") || email.includes("@me.com")
        ? "https://www.icloud.com/mail"
        : null;

  return (
    <AuthPageShell>
      <div className={authCardClass}>
        <div className="h-1 bg-gradient-to-r from-indigo-500 to-violet-600" aria-hidden />
        <div className={`${authCardBodyClass} text-center`}>
          <SiteLogo variant="domain" size="sm" href="/" linked={false} className="justify-center" />

          <div className="mx-auto mt-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 ring-1 ring-indigo-100">
            <MailIcon className="h-7 w-7 text-indigo-600" />
          </div>

          <h1 className={`${authTitleClass} mt-5`}>Vérifie ta boîte mail</h1>
          <p className={`${authSubtitleClass} mt-2 max-w-xs mx-auto`}>
            Compte créé ! On t’a envoyé un lien de confirmation
            {email ? (
              <>
                {" "}
                à{" "}
                <span className="font-semibold text-slate-800 break-all">{email}</span>
              </>
            ) : (
              "."
            )}
          </p>

          <ol className="mt-5 space-y-2 text-left text-sm text-slate-600">
            <li className="flex gap-3 rounded-xl bg-slate-50 px-3 py-2.5 ring-1 ring-slate-100">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
                1
              </span>
              <span>Ouvre l’e-mail de RévisionFacile.com</span>
            </li>
            <li className="flex gap-3 rounded-xl bg-slate-50 px-3 py-2.5 ring-1 ring-slate-100">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
                2
              </span>
              <span>
                Clique sur <strong className="font-semibold text-slate-800">Confirmer mon e-mail</strong>
              </span>
            </li>
          </ol>

          <p className="mt-4 text-xs leading-snug text-slate-400">
            Rien reçu ? Vérifie les spams ou attends 1–2 minutes.
          </p>

          {resendError ? (
            <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800" role="alert">
              {resendError}
            </p>
          ) : null}
          {resent ? (
            <p className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800" role="status">
              E-mail renvoyé. Vérifie ta boîte mail.
            </p>
          ) : null}

          <div className="mt-5 space-y-2.5">
            {mailProviderHref ? (
              <a
                href={mailProviderHref}
                target="_blank"
                rel="noopener noreferrer"
                className={authPrimaryBtnClass}
              >
                Ouvrir ma messagerie
              </a>
            ) : null}
            <Link href={signInHref} className={mailProviderHref ? authGoogleBtnClass : authPrimaryBtnClass}>
              J’ai confirmé — me connecter
            </Link>
          </div>

          {email ? (
            <button
              type="button"
              onClick={() => void handleResend()}
              disabled={resending || resent}
              className="mt-4 text-xs font-medium text-indigo-600 transition hover:text-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {resending ? "Envoi…" : resent ? "E-mail renvoyé" : "Renvoyer l’e-mail de confirmation"}
            </button>
          ) : null}

          <p className="mt-4 text-xs text-slate-400">
            Mauvaise adresse ?{" "}
            <Link href={`/auth/signup?next=${nextEncoded}`} className="font-medium text-indigo-600 hover:underline">
              Recommencer l’inscription
            </Link>
          </p>
        </div>
      </div>
    </AuthPageShell>
  );
}
