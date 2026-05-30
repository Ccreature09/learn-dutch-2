"use client";

// ─────────────────────────────────────────────────────────────
// ScenarioDrill — Context-Based Exercise Sequences
//
// Presents multi-step scenario exercises that force tense
// variation, inversion, and clause complexity within a coherent
// narrative.  Each step exercises a specific sentence pattern
// (EN→NL translation, Mode A).
//
// Integrates with the learner-store to record mistakes and
// drive adaptive generation in other modules.
// ─────────────────────────────────────────────────────────────

import { useState, useCallback } from "react";
import {
  SCENARIO_LIST,
  generateScenario,
  type GeneratedScenario,
  type ScenarioStep,
} from "@/lib/modules/scenario-generator";
import { validateSentence } from "@/lib/grammar/engine";
import { classifyRuleFailures } from "@/lib/utils/error-classifier";
import { useLearnerStore } from "@/lib/modules/learner-store";
import NaturalnessScore from "@/components/NaturalnessScore";
import RuleResultDisplay from "@/components/RuleResultDisplay";

// ── Types ─────────────────────────────────────────────────────

interface StepResult {
  isCorrect:     boolean;
  grammarOk:     boolean;
  semanticOk:    boolean;
  score:         number;       // naturalScore from ValidationResult
  semanticScore: number;       // keyword overlap %
  feedback:      string;
  ruleResults:   ReturnType<typeof validateSentence>["ruleResults"];
  overallStatus: "correct" | "unnatural" | "incorrect";
}

// ── Helpers ───────────────────────────────────────────────────

function scoreMeaning(userDutch: string, step: ScenarioStep): number {
  const ul = userDutch.toLowerCase();
  const kw = step.sentence.keyDutchWords;
  if (!kw.length) return 100;
  const matched = kw.filter((w) => ul.includes(w.toLowerCase()));
  return Math.round((matched.length / kw.length) * 100);
}

function evaluateStep(userAnswer: string, step: ScenarioStep): StepResult {
  const trimmed = userAnswer.trim();
  if (!trimmed) {
    return {
      isCorrect: false, grammarOk: false, semanticOk: false,
      score: 0, semanticScore: 0, feedback: "Please type your Dutch translation.",
      ruleResults: [], overallStatus: "incorrect",
    };
  }

  const validation    = validateSentence(trimmed);
  const grammarOk     = validation.overallStatus === "correct" && validation.naturalScore >= 70;
  const semanticScore = scoreMeaning(trimmed, step);
  const semanticOk    = semanticScore >= 55;

  if (grammarOk && semanticOk) {
    return {
      isCorrect: true, grammarOk, semanticOk,
      score: validation.naturalScore, semanticScore,
      feedback: "Correct! Good grammar and meaning.",
      ruleResults: validation.ruleResults,
      overallStatus: validation.overallStatus,
    };
  }
  if (grammarOk && !semanticOk) {
    return {
      isCorrect: false, grammarOk, semanticOk,
      score: 50, semanticScore,
      feedback: `Good grammar, but try to include: ${step.sentence.keyDutchWords.join(", ")}.`,
      ruleResults: validation.ruleResults,
      overallStatus: "incorrect",
    };
  }
  const failures = validation.ruleResults.filter((r) => r.status === "fail");
  return {
    isCorrect: false, grammarOk, semanticOk,
    score: validation.naturalScore, semanticScore,
    feedback: failures.length
      ? `Grammar issue: ${failures[0].message}`
      : "Check your Dutch sentence structure.",
    ruleResults: validation.ruleResults,
    overallStatus: validation.overallStatus,
  };
}

// ── Sub-components ────────────────────────────────────────────

