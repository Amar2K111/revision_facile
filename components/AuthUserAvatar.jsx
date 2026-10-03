"use client";

import { useRouter, usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "../lib/supabase/client";

/** Menu profil : portail Stripe + déconnexion. */
export default function AuthUserAvatar() {
  const router = useRouter();
  const pathname = usePathname();
  const menuId = useId();
  const rootRef = useRef(null);
  const [hasSession, setHasSession] = useState(false);
  const [open, setOpen] = useState(false);
  const [portalBusy, setPortalBusy] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    void supabase.auth.getSession().then(({ data }) => {
      setHasSession(!!data.session);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasSession(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const onDoc = (e) => {
      const root = rootRef.current;
      if (root && e.target instanceof Node && !root.contains(e.target)) {
        setOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const openPortal = useCallback(async () => {
    setPortalBusy(true);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ returnPath: pathname && pathname.startsWith("/") ? pathname : "/reviser" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        window.alert(
          typeof data.error === "string" ? data.error : "Impossible d’ouvrir le portail Stripe pour le moment.",
        );
        return;
      }
      if (typeof data.url === "string" && data.url) {
        window.location.assign(data.url);
        return;
      }
      window.alert("Réponse Stripe invalide.");
    } catch {
      window.alert("Erreur réseau.");
    } finally {
      setPortalBusy(false);
      setOpen(false);
    }
  }, [pathname]);

  const signOut = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    setOpen(false);
    router.push("/");
    router.refresh();
  }, [router]);

  if (!hasSession) {
    return null;
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 ring-2 ring-indigo-200/90 transition hover:bg-indigo-200/70 hover:ring-indigo-300/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        title="Compte"
        aria-label="Ouvrir le menu compte"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-5 w-5"
          aria-hidden
        >
          <path
            fillRule="evenodd"
            d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 z-50 mt-1.5 min-w-[13rem] rounded-xl border border-slate-200/90 bg-white py-1 shadow-lg shadow-slate-900/15 ring-1 ring-slate-900/[0.04]"
        >
          <button
            type="button"
            role="menuitem"
            disabled={portalBusy}
            onClick={() => void openPortal()}
            className="flex w-full items-center px-3 py-2.5 text-left text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60"
          >
            {portalBusy ? "Redirection…" : "Gérer l’abonnement"}
          </button>
          <div className="my-1 border-t border-slate-100" role="presentation" />
          <button
            type="button"
            role="menuitem"
            onClick={() => void signOut()}
            className="flex w-full items-center px-3 py-2.5 text-left text-sm font-medium text-red-700 hover:bg-red-50"
          >
            Se déconnecter
          </button>
        </div>
      ) : null}
    </div>
  );
}
