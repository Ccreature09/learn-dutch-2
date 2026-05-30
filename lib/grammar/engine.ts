import type {
  ParsedSentence,
  Token,
  PartOfSpeech,
  GrammaticalRole,
  SentenceType,
  ValidationResult,
  RuleResult,
} from "@/lib/grammar/types";
import { VERB_FORM_LOOKUP, SEPARABLE_PREFIXES } from "@/lib/data/verbs";
import {
  VOCAB_LOOKUP,
  SUBJECT_PRONOUNS,
  SUBORDINATING_CONJUNCTIONS,
  COORDINATING_CONJUNCTIONS,
  WH_WORDS,
} from "@/lib/data/vocabulary";
import { ALL_RULES } from "@/lib/grammar/rules/index";

// ─────────────────────────────────────────────────────────────
// Dutch Grammar Engine
//
// Pipeline:
//   1. Tokenize (split + clean)
//   2. Tag (POS + role using lexicon + heuristics)
//   3. Parse (identify clause boundaries, verb/subject positions)
//   4. Apply rules (each rule is independent)
//   5. Aggregate results + compute naturalScore
// ─────────────────────────────────────────────────────────────

// ── Step 1: Tokenize ──────────────────────────────────────────

function tokenize(sentence: string): string[] {
  return sentence
    .trim()
    .replace(/[.!?;:,]/g, " $& ")   // add space around punctuation
    .split(/\s+/)
    .filter((w) => w.length > 0 && !/^[.!?,;:]$/.test(w));  // strip punctuation tokens
}

// ── Step 2: Tag Tokens ────────────────────────────────────────

function tagTokens(words: string[]): Token[] {
  return words.map((word, index) => {
    const lower = word.toLowerCase();

    // 1. Check verb database (all conjugated forms)
    const verbInfo = VERB_FORM_LOOKUP[lower];
    if (verbInfo) {
      const isFinite = verbInfo.form === "finite";
      const role: GrammaticalRole =
        verbInfo.verbData.isModal && isFinite
          ? "modal_verb"
          : verbInfo.form === "past_participle"
          ? "past_participle"
          : verbInfo.form === "infinitive"
          ? "infinitive"
          : "finite_verb";

      // Check if this is a separable prefix that happened to match a verb
      // (e.g. "op" could be a prefix or a preposition)
      const isSeparableVerb = verbInfo.verbData.separable;

      return {
        surface: word,
        lower,
        lemma: verbInfo.infinitive,
        pos: "verb",
        role,
        index,
        isFiniteVerb: isFinite,
        verbForm: verbInfo.form,
        tense: verbInfo.tense,
        person: verbInfo.person,
        number: verbInfo.number,
      } as Token;
    }

    // 2. Check if it's a separable prefix
    if (SEPARABLE_PREFIXES.has(lower)) {
      // It could be a separable prefix OR a preposition
      // We'll tag it tentatively and let the rule check context
      const vocabEntry = VOCAB_LOOKUP[lower];
      return {
        surface: word,
        lower,
        lemma: lower,
        pos: vocabEntry?.pos ?? "particle",
        role: "separable_prefix",
        index,
        isSeparablePrefix: true,
      } as Token;
    }

    // 3. Check vocabulary database
    const vocabEntry = VOCAB_LOOKUP[lower];
    if (vocabEntry) {
      let role: GrammaticalRole = "unknown";
      if (vocabEntry.isSubordinatingConjunction) role = "subordinating_conjunction";
      else if (vocabEntry.isCoordinatingConjunction) role = "coordinating_conjunction";
      else if (vocabEntry.isSubjectPronoun) role = "subject";
      else if (vocabEntry.isObjectPronoun) role = "direct_object";
      else if (vocabEntry.pos === "adverb") role = "adverbial";
      else if (vocabEntry.pos === "preposition") role = "adverbial";
      else if (vocabEntry.pos === "noun") role = "unknown"; // will be refined
      else if (vocabEntry.pos === "adjective") role = "complement";

      return {
        surface: word,
        lower,
        lemma: lower,
        pos: vocabEntry.pos,
        role,
        index,
        isSubordinatingConjunction: vocabEntry.isSubordinatingConjunction,
        isCoordinatingConjunction: vocabEntry.isCoordinatingConjunction,
      } as Token;
    }

    // 4. Heuristic tagging for unknown words
    const heuristicPos = guessPoS(lower, index, words);
    return {
      surface: word,
      lower,
      lemma: lower,
      pos: heuristicPos,
      role: "unknown",
      index,
    } as Token;
  });
}

