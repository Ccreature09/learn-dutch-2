// ─────────────────────────────────────────────────────────────
// Dutch Number Generator  (0 – 1 000 000)
//
// Rules applied:
//  • 1-19   : irregular words
//  • 20-99  : [unit]en[tens], with ën for unit=2 or 3
//  • 100-999: [n]honderd [remainder]   (compound honderd, space before tail)
//  • 1000+  : compact[t]duizend [remainder]  (no space before duizend)
//  • 1 000 000 : één miljoen
// ─────────────────────────────────────────────────────────────

const ONES: string[] = [
  "",
  "één",
  "twee",
  "drie",
  "vier",
  "vijf",
  "zes",
  "zeven",
  "acht",
  "negen",
  "tien",
  "elf",
  "twaalf",
  "dertien",
  "veertien",
  "vijftien",
  "zestien",
  "zeventien",
  "achttien",
  "negentien",
];

/** Same words but without accent on één – used inside compound numbers */
const ONES_C: string[] = [
  "",
  "een",
  "twee",
  "drie",
  "vier",
  "vijf",
  "zes",
  "zeven",
  "acht",
  "negen",
  "tien",
  "elf",
  "twaalf",
  "dertien",
  "veertien",
  "vijftien",
  "zestien",
  "zeventien",
  "achttien",
  "negentien",
];

const TENS: string[] = [
  "",
  "",
  "twintig",
  "dertig",
  "veertig",
  "vijftig",
  "zestig",
  "zeventig",
  "tachtig",
  "negentig",
];

/** Build a 1-99 word using unaccented (compound) forms */
function below100(n: number): string {
  if (n < 20) return ONES_C[n];
  const unit = n % 10;
  const ten = Math.floor(n / 10);
  if (unit === 0) return TENS[ten];
  // twee/drie get a trema before "en": tweeëntwintig, drieëndertig
  const conn = unit === 2 || unit === 3 ? "ën" : "en";
  return ONES_C[unit] + conn + TENS[ten];
}

/**
 * Compact form of a sub-1000 number, used as the thousands prefix so that
 * "duizend" attaches without an internal space:
 *   250 000 → "tweehonderdvijftigduizend"  (not "tweehonderd vijftigduizend")
 */
function compactBelow1000(n: number): string {
  if (n < 20) return ONES_C[n];
  if (n < 100) return below100(n);
  const h = Math.floor(n / 100);
  const rem = n % 100;
  const hWord = h === 1 ? "honderd" : ONES_C[h] + "honderd";
  return rem === 0 ? hWord : hWord + below100(rem);
}

/** Return the Dutch word(s) for any integer 0 – 1 000 000 */
export function dutchNumber(n: number): string {
  if (n === 0) return "nul";
  if (n === 1) return "één";
  if (n < 20) return ONES[n];
  if (n < 100) return below100(n);

  if (n < 1_000) {
    const h = Math.floor(n / 100);
    const rem = n % 100;
    const hWord = h === 1 ? "honderd" : ONES_C[h] + "honderd";
    return rem === 0 ? hWord : hWord + " " + below100(rem);
  }

  if (n < 1_000_000) {
    const t = Math.floor(n / 1_000);
    const rem = n % 1_000;
    // 1 000 = duizend (never "éénduizend")
    const tWord = t === 1 ? "duizend" : compactBelow1000(t) + "duizend";
    if (rem === 0) return tWord;
    // Space before the remainder
    return tWord + " " + dutchNumber(rem);
  }

  if (n === 1_000_000) return "één miljoen";

  // Beyond 1 M (not used for cards, included for completeness)
  const m = Math.floor(n / 1_000_000);
  const rem = n % 1_000_000;
  const mWord = (m === 1 ? "één" : dutchNumber(m)) + " miljoen";
  return rem === 0 ? mWord : mWord + " " + dutchNumber(rem);
}

// ── Card builder ─────────────────────────────────────────────
// Number cards are no longer static. The FlashcardSystem generates
// random numbers on-the-fly using dutchNumber() so the learner
// practises an infinite variety without a bloated card deck.
