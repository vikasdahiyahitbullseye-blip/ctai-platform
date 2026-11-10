import { describe, expect, it } from "vitest";
import { isCorrect, formatAnswer } from "../scoring";
import { computeMastery, levelFor } from "../mastery";
import { levelInfo, xpForLevel, computeStreak } from "../gamification";
import { allocate, generatePaper, PoolItem } from "../generator";

describe("scoring", () => {
  it("marks each type", () => {
    expect(isCorrect("MCQ", 2, 2)).toBe(true);
    expect(isCorrect("MCQ", 2, "1")).toBe(false);
    expect(isCorrect("MULTI", [0, 2], [2, 0])).toBe(true);
    expect(isCorrect("MULTI", [0, 2], [0])).toBe(false);
    expect(isCorrect("TRUE_FALSE", true, "true")).toBe(true);
    expect(isCorrect("NUMERIC", 1200, "1,200")).toBe(true);
    expect(isCorrect("FILL_BLANK", ["Pattern", "patterns"], "  PATTERNS ")).toBe(true);
    expect(isCorrect("ORDER", [2, 0, 1], [2, 0, 1])).toBe(true);
    expect(isCorrect("ORDER", [2, 0, 1], [0, 2, 1])).toBe(false);
    expect(isCorrect("MCQ", 0, null)).toBe(false);
  });
  it("formats answers", () => {
    expect(formatAnswer("MCQ", ["x", "y"], 1)).toBe("(b) y");
    expect(formatAnswer("ORDER", ["a", "b", "c"], [2, 0, 1])).toBe("c → a → b");
  });
});

describe("mastery", () => {
  const ev = (n: number, correct: number, attempts = 2) =>
    Array.from({ length: n }, (_, i) => ({ correct: i < correct, difficulty: 1, at: new Date(2026, 0, 1, 0, i), attemptId: `a${i % attempts}` }));
  it("needs 5 items across 2 sessions", () => {
    expect(computeMastery(ev(4, 4)).level).toBe("NO_EVIDENCE");
    expect(computeMastery(ev(6, 6, 1)).level).toBe("NO_EVIDENCE");
    expect(computeMastery(ev(6, 6)).level).toBe("ADVANCED");
  });
  it("bands", () => {
    expect(levelFor(39)).toBe("BEGINNING");
    expect(levelFor(40)).toBe("DEVELOPING");
    expect(levelFor(65)).toBe("PROFICIENT");
    expect(levelFor(85)).toBe("ADVANCED");
  });
});

describe("gamification", () => {
  it("levels", () => {
    expect(xpForLevel(1)).toBe(0);
    expect(xpForLevel(2)).toBe(100);
    expect(xpForLevel(3)).toBe(300);
    expect(levelInfo(0).level).toBe(1);
    expect(levelInfo(299).level).toBe(2);
    expect(levelInfo(300)).toMatchObject({ level: 3, intoLevel: 0, toNext: 300 });
  });
  it("streak skips weekends but not weekdays", () => {
    // Wed 2026-11-11 back to Thu 2026-11-05: active Wed, Tue, Mon, Fri, Thu; weekend idle.
    const d = (s: string) => new Date(s + "T10:00:00Z");
    const days = ["2026-11-11", "2026-11-10", "2026-11-09", "2026-11-06", "2026-11-05"].map(d);
    expect(computeStreak(days, d("2026-11-11"))).toBe(5);
    expect(computeStreak(days.filter((x) => x.getUTCDate() !== 9), d("2026-11-11"))).toBe(2);
    expect(computeStreak(days, d("2026-11-12"))).toBe(5); // today not yet active
  });
});

