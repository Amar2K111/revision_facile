"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const HIDE_BANNER_PATHS = ["/fiche", "/paywall", "/auth"];

const DISMISS_KEY = "revision-facile-install-dismissed";

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    /** @type {Window & { navigator: { standalone?: boolean } }} */ (window).navigator.standalone ===
      true
  );
}

function isIOS() {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

export function InstallAppBanner() {
  const pathname = usePathname();
  const hideOnPage = HIDE_BANNER_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [iosHint, setIosHint] = useState(false);
  /** @type {[{ prompt: () => Promise<void> } | null, (v: null) => void]} */
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || isStandalone()) return;
    try {
      if (localStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {
      /* ignore */
    }

    if (isIOS()) {
      setIosHint(true);
      setVisible(true);
      return;
    }

    const onBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, [mounted]);

  const dismiss = useCallback(() => {
    setVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    setDeferredPrompt(null);
    dismiss();
  }, [deferredPrompt, dismiss]);

  if (!mounted || !visible || hideOnPage) return null;

  return (
    <div className="print:hidden fixed inset-x-4 bottom-[max(env(safe-area-inset-bottom,12px),12px)] z-50 mx-auto max-w-md">
      <div className="flex items-start gap-3 rounded-2xl border border-indigo-200/90 bg-white p-4 shadow-xl shadow-slate-900/15 ring-1 ring-slate-900/5">
        <img src="/icon.png" alt="" className="h-11 w-11 shrink-0 rounded-xl shadow-sm" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900">Installer Révision facile</p>
          {iosHint ? (
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              Appuie sur{" "}
              <span className="font-medium text-slate-800">Partager</span> puis{" "}
              <span className="font-medium text-slate-800">Sur l’écran d’accueil</span>.
            </p>
          ) : (
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              Accède à tes fiches en un tap, comme une vraie app.
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            {!iosHint && deferredPrompt ? (
              <button
                type="button"
                onClick={() => void install()}
                className="inline-flex min-h-10 items-center rounded-xl bg-indigo-600 px-4 text-xs font-semibold text-white transition hover:bg-indigo-500 active:bg-indigo-600"
              >
                Installer
              </button>
            ) : null}
            <button
              type="button"
              onClick={dismiss}
              className="inline-flex min-h-10 items-center rounded-xl px-3 text-xs font-medium text-slate-600 transition hover:bg-slate-100 active:bg-slate-200"
            >
              Plus tard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
