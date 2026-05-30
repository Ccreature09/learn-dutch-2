// ─────────────────────────────────────────────────────────────
// Language Repository
//
// Central query layer that merges raw data (DUTCH_VERBS,
// DUTCH_VOCABULARY) with behaviour metadata (VERB_METADATA,
// NOUN_METADATA) into fully-enriched types.
//
// All sentence-generation logic should import verb/noun lists
// from here instead of filtering DUTCH_VERBS directly or
// maintaining its own hardcoded classification sets.
// ─────────────────────────────────────────────────────────────

import { DUTCH_VERBS, type DutchVerb } from "@/lib/data/verbs";
import { DUTCH_VOCABULARY, type VocabEntry } from "@/lib/data/vocabulary";
import { VERB_METADATA, type VerbMetadata, type CefrLevel } from "@/lib/data/verb-metadata";
import { NOUN_METADATA, type NounMetadata } from "@/lib/data/noun-metadata";

// ──────────────────────────────────────────────────────────────
// Enriched Types
// ──────────────────────────────────────────────────────────────

/** A DutchVerb augmented with all VerbMetadata fields. */
export interface EnrichedVerb extends DutchVerb {
  transitive: boolean;
  takesClauseObject: boolean;
  acceptedObjectRoles: string[] | undefined;
  verbClass: string;
  cefrLevel: CefrLevel;
  passivizable: boolean;
}

/** A VocabEntry noun augmented with all NounMetadata fields. */
export interface EnrichedNoun {
  dutch: string;
  english: string;
  gender: "de" | "het" | undefined;
  frequency: string;
  category: string[];
  semanticRoles: string[];
  cefrLevel: CefrLevel;
  plural: string | undefined;
  isConditionalResource: boolean;
}

// ──────────────────────────────────────────────────────────────
// Private builder functions
// ──────────────────────────────────────────────────────────────

function buildEnrichedVerbs(): EnrichedVerb[] {
  return DUTCH_VERBS.map((verb): EnrichedVerb => {
    const meta: VerbMetadata | undefined = VERB_METADATA[verb.infinitive];
    return {
      ...verb,
      transitive: meta?.transitive ?? false,
      takesClauseObject: meta?.takesClauseObject ?? false,
      acceptedObjectRoles: meta?.acceptedObjectRoles,
      verbClass: meta?.verbClass ?? "physical",
      cefrLevel: meta?.cefrLevel ?? "A2",
      passivizable: meta?.passivizable ?? false,
    };
  });
}

function buildEnrichedNouns(): EnrichedNoun[] {
  return DUTCH_VOCABULARY
    .filter((entry): entry is VocabEntry & { pos: "noun" } => entry.pos === "noun")
    .map((entry): EnrichedNoun => {
      const meta: NounMetadata | undefined = NOUN_METADATA[entry.dutch];
      return {
        dutch: entry.dutch,
        english: entry.english,
        gender: entry.gender,
        frequency: entry.frequency,
        category: entry.category ?? [],
        semanticRoles: meta?.semanticRoles ?? ["physical_object"],
        cefrLevel: meta?.cefrLevel ?? "A2",
        plural: meta?.plural,
        isConditionalResource: meta?.isConditionalResource ?? false,
      };
    });
}

// ──────────────────────────────────────────────────────────────
// Pre-computed collections (built once at module load)
// ──────────────────────────────────────────────────────────────

const ALL_VERBS: EnrichedVerb[] = buildEnrichedVerbs();
const ALL_NOUNS: EnrichedNoun[] = buildEnrichedNouns();

// Verb subsets
const TRANSITIVE_VERBS: EnrichedVerb[] = ALL_VERBS.filter(
  (v) => v.transitive && !v.isModal && !v.separable,
);
const INTRANSITIVE_VERBS: EnrichedVerb[] = ALL_VERBS.filter(
  (v) => !v.transitive && !v.isModal && !v.separable,
);
const DAT_VERBS: EnrichedVerb[] = ALL_VERBS.filter((v) => v.takesClauseObject);
const MODAL_VERBS_LIST: EnrichedVerb[] = ALL_VERBS.filter((v) => v.isModal);
const SEPARABLE_VERBS_LIST: EnrichedVerb[] = ALL_VERBS.filter(
  (v) => v.separable && !!v.separablePrefix,
);
const HEBBEN_VERBS: EnrichedVerb[] = ALL_VERBS.filter(
  (v) => v.auxiliary === "hebben" && !v.isModal && !v.separable && v.infinitive !== "hebben",
);
const ZIJN_VERBS: EnrichedVerb[] = ALL_VERBS.filter(
  (v) =>
    (v.auxiliary === "zijn" || v.auxiliary === "both") &&
    !v.isModal &&
    v.infinitive !== "zijn",
);
const ANIMATE_ACCEPTING_VERBS: EnrichedVerb[] = TRANSITIVE_VERBS.filter(
  (v) => v.acceptedObjectRoles?.includes("animate_person"),
);
const PASSIVIZABLE_VERBS: EnrichedVerb[] = TRANSITIVE_VERBS.filter((v) => v.passivizable);

