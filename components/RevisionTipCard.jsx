/** Carte astuce révision — même style que pendant la génération de fiche */
export function RevisionTipCard({ title = "Astuce révision", children, className = "", ...rest }) {
  return (
    <article
      className={`rounded-xl border border-indigo-100/80 bg-indigo-50/60 px-4 py-3 shadow-inner shadow-indigo-100/40 ${className}`}
      {...rest}
    >
      <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-indigo-600/90">
        {title}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-slate-700">{children}</p>
    </article>
  );
}
