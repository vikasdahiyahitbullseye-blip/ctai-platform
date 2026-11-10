import { describe, expect, it } from "vitest";
import { class3 } from "../../../prisma/content/class3";
import { class6, class6Short } from "../../../prisma/content/class6";
import { evs3 } from "../../../prisma/content/evs3";
import { class4 } from "../../../prisma/content/class4";
import { class5 } from "../../../prisma/content/class5";
import { class7 } from "../../../prisma/content/class7";
import { class8 } from "../../../prisma/content/class8";
import { class3more } from "../../../prisma/content/class3more";
import { class6more } from "../../../prisma/content/class6more";
import { PROJECT_KITS } from "../../../prisma/content/projects";
import { CONNECTIONS } from "../../../prisma/content/connections";
import { isCorrect } from "../scoring";
import { balanceOptions } from "../../../prisma/content/balance";
import { SKILLS, CURRICULUM } from "../constants";

describe("seed content integrity", () => {
  for (const [cls, list] of [[3, [...class3, ...evs3, ...class3more]], [4, class4], [5, class5], [6, [...class6, ...class6Short, ...class6more]], [7, class7], [8, class8]] as const) {
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

  it("no duplicate question stems within a class", () => {
    for (const list of [[...class3, ...evs3, ...class3more], class4, class5, [...class6, ...class6Short, ...class6more], class7, class8]) {
      const stems = list.map((q) => q.stem.trim());
      const dupes = stems.filter((s, i) => stems.indexOf(s) !== i);
      expect(dupes).toEqual([]);
    }
  });
  it("every chapter of every class is covered (CT ≥ 8, AI ≥ 10, EVS ≥ 4 practice items; 5 puzzles per class)", () => {
    const byClass = { 3: [...class3, ...evs3, ...class3more], 4: class4, 5: class5, 6: [...class6, ...class6Short, ...class6more], 7: class7, 8: class8 } as const;
    const min = { CT: 8, AI: 10, EVS: 4 } as const;
    for (const [cls, list] of Object.entries(byClass)) {
      for (const part of ["CT", "AI", "EVS"] as const) {
        (CURRICULUM[Number(cls)][part] ?? []).forEach((_, i) => {
          const n = list.filter((q) => (q.part ?? "CT") === part && q.ch === i + 1 && !q.puzzle && q.type !== "SHORT").length;
          expect(n, `class ${cls} ${part} ch ${i + 1}`).toBeGreaterThanOrEqual(min[part]);
        });
      }
      expect(list.filter((q) => q.puzzle).length, `class ${cls} puzzles`).toBe(5);
    }
  });
  it("difficulty and option counts are sensible", () => {
    for (const list of [class4, class5, class7, class8, class3more, class6more]) for (const q of list) {
      if (["MCQ", "MULTI"].includes(q.type)) expect(q.options!.length, q.stem).toBeGreaterThanOrEqual(3);
      if (q.type === "MULTI") expect((q.answer as number[]).length, q.stem).toBeGreaterThanOrEqual(1);
    }
  });
  it("balancing keeps answers correct and spreads the correct option across positions", () => {
    const all = [...class3, ...evs3, ...class3more, ...class4, ...class5, ...class6, ...class6Short, ...class6more, ...class7, ...class8];
    const counts = [0, 0, 0, 0, 0];
    let mcq = 0;
    for (const raw of all) {
      const q = balanceOptions(raw);
      if (q.type !== "MCQ" && q.type !== "MULTI") continue;
      // Same option texts, and the key still points at the same texts as before.
      expect([...q.options!].sort()).toEqual([...raw.options!].sort());
      const before = (q.type === "MCQ" ? [raw.answer] : raw.answer as number[]).map((i) => raw.options![Number(i)]).sort();
      const after = (q.type === "MCQ" ? [q.answer] : q.answer as number[]).map((i) => q.options![Number(i)]).sort();
      expect(after, q.stem).toEqual(before);
      if (q.type === "MCQ") { counts[Number(q.answer)]++; mcq++; }
    }
    for (const c of counts.slice(0, 4)) expect(c / mcq).toBeLessThan(0.4);
  });
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
