import { describe, expect, it } from "vitest";
import {
  ROBOT_LEVELS, makeRobot, runRobot, checkRobot, type Block, makeNonogram, checkNonogram, lineClue,
  makeJugs, checkJugs, jugStep, JUG_MOVES, type JugMove, makeTarget, checkTarget, evalExpr, makeMagic, checkMagic, isMagic, verifyGame, GAMES,
} from "../games";

const seeds = ["s1abcde", "zz99kk11", "seed-777", "q1w2e3r4", "lmnopqr"];

/** Breadth-first search for a shortest block program (repeat blocks allowed when the level allows). */
function solveRobot(p: ReturnType<typeof makeRobot>): Block[] {
  const DX = [1, 0, -1, 0], DY = [0, 1, 0, -1];
  const start = `${p.start},0`; const prev = new Map<string, [string, Block] | null>([[start, null]]); const q = [start];
  while (q.length) {
    const k = q.shift()!; const [pos, d] = k.split(",").map(Number);
    if (pos === p.goal) { const out: Block[] = []; let c = k; while (prev.get(c)) { const [pk, b] = prev.get(c)!; out.unshift(b); c = pk; } return out; }
    const nexts: [string, Block][] = [[`${pos},${(d + 3) % 4}`, ["L", 1]], [`${pos},${(d + 1) % 4}`, ["R", 1]]];
    let x = pos % p.n, y = Math.floor(pos / p.n);
    for (let t = 1; t <= (p.repeat ? 9 : 1); t++) { x += DX[d]; y += DY[d]; if (x < 0 || y < 0 || x >= p.n || y >= p.n || p.wall[y * p.n + x]) break; nexts.push([`${y * p.n + x},${d}`, ["F", t]]); }
    for (const [nk, b] of nexts) if (!prev.has(nk)) { prev.set(nk, [k, b]); q.push(nk); }
  }
  throw new Error("unsolvable");
}
function solveJugs(A: number, B: number, target: number): JugMove[] {
  const prev = new Map<string, [string, JugMove] | null>([["0,0", null]]); const q: [number, number][] = [[0, 0]];
  while (q.length) {
    const s = q.shift()!;
    if (s[0] === target || s[1] === target) { const out: JugMove[] = []; let c = s.join(); while (prev.get(c)) { const [pk, m] = prev.get(c)!; out.unshift(m); c = pk; } return out; }
    for (const m of JUG_MOVES) { const t = jugStep(s, m, A, B); if (!prev.has(t.join())) { prev.set(t.join(), [s.join(), m]); q.push(t); } }
  }
  throw new Error("unsolvable");
}

describe("more logic games", () => {
  it("lists ten games", () => expect(Object.keys(GAMES).length).toBe(10));

  it("Robot Coder puzzles are solvable at every level; the shortest program is on par", () => {
    for (let level = 0; level < ROBOT_LEVELS.length; level++) for (const s of seeds) {
      const p = makeRobot(s, level);
      const prog = solveRobot(p);
      expect(prog.length).toBe(p.par);
      expect(checkRobot(s, level, prog)).toEqual({ moves: prog.length, onPar: true });
      expect(verifyGame("ROBOT", s, level, prog)).not.toBeNull();
      expect(checkRobot(s, level, [["F", 99]])).toBeNull();
      if (!p.repeat) expect(checkRobot(s, level, [["F", 2]])).toBeNull(); // no repeat blocks yet
    }
    const p = makeRobot("s1abcde", 0);
    expect(runRobot(p, [["L", 1], ["F", 1]]).path.length).toBeGreaterThanOrEqual(1);
  });

  it("Picture Logic accepts the solution and rejects a wrong shading", () => {
    expect(lineClue([true, true, false, true])).toEqual([2, 1]);
    expect(lineClue([false, false])).toEqual([0]);
    for (let level = 0; level <= 6; level++) for (const s of seeds) {
      const p = makeNonogram(s, level);
      expect(checkNonogram(s, level, p.solution)).not.toBeNull();
      const wrong = [...p.solution]; wrong[0] = !wrong[0];
      expect(checkNonogram(s, level, wrong)).toBeNull();
    }
  });

  it("Water Jugs puzzles are solvable; the shortest solution is on par", () => {
    for (let level = 0; level <= 6; level++) for (const s of seeds) {
      const p = makeJugs(s, level);
      const sol = solveJugs(p.A, p.B, p.target);
      expect(sol.length).toBe(p.par);
      expect(checkJugs(s, level, sol)).toEqual({ moves: sol.length, onPar: true });
      expect(checkJugs(s, level, ["fillA"])).toBe(p.A === p.target ? expect.anything() : null);
    }
  });

  it("Make the Number: the built answer works, cards are used once, ÷ must be exact", () => {
    expect(evalExpr("(3+4)×2")).toEqual({ value: 14, numbers: [3, 4, 2] });
    expect(evalExpr("7÷2")).toBeNull();
    expect(evalExpr("3++4")).toBeNull();
    for (let level = 0; level <= 6; level++) for (const s of seeds) {
      const p = makeTarget(s, level);
      expect(evalExpr(p.answer)!.value).toBe(p.target);
      expect(checkTarget(s, level, p.answer)).toEqual({ moves: p.numbers.length, onPar: true });
      expect(checkTarget(s, level, `${p.target}`)).toBeNull(); // the target is not a card
      expect(checkTarget(s, level, `${p.numbers[0]}+${p.numbers[0]}+${p.numbers[0]}+${p.numbers[0]}+${p.numbers[0]}+${p.numbers[0]}`)).toBeNull();
    }
    expect(checkTarget("s1abcde", 0, "2×3")).toBeNull(); // level 0 has no ×
  });

  it("Magic Square puzzles keep their givens and every solution is magic", () => {
    for (let level = 0; level <= 6; level++) for (const s of seeds) {
      const p = makeMagic(s, level);
      expect(isMagic(p.solution, p.n)).toBe(true);
      expect(checkMagic(s, level, p.solution)).not.toBeNull();
      expect(checkMagic(s, level, p.givens)).toBeNull();
    }
  });
});
