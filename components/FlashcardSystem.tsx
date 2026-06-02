"use client";

import { useState, useEffect, useCallback } from "react";
import { useFlashcardStore } from "@/lib/modules/flashcard-store";
import { dutchNumber } from "@/lib/data/numbers";
import type { Difficulty } from "@/lib/grammar/types";

type Mode = "browse" | "review" | "create";

const DECK_CATEGORIES = [
  { value: "",             label: "All Cards",    emoji: "🃏" },
  { value: "verbs",        label: "Verbs",        emoji: "🔤" },
  { value: "noun",         label: "Nouns",        emoji: "📦" },
  { value: "de-het",       label: "De / Het",     emoji: "🔵" },
  { value: "adjective",    label: "Adjectives",   emoji: "🎨" },
  { value: "adverb",       label: "Adverbs",      emoji: "⚡" },
  { value: "preposition",  label: "Prepositions", emoji: "📍" },
  { value: "conjunction",  label: "Conjunctions", emoji: "🔗" },
  { value: "numeral",      label: "Numbers",      emoji: "🔢" },
  { value: "sentences",    label: "Sentences",    emoji: "💬" },
  { value: "__mine__",     label: "My Cards",     emoji: "⭐" },
] as const;

type DeckCategory = (typeof DECK_CATEGORIES)[number]["value"];

const CATEGORY_ACCENT: Record<string, string> = {
  verbs:       "#21468B",
  noun:        "#16a34a",
  adjective:   "#d97706",
  adverb:      "#7c3aed",
  preposition: "#0891b2",
  conjunction: "#db2777",
  numeral:     "#b45309",
  sentences:   "#475569",
};

function deckLabel(value: string) {
  const d = DECK_CATEGORIES.find((x) => x.value === value);
  return d ? `${d.emoji} ${d.label}` : value;
}

