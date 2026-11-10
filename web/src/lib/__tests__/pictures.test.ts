import { describe, expect, it } from "vitest";
import { generateBank } from "../../../prisma/content/gen";
import { PICTURE_PLAN, PICTURES_PER_CHAPTER } from "../../../prisma/content/gen/pictures";
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
