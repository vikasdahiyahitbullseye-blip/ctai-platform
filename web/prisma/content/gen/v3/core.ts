// Balanced bank (v3): every chapter gets the same share of Easy / Medium / Hard questions, of each CBSE skill and of
// each question type, with many picture questions, in the length and style of the CBSE handbook questions.
//
// An *engine* builds one problem (a story, a question, the computed answer and plausible wrong answers, and often a
// figure). The same problem can then be asked as a multiple-choice, true/false, fill-in-the-blank or numeric
// question. Every answer is computed, so keys are correct by construction; wrong answers are checked to differ from
// the right one.
import type { Fig } from "../../../../src/lib/figures";
import type { SeedQuestion } from "../../types";
import { type D, fmt, sample } from "../util";
export type { D } from "../util";
export { int, pick, sample, fmt, NAMES, DAYS, MONTHS, sol } from "../util";

export type QType = "MCQ" | "TRUE_FALSE" | "FILL_BLANK" | "NUMERIC";
export type Val = number | string;

export type Problem = {
  skills: string[];
  d: D;
  /** The story (and the facts) — markdown. */
  ctx: string;
  /** The question, for multiple choice and numeric answers. */
  ask: string;
  /** The same question as a sentence with one blank "____" (for fill-in and true/false). Units go outside the blank. */
  say: string;
  answer: Val;
  wrong: Val[];
  /** How a value is shown as an option (with its unit). Default: the plain value. */
  show?: (v: Val) => string;
  /** Extra accepted spellings for fill-in answers. */
  accept?: string[];
  /** For numeric answers: what the number is in, e.g. "in rupees". */
  unitNote?: string;
  figure?: Fig;
  solution: string;
  hint?: string;
  /** false when the answer is too long to type (a phrase or a number sentence). */
  fill?: boolean;
  /** Pictures as the answer options (multiple choice only). */
  optionFigures?: Fig[];
  /** Pictures in the worked solution, placed in the text with "[fig:1]", "[fig:2]", … */
  solutionFigures?: Fig[];
};

export type Theme = {
  key: string; cls: number; part: "CT" | "AI"; ch: number; title: string;
  /** Where the story happens, e.g. "at the Surajkund Fair". */
  place: string;
  /** Topic tags that decide which engines suit the chapter. */
  tags: string[];
  items: Thing[];
};
export type Thing = { one: string; many: string; icon: string; price: [number, number] };
export type Ctx = { cls: number; theme: Theme; r: () => number };
export type Engine = {
  id: string;
  skill: string;
  /** Topic tags it suits ("any" fits every chapter of its part). */
  tags: string[];
  part?: "CT" | "AI";
  pic: "always" | "never" | "maybe";
  /** Lowest class it is for. */
  min?: number;
  max?: number;
  make: (c: Ctx, d: D, wantPic: boolean) => Problem | null;
};

export const plain = (v: Val) => (typeof v === "number" ? fmt(v) : v);
export const rupees = (v: Val) => `₹${plain(v)}`;
export const withUnit = (u: string) => (v: Val) => `${plain(v)} ${u}`;

const words = (s: string) => s.trim().split(/\s+/).length;

function hash(s: string) {
  let h = 2166136261;
  for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return h >>> 0;
}

/** Can this problem be asked as `t`? */
export function supports(p: Problem, t: QType): boolean {
  if (t === "MCQ") return true;
  if (t === "NUMERIC") return typeof p.answer === "number" && Number.isFinite(p.answer);
  if (t === "FILL_BLANK") return p.fill !== false && p.say.includes("____") && (typeof p.answer === "number" || words(String(p.answer)) <= 3) && String(plain(p.answer)).length <= 24;
  return p.say.includes("____");
}

