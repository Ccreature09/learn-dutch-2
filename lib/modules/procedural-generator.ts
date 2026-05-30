import { type DutchVerb, getExpectedFiniteForm } from "@/lib/data/verbs";
import {
  SUBJECT_BANK as SUBJECTS,
  OBJECT_BANK as OBJECTS,
  ADVERB_BANK as ADVERBS,
  type SubjectBankEntry as SubjectEntry,
  type ObjectBankEntry as ObjectEntry,
  type AdverbBankEntry as AdverbEntry,
} from "@/lib/data/lexicon";
import { validateSentence } from "@/lib/grammar/engine";
import type { SentenceCategory, Difficulty } from "@/lib/grammar/types";
import {
  getTransitiveVerbs, getIntransitiveVerbs, getDatVerbs, getModalVerbs,
  getSeparableVerbs, getHebbenVerbs, getZijnVerbs, getPassivizableVerbs,
  getAnimateAcceptingVerbs, getConditionalResourceNouns, getVerbByInfinitive,
} from "@/lib/repository";
import {
  getEnglishBase, conjugateEnglish, questionAux, ENGLISH_PP,
} from "@/lib/utils/english-morphology";

// ─────────────────────────────────────────────────────────────
// Procedural Sentence Generator
//
// Generates infinite grammatically correct Dutch sentences by
// combining subjects, verbs, objects, and adverbs from the
// verb and vocabulary databases. Rule-based — no fixed lists.
// ─────────────────────────────────────────────────────────────

// English morphology helpers are imported from @/lib/utils/english-morphology

// ─────────────────────────────────────────────────────────────
// Utility
// ─────────────────────────────────────────────────────────────