// Noun subsets
const CONDITIONAL_RESOURCE_NOUNS: EnrichedNoun[] = ALL_NOUNS.filter(
  (n) => n.isConditionalResource,
);

// Role → nouns lookup (pre-indexed for fast compatible-noun queries)
const NOUNS_BY_ROLE = new Map<string, EnrichedNoun[]>();
for (const noun of ALL_NOUNS) {
  for (const role of noun.semanticRoles) {
    if (!NOUNS_BY_ROLE.has(role)) NOUNS_BY_ROLE.set(role, []);
    NOUNS_BY_ROLE.get(role)!.push(noun);
  }
}

// ──────────────────────────────────────────────────────────────
// Public query API
// ──────────────────────────────────────────────────────────────

/** All enriched verbs (full database). */
export function getAllVerbs(): EnrichedVerb[] {
  return ALL_VERBS;
}

/** All enriched nouns (full vocabulary). */
export function getAllNouns(): EnrichedNoun[] {
  return ALL_NOUNS;
}

/** Transitive non-modal non-separable verbs. */
export function getTransitiveVerbs(): EnrichedVerb[] {
  return TRANSITIVE_VERBS;
}

/** Intransitive non-modal verbs. */
export function getIntransitiveVerbs(): EnrichedVerb[] {
  return INTRANSITIVE_VERBS;
}

/** Verbs that license a dat/complement clause. */
export function getDatVerbs(): EnrichedVerb[] {
  return DAT_VERBS;
}

/** Modal verbs (kunnen, willen, moeten, mogen, zullen). */
export function getModalVerbs(): EnrichedVerb[] {
  return MODAL_VERBS_LIST;
}

/** Separable verbs. */
export function getSeparableVerbs(): EnrichedVerb[] {
  return SEPARABLE_VERBS_LIST;
}

/**
 * Non-modal, non-separable verbs that form their perfect tense
 * with "hebben" (excluding hebben itself).
 */
export function getHebbenVerbs(): EnrichedVerb[] {
  return HEBBEN_VERBS;
}

/**
 * Non-modal verbs that form their perfect tense with "zijn"
 * or "both" (excluding zijn itself).
 */
export function getZijnVerbs(): EnrichedVerb[] {
  return ZIJN_VERBS;
}

/** Transitive verbs that can be passivized (worden + ge-). */
export function getPassivizableVerbs(): EnrichedVerb[] {
  return PASSIVIZABLE_VERBS;
}

/**
 * Transitive verbs whose object may be an animate person.
 * Used for relative-clause generation.
 */
export function getAnimateAcceptingVerbs(): EnrichedVerb[] {
  return ANIMATE_ACCEPTING_VERBS;
}

/**
 * Abstract nouns that work as conditional resources
 * ("als ik de tijd heb …").
 */
export function getConditionalResourceNouns(): EnrichedNoun[] {
  return CONDITIONAL_RESOURCE_NOUNS;
}

/**
 * Look up a single enriched verb by Dutch infinitive.
 * Returns undefined if the verb is not in the database.
 */
export function getVerbByInfinitive(infinitive: string): EnrichedVerb | undefined {
  return ALL_VERBS.find((v) => v.infinitive === infinitive);
}

/**
 * Look up a single enriched noun by Dutch base-word.
 * Returns undefined if the noun is not in the vocabulary.
 */
export function getNounByDutch(dutch: string): EnrichedNoun | undefined {
  return ALL_NOUNS.find((n) => n.dutch === dutch);
}

/**
 * Return all nouns whose semantic roles overlap with the given
 * accepted-role list.  If acceptedRoles is undefined, all nouns
 * are returned (no restriction).
 */
export function getCompatibleNouns(acceptedRoles: string[] | undefined): EnrichedNoun[] {
  if (acceptedRoles === undefined) return ALL_NOUNS;
  if (acceptedRoles.length === 0) return [];
  const seen = new Set<string>();
  const result: EnrichedNoun[] = [];
  for (const role of acceptedRoles) {
    for (const noun of NOUNS_BY_ROLE.get(role) ?? []) {
      if (!seen.has(noun.dutch)) {
        seen.add(noun.dutch);
        result.push(noun);
      }
    }
  }
  return result;
}
