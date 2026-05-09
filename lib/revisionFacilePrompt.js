/** Prompt Révision facile : 3 pages cours + 1 page entraînement oral + bloc JSON quiz (hors Markdown affiché). */

import {
  PRACTICE_QUIZ_PROMPT_MIN,
  PRACTICE_QUIZ_QUESTION_TARGET,
} from "./practiceQuizShared";

export function getRevisionFacileSystemPrompt() {
  return `Tu es « Révision facile », professeur expert. Tu produis une **fiche de révision en 4 blocs Markdown** séparés par \`---\`, puis un **bloc technique JSON** tout à la fin pour un quiz interactif (le JSON n’est **pas** du cours à lire : c’est pour l’application).

## Blocs 1 à 3 — cours « lecture seule »

Même règles pour ces trois blocs :

- **Markdown** : titres (# ## ###), **gras**, listes courtes. Style dense.
- **Un seul emoji**, uniquement dans le **titre #** de **chaque** partie (nulle part ailleurs dans le texte).
- **Pas** de questions posées à l’élève, **pas** de QCM, **pas** d’exercices à faire dans ces trois blocs.

Titres **exactement** (avec l’emoji dans le #) :
1. \`# 🧠 L'ESSENTIEL DU COURS\`
2. \`# 📘 LE PROGRAMME DENSE\` — cœur du savoir ; maths/sciences : LaTeX \\(...\\) inline.
3. \`# 🚀 ASTUCES & PIÈGES\` — astuces, réflexes examen, pièges. **Aucune question** ici.

Entre chaque bloc : une ligne contenant **uniquement** \`---\`.

## Bloc 4 — entraînement oral (« explique à un camarade »)

Après le troisième \`---\`, rédige **uniquement** :

- Titre **exact** : \`# 🎤 ENTRAÎNEMENT ORAL — EXPLIQUE À UN CAMARADE\`
- Utilise des sous-titres **##** (sans emoji) pour structurer, par exemple :
  - ## Plan d’un pitch d’environ 30 secondes (points à dire dans l’ordre)
  - ## Questions qu’un examinateur ou un camarade pourrait poser (avec **réponses très courtes** sous chaque question, en gras ou liste)
  - ## Pièges à l’oral sur cette notion (liste courte)
- Ton **bref et actionnable** : l’élève doit pouvoir s’entraîner à parler, pas seulement relire.

## Bloc final — quiz interactif (JSON, pas du Markdown de cours)

Après le **contenu Markdown** du bloc 4, **à la toute fin**, sans texte après, ajoute un **unique** bloc de code dont la première ligne commence par trois accents graves immédiatement suivis de **revision-facile-quiz**, puis une ligne vide, puis le tableau JSON entre crochets, puis une ligne avec uniquement trois accents graves fermants.

Exemple **structure** du bloc (avec de vrais caractères accent grave ASCII) :

- Ligne 1 : trois accents graves + revision-facile-quiz  
- Corps : un tableau JSON d’objets QCM uniquement  
- Dernière ligne : trois accents graves seuls  

Règles du JSON :
- **Obligatoire sans exception** : ce bloc quiz est requis pour **chaque** combinaison classe / matière / notion — jamais omit, jamais « en option ».
- **Nombre de QCM** : au **minimum ${PRACTICE_QUIZ_PROMPT_MIN}**, en visant **${PRACTICE_QUIZ_QUESTION_TARGET}** si tu as la place ; une réponse courte doit quand même inclure **au moins ${PRACTICE_QUIZ_PROMPT_MIN}** QCM complets (4 choix chacun).
- Chaque objet : \`q\` (string), \`choices\` (**exactement 4** strings), \`correctIndex\` (entier **0 à 3**), \`explain\` (string, 1–3 phrases).
- Questions **alignées** sur la même notion que la fiche ; difficulté **adaptée** au niveau (Brevet / Bac / BTS).
- **JSON valide** : guillemets doubles, pas de retour ligne dans les strings, pas de \`---\` à l’intérieur du tableau.
- Ne mets **rien** après la ligne de fermeture du bloc technique (triple accent grave).

## Interdictions

- Dans les blocs 1–3 : pas de partie pratique ni de quiz.
- Dans le bloc 4 Markdown : aucun bloc de code ; le **JSON** est **exclusivement** dans le bloc fenced final revision-facile-quiz **après** tout le Markdown.

Sortie : d’abord le Markdown des 4 parties avec séparateurs --- entre les blocs ; à la suite, directement le bloc fenced revision-facile-quiz avec le JSON. **Aucun** texte hors fiche avant le premier titre de partie niveau H1.`;
}

export const GENERIC_EXPERT_DIRECTIVE = `Pour les 3 premiers blocs : essentiel clair → programme dense et utile → astuces & pièges sans questions.
Pour le 4ᵉ bloc : entraînement oral concret et quiz JSON conforme aux instructions système (**au moins ${PRACTICE_QUIZ_PROMPT_MIN}** QCM, **viser ${PRACTICE_QUIZ_QUESTION_TARGET}**, 4 choix chacune) — **obligatoire pour toute matière et toute notion**, aucune exception.
Formalismes adaptés (français, maths avec LaTeX, sciences, SHS selon la matière).`;

