// ─────────────────────────────────────────────────────────────
// English Morphology Utilities
//
// Past-tense and past-participle tables for English verbs that
// correspond to the Dutch verb database, plus conjugation helpers.
//
// Centralised here so that NO other module maintains its own
// English morphology tables.
// ─────────────────────────────────────────────────────────────

/** Irregular simple-past forms keyed by English base verb. */
export const ENGLISH_PAST: Record<string, string> = {
  be: "was", have: "had", go: "went", come: "came", do: "did",
  see: "saw", know: "knew", get: "got", make: "made", take: "took",
  give: "gave", eat: "ate", drink: "drank", sleep: "slept",
  read: "read", write: "wrote", run: "ran", ride: "rode",
  fall: "fell", understand: "understood", speak: "spoke", forget: "forgot",
  sit: "sat", stand: "stood", swim: "swam", begin: "began",
  think: "thought", buy: "bought", bring: "brought", find: "found",
  hear: "heard", feel: "felt", teach: "taught", call: "called",
  help: "helped", play: "played", work: "worked", walk: "walked",
  wait: "waited", look: "looked", live: "lived", learn: "learned",
  want: "wanted", stay: "stayed", return: "returned", arrive: "arrived",
  send: "sent", receive: "received", use: "used", study: "studied",
  visit: "visited", hold: "held", grab: "grabbed", pay: "paid",
  tell: "told", travel: "traveled", cook: "cooked", try: "tried",
  expect: "expected", watch: "watched", finish: "finished",
  participate: "participated", open: "opened", close: "closed",
  search: "searched",
};

/** Irregular past-participle forms keyed by English base verb. */
export const ENGLISH_PP: Record<string, string> = {
  be: "been", have: "had", go: "gone", come: "come", do: "done",
  see: "seen", know: "known", get: "gotten", make: "made", take: "taken",
  give: "given", eat: "eaten", drink: "drunk", sleep: "slept",
  read: "read", write: "written", run: "run", ride: "ridden",
  fall: "fallen", understand: "understood", speak: "spoken", forget: "forgotten",
  sit: "sat", stand: "stood", swim: "swum", begin: "begun",
  think: "thought", buy: "bought", bring: "brought", find: "found",
  hear: "heard", feel: "felt", teach: "taught",
  send: "sent", receive: "received", use: "used", visit: "visited",
  search: "searched", help: "helped", learn: "learned", hold: "held",
  pay: "paid", tell: "told", finish: "finished", open: "opened",
  close: "closed", grab: "grabbed", travel: "traveled",
};

/** Strip "to X / Y (note)" → base English verb "X". */
export function getEnglishBase(translation: string): string {
  return translation
    .replace(/^to /, "")
    .split(/[/|(]/)[0]
    .trim();
}

/**
 * Produce an English verb form for a given person/number/tense.
 * Handles: present, simple past, and perfect (have/has + PP).
 */
export function conjugateEnglish(
  base: string,
  person: 1 | 2 | 3,
  number: "singular" | "plural",
  tense: "present" | "past" | "perfect",
): string {
  if (tense === "past") {
    if (base === "be") return number === "plural" || person === 2 ? "were" : "was";
    return ENGLISH_PAST[base] ?? `${base}ed`;
  }

  if (tense === "perfect") {
    const aux = person === 3 && number === "singular" ? "has" : "have";
    const pp = ENGLISH_PP[base] ?? `${base}ed`;
    return `${aux} ${pp}`;
  }

  // Present
  if (base === "be") {
    if (person === 1 && number === "singular") return "am";
    if (person === 3 && number === "singular") return "is";
    return "are";
  }
  if (base === "have") return person === 3 && number === "singular" ? "has" : "have";
  if (person === 3 && number === "singular") {
    if (/(?:s|z|x|ch|sh)$/.test(base)) return `${base}es`;
    if (/[^aeiou]y$/.test(base)) return `${base.slice(0, -1)}ies`;
    return `${base}s`;
  }
  return base;
}

/** English auxiliary for yes/no questions (do/does/did). */
export function questionAux(
  person: 1 | 2 | 3,
  number: "singular" | "plural",
  tense: "present" | "past",
): string {
  if (tense === "past") return "did";
  return person === 3 && number === "singular" ? "does" : "do";
}
