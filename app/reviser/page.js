"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BTS_SPECIALIZATION_GROUPS,
  CLASSES,
  getSubjectsForClass,
  TERMINALE_SPECIALIZATION_GROUPS,
} from "../../data/curriculum";
import { profileHasActivePremium } from "../../lib/profilePremium";
import {
  SHEET_MARKDOWN_VERSION,
  SHEET_STORAGE_KEY,
} from "../../lib/revisionSheet";
import { createSupabaseBrowserClient } from "../../lib/supabase/client";
import AuthUserAvatar from "../../components/AuthUserAvatar";
import { SelectField } from "../../components/SelectField";

const REVISION_TIPS = [
  "Répétition espacée : revois la même notion à J+1, J+3 et J+7 pour mieux l’ancrer.",
  "Rappel actif : cache ta fiche et reformule à l’oral ou à l’écrit avant de relire.",
  "Méthode Feynman : explique le sujet simplement, comme à quelqu’un qui découvre.",
  "Alterne lecture courte, questions-réponses et réécriture — plusieurs chemins mémorisent mieux.",
  "Repère tes erreurs récurrentes et cible-les : c’est souvent là que le gain est le plus rapide.",
  "Cartes / flashcards : teste-toi sur les définitions et formules, pas seulement en les relisant.",
  "Carte mentale : relie les idées entre elles — les liens aident à retrouver le détail.",
  "Bloc Pomodoro (ex. 25 min + petite pause) : garde une intensité soutenable sur la durée.",
  "Dors assez : la consolidation se fait aussi la nuit ; évite le tout-nuit avant un contrôle.",
  "Croissance vs perf : vise la compréhension et la progression, pas la perfection immédiate.",
  "Transforme ton cours en questions avant d’ouvrir les réponses — comme un petit examen blanc.",
  "Synthèse express : résume une page en 5 lignes pour vérifier ce que tu as vraiment retenu.",
  "Lire à voix haute engage une autre voie de mémoire — utile pour les listes et définitions.",
  "Créneau fixe : mieux vaut 20 minutes chaque jour qu’une longue bafouille improvisée.",
  "Hydrate-toi et aère : l’attention baisse vite quand tu es fatigué ou déshydraté.",
];

