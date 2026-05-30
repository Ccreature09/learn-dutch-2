"use client";

import { useState } from "react";
import { useFlashcardStore } from "@/lib/modules/flashcard-store";
import type { Difficulty } from "@/lib/grammar/types";

type Mode = "browse" | "review" | "create";

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
  } = useFlashcardStore();

  const [mode, setMode] = useState<Mode>("browse");
  const [flipped, setFlipped] = useState(false);
  const [newFront, setNewFront] = useState("");
  const [newBack, setNewBack] = useState("");
  const [newCategory, setNewCategory] = useState("custom");
  const [newDifficulty, setNewDifficulty] = useState<Difficulty>("beginner");
  const [filter, setFilter] = useState("");
  const [sessionCount, setSessionCount] = useState(15);
  const [sessionDifficulty, setSessionDifficulty] = useState<Difficulty | "">("");

  const progress = sessionProgress();
  const active = currentCard();
  const sessionStarted = sessionTotal > 0;
  const sessionDone = sessionStarted && progress.remaining === 0;

  function handleReview(correct: boolean) {
    if (!active) return;
    reviewCard(active.id, correct);
    setFlipped(false);
  }

  function beginSession() {
    startSession(sessionCount, sessionDifficulty || undefined);
    setFlipped(false);
    setMode("review");
  }

  function handleEndSession() {
    endSession();
    setFlipped(false);
    setMode("browse");
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

  const filteredCards = filter
    ? cards.filter(
        (c) =>
          c.front.toLowerCase().includes(filter.toLowerCase()) ||
          c.back.toLowerCase().includes(filter.toLowerCase()) ||
          c.category.toLowerCase().includes(filter.toLowerCase()),
      )
    : cards;

  return (
    <div className="module-container">
      <div className="module-header">
        <h2 className="module-title">Flashcard System</h2>
        <p className="module-subtitle">
          Count-based spaced repetition — {cards.length} cards in your deck.
        </p>
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
        <div>
          <input
            className="search-input"
            placeholder="Filter cards…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <div className="card-grid">
            {filteredCards.map((card) => (
              <div key={card.id} className="flashcard-tile">
                <div className="flashcard-tile__front">{card.front}</div>
                <div className="flashcard-tile__back">{card.back}</div>
                <div className="flashcard-tile__meta">
                  <span className={`badge badge--${card.difficulty}`}>{card.difficulty}</span>
                  <span className="badge badge--category">{card.category}</span>
                  {card.timesReviewed > 0 && (
                    <span className="badge badge--score">
                      {Math.round((card.timesCorrect / card.timesReviewed) * 100)}%
                    </span>
                  )}
                  <span className="badge badge--interval" title="Review interval">
                    ×{card.reviewInterval}
                  </span>
                </div>
                <div className="flashcard-tile__actions">
                  {card.isUserCreated && (
                    <button
                      className="btn btn--danger btn--xs"
                      onClick={() => removeCard(card.id)}
                    >
                      Remove
                    </button>
                  )}
                  <button
                    className="btn btn--ghost btn--xs"
                    onClick={() => resetCard(card.id)}
                  >
                    Reset
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Review ── */}
      {mode === "review" && (
        <div className="review-container">
          {/* Session setup */}
          {!sessionStarted && (
            <div className="session-setup">
              <h3 className="session-setup__title">Configure Session</h3>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Cards per session</label>
                  <input
                    className="form-input"
                    type="number"
                    min={5}
                    max={50}
                    value={sessionCount}
                    onChange={(e) => setSessionCount(Number(e.target.value))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Difficulty</label>
                  <select
                    className="control-select"
                    value={sessionDifficulty}
                    onChange={(e) =>
                      setSessionDifficulty(e.target.value as Difficulty | "")
                    }
                  >
                    <option value="">All levels</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
              <button className="btn btn--primary" onClick={beginSession}>
                Start Session
              </button>
            </div>
          )}

          {/* Session done */}
          {sessionStarted && sessionDone && (
            <div className="session-complete">
              <h3>Session Complete!</h3>
              <p>You reviewed {progress.done} card{progress.done !== 1 ? "s" : ""}.</p>
              <div className="session-complete__actions">
                <button className="btn btn--primary" onClick={beginSession}>
                  New Session
                </button>
                <button className="btn btn--ghost" onClick={handleEndSession}>
                  Back to Browse
                </button>
              </div>
            </div>
          )}

          {/* Active card */}
          {sessionStarted && !sessionDone && active && (
            <div className="review-panel">
              <div className="session-progress-bar">
                <div
                  className="session-progress-bar__fill"
                  style={{ width: `${(progress.done / progress.total) * 100}%` }}
                />
              </div>
              <div className="session-progress-label">
                {progress.done} done · {progress.remaining} remaining
              </div>

              <div
                className={`flashcard ${flipped ? "flashcard--flipped" : ""}`}
                onClick={() => setFlipped((f) => !f)}
              >
                <div className="flashcard__inner">
                  <div className="flashcard__front">
                    <span className="flashcard__text">{active.front}</span>
                    <span className="flashcard__tap-hint">Tap to reveal</span>
                  </div>
                  <div className="flashcard__back">
                    <span className="flashcard__text">{active.back}</span>
                    {active.example && (
                      <div className="flashcard__example">
                        <em>{active.example}</em>
                        {active.exampleTranslation && (
                          <span> — {active.exampleTranslation}</span>
                        )}
                      </div>
                    )}
                    <div className="flashcard__interval-note">
                      Interval: every {active.reviewInterval} cards
                    </div>
                  </div>
                </div>
              </div>

              {flipped && (
                <div className="review-actions">
                  <button className="btn btn--danger" onClick={() => handleReview(false)}>
                    Again
                  </button>
                  <button className="btn btn--success" onClick={() => handleReview(true)}>
                    Got it!
                  </button>
                </div>
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
