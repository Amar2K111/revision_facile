"use client";

import { useRouter } from "next/navigation";

export default function AuthPageShell({ children }) {
  const router = useRouter();

  return (
    <div className="relative flex min-h-dvh flex-col bg-gradient-to-b from-indigo-50/80 via-slate-50 to-slate-50">
      <header className="sticky top-0 z-50 pt-safe">
        <div className="mx-auto flex w-full max-w-6xl justify-start px-3 sm:px-4 md:pl-5 lg:pl-8">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined" && window.history.length > 1) {
                router.back();
                return;
              }
              router.push("/auth/signin");
            }}
            className="inline-flex min-h-11 items-center rounded-lg px-3.5 text-sm font-medium text-slate-700 backdrop-blur-sm transition-colors hover:bg-white/70 hover:text-slate-900 active:bg-white/90"
          >
            ← <span className="ml-1 hidden sm:inline">Retour</span>
          </button>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-stretch justify-start overflow-y-auto px-4 py-4 pb-safe sm:items-center sm:justify-center sm:py-8 md:py-12">
        <div className="mx-auto w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
