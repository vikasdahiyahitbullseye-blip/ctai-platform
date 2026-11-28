// Questions from the "Think, Play & Solve" help books (Classes 3–8): CBSE-level CT questions written as companions to each
// CBSE handbook question (same topic and difficulty, new questions), with answers and solutions. Figures: public/hb.
import HB from "./hb.json";
import S3 from "./solutions/c3.json";
import S4 from "./solutions/c4.json";
import S5 from "./solutions/c5.json";
import S6 from "./solutions/c6.json";
import S7 from "./solutions/c7.json";
import S8 from "./solutions/c8.json";
import F3 from "./solutions/figs-c3.json";
import F4 from "./solutions/figs-c4.json";
import F5 from "./solutions/figs-c5.json";
import F6 from "./solutions/figs-c6.json";
import F7 from "./solutions/figs-c7.json";
import F8 from "./solutions/figs-c8.json";
import type { Fig } from "../../../src/lib/figures";

export type HelpbookRow = { c: number; ch: number; label: string; stem: string; options: string[]; answer: number; solution: string; skills: string[]; d: number; fig: [string, number, number] | null };
export const HELPBOOK = HB as HelpbookRow[];
export const helpbookRef = (r: HelpbookRow) => `Think, Play & Solve Help Book, Class ${r.c} · Chapter ${r.ch} · ${r.label.startsWith("P") ? "Thinking Spot" : r.label.startsWith("A") ? `Activity ${r.label}` : `Question ${r.label}`}`;

const numbers = (s: string) => (s.replace(/(\d),(?=\d)/g, "$1").match(/\d+(\.\d+)?/g) ?? []).map(Number);
/** The solution, ending with the answer when the working does not already state it (e.g. "… gives TEN" → "So the answer is 10."). */
export function solutionWithAnswer(r: HelpbookRow): string {
  const opt = String(r.options[r.answer] ?? "").trim();
  const sol = r.solution.trim();
  if (!opt) return /option\s*\(?[a-d]\)?|\([a-d]\)/i.test(sol) ? sol : `${sol} So the answer is (${String.fromCharCode(97 + r.answer)}).`;
  const on = numbers(opt);
  const stated = on.length ? on.every((n) => numbers(sol).includes(n)) : sol.toLowerCase().includes(opt.toLowerCase());
  return stated ? sol : `${sol}${/[.!?)]$/.test(sol) ? "" : "."} So the answer is **${opt}**.`;
}

/** Worked solutions in the CBSE Teacher Handbook style, one per help-book question, keyed "<chapter>-<label>" per class. */
const WORKED: Record<number, Record<string, string>> = { 3: S3, 4: S4, 5: S5, 6: S6, 7: S7, 8: S8 };
type SolFigs = Record<string, { figs: Fig[]; after?: string }>;
// JSON reads tuples as arrays, so the import is cast; every picture is checked by npm run bank:check.
const FIGS: Record<number, SolFigs> = { 3: F3, 4: F4, 5: F5, 6: F6, 7: F7, 8: F8 } as unknown as Record<number, SolFigs>;

/** Pictures for the worked solution of a help-book question (drawn with the platform's figure kinds), if any. */
export function workedFigures(r: HelpbookRow): Fig[] | undefined {
  return FIGS[r.c]?.[`${r.ch}-${r.label}`]?.figs;
}

/** The handbook-style working for a help-book question (without the closing "Hence, option …" line), with "[fig:n]"
 * markers for its pictures: after the paragraph that contains `after`, or else before the final "So, …" paragraph. */
export function workedSolution(r: HelpbookRow): string | undefined {
  const body = WORKED[r.c]?.[`${r.ch}-${r.label}`];
  const f = FIGS[r.c]?.[`${r.ch}-${r.label}`];
  if (!body || !f?.figs.length) return body;
  const paras = body.split(/\n\s*\n/);
  const marks = f.figs.map((_, i) => `[fig:${i + 1}]`);
  let at = f.after ? paras.findIndex((p) => p.includes(f.after!)) + 1 : 0;
  if (at <= 0) { const last = paras.length - 1; at = /^So,/.test(paras[last]) || paras.length > 1 ? last : paras.length; }
  paras.splice(at, 0, ...marks);
  return paras.join("\n\n");
}