function guessPoS(word: string, index: number, allWords: string[]): PartOfSpeech {
  // Common noun suffixes
  if (/ing$|heid$|schap$|dom$|nis$/.test(word)) return "noun";
  // Common adjective suffixes
  if (/lijk$|isch$|baar$|zaam$|loos$/.test(word)) return "adjective";
  // Capital letter (not at start) → likely proper noun
  if (index > 0 && /^[A-Z]/.test(word)) return "noun";
  // -en ending on longer words → likely infinitive/plural
  if (word.endsWith("en") && word.length > 4) return "verb";
  return "unknown";
}

// ── Step 3: Parse Sentence Structure ─────────────────────────

function parseSentence(tokens: Token[], original: string): ParsedSentence {
  // Find subordinating conjunction (marks start of subordinate clause)
  const subConjIdx = tokens.findIndex((t) => t.isSubordinatingConjunction);

  // Find finite verb
  const finiteVerbIdx = tokens.findIndex((t) => t.isFiniteVerb);

  // Find subject: first subject pronoun, or first noun before the finite verb
  let subjectIdx: number | null = null;
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (SUBJECT_PRONOUNS.has(t.lower) && t.pos === "pronoun") {
      subjectIdx = i;
      break;
    }
  }
  // If no pronoun subject found, look for a noun before the verb
  if (subjectIdx === null && finiteVerbIdx !== null) {
    for (let i = 0; i < finiteVerbIdx; i++) {
      if (tokens[i].pos === "noun") {
        subjectIdx = i;
        break;
      }
    }
  }

  // Determine sentence type
  const sentenceType = inferSentenceType(tokens, finiteVerbIdx, subjectIdx);

  // Main clause vs subordinate clause tokens
  const mainClauseTokens =
    subConjIdx !== null
      ? tokens.slice(0, subConjIdx)
      : tokens;

  // Find finite verb in subordinate clause
  const subClauseTokens = subConjIdx !== null ? tokens.slice(subConjIdx + 1) : [];
  const finiteVerbIdxInSub =
    subClauseTokens.findIndex((t) => t.isFiniteVerb) !== -1
      ? subClauseTokens.findIndex((t) => t.isFiniteVerb)
      : null;

  return {
    original,
    tokens,
    sentenceType,
    mainClauseTokens,
    subordinateClauseStart: subConjIdx !== -1 ? subConjIdx : null,
    finiteVerbIndex: finiteVerbIdx !== -1 ? finiteVerbIdx : null,
    subjectIndex: subjectIdx,
    finiteVerbIndexInSubordinate: finiteVerbIdxInSub,
  };
}

function inferSentenceType(
  tokens: Token[],
  finiteVerbIdx: number,
  subjectIdx: number | null
): SentenceType {
  if (tokens.length === 0) return "main_clause";

  const first = tokens[0];

  // WH-question: starts with a question word
  if (WH_WORDS.has(first.lower)) return "wh_question";

  // Polar question: starts with finite verb
  if (finiteVerbIdx === 0) return "polar_question";

  // Has subordinating conjunction
  const hasSubConj = tokens.some((t) => t.isSubordinatingConjunction);
  const hasCoordConj = tokens.some((t) => t.isCoordinatingConjunction);
  if (hasSubConj) return "complex";

  // Imperative: verb is first token (handled above by finiteVerbIdx === 0)
  // Check if it could be imperative by verb form
  if (finiteVerbIdx !== null && finiteVerbIdx === 0) {
    return "imperative";
  }

  return "main_clause";
}

// ── Step 4: Apply Rules ───────────────────────────────────────

function applyRules(parsed: ParsedSentence): RuleResult[] {
  return ALL_RULES.map((rule) => {
    try {
      return rule(parsed);
    } catch {
      return {
        ruleName: "Rule Error",
        ruleId: "error",
        status: "warning" as const,
        message: "A rule could not be evaluated for this sentence.",
        explanation: "",
        priority: 5 as const,
      };
    }
  });
}

// ── Step 5: Aggregate Results ─────────────────────────────────

