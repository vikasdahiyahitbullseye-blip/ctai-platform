import { describe, expect, it } from "vitest";
import { class3 } from "../../../prisma/content/class3";
import { class6, class6Short } from "../../../prisma/content/class6";
import { evs3 } from "../../../prisma/content/evs3";
import { PROJECT_KITS } from "../../../prisma/content/projects";
import { CONNECTIONS } from "../../../prisma/content/connections";
import { isCorrect } from "../scoring";
import { SKILLS, CURRICULUM } from "../constants";

describe("seed content integrity", () => {
  for (const [cls, list] of [[3, [...class3, ...evs3]], [6, [...class6, ...class6Short]]] as const) {
    it(`class ${cls}: every item is well-formed and its key grades as correct`, () => {
      for (const q of list) {
        const part = q.part ?? "CT";
        const chapters = CURRICULUM[cls][part as "CT" | "AI" | "EVS"]!;
        expect(q.ch, q.stem).toBeLessThanOrEqual(chapters.length);
        expect(q.skills.length).toBeGreaterThan(0);
        q.skills.forEach((s) => expect(Object.keys(SKILLS), s).toContain(s));
        expect(q.solution.length).toBeGreaterThan(10);
        const n = q.options?.length ?? 0;
        if (q.type === "MCQ") expect(Number(q.answer)).toBeLessThan(n);
        if (q.type === "MULTI" || q.type === "ORDER") (q.answer as number[]).forEach((i) => expect(i).toBeLessThan(n));
        if (q.type === "ORDER") expect(new Set(q.answer as number[]).size).toBe(n);
        if (q.type !== "SHORT") expect(isCorrect(q.type, q.answer, q.answer), q.stem).toBe(true);
      }
    });
  }

  it("project kits are complete", () => {
    for (const k of PROJECT_KITS) {
      expect(k.milestones.length).toBeGreaterThanOrEqual(3);
      expect(k.rubric.every((r) => r.levels.length === 4)).toBe(true);
      if (k.classLevel >= 6) expect(k.milestones.reduce((s, m) => s + m.sessions, 0)).toBe(20);
    }
  });
  it("connections point at real chapters", () => {
    for (const key of Object.keys(CONNECTIONS)) {
      const [cls, part, n] = key.split("-");
      const list = CURRICULUM[Number(cls)][part as "CT" | "AI" | "EVS"];
      expect(list, key).toBeDefined();
      expect(Number(n), key).toBeLessThanOrEqual(list!.length);
    }
  });
});
