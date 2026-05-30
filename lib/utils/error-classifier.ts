// ─────────────────────────────────────────────────────────────
// Error Classifier — Dutch Learning Platform
//
// Pure functions that map grammar rule failures to high-level
// ErrorCategory values, enabling the learner-store to aggregate
// mistakes by type without duplicating grammar engine logic.
// ─────────────────────────────────────────────────────────────

import type { RuleResult } from "@/lib/grammar/types";

export type ErrorCategory =
  | "v2_word_order"
  | "verb_conjugation"
  | "article"
  | "separable_verb"
  | "preposition"
  | "tense_mismatch"
  | "semantic"
  | "word_omission"
  | "auxiliary";

// Maps grammar engine ruleId → ErrorCategory
const RULE_TO_CATEGORY: Partial<Record<string, ErrorCategory>> = {
  v2:                  "v2_word_order",
  conjugation:         "verb_conjugation",
  inversion:           "v2_word_order",
  sub_verb_final:      "tense_mismatch",
  separable:           "separable_verb",
  modal_infinitive:    "verb_conjugation",
  perfect_word_order:  "tense_mismatch",
  auxiliary:           "auxiliary",
  profession_article:  "article",
};

export const ERROR_CATEGORY_LABELS: Record<ErrorCategory, string> = {
  v2_word_order:    "Word Order (V2)",
  verb_conjugation: "Verb Conjugation",
  article:          "Articles (de/het/een)",
  separable_verb:   "Separable Verbs",
  preposition:      "Prepositions",
  tense_mismatch:   "Tense & Clause Order",
  semantic:         "Word Choice / Meaning",
  word_omission:    "Missing Words",
  auxiliary:        "Auxiliary (hebben/zijn)",
};

export const ERROR_CATEGORY_EMOJI: Record<ErrorCategory, string> = {
  v2_word_order:    "🔀",
  verb_conjugation: "🔤",
  article:          "📝",
  separable_verb:   "✂️",
  preposition:      "📍",
  tense_mismatch:   "⏰",
  semantic:         "💬",
  word_omission:    "❌",
  auxiliary:        "🔧",
};

/**
 * Map failing grammar rule results to distinct ErrorCategory values.
 * Returns empty array when there are no failures (meaning the error
 * is semantic, not grammatical — callers handle that case).
 */
export function classifyRuleFailures(ruleResults: RuleResult[]): ErrorCategory[] {
  const categories = new Set<ErrorCategory>();
  for (const r of ruleResults) {
    if (r.status === "fail") {
      const cat = RULE_TO_CATEGORY[r.ruleId];
      if (cat) categories.add(cat);
    }
  }
  return [...categories];
}

/**
 * Map an ErrorCorrectionExercise's errorType to an ErrorCategory.
 * errorType values come from lib/grammar/types.ts → ErrorType.
 */
export function classifyExerciseErrorType(errorType: string): ErrorCategory {
  switch (errorType) {
    case "wrong_conjugation":       return "verb_conjugation";
    case "wrong_word_order":        return "v2_word_order";
    case "wrong_verb_position":     return "v2_word_order";
    case "separable_verb_error":    return "separable_verb";
    case "subordinate_clause_error":return "tense_mismatch";
    case "missing_word":            return "word_omission";
    case "extra_word":              return "word_omission";
    case "wrong_word":              return "semantic";
    default:                        return "semantic";
  }
}
