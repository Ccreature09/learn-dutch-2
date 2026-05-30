"use client";

import { useState, useCallback } from "react";
import { DUTCH_VERBS, getExpectedFiniteForm } from "@/lib/data/verbs";
import { CONJUNCTION_BANK, FREE_BUILDER_VERBS, SUBJECT_BANK as SUBJECTS, OBJECT_BANK as OBJECTS, ADVERB_BANK as ADVERBS } from "@/lib/data/lexicon";
import { validateSentence } from "@/lib/grammar/engine";
import type { ValidationResult } from "@/lib/grammar/types";
import RuleResultDisplay from "@/components/RuleResultDisplay";

// ─────────────────────────────────────────────────────────────
// Free Sentence Builder — Mode 2
//
// No predefined exercise. User picks words from a vocabulary
// bank organised by part of speech and assembles them into a
// Dutch sentence. Real-time grammar validation fires after
// every change.
// ─────────────────────────────────────────────────────────────

interface SelectedToken {
  id: string;
  text: string;
  category: "subject" | "verb" | "object" | "adverb" | "conjunction" | "particle";
  hint?: string;
}

interface VerbPickerState {
  infinitive: string;
  person: 1 | 2 | 3;
  number: "singular" | "plural";
  tense: "present" | "past";
}

const SELECTED_VERBS = FREE_BUILDER_VERBS.filter((verb) => !verb.isModal).slice(0, 24);

const MODAL_VERBS = DUTCH_VERBS.filter((v) => v.isModal);

