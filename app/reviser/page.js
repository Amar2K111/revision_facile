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
import { RevisionTipCard } from "../../components/RevisionTipCard";
import { SelectField } from "../../components/SelectField";
import { SiteLogo } from "../../components/SiteLogo";
import { REVISION_TIPS } from "../../data/revisionTips";

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
      return false;
    }
    setLoggedIn(true);
    const { data } = await supabase.from("profiles").select("is_premium, premium_until").eq("id", user.id).maybeSingle();
    const active = profileHasActivePremium(data);
    setIsPremium(active);
    return active;
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
      // Secours si le webhook Stripe est en retard ou a échoué (ex. secret régénéré).
      try {
        await fetch("/api/stripe/sync-premium", { method: "POST" });
      } catch {
        /* ignore */
      }
      for (let attempt = 0; attempt < 12 && !cancelled; attempt += 1) {
        const active = await loadPremium();
        if (active) {
          break;
        }
        await new Promise((resolve) => {
          setTimeout(resolve, 500);
        });
      }
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
      try {
        await fetch("/api/stripe/sync-premium", { method: "POST" });
        const active = await loadPremium();
        if (!active) {
          router.push("/paywall");
          return;
        }
      } catch {
        router.push("/paywall");
        return;
      }
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
        const apiError = typeof data.error === "string" ? data.error.trim() : "";
        const httpFallback = `Echec de la generation (HTTP ${res.status}).`;
        throw new Error(
          apiError || httpFallback,
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
    <div className="min-h-dvh bg-gradient-to-b from-indigo-50/80 via-slate-50 to-slate-50 pt-safe pb-safe md:flex md:flex-col md:justify-center">
      <div className="mx-auto flex w-full max-w-xl flex-col px-4 py-6 sm:px-6 md:max-w-lg md:py-4 lg:px-8">
        <header className="print:hidden">
          <div className="relative mb-4 md:mb-5">
            {loggedIn === false ? (
              <div className="absolute left-0 top-0 z-10">
                <Link
                  href="/"
                  aria-label="Retour à l’accueil"
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-xl font-semibold leading-none text-indigo-700 transition hover:bg-indigo-50 hover:text-indigo-600 active:bg-indigo-100"
                >
                  <span aria-hidden>←</span>
                </Link>
              </div>
            ) : null}
            <div className="absolute right-0 top-0 z-10">
              <AuthUserAvatar />
            </div>
            <div className="flex flex-col items-center px-12 text-center">
              <h1 className="m-0 flex justify-center">
                <SiteLogo
                  variant="domain"
                  size="sm"
                  href="/reviser"
                  labelClassName="font-[family-name:var(--font-geist-sans)] text-base font-semibold leading-snug tracking-tight sm:text-lg md:text-xl"
                />
              </h1>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-indigo-600/90 md:mt-1.5 md:text-[11px]">
                Fiche de révision + quiz
              </p>
            </div>
          </div>

          <div className="space-y-3.5 rounded-2xl border border-white/60 bg-white/70 p-4 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.35)] backdrop-blur-md md:space-y-3 md:p-5">
            <SelectField
              id="class"
              label="Classe"
              compact
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
                compact
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
                compact
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
              compact
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
              compact
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
              <div className="space-y-2 pt-0.5 md:pt-1">
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={!canGenerate || loading || isPremium === null}
                  aria-busy={loading}
                  className={`inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-xl px-5 text-sm font-semibold text-white shadow-lg transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 motion-safe:transition-colors active:scale-[0.99] md:min-h-11 ${
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
                    <RevisionTipCard
                      className="mt-4 text-center"
                      title={REVISION_TIPS[loadingTipIndex]?.title}
                      aria-live="polite"
                    >
                      {REVISION_TIPS[loadingTipIndex]?.text}
                    </RevisionTipCard>
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
