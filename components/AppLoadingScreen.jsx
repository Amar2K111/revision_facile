import { SiteLogo } from "./SiteLogo";

/**
 * Écran de chargement plein page (connexion, redirection post-auth).
 * @param {{ message?: string, showLogo?: boolean, className?: string }} props
 */
export function AppLoadingScreen({
  message = "Chargement…",
  showLogo = true,
  className = "",
}) {
  return (
    <div
      className={`flex min-h-dvh flex-col items-center justify-center bg-gradient-to-b from-indigo-50/80 via-slate-50 to-slate-50 px-6 pt-safe pb-safe ${className}`.trim()}
    >
      <div className="flex flex-col items-center gap-6">
        {showLogo ? (
          <SiteLogo variant="domain" size="sm" linked={false} className="opacity-90" />
        ) : null}
        <div
          className="h-10 w-10 animate-spin rounded-full border-[3px] border-indigo-200/90 border-t-indigo-600 shadow-sm shadow-indigo-600/10"
          role="status"
          aria-live="polite"
          aria-label={message}
        />
        <p className="max-w-xs text-center text-sm font-medium tracking-tight text-slate-600">
          {message}
        </p>
      </div>
    </div>
  );
}