export default function FlashcardSystem() {
  const {
    cards,
    addCard,
    removeCard,
    reviewCard,
    resetCard,
    startSession,
    endSession,
    currentCard,
    sessionProgress,
    sessionTotal,
    cycleCount,
  } = useFlashcardStore();

  const [mode,             setMode]             = useState<Mode>("browse");
  const [flipped,          setFlipped]          = useState(false);
  const [newFront,         setNewFront]         = useState("");
  const [newBack,          setNewBack]          = useState("");
  const [newCategory,      setNewCategory]      = useState("verbs");
  const [newDifficulty,    setNewDifficulty]    = useState<Difficulty>("beginner");
  const [filter,           setFilter]           = useState("");
  const [browseCategory,   setBrowseCategory]   = useState<DeckCategory>("");
  const [sessionDifficulty,setSessionDifficulty]= useState<Difficulty | "">("");
  const [sessionCategory,  setSessionCategory]  = useState<DeckCategory>("");
  const [noTransition,     setNoTransition]     = useState(false);
  // B9: cycleCount now comes from the store — removed from component state
  const [isDeHetMode,      setIsDeHetMode]      = useState(false);
  const [deHetFeedback,    setDeHetFeedback]    = useState<{ chosen: "de" | "het"; correct: boolean } | null>(null);
  const [isLiveNumbers,    setIsLiveNumbers]    = useState(false);
  const [liveNumber,       setLiveNumber]       = useState<{ value: number; dutch: string } | null>(null);
  const [liveFlipped,      setLiveFlipped]      = useState(false);
  const [liveDrillCount,   setLiveDrillCount]   = useState(0);

  const newLiveNumber = useCallback(() => {
    const v = Math.floor(Math.random() * 100_000) + 1;
    setLiveNumber({ value: v, dutch: dutchNumber(v) });
    setLiveFlipped(false);
  }, []);

  const progress       = sessionProgress();
  const active         = currentCard();
  const sessionStarted = sessionTotal > 0 || isLiveNumbers;
  const sessionDone    = false; // session is infinite — deck recycles automatically

  // Keyboard shortcuts in review mode
  useEffect(() => {
    if (mode !== "review" || !sessionStarted || sessionDone || (!active && !isLiveNumbers)) return;
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (isLiveNumbers) {
        if ((e.key === " " || e.key === "Enter") && !liveFlipped) { e.preventDefault(); setLiveFlipped(true); }
        else if ((e.key === "Enter" || e.key === "ArrowRight") && liveFlipped) { e.preventDefault(); setLiveDrillCount((n) => n + 1); newLiveNumber(); }
        return;
      }
      if (isDeHetMode) {
        if (!deHetFeedback) {
          if (e.key === "d" || e.key === "D") { e.preventDefault(); handleDeHet("de"); }
          if (e.key === "h" || e.key === "H") { e.preventDefault(); handleDeHet("het"); }
        } else {
          if (e.key === "Enter" || e.key === "ArrowRight") { e.preventDefault(); advanceDeHet(); }
        }
        return;
      }
      if ((e.key === " " || e.key === "Enter") && !flipped) {
        e.preventDefault();
        setFlipped(true);
      } else if ((e.key === "Enter" || e.key === "ArrowRight") && flipped) {
        e.preventDefault();
        handleReview(true);
      } else if (e.key === "ArrowLeft" && flipped) {
        e.preventDefault();
        handleReview(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, flipped, isDeHetMode, deHetFeedback, isLiveNumbers, liveFlipped, sessionStarted, sessionDone, active?.id]);

  // B9: cycleCount is now tracked in the Zustand store — no component-level cycle detection needed.

  function handleReview(correct: boolean) {
    if (!active) return;
    const cardId = active.id;
    // 1. Snap the current card to its front face with no animation.
    //    These React state updates are batched and will paint before rAF fires.
    setNoTransition(true);
    setFlipped(false);
    // 2. Only after that paint: swap to the next card (Zustand update is
    //    synchronous, so deferring it prevents the new card from rendering
    //    in the flipped/English state for one frame).
    requestAnimationFrame(() => {
      reviewCard(cardId, correct);
      // 3. Re-enable the flip transition for the next user-initiated flip.
      requestAnimationFrame(() => setNoTransition(false));
    });
  }

  function beginSession() {
    if (sessionCategory === "numeral") {
      setIsLiveNumbers(true);
      setLiveDrillCount(0);
      newLiveNumber();
      setIsDeHetMode(false);
      setDeHetFeedback(null);
      setFlipped(false);
      setMode("review");
      return;
    }
    const isDeHet = sessionCategory === "de-het";
    const effectiveCategory = isDeHet ? "noun" : sessionCategory || undefined;
    startSession(undefined, sessionDifficulty || undefined, effectiveCategory);
    setIsDeHetMode(isDeHet);
    setDeHetFeedback(null);
    setIsLiveNumbers(false);
    setFlipped(false);
    setMode("review");
  }

  function handleEndSession() {
    endSession();
    setFlipped(false);
    setIsDeHetMode(false);
    setDeHetFeedback(null);
    setIsLiveNumbers(false);
    setLiveNumber(null);
    setMode("browse");
  }

  function advanceDeHet() {
    if (!deHetFeedback || !active) return;
    const correct = deHetFeedback.correct;
    setDeHetFeedback(null);
    handleReview(correct);
  }

  function handleDeHet(chosen: "de" | "het") {
    if (!active || deHetFeedback) return;
    const correctGender = active.front.startsWith("de ") ? "de" : "het";
    const correct = chosen === correctGender;
    setDeHetFeedback({ chosen, correct });
  }

  function handleCreate() {
    if (!newFront.trim() || !newBack.trim()) return;
    addCard({
      front: newFront.trim(),
      back: newBack.trim(),
      category: newCategory,
      tags: [newCategory, newDifficulty],
      difficulty: newDifficulty,
      isUserCreated: true,
    });
    setNewFront("");
    setNewBack("");
  }

  const filteredCards = cards.filter((c) => {
    const catOk =
      !browseCategory ||
      (browseCategory === "__mine__"
        ? c.isUserCreated
        : browseCategory === "de-het"
          ? c.category === "noun"
          : c.category === browseCategory);
    const q = filter.toLowerCase();
    const textOk =
      !q ||
      c.front.toLowerCase().includes(q) ||
      c.back.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q);
    return catOk && textOk;
  });

  function countFor(cat: DeckCategory) {
    if (cat === "")         return cards.length;
    if (cat === "__mine__") return cards.filter((c) => c.isUserCreated).length;
    if (cat === "de-het")   return cards.filter((c) => c.category === "noun").length;
    if (cat === "numeral")  return Infinity; // live-generated — infinite
    return cards.filter((c) => c.category === cat).length;
  }

  const accuracyColor = (pct: number) =>
    pct >= 80 ? "badge--pass" : pct >= 50 ? "badge--warning" : "badge--fail";

  return (
    <div className="module-container">
      <div className="module-header">
        <h2 className="module-title">Flashcards</h2>
        <p className="module-subtitle">{cards.length} cards · spaced repetition</p>
      </div>

      {/* Mode tabs */}
      <div className="tabs">
        {(["browse", "review", "create"] as Mode[]).map((m) => (
          <button
            key={m}
            className={`tab ${mode === m ? "tab--active" : ""}`}
            onClick={() => setMode(m)}
          >
            {m === "browse"
              ? `Browse (${cards.length})`
              : m === "review"
                ? "Review"
                : "Create"}
          </button>
        ))}
      </div>

      {/* ── Browse ── */}
      {mode === "browse" && (
        <div className="fc-browse">
          <div className="fc-toolbar">
            <div className="fc-chips">
              {DECK_CATEGORIES.map(({ value, label, emoji }) => {
                const n = countFor(value);
                if (n === 0 && value !== "") return null;
                return (
                  <button
                    key={value}
                    className={`fc-chip ${browseCategory === value ? "fc-chip--active" : ""}`}
                    onClick={() => { setBrowseCategory(value); setFilter(""); }}
                  >
                    <span>{emoji} {label}</span>
                    <span className="fc-chip-count">{n}</span>
                  </button>
                );
              })}
            </div>
            <input
              className="search-input"
              placeholder="Search cards…"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>

          <p className="fc-result-label">
            {filteredCards.length} card{filteredCards.length !== 1 ? "s" : ""}
            {browseCategory ? ` · ${deckLabel(browseCategory)}` : ""}
          </p>

          <div className="card-grid">
            {filteredCards.map((card) => (
              <div
                key={card.id}
                className="flashcard-tile"
                style={{ borderLeftColor: CATEGORY_ACCENT[card.category] ?? "var(--color-primary)" }}
              >
                <div className="flashcard-tile__cat">{deckLabel(card.category)}</div>
                <div className="flashcard-tile__front">{card.front}</div>
                <div className="flashcard-tile__back">{card.back}</div>
                {card.example && (
                  <div className="flashcard-tile__example">{card.example}</div>
                )}
                {/* F7: CSS-only conjugation popover for verb tiles */}
                {card.category === "verbs" && card.verbData && (
                  <div
                    className="flashcard-tile__popover-trigger"
                    tabIndex={0}
                    aria-label={`Conjugation forms for ${card.verbData.infinitive}`}
                  >
                    <span className="flashcard-tile__popover-hint">Forms ▾</span>
                    <div className="flashcard-tile__popover" role="tooltip">
                      <table className="flashcard-tile__conj-table">
                        <tbody>
                          <tr>
                            <td className="flashcard-tile__conj-label">infinitief</td>
                            <td className="flashcard-tile__conj-form">{card.verbData.infinitive}</td>
                          </tr>
                          <tr>
                            <td className="flashcard-tile__conj-label">ik</td>
                            <td className="flashcard-tile__conj-form">{card.verbData.presentSg1}</td>
                          </tr>
                          <tr>
                            <td className="flashcard-tile__conj-label">hij/zij</td>
                            <td className="flashcard-tile__conj-form">{card.verbData.presentSg3}</td>
                          </tr>
                          <tr>
                            <td className="flashcard-tile__conj-label">voltooid dw.</td>
                            <td className="flashcard-tile__conj-form">{card.verbData.pastParticiple}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                <div className="flashcard-tile__meta">
                  <span className={`badge badge--${card.difficulty}`}>{card.difficulty}</span>
                  {card.timesReviewed > 0 && (
                    <span className={`badge ${accuracyColor(Math.round((card.timesCorrect / card.timesReviewed) * 100))}`}>
                      {Math.round((card.timesCorrect / card.timesReviewed) * 100)}%
                    </span>
                  )}
                  <span className="badge badge--muted" title="Review interval">×{card.reviewInterval}</span>
                </div>
                <div className="flashcard-tile__actions">
                  {card.isUserCreated && (
                    <button className="btn btn--danger btn--xs" onClick={() => removeCard(card.id)}>Remove</button>
                  )}
                  <button className="btn btn--ghost btn--xs" onClick={() => resetCard(card.id)}>Reset</button>
                </div>
              </div>
            ))}
            {filteredCards.length === 0 && (
              <p className="fc-empty">No cards match this filter.</p>
            )}
          </div>
        </div>
      )}

      {/* ── Review ── */}
      {mode === "review" && (
        <div className="review-container">
          {/* Session setup */}
          {!sessionStarted && (
            <div className="session-setup">
              <h3 className="session-setup__title">Choose Your Deck</h3>

              <div className="fc-deck-grid">
                {DECK_CATEGORIES.map(({ value, label, emoji }) => {
                  const n = countFor(value);
                  if (n === 0 && value !== "") return null;
                  const countLabel = n === Infinity ? "∞ cards" : `${n} cards`;
                  return (
                    <button
                      key={value}
                      className={`fc-deck-card ${sessionCategory === value ? "fc-deck-card--active" : ""}`}
                      onClick={() => setSessionCategory(value)}
                    >
                      <span className="fc-deck-card__emoji">{emoji}</span>
                      <span className="fc-deck-card__label">{label}</span>
                      <span className="fc-deck-card__count">{countLabel}</span>
                    </button>
                  );
                })}
              </div>

              <div className="session-options">
                <div className="form-group">
                  <label className="form-label">Difficulty</label>
                  <select
                    className="control-select"
                    value={sessionDifficulty}
                    onChange={(e) => setSessionDifficulty(e.target.value as Difficulty | "")}
                  >
                    <option value="">All levels</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <button className="btn btn--primary btn--lg" onClick={beginSession}>
                Start Session →
              </button>
            </div>
          )}

          {/* Live number drill (Numbers deck) */}
          {isLiveNumbers && liveNumber && (
            <div className="review-panel">
              <div className="fc-progress-label">
                🔢 Numbers drilled this session: <strong>{liveDrillCount}</strong>
              </div>

              <div
                className={`flashcard ${liveFlipped ? "flashcard--flipped" : ""}`}
                onClick={() => !liveFlipped && setLiveFlipped(true)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === " " && !liveFlipped && setLiveFlipped(true)}
              >
                <div className="flashcard__inner">
                  <div className="flashcard__front">
                    <span className="flashcard__lang-badge">EN</span>
                    <span className="flashcard__text" style={{ fontSize: "3rem", fontWeight: 800 }}>
                      {liveNumber.value.toLocaleString("en")}
                    </span>
                    <span className="flashcard__tap-hint">Click · Space · Enter</span>
                  </div>
                  <div className="flashcard__back">
                    <span className="flashcard__lang-badge">NL</span>
                    <span className="flashcard__text">{liveNumber.dutch}</span>
                  </div>
                </div>
              </div>

              {liveFlipped ? (
                <button
                  className="btn btn--primary btn--lg"
                  onClick={() => { setLiveDrillCount((n) => n + 1); newLiveNumber(); }}
                >
                  Next number →
                </button>
              ) : (
                <p className="fc-key-hint">Click the card to reveal the Dutch word</p>
              )}

              <button className="btn btn--ghost btn--sm" onClick={handleEndSession} style={{ marginTop: "0.5rem" }}>
                End session
              </button>
            </div>
          )}

          {/* Active SRS card */}
          {!isLiveNumbers && sessionStarted && active && (
            <div className="review-panel">
              <div className="fc-progress-bar">
                <div
                  className="fc-progress-bar__fill"
                  style={{ width: `${(progress.done / progress.total) * 100}%` }}
                />
              </div>
              <div className="fc-progress-label">
                {progress.done} / {progress.total}
                <span className="fc-progress-remaining"> · {progress.remaining} left</span>
                {cycleCount > 0 && (
                  <span className="fc-cycle-badge">cycle {cycleCount + 1}</span>
                )}
              </div>

              {isDeHetMode ? (() => {
                const spaceIdx = active.front.indexOf(" ");
                const noun = spaceIdx >= 0 ? active.front.slice(spaceIdx + 1) : active.front;
                const correctGender = active.front.startsWith("de ") ? "de" : "het";
                return (
                  <div className="dehet-game">
                    <div className="dehet-noun">{noun}</div>
                    <p className="dehet-translation">{active.back}</p>
                    <div className="dehet-buttons">
                      {(["de", "het"] as const).map((art) => {
                        let cls = "btn btn--dehet";
                        if (deHetFeedback) {
                          if (art === correctGender) cls += " btn--dehet-correct";
                          else if (art === deHetFeedback.chosen && !deHetFeedback.correct) cls += " btn--dehet-wrong";
                        }
                        return (
                          <button
                            key={art}
                            className={cls}
                            onClick={() => handleDeHet(art)}
                            disabled={!!deHetFeedback}
                          >
                            {art}
                          </button>
                        );
                      })}
                    </div>
                    <p className="dehet-key-hint">D = de &nbsp;·&nbsp; H = het</p>
                    {deHetFeedback && (
                      <button className="btn btn--primary" onClick={advanceDeHet} style={{ marginTop: "0.5rem" }}>
                        Next → <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>(Enter)</span>
                      </button>
                    )}
                  </div>
                );
              })() : (
                <>
                  <div
                    className={`flashcard ${flipped ? "flashcard--flipped" : ""} ${noTransition ? "flashcard--no-transition" : ""}`}
                    onClick={() => setFlipped((f) => !f)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === " " && setFlipped((f) => !f)}
                  >
                    <div className="flashcard__inner">
                      <div className="flashcard__front">
                        <span className="flashcard__lang-badge">NL</span>
                        <span className="flashcard__text">{active.front}</span>
                        <span className="flashcard__tap-hint">Click · Space · Enter</span>
                      </div>
                      <div className="flashcard__back">
                        <span className="flashcard__lang-badge flashcard__lang-badge--en">EN</span>
                        <span className="flashcard__text">{active.back}</span>
                        {active.example && (
                          <div className="flashcard__example">
                            <em>{active.example}</em>
                            {active.exampleTranslation && (
                              <span> — {active.exampleTranslation}</span>
                            )}
                          </div>
                        )}
                        <span className="flashcard__cat-tag">{deckLabel(active.category)}</span>
                      </div>
                    </div>
                  </div>

                  {flipped ? (
                    <div className="review-actions">
                      <button className="btn btn--again" onClick={() => handleReview(false)}>
                        <span className="rba-icon">✗</span>
                        <span className="rba-label">Again</span>
                        <span className="rba-key">← Arrow</span>
                      </button>
                      <button className="btn btn--got-it" onClick={() => handleReview(true)}>
                        <span className="rba-icon">✓</span>
                        <span className="rba-label">Got it!</span>
                        <span className="rba-key">→ Arrow</span>
                      </button>
                    </div>
                  ) : (
                    <p className="fc-key-hint">← Again &nbsp;·&nbsp; → Got it &nbsp;(after flipping)</p>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Create ── */}
      {mode === "create" && (
        <div className="create-card-form">
          <h3 className="form-title">Create a New Flashcard</h3>
          <div className="form-group">
            <label className="form-label">Front (question / Dutch word)</label>
            <input
              className="form-input"
              placeholder="e.g. werken"
              value={newFront}
              onChange={(e) => setNewFront(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Back (answer / English)</label>
            <input
              className="form-input"
              placeholder="e.g. to work"
              value={newBack}
              onChange={(e) => setNewBack(e.target.value)}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Category</label>
              <input
                className="form-input"
                placeholder="e.g. verbs"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Difficulty</label>
              <select
                className="control-select"
                value={newDifficulty}
                onChange={(e) => setNewDifficulty(e.target.value as Difficulty)}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
          <button
            className="btn btn--primary"
            onClick={handleCreate}
            disabled={!newFront.trim() || !newBack.trim()}
          >
            Add Card
          </button>
        </div>
      )}
    </div>
  );
}
