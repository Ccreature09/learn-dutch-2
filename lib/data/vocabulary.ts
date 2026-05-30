import type { PartOfSpeech } from "@/lib/grammar/types";

// ─────────────────────────────────────────────────────────────
// Dutch Vocabulary Database (non-verb words)
// ─────────────────────────────────────────────────────────────

export interface VocabEntry {
  dutch: string;
  english: string;
  pos: PartOfSpeech;
  isSubordinatingConjunction?: boolean;
  isCoordinatingConjunction?: boolean;
  isSubjectPronoun?: boolean;
  isObjectPronoun?: boolean;
  isWHWord?: boolean;
  gender?: "de" | "het";   // for nouns
  frequency: "high" | "medium" | "low";
  category?: string[];
}

export const DUTCH_VOCABULARY: VocabEntry[] = [
  // ── SUBJECT PRONOUNS ─────────────────────────────────────
  { dutch: "ik", english: "I", pos: "pronoun", isSubjectPronoun: true, frequency: "high", category: ["pronoun"] },
  { dutch: "jij", english: "you (singular)", pos: "pronoun", isSubjectPronoun: true, frequency: "high", category: ["pronoun"] },
  { dutch: "je", english: "you (singular, unstressed)", pos: "pronoun", isSubjectPronoun: true, frequency: "high", category: ["pronoun"] },
  { dutch: "u", english: "you (formal)", pos: "pronoun", isSubjectPronoun: true, frequency: "medium", category: ["pronoun", "formal"] },
  { dutch: "hij", english: "he", pos: "pronoun", isSubjectPronoun: true, frequency: "high", category: ["pronoun"] },
  { dutch: "zij", english: "she / they", pos: "pronoun", isSubjectPronoun: true, frequency: "high", category: ["pronoun"] },
  { dutch: "ze", english: "she / they (unstressed)", pos: "pronoun", isSubjectPronoun: true, frequency: "high", category: ["pronoun"] },
  { dutch: "het", english: "it", pos: "pronoun", isSubjectPronoun: true, frequency: "high", category: ["pronoun"] },
  { dutch: "wij", english: "we", pos: "pronoun", isSubjectPronoun: true, frequency: "high", category: ["pronoun"] },
  { dutch: "we", english: "we (unstressed)", pos: "pronoun", isSubjectPronoun: true, frequency: "high", category: ["pronoun"] },
  { dutch: "jullie", english: "you (plural)", pos: "pronoun", isSubjectPronoun: true, frequency: "high", category: ["pronoun"] },
  { dutch: "men", english: "one / people (impersonal)", pos: "pronoun", isSubjectPronoun: true, frequency: "medium", category: ["pronoun"] },
  { dutch: "er", english: "there / it (expletive)", pos: "pronoun", isSubjectPronoun: false, frequency: "high", category: ["pronoun", "expletive"] },

  // ── OBJECT PRONOUNS ───────────────────────────────────────
  { dutch: "me", english: "me", pos: "pronoun", isObjectPronoun: true, frequency: "high", category: ["pronoun"] },
  { dutch: "mij", english: "me (stressed)", pos: "pronoun", isObjectPronoun: true, frequency: "high", category: ["pronoun"] },
  { dutch: "jou", english: "you (object, stressed)", pos: "pronoun", isObjectPronoun: true, frequency: "high", category: ["pronoun"] },
  { dutch: "hem", english: "him", pos: "pronoun", isObjectPronoun: true, frequency: "high", category: ["pronoun"] },
  { dutch: "haar", english: "her", pos: "pronoun", isObjectPronoun: true, frequency: "high", category: ["pronoun"] },
  { dutch: "ons", english: "us", pos: "pronoun", isObjectPronoun: true, frequency: "high", category: ["pronoun"] },
  { dutch: "hen", english: "them (persons)", pos: "pronoun", isObjectPronoun: true, frequency: "medium", category: ["pronoun"] },
  { dutch: "hun", english: "them (indirect object)", pos: "pronoun", isObjectPronoun: true, frequency: "medium", category: ["pronoun"] },

  // ── ARTICLES ──────────────────────────────────────────────
  { dutch: "de", english: "the (de-word)", pos: "article", frequency: "high", category: ["article"] },
  { dutch: "het", english: "the (het-word)", pos: "article", frequency: "high", category: ["article"] },
  { dutch: "een", english: "a / an", pos: "article", frequency: "high", category: ["article"] },
  { dutch: "'t", english: "the (het, contracted)", pos: "article", frequency: "medium", category: ["article"] },

  // ── COORDINATING CONJUNCTIONS ─────────────────────────────
  { dutch: "en", english: "and", pos: "conjunction", isCoordinatingConjunction: true, frequency: "high", category: ["conjunction"] },
  { dutch: "maar", english: "but", pos: "conjunction", isCoordinatingConjunction: true, frequency: "high", category: ["conjunction"] },
  { dutch: "of", english: "or", pos: "conjunction", isCoordinatingConjunction: true, frequency: "high", category: ["conjunction"] },
  { dutch: "want", english: "because / for", pos: "conjunction", isCoordinatingConjunction: true, frequency: "high", category: ["conjunction"] },
  { dutch: "dus", english: "so / therefore", pos: "conjunction", isCoordinatingConjunction: true, frequency: "high", category: ["conjunction"] },
  { dutch: "toch", english: "yet / still", pos: "conjunction", isCoordinatingConjunction: true, frequency: "medium", category: ["conjunction"] },
  { dutch: "noch", english: "nor", pos: "conjunction", isCoordinatingConjunction: true, frequency: "low", category: ["conjunction"] },

  // ── SUBORDINATING CONJUNCTIONS ────────────────────────────
  { dutch: "dat", english: "that", pos: "conjunction", isSubordinatingConjunction: true, frequency: "high", category: ["conjunction", "subordinating"] },
  { dutch: "omdat", english: "because", pos: "conjunction", isSubordinatingConjunction: true, frequency: "high", category: ["conjunction", "subordinating"] },
  { dutch: "als", english: "if / when", pos: "conjunction", isSubordinatingConjunction: true, frequency: "high", category: ["conjunction", "subordinating"] },
  { dutch: "wanneer", english: "when", pos: "conjunction", isSubordinatingConjunction: true, frequency: "high", category: ["conjunction", "subordinating"] },
  { dutch: "terwijl", english: "while / whereas", pos: "conjunction", isSubordinatingConjunction: true, frequency: "high", category: ["conjunction", "subordinating"] },
  { dutch: "hoewel", english: "although", pos: "conjunction", isSubordinatingConjunction: true, frequency: "medium", category: ["conjunction", "subordinating"] },
  { dutch: "nadat", english: "after", pos: "conjunction", isSubordinatingConjunction: true, frequency: "medium", category: ["conjunction", "subordinating"] },
  { dutch: "voordat", english: "before", pos: "conjunction", isSubordinatingConjunction: true, frequency: "medium", category: ["conjunction", "subordinating"] },
  { dutch: "zodat", english: "so that", pos: "conjunction", isSubordinatingConjunction: true, frequency: "medium", category: ["conjunction", "subordinating"] },
  { dutch: "tenzij", english: "unless", pos: "conjunction", isSubordinatingConjunction: true, frequency: "medium", category: ["conjunction", "subordinating"] },
  { dutch: "zodra", english: "as soon as", pos: "conjunction", isSubordinatingConjunction: true, frequency: "medium", category: ["conjunction", "subordinating"] },
  { dutch: "sinds", english: "since (time)", pos: "conjunction", isSubordinatingConjunction: true, frequency: "medium", category: ["conjunction", "subordinating"] },
  { dutch: "ofschoon", english: "although", pos: "conjunction", isSubordinatingConjunction: true, frequency: "low", category: ["conjunction", "subordinating"] },

  // ── WH-WORDS ──────────────────────────────────────────────
  { dutch: "wie", english: "who", pos: "pronoun", isWHWord: true, frequency: "high", category: ["question"] },
  { dutch: "wat", english: "what", pos: "pronoun", isWHWord: true, frequency: "high", category: ["question"] },
  { dutch: "waar", english: "where", pos: "adverb", isWHWord: true, frequency: "high", category: ["question"] },
  { dutch: "wanneer", english: "when", pos: "adverb", isWHWord: true, frequency: "high", category: ["question"] },
  { dutch: "waarom", english: "why", pos: "adverb", isWHWord: true, frequency: "high", category: ["question"] },
  { dutch: "hoe", english: "how", pos: "adverb", isWHWord: true, frequency: "high", category: ["question"] },
  { dutch: "welke", english: "which", pos: "adjective", isWHWord: true, frequency: "high", category: ["question"] },
  { dutch: "welk", english: "which (het-word)", pos: "adjective", isWHWord: true, frequency: "medium", category: ["question"] },
  { dutch: "hoeveel", english: "how much / how many", pos: "adverb", isWHWord: true, frequency: "medium", category: ["question"] },

  // ── PREPOSITIONS ──────────────────────────────────────────
  { dutch: "in", english: "in", pos: "preposition", frequency: "high", category: ["preposition"] },
  { dutch: "op", english: "on / at", pos: "preposition", frequency: "high", category: ["preposition"] },
  { dutch: "aan", english: "at / on / to", pos: "preposition", frequency: "high", category: ["preposition"] },
  { dutch: "van", english: "of / from", pos: "preposition", frequency: "high", category: ["preposition"] },
  { dutch: "voor", english: "for / before", pos: "preposition", frequency: "high", category: ["preposition"] },
  { dutch: "met", english: "with", pos: "preposition", frequency: "high", category: ["preposition"] },
  { dutch: "bij", english: "at / near / with", pos: "preposition", frequency: "high", category: ["preposition"] },
  { dutch: "naar", english: "to / towards", pos: "preposition", frequency: "high", category: ["preposition"] },
  { dutch: "uit", english: "from / out of", pos: "preposition", frequency: "high", category: ["preposition"] },
  { dutch: "over", english: "about / over", pos: "preposition", frequency: "high", category: ["preposition"] },
  { dutch: "onder", english: "under / among", pos: "preposition", frequency: "high", category: ["preposition"] },
  { dutch: "achter", english: "behind", pos: "preposition", frequency: "medium", category: ["preposition"] },
  { dutch: "naast", english: "next to", pos: "preposition", frequency: "medium", category: ["preposition"] },
  { dutch: "tussen", english: "between", pos: "preposition", frequency: "medium", category: ["preposition"] },
  { dutch: "door", english: "through / by", pos: "preposition", frequency: "high", category: ["preposition"] },
  { dutch: "om", english: "around / at (time)", pos: "preposition", frequency: "high", category: ["preposition"] },
  { dutch: "per", english: "per / by", pos: "preposition", frequency: "medium", category: ["preposition"] },
  { dutch: "zonder", english: "without", pos: "preposition", frequency: "high", category: ["preposition"] },
  { dutch: "tijdens", english: "during", pos: "preposition", frequency: "medium", category: ["preposition"] },
  { dutch: "tegen", english: "against", pos: "preposition", frequency: "medium", category: ["preposition"] },
  { dutch: "tegenover", english: "opposite / across from", pos: "preposition", frequency: "medium", category: ["preposition"] },
  { dutch: "langs", english: "along", pos: "preposition", frequency: "medium", category: ["preposition"] },
  { dutch: "tot", english: "until / to", pos: "preposition", frequency: "high", category: ["preposition"] },
  { dutch: "sinds", english: "since (preposition)", pos: "preposition", frequency: "medium", category: ["preposition"] },
  { dutch: "als", english: "as / like", pos: "preposition", frequency: "high", category: ["preposition"] },

  // ── COMMON ADVERBS ────────────────────────────────────────
  { dutch: "nu", english: "now", pos: "adverb", frequency: "high", category: ["time"] },
  { dutch: "dan", english: "then", pos: "adverb", frequency: "high", category: ["time"] },
  { dutch: "hier", english: "here", pos: "adverb", frequency: "high", category: ["place"] },
  { dutch: "daar", english: "there", pos: "adverb", frequency: "high", category: ["place"] },
  { dutch: "altijd", english: "always", pos: "adverb", frequency: "high", category: ["frequency"] },
  { dutch: "nooit", english: "never", pos: "adverb", frequency: "high", category: ["frequency"] },
  { dutch: "vaak", english: "often", pos: "adverb", frequency: "high", category: ["frequency"] },
  { dutch: "soms", english: "sometimes", pos: "adverb", frequency: "high", category: ["frequency"] },
  { dutch: "zelden", english: "seldom / rarely", pos: "adverb", frequency: "medium", category: ["frequency"] },
  { dutch: "graag", english: "gladly / with pleasure", pos: "adverb", frequency: "high", category: ["manner"] },
  { dutch: "misschien", english: "maybe / perhaps", pos: "adverb", frequency: "high", category: ["modality"] },
  { dutch: "waarschijnlijk", english: "probably", pos: "adverb", frequency: "medium", category: ["modality"] },
  { dutch: "ook", english: "also / too", pos: "adverb", frequency: "high", category: ["addition"] },
  { dutch: "al", english: "already", pos: "adverb", frequency: "high", category: ["time"] },
  { dutch: "nog", english: "still / yet", pos: "adverb", frequency: "high", category: ["time"] },
  { dutch: "niet", english: "not", pos: "adverb", frequency: "high", category: ["negation"] },
  { dutch: "nooit", english: "never", pos: "adverb", frequency: "high", category: ["negation"] },
  { dutch: "alleen", english: "alone / only", pos: "adverb", frequency: "high", category: ["manner"] },
  { dutch: "goed", english: "well", pos: "adverb", frequency: "high", category: ["manner"] },
  { dutch: "slecht", english: "badly", pos: "adverb", frequency: "high", category: ["manner"] },
  { dutch: "snel", english: "quickly", pos: "adverb", frequency: "high", category: ["manner"] },
  { dutch: "langzaam", english: "slowly", pos: "adverb", frequency: "high", category: ["manner"] },
  { dutch: "heel", english: "very", pos: "adverb", frequency: "high", category: ["degree"] },
  { dutch: "erg", english: "very / badly", pos: "adverb", frequency: "high", category: ["degree"] },
  { dutch: "echt", english: "really / truly", pos: "adverb", frequency: "high", category: ["degree"] },
  { dutch: "bijna", english: "almost", pos: "adverb", frequency: "high", category: ["degree"] },
  { dutch: "nog niet", english: "not yet", pos: "adverb", frequency: "high", category: ["time", "negation"] },
  { dutch: "vandaag", english: "today", pos: "adverb", frequency: "high", category: ["time"] },
  { dutch: "gisteren", english: "yesterday", pos: "adverb", frequency: "high", category: ["time"] },
  { dutch: "morgen", english: "tomorrow", pos: "adverb", frequency: "high", category: ["time"] },
  { dutch: "vanavond", english: "this evening", pos: "adverb", frequency: "high", category: ["time"] },
  { dutch: "ochtend", english: "morning", pos: "noun", gender: "de", frequency: "high", category: ["time"] },
  { dutch: "'s ochtends", english: "in the morning", pos: "adverb", frequency: "medium", category: ["time"] },
  { dutch: "thuis", english: "at home", pos: "adverb", frequency: "high", category: ["place"] },
  { dutch: "buiten", english: "outside", pos: "adverb", frequency: "high", category: ["place"] },
  { dutch: "binnen", english: "inside", pos: "adverb", frequency: "high", category: ["place"] },
  { dutch: "samen", english: "together", pos: "adverb", frequency: "high", category: ["manner"] },
  { dutch: "zeker", english: "certainly / surely", pos: "adverb", frequency: "high", category: ["modality"] },

  // ── COMMON NOUNS (people & family) ────────────────────────
  { dutch: "man", english: "man / husband", pos: "noun", gender: "de", frequency: "high", category: ["people", "family"] },
  { dutch: "vrouw", english: "woman / wife", pos: "noun", gender: "de", frequency: "high", category: ["people", "family"] },
  { dutch: "kind", english: "child", pos: "noun", gender: "het", frequency: "high", category: ["people", "family"] },
  { dutch: "jongen", english: "boy", pos: "noun", gender: "de", frequency: "high", category: ["people"] },
  { dutch: "meisje", english: "girl", pos: "noun", gender: "het", frequency: "high", category: ["people"] },
  { dutch: "moeder", english: "mother", pos: "noun", gender: "de", frequency: "high", category: ["family"] },
  { dutch: "vader", english: "father", pos: "noun", gender: "de", frequency: "high", category: ["family"] },
  { dutch: "broer", english: "brother", pos: "noun", gender: "de", frequency: "high", category: ["family"] },
  { dutch: "zus", english: "sister", pos: "noun", gender: "de", frequency: "high", category: ["family"] },
  { dutch: "vriend", english: "friend / boyfriend", pos: "noun", gender: "de", frequency: "high", category: ["people", "social"] },
  { dutch: "vriendin", english: "friend (female) / girlfriend", pos: "noun", gender: "de", frequency: "high", category: ["people", "social"] },
  { dutch: "student", english: "student", pos: "noun", gender: "de", frequency: "high", category: ["education", "people"] },
  { dutch: "leraar", english: "teacher (male)", pos: "noun", gender: "de", frequency: "high", category: ["education", "people"] },
  { dutch: "lerares", english: "teacher (female)", pos: "noun", gender: "de", frequency: "high", category: ["education", "people"] },

  // ── COMMON NOUNS (places & objects) ───────────────────────
  { dutch: "huis", english: "house", pos: "noun", gender: "het", frequency: "high", category: ["place", "home"] },
  { dutch: "kamer", english: "room", pos: "noun", gender: "de", frequency: "high", category: ["home"] },
  { dutch: "school", english: "school", pos: "noun", gender: "de", frequency: "high", category: ["education", "place"] },
  { dutch: "werk", english: "work", pos: "noun", gender: "het", frequency: "high", category: ["work"] },
  { dutch: "auto", english: "car", pos: "noun", gender: "de", frequency: "high", category: ["transport"] },
  { dutch: "fiets", english: "bicycle", pos: "noun", gender: "de", frequency: "high", category: ["transport"] },
  { dutch: "stad", english: "city / town", pos: "noun", gender: "de", frequency: "high", category: ["place"] },
  { dutch: "straat", english: "street", pos: "noun", gender: "de", frequency: "high", category: ["place"] },
  { dutch: "winkel", english: "shop / store", pos: "noun", gender: "de", frequency: "high", category: ["commerce", "place"] },
  { dutch: "restaurant", english: "restaurant", pos: "noun", gender: "het", frequency: "high", category: ["food", "place"] },
  { dutch: "boek", english: "book", pos: "noun", gender: "het", frequency: "high", category: ["education", "object"] },
  { dutch: "krant", english: "newspaper", pos: "noun", gender: "de", frequency: "high", category: ["media", "object"] },
  { dutch: "brief", english: "letter", pos: "noun", gender: "de", frequency: "medium", category: ["communication", "object"] },
  { dutch: "telefoon", english: "telephone / phone", pos: "noun", gender: "de", frequency: "high", category: ["communication", "object"] },
  { dutch: "koffie", english: "coffee", pos: "noun", gender: "de", frequency: "high", category: ["food", "drink"] },
  { dutch: "brood", english: "bread", pos: "noun", gender: "het", frequency: "high", category: ["food"] },
  { dutch: "appel", english: "apple", pos: "noun", gender: "de", frequency: "high", category: ["food"] },
  { dutch: "cadeau", english: "gift", pos: "noun", gender: "het", frequency: "medium", category: ["object", "social"] },
  { dutch: "muziek", english: "music", pos: "noun", gender: "de", frequency: "high", category: ["entertainment"] },
  { dutch: "film", english: "film / movie", pos: "noun", gender: "de", frequency: "high", category: ["entertainment"] },
  { dutch: "les", english: "lesson", pos: "noun", gender: "de", frequency: "medium", category: ["education"] },
  { dutch: "trein", english: "train", pos: "noun", gender: "de", frequency: "high", category: ["transport"] },
  { dutch: "kinderen", english: "children", pos: "noun", gender: "de", frequency: "high", category: ["people", "family"] },
  { dutch: "nieuws", english: "news", pos: "noun", gender: "het", frequency: "medium", category: ["media"] },
  { dutch: "verhaal", english: "story", pos: "noun", gender: "het", frequency: "medium", category: ["media"] },
  { dutch: "lied", english: "song", pos: "noun", gender: "het", frequency: "medium", category: ["entertainment"] },
  { dutch: "tuin", english: "garden", pos: "noun", gender: "de", frequency: "high", category: ["place", "home"] },
  { dutch: "dag", english: "day", pos: "noun", gender: "de", frequency: "high", category: ["time"] },
  { dutch: "week", english: "week", pos: "noun", gender: "de", frequency: "high", category: ["time"] },
  { dutch: "jaar", english: "year", pos: "noun", gender: "het", frequency: "high", category: ["time"] },
  { dutch: "tijd", english: "time", pos: "noun", gender: "de", frequency: "high", category: ["time"] },
  { dutch: "geld", english: "money", pos: "noun", gender: "het", frequency: "high", category: ["commerce"] },
  { dutch: "water", english: "water", pos: "noun", gender: "het", frequency: "high", category: ["food"] },
  { dutch: "eten", english: "food", pos: "noun", gender: "het", frequency: "high", category: ["food"] },
  { dutch: "taal", english: "language", pos: "noun", gender: "de", frequency: "high", category: ["communication", "education"] },
  { dutch: "woord", english: "word", pos: "noun", gender: "het", frequency: "high", category: ["communication", "education"] },
  { dutch: "vraag", english: "question", pos: "noun", gender: "de", frequency: "high", category: ["communication"] },
  { dutch: "antwoord", english: "answer", pos: "noun", gender: "het", frequency: "high", category: ["communication"] },
  { dutch: "probleem", english: "problem", pos: "noun", gender: "het", frequency: "high", category: ["general"] },
  { dutch: "Nederlands", english: "Dutch (language)", pos: "noun", gender: "het", frequency: "high", category: ["language", "education"] },
  { dutch: "Engels", english: "English (language)", pos: "noun", gender: "het", frequency: "high", category: ["language", "education"] },

  // ── COMMON ADJECTIVES ─────────────────────────────────────
  { dutch: "groot", english: "big / large", pos: "adjective", frequency: "high", category: ["size"] },
  { dutch: "klein", english: "small / little", pos: "adjective", frequency: "high", category: ["size"] },
  { dutch: "goed", english: "good", pos: "adjective", frequency: "high", category: ["quality"] },
  { dutch: "slecht", english: "bad", pos: "adjective", frequency: "high", category: ["quality"] },
  { dutch: "nieuw", english: "new", pos: "adjective", frequency: "high", category: ["condition"] },
  { dutch: "oud", english: "old", pos: "adjective", frequency: "high", category: ["condition"] },
  { dutch: "mooi", english: "beautiful / nice", pos: "adjective", frequency: "high", category: ["aesthetic"] },
  { dutch: "lelijk", english: "ugly", pos: "adjective", frequency: "medium", category: ["aesthetic"] },
  { dutch: "lang", english: "long / tall", pos: "adjective", frequency: "high", category: ["size"] },
  { dutch: "kort", english: "short", pos: "adjective", frequency: "high", category: ["size"] },
  { dutch: "snel", english: "fast", pos: "adjective", frequency: "high", category: ["speed"] },
  { dutch: "langzaam", english: "slow", pos: "adjective", frequency: "high", category: ["speed"] },
  { dutch: "makkelijk", english: "easy", pos: "adjective", frequency: "high", category: ["difficulty"] },
  { dutch: "moeilijk", english: "difficult", pos: "adjective", frequency: "high", category: ["difficulty"] },
  { dutch: "interessant", english: "interesting", pos: "adjective", frequency: "high", category: ["quality"] },
  { dutch: "saai", english: "boring", pos: "adjective", frequency: "high", category: ["quality"] },
  { dutch: "leuk", english: "fun / nice", pos: "adjective", frequency: "high", category: ["quality"] },
  { dutch: "lekker", english: "nice / tasty", pos: "adjective", frequency: "high", category: ["quality", "food"] },
  { dutch: "warm", english: "warm", pos: "adjective", frequency: "high", category: ["temperature"] },
  { dutch: "koud", english: "cold", pos: "adjective", frequency: "high", category: ["temperature"] },
  { dutch: "druk", english: "busy", pos: "adjective", frequency: "high", category: ["state"] },
  { dutch: "moe", english: "tired", pos: "adjective", frequency: "high", category: ["state"] },
  { dutch: "ziek", english: "sick", pos: "adjective", frequency: "high", category: ["health"] },
  { dutch: "gezond", english: "healthy", pos: "adjective", frequency: "high", category: ["health"] },
  { dutch: "blij", english: "happy", pos: "adjective", frequency: "high", category: ["emotion"] },
  { dutch: "verdrietig", english: "sad", pos: "adjective", frequency: "medium", category: ["emotion"] },
  { dutch: "boos", english: "angry", pos: "adjective", frequency: "medium", category: ["emotion"] },
  { dutch: "bang", english: "scared / afraid", pos: "adjective", frequency: "medium", category: ["emotion"] },

  // ── NUMBERS ───────────────────────────────────────────────
  { dutch: "een", english: "one", pos: "numeral", frequency: "high", category: ["number"] },
  { dutch: "twee", english: "two", pos: "numeral", frequency: "high", category: ["number"] },
  { dutch: "drie", english: "three", pos: "numeral", frequency: "high", category: ["number"] },
  { dutch: "vier", english: "four", pos: "numeral", frequency: "high", category: ["number"] },
  { dutch: "vijf", english: "five", pos: "numeral", frequency: "high", category: ["number"] },
  { dutch: "tien", english: "ten", pos: "numeral", frequency: "high", category: ["number"] },
  { dutch: "twintig", english: "twenty", pos: "numeral", frequency: "high", category: ["number"] },

  // ── PARTICLES / DISCOURSE WORDS ───────────────────────────
  { dutch: "ja", english: "yes", pos: "particle", frequency: "high", category: ["discourse"] },
  { dutch: "nee", english: "no", pos: "particle", frequency: "high", category: ["discourse"] },
  { dutch: "hé", english: "hey", pos: "particle", frequency: "medium", category: ["discourse"] },
  { dutch: "nou", english: "well / now", pos: "particle", frequency: "high", category: ["discourse"] },
  { dutch: "zo", english: "so / thus", pos: "adverb", frequency: "high", category: ["manner"] },
  { dutch: "toch", english: "yet / still / right?", pos: "particle", frequency: "high", category: ["discourse"] },
  { dutch: "maar", english: "just / only (particle)", pos: "particle", frequency: "high", category: ["discourse"] },
  { dutch: "wel", english: "indeed / do (emphasis)", pos: "adverb", frequency: "high", category: ["emphasis"] },
  { dutch: "hoor", english: "(softening particle)", pos: "particle", frequency: "medium", category: ["discourse"] },

  // ── MISSING COMMON NOUNS (A1/A2) ─────────────────────────────
  { dutch: "hond", english: "dog", pos: "noun", gender: "de", frequency: "high", category: ["animals"] },
  { dutch: "kat", english: "cat", pos: "noun", gender: "de", frequency: "high", category: ["animals"] },
  { dutch: "thee", english: "tea", pos: "noun", gender: "de", frequency: "high", category: ["food", "drink"] },
  { dutch: "bier", english: "beer", pos: "noun", gender: "het", frequency: "high", category: ["food", "drink"] },
  { dutch: "wijn", english: "wine", pos: "noun", gender: "de", frequency: "high", category: ["food", "drink"] },
  { dutch: "soep", english: "soup", pos: "noun", gender: "de", frequency: "medium", category: ["food"] },
  { dutch: "kaas", english: "cheese", pos: "noun", gender: "de", frequency: "medium", category: ["food"] },
  { dutch: "tafel", english: "table", pos: "noun", gender: "de", frequency: "high", category: ["home", "object"] },
  { dutch: "stoel", english: "chair", pos: "noun", gender: "de", frequency: "high", category: ["home", "object"] },
  { dutch: "bed", english: "bed", pos: "noun", gender: "het", frequency: "high", category: ["home", "object"] },
  { dutch: "deur", english: "door", pos: "noun", gender: "de", frequency: "high", category: ["home", "object"] },
  { dutch: "raam", english: "window", pos: "noun", gender: "het", frequency: "medium", category: ["home", "object"] },
  { dutch: "tas", english: "bag", pos: "noun", gender: "de", frequency: "medium", category: ["object", "clothing"] },
  { dutch: "bus", english: "bus", pos: "noun", gender: "de", frequency: "high", category: ["transport"] },
  { dutch: "boodschappen", english: "groceries", pos: "noun", gender: "de", frequency: "medium", category: ["food", "commerce"] },
  { dutch: "kleren", english: "clothes", pos: "noun", gender: "de", frequency: "medium", category: ["clothing"] },
  { dutch: "ziekenhuis", english: "hospital", pos: "noun", gender: "het", frequency: "high", category: ["place", "health"] },
  { dutch: "dokter", english: "doctor", pos: "noun", gender: "de", frequency: "high", category: ["people", "health"] },
  { dutch: "kantoor", english: "office", pos: "noun", gender: "het", frequency: "high", category: ["work", "place"] },
  { dutch: "computer", english: "computer", pos: "noun", gender: "de", frequency: "high", category: ["work", "object"] },
  { dutch: "e-mail", english: "email", pos: "noun", gender: "de", frequency: "high", category: ["communication", "object"] },

  // ── B2 NOUNS (work & society) ─────────────────────────────────
  { dutch: "vergadering", english: "meeting", pos: "noun", gender: "de", frequency: "medium", category: ["work"] },
  { dutch: "verantwoordelijkheid", english: "responsibility", pos: "noun", gender: "de", frequency: "medium", category: ["work"] },
  { dutch: "ervaring", english: "experience", pos: "noun", gender: "de", frequency: "medium", category: ["work"] },
  { dutch: "sollicitatie", english: "job application", pos: "noun", gender: "de", frequency: "medium", category: ["work"] },
  { dutch: "werkgever", english: "employer", pos: "noun", gender: "de", frequency: "medium", category: ["work", "people"] },
  { dutch: "werknemer", english: "employee", pos: "noun", gender: "de", frequency: "medium", category: ["work", "people"] },
  { dutch: "samenleving", english: "society", pos: "noun", gender: "de", frequency: "medium", category: ["society"] },
  { dutch: "overheid", english: "government", pos: "noun", gender: "de", frequency: "medium", category: ["society"] },
  { dutch: "ontwikkeling", english: "development", pos: "noun", gender: "de", frequency: "medium", category: ["society"] },
  { dutch: "economie", english: "economy", pos: "noun", gender: "de", frequency: "medium", category: ["society"] },
  { dutch: "bedrijf", english: "company", pos: "noun", gender: "het", frequency: "medium", category: ["work", "place"] },
  { dutch: "opdracht", english: "assignment", pos: "noun", gender: "de", frequency: "medium", category: ["work", "education"] },
  { dutch: "doel", english: "goal", pos: "noun", gender: "het", frequency: "medium", category: ["work"] },
  { dutch: "resultaat", english: "result", pos: "noun", gender: "het", frequency: "medium", category: ["work"] },
  { dutch: "mening", english: "opinion", pos: "noun", gender: "de", frequency: "medium", category: ["communication"] },
  { dutch: "beslissing", english: "decision", pos: "noun", gender: "de", frequency: "medium", category: ["work"] },
  { dutch: "informatie", english: "information", pos: "noun", gender: "de", frequency: "medium", category: ["communication"] },
  { dutch: "onderzoek", english: "research", pos: "noun", gender: "het", frequency: "medium", category: ["education"] },
  { dutch: "situatie", english: "situation", pos: "noun", gender: "de", frequency: "medium", category: ["general"] },
  { dutch: "mogelijkheid", english: "opportunity", pos: "noun", gender: "de", frequency: "medium", category: ["general"] },
  { dutch: "afspraak", english: "appointment", pos: "noun", gender: "de", frequency: "medium", category: ["social", "work"] },

  // ── B2 ADVERBS ────────────────────────────────────────────────
  { dutch: "bovendien", english: "moreover", pos: "adverb", frequency: "medium", category: ["addition"] },
  { dutch: "desondanks", english: "nevertheless", pos: "adverb", frequency: "medium", category: ["contrast"] },
  { dutch: "inmiddels", english: "by now", pos: "adverb", frequency: "medium", category: ["time"] },
  { dutch: "eigenlijk", english: "actually", pos: "adverb", frequency: "high", category: ["modality"] },
  { dutch: "blijkbaar", english: "apparently", pos: "adverb", frequency: "medium", category: ["modality"] },
  { dutch: "tenslotte", english: "after all", pos: "adverb", frequency: "medium", category: ["addition"] },
];

