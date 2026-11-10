// Balances the position of the correct answer in MCQ / multi-select items.
// Authors tend to write the right answer first; we reorder options deterministically (same result every seed)
// and remap the answer key. Options such as "We can't tell" or "All the same" stay in last place.
import { rng, shuffle } from "../../src/lib/generator";
import type { SeedQuestion } from "./types";

const PINNED = /^(all |both |none|we can.?t|can.?t|it was a tie|nothing|they are equal|sometimes|always 0|any box)/i;

function hash(s: string) {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}

export function balanceOptions(q: SeedQuestion): SeedQuestion {
  if (!(q.type === "MCQ" || q.type === "MULTI") || !q.options || q.options.length < 3) return q;
  const n = q.options.length;
  const last = PINNED.test(q.options[n - 1]) ? n - 1 : -1;
  const movable = [...Array(n).keys()].filter((i) => i !== last);
  const order = shuffle(movable, rng(hash(q.stem)));
  if (last >= 0) order.push(last);
  // order[newPos] = oldIndex
  const options = order.map((old) => q.options![old]);
  const optionFigures = q.optionFigures ? order.map((old) => q.optionFigures![old]) : undefined;
  const newIndex = (old: number) => order.indexOf(old);
  const answer = q.type === "MCQ" ? newIndex(Number(q.answer)) : (q.answer as number[]).map(newIndex).sort((a, b) => a - b);
  return { ...q, options, answer, ...(optionFigures ? { optionFigures } : {}) };
}
