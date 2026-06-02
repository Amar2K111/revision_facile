import { getVisibleOnboardingSteps } from "../data/onboardingQuestions";

const MAX_TEXT_LEN = 500;

/**
 * @param {unknown} body
 * @returns {{ ok: true, answers: Record<string, unknown> } | { ok: false, error: string }}
 */
export function validateOnboardingPayload(body) {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Corps de requête invalide." };
  }
  const answers = /** @type {Record<string, unknown>} */ (body).answers;
  if (!answers || typeof answers !== "object") {
    return { ok: false, error: "Réponses manquantes." };
  }

  const classId = answers.classId;
  if (typeof classId !== "string" || !["3e", "term", "bts2"].includes(classId)) {
    return { ok: false, error: "Niveau invalide." };
  }

  if ((classId === "term" || classId === "bts2") && typeof answers.specializationId !== "string") {
    return { ok: false, error: "Filière ou spécialité requise." };
  }

  if (typeof answers.examDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(answers.examDate)) {
    return { ok: false, error: "Date d’examen invalide." };
  }

  if (!Array.isArray(answers.weakSubjects) || answers.weakSubjects.length === 0) {
    return { ok: false, error: "Choisis au moins une matière difficile." };
  }

  if (typeof answers.successMeaning !== "string" || answers.successMeaning.trim().length < 3) {
    return { ok: false, error: "Dis-nous en quelques mots ce que la réussite représente pour toi." };
  }

  const requiredSingles = [
    "gradeGoal",
    "topStress",
    "hoursPerWeek",
    "studyTimeOfDay",
    "studyMode",
    "mainBlocker",
    "commitment",
  ];
  for (const key of requiredSingles) {
    if (typeof answers[key] !== "string" || !answers[key]) {
      return { ok: false, error: `Réponse manquante : ${key}.` };
    }
  }

  if (!Array.isArray(answers.mostHelpful) || answers.mostHelpful.length === 0) {
    return { ok: false, error: "Indique ce qui t’aiderait le plus." };
  }

  if (answers.firstName != null && typeof answers.firstName !== "string") {
    return { ok: false, error: "Prénom invalide." };
  }
  if (typeof answers.firstName === "string" && answers.firstName.length > 80) {
    return { ok: false, error: "Prénom trop long." };
  }
  if (answers.successMeaning.length > MAX_TEXT_LEN) {
    return { ok: false, error: "Texte trop long." };
  }

  const visible = getVisibleOnboardingSteps(answers);
  if (!visible.some((s) => s.id === "recap")) {
    return { ok: false, error: "Étapes incomplètes." };
  }

  const sanitized = { ...answers };
  delete sanitized.recap;
  if (typeof sanitized.firstName === "string") {
    sanitized.firstName = sanitized.firstName.trim();
  }
  sanitized.successMeaning = String(sanitized.successMeaning).trim();

  return { ok: true, answers: sanitized };
}