export default function FreeSentenceBuilder() {
  const [tokens, setTokens] = useState<SelectedToken[]>([]);
  const [verbPicker, setVerbPicker] = useState<VerbPickerState | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [activeBank, setActiveBank] = useState<"subjects" | "verbs" | "objects" | "adverbs" | "other">(
    "subjects",
  );

  // Assemble sentence and validate
  const runValidation = useCallback((toks: SelectedToken[]) => {
    if (toks.length === 0) { setValidation(null); return; }
    const sentence = toks.map((t) => t.text).join(" ") + ".";
    const result = validateSentence(sentence);
    setValidation(result);
  }, []);

  function addToken(tok: Omit<SelectedToken, "id">) {
    const newTok: SelectedToken = { ...tok, id: `tok-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` };
    const next = [...tokens, newTok];
    setTokens(next);
    runValidation(next);
  }

  function removeToken(id: string) {
    const next = tokens.filter((t) => t.id !== id);
    setTokens(next);
    runValidation(next);
  }

  function moveToken(fromIdx: number, toIdx: number) {
    if (fromIdx === toIdx) return;
    const next = [...tokens];
    const [item] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, item);
    setTokens(next);
    runValidation(next);
  }

  function clearAll() {
    setTokens([]);
    setValidation(null);
    setVerbPicker(null);
  }

  function openVerbPicker(infinitive: string) {
    setVerbPicker({ infinitive, person: 1, number: "singular", tense: "present" });
  }

  function confirmVerbPicker() {
    if (!verbPicker) return;
    const verb = DUTCH_VERBS.find((v) => v.infinitive === verbPicker.infinitive);
    if (!verb) return;

    let form: string;
    if (verbPicker.tense === "past") {
      form = verbPicker.number === "plural" ? verb.pastPl : verb.pastSg;
    } else {
      form = getExpectedFiniteForm(verb, verbPicker.person, verbPicker.number);
    }

    addToken({
      text: form,
      category: "verb",
      hint: `${verb.infinitive} (${verbPicker.tense}, ${personLabel(verbPicker.person, verbPicker.number)})`,
    });

    // For separable verbs, remind user to add prefix at end
    if (verb.separable && verb.separablePrefix) {
      addToken({
        text: verb.separablePrefix,
        category: "particle",
        hint: `separable prefix of ${verb.infinitive}`,
      });
    }

    setVerbPicker(null);
  }

  function personLabel(p: 1 | 2 | 3, n: "singular" | "plural") {
    const map: Record<string, string> = {
      "1-singular": "1st sg", "2-singular": "2nd sg", "3-singular": "3rd sg",
      "1-plural": "1st pl", "2-plural": "2nd pl", "3-plural": "3rd pl",
    };
    return map[`${p}-${n}`];
  }

  const sentence = tokens.map((t) => t.text).join(" ");
  const statusColor = !validation
    ? "var(--color-text-muted)"
    : validation.overallStatus === "correct"
      ? "var(--color-success, #22c55e)"
      : validation.overallStatus === "unnatural"
        ? "var(--color-warning, #f59e0b)"
        : "var(--color-error, #ef4444)";

  return (
    <div className="free-builder">
      {/* Sentence construction area */}
      <div className="free-builder__sentence-area">
        <div className="free-builder__sentence-label">Your sentence:</div>
        <div className="free-builder__tokens" style={{ borderColor: statusColor }}>
          {tokens.length === 0 ? (
            <span className="free-builder__placeholder">
              Pick words from the bank below to build a Dutch sentence…
            </span>
          ) : (
            tokens.map((tok, idx) => (
              <span
                key={tok.id}
                className={`free-builder__token free-builder__token--${tok.category}`}
                title={tok.hint ?? ""}
              >
                {tok.text}
                <span className="free-builder__token-move">
                  {idx > 0 && (
                    <button
                      className="free-builder__move-btn"
                      onClick={() => moveToken(idx, idx - 1)}
                      title="Move left"
                    >
                      ‹
                    </button>
                  )}
                  {idx < tokens.length - 1 && (
                    <button
                      className="free-builder__move-btn"
                      onClick={() => moveToken(idx, idx + 1)}
                      title="Move right"
                    >
                      ›
                    </button>
                  )}
                </span>
                <button
                  className="free-builder__remove-btn"
                  onClick={() => removeToken(tok.id)}
                  title="Remove"
                >
                  ×
                </button>
              </span>
            ))
          )}
        </div>

        {/* Status line */}
        {validation && (
          <div className="free-builder__status" style={{ color: statusColor }}>
            <strong>
              {validation.overallStatus === "correct"
                ? "✓ Grammatically correct"
                : validation.overallStatus === "unnatural"
                  ? "⚠ Mostly correct but unusual"
                  : "✗ Grammar issue detected"}
            </strong>
            {" · "}Score: {validation.naturalScore}/100
            {validation.mostNaturalVersion && validation.mostNaturalVersion !== sentence + "." && (
              <span className="free-builder__suggestion">
                {" "}Suggestion: <em>{validation.mostNaturalVersion}</em>
              </span>
            )}
          </div>
        )}

        <button className="free-builder__clear-btn" onClick={clearAll} disabled={tokens.length === 0}>
          Clear
        </button>
      </div>

      {/* Grammar breakdown */}
      {validation && (
        <div className="free-builder__rules">
          <RuleResultDisplay results={validation.ruleResults} showAll={false} />
        </div>
      )}

      {/* Verb picker modal */}
      {verbPicker && (
        <div className="free-builder__verb-picker">
          <div className="free-builder__verb-picker-inner">
            <h4 className="free-builder__picker-title">
              Conjugate: <em>{verbPicker.infinitive}</em>
            </h4>

            <div className="free-builder__picker-row">
              <label>Tense:</label>
              <div className="free-builder__picker-options">
                {(["present", "past"] as const).map((t) => (
                  <button
                    key={t}
                    className={`free-builder__picker-opt ${verbPicker.tense === t ? "free-builder__picker-opt--active" : ""}`}
                    onClick={() => setVerbPicker({ ...verbPicker, tense: t })}
                  >
                    {t === "present" ? "Present" : "Past"}
                  </button>
                ))}
              </div>
            </div>

            <div className="free-builder__picker-row">
              <label>Person / Number:</label>
              <div className="free-builder__picker-options">
                {([
                  [1, "singular", "ik (1st sg)"],
                  [2, "singular", "jij (2nd sg)"],
                  [3, "singular", "hij/zij (3rd sg)"],
                  [1, "plural", "wij (1st pl)"],
                  [2, "plural", "jullie (2nd pl)"],
                  [3, "plural", "zij (3rd pl)"],
                ] as [1 | 2 | 3, "singular" | "plural", string][]).map(([p, n, label]) => {
                  const verb = DUTCH_VERBS.find((v) => v.infinitive === verbPicker.infinitive);
                  const form = verb
                    ? verbPicker.tense === "past"
                      ? n === "plural" ? verb.pastPl : verb.pastSg
                      : getExpectedFiniteForm(verb, p, n)
                    : "?";
                  const active = verbPicker.person === p && verbPicker.number === n;
                  return (
                    <button
                      key={`${p}-${n}`}
                      className={`free-builder__picker-opt ${active ? "free-builder__picker-opt--active" : ""}`}
                      onClick={() => setVerbPicker({ ...verbPicker, person: p, number: n })}
                    >
                      {label}: <strong>{form}</strong>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="free-builder__picker-actions">
              <button className="free-builder__picker-confirm" onClick={confirmVerbPicker}>
                Add to sentence
              </button>
              <button className="free-builder__picker-cancel" onClick={() => setVerbPicker(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Word bank */}
      <div className="free-builder__bank">
        {/* Bank tabs */}
        <div className="free-builder__bank-tabs">
          {(["subjects", "verbs", "objects", "adverbs", "other"] as const).map((tab) => (
            <button
              key={tab}
              className={`free-builder__bank-tab ${activeBank === tab ? "free-builder__bank-tab--active" : ""}`}
              onClick={() => setActiveBank(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Bank content */}
        <div className="free-builder__bank-words">
          {activeBank === "subjects" &&
            SUBJECTS.map((s) => (
              <button
                  key={`${s.dutch}-${s.person}-${s.number}`}
                className="free-builder__word-btn free-builder__word-btn--subject"
                title={s.english}
                onClick={() => addToken({ text: s.dutch, category: "subject", hint: s.english })}
              >
                {s.dutch}
              </button>
            ))}

          {activeBank === "verbs" && (
            <>
              <div className="free-builder__bank-section-label">Main verbs (click to conjugate)</div>
              {SELECTED_VERBS.map((v) => (
                <button
                  key={v.infinitive}
                  className="free-builder__word-btn free-builder__word-btn--verb"
                  title={v.translation}
                  onClick={() => openVerbPicker(v.infinitive)}
                >
                  {v.infinitive}
                </button>
              ))}
              <div className="free-builder__bank-section-label">Modal verbs</div>
              {MODAL_VERBS.map((v) => (
                <button
                  key={v.infinitive}
                  className="free-builder__word-btn free-builder__word-btn--verb"
                  title={v.translation}
                  onClick={() => openVerbPicker(v.infinitive)}
                >
                  {v.infinitive}
                </button>
              ))}
              <div className="free-builder__bank-section-label">Add infinitive directly</div>
              {SELECTED_VERBS.map((v) => (
                <button
                  key={`inf-${v.infinitive}`}
                  className="free-builder__word-btn free-builder__word-btn--verb-inf"
                  title={`infinitive: ${v.translation}`}
                  onClick={() => addToken({ text: v.infinitive, category: "verb", hint: `infinitive: ${v.translation}` })}
                >
                  {v.infinitive} (inf)
                </button>
              ))}
            </>
          )}

          {activeBank === "objects" &&
            OBJECTS.map((o) => (
              <button
                key={o.dutch}
                className="free-builder__word-btn free-builder__word-btn--object"
                title={o.english}
                onClick={() => addToken({ text: o.dutch, category: "object", hint: o.english })}
              >
                {o.dutch}
              </button>
            ))}

          {activeBank === "adverbs" &&
            ADVERBS.map((a) => (
              <button
                key={a.dutch}
                className="free-builder__word-btn free-builder__word-btn--adverb"
                title={a.english}
                onClick={() => addToken({ text: a.dutch, category: "adverb", hint: a.english })}
              >
                {a.dutch}
              </button>
            ))}

          {activeBank === "other" &&
            CONJUNCTION_BANK.map((c) => (
              <button
                key={c.dutch}
                className="free-builder__word-btn free-builder__word-btn--conjunction"
                title={c.english}
                onClick={() =>
                  addToken({ text: c.dutch, category: "conjunction", hint: c.english })
                }
              >
                {c.dutch}
              </button>
            ))}
        </div>
      </div>

      {/* Tips */}
      <div className="free-builder__tips">
        <h4>Quick tips</h4>
        <ul>
          <li>Verbs go in <strong>second position</strong> in main clauses (V2 rule).</li>
          <li>
            When fronting an adverb (e.g. <em>Morgen</em>), subject and verb <strong>swap</strong>.
          </li>
          <li>
            In subordinate clauses (<em>dat, omdat</em>), the verb goes to the <strong>end</strong>.
          </li>
          <li>Separable prefixes (<em>op, aan, mee…</em>) go to the end of the main clause.</li>
        </ul>
      </div>
    </div>
  );
}
