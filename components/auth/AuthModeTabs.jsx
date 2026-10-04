import Link from "next/link";
import { authTabActiveClass, authTabInactiveClass } from "./authFormStyles";

/** Segmented control Connexion / Inscription (pattern web app). */
export function AuthModeTabs({ mode, nextEncoded }) {
  const signInHref = `/auth/signin?next=${nextEncoded}`;
  const signUpHref = `/auth/signup?next=${nextEncoded}`;

  return (
    <div
      className="mb-4 flex gap-1 rounded-xl bg-slate-100/90 p-1"
      role="tablist"
      aria-label="Connexion ou inscription"
    >
      <Link
        href={signInHref}
        role="tab"
        aria-selected={mode === "signin"}
        className={mode === "signin" ? authTabActiveClass : authTabInactiveClass}
      >
        Connexion
      </Link>
      <Link
        href={signUpHref}
        role="tab"
        aria-selected={mode === "signup"}
        className={mode === "signup" ? authTabActiveClass : authTabInactiveClass}
      >
        Inscription
      </Link>
    </div>
  );
}
