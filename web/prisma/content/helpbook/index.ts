// Questions from the "Think, Play & Solve" help books (Classes 3–8): CBSE-level CT questions written as companions to each
// CBSE handbook question (same topic and difficulty, new questions), with answers and solutions. Figures: public/hb.
import HB from "./hb.json";
import S3 from "./solutions/c3.json";
import S4 from "./solutions/c4.json";
import S5 from "./solutions/c5.json";
import S6 from "./solutions/c6.json";
import S7 from "./solutions/c7.json";
import S8 from "./solutions/c8.json";

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
/** The handbook-style working for a help-book question (without the closing "Hence, option …" line). */
export function workedSolution(r: HelpbookRow): string | undefined {
  return WORKED[r.c]?.[`${r.ch}-${r.label}`];
}
