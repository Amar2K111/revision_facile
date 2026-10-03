/** Année scolaire et sessions d'examen en vigueur sur Révision facile. */

export const SCHOOL_YEAR = "2026-2027";

/** Sessions d'examen visées (élèves de l'année scolaire 2026-2027). */
export const EXAM_SESSION = {
  brevet: 2027,
  bac: 2027,
  bts: 2027,
};

/** Dates indicatives pour préremplir l'onboarding (approximation — l'élève peut ajuster). */
export const DEFAULT_EXAM_DATES = {
  "3e": "2027-06-24",
  term: "2027-06-15",
  bts2: "2027-05-22",
};

/** Date indicative du début des épreuves du Bac (terminale). */
export const BAC_EXAM_DATE = DEFAULT_EXAM_DATES.term;

/**
 * Jours calendaires restants avant une date d'examen (ISO YYYY-MM-DD).
 * @param {string} dateStr
 * @param {Date} [from]
 */
export function daysUntilExamDate(dateStr, from = new Date()) {
  const exam = new Date(`${dateStr}T12:00:00`);
  const today = new Date(from);
  today.setHours(12, 0, 0, 0);
  const diffMs = exam.getTime() - today.getTime();
  return Math.max(0, Math.ceil(diffMs / 86_400_000));
}

/** @param {string} dateStr ISO YYYY-MM-DD */
export function formatExamDateFr(dateStr) {
  const d = new Date(`${dateStr}T12:00:00`);
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

/**
 * @param {string} classId
 * @returns {string}
 */
export function examLabelFromClassId(classId) {
  if (classId === "term") return `Bac ${EXAM_SESSION.bac}`;
  if (classId === "bts2") return `BTS ${EXAM_SESSION.bts}`;
  return `Brevet ${EXAM_SESSION.brevet}`;
}

/**
 * @param {string} classId
 * @returns {string}
 */
export function examSessionHint(classId) {
  if (classId === "term") {
    return `session ${EXAM_SESSION.bac} (année scolaire ${SCHOOL_YEAR})`;
  }
  if (classId === "bts2") {
    return `session ${EXAM_SESSION.bts} (année scolaire ${SCHOOL_YEAR})`;
  }
  return `DNB ${EXAM_SESSION.brevet} (année scolaire ${SCHOOL_YEAR})`;
}
