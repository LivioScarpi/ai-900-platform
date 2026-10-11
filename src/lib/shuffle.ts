import { useState } from "react";

// New seed per page load → different order each session, stable when a card remounts (e.g. exam navigation).
const SESSION_SEED = Math.floor(Math.random() * 2 ** 31);

const PINNED = /^(all|none|both|neither) of the (above|below|preceding)\.?$/i;

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededShuffle<T>(items: T[], seed: number): T[] {
  const rand = mulberry32(seed);
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function shuffleKeepingPinned<T>(items: T[], seed: number, textOf: (item: T) => string): T[] {
  const pinned = items.filter((o) => PINNED.test(textOf(o).trim()));
  const free = items.filter((o) => !PINNED.test(textOf(o).trim()));
  return [...seededShuffle(free, SESSION_SEED ^ seed), ...pinned];
}

/** Display-only shuffle of plain string options (values stay the source of truth). */
export function shuffleStrings(seed: number, items: string[]): string[] {
  return shuffleKeepingPinned(items, seed, (s) => s);
}

export function useShuffledStrings(seed: number, items: string[]): string[] {
  const [ordered] = useState(() => shuffleStrings(seed, items));
  return ordered;
}

/** Shuffled list of indices 0..count-1, for rendering items in random order while keeping their original index. */
export function useShuffledIndices(seed: number, count: number): number[] {
  const [ordered] = useState(() => seededShuffle(Array.from({ length: count }, (_, i) => i), SESSION_SEED ^ seed));
  return ordered;
}

/**
 * Shuffles lettered options for display. Original letters stay the source of truth
 * (answers/progress); `displayLetter` maps original → positional letter shown to the user.
 * "All/None of the above" options keep their place at the end.
 */
export function useShuffledOptions<T extends { letter: string; text: string }>(questionId: number, options: T[]) {
  const [result] = useState(() => {
    const ordered = shuffleKeepingPinned(options, questionId, (o) => o.text);
    const displayLetter: Record<string, string> = {};
    ordered.forEach((o, i) => { displayLetter[o.letter] = String.fromCharCode(65 + i); });
    return { ordered, displayLetter };
  });
  return result;
}

/** Rewrites letter references like "(A)" or "Options A and C" in an explanation to the displayed letters. */
export function remapLetterRefs(text: string | undefined, displayLetter: Record<string, string>): string | undefined {
  if (!text) return text;
  const map = (l: string) => displayLetter[l] ?? l;
  return text
    .replace(/\(([A-F])\)/g, (_, l) => `(${map(l)})`)
    .replace(
      /\b([Oo]ptions?|[Aa]nswers?|[Cc]hoices?)(\s+)([A-F](?:\s*(?:,|and|or|&)\s*[A-F])*)\b/g,
      (_, word, sp, list: string) => word + sp + list.replace(/\b[A-F]\b/g, map)
    );
}
