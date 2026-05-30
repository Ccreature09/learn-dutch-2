import type { SentenceCategory, Difficulty, ErrorType } from "@/lib/grammar/types";

// ─────────────────────────────────────────────────────────────
// Dutch Sentence Database
// Templates for generation + examples for error correction
// ─────────────────────────────────────────────────────────────

export interface SentenceTemplate {
  id: string;
  english: string;
  dutch: string;
  structure: string;          // e.g. "Subject + Verb + Object"
  structureCode: string;      // e.g. "SVO"
  category: SentenceCategory;
  difficulty: Difficulty;
  grammaticalNotes: string[];
  alternatives: { dutch: string; note: string }[];
  tags: string[];
}

export interface ErrorSentence {
  id: string;
  correct: string;
  incorrect: string;
  acceptableVariants: string[];
  errorType: ErrorType;
  description: string;
  hint: string;
  explanation: string;
  ruleViolated: string;
  category: SentenceCategory;
  difficulty: Difficulty;
}

// ── SENTENCE TEMPLATES ────────────────────────────────────────

export const SENTENCE_TEMPLATES: SentenceTemplate[] = [
  // ── BASIC / BEGINNER ──────────────────────────────────────
  {
    id: "b001",
    english: "I work here.",
    dutch: "Ik werk hier.",
    structure: "Subject + Verb + Adverb",
    structureCode: "SVA",
    category: "basic",
    difficulty: "beginner",
    grammaticalNotes: [
      "V2 rule: 'werk' is in the 2nd position (after 'ik').",
      "'hier' is an adverbial of place.",
    ],
    alternatives: [
      { dutch: "Hier werk ik.", note: "Fronted adverb → inversion: verb before subject." },
    ],
    tags: ["SVO", "present", "work"],
  },
  {
    id: "b002",
    english: "She lives in Amsterdam.",
    dutch: "Ze woont in Amsterdam.",
    structure: "Subject + Verb + Prepositional Phrase",
    structureCode: "SVP",
    category: "basic",
    difficulty: "beginner",
    grammaticalNotes: [
      "3rd person singular: 'woont' (stem + t).",
      "'ze' is the unstressed form of 'zij' (she).",
    ],
    alternatives: [
      { dutch: "Zij woont in Amsterdam.", note: "'Zij' is the stressed/formal form of 'ze'." },
      { dutch: "In Amsterdam woont ze.", note: "Fronted prepositional phrase → inversion." },
    ],
    tags: ["SVP", "present", "home", "place"],
  },
  {
    id: "b003",
    english: "The children play in the garden.",
    dutch: "De kinderen spelen in de tuin.",
    structure: "Subject + Verb + Prepositional Phrase",
    structureCode: "SVP",
    category: "basic",
    difficulty: "beginner",
    grammaticalNotes: [
      "Plural subject 'de kinderen' takes the plural verb form 'spelen'.",
      "'de tuin' = the garden (de-word).",
    ],
    alternatives: [
      { dutch: "In de tuin spelen de kinderen.", note: "Fronted PP → inversion: verb before subject." },
    ],
    tags: ["plural", "present", "children"],
  },
  {
    id: "b004",
    english: "I am a student.",
    dutch: "Ik ben student.",
    structure: "Subject + Verb + Complement",
    structureCode: "SVC",
    category: "zijn_hebben",
    difficulty: "beginner",
    grammaticalNotes: [
      "'zijn' (to be): 1st person singular = 'ben'.",
      "No article before professions in Dutch: 'Ik ben student' (not 'een student' in this context).",
    ],
    alternatives: [
      { dutch: "Ik ben een student.", note: "Article 'een' is acceptable when emphasising 'a student' as a class." },
    ],
    tags: ["zijn", "beginner", "identity"],
  },
  {
    id: "b005",
    english: "He has a dog.",
    dutch: "Hij heeft een hond.",
    structure: "Subject + Verb + Object",
    structureCode: "SVO",
    category: "zijn_hebben",
    difficulty: "beginner",
    grammaticalNotes: [
      "'hebben' (to have): 3rd person singular = 'heeft'.",
      "'een hond' = a dog (de-word).",
    ],
    alternatives: [],
    tags: ["hebben", "beginner", "animals"],
  },
  {
    id: "b006",
    english: "We eat bread every day.",
    dutch: "We eten elke dag brood.",
    structure: "Subject + Verb + Time + Object",
    structureCode: "SVTO",
    category: "basic",
    difficulty: "beginner",
    grammaticalNotes: [
      "Direct object 'brood' typically comes after temporal adverbial 'elke dag'.",
      "Adverbs of time come before the direct object.",
    ],
    alternatives: [
      { dutch: "Elke dag eten we brood.", note: "Fronted time → inversion." },
      { dutch: "We eten brood elke dag.", note: "Grammatically acceptable, though less natural." },
    ],
    tags: ["present", "food", "daily"],
  },
  {
    id: "b007",
    english: "Today she goes to school.",
    dutch: "Vandaag gaat ze naar school.",
    structure: "Adverb + Verb + Subject + Prepositional Phrase",
    structureCode: "XVSP",
    category: "basic",
    difficulty: "beginner",
    grammaticalNotes: [
      "Fronted adverb 'vandaag' triggers inversion: verb 'gaat' before subject 'ze'.",
      "This is the V2 rule: the finite verb always stays in position 2.",
    ],
    alternatives: [
      { dutch: "Ze gaat vandaag naar school.", note: "Normal SVO order is also correct." },
    ],
    tags: ["inversion", "V2", "movement"],
  },
  {
    id: "b008",
    english: "My name is Anna.",
    dutch: "Ik heet Anna.",
    structure: "Subject + Verb + Complement",
    structureCode: "SVC",
    category: "basic",
    difficulty: "beginner",
    grammaticalNotes: [
      "'heten' (to be called): 1st singular = 'heet'.",
      "Literal: 'I am called Anna'.",
    ],
    alternatives: [
      { dutch: "Mijn naam is Anna.", note: "More literal translation of 'my name is'." },
    ],
    tags: ["identity", "beginner", "heten"],
  },

  // ── QUESTIONS ─────────────────────────────────────────────
  {
    id: "q001",
    english: "Do you speak Dutch?",
    dutch: "Spreek jij Nederlands?",
    structure: "Verb + Subject + Object?",
    structureCode: "VSO?",
    category: "questions",
    difficulty: "beginner",
    grammaticalNotes: [
      "Polar question: verb comes first.",
      "'jij' after the verb: no -t on 'spreek' (inversion rule).",
    ],
    alternatives: [
      { dutch: "Spreek je Nederlands?", note: "'je' is the unstressed form, very common." },
      { dutch: "Jij spreekt Nederlands?", note: "Rising intonation can make statements into yes/no questions." },
    ],
    tags: ["question", "polar", "inversion"],
  },
  {
    id: "q002",
    english: "Where do you live?",
    dutch: "Waar woon jij?",
    structure: "WH-word + Verb + Subject?",
    structureCode: "WHVS?",
    category: "questions",
    difficulty: "beginner",
    grammaticalNotes: [
      "WH-question: question word fills the first position, verb stays in position 2.",
      "'jij' after verb → no -t on 'woon'.",
    ],
    alternatives: [
      { dutch: "Waar woon je?", note: "Unstressed 'je' is more common in speech." },
    ],
    tags: ["question", "WH", "place"],
  },
  {
    id: "q003",
    english: "What are you doing?",
    dutch: "Wat doe jij?",
    structure: "WH-word + Verb + Subject?",
    structureCode: "WHVS?",
    category: "questions",
    difficulty: "beginner",
    grammaticalNotes: [
      "'Wat' is the direct object AND occupies the first position.",
      "Verb 'doe' comes second; subject 'jij' after verb (no -t).",
    ],
    alternatives: [
      { dutch: "Wat doe je?", note: "Unstressed 'je' is very common." },
    ],
    tags: ["question", "WH", "action"],
  },

  // ── MODAL VERBS ───────────────────────────────────────────
  {
    id: "m001",
    english: "I can speak Dutch.",
    dutch: "Ik kan Nederlands spreken.",
    structure: "Subject + Modal + Object + Infinitive",
    structureCode: "SMOI",
    category: "modal_verbs",
    difficulty: "intermediate",
    grammaticalNotes: [
      "Modal verb 'kan' is finite, occupies position 2.",
      "Infinitive 'spreken' goes to the end of the clause.",
      "Object 'Nederlands' comes before the infinitive.",
    ],
    alternatives: [
      { dutch: "Ik spreek Nederlands.", note: "Simpler version without modal." },
      { dutch: "Nederlands kan ik spreken.", note: "Fronted object → inversion." },
    ],
    tags: ["modal", "kunnen", "ability"],
  },
  {
    id: "m002",
    english: "She wants to go to the cinema.",
    dutch: "Ze wil naar de bioscoop gaan.",
    structure: "Subject + Modal + Prepositional Phrase + Infinitive",
    structureCode: "SMPI",
    category: "modal_verbs",
    difficulty: "intermediate",
    grammaticalNotes: [
      "'Wil' is the finite verb in position 2.",
      "Infinitive 'gaan' goes to the end.",
      "Prepositional phrase 'naar de bioscoop' stays before the infinitive.",
    ],
    alternatives: [
      { dutch: "Naar de bioscoop wil ze gaan.", note: "Fronted PP triggers inversion." },
    ],
    tags: ["modal", "willen", "desire", "movement"],
  },
  {
    id: "m003",
    english: "You must study for the exam.",
    dutch: "Jij moet voor het examen studeren.",
    structure: "Subject + Modal + Prepositional Phrase + Infinitive",
    structureCode: "SMPI",
    category: "modal_verbs",
    difficulty: "intermediate",
    grammaticalNotes: [
      "'Moet' is the finite form of 'moeten' for all singular persons.",
      "Infinitive 'studeren' at the end.",
    ],
    alternatives: [
      { dutch: "Je moet voor het examen studeren.", note: "'je' instead of 'jij'." },
    ],
    tags: ["modal", "moeten", "obligation", "education"],
  },
  {
    id: "m004",
    english: "We may eat in the classroom.",
    dutch: "We mogen in de klas eten.",
    structure: "Subject + Modal + Prepositional Phrase + Infinitive",
    structureCode: "SMPI",
    category: "modal_verbs",
    difficulty: "intermediate",
    grammaticalNotes: [
      "'Mogen' → plural form 'mogen', 1st person singular 'mag'.",
      "Infinitive 'eten' at end.",
    ],
    alternatives: [],
    tags: ["modal", "mogen", "permission"],
  },
  {
    id: "m005",
    english: "I would like to go home.",
    dutch: "Ik zou graag naar huis gaan.",
    structure: "Subject + Conditional Modal + Adverb + PP + Infinitive",
    structureCode: "SMAI",
    category: "modal_verbs",
    difficulty: "advanced",
    grammaticalNotes: [
      "'Zou graag' = 'would like to' (polite form using conditional).",
      "'graag' adds the meaning of desire/preference.",
    ],
    alternatives: [
      { dutch: "Ik wil graag naar huis gaan.", note: "Less formal version with 'willen'." },
    ],
    tags: ["modal", "zullen", "conditional", "polite"],
  },

  // ── SIMPLE PAST ───────────────────────────────────────────
  {
    id: "p001",
    english: "Yesterday I worked at home.",
    dutch: "Gisteren werkte ik thuis.",
    structure: "Adverb + Verb + Subject + Adverb",
    structureCode: "XVSA",
    category: "simple_past",
    difficulty: "intermediate",
    grammaticalNotes: [
      "Simple past (imperfectum) of 'werken': 'werkte'.",
      "Fronted temporal adverb → inversion: 'werkte ik'.",
      "'werken' is a weak verb; past tense uses -te (k is in 't kofschip).",
    ],
    alternatives: [
      { dutch: "Ik werkte gisteren thuis.", note: "Subject-first order also correct." },
    ],
    tags: ["simple_past", "weak_verb", "inversion"],
  },
  {
    id: "p002",
    english: "She wrote a letter.",
    dutch: "Ze schreef een brief.",
    structure: "Subject + Verb + Object",
    structureCode: "SVO",
    category: "simple_past",
    difficulty: "intermediate",
    grammaticalNotes: [
      "Strong verb 'schrijven' → irregular past: 'schreef'.",
      "Note the vowel change: schrijven → schreef.",
    ],
    alternatives: [],
    tags: ["simple_past", "strong_verb", "communication"],
  },
  {
    id: "p003",
    english: "We went to the market.",
    dutch: "We gingen naar de markt.",
    structure: "Subject + Verb + Prepositional Phrase",
    structureCode: "SVP",
    category: "simple_past",
    difficulty: "intermediate",
    grammaticalNotes: [
      "'gaan' is a strong verb: past plural 'gingen'.",
      "'gingen' takes zijn in perfect tense.",
    ],
    alternatives: [
      { dutch: "Naar de markt gingen we.", note: "Fronted PP → inversion." },
    ],
    tags: ["simple_past", "strong_verb", "gaan"],
  },

  // ── PERFECT TENSE ─────────────────────────────────────────
  {
    id: "pf001",
    english: "I have read the book.",
    dutch: "Ik heb het boek gelezen.",
    structure: "Subject + Auxiliary (hebben) + Object + Past Participle",
    structureCode: "SHOP",
    category: "perfect_tense",
    difficulty: "intermediate",
    grammaticalNotes: [
      "Perfect tense (voltooid tegenwoordige tijd) = hebben/zijn + past participle.",
      "'lezen' uses auxiliary 'hebben'.",
      "Past participle 'gelezen' goes to the end.",
      "Object 'het boek' comes between auxiliary and past participle.",
    ],
    alternatives: [
      { dutch: "Het boek heb ik gelezen.", note: "Fronted object → inversion." },
    ],
    tags: ["perfect", "hebben", "lezen"],
  },
  {
    id: "pf002",
    english: "She has gone to Amsterdam.",
    dutch: "Ze is naar Amsterdam gegaan.",
    structure: "Subject + Auxiliary (zijn) + Prepositional Phrase + Past Participle",
    structureCode: "SSPP",
    category: "perfect_tense",
    difficulty: "intermediate",
    grammaticalNotes: [
      "'gaan' uses auxiliary 'zijn' (movement verbs often use zijn).",
      "Past participle 'gegaan' comes at the end.",
    ],
    alternatives: [],
    tags: ["perfect", "zijn", "gaan", "movement"],
  },
  {
    id: "pf003",
    english: "They have already eaten.",
    dutch: "Ze hebben al gegeten.",
    structure: "Subject + Auxiliary + Adverb + Past Participle",
    structureCode: "SHAP",
    category: "perfect_tense",
    difficulty: "intermediate",
    grammaticalNotes: [
      "'al' (already) comes before the past participle.",
      "'eten' uses auxiliary 'hebben'.",
    ],
    alternatives: [],
    tags: ["perfect", "hebben", "eten"],
  },

  // ── SUBORDINATE CLAUSES ───────────────────────────────────
  {
    id: "s001",
    english: "I know that he works in Amsterdam.",
    dutch: "Ik weet dat hij in Amsterdam werkt.",
    structure: "Main clause + 'dat' + Subject + [Adverbial] + Verb",
    structureCode: "MC+dat+S+A+V",
    category: "subordinate_clauses",
    difficulty: "intermediate",
    grammaticalNotes: [
      "'dat' introduces a subordinate clause → verb goes to the END.",
      "In the subordinate clause: 'hij in Amsterdam werkt' (SOV order).",
      "This is the opposite of the main clause V2 rule.",
    ],
    alternatives: [
      { dutch: "Ik weet dat hij werkt in Amsterdam.", note: "Less natural — 'in Amsterdam' should come before the verb." },
    ],
    tags: ["subordinate", "dat", "verb-final"],
  },
  {
    id: "s002",
    english: "She stays home because she is sick.",
    dutch: "Ze blijft thuis omdat ze ziek is.",
    structure: "Main clause + 'omdat' + Subject + Complement + Verb",
    structureCode: "MC+omdat+SCV",
    category: "subordinate_clauses",
    difficulty: "intermediate",
    grammaticalNotes: [
      "'omdat' = because (subordinating conjunction → verb to end).",
      "In the subordinate clause: 'ze ziek is' (subject + adjective + verb).",
      "'zijn' verb 'is' comes at the very end.",
    ],
    alternatives: [
      { dutch: "Omdat ze ziek is, blijft ze thuis.", note: "Subordinate clause first → main clause with inversion." },
    ],
    tags: ["subordinate", "omdat", "verb-final"],
  },
  {
    id: "s003",
    english: "I think that you speak Dutch well.",
    dutch: "Ik denk dat jij goed Nederlands spreekt.",
    structure: "Main clause + 'dat' + Subject + Adverb + Object + Verb",
    structureCode: "MC+dat+SAOV",
    category: "subordinate_clauses",
    difficulty: "intermediate",
    grammaticalNotes: [
      "Subordinate clause after 'dat': all verbs go to end.",
      "Adverb 'goed' comes before object 'Nederlands'.",
      "Verb 'spreekt' at the very end.",
    ],
    alternatives: [],
    tags: ["subordinate", "dat", "complex"],
  },
  {
    id: "s004",
    english: "When he comes home, we eat dinner.",
    dutch: "Wanneer hij thuiskomt, eten wij.",
    structure: "Subordinate clause ('wanneer') + , + Verb + Subject",
    structureCode: "SC+,+VS",
    category: "subordinate_clauses",
    difficulty: "advanced",
    grammaticalNotes: [
      "Subordinate clause 'wanneer hij thuiskomt' comes first.",
      "After the comma, the main clause starts → inversion (verb first).",
      "'thuiskomen' is a separable verb: in subordinate clause it stays together → 'thuiskomt'.",
    ],
    alternatives: [
      { dutch: "Wij eten wanneer hij thuiskomt.", note: "Main clause first, no comma needed." },
    ],
    tags: ["subordinate", "wanneer", "inversion", "separable"],
  },

  // ── SEPARABLE VERBS ───────────────────────────────────────
  {
    id: "sep001",
    english: "I call my mother.",
    dutch: "Ik bel mijn moeder op.",
    structure: "Subject + Verb (base) + Object + Prefix",
    structureCode: "S+V_base+O+prefix",
    category: "separable_verbs",
    difficulty: "intermediate",
    grammaticalNotes: [
      "'opbellen' is a separable verb: prefix 'op' splits off in main clauses.",
      "Base verb 'bel' stays in position 2 (V2 rule).",
      "Prefix 'op' goes to the very end of the clause.",
    ],
    alternatives: [],
    tags: ["separable", "opbellen", "communication"],
  },
  {
    id: "sep002",
    english: "He gets up at seven o'clock.",
    dutch: "Hij staat om zeven uur op.",
    structure: "Subject + Verb (base) + Time + Prefix",
    structureCode: "S+V_base+T+prefix",
    category: "separable_verbs",
    difficulty: "intermediate",
    grammaticalNotes: [
      "'opstaan' = to get up (separable verb: op + staan).",
      "Prefix 'op' goes to the end; 'om zeven uur' is the time expression.",
    ],
    alternatives: [
      { dutch: "Om zeven uur staat hij op.", note: "Fronted time expression → inversion." },
    ],
    tags: ["separable", "opstaan", "daily", "time"],
  },
  {
    id: "sep003",
    english: "She wants to take the bag along.",
    dutch: "Ze wil de tas meenemen.",
    structure: "Subject + Modal + Object + Separable Infinitive",
    structureCode: "SMOI (separable)",
    category: "separable_verbs",
    difficulty: "intermediate",
    grammaticalNotes: [
      "With a modal verb, the separable verb stays together in infinitive form.",
      "'meenemen' = mee (prefix) + nemen (verb), stays together after modal.",
    ],
    alternatives: [],
    tags: ["separable", "meenemen", "modal"],
  },
  {
    id: "sep004",
    english: "I know that he calls her.",
    dutch: "Ik weet dat hij haar opbelt.",
    structure: "Main clause + 'dat' + Subject + Object + Separable Verb",
    structureCode: "MC+dat+S+O+V_sep",
    category: "separable_verbs",
    difficulty: "advanced",
    grammaticalNotes: [
      "In a subordinate clause, the separable verb stays together: 'opbelt'.",
      "Compare: main clause 'hij belt haar op' vs subordinate 'dat hij haar opbelt'.",
    ],
    alternatives: [],
    tags: ["separable", "subordinate", "opbellen", "advanced"],
  },

  // ── ADVANCED ──────────────────────────────────────────────
  {
    id: "a001",
    english: "Although it is raining, she goes for a walk.",
    dutch: "Hoewel het regent, gaat ze een wandeling maken.",
    structure: "Subordinate clause (hoewel) + , + Inversion in main clause",
    structureCode: "SC+,+VS",
    category: "advanced",
    difficulty: "advanced",
    grammaticalNotes: [
      "'Hoewel' (although) introduces a subordinate clause → verb to end.",
      "After the comma, main clause starts with verb-subject inversion.",
      "'een wandeling maken' = to go for a walk (idiomatic).",
    ],
    alternatives: [
      { dutch: "Ze gaat een wandeling maken hoewel het regent.", note: "Main clause first, no comma." },
    ],
    tags: ["subordinate", "hoewel", "advanced", "inversion"],
  },
  {
    id: "a002",
    english: "He has never been to Berlin before.",
    dutch: "Hij is nog nooit in Berlijn geweest.",
    structure: "Subject + Auxiliary (zijn) + Adverbs + PP + Past Participle",
    structureCode: "SAAPP",
    category: "advanced",
    difficulty: "advanced",
    grammaticalNotes: [
      "'nog nooit' = never before (not yet never).",
      "Perfect tense with 'zijn': 'geweest' (past participle of zijn).",
      "Note the double negative meaning: 'nog nooit' intensifies 'never'.",
    ],
    alternatives: [],
    tags: ["perfect", "zijn", "negation", "advanced"],
  },
];

