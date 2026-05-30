"use client";

// ─────────────────────────────────────────────────────────────
// NaturalnessScore — three-bar score display
//
// Shows grammar, meaning, and naturalness as separate 0-100
// bars, plus a badge indicating the overall sentence quality:
//   ⭐ Most natural — correct + naturalScore ≥ 85
//   ✔  Correct       — correct + naturalScore < 85
//   ⚠  Unnatural     — overallStatus === "unnatural"
//   ✗  Incorrect     — overallStatus === "incorrect"
// ─────────────────────────────────────────────────────────────

import type { RuleResult } from "@/lib/grammar/types";

interface Props {
  ruleResults:   RuleResult[];
  naturalScore:  number;      // 0-100 from ValidationResult
  semanticScore: number;      // 0-100 from keyword matching
  status:        "correct" | "unnatural" | "incorrect";
}

/** Compute grammar score: starts at 100, -25 per fail rule, -8 per warning. */
function computeGrammarScore(ruleResults: RuleResult[]): number {
  let score = 100;
  for (const r of ruleResults) {
    if (r.status === "fail")    score -= 25;
    else if (r.status === "warning") score -= 8;
  }
  return Math.max(0, score);
}

function colorClass(score: number): string {
  if (score >= 80) return "ns-fill--good";
  if (score >= 55) return "ns-fill--mid";
  return "ns-fill--bad";
}

function Bar({ label, score }: { label: string; score: number }) {
  return (
    <div className="ns-row">
      <span className="ns-label">{label}</span>
      <div className="ns-track">
        <div
          className={`ns-fill ${colorClass(score)}`}
          style={{ width: `${score}%` }}
          role="progressbar"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      <span className="ns-score">{score}</span>
    </div>
  );
}

type BadgeKey = "natural" | "ok" | "warn" | "fail";

const BADGES: Record<BadgeKey, { icon: string; label: string }> = {
  natural: { icon: "⭐", label: "Most natural phrasing" },
  ok:      { icon: "✔",  label: "Correct (less natural)" },
  warn:    { icon: "⚠",  label: "Grammatically allowed but unusual" },
  fail:    { icon: "✗",  label: "Incorrect" },
};

export default function NaturalnessScore({ ruleResults, naturalScore, semanticScore, status }: Props) {
  const grammarScore = ruleResults.length > 0 ? computeGrammarScore(ruleResults) : 100;
  const hasGrammar   = ruleResults.length > 0;

  let badgeKey: BadgeKey;
  if (status === "incorrect")   badgeKey = "fail";
  else if (status === "unnatural") badgeKey = "warn";
  else if (naturalScore >= 85)  badgeKey = "natural";
  else                          badgeKey = "ok";

  const badge = BADGES[badgeKey];

  return (
    <div className="naturalness-score">
      <span className={`ns-badge ns-badge--${badgeKey}`}>
        {badge.icon} {badge.label}
      </span>
      <div className="ns-bars">
        {hasGrammar && <Bar label="Grammar"     score={grammarScore}  />}
        <Bar label="Meaning"     score={semanticScore} />
        {hasGrammar && <Bar label="Naturalness" score={naturalScore}  />}
      </div>
    </div>
  );
}
