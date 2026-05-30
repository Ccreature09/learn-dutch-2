"use client";

import { useState, useCallback, useEffect } from "react";
import { generateSentence, type ProceduralSentence } from "@/lib/modules/procedural-generator";
import { validateSentence } from "@/lib/grammar/engine";
import RuleResultDisplay from "@/components/RuleResultDisplay";
import NaturalnessScore from "@/components/NaturalnessScore";
import LearnerInsights from "@/components/LearnerInsights";
import { useLearnerStore } from "@/lib/modules/learner-store";
import { classifyRuleFailures } from "@/lib/utils/error-classifier";
import type { Difficulty } from "@/lib/grammar/types";

// ─────────────────────────────────────────────────────────────
// Translation Drill — Module 1 (Revamped)
//
// Three modes:
//   A) EN → NL  : User types Dutch for a given English sentence
//   B) NL → EN  : User types English for a given Dutch sentence
//   C) Dual     : Side-by-side study (no typing required)
//
// All sentences are procedurally generated — infinite variety.
// ─────────────────────────────────────────────────────────────

type DrillMode = "A" | "B" | "C";

interface DrillResult {
  isCorrect: boolean;
  score: number;
  semanticScore: number;
  overallStatus: "correct" | "unnatural" | "incorrect";
  feedback: string;
  modelAnswer: string;
  ruleResults: ReturnType<typeof validateSentence>["ruleResults"];
}

// ── Meaning check for EN→NL (Mode A) ─────────────────────────
function scoreDutchMeaning(userDutch: string, sentence: ProceduralSentence): number {
  const ul = userDutch.toLowerCase();
  if (!sentence.keyDutchWords.length) return 100;
  const matched = sentence.keyDutchWords.filter((w) => ul.includes(w.toLowerCase()));
  return Math.round((matched.length / sentence.keyDutchWords.length) * 100);
}

// ── Keyword check for NL→EN (Mode B) ─────────────────────────
function checkEnglishMeaning(userEnglish: string, sentence: ProceduralSentence): number {
  const ul = userEnglish.toLowerCase();
  const contentWords = sentence.keyEnglishWords.filter(
    (w) => !["i", "you", "he", "she", "it", "we", "they"].includes(w.toLowerCase()),
  );
  if (!contentWords.length) return 100;
  const matched = contentWords.filter((w) => ul.includes(w.toLowerCase()));
  return Math.round((matched.length / contentWords.length) * 100);
}

function evaluateModeA(userAnswer: string, sentence: ProceduralSentence): DrillResult {
  const trimmed = userAnswer.trim();
  if (!trimmed) {
    return {
      isCorrect: false, score: 0, semanticScore: 0,
      overallStatus: "incorrect",
      feedback: "Please type your Dutch translation.",
      modelAnswer: sentence.dutch,
      ruleResults: [],
    };
  }

  const validation    = validateSentence(trimmed);
  const grammarOk     = validation.overallStatus === "correct" && validation.naturalScore >= 70;
  const semanticScore = scoreDutchMeaning(trimmed, sentence);
  const meaningOk     = semanticScore >= 60;

  if (grammarOk && meaningOk) {
    return {
      isCorrect: true,
      score: validation.naturalScore,
      semanticScore,
      overallStatus: validation.overallStatus,
      feedback: "Excellent! Grammatically correct and good meaning.",
      modelAnswer: sentence.dutch,
      ruleResults: validation.ruleResults,
    };
  }

  if (grammarOk && !meaningOk) {
    return {
      isCorrect: false,
      score: 50,
      semanticScore,
      overallStatus: "incorrect",
      feedback: `Grammar looks good, but the meaning doesn't match. Try using: ${sentence.keyDutchWords.join(", ")}.`,
      modelAnswer: sentence.dutch,
      ruleResults: validation.ruleResults,
    };
  }

  const failures = validation.ruleResults.filter((r) => r.status === "fail");
  return {
    isCorrect: false,
    score: validation.naturalScore,
    semanticScore,
    overallStatus: validation.overallStatus,
    feedback: failures.length
      ? `Grammar issue: ${failures[0].message}`
      : "Check your Dutch sentence structure.",
    modelAnswer: sentence.dutch,
    ruleResults: validation.ruleResults,
  };
}

