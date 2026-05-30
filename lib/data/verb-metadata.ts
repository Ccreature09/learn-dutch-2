// ─────────────────────────────────────────────────────────────
// Verb Metadata
//
// Behavioral properties for every Dutch verb in DUTCH_VERBS.
// This is the SINGLE SOURCE OF TRUTH for:
//   • transitivity (does the verb take a direct noun-phrase object?)
//   • dat-clause / complement clause acceptance
//   • which semantic roles the direct object may have
//   • CEFR level of the verb
//   • whether the verb is safe to passivize (worden + ge-)
//
// Only verbs that appear in DUTCH_VERBS need entries here.
// Metadata for unknown verbs is silently ignored.
// ─────────────────────────────────────────────────────────────

/** Broad semantic category of a verb's core meaning. */
export type VerbClass =
  | "movement"
  | "cognitive"
  | "communication"
  | "perception"
  | "possession"
  | "creation"
  | "stative"
  | "physical"
  | "social"
  | "commerce"
  | "modal";

/** Semantic roles that may be assigned to a direct object. */
export type SemanticRole =
  | "animate_person"
  | "animate_animal"
  | "food"
  | "drink"
  | "text"
  | "vehicle"
  | "location"
  | "device"
  | "clothing"
  | "abstract"
  | "physical_object"
  | "event";

/** CEFR proficiency level. */
export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export interface VerbMetadata {
  /** Verb takes a direct noun-phrase object (SVO). */
  transitive: boolean;
  /** Verb licenses a dat/om te / omdat complement clause. */
  takesClauseObject: boolean;
  /**
   * Semantic roles the direct object may bear.
   * undefined = no restriction (any object works).
   * Empty array = verb never takes an object (pure intransitive).
   */
  acceptedObjectRoles?: SemanticRole[];
  /** Semantic class of the verb. */
  verbClass: VerbClass;
  /** CEFR level. */
  cefrLevel: CefrLevel;
  /** Can be the main verb in a worden-passive. */
  passivizable: boolean;
}

/**
 * Verb behavior table.
 * Keyed by Dutch infinitive — must match DutchVerb.infinitive exactly.
 */
