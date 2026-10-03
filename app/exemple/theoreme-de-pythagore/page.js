import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import { FicheMarkdownSection } from "@/components/MarkdownFiche";
import { SiteLogo } from "@/components/SiteLogo";

export const metadata = {
  title: "Fiche de révision Théorème de Pythagore – Maths Brevet 2027",
  description:
    "Fiche de révision gratuite sur le théorème de Pythagore pour le Brevet 2027 (DNB) : formules, exemples, astuces et pièges à éviter.",
  alternates: { canonical: "/exemple/theoreme-de-pythagore" },
  openGraph: {
    title: "Fiche Théorème de Pythagore – Maths Brevet 2027 | Révision facile",
    description:
      "Exemple de fiche de révision conforme au programme 2026-2027 : théorème de Pythagore pour le Brevet 2027.",
  },
};

function loadExampleMarkdown() {
  const filePath = path.join(process.cwd(), "data", "exemple-pythagore.md");
  return fs.readFileSync(filePath, "utf8");
}

export default function ExemplePythagorePage() {
  const markdown = loadExampleMarkdown();

  return (
    <div className="min-h-dvh bg-gradient-to-b from-indigo-50/80 via-slate-50 to-slate-50">
      <header className="border-b border-slate-200/70 bg-slate-50/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-5 sm:h-16 sm:px-8">
          <SiteLogo href="/" size="sm" />
          <Link
            href="/auth/signup?next=/reviser"
            className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            Créer ma fiche
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-700">
          Exemple gratuit · Brevet 2027 · Maths
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-geist-sans)] text-2xl font-semibold text-slate-900 sm:text-3xl">
          Théorème de Pythagore
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          Voici à quoi ressemble une fiche générée par Révision facile : l&apos;essentiel, le
          programme dense et les astuces de mémorisation.
        </p>

        <div className="mt-8">
          <FicheMarkdownSection markdown={markdown} />
        </div>

        <div className="mt-10 rounded-2xl border border-indigo-200 bg-indigo-50/80 p-6 text-center">
          <h2 className="font-[family-name:var(--font-geist-sans)] text-lg font-semibold text-slate-900">
            Génère ta propre fiche en quelques secondes
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Choisis ta classe, ta matière et ton chapitre — conforme au programme officiel.
          </p>
          <Link
            href="/auth/signup?next=/reviser"
            className="mt-5 inline-flex rounded-full bg-indigo-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            Commencer gratuitement
          </Link>
        </div>
      </main>
    </div>
  );
}
