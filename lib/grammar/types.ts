// ─────────────────────────────────────────────────────────────
// Core Grammar Types — Dutch Learning Platform
// All validation is rule-based, never string-comparison.
// ─────────────────────────────────────────────────────────────

export type PartOfSpeech =
  | "verb"
  | "noun"
  | "adjective"
  | "adverb"
  | "pronoun"
  | "preposition"
  | "conjunction"
  | "article"
  | "particle"
  | "numeral"
  | "punctuation"
  | "unknown";

export type GrammaticalRole =
  | "subject"
  | "finite_verb"
  | "auxiliary_verb"
  | "modal_verb"
  | "infinitive"
  | "past_participle"
  | "direct_object"
  | "indirect_object"
  | "complement"
  | "adverbial"
  | "subordinating_conjunction"
  | "coordinating_conjunction"
  | "separable_prefix"
  | "unknown";

export type Tense =
  | "present"
  | "simple_past"
  | "perfect"
  | "pluperfect"
  | "future"
  | "conditional";

export type SentenceType =
  | "main_clause"
  | "subordinate_clause"
  | "polar_question"
  | "wh_question"
  | "imperative"
  | "complex";

export interface Token {
  surface: string;                  // exact word as typed
  lower: string;                    // lowercased
  lemma: string;                    // dictionary form (infinitive for verbs)
  pos: PartOfSpeech;
  role: GrammaticalRole;
  index: number;                    // 0-based position in token list
  isFiniteVerb?: boolean;
  verbForm?: "infinitive" | "finite" | "past_participle" | "present_participle";
  tense?: Tense;
  person?: 1 | 2 | 3;
  number?: "singular" | "plural";
  isSubordinatingConjunction?: boolean;
  isCoordinatingConjunction?: boolean;
  isSeparablePrefix?: boolean;
  separableVerbLemma?: string;      // which separable verb this prefix belongs to
}

export interface ParsedSentence {
  original: string;
  tokens: Token[];
  sentenceType: SentenceType;
  mainClauseTokens: Token[];
  subordinateClauseStart: number | null;  // token index where sub-clause begins
  finiteVerbIndex: number | null;         // in full token list
  subjectIndex: number | null;            // in full token list
  finiteVerbIndexInSubordinate: number | null;
}

export type RuleStatus = "pass" | "warning" | "fail";

export interface RuleResult {
  ruleName: string;
  ruleId: string;
  status: RuleStatus;
  message: string;
  explanation: string;
  correctedSuggestion?: string;
  affectedTokenIndices?: number[];
  priority: 1 | 2 | 3 | 4 | 5;   // 1 = most critical
}

export interface ValidationResult {
  input: string;
  ruleResults: RuleResult[];
  overallStatus: "correct" | "unnatural" | "incorrect";
  naturalScore: number;            // 0–100
  mostNaturalVersion: string;
  alternatives: string[];
  explanation: string;
  parsedSentence: ParsedSentence;
}

export type SentenceCategory =
  | "basic"
  | "modal_verbs"
  | "simple_past"
  | "perfect_tense"
  | "zijn_hebben"
  | "complex"
  | "questions"
  | "subordinate_clauses"
  | "separable_verbs"
  | "relative_clauses"
  | "conditional"
  | "passive_voice"
  | "advanced";

export type Difficulty = "beginner" | "intermediate" | "advanced";

export interface GeneratedSentence {
  dutch: string;
  english: string;
  structureLabel: string;           // e.g. "Subject + Verb + Object (SVO)"
  category: SentenceCategory;
  difficulty: Difficulty;
  grammaticalNotes: string[];
  alternatives: { dutch: string; note: string }[];
}

export interface FlashCard {
  id: string;
  front: string;
  back: string;
  example?: string;
  exampleTranslation?: string;
  category: string;
  tags: string[];
  difficulty: Difficulty;
  timesReviewed: number;
  timesCorrect: number;
  lastReviewed: number | null;
  nextReview: number | null;        // kept for compatibility; scheduling uses reviewInterval
  reviewInterval: number;           // count-based SRS: cards to see before reviewing again
  isUserCreated: boolean;
  verbData?: {
    infinitive: string;
    stem: string;
    presentSg1: string;
    presentSg3: string;
    pastSg: string;
    pastParticiple: string;
    auxiliary: "hebben" | "zijn" | "both";
    separable?: boolean;
    separablePrefix?: string;
  };
}

export interface BuilderWord {
  id: string;
  surface: string;
  lemma: string;
  pos: PartOfSpeech;
  hint?: string;
}

export type ErrorType =
  | "wrong_word_order"
  | "wrong_conjugation"
  | "wrong_word"
  | "missing_word"
  | "extra_word"
  | "wrong_verb_position"
  | "separable_verb_error"
  | "subordinate_clause_error";

export interface ErrorCorrectionExercise {
  id: string;
  errorSentence: string;
  correctSentence: string;
  acceptableVariants: string[];
  errorType: ErrorType;
  errorDescription: string;
  hint: string;
  category: SentenceCategory;
  difficulty: Difficulty;
  explanation: string;
  ruleViolated: string;
}
