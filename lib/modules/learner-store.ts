"use client";

// ─────────────────────────────────────────────────────────────
// Learner Store — Dutch Learning Platform
//
// Centralised Zustand store for all adaptive learning data.
// Persisted to localStorage (key: "dutch-learner-v1").
//
// Tracks:
//   • Mistake records (last 300, capped)
//   • Category weakness counts (which error types the user makes)
//   • Word weakness counts (which verbs they get wrong)
//   • Pattern weakness counts (which sentence patterns they fail)
//
// Consumers call:
//   recordMistake(...)  — after a wrong answer
//   recordAttempt(...)  — after any answer (correct or wrong)
//   getWeakCategories() — top-N most-failed error categories
//   getWeakPatterns()   — top-N patterns with highest failure rate
//   getWeakWords()      — top-N verbs with most mistakes
// ─────────────────────────────────────────────────────────────

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SentencePattern } from "@/lib/modules/procedural-generator";
import type { ErrorCategory } from "@/lib/utils/error-classifier";

const MAX_MISTAKE_HISTORY = 300;

// ── Data shapes ───────────────────────────────────────────────

export interface MistakeRecord {
  id: string;
  timestamp: number;
  exerciseType: "translation" | "error_correction" | "flashcard" | "scenario";
  errorCategories: ErrorCategory[];
  verbsInvolved: string[];
  patternInvolved?: SentencePattern;
  userInput: string;
  correctAnswer: string;
}

export interface RecordMistakePayload {
  exerciseType: MistakeRecord["exerciseType"];
  errorCategories: ErrorCategory[];
  verbsInvolved?: string[];
  patternInvolved?: SentencePattern;
  userInput: string;
  correctAnswer: string;
}

interface CategoryStats  { attempts: number; mistakes: number; }
interface WordStats       { mistakes: number; lastMistake: number; }
interface PatternStats    { attempts: number; mistakes: number; }

export interface LearnerProfile {
  mistakes:       MistakeRecord[];
  categoryStats:  Partial<Record<ErrorCategory,    CategoryStats>>;
  wordStats:      Record<string,                   WordStats>;
  patternStats:   Partial<Record<SentencePattern,  PatternStats>>;
  totalAttempts:  number;
  totalMistakes:  number;
}

// ── Store interface ───────────────────────────────────────────

interface LearnerState extends LearnerProfile {
  recordMistake:     (payload: RecordMistakePayload) => void;
  recordAttempt:     (patternInvolved?: SentencePattern) => void;
  getWeakCategories: (topN?: number) => ErrorCategory[];
  getWeakPatterns:   (topN?: number) => SentencePattern[];
  getWeakWords:      (topN?: number) => string[];
  resetProfile:      () => void;
}

const EMPTY: LearnerProfile = {
  mistakes: [],
  categoryStats: {},
  wordStats: {},
  patternStats: {},
  totalAttempts: 0,
  totalMistakes: 0,
};

// ── Store ─────────────────────────────────────────────────────

export const useLearnerStore = create<LearnerState>()(
  persist(
    (set, get) => ({
      ...EMPTY,

      recordMistake: (payload) =>
        set((state) => {
          const record: MistakeRecord = {
            id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            timestamp: Date.now(),
            exerciseType: payload.exerciseType,
            errorCategories: payload.errorCategories,
            verbsInvolved: payload.verbsInvolved ?? [],
            patternInvolved: payload.patternInvolved,
            userInput: payload.userInput,
            correctAnswer: payload.correctAnswer,
          };

          // Accumulate category stats
          const categoryStats = { ...state.categoryStats };
          for (const cat of payload.errorCategories) {
            const prev = categoryStats[cat] ?? { attempts: 0, mistakes: 0 };
            categoryStats[cat] = { attempts: prev.attempts + 1, mistakes: prev.mistakes + 1 };
          }

          // Accumulate word stats
          const wordStats = { ...state.wordStats };
          for (const word of (payload.verbsInvolved ?? [])) {
            const prev = wordStats[word] ?? { mistakes: 0, lastMistake: 0 };
            wordStats[word] = { mistakes: prev.mistakes + 1, lastMistake: Date.now() };
          }

          // Accumulate pattern stats
          const patternStats = { ...state.patternStats };
          if (payload.patternInvolved) {
            const prev = patternStats[payload.patternInvolved] ?? { attempts: 0, mistakes: 0 };
            patternStats[payload.patternInvolved] = {
              attempts: prev.attempts + 1,
              mistakes: prev.mistakes + 1,
            };
          }

          return {
            mistakes: [record, ...state.mistakes].slice(0, MAX_MISTAKE_HISTORY),
            categoryStats,
            wordStats,
            patternStats,
            totalAttempts: state.totalAttempts + 1,
            totalMistakes: state.totalMistakes + 1,
          };
        }),

      recordAttempt: (patternInvolved) =>
        set((state) => {
          const patternStats = { ...state.patternStats };
          if (patternInvolved) {
            const prev = patternStats[patternInvolved] ?? { attempts: 0, mistakes: 0 };
            patternStats[patternInvolved] = { ...prev, attempts: prev.attempts + 1 };
          }
          return { patternStats, totalAttempts: state.totalAttempts + 1 };
        }),

      getWeakCategories: (topN = 3) => {
        const { categoryStats } = get();
        return (Object.entries(categoryStats) as [ErrorCategory, CategoryStats][])
          .filter(([, s]) => s.attempts > 0)
          .map(([cat, s]) => ({ cat, rate: s.mistakes / s.attempts }))
          .sort((a, b) => b.rate - a.rate)
          .slice(0, topN)
          .map(({ cat }) => cat);
      },

      getWeakPatterns: (topN = 3) => {
        const { patternStats } = get();
        return (Object.entries(patternStats) as [SentencePattern, PatternStats][])
          .filter(([, s]) => s.attempts >= 2)
          .map(([pat, s]) => ({ pat, rate: s.mistakes / s.attempts }))
          .sort((a, b) => b.rate - a.rate)
          .slice(0, topN)
          .map(({ pat }) => pat);
      },

      getWeakWords: (topN = 5) =>
        Object.entries(get().wordStats)
          .sort(([, a], [, b]) => b.mistakes - a.mistakes)
          .slice(0, topN)
          .map(([word]) => word),

      resetProfile: () => set({ ...EMPTY }),
    }),
    { name: "dutch-learner-v1" },
  ),
);
