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
    .replace(/[.!?;:]/g, " $& ")    // space around sentence-ending punctuation
    .replace(/,/g, " , ")            // keep comma as its own token (clause boundary)
    .split(/\s+/)
    .filter((w) => w.length > 0 && !/^[.!?;:]$/.test(w)); // strip terminal punct, keep ","
}

// ── Step 2: Tag Tokens ────────────────────────────────────────

function tagTokens(words: string[]): Token[] {
  // First pass: assign POS/role from lexicon and heuristics
  const tokens = words.map((word, index) => {
    const lower = word.toLowerCase();

    // 0. Punctuation token (comma kept as clause-boundary marker)
    if (lower === ",") {
      return { surface: word, lower, lemma: ",", pos: "punctuation" as const, role: "unknown" as const, index } as Token;
    }

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

  // Second pass: resolve POS ambiguities using token context
  return tokens.map((_, i) => resolveAmbiguity(tokens, i));
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

// ── Step 2b: Ambiguity Resolution ────────────────────────────
//
// Runs AFTER initial tagging. Uses surrounding token context to
// resolve three known Dutch POS ambiguities:
//
//   "het"        — article (before noun) vs pronoun (elsewhere)
//   "als"        — subordinating conjunction (verb…als…subject pattern)
//                  vs preposition/adverb (comparison context)
//   op/aan/uit/door — separable prefix (clause-final) vs preposition (before NP)

/** Return true if the token at `i` is the last non-punctuation token. */
function isClauseFinal(tokens: Token[], i: number): boolean {
  for (let j = i + 1; j < tokens.length; j++) {
    if (tokens[j].pos !== "punctuation" && tokens[j].lower !== ",") return false;
  }
  return true;
}

/** Return true if `t` is a noun-like token (noun, pronoun, or unknown that acts as NP head). */
function isNounLike(t: Token): boolean {
  return t.pos === "noun" || t.pos === "pronoun" || t.pos === "unknown";
}

/**
 * Resolve a single ambiguous token using its neighbours.
 * Pure function — returns an updated copy of the token (or the original if no change needed).
 */
export function resolveAmbiguity(tokens: Token[], index: number): Token {
  const token = tokens[index];
  const prev = index > 0 ? tokens[index - 1] : null;
  const next = index < tokens.length - 1 ? tokens[index + 1] : null;

  // ── "het" ──────────────────────────────────────────────────
  // het + noun-like → article; otherwise keep as pronoun
  if (token.lower === "het") {
    if (next && isNounLike(next)) {
      // Article slot: "het huis", "het grote boek"
      return { ...token, pos: "article", role: "unknown" };
    }
    // Standalone use: subject pronoun ("Het regent", "Ik zie het")
    if (token.pos !== "article") {
      return { ...token, pos: "pronoun", role: "subject" };
    }
    return token;
  }

  // ── "als" ──────────────────────────────────────────────────
  // Pattern: [verb] als [NP/pronoun] → subordinating conjunction (verb-final trigger)
  // Pattern: [adjective/adverb] als → comparison preposition
  if (token.lower === "als") {
    const prevIsVerb = prev?.pos === "verb";
    const prevIsAdjOrAdv =
      prev?.pos === "adjective" || prev?.pos === "adverb";

    if (prevIsAdjOrAdv) {
      // "zo groot als een huis" — comparison, NOT a clause trigger
      return {
        ...token,
        pos: "preposition",
        role: "adverbial",
        isSubordinatingConjunction: false,
        isCoordinatingConjunction: false,
      };
    }

    if (prevIsVerb || SUBJECT_PRONOUNS.has(prev?.lower ?? "")) {
      // "Als ik kom…" / "Ik doe het als jij het doet" — subordinating
      return {
        ...token,
        pos: "conjunction",
        role: "subordinating_conjunction",
        isSubordinatingConjunction: true,
        isCoordinatingConjunction: false,
      };
    }

    return token;
  }

  // ── op / aan / uit / door ──────────────────────────────────
  // These are in SEPARABLE_PREFIXES but also function as prepositions.
  // Heuristic: clause-final → separable prefix; followed by NP → preposition.
  const DUAL_ROLE = new Set(["op", "aan", "uit", "door"]);
  if (DUAL_ROLE.has(token.lower)) {
    if (isClauseFinal(tokens, index)) {
      // "Ik bel hem op." — separable prefix at end of clause
      return {
        ...token,
        pos: "particle",
        role: "separable_prefix",
        isSeparablePrefix: true,
      };
    }
    if (next && isNounLike(next)) {
      // "op de tafel", "door het park" — preposition before NP
      return {
        ...token,
        pos: "preposition",
        role: "adverbial",
        isSeparablePrefix: false,
      };
    }
    return token;
  }

  return token;
}

// ── Step 3: Parse Sentence Structure ─────────────────────────

function parseSentence(tokens: Token[], original: string): ParsedSentence {
  // Find subordinating conjunction and first comma (clause-boundary markers)
  const subConjIdx = tokens.findIndex((t) => t.isSubordinatingConjunction);
  const commaIdx   = tokens.findIndex((t) => t.lower === ",");

  // ── Determine main-clause vs subordinate-clause token ranges ──────────────
  //
  // Three cases:
  //   A) No subordinate conjunction → entire token list is the main clause
  //   B) Conjunction is sentence-initial ("Als ik kom, ga ik...") →
  //        sub clause:  tokens[1 .. commaIdx)   (conjunction itself is excluded)
  //        main clause: tokens[commaIdx+1 .. ]
  //   C) Conjunction is mid-sentence ("Ik ga, omdat ik moe ben") →
  //        main clause: tokens[0 .. subConjIdx)
  //        sub clause:  tokens[subConjIdx+1 .. ]

  let mainClauseTokens: Token[];
  let subClauseStart: number | null = null;
  let subClauseEnd: number = tokens.length;

  if (subConjIdx === -1) {
    // Case A: plain main clause
    mainClauseTokens = tokens;
  } else if (subConjIdx === 0) {
    // Case B: Als-initial — main clause follows the comma
    subClauseStart = subConjIdx;
    subClauseEnd   = commaIdx !== -1 ? commaIdx : tokens.length;
    mainClauseTokens = commaIdx !== -1
      ? tokens.slice(commaIdx + 1).filter((t) => t.lower !== ",")
      : [];
  } else {
    // Case C: mid-sentence subordinate clause
    subClauseStart   = subConjIdx;
    mainClauseTokens = tokens.slice(0, subConjIdx).filter((t) => t.lower !== ",");
  }

  // ── Locate finite verb in the MAIN clause (not sub clause) ────────────────
  const mcVerbLocalIdx = mainClauseTokens.findIndex((t) => t.isFiniteVerb);
  // Translate back to global token index using the Token.index property
  const finiteVerbIdx =
    mcVerbLocalIdx !== -1 ? mainClauseTokens[mcVerbLocalIdx].index : -1;

  // ── Locate subject in the main clause ─────────────────────────────────────
  let subjectIdx: number | null = null;
  for (const t of mainClauseTokens) {
    if (SUBJECT_PRONOUNS.has(t.lower) && t.pos === "pronoun") {
      subjectIdx = t.index; // global index
      break;
    }
  }
  if (subjectIdx === null && mcVerbLocalIdx !== -1) {
    for (const t of mainClauseTokens.slice(0, mcVerbLocalIdx)) {
      if (t.pos === "noun") { subjectIdx = t.index; break; }
    }
  }

  // ── Sentence type classification ──────────────────────────────────────────
  const sentenceType = inferSentenceType(
    tokens,
    subConjIdx === 0 ? finiteVerbIdx : tokens.findIndex((t) => t.isFiniteVerb),
    subjectIdx,
  );

  // ── Subordinate clause verb position ──────────────────────────────────────
  const subClauseTokens =
    subClauseStart !== null
      ? tokens.slice(subClauseStart + 1, subClauseEnd).filter((t) => t.lower !== ",")
      : [];
  const subVerbLocalIdx = subClauseTokens.findIndex((t) => t.isFiniteVerb);

  return {
    original,
    tokens,
    sentenceType,
    mainClauseTokens,
    subordinateClauseStart: subClauseStart,
    finiteVerbIndex: finiteVerbIdx !== -1 ? finiteVerbIdx : null,
    subjectIndex: subjectIdx,
    finiteVerbIndexInSubordinate: subVerbLocalIdx !== -1 ? subVerbLocalIdx : null,
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

  // Imperative: starts with a verb in stem form (not covered by polar_question already)
  // Note: finiteVerbIdx === 0 already returned "polar_question" above, so this branch
  // applies only when the first token is a verb but wasn't caught by the lookup.

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
