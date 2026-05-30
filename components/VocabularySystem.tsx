"use client";

import { useState, useMemo, useCallback } from "react";
import {
  searchDictionary,
  getVocabStats,
  getAllCategories,
  type DictionaryEntry,
  type VocabFilters,
} from "@/lib/modules/vocabulary-system";

// ─────────────────────────────────────────────────────────────
// Vocabulary System — Module 6
//
// Full-text searchable Dutch dictionary combining verbs and
// vocabulary. Filters by POS, difficulty, frequency, category.
// Verbs show full conjugation tables when expanded.
// ─────────────────────────────────────────────────────────────

const POS_OPTIONS = [
  { value: "", label: "All POS" },
  { value: "verb", label: "Verbs" },
  { value: "noun", label: "Nouns" },
  { value: "adjective", label: "Adjectives" },
  { value: "adverb", label: "Adverbs" },
  { value: "pronoun", label: "Pronouns" },
  { value: "conjunction", label: "Conjunctions" },
  { value: "preposition", label: "Prepositions" },
];

const DIFFICULTY_OPTIONS = [
  { value: "", label: "All levels" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const FREQUENCY_OPTIONS = [
  { value: "", label: "Any frequency" },
  { value: "high", label: "High frequency" },
  { value: "medium", label: "Medium frequency" },
  { value: "low", label: "Low frequency" },
];

// ── Conjugation table (verbs only) ───────────────────────────
function ConjugationTable({ entry }: { entry: DictionaryEntry }) {
  const d = entry.verbData;
  if (!d) return null;
  return (
    <div className="vocab-conjugation">
      <h4 className="vocab-conjugation__title">Conjugation</h4>
      <div className="vocab-conjugation__grid">
        <div className="vocab-conjugation__section">
          <h5>Present (Tegenwoordige tijd)</h5>
          <table className="vocab-conjugation__table">
            <tbody>
              <tr><td>ik</td><td>{d.presentSg1}</td></tr>
              <tr><td>jij / je</td><td>{d.presentSg2} <span className="vocab-conjugation__inv">(inv: {d.presentSg2Inv})</span></td></tr>
              <tr><td>hij / zij / het</td><td>{d.presentSg3}</td></tr>
              <tr><td>wij / jullie / zij</td><td>{d.presentPl}</td></tr>
            </tbody>
          </table>
        </div>
        <div className="vocab-conjugation__section">
          <h5>Simple Past (Imperfectum)</h5>
          <table className="vocab-conjugation__table">
            <tbody>
              <tr><td>singular</td><td>{d.pastSg}</td></tr>
              <tr><td>plural</td><td>{d.pastPl}</td></tr>
            </tbody>
          </table>
        </div>
        <div className="vocab-conjugation__section">
          <h5>Perfect (Voltooid Tegenwoordige Tijd)</h5>
          <table className="vocab-conjugation__table">
            <tbody>
              <tr>
                <td>auxiliary</td>
                <td>
                  <span className="vocab-aux-badge">{d.auxiliary}</span>
                </td>
              </tr>
              <tr><td>past participle</td><td><strong>{d.pastParticiple}</strong></td></tr>
            </tbody>
          </table>
          <p className="vocab-conjugation__example">
            e.g. <em>ik heb/ben {d.pastParticiple}</em>
          </p>
        </div>
      </div>
      {d.separable && (
        <div className="vocab-conjugation__note">
          <span className="vocab-badge vocab-badge--separable">Separable</span>
          {" "}In main clauses, split: prefix &lsquo;<strong>{d.separablePrefix}</strong>&rsquo; goes to end.
          {" "}e.g. <em>Ik {d.presentSg1} hem {d.separablePrefix}.</em>
        </div>
      )}
      {d.isModal && (
        <div className="vocab-conjugation__note">
          <span className="vocab-badge vocab-badge--modal">Modal</span>
          {" "}Takes an infinitive complement at the end of the clause.
        </div>
      )}
    </div>
  );
}

// ── Vocab card ────────────────────────────────────────────────
function VocabCard({ entry }: { entry: DictionaryEntry }) {
  const [expanded, setExpanded] = useState(false);

  const posColor = {
    verb: "vocab-badge--verb",
    noun: "vocab-badge--noun",
    adjective: "vocab-badge--adj",
    adverb: "vocab-badge--adv",
    pronoun: "vocab-badge--pronoun",
    conjunction: "vocab-badge--conj",
    preposition: "vocab-badge--prep",
    article: "vocab-badge--article",
    numeral: "vocab-badge--num",
    unknown: "vocab-badge--unknown",
  }[entry.pos] ?? "vocab-badge--unknown";

  return (
    <div className={`vocab-card ${expanded ? "vocab-card--expanded" : ""}`}>
      <div
        className="vocab-card__header"
        onClick={() => setExpanded(!expanded)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setExpanded(!expanded)}
      >
        <div className="vocab-card__main">
          <span className="vocab-card__dutch">{entry.dutch}</span>
          {entry.gender && (
            <span className="vocab-card__gender">{entry.gender}</span>
          )}
          <span className={`vocab-badge ${posColor}`}>{entry.pos}</span>
          {entry.isVerb && entry.verbData?.separable && (
            <span className="vocab-badge vocab-badge--separable">sep.</span>
          )}
          {entry.isVerb && entry.verbData?.isModal && (
            <span className="vocab-badge vocab-badge--modal">modal</span>
          )}
        </div>
        <div className="vocab-card__right">
          <span className="vocab-card__english">{entry.english}</span>
          <div className="vocab-card__meta">
            <span className={`vocab-freq vocab-freq--${entry.frequency}`}>
              {entry.frequency}
            </span>
            <span className={`vocab-diff vocab-diff--${entry.difficulty}`}>
              {entry.difficulty}
            </span>
          </div>
        </div>
        {entry.isVerb && (
          <span className="vocab-card__expand-icon">{expanded ? "▲" : "▼"}</span>
        )}
      </div>

      {expanded && entry.isVerb && (
        <div className="vocab-card__detail">
          <ConjugationTable entry={entry} />
          {entry.category.length > 0 && (
            <div className="vocab-card__categories">
              {entry.category.map((c) => (
                <span key={c} className="vocab-category-tag">{c}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────

export default function VocabularySystem() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<VocabFilters>({});

  const stats = useMemo(() => getVocabStats(), []);
  const categories = useMemo(() => getAllCategories(), []);

  const results = useMemo(
    () => searchDictionary(query, filters, 60),
    [query, filters],
  );

  const updateFilter = useCallback(
    <K extends keyof VocabFilters>(key: K, value: VocabFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value || undefined }));
    },
    [],
  );

  return (
    <div className="vocabulary-system">
      {/* Stats bar */}
      <div className="vocab-stats-bar">
        <span className="vocab-stat-item">📚 {stats.total} entries</span>
        <span className="vocab-stat-item">🔤 {stats.verbs} verbs</span>
        <span className="vocab-stat-item">🏷 {stats.nouns} nouns</span>
        <span className="vocab-stat-item">✨ {stats.adjectives} adjectives</span>
        <span className="vocab-stat-item">💬 {stats.adverbs} adverbs</span>
      </div>

      {/* Search bar */}
      <div className="vocab-search-bar">
        <input
          className="vocab-search-input"
          type="text"
          placeholder="Search Dutch or English… (e.g. lopen, work, verbs)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
        />
        {query && (
          <button className="vocab-search-clear" onClick={() => setQuery("")}>
            ✕
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="vocab-filters">
        <select
          className="vocab-filter-select"
          value={filters.pos ?? ""}
          onChange={(e) => updateFilter("pos", e.target.value)}
        >
          {POS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <select
          className="vocab-filter-select"
          value={filters.difficulty ?? ""}
          onChange={(e) => updateFilter("difficulty", e.target.value as VocabFilters["difficulty"])}
        >
          {DIFFICULTY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <select
          className="vocab-filter-select"
          value={filters.frequency ?? ""}
          onChange={(e) => updateFilter("frequency", e.target.value as VocabFilters["frequency"])}
        >
          {FREQUENCY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <select
          className="vocab-filter-select"
          value={filters.category ?? ""}
          onChange={(e) => updateFilter("category", e.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {filters.pos === "verb" && (
          <>
            <label className="vocab-filter-checkbox">
              <input
                type="checkbox"
                checked={filters.separableOnly ?? false}
                onChange={(e) => updateFilter("separableOnly", e.target.checked || undefined)}
              />
              Separable only
            </label>
            <select
              className="vocab-filter-select"
              value={filters.verbType ?? ""}
              onChange={(e) => updateFilter("verbType", e.target.value)}
            >
              <option value="">All verb types</option>
              <option value="weak">Weak</option>
              <option value="strong">Strong</option>
              <option value="modal">Modal</option>
              <option value="irregular">Irregular</option>
              <option value="mixed">Mixed</option>
            </select>
          </>
        )}

        <button
          className="vocab-filter-reset"
          onClick={() => { setFilters({}); setQuery(""); }}
        >
          Reset
        </button>
      </div>

      {/* Results count */}
      <div className="vocab-results-count">
        {results.length} {results.length === 1 ? "entry" : "entries"} found
        {results.length === 60 && " (showing first 60)"}
      </div>

      {/* Results */}
      <div className="vocab-results">
        {results.length === 0 ? (
          <div className="vocab-empty">
            No entries found. Try a different search or reset the filters.
          </div>
        ) : (
          results.map((entry) => <VocabCard key={entry.id} entry={entry} />)
        )}
      </div>
    </div>
  );
}
