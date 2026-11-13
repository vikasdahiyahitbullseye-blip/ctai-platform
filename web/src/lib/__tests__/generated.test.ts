import { describe, expect, it } from "vitest";
import { generateBank, TARGET, PLAN } from "../../../prisma/content/gen";
import { balanceOptions } from "../../../prisma/content/balance";
import { CURRICULUM } from "../constants";
import { isCorrect } from "../scoring";
import { class3 } from "../../../prisma/content/class3";
import { class3more } from "../../../prisma/content/class3more";
import { class4 } from "../../../prisma/content/class4";
import { class5 } from "../../../prisma/content/class5";
import { class6, class6Short } from "../../../prisma/content/class6";
import { class6more } from "../../../prisma/content/class6more";
import { class7 } from "../../../prisma/content/class7";
import { class8 } from "../../../prisma/content/class8";

const authored = { 3: [...class3, ...class3more], 4: class4, 5: class5, 6: [...class6, ...class6Short, ...class6more], 7: class7, 8: class8 };
const gen = generateBank(authored);
const all = Object.values(gen).flat();

describe("generated question bank", () => {
  it("every chapter has a plan and reaches the target", () => {
    for (const [cls, parts] of Object.entries(CURRICULUM)) for (const [part, titles] of Object.entries(parts)) (titles as string[]).forEach((_, i) => {
      expect(PLAN[`${cls}-${part}-${i + 1}`], `${cls}-${part}-${i + 1} plan`).toBeDefined();
      const n = [...authored[Number(cls) as 3], ...gen[Number(cls)]].filter((q) => (q.part ?? "CT") === part && q.ch === i + 1 && !q.puzzle && q.type !== "SHORT").length;
      expect(n, `${cls}-${part}-${i + 1}`).toBeGreaterThanOrEqual(TARGET);
    });
  });

  it("every item is well-formed and its key marks as correct", () => {
    for (const q of all) {
      expect(q.family).toBeTruthy();
      expect(q.solution.length, q.stem).toBeGreaterThan(5);
      expect(q.stem + q.solution + JSON.stringify(q.options ?? []), q.family).not.toMatch(/undefined|NaN|\[object|Infinity/);
      if (q.type === "MCQ") expect(Number(q.answer)).toBeLessThan(q.options!.length);
      if (["MCQ", "MULTI"].includes(q.type)) {
        expect(q.options!.length, q.family).toBeGreaterThanOrEqual(3);
        expect(new Set(q.options).size, `${q.family}: ${q.stem}`).toBe(q.options!.length);
      }
      if (q.type === "ORDER") expect(new Set(q.options).size).toBe(q.options!.length);
      if (q.type === "NUMERIC") expect(Number.isFinite(q.answer as number), q.family).toBe(true);
      const sample = q.type === "FILL_BLANK" ? (q.answer as string[])[0] : q.answer;
      expect(isCorrect(q.type, q.answer as never, sample as never), `${q.family}: ${q.stem}`).toBe(true);
    }
  });

  it("no duplicate questions within a class", () => {
    for (const [cls, list] of Object.entries(gen)) {
      const keys = [...authored[Number(cls) as 3], ...list].map((q) => `${q.stem}|${[...(q.options ?? [])].sort().join("|")}|${JSON.stringify(q.figure ?? null)}|${JSON.stringify(q.optionFigures ?? null)}`);
      expect(new Set(keys).size, `class ${cls}`).toBe(keys.length);
    }
  });

  it("is deterministic", () => {
    const again = generateBank(authored);
    expect(Object.values(again).flat().map((q) => q.stem)).toEqual(all.map((q) => q.stem));
  });

  it("keeps a healthy difficulty mix and balanced answer positions", () => {
    const d = [0, 0, 0];
    for (const q of all) d[q.d - 1]++;
    expect(d[0] / all.length).toBeLessThan(0.45);
    expect(d[2] / all.length).toBeGreaterThan(0.15);
    const pos = [0, 0, 0, 0];
    let n = 0;
    for (const q of all) { const b = balanceOptions(q); if (b.type === "MCQ") { pos[Number(b.answer)]++; n++; } }
    for (const p of pos.slice(0, 3)) expect(p / n).toBeLessThan(0.45);
  });

  it("spot-checks computed answers in key families", () => {
    const find = (f: string) => all.filter((q) => q.family === f);
    for (const q of find("seq-next")) {
      const nums = q.stem.split("\n").pop()!.split(",").map((x) => Number(x.replace(/[^\d-]/g, ""))).filter((x) => !Number.isNaN(x) && x !== 0 || x === 0).slice(0, 5);
      const step = nums[1] - nums[0];
      expect(q.answer).toBe(nums[4] + step);
    }
    for (const q of find("handshakes")) { const n = Number(q.stem.match(/\d+/)![0]); expect(q.answer).toBe((n * (n - 1)) / 2); }
    for (const q of find("binary")) {
      if (q.type === "NUMERIC") expect(q.answer).toBe(parseInt(q.stem.match(/\*\*([01]+)\*\*/)![1], 2));
      else expect((q.answer as string[])[0]).toBe(Number(q.stem.match(/\*\*(\d+)\*\*/)![1]).toString(2));
    }
    for (const q of find("unit-convert")) {
      const m = q.stem.match(/\*\*(\w+)\*\* are there in \*\*(\d+) (\w+)(?: (\d+) \w+)?\*\*/)!;
      const f = ({ m: 100, kg: 1000, L: 1000, km: 1000 } as Record<string, number>)[m[3]];
      expect(q.answer).toBe(Number(m[2]) * f + Number(m[4] ?? 0));
    }
  });
});
