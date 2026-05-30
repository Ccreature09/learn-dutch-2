import type { SentenceCategory, Difficulty } from "@/lib/grammar/types";
import { validateSentence } from "@/lib/grammar/engine";
import {
  generateErrorExercises,
  type ProceduralErrorExercise,
  type ErrorType,
} from "@/lib/modules/procedural-generator";

// ─────────────────────────────────────────────────────────────
// Module 5 — Error Correction (Procedural / Infinite)
//
// All exercises are generated procedurally from the verb and
// vocabulary databases. No fixed exercise list.
// Evaluation: rule-based (not string matching).
// ─────────────────────────────────────────────────────────────

// Re-export ProceduralErrorExercise as the exercise type used by the UI
export type ErrorCorrectionExercise = ProceduralErrorExercise;

export interface CorrectionAttempt {
  exerciseId: string;
  userAnswer: string;
  isCorrect: boolean;
  isAcceptableVariant: boolean;
  feedback: string;
  ruleExplanation: string;
  correctAnswer: string;
  naturalScore: number;
}

export function getExercises(options: {
  category?: SentenceCategory;
  difficulty?: Difficulty;
  count?: number;
  excludeIds?: string[];
}): ErrorCorrectionExercise[] {
  const { difficulty, count = 5 } = options;
  return generateErrorExercises(count, { difficulty });
}

export function evaluateCorrection(
  exercise: ErrorCorrectionExercise,
  userAnswer: string,
): CorrectionAttempt {
  const cleaned = userAnswer.trim();
  const normalise = (s: string) =>
    s.trim().replace(/[.!?]+$/, "").toLowerCase().replace(/\s+/g, " ");

  const normUser = normalise(cleaned);
  const normCorrect = normalise(exercise.correctSentence);
  const normVariants = exercise.acceptableVariants.map(normalise);

  const exactMatch = normUser === normCorrect;
  const variantMatch = normVariants.includes(normUser);

  if (exactMatch || variantMatch) {
    return {
      exerciseId: exercise.id,
      userAnswer: cleaned,
      isCorrect: true,
      isAcceptableVariant: variantMatch && !exactMatch,
      feedback: variantMatch && !exactMatch ? "Correct! Acceptable variant." : "Correct! Well done.",
      ruleExplanation: exercise.explanation,
      correctAnswer: exercise.correctSentence,
      naturalScore: 100,
    };
  }

  // Grammar-based fallback: accept any grammatically valid Dutch sentence
  const grammarResult = validateSentence(cleaned);

  if (grammarResult.overallStatus === "correct" && grammarResult.naturalScore >= 80) {
    return {
      exerciseId: exercise.id,
      userAnswer: cleaned,
      isCorrect: true,
      isAcceptableVariant: true,
      feedback:
        "Grammatically correct! Your sentence differs from the model answer but follows Dutch grammar rules.",
      ruleExplanation: exercise.explanation,
      correctAnswer: exercise.correctSentence,
      naturalScore: grammarResult.naturalScore,
    };
  }

  const failures = grammarResult.ruleResults.filter((r) => r.status === "fail");
  const primaryFailure = failures[0];

  return {
    exerciseId: exercise.id,
    userAnswer: cleaned,
    isCorrect: false,
    isAcceptableVariant: false,
    feedback: primaryFailure
      ? `Not yet correct: ${primaryFailure.message}`
      : "This doesn't match the expected correction. Check the hint and try again.",
    ruleExplanation: exercise.explanation,
    correctAnswer: exercise.correctSentence,
    naturalScore: grammarResult.naturalScore,
  };
}

export const ERROR_TYPE_LABELS: Record<string, string> = {
  wrong_conjugation: "Wrong Conjugation",
  v2_inversion_missing: "Missing Inversion (V2 Rule)",
  separable_not_split: "Separable Verb Not Split",
  wrong_auxiliary: "Wrong Auxiliary (hebben/zijn)",
  subordinate_verb_not_final: "Subordinate Clause Verb Order",
};
