"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { BuilderWord, SentenceCategory, Difficulty } from "@/lib/grammar/types";
import { getBuilderExercises, checkBuilderAnswer, type BuilderExercise } from "@/lib/modules/sentence-builder";
import { validateSentence } from "@/lib/grammar/engine";
import FreeSentenceBuilder from "@/components/FreeSentenceBuilder";

// ── Sortable Word Tile ────────────────────────────────────────
function SortableWord({ word, checked }: { word: BuilderWord; checked: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: word.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`word-tile ${checked ? "word-tile--checking" : ""}`}
      title={word.hint ?? ""}
    >
      {word.surface}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────
export default function SentenceBuilder() {
  const [mode, setMode] = useState<"structured" | "free">("structured");
  const [exercises, setExercises] = useState<BuilderExercise[]>([]);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [arranged, setArranged] = useState<BuilderWord[]>([]);
  const [checked, setChecked] = useState(false);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [naturalScore, setNaturalScore] = useState<number | null>(null);
  const [category, setCategory] = useState<SentenceCategory | "">("");
  const [difficulty, setDifficulty] = useState<Difficulty | "">("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    loadExercises();
  }, []);

  function loadExercises() {
    const ex = getBuilderExercises({
      category: category || undefined,
      difficulty: difficulty || undefined,
      count: 10,
    });
    setExercises(ex);
    setExerciseIndex(0);
    loadExercise(ex[0]);
  }

  function loadExercise(ex: BuilderExercise | undefined) {
    if (!ex) return;
    setArranged(ex.words);
    setChecked(false);
    setFeedback(null);
    setNaturalScore(null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = arranged.findIndex((w) => w.id === active.id);
    const newIndex = arranged.findIndex((w) => w.id === over.id);
    setArranged(arrayMove(arranged, oldIndex, newIndex));
  }

  function checkAnswer() {
    const exercise = exercises[exerciseIndex];
    if (!exercise) return;
    const result = checkBuilderAnswer(exercise, arranged);
    const sentence = arranged.map((w) => w.surface).join(" ");
    const validation = validateSentence(sentence);
    setNaturalScore(validation.naturalScore);
    setFeedback({ isCorrect: result.isCorrect, message: result.feedback });
    setChecked(true);
  }

  function next() {
    const nextIdx = exerciseIndex + 1;
    if (nextIdx >= exercises.length) {
      loadExercises();
      return;
    }
    setExerciseIndex(nextIdx);
    loadExercise(exercises[nextIdx]);
  }

  const exercise = exercises[exerciseIndex];

  return (
    <div className="module-container">
      <div className="module-header">
        <h2 className="module-title">Sentence Builder</h2>
        <p className="module-subtitle">
          Two modes: arrange scrambled tiles (Structured), or build freely from a vocabulary bank (Free).
        </p>
      </div>

      {/* Mode tabs */}
      <div className="builder-mode-tabs">
        <button
          className={`builder-mode-tab ${mode === "structured" ? "builder-mode-tab--active" : ""}`}
          onClick={() => setMode("structured")}
        >
          Structured
        </button>
        <button
          className={`builder-mode-tab ${mode === "free" ? "builder-mode-tab--active" : ""}`}
          onClick={() => setMode("free")}
        >
          Free Builder
        </button>
      </div>

      {mode === "free" ? (
        <FreeSentenceBuilder />
      ) : (
        <>
      <div className="controls-row">
        <div className="control-group">
          <label className="control-label">Category</label>
          <select
            className="control-select"
            value={category}
            onChange={(e) => setCategory(e.target.value as SentenceCategory | "")}
          >
            <option value="">All</option>
            <option value="basic">Basic</option>
            <option value="modal_verbs">Modal Verbs</option>
            <option value="questions">Questions</option>
            <option value="subordinate_clauses">Subordinate Clauses</option>
            <option value="separable_verbs">Separable Verbs</option>
          </select>
        </div>
        <div className="control-group">
          <label className="control-label">Difficulty</label>
          <select
            className="control-select"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty | "")}
          >
            <option value="">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        <button className="btn btn--ghost" onClick={loadExercises}>
          Reload Exercises
        </button>
      </div>

      {exercise ? (
        <>
          <div className="builder-progress">
            Exercise {exerciseIndex + 1} / {exercises.length}
          </div>

          <div className="builder-prompt">
            <span className="builder-prompt__label">English:</span>
            <span className="builder-prompt__text">{exercise.englishPrompt}</span>
          </div>

          {exercise.structureHint && (
            <div className="builder-hint">
              Structure: <em>{exercise.structureHint}</em>
            </div>
          )}

          {/* Drag & Drop area */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={arranged.map((w) => w.id)}
              strategy={horizontalListSortingStrategy}
            >
              <div className="builder-drop-zone">
                {arranged.map((word) => (
                  <SortableWord key={word.id} word={word} checked={checked} />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {/* Preview */}
          <div className="builder-preview">
            {arranged.map((w) => w.surface).join(" ")}
          </div>

          {/* Actions */}
          {!checked ? (
            <button className="btn btn--primary" onClick={checkAnswer}>
              Check Answer
            </button>
          ) : (
            <button className="btn btn--secondary" onClick={next}>
              Next Exercise →
            </button>
          )}

          {/* Feedback */}
          {feedback && (
            <div className={`builder-feedback ${feedback.isCorrect ? "builder-feedback--correct" : "builder-feedback--incorrect"}`}>
              <p className="builder-feedback__message">
                {feedback.isCorrect ? "✓" : "✗"} {feedback.message}
              </p>
              {naturalScore !== null && (
                <p className="builder-feedback__score">
                  Natural score: {naturalScore}/100
                </p>
              )}
              {!feedback.isCorrect && (
                <p className="builder-feedback__correct">
                  Correct: <strong>{exercise.correctSentence}</strong>
                </p>
              )}
              {exercise.grammaticalNotes.length > 0 && (
                <ul className="builder-feedback__notes">
                  {exercise.grammaticalNotes.map((n, i) => <li key={i}>{n}</li>)}
                </ul>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="empty-state">Loading exercises…</div>
      )}
        </>
      )}
    </div>
  );
}
