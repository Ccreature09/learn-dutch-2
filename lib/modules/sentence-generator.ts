import type { GeneratedSentence, SentenceCategory, Difficulty } from "@/lib/grammar/types";
import { validateSentence } from "@/lib/grammar/engine";
import { getRelevantGrammarNotes } from "@/lib/grammar/rules/catalog";
import { generateSentences as generateProceduralSentences } from "@/lib/modules/procedural-generator";

// ─────────────────────────────────────────────────────────────
// Module 1 — Sentence Generator
//
// Generates grammatically correct Dutch sentences.
// Returns structured output with alternatives and grammar notes.
// Does NOT rely on a fixed answer bank — uses templates with
// rule-compliant variants.
// ─────────────────────────────────────────────────────────────

export interface GeneratorOptions {
  category?: SentenceCategory;
  difficulty?: Difficulty;
  count?: number;
  excludeIds?: string[];
}

export function generateSentences(options: GeneratorOptions = {}): GeneratedSentence[] {
  const { category, difficulty, count = 1 } = options;

  return generateProceduralSentences(count, { category, difficulty }).map((sentence) => {
    const validation = validateSentence(sentence.dutch);

    return {
      dutch: sentence.dutch,
      english: sentence.english,
      structureLabel: sentence.structureLabel,
      category: sentence.category,
      difficulty: sentence.difficulty,
      grammaticalNotes: getRelevantGrammarNotes(validation.ruleResults),
      alternatives: [],
    };
  });
}

export function generateByStructure(structureCode: string): GeneratedSentence | null {
  return generateSentences({ count: 12 }).find((sentence) => sentence.structureLabel.includes(structureCode)) ?? null;
}

export function getAvailableCategories(): SentenceCategory[] {
  return [
    "basic",
    "modal_verbs",
    "simple_past",
    "perfect_tense",
    "zijn_hebben",
    "complex",
    "questions",
    "subordinate_clauses",
    "separable_verbs",
    "relative_clauses",
    "conditional",
    "passive_voice",
    "advanced",
  ];
}

export const CATEGORY_LABELS: Record<SentenceCategory, string> = {
  basic: "Basic Sentences",
  modal_verbs: "Modal Verbs",
  simple_past: "Simple Past",
  perfect_tense: "Perfect Tense",
  zijn_hebben: "Zijn & Hebben",
  complex: "Complex Sentences",
  questions: "Questions",
  subordinate_clauses: "Subordinate Clauses",
  separable_verbs: "Separable Verbs",
  relative_clauses: "Relative Clauses",
  conditional: "Conditional",
  passive_voice: "Passive Voice",
  advanced: "Advanced",
};

export const CATEGORY_DESCRIPTIONS: Record<SentenceCategory, string> = {
  basic: "Fundamental SVO patterns and everyday sentences.",
  modal_verbs: "Sentences with kunnen, willen, moeten, mogen, zullen.",
  simple_past: "The imperfectum — past tense of weak and strong verbs.",
  perfect_tense: "Voltooid tegenwoordige tijd — hebben/zijn + past participle.",
  zijn_hebben: "Using zijn (to be) and hebben (to have) correctly.",
  complex: "Sentences with multiple clauses and structures.",
  questions: "Polar (yes/no) and WH-questions with inversion.",
  subordinate_clauses: "Clauses with dat, omdat, als, wanneer, etc.",
  separable_verbs: "Scheidbare werkwoorden — prefix splitting rules.",
  relative_clauses: "Relative clauses with die and dat (who/that/which).",
  conditional: "Conditional sentences with als + verb-final + V2 inversion.",
  passive_voice: "Passive voice with worden + past participle.",
  advanced: "Complex grammar combining multiple rules.",
};
