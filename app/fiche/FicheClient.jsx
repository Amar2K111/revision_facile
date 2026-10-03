"use client";

import Link from "next/link";
import { startTransition, useEffect, useState } from "react";
import AuthUserAvatar from "../../components/AuthUserAvatar";
import PagedMarkdownFiche from "../../components/PagedMarkdownFiche";
import PracticeQuiz from "../../components/PracticeQuiz";
import { SiteLogo } from "../../components/SiteLogo";
import { SHEET_MARKDOWN_VERSION, SHEET_STORAGE_KEY } from "../../lib/revisionSheet";

export default function FicheClient() {
  const [payload, setPayload] = useState(undefined);

  useEffect(() => {
    startTransition(() => {
      try {
        const raw = sessionStorage.getItem(SHEET_STORAGE_KEY);
        if (!raw) {
          setPayload(null);
          return;
        }
        const data = JSON.parse(raw);
        if (
          data?.version === SHEET_MARKDOWN_VERSION &&
          typeof data.markdown === "string" &&
          data.markdown.length > 0
        ) {
          setPayload(data);
          return;
        }
        setPayload(null);
      } catch {
        setPayload(null);
      }
    });
  }, []);

  if (payload === undefined) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-gradient-to-b from-indigo-50/80 via-slate-50 to-slate-50 text-slate-500">
        Chargement…
      </div>
    );
  }

  if (!payload) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-gradient-to-b from-indigo-50/80 via-slate-50 to-slate-50 px-4 py-16 text-center">
        <p className="max-w-md text-slate-700">
          Aucune fiche à afficher. Retourne à l’accueil, choisis une matière et un sujet, puis génère une
          fiche.
        </p>
        <Link
          href="/reviser"
          className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          Générer une fiche
        </Link>
      </div>
    );
  }

  const { markdown, meta, practiceQuiz } = payload;

  const quizCount =
    Array.isArray(practiceQuiz)
      ? practiceQuiz.filter((x) => x && typeof x.q === "string").length
      : 0;
  const hasQuiz = quizCount > 0;

  return (
    <div className="min-h-dvh bg-gradient-to-b from-indigo-50/80 via-slate-50 to-slate-50 pt-safe pb-safe">
      <div className={`mx-auto max-w-3xl px-4 py-5 sm:px-6 sm:py-10 lg:px-8 ${hasQuiz ? "pb-28 sm:pb-10" : ""}`}>
        <header className="print:hidden">
          <div className="flex items-center justify-between gap-3 sm:grid sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center sm:gap-6">
            <Link
              href="/reviser"
              className="inline-flex min-h-11 min-w-0 items-center gap-1.5 text-sm font-semibold text-indigo-700 transition hover:text-indigo-600 active:text-indigo-800 sm:justify-self-start"
            >
              <span aria-hidden className="shrink-0 text-base leading-none">
                ←
              </span>
              <span className="truncate sm:hidden">Retour</span>
              <span className="hidden truncate sm:inline">Nouvelle fiche</span>
            </Link>

            <div className="hidden justify-center sm:flex sm:justify-self-center">
              <SiteLogo variant="domain" size="sm" href="/reviser" />
            </div>

            <div className="flex shrink-0 items-center justify-end gap-2 sm:justify-self-end sm:gap-2.5">
              <AuthUserAvatar />
              <button
                type="button"
                onClick={() => window.print()}
                aria-label="Imprimer la fiche"
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 active:bg-slate-100 sm:w-auto sm:gap-2 sm:px-4"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  className="h-5 w-5 shrink-0"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 9V4.5A1.5 1.5 0 017.5 3h9A1.5 1.5 0 0118 4.5V9M6 18H4.5A1.5 1.5 0 013 16.5v-6A1.5 1.5 0 014.5 9H19.5A1.5 1.5 0 0121 10.5v6a1.5 1.5 0 01-1.5 1.5H18M6 14h12v4.5A1.5 1.5 0 0019.5 20h-9A1.5 1.5 0 019 18.5V14z"
                  />
                </svg>
                <span className="hidden text-sm font-semibold sm:inline">Imprimer</span>
              </button>
            </div>
          </div>

          <div className="mt-3 flex justify-center border-t border-slate-200/60 pt-4 sm:hidden">
            <SiteLogo
              variant="domain"
              size="sm"
              href="/reviser"
              labelClassName="text-xs tracking-tight"
            />
          </div>
        </header>

        <div
          className={`rounded-2xl border border-slate-100 bg-white shadow-sm print:border-0 print:bg-transparent print:shadow-none ${hasQuiz ? "mt-5 sm:mt-7" : "mt-5 sm:mt-8"}`}
        >
          <div className="p-4 sm:p-6 print:border-0 print:bg-transparent print:p-0">
            {meta ? (
              <p className="mb-4 text-center text-sm text-slate-600 print:text-slate-500">
                <span className="block font-medium text-slate-800 sm:inline">{meta.topicLabel}</span>
                <span className="hidden sm:inline"> · </span>
                <span className="mt-0.5 block text-xs text-slate-500 sm:mt-0 sm:inline sm:text-sm sm:text-slate-600">
                  {meta.subjectName} — {meta.classLabel}
                </span>
              </p>
            ) : null}

            <PagedMarkdownFiche key={markdown} markdown={markdown} />

            <footer className="mt-8 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-[11px] text-slate-500 print:mt-6 print:text-slate-400">
              <span>Fiche générée avec</span>
              <SiteLogo variant="domain" size="xs" linked={false} />
              <span>— usage personnel pour réviser.</span>
            </footer>
          </div>

          {hasQuiz ? (
            <div className="border-t border-slate-100 px-4 pb-5 pt-6 print:hidden sm:px-6 sm:pb-6">
              <PracticeQuiz practiceQuiz={practiceQuiz} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
