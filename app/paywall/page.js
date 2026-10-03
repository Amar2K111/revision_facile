"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_PREMIUM_TRIAL_DAYS,
  DEFAULT_PREMIUM_YEARLY_EUR,
  formatEurLabel,
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
const TRIAL_DAYS = parseEnvInt(process.env.NEXT_PUBLIC_PREMIUM_TRIAL_DAYS, DEFAULT_PREMIUM_TRIAL_DAYS);

const YEARLY_LABEL = formatEurLabel(YEARLY_EUR);

const PAYWALL_BENEFITS = [
  "Fiches de révision illimitées",
  "Quiz interactifs sur chaque notion",
  "Programme Brevet, Bac et BTS 2027",
];

const TRUST_SIGNALS = [
  "Paiement 100 % sécurisé",
  "Annulable à tout moment",
  "Sans frais cachés",
  "Données protégées",
];

/** Échelle typographique — du plus fort au plus discret */
const type = {
  eyebrow:
    "text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-600/80",
  title:
    "font-[family-name:var(--font-geist-sans)] text-[1.5rem] font-semibold leading-[1.15] tracking-tight text-slate-900 sm:text-[1.625rem]",
  lead: "text-[15px] leading-[1.5] text-slate-600",
  section: "text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400",
  body: "text-[14px] leading-[1.45] text-slate-700",
  cta: "text-[15px] font-semibold leading-none",
  price: "text-[13px] leading-normal text-slate-500",
  priceValue: "font-semibold text-slate-800",
  reassurance: "text-[13px] leading-normal text-slate-600",
  trust: "text-[12px] leading-[1.35] text-slate-500",
  legal: "text-[11px] leading-[1.45] text-slate-400",
};

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

function SectionLabel({ id, children }) {
  return (
    <p id={id} className={type.section}>
      {children}
    </p>
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

  useEffect(() => {
    const html = document.documentElement;
    const { body } = document;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-10 overflow-hidden bg-gradient-to-b from-indigo-50/80 via-slate-50 to-slate-50">
      <Link
        href="/reviser"
        className="absolute left-3 z-20 inline-flex min-h-10 items-center rounded-lg px-3 text-[14px] font-medium text-slate-600 transition hover:bg-white/80 hover:text-slate-900 active:bg-white sm:left-4"
        style={{ top: "max(0.75rem, env(safe-area-inset-top, 0px))" }}
      >
        ← Retour
      </Link>

      <main className="mx-auto flex h-full w-full max-w-md flex-col justify-center px-4 pb-[max(env(safe-area-inset-bottom,0px),0.75rem)] pt-14 sm:max-w-[22rem] sm:px-6">
        <article className="shrink-0 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-lg shadow-slate-900/10">
          <div className="h-1 w-full bg-gradient-to-r from-indigo-500 to-violet-600" aria-hidden />

          <div className="px-5 py-5 sm:px-6 sm:py-6">
            {/* Niveau 1 — Promesse */}
            <header className="text-center">
              <p className={type.eyebrow}>Premium</p>
              <h1 className={`mt-2 ${type.title}`}>Révise sans limite</h1>
              <p className={`mx-auto mt-2.5 max-w-[17rem] ${type.lead}`}>
                Fiches + quiz sur chaque notion de ton programme.
              </p>
            </header>

            {/* Niveau 2 — Bénéfices */}
            <section className="mt-6" aria-labelledby="paywall-benefits">
              <SectionLabel id="paywall-benefits">Inclus</SectionLabel>
              <ul className="mt-3 space-y-2.5">
                {PAYWALL_BENEFITS.map((label) => (
                  <li key={label} className="flex items-start gap-2.5">
                    <CheckIcon className="mt-[3px] size-[15px] shrink-0 text-indigo-600" />
                    <span className={type.body}>{label}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Niveau 3 — Action */}
            <section
              className="mt-6 rounded-xl bg-slate-50/90 px-4 py-4 ring-1 ring-slate-100/90"
              aria-labelledby="paywall-cta"
            >
              <SectionLabel id="paywall-cta">Commencer</SectionLabel>

              <button
                type="button"
                onClick={() => void startCheckout("yearly")}
                disabled={loadingPlan !== null}
                className={`mt-3 flex min-h-[3rem] w-full items-center justify-center rounded-xl bg-indigo-600 px-4 text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-500 active:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-65 ${type.cta}`}
              >
                {yearlyBusy
                  ? "Redirection…"
                  : TRIAL_DAYS > 0
                    ? `Essayer gratuitement pendant ${TRIAL_DAYS} jours`
                    : "S’abonner à l’annuel"}
              </button>

              <p className={`mt-3 text-center ${type.price}`}>
                Puis <span className={type.priceValue}>{YEARLY_LABEL}/an</span>
              </p>

              {TRIAL_DAYS > 0 ? (
                <p className={`mt-2 flex items-center justify-center gap-1.5 ${type.reassurance}`}>
                  <CheckIcon className="size-[14px] shrink-0 text-emerald-600" />
                  <span>Annulable avant la fin de l’essai</span>
                </p>
              ) : null}
            </section>

            {error ? (
              <p
                className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-center text-[13px] text-red-800"
                role="alert"
              >
                {error}
              </p>
            ) : null}

            {/* Niveau 4 — Réassurance (le plus discret) */}
            <footer className="mt-5 border-t border-slate-100 pt-4">
              <ul className="grid grid-cols-2 gap-x-3 gap-y-2" aria-label="Garanties">
                {TRUST_SIGNALS.map((label) => (
                  <li key={label} className={`flex items-center gap-1.5 ${type.trust}`}>
                    <CheckIcon className="size-[12px] shrink-0 text-emerald-600/85" />
                    <span>{label}</span>
                  </li>
                ))}
              </ul>
              <p className={`mt-3 text-center ${type.legal}`}>
                Paiement chiffré via Stripe · CB, Apple Pay, Google Pay
              </p>
            </footer>
          </div>
        </article>
      </main>
    </div>
  );
}
