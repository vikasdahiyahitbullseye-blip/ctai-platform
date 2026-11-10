// Helpers for question families: seeded randomness, option building, number formatting.
import { rng } from "../../../src/lib/generator";
import type { SeedQuestion } from "../types";

export type D = 1 | 2 | 3;
export type Ctx = { cls: number; part: "CT" | "AI" | "EVS"; ch: number; title: string; r: () => number };
export type Item = Omit<SeedQuestion, "ch" | "part" | "d"> & { d: D };
export type Family = { id: string; ds: D[]; make: (ctx: Ctx, d: D) => Item | null };

export const R = (seed: number) => rng(seed);
export const int = (r: () => number, a: number, b: number) => a + Math.floor(r() * (b - a + 1));
export const pick = <T,>(r: () => number, a: readonly T[]): T => a[Math.floor(r() * a.length)];
export function sample<T>(r: () => number, a: readonly T[], n: number): T[] {
  const c = [...a];
  const out: T[] = [];
  while (out.length < n && c.length) out.push(c.splice(Math.floor(r() * c.length), 1)[0]);
  return out;
}
/** Indian digit grouping, e.g. 1,25,000. */
export const fmt = (n: number) => n.toLocaleString("en-IN");

/** MCQ with numeric distractors. Distractors that clash with the answer or each other are dropped and replaced. */
export function numOptions(r: () => number, answer: number, candidates: number[], unit = ""): { options: string[]; answer: number } {
  const set: number[] = [];
  for (const c of candidates) if (Number.isFinite(c) && c !== answer && !set.includes(c) && c >= 0) set.push(c);
  let k = 1;
  while (set.length < 3) {
    const c = answer + (k % 2 ? k : -k) * Math.max(1, Math.round(Math.abs(answer) * 0.1) || 1);
    if (c !== answer && !set.includes(c) && c >= 0) set.push(c);
    k++;
  }
  const opts = [answer, ...set.slice(0, 3)];
  return { options: opts.map((v) => `${unit === "₹" ? "₹" : ""}${fmt(v)}${unit && unit !== "₹" ? ` ${unit}` : ""}`), answer: 0 };
}

export function textOptions(answer: string, wrong: string[]): { options: string[]; answer: number } {
  const uniq = [...new Set(wrong.filter((w) => w !== answer))].slice(0, 3);
  return { options: [answer, ...uniq], answer: 0 };
}

export const NAMES = ["Aarav", "Diya", "Kabir", "Ananya", "Vihaan", "Ishita", "Reyansh", "Myra", "Arjun", "Saanvi", "Aditya", "Kiara", "Rohan", "Meera", "Dhruv", "Tara", "Kunal", "Nisha", "Yash", "Pooja", "Neil", "Riya", "Om", "Zoya", "Advik", "Sara", "Ishaan", "Fatima", "Joseph", "Gurpreet", "Lakshmi", "Tenzin"];
export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
export const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const DIRS = ["North", "East", "South", "West"];