function getLookupPriority(entry: VocabEntry): number {
  let priority = 0;
  if (entry.isSubordinatingConjunction) priority += 100;
  if (entry.isCoordinatingConjunction) priority += 90;
  if (entry.isWHWord) priority += 80;
  if (entry.isSubjectPronoun || entry.isObjectPronoun) priority += 70;
  if (entry.pos === "adverb") priority += 60;
  if (entry.pos === "conjunction") priority += 50;
  if (entry.pos === "preposition") priority += 40;
  if (entry.pos === "pronoun") priority += 30;
  if (entry.frequency === "high") priority += 3;
  if (entry.frequency === "medium") priority += 2;
  if (entry.frequency === "low") priority += 1;
  return priority;
}

// ── Pre-built lookup table ────────────────────────────────────
export const VOCAB_LOOKUP: Record<string, VocabEntry> = DUTCH_VOCABULARY.reduce<Record<string, VocabEntry>>((lookup, entry) => {
  const key = entry.dutch.toLowerCase();
  const current = lookup[key];

  if (!current || getLookupPriority(entry) > getLookupPriority(current)) {
    lookup[key] = entry;
  }

  return lookup;
}, {});

// ── Subject pronouns set (for quick lookup) ───────────────────
export const SUBJECT_PRONOUNS: Set<string> = new Set(
  DUTCH_VOCABULARY.filter((v) => v.isSubjectPronoun).map((v) => v.dutch.toLowerCase())
);

