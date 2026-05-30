"use client";

import { useState } from "react";
import {
  translateEnToDutch,
  translateNlToEnglish,
  type TranslationResult,
} from "@/lib/modules/translation-engine";

type Direction = "en_to_nl" | "nl_to_en";

export default function TranslationEngine() {
  const [direction, setDirection] = useState<Direction>("en_to_nl");
  const [input, setInput] = useState("");
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [loading, setLoading] = useState(false);

  function translate() {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const res =
        direction === "en_to_nl"
          ? translateEnToDutch(input)
          : translateNlToEnglish(input);
      setResult(res);
    } finally {
      setLoading(false);
    }
  }

  function toggleDirection() {
    setDirection((d) => (d === "en_to_nl" ? "nl_to_en" : "en_to_nl"));
    setResult(null);
    setInput("");
  }

  const placeholder =
    direction === "en_to_nl"
      ? "Enter English sentence…"
      : "Voer een Nederlandse zin in…";

  return (
    <div className="module-container">
      <div className="module-header">
        <h2 className="module-title">Translation Engine</h2>
        <p className="module-subtitle">Rule-based bidirectional translation: English ↔ Dutch.</p>
      </div>

      {/* Direction toggle */}
      <div className="translation-direction">
        <span className="translation-lang">{direction === "en_to_nl" ? "🇬🇧 English" : "🇳🇱 Dutch"}</span>
        <button className="btn btn--ghost direction-toggle" onClick={toggleDirection} title="Swap direction">
          ⇄
        </button>
        <span className="translation-lang">{direction === "en_to_nl" ? "🇳🇱 Dutch" : "🇬🇧 English"}</span>
      </div>

      {/* Input */}
      <textarea
        className="translation-input"
        rows={3}
        placeholder={placeholder}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); translate(); } }}
      />

      <button
        className="btn btn--primary"
        onClick={translate}
        disabled={loading || !input.trim()}
      >
        {loading ? "Translating…" : "Translate"}
      </button>

      {/* Results */}
      {result && (
        <div className="translation-result">
          <div className={`confidence-badge confidence-badge--${result.confidence}`}>
            Confidence: {result.confidence.toUpperCase()}
          </div>

          <div className="translation-primary">
            <span className="translation-primary__label">Translation:</span>
            <span className="translation-primary__text">{result.mostNatural}</span>
          </div>

          {result.alternatives.length > 0 && (
            <div className="translation-alternatives">
              <h4 className="translation-section-title">Alternatives</h4>
              {result.alternatives.map((alt, i) => (
                <div key={i} className="translation-alt">
                  <span className="translation-alt__text">{alt.text}</span>
                  {alt.note && <span className="translation-alt__note"> — {alt.note}</span>}
                </div>
              ))}
            </div>
          )}

          {result.grammarNotes.length > 0 && (
            <div className="translation-notes">
              <h4 className="translation-section-title">Grammar Notes</h4>
              <ul>
                {result.grammarNotes.map((note, i) => <li key={i}>{note}</li>)}
              </ul>
            </div>
          )}

          {result.wordGloss.length > 0 && (
            <div className="translation-gloss">
              <h4 className="translation-section-title">Word Glossary</h4>
              <div className="gloss-grid">
                {result.wordGloss.map(({ word, translation }, i) => (
                  <div key={i} className="gloss-item">
                    <span className="gloss-item__word">{word}</span>
                    <span className="gloss-item__translation">{translation}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
