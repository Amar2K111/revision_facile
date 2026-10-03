"use client";

import { useCallback, useMemo, useState } from "react";
import {
  PRACTICE_QUIZ_QUESTION_TARGET,
  shuffleChoicesForQuestion,
  shuffleCopy,
} from "../lib/practiceQuizShared";

/**
 * QCM série : banque tirée depuis la fiche → mélange aléatoire + max 15,
 * aucune correction entre les questions, bilan + corrections en fin de série.
 * @param {{ practiceQuiz?: Array<{ id: string, q: string, choices: string[], correctIndex: number, explain: string }> }} props
 */
export default function PracticeQuiz({ practiceQuiz = [] }) {
  const bank = useMemo(
    () =>
      Array.isArray(practiceQuiz) ? practiceQuiz.filter((x) => x && typeof x.q === "string") : [],
    [practiceQuiz],
  );

  const seriesLength = Math.min(bank.length, PRACTICE_QUIZ_QUESTION_TARGET);

  /** @type {typeof bank} */
  const [sessionDeck, setSessionDeck] = useState([]);
  /** @type {'idle' | 'running' | 'finished'} */
  const [phase, setPhase] = useState("idle");
  const [cursor, setCursor] = useState(0);
  const [pickedById, setPickedById] = useState(() => /** @type {Record<string, number | undefined>} */ ({}));

  const restart = useCallback(() => {
    setPhase("idle");
    setCursor(0);
    setPickedById({});
    setSessionDeck([]);
  }, []);

  const start = useCallback(() => {
    const pool = shuffleCopy(bank);
    const capped = pool.slice(
      0,
      Math.min(PRACTICE_QUIZ_QUESTION_TARGET, pool.length),
    );
    const deck = capped.map(shuffleChoicesForQuestion);
    setSessionDeck(deck);
    setPhase("running");
    setCursor(0);
    setPickedById({});
  }, [bank]);

  const current = sessionDeck[cursor];

  const pick = useCallback(
    (ci) => {
      if (phase !== "running") return;
      const q = sessionDeck[cursor];
      if (!q) return;
      setPickedById((p) => ({ ...p, [q.id]: ci }));
    },
    [phase, sessionDeck, cursor],
  );

  const gotoNextOrFinish = useCallback(() => {
    const q = sessionDeck[cursor];
    if (!q || typeof pickedById[q.id] !== "number") return;
    if (cursor >= sessionDeck.length - 1) {
      setPhase("finished");
      return;
    }
    setCursor((c) => c + 1);
  }, [sessionDeck, cursor, pickedById]);

  const score = useMemo(() => {
    if (phase !== "finished" || sessionDeck.length === 0) {
      return null;
    }
    let ok = 0;
    for (const item of sessionDeck) {
      if (pickedById[item.id] === item.correctIndex) ok += 1;
    }
    const total = sessionDeck.length;
    const percent = Math.round((ok / total) * 1000) / 10;
    const sur20 = Math.round(((ok / total) * 20) * 10) / 10;
    return { ok, total, percent, sur20 };
  }, [phase, pickedById, sessionDeck]);

  if (bank.length === 0) {
    return null;
  }

  const deckLen = phase === "idle" ? seriesLength : sessionDeck.length;
  const nextLabel =
    phase === "running" && cursor >= sessionDeck.length - 1 ? "Voir le bilan" : "Suivant";
  const hasPickForCurrent =
    phase === "running" &&
    !!current &&
    typeof pickedById[current.id] === "number";

  return (
    <section
      id="quiz-revision-facile"
      tabIndex={-1}
      className="scroll-mt-[4.25rem] print:hidden"
      aria-label="Quiz sur la fiche — QCM"
    >
      <div className="overflow-hidden rounded-2xl border border-slate-200/95 bg-white shadow-[0_18px_50px_-28px_rgba(15,23,42,0.28)] ring-1 ring-slate-200/70">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3.5 sm:px-6 sm:py-4">
          <h2 className="font-[family-name:var(--font-geist-sans)] text-base font-semibold tracking-tight text-slate-900 sm:text-[1.0625rem]">
            Quiz
          </h2>
          <span className="tabular-nums text-xs font-medium text-slate-500 sm:text-[13px]">
            {deckLen} question{deckLen > 1 ? "s" : ""}
          </span>
        </div>

        <div className="px-4 py-4 sm:px-6 sm:py-5">
          {phase === "idle" ? (
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
              <button
                type="button"
                onClick={start}
                className="inline-flex min-h-[2.75rem] w-full shrink-0 items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-[15px] font-semibold text-white shadow-md shadow-indigo-600/22 transition hover:bg-indigo-500 active:bg-indigo-600 sm:w-auto sm:py-2.5 sm:text-sm"
              >
                Commencer
              </button>
            </div>
          ) : null}

          {phase === "running" && current ? (
            <>
              <div className="mb-4 flex flex-wrap items-center gap-3 border-b border-slate-100 pb-3">
                <div className="flex flex-1 items-center gap-2">
                  <span className="tabular-nums text-sm font-semibold text-slate-900">
                    {cursor + 1} / {sessionDeck.length}
                  </span>
                  <span className="hidden h-1 flex-1 max-w-[7rem] overflow-hidden rounded-full bg-slate-200 sm:flex">
                    <span
                      className="block h-full rounded-full bg-indigo-500 transition-[width] duration-300 ease-out"
                      style={{
                        width: `${((cursor + 1) / sessionDeck.length) * 100}%`,
                      }}
                    />
                  </span>
                </div>
                <button
                  type="button"
                  onClick={restart}
                  className="text-xs font-semibold text-slate-500 underline decoration-slate-300 underline-offset-[3px] transition hover:text-slate-700"
                >
                  Quitter
                </button>
              </div>

              <div
                className={
                  hasPickForCurrent
                    ? "relative pb-24 sm:pb-8"
                    : "relative"
                }
              >
                <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-4 sm:bg-white sm:p-5">
                  <p className="text-[15px] font-medium leading-snug text-slate-900 sm:text-base">
                    {current.q}
                  </p>

                  <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {current.choices.map((label, ci) => {
                      const sel = pickedById[current.id];
                      const picked = typeof sel === "number";
                      const isSelected = picked && sel === ci;

                      let btnCls =
                        "flex min-h-[2.875rem] w-full items-center rounded-xl border px-4 py-3 text-left text-[14px] font-medium transition sm:text-sm ";
                      if (!picked) {
                        btnCls +=
                          "border-slate-200 bg-white text-slate-800 shadow-sm hover:border-indigo-300 hover:bg-indigo-50/30 active:bg-indigo-50/60";
                      } else if (isSelected) {
                        btnCls +=
                          "border-indigo-500 bg-indigo-50 text-indigo-950 shadow-sm ring-1 ring-indigo-500/35";
                      } else {
                        btnCls +=
                          "cursor-default border-slate-100 bg-white/60 text-slate-400 opacity-95";
                      }

                      return (
                        <button
                          key={`${current.id}-${ci}`}
                          type="button"
                          onClick={() => pick(ci)}
                          className={btnCls}
                          aria-pressed={isSelected}
                        >
                          <span className="mr-3 shrink-0 flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-[11px] font-bold text-indigo-700 tabular-nums">
                            {String.fromCharCode(65 + ci)}
                          </span>
                          <span className="leading-snug">{label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {!hasPickForCurrent ? (
                    <span className="sr-only">
                      Sélection une réponse, puis passe à la suivante. Les corrections s’affichent à la fin.
                    </span>
                  ) : null}
                </div>

                {hasPickForCurrent ? (
                  <>
                    <button
                      type="button"
                      onClick={gotoNextOrFinish}
                      className="mt-5 hidden min-h-12 w-full items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-500 active:bg-indigo-600 sm:inline-flex sm:w-auto"
                    >
                      {nextLabel}
                    </button>

                    <button
                      type="button"
                      onClick={gotoNextOrFinish}
                      className="fixed inset-x-4 bottom-[max(env(safe-area-inset-bottom,12px),12px)] z-40 inline-flex min-h-[3.25rem] items-center justify-center rounded-2xl bg-indigo-600 px-6 text-[15px] font-semibold text-white shadow-xl shadow-indigo-900/30 transition hover:bg-indigo-500 active:bg-indigo-600 max-sm:flex sm:hidden"
                    >
                      {nextLabel}
                    </button>
                  </>
                ) : null}
              </div>
            </>
          ) : null}

          {phase === "finished" && score ? (
            <div className="text-center sm:text-left">
              <div
                className="rounded-2xl border border-indigo-100 bg-gradient-to-b from-indigo-50/40 to-white px-4 py-5 text-center shadow-inner shadow-slate-200/50 sm:px-5 sm:py-6 sm:text-left"
                role="status"
                aria-live="polite"
              >
                <p className="font-[family-name:var(--font-geist-sans)] text-4xl font-bold tracking-tight text-indigo-800 tabular-nums sm:text-5xl">
                  {score.sur20}
                  <span className="text-2xl font-semibold text-indigo-500/90"> / 20</span>
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  <span className="font-medium tabular-nums text-slate-800">
                    {score.ok}/{score.total}
                  </span>{" "}
                  bonnes · {score.percent} %
                </p>
              </div>

              <div className="mt-8 border-t border-slate-100 pt-6">
                <h3 className="font-[family-name:var(--font-geist-sans)] text-[15px] font-semibold text-slate-900">
                  Corrections détaillées
                </h3>
                <ul className="mt-4 space-y-4">
                  {sessionDeck.map((item, qi) => {
                    const sel = pickedById[item.id];
                    const userIdx = typeof sel === "number" ? sel : null;
                    const correct = userIdx !== null && userIdx === item.correctIndex;
                    const explain =
                      item.explain?.trim() ||
                      `Réponse attendue : « ${item.choices[item.correctIndex]} ».`;

                    return (
                      <li
                        key={item.id}
                        className={`rounded-xl border px-3 py-3.5 text-left text-sm leading-relaxed sm:px-4 ${
                          userIdx === null
                            ? "border-slate-200 bg-slate-50"
                            : correct
                              ? "border-emerald-200/90 bg-emerald-50/50"
                              : "border-amber-200/90 bg-amber-50/40"
                        }`}
                      >
                        <p className="font-medium text-slate-900">
                          <span className="tabular-nums text-slate-500">Q{qi + 1}.</span> {item.q}
                        </p>
                        <div className="mt-2 space-y-1 text-slate-700">
                          {userIdx !== null ? (
                            <p>
                              <span className="text-slate-500">Ta réponse :</span>{" "}
                              <span className="font-medium text-slate-800">
                                {String.fromCharCode(65 + userIdx)}) {item.choices[userIdx]}
                              </span>
                            </p>
                          ) : (
                            <p className="text-slate-500">Pas de réponse enregistrée.</p>
                          )}
                          <p>
                            <span className="text-slate-500">Bonne réponse :</span>{" "}
                            <span className="font-medium text-emerald-900">
                              {String.fromCharCode(65 + item.correctIndex)}){" "}
                              {item.choices[item.correctIndex]}
                            </span>
                          </p>
                        </div>
                        <p className="mt-2 text-[13px] leading-relaxed text-slate-600">{explain}</p>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <button
                type="button"
                onClick={restart}
                className="mt-6 inline-flex min-h-[2.75rem] w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-[15px] font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 sm:w-auto sm:py-2.5 sm:text-sm"
              >
                Recommencer
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
