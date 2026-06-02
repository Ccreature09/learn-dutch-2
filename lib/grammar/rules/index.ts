import type { ParsedSentence, RuleResult, Token } from "@/lib/grammar/types";
import { VERB_FORM_LOOKUP, getExpectedFiniteForm } from "@/lib/data/verbs";
import { SUBORDINATING_CONJUNCTIONS, getPersonFromPronoun } from "@/lib/data/vocabulary";

// ─────────────────────────────────────────────────────────────
// Grammar Rules — Dutch Learning Platform
// Each rule is a pure function: ParsedSentence → RuleResult
// Rules are independent, composable, exception-aware.
// ─────────────────────────────────────────────────────────────

// ── RULE 1: V2 Word Order (Main Clause) ──────────────────────
//
// The Dutch V2 rule: in a main clause, the finite verb must be
// the SECOND constituent. Any element can be first (subject,
// object, adverb, PP), but the verb is always second.
//
export function ruleV2WordOrder(sentence: ParsedSentence): RuleResult {
  const mc = sentence.mainClauseTokens;

  if (mc.length === 0) {
    return { ruleName: "V2 Word Order", ruleId: "v2", status: "pass", message: "No main clause tokens to check.", explanation: "", priority: 3 };
  }

  // Find finite verb in main clause
  const finiteIdx = mc.findIndex((t) => t.isFiniteVerb);
  if (finiteIdx === -1) {
    // No verb found — could be imperative fragment or unknown
    return {
      ruleName: "V2 Word Order",
      ruleId: "v2",
      status: "warning",
      message: "Could not identify a finite verb in the main clause.",
      explanation: "Every Dutch main clause needs a finite (conjugated) verb.",
      priority: 2,
    };
  }

  const finiteToken = mc[finiteIdx];

  // Imperative: verb-first is fine
  if (finiteIdx === 0 && sentence.sentenceType === "imperative") {
    return { ruleName: "V2 Word Order", ruleId: "v2", status: "pass", message: "Imperative sentence — verb-first is correct.", explanation: "Imperatives start with the verb.", priority: 5 };
  }

  // Polar question: verb-first is fine
  if (finiteIdx === 0 && sentence.sentenceType === "polar_question") {
    return { ruleName: "V2 Word Order", ruleId: "v2", status: "pass", message: "Yes/no question — verb-first is correct.", explanation: "Polar questions start with the verb.", priority: 5 };
  }

  // WH-question: WH-word first, then verb (position 2) — WH counts as position 1
  if (sentence.sentenceType === "wh_question" && finiteIdx === 1) {
    return { ruleName: "V2 Word Order", ruleId: "v2", status: "pass", message: "WH-question — verb is correctly in position 2 (after question word).", explanation: "", priority: 5 };
  }

  // Main clause: find the number of constituents before the finite verb
  // Simple heuristic: count "constituent groups" before the verb
  const constituentsBefore = countConstituents(mc, 0, finiteIdx);

  if (constituentsBefore === 1) {
    return {
      ruleName: "V2 Word Order",
      ruleId: "v2",
      status: "pass",
      message: `V2 rule satisfied: '${finiteToken.surface}' is in the second constituent position.`,
      explanation: "The finite verb is correctly placed as the second constituent in the main clause.",
      priority: 5,
    };
  }

  if (constituentsBefore === 0 && sentence.sentenceType !== "polar_question" && sentence.sentenceType !== "imperative") {
    return {
      ruleName: "V2 Word Order",
      ruleId: "v2",
      status: "warning",
      message: `'${finiteToken.surface}' is in first position — could be an imperative or question, but this looks like a statement.`,
      explanation: "If this is a statement (not a question or command), the verb should not be first.",
      priority: 3,
    };
  }

  if (constituentsBefore >= 2) {
    // Find what the sentence might look like corrected
    const subject = mc.find((t) => t.role === "subject" || (t.pos === "pronoun" && t.index < finiteIdx));
    return {
      ruleName: "V2 Word Order",
      ruleId: "v2",
      status: "fail",
      message: `V2 violation: '${finiteToken.surface}' is in the ${finiteIdx + 1}th position. There are ${constituentsBefore} constituents before it.`,
      explanation:
        "Dutch V2 rule: the finite verb must be the SECOND constituent in a main clause. If an adverb or object is placed at the start, the subject must come AFTER the verb (inversion). Example: 'Vandaag WERK ik' — not 'Vandaag ik werk'.",
      correctedSuggestion: buildV2Correction(mc, sentence.original),
      affectedTokenIndices: [finiteToken.index],
      priority: 1,
    };
  }

  return { ruleName: "V2 Word Order", ruleId: "v2", status: "pass", message: "V2 rule appears satisfied.", explanation: "", priority: 5 };
}

/**
 * Returns the exclusive-end index of the first constituent starting at `start`,
 * respecting article+adj*+noun grouping and preposition+NP grouping.
 * Pure function — exported for unit testing.
 */
