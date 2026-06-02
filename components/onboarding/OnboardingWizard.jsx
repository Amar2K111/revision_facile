"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { sanitizeNextPath } from "../../lib/authRedirects";
import {
  daysUntilExam,
  examLabelFromClassId,
  getSpecializationGroups,
  getVisibleOnboardingSteps,
  getWeakSubjectOptions,
  isSpecializationStepComplete,
  isWeakSubjectsStepComplete,
  labelForAnswer,
  ONBOARDING_DRAFT_STORAGE_KEY,
} from "../../data/onboardingQuestions";
import {
  OnboardingChoiceButtons,
  OnboardingGroupedChoiceButtons,
  OnboardingMultiChoiceButtons,
} from "./OnboardingChoiceButtons";

const inputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-base text-neutral-950 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600 min-h-[44px]";

/**
 * @param {import("../../data/onboardingQuestions").OnboardingStep | undefined} step
 * @param {Record<string, unknown>} answers
 */
function isStepComplete(step, answers) {
  if (!step) return false;
  if (step.type === "recap") return true;
  if (step.optional) return true;

  const v = answers[step.id];

  if (step.id === "specializationId") {
    return isSpecializationStepComplete(answers);
  }
  if (step.id === "weakSubjects") {
    return isWeakSubjectsStepComplete(answers);
  }
  if (step.type === "text") {
    if (step.id === "successMeaning") {
      return typeof v === "string" && v.trim().length >= 3;
    }
    return true;
  }
  if (step.type === "date") {
    return typeof v === "string" && v.length > 0;
  }
  if (step.type === "multi") {
    return Array.isArray(v) && v.length > 0;
  }
  if (step.type === "single") {
    return typeof v === "string" && v.length > 0;
  }
  return false;
}

/**
 * @param {import("../../data/onboardingQuestions").OnboardingStep | undefined} step
 */
function stepValidationMessage(step) {
  if (!step) return "Réponds à la question pour continuer.";
  if (step.id === "specializationId") {
    return "Sélectionne ta filière ou ta spécialité pour continuer.";
  }
  if (step.id === "weakSubjects") {
    return "Choisis au moins une matière.";
  }
  return "Réponds à la question pour continuer.";
}

/**
 * @param {Record<string, unknown>} initial
 */
function loadDraft(initial) {
  if (typeof window === "undefined") return initial;
  try {
    const raw = sessionStorage.getItem(ONBOARDING_DRAFT_STORAGE_KEY);
    if (!raw) return initial;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      return { ...initial, ...parsed };
    }
  } catch {
    /* ignore */
  }
  return initial;
}