export const VERB_METADATA: Record<string, VerbMetadata> = {

  // ── Core copulae ────────────────────────────────────────────
  zijn: {
    transitive: false, takesClauseObject: false,
    verbClass: "stative", cefrLevel: "A1", passivizable: false,
  },
  hebben: {
    transitive: true, takesClauseObject: false,
    acceptedObjectRoles: [
      "animate_person", "food", "drink", "text", "physical_object",
      "device", "abstract", "vehicle", "clothing", "event",
    ],
    verbClass: "possession", cefrLevel: "A1", passivizable: false,
  },
  worden: {
    transitive: false, takesClauseObject: false,
    verbClass: "stative", cefrLevel: "A1", passivizable: false,
  },

  // ── Movement ────────────────────────────────────────────────
  gaan: {
    transitive: false, takesClauseObject: false,
    verbClass: "movement", cefrLevel: "A1", passivizable: false,
  },
  komen: {
    transitive: false, takesClauseObject: false,
    verbClass: "movement", cefrLevel: "A1", passivizable: false,
  },
  lopen: {
    transitive: false, takesClauseObject: false,
    verbClass: "movement", cefrLevel: "A1", passivizable: false,
  },
  rijden: {
    transitive: false, takesClauseObject: false,
    verbClass: "movement", cefrLevel: "A2", passivizable: false,
  },
  vallen: {
    transitive: false, takesClauseObject: false,
    verbClass: "movement", cefrLevel: "A2", passivizable: false,
  },
  reizen: {
    transitive: false, takesClauseObject: false,
    verbClass: "movement", cefrLevel: "A2", passivizable: false,
  },
  opstaan: {
    transitive: false, takesClauseObject: false,
    verbClass: "movement", cefrLevel: "A2", passivizable: false,
  },
  thuiskomen: {
    transitive: false, takesClauseObject: false,
    verbClass: "movement", cefrLevel: "A2", passivizable: false,
  },
  aankomen: {
    transitive: false, takesClauseObject: false,
    verbClass: "movement", cefrLevel: "B1", passivizable: false,
  },

  // ── State / Position ────────────────────────────────────────
  staan: {
    transitive: false, takesClauseObject: false,
    verbClass: "stative", cefrLevel: "A1", passivizable: false,
  },
  zitten: {
    transitive: false, takesClauseObject: false,
    verbClass: "stative", cefrLevel: "A1", passivizable: false,
  },
  liggen: {
    transitive: false, takesClauseObject: false,
    verbClass: "stative", cefrLevel: "A2", passivizable: false,
  },
  houden: {
    transitive: true, takesClauseObject: false,
    verbClass: "stative", cefrLevel: "A1", passivizable: false,
  },
  leven: {
    transitive: false, takesClauseObject: false,
    verbClass: "stative", cefrLevel: "A2", passivizable: false,
  },
  wonen: {
    transitive: false, takesClauseObject: false,
    verbClass: "stative", cefrLevel: "A1", passivizable: false,
  },
  heten: {
    transitive: false, takesClauseObject: false,
    verbClass: "stative", cefrLevel: "A1", passivizable: false,
  },

  // ── Physical / Daily ────────────────────────────────────────
  doen: {
    transitive: true, takesClauseObject: false,
    verbClass: "physical", cefrLevel: "A1", passivizable: true,
  },
  slapen: {
    transitive: false, takesClauseObject: false,
    verbClass: "physical", cefrLevel: "A1", passivizable: false,
  },
  werken: {
    transitive: false, takesClauseObject: false,
    verbClass: "physical", cefrLevel: "A1", passivizable: false,
  },
  spelen: {
    transitive: false, takesClauseObject: false,
    verbClass: "physical", cefrLevel: "A1", passivizable: false,
  },
  eten: {
    transitive: true, takesClauseObject: false,
    acceptedObjectRoles: ["food", "physical_object"],
    verbClass: "physical", cefrLevel: "A1", passivizable: true,
  },
  drinken: {
    transitive: true, takesClauseObject: false,
    acceptedObjectRoles: ["drink"],
    verbClass: "physical", cefrLevel: "A1", passivizable: true,
  },
  koken: {
    transitive: false, takesClauseObject: false,
    verbClass: "physical", cefrLevel: "A1", passivizable: false,
  },
  wachten: {
    transitive: false, takesClauseObject: false,
    verbClass: "physical", cefrLevel: "A1", passivizable: false,
  },
  pakken: {
    transitive: true, takesClauseObject: false,
    verbClass: "physical", cefrLevel: "A2", passivizable: true,
  },
  openen: {
    transitive: true, takesClauseObject: false,
    acceptedObjectRoles: ["physical_object"],
    verbClass: "physical", cefrLevel: "A1", passivizable: true,
  },
  sluiten: {
    transitive: true, takesClauseObject: false,
    acceptedObjectRoles: ["physical_object"],
    verbClass: "physical", cefrLevel: "A1", passivizable: true,
  },

  // ── Perception ──────────────────────────────────────────────
  zien: {
    transitive: true, takesClauseObject: true,
    acceptedObjectRoles: ["animate_person", "animate_animal", "physical_object", "vehicle"],
    verbClass: "perception", cefrLevel: "A1", passivizable: true,
  },
  horen: {
    transitive: true, takesClauseObject: false,
    acceptedObjectRoles: ["animate_person", "text"],
    verbClass: "perception", cefrLevel: "A1", passivizable: true,
  },
  voelen: {
    transitive: true, takesClauseObject: true,
    verbClass: "perception", cefrLevel: "A2", passivizable: false,
  },
  kijken: {
    transitive: false, takesClauseObject: false,
    verbClass: "perception", cefrLevel: "A1", passivizable: false,
  },
  luisteren: {
    transitive: false, takesClauseObject: false,
    verbClass: "perception", cefrLevel: "A1", passivizable: false,
  },

  // ── Communication ───────────────────────────────────────────
  zeggen: {
    transitive: false, takesClauseObject: true,
    verbClass: "communication", cefrLevel: "A1", passivizable: false,
  },
  spreken: {
    transitive: true, takesClauseObject: false,
    acceptedObjectRoles: ["abstract", "text"],
    verbClass: "communication", cefrLevel: "A1", passivizable: false,
  },
  schrijven: {
    transitive: true, takesClauseObject: false,
    acceptedObjectRoles: ["text", "physical_object"],
    verbClass: "communication", cefrLevel: "A1", passivizable: true,
  },
  praten: {
    transitive: false, takesClauseObject: false,
    verbClass: "communication", cefrLevel: "A1", passivizable: false,
  },
  sturen: {
    transitive: true, takesClauseObject: false,
    acceptedObjectRoles: ["text", "physical_object"],
    verbClass: "communication", cefrLevel: "A2", passivizable: true,
  },
  vertellen: {
    transitive: true, takesClauseObject: true,
    acceptedObjectRoles: ["text"],
    verbClass: "communication", cefrLevel: "A1", passivizable: false,
  },
  opbellen: {
    transitive: true, takesClauseObject: false,
    acceptedObjectRoles: ["animate_person"],
    verbClass: "communication", cefrLevel: "A2", passivizable: false,
  },

  // ── Cognition ───────────────────────────────────────────────
  weten: {
    transitive: false, takesClauseObject: true,
    verbClass: "cognitive", cefrLevel: "A1", passivizable: false,
  },
  denken: {
    transitive: false, takesClauseObject: true,
    verbClass: "cognitive", cefrLevel: "A1", passivizable: false,
  },
  hopen: {
    transitive: false, takesClauseObject: true,
    verbClass: "cognitive", cefrLevel: "A2", passivizable: false,
  },
  begrijpen: {
    transitive: true, takesClauseObject: true,
    acceptedObjectRoles: ["text", "abstract"],
    verbClass: "cognitive", cefrLevel: "A2", passivizable: false,
  },
  vergeten: {
    transitive: true, takesClauseObject: true,
    verbClass: "cognitive", cefrLevel: "A2", passivizable: false,
  },
  vinden: {
    transitive: true, takesClauseObject: false,
    acceptedObjectRoles: ["animate_person", "physical_object", "text"],
    verbClass: "cognitive", cefrLevel: "A1", passivizable: true,
  },
  leren: {
    transitive: true, takesClauseObject: false,
    acceptedObjectRoles: ["text", "abstract"],
    verbClass: "cognitive", cefrLevel: "A1", passivizable: true,
  },
  proberen: {
    transitive: false, takesClauseObject: true,
    verbClass: "cognitive", cefrLevel: "A1", passivizable: false,
  },
  verwachten: {
    transitive: true, takesClauseObject: true,
    verbClass: "cognitive", cefrLevel: "B1", passivizable: false,
  },
  lezen: {
    transitive: true, takesClauseObject: false,
    acceptedObjectRoles: ["text"],
    verbClass: "cognitive", cefrLevel: "A1", passivizable: true,
  },

  // ── Social ──────────────────────────────────────────────────
  helpen: {
    transitive: true, takesClauseObject: false,
    acceptedObjectRoles: ["animate_person"],
    verbClass: "social", cefrLevel: "A1", passivizable: true,
  },
  meedoen: {
    transitive: false, takesClauseObject: false,
    verbClass: "social", cefrLevel: "A2", passivizable: false,
  },

  // ── Commerce / Transfer ─────────────────────────────────────
  kopen: {
    transitive: true, takesClauseObject: false,
    acceptedObjectRoles: [
      "physical_object", "food", "drink", "text", "vehicle", "device", "clothing",
    ],
    verbClass: "commerce", cefrLevel: "A1", passivizable: true,
  },
  betalen: {
    transitive: true, takesClauseObject: false,
    verbClass: "commerce", cefrLevel: "A1", passivizable: true,
  },
  geven: {
    transitive: true, takesClauseObject: false,
    acceptedObjectRoles: ["physical_object", "text", "abstract"],
    verbClass: "commerce", cefrLevel: "A1", passivizable: true,
  },
  nemen: {
    transitive: true, takesClauseObject: false,
    verbClass: "commerce", cefrLevel: "A1", passivizable: true,
  },
  krijgen: {
    transitive: true, takesClauseObject: false,
    verbClass: "commerce", cefrLevel: "A1", passivizable: true,
  },
  brengen: {
    transitive: true, takesClauseObject: false,
    verbClass: "movement", cefrLevel: "A1", passivizable: false,
  },

  // ── Creation ────────────────────────────────────────────────
  maken: {
    transitive: true, takesClauseObject: false,
    acceptedObjectRoles: ["physical_object", "text", "food"],
    verbClass: "creation", cefrLevel: "A1", passivizable: true,
  },
  afmaken: {
    transitive: true, takesClauseObject: false,
    acceptedObjectRoles: ["text", "physical_object"],
    verbClass: "creation", cefrLevel: "B1", passivizable: true,
  },

  // ── Search / Research ───────────────────────────────────────
  zoeken: {
    transitive: true, takesClauseObject: false,
    acceptedObjectRoles: ["animate_person", "physical_object", "text"],
    verbClass: "physical", cefrLevel: "A1", passivizable: false,
  },
  opzoeken: {
    transitive: true, takesClauseObject: false,
    acceptedObjectRoles: ["animate_person", "text"],
    verbClass: "cognitive", cefrLevel: "B1", passivizable: false,
  },

  // ── Modals ──────────────────────────────────────────────────
  kunnen: {
    transitive: false, takesClauseObject: false,
    verbClass: "modal", cefrLevel: "A1", passivizable: false,
  },
  willen: {
    transitive: false, takesClauseObject: false,
    verbClass: "modal", cefrLevel: "A1", passivizable: false,
  },
  moeten: {
    transitive: false, takesClauseObject: false,
    verbClass: "modal", cefrLevel: "A1", passivizable: false,
  },
  mogen: {
    transitive: false, takesClauseObject: false,
    verbClass: "modal", cefrLevel: "A1", passivizable: false,
  },
  zullen: {
    transitive: false, takesClauseObject: false,
    verbClass: "modal", cefrLevel: "A1", passivizable: false,
  },

  // ── Separable (non-movement) ─────────────────────────────────
  meenemen: {
    transitive: true, takesClauseObject: false,
    acceptedObjectRoles: ["animate_person", "physical_object"],
    verbClass: "movement", cefrLevel: "A2", passivizable: false,
  },
};
