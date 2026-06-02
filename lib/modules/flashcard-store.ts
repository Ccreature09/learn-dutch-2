"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { FlashCard, Difficulty } from "@/lib/grammar/types";
import { DUTCH_VERBS } from "@/lib/data/verbs";
import { SENTENCE_TEMPLATES } from "@/lib/data/sentences";
import { DUTCH_VOCABULARY } from "@/lib/data/vocabulary";

// ─────────────────────────────────────────────────────────────
// Module 3 — Flashcard Store (Zustand + localStorage)
//
// SM-2 Spaced Repetition System (SRS).
// Scheduling uses the SM-2 algorithm:
//
//   easeFactor (default 2.5): controls how fast intervals grow.
//   reviewInterval: days before next review.
//   Correct: interval = round(interval * ef), ef = min(2.5, ef + 0.1), cap 365
//   Wrong:   interval = 1, ef = max(1.3, ef - 0.2)
//            card re-inserted near the front of the session queue
// ─────────────────────────────────────────────────────────────

const DEFAULT_INTERVAL = 1;
const DEFAULT_EASE = 2.5;
const WRONG_REINSERT_POS = 5;

function getDifficultyForVocabularyCard(frequency: "high" | "medium" | "low"): Difficulty {
  if (frequency === "high") return "beginner";
  if (frequency === "medium") return "intermediate";
  return "advanced";
}

// ── Build initial deck ────────────────────────────────────────
function buildDefaultCards(): FlashCard[] {
  const cards: FlashCard[] = [];

  // Verb cards
  for (const verb of DUTCH_VERBS) {
    cards.push({
      id: `verb-${verb.infinitive}`,
      front: verb.infinitive,
      back: verb.translation,
      example: `Ik ${verb.presentSg1}.`,
      exampleTranslation: `I ${verb.translation.replace("to ", "")}.`,
      category: "verbs",
      tags: [verb.type, verb.auxiliary, ...verb.category],
      difficulty: verb.difficulty,
      timesReviewed: 0,
      timesCorrect: 0,
      lastReviewed: null,
      nextReview: null,
      reviewInterval: DEFAULT_INTERVAL,
      easeFactor: DEFAULT_EASE,
      isUserCreated: false,
      verbData: {
        infinitive: verb.infinitive,
        stem: verb.stem,
        presentSg1: verb.presentSg1,
        presentSg3: verb.presentSg3,
        pastSg: verb.pastSg,
        pastParticiple: verb.pastParticiple,
        auxiliary: verb.auxiliary === "both" ? "both" : verb.auxiliary,
        separable: verb.separable,
        separablePrefix: verb.separablePrefix,
      },
    });
  }

  // B10 fix: dedup on dutch word alone (first occurrence wins — typically highest frequency)
  const seenVocabIds = new Set<string>();
  for (const word of DUTCH_VOCABULARY) {
    if (word.pos === "article" || word.isObjectPronoun) {
      continue;
    }

    const dedupKey = word.dutch;
    if (seenVocabIds.has(dedupKey)) continue;
    seenVocabIds.add(dedupKey);

    const id = `vocab-${word.dutch}-${word.pos}-${word.english}`;
    const difficulty = getDifficultyForVocabularyCard(word.frequency);
    // Show article on the front for nouns so learners see "de man" / "het huis"
    const front = word.pos === "noun" && word.gender
      ? `${word.gender} ${word.dutch}`
      : word.dutch;
    cards.push({
      id,
      front,
      back: word.english,
      category: word.pos,
      tags: [word.pos, difficulty, ...(word.category ?? [])],
      difficulty,
      timesReviewed: 0,
      timesCorrect: 0,
      lastReviewed: null,
      nextReview: null,
      reviewInterval: DEFAULT_INTERVAL,
      easeFactor: DEFAULT_EASE,
      isUserCreated: false,
    });
  }

  // Sentence cards
  for (const template of SENTENCE_TEMPLATES) {
    cards.push({
      id: `sent-${template.id}`,
      front: template.english,
      back: template.dutch,
      category: "sentences",
      tags: [template.category, template.difficulty],
      difficulty: template.difficulty,
      timesReviewed: 0,
      timesCorrect: 0,
      lastReviewed: null,
      nextReview: null,
      reviewInterval: DEFAULT_INTERVAL,
      easeFactor: DEFAULT_EASE,
      isUserCreated: false,
    });
  }

  return cards;
}

