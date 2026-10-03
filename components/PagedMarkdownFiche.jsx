"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { splitFichePages } from "../lib/splitFichePages";
import { FicheAstucesPage } from "./FicheAstucesPage";
import { FicheMarkdownSection } from "./MarkdownFiche";

function ChevronLeftIcon({ className }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M15 6L9 12L15 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRightIcon({ className }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 6L15 12L9 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Pages qui se tournent (icône livre + flèche). */
function PageTurnIcon({ className }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M12 9h6M12 13h4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function PagedMarkdownFiche({ markdown, hasQuiz = false }) {
  const markdownPages = useMemo(() => splitFichePages(markdown), [markdown]);
  const astucesPageIndex = markdownPages.length;
  const lastIndex = astucesPageIndex;
  const totalPages = markdownPages.length + 1;

  const [index, setIndex] = useState(0);

  const isAstucesPage = index === astucesPageIndex;

  const goPrev = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  const goNext = useCallback(() => {
    setIndex((i) => Math.min(lastIndex, i + 1));
  }, [lastIndex]);

  const scrollToQuiz = useCallback(() => {
    document.getElementById("quiz-revision-facile")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [index]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight" && !isAstucesPage) goNext();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPrev, goNext, isAstucesPage]);

  return (
    <div className="space-y-4">
      <div className="relative min-h-[12rem]">
        {markdownPages.map((chunk, i) => (
          <div
            key={i}
            className={
              i === index ? "block" : "hidden print:block print:break-inside-avoid"
            }
          >
            <FicheMarkdownSection
              markdown={chunk}
              className={i < markdownPages.length - 1 ? "print:break-after-page" : ""}
            />
          </div>
        ))}

        <div className={isAstucesPage ? "block print:hidden" : "hidden print:hidden"}>
          <FicheAstucesPage />
        </div>
      </div>

      {totalPages > 1 ? (
        <div className="print:hidden">
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-indigo-100/80 bg-indigo-50/40 px-4 py-4 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4">
            <button
              type="button"
              onClick={goPrev}
              disabled={index <= 0}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto"
              aria-label="Page précédente"
            >
              <ChevronLeftIcon className="shrink-0 opacity-80" />
              Précédent
            </button>

            <p className="order-first w-full text-center text-sm font-medium text-indigo-900/80 sm:order-none sm:w-auto">
              {isAstucesPage ? (
                <>
                  Page <span className="tabular-nums">{index + 1}</span> /{" "}
                  <span className="tabular-nums">{totalPages}</span>
                  <span className="mt-0.5 block text-xs font-semibold uppercase tracking-wide text-indigo-600/90">
                    Astuces
                  </span>
                </>
              ) : (
                <>
                  Page <span className="tabular-nums">{index + 1}</span> /{" "}
                  <span className="tabular-nums">{totalPages}</span>
                </>
              )}
            </p>

            {isAstucesPage ? (
              hasQuiz ? (
                <button
                  type="button"
                  onClick={scrollToQuiz}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-500 active:bg-indigo-600 sm:w-auto"
                >
                  Passer au quiz
                  <ChevronRightIcon className="shrink-0 opacity-90" />
                </button>
              ) : null
            ) : (
              <button
                type="button"
                onClick={goNext}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-500 active:bg-indigo-600 sm:w-auto"
                aria-label="Page suivante — tourner la page"
              >
                Tourner la page
                <PageTurnIcon className="shrink-0 opacity-95" />
                <ChevronRightIcon className="shrink-0 opacity-90" />
              </button>
            )}

            <Link
              href="/reviser"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:bg-white hover:text-indigo-800 active:bg-slate-50 sm:w-auto"
            >
              Nouvelle fiche
            </Link>
          </div>
          {!isAstucesPage ? (
            <p className="hide-on-touch mt-2 text-center text-[11px] text-slate-500">
              Flèches gauche / droite du clavier
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