function computeOverallStatus(
  results: RuleResult[]
): { status: "correct" | "unnatural" | "incorrect"; naturalScore: number } {
  const failures = results.filter((r) => r.status === "fail");
  const warnings = results.filter((r) => r.status === "warning");
  const passes = results.filter((r) => r.status === "pass");

  if (failures.length > 0) {
    // Deduct 20-30 points per high-priority failure
    const deduction = failures.reduce((acc, f) => acc + (6 - f.priority) * 15, 0);
    const score = Math.max(0, 100 - deduction - warnings.length * 5);
    return { status: "incorrect", naturalScore: score };
  }

  if (warnings.length > 0) {
    const score = Math.max(50, 100 - warnings.length * 10);
    return { status: "unnatural", naturalScore: score };
  }

  return { status: "correct", naturalScore: 100 };
}

function buildExplanation(results: RuleResult[], status: string): string {
  const criticalFailures = results.filter((r) => r.status === "fail" && r.priority <= 2);
  if (criticalFailures.length > 0) {
    return criticalFailures.map((r) => r.explanation).filter(Boolean).join(" ");
  }
  if (status === "correct") {
    return "This sentence follows all applicable Dutch grammar rules correctly.";
  }
  const warnings = results.filter((r) => r.status === "warning");
  return warnings.map((r) => r.message).join(" ");
}

// ── Public API ────────────────────────────────────────────────

export function validateSentence(input: string): ValidationResult {
  const cleaned = input.trim();
  if (!cleaned) {
    return {
      input,
      ruleResults: [],
      overallStatus: "incorrect",
      naturalScore: 0,
      mostNaturalVersion: "",
      alternatives: [],
      explanation: "Please enter a sentence.",
      parsedSentence: {
        original: input,
        tokens: [],
        sentenceType: "main_clause",
        mainClauseTokens: [],
        subordinateClauseStart: null,
        finiteVerbIndex: null,
        subjectIndex: null,
        finiteVerbIndexInSubordinate: null,
      },
    };
  }

  const words = tokenize(cleaned);
  const tokens = tagTokens(words);
  const parsed = parseSentence(tokens, cleaned);
  const ruleResults = applyRules(parsed);

  const { status, naturalScore } = computeOverallStatus(ruleResults);

  // Build the most natural version from rule corrections
  const topCorrection = ruleResults
    .filter((r) => r.status === "fail" && r.correctedSuggestion)
    .sort((a, b) => a.priority - b.priority)[0]?.correctedSuggestion;

  const mostNaturalVersion = topCorrection ?? cleaned;
  const explanation = buildExplanation(ruleResults, status);

  // Gather alternatives from passing rules
  const alternatives = ruleResults
    .filter((r) => r.correctedSuggestion && r.correctedSuggestion !== cleaned)
    .map((r) => r.correctedSuggestion!)
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .slice(0, 3);

  return {
    input: cleaned,
    ruleResults,
    overallStatus: status,
    naturalScore,
    mostNaturalVersion,
    alternatives,
    explanation,
    parsedSentence: parsed,
  };
}

// ── Sentence structure analysis helper ───────────────────────

export function analyzeSentenceStructure(input: string): {
  structureLabel: string;
  tokens: Token[];
  sentenceType: SentenceType;
} {
  const words = tokenize(input);
  const tokens = tagTokens(words);
  const parsed = parseSentence(tokens, input);

  const parts: string[] = [];
  const mc = parsed.mainClauseTokens;

  for (const token of mc) {
    if (token.role === "subject" || SUBJECT_PRONOUNS.has(token.lower)) parts.push("S");
    else if (token.isFiniteVerb) parts.push("V");
    else if (token.pos === "verb") parts.push("V");
    else if (token.pos === "adverb") parts.push("Adv");
    else if (token.pos === "noun") parts.push("O");
    else if (token.pos === "preposition") parts.push("P");
    else if (token.pos === "article") parts.push("art");
    else if (token.pos === "adjective") parts.push("Adj");
  }

  return {
    structureLabel: parts.join(" + "),
    tokens,
    sentenceType: parsed.sentenceType,
  };
}

// ── Quick grammar check (returns true if no failures) ────────
export function isGrammaticallyValid(input: string): boolean {
  const result = validateSentence(input);
  return result.overallStatus !== "incorrect";
}