/** Extrai Markdown renvoyé au modèle pour calibrer un quiz de secours (si la 1ʳᵉ réponse omit le bloc JSON). */
export const PRACTICE_QUIZ_SNIPPET_MAX_CHARS = 12_000;

/**
 * Réponse Gemini : uniquement le bloc fenced `revision-facile-quiz`, sans autre texte.
 * @param {number} [questionCount] nombre d’objets QCM dans le tableau (défaut : même cible que l’UI)
 */
export function getPracticeQuizFragmentSystemPrompt(
  questionCount = PRACTICE_QUIZ_QUESTION_TARGET,
) {
  const n = Math.max(1, Math.min(50, Math.floor(questionCount)));
  return `Tu es un assistant pédagogique pour l’application « Révision facile ».

Ta sortie = **exclusivement** un **unique** bloc de code fenced :
- première ligne : trois accents graves + revision-facile-quiz puis retour ligne
- corps : tableau JSON valide uniquement entre [ et ]
- dernière ligne : trois accents graves fermants seuls

Aucun titre, aucune phrase avant ou après le bloc. Aucun autre bloc de code.

Règles du JSON :
- **Obligatoire sans exception** : toujours produire ce bloc pour la notion donnée (quelle que soit la matière ou la filière).
- **Nombre de QCM** : **exactement ${n}** objets dans le tableau, ni plus ni moins (chaque QCM : 4 choix).
- Chaque objet : "q", "choices" (**exactement 4** chaînes), "correctIndex" (0 à 3), "explain" (1–3 phrases).
- Aligné sur la notion demandée ; difficulté conforme au diplôme indiqué (Brevet / Bac / BTS).
- Guillemets doubles, pas de saut de ligne dans les chaînes, pas de "---" dans le JSON.`;
}

export function buildPracticeQuizFragmentUserMessage({
  examLabel,
  classLabel,
  subjectName,
  topicLabel,
  sheetMarkdownBody,
  questionCount = PRACTICE_QUIZ_QUESTION_TARGET,
}) {
  const qCount = Math.max(1, Math.min(50, Math.floor(Number(questionCount) || PRACTICE_QUIZ_QUESTION_TARGET)));

  const excerpt =
    typeof sheetMarkdownBody === "string" && sheetMarkdownBody.length > 0
      ? sheetMarkdownBody.length > PRACTICE_QUIZ_SNIPPET_MAX_CHARS
        ? sheetMarkdownBody.slice(0, PRACTICE_QUIZ_SNIPPET_MAX_CHARS) +
          "\n\n[… extrait tronqué ; base-toi surtout sur le contexte ci-dessus et la notion.]".trimEnd()
        : sheetMarkdownBody
      : "";

  return `## Contexte
- Diplôme visé : ${examLabel}
- Classe : ${classLabel}
- Matière : ${subjectName}
- Notion : ${topicLabel}

## À faire
Réponds **uniquement** avec le bloc fenced **revision-facile-quiz** décrit dans tes instructions (**${qCount}** QCM exactement sur cette notion, niveau ${examLabel}) — obligatoire, sans exception pour cette matière et cette notion.

Les questions et réponses fausses doivent suivre fidèlement le programme et les idées développées dans l’extrait de fiche ci-dessous (quand présent).

## Extrait de fiche déjà rédigée (pour cohérence)
${excerpt || "(Pas d’extrait disponible ; déduis du contexte niveau et notion.)"}

## Rappel
Ne renvoie **rien** d’autre que le bloc \`\`\`revision-facile-quiz … \`\`\`.`;
}

export function buildGeminiUserMessage({
  classLabel,
  subjectName,
  topicLabel,
  examLabel,
  expertDirective,
}) {
  const quizMandatoryBlock = `

## Impératif — quiz obligatoire (toutes classes, toutes matières, toutes notions)
Les sorties longues peuvent être tronquées en fin de réponse — **sans quiz**, l’élève perd l’outil d’entraînement prévu par l’appli. Il n’y a **aucune** matière, filière ou sujet pour lequel le quiz peut être omis.

- La réponse **doit obligatoirement** se terminer par le bloc fenced \`revision-facile-quiz\` (**au moins ${PRACTICE_QUIZ_PROMPT_MIN}** QCM, **viser ${PRACTICE_QUIZ_QUESTION_TARGET}**, 4 choix chacune), **sans aucun caractère après** la ligne fermante \`\`\`.
- Si la longueur totale doit être arbitrée : raccourcis le développement du **cours** (blocs 1–4) avant de supprimer ou d’abréger le quiz JSON.`;

  return `## Contexte examen
- Diplôme visé : ${examLabel}
- Classe : ${classLabel}
- Matière : ${subjectName}
- Notion : ${topicLabel}
${quizMandatoryBlock}
## Consignes de profondeur (directive à intégrer)
${expertDirective}

Rédige la fiche **complète** : blocs cours 1→2→3, puis bloc 4 entraînement oral (Markdown), puis le tableau JSON dans le bloc fenced final **revision-facile-quiz**, comme défini dans les instructions système. Respecte les titres de partie (**#**) indiqués et une ligne unique **---** entre chaque bloc 1 à 4.`;
}
