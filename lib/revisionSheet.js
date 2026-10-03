export const SHEET_STORAGE_KEY = "revision-express-sheet";

/** Payload sessionStorage pour fiche Markdown (Révision facile / IA). */
export const SHEET_MARKDOWN_VERSION = 3;

export const ACCENTS = {
  math: { badge: "bg-emerald-100 text-emerald-900 ring-emerald-600/20" },
  fr: { badge: "bg-rose-100 text-rose-900 ring-rose-600/20" },
  hist: { badge: "bg-amber-100 text-amber-950 ring-amber-600/25" },
  geo: { badge: "bg-sky-100 text-sky-950 ring-sky-600/20" },
  pc: { badge: "bg-violet-100 text-violet-950 ring-violet-600/20" },
  svt: { badge: "bg-lime-100 text-lime-950 ring-lime-700/25" },
  tech: { badge: "bg-slate-200 text-slate-900 ring-slate-600/20" },
  emc: { badge: "bg-blue-100 text-blue-950 ring-blue-600/20" },
  "term-math": { badge: "bg-emerald-100 text-emerald-900 ring-emerald-600/20" },
  "term-phys": { badge: "bg-violet-100 text-violet-950 ring-violet-600/20" },
  "term-chim": { badge: "bg-violet-100 text-violet-950 ring-violet-600/20" },
  "term-econ": { badge: "bg-sky-100 text-sky-950 ring-sky-600/20" },
  "term-ses-soc": { badge: "bg-amber-100 text-amber-950 ring-amber-600/25" },
  "term-svt": { badge: "bg-lime-100 text-lime-950 ring-lime-700/25" },
  "term-hggsp": { badge: "bg-amber-100 text-amber-950 ring-amber-600/25" },
  "term-hlp": { badge: "bg-rose-100 text-rose-900 ring-rose-600/20" },
  "term-llcer": { badge: "bg-rose-100 text-rose-900 ring-rose-600/20" },
  "term-nsi": { badge: "bg-slate-200 text-slate-900 ring-slate-600/20" },
  "term-si": { badge: "bg-slate-200 text-slate-900 ring-slate-600/20" },
  "term-bio-eco": { badge: "bg-lime-100 text-lime-950 ring-lime-700/25" },
  "tech-stmg-msgn": { badge: "bg-sky-100 text-sky-950 ring-sky-600/20" },
  "tech-stmg-de": { badge: "bg-amber-100 text-amber-950 ring-amber-600/25" },
  "tech-sti2d-2i2d": { badge: "bg-slate-200 text-slate-900 ring-slate-600/20" },
  "tech-sti2d-pcm": { badge: "bg-violet-100 text-violet-950 ring-violet-600/20" },
  "tech-st2s-stss": { badge: "bg-lime-100 text-lime-950 ring-lime-700/25" },
  "tech-st2s-bph": { badge: "bg-lime-100 text-lime-950 ring-lime-700/25" },
  "tech-stl-pcl": { badge: "bg-violet-100 text-violet-950 ring-violet-600/20" },
  "tech-stl-bbb": { badge: "bg-lime-100 text-lime-950 ring-lime-700/25" },
  "tech-sthr-sts": { badge: "bg-sky-100 text-sky-950 ring-sky-600/20" },
  "tech-stav-gra": { badge: "bg-lime-100 text-lime-950 ring-lime-700/25" },
  "bts-mco-dcu": { badge: "bg-sky-100 text-sky-950 ring-sky-600/20" },
  "bts-mco-go": { badge: "bg-amber-100 text-amber-950 ring-amber-600/25" },
  "bts-mco-mec": { badge: "bg-sky-100 text-sky-950 ring-sky-600/20" },
  "bts-ndrc-rcnv": { badge: "bg-sky-100 text-sky-950 ring-sky-600/20" },
  "bts-ndrc-rcd": { badge: "bg-slate-200 text-slate-900 ring-slate-600/20" },
  "bts-cg-cpif": { badge: "bg-amber-100 text-amber-950 ring-amber-600/25" },
  "bts-cg-gf": { badge: "bg-amber-100 text-amber-950 ring-amber-600/25" },
  "bts-cg-cga": { badge: "bg-emerald-100 text-emerald-900 ring-emerald-600/20" },
  "bts-sio-slam": { badge: "bg-slate-200 text-slate-900 ring-slate-600/20" },
  "bts-sio-sisr": { badge: "bg-slate-200 text-slate-900 ring-slate-600/20" },
  "bts-comm-cra": { badge: "bg-sky-100 text-sky-950 ring-sky-600/20" },
  "bts-comm-ccc": { badge: "bg-rose-100 text-rose-900 ring-rose-600/20" },
  "bts-gpme-grcf": { badge: "bg-sky-100 text-sky-950 ring-sky-600/20" },
  "bts-gpme-sfp": { badge: "bg-amber-100 text-amber-950 ring-amber-600/25" },
  "bts-ci-eve": { badge: "bg-sky-100 text-sky-950 ring-sky-600/20" },
  "bts-ci-vex": { badge: "bg-sky-100 text-sky-950 ring-sky-600/20" },
};

export function buildSheet({ classLabel, subjectName, subjectId, topic, exam = "brevet" }) {
  const accent = ACCENTS[subjectId] ?? ACCENTS.math;
  const examBlockTitle =
    exam === "bac"
      ? "À maîtriser pour le bac"
      : exam === "bts"
        ? "À maîtriser pour le BTS"
        : "À maîtriser pour le Brevet";
  return {
    accent,
    title: topic,
    meta: `${subjectName} · ${classLabel}`,
    intro: `Fiche express pour activer tes repères sur cette notion du programme. Prends 12 à 20 minutes : lecture rapide, puis une mini-série de questions sans regarder le cours.`,
    blocks: [
      {
        heading: "En bref",
        lines: [
          `Notion du programme : ${topic}.`,
          "Repère les définitions indispensables et les exemples types que ton professeur a repris en classe.",
        ],
      },
      {
        heading: examBlockTitle,
        lines: [
          "Le vocabulaire et les formules associées à cette leçon (sans les confondre avec une notion proche).",
          "Un schéma, un graphique ou un tableau de valeurs si la notion s’y prête.",
          "Un exercice corrigé « type contrôle » : savoir refaire les étapes sans aide.",
          "Les pièges fréquents signalés dans les annales ou dans les corrections.",
        ],
      },
      {
        heading: "Méthode rapide",
        lines: [
          "1) Rappel oral : 2 minutes pour résumer la leçon à voix haute.",
          "2) Questions flash : 5 Q/R courtes sur les définitions.",
          "3) Application : un exercice entier en conditions réelles (chronomètre).",
        ],
      },
    ],
    footer:
      "Prochaine étape : quand tu seras à l’aise, enchaîne avec un sujet voisin du même chapitre pour solidifier les liens entre les notions.",
  };
}
