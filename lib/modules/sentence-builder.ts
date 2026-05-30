import type { BuilderWord, SentenceCategory, Difficulty } from "@/lib/grammar/types";
import { VOCAB_LOOKUP } from "@/lib/data/vocabulary";
import { VERB_FORM_LOOKUP } from "@/lib/data/verbs";
import { validateSentence } from "@/lib/grammar/engine";
import { getRelevantGrammarNotes } from "@/lib/grammar/rules/catalog";
import { generateSentences as generateProceduralSentences } from "@/lib/modules/procedural-generator";

// ─────────────────────────────────────────────────────────────
// Module 4 — Sentence Builder
//
// Provides scrambled word tiles that the user arranges
// into the correct Dutch sentence. Used with drag-and-drop.
// ─────────────────────────────────────────────────────────────

export interface BuilderExercise {
  id: string;
  englishPrompt: string;
  correctSentence: string;
  acceptableVariants: string[];
  words: BuilderWord[];         // shuffled tiles
  category: SentenceCategory;
  difficulty: Difficulty;
  grammaticalNotes: string[];
  structureHint: string;
}

function tokenizeToBuilderWords(sentence: string): BuilderWord[] {
  const cleaned = sentence.replace(/[.!?,]/g, "").trim();
  const words = cleaned.split(/\s+/);

  return words.map((surface, i) => {
    const lower = surface.toLowerCase();
    const vocabEntry = VOCAB_LOOKUP[lower];
    const verbEntry = VERB_FORM_LOOKUP[lower];

    const pos =
      verbEntry?.verbData
        ? "verb"
        : vocabEntry?.pos ?? "unknown";

    return {
      id: `${lower}-${i}-${Math.random().toString(36).slice(2, 6)}`,
      surface,
      lemma: verbEntry?.infinitive ?? vocabEntry?.dutch ?? lower,
      pos,
      hint: verbEntry
        ? `${verbEntry.verbData.translation} (${verbEntry.form})`
        : vocabEntry?.english ?? undefined,
    };
  });
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function getBuilderExercises(options: {
  category?: SentenceCategory;
  difficulty?: Difficulty;
  count?: number;
  excludeIds?: string[];
}): BuilderExercise[] {
  const { category, difficulty, count = 5 } = options;
  const selected = generateProceduralSentences(count, { category, difficulty });

  return selected.map((sentence, index): BuilderExercise => {
    const words = tokenizeToBuilderWords(sentence.dutch);
    const validation = validateSentence(sentence.dutch);

    return {
      id: `builder-${index}-${sentence.dutch}`,
      englishPrompt: sentence.english,
      correctSentence: sentence.dutch.replace(/[.!?]$/, ""),
      acceptableVariants: [],
      words: shuffle(words),
      category: sentence.category,
      difficulty: sentence.difficulty,
      grammaticalNotes: getRelevantGrammarNotes(validation.ruleResults),
      structureHint: sentence.structureLabel,
    };
  });
}

export function checkBuilderAnswer(
  exercise: BuilderExercise,
  arrangedWords: BuilderWord[]
): {
  isCorrect: boolean;
  isVariant: boolean;
  correctSentence: string;
  feedback: string;
} {
  const userSentence = arrangedWords.map((w) => w.surface).join(" ");
  const normalise = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

  const correct = normalise(userSentence) === normalise(exercise.correctSentence);
  const variant = exercise.acceptableVariants.some(
    (v) => normalise(userSentence) === normalise(v)
  );

  if (correct) {
    return { isCorrect: true, isVariant: false, correctSentence: exercise.correctSentence, feedback: "Perfect! That's the correct word order." };
  }
  if (variant) {
    return { isCorrect: true, isVariant: true, correctSentence: exercise.correctSentence, feedback: "Correct! This is an acceptable alternative word order." };
  }

  return {
    isCorrect: false,
    isVariant: false,
    correctSentence: exercise.correctSentence,
    feedback: "Not quite right. Check the word order and try again.",
  };
}
