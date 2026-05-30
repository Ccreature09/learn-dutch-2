import { DUTCH_VERBS } from "@/lib/data/verbs";
import { DUTCH_VOCABULARY } from "@/lib/data/vocabulary";
import type { Difficulty } from "@/lib/grammar/types";

// ─────────────────────────────────────────────────────────────
// Module 6 — Vocabulary System
//
// Unified, searchable dictionary combining the verb database
// and vocabulary database into a single queryable interface.
// ─────────────────────────────────────────────────────────────

export interface DictionaryEntry {
  id: string;
  dutch: string;
  english: string;
  pos: string;
  difficulty: Difficulty;
  frequency: "high" | "medium" | "low";
  category: string[];
  isVerb: boolean;
  gender?: "de" | "het";
  // Verb-specific
  verbData?: {
    stem: string;
    type: string;
    separable: boolean;
    separablePrefix?: string;
    auxiliary: string;
    presentSg1: string;
    presentSg2: string;
    presentSg2Inv: string;
    presentSg3: string;
    presentPl: string;
    pastSg: string;
    pastPl: string;
    pastParticiple: string;
    isModal: boolean;
  };
}

// ── Skip low-value function words in the dictionary ───────────
const SKIP_POS = new Set(["article"]);

function buildDictionary(): DictionaryEntry[] {
  const entries: DictionaryEntry[] = [];

  // Verbs
  for (const verb of DUTCH_VERBS) {
    entries.push({
      id: `verb-${verb.infinitive}`,
      dutch: verb.infinitive,
      english: verb.translation,
      pos: "verb",
      difficulty: verb.difficulty,
      frequency: verb.frequency,
      category: verb.category,
      isVerb: true,
      verbData: {
        stem: verb.stem,
        type: verb.type,
        separable: verb.separable,
        separablePrefix: verb.separablePrefix,
        auxiliary: verb.auxiliary,
        presentSg1: verb.presentSg1,
        presentSg2: verb.presentSg2,
        presentSg2Inv: verb.presentSg2Inv,
        presentSg3: verb.presentSg3,
        presentPl: verb.presentPl,
        pastSg: verb.pastSg,
        pastPl: verb.pastPl,
        pastParticiple: verb.pastParticiple,
        isModal: verb.isModal,
      },
    });
  }

  // Non-verb vocabulary (skip object pronouns and articles)
  for (const word of DUTCH_VOCABULARY) {
    if (SKIP_POS.has(word.pos)) continue;
    if (word.isObjectPronoun) continue;

    entries.push({
      id: `vocab-${word.dutch}-${word.pos}-${word.english}`,
      dutch: word.dutch,
      english: word.english,
      pos: word.pos,
      difficulty: "beginner",
      frequency: word.frequency,
      category: word.category ?? [],
      isVerb: false,
      gender: word.gender,
    });
  }

  return entries;
}

// Singleton — built once, reused across calls
const DICTIONARY: DictionaryEntry[] = buildDictionary();

// ─────────────────────────────────────────────────────────────
// Search & filter
// ─────────────────────────────────────────────────────────────

export interface VocabFilters {
  pos?: string;
  difficulty?: Difficulty;
  frequency?: "high" | "medium" | "low";
  category?: string;
  verbType?: string;
  separableOnly?: boolean;
}

export function searchDictionary(
  query: string,
  filters?: VocabFilters,
  maxResults = 60,
): DictionaryEntry[] {
  const q = query.trim().toLowerCase();

  let results = DICTIONARY;

  // Text search
  if (q) {
    results = results.filter(
      (e) =>
        e.dutch.toLowerCase().includes(q) ||
        e.english.toLowerCase().includes(q) ||
        e.category.some((c) => c.toLowerCase().includes(q)),
    );
  }

  // Filters
  if (filters) {
    if (filters.pos) results = results.filter((e) => e.pos === filters.pos);
    if (filters.difficulty) results = results.filter((e) => e.difficulty === filters.difficulty);
    if (filters.frequency) results = results.filter((e) => e.frequency === filters.frequency);
    if (filters.category) {
      results = results.filter((e) => e.category.includes(filters.category!));
    }
    if (filters.separableOnly) {
      results = results.filter((e) => e.isVerb && e.verbData?.separable);
    }
    if (filters.verbType) {
      results = results.filter((e) => e.isVerb && e.verbData?.type === filters.verbType);
    }
  }

  // Sort: exact match → frequency → alphabetical
  const freqRank: Record<string, number> = { high: 0, medium: 1, low: 2 };
  results.sort((a, b) => {
    const aExact = a.dutch.toLowerCase() === q || a.english.toLowerCase() === q ? 0 : 1;
    const bExact = b.dutch.toLowerCase() === q || b.english.toLowerCase() === q ? 0 : 1;
    if (aExact !== bExact) return aExact - bExact;
    const fd = freqRank[a.frequency] - freqRank[b.frequency];
    if (fd !== 0) return fd;
    return a.dutch.localeCompare(b.dutch);
  });

  return results.slice(0, maxResults);
}

export function getDictionaryEntry(dutch: string): DictionaryEntry | undefined {
  return DICTIONARY.find((e) => e.dutch.toLowerCase() === dutch.toLowerCase());
}

export function getVocabStats() {
  return {
    total: DICTIONARY.length,
    verbs: DICTIONARY.filter((e) => e.isVerb).length,
    nouns: DICTIONARY.filter((e) => e.pos === "noun").length,
    adjectives: DICTIONARY.filter((e) => e.pos === "adjective").length,
    adverbs: DICTIONARY.filter((e) => e.pos === "adverb").length,
    pronouns: DICTIONARY.filter((e) => e.pos === "pronoun").length,
    other: DICTIONARY.filter(
      (e) => !["verb", "noun", "adjective", "adverb", "pronoun"].includes(e.pos),
    ).length,
  };
}

export function getAllCategories(): string[] {
  const cats = new Set<string>();
  for (const e of DICTIONARY) for (const c of e.category) cats.add(c);
  return Array.from(cats).sort();
}
