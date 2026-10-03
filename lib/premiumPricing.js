/** Tarifs Premium affichés et utilisés côté serveur (Checkout). */

export const DEFAULT_PREMIUM_YEARLY_EUR = 29.99;
export const DEFAULT_PREMIUM_MONTHLY_EUR = 4.99;
export const DEFAULT_PREMIUM_TRIAL_DAYS = 3;

function parsePositiveEur(raw) {
  if (raw == null || typeof raw !== "string") {
    return null;
  }
  const t = raw.trim();
  if (!t) {
    return null;
  }
  const n = Number(t.replace(",", "."));
  if (!Number.isFinite(n) || n <= 0) {
    return null;
  }
  return n;
}

export function resolvePremiumYearlyEur() {
  return (
    parsePositiveEur(process.env.STRIPE_PREMIUM_YEARLY_EUR) ??
    parsePositiveEur(process.env.NEXT_PUBLIC_PREMIUM_YEARLY_EUR) ??
    DEFAULT_PREMIUM_YEARLY_EUR
  );
}

export function resolvePremiumMonthlyEur() {
  return (
    parsePositiveEur(process.env.STRIPE_PREMIUM_MONTHLY_EUR) ??
    parsePositiveEur(process.env.NEXT_PUBLIC_PREMIUM_MONTHLY_EUR) ??
    DEFAULT_PREMIUM_MONTHLY_EUR
  );
}

export function resolvePremiumTrialDays() {
  const raw = process.env.STRIPE_PREMIUM_TRIAL_DAYS ?? process.env.NEXT_PUBLIC_PREMIUM_TRIAL_DAYS;
  if (raw == null || typeof raw !== "string") {
    return DEFAULT_PREMIUM_TRIAL_DAYS;
  }
  const n = Number(raw.trim());
  if (!Number.isFinite(n) || n < 0) {
    return DEFAULT_PREMIUM_TRIAL_DAYS;
  }
  return Math.floor(n);
}

/** @param {number} eur */
export function formatEurLabel(eur) {
  const fixed = Number.isInteger(eur) ? eur.toFixed(0) : eur.toFixed(2).replace(".", ",");
  return `${fixed.replace(".", ",")} €`;
}

/** @param {number} yearlyEur */
export function yearlyPerMonthLabel(yearlyEur) {
  const perMonth = yearlyEur / 12;
  const rounded = Math.round(perMonth * 100) / 100;
  return formatEurLabel(rounded);
}