function weightedRandom<T extends { weight: number }>(items: T[]): T {
  const total = items.reduce((s, i) => s + i.weight, 0);
  let r = Math.random() * total;
  for (const item of items) {
    r -= item.weight;
    if (r <= 0) return item;
  }
  return items[items.length - 1];
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─────────────────────────────────────────────────────────────
// Verb selectors
// ─────────────────────────────────────────────────────────────

// ── Verb selectors — delegated to the Language Repository ─────
// Classification sets (TRANSITIVE_SET, INTRANSITIVE_SET, DAT_VERB_INFINITIVES)
// now live in lib/data/verb-metadata.ts and are queried via lib/repository.
function transitiveVerbs()   { return getTransitiveVerbs();   }
function intransitiveVerbs() { return getIntransitiveVerbs(); }
function modalVerbs()        { return getModalVerbs();        }
function separableVerbs()    { return getSeparableVerbs();    }
function hebbenVerbs()       { return getHebbenVerbs();       }
function zijnVerbs()         { return getZijnVerbs();         }
function datVerbs()          { return getDatVerbs();          }

// ─────────────────────────────────────────────────────────────
// Semantic verb–object compatibility
// ─────────────────────────────────────────────────────────────

// Verb–object compatibility now derives from VerbMetadata.acceptedObjectRoles
// (defined in lib/data/verb-metadata.ts and queried via lib/repository).
function getCompatibleObjects(verbInfinitive: string): ObjectEntry[] {
  const verb = getVerbByInfinitive(verbInfinitive);
  if (!verb) return OBJECTS;
  const roles = verb.acceptedObjectRoles;
  if (roles === undefined) return OBJECTS;
  if (roles.length === 0) return [];
  return OBJECTS.filter((obj) => obj.semanticRoles.some((role) => roles.includes(role)));
}

// ─────────────────────────────────────────────────────────────
// Result type
// ─────────────────────────────────────────────────────────────

export type SentencePattern =
  | "sv"
  | "svo"
  | "svadv"
  | "adv_sv"
  | "adv_svo"
  | "polar_question"
  | "wh_question"
  | "modal"
  | "modal_obj"
  | "perfect_hebben"
  | "perfect_zijn"
  | "separable"
  | "subordinate"
  | "relative_clause"
  | "conditional_als"
  | "passive";

export interface ProceduralSentence {
  dutch: string;
  english: string;
  pattern: SentencePattern;
  category: SentenceCategory;
  difficulty: Difficulty;
  tense: "present" | "past" | "perfect";
  structureLabel: string;
  keyDutchWords: string[];
  keyEnglishWords: string[];
  // For error injection
  verbInfinitive: string;
  verbForm: string;
  subjectDutch: string;
  subjectPerson: 1 | 2 | 3;
  subjectNumber: "singular" | "plural";
  prefixDutch?: string;
}

// ─────────────────────────────────────────────────────────────
// Dutch verb form resolver
// ─────────────────────────────────────────────────────────────

function dutchForm(
  verb: DutchVerb,
  person: 1 | 2 | 3,
  number: "singular" | "plural",
  tense: "present" | "past",
  inverted = false,
): string {
  if (tense === "past") return number === "plural" ? verb.pastPl : verb.pastSg;
  return getExpectedFiniteForm(verb, person, number, inverted);
}

function isInverted(subject: SubjectEntry): boolean {
  return subject.dutch === "jij" || subject.dutch === "je";
}

// ─────────────────────────────────────────────────────────────
// Pattern generators
// ─────────────────────────────────────────────────────────────

function genSV(s: SubjectEntry, tense: "present" | "past"): ProceduralSentence | null {
  const pool = intransitiveVerbs();
  if (!pool.length) return null;
  const verb = pickRandom(pool);
  const vf = dutchForm(verb, s.person, s.number, tense);
  const eb = getEnglishBase(verb.translation);
  return {
    dutch: `${s.dutch} ${vf}.`,
    english: `${s.english} ${conjugateEnglish(eb, s.person, s.number, tense)}.`,
    pattern: "sv",
    category: tense === "past" ? "simple_past" : "basic",
    difficulty: "beginner",
    tense,
    structureLabel: "Subject + Verb",
    keyDutchWords: [s.dutch, vf],
    keyEnglishWords: [s.english.toLowerCase(), eb],
    verbInfinitive: verb.infinitive, verbForm: vf,
    subjectDutch: s.dutch, subjectPerson: s.person, subjectNumber: s.number,
  };
}

function genSVO(s: SubjectEntry, tense: "present" | "past"): ProceduralSentence | null {
  const pool = transitiveVerbs();
  if (!pool.length) return null;
  // Retry to find a verb that has compatible objects
  for (let i = 0; i < 4; i++) {
    const verb = pickRandom(pool);
    const compatObjs = getCompatibleObjects(verb.infinitive);
    if (!compatObjs.length) continue;
    const obj = pickRandom(compatObjs);
    const vf = dutchForm(verb, s.person, s.number, tense);
    const eb = getEnglishBase(verb.translation);
    return {
      dutch: `${s.dutch} ${vf} ${obj.dutch}.`,
      english: `${s.english} ${conjugateEnglish(eb, s.person, s.number, tense)} ${obj.english}.`,
      pattern: "svo",
      category: tense === "past" ? "simple_past" : "basic",
      difficulty: "beginner",
      tense,
      structureLabel: "Subject + Verb + Object (SVO)",
      keyDutchWords: [s.dutch, vf, obj.dutch],
      keyEnglishWords: [s.english.toLowerCase(), eb, obj.english.toLowerCase()],
      verbInfinitive: verb.infinitive, verbForm: vf,
      subjectDutch: s.dutch, subjectPerson: s.person, subjectNumber: s.number,
    };
  }
  return null;
}

function genSVAdv(s: SubjectEntry, tense: "present" | "past"): ProceduralSentence | null {
  const pool = intransitiveVerbs();
  if (!pool.length) return null;
  const verb = pickRandom(pool);
  const adv = pickRandom(ADVERBS);
  const vf = dutchForm(verb, s.person, s.number, tense);
  const eb = getEnglishBase(verb.translation);
  return {
    dutch: `${s.dutch} ${vf} ${adv.dutch}.`,
    english: `${s.english} ${conjugateEnglish(eb, s.person, s.number, tense)} ${adv.english}.`,
    pattern: "svadv",
    category: tense === "past" ? "simple_past" : "basic",
    difficulty: "beginner",
    tense,
    structureLabel: "Subject + Verb + Adverb",
    keyDutchWords: [s.dutch, vf, adv.dutch],
    keyEnglishWords: [s.english.toLowerCase(), eb, adv.english.toLowerCase()],
    verbInfinitive: verb.infinitive, verbForm: vf,
    subjectDutch: s.dutch, subjectPerson: s.person, subjectNumber: s.number,
  };
}

function genAdvSV(s: SubjectEntry, tense: "present" | "past"): ProceduralSentence | null {
  const pool = intransitiveVerbs();
  const advPool = ADVERBS.filter((a) => a.canFront);
  if (!pool.length || !advPool.length) return null;
  const verb = pickRandom(pool);
  const adv = pickRandom(advPool);
  const inv = isInverted(s);
  const vf = dutchForm(verb, s.person, s.number, tense, inv);
  const eb = getEnglishBase(verb.translation);
  return {
    dutch: `${adv.dutch} ${vf} ${s.dutch}.`,
    english: `${adv.english}, ${s.english} ${conjugateEnglish(eb, s.person, s.number, tense)}.`,
    pattern: "adv_sv",
    category: "basic",
    difficulty: "beginner",
    tense,
    structureLabel: "Fronted Adverb + Verb + Subject (V2 inversion)",
    keyDutchWords: [adv.dutch, vf, s.dutch],
    keyEnglishWords: [adv.english.toLowerCase(), s.english.toLowerCase(), eb],
    verbInfinitive: verb.infinitive, verbForm: vf,
    subjectDutch: s.dutch, subjectPerson: s.person, subjectNumber: s.number,
  };
}

function genAdvSVO(s: SubjectEntry, tense: "present" | "past"): ProceduralSentence | null {
  const pool = transitiveVerbs();
  const advPool = ADVERBS.filter((a) => a.canFront);
  if (!pool.length || !advPool.length) return null;
  for (let i = 0; i < 4; i++) {
    const verb = pickRandom(pool);
    const compatObjs = getCompatibleObjects(verb.infinitive);
    if (!compatObjs.length) continue;
    const obj = pickRandom(compatObjs);
    const adv = pickRandom(advPool);
    const inv = isInverted(s);
    const vf = dutchForm(verb, s.person, s.number, tense, inv);
    const eb = getEnglishBase(verb.translation);
    return {
      dutch: `${adv.dutch} ${vf} ${s.dutch} ${obj.dutch}.`,
      english: `${adv.english}, ${s.english} ${conjugateEnglish(eb, s.person, s.number, tense)} ${obj.english}.`,
      pattern: "adv_svo",
      category: "basic",
      difficulty: "intermediate",
      tense,
      structureLabel: "Fronted Adverb + Verb + Subject + Object (V2 with object)",
      keyDutchWords: [adv.dutch, vf, s.dutch, obj.dutch],
      keyEnglishWords: [adv.english.toLowerCase(), s.english.toLowerCase(), eb, obj.english.toLowerCase()],
      verbInfinitive: verb.infinitive, verbForm: vf,
      subjectDutch: s.dutch, subjectPerson: s.person, subjectNumber: s.number,
    };
  }
  return null;
}

function genPolarQuestion(s: SubjectEntry, tense: "present" | "past"): ProceduralSentence | null {
  const useObject = Math.random() < 0.5;

  if (useObject) {
    const pool = transitiveVerbs();
    if (!pool.length) return null;
    for (let i = 0; i < 4; i++) {
      const verb = pickRandom(pool);
      const compatObjs = getCompatibleObjects(verb.infinitive);
      if (!compatObjs.length) continue;
      const obj = pickRandom(compatObjs);
      const vf = dutchForm(verb, s.person, s.number, tense, true);
      const eb = getEnglishBase(verb.translation);
      const aux = questionAux(s.person, s.number, tense);
      return {
        dutch: `${vf} ${s.dutch} ${obj.dutch}?`,
        english: `${aux} ${s.english.toLowerCase()} ${eb} ${obj.english}?`,
        pattern: "polar_question",
        category: "questions",
        difficulty: "intermediate",
        tense,
        structureLabel: "Finite Verb + Subject + Object (polar question)",
        keyDutchWords: [vf, s.dutch, obj.dutch],
        keyEnglishWords: [aux, s.english.toLowerCase(), eb, obj.english.toLowerCase()],
        verbInfinitive: verb.infinitive, verbForm: vf,
        subjectDutch: s.dutch, subjectPerson: s.person, subjectNumber: s.number,
      };
    }
    return null;
  }

  const pool = intransitiveVerbs();
  if (!pool.length) return null;
  const verb = pickRandom(pool);
  const vf = dutchForm(verb, s.person, s.number, tense, true);
  const eb = getEnglishBase(verb.translation);
  const aux = questionAux(s.person, s.number, tense);
  return {
    dutch: `${vf} ${s.dutch}?`,
    english: `${aux} ${s.english.toLowerCase()} ${eb}?`,
    pattern: "polar_question",
    category: "questions",
    difficulty: "beginner",
    tense,
    structureLabel: "Finite Verb + Subject (polar question)",
    keyDutchWords: [vf, s.dutch],
    keyEnglishWords: [aux, s.english.toLowerCase(), eb],
    verbInfinitive: verb.infinitive, verbForm: vf,
    subjectDutch: s.dutch, subjectPerson: s.person, subjectNumber: s.number,
  };
}

function genWhQuestion(s: SubjectEntry, tense: "present" | "past"): ProceduralSentence | null {
  const prompts = [
    { dutch: "waar", english: "Where" },
    { dutch: "wanneer", english: "When" },
    { dutch: "waarom", english: "Why" },
  ] as const;
  const prompt = pickRandom([...prompts]);
  const pool = intransitiveVerbs().filter(
    (verb) => verb.infinitive !== "zijn" && verb.infinitive !== "hebben",
  );
  if (!pool.length) return null;

  const verb = pickRandom(pool);
  const vf = dutchForm(verb, s.person, s.number, tense, true);
  const eb = getEnglishBase(verb.translation);
  const aux = questionAux(s.person, s.number, tense);

  return {
    dutch: `${prompt.dutch} ${vf} ${s.dutch}?`,
    english: `${prompt.english} ${aux} ${s.english.toLowerCase()} ${eb}?`,
    pattern: "wh_question",
    category: "questions",
    difficulty: "intermediate",
    tense,
    structureLabel: "WH-word + Finite Verb + Subject (WH-question)",
    keyDutchWords: [prompt.dutch, vf, s.dutch],
    keyEnglishWords: [prompt.english.toLowerCase(), aux, s.english.toLowerCase(), eb],
    verbInfinitive: verb.infinitive,
    verbForm: vf,
    subjectDutch: s.dutch,
    subjectPerson: s.person,
    subjectNumber: s.number,
  };
}

function genModal(s: SubjectEntry): ProceduralSentence | null {
  const modals = modalVerbs();
  const mainPool = intransitiveVerbs().filter(
    (v) => v.infinitive !== "zijn" && v.infinitive !== "hebben",
  );
  if (!modals.length || !mainPool.length) return null;
  const modal = pickRandom(modals);
  const main = pickRandom(mainPool);
  const mf = getExpectedFiniteForm(modal, s.person, s.number);
  const em = getEnglishBase(modal.translation);
  const ei = getEnglishBase(main.translation);
  return {
    dutch: `${s.dutch} ${mf} ${main.infinitive}.`,
    english: `${s.english} ${em} ${ei}.`,
    pattern: "modal",
    category: "modal_verbs",
    difficulty: "intermediate",
    tense: "present",
    structureLabel: "Subject + Modal + Infinitive",
    keyDutchWords: [s.dutch, mf, main.infinitive],
    keyEnglishWords: [s.english.toLowerCase(), em, ei],
    verbInfinitive: modal.infinitive, verbForm: mf,
    subjectDutch: s.dutch, subjectPerson: s.person, subjectNumber: s.number,
  };
}

function genModalObj(s: SubjectEntry): ProceduralSentence | null {
  const modals = modalVerbs();
  const mainPool = transitiveVerbs();
  if (!modals.length || !mainPool.length) return null;
  const modal = pickRandom(modals);
  for (let i = 0; i < 4; i++) {
    const main = pickRandom(mainPool);
    const compatObjs = getCompatibleObjects(main.infinitive);
    if (!compatObjs.length) continue;
    const obj = pickRandom(compatObjs);
    const mf = getExpectedFiniteForm(modal, s.person, s.number);
    const em = getEnglishBase(modal.translation);
    const ei = getEnglishBase(main.translation);
    // Dutch: S + Modal + Obj + Infinitive (infinitive goes last in modal construction)
    return {
      dutch: `${s.dutch} ${mf} ${obj.dutch} ${main.infinitive}.`,
      english: `${s.english} ${em} ${ei} ${obj.english}.`,
      pattern: "modal_obj",
      category: "modal_verbs",
      difficulty: "intermediate",
      tense: "present",
      structureLabel: "Subject + Modal + Object + Infinitive",
      keyDutchWords: [s.dutch, mf, obj.dutch, main.infinitive],
      keyEnglishWords: [s.english.toLowerCase(), em, ei, obj.english.toLowerCase()],
      verbInfinitive: modal.infinitive, verbForm: mf,
      subjectDutch: s.dutch, subjectPerson: s.person, subjectNumber: s.number,
    };
  }
  return null;
}

function genPerfectHebben(s: SubjectEntry): ProceduralSentence | null {
  const pool = hebbenVerbs();
  if (!pool.length) return null;
  const verb = pickRandom(pool);
  const hebben = getVerbByInfinitive("hebben");
  if (!hebben) return null;
  const auxF = getExpectedFiniteForm(hebben, s.person, s.number);
  const eb = getEnglishBase(verb.translation);
  return {
    dutch: `${s.dutch} ${auxF} ${verb.pastParticiple}.`,
    english: `${s.english} ${conjugateEnglish(eb, s.person, s.number, "perfect")}.`,
    pattern: "perfect_hebben",
    category: "perfect_tense",
    difficulty: "intermediate",
    tense: "perfect",
    structureLabel: "Subject + hebben + Past Participle",
    keyDutchWords: [s.dutch, auxF, verb.pastParticiple],
    keyEnglishWords: [s.english.toLowerCase(), eb],
    verbInfinitive: verb.infinitive, verbForm: auxF,
    subjectDutch: s.dutch, subjectPerson: s.person, subjectNumber: s.number,
  };
}

function genPerfectZijn(s: SubjectEntry): ProceduralSentence | null {
  const pool = zijnVerbs().filter((v) => v.infinitive !== "zijn");
  if (!pool.length) return null;
  const verb = pickRandom(pool);
  const zijn = getVerbByInfinitive("zijn");
  if (!zijn) return null;
  const auxF = getExpectedFiniteForm(zijn, s.person, s.number);
  const eb = getEnglishBase(verb.translation);
  return {
    dutch: `${s.dutch} ${auxF} ${verb.pastParticiple}.`,
    english: `${s.english} ${conjugateEnglish(eb, s.person, s.number, "perfect")}.`,
    pattern: "perfect_zijn",
    category: "zijn_hebben",
    difficulty: "intermediate",
    tense: "perfect",
    structureLabel: "Subject + zijn + Past Participle",
    keyDutchWords: [s.dutch, auxF, verb.pastParticiple],
    keyEnglishWords: [s.english.toLowerCase(), eb],
    verbInfinitive: verb.infinitive, verbForm: auxF,
    subjectDutch: s.dutch, subjectPerson: s.person, subjectNumber: s.number,
  };
}

function genSeparable(s: SubjectEntry, tense: "present" | "past"): ProceduralSentence | null {
  const pool = separableVerbs();
  if (!pool.length) return null;
  const verb = pickRandom(pool);
  const prefix = verb.separablePrefix!;
  const vf = dutchForm(verb, s.person, s.number, tense);
  const eb = getEnglishBase(verb.translation);
  const needsObj = ["opbellen", "meenemen", "afmaken", "opzoeken"].includes(verb.infinitive);
  const compatObjs = needsObj ? getCompatibleObjects(verb.infinitive) : [];
  const obj = compatObjs.length > 0 ? pickRandom(compatObjs) : null;
  const dutch = obj
    ? `${s.dutch} ${vf} ${obj.dutch} ${prefix}.`
    : `${s.dutch} ${vf} ${prefix}.`;
  const english = obj
    ? `${s.english} ${conjugateEnglish(eb, s.person, s.number, tense)} ${obj.english}.`
    : `${s.english} ${conjugateEnglish(eb, s.person, s.number, tense)}.`;
  return {
    dutch, english,
    pattern: "separable",
    category: "separable_verbs",
    difficulty: "intermediate",
    tense,
    structureLabel: "Subject + Verb(base) + [Object] + Prefix (separable verb)",
    keyDutchWords: obj ? [s.dutch, vf, prefix, obj.dutch] : [s.dutch, vf, prefix],
    keyEnglishWords: [s.english.toLowerCase(), eb],
    verbInfinitive: verb.infinitive, verbForm: vf,
    subjectDutch: s.dutch, subjectPerson: s.person, subjectNumber: s.number,
    prefixDutch: prefix,
  };
}

function genSubordinate(s: SubjectEntry): ProceduralSentence | null {
  const mainPool = datVerbs();
  const intPool = intransitiveVerbs().filter(
    (v) => v.infinitive !== "zijn" && v.infinitive !== "hebben",
  );
  if (!mainPool.length || !intPool.length) return null;
  const mainVerb = pickRandom(mainPool);
  const subVerbRaw = pickRandom(intPool);
  const subS = pickRandom(SUBJECTS.filter((sub) => sub.dutch !== s.dutch));
  const mvf = getExpectedFiniteForm(mainVerb, s.person, s.number);
  const svf = getExpectedFiniteForm(subVerbRaw, subS.person, subS.number);
  const meb = getEnglishBase(mainVerb.translation);
  const seb = getEnglishBase(subVerbRaw.translation);
  // Subordinate clause: sub-subject + verb FINAL
  return {
    dutch: `${s.dutch} ${mvf} dat ${subS.dutch} ${svf}.`,
    english: `${s.english} ${conjugateEnglish(meb, s.person, s.number, "present")} that ${subS.english} ${conjugateEnglish(seb, subS.person, subS.number, "present")}.`,
    pattern: "subordinate",
    category: "subordinate_clauses",
    difficulty: "intermediate",
    tense: "present",
    structureLabel: "Main clause + dat + Subordinate clause (verb-final)",
    keyDutchWords: [s.dutch, mvf, "dat", subS.dutch, svf],
    keyEnglishWords: [s.english.toLowerCase(), meb, "that", subS.english.toLowerCase(), seb],
    verbInfinitive: mainVerb.infinitive, verbForm: mvf,
    subjectDutch: s.dutch, subjectPerson: s.person, subjectNumber: s.number,
  };
}

// ─────────────────────────────────────────────────────────────
// B2 Pattern generators
// ─────────────────────────────────────────────────────────────

// Relative clause: "Ik ken de man die hier woont." (animate head noun)
function genRelativeClause(s: SubjectEntry): ProceduralSentence | null {
  const animateObjs = OBJECTS.filter((o) => o.semanticRoles.includes("animate_person"));
  if (!animateObjs.length) return null;
  const obj = pickRandom(animateObjs);

  // Verbs that accept animate_person objects (derived from verb metadata)
  const mvPool = getAnimateAcceptingVerbs().filter((v) => v.infinitive !== "hebben");
  if (!mvPool.length) return null;
  const mainVerb = pickRandom(mvPool);

  const rvPool = intransitiveVerbs().filter(
    (v) => !["zijn", "hebben", "meedoen", "thuiskomen"].includes(v.infinitive),
  );
  if (!rvPool.length) return null;
  const relVerb = pickRandom(rvPool);

  // Location/time adverb for relative clause (verb stays final)
  const placeAdvs = ADVERBS.filter((a) => ["place", "time"].includes(a.category));
  const relAdv = placeAdvs.length ? pickRandom(placeAdvs) : null;

  const mvf = dutchForm(mainVerb, s.person, s.number, "present");
  const rvf = getExpectedFiniteForm(relVerb, 3, "singular");
  const meb = getEnglishBase(mainVerb.translation);
  const reb = getEnglishBase(relVerb.translation);

  // Dutch: "die" for de-words, "dat" for het-words
  const rp = obj.dutch.startsWith("het ") ? "dat" : "die";

  // Dutch relative clause: die/dat [adv] [verb-final]
  const dutchRel = relAdv
    ? `${obj.dutch} ${rp} ${relAdv.dutch} ${rvf}`
    : `${obj.dutch} ${rp} ${rvf}`;
  // English: who [verb] [adv]
  const englishRel = relAdv
    ? `${obj.english} who ${conjugateEnglish(reb, 3, "singular", "present")} ${relAdv.english}`
    : `${obj.english} who ${conjugateEnglish(reb, 3, "singular", "present")}`;

  return {
    dutch: `${s.dutch} ${mvf} ${dutchRel}.`,
    english: `${s.english} ${conjugateEnglish(meb, s.person, s.number, "present")} ${englishRel}.`,
    pattern: "relative_clause",
    category: "relative_clauses",
    difficulty: "advanced",
    tense: "present",
    structureLabel: "Subject + Verb + [Noun + die/dat + Verb-final] (relative clause)",
    keyDutchWords: [s.dutch, mvf, obj.dutch, rp, rvf],
    keyEnglishWords: [s.english.toLowerCase(), meb, obj.english.toLowerCase(), "who", reb],
    verbInfinitive: mainVerb.infinitive, verbForm: mvf,
    subjectDutch: s.dutch, subjectPerson: s.person, subjectNumber: s.number,
  };
}

// Conditional resource nouns derived from noun metadata at module load
const CONDITIONAL_RESOURCE_BASE_WORDS = new Set(
  getConditionalResourceNouns().map((n) => n.dutch),
);

// Conditional: "Als ik de tijd heb, ga ik." (als-clause verb-final + V2 inversion)
function genConditional(s: SubjectEntry): ProceduralSentence | null {
  const hebben = getVerbByInfinitive("hebben");
  if (!hebben) return null;

  const condObjs = OBJECTS.filter((o) => CONDITIONAL_RESOURCE_BASE_WORDS.has(o.baseWord));
  if (!condObjs.length) return null;
  const condObj = pickRandom(condObjs);

  const mainPool = intransitiveVerbs().filter(
    (v) => v.infinitive !== "zijn" && v.infinitive !== "hebben",
  );
  if (!mainPool.length) return null;
  const mainVerb = pickRandom(mainPool);

  // Subordinate clause (als): S + obj + verb-final → "Als ik de tijd heb"
  const condVf = getExpectedFiniteForm(hebben, s.person, s.number);
  // Main clause after fronted als-clause: inversion → V + S
  const mainVf = dutchForm(mainVerb, s.person, s.number, "present", isInverted(s));
  const meb = getEnglishBase(mainVerb.translation);
  const haveForm = conjugateEnglish("have", s.person, s.number, "present");

  return {
    dutch: `Als ${s.dutch} ${condObj.dutch} ${condVf}, ${mainVf} ${s.dutch}.`,
    english: `If ${s.english} ${haveForm} ${condObj.english}, ${s.english} ${conjugateEnglish(meb, s.person, s.number, "present")}.`,
    pattern: "conditional_als",
    category: "conditional",
    difficulty: "advanced",
    tense: "present",
    structureLabel: "Als + Subordinate clause (verb-final) + Main clause (V2 inverted)",
    keyDutchWords: ["als", s.dutch, condObj.dutch, condVf, mainVf],
    keyEnglishWords: ["if", s.english.toLowerCase(), condObj.english.toLowerCase(), meb],
    verbInfinitive: mainVerb.infinitive, verbForm: mainVf,
    subjectDutch: s.dutch, subjectPerson: s.person, subjectNumber: s.number,
  };
}

// Passive: "Het boek wordt gelezen." (worden + past participle)
function genPassive(_s: SubjectEntry): ProceduralSentence | null {
  // Passivizable verbs derived from verb metadata (transitive, non-modal, non-separable, passivizable)
  const passivePool = getPassivizableVerbs();
  if (!passivePool.length) return null;

  for (let i = 0; i < 4; i++) {
    const verb = pickRandom(passivePool);
    const compatObjs = getCompatibleObjects(verb.infinitive).filter(
      // Exclude known plural nouns (use "wordt" for singular only)
      (o) => !["kinderen", "boodschappen", "kleren"].includes(o.baseWord),
    );
    if (!compatObjs.length) continue;
    const obj = pickRandom(compatObjs);

    const eb = getEnglishBase(verb.translation);
    const englishPP = ENGLISH_PP[eb] ?? `${eb}ed`;

    return {
      dutch: `${obj.dutch} wordt ${verb.pastParticiple}.`,
      english: `${obj.english} is ${englishPP}.`,
      pattern: "passive",
      category: "passive_voice",
      difficulty: "advanced",
      tense: "present",
      structureLabel: "Object + wordt + Past Participle (passive voice)",
      keyDutchWords: [obj.dutch, "wordt", verb.pastParticiple],
      keyEnglishWords: [obj.english.toLowerCase(), "is", englishPP],
      verbInfinitive: verb.infinitive, verbForm: "wordt",
      subjectDutch: obj.dutch, subjectPerson: 3, subjectNumber: "singular",
    };
  }
  return null;
}

// ─────────────────────────────────────────────────────────────
// Pattern registry
// ─────────────────────────────────────────────────────────────

interface PatternSpec {
  id: SentencePattern;
  difficulty: Difficulty;
  weight: number;
  tense?: "present" | "past" | "perfect";
}

const PATTERN_SPECS: PatternSpec[] = [
  { id: "sv",             difficulty: "beginner",     weight: 5 },
  { id: "svo",            difficulty: "beginner",     weight: 5 },
  { id: "svadv",          difficulty: "beginner",     weight: 4 },
  { id: "adv_sv",         difficulty: "beginner",     weight: 4 },
  { id: "adv_svo",        difficulty: "intermediate", weight: 3 },
  { id: "polar_question", difficulty: "beginner",     weight: 3 },
  { id: "wh_question",    difficulty: "intermediate", weight: 3 },
  { id: "modal",          difficulty: "intermediate", weight: 4 },
  { id: "modal_obj",      difficulty: "intermediate", weight: 3 },
  { id: "perfect_hebben", difficulty: "intermediate", weight: 4, tense: "perfect" },
  { id: "perfect_zijn",   difficulty: "intermediate", weight: 3, tense: "perfect" },
  { id: "separable",      difficulty: "intermediate", weight: 3 },
  { id: "subordinate",    difficulty: "intermediate", weight: 3 },
  { id: "relative_clause",difficulty: "advanced",     weight: 2 },
  { id: "conditional_als",difficulty: "advanced",     weight: 2 },
  { id: "passive",        difficulty: "advanced",     weight: 2 },
];

// ─────────────────────────────────────────────────────────────
// Public: generate one sentence
// ─────────────────────────────────────────────────────────────

export interface GenerationOptions {
  difficulty?: Difficulty;
  includePatterns?: SentencePattern[];
  excludePatterns?: SentencePattern[];
  tense?: "present" | "past" | "perfect" | "any";
  category?: SentenceCategory;
}

function getPatternsForCategory(category: SentenceCategory): SentencePattern[] {
  switch (category) {
    case "basic":
      return ["sv", "svo", "svadv", "adv_sv", "adv_svo"];
    case "modal_verbs":
      return ["modal", "modal_obj"];
    case "simple_past":
      return ["sv", "svo", "svadv", "adv_sv", "adv_svo", "separable"];
    case "perfect_tense":
      return ["perfect_hebben"];
    case "zijn_hebben":
      return ["perfect_zijn"];
    case "questions":
      return ["polar_question", "wh_question"];
    case "subordinate_clauses":
      return ["subordinate"];
    case "separable_verbs":
      return ["separable"];
    case "relative_clauses":
      return ["relative_clause"];
    case "conditional":
      return ["conditional_als"];
    case "passive_voice":
      return ["passive"];
    case "advanced":
      return [
        "adv_svo", "modal_obj", "perfect_hebben", "perfect_zijn",
        "separable", "subordinate", "wh_question",
        "relative_clause", "conditional_als", "passive",
      ];
    case "complex":
      return ["subordinate", "modal_obj", "adv_svo", "wh_question", "relative_clause", "conditional_als"];
  }
}

export function generateSentence(opts: GenerationOptions = {}): ProceduralSentence | null {
  const { difficulty, includePatterns, excludePatterns, tense: forceTense, category } = opts;

  let pool = PATTERN_SPECS;
  if (category) {
    const categoryPatterns = getPatternsForCategory(category);
    pool = pool.filter((pattern) => categoryPatterns.includes(pattern.id));
  }
  if (includePatterns?.length) pool = pool.filter((p) => includePatterns.includes(p.id));
  if (excludePatterns?.length) pool = pool.filter((p) => !excludePatterns.includes(p.id));
  if (difficulty) {
    const allowed =
      difficulty === "beginner"
        ? new Set(["beginner"])
        : difficulty === "intermediate"
          ? new Set(["beginner", "intermediate"])
          : new Set(["beginner", "intermediate", "advanced"]);
    pool = pool.filter((p) => allowed.has(p.difficulty));
  }
  if (!pool.length) pool = PATTERN_SPECS;

  // Weighted pick
  const total = pool.reduce((s, p) => s + p.weight, 0);
  let r = Math.random() * total;
  let spec = pool[0];
  for (const p of pool) {
    r -= p.weight;
    if (r <= 0) { spec = p; break; }
  }

  const s = weightedRandom(SUBJECTS);
  const impliedTense =
    category === "simple_past"
      ? "past"
      : category === "perfect_tense" || category === "zijn_hebben"
        ? "perfect"
        : category === "basic" || category === "questions"
          ? "present"
          : undefined;
  const rawTense = forceTense && forceTense !== "any" ? forceTense : impliedTense ?? (spec.tense ?? (Math.random() < 0.7 ? "present" : "past"));
  const simpleTense = rawTense === "perfect" ? "present" : (rawTense as "present" | "past");

  for (let attempt = 0; attempt < 5; attempt++) {
    let result: ProceduralSentence | null = null;
    switch (spec.id) {
      case "sv":             result = genSV(s, simpleTense); break;
      case "svo":            result = genSVO(s, simpleTense); break;
      case "svadv":          result = genSVAdv(s, simpleTense); break;
      case "adv_sv":         result = genAdvSV(s, simpleTense); break;
      case "adv_svo":        result = genAdvSVO(s, simpleTense); break;
      case "polar_question": result = genPolarQuestion(s, simpleTense); break;
      case "wh_question":    result = genWhQuestion(s, simpleTense); break;
      case "modal":          result = genModal(s); break;
      case "modal_obj":      result = genModalObj(s); break;
      case "perfect_hebben": result = genPerfectHebben(s); break;
      case "perfect_zijn":   result = genPerfectZijn(s); break;
      case "separable":      result = genSeparable(s, "present"); break;
      case "subordinate":    result = genSubordinate(s); break;
      case "relative_clause":result = genRelativeClause(s); break;
      case "conditional_als":result = genConditional(s); break;
      case "passive":        result = genPassive(s); break;
    }
    if (result) {
      const validation = validateSentence(result.dutch);
      if (validation.overallStatus === "correct") {
        return result;
      }
    }
  }
  return null;
}

export function generateSentences(count: number, opts: GenerationOptions = {}): ProceduralSentence[] {
  const results: ProceduralSentence[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < count * 5 && results.length < count; i++) {
    const s = generateSentence(opts);
    if (s && !seen.has(s.dutch)) {
      seen.add(s.dutch);
      results.push(s);
    }
  }
  return results;
}

// ─────────────────────────────────────────────────────────────
// Error injection — procedural error correction exercises
// ─────────────────────────────────────────────────────────────

export type ErrorType =
  | "wrong_conjugation"
  | "v2_inversion_missing"
  | "separable_not_split"
  | "wrong_auxiliary"
  | "subordinate_verb_not_final";

export interface ProceduralErrorExercise {
  id: string;
  errorSentence: string;
  correctSentence: string;
  errorType: ErrorType;
  errorDescription: string;
  hint: string;
  explanation: string;
  category: SentenceCategory;
  difficulty: Difficulty;
  acceptableVariants: string[];
}

function injectConjugationError(sent: ProceduralSentence): ProceduralErrorExercise | null {
  const verb = getVerbByInfinitive(sent.verbInfinitive);
  if (!verb || verb.isModal) return null;
  if (sent.tense === "perfect") return null;
  const wrong =
    sent.verbForm === verb.presentSg1 ? verb.presentSg3 : verb.presentSg1;
  if (wrong === sent.verbForm) return null;
  const errorSentence = sent.dutch.replace(
    new RegExp(`\\b${sent.verbForm}\\b`),
    wrong,
  );
  if (errorSentence === sent.dutch) return null;
  return {
    id: `err-conj-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    errorSentence,
    correctSentence: sent.dutch,
    errorType: "wrong_conjugation",
    errorDescription: `Wrong conjugation: '${wrong}' used instead of '${sent.verbForm}'`,
    hint: `What form of '${verb.infinitive}' matches the subject '${sent.subjectDutch}'?`,
    explanation: `Dutch verbs must agree with their subject. '${sent.subjectDutch}' requires '${sent.verbForm}', not '${wrong}'.`,
    category: sent.category,
    difficulty: sent.difficulty,
    acceptableVariants: [],
  };
}

function injectV2Error(sent: ProceduralSentence): ProceduralErrorExercise | null {
  if (sent.pattern !== "adv_sv" && sent.pattern !== "adv_svo") return null;
  const words = sent.dutch.replace(/\.$/, "").split(" ");
  if (words.length < 3) return null;
  const adv = words[0];
  const verb = words[1];
  const rest = words.slice(2);
  // Error: adv + subject + ... + verb (V-not-2nd)
  const [subj, ...remaining] = rest;
  const errorSentence = [adv, subj, ...remaining, verb].join(" ") + ".";
  if (errorSentence === sent.dutch) return null;
  return {
    id: `err-v2-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    errorSentence,
    correctSentence: sent.dutch,
    errorType: "v2_inversion_missing",
    errorDescription: `Missing inversion: after '${adv}', the verb must come before the subject`,
    hint: "When a sentence starts with an adverb or time expression, the verb must be in second position.",
    explanation: "Dutch V2 rule: the finite verb is always the second constituent. After a fronted adverb, subject and verb must swap (inversion).",
    category: sent.category,
    difficulty: sent.difficulty,
    acceptableVariants: [],
  };
}

function injectSeparableError(sent: ProceduralSentence): ProceduralErrorExercise | null {
  if (sent.pattern !== "separable" || !sent.prefixDutch) return null;
  const prefix = sent.prefixDutch;
  // Build error: attach prefix to verb, remove it from end
  const attached = prefix + sent.verbForm;
  let errorSentence = sent.dutch
    .replace(new RegExp(`\\b${sent.verbForm}\\b`), attached)
    .replace(new RegExp(`\\s+${prefix}(?=[.,!?]|$)`, "g"), "")
    .replace(new RegExp(`\\s+${prefix}\\s+`, "g"), " ");
  if (errorSentence === sent.dutch) return null;
  return {
    id: `err-sep-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    errorSentence,
    correctSentence: sent.dutch,
    errorType: "separable_not_split",
    errorDescription: `Separable verb not split: '${attached}' should be '${sent.verbForm} ... ${prefix}'`,
    hint: "In main clauses, separable verbs split: the finite form comes second, the prefix goes to the end.",
    explanation: `Separable verbs split in main clauses. The finite verb ('${sent.verbForm}') stays in position 2 and the prefix ('${prefix}') moves to the end of the clause.`,
    category: sent.category,
    difficulty: sent.difficulty,
    acceptableVariants: [],
  };
}

function injectAuxiliaryError(sent: ProceduralSentence): ProceduralErrorExercise | null {
  if (sent.tense !== "perfect") return null;
  const verb = getVerbByInfinitive(sent.verbInfinitive);
  if (!verb) return null;
  const correctAuxInf = verb.auxiliary === "zijn" ? "zijn" : "hebben";
  const wrongAuxInf = correctAuxInf === "zijn" ? "hebben" : "zijn";
  const wrongAuxVerb = getVerbByInfinitive(wrongAuxInf);
  if (!wrongAuxVerb) return null;
  const wrongAuxForm = getExpectedFiniteForm(wrongAuxVerb, sent.subjectPerson, sent.subjectNumber);
  const errorSentence = sent.dutch.replace(
    new RegExp(`\\b${sent.verbForm}\\b`),
    wrongAuxForm,
  );
  if (errorSentence === sent.dutch) return null;
  return {
    id: `err-aux-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    errorSentence,
    correctSentence: sent.dutch,
    errorType: "wrong_auxiliary",
    errorDescription: `Wrong auxiliary: '${wrongAuxForm}' (${wrongAuxInf}) used instead of '${sent.verbForm}' (${correctAuxInf})`,
    hint: `Does '${verb.infinitive}' use 'hebben' or 'zijn' in the perfect tense?`,
    explanation: `Motion and state-change verbs use 'zijn'; most others use 'hebben'. '${verb.infinitive}' requires '${correctAuxInf}'.`,
    category: sent.category,
    difficulty: sent.difficulty,
    acceptableVariants: [],
  };
}

export function generateErrorExercise(opts: GenerationOptions = {}): ProceduralErrorExercise | null {
  for (let i = 0; i < 30; i++) {
    const sent = generateSentence({
      ...opts,
      excludePatterns: [...(opts.excludePatterns ?? []), "polar_question", "wh_question"],
    });
    if (!sent) continue;
    let ex: ProceduralErrorExercise | null = null;
    if (sent.pattern === "adv_sv" || sent.pattern === "adv_svo") {
      ex = injectV2Error(sent);
    } else if (sent.pattern === "separable") {
      ex = injectSeparableError(sent);
    } else if (sent.tense === "perfect") {
      ex = injectAuxiliaryError(sent) ?? injectConjugationError(sent);
    } else {
      ex = injectConjugationError(sent);
    }
    if (ex) return ex;
  }
  return null;
}

export function generateErrorExercises(
  count: number,
  opts: GenerationOptions = {},
): ProceduralErrorExercise[] {
  const results: ProceduralErrorExercise[] = [];
  for (let i = 0; i < count * 10 && results.length < count; i++) {
    const ex = generateErrorExercise(opts);
    if (ex) results.push(ex);
  }
  return results;
}

// ─────────────────────────────────────────────────────────────
// Type re-exports for consumer convenience
// (Banks are now imported directly from @/lib/data/lexicon)
// ─────────────────────────────────────────────────────────────
export type { SubjectEntry, ObjectEntry, AdverbEntry };