export function spanFirstConstituent(tokens: Token[], start: number, end: number): number {
  // B1 fix: expanded set includes possessives and demonstratives in addition to articles
  const ARTICLES = new Set([
    "de", "het", "een", "'t",
    // possessives
    "mijn", "jouw", "zijn", "haar", "ons", "onze", "hun", "uw",
    // demonstratives
    "deze", "die", "dit", "dat",
  ]);
  const PREPS = new Set([
    "in", "op", "aan", "van", "voor", "met", "bij", "naar", "uit", "over",
    "onder", "achter", "naast", "tussen", "door", "om", "tot", "zonder",
    "tijdens", "tegen",
  ]);

  let i = start;
  while (i < end) {
    const tok = tokens[i];

    // Skip coordinating conjunctions — not constituents
    if (tok.isCoordinatingConjunction) { i++; continue; }

    // Prepositional phrase → preposition + optional article + optional adj* + noun/pronoun
    if (tok.pos === "preposition" || PREPS.has(tok.lower)) {
      i++; // consume preposition
      if (i < end && (ARTICLES.has(tokens[i].lower) || tokens[i].pos === "article")) i++;
      while (i < end && tokens[i].pos === "adjective") i++;
      if (i < end && (tokens[i].pos === "noun" || tokens[i].pos === "pronoun")) i++;
      return i;
    }

    // Article + adjective* + noun → NP
    if (ARTICLES.has(tok.lower) || tok.pos === "article") {
      i++; // consume article
      while (i < end && tokens[i].pos === "adjective") i++;
      if (i < end && tokens[i].pos === "noun") i++;
      return i;
    }

    // Single-token constituents
    return i + 1;
  }
  return i;
}

/**
 * Count true grammatical constituents in tokens[start..end).
 * Groups article+adj*+noun, preposition+NP into single units.
 * Coordinating conjunctions are not counted.
 * Pure function — exported for unit testing.
 */
export function countConstituents(tokens: Token[], start: number, end: number): number {
  let count = 0;
  let i = start;

  while (i < end) {
    const tok = tokens[i];

    // Skip coordinating conjunctions and punctuation — not constituents
    if (tok.isCoordinatingConjunction || tok.pos === "punctuation") { i++; continue; }

    // Everything else: advance by one full constituent and count it
    const next = spanFirstConstituent(tokens, i, end);
    if (next === i) { i++; continue; } // safety: avoid infinite loop
    count++;
    i = next;
  }

  return count;
}

/**
 * Rebuild the main clause in correct V2 order and return it as a string,
 * preserving the original sentence's trailing punctuation.
 *
 * Correct structure: [first constituent] + [verb] + [between] + [rest]
 * "between" is whatever appeared between the fronted constituent and the verb
 * (typically the misplaced subject).
 *
 * Pure function — exported for unit testing.
 */
export function buildV2Correction(mc: Token[], original = ""): string {
  // Preserve the trailing punctuation from the original sentence (default to ".")
  const trailingPunct = original.trimEnd().match(/[.!?]$/) ? original.trimEnd().slice(-1) : ".";

  const verbIdx = mc.findIndex((t) => t.isFiniteVerb);
  if (verbIdx <= 1) return mc.map((t) => t.surface).join(" ") + trailingPunct;

  // Identify the end of the first full constituent (may be multi-token: "De grote man")
  const firstConstEnd = spanFirstConstituent(mc, 0, verbIdx);

  // Slice the three zones
  const fronted = mc.slice(0, firstConstEnd).map((t) => t.surface);
  const verb = mc[verbIdx].surface;
  const between = mc.slice(firstConstEnd, verbIdx).map((t) => t.surface); // typically the subject
  const rest = mc.slice(verbIdx + 1).map((t) => t.surface);

  return [...fronted, verb, ...between, ...rest].join(" ") + trailingPunct;
}


