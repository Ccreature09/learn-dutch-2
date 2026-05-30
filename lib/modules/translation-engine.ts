// ─────────────────────────────────────────────────────────────
// Module 2 — Translation Engine
//
// Bidirectional EN ↔ NL translation.
// Rule-based — no external API. Uses the sentence database and
// structural transformation rules to produce translations.
// Always returns multiple valid outputs + most natural version.
// ─────────────────────────────────────────────────────────────

import { SENTENCE_TEMPLATES } from "@/lib/data/sentences";
import { VOCAB_LOOKUP } from "@/lib/data/vocabulary";
import { VERB_FORM_LOOKUP } from "@/lib/data/verbs";

export interface TranslationResult {
  input: string;
  direction: "en_to_nl" | "nl_to_en";
  mostNatural: string;
  alternatives: { text: string; note: string }[];
  confidence: "high" | "medium" | "low";
  grammarNotes: string[];
  wordGloss: { word: string; translation: string }[];
}

// ── English → Dutch ───────────────────────────────────────────

export function translateEnToDutch(english: string): TranslationResult {
  const normalised = english.trim().toLowerCase().replace(/[.!?]+$/, "");

  // 1. Direct database lookup (highest confidence)
  const exactMatch = SENTENCE_TEMPLATES.find(
    (s) => s.english.toLowerCase().replace(/[.!?]+$/, "") === normalised
  );

  if (exactMatch) {
    return {
      input: english,
      direction: "en_to_nl",
      mostNatural: exactMatch.dutch,
      alternatives: exactMatch.alternatives.map((a) => ({ text: a.dutch, note: a.note })),
      confidence: "high",
      grammarNotes: exactMatch.grammaticalNotes,
      wordGloss: buildWordGloss(exactMatch.dutch),
    };
  }

  // 2. Partial / fuzzy match — find sentences with overlapping keywords
  const keywords = normalised.split(" ").filter((w) => w.length > 3);
  const fuzzyMatches = SENTENCE_TEMPLATES.filter((s) => {
    const eng = s.english.toLowerCase();
    return keywords.some((kw) => eng.includes(kw));
  });

  if (fuzzyMatches.length > 0) {
    const best = fuzzyMatches[0];
    return {
      input: english,
      direction: "en_to_nl",
      mostNatural: best.dutch,
      alternatives: [
        ...best.alternatives.map((a) => ({ text: a.dutch, note: a.note })),
        ...fuzzyMatches
          .slice(1, 3)
          .map((s) => ({ text: s.dutch, note: "Similar sentence structure" })),
      ],
      confidence: "medium",
      grammarNotes: [
        "This is a similar but not exact match. Verify the translation fits your context.",
        ...best.grammaticalNotes,
      ],
      wordGloss: buildWordGloss(best.dutch),
    };
  }

  // 3. Word-by-word gloss as fallback
  const gloss = buildEnglishToNLGloss(english);
  return {
    input: english,
    direction: "en_to_nl",
    mostNatural: gloss.sentence,
    alternatives: [],
    confidence: "low",
    grammarNotes: [
      "This sentence was not found in the database — a word-by-word gloss is provided.",
      "Dutch word order may need adjustment (V2 rule applies).",
    ],
    wordGloss: gloss.gloss,
  };
}

// ── Dutch → English ───────────────────────────────────────────

export function translateNlToEnglish(dutch: string): TranslationResult {
  const normalised = dutch.trim().toLowerCase().replace(/[.!?]+$/, "");

  // 1. Exact match
  const exactMatch = SENTENCE_TEMPLATES.find(
    (s) => s.dutch.toLowerCase().replace(/[.!?]+$/, "") === normalised
  );

  if (exactMatch) {
    return {
      input: dutch,
      direction: "nl_to_en",
      mostNatural: exactMatch.english,
      alternatives: exactMatch.alternatives.map((a) => ({
        text: a.dutch,
        note: `Dutch variant: ${a.note}`,
      })),
      confidence: "high",
      grammarNotes: exactMatch.grammaticalNotes,
      wordGloss: buildWordGloss(dutch),
    };
  }

  // 2. Word-by-word Dutch → English gloss
  const gloss = buildDutchToEnglishGloss(dutch);
  return {
    input: dutch,
    direction: "nl_to_en",
    mostNatural: gloss.sentence,
    alternatives: [],
    confidence: "medium",
    grammarNotes: [
      "Word-by-word translation provided. Some Dutch structures don't translate directly.",
    ],
    wordGloss: gloss.gloss,
  };
}

// ── Word Gloss Builders ───────────────────────────────────────

function buildWordGloss(dutch: string): { word: string; translation: string }[] {
  const words = dutch.replace(/[.!?,]/g, "").split(/\s+/);
  return words.map((word) => {
    const lower = word.toLowerCase();
    const vocabEntry = VOCAB_LOOKUP[lower];
    if (vocabEntry) {
      return { word, translation: vocabEntry.english };
    }
    const verbEntry = VERB_FORM_LOOKUP[lower];
    if (verbEntry) {
      return { word, translation: verbEntry.verbData.translation };
    }
    return { word, translation: "?" };
  });
}

function buildEnglishToNLGloss(english: string): {
  sentence: string;
  gloss: { word: string; translation: string }[];
} {
  // Simple word lookup — build reverse vocab map
  const reverseVocab: Record<string, string> = {};
  Object.entries(VOCAB_LOOKUP).forEach(([dutch, entry]) => {
    const engWords = entry.english.toLowerCase().split(" / ");
    engWords.forEach((e) => {
      reverseVocab[e.trim()] = dutch;
    });
  });

  const words = english.replace(/[.!?,]/g, "").split(/\s+/);
  const gloss = words.map((word) => {
    const lower = word.toLowerCase();
    const skip = ["a", "an", "the", "is", "are", "i", "to"];
    if (skip.includes(lower)) return { word, translation: "—" };
    const translation = reverseVocab[lower] ?? "?";
    return { word, translation };
  });

  const sentence = gloss
    .filter((g) => g.translation !== "—" && g.translation !== "?")
    .map((g) => g.translation)
    .join(" ");

  return { sentence: sentence || english, gloss };
}

function buildDutchToEnglishGloss(dutch: string): {
  sentence: string;
  gloss: { word: string; translation: string }[];
} {
  const words = dutch.replace(/[.!?,]/g, "").split(/\s+/);
  const gloss = words.map((word) => {
    const lower = word.toLowerCase();
    const vocabEntry = VOCAB_LOOKUP[lower];
    if (vocabEntry) return { word, translation: vocabEntry.english };
    const verbEntry = VERB_FORM_LOOKUP[lower];
    if (verbEntry) return { word, translation: verbEntry.verbData.translation };
    return { word, translation: word };
  });

  const sentence = gloss.map((g) => g.translation).join(" ");
  return { sentence, gloss };
}

// ── Auto-detect language ──────────────────────────────────────

export function autoDetectAndTranslate(input: string): TranslationResult {
  // Simple heuristic: if it contains common Dutch words → translate to English
  const words = input.toLowerCase().split(/\s+/);
  const dutchMarkers = ["ik", "jij", "hij", "zij", "wij", "de", "het", "een", "van", "naar", "omdat", "dat", "zijn", "hebben"];
  const dutchCount = words.filter((w) => dutchMarkers.includes(w)).length;

  if (dutchCount >= 2) {
    return translateNlToEnglish(input);
  }
  return translateEnToDutch(input);
}
