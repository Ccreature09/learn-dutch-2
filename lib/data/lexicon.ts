import { DUTCH_VERBS } from "@/lib/data/verbs";
import { DUTCH_VOCABULARY, getPersonFromPronoun } from "@/lib/data/vocabulary";
import { NOUN_METADATA } from "@/lib/data/noun-metadata";
import type { Difficulty } from "@/lib/grammar/types";

export interface SubjectBankEntry {
  dutch: string;
  english: string;
  person: 1 | 2 | 3;
  number: "singular" | "plural";
  weight: number;
}

export interface ObjectBankEntry {
  dutch: string;
  english: string;
  baseWord: string;
  category: string;
  difficulty: Difficulty;
  semanticRoles: string[];
}

export interface AdverbBankEntry {
  dutch: string;
  english: string;
  canFront: boolean;
  category: string;
}

const SUBJECT_WEIGHTS: Record<string, number> = {
  ik: 5,
  jij: 4,
  hij: 4,
  zij: 4,
  het: 2,
  wij: 3,
  jullie: 2,
  ze: 3,
  we: 2,
  u: 2,
  men: 1,
};

const EXCLUDED_OBJECT_WORDS = new Set(["werk", "eten", "vraag", "antwoord"]);
const FRONTABLE_ADVERB_CATEGORIES = new Set(["time", "place", "frequency", "modality"]);
const NON_FRONTABLE_ADVERBS = new Set(["graag", "goed", "hard", "samen", "wel"]);
const FEATURED_VERBS = new Set([
  "werken",
  "leren",
  "lezen",
  "eten",
  "drinken",
  "gaan",
  "komen",
  "zijn",
  "hebben",
  "zien",
  "horen",
  "lopen",
  "slapen",
  "rijden",
  "kopen",
  "schrijven",
  "studeren",
  "spelen",
  "maken",
  "weten",
  "zeggen",
  "denken",
  "wonen",
  "vinden",
  "geven",
  "nemen",
  "spreken",
  "begrijpen",
  "zoeken",
  "brengen",
  "krijgen",
  "openen",
  "sluiten",
  "bellen",
  "opbellen",
  "opstaan",
  "thuiskomen",
  "meenemen",
  "opzoeken",
  "afmaken",
]);

function withArticle(dutch: string, gender?: "de" | "het"): string {
  return gender ? `${gender} ${dutch}` : dutch;
}

// Strips slash-alternatives and parentheticals from English translations.
// "man / husband" → "man",  "teacher (male)" → "teacher"
function cleanEnglishNoun(english: string): string {
  return english.split(/\s*[/|(]/)[0].trim();
}

// Semantic roles now live in lib/data/noun-metadata.ts (NOUN_METADATA).
// This helper resolves roles for a given noun base-word.
function getNounSemanticRoles(baseWord: string): string[] {
  return NOUN_METADATA[baseWord]?.semanticRoles ?? ["physical_object"];
}

function makeSubjectEntry(dutch: string, english: string, person: 1 | 2 | 3, number: "singular" | "plural"): SubjectBankEntry {
  return {
    dutch,
    english,
    person,
    number,
    weight: SUBJECT_WEIGHTS[dutch] ?? 1,
  };
}

const pronounEntries = DUTCH_VOCABULARY.filter((entry) => entry.isSubjectPronoun);

export const SUBJECT_BANK: SubjectBankEntry[] = [
  ...pronounEntries.flatMap((entry) => {
    const person = getPersonFromPronoun(entry.dutch);
    if (!person) {
      if (entry.dutch === "zij" || entry.dutch === "ze") {
        return [
          makeSubjectEntry(entry.dutch, "she", 3, "singular"),
          makeSubjectEntry(entry.dutch, "they", 3, "plural"),
        ];
      }
      return [];
    }

    if (entry.dutch === "zij" || entry.dutch === "ze") {
      return [
        makeSubjectEntry(entry.dutch, "she", 3, "singular"),
        makeSubjectEntry(entry.dutch, "they", 3, "plural"),
      ];
    }

    return [makeSubjectEntry(entry.dutch, entry.english, person.person, person.number)];
  }),
].filter((entry) => ["ik", "jij", "hij", "zij", "het", "wij", "jullie", "ze", "we", "u", "men"].includes(entry.dutch));

export const OBJECT_BANK: ObjectBankEntry[] = DUTCH_VOCABULARY
  .filter((entry) => entry.pos === "noun" && entry.frequency !== "low" && !EXCLUDED_OBJECT_WORDS.has(entry.dutch))
  .map((entry) => ({
    dutch: withArticle(entry.dutch, entry.gender),
    english: `the ${cleanEnglishNoun(entry.english)}`,
    baseWord: entry.dutch,
    category: entry.category?.[0] ?? "objects",
    difficulty: entry.frequency === "high" ? "beginner" : "intermediate",
    semanticRoles: getNounSemanticRoles(entry.dutch),
  }));

export const ADVERB_BANK: AdverbBankEntry[] = DUTCH_VOCABULARY
  .filter((entry) => entry.pos === "adverb" && entry.frequency !== "low")
  .map((entry) => ({
    dutch: entry.dutch,
    english: entry.english,
    canFront: !NON_FRONTABLE_ADVERBS.has(entry.dutch) && entry.category?.some((category) => FRONTABLE_ADVERB_CATEGORIES.has(category)) === true,
    category: entry.category?.[0] ?? "general",
  }));

export const CONJUNCTION_BANK = DUTCH_VOCABULARY
  .filter((entry) => entry.pos === "conjunction" && entry.frequency === "high")
  .map((entry) => ({ dutch: entry.dutch, english: entry.english }));

export const FREE_BUILDER_VERBS = DUTCH_VERBS.filter(
  (verb) => verb.frequency === "high" && FEATURED_VERBS.has(verb.infinitive),
);