// ── Subordinating conjunctions set ───────────────────────────
export const SUBORDINATING_CONJUNCTIONS: Set<string> = new Set(
  DUTCH_VOCABULARY.filter((v) => v.isSubordinatingConjunction).map((v) => v.dutch.toLowerCase())
);

// ── Coordinating conjunctions set ─────────────────────────────
export const COORDINATING_CONJUNCTIONS: Set<string> = new Set(
  DUTCH_VOCABULARY.filter((v) => v.isCoordinatingConjunction).map((v) => v.dutch.toLowerCase())
);

// ── WH-words set ─────────────────────────────────────────────
export const WH_WORDS: Set<string> = new Set(
  DUTCH_VOCABULARY.filter((v) => v.isWHWord).map((v) => v.dutch.toLowerCase())
);

// ── Person inference from subject pronoun ─────────────────────
export function getPersonFromPronoun(pronoun: string): {
  person: 1 | 2 | 3;
  number: "singular" | "plural";
} | null {
  const p = pronoun.toLowerCase();
  if (["ik"].includes(p)) return { person: 1, number: "singular" };
  if (["jij", "je", "u"].includes(p)) return { person: 2, number: "singular" };
  if (["hij", "zij", "ze", "het", "men"].includes(p)) return { person: 3, number: "singular" };
  if (["wij", "we"].includes(p)) return { person: 1, number: "plural" };
  if (["jullie"].includes(p)) return { person: 2, number: "plural" };
  return null; // "zij/ze" as plural is handled by verb agreement
}
