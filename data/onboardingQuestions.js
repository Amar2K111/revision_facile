import {
  BTS_SPECIALIZATION_GROUPS,
  CLASSES,
  getSubjectsForClass,
  TERMINALE_SPECIALIZATION_GROUPS,
} from "./curriculum";

/** @typedef {'text' | 'single' | 'multi' | 'scale' | 'date' | 'recap'} OnboardingStepType */

/**
 * @typedef {object} OnboardingStep
 * @property {string} id
 * @property {OnboardingStepType} type
 * @property {string} title
 * @property {string} [subtitle]
 * @property {boolean} [optional]
 * @property {{ value: string, label: string }[]} [options]
 * @property {(answers: Record<string, unknown>) => boolean} [showIf]
 */

export const ONBOARDING_DRAFT_STORAGE_KEY = "revision-onboarding-draft";

const STRESS_OPTIONS = [
  { value: "time", label: "Manque de temps" },
  { value: "grades", label: "La pression des notes" },
  { value: "subjects", label: "Certaines matières me bloquent" },
  { value: "method", label: "Je ne sais pas comment réviser" },
  { value: "motivation", label: "Motivation en dents de scie" },
  { value: "exam_day", label: "Le jour J me fait peur" },
];

const HOURS_OPTIONS = [
  { value: "0-3", label: "Moins de 3 h" },
  { value: "3-5", label: "3 à 5 h" },
  { value: "5-10", label: "5 à 10 h" },
  { value: "10+", label: "Plus de 10 h" },
];

const TIME_OF_DAY_OPTIONS = [
  { value: "morning", label: "Le matin" },
  { value: "afternoon", label: "L’après-midi" },
  { value: "evening", label: "Le soir" },
  { value: "variable", label: "Ça dépend des jours" },
];

const STUDY_MODE_OPTIONS = [
  { value: "alone", label: "Seul(e)" },
  { value: "friends", label: "Avec des amis" },
  { value: "family", label: "Avec ma famille" },
  { value: "mixed", label: "Un peu des deux" },
];

const BLOCKER_OPTIONS = [
  { value: "procrastination", label: "Je repousse souvent" },
  { value: "focus", label: "Difficile de rester concentré(e)" },
  { value: "overload", label: "Trop de choses à apprendre" },
  { value: "understanding", label: "Je comprends mais j’oublie vite" },
  { value: "organization", label: "Pas de méthode claire" },
];

const HELP_OPTIONS = [
  { value: "fiches", label: "Fiches claires et structurées" },
  { value: "quiz", label: "Quiz pour m’entraîner" },
  { value: "planning", label: "Un planning de révision" },
  { value: "oral", label: "Entraînement à l’oral" },
  { value: "tips", label: "Astuces méthodo" },
];

const GRADE_GOAL_OPTIONS = [
  { value: "pass", label: "Obtenir mon diplôme / valider" },
  { value: "good", label: "Une bonne moyenne" },
  { value: "excellent", label: "Viser l’excellence" },
  { value: "unsure", label: "Je ne sais pas encore" },
];

const COMMITMENT_OPTIONS = [
  { value: "yes", label: "Oui, je suis prêt(e)" },
  { value: "almost", label: "Presque — j’ai besoin d’un coup de pouce" },
];

/** @type {OnboardingStep[]} */
export const ONBOARDING_STEPS = [
  {
    id: "firstName",
    type: "text",
    title: "Ton prénom ?",
    subtitle: "On personnalise ton parcours (tu peux passer cette étape).",
    optional: true,
  },
  {
    id: "classId",
    type: "single",
    title: "Tu prépares quel examen ?",
    subtitle: "On adapte le contenu à ton niveau.",
    options: CLASSES.filter((c) => c.available).map((c) => ({
      value: c.id,
      label: c.label,
    })),
  },
  {
    id: "specializationId",
    type: "single",
    title: "Ta filière ?",
    subtitle: "Choisis une option.",
    showIf: (a) => a.classId === "term" || a.classId === "bts2",
    options: [],
  },
  {
    id: "examDate",
    type: "date",
    title: "Quand a lieu ton examen ?",
    subtitle: "Une date approximative suffit.",
  },
  {
    id: "weakSubjects",
    type: "multi",
    title: "Où tu galères le plus ?",
    subtitle: "Choisis une ou plusieurs matières.",
    options: [],
  },
  {
    id: "gradeGoal",
    type: "single",
    title: "Quel est ton objectif ?",
    options: GRADE_GOAL_OPTIONS,
  },
  {
    id: "topStress",
    type: "single",
    title: "Qu’est-ce qui te stresse le plus en ce moment ?",
    options: STRESS_OPTIONS,
  },
  {
    id: "hoursPerWeek",
    type: "single",
    title: "Combien d’heures tu révises par semaine ?",
    options: HOURS_OPTIONS,
  },
  {
    id: "studyTimeOfDay",
    type: "single",
    title: "Tu révises plutôt quand ?",
    options: TIME_OF_DAY_OPTIONS,
  },
  {
    id: "studyMode",
    type: "single",
    title: "Tu révises plutôt…",
    options: STUDY_MODE_OPTIONS,
  },
  {
    id: "mainBlocker",
    type: "single",
    title: "Ton plus gros blocage aujourd’hui",
    options: BLOCKER_OPTIONS,
  },
  {
    id: "mostHelpful",
    type: "multi",
    title: "Ce qui t’aiderait le plus",
    subtitle: "Plusieurs choix possibles.",
    options: HELP_OPTIONS,
  },
  {
    id: "successMeaning",
    type: "text",
    title: "Si tu réussis ton examen, qu’est-ce que ça changerait pour toi ?",
    subtitle: "Une phrase suffit — c’est pour toi.",
  },
  {
    id: "commitment",
    type: "single",
    title: "Prêt(e) à t’y mettre sérieusement ?",
    options: COMMITMENT_OPTIONS,
  },
  {
    id: "recap",
    type: "recap",
    title: "Ton profil de révision",
    subtitle: "Tu es prêt(e) à générer tes fiches sur mesure.",
  },
];