// ── Zustand Store ─────────────────────────────────────────────

// Shape of what we actually write to localStorage.
// We intentionally do NOT persist the full cards array — the deck is
// always rebuilt from DUTCH_VERBS + DUTCH_VOCABULARY on startup so
// vocabulary additions appear automatically without any migration work.
type PersistedSRS = {
  srs: Record<string, {
    timesReviewed: number;
    timesCorrect: number;
    reviewInterval: number;
    lastReviewed: number | null;
    easeFactor: number;
  }>;
  cycleCount: number;
};

interface FlashcardState {
  cards: FlashCard[];

  // Session (not persisted — rebuilt each startSession call)
  sessionQueue: string[];
  sessionDone: string[];
  sessionTotal: number;
  cycleCount: number;

  addCard: (
    card: Omit<FlashCard, "id" | "timesReviewed" | "timesCorrect" | "lastReviewed" | "nextReview" | "reviewInterval" | "easeFactor">,
  ) => void;
  removeCard: (id: string) => void;
  reviewCard: (id: string, correct: boolean) => void;
  startSession: (count?: number, difficulty?: Difficulty, category?: string) => void;
  endSession: () => void;
  resetCard: (id: string) => void;
  resetAll: () => void;
  getCardById: (id: string) => FlashCard | undefined;
  getCardsByCategory: (category: string) => FlashCard[];
  currentCard: () => FlashCard | undefined;
  sessionProgress: () => { done: number; total: number; remaining: number };
}

