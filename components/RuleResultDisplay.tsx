"use client";

import type { RuleResult } from "@/lib/grammar/types";

interface Props {
  results: RuleResult[];
  showAll?: boolean;
}

const STATUS_STYLES: Record<string, string> = {
  pass: "rule-result rule-result--pass",
  warning: "rule-result rule-result--warning",
  fail: "rule-result rule-result--fail",
};

const STATUS_ICON: Record<string, string> = {
  pass: "✓",
  warning: "⚠",
  fail: "✗",
};

export default function RuleResultDisplay({ results, showAll = true }: Props) {
  const visible = showAll ? results : results.filter((r) => r.status !== "pass");

  if (visible.length === 0) {
    return (
      <div className="rule-result rule-result--pass">
        <span className="rule-result__icon">✓</span>
        <span className="rule-result__message">All grammar rules passed.</span>
      </div>
    );
  }

  return (
    <div className="rule-results-list">
      {visible.map((result) => (
        <div key={result.ruleId} className={STATUS_STYLES[result.status]}>
          <div className="rule-result__header">
            <span className="rule-result__icon">{STATUS_ICON[result.status]}</span>
            <span className="rule-result__rule-name">{result.ruleName}</span>
            <span className={`rule-result__badge rule-result__badge--${result.status}`}>
              {result.status.toUpperCase()}
            </span>
          </div>
          <p className="rule-result__message">{result.message}</p>
          {result.explanation && (
            <p className="rule-result__explanation">{result.explanation}</p>
          )}
          {result.correctedSuggestion && (
            <div className="rule-result__suggestion">
              <span className="rule-result__suggestion-label">Suggestion: </span>
              <em>{result.correctedSuggestion}</em>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
