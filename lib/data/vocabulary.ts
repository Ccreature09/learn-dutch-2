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

  // ── GREETINGS & DISCOURSE PHRASES (Lessons 1–2) ───────────────
  { dutch: "hallo", english: "hello", pos: "particle", frequency: "high", category: ["greeting"] },
  { dutch: "hoi", english: "hi", pos: "particle", frequency: "high", category: ["greeting"] },
  { dutch: "goedemorgen", english: "good morning", pos: "particle", frequency: "high", category: ["greeting"] },
  { dutch: "goedenavond", english: "good evening", pos: "particle", frequency: "high", category: ["greeting"] },
  { dutch: "goedendag", english: "good day", pos: "particle", frequency: "medium", category: ["greeting"] },
  { dutch: "tot ziens", english: "see you / goodbye", pos: "particle", frequency: "high", category: ["greeting"] },
  { dutch: "doei", english: "bye", pos: "particle", frequency: "high", category: ["greeting"] },
  { dutch: "alsjeblieft", english: "please / here you are (informal)", pos: "particle", frequency: "high", category: ["discourse"] },
  { dutch: "alstublieft", english: "please / here you are (formal)", pos: "particle", frequency: "high", category: ["discourse"] },
  { dutch: "a.u.b.", english: "please (abbreviation of alstublieft)", pos: "particle", frequency: "medium", category: ["discourse"] },
  { dutch: "dank je wel", english: "thank you", pos: "particle", frequency: "high", category: ["discourse"] },
  { dutch: "ik heet", english: "my name is", pos: "particle", frequency: "high", category: ["greeting"] },
  { dutch: "ik ben", english: "I am", pos: "particle", frequency: "high", category: ["greeting"] },

  // ── DEMONSTRATIVE PRONOUNS (Lesson 5) ────────────────────────
  { dutch: "dit", english: "this (het-word)", pos: "pronoun", frequency: "high", category: ["demonstrative"] },
  { dutch: "deze", english: "this / these (de-word)", pos: "pronoun", frequency: "high", category: ["demonstrative"] },
  { dutch: "die", english: "that / those", pos: "pronoun", frequency: "high", category: ["demonstrative"] },
  { dutch: "zo", english: "like this / so", pos: "adverb", frequency: "high", category: ["manner"] },
  { dutch: "daarom", english: "that is why / therefore", pos: "adverb", frequency: "high", category: ["reason"] },
  { dutch: "behalve", english: "except / besides", pos: "preposition", frequency: "medium", category: ["preposition"] },
  { dutch: "toen", english: "then / at that time (past)", pos: "adverb", frequency: "high", category: ["time"] },

  // ── DIRECTIONS & POSITION ─────────────────────────────────────
  { dutch: "links", english: "left / to the left", pos: "adverb", frequency: "high", category: ["direction"] },
  { dutch: "rechts", english: "right / to the right", pos: "adverb", frequency: "high", category: ["direction"] },
  { dutch: "beneden", english: "down / downstairs", pos: "adverb", frequency: "medium", category: ["direction", "place"] },
  { dutch: "boven", english: "above / upstairs", pos: "adverb", frequency: "medium", category: ["direction", "place"] },
  { dutch: "rond", english: "around", pos: "preposition", frequency: "medium", category: ["preposition"] },
  { dutch: "het midden", english: "the middle", pos: "noun", gender: "het", frequency: "medium", category: ["position"] },

  // ── TIME NOUNS (Lessons 1, 12) ────────────────────────────────
  { dutch: "avond", english: "evening", pos: "noun", gender: "de", frequency: "high", category: ["time"] },
  { dutch: "middag", english: "afternoon / midday", pos: "noun", gender: "de", frequency: "high", category: ["time"] },
  { dutch: "nacht", english: "night", pos: "noun", gender: "de", frequency: "high", category: ["time"] },
  { dutch: "klok", english: "clock", pos: "noun", gender: "de", frequency: "high", category: ["time", "object"] },
  { dutch: "uur", english: "hour / o'clock", pos: "noun", gender: "het", frequency: "high", category: ["time"] },
  { dutch: "kwartier", english: "quarter of an hour", pos: "noun", gender: "het", frequency: "medium", category: ["time"] },
  { dutch: "minuut", english: "minute", pos: "noun", gender: "de", frequency: "high", category: ["time"] },

  // ── DAYS OF THE WEEK (Lesson 10) ─────────────────────────────
  { dutch: "maandag", english: "Monday", pos: "noun", gender: "de", frequency: "high", category: ["time", "days"] },
  { dutch: "dinsdag", english: "Tuesday", pos: "noun", gender: "de", frequency: "high", category: ["time", "days"] },
  { dutch: "woensdag", english: "Wednesday", pos: "noun", gender: "de", frequency: "high", category: ["time", "days"] },
  { dutch: "donderdag", english: "Thursday", pos: "noun", gender: "de", frequency: "high", category: ["time", "days"] },
  { dutch: "vrijdag", english: "Friday", pos: "noun", gender: "de", frequency: "high", category: ["time", "days"] },
  { dutch: "zaterdag", english: "Saturday", pos: "noun", gender: "de", frequency: "high", category: ["time", "days"] },
  { dutch: "zondag", english: "Sunday", pos: "noun", gender: "de", frequency: "high", category: ["time", "days"] },

  // ── MONTHS (Lesson 10) ────────────────────────────────────────
  { dutch: "maand", english: "month", pos: "noun", gender: "de", frequency: "high", category: ["time"] },
  { dutch: "maan", english: "moon", pos: "noun", gender: "de", frequency: "medium", category: ["nature"] },
  { dutch: "januari", english: "January", pos: "noun", gender: "de", frequency: "high", category: ["time", "months"] },
  { dutch: "februari", english: "February", pos: "noun", gender: "de", frequency: "high", category: ["time", "months"] },
  { dutch: "maart", english: "March", pos: "noun", gender: "de", frequency: "high", category: ["time", "months"] },
  { dutch: "april", english: "April", pos: "noun", gender: "de", frequency: "high", category: ["time", "months"] },
  { dutch: "mei", english: "May", pos: "noun", gender: "de", frequency: "high", category: ["time", "months"] },
  { dutch: "juni", english: "June", pos: "noun", gender: "de", frequency: "high", category: ["time", "months"] },
  { dutch: "juli", english: "July", pos: "noun", gender: "de", frequency: "high", category: ["time", "months"] },
  { dutch: "augustus", english: "August", pos: "noun", gender: "de", frequency: "high", category: ["time", "months"] },
  { dutch: "september", english: "September", pos: "noun", gender: "de", frequency: "high", category: ["time", "months"] },
  { dutch: "oktober", english: "October", pos: "noun", gender: "de", frequency: "high", category: ["time", "months"] },
  { dutch: "november", english: "November", pos: "noun", gender: "de", frequency: "high", category: ["time", "months"] },
  { dutch: "december", english: "December", pos: "noun", gender: "de", frequency: "high", category: ["time", "months"] },

  // ── SEASONS (Lesson 10) ───────────────────────────────────────
  { dutch: "winter", english: "winter", pos: "noun", gender: "de", frequency: "high", category: ["time", "seasons"] },
  { dutch: "lente", english: "spring", pos: "noun", gender: "de", frequency: "high", category: ["time", "seasons"] },
  { dutch: "zomer", english: "summer", pos: "noun", gender: "de", frequency: "high", category: ["time", "seasons"] },
  { dutch: "herfst", english: "autumn / fall", pos: "noun", gender: "de", frequency: "high", category: ["time", "seasons"] },

  // ── ADJECTIVES — MISSING FROM LESSON 9 ───────────────────────
  { dutch: "jong", english: "young", pos: "adjective", frequency: "high", category: ["condition"] },
  { dutch: "vies", english: "dirty / disgusting", pos: "adjective", frequency: "medium", category: ["condition"] },
  { dutch: "schoon", english: "clean", pos: "adjective", frequency: "high", category: ["condition"] },
  { dutch: "arm", english: "poor", pos: "adjective", frequency: "medium", category: ["social"] },
  { dutch: "rijk", english: "rich / wealthy", pos: "adjective", frequency: "medium", category: ["social"] },
  { dutch: "donker", english: "dark", pos: "adjective", frequency: "high", category: ["light"] },
  { dutch: "licht", english: "light / bright", pos: "adjective", frequency: "high", category: ["light"] },
  { dutch: "zwaar", english: "heavy / difficult", pos: "adjective", frequency: "high", category: ["weight"] },
  { dutch: "hard", english: "hard / loud / fast", pos: "adjective", frequency: "high", category: ["texture", "speed"] },
  { dutch: "zacht", english: "soft / quiet / gentle", pos: "adjective", frequency: "high", category: ["texture"] },
  { dutch: "lief", english: "sweet / lovely / kind", pos: "adjective", frequency: "high", category: ["character"] },
  { dutch: "stout", english: "naughty / bold", pos: "adjective", frequency: "medium", category: ["character"] },
  { dutch: "duur", english: "expensive", pos: "adjective", frequency: "high", category: ["price"] },
  { dutch: "goedkoop", english: "cheap / inexpensive", pos: "adjective", frequency: "high", category: ["price"] },
  { dutch: "hoog", english: "high / tall", pos: "adjective", frequency: "high", category: ["size"] },
  { dutch: "laag", english: "low", pos: "adjective", frequency: "high", category: ["size"] },
  { dutch: "verliefd", english: "in love", pos: "adjective", frequency: "medium", category: ["emotion"] },
  { dutch: "verloofd", english: "engaged (to be married)", pos: "adjective", frequency: "medium", category: ["social"] },
  { dutch: "gescheiden", english: "divorced", pos: "adjective", frequency: "medium", category: ["social"] },
  { dutch: "bruto", english: "gross (before tax)", pos: "adjective", frequency: "medium", category: ["work"] },
  { dutch: "netto", english: "net (after tax)", pos: "adjective", frequency: "medium", category: ["work"] },

  // ── PROFESSIONS (Lesson 3) ────────────────────────────────────
  { dutch: "premier", english: "prime minister", pos: "noun", gender: "de", frequency: "medium", category: ["people", "work"] },
  { dutch: "leerling", english: "pupil / student", pos: "noun", gender: "de", frequency: "high", category: ["people", "education"] },
  { dutch: "baas", english: "boss", pos: "noun", gender: "de", frequency: "high", category: ["people", "work"] },
  { dutch: "bakker", english: "baker", pos: "noun", gender: "de", frequency: "medium", category: ["people", "work"] },
  { dutch: "slager", english: "butcher", pos: "noun", gender: "de", frequency: "medium", category: ["people", "work"] },
  { dutch: "boer", english: "farmer", pos: "noun", gender: "de", frequency: "medium", category: ["people", "work"] },
  { dutch: "visser", english: "fisherman", pos: "noun", gender: "de", frequency: "medium", category: ["people", "work"] },
  { dutch: "advocaat", english: "lawyer", pos: "noun", gender: "de", frequency: "medium", category: ["people", "work"] },
  { dutch: "ober", english: "waiter", pos: "noun", gender: "de", frequency: "medium", category: ["people", "work"] },
  { dutch: "politieman", english: "police officer (male)", pos: "noun", gender: "de", frequency: "medium", category: ["people", "work"] },
  { dutch: "agent", english: "police officer / agent", pos: "noun", gender: "de", frequency: "medium", category: ["people", "work"] },
  { dutch: "kapper", english: "hairdresser", pos: "noun", gender: "de", frequency: "medium", category: ["people", "work"] },
  { dutch: "directeur", english: "director / manager", pos: "noun", gender: "de", frequency: "medium", category: ["people", "work"] },
  { dutch: "boekhouder", english: "accountant / bookkeeper", pos: "noun", gender: "de", frequency: "low", category: ["people", "work"] },
  { dutch: "verkoper", english: "salesman / sales clerk", pos: "noun", gender: "de", frequency: "medium", category: ["people", "work"] },
  { dutch: "vertegenwoordiger", english: "representative", pos: "noun", gender: "de", frequency: "low", category: ["people", "work"] },

  // ── FOOD & DRINK (Lesson 4) ───────────────────────────────────
  { dutch: "groente", english: "vegetables", pos: "noun", gender: "de", frequency: "high", category: ["food"] },
  { dutch: "fruit", english: "fruit", pos: "noun", gender: "het", frequency: "high", category: ["food"] },
  { dutch: "boterham", english: "slice of bread / sandwich", pos: "noun", gender: "de", frequency: "high", category: ["food"] },
  { dutch: "hagelslag", english: "chocolate sprinkles (on bread)", pos: "noun", gender: "de", frequency: "medium", category: ["food"] },
  { dutch: "pindakaas", english: "peanut butter", pos: "noun", gender: "de", frequency: "medium", category: ["food"] },
  { dutch: "melk", english: "milk", pos: "noun", gender: "de", frequency: "high", category: ["food", "drink"] },
  { dutch: "aardappel", english: "potato", pos: "noun", gender: "de", frequency: "high", category: ["food"] },
  { dutch: "vlees", english: "meat", pos: "noun", gender: "het", frequency: "high", category: ["food"] },
  { dutch: "kip", english: "chicken", pos: "noun", gender: "de", frequency: "high", category: ["food"] },
  { dutch: "friet", english: "French fries", pos: "noun", gender: "de", frequency: "high", category: ["food"] },
  { dutch: "frikadel", english: "Dutch meat sausage", pos: "noun", gender: "de", frequency: "medium", category: ["food"] },
  { dutch: "kroket", english: "Dutch fried ragout bar", pos: "noun", gender: "de", frequency: "medium", category: ["food"] },
  { dutch: "pannenkoek", english: "pancake", pos: "noun", gender: "de", frequency: "medium", category: ["food"] },
  { dutch: "stroopwafel", english: "syrup waffle", pos: "noun", gender: "de", frequency: "medium", category: ["food"] },
  { dutch: "drop", english: "liquorice", pos: "noun", gender: "het", frequency: "medium", category: ["food"] },
  { dutch: "snoep", english: "sweets / candy", pos: "noun", gender: "het", frequency: "medium", category: ["food"] },
  { dutch: "bloem", english: "flower / flour", pos: "noun", gender: "de", frequency: "medium", category: ["nature", "food"] },
  { dutch: "tulp", english: "tulip", pos: "noun", gender: "de", frequency: "medium", category: ["nature"] },

  // ── TRANSPORT (Lesson 6) ──────────────────────────────────────
  { dutch: "weg", english: "road / way", pos: "noun", gender: "de", frequency: "high", category: ["transport", "place"] },
  { dutch: "snelweg", english: "highway / motorway", pos: "noun", gender: "de", frequency: "medium", category: ["transport", "place"] },
  { dutch: "tram", english: "tram / streetcar", pos: "noun", gender: "de", frequency: "high", category: ["transport"] },
  { dutch: "halte", english: "stop / halt", pos: "noun", gender: "de", frequency: "medium", category: ["transport"] },
  { dutch: "metro", english: "metro / subway", pos: "noun", gender: "de", frequency: "medium", category: ["transport"] },
  { dutch: "boot", english: "boat", pos: "noun", gender: "de", frequency: "medium", category: ["transport"] },
  { dutch: "vliegtuig", english: "airplane", pos: "noun", gender: "het", frequency: "high", category: ["transport"] },
  { dutch: "vliegveld", english: "airport", pos: "noun", gender: "het", frequency: "high", category: ["transport", "place"] },
  { dutch: "haven", english: "port / harbour", pos: "noun", gender: "de", frequency: "medium", category: ["transport", "place"] },
  { dutch: "station", english: "railway station", pos: "noun", gender: "het", frequency: "high", category: ["transport", "place"] },

  // ── PUBLIC PLACES (Lesson 6) ──────────────────────────────────
  { dutch: "apotheek", english: "pharmacy / chemist", pos: "noun", gender: "de", frequency: "high", category: ["place", "health"] },
  { dutch: "zwembad", english: "swimming pool", pos: "noun", gender: "het", frequency: "medium", category: ["place", "sport"] },
  { dutch: "sporthal", english: "sports hall / gym", pos: "noun", gender: "de", frequency: "medium", category: ["place", "sport"] },
  { dutch: "politiebureau", english: "police station", pos: "noun", gender: "het", frequency: "medium", category: ["place"] },
  { dutch: "bibliotheek", english: "library", pos: "noun", gender: "de", frequency: "high", category: ["place", "education"] },
  { dutch: "universiteit", english: "university", pos: "noun", gender: "de", frequency: "high", category: ["place", "education"] },

  // ── AMSTERDAM / URBAN (Lesson 14) ─────────────────────────────
  { dutch: "gracht", english: "canal", pos: "noun", gender: "de", frequency: "medium", category: ["place"] },
  { dutch: "grachtenpand", english: "canal house", pos: "noun", gender: "het", frequency: "low", category: ["place", "home"] },
  { dutch: "woonboot", english: "houseboat", pos: "noun", gender: "de", frequency: "low", category: ["place", "home"] },
  { dutch: "paleis", english: "palace", pos: "noun", gender: "het", frequency: "medium", category: ["place"] },
  { dutch: "pont", english: "ferry", pos: "noun", gender: "de", frequency: "medium", category: ["transport"] },
  { dutch: "rondvaart", english: "canal cruise", pos: "noun", gender: "de", frequency: "low", category: ["transport"] },
  { dutch: "museum", english: "museum", pos: "noun", gender: "het", frequency: "high", category: ["place", "culture"] },
  { dutch: "concert", english: "concert", pos: "noun", gender: "het", frequency: "high", category: ["culture"] },
  { dutch: "gebouw", english: "building", pos: "noun", gender: "het", frequency: "high", category: ["place"] },
  { dutch: "plein", english: "square / plaza", pos: "noun", gender: "het", frequency: "medium", category: ["place"] },
  { dutch: "fietspad", english: "bicycle path / cycle lane", pos: "noun", gender: "het", frequency: "high", category: ["transport", "place"] },
  { dutch: "brug", english: "bridge", pos: "noun", gender: "de", frequency: "high", category: ["place"] },
  { dutch: "eiland", english: "island", pos: "noun", gender: "het", frequency: "medium", category: ["place", "nature"] },
  { dutch: "stadion", english: "stadium", pos: "noun", gender: "het", frequency: "medium", category: ["place", "sport"] },
  { dutch: "hoofdkantoor", english: "head office / headquarters", pos: "noun", gender: "het", frequency: "low", category: ["work", "place"] },
  { dutch: "park", english: "park", pos: "noun", gender: "het", frequency: "high", category: ["place", "nature"] },
  { dutch: "bos", english: "forest / woods", pos: "noun", gender: "het", frequency: "high", category: ["place", "nature"] },

  // ── LEISURE (Lesson 13) ───────────────────────────────────────
  { dutch: "vakantie", english: "holiday / vacation", pos: "noun", gender: "de", frequency: "high", category: ["leisure"] },
  { dutch: "strand", english: "beach", pos: "noun", gender: "het", frequency: "high", category: ["place", "leisure"] },
  { dutch: "pretpark", english: "theme park / amusement park", pos: "noun", gender: "het", frequency: "medium", category: ["place", "leisure"] },
  { dutch: "kunst", english: "art", pos: "noun", gender: "de", frequency: "high", category: ["culture", "leisure"] },
  { dutch: "verjaardag", english: "birthday", pos: "noun", gender: "de", frequency: "high", category: ["social", "leisure"] },
  { dutch: "vrije tijd", english: "leisure time / free time", pos: "noun", gender: "de", frequency: "high", category: ["leisure"] },

  // ── HOME & ROOMS (Lesson 15) ──────────────────────────────────
  { dutch: "woning", english: "dwelling / residence", pos: "noun", gender: "de", frequency: "high", category: ["home"] },
  { dutch: "kruk", english: "stool", pos: "noun", gender: "de", frequency: "low", category: ["home", "object"] },
  { dutch: "lamp", english: "lamp / light", pos: "noun", gender: "de", frequency: "high", category: ["home", "object"] },
  { dutch: "televisie", english: "television", pos: "noun", gender: "de", frequency: "high", category: ["home", "object"] },
  { dutch: "kast", english: "closet / cabinet / wardrobe", pos: "noun", gender: "de", frequency: "high", category: ["home", "object"] },
  { dutch: "wc", english: "toilet / restroom", pos: "noun", gender: "de", frequency: "high", category: ["home"] },
  { dutch: "keuken", english: "kitchen", pos: "noun", gender: "de", frequency: "high", category: ["home"] },
  { dutch: "fornuis", english: "stove / cooker", pos: "noun", gender: "het", frequency: "medium", category: ["home", "object"] },
  { dutch: "koelkast", english: "refrigerator / fridge", pos: "noun", gender: "de", frequency: "high", category: ["home", "object"] },
  { dutch: "woonkamer", english: "living room", pos: "noun", gender: "de", frequency: "high", category: ["home"] },
  { dutch: "bank", english: "couch / sofa", pos: "noun", gender: "de", frequency: "high", category: ["home", "object"] },
  { dutch: "slaapkamer", english: "bedroom", pos: "noun", gender: "de", frequency: "high", category: ["home"] },
  { dutch: "badkamer", english: "bathroom", pos: "noun", gender: "de", frequency: "high", category: ["home"] },
  { dutch: "douche", english: "shower", pos: "noun", gender: "de", frequency: "high", category: ["home", "object"] },
  { dutch: "bad", english: "bathtub / bath", pos: "noun", gender: "het", frequency: "medium", category: ["home", "object"] },
  { dutch: "bijkeuken", english: "scullery / utility room", pos: "noun", gender: "de", frequency: "low", category: ["home"] },
  { dutch: "garage", english: "garage", pos: "noun", gender: "de", frequency: "medium", category: ["home", "place"] },
  { dutch: "zolder", english: "attic", pos: "noun", gender: "de", frequency: "medium", category: ["home"] },

  // ── BODY PARTS (Lesson 16) ────────────────────────────────────
  { dutch: "lichaam", english: "body", pos: "noun", gender: "het", frequency: "high", category: ["body"] },
  { dutch: "lijf", english: "body (informal)", pos: "noun", gender: "het", frequency: "medium", category: ["body"] },
  { dutch: "hoofd", english: "head", pos: "noun", gender: "het", frequency: "high", category: ["body"] },
  { dutch: "kop", english: "head (informal) / cup", pos: "noun", gender: "de", frequency: "high", category: ["body"] },
  { dutch: "mond", english: "mouth", pos: "noun", gender: "de", frequency: "high", category: ["body"] },
  { dutch: "tand", english: "tooth", pos: "noun", gender: "de", frequency: "high", category: ["body"] },
  { dutch: "oor", english: "ear", pos: "noun", gender: "het", frequency: "high", category: ["body"] },
  { dutch: "oog", english: "eye", pos: "noun", gender: "het", frequency: "high", category: ["body"] },
  { dutch: "bril", english: "glasses / spectacles", pos: "noun", gender: "de", frequency: "high", category: ["body", "object"] },
  { dutch: "zonnebril", english: "sunglasses", pos: "noun", gender: "de", frequency: "medium", category: ["body", "object"] },
  { dutch: "neus", english: "nose", pos: "noun", gender: "de", frequency: "high", category: ["body"] },
  { dutch: "haar", english: "hair", pos: "noun", gender: "het", frequency: "high", category: ["body"] },
  { dutch: "elleboog", english: "elbow", pos: "noun", gender: "de", frequency: "medium", category: ["body"] },
  { dutch: "hand", english: "hand", pos: "noun", gender: "de", frequency: "high", category: ["body"] },
  { dutch: "vinger", english: "finger", pos: "noun", gender: "de", frequency: "high", category: ["body"] },
  { dutch: "been", english: "leg / bone", pos: "noun", gender: "het", frequency: "high", category: ["body"] },
  { dutch: "knie", english: "knee", pos: "noun", gender: "de", frequency: "medium", category: ["body"] },
  { dutch: "voet", english: "foot", pos: "noun", gender: "de", frequency: "high", category: ["body"] },
  { dutch: "teen", english: "toe", pos: "noun", gender: "de", frequency: "medium", category: ["body"] },
  { dutch: "rug", english: "back / spine", pos: "noun", gender: "de", frequency: "high", category: ["body"] },
  { dutch: "buik", english: "belly / stomach", pos: "noun", gender: "de", frequency: "high", category: ["body"] },
  { dutch: "schouder", english: "shoulder", pos: "noun", gender: "de", frequency: "high", category: ["body"] },
  { dutch: "borst", english: "chest / breast", pos: "noun", gender: "de", frequency: "high", category: ["body"] },
  { dutch: "baard", english: "beard", pos: "noun", gender: "de", frequency: "medium", category: ["body"] },
  { dutch: "snor", english: "moustache", pos: "noun", gender: "de", frequency: "medium", category: ["body"] },
  { dutch: "hart", english: "heart", pos: "noun", gender: "het", frequency: "high", category: ["body"] },

  // ── CLOTHING (Lesson 17) ──────────────────────────────────────
  { dutch: "kleding", english: "clothing / clothes", pos: "noun", gender: "de", frequency: "high", category: ["clothing"] },
  { dutch: "kledingwinkel", english: "clothes shop", pos: "noun", gender: "de", frequency: "medium", category: ["clothing", "place"] },
  { dutch: "broek", english: "trousers / pants", pos: "noun", gender: "de", frequency: "high", category: ["clothing"] },
  { dutch: "spijkerbroek", english: "jeans", pos: "noun", gender: "de", frequency: "high", category: ["clothing"] },
  { dutch: "trui", english: "sweater / jumper", pos: "noun", gender: "de", frequency: "high", category: ["clothing"] },
  { dutch: "jas", english: "coat / jacket", pos: "noun", gender: "de", frequency: "high", category: ["clothing"] },
  { dutch: "rok", english: "skirt", pos: "noun", gender: "de", frequency: "medium", category: ["clothing"] },
  { dutch: "jurk", english: "dress", pos: "noun", gender: "de", frequency: "medium", category: ["clothing"] },
  { dutch: "sok", english: "sock", pos: "noun", gender: "de", frequency: "medium", category: ["clothing"] },
  { dutch: "kous", english: "stocking / long sock", pos: "noun", gender: "de", frequency: "medium", category: ["clothing"] },
  { dutch: "schoen", english: "shoe", pos: "noun", gender: "de", frequency: "high", category: ["clothing"] },
  { dutch: "klomp", english: "wooden shoe / clog", pos: "noun", gender: "de", frequency: "medium", category: ["clothing"] },
  { dutch: "riem", english: "belt", pos: "noun", gender: "de", frequency: "medium", category: ["clothing"] },
  { dutch: "T-shirt", english: "T-shirt", pos: "noun", gender: "het", frequency: "high", category: ["clothing"] },
  { dutch: "hemd", english: "undershirt", pos: "noun", gender: "het", frequency: "medium", category: ["clothing"] },
  { dutch: "overhemd", english: "shirt (formal)", pos: "noun", gender: "het", frequency: "medium", category: ["clothing"] },
  { dutch: "blouse", english: "blouse / shirt", pos: "noun", gender: "de", frequency: "medium", category: ["clothing"] },
  { dutch: "pak", english: "suit", pos: "noun", gender: "het", frequency: "medium", category: ["clothing"] },
  { dutch: "colbert", english: "suit jacket / blazer", pos: "noun", gender: "het", frequency: "low", category: ["clothing"] },
  { dutch: "stropdas", english: "tie / necktie", pos: "noun", gender: "de", frequency: "medium", category: ["clothing"] },
  { dutch: "strik", english: "bow tie", pos: "noun", gender: "de", frequency: "low", category: ["clothing"] },
  { dutch: "pyjama", english: "pyjamas", pos: "noun", gender: "de", frequency: "medium", category: ["clothing"] },
  { dutch: "onderbroek", english: "undershorts / underwear", pos: "noun", gender: "de", frequency: "medium", category: ["clothing"] },
  { dutch: "bh", english: "bra", pos: "noun", gender: "de", frequency: "medium", category: ["clothing"] },
  { dutch: "hoed", english: "hat", pos: "noun", gender: "de", frequency: "medium", category: ["clothing"] },
  { dutch: "das", english: "scarf / tie", pos: "noun", gender: "de", frequency: "medium", category: ["clothing"] },

  // ── WORK & JOB APPLICATION (Lesson 19) ───────────────────────
  { dutch: "vacature", english: "vacancy / job opening", pos: "noun", gender: "de", frequency: "medium", category: ["work"] },
  { dutch: "advertentie", english: "advertisement", pos: "noun", gender: "de", frequency: "medium", category: ["work", "media"] },
  { dutch: "baan", english: "job / position", pos: "noun", gender: "de", frequency: "high", category: ["work"] },
  { dutch: "sollicitatiebrief", english: "application letter / cover letter", pos: "noun", gender: "de", frequency: "medium", category: ["work"] },
  { dutch: "cv", english: "CV / résumé", pos: "noun", gender: "het", frequency: "medium", category: ["work"] },
  { dutch: "opleiding", english: "education / training / qualification", pos: "noun", gender: "de", frequency: "medium", category: ["work", "education"] },
  { dutch: "gesprek", english: "conversation / talk / interview", pos: "noun", gender: "het", frequency: "high", category: ["communication", "work"] },
  { dutch: "sollicitatiegesprek", english: "job interview", pos: "noun", gender: "het", frequency: "medium", category: ["work"] },
  { dutch: "zaak", english: "company / matter / affair", pos: "noun", gender: "de", frequency: "medium", category: ["work"] },
  { dutch: "salaris", english: "salary", pos: "noun", gender: "het", frequency: "medium", category: ["work"] },
  { dutch: "belasting", english: "tax", pos: "noun", gender: "de", frequency: "medium", category: ["work", "society"] },
  { dutch: "vakantiegeld", english: "holiday pay / vacation bonus", pos: "noun", gender: "het", frequency: "medium", category: ["work"] },
  { dutch: "pensioen", english: "pension / retirement", pos: "noun", gender: "het", frequency: "medium", category: ["work"] },
  { dutch: "reiskosten", english: "travel expenses", pos: "noun", gender: "de", frequency: "low", category: ["work"] },
  { dutch: "vergoeding", english: "compensation / allowance / reimbursement", pos: "noun", gender: "de", frequency: "medium", category: ["work"] },
  { dutch: "collega", english: "colleague", pos: "noun", gender: "de", frequency: "high", category: ["work", "people"] },

  // ── FAMILY EXTENDED (Lesson 20) ───────────────────────────────
  { dutch: "opa", english: "grandfather / grandpa", pos: "noun", gender: "de", frequency: "high", category: ["family"] },
  { dutch: "oma", english: "grandmother / grandma", pos: "noun", gender: "de", frequency: "high", category: ["family"] },
  { dutch: "tante", english: "aunt", pos: "noun", gender: "de", frequency: "high", category: ["family"] },
  { dutch: "oom", english: "uncle", pos: "noun", gender: "de", frequency: "high", category: ["family"] },
  { dutch: "neef", english: "nephew / male cousin", pos: "noun", gender: "de", frequency: "medium", category: ["family"] },
  { dutch: "nicht", english: "niece / female cousin", pos: "noun", gender: "de", frequency: "medium", category: ["family"] },
  { dutch: "kleinkind", english: "grandchild", pos: "noun", gender: "het", frequency: "medium", category: ["family"] },
  { dutch: "kennis", english: "acquaintance", pos: "noun", gender: "de", frequency: "medium", category: ["social"] },
  { dutch: "bekende", english: "acquaintance / known person", pos: "noun", gender: "de", frequency: "medium", category: ["social"] },
  { dutch: "klasgenoot", english: "classmate", pos: "noun", gender: "de", frequency: "medium", category: ["education", "social"] },
  { dutch: "verkering", english: "relationship (romantic)", pos: "noun", gender: "de", frequency: "medium", category: ["social"] },

  // ── NUMBERS (extended — base forms in vocabulary for reference) ─
  { dutch: "zes", english: "six", pos: "numeral", frequency: "high", category: ["number"] },
  { dutch: "zeven", english: "seven", pos: "numeral", frequency: "high", category: ["number"] },
  { dutch: "acht", english: "eight", pos: "numeral", frequency: "high", category: ["number"] },
  { dutch: "negen", english: "nine", pos: "numeral", frequency: "high", category: ["number"] },
  { dutch: "elf", english: "eleven", pos: "numeral", frequency: "high", category: ["number"] },
  { dutch: "twaalf", english: "twelve", pos: "numeral", frequency: "high", category: ["number"] },
  { dutch: "dertien", english: "thirteen", pos: "numeral", frequency: "high", category: ["number"] },
  { dutch: "veertien", english: "fourteen", pos: "numeral", frequency: "high", category: ["number"] },
  { dutch: "vijftien", english: "fifteen", pos: "numeral", frequency: "high", category: ["number"] },
  { dutch: "zestien", english: "sixteen", pos: "numeral", frequency: "high", category: ["number"] },
  { dutch: "zeventien", english: "seventeen", pos: "numeral", frequency: "high", category: ["number"] },
  { dutch: "achttien", english: "eighteen", pos: "numeral", frequency: "high", category: ["number"] },
  { dutch: "negentien", english: "nineteen", pos: "numeral", frequency: "high", category: ["number"] },
  { dutch: "dertig", english: "thirty", pos: "numeral", frequency: "high", category: ["number"] },
  { dutch: "veertig", english: "forty", pos: "numeral", frequency: "high", category: ["number"] },
  { dutch: "vijftig", english: "fifty", pos: "numeral", frequency: "high", category: ["number"] },
  { dutch: "zestig", english: "sixty", pos: "numeral", frequency: "high", category: ["number"] },
  { dutch: "zeventig", english: "seventy", pos: "numeral", frequency: "high", category: ["number"] },
  { dutch: "tachtig", english: "eighty", pos: "numeral", frequency: "high", category: ["number"] },
  { dutch: "negentig", english: "ninety", pos: "numeral", frequency: "high", category: ["number"] },
  { dutch: "honderd", english: "hundred", pos: "numeral", frequency: "high", category: ["number"] },
  { dutch: "duizend", english: "thousand", pos: "numeral", frequency: "high", category: ["number"] },
  { dutch: "miljoen", english: "million", pos: "numeral", frequency: "medium", category: ["number"] },
  { dutch: "nul", english: "zero", pos: "numeral", frequency: "high", category: ["number"] },
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