// ── RULE 2: Verb Conjugation ──────────────────────────────────
//
// Checks that the finite verb form matches the subject in person
// and number. Also checks the jij/je inversion rule.
//
export function ruleVerbConjugation(sentence: ParsedSentence): RuleResult {
  const { tokens, subjectIndex, finiteVerbIndex } = sentence;

  if (finiteVerbIndex === null || subjectIndex === null) {
    return {
      ruleName: "Verb Conjugation",
      ruleId: "conjugation",
      status: "warning",
      message: "Could not identify both subject and finite verb for conjugation check.",
      explanation: "Conjugation check requires a clearly identifiable subject and verb.",
      priority: 3,
    };
  }

  const verbToken = tokens[finiteVerbIndex];
  const subjectToken = tokens[subjectIndex];
  const personInfo = getPersonFromPronoun(subjectToken.lower);

  if (!personInfo) {
    // Non-pronoun subject — harder to check, skip
    return {
      ruleName: "Verb Conjugation",
      ruleId: "conjugation",
      status: "pass",
      message: "Subject is a noun phrase — conjugation check skipped (use 3rd person singular form).",
      explanation: "Noun phrase subjects take 3rd person singular verb forms.",
      priority: 5,
    };
  }

  const verbInfo = VERB_FORM_LOOKUP[verbToken.lower];
  if (!verbInfo) {
    return {
      ruleName: "Verb Conjugation",
      ruleId: "conjugation",
      status: "warning",
      message: `'${verbToken.surface}' is not in our verb database — conjugation not verified.`,
      explanation: "Unknown verb form.",
      priority: 4,
    };
  }

  const verb = verbInfo.verbData;
  // Is this an inversion (subject comes AFTER verb)?
  const isInverted = subjectIndex > finiteVerbIndex;
  const expected = getExpectedFiniteForm(verb, personInfo.person, personInfo.number, isInverted && (subjectToken.lower === "jij" || subjectToken.lower === "je"));

  if (verbToken.lower === expected) {
    return {
      ruleName: "Verb Conjugation",
      ruleId: "conjugation",
      status: "pass",
      message: `'${verbToken.surface}' correctly agrees with '${subjectToken.surface}' (${personInfo.person}${personInfo.number === "plural" ? "pl" : "sg"}).`,
      explanation: "",
      priority: 5,
    };
  }

  const inversionNote =
    isInverted && (subjectToken.lower === "jij" || subjectToken.lower === "je")
      ? " Note: 'jij/je' after the verb loses the -t (inversion rule)."
      : "";

  return {
    ruleName: "Verb Conjugation",
    ruleId: "conjugation",
    status: "fail",
    message: `'${verbToken.surface}' should be '${expected}' to agree with '${subjectToken.surface}'.`,
    explanation: `${personInfo.person}${personInfo.number === "plural" ? "st/nd/rd person plural" : personInfo.person === 1 ? "st person singular" : personInfo.person === 2 ? "nd person singular" : "rd person singular"} of '${verb.infinitive}' = '${expected}'.${inversionNote}`,
    correctedSuggestion: tokens.map((t, i) => (i === finiteVerbIndex ? expected : t.surface)).join(" "),
    affectedTokenIndices: [finiteVerbIndex],
    priority: 1,
  };
}

// ── RULE 3: Subordinate Clause Verb-Final ─────────────────────
//
// In subordinate clauses (dat, omdat, als, wanneer, etc.),
// the finite verb must come at the END of the clause.
//
export function ruleSubordinateVerbFinal(sentence: ParsedSentence): RuleResult {
  const { tokens, subordinateClauseStart } = sentence;

  if (subordinateClauseStart === null) {
    return {
      ruleName: "Subordinate Clause Verb-Final",
      ruleId: "sub_verb_final",
      status: "pass",
      message: "No subordinate clause detected.",
      explanation: "",
      priority: 5,
    };
  }

  // Get subordinate clause tokens (after the subordinating conjunction)
  const conjToken = tokens[subordinateClauseStart];
  const subClauseTokens = tokens.slice(subordinateClauseStart + 1);

  if (subClauseTokens.length === 0) {
    return {
      ruleName: "Subordinate Clause Verb-Final",
      ruleId: "sub_verb_final",
      status: "warning",
      message: "Subordinate clause appears to be empty.",
      explanation: "",
      priority: 4,
    };
  }

  // Find all verb tokens in the subordinate clause
  const verbsInSub = subClauseTokens
    .map((t, i) => ({ t, localIdx: i }))
    .filter(({ t }) => t.isFiniteVerb || t.pos === "verb");

  if (verbsInSub.length === 0) {
    return {
      ruleName: "Subordinate Clause Verb-Final",
      ruleId: "sub_verb_final",
      status: "warning",
      message: `'${conjToken.surface}' introduces a subordinate clause, but no verb found.`,
      explanation: "",
      priority: 3,
    };
  }

  // The last token(s) should be the verb(s)
  // Find the last verb index
  const lastVerbLocalIdx = verbsInSub[verbsInSub.length - 1].localIdx;
  // B2 fix: also exclude prepositions and separable prefixes from the "non-verb after verb" check
  const nonVerbAfterLastVerb = subClauseTokens
    .slice(lastVerbLocalIdx + 1)
    .filter((t) =>
      t.pos !== "particle" &&
      t.pos !== "unknown" &&
      t.pos !== "preposition" &&
      !t.isSeparablePrefix,
    );

  if (nonVerbAfterLastVerb.length > 0) {
    const wronglyPlaced = verbsInSub.map(({ t }) => t.surface).join(", ");
    const correctOrder = [
      ...subClauseTokens.filter((t) => !verbsInSub.some(({ t: vt }) => vt.index === t.index)).map((t) => t.surface),
      ...verbsInSub.map(({ t }) => t.surface),
    ].join(" ");

    return {
      ruleName: "Subordinate Clause Verb-Final",
      ruleId: "sub_verb_final",
      status: "fail",
      message: `After '${conjToken.surface}', the verb '${wronglyPlaced}' must come at the END of the clause.`,
      explanation:
        `Subordinate clauses (introduced by '${conjToken.surface}') require verb-final order. All verbs — including auxiliaries and modal verbs — must cluster at the END of the subordinate clause. This is called SOV (Subject-Object-Verb) order, the reverse of normal main clause order.`,
      correctedSuggestion: conjToken.surface + " " + correctOrder,
      affectedTokenIndices: verbsInSub.map(({ t }) => t.index),
      priority: 1,
    };
  }

  return {
    ruleName: "Subordinate Clause Verb-Final",
    ruleId: "sub_verb_final",
    status: "pass",
    message: `Subordinate clause after '${conjToken.surface}' correctly has verb at the end.`,
    explanation: `In the '${conjToken.surface}' clause, the verb correctly appears at the end (SOV order).`,
    priority: 5,
  };
}