// ── ERROR CORRECTION SENTENCES ────────────────────────────────

export const ERROR_SENTENCES: ErrorSentence[] = [
  // ── WRONG WORD ORDER (V2 violations) ─────────────────────
  {
    id: "e001",
    correct: "Vandaag gaat hij naar school.",
    incorrect: "Vandaag hij gaat naar school.",
    acceptableVariants: ["Hij gaat vandaag naar school."],
    errorType: "wrong_word_order",
    description: "V2 violation: verb not in second position after fronted adverb.",
    hint: "When an adverb starts the sentence, the verb and subject must swap.",
    explanation:
      "Dutch follows the V2 (verb-second) rule: in a main clause, the finite verb must always be the second constituent. When 'vandaag' (today) is moved to the front, the verb 'gaat' must come before the subject 'hij'. The correct order is: vandaag (1st) → gaat (2nd) → hij (3rd).",
    ruleViolated: "V2 Word Order Rule",
    category: "basic",
    difficulty: "beginner",
  },
  {
    id: "e002",
    correct: "Morgen werkt ze.",
    incorrect: "Morgen ze werkt.",
    acceptableVariants: ["Ze werkt morgen."],
    errorType: "wrong_word_order",
    description: "Inversion missing after fronted temporal adverb.",
    hint: "After 'morgen', the verb must come before the subject.",
    explanation:
      "When 'morgen' (tomorrow) is at the start of the sentence, it occupies the first constituent position. The verb 'werkt' must then come in second position, before the subject 'ze'. This is called inversion (inversie).",
    ruleViolated: "V2 Word Order / Inversion Rule",
    category: "basic",
    difficulty: "beginner",
  },
  {
    id: "e003",
    correct: "Ik weet dat hij Nederlands spreekt.",
    incorrect: "Ik weet dat hij spreekt Nederlands.",
    acceptableVariants: [],
    errorType: "subordinate_clause_error",
    description: "Verb not at end of subordinate clause after 'dat'.",
    hint: "After 'dat', all verbs go to the end of the clause.",
    explanation:
      "In Dutch subordinate clauses (introduced by 'dat', 'omdat', 'als', etc.), the verb must go to the END of the clause. After 'dat', the order is: subject + object/complement + verb. The correct order: 'dat hij Nederlands spreekt' (subject + object + verb), NOT 'dat hij spreekt Nederlands'.",
    ruleViolated: "Subordinate Clause Verb-Final Rule",
    category: "subordinate_clauses",
    difficulty: "intermediate",
  },
  {
    id: "e004",
    correct: "Ze blijft thuis omdat ze ziek is.",
    incorrect: "Ze blijft thuis omdat ze is ziek.",
    acceptableVariants: [],
    errorType: "subordinate_clause_error",
    description: "Verb 'is' not at end of 'omdat' subordinate clause.",
    hint: "After 'omdat', all verbs — including 'zijn' — must go to the end.",
    explanation:
      "'Omdat' (because) is a subordinating conjunction. It requires the verb to move to the end of the clause. In the clause 'omdat ze ziek is', the adjective 'ziek' comes before the verb 'is'. The order is: omdat (conj.) + ze (subject) + ziek (complement) + is (verb).",
    ruleViolated: "Subordinate Clause Verb-Final Rule",
    category: "subordinate_clauses",
    difficulty: "intermediate",
  },

  // ── WRONG CONJUGATION ─────────────────────────────────────
  {
    id: "e005",
    correct: "Hij werkt elke dag.",
    incorrect: "Hij werk elke dag.",
    acceptableVariants: [],
    errorType: "wrong_conjugation",
    description: "Missing -t for 3rd person singular.",
    hint: "3rd person singular verbs (hij/zij/het) add -t to the stem.",
    explanation:
      "For 3rd person singular (hij/zij/het), Dutch adds -t to the stem. Stem of 'werken' = 'werk'. 3rd person: werk + t = 'werkt'. This is a fundamental rule of Dutch present tense conjugation.",
    ruleViolated: "Verb Conjugation Rule (3rd person singular -t)",
    category: "basic",
    difficulty: "beginner",
  },
  {
    id: "e006",
    correct: "Spreek jij Nederlands?",
    incorrect: "Spreekt jij Nederlands?",
    acceptableVariants: ["Spreek je Nederlands?"],
    errorType: "wrong_conjugation",
    description: "Wrong form after inversion — 'jij/je' after verb drops -t.",
    hint: "When 'jij' or 'je' comes AFTER the verb (inversion), the verb loses its -t.",
    explanation:
      "This is the famous Dutch 'jij/je inversion rule': when 'jij' or 'je' comes AFTER the finite verb (in questions or inversion), the verb uses the stem form without -t. So 'Spreek jij?' not 'Spreekt jij?'. Compare: 'Jij spreekt' (normal order) vs 'Spreek jij?' (inverted).",
    ruleViolated: "Verb Conjugation Rule (jij/je inversion rule)",
    category: "questions",
    difficulty: "intermediate",
  },
  {
    id: "e007",
    correct: "Ik ben student.",
    incorrect: "Ik ben een student.",
    acceptableVariants: ["Ik ben een student."],
    errorType: "wrong_word",
    description: "Article before professions in Dutch identity statements.",
    hint: "Professions and roles typically don't take an article in Dutch.",
    explanation:
      "In Dutch, when stating profession or identity ('I am a teacher/student'), the article 'een' is usually omitted: 'Ik ben leraar' (not 'Ik ben een leraar'). However, 'een' can be used for emphasis or when modified by an adjective: 'Ik ben een goede leraar'. Both forms are acceptable, but omitting 'een' is more natural for simple statements.",
    ruleViolated: "Article Usage Rule (professions)",
    category: "zijn_hebben",
    difficulty: "beginner",
  },

  // ── SEPARABLE VERB ERRORS ─────────────────────────────────
  {
    id: "e008",
    correct: "Ik bel mijn moeder op.",
    incorrect: "Ik opbel mijn moeder.",
    acceptableVariants: [],
    errorType: "separable_verb_error",
    description: "Separable prefix must split from the verb in main clauses.",
    hint: "The prefix of a separable verb must go to the end of the main clause.",
    explanation:
      "'Opbellen' is a separable verb. In main clauses, the prefix 'op' splits from the base verb 'bel' and moves to the END of the clause. The base verb 'bel' stays in position 2 (V2 rule). Correct: 'Ik bel mijn moeder op.' Incorrect: keeping the verb together 'opbel'.",
    ruleViolated: "Separable Verb Rule (main clause)",
    category: "separable_verbs",
    difficulty: "intermediate",
  },
  {
    id: "e009",
    correct: "Hij staat elke ochtend om zeven uur op.",
    incorrect: "Hij staat op elke ochtend om zeven uur.",
    acceptableVariants: ["Elke ochtend staat hij om zeven uur op."],
    errorType: "separable_verb_error",
    description: "Separable prefix 'op' must be at the very end of the clause.",
    hint: "The prefix must come at the END — after all other sentence elements.",
    explanation:
      "The prefix of a separable verb ('op' in 'opstaan') must go to the ABSOLUTE END of the main clause. Even time expressions ('om zeven uur') come between the base verb and the prefix. Correct: 'Hij staat om zeven uur op.' The prefix is always last.",
    ruleViolated: "Separable Verb Rule (prefix position)",
    category: "separable_verbs",
    difficulty: "intermediate",
  },

  // ── ADVANCED ERRORS ───────────────────────────────────────
  {
    id: "e010",
    correct: "Ik heb het boek gelezen.",
    incorrect: "Ik heb gelezen het boek.",
    acceptableVariants: [],
    errorType: "wrong_word_order",
    description: "In perfect tense, the object comes before the past participle.",
    hint: "The past participle always goes to the END, after all objects.",
    explanation:
      "In Dutch perfect tense (voltooid tegenwoordige tijd), the past participle goes to the END of the clause — after all objects and adverbials. Correct order: Subject + auxiliary + [object/adverbs] + past participle. 'Ik heb het boek gelezen' (I + have + the book + read).",
    ruleViolated: "Perfect Tense Word Order Rule",
    category: "perfect_tense",
    difficulty: "intermediate",
  },
  {
    id: "e011",
    correct: "Ze is naar huis gegaan.",
    incorrect: "Ze heeft naar huis gegaan.",
    acceptableVariants: [],
    errorType: "wrong_word",
    description: "Wrong auxiliary — 'gaan' requires 'zijn', not 'hebben'.",
    hint: "Verbs of movement with a destination use 'zijn' as auxiliary.",
    explanation:
      "'Gaan' (to go) uses the auxiliary 'zijn' in the perfect tense. This is because 'gaan' describes movement to a destination. Verbs of directed movement (gaan, komen, rijden to a place, lopen to a place) use 'zijn'. The rule: zijn + gegaan, NOT hebben + gegaan.",
    ruleViolated: "Zijn vs Hebben Auxiliary Rule",
    category: "zijn_hebben",
    difficulty: "intermediate",
  },
  {
    id: "e012",
    correct: "Ik weet dat hij haar opbelt.",
    incorrect: "Ik weet dat hij haar belt op.",
    acceptableVariants: [],
    errorType: "separable_verb_error",
    description: "In subordinate clauses, separable verbs stay together.",
    hint: "In subordinate clauses ('dat', 'omdat', etc.), the separable verb keeps its prefix.",
    explanation:
      "In subordinate clauses, separable verbs stay TOGETHER (prefix + verb). In main clauses: 'hij belt haar op' (split). In subordinate clauses: 'dat hij haar opbelt' (together, at the end). This is the reverse of what happens in main clauses.",
    ruleViolated: "Separable Verb Rule (subordinate clause)",
    category: "separable_verbs",
    difficulty: "advanced",
  },
  {
    id: "e013",
    correct: "Hoewel het regent, gaat ze naar buiten.",
    incorrect: "Hoewel het regent, ze gaat naar buiten.",
    acceptableVariants: [],
    errorType: "wrong_word_order",
    description: "After a fronted subordinate clause, inversion is required in main clause.",
    hint: "When a subordinate clause comes first, the main clause still has V2 order.",
    explanation:
      "When a subordinate clause precedes the main clause (as here, after the comma), the main clause is triggered to start from position 1 of the main clause — which means the VERB must come immediately, before the subject. 'Ze gaat' would be V2 if 'ze' were the first constituent, but since the subordinate clause already occupies the first position, 'gaat' must come before 'ze'.",
    ruleViolated: "V2 Rule after Fronted Subordinate Clause",
    category: "advanced",
    difficulty: "advanced",
  },
  {
    id: "e014",
    correct: "Ze kan goed Nederlands spreken.",
    incorrect: "Ze kan goed Nederlands spreekt.",
    acceptableVariants: [],
    errorType: "wrong_conjugation",
    description: "Verb after modal must be in infinitive form, not conjugated.",
    hint: "After a modal verb (kan, wil, moet, mag, zal), use the infinitive form.",
    explanation:
      "After a modal verb ('kan', 'wil', 'moet', 'mag', 'zal'), the second verb must be in the INFINITIVE form (ending in -en). Never use a conjugated form. 'Ze kan spreken' (correct) not 'Ze kan spreekt' (wrong). The modal verb is the only finite (conjugated) verb in the clause.",
    ruleViolated: "Modal Verb Rule (infinitive complement)",
    category: "modal_verbs",
    difficulty: "intermediate",
  },
];

// ── Lookup helpers ─────────────────────────────────────────────
export function getSentencesByCategory(category: SentenceCategory): SentenceTemplate[] {
  return SENTENCE_TEMPLATES.filter((s) => s.category === category);
}

export function getSentencesByDifficulty(difficulty: Difficulty): SentenceTemplate[] {
  return SENTENCE_TEMPLATES.filter((s) => s.difficulty === difficulty);
}

export function getErrorsByCategory(category: SentenceCategory): ErrorSentence[] {
  return ERROR_SENTENCES.filter((e) => e.category === category);
}

export function getErrorsByDifficulty(difficulty: Difficulty): ErrorSentence[] {
  return ERROR_SENTENCES.filter((e) => e.difficulty === difficulty);
}

export function getRandomSentences(count: number, category?: SentenceCategory): SentenceTemplate[] {
  const pool = category ? getSentencesByCategory(category) : SENTENCE_TEMPLATES;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
