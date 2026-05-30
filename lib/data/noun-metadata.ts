// ─────────────────────────────────────────────────────────────
// Noun Metadata
//
// Semantic and grammatical properties for Dutch nouns.
// This is the SINGLE SOURCE OF TRUTH for:
//   • semantic roles (for verb–object compatibility)
//   • CEFR level
//   • plural form
//   • whether the noun works as a conditional resource
//     (e.g. "als ik de tijd heb …" / "if I have the time …")
//
// Keyed by Dutch base-word (without article).
// ─────────────────────────────────────────────────────────────

import type { CefrLevel } from "@/lib/data/verb-metadata";

export interface NounMetadata {
  semanticRoles: string[];
  cefrLevel: CefrLevel;
  /** Dutch plural form, if countable. Omitted for mass/uncountable nouns. */
  plural?: string;
  /**
   * True when the noun naturally fills the conditional slot
   * "Als ik [de noun] heb …" (if I have [the noun] …).
   */
  isConditionalResource: boolean;
}

/** Maps Dutch noun base-word → metadata. */
export const NOUN_METADATA: Record<string, NounMetadata> = {

  // ── People (animate_person) ──────────────────────────────────
  man:             { semanticRoles: ["animate_person"], cefrLevel: "A1", plural: "mannen",          isConditionalResource: false },
  vrouw:           { semanticRoles: ["animate_person"], cefrLevel: "A1", plural: "vrouwen",         isConditionalResource: false },
  kind:            { semanticRoles: ["animate_person"], cefrLevel: "A1", plural: "kinderen",        isConditionalResource: false },
  jongen:          { semanticRoles: ["animate_person"], cefrLevel: "A1", plural: "jongens",         isConditionalResource: false },
  meisje:          { semanticRoles: ["animate_person"], cefrLevel: "A1", plural: "meisjes",         isConditionalResource: false },
  moeder:          { semanticRoles: ["animate_person"], cefrLevel: "A1", plural: "moeders",         isConditionalResource: false },
  vader:           { semanticRoles: ["animate_person"], cefrLevel: "A1", plural: "vaders",          isConditionalResource: false },
  broer:           { semanticRoles: ["animate_person"], cefrLevel: "A1", plural: "broers",          isConditionalResource: false },
  zus:             { semanticRoles: ["animate_person"], cefrLevel: "A1", plural: "zussen",          isConditionalResource: false },
  vriend:          { semanticRoles: ["animate_person"], cefrLevel: "A1", plural: "vrienden",        isConditionalResource: false },
  vriendin:        { semanticRoles: ["animate_person"], cefrLevel: "A1", plural: "vriendinnen",     isConditionalResource: false },
  student:         { semanticRoles: ["animate_person"], cefrLevel: "A2", plural: "studenten",       isConditionalResource: false },
  leraar:          { semanticRoles: ["animate_person"], cefrLevel: "A2", plural: "leraren",         isConditionalResource: false },
  lerares:         { semanticRoles: ["animate_person"], cefrLevel: "A2", plural: "leraressen",      isConditionalResource: false },
  kinderen:        { semanticRoles: ["animate_person"], cefrLevel: "A1",                            isConditionalResource: false },
  dokter:          { semanticRoles: ["animate_person"], cefrLevel: "A2", plural: "dokters",         isConditionalResource: false },
  werkgever:       { semanticRoles: ["animate_person"], cefrLevel: "B1", plural: "werkgevers",      isConditionalResource: false },
  werknemer:       { semanticRoles: ["animate_person"], cefrLevel: "B1", plural: "werknemers",      isConditionalResource: false },

  // ── Animals (animate_animal) ─────────────────────────────────
  hond:            { semanticRoles: ["animate_animal"], cefrLevel: "A1", plural: "honden",          isConditionalResource: false },
  kat:             { semanticRoles: ["animate_animal"], cefrLevel: "A1", plural: "katten",          isConditionalResource: false },

  // ── Food ────────────────────────────────────────────────────
  brood:           { semanticRoles: ["food", "physical_object"],   cefrLevel: "A1",                 isConditionalResource: false },
  appel:           { semanticRoles: ["food", "physical_object"],   cefrLevel: "A1", plural: "appels",  isConditionalResource: false },
  kaas:            { semanticRoles: ["food", "physical_object"],   cefrLevel: "A2",                 isConditionalResource: false },
  soep:            { semanticRoles: ["food"],                      cefrLevel: "A2",                 isConditionalResource: false },
  boodschappen:    { semanticRoles: ["food", "physical_object"],   cefrLevel: "A2",                 isConditionalResource: false },

  // ── Drinks ──────────────────────────────────────────────────
  koffie:          { semanticRoles: ["drink"],                     cefrLevel: "A1",                 isConditionalResource: false },
  water:           { semanticRoles: ["drink"],                     cefrLevel: "A1",                 isConditionalResource: false },
  bier:            { semanticRoles: ["drink"],                     cefrLevel: "A2", plural: "bieren",  isConditionalResource: false },
  wijn:            { semanticRoles: ["drink"],                     cefrLevel: "A2", plural: "wijnen",  isConditionalResource: false },
  thee:            { semanticRoles: ["drink"],                     cefrLevel: "A1",                 isConditionalResource: false },

  // ── Texts / media ────────────────────────────────────────────
  boek:            { semanticRoles: ["text", "physical_object"],   cefrLevel: "A1", plural: "boeken",  isConditionalResource: false },
  krant:           { semanticRoles: ["text", "physical_object"],   cefrLevel: "A2", plural: "kranten", isConditionalResource: false },
  brief:           { semanticRoles: ["text", "physical_object"],   cefrLevel: "A2", plural: "brieven", isConditionalResource: false },
  verhaal:         { semanticRoles: ["text"],                      cefrLevel: "A2", plural: "verhalen",isConditionalResource: false },
  lied:            { semanticRoles: ["text"],                      cefrLevel: "A2", plural: "liedjes", isConditionalResource: false },
  nieuws:          { semanticRoles: ["text", "abstract"],          cefrLevel: "A2",                 isConditionalResource: false },
  film:            { semanticRoles: ["text", "abstract"],          cefrLevel: "A2", plural: "films",   isConditionalResource: false },
  woord:           { semanticRoles: ["text", "abstract"],          cefrLevel: "A2", plural: "woorden", isConditionalResource: false },
  taal:            { semanticRoles: ["abstract"],                  cefrLevel: "A2", plural: "talen",   isConditionalResource: false },
  "e-mail":        { semanticRoles: ["text", "physical_object"],   cefrLevel: "A2", plural: "e-mails", isConditionalResource: false },

  // ── Vehicles / transport ─────────────────────────────────────
  auto:            { semanticRoles: ["vehicle", "physical_object"], cefrLevel: "A1", plural: "auto's",   isConditionalResource: false },
  fiets:           { semanticRoles: ["vehicle", "physical_object"], cefrLevel: "A1", plural: "fietsen",  isConditionalResource: false },
  trein:           { semanticRoles: ["vehicle", "physical_object"], cefrLevel: "A2", plural: "treinen",  isConditionalResource: false },
  bus:             { semanticRoles: ["vehicle", "physical_object"], cefrLevel: "A2", plural: "bussen",   isConditionalResource: false },

  // ── Locations / places ───────────────────────────────────────
  huis:            { semanticRoles: ["location", "physical_object"], cefrLevel: "A1", plural: "huizen",   isConditionalResource: false },
  kamer:           { semanticRoles: ["location", "physical_object"], cefrLevel: "A1", plural: "kamers",   isConditionalResource: false },
  school:          { semanticRoles: ["location"],                    cefrLevel: "A1", plural: "scholen",  isConditionalResource: false },
  stad:            { semanticRoles: ["location"],                    cefrLevel: "A1", plural: "steden",   isConditionalResource: false },
  straat:          { semanticRoles: ["location"],                    cefrLevel: "A1", plural: "straten",  isConditionalResource: false },
  winkel:          { semanticRoles: ["location"],                    cefrLevel: "A1", plural: "winkels",  isConditionalResource: false },
  restaurant:      { semanticRoles: ["location"],                    cefrLevel: "A2", plural: "restaurants", isConditionalResource: false },
  tuin:            { semanticRoles: ["location", "physical_object"], cefrLevel: "A1", plural: "tuinen",   isConditionalResource: false },
  kantoor:         { semanticRoles: ["location"],                    cefrLevel: "A2", plural: "kantoren", isConditionalResource: false },
  ziekenhuis:      { semanticRoles: ["location"],                    cefrLevel: "A2", plural: "ziekenhuizen", isConditionalResource: false },
  bedrijf:         { semanticRoles: ["location", "abstract"],        cefrLevel: "B1", plural: "bedrijven", isConditionalResource: false },

  // ── Devices ──────────────────────────────────────────────────
  telefoon:        { semanticRoles: ["device", "physical_object"],  cefrLevel: "A1", plural: "telefoons",  isConditionalResource: false },
  computer:        { semanticRoles: ["device", "physical_object"],  cefrLevel: "A2", plural: "computers",  isConditionalResource: false },

  // ── Clothing / accessories ───────────────────────────────────
  kleren:          { semanticRoles: ["clothing", "physical_object"], cefrLevel: "A2",                      isConditionalResource: false },
  tas:             { semanticRoles: ["clothing", "physical_object"], cefrLevel: "A2", plural: "tassen",    isConditionalResource: false },

  // ── Abstract concepts ────────────────────────────────────────
  muziek:          { semanticRoles: ["abstract"],   cefrLevel: "A1",                    isConditionalResource: false },
  geld:            { semanticRoles: ["abstract"],   cefrLevel: "A1",                    isConditionalResource: true  },
  tijd:            { semanticRoles: ["abstract"],   cefrLevel: "A1", plural: "tijden",  isConditionalResource: true  },
  probleem:        { semanticRoles: ["abstract"],   cefrLevel: "A2", plural: "problemen", isConditionalResource: false },
  les:             { semanticRoles: ["abstract"],   cefrLevel: "A2", plural: "lessen",  isConditionalResource: false },
  dag:             { semanticRoles: ["abstract"],   cefrLevel: "A1", plural: "dagen",   isConditionalResource: false },
  week:            { semanticRoles: ["abstract"],   cefrLevel: "A1", plural: "weken",   isConditionalResource: false },
  jaar:            { semanticRoles: ["abstract"],   cefrLevel: "A1", plural: "jaren",   isConditionalResource: false },

  // ── Physical objects ─────────────────────────────────────────
  cadeau:          { semanticRoles: ["physical_object"], cefrLevel: "A2", plural: "cadeaus",   isConditionalResource: false },
  tafel:           { semanticRoles: ["physical_object"], cefrLevel: "A1", plural: "tafels",    isConditionalResource: false },
  stoel:           { semanticRoles: ["physical_object"], cefrLevel: "A1", plural: "stoelen",   isConditionalResource: false },
  bed:             { semanticRoles: ["physical_object"], cefrLevel: "A1", plural: "bedden",    isConditionalResource: false },
  deur:            { semanticRoles: ["physical_object"], cefrLevel: "A1", plural: "deuren",    isConditionalResource: false },
  raam:            { semanticRoles: ["physical_object"], cefrLevel: "A1", plural: "ramen",     isConditionalResource: false },

  // ── B1/B2 — work & society ───────────────────────────────────
  vergadering:        { semanticRoles: ["abstract", "event"], cefrLevel: "B1", plural: "vergaderingen",      isConditionalResource: false },
  verantwoordelijkheid: { semanticRoles: ["abstract"],        cefrLevel: "B2", plural: "verantwoordelijkheden", isConditionalResource: false },
  ervaring:           { semanticRoles: ["abstract"],          cefrLevel: "B2", plural: "ervaringen",         isConditionalResource: true  },
  sollicitatie:       { semanticRoles: ["abstract"],          cefrLevel: "B1", plural: "sollicitaties",      isConditionalResource: false },
  samenleving:        { semanticRoles: ["abstract"],          cefrLevel: "B2", plural: "samenlevingen",      isConditionalResource: false },
  overheid:           { semanticRoles: ["abstract"],          cefrLevel: "B2", plural: "overheden",          isConditionalResource: false },
  ontwikkeling:       { semanticRoles: ["abstract"],          cefrLevel: "B2", plural: "ontwikkelingen",     isConditionalResource: false },
  economie:           { semanticRoles: ["abstract"],          cefrLevel: "B2", plural: "economieën",         isConditionalResource: false },
  opdracht:           { semanticRoles: ["abstract"],          cefrLevel: "B1", plural: "opdrachten",         isConditionalResource: true  },
  doel:               { semanticRoles: ["abstract"],          cefrLevel: "B1", plural: "doelen",             isConditionalResource: true  },
  resultaat:          { semanticRoles: ["abstract"],          cefrLevel: "B1", plural: "resultaten",         isConditionalResource: true  },
  mening:             { semanticRoles: ["abstract"],          cefrLevel: "B1", plural: "meningen",           isConditionalResource: false },
  beslissing:         { semanticRoles: ["abstract"],          cefrLevel: "B2", plural: "beslissingen",       isConditionalResource: true  },
  informatie:         { semanticRoles: ["abstract"],          cefrLevel: "B2",                               isConditionalResource: true  },
  onderzoek:          { semanticRoles: ["abstract"],          cefrLevel: "B1", plural: "onderzoeken",        isConditionalResource: false },
  situatie:           { semanticRoles: ["abstract"],          cefrLevel: "B2", plural: "situaties",          isConditionalResource: true  },
  mogelijkheid:       { semanticRoles: ["abstract"],          cefrLevel: "B2", plural: "mogelijkheden",      isConditionalResource: true  },
  afspraak:           { semanticRoles: ["abstract", "event"], cefrLevel: "B1", plural: "afspraken",          isConditionalResource: false },
};