// ── RULE 4: Inversion After Fronted Element ───────────────────
//
// When a non-subject element is placed first in the sentence,
// the subject and verb must invert (verb before subject).
//
export function ruleInversion(sentence: ParsedSentence): RuleResult {
  const mc = sentence.mainClauseTokens;

  if (mc.length < 3) {
    return { ruleName: "Inversion", ruleId: "inversion", status: "pass", message: "Sentence too short for inversion check.", explanation: "", priority: 5 };
  }

  const firstToken = mc[0];
  const SUBJECT_PRONOUNS_SET = new Set(["ik", "jij", "je", "u", "hij", "zij", "ze", "het", "wij", "we", "jullie", "men"]);
  // B3 fix: expanded to include possessives and demonstratives; use spanFirstConstituent
  // to correctly span the whole NP before deciding no inversion is needed.
  const ARTICLE_LIKE = new Set([
    "de", "het", "een", "'t",
    "mijn", "jouw", "zijn", "haar", "ons", "onze", "hun", "uw",
    "deze", "die", "dit", "dat",
  ]);

  // If sentence starts with a subject pronoun, no inversion needed
  if (SUBJECT_PRONOUNS_SET.has(firstToken.lower)) {
    // Check that verb follows subject (position 2 check handled by V2 rule)
    return { ruleName: "Inversion", ruleId: "inversion", status: "pass", message: "Sentence starts with subject — no inversion needed.", explanation: "", priority: 5 };
  }

  // If sentence starts with article/possessive/demonstrative, use spanFirstConstituent
  // to verify the whole NP is a subject NP (verb immediately follows it)
  if (ARTICLE_LIKE.has(firstToken.lower)) {
    const verbIdx = mc.findIndex((t) => t.isFiniteVerb);
    const firstConstEnd = spanFirstConstituent(mc, 0, mc.length);
    // Subject pronoun after verb means inversion happened (object NP fronted) — also fine
    const subjectAfterVerb = verbIdx !== -1 && mc.slice(verbIdx + 1).some((t) => SUBJECT_PRONOUNS_SET.has(t.lower));
    if (firstConstEnd === verbIdx || subjectAfterVerb) {
      return { ruleName: "Inversion", ruleId: "inversion", status: "pass", message: "Sentence starts with a noun phrase — structure looks correct.", explanation: "", priority: 5 };
    }
    // NP not immediately before verb — fall through to standard inversion check
  }

  // Sentence starts with a non-subject fronted element (adverb, PP, etc.)
  // Check that the VERB comes before the subject
  const verbIdx = mc.findIndex((t) => t.isFiniteVerb);
  if (verbIdx === -1) {
    return { ruleName: "Inversion", ruleId: "inversion", status: "warning", message: "Cannot verify inversion — no finite verb identified.", explanation: "", priority: 4 };
  }

  // After the fronted element, find subject
  const subjectIdx = mc.findIndex((t, i) => i > 0 && (SUBJECT_PRONOUNS_SET.has(t.lower) || t.role === "subject"));

  if (subjectIdx === -1) {
    return { ruleName: "Inversion", ruleId: "inversion", status: "pass", message: "Inversion with noun phrase subject — structure looks acceptable.", explanation: "", priority: 5 };
  }

  if (verbIdx < subjectIdx) {
    // Verb is before subject = inversion is correct
    const subjectToken = mc[subjectIdx];
    const verbToken = mc[verbIdx];
    return {
      ruleName: "Inversion",
      ruleId: "inversion",
      status: "pass",
      message: `Inversion correct: '${verbToken.surface}' (verb) comes before '${subjectToken.surface}' (subject) after the fronted element.`,
      explanation: `After '${firstToken.surface}' (fronted non-subject), verb-subject inversion is applied correctly.`,
      priority: 5,
    };
  } else {
    // Subject is before verb = inversion missing
    const subjectToken = mc[subjectIdx];
    const verbToken = mc[verbIdx];

    // Use the full first constituent (may span multiple tokens: "In het park")
    const firstConstEnd = spanFirstConstituent(mc, 0, verbIdx);
    const frontedSurface = mc.slice(0, firstConstEnd).map((t) => t.surface).join(" ");
    const rest = mc
      .filter((_, i) => i >= firstConstEnd && i !== verbIdx && i !== subjectIdx)
      .map((t) => t.surface);
    const trailingPunct = mc === sentence.mainClauseTokens
      ? sentence.original.trimEnd().match(/[.!?]$/) ? sentence.original.trimEnd().slice(-1) : "."
      : ".";
    const reconstructed = [frontedSurface, verbToken.surface, subjectToken.surface, ...rest].join(" ") + trailingPunct;

    return {
      ruleName: "Inversion",
      ruleId: "inversion",
      status: "fail",
      message: `Inversion required after '${firstToken.surface}': '${verbToken.surface}' should come BEFORE '${subjectToken.surface}'.`,
      explanation: `When a non-subject element comes first ('${firstToken.surface}'), the verb and subject must swap positions. Dutch V2 rule: verb is always 2nd constituent. After a fronted adverb/object, the verb must come directly after it, pushing the subject to 3rd position.`,
      correctedSuggestion: reconstructed,
      affectedTokenIndices: [subjectToken.index, verbToken.index],
      priority: 1,
    };
  }
}

