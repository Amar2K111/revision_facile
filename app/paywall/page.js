"use client";

import Link from "next/link";
import { useCallback, useState } from "react";

const PRICE_MONTHLY_LABEL = process.env.NEXT_PUBLIC_PREMIUM_PRICE_LABEL?.trim() || "9,99 €";

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

function PremiumOfferCard({
  subtitle,
  priceLabel,
  priceHint,
  plan,
  loadingPlan,
  onCheckout,
  thirdChecklistLine,
}) {
  const busy = loadingPlan !== null;
  const thisBusy = loadingPlan === plan;

  return (
    <article className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-lg shadow-slate-900/10 ring-1 ring-slate-900/[0.03]">
      <div className="h-1 w-full shrink-0 bg-gradient-to-r from-indigo-500 to-violet-600" aria-hidden />

      <div className="flex flex-1 flex-col space-y-3.5 px-4 pb-5 pt-4 sm:px-5 sm:pb-5 sm:pt-4">
        <div className="flex justify-center">
          <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700 ring-1 ring-indigo-100">
            Premium
          </span>
        </div>

        <h2 className="text-center font-[family-name:var(--font-geist-sans)] text-lg font-semibold leading-tight tracking-tight text-slate-900">
          Révision facile · Premium
        </h2>
        <p className="text-center text-xs leading-snug text-slate-600">{subtitle}</p>

        <ul className="space-y-2 text-xs leading-snug text-slate-700">
          <li className="flex gap-2">
            <CheckIcon className="mt-px size-4 shrink-0 text-indigo-600" />
            <span>Fiches : essentiel, programme dense, astuces</span>
          </li>
          <li className="flex gap-2">
            <CheckIcon className="mt-px size-4 shrink-0 text-indigo-600" />
            <span>Quiz interactif</span>
          </li>
          <li className="flex gap-2">
            <CheckIcon className="mt-px size-4 shrink-0 text-indigo-600" />
            <span>{thirdChecklistLine}</span>
          </li>
        </ul>

        <div className="mt-auto rounded-xl border border-slate-100 bg-slate-50/90 px-3 py-3 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Abonnement mensuel
          </p>
          <p className="mt-1 font-[family-name:var(--font-geist-sans)] text-3xl font-bold tabular-nums tracking-tight text-slate-900">
            {priceLabel}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-500">{priceHint}</p>
          <button
            type="button"
            onClick={() => void onCheckout(plan)}
            disabled={busy}
            className="mt-2.5 flex w-full min-h-11 items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/25 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-65"
          >
            {thisBusy ? "Redirection…" : `S’abonner — ${priceLabel} / mois`}
          </button>
        </div>
      </div>
    </article>
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

  return (
    <div className="relative min-h-dvh bg-gradient-to-b from-indigo-50/80 via-slate-50 to-slate-50">
      <Link
        href="/reviser"
        className="fixed left-3 top-3 z-20 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200/80 backdrop-blur-sm transition hover:bg-white/90 hover:text-slate-900 sm:left-4 sm:top-4"
      >
        ← Retour
      </Link>

      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4 pb-10 pt-16 sm:max-w-lg sm:px-6">
        <div className="grid grid-cols-1 gap-4 sm:gap-5 sm:items-stretch">
          <PremiumOfferCard
            subtitle="Un seul tarif : accès Premium facturé chaque mois, résiliable quand tu veux depuis Stripe."
            priceLabel={PRICE_MONTHLY_LABEL}
            priceHint="/ mois — renouvellement automatique"
            plan="monthly"
            loadingPlan={loadingPlan}
            onCheckout={startCheckout}
            thirdChecklistLine="Paiement sécurisé par Stripe, sans engagement de durée."
          />
        </div>

        <p className="mt-3 text-center text-[11px] text-slate-500">
          En cliquant sur « S’abonner », tu es envoyé sur la page de paiement Stripe pour régler l’abonnement.
        </p>

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
