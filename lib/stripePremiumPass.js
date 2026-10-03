/**
 * Nouvelle date de fin d’accès après achat d’un pass 3 mois : prolonge depuis la fin actuelle si elle est encore dans le futur, sinon depuis maintenant.
 *
 * @param {string | null | undefined} existingPremiumUntilIso
 * @param {Date} [now]
 * @returns {string} ISO 8601
 */
export function computePremiumUntilAfterPassPurchase(existingPremiumUntilIso, now = new Date()) {
  let base = now;
  if (existingPremiumUntilIso != null && String(existingPremiumUntilIso).trim() !== "") {
    const ex = new Date(String(existingPremiumUntilIso));
    if (Number.isFinite(ex.getTime()) && ex > now) {
      base = ex;
    }
  }
  const d = new Date(base.getTime());
  d.setMonth(d.getMonth() + 3);
  return d.toISOString();
}
