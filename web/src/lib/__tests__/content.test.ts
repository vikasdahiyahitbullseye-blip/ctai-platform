import { describe, expect, it } from "vitest";
import { class3 } from "../../../prisma/content/class3";
import { class6 } from "../../../prisma/content/class6";
import { isCorrect } from "../scoring";
import { SKILLS, CURRICULUM } from "../constants";

describe("seed content integrity", () => {
  for (const [cls, list] of [[3, class3], [6, class6]] as const) {
    it(`class ${cls}: every item is well-formed and its key grades as correct`, () => {
      for (const q of list) {
        const part = q.part ?? "CT";
        const chapters = CURRICULUM[cls][part as "CT" | "AI"]!;
        expect(q.ch, q.stem).toBeLessThanOrEqual(chapters.length);
        expect(q.skills.length).toBeGreaterThan(0);
        q.skills.forEach((s) => expect(Object.keys(SKILLS), s).toContain(s));
        expect(q.solution.length).toBeGreaterThan(10);
        const n = q.options?.length ?? 0;
        if (q.type === "MCQ") expect(Number(q.answer)).toBeLessThan(n);
        if (q.type === "MULTI" || q.type === "ORDER") (q.answer as number[]).forEach((i) => expect(i).toBeLessThan(n));
        if (q.type === "ORDER") expect(new Set(q.answer as number[]).size).toBe(n);
        expect(isCorrect(q.type, q.answer, q.answer), q.stem).toBe(true);
      }
    });
  }
});
