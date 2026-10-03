import Link from "next/link";
import { SITE_EMAIL } from "@/lib/site";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="print:hidden border-t border-slate-200/80 bg-slate-50/90">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-5 py-8 sm:flex-row sm:justify-between sm:px-8">
        <p className="text-xs text-slate-500">© {year} Révision facile</p>
        <nav aria-label="Liens légaux" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs">
          <Link href="/mentions-legales" className="text-slate-600 transition hover:text-indigo-700">
            Mentions légales
          </Link>
          <Link href="/confidentialite" className="text-slate-600 transition hover:text-indigo-700">
            Confidentialité
          </Link>
          <Link href="/cgu" className="text-slate-600 transition hover:text-indigo-700">
            CGU
          </Link>
          <a
            href={`mailto:${SITE_EMAIL}`}
            className="text-slate-600 transition hover:text-indigo-700"
          >
            Contact
          </a>
        </nav>
      </div>
    </footer>
  );
}