function SelectionScreen({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <div className="scenario-selection">
      <div className="scenario-selection-header">
        <h2 className="scenario-selection-title">Choose a Scenario</h2>
        <p className="scenario-selection-sub">
          Each scenario is a 5-step exercise sequence that practises different Dutch sentence structures in context.
        </p>
      </div>
      <div className="scenario-cards">
        {SCENARIO_LIST.map((s) => (
          <button key={s.id} className="scenario-card" onClick={() => onSelect(s.id)}>
            <span className="scenario-card-emoji">{s.emoji}</span>
            <div className="scenario-card-body">
              <span className="scenario-card-title">{s.title}</span>
              <span className="scenario-card-nl">{s.titleNL}</span>
              <span className="scenario-card-desc">{s.description}</span>
            </div>
            <span className="scenario-card-arrow">→</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <div className="scenario-progress">
      <div className="scenario-progress-label">
        Step {current} of {total}
      </div>
      <div className="scenario-progress-track">
        <div className="scenario-progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function CompleteScreen({
  scenario,
  results,
  onRestart,
  onBack,
}: {
  scenario: GeneratedScenario;
  results: (StepResult | null)[];
  onRestart: () => void;
  onBack: () => void;
}) {
  const correct = results.filter((r) => r?.isCorrect).length;
  const total   = results.length;
  const pct     = Math.round((correct / total) * 100);

  return (
    <div className="scenario-complete">
      <div className="scenario-complete-emoji">{scenario.emoji}</div>
      <h2 className="scenario-complete-title">{scenario.title} — Voltooid!</h2>
      <p className="scenario-complete-score">
        {correct}/{total} steps correct ({pct}%)
      </p>
      {pct === 100 && <p className="scenario-complete-perfect">⭐ Perfect score!</p>}
      <div className="scenario-complete-steps">
        {results.map((r, i) => (
          <span
            key={i}
            className={`scenario-step-dot ${r?.isCorrect ? "scenario-step-dot--ok" : "scenario-step-dot--fail"}`}
            title={`Step ${i + 1}: ${r?.isCorrect ? "correct" : "incorrect"}`}
          >
            {r?.isCorrect ? "✓" : "✗"}
          </span>
        ))}
      </div>
      <div className="scenario-complete-actions">
        <button className="btn btn--primary" onClick={onRestart}>Try Again</button>
        <button className="btn btn--ghost" onClick={onBack}>Choose Scenario</button>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────

export default function ScenarioDrill() {
  const [scenario,    setScenario]    = useState<GeneratedScenario | null>(null);
  const [stepIndex,   setStepIndex]   = useState(0);
  const [userAnswer,  setUserAnswer]  = useState("");
  const [stepResult,  setStepResult]  = useState<StepResult | null>(null);
  const [showRules,   setShowRules]   = useState(false);
  const [allResults,  setAllResults]  = useState<(StepResult | null)[]>([]);
  const [done,        setDone]        = useState(false);

  const { recordMistake, recordAttempt } = useLearnerStore();

  const handleSelectScenario = useCallback((id: string) => {
    const gen = generateScenario(id);
    if (!gen) return;
    setScenario(gen);
    setStepIndex(0);
    setUserAnswer("");
    setStepResult(null);
    setShowRules(false);
    setAllResults(Array(gen.steps.length).fill(null));
    setDone(false);
  }, []);

  function handleSubmit() {
    if (!scenario || !userAnswer.trim()) return;
    const step   = scenario.steps[stepIndex];
    const result = evaluateStep(userAnswer, step);

    setStepResult(result);
    recordAttempt(step.requiredPattern);

    if (!result.isCorrect) {
      const errorCats = classifyRuleFailures(result.ruleResults);
      recordMistake({
        exerciseType:    "scenario",
        errorCategories: errorCats.length > 0 ? errorCats : ["semantic"],
        verbsInvolved:   [step.sentence.verbInfinitive],
        patternInvolved: step.requiredPattern,
        userInput:       userAnswer,
        correctAnswer:   step.sentence.dutch,
      });
    }

    setAllResults((prev) => {
      const next = [...prev];
      next[stepIndex] = result;
      return next;
    });
  }

  function handleNext() {
    if (!scenario) return;
    const nextIdx = stepIndex + 1;
    if (nextIdx >= scenario.steps.length) {
      setDone(true);
    } else {
      setStepIndex(nextIdx);
      setUserAnswer("");
      setStepResult(null);
      setShowRules(false);
    }
  }

  function handleRestart() {
    if (!scenario) return;
    handleSelectScenario(scenario.id);
  }

  function handleBack() {
    setScenario(null);
    setDone(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key !== "Enter" || e.shiftKey) return;
    e.preventDefault();
    if (stepResult) handleNext();
    else handleSubmit();
  }

  // ── Render ─────────────────────────────────────────────────

  if (!scenario) {
    return <SelectionScreen onSelect={handleSelectScenario} />;
  }

  if (done) {
    return (
      <CompleteScreen
        scenario={scenario}
        results={allResults}
        onRestart={handleRestart}
        onBack={handleBack}
      />
    );
  }

  const step      = scenario.steps[stepIndex];
  const completed = allResults.filter(Boolean).length;

  return (
    <div className="scenario-drill">
      {/* Header */}
      <div className="scenario-drill-header">
        <div className="scenario-drill-title-row">
          <span className="scenario-emoji">{scenario.emoji}</span>
          <div>
            <h2 className="scenario-drill-title">{scenario.title}</h2>
            <span className="scenario-drill-subtitle">{scenario.titleNL}</span>
          </div>
          <button className="btn btn--ghost btn--sm scenario-back-btn" onClick={handleBack}>
            ← Scenarios
          </button>
        </div>
        <ProgressBar current={completed + (stepResult ? 1 : 0)} total={scenario.steps.length} />
      </div>

      {/* Step card */}
      <div className="scenario-step-card">
        {/* Context */}
        <div className="scenario-context">
          <span className="scenario-step-num">Step {step.stepNumber}</span>
          <p className="scenario-context-text">{step.contextEN}</p>
          <span className="scenario-focus-badge">{step.grammarFocus}</span>
        </div>

        {/* English prompt */}
        <div className="scenario-prompt">
          <span className="drill-lang-badge">EN</span>
          <p className="drill-sentence">{step.sentence.english}</p>
        </div>

        {/* Input */}
        {!stepResult ? (
          <div className="drill-input-area">
            <label className="drill-input-label">Your Dutch translation:</label>
            <textarea
              className="drill-input"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type Dutch here… (Enter to submit)"
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
          <div
            className={`drill-result ${stepResult.isCorrect ? "drill-result--correct" : "drill-result--incorrect"}`}
          >
            <div className="drill-result-icon">{stepResult.isCorrect ? "✓" : "✗"}</div>
            <div className="drill-result-body">
              <p className="drill-result-feedback">{stepResult.feedback}</p>
              <div className="drill-model-answer">
                <span className="drill-model-label">Model answer: </span>
                <span className="drill-model-text">{step.sentence.dutch}</span>
              </div>
              <NaturalnessScore
                ruleResults={stepResult.ruleResults}
                naturalScore={stepResult.score}
                semanticScore={stepResult.semanticScore}
                status={stepResult.overallStatus}
              />
              {stepResult.ruleResults.length > 0 && (
                <button className="drill-toggle-rules" onClick={() => setShowRules((r) => !r)}>
                  {showRules ? "Hide" : "Show"} grammar breakdown
                </button>
              )}
              {showRules && <RuleResultDisplay results={stepResult.ruleResults} showAll={false} />}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="drill-nav">
        {stepResult && (
          <button className="drill-btn drill-btn--next" onClick={handleNext}>
            {stepIndex + 1 < scenario.steps.length ? "Next Step →" : "Finish Scenario →"}
          </button>
        )}
        {!stepResult && (
          <button className="drill-btn drill-btn--next" onClick={handleNext}>
            Skip
          </button>
        )}
      </div>
    </div>
  );
}