// ── RULE 5: Separable Verb Placement ─────────────────────────
//
// In main clauses: prefix goes to the END of the clause.
// In subordinate clauses: prefix stays WITH the verb.
// With modal/auxiliary: verb stays together (infinitive).
//
export function ruleSeparableVerb(sentence: ParsedSentence): RuleResult {
  const { tokens, subordinateClauseStart } = sentence;

  // Find any token that is identified as a separable prefix
  const prefixToken = tokens.find((t) => t.isSeparablePrefix);

  // Also check: are any known separable verbs present in their fused form when they shouldn't be?
  const separableVerbToken = tokens.find((t) => {
    if (t.pos !== "verb") return false;
    const info = VERB_FORM_LOOKUP[t.lower];
    return info?.verbData.separable;
  });

  if (!separableVerbToken && !prefixToken) {
    return {
      ruleName: "Separable Verb",
      ruleId: "separable",
      status: "pass",
      message: "No separable verb detected in this sentence.",
      explanation: "",
      priority: 5,
    };
  }

  const isInSubordinate = subordinateClauseStart !== null;

  if (isInSubordinate && separableVerbToken) {
    const verbInfo = VERB_FORM_LOOKUP[separableVerbToken.lower];
    if (verbInfo?.verbData.separable) {
      // In subordinate clause, the separable verb should stay together
      // Check if the prefix is separate (it shouldn't be)
      if (prefixToken) {
        return {
          ruleName: "Separable Verb",
          ruleId: "separable",
          status: "fail",
          message: `In the subordinate clause, '${verbInfo.verbData.infinitive}' should stay together (not split).`,
          explanation: `In subordinate clauses, separable verbs do NOT split. The prefix '${verbInfo.verbData.separablePrefix}' must stay attached to the verb. Compare: main clause 'hij belt haar op' vs. subordinate 'dat hij haar opbelt'.`,
          affectedTokenIndices: [separableVerbToken.index, prefixToken?.index].filter(Boolean) as number[],
          priority: 1,
        };
      }
      return {
        ruleName: "Separable Verb",
        ruleId: "separable",
        status: "pass",
        message: `'${verbInfo.verbData.infinitive}' correctly stays together in the subordinate clause.`,
        explanation: "In subordinate clauses, separable verbs are kept together at the end.",
        priority: 5,
      };
    }
  }

  if (!isInSubordinate && separableVerbToken) {
    const verbInfo = VERB_FORM_LOOKUP[separableVerbToken.lower];
    if (verbInfo?.verbData.separable && verbInfo.form === "finite") {
      // In main clause with finite separable verb:
      // The prefix should be SEPARATE and at the END
      const prefixText = verbInfo.verbData.separablePrefix!;
      const lastToken = tokens[tokens.length - 1];

      if (prefixToken && lastToken.lower === prefixText) {
        return {
          ruleName: "Separable Verb",
          ruleId: "separable",
          status: "pass",
          message: `'${verbInfo.verbData.infinitive}' is correctly split: '${separableVerbToken.surface}' (verb) + '${lastToken.surface}' (prefix at end).`,
          explanation: "In main clauses, separable verbs split: the finite verb goes to position 2 and the prefix goes to the end.",
          priority: 5,
        };
      }

      if (!prefixToken) {
        return {
          ruleName: "Separable Verb",
          ruleId: "separable",
          status: "warning",
          message: `'${verbInfo.verbData.infinitive}' is a separable verb — make sure the prefix '${prefixText}' appears at the end of the clause.`,
          explanation: `'${verbInfo.verbData.infinitive}' splits in main clauses. The prefix '${prefixText}' should go to the very end.`,
          priority: 2,
        };
      }
    }
  }

  return {
    ruleName: "Separable Verb",
    ruleId: "separable",
    status: "pass",
    message: "Separable verb usage appears correct.",
    explanation: "",
    priority: 5,
  };
}

