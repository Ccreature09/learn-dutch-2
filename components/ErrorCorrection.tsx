"use client";

import { useState } from "react";
import type { SentenceCategory, Difficulty } from "@/lib/grammar/types";
import {
  getExercises,
  evaluateCorrection,
  ERROR_TYPE_LABELS,
  type CorrectionAttempt,
  type ErrorCorrectionExercise,
} from "@/lib/modules/error-correction";
import RuleResultDisplay from "@/components/RuleResultDisplay";
import { validateSentence } from "@/lib/grammar/engine";

export default function ErrorCorrection() {
  const [exercises, setExercises] = useState<ErrorCorrectionExercise[]>([]);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [attempt, setAttempt] = useState<CorrectionAttempt | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [category, setCategory] = useState<SentenceCategory | "">("");
  const [difficulty, setDifficulty] = useState<Difficulty | "">("");
  const [ruleResults, setRuleResults] = useState<ReturnType<typeof validateSentence>["ruleResults"]>([]);

  function loadExercises() {
    const ex = getExercises({
      category: category || undefined,
      difficulty: difficulty || undefined,
      count: 10,
    });
    setExercises(ex);
    setExerciseIndex(0);
    setUserAnswer("");
    setAttempt(null);
    setShowHint(false);
    setShowRules(false);
  }

  function checkAnswer() {
    const exercise = exercises[exerciseIndex];
    if (!exercise || !userAnswer.trim()) return;
    const result = evaluateCorrection(exercise, userAnswer);
    setAttempt(result);
    // Also get detailed rule results for display
    const validation = validateSentence(userAnswer);
    setRuleResults(validation.ruleResults);
  }

  function next() {
    const nextIdx = exerciseIndex + 1;
    if (nextIdx >= exercises.length) {
      loadExercises();
      return;
    }
    setExerciseIndex(nextIdx);
    setUserAnswer("");
    setAttempt(null);
    setShowHint(false);
    setShowRules(false);
  }

  const exercise = exercises[exerciseIndex];

  return (
    <div className="module-container">
      <div className="module-header">
        <h2 className="module-title">Error Correction</h2>
        <p className="module-subtitle">
          Each sentence contains a grammar mistake. Fix it!
        </p>
      </div>

      {/* Controls */}
      <div className="controls-row">
        <div className="control-group">
          <label className="control-label">Category</label>
          <select
            className="control-select"
            value={category}
            onChange={(e) => setCategory(e.target.value as SentenceCategory | "")}
          >
            <option value="">All</option>
            <option value="basic">Basic</option>
            <option value="questions">Questions</option>
            <option value="subordinate_clauses">Subordinate Clauses</option>
            <option value="separable_verbs">Separable Verbs</option>
            <option value="perfect_tense">Perfect Tense</option>
          </select>
        </div>
        <div className="control-group">
          <label className="control-label">Difficulty</label>
          <select
            className="control-select"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty | "")}
          >
            <option value="">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        <button className="btn btn--primary" onClick={loadExercises}>
          Load Exercises
        </button>
      </div>

      {exercise ? (
        <>
          <div className="builder-progress">
            Exercise {exerciseIndex + 1} / {exercises.length}
          </div>

          {/* Error sentence */}
          <div className="error-card">
            <div className="error-card__label">Incorrect sentence:</div>
            <div className="error-card__sentence">{exercise.errorSentence}</div>
            <div className="error-card__type">
              Error type: <strong>{ERROR_TYPE_LABELS[exercise.errorType]}</strong>
            </div>
            {!showHint ? (
              <button className="btn btn--ghost btn--sm" onClick={() => setShowHint(true)}>
                Show Hint
              </button>
            ) : (
              <div className="error-card__hint">
                Hint: {exercise.hint}
              </div>
            )}
          </div>

          {/* Answer input */}
          <div className="answer-area">
            <label className="form-label">Your corrected sentence:</label>
            <input
              className="form-input form-input--large"
              placeholder="Type the corrected sentence here…"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") checkAnswer(); }}
              disabled={!!attempt}
            />
          </div>

          {!attempt ? (
            <button
              className="btn btn--primary"
              onClick={checkAnswer}
              disabled={!userAnswer.trim()}
            >
              Check Answer
            </button>
          ) : (
            <div>
              {/* Feedback */}
              <div
                className={`correction-feedback ${
                  attempt.isCorrect ? "correction-feedback--correct" : "correction-feedback--incorrect"
                }`}
              >
                <p className="correction-feedback__message">
                  {attempt.isCorrect ? "✓ " : "✗ "}
                  {attempt.feedback}
                </p>
                <p className="correction-feedback__score">
                  Natural score: {attempt.naturalScore}/100
                </p>
                {!attempt.isCorrect && (
                  <div className="correction-feedback__answer">
                    <strong>Correct answer:</strong> {attempt.correctAnswer}
                  </div>
                )}
                <div className="correction-feedback__explanation">
                  <strong>Explanation:</strong> {attempt.ruleExplanation}
                </div>
              </div>

              {/* Rule details toggle */}
              <button
                className="btn btn--ghost btn--sm"
                onClick={() => setShowRules((r) => !r)}
              >
                {showRules ? "Hide" : "Show"} Rule Analysis
              </button>

              {showRules && (
                <div className="rule-analysis">
                  <RuleResultDisplay results={ruleResults} showAll={false} />
                </div>
              )}

              <button className="btn btn--secondary" onClick={next} style={{ marginTop: "1rem" }}>
                Next Exercise →
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="empty-state">
          Select a difficulty and category, then click Load Exercises.
        </div>
      )}
    </div>
  );
}