export const useFlashcardStore = create<FlashcardState>()(
  persist(
    (set, get) => ({
      cards: buildDefaultCards(),
      sessionQueue: [],
      sessionDone: [],
      sessionTotal: 0,
      cycleCount: 0,

      addCard: (cardData) => {
        const id = `user-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const newCard: FlashCard = {
          ...cardData,
          id,
          timesReviewed: 0,
          timesCorrect: 0,
          lastReviewed: null,
          nextReview: null,
          reviewInterval: DEFAULT_INTERVAL,
          easeFactor: DEFAULT_EASE,
          isUserCreated: true,
        };
        set((s) => ({ cards: [...s.cards, newCard] }));
      },

      removeCard: (id) => {
        set((s) => ({
          cards: s.cards.filter((c) => c.id !== id),
          sessionQueue: s.sessionQueue.filter((qid) => qid !== id),
          sessionDone: s.sessionDone.filter((did) => did !== id),
        }));
      },

      reviewCard: (id, correct) => {
        set((s) => {
          // F1: SM-2 algorithm
          const cards = s.cards.map((c) => {
            if (c.id !== id) return c;
            const ef = c.easeFactor ?? DEFAULT_EASE;
            const newEf = correct
              ? Math.min(2.5, ef + 0.1)
              : Math.max(1.3, ef - 0.2);
            // SM-2: first correct → 4 days; subsequent → interval × EF (cap 365)
            const newInterval = correct
              ? c.timesCorrect === 0
                ? 4
                : Math.min(Math.round(c.reviewInterval * ef), 365)
              : 1;
            return {
              ...c,
              timesReviewed: c.timesReviewed + 1,
              timesCorrect: correct ? c.timesCorrect + 1 : c.timesCorrect,
              lastReviewed: Date.now(),
              reviewInterval: newInterval,
              easeFactor: newEf,
            };
          });

          const queue = [...s.sessionQueue];
          const done = [...s.sessionDone];

          if (correct) {
            done.push(queue.shift() ?? id);
          } else {
            queue.shift();
            const pos = Math.min(WRONG_REINSERT_POS, queue.length);
            queue.splice(pos, 0, id);
          }

          // B9: Infinite mode — when the queue empties, shuffle the done pile back in
          // and increment cycleCount in the store (not component state).
          if (queue.length === 0 && done.length > 0) {
            const recycled = [...done];
            for (let i = recycled.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [recycled[i], recycled[j]] = [recycled[j], recycled[i]];
            }
            return { cards, sessionQueue: recycled, sessionDone: [], sessionTotal: recycled.length, cycleCount: s.cycleCount + 1 };
          }

          return { cards, sessionQueue: queue, sessionDone: done };
        });
      },

      startSession: (count, difficulty, category) => {
        const { cards } = get();
        let pool = [...cards];
        if (difficulty) pool = pool.filter((c) => c.difficulty === difficulty);
        if (category === "__mine__") pool = pool.filter((c) => c.isUserCreated);
        else if (category) pool = pool.filter((c) => c.category === category);

        // New cards first, then least-accurate
        pool.sort((a, b) => {
          if (a.timesReviewed === 0 && b.timesReviewed !== 0) return -1;
          if (b.timesReviewed === 0 && a.timesReviewed !== 0) return 1;
          const aRate = a.timesReviewed > 0 ? a.timesCorrect / a.timesReviewed : 0;
          const bRate = b.timesReviewed > 0 ? b.timesCorrect / b.timesReviewed : 0;
          return aRate - bRate;
        });

        // Use all available cards in the pool (count param ignored)
        const selected = pool;
        // Shuffle selected cards
        for (let i = selected.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [selected[i], selected[j]] = [selected[j], selected[i]];
        }

        const queue = selected.map((c) => c.id);
        set({ sessionQueue: queue, sessionDone: [], sessionTotal: queue.length });
      },

      endSession: () => {
        set({ sessionQueue: [], sessionDone: [], sessionTotal: 0 });
      },

      resetCard: (id) => {
        set((s) => ({
          cards: s.cards.map((c) =>
            c.id === id
              ? {
                  ...c,
                  timesReviewed: 0,
                  timesCorrect: 0,
                  lastReviewed: null,
                  nextReview: null,
                  reviewInterval: DEFAULT_INTERVAL,
                  easeFactor: DEFAULT_EASE,
                }
              : c,
          ),
        }));
      },

      resetAll: () => {
        set({ cards: buildDefaultCards(), sessionQueue: [], sessionDone: [], sessionTotal: 0, cycleCount: 0 });
      },

      getCardById: (id) => get().cards.find((c) => c.id === id),

      getCardsByCategory: (category) => get().cards.filter((c) => c.category === category),

      currentCard: () => {
        const { cards, sessionQueue } = get();
        return sessionQueue.length ? cards.find((c) => c.id === sessionQueue[0]) : undefined;
      },

      sessionProgress: () => {
        const { sessionQueue, sessionDone, sessionTotal } = get();
        return {
          done: sessionDone.length,
          total: sessionTotal,
          remaining: sessionQueue.length,
        };
      },
    }),
    {
      // Key bumped to v4 — clears the old full-cards snapshot from localStorage.
      // Going forward only SRS progress is persisted; the deck is rebuilt from
      // source on every load and the saved progress is merged back in.
      name: "dutch-flashcards-v4",
      partialize: (s): PersistedSRS => ({
        srs: Object.fromEntries(
          s.cards.map((c) => [
            c.id,
            {
              timesReviewed: c.timesReviewed,
              timesCorrect:  c.timesCorrect,
              reviewInterval: c.reviewInterval,
              lastReviewed:  c.lastReviewed,
              easeFactor:    c.easeFactor ?? DEFAULT_EASE,
            },
          ])
        ),
        cycleCount: s.cycleCount,
      }),
      merge: (persisted, current) => {
        const p = (persisted as PersistedSRS | null);
        const srs = p?.srs ?? {};
        const cards = buildDefaultCards().map((c) => {
          const saved = srs[c.id];
          if (!saved) return c;
          return { ...c, ...saved, easeFactor: saved.easeFactor ?? DEFAULT_EASE };
        });
        return { ...(current as FlashcardState), cards, cycleCount: p?.cycleCount ?? 0 };
      },
    },
  ),
);
