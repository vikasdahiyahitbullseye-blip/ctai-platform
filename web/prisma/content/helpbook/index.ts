// Questions from the "Think, Play & Solve" help books (Classes 3–8): CBSE-level CT questions written as companions to each
// CBSE handbook question (same topic and difficulty, new questions), with answers and solutions. Figures: public/hb.
import HB from "./hb.json";

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