// ── RULE 6: Auxiliary Selection (zijn vs hebben) ──────────────
//
// Checks that the correct auxiliary is used in perfect tense.
//
export function ruleAuxiliarySelection(sentence: ParsedSentence): RuleResult {
  const { tokens } = sentence;

  // Find past participle
  const pp = tokens.find((t) => {
    const info = VERB_FORM_LOOKUP[t.lower];
    return info?.form === "past_participle";
  });

  if (!pp) {
    return { ruleName: "Auxiliary Selection", ruleId: "auxiliary", status: "pass", message: "No past participle detected — auxiliary check skipped.", explanation: "", priority: 5 };
  }

  const ppInfo = VERB_FORM_LOOKUP[pp.lower];
  const mainVerb = ppInfo?.verbData;
  if (!mainVerb) {
    return { ruleName: "Auxiliary Selection", ruleId: "auxiliary", status: "pass", message: "Past participle found but verb not in database.", explanation: "", priority: 5 };
  }

  // Find the auxiliary (hebben/zijn) used
  const auxToken = tokens.find((t) => {
    const lower = t.lower;
    const HEBBEN_FORMS = new Set(["heb", "hebt", "heeft", "hebben", "had", "hadden"]);
    const ZIJN_FORMS = new Set(["ben", "bent", "is", "zijn", "was", "waren"]);
    return HEBBEN_FORMS.has(lower) || ZIJN_FORMS.has(lower);
  });

  if (!auxToken) {
    return { ruleName: "Auxiliary Selection", ruleId: "auxiliary", status: "pass", message: "No auxiliary found — cannot check auxiliary selection.", explanation: "", priority: 5 };
  }

  const HEBBEN_FORMS = new Set(["heb", "hebt", "heeft", "hebben", "had", "hadden"]);
  const ZIJN_FORMS = new Set(["ben", "bent", "is", "zijn", "was", "waren"]);

  const usedHebben = HEBBEN_FORMS.has(auxToken.lower);
  const usedZijn = ZIJN_FORMS.has(auxToken.lower);

  if (mainVerb.auxiliary === "both") {
    return {
      ruleName: "Auxiliary Selection",
      ruleId: "auxiliary",
      status: "pass",
      message: `'${mainVerb.infinitive}' can use either 'hebben' or 'zijn' depending on context.`,
      explanation: "Both auxiliaries are acceptable for this verb (context-dependent).",
      priority: 5,
    };
  }

  const expectedAux = mainVerb.auxiliary;
  const actualAux = usedHebben ? "hebben" : "zijn";

  if (actualAux === expectedAux) {
    return {
      ruleName: "Auxiliary Selection",
      ruleId: "auxiliary",
      status: "pass",
      message: `Correct auxiliary: '${auxToken.surface}' (${expectedAux}) used with '${pp.surface}'.`,
      explanation: `'${mainVerb.infinitive}' correctly uses '${expectedAux}' as its perfect tense auxiliary.`,
      priority: 5,
    };
  }

  const reason =
    mainVerb.auxiliary === "zijn"
      ? "Movement/state-change verbs (gaan, komen, worden, blijven, vallen, etc.) use 'zijn'."
      : "Transitive and most other verbs use 'hebben'.";

  // Map the wrong auxiliary's exact form to the matching form of the correct auxiliary
  // so the correction suggestion has the right person/number.
  const ZIJN_TO_HEBBEN: Record<string, string> = {
    ben: "heb", bent: "hebt", is: "heeft", zijn: "hebben", was: "had", waren: "hadden",
  };
  const HEBBEN_TO_ZIJN: Record<string, string> = {
    heb: "ben", hebt: "bent", heeft: "is", hebben: "zijn", had: "was", hadden: "waren",
  };
  const formMap = usedZijn ? ZIJN_TO_HEBBEN : HEBBEN_TO_ZIJN;
  const correctedAuxForm = formMap[auxToken.lower] ?? (expectedAux === "hebben" ? "heb" : "is");

  return {
    ruleName: "Auxiliary Selection",
    ruleId: "auxiliary",
    status: "fail",
    message: `Wrong auxiliary: '${auxToken.surface}' used, but '${mainVerb.infinitive}' requires '${expectedAux}'.`,
    explanation: `${reason} Use '${expectedAux}' with '${pp.surface}'.`,
    correctedSuggestion: tokens.map((t) => (t.index === auxToken.index ? correctedAuxForm : t.surface)).join(" "),
    affectedTokenIndices: [auxToken.index],
    priority: 1,
  };
}

