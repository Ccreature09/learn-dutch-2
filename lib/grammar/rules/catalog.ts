import type { RuleResult } from "@/lib/grammar/types";

export interface GrammarRuleGuide {
  ruleId: string;
  title: string;
  summary: string;
  details: string;
  example: string;
}

export const GRAMMAR_RULE_GUIDES: GrammarRuleGuide[] = [
  {
    ruleId: "v2",
    title: "V2 Word Order",
    summary: "In Dutch main clauses, the finite verb belongs in the second constituent position.",
    details: "A subject, adverb, object, or full phrase can come first, but the conjugated verb still occupies position two.",
    example: "Vandaag werk ik thuis.",
  },
  {
    ruleId: "conjugation",
    title: "Verb Conjugation",
    summary: "Finite verbs must agree with the subject in person and number, including the inverted jij/je form.",
    details: "Dutch present-tense endings change with the subject, and jij/je loses the final -t when it comes after the verb.",
    example: "Jij werkt hier. Vandaag werk jij hier.",
  },
  {
    ruleId: "sub_verb_final",
    title: "Subordinate Verb-Final",
    summary: "After conjunctions like dat, omdat, and als, the verb cluster moves to the end of the clause.",
    details: "Subordinate clauses follow SOV-style order, so objects and adverbials come before the verb(s).",
    example: "Ik weet dat zij morgen komt.",
  },
  {
    ruleId: "inversion",
    title: "Inversion After Fronting",
    summary: "When a non-subject comes first, the finite verb comes before the subject.",
    details: "This is how Dutch preserves the V2 pattern after fronted time expressions, places, and other constituents.",
    example: "Morgen gaat hij naar school.",
  },
  {
    ruleId: "separable",
    title: "Separable Verbs",
    summary: "Separable prefixes split off in main clauses and stay attached in subordinate clauses.",
    details: "Main clauses place the prefix at the end, while subordinate clauses keep the full verb together at clause-final position.",
    example: "Hij belt zijn moeder op. Ik weet dat hij zijn moeder opbelt.",
  },
  {
    ruleId: "modal_infinitive",
    title: "Modal + Infinitive",
    summary: "After a modal verb, the next verb should stay in the infinitive form.",
    details: "Kunnen, willen, moeten, mogen, and zullen carry the finite ending; the lexical verb stays unconjugated.",
    example: "Ze kan goed Nederlands spreken.",
  },
  {
    ruleId: "perfect_word_order",
    title: "Perfect Tense Word Order",
    summary: "In the perfect tense, the past participle belongs at the end of the clause.",
    details: "Objects, adverbs, and prepositional phrases stay between the auxiliary and the past participle.",
    example: "Ik heb het boek gisteren gelezen.",
  },
  {
    ruleId: "auxiliary",
    title: "Auxiliary Selection",
    summary: "Perfect tense sentences must choose the correct auxiliary: usually hebben, but movement and change-of-state verbs often take zijn.",
    details: "The auxiliary is tied to the verb lemma, so the validator checks whether the participle is paired with the right helper verb.",
    example: "Ze is naar huis gegaan. Hij heeft een boek gelezen.",
  },
  {
    ruleId: "profession_article",
    title: "Professions Without Article",
    summary: "After zijn or worden, professions and roles usually appear without an indefinite article.",
    details: "Predicate nouns like student, leraar, and dokter normally follow the copular verb directly.",
    example: "Ik ben leraar.",
  },
];

const RULE_GUIDE_LOOKUP = Object.fromEntries(
  GRAMMAR_RULE_GUIDES.map((rule) => [rule.ruleId, rule]),
);

export function getRelevantGrammarNotes(results: RuleResult[], maxNotes = 3): string[] {
  const notes: string[] = [];

  for (const result of results) {
    if (
      result.status === "pass" &&
      /^(No |Sentence too short|Could not identify|Cannot verify|Subject is a noun phrase)/.test(result.message)
    ) {
      continue;
    }

    const guide = RULE_GUIDE_LOOKUP[result.ruleId];
    const note = guide?.summary ?? result.explanation ?? result.message;
    if (!note || notes.includes(note)) continue;

    notes.push(note);
    if (notes.length >= maxNotes) break;
  }

  return notes;
}