"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import {
  DEFAULT_PREMIUM_MONTHLY_EUR,
  DEFAULT_PREMIUM_TRIAL_DAYS,
  DEFAULT_PREMIUM_YEARLY_EUR,
  formatEurLabel,
  yearlyPerMonthLabel,
} from "../../lib/premiumPricing";

function parseEnvEur(raw, fallback) {
  if (raw == null || typeof raw !== "string") return fallback;
  const n = Number(raw.trim().replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function parseEnvInt(raw, fallback) {
  if (raw == null || typeof raw !== "string") return fallback;
  const n = Number(raw.trim());
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : fallback;
}

const YEARLY_EUR = parseEnvEur(process.env.NEXT_PUBLIC_PREMIUM_YEARLY_EUR, DEFAULT_PREMIUM_YEARLY_EUR);
const MONTHLY_EUR = parseEnvEur(process.env.NEXT_PUBLIC_PREMIUM_MONTHLY_EUR, DEFAULT_PREMIUM_MONTHLY_EUR);
const TRIAL_DAYS = parseEnvInt(process.env.NEXT_PUBLIC_PREMIUM_TRIAL_DAYS, DEFAULT_PREMIUM_TRIAL_DAYS);

const YEARLY_LABEL = formatEurLabel(YEARLY_EUR);
const MONTHLY_LABEL = formatEurLabel(MONTHLY_EUR);
const PER_MONTH_LABEL = yearlyPerMonthLabel(YEARLY_EUR);

const PAYWALL_BENEFITS = [
  "Fiches de révision illimitées",
  "Quiz interactifs sur chaque notion",
  "Programme Brevet, Bac et BTS 2027",
];

function CheckIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.25 2.25a.75.75 0 001.137-.089l4-5.5z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default function PaywallPage() {
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [error, setError] = useState(null);

  const startCheckout = useCallback(async (plan) => {
    setError(null);
    setLoadingPlan(plan);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(typeof data.error === "string" ? data.error : "Paiement indisponible pour le moment.");
      }
      if (typeof data.url === "string" && data.url) {
        window.location.assign(data.url);
        return;
      }
      throw new Error("Réponse Stripe invalide.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue.");
      setLoadingPlan(null);
    }
  }, []);

  const yearlyBusy = loadingPlan === "yearly";
  const monthlyBusy = loadingPlan === "monthly";

  return (
    <div className="relative min-h-dvh bg-gradient-to-b from-indigo-50/80 via-slate-50 to-slate-50">
      <Link
        href="/reviser"
        className="fixed left-3 z-20 inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200/80 backdrop-blur-sm transition hover:bg-white/90 hover:text-slate-900 active:bg-white sm:left-4"
        style={{ top: "max(0.75rem, env(safe-area-inset-top, 0px))" }}
      >
        ← Retour
      </Link>

      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-start px-4 pb-safe pt-20 sm:max-w-lg sm:justify-center sm:px-6 sm:pt-16">
        <article className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-lg shadow-slate-900/10 ring-1 ring-slate-900/[0.03]">
          <div className="h-1 w-full bg-gradient-to-r from-indigo-500 to-violet-600" aria-hidden />

          <div className="px-5 pb-6 pt-6 sm:px-6 sm:pb-7 sm:pt-7">
            <div className="text-center">
              <h1 className="font-[family-name:var(--font-geist-sans)] text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                Révision facile Premium
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                {YEARLY_LABEL}/an · {PER_MONTH_LABEL}/mois
              </p>
            </div>

            <button
              type="button"
              onClick={() => void startCheckout("yearly")}
              disabled={loadingPlan !== null}
              className="mt-6 flex min-h-[3.25rem] w-full items-center justify-center rounded-xl bg-indigo-600 px-4 text-[15px] font-semibold text-white shadow-md shadow-indigo-600/25 transition hover:bg-indigo-500 active:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-65"
            >
              {yearlyBusy
                ? "Redirection…"
                : TRIAL_DAYS > 0
                  ? `Essayer gratuitement pendant ${TRIAL_DAYS} jours`
                  : "S’abonner à l’annuel"}
            </button>

            <p className="mt-3 text-center text-xs leading-relaxed text-slate-500">
              Puis {YEARLY_LABEL}/an
            </p>
            {TRIAL_DAYS > 0 ? (
              <p className="mt-1.5 flex items-center justify-center gap-1.5 text-xs text-slate-600">
                <CheckIcon className="size-3.5 shrink-0 text-emerald-600" />
                <span>Annulable avant la fin de l’essai</span>
              </p>
            ) : null}

            <ul className="mt-6 space-y-2 border-t border-slate-100 pt-5">
              {PAYWALL_BENEFITS.map((label) => (
                <li key={label} className="flex items-start gap-2 text-sm text-slate-700">
                  <CheckIcon className="mt-0.5 size-4 shrink-0 text-indigo-600" />
                  <span>{label}</span>
                </li>
              ))}
            </ul>

            <div className="mt-5 flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2.5">
              <p className="text-xs text-slate-600">
                Mensuel · <span className="font-medium text-slate-700">{MONTHLY_LABEL}/mois</span>
              </p>
              <button
                type="button"
                onClick={() => void startCheckout("monthly")}
                disabled={loadingPlan !== null}
                className="inline-flex min-h-9 shrink-0 items-center justify-center rounded-md px-3 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-50 active:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-65"
              >
                {monthlyBusy ? "…" : "Choisir"}
              </button>
            </div>
          </div>
        </article>

        {error ? (
          <p
            className="mt-4 rounded-lg border border-red-200 bg-red-50 px-2.5 py-2 text-center text-xs text-red-800"
            role="alert"
          >
            {error}
          </p>
        ) : null}
      </main>
    </div>
  );
}
