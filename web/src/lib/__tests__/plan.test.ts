import { describe, expect, it } from "vitest";
import { CURRICULUM } from "../constants";
import { apportion, budget, chapterKinds, defaultPeriods, schedule, formatHours, RESERVED_PERIODS, MONTHLY_MONTHS, CALENDAR, type PlanChapter, type Part } from "../plan";
import { MODULES } from "../../../prisma/content/library";

const chaptersOf = (cls: number): PlanChapter[] =>
  Object.entries(CURRICULUM[cls]).flatMap(([part, titles]) => (titles as string[]).map((title, i) => ({ key: `${cls}-${part}-${i + 1}`, part: part as Part, number: i + 1, title })));

describe("CBSE hours to periods", () => {
  it("gives 75 periods to Classes 3–5 and 90 to Classes 6–8 (projects outside the timetable)", () => {
    for (const c of [3, 4, 5]) expect(budget(c)).toMatchObject({ hours: 50, periods: 75, projectHours: 0 });
    for (const c of [6, 7, 8]) expect(budget(c)).toMatchObject({ hours: 60, periods: 90, ctHours: 40, aiHours: 20, projectHours: 40 });
    expect(formatHours(75)).toBe("50 h");
    expect(formatHours(4)).toBe("2 h 40 min");
  });
  it("apportions exactly, with a minimum per share", () => {
    expect(apportion(10, [1, 1, 1]).reduce((a, b) => a + b, 0)).toBe(10);
    expect(apportion(7, [5, 0, 0], 1)).toEqual([5, 1, 1]);
    expect(() => apportion(2, [1, 1, 1], 1)).toThrow();
  });
});

describe("yearly plan", () => {
  for (const cls of [3, 4, 5, 6, 7, 8]) {
    it(`Class ${cls}: chapter periods and schedule add up`, () => {
      const chs = chaptersOf(cls);
      const p = defaultPeriods(cls, chs);
      const sum = Object.values(p).reduce((a, b) => a + b, 0);
      expect(sum).toBe(budget(cls).periods - RESERVED_PERIODS);
      for (const c of chs) expect(p[c.key], c.key).toBeGreaterThanOrEqual(1);
      if (cls >= 6) expect(chs.filter((c) => c.part === "AI").reduce((a, c) => a + p[c.key], 0)).toBe(30); // CBSE: 20 hours of AI

      const s = schedule(cls, chs, p);
      expect(s.length).toBe(budget(cls).periods);
      expect(s.map((x) => x.number)).toEqual(s.map((_, i) => i + 1));
      for (const c of chs) expect(s.filter((x) => x.chapterKey === c.key).length, c.key).toBe(p[c.key]);
      expect(s.filter((x) => x.kind === "TERM_EXAM").map((x) => x.month)).toEqual(["September", "February"]);
      expect(s.filter((x) => x.term === 1).every((x) => ["April", "May", "July", "August", "September"].includes(x.month))).toBe(true);
      for (let i = 1; i < s.length; i++) expect(s[i].week).toBeGreaterThanOrEqual(s[i - 1].week);
      for (const m of MONTHLY_MONTHS) expect(s.some((x) => x.month === m && x.chapterKey), m).toBe(true);
      expect(new Set(s.map((x) => x.month)).size).toBe(CALENDAR.length);
    });
  }
  it("each chapter's periods start with Introduce and end with a check when long enough", () => {
    for (let n = 1; n <= 9; n++) {
      const k = chapterKinds(n, "CT");
      expect(k.length).toBe(n);
      expect(k[0]).toBe("INTRODUCE");
      if (n >= 3) expect(k.at(-1)).toBe("CHECK");
      if (n >= 3) expect(k).toContain("ACTIVITY");
    }
  });
  it("every chapter has a complete learning module", () => {
    for (const cls of [3, 4, 5, 6, 7, 8]) for (const c of chaptersOf(cls)) {
      const m = MODULES[c.key];
      expect(m, c.key).toBeDefined();
      expect(m.o).toHaveLength(3);
      expect(m.ideas.length).toBeGreaterThanOrEqual(3);
      expect(m.kit.steps.length).toBeGreaterThanOrEqual(3);
    }
  });
});

describe("periodLabels", () => {
  it("names periods by chapter and position, and the others by kind", async () => {
    const { periodLabels } = await import("../plan");
    const ch1 = { number: 1, part: "CT" }, ai2 = { number: 2, part: "AI" };
    const m = periodLabels([
      { id: "o", number: 1, kind: "ORIENTATION", term: 1, chapterId: null },
      { id: "a", number: 2, kind: "INTRODUCE", term: 1, chapterId: "c1", chapter: ch1 },
      { id: "b", number: 3, kind: "EXPLORE", term: 1, chapterId: "c1", chapter: ch1 },
      { id: "c", number: 4, kind: "INTRODUCE", term: 1, chapterId: "a2", chapter: ai2 },
      { id: "e", number: 5, kind: "TERM_EXAM", term: 1, chapterId: null },
    ]);
    expect([...m.values()]).toEqual(["Getting started", "Chapter 1-1", "Chapter 1-2", "AI Chapter 2-1", "Term 1 exam"]);
  });
});
