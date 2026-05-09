import { GoogleGenerativeAI } from "@google/generative-ai";
import { getMath3eDirectiveByTopic } from "../../../data/math3emeExpertDirectives";
import { createSupabaseServerClient } from "../../../lib/supabase/server";
import {
  buildGeminiUserMessage,
  buildPracticeQuizFragmentUserMessage,
  GENERIC_EXPERT_DIRECTIVE,
  getPracticeQuizFragmentSystemPrompt,
  getRevisionFacileSystemPrompt,
} from "../../../lib/revisionFacilePrompt";
import { extractPracticeQuizFence } from "../../../lib/parseFlashrevisQuiz";
import {
  countValidPracticeQuizQuestions,
  mergePracticeQuizDedup,
  PRACTICE_QUIZ_MIN_REQUIRED,
  PRACTICE_QUIZ_QUESTION_TARGET,
} from "../../../lib/practiceQuizShared";

/** Modèle stable conseillé ; `gemini-1.5-flash` n’est plus disponible sur l’API v1beta. */
const DEFAULT_MODEL = "gemini-2.5-flash";

/** Limite tokens : la fiche + JSON est longue ; une sortie courte tronque souvent le quiz. */
const FICHE_GENERATION_CONFIG = { maxOutputTokens: 16_384 };
const QUIZ_GENERATION_CONFIG = { maxOutputTokens: 8192 };

/** Appels quiz « plein lot » puis passes « uniquement les manquantes » — la fusion déduplique les répétitions. */
const QUIZ_SUPPLEMENT_MAX = 14;
const QUIZ_TOP_UP_MAX_ROUNDS = 14;

/**
 * @param {*} model Instance `GenerativeModel` (@google/generative-ai).
 * @param {{ maxOutputTokens?: number }} [generationConfig]
 */
async function generateModelText(model, userText, generationConfig) {
  const payload =
    typeof generationConfig === "object" && generationConfig !== null
      ? { contents: [{ role: "user", parts: [{ text: userText }] }], generationConfig }
      : { contents: [{ role: "user", parts: [{ text: userText }] }] };
  const result = await model.generateContent(payload);
  return result.response.text()?.trim() ?? "";
}

function examLabelFromClassId(classId) {
  if (classId === "term") return "Bac";
  if (classId === "bts2") return "BTS";
  return "Brevet";
}

function resolveExpertDeepening(classId, subjectId, topicLabel) {
  if (classId === "3e" && subjectId === "math") {
    const row = getMath3eDirectiveByTopic(topicLabel);
    if (row) {
      return { directive: row.directive, expertId: row.id };
    }
  }
  return { directive: GENERIC_EXPERT_DIRECTIVE, expertId: null };
}

export async function POST(request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return Response.json({ error: "Connexion requise pour générer une fiche." }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_premium")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile?.is_premium) {
    return Response.json(
      { error: "Offre Premium requise pour générer une fiche." },
      { status: 403 },
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey?.trim()) {
    return Response.json(
      { error: "Clé API absente (GEMINI_API_KEY dans .env.local)." },
      { status: 500 },
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Corps JSON invalide." }, { status: 400 });
  }

  const {
    classId,
    classLabel,
    subjectId,
    subjectName,
    topicLabel,
  } = body ?? {};

  if (!classId || !classLabel || !subjectId || !subjectName || !topicLabel) {
    return Response.json(
      { error: "Paramètres manquants (classe, matière, notion)." },
      { status: 400 },
    );
  }

  const { directive, expertId } = resolveExpertDeepening(
    classId,
    subjectId,
    topicLabel,
  );

  const examLabel = examLabelFromClassId(classId);
  const modelName = process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: getRevisionFacileSystemPrompt(),
  });

  const userText = buildGeminiUserMessage({
    classLabel,
    subjectName,
    topicLabel,
    examLabel,
    expertDirective: directive,
  });

  try {
    const raw = await generateModelText(model, userText, FICHE_GENERATION_CONFIG);
    let { markdown, practiceQuiz } = extractPracticeQuizFence(raw);

    if (!markdown) {
      return Response.json({
        error: "Réponse vide du modèle. Réessaie ou définis GEMINI_MODEL dans .env.local.",
      }, { status: 502 });
    }

    /** @type {unknown[][]} */
    const quizSlices = [];
    quizSlices.push(practiceQuiz);
    practiceQuiz = mergePracticeQuizDedup(quizSlices);

    if (countValidPracticeQuizQuestions(practiceQuiz) < PRACTICE_QUIZ_QUESTION_TARGET) {
      const quizUserTextBase = buildPracticeQuizFragmentUserMessage({
        examLabel,
        classLabel,
        subjectName,
        topicLabel,
        sheetMarkdownBody: markdown,
      });
      const supplementQuizModel = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: getPracticeQuizFragmentSystemPrompt(
          PRACTICE_QUIZ_QUESTION_TARGET,
        ),
      });
      let supplement = 0;
      while (
        supplement < QUIZ_SUPPLEMENT_MAX &&
        countValidPracticeQuizQuestions(practiceQuiz) < PRACTICE_QUIZ_QUESTION_TARGET
      ) {
        supplement++;
        try {
          const quizRaw = await generateModelText(
            supplementQuizModel,
            quizUserTextBase,
            QUIZ_GENERATION_CONFIG,
          );
          const extracted = extractPracticeQuizFence(quizRaw);
          quizSlices.push(extracted.practiceQuiz);
          practiceQuiz = mergePracticeQuizDedup(quizSlices);
        } catch {
          /* nouvel essai après échec réseau/API */
        }
      }
    }

    let topUps = 0;
    while (
      topUps < QUIZ_TOP_UP_MAX_ROUNDS &&
      countValidPracticeQuizQuestions(practiceQuiz) < PRACTICE_QUIZ_QUESTION_TARGET
    ) {
      topUps++;
      const missing =
        PRACTICE_QUIZ_QUESTION_TARGET - countValidPracticeQuizQuestions(practiceQuiz);
      const topUpQuizModel = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: getPracticeQuizFragmentSystemPrompt(missing),
      });
      const topUpUserText = buildPracticeQuizFragmentUserMessage({
        examLabel,
        classLabel,
        subjectName,
        topicLabel,
        sheetMarkdownBody: markdown,
        questionCount: missing,
      });
      try {
        const quizRaw = await generateModelText(
          topUpQuizModel,
          topUpUserText,
          QUIZ_GENERATION_CONFIG,
        );
        const extracted = extractPracticeQuizFence(quizRaw);
        quizSlices.push(extracted.practiceQuiz);
        practiceQuiz = mergePracticeQuizDedup(quizSlices);
      } catch {
        /* nouvel essai après échec réseau/API */
      }
    }

    if (countValidPracticeQuizQuestions(practiceQuiz) < PRACTICE_QUIZ_MIN_REQUIRED) {
      return Response.json(
        {
          error:
            "Aucun QCM valide n’a pu être extrait pour cette fiche. Réessaie dans un instant.",
        },
        { status: 502 },
      );
    }

    return Response.json({
      markdown,
      practiceQuiz,
      meta: {
        classLabel,
        subjectName,
        topicLabel,
        exam: classId === "term" ? "bac" : classId === "bts2" ? "bts" : "brevet",
        expertId,
        model: modelName,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Erreur lors de la génération.";
    return Response.json({ error: message }, { status: 502 });
  }
}
