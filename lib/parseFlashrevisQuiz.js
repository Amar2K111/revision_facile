/**
 * Extrait et retire le bloc fenced JSON en fin de fiche Markdown.
 * Accepte `revision-facile-quiz` (actuel) ou l’ancien `flashrevis-quiz` (rétrocompat).
 * @returns {{ markdown: string, practiceQuiz: PracticeQuizQuestion[] }}
 */

/** Langages de fence reconnus (typos / ancien nom inclus). */
const QUIZ_FENCE =
  "(?:revision-facile-quiz|revision_facile_quiz|flashrevis-quiz)";

/** @typedef {{ id: string, q: string, choices: string[], correctIndex: number, explain: string }} PracticeQuizQuestion */
export function extractPracticeQuizFence(markdown) {
  const trimmed = typeof markdown === "string" ? markdown.trim() : "";
  if (!trimmed) {
    return { markdown: "", practiceQuiz: [] };
  }

  /**
   * Dernière occurrence du bloc quiz : le modèle ajoute parfois une phrase après la fence,
   * ce qui cassait l’ancien ancrage `$` en fin de chaîne.
   */
  const blockRe = new RegExp(
    `\`\`\`\\s*${QUIZ_FENCE}\\s*\\r?\\n?([\\s\\S]*?)(?:\\r?\\n)?\\s*\`\`\``,
    "gim",
  );

  /** @type {RegExpExecArray | null} */
  let m = null;
  let hit;
  while ((hit = blockRe.exec(trimmed)) !== null) {
    m = hit;
  }

  if (!m || m.index == null) {
    return { markdown: trimmed, practiceQuiz: [] };
  }

  const jsonRaw = m[1]?.trim() ?? "";
  const markdownBody = trimmed.slice(0, m.index).trim();

  const arr = parseQuizJsonArray(jsonRaw);

  /** @type {PracticeQuizQuestion[]} */
  const practiceQuiz = arr.map(normalizeQuestion).filter(Boolean);

  return { markdown: markdownBody, practiceQuiz };
}

/**
 * Tabuleau racine `[...]` uniquement ; tente aussi de corriger virgules finales (erreur fréquente LLM).
 * @returns {unknown[]}
 */
function parseQuizJsonArray(jsonRaw) {
  const s = typeof jsonRaw === "string" ? jsonRaw.trim() : "";
  if (!s) return [];
  /** @returns {unknown[] | null} */
  const attempt = () => {
    try {
      const parsed = JSON.parse(s);
      return Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  };
  const first = attempt();
  if (first !== null) return first;
  try {
    const relaxed = s.replace(/,\s*([\]}])/g, "$1");
    const parsed = JSON.parse(relaxed);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** @deprecated Utiliser extractPracticeQuizFence */
export function extractFlashrevisQuiz(markdown) {
  return extractPracticeQuizFence(markdown);
}

/** @returns {PracticeQuizQuestion | null} */
function normalizeQuestion(raw, index) {
  if (!raw || typeof raw !== "object") return null;
  const q = pickString(raw.q ?? raw.question);
  const choicesRaw = raw.choices ?? raw.options;
  const choices = Array.isArray(choicesRaw)
    ? choicesRaw.map((c) => String(c).trim()).filter((c) => c.length > 0)
    : [];
  const correctIndex = Number(raw.correctIndex ?? raw.answer ?? raw.c);
  const explain = pickString(raw.explain ?? raw.explanation);

  if (!q || choices.length < 2 || !Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex >= choices.length) {
    return null;
  }

  return {
    id: String(raw.id ?? index),
    q,
    choices,
    correctIndex,
    explain,
  };
}

function pickString(v) {
  if (typeof v !== "string") return "";
  const s = v.trim();
  return s.length ? s : "";
}
