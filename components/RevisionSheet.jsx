export default function RevisionSheet({ sheet }) {
  if (!sheet) return null;

  return (
    <article
      id="revision-sheet"
      className="rounded-2xl border border-amber-100/80 bg-[#fffdf8] shadow-[0_28px_80px_-32px_rgba(30,27,20,0.45)] ring-1 ring-black/5 print:border print:shadow-none"
    >
      <div className="border-b border-amber-900/10 bg-gradient-to-r from-amber-50/80 to-orange-50/50 px-6 py-5 sm:px-10 sm:py-7 print:bg-none">
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${sheet.accent.badge}`}
        >
          {sheet.meta}
        </span>
        <h2 className="mt-4 font-[family-name:var(--font-geist-sans)] text-2xl font-semibold leading-snug tracking-tight text-slate-900 sm:text-[1.65rem]">
          {sheet.title}
        </h2>
        <p className="mt-3 max-w-2xl text-pretty text-sm leading-relaxed text-slate-700 sm:text-base">
          {sheet.intro}
        </p>
      </div>

      <div className="space-y-8 px-6 py-8 sm:px-10 sm:py-10">
        {sheet.blocks.map((block) => (
          <section key={block.heading}>
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-amber-900/70">
              {block.heading}
            </h3>
            {block.lines.every((l) => /^\d\)/.test(l)) ? (
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-slate-800 sm:text-[15px]">
                {block.lines.map((line) => (
                  <li key={line}>{line.replace(/^\d\)\s*/, "")}</li>
                ))}
              </ol>
            ) : (
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-800 sm:text-[15px]">
                {block.lines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            )}
          </section>
        ))}

        <section className="rounded-xl border border-indigo-100 bg-indigo-50/50 px-4 py-4 sm:px-5">
          <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-900/70">
            Pour aller plus loin
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-indigo-950/90">{sheet.footer}</p>
        </section>
      </div>

      <footer className="border-t border-amber-900/10 px-6 py-4 text-center text-[11px] text-slate-500 sm:px-10 print:text-slate-400">
        Fiche générée par Révision Facile — usage personnel pour préparer le Brevet.
      </footer>
    </article>
  );
}