export default function OnboardingWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextAfter = sanitizeNextPath(searchParams.get("next") ?? "");

  const [answers, setAnswers] = useState(() => loadDraft({}));
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const visibleSteps = useMemo(() => getVisibleOnboardingSteps(answers), [answers]);
  const step = visibleSteps[stepIndex];
  const progress = visibleSteps.length > 0 ? ((stepIndex + 1) / visibleSteps.length) * 100 : 0;

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.setItem(ONBOARDING_DRAFT_STORAGE_KEY, JSON.stringify(answers));
    } catch {
      /* ignore */
    }
  }, [answers]);

  useEffect(() => {
    if (stepIndex >= visibleSteps.length && visibleSteps.length > 0) {
      setStepIndex(visibleSteps.length - 1);
    }
  }, [visibleSteps.length, stepIndex]);

  const setAnswer = useCallback((id, value) => {
    setAnswers((prev) => {
      const next = { ...prev, [id]: value };
      if (id === "classId") {
        delete next.specializationId;
        delete next.weakSubjects;
      }
      if (id === "specializationId") {
        delete next.weakSubjects;
      }
      return next;
    });
    setError(null);
  }, []);

  const canContinue = useMemo(() => isStepComplete(step, answers), [step, answers]);

  const goNext = useCallback(() => {
    if (!canContinue) {
      setError(stepValidationMessage(step));
      return;
    }
    if (step?.type === "recap") {
      return;
    }
    setError(null);
    setStepIndex((i) => Math.min(i + 1, visibleSteps.length - 1));
  }, [canContinue, step, visibleSteps.length]);

  const goBack = useCallback(() => {
    setError(null);
    setStepIndex((i) => Math.max(0, i - 1));
  }, []);

  const finish = useCallback(async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, next: nextAfter }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Enregistrement impossible. Réessaie dans un instant.");
        setSubmitting(false);
        return;
      }
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(ONBOARDING_DRAFT_STORAGE_KEY);
      }
      router.refresh();
      router.replace(typeof data.redirect === "string" ? data.redirect : nextAfter);
    } catch {
      setError("Connexion interrompue. Vérifie ton réseau.");
      setSubmitting(false);
    }
  }, [answers, nextAfter, router]);

  if (!step) {
    return null;
  }

  const specGroups = getSpecializationGroups(answers);
  const weakOptions = getWeakSubjectOptions(answers);
  const classId = typeof answers.classId === "string" ? answers.classId : "";
  const specializationId =
    typeof answers.specializationId === "string" ? answers.specializationId : "";
  const weakSubjectsSelected = Array.isArray(answers.weakSubjects) ? answers.weakSubjects : [];
  const examName = examLabelFromClassId(classId);
  const days = daysUntilExam(answers);
  const firstName =
    typeof answers.firstName === "string" && answers.firstName.trim()
      ? answers.firstName.trim()
      : null;
  const weakLabels = weakSubjectsSelected.map((id) =>
    labelForAnswer(answers, "weakSubjects", String(id)),
  );

  return (
    <div className="w-full max-w-lg">
      <div className="mb-6">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
        <p className="mt-2 text-center text-xs text-slate-500">
          Étape {stepIndex + 1} sur {visibleSteps.length}
        </p>
      </div>

      <div className="rounded-[2rem] border border-gray-200 bg-white p-5 shadow-lg sm:p-8">
        <h1 className="font-[family-name:var(--font-geist-sans)] text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
          {step.title}
        </h1>
        {step.subtitle ? (
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.subtitle}</p>
        ) : null}

        <div className="mt-6 space-y-3">
          {step.type === "text" && (
            <textarea
              rows={step.id === "successMeaning" ? 4 : 1}
              className={inputClass}
              placeholder={
                step.id === "successMeaning"
                  ? "Ex. : entrer dans la filière que je veux, rendre fière ma famille…"
                  : "Ton prénom"
              }
              value={typeof answers[step.id] === "string" ? answers[step.id] : ""}
              onChange={(e) => setAnswer(step.id, e.target.value)}
            />
          )}

          {step.type === "date" && (
            <input
              type="date"
              className={inputClass}
              value={typeof answers.examDate === "string" ? answers.examDate : ""}
              onChange={(e) => setAnswer("examDate", e.target.value)}
            />
          )}

          {step.type === "single" && step.id === "specializationId" && (
            <OnboardingGroupedChoiceButtons
              groups={specGroups}
              selected={specializationId}
              onSelect={(value) => setAnswer("specializationId", value)}
            />
          )}

          {step.type === "single" && step.id !== "specializationId" && step.options && (
            <OnboardingChoiceButtons
              options={step.options}
              selected={typeof answers[step.id] === "string" ? answers[step.id] : ""}
              onSelect={(value) => setAnswer(step.id, value)}
            />
          )}

          {step.type === "multi" && step.id === "weakSubjects" && (
            <>
              {weakOptions.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Choisis d’abord ton niveau et ta filière aux étapes précédentes.
                </p>
              ) : (
                <OnboardingMultiChoiceButtons
                  options={weakOptions}
                  selected={weakSubjectsSelected}
                  onChange={(values) => setAnswer("weakSubjects", values)}
                />
              )}
            </>
          )}

          {step.type === "multi" && step.id !== "weakSubjects" && step.options && (
            <OnboardingMultiChoiceButtons
              options={step.options}
              selected={Array.isArray(answers[step.id]) ? answers[step.id] : []}
              onChange={(values) => setAnswer(step.id, values)}
            />
          )}

          {step.type === "recap" && (
            <div className="space-y-4 rounded-xl border border-indigo-100 bg-indigo-50/40 p-4 text-sm text-slate-800">
              {firstName ? (
                <p className="text-base font-semibold text-slate-900">
                  {firstName}, voici où tu en es :
                </p>
              ) : (
                <p className="text-base font-semibold text-slate-900">Voici où tu en es :</p>
              )}
              <ul className="space-y-2 leading-relaxed">
                <li>
                  <span className="font-medium">Examen :</span>{" "}
                  {labelForAnswer(answers, "classId", classId) || "—"}
                </li>
                {specializationId ? (
                  <li>
                    <span className="font-medium">Filière :</span>{" "}
                    {labelForAnswer(answers, "specializationId", specializationId)}
                  </li>
                ) : null}
                {days != null && days >= 0 ? (
                  <li>
                    <span className="font-medium">Jours restants :</span>{" "}
                    <span className="text-indigo-700">{days} jour{days > 1 ? "s" : ""}</span> avant
                    le {examName}
                  </li>
                ) : null}
                {weakLabels.length > 0 ? (
                  <li>
                    <span className="font-medium">Priorités :</span> {weakLabels.join(", ")}
                  </li>
                ) : null}
                {typeof answers.successMeaning === "string" && answers.successMeaning.trim() ? (
                  <li className="border-t border-indigo-100/80 pt-3 italic text-slate-700">
                    « {answers.successMeaning.trim()} »
                  </li>
                ) : null}
              </ul>
              <p className="text-xs text-slate-600">
                Tes réponses sont enregistrées pour t’accompagner — la suite, c’est générer tes
                fiches sur le programme.
              </p>
            </div>
          )}
        </div>

        {error ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
          {stepIndex > 0 ? (
            <button
              type="button"
              onClick={goBack}
              disabled={submitting}
              className="order-2 rounded-[10px] border border-slate-200 px-6 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:order-1"
            >
              Retour
            </button>
          ) : (
            <span className="hidden sm:block sm:flex-1" />
          )}

          {step.type === "recap" ? (
            <button
              type="button"
              onClick={finish}
              disabled={submitting}
              className="order-1 rounded-[10px] bg-gradient-to-br from-indigo-600 to-blue-700 px-8 py-3.5 text-base font-medium text-white shadow-lg transition hover:shadow-xl disabled:opacity-60 sm:order-2 sm:ml-auto"
            >
              {submitting ? "Enregistrement…" : "C’est parti"}
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              className="order-1 rounded-[10px] bg-gradient-to-br from-indigo-600 to-blue-700 px-8 py-3.5 text-base font-medium text-white shadow-lg transition hover:shadow-xl sm:order-2 sm:ml-auto"
            >
              Continuer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
