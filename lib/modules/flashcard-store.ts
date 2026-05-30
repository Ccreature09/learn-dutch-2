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
// Count-based Spaced Repetition System (SRS).
// Scheduling is driven by card counts, not timestamps:
//
//   reviewInterval (default 5): how many other cards to see
//                               before this card appears again.
//   Correct: interval = min(interval * 2, 100)
//   Wrong:   interval = max(2, floor(interval / 2))
//            card re-inserted near the front of the session queue
// ─────────────────────────────────────────────────────────────

const DEFAULT_INTERVAL = 5;
const MAX_INTERVAL = 100;
const MIN_INTERVAL = 2;
const WRONG_REINSERT_POS = 3;

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

  for (const word of DUTCH_VOCABULARY) {
    if (word.pos === "article" || word.isObjectPronoun || word.frequency === "low") {
      continue;
    }

    const difficulty = getDifficultyForVocabularyCard(word.frequency);
    cards.push({
      id: `vocab-${word.dutch}-${word.pos}-${word.english}`,
      front: word.dutch,
      back: word.english,
      category: word.pos,
      tags: [word.pos, difficulty, ...(word.category ?? [])],
      difficulty,
      timesReviewed: 0,
      timesCorrect: 0,
      lastReviewed: null,
      nextReview: null,
      reviewInterval: DEFAULT_INTERVAL,
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
      isUserCreated: false,
    });
  }

  return cards;
}

// ── Zustand Store ─────────────────────────────────────────────

interface FlashcardState {
  cards: FlashCard[];

  // Session (not persisted — rebuilt each startSession call)
  sessionQueue: string[];
  sessionDone: string[];
  sessionTotal: number;

  addCard: (
    card: Omit<FlashCard, "id" | "timesReviewed" | "timesCorrect" | "lastReviewed" | "nextReview" | "reviewInterval">,
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
          const cards = s.cards.map((c) => {
            if (c.id !== id) return c;
            const newInterval = correct
              ? Math.min(c.reviewInterval * 2, MAX_INTERVAL)
              : Math.max(MIN_INTERVAL, Math.floor(c.reviewInterval / 2));
            return {
              ...c,
              timesReviewed: c.timesReviewed + 1,
              timesCorrect: correct ? c.timesCorrect + 1 : c.timesCorrect,
              lastReviewed: Date.now(),
              reviewInterval: newInterval,
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

          return { cards, sessionQueue: queue, sessionDone: done };
        });
      },

      startSession: (count = 20, difficulty, category) => {
        const { cards } = get();
        let pool = [...cards];
        if (difficulty) pool = pool.filter((c) => c.difficulty === difficulty);
        if (category) pool = pool.filter((c) => c.category === category);

        // New cards first, then least-accurate
        pool.sort((a, b) => {
          if (a.timesReviewed === 0 && b.timesReviewed !== 0) return -1;
          if (b.timesReviewed === 0 && a.timesReviewed !== 0) return 1;
          const aRate = a.timesReviewed > 0 ? a.timesCorrect / a.timesReviewed : 0;
          const bRate = b.timesReviewed > 0 ? b.timesCorrect / b.timesReviewed : 0;
          return aRate - bRate;
        });

        const selected = pool.slice(0, count);
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
                }
              : c,
          ),
        }));
      },

      resetAll: () => {
        set({ cards: buildDefaultCards(), sessionQueue: [], sessionDone: [], sessionTotal: 0 });
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
      name: "dutch-flashcards-v2",
      partialize: (s) => ({ cards: s.cards }),
    },
  ),
);
