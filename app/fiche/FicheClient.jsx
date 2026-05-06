"use client";

import Link from "next/link";
import { startTransition, useEffect, useState } from "react";
import AuthUserAvatar from "../../components/AuthUserAvatar";
import PagedMarkdownFiche from "../../components/PagedMarkdownFiche";
import PracticeQuiz from "../../components/PracticeQuiz";
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
          href="/"
          className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          Retour à l’accueil
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
    <div className="min-h-dvh bg-gradient-to-b from-indigo-50/80 via-slate-50 to-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Link
            href="/reviser"
            className="text-sm font-semibold text-indigo-700 hover:text-indigo-600"
          >
            ← Nouvelle fiche
          </Link>
          <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
            <AuthUserAvatar />
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50"
            >
              Imprimer
            </button>
          </div>
        </div>

        <div
          className={`rounded-2xl border border-slate-100 bg-white shadow-sm print:border-0 print:bg-transparent print:shadow-none ${hasQuiz ? "mt-6 sm:mt-7" : "mt-6 sm:mt-8"}`}
        >
          <div className="p-4 sm:p-6 print:border-0 print:bg-transparent print:p-0">
            {meta ? (
              <p className="mb-4 text-center text-sm text-slate-600 print:text-slate-500">
                <span className="font-medium text-slate-800">{meta.topicLabel}</span>
                {" · "}
                {meta.subjectName} — {meta.classLabel}
              </p>
            ) : null}

            <PagedMarkdownFiche key={markdown} markdown={markdown} />

            <footer className="mt-8 text-center text-[11px] text-slate-500 print:mt-6 print:text-slate-400">
              Fiche générée avec Révision facile — usage personnel pour réviser.
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