export default function ReviserPage() {
  const router = useRouter();
  const [classId, setClassId] = useState("3e");
  const [specializationId, setSpecializationId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [topicIndex, setTopicIndex] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingTipIndex, setLoadingTipIndex] = useState(0);
  /** null = chargement du profil */
  const [isPremium, setIsPremium] = useState(null);
  /** null = session pas encore résolue */
  const [loggedIn, setLoggedIn] = useState(null);

  const loadPremium = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoggedIn(false);
      setIsPremium(false);
      return;
    }
    setLoggedIn(true);
    const { data } = await supabase.from("profiles").select("is_premium, premium_until").eq("id", user.id).maybeSingle();
    setIsPremium(profileHasActivePremium(data));
  }, []);

  useEffect(() => {
    void loadPremium();
  }, [loadPremium]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") !== "success") {
      return undefined;
    }
    let cancelled = false;
    void (async () => {
      await loadPremium();
      if (!cancelled) {
        window.history.replaceState({}, "", "/reviser");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadPremium]);

  useEffect(() => {
    if (!loading) {
      return undefined;
    }
    const pickRandomLater = window.setTimeout(() => {
      setLoadingTipIndex(Math.floor(Math.random() * REVISION_TIPS.length));
    }, 0);
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      return () => window.clearTimeout(pickRandomLater);
    }
    const intervalMs = 5200;
    const rotateId = window.setInterval(() => {
      setLoadingTipIndex((i) => (i + 1) % REVISION_TIPS.length);
    }, intervalMs);
    return () => {
      window.clearTimeout(pickRandomLater);
      window.clearInterval(rotateId);
    };
  }, [loading]);

  const classe = CLASSES.find((c) => c.id === classId);
  const subjects = useMemo(
    () => getSubjectsForClass(classId, specializationId),
    [classId, specializationId],
  );
  const subject = subjects.find((s) => s.id === subjectId);
  const topics = subject?.topics ?? [];

  const subjectFieldDisabled =
    !classe?.available ||
    ((classId === "term" || classId === "bts2") && !specializationId) ||
    ((classId === "term" || classId === "bts2") &&
      specializationId !== "" &&
      subjects.length === 0);

  const canGenerate =
    classe?.available &&
    subject &&
    topicIndex !== "" &&
    Number(topicIndex) >= 0;

  const subjectHintText = !classe?.available
    ? "Choisis d’abord un niveau disponible."
    : classId === "term"
      ? !specializationId
        ? "Choisis d’abord une spécialité."
        : subjects.length === 0
          ? "Programme à venir pour cette voie."
          : specializationId.startsWith("tech-")
            ? "Matières de ta série (terminale technologique)."
            : "Matières de ta spécialité (terminale générale)."
      : classId === "bts2"
        ? !specializationId
          ? "Choisis d’abord ton BTS."
          : subjects.length === 0
            ? "Programme à venir pour ce BTS."
            : "Matières de ton programme BTS."
        : "Toutes les matières du brevet pour la 3ème.";

  function handleClassChange(next) {
    setClassId(next);
    setSpecializationId("");
    setSubjectId("");
    setTopicIndex("");
    setError(null);
  }

  function handleSpecializationChange(next) {
    setSpecializationId(next);
    setSubjectId("");
    setTopicIndex("");
    setError(null);
  }

  function handleSubjectChange(next) {
    setSubjectId(next);
    setTopicIndex("");
    setError(null);
  }

  async function handleGenerate() {
    if (!canGenerate || !classe || !subject) {
      return;
    }
    if (isPremium === null) {
      return;
    }
    if (!isPremium) {
      router.push("/paywall");
      return;
    }
    setError(null);
    setLoading(true);
    const topicLabel = topics[Number(topicIndex)];
    try {
      const res = await fetch("/api/generate-fiche", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId,
          classLabel: classe.label,
          subjectId: subject.id,
          subjectName: subject.name,
          topicLabel,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : "Échec de la génération.",
        );
      }
      const payload = {
        version: SHEET_MARKDOWN_VERSION,
        markdown: data.markdown,
        practiceQuiz: Array.isArray(data.practiceQuiz) ? data.practiceQuiz : [],
        meta: data.meta ?? {
          classLabel: classe.label,
          subjectName: subject.name,
          topicLabel,
        },
      };
      try {
        sessionStorage.setItem(SHEET_STORAGE_KEY, JSON.stringify(payload));
      } catch {
        throw new Error("Impossible d’enregistrer la fiche (stockage navigateur).");
      }
      router.push("/fiche");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh bg-gradient-to-b from-indigo-50/80 via-slate-50 to-slate-50">
      <div className="mx-auto flex w-full max-w-xl flex-col px-5 py-12 sm:px-8 sm:py-16">
        <header>
          <div className="mb-8 print:hidden">
            <div className="-mx-5 w-[calc(100%+2.5rem)] max-w-none pl-[max(0px,env(safe-area-inset-left,0px))] pr-0 sm:-mx-8 sm:w-[calc(100%+4rem)]">
              <div className="grid min-h-[4.25rem] grid-cols-[2.5rem_minmax(0,1fr)_max-content] items-center gap-x-0 sm:min-h-[4.5rem] sm:grid-cols-[2.75rem_minmax(0,1fr)_max-content]">
                <div className="flex justify-start pl-1 sm:pl-0.5">
                  {loggedIn === false ? (
                    <Link
                      href="/"
                      aria-label="Retour à l’accueil"
                      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg font-semibold leading-none text-indigo-700 transition hover:bg-indigo-50 hover:text-indigo-600 sm:h-11 sm:w-11 sm:text-xl"
                    >
                      <span aria-hidden>←</span>
                    </Link>
                  ) : (
                    <div className="h-10 w-10 shrink-0 sm:h-11 sm:w-11" aria-hidden />
                  )}
                </div>

                <div className="pointer-events-none flex min-w-0 flex-col items-center justify-center px-1 text-center sm:px-2">
                  <h1 className="min-w-0 text-center font-[family-name:var(--font-geist-sans)] text-[0.95rem] font-semibold leading-snug tracking-tight text-slate-900 min-[400px]:whitespace-nowrap sm:text-xl md:text-2xl md:leading-tight lg:text-3xl xl:text-4xl">
                    RevisionFacile.com
                  </h1>
                  <p className="mt-2 text-center text-xs font-semibold uppercase tracking-widest text-indigo-600/90 sm:mt-2.5">
                    Fiche de revision + quiz
                  </p>
                </div>

                <div className="flex justify-end justify-self-end pr-[env(safe-area-inset-right,0px)]">
                  <AuthUserAvatar />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-2 space-y-5 rounded-2xl border border-white/60 bg-white/70 p-6 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.35)] backdrop-blur-md sm:mt-0">
            <SelectField
              id="class"
              label="Classe"
              hint={
                classe?.available
                  ? null
                  : "Ce niveau arrive bientôt."
              }
              value={classId}
              onChange={handleClassChange}
            >
              {CLASSES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                  {!c.available ? " (bientôt)" : ""}
                </option>
              ))}
            </SelectField>

            {classId === "term" ? (
              <SelectField
                id="specialization"
                label="Spécialisation"
                hint={
                  classe?.available
                    ? "Choix utilisé pour proposer les matières et sujets du bac."
                    : "Tu peux déjà indiquer ta voie ; ce niveau n’est pas encore disponible ici."
                }
                value={specializationId}
                onChange={handleSpecializationChange}
              >
                <option value="">— Choisir une spécialisation —</option>
                {TERMINALE_SPECIALIZATION_GROUPS.map((g) => (
                  <optgroup key={g.groupLabel} label={g.groupLabel}>
                    {g.options.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </SelectField>
            ) : classId === "bts2" ? (
              <SelectField
                id="bts-program"
                label="BTS"
                hint={
                  classe?.available
                    ? "Choix de ton BTS (2ᵉ année) pour afficher les matières."
                    : "Tu peux déjà indiquer ton BTS ; ce niveau n’est pas encore disponible ici."
                }
                value={specializationId}
                onChange={handleSpecializationChange}
              >
                <option value="">— Choisir un BTS —</option>
                {BTS_SPECIALIZATION_GROUPS.map((g) => (
                  <optgroup key={g.groupLabel} label={g.groupLabel}>
                    {g.options.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </SelectField>
            ) : null}

            <SelectField
              key={classId === "3e" ? classId : `${classId}-${specializationId}`}
              id="subject"
              label="Matière"
              hint={subjectHintText}
              value={subjectId}
              onChange={handleSubjectChange}
              disabled={subjectFieldDisabled}
            >
              <option value="">
                {classe?.available ? "— Choisir une matière —" : "— Indisponible —"}
              </option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </SelectField>

            <SelectField
              key={subjectId || "__none__"}
              id="topic"
              label="Sujet / notion"
              menuPlacement="above"
              hint={
                subject
                  ? `${topics.length} notion(s) dans cette matière.`
                  : "Sélectionne une matière pour afficher les sujets."
              }
              value={topicIndex}
              onChange={(v) => {
                setTopicIndex(v);
                setError(null);
              }}
              disabled={!subject}
            >
              <option value="">
                {subject ? "— Choisir un sujet —" : "— Choisis d’abord une matière —"}
              </option>
              {topics.map((t, i) => (
                <option key={t} value={String(i)}>
                  {t}
                </option>
              ))}
            </SelectField>

            {classe?.available ? (
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={!canGenerate || loading || isPremium === null}
                  aria-busy={loading}
                  className={`inline-flex w-full items-center justify-center gap-2.5 rounded-xl px-5 py-3.5 text-sm font-semibold text-white shadow-lg transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 motion-safe:transition-colors ${
                    loading
                      ? "reviser-btn-loading-motion cursor-wait bg-indigo-600 shadow-indigo-600/30"
                      : !canGenerate || isPremium === null
                        ? "cursor-not-allowed bg-slate-300 shadow-none hover:bg-slate-300"
                        : "cursor-pointer bg-indigo-600 shadow-indigo-600/25 hover:bg-indigo-500"
                  }`}
                >
                  {loading ? (
                    <>
                      <span
                        className="h-[1.125rem] w-[1.125rem] shrink-0 rounded-full border-2 border-white/35 border-t-white motion-safe:animate-spin motion-reduce:animate-none"
                        aria-hidden
                      />
                      <span>Génération en cours…</span>
                    </>
                  ) : isPremium === null ? (
                    "Vérification du compte…"
                  ) : (
                    "Générer la fiche"
                  )}
                </button>
                {loading ? (
                  <>
                    <div
                      className="mt-3 h-1 overflow-hidden rounded-full bg-indigo-100/90"
                      role="progressbar"
                      aria-valuetext="Génération de la fiche en cours"
                      aria-busy="true"
                    >
                      <div className="reviser-loading-bar-sweep h-full rounded-full bg-indigo-400/70" />
                    </div>
                    <div
                      className="mt-4 rounded-xl border border-indigo-100/80 bg-indigo-50/60 px-4 py-3 text-center shadow-inner shadow-indigo-100/40"
                      aria-live="polite"
                    >
                      <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-indigo-600/90">
                        Astuce révision
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-slate-700">
                        {REVISION_TIPS[loadingTipIndex]}
                      </p>
                    </div>
                  </>
                ) : null}
                {error ? (
                  <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-center text-sm text-red-800">
                    {error}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        </header>
      </div>
    </div>
  );
}
