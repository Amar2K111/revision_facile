/** Cible commune : nombre de questions posées dans une série quiz (prompt + tirage UI). */
export const PRACTICE_QUIZ_QUESTION_TARGET = 15;

/** Au moins ce nombre de QCM valides dans les prompts envoyés au modèle (assouplit les échecs « exactement 15 »). */
export const PRACTICE_QUIZ_PROMPT_MIN = 10;

/** Seuil minimal pour répondre 200 : fiche OK + au moins un quiz exploitable (4 choix, index correct). */
export const PRACTICE_QUIZ_MIN_REQUIRED = 1;

/**
 * QCM conforme aux règles du quiz (énoncé, 4 choix, index correct 0–3).
 * @param {unknown} x
 */
export function isValidPracticeQuizQuestion(x) {
  if (!x || typeof x !== "object") return false;
  if (typeof x.q !== "string" || !x.q.trim()) return false;
  if (!Array.isArray(x.choices) || x.choices.length !== 4) return false;
  const ci = Number(x.correctIndex);
  if (!Number.isInteger(ci) || ci < 0 || ci >= 4) return false;
  return true;
}

/** @param {string} stem */
function normalizeQuizStem(stem) {
  return stem.trim().toLowerCase().replace(/\s+/g, " ").slice(0, 480);
}

/**
 * Fusionne plusieurs tableaux parsés depuis le LLM sans doublon d'énoncé (ordre conservé).
 * @param {unknown[][]} slices
 * @param {number} cap
 */
export function mergePracticeQuizDedup(slices, cap = PRACTICE_QUIZ_QUESTION_TARGET) {
  /** @type {Set<string>} */
  const seen = new Set();
  /** @type {Array<{ id: string, q: string, choices: string[], correctIndex: number, explain: string }>} */
  const out = [];
  for (const arr of slices) {
    if (!Array.isArray(arr)) continue;
    for (const x of arr) {
      if (!isValidPracticeQuizQuestion(x)) continue;
      const key = normalizeQuizStem(x.q);
      if (!key.length || seen.has(key)) continue;
      seen.add(key);
      const explain =
        typeof x.explain === "string" ? x.explain.trim() : "";
      out.push({
        id: `q-${out.length}`,
        q: x.q.trim(),
        choices: x.choices.map((c) => String(c).trim()),
        correctIndex: Number(x.correctIndex),
        explain,
      });
      if (out.length >= cap) return out;
    }
  }
  return out;
}

/**
 * Compte les QCM utilisables (énoncé, 4 choix, index correct 0–3).
 * @param {unknown} practiceQuiz
 */
export function countValidPracticeQuizQuestions(practiceQuiz) {
  if (!Array.isArray(practiceQuiz)) return 0;
  let n = 0;
  for (const x of practiceQuiz) {
    if (!isValidPracticeQuizQuestion(x)) continue;
    n++;
  }
  return n;
}

/** Fisher–Yates, copie puis mélange. */
export function shuffleCopy(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Réordonne les choix au hasard tout en corrigeant `correctIndex`.
 * @param {{ id: string, q: string, choices: string[], correctIndex: number, explain: string }} q
 */
export function shuffleChoicesForQuestion(q) {
  const pairs = q.choices.map((label, i) => ({ label, isCorrect: i === q.correctIndex }));
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }
  return {
    ...q,
    choices: pairs.map((p) => p.label),
    correctIndex: pairs.findIndex((p) => p.isCorrect),
  };
}
