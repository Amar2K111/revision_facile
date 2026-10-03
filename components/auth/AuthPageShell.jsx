"use client";

import Link from "next/link";

export default function AuthPageShell({ children }) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-gradient-to-b from-indigo-50/80 via-slate-50 to-slate-50">
      <header className="absolute top-0 z-50 flex w-full pt-2 sm:pt-3 md:pt-2.5">
        <div className="mx-auto flex w-full max-w-6xl justify-start px-3 sm:px-4 md:pl-5 lg:pl-8">
          <Link
            href="/"
            className="fixed top-3 left-3 z-50 flex items-center justify-center rounded-lg px-3.5 py-2 text-sm font-medium text-slate-700 backdrop-blur-sm transition-colors hover:bg-white/70 hover:text-slate-900 sm:top-2.5 sm:left-3"
          >
            ← <span className="ml-1 hidden sm:inline">Retour</span>
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-6 sm:py-8 md:py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
