"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { splitFichePages } from "../lib/splitFichePages";
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

export default function PagedMarkdownFiche({ markdown }) {
  const pages = splitFichePages(markdown);
  const [index, setIndex] = useState(0);

  const last = pages.length - 1;
  const goPrev = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1));
  }, []);
  const goNext = useCallback(() => {
    setIndex((i) => Math.min(last, i + 1));
  }, [last]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [index]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPrev, goNext]);

  return (
    <div className="space-y-4">
      <div className="relative min-h-[12rem]">
        {pages.map((chunk, i) => (
          <div
            key={i}
            className={
              i === index ? "block" : "hidden print:block print:break-inside-avoid"
            }
          >
            <FicheMarkdownSection
              markdown={chunk}
              className={i < last ? "print:break-after-page" : ""}
            />
          </div>
        ))}
      </div>

      {pages.length > 1 ? (
        <div className="print:hidden">
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-indigo-100/80 bg-indigo-50/40 px-4 py-4 sm:flex-row sm:justify-center sm:gap-6">
            <button
              type="button"
              onClick={goPrev}
              disabled={index <= 0}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto"
              aria-label="Page précédente"
            >
              <ChevronLeftIcon className="shrink-0 opacity-80" />
              Précédent
            </button>

            <p className="order-first text-center text-sm font-medium text-indigo-900/80 sm:order-none">
              Page <span className="tabular-nums">{index + 1}</span> /{" "}
              <span className="tabular-nums">{pages.length}</span>
            </p>

            <button
              type="button"
              onClick={goNext}
              disabled={index >= last}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none sm:w-auto"
              aria-label="Page suivante — tourner la page"
            >
              Tourner la page
              <PageTurnIcon className="shrink-0 opacity-95" />
              <ChevronRightIcon className="shrink-0 opacity-90" />
            </button>

            <Link
              href="/reviser"
              className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:bg-white hover:text-indigo-800 sm:w-auto"
            >
              Nouvelle fiche
            </Link>
          </div>
          <p className="mt-2 text-center text-[11px] text-slate-500">
            Flèches gauche / droite du clavier
          </p>
        </div>
      ) : pages.length === 1 ? (
        <div className="print:hidden">
          <div className="flex justify-center rounded-2xl border border-indigo-100/80 bg-indigo-50/40 px-4 py-4">
            <Link
              href="/reviser"
              className="inline-flex w-full max-w-sm items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:text-indigo-800 sm:w-auto"
            >
              Nouvelle fiche
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