export function ruleModalInfinitive(sentence: ParsedSentence): RuleResult {
  const modalToken = sentence.tokens.find((token) => token.role === "modal_verb");

  if (!modalToken) {
    return {
      ruleName: "Modal + Infinitive",
      ruleId: "modal_infinitive",
      status: "pass",
      message: "No modal verb detected.",
      explanation: "",
      priority: 5,
    };
  }

  const companionVerbs = sentence.tokens.filter(
    (token) => token.index !== modalToken.index && token.pos === "verb",
  );

  if (companionVerbs.length === 0) {
    return {
      ruleName: "Modal + Infinitive",
      ruleId: "modal_infinitive",
      status: "warning",
      message: `Modal verb '${modalToken.surface}' was found without a second verb to license.`,
      explanation: "Modal verbs usually combine with another verb in the infinitive.",
      priority: 3,
    };
  }

  const invalidVerb = companionVerbs.find((token) => token.verbForm !== "infinitive");
  if (invalidVerb) {
    return {
      ruleName: "Modal + Infinitive",
      ruleId: "modal_infinitive",
      status: "fail",
      message: `After modal '${modalToken.surface}', '${invalidVerb.surface}' should be an infinitive.`,
      explanation: "After a modal verb, the lexical verb stays in the infinitive form rather than taking a finite ending.",
      correctedSuggestion: sentence.tokens
        .map((token) => (token.index === invalidVerb.index ? token.lemma : token.surface))
        .join(" "),
      affectedTokenIndices: [invalidVerb.index],
      priority: 1,
    };
  }

  return {
    ruleName: "Modal + Infinitive",
    ruleId: "modal_infinitive",
    status: "pass",
    message: `Modal verb '${modalToken.surface}' is correctly paired with an infinitive.`,
    explanation: "The modal carries the finite ending and the second verb remains in infinitive form.",
    priority: 5,
  };
}

export function rulePerfectTenseWordOrder(sentence: ParsedSentence): RuleResult {
  const ppIndex = sentence.tokens.findIndex((token) => token.role === "past_participle");

  if (ppIndex === -1) {
    return {
      ruleName: "Perfect Tense Word Order",
      ruleId: "perfect_word_order",
      status: "pass",
      message: "No past participle detected.",
      explanation: "",
      priority: 5,
    };
  }

  const trailingTokens = sentence.tokens.slice(ppIndex + 1).filter(
    (token) => token.pos !== "particle" && token.pos !== "unknown",
  );

  if (trailingTokens.length > 0) {
    return {
      ruleName: "Perfect Tense Word Order",
      ruleId: "perfect_word_order",
      status: "fail",
      message: `Past participle '${sentence.tokens[ppIndex].surface}' should come after the remaining clause material.`,
      explanation: "In the perfect tense, objects and adverbials stay before the past participle, which closes the clause.",
      correctedSuggestion: sentence.tokens
        .filter((_, index) => index !== ppIndex)
        .map((token) => token.surface)
        .concat(sentence.tokens[ppIndex].surface)
        .join(" "),
      affectedTokenIndices: [sentence.tokens[ppIndex].index],
      priority: 1,
    };
  }

  return {
    ruleName: "Perfect Tense Word Order",
    ruleId: "perfect_word_order",
    status: "pass",
    message: `Past participle '${sentence.tokens[ppIndex].surface}' is correctly clause-final.`,
    explanation: "The auxiliary is followed by the rest of the clause, with the participle at the end.",
    priority: 5,
  };
}

export function ruleProfessionArticleUsage(sentence: ParsedSentence): RuleResult {
  const professionNouns = new Set(["student", "leraar", "lerares", "dokter"]);
  const copularVerbIndex = sentence.tokens.findIndex(
    (token) => token.pos === "verb" && (token.lemma === "zijn" || token.lemma === "worden"),
  );

  if (copularVerbIndex === -1) {
    return {
      ruleName: "Profession Article Usage",
      ruleId: "profession_article",
      status: "pass",
      message: "No copular profession phrase detected.",
      explanation: "",
      priority: 5,
    };
  }

  for (let index = copularVerbIndex + 1; index < sentence.tokens.length - 1; index++) {
    const article = sentence.tokens[index];
    const noun = sentence.tokens[index + 1];

    if (article.lower === "een" && noun.pos === "noun" && professionNouns.has(noun.lower)) {
      return {
        ruleName: "Profession Article Usage",
        ruleId: "profession_article",
        status: "fail",
        message: `Profession '${noun.surface}' should normally appear without '${article.surface}' after '${sentence.tokens[copularVerbIndex].surface}'.`,
        explanation: "After zijn or worden, professions and roles usually function as predicate nouns without an indefinite article.",
        correctedSuggestion: sentence.tokens
          .filter((token) => token.index !== article.index)
          .map((token) => token.surface)
          .join(" "),
        affectedTokenIndices: [article.index],
        priority: 2,
      };
    }
  }

  return {
    ruleName: "Profession Article Usage",
    ruleId: "profession_article",
    status: "pass",
    message: "Profession phrase looks idiomatic.",
    explanation: "Predicate profession nouns are not carrying an unnecessary article here.",
    priority: 5,
  };
}