/**
 * @param {Record<string, unknown>} answers
 * @returns {OnboardingStep[]}
 */
export function getVisibleOnboardingSteps(answers) {
  return ONBOARDING_STEPS.filter((step) => !step.showIf || step.showIf(answers));
}

/**
 * @param {{ options: { id: string, label: string }[] }} group
 * @returns {{ value: string, label: string }[]}
 */
function mapGroupOptions(group) {
  return group.options.map((o) => ({ value: o.id, label: o.label }));
}

/**
 * @param {Record<string, unknown>} answers
 * @returns {{ groupLabel: string, options: { value: string, label: string }[] }[]}
 */
export function getSpecializationGroups(answers) {
  if (answers.classId === "term") {
    return TERMINALE_SPECIALIZATION_GROUPS.map((g) => ({
      groupLabel: g.groupLabel,
      options: mapGroupOptions(g),
    }));
  }
  if (answers.classId === "bts2") {
    return BTS_SPECIALIZATION_GROUPS.map((g) => ({
      groupLabel: g.groupLabel,
      options: mapGroupOptions(g),
    }));
  }
  return [];
}

/**
 * @param {Record<string, unknown>} answers
 * @returns {{ value: string, label: string }[]}
 */
export function getSpecializationOptions(answers) {
  return getSpecializationGroups(answers).flatMap((g) => g.options);
}

/**
 * @param {Record<string, unknown>} answers
 * @returns {boolean}
 */
export function isSpecializationStepComplete(answers) {
  const id = answers.specializationId;
  if (typeof id !== "string" || id.length === 0) {
    return false;
  }
  return getSpecializationOptions(answers).some((o) => o.value === id);
}

/**
 * @param {Record<string, unknown>} answers
 * @returns {boolean}
 */
export function isWeakSubjectsStepComplete(answers) {
  const weak = answers.weakSubjects;
  const options = getWeakSubjectOptions(answers);
  if (options.length === 0) {
    return false;
  }
  return Array.isArray(weak) && weak.length > 0;
}

/**
 * @param {Record<string, unknown>} answers
 * @returns {{ value: string, label: string }[]}
 */
export function getWeakSubjectOptions(answers) {
  const classId = typeof answers.classId === "string" ? answers.classId : "";
  const spec =
    typeof answers.specializationId === "string" ? answers.specializationId : "";
  const subjects = getSubjectsForClass(classId, spec);

  if (classId === "3e") {
    return subjects.map((s) => ({ value: s.id, label: s.name }));
  }

  if (classId === "term" || classId === "bts2") {
    return subjects.flatMap((s) =>
      (s.topics ?? []).map((topic, index) => ({
        value: `${s.id}::${index}`,
        label: `${s.name} — ${topic}`,
      })),
    );
  }

  return [];
}

/**
 * @param {Record<string, unknown>} answers
 */
export function getWeakSubjectsStepSubtitle(answers) {
  const classId = typeof answers.classId === "string" ? answers.classId : "";
  if (classId === "term" || classId === "bts2") {
    return "Choisis une ou plusieurs notions de ta filière.";
  }
  return "Choisis une ou plusieurs matières.";
}

/**
 * @param {Record<string, unknown>} answers
 * @param {string[]} weakSubjects
 */
export function areWeakSubjectsValid(answers, weakSubjects) {
  if (!Array.isArray(weakSubjects) || weakSubjects.length === 0) {
    return false;
  }
  const allowed = new Set(getWeakSubjectOptions(answers).map((o) => o.value));
  return weakSubjects.every((v) => typeof v === "string" && allowed.has(v));
}

/**
 * @param {string} classId
 */
export function examLabelFromClassId(classId) {
  if (classId === "term") return "Bac";
  if (classId === "bts2") return "BTS";
  return "Brevet";
}

/**
 * @param {Record<string, unknown>} answers
 */
export function daysUntilExam(answers) {
  const raw = answers.examDate;
  if (typeof raw !== "string" || !raw) return null;
  const exam = new Date(`${raw}T12:00:00`);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = Math.ceil((exam.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return Number.isFinite(diff) ? diff : null;
}

/**
 * @param {Record<string, unknown>} answers
 * @param {string} fieldId
 * @param {string} value
 */
export function labelForAnswer(answers, fieldId, value) {
  if (fieldId === "classId") {
    return CLASSES.find((c) => c.id === value)?.label ?? value;
  }
  if (fieldId === "specializationId") {
    return getSpecializationOptions(answers).find((o) => o.value === value)?.label ?? value;
  }
  if (fieldId === "weakSubjects") {
    return getWeakSubjectOptions(answers).find((o) => o.value === value)?.label ?? value;
  }
  const step = ONBOARDING_STEPS.find((s) => s.id === fieldId);
  return step?.options?.find((o) => o.value === value)?.label ?? value;
}
