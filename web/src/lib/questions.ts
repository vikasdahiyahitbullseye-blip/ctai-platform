// Client-safe question shapes: answer keys never leave the server for unsubmitted work.
import type { Question } from "@prisma/client";
import { rng, shuffle } from "./generator";
import { parseFig, parseFigs, type Fig } from "./figures";

export type ClientQuestion = {
  id: string;
  type: string;
  stem: string;
  /** Options in display order; `i` is the original index used for answers. */
  options: { i: number; text: string; figure?: Fig | null }[];
  figure?: Fig | null;
  difficulty: number;
  marks: number;
  hint?: string | null;
  skills: string[];
};

function seedFrom(s: string) {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}

export function toClient(q: Question, opts: { withHint?: boolean; marks?: number } = {}): ClientQuestion {
  const raw = JSON.parse(q.options) as string[];
  const figs = parseFigs(q.optionFigures);
  let options = raw.map((text, i) => ({ i, text, figure: figs?.[i] ?? null }));
  if (q.type === "ORDER") {
    // Shuffle deterministically, and never start in the correct order.
    const key = JSON.parse(q.answer) as number[];
    const r = rng(seedFrom(q.id));
    for (let t = 0; t < 10; t++) {
      options = shuffle(options, r);
      if (!options.every((o, idx) => o.i === key[idx])) break;
    }
  }
  return {
    id: q.id,
    type: q.type,
    stem: q.stem,
    figure: parseFig(q.figure),
    options,
    difficulty: q.difficulty,
    marks: opts.marks ?? q.marks,
    hint: opts.withHint ? q.hint : undefined,
    skills: q.skills.split(","),
  };
}