// ── Export all rules ──────────────────────────────────────────

// ── RULE 10: Negation Placement ──────────────────────────────
//
// 'niet' placement in Dutch: typically comes after the direct object
// and before prepositional phrases / adjective complements.
// Warns when 'niet' appears in position 1 (right after subject) or
// immediately before the finite verb (unusual in most cases).
//
export function ruleNegation(sentence: ParsedSentence): RuleResult {
  const mc = sentence.mainClauseTokens;
  const nietLocalIdx = mc.findIndex((t) => t.lower === "niet");

  if (nietLocalIdx === -1) {
    return {
      ruleName: "Negation Placement",
      ruleId: "negation",
      status: "pass",
      message: "No 'niet' detected.",
      explanation: "",
      priority: 5,
    };
  }

  const verbLocalIdx = mc.findIndex((t) => t.isFiniteVerb);
  const SUBJECT_PRONOUNS_SET = new Set(["ik", "jij", "je", "u", "hij", "zij", "ze", "het", "wij", "we", "jullie", "men"]);
  const subjectLocalIdx = mc.findIndex((t) => SUBJECT_PRONOUNS_SET.has(t.lower) || t.role === "subject");

  // 'niet' immediately before the finite verb with material before subject is unusual
  if (verbLocalIdx > 1 && nietLocalIdx === verbLocalIdx - 1 && subjectLocalIdx !== -1 && subjectLocalIdx < verbLocalIdx - 1) {
    return {
      ruleName: "Negation Placement",
      ruleId: "negation",
      status: "warning",
      message: "'niet' immediately before the finite verb is unusual. It usually comes after the direct object.",
      explanation: "In Dutch, 'niet' typically follows the direct object: 'Ik zie hem niet' rather than 'Ik niet zie hem'. Placing 'niet' just before the finite verb is uncommon in main clauses.",
      priority: 3,
    };
  }

  // 'niet' in position 1 (right after subject, before the verb) — typically wrong
  if (subjectLocalIdx !== -1 && nietLocalIdx === subjectLocalIdx + 1 && verbLocalIdx > nietLocalIdx) {
    return {
      ruleName: "Negation Placement",
      ruleId: "negation",
      status: "warning",
      message: "'niet' in position 1 after subject may be incorrect. In Dutch, 'niet' usually comes after the direct object or at the end.",
      explanation: "Dutch negation 'niet' usually follows the direct object: 'Ik doe het niet' rather than 'Ik niet doe het'. Check that 'niet' is placed correctly.",
      priority: 3,
    };
  }

  return {
    ruleName: "Negation Placement",
    ruleId: "negation",
    status: "pass",
    message: "'niet' placement appears correct.",
    explanation: "",
    priority: 5,
  };
}

// ── RULE 11: Er-expletive Subject ────────────────────────────
//
// When 'er' functions as an expletive (impersonal) subject
// at the start of a sentence, the finite verb must be in position 2.
//
export function ruleErExpletive(sentence: ParsedSentence): RuleResult {
  const mc = sentence.mainClauseTokens;

  if (mc.length === 0 || mc[0].lower !== "er") {
    return {
      ruleName: "Er-expletive",
      ruleId: "er_expletive",
      status: "pass",
      message: "No er-expletive construction detected.",
      explanation: "",
      priority: 5,
    };
  }

  const verbLocalIdx = mc.findIndex((t) => t.isFiniteVerb);

  if (verbLocalIdx === 1) {
    return {
      ruleName: "Er-expletive",
      ruleId: "er_expletive",
      status: "pass",
      message: "Er-expletive construction: finite verb correctly in position 2.",
      explanation: "In an impersonal 'er' construction, the finite verb is correctly placed in position 2.",
      priority: 5,
    };
  }

  if (verbLocalIdx === -1) {
    return {
      ruleName: "Er-expletive",
      ruleId: "er_expletive",
      status: "warning",
      message: "Er-expletive detected but no finite verb found.",
      explanation: "An 'er' at the start may introduce an impersonal construction — a finite verb should follow.",
      priority: 4,
    };
  }

  return {
    ruleName: "Er-expletive",
    ruleId: "er_expletive",
    status: "warning",
    message: `In an er-expletive construction, the finite verb should be in position 2. '${mc[verbLocalIdx].surface}' is in position ${verbLocalIdx + 1}.`,
    explanation: "When 'er' functions as an expletive subject (impersonal construction like 'Er werkt een man hier'), the finite verb must follow directly in position 2.",
    priority: 3,
  };
}

export const ALL_RULES = [
  ruleV2WordOrder,
  ruleVerbConjugation,
  ruleSubordinateVerbFinal,
  ruleInversion,
  ruleSeparableVerb,
  ruleModalInfinitive,
  rulePerfectTenseWordOrder,
  ruleAuxiliarySelection,
  ruleProfessionArticleUsage,
  ruleNegation,
  ruleErExpletive,
];
