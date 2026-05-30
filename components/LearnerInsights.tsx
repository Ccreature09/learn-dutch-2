"use client";

// ─────────────────────────────────────────────────────────────
// LearnerInsights — collapsible weakness panel
//
// Reads from the learner-store and displays:
//   • Overall accuracy stats (attempts / mistakes / %)
//   • Top weak error categories (where the user struggles)
//   • Top weak sentence patterns (highest failure rate)
//   • Top weak words/verbs (most mistakes)
//
// Collapses by default so it doesn't clutter the main UI.
// Shown at the bottom of exercise pages.
// ─────────────────────────────────────────────────────────────

import { useState } from "react";
import { useLearnerStore } from "@/lib/modules/learner-store";
import { ERROR_CATEGORY_LABELS, ERROR_CATEGORY_EMOJI } from "@/lib/utils/error-classifier";
import type { ErrorCategory } from "@/lib/utils/error-classifier";
import type { SentencePattern } from "@/lib/modules/procedural-generator";

const PATTERN_LABELS: Partial<Record<SentencePattern, string>> = {
  sv:             "Subject + Verb",
  svo:            "Subject + Verb + Object",
  svadv:          "S + V + Adverb",
  adv_sv:         "Fronted Adverb (V2)",
  adv_svo:        "Fronted Adverb + Object",
  polar_question: "Yes/No Question",
  wh_question:    "WH-Question",
  modal:          "Modal Verb",
  modal_obj:      "Modal + Object",
  perfect_hebben: "Perfect Tense (hebben)",
  perfect_zijn:   "Perfect Tense (zijn)",
  separable:      "Separable Verb",
  subordinate:    "Subordinate Clause",
  relative_clause:"Relative Clause",
  conditional_als:"Conditional (als)",
  passive:        "Passive Voice",
};

export default function LearnerInsights() {
  const [open, setOpen] = useState(false);

  const {
    totalAttempts,
    totalMistakes,
    getWeakCategories,
    getWeakPatterns,
    getWeakWords,
    resetProfile,
  } = useLearnerStore();

  const weakCategories = getWeakCategories(4);
  const weakPatterns   = getWeakPatterns(3);
  const weakWords      = getWeakWords(6);

  const accuracy = totalAttempts > 0
    ? Math.round(((totalAttempts - totalMistakes) / totalAttempts) * 100)
    : null;

  const hasData = totalAttempts > 0;

  function handleReset() {
    if (window.confirm("Reset all learning progress? This cannot be undone.")) {
      resetProfile();
    }
  }

  return (
    <div className="learner-insights">
      <button
        className="insights-toggle"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="insights-toggle-label">📊 My Progress &amp; Weaknesses</span>
        <span className="insights-toggle-arrow">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="insights-panel">
          {/* Stats row */}
          <div className="insights-stats">
            <div className="insights-stat">
              <span className="insights-stat-value">{totalAttempts}</span>
              <span className="insights-stat-label">Attempts</span>
            </div>
            <div className="insights-stat">
              <span className="insights-stat-value">{totalMistakes}</span>
              <span className="insights-stat-label">Mistakes</span>
            </div>
            {accuracy !== null && (
              <div className="insights-stat">
                <span
                  className="insights-stat-value"
                  style={{ color: accuracy >= 80 ? "var(--color-pass)" : accuracy >= 60 ? "var(--color-warning)" : "var(--color-fail)" }}
                >
                  {accuracy}%
                </span>
                <span className="insights-stat-label">Accuracy</span>
              </div>
            )}
          </div>

          {!hasData ? (
            <p className="insights-empty">
              Complete some exercises to see your personalised learning insights.
            </p>
          ) : (
            <>
              {weakCategories.length > 0 && (
                <div className="insights-section">
                  <h4 className="insights-section-title">Areas to Focus On</h4>
                  <ul className="insights-list">
                    {weakCategories.map((cat) => (
                      <li key={cat} className="insights-item">
                        <span className="insights-emoji">{ERROR_CATEGORY_EMOJI[cat]}</span>
                        <span>{ERROR_CATEGORY_LABELS[cat]}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {weakPatterns.length > 0 && (
                <div className="insights-section">
                  <h4 className="insights-section-title">Sentence Patterns to Practise</h4>
                  <ul className="insights-list">
                    {weakPatterns.map((pat) => (
                      <li key={pat} className="insights-item">
                        <span className="insights-emoji">📋</span>
                        <span>{PATTERN_LABELS[pat] ?? pat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {weakWords.length > 0 && (
                <div className="insights-section">
                  <h4 className="insights-section-title">Words to Review</h4>
                  <div className="insights-word-cloud">
                    {weakWords.map((word) => (
                      <span key={word} className="insights-word-tag">{word}</span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          <button className="insights-reset-btn" onClick={handleReset}>
            Reset Progress
          </button>
        </div>
      )}
    </div>
  );
}
