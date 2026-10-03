import { RevisionTipCard } from "./RevisionTipCard";
import { REVISION_TIPS } from "../data/revisionTips";

/** Dernière page de la fiche — astuces méthodo générales (après l’oral). */
export function FicheAstucesPage() {
  return (
    <article className="fiche-markdown rounded-2xl border border-white/80 bg-white/90 px-4 py-6 shadow-lg shadow-slate-200/50 sm:px-10 sm:py-10 print:hidden">
      <h1 className="font-[family-name:var(--font-geist-sans)] text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.65rem]">
        💡 Astuces — comment bien réviser
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-slate-700">
        Tu as lu la fiche et l’oral — voici des méthodes concrètes pour ancrer ce chapitre. Choisis
        une ou deux astuces et teste-les dès aujourd’hui.
      </p>

      <ol className="mt-6 grid gap-3 sm:grid-cols-2 sm:gap-4">
        {REVISION_TIPS.map((tip, index) => (
          <li key={tip.id}>
            <RevisionTipCard title={tip.title} className="h-full text-left">
              <span className="sr-only">{`Astuce ${index + 1} sur ${REVISION_TIPS.length} — `}</span>
              {tip.text}
            </RevisionTipCard>
          </li>
        ))}
      </ol>
    </article>
  );
}
