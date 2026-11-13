import { describe, expect, it } from "vitest";
import {
  LEVELS, levelFor, makeSudoku, checkSudoku, hanoiStart, hanoiMove, checkHanoi, hanoiPar, makeLights, lightsToggle, checkLights,
  makeSlide, checkSlide, slideTile, makeCode, codeClue, checkCode, verifyGame, type Move,
} from "../games";

const seeds = ["abc123x", "zz99kk11", "seed-777", "q1w2e3r4"];

/** Standard recursive solution for the tower. */
function hanoiSolve(n: number, from = 0, to = 2, via = 1, out: Move[] = []): Move[] {
  if (n === 0) return out;
  hanoiSolve(n - 1, from, via, to, out);
  out.push([from, to]);
  hanoiSolve(n - 1, via, to, from, out);
  return out;
}

/** Breadth-first search over light presses (each light pressed at most once). */
function lightsSolve(board: boolean[], n: number): number[] | null {
  const cells = n * n;
  for (let k = 0; k <= Math.min(cells, 10); k++) {
    const pick = (start: number, left: number, b: boolean[], chosen: number[]): number[] | null => {
      if (left === 0) return b.every((x) => !x) ? chosen : null;
      for (let i = start; i < cells; i++) {
        const r = pick(i + 1, left - 1, lightsToggle(b, n, i), [...chosen, i]);
        if (r) return r;
      }
      return null;
    };
    const r = pick(0, k, board, []);
    if (r) return r;
  }
  return null;
}

describe("logic games", () => {
  it("maps class and tier to levels 0–6", () => {
    expect(levelFor(3, "normal")).toBe(0);
    expect(levelFor(3, "easy")).toBe(0);
    expect(levelFor(8, "normal")).toBe(5);
    expect(levelFor(8, "challenge")).toBe(6);
    expect(levelFor(6, "easy")).toBe(2);
  });

  it("makes Sudokus with one answer, at every level", () => {
    for (let level = 0; level <= 6; level++) {
      for (const s of seeds.slice(0, level >= 5 ? 2 : 4)) {
        const p = makeSudoku(s, level);
        expect(checkSudoku(p, p.solution)).toBe(true);
        expect(p.givens.filter(Boolean).length).toBeGreaterThanOrEqual(LEVELS.SUDOKU[level].givens);
        expect(p.givens.filter(Boolean).length).toBeLessThan(p.n * p.n);
        const wrong = [...p.solution];
        const i = p.givens.indexOf(0);
        wrong[i] = (wrong[i] % p.n) + 1;
        expect(checkSudoku(p, wrong)).toBe(false);
        expect(makeSudoku(s, level).givens).toEqual(p.givens); // same seed, same puzzle
      }
    }
  });

  it("accepts the optimal Tower of Hanoi solution and rejects illegal moves", () => {
    for (let level = 0; level <= 6; level++) {
      const moves = hanoiSolve(LEVELS.HANOI[level].discs);
      expect(moves.length).toBe(hanoiPar(level));
      expect(checkHanoi(level, moves)).toBe(true);
      expect(verifyGame("HANOI", "abcdefg", level, moves)).toEqual({ moves: moves.length, onPar: true });
    }
    expect(hanoiMove(hanoiStart(3), [0, 1])).not.toBeNull();
    const after = hanoiMove(hanoiStart(3), [0, 1])!;
    expect(hanoiMove(after, [0, 1])).toBeNull(); // bigger disc on smaller
    expect(checkHanoi(0, [[0, 2]])).toBe(false);
  });

  it("makes solvable Lights Out boards", () => {
    for (let level = 0; level <= 3; level++) {
      for (const s of seeds) {
        const p = makeLights(s, level);
        expect(p.board.some(Boolean)).toBe(true);
        const sol = lightsSolve(p.board, p.n)!;
        expect(sol).not.toBeNull();
        expect(sol.length).toBeLessThanOrEqual(p.par);
        expect(checkLights(s, level, sol)).toBe(true);
        expect(checkLights(s, level, [])).toBe(false);
      }
    }
  });

  it("scrambles sliding tiles reversibly", () => {
    for (let level = 0; level <= 6; level++) {
      const p = makeSlide("slideseed", level);
      expect(p.tiles.length).toBe(p.n * p.n);
      expect(new Set(p.tiles).size).toBe(p.n * p.n);
      expect(checkSlide("slideseed", level, [])).toBe(false);
    }
    // A board one slide from solved: move the tile left of the gap back.
    const solved = [1, 2, 3, 4, 5, 6, 7, 8, 0];
    const oneOff = slideTile(solved, 3, 7)!;
    expect(slideTile(oneOff, 3, 8)).toEqual(solved);
    expect(slideTile(solved, 3, 0)).toBeNull();
  });

  it("gives correct code-breaker clues and checks the last guess", () => {
    expect(codeClue([1, 2, 3], [1, 3, 4])).toEqual({ exact: 1, near: 1 });
    expect(codeClue([5, 0, 9, 2], [2, 9, 0, 5])).toEqual({ exact: 0, near: 4 });
    for (let level = 0; level <= 6; level++) {
      const p = makeCode("codeseed1", level);
      expect(new Set(p.secret).size).toBe(p.len);
      const other = p.pool.filter((d) => !p.secret.includes(d));
      const miss = [...p.secret].reverse();
      expect(checkCode("codeseed1", level, [miss, p.secret])).toBe(true);
      expect(checkCode("codeseed1", level, [miss])).toBe(miss.join() === p.secret.join());
      expect(checkCode("codeseed1", level, Array(p.tries + 1).fill(p.secret))).toBe(false);
      if (other.length) expect(checkCode("codeseed1", level, [[other[0], ...p.secret.slice(1)]])).toBe(false);
    }
  });

  it("rejects bad input in verifyGame", () => {
    expect(verifyGame("SUDOKU", "short", 0, [])).toBeNull();
    expect(verifyGame("SUDOKU", "abcdefgh", 9, [])).toBeNull();
    expect(verifyGame("LIGHTS", "abcdefgh", 0, "nope")).toBeNull();
  });
});