/** Turns a problem into a seed question of type `t`, or null if it cannot be asked that way. */
export function render(p: Problem, t: QType): Omit<SeedQuestion, "ch" | "part"> | null {
  if (!supports(p, t)) return null;
  const show = p.show ?? plain;
  const ansShown = show(p.answer);
  const wrong = [...new Map(p.wrong.filter((w) => show(w) !== ansShown && String(w) !== String(p.answer)).map((w) => [show(w), w])).values()];
  const base = { skills: p.skills, d: p.d, solution: p.solution, ...(p.hint ? { hint: p.hint } : {}), ...(p.figure ? { figure: p.figure } : {}), ...(p.solutionFigures?.length ? { solutionFigures: p.solutionFigures } : {}) };
  const ctx = p.ctx.trim();
  if (t === "FILL_BLANK" || t === "TRUE_FALSE") {
    // The question line is not shown in these formats, so everything it mentions must be in the story or the sentence.
    const nums = (s: string) => s.match(/\d+/g) ?? [];
    const known = new Set([...nums(ctx), ...nums(p.say)]);
    if (nums(p.ask).some((n) => !known.has(n))) return null;
  }
  if (t === "MCQ") {
    if (wrong.length < 3) return null;
    const ws = wrong.slice(0, 3);
    if (p.optionFigures) {
      if (p.optionFigures.length !== 4 || ws.some((w, i) => w !== p.wrong[i])) return null;
      return { ...base, type: "MCQ", stem: `${ctx}\n\n${p.ask}`, options: [ansShown, ...ws.map(show)], optionFigures: p.optionFigures, answer: 0 };
    }
    return { ...base, type: "MCQ", stem: `${ctx}\n\n${p.ask}`, options: [ansShown, ...ws.map(show)], answer: 0 };
  }
  if (t === "NUMERIC") {
    return { ...base, type: "NUMERIC", stem: `${ctx}\n\n${p.ask}${p.unitNote ? ` (Answer ${p.unitNote}.)` : ""}`, answer: Number(p.answer) };
  }
  if (t === "FILL_BLANK") {
    const a = plain(p.answer);
    const variants = [...new Set([a, String(p.answer), a.replace(/,/g, ""), ...(p.accept ?? [])].map((x) => x.trim()).filter(Boolean))];
    return { ...base, type: "FILL_BLANK", stem: `${ctx}\n\nFill in the blank: ${p.say}`, answer: variants };
  }
  // TRUE_FALSE: about half the statements are true; a false one uses the most tempting wrong answer.
  if (!wrong.length) return null;
  const truth = hash(ctx + p.say) % 2 === 0;
  const shown = truth ? p.answer : wrong[0];
  return {
    ...base, type: "TRUE_FALSE",
    stem: `${ctx}\n\nTrue or false? ${p.say.replace("____", `**${plain(shown)}**`)}`,
    answer: truth,
    // Handbook style: work out the right answer first, then compare it with the statement.
    solution: `${p.solution}\n\nThe statement says **${plain(shown)}**${truth ? ", which matches." : p.fill === false ? ", which is not the right one." : `, but the correct answer is **${plain(p.answer)}**.`}`,
  };
}

/** Picks n wrong values from candidates, skipping the answer, duplicates and negatives. */
export function near(r: () => number, answer: number, cands: number[], n = 3, allowNeg = false): number[] {
  const out: number[] = [];
  for (const c of sample(r, [...new Set(cands)], cands.length)) if (Number.isFinite(c) && c !== answer && (allowNeg || c >= 0) && !out.includes(c)) out.push(c);
  let k = 1;
  while (out.length < n) {
    const c = answer + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * Math.max(1, Math.round(Math.abs(answer) * 0.1));
    if (c !== answer && (allowNeg || c >= 0) && !out.includes(c)) out.push(c);
    k++;
  }
  return out.slice(0, Math.max(n, 3));
}

export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
export const ord = (n: number) => `${n}${n % 100 >= 11 && n % 100 <= 13 ? "th" : ["th", "st", "nd", "rd"][n % 10] ?? "th"}`;
export const plural = (n: number, t: Thing) => `${fmt(n)} ${n === 1 ? t.one : t.many}`;
export const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a));
/** Time of day from minutes after midnight, on a 12-hour clock: "4:05". */
export const hm = (mins: number) => { const m = ((mins % 720) + 720) % 720; const h = Math.floor(m / 60); return `${h === 0 ? 12 : h}:${String(m % 60).padStart(2, "0")}`; };
export const timeAccept = (mins: number) => { const t = hm(mins); return [t, t.replace(":", "."), `0${t}`.slice(-5), `${t} am`, `${t} pm`]; };
export const dur = (m: number) => (m < 60 ? `${m} minutes` : `${Math.floor(m / 60)} hour${m >= 120 ? "s" : ""}${m % 60 ? ` ${m % 60} minutes` : ""}`);