function evaluateModeB(userAnswer: string, sentence: ProceduralSentence): DrillResult {
  const trimmed = userAnswer.trim();
  if (!trimmed) {
    return {
      isCorrect: false, score: 0, semanticScore: 0,
      overallStatus: "incorrect",
      feedback: "Please type your English translation.",
      modelAnswer: sentence.english,
      ruleResults: [],
    };
  }

  const semanticScore = checkEnglishMeaning(trimmed, sentence);
  const isCorrect = semanticScore >= 60;

  return {
    isCorrect,
    score: semanticScore,
    semanticScore,
    overallStatus: isCorrect ? "correct" : "incorrect",
    feedback: isCorrect
      ? `Good translation! (${semanticScore}% key words matched)`
      : `Translation misses key content. Model answer: ${sentence.english}`,
    modelAnswer: sentence.english,
    ruleResults: [],
  };
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export default function TranslationDrill() {
  const { recordMistake, recordAttempt } = useLearnerStore();
  const [mode, setMode] = useState<DrillMode>("A");
  const [difficulty, setDifficulty] = useState<Difficulty | "">("");
  const [sentence, setSentence] = useState<ProceduralSentence | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [result, setResult] = useState<DrillResult | null>(null);
  const [showRules, setShowRules] = useState(false);
  const [streak, setStreak] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);

  const next = useCallback(() => {
    const weakPatterns = useLearnerStore.getState().getWeakPatterns(3);
    const opts = {
      difficulty: difficulty || undefined,
      ...(weakPatterns.length > 0 ? { boostPatterns: weakPatterns } : {}),
    };
    // Retry up to 10 times — generateSentence returns null only if every
    // pattern generator fails (empty repo), which should not happen in practice.
    let s: ProceduralSentence | null = null;
    for (let i = 0; i < 10 && !s; i++) {
      s = generateSentence(opts);
    }
    if (s) setSentence(s);
    setUserAnswer("");
    setResult(null);
    setShowRules(false);
  }, [difficulty]);

  useEffect(() => {
    next();
  }, [next]);

  function handleSubmit() {
    if (!sentence || !userAnswer.trim()) return;

    let res: DrillResult;
    if (mode === "A") {
      res = evaluateModeA(userAnswer, sentence);
    } else {
      res = evaluateModeB(userAnswer, sentence);
    }

    setResult(res);
    setSessionTotal((t) => t + 1);
    recordAttempt(sentence.pattern);
    if (res.isCorrect) {
      setStreak((s) => s + 1);
      setSessionCorrect((c) => c + 1);
    } else {
      setStreak(0);
      const errorCats = classifyRuleFailures(res.ruleResults);
      recordMistake({
        exerciseType: "translation",
        errorCategories: errorCats.length > 0 ? errorCats : ["semantic"],
        verbsInvolved: [sentence.verbInfinitive],
        patternInvolved: sentence.pattern,
        userInput: userAnswer,
        correctAnswer: res.modelAnswer,
      });
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (result) next();
      else handleSubmit();
    }
  }

  if (!sentence) {
    return <div className="drill-loading">Generating sentence…</div>;
  }

  const accuracy =
    sessionTotal > 0 ? Math.round((sessionCorrect / sessionTotal) * 100) : 0;

  return (
    <div className="translation-drill">
      {/* Header */}
      <div className="drill-header">
        <h2 className="drill-title">Translation Drill</h2>
        <div className="drill-stats">
          {sessionTotal > 0 && (
            <>
              <span className="drill-stat">
                {sessionCorrect}/{sessionTotal} correct ({accuracy}%)
              </span>
              {streak > 1 && (
                <span className="drill-stat drill-stat--streak">🔥 {streak} streak</span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mode tabs */}
      <div className="drill-mode-tabs">
        {(["A", "B", "C"] as DrillMode[]).map((m) => (
          <button
            key={m}
            className={`drill-mode-tab ${mode === m ? "drill-mode-tab--active" : ""}`}
            onClick={() => {
              setMode(m);
              setResult(null);
              setUserAnswer("");
            }}
          >
            {m === "A" ? "EN → NL" : m === "B" ? "NL → EN" : "Study Mode"}
          </button>
        ))}
        <div className="drill-mode-description">
          {mode === "A"
            ? "Read English, type the Dutch translation."
            : mode === "B"
              ? "Read Dutch, type the English translation."
              : "Both languages shown side-by-side for study."}
        </div>
      </div>

      {/* Difficulty filter */}
      <div className="drill-filters">
        <label className="drill-filter-label" htmlFor="diff-select">
          Difficulty:
        </label>
        <select
          id="diff-select"
          className="drill-filter-select"
          value={difficulty}
          onChange={(e) => {
            setDifficulty(e.target.value as Difficulty | "");
            next();
          }}
        >
          <option value="">All</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
        <span className="drill-pattern-badge">{sentence.structureLabel}</span>
      </div>

      {/* Sentence card */}
      <div className="drill-card">
        {/* Mode C: both sides */}
        {mode === "C" ? (
          <div className="drill-dual">
            <div className="drill-source">
              <span className="drill-lang-badge">NL</span>
              <p className="drill-sentence drill-sentence--dutch">{sentence.dutch}</p>
            </div>
            <div className="drill-divider">↔</div>
            <div className="drill-target">
              <span className="drill-lang-badge drill-lang-badge--en">EN</span>
              <p className="drill-sentence drill-sentence--english">{sentence.english}</p>
            </div>
          </div>
        ) : (
          <>
            {/* Prompt */}
            <div className="drill-prompt">
              <span className="drill-lang-badge">
                {mode === "A" ? "EN" : "NL"}
              </span>
              <p className="drill-sentence">
                {mode === "A" ? sentence.english : sentence.dutch}
              </p>
            </div>

            {/* Input */}
            {!result ? (
              <div className="drill-input-area">
                <label className="drill-input-label">
                  Your {mode === "A" ? "Dutch" : "English"} translation:
                </label>
                <textarea
                  className="drill-input"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    mode === "A"
                      ? "Type Dutch here… (Enter to submit)"
                      : "Type English here… (Enter to submit)"
                  }
                  rows={2}
                  autoFocus
                />
                <button
                  className="drill-btn drill-btn--submit"
                  onClick={handleSubmit}
                  disabled={!userAnswer.trim()}
                >
                  Check Answer
                </button>
              </div>
            ) : (
              /* Result */
              <div
                className={`drill-result ${result.isCorrect ? "drill-result--correct" : "drill-result--incorrect"}`}
              >
                <div className="drill-result-icon">
                  {result.isCorrect ? "✓" : "✗"}
                </div>
                <div className="drill-result-body">
                  <p className="drill-result-feedback">{result.feedback}</p>
                  <div className="drill-model-answer">
                    <span className="drill-model-label">Model answer:</span>
                    <span className="drill-model-text">{result.modelAnswer}</span>
                  </div>
                  <NaturalnessScore
                    ruleResults={result.ruleResults}
                    naturalScore={result.score}
                    semanticScore={result.semanticScore}
                    status={result.overallStatus}
                  />
                  {mode === "A" && result.ruleResults.length > 0 && (
                    <button
                      className="drill-toggle-rules"
                      onClick={() => setShowRules(!showRules)}
                    >
                      {showRules ? "Hide" : "Show"} grammar breakdown
                    </button>
                  )}
                  {showRules && mode === "A" && (
                    <RuleResultDisplay results={result.ruleResults} showAll={false} />
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Navigation */}
      <div className="drill-nav">
        <button
          className="drill-btn drill-btn--next"
          onClick={next}
        >
          {result ? "Next Sentence →" : "Skip"}
        </button>
      </div>

      {/* Learner Insights */}
      <LearnerInsights />
    </div>
  );
}
