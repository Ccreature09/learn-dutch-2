// ─────────────────────────────────────────────────────────────
// Exercise Service
//
// Unified facade for all exercise generation in the app.
// New features should call this layer rather than individual
// generator modules directly.
//
// Current modules wrapped:
//   • sentence-generator  (infinite sentence generation)
//   • procedural-generator (error correction exercises)
//   • flashcard-store      (SRS flashcards — consumed separately via Zustand)
// ─────────────────────────────────────────────────────────────

import {
  generateSentences,
  getAvailableCategories,
  CATEGORY_LABELS,
  CATEGORY_DESCRIPTIONS,
  type GeneratorOptions,
} from "@/lib/modules/sentence-generator";

import {
  generateErrorExercises,
  type GenerationOptions as ProceduralOptions,
  type ProceduralErrorExercise,
  type SentencePattern,
} from "@/lib/modules/procedural-generator";

import type { GeneratedSentence, SentenceCategory, Difficulty } from "@/lib/grammar/types";

// ── Re-export types for consumer convenience ─────────────────
export type { GeneratedSentence, SentenceCategory, Difficulty };
export type { ProceduralErrorExercise, SentencePattern };
export { CATEGORY_LABELS, CATEGORY_DESCRIPTIONS };

// ── Sentence Exercise ─────────────────────────────────────────

export interface SentenceExerciseOptions {
  category?: SentenceCategory;
  difficulty?: Difficulty;
  count?: number;
}

/**
 * Generate `count` sentence exercises for the given category / difficulty.
 * Each result includes Dutch, English, structural label and grammar notes.
 */
export function getSentenceExercises(
  options: SentenceExerciseOptions = {},
): GeneratedSentence[] {
  return generateSentences(options as GeneratorOptions);
}

/** List all available sentence categories with their human-readable labels. */
export function getCategories(): Array<{
  id: SentenceCategory;
  label: string;
  description: string;
}> {
  return getAvailableCategories().map((id) => ({
    id,
    label: CATEGORY_LABELS[id],
    description: CATEGORY_DESCRIPTIONS[id],
  }));
}

// ── Error Correction Exercise ─────────────────────────────────

export interface ErrorExerciseOptions {
  category?: SentenceCategory;
  difficulty?: Difficulty;
  count?: number;
}

/**
 * Generate `count` error-correction exercises.
 * Each result contains an erroneous Dutch sentence and the correct form.
 */
export function getErrorExercises(
  options: ErrorExerciseOptions = {},
): ProceduralErrorExercise[] {
  const { count = 5, ...rest } = options;
  return generateErrorExercises(count, rest as ProceduralOptions);
}
