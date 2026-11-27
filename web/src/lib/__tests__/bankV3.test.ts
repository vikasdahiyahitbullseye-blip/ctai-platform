import { describe, expect, it } from "vitest";
import { generateBalanced, ENGINES, enginesFor, CT_SKILLS, AI_SKILLS } from "../../../prisma/content/gen/v3";
import { render } from "../../../prisma/content/gen/v3/core";
import { themes } from "../../../prisma/content/gen/v3/themes";
import { isCorrect } from "../scoring";

const bank = generateBalanced({});
const all = Object.values(bank).flat();

describe("balanced bank (v3)", () => {
  it("gives every chapter equal Easy / Medium / Hard and every skill and type", () => {
    for (const t of themes()) {
      const qs = (bank[t.cls] ?? []).filter((q) => q.ch === t.ch && q.part === t.part && q.type !== "SHORT");
      const d = [1, 2, 3].map((k) => qs.filter((q) => q.d === k).length);
      expect(d[0], `${t.key} easy`).toBeGreaterThanOrEqual(40);
      expect(Math.max(...d) - Math.min(...d), `${t.key} difficulty spread`).toBeLessThanOrEqual(1);
      for (const s of t.part === "AI" ? AI_SKILLS : CT_SKILLS) expect(qs.filter((q) => q.skills.includes(s)).length, `${t.key} ${s}`).toBeGreaterThanOrEqual(25);
      for (const ty of ["MCQ", "TRUE_FALSE", "FILL_BLANK", "NUMERIC"]) expect(qs.filter((q) => q.type === ty).length, `${t.key} ${ty}`).toBeGreaterThanOrEqual(10);
      expect(qs.filter((q) => q.figure || q.optionFigures).length / qs.length, `${t.key} pictures`).toBeGreaterThanOrEqual(0.4);
    }
  });

  it("has every chapter's skills covered by suitable engines", () => {
    for (const t of themes()) for (const s of t.part === "AI" ? AI_SKILLS : CT_SKILLS) expect(enginesFor(t, s).length, `${t.key} ${s}`).toBeGreaterThan(0);
    expect(new Set(ENGINES.map((e) => e.id)).size).toBe(ENGINES.length);
  });

  it("makes well-formed questions whose key is marked correct", () => {
    for (const q of all) {
      const txt = [q.stem, q.solution, ...(q.options ?? [])].join(" ");
      expect(txt, q.stem).not.toMatch(/undefined|NaN|\[object |\$\{/);
      if (q.type === "MCQ") {
        expect(q.options).toHaveLength(4);
        expect(new Set(q.options).size, q.stem).toBe(4);
        expect(isCorrect("MCQ", q.answer as number, q.answer as number)).toBe(true);
      }
      if (q.type === "TRUE_FALSE") { expect(typeof q.answer).toBe("boolean"); expect(q.solution).toContain(q.answer ? "which matches" : "The statement says"); }
      if (q.type === "NUMERIC") expect(Number.isFinite(q.answer as number)).toBe(true);
      if (q.type === "FILL_BLANK") { expect(q.stem).toContain("____"); expect(isCorrect("FILL_BLANK", q.answer as string[], (q.answer as string[])[0])).toBe(true); }
    }
  });

  it("splits True/False statements about evenly between true and false", () => {
    const tf = all.filter((q) => q.type === "TRUE_FALSE");
    const share = tf.filter((q) => q.answer === true).length / tf.length;
    expect(share).toBeGreaterThan(0.4);
    expect(share).toBeLessThan(0.6);
  });

  it("never asks a true/false or fill-in question that hides a fact in the question line", () => {
    const p = { skills: ["PATTERN"], d: 1 as const, ctx: "A story.", ask: "What is the 7th term?", say: "The term is ____.", answer: 5, wrong: [4, 6, 7], solution: "x" };
    expect(render(p, "TRUE_FALSE")).toBeNull();
    expect(render(p, "FILL_BLANK")).toBeNull();
    expect(render(p, "MCQ")).not.toBeNull();
  });
});

import { generateBookSets, BOOK_PER_CHAPTER } from "../../../prisma/content/gen/v3/book";
describe("help-book 'More practice' sets", () => {
  const sets = generateBookSets();
  it("gives every chapter (CT Classes 3–8, AI Classes 6–8) exactly the planned mix", () => {
    for (const t of themes()) {
      const qs = (sets[t.cls] ?? []).filter((q) => q.ch === t.ch && q.part === t.part);
      expect(qs, t.key).toHaveLength(BOOK_PER_CHAPTER);
      const count = (f: (q: (typeof qs)[number]) => string | number) => qs.reduce<Record<string, number>>((m, q) => ({ ...m, [f(q)]: (m[f(q)] ?? 0) + 1 }), {});
      expect(count((q) => q.d), t.key).toEqual({ 1: 7, 2: 7, 3: 6 });
      expect(count((q) => q.skills[0]), t.key).toEqual(t.part === "AI" ? { AI_CONCEPT: 7, DATA: 7, ETHICS: 6 } : { ABSTRACT: 5, PATTERN: 5, DECOMPOSITION: 5, ALGORITHMIC: 5 });
      expect(count((q) => q.type), t.key).toEqual({ MCQ: 12, TRUE_FALSE: 3, FILL_BLANK: 3, NUMERIC: 2 });
      expect(qs.filter((q) => q.figure || q.optionFigures).length, t.key).toBeGreaterThanOrEqual(t.part === "AI" ? 8 : 10);
      expect(qs.map((q) => q.ref)).toEqual(qs.map((_, i) => expect.stringContaining(t.part === "AI" ? `AI Chapter ${t.ch} · Practice Q${i + 1}` : `Chapter ${t.ch} · More practice Q${i + 1}`)));
    }
  });
});
