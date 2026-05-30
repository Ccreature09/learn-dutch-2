// ─────────────────────────────────────────────────────────────
// Scenario Generator — Dutch Learning Platform
//
// Generates structured multi-step exercise sequences that force
// tense variation, inversion, and clause complexity within a
// narrative context.  Each step constrains the sentence pattern
// so learners practise a specific grammatical structure in a
// coherent story arc.
// ─────────────────────────────────────────────────────────────

import {
  generateSentence,
  type ProceduralSentence,
  type SentencePattern,
} from "@/lib/modules/procedural-generator";

// ── Types ─────────────────────────────────────────────────────

export interface ScenarioStep {
  stepNumber:      number;
  contextEN:       string;     // Narrative context shown to the learner
  grammarFocus:    string;     // Short grammar tip for this step
  requiredPattern: SentencePattern;
  sentence:        ProceduralSentence;
}

export interface GeneratedScenario {
  id:          string;
  title:       string;
  titleNL:     string;
  description: string;
  emoji:       string;
  steps:       ScenarioStep[];
}

interface StepTemplate {
  contextEN:       string;
  grammarFocus:    string;
  requiredPattern: SentencePattern;
}

interface ScenarioTemplate {
  id:          string;
  title:       string;
  titleNL:     string;
  description: string;
  emoji:       string;
  steps:       StepTemplate[];
}

// ── Scenario definitions ──────────────────────────────────────

const TEMPLATES: ScenarioTemplate[] = [
  {
    id:          "normal_day",
    title:       "A Normal Day",
    titleNL:     "Een Gewone Dag",
    description: "Daily routine: present tense, modals, and perfect tense.",
    emoji:       "☀️",
    steps: [
      {
        contextEN:       "Describe a simple everyday action — something you or someone else does.",
        grammarFocus:    "Basic S + V + O",
        requiredPattern: "svo",
      },
      {
        contextEN:       "Add when or where the action happens — start with a time/place word.",
        grammarFocus:    "Fronted adverb → verb must come second (V2 rule)",
        requiredPattern: "adv_svo",
      },
      {
        contextEN:       "Say what you must or want to do next.",
        grammarFocus:    "Modal verb + object + infinitive at the end",
        requiredPattern: "modal_obj",
      },
      {
        contextEN:       "Talk about something that has already happened today.",
        grammarFocus:    "Perfect tense: hebben + past participle",
        requiredPattern: "perfect_hebben",
      },
      {
        contextEN:       "Set a condition for something you would like to do.",
        grammarFocus:    "Als-clause (verb final) + main clause (V2 inversion)",
        requiredPattern: "conditional_als",
      },
    ],
  },
  {
    id:          "travel",
    title:       "Going on a Trip",
    titleNL:     "Op Reis",
    description: "Travel language: questions, inversion, and past events.",
    emoji:       "✈️",
    steps: [
      {
        contextEN:       "Say when you are departing or arriving.",
        grammarFocus:    "Fronted time adverb forces subject-verb inversion",
        requiredPattern: "adv_sv",
      },
      {
        contextEN:       "Ask for information: where something is or where someone goes.",
        grammarFocus:    "WH-question: WH-word + verb + subject",
        requiredPattern: "wh_question",
      },
      {
        contextEN:       "Say what you want to do or see on the trip.",
        grammarFocus:    "Modal + object + infinitive (infinitive goes last)",
        requiredPattern: "modal_obj",
      },
      {
        contextEN:       "Describe where you have been — movement verbs use zijn.",
        grammarFocus:    "Perfect tense: zijn + past participle",
        requiredPattern: "perfect_zijn",
      },
      {
        contextEN:       "Describe a person or place you encountered.",
        grammarFocus:    "Noun + die/dat + verb-final relative clause",
        requiredPattern: "relative_clause",
      },
    ],
  },
  {
    id:          "work",
    title:       "At the Office",
    titleNL:     "Op Het Werk",
    description: "Separable verbs, subordinate clauses, and passive voice.",
    emoji:       "💼",
    steps: [
      {
        contextEN:       "Describe a separable-verb action at work — calling, starting, looking up.",
        grammarFocus:    "Separable verb: base form stays, prefix moves to sentence end",
        requiredPattern: "separable",
      },
      {
        contextEN:       "Explain why something is done or share what you think.",
        grammarFocus:    "dat/omdat: subject + [object] + verb at the very end",
        requiredPattern: "subordinate",
      },
      {
        contextEN:       "Ask your colleague a yes/no question.",
        grammarFocus:    "Polar question: finite verb first, then subject",
        requiredPattern: "polar_question",
      },
      {
        contextEN:       "Describe something that is done regularly (passive construction).",
        grammarFocus:    "Passive: object + wordt + past participle",
        requiredPattern: "passive",
      },
      {
        contextEN:       "Describe a completed task from earlier today.",
        grammarFocus:    "Perfect tense: hebben + past participle",
        requiredPattern: "perfect_hebben",
      },
    ],
  },
  {
    id:          "shopping",
    title:       "At the Market",
    titleNL:     "Op de Markt",
    description: "Shopping vocabulary: questions, modals, and time expressions.",
    emoji:       "🛒",
    steps: [
      {
        contextEN:       "Name what you are buying.",
        grammarFocus:    "Basic S + V + O sentence",
        requiredPattern: "svo",
      },
      {
        contextEN:       "Say when you usually go shopping.",
        grammarFocus:    "Start with a frequency adverb — verb follows immediately",
        requiredPattern: "adv_sv",
      },
      {
        contextEN:       "Ask the vendor a yes/no question about a product.",
        grammarFocus:    "Verb first, then subject (yes/no question)",
        requiredPattern: "polar_question",
      },
      {
        contextEN:       "Say what you need to buy.",
        grammarFocus:    "Modal + object + infinitive",
        requiredPattern: "modal_obj",
      },
      {
        contextEN:       "Say what you would do if it were cheaper.",
        grammarFocus:    "Als + subordinate (verb final) + main clause (inversion)",
        requiredPattern: "conditional_als",
      },
    ],
  },
];

// ── Public API ────────────────────────────────────────────────

/** Metadata list for the scenario selection screen. */
export const SCENARIO_LIST = TEMPLATES.map(({ id, title, titleNL, description, emoji }) => ({
  id, title, titleNL, description, emoji,
}));

/**
 * Generate a complete scenario with fresh procedural sentences for each step.
 * Returns null only if a pattern fails to produce a sentence after 10 attempts
 * (should not happen in a populated vocabulary).
 */
export function generateScenario(scenarioId: string): GeneratedScenario | null {
  const template = TEMPLATES.find((t) => t.id === scenarioId);
  if (!template) return null;

  const steps: ScenarioStep[] = [];
  for (let i = 0; i < template.steps.length; i++) {
    const tmpl = template.steps[i];
    let sentence: ProceduralSentence | null = null;
    for (let attempt = 0; attempt < 10 && !sentence; attempt++) {
      sentence = generateSentence({ includePatterns: [tmpl.requiredPattern] });
    }
    if (!sentence) return null;

    steps.push({
      stepNumber:      i + 1,
      contextEN:       tmpl.contextEN,
      grammarFocus:    tmpl.grammarFocus,
      requiredPattern: tmpl.requiredPattern,
      sentence,
    });
  }

  return {
    id:          template.id,
    title:       template.title,
    titleNL:     template.titleNL,
    description: template.description,
    emoji:       template.emoji,
    steps,
  };
}
