import { describe, expect, it } from "vitest";
import { generateBank, PICTURE_PLAN, PICTURE_FAMILIES } from "../../../prisma/content/gen";
import { PICTURES_PER_CHAPTER } from "../../../prisma/content/gen/pictures";
import { CURRICULUM } from "../constants";
import { perimeter } from "../figures";
import { balanceOptions } from "../../../prisma/content/balance";
import { class3 } from "../../../prisma/content/class3";
import { class4 } from "../../../prisma/content/class4";
import { class5 } from "../../../prisma/content/class5";
import { class6 } from "../../../prisma/content/class6";
import { class7 } from "../../../prisma/content/class7";
import { class8 } from "../../../prisma/content/class8";
import { cellKey, flipH, flipV, rotCW, rot180, shortestPath, PALETTE, type Fig, type Cell } from "../figures";
import { isCorrect } from "../scoring";

const gen = generateBank({ 3: class3, 4: class4, 5: class5, 6: class6, 7: class7, 8: class8 });
const pics = Object.entries(gen).flatMap(([cls, l]) => l.filter((q) => q.figure || q.optionFigures).map((q) => ({ ...q, cls })));
const cellsOf = (f: Fig) => (f.kind === "pixels" ? f.cells : []);

describe("figure helpers", () => {
  const L: Cell[] = [[0, 0, "red"], [1, 0, "blue"], [2, 0, "blue"], [2, 1, "green"]];
  it("transforms behave like a mirror, water and turns", () => {
    expect(cellKey(flipH(3, flipH(3, L)))).toBe(cellKey(L));
    expect(cellKey(flipH(3, L))).toContain("0,2,red");
    expect(cellKey(flipV(3, L))).toContain("2,0,red");
    expect(cellKey(rotCW(3, L))).toContain("0,2,red");
    expect(cellKey(rot180(3, L))).toBe(cellKey(rotCW(3, rotCW(3, L))));
  });
  it("shortest path walks round rocks", () => {
    expect(shortestPath(3, 3, new Set(), [0, 0], [2, 2])).toBe(4);
    expect(shortestPath(3, 3, new Set(["0,1", "1,1"]), [0, 0], [0, 2])).toBe(6);
    expect(shortestPath(3, 3, new Set(["0,1", "1,1", "2,1"]), [0, 0], [0, 2])).toBe(-1);
  });
  it("uses bright, distinct colours", () => expect(new Set(Object.values(PALETTE)).size).toBe(8));
});

describe("picture questions", () => {
  it("every chapter has a picture plan with known families", () => {
    for (const [cls, parts] of Object.entries(CURRICULUM)) for (const [part, titles] of Object.entries(parts)) (titles as string[]).forEach((_, i) => {
      const ids = PICTURE_PLAN[`${cls}-${part}-${i + 1}`];
      expect(ids, `${cls}-${part}-${i + 1}`).toBeDefined();
      for (const id of ids) expect(PICTURE_FAMILIES[id], id).toBeDefined();
    });
  });
  it("perimeter counts outside edges", () => {
    expect(perimeter([[0, 0]])).toBe(4);
    expect(perimeter([[0, 0], [0, 1]])).toBe(6);
    expect(perimeter([[0, 0], [0, 1], [1, 0], [1, 1]])).toBe(8);
  });
  it("every planned chapter gets its picture questions", () => {
    for (const key of Object.keys(PICTURE_PLAN)) {
      const [c, part, ch] = key.split("-");
      expect(pics.filter((q) => q.cls === c && q.part === part && q.ch === Number(ch)).length, key).toBe(PICTURES_PER_CHAPTER);
    }
  });
  it("answers are right and picture options are all different", () => {
    for (const q of pics) {
      expect(isCorrect(q.type, q.answer as number, q.answer as number), q.family).toBe(true);
      if (!q.optionFigures) continue;
      expect(q.optionFigures.length).toBe(q.options!.length);
      const keys = q.optionFigures.map((f) => (f!.kind === "pixels" ? cellKey(f!.cells) : JSON.stringify(f)));
      expect(new Set(keys).size, q.family).toBe(keys.length);
      const f = q.figure as Fig & { n: number };
      const a = q.optionFigures[q.answer as number]!;
      if (q.family === "pic-mirror") expect(cellKey(cellsOf(a))).toBe(cellKey(flipH(f.n, cellsOf(f))));
      if (q.family === "pic-water") expect(cellKey(cellsOf(a))).toBe(cellKey(flipV(f.n, cellsOf(f))));
    }
  });
  it("figure-based answers recompute from the figures", () => {
    for (const q of pics) {
      const f = q.figure as Fig | undefined;
      if (!f) continue;
      if (q.family === "pic-abacus" && /^What number does the abacus show\?/.test(q.stem) && f.kind === "abacus") expect(q.answer).toBe(Number(f.beads.join("")));
      if (q.family === "pic-money" && /altogether/.test(q.stem) && f.kind === "money") expect(q.answer).toBe(f.items.reduce((a, b) => a + b, 0));
      if (q.family === "pic-jug" && /How much water/.test(q.stem) && f.kind === "jug") expect(q.answer).toBe(f.level);
      if (q.family === "pic-ruler" && f.kind === "ruler") expect(q.answer).toBe(f.length);
      if (q.family === "pic-array" && /How many/.test(q.stem) && !/more rows/.test(q.stem) && f.kind === "icons") expect(q.answer).toBe(f.items.length);
      if (q.family === "pic-perimeter" && f.kind === "pixels") expect(q.answer).toBe(/area/.test(q.stem) ? f.cells.length : perimeter(f.cells.map(([r, c]) => [r, c])));
      if (q.family === "pic-binary" && f.kind === "binary") expect(q.answer).toBe(parseInt(f.bits.join(""), 2));
      if (q.family === "pic-ai-accuracy" && f.kind === "icons" && /accuracy/.test(q.stem)) expect(q.answer).toBe((f.items.filter((i) => i.mark === "tick").length / f.items.length) * 100);
      if (q.family === "pic-numline" || q.family === "pic-numline-int" || q.family === "pic-numline-dec") {
        if (f.kind === "numberline" && /red arrow/.test(q.stem)) expect(q.answer).toBeCloseTo(f.marks![0].v, 9);
      }
      if (q.family === "pic-balance" && f.kind === "balance") expect((q.answer as number) * (/one\*\*/.test(q.stem) ? f.left.n : 1)).toBe(f.right.reduce((a, b) => a + b, 0));
    }
  });
  it("shortest-path answers match a fresh search", () => {
    for (const q of pics.filter((x) => x.family === "pic-grid-shortest")) {
      const f = q.figure as Extract<Fig, { kind: "gridmap" }>;
      const rocks = new Set(f.items.filter((i) => i.icon === "🪨").map((i) => `${i.r},${i.c}`));
      const [from, to] = f.items;
      expect(shortestPath(f.rows, f.cols, rocks, [from.r, from.c], [to.r, to.c])).toBe(q.answer);
    }
  });
  it("shuffling options keeps pictures with their labels", () => {
    for (const q of pics.filter((x) => x.optionFigures)) {
      const b = balanceOptions(q as never) as typeof q;
      b.options!.forEach((o, i) => expect(b.optionFigures![i]).toBe(q.optionFigures![q.options!.indexOf(o)]));
    }
  });
});
