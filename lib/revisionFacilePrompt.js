/** Prompt Révision facile : 3 pages cours + 1 page entraînement oral + bloc JSON quiz (hors Markdown affiché). */

import { PRACTICE_QUIZ_QUESTION_TARGET } from "./practiceQuizShared";

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
- **Exactement ${PRACTICE_QUIZ_QUESTION_TARGET}** objets dans le tableau (QCM), ni plus ni moins.
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
Pour le 4ᵉ bloc : entraînement oral concret et quiz JSON conforme aux instructions système (${PRACTICE_QUIZ_QUESTION_TARGET} QCM obligatoires, 4 choix chacune).
Formalismes adaptés (français, maths avec LaTeX, sciences, SHS selon la matière).`;

/** Extrai Markdown renvoyé au modèle pour calibrer un quiz de secours (si la 1ʳᵉ réponse omit le bloc JSON). */
export const PRACTICE_QUIZ_SNIPPET_MAX_CHARS = 12_000;

/**
 * Réponse Gemini : uniquement le bloc fenced `revision-facile-quiz`, sans autre texte.
 */
export function getPracticeQuizFragmentSystemPrompt() {
  return `Tu es un assistant pédagogique pour l’application « Révision facile ».

Ta sortie = **exclusivement** un **unique** bloc de code fenced :
- première ligne : trois accents graves + revision-facile-quiz puis retour ligne
- corps : tableau JSON valide uniquement entre [ et ]
- dernière ligne : trois accents graves fermants seuls

Aucun titre, aucune phrase avant ou après le bloc. Aucun autre bloc de code.

Règles du JSON :
- **Exactement ${PRACTICE_QUIZ_QUESTION_TARGET}** objets (QCM), ni plus ni moins.
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
}) {
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
Réponds **uniquement** avec le bloc fenced **revision-facile-quiz** décrit dans tes instructions (exactement ${PRACTICE_QUIZ_QUESTION_TARGET} QCM sur cette notion, niveau ${examLabel}).

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
  const terminaleQuizBlock =
    examLabel === "Bac"
      ? `

## Impératif — Terminale / Bac et quiz
À la Terminale, les contenus sont denses ; le modèle tronque parfois la fin — **sans quiz**, l’élève perd l’outil d’entraînement prévu par l’appli.

- La réponse **doit obligatoirement** se terminer par le bloc fenced \`revision-facile-quiz\` (${PRACTICE_QUIZ_QUESTION_TARGET} QCM, 4 choix chacune), **sans aucun caractère après** la ligne fermante \`\`\`.
- Si la longueur totale doit être arbitrée : raccourcis le développement du **cours** (blocs 1–4) avant de supprimer ou d’abréger le quiz JSON.`
      : "";

  return `## Contexte examen
- Diplôme visé : ${examLabel}
- Classe : ${classLabel}
- Matière : ${subjectName}
- Notion : ${topicLabel}
${terminaleQuizBlock}
## Consignes de profondeur (directive à intégrer)
${expertDirective}

Rédige la fiche **complète** : blocs cours 1→2→3, puis bloc 4 entraînement oral (Markdown), puis le tableau JSON dans le bloc fenced final **revision-facile-quiz**, comme défini dans les instructions système. Respecte les titres de partie (**#**) indiqués et une ligne unique **---** entre chaque bloc 1 à 4.`;
}
