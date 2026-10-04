"use client";

import { useRouter } from "next/navigation";

export default function AuthPageShell({ children }) {
  const router = useRouter();

  return (
    <div className="relative flex h-dvh max-h-dvh flex-col overflow-hidden bg-slate-50">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(99,102,241,0.14),transparent)]"
        aria-hidden
      />

      <header className="relative z-10 shrink-0 pt-safe">
        <div className="mx-auto flex w-full max-w-md justify-start px-3 sm:px-4">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined" && window.history.length > 1) {
                router.back();
                return;
              }
              router.push("/");
            }}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition hover:bg-white/80 hover:text-slate-900 active:bg-white"
            aria-label="Retour"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden>
              <path
                fillRule="evenodd"
                d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </header>

      <main className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden px-3 pb-safe pt-0 sm:px-4">
        <div className="w-full max-w-[22rem] shrink-0 sm:max-w-md">{children}</div>
      </main>
    </div>
  );
}
