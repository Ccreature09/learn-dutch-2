"use client";

import { useState } from "react";
import type { GeneratedSentence, SentenceCategory, Difficulty } from "@/lib/grammar/types";
import { generateSentences, CATEGORY_LABELS, CATEGORY_DESCRIPTIONS } from "@/lib/modules/sentence-generator";

const DIFFICULTIES: { value: Difficulty | ""; label: string }[] = [
  { value: "", label: "All Levels" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const CATEGORIES: { value: SentenceCategory | ""; label: string }[] = [
  { value: "", label: "All Categories" },
  { value: "basic", label: CATEGORY_LABELS.basic },
  { value: "modal_verbs", label: CATEGORY_LABELS.modal_verbs },
  { value: "simple_past", label: CATEGORY_LABELS.simple_past },
  { value: "perfect_tense", label: CATEGORY_LABELS.perfect_tense },
  { value: "zijn_hebben", label: CATEGORY_LABELS.zijn_hebben },
  { value: "questions", label: CATEGORY_LABELS.questions },
  { value: "subordinate_clauses", label: CATEGORY_LABELS.subordinate_clauses },
  { value: "separable_verbs", label: CATEGORY_LABELS.separable_verbs },
  { value: "advanced", label: CATEGORY_LABELS.advanced },
];

export default function SentenceGenerator() {
  const [category, setCategory] = useState<SentenceCategory | "">("");
  const [difficulty, setDifficulty] = useState<Difficulty | "">("");
  const [sentences, setSentences] = useState<GeneratedSentence[]>([]);
  const [showEnglish, setShowEnglish] = useState<Record<number, boolean>>({});

  function generate() {
    const results = generateSentences({
      category: category || undefined,
      difficulty: difficulty || undefined,
      count: 5,
    });
    setSentences(results);
    setShowEnglish({});
  }

  function toggleEnglish(idx: number) {
    setShowEnglish((prev) => ({ ...prev, [idx]: !prev[idx] }));
  }

  return (
    <div className="module-container">
      <div className="module-header">
        <h2 className="module-title">Sentence Generator</h2>
        <p className="module-subtitle">
          Generate Dutch sentences with grammatical explanations.
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
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div className="control-group">
          <label className="control-label">Difficulty</label>
          <select
            className="control-select"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty | "")}
          >
            {DIFFICULTIES.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>
        <button className="btn btn--primary" onClick={generate}>
          Generate Sentences
        </button>
      </div>

      {category && (
        <div className="category-description">
          {CATEGORY_DESCRIPTIONS[category]}
        </div>
      )}

      {/* Results */}
      <div className="sentence-list">
        {sentences.map((s, i) => (
          <div key={i} className="sentence-card">
            <div className="sentence-card__meta">
              <span className={`badge badge--${s.difficulty}`}>{s.difficulty}</span>
              <span className="badge badge--category">{CATEGORY_LABELS[s.category]}</span>
            </div>

            <div className="sentence-card__dutch">{s.dutch}</div>

            <button
              className="btn btn--ghost btn--sm"
              onClick={() => toggleEnglish(i)}
            >
              {showEnglish[i] ? "Hide" : "Show"} English
            </button>

            {showEnglish[i] && (
              <div className="sentence-card__english">{s.english}</div>
            )}

            <div className="sentence-card__structure">{s.structureLabel}</div>

            {s.grammaticalNotes.length > 0 && (
              <ul className="sentence-card__notes">
                {s.grammaticalNotes.map((note, j) => (
                  <li key={j}>{note}</li>
                ))}
              </ul>
            )}

            {s.alternatives.length > 0 && (
              <div className="sentence-card__alternatives">
                <span className="sentence-card__alt-label">Alternatives:</span>
                {s.alternatives.map((alt, j) => (
                  <span key={j} className="sentence-card__alt">
                    {alt.dutch} <em>({alt.note})</em>
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {sentences.length === 0 && (
        <div className="empty-state">
          Select a category and difficulty, then click Generate Sentences.
        </div>
      )}
    </div>
  );
}
