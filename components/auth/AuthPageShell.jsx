"use client";

import { useRouter } from "next/navigation";

export default function AuthPageShell({ children }) {
  const router = useRouter();

  return (
    <div className="relative flex h-dvh max-h-dvh flex-col overflow-hidden bg-gradient-to-b from-indigo-50/80 via-slate-50 to-slate-50">
      <header className="shrink-0 pt-safe">
        <div className="mx-auto flex w-full max-w-6xl justify-start px-3 sm:px-4">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined" && window.history.length > 1) {
                router.back();
                return;
              }
              router.push("/auth/signin");
            }}
            className="inline-flex h-9 items-center rounded-lg px-2.5 text-xs font-medium text-slate-700 transition-colors hover:bg-white/70 hover:text-slate-900 active:bg-white/90 sm:text-sm"
          >
            ← <span className="ml-1 hidden sm:inline">Retour</span>
          </button>
        </div>
      </header>

      <main className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden px-3 pb-safe pt-1 sm:px-4">
        <div className="w-full max-w-md shrink-0">{children}</div>
      </main>
    </div>
  );
}
