import Link from "next/link";
import { SITE_EMAIL } from "@/lib/site";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="print:hidden border-t border-slate-200/80 bg-slate-50/90 pb-safe">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-5 py-6 sm:flex-row sm:justify-between sm:px-8 sm:py-8">
        <p className="text-xs text-slate-500">© {year} Révision facile</p>
        <nav aria-label="Liens du site" className="flex flex-wrap items-center justify-center gap-x-1 gap-y-1 sm:gap-x-2">
          <Link
            href="/mentions-legales"
            className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm text-slate-600 transition hover:text-indigo-700 active:bg-slate-100"
          >
            Mentions légales
          </Link>
          <Link
            href="/confidentialite"
            className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm text-slate-600 transition hover:text-indigo-700 active:bg-slate-100"
          >
            Confidentialité
          </Link>
          <Link
            href="/cgu"
            className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm text-slate-600 transition hover:text-indigo-700 active:bg-slate-100"
          >
            CGU
          </Link>
          <a
            href={`mailto:${SITE_EMAIL}`}
            className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm text-slate-600 transition hover:text-indigo-700 active:bg-slate-100"
          >
            Contact
          </a>
        </nav>
      </div>
    </footer>
  );
}