describe("generator", () => {
  const pool: PoolItem[] = [];
  for (const ch of ["c1", "c2"]) for (const d of [1, 2, 3]) for (let i = 0; i < 5; i++)
    pool.push({ id: `${ch}-${d}-${i}`, chapterId: ch, skills: [i % 2 ? "PATTERN" : "ALGORITHMIC"], type: "MCQ", difficulty: d, marks: 1 });

  it("allocates by largest remainder", () => {
    expect(allocate(10, { 1: 40, 2: 40, 3: 20 })).toEqual({ 1: 4, 2: 4, 3: 2 });
    expect(allocate(7, { 1: 34, 2: 33, 3: 33 })).toEqual({ 1: 3, 2: 2, 3: 2 });
  });
  it("respects blueprint and spreads chapters", () => {
    const r = generatePaper(pool, { chapterIds: ["c1", "c2"], count: 10, difficultyMix: { 1: 40, 2: 40, 3: 20 }, seed: 3 });
    expect(r.items).toHaveLength(10);
    expect(r.byDifficulty).toEqual({ 1: 4, 2: 4, 3: 2 });
    expect(r.byChapter.c1).toBe(5);
    expect(new Set(r.items.map((i) => i.id)).size).toBe(10);
    expect(r.warnings).toEqual([]);
  });
  it("is deterministic per seed", () => {
    const bp = { chapterIds: ["c1", "c2"], count: 8, difficultyMix: { 1: 50, 2: 25, 3: 25 } };
    expect(generatePaper(pool, { ...bp, seed: 9 }).items).toEqual(generatePaper(pool, { ...bp, seed: 9 }).items);
  });
  it("fills shortfalls and warns", () => {
    const r = generatePaper(pool, { chapterIds: ["c1"], count: 10, difficultyMix: { 1: 0, 2: 0, 3: 100 }, seed: 1 });
    expect(r.items).toHaveLength(10);
    expect(r.byDifficulty[3]).toBe(5);
    expect(r.warnings.some((w) => w.includes("hard"))).toBe(true);
  });
  it("filters by skill and avoids recent items", () => {
    const avoid = pool.filter((q) => q.chapterId === "c1").map((q) => q.id);
    const r = generatePaper(pool, { chapterIds: ["c1", "c2"], skills: ["PATTERN"], count: 2, difficultyMix: { 1: 100, 2: 0, 3: 0 }, avoidIds: avoid, seed: 2 });
    expect(r.items.every((q) => q.skills.includes("PATTERN"))).toBe(true);
    expect(r.items.every((q) => q.chapterId === "c2")).toBe(true);
  });
});

import { normaliseQuestion } from "../questionInput";
import { parseCsv } from "../csv";
describe("studio question validation", () => {
  const base = { classLevel: 6, part: "CT", chapterNumber: 1, difficulty: 2, skills: ["PATTERN"], stem: "What comes next?", solution: "Add two each time.", options: ["1", "2", "3"] };
  it("parses answers per type", () => {
    expect(normaliseQuestion({ ...base, type: "MCQ", answerRaw: "b" })).toMatchObject({ ok: true, data: { answer: 1 } });
    expect(normaliseQuestion({ ...base, type: "MULTI", answerRaw: "a, c" })).toMatchObject({ ok: true, data: { answer: [0, 2] } });
    expect(normaliseQuestion({ ...base, type: "ORDER", answerRaw: "" })).toMatchObject({ ok: true, data: { answer: [0, 1, 2] } });
    expect(normaliseQuestion({ ...base, type: "NUMERIC", options: [], answerRaw: "1,200" })).toMatchObject({ ok: true, data: { answer: 1200 } });
    expect(normaliseQuestion({ ...base, type: "FILL_BLANK", options: [], answerRaw: "pattern | patterns" })).toMatchObject({ ok: true, data: { answer: ["pattern", "patterns"] } });
  });
  it("rejects bad input", () => {
    expect(normaliseQuestion({ ...base, type: "MCQ", answerRaw: "e" }).ok).toBe(false);
    expect(normaliseQuestion({ ...base, type: "MCQ", answerRaw: "a", skills: [] }).ok).toBe(false);
    expect(normaliseQuestion({ ...base, type: "MCQ", answerRaw: "a", solution: "short" }).ok).toBe(false);
  });
  it("parses quoted CSV", () => {
    expect(parseCsv('a,b\n"x, y","he said ""hi"""\n')).toEqual([["a", "b"], ["x, y", 'he said "hi"']]);
  });
});
