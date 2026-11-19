// Five more logic games: Robot Coder, Picture Logic (nonogram), Water Jugs, Make the Number, Magic Square.
// Like the first five, every puzzle is made from a seed, and the server rebuilds it to check a solution.
import { rng } from "./rng";

const shuffle = <T,>(a: T[], r: () => number) => {
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};

// ---------- Robot Coder ----------
// A grid with walls, a start (facing east) and a goal. The program is a list of blocks: F (forward), L, R (turn);
// from level 2 a block can repeat (e.g. F ×3). The fewest blocks that reach the goal is the "tidy" target.
export const ROBOT_LEVELS = [
  { n: 4, walls: 3, repeat: false }, { n: 5, walls: 5, repeat: false }, { n: 5, walls: 6, repeat: true }, { n: 6, walls: 9, repeat: true },
  { n: 6, walls: 11, repeat: true }, { n: 7, walls: 15, repeat: true }, { n: 8, walls: 20, repeat: true },
] as const;
export type Dir = 0 | 1 | 2 | 3; // 0 east, 1 south, 2 west, 3 north
export type Block = [cmd: "F" | "L" | "R", times: number];
const DX = [1, 0, -1, 0], DY = [0, 1, 0, -1];

/** Fewest blocks from start to goal (breadth-first search over position and direction). */
function robotPar(n: number, wall: boolean[], start: number, goal: number, repeat: boolean) {
  const key = (p: number, d: number) => p * 4 + d;
  const dist = new Map<number, number>([[key(start, 0), 0]]);
  const q: [number, number][] = [[start, 0]];
  while (q.length) {
    const [p, d] = q.shift()!;
    const c = dist.get(key(p, d))!;
    if (p === goal) return c;
    const next: [number, number][] = [[p, (d + 3) % 4], [p, (d + 1) % 4]];
    let x = p % n, y = Math.floor(p / n);
    for (let k = 1; k <= (repeat ? n : 1); k++) {
      x += DX[d]; y += DY[d];
      if (x < 0 || y < 0 || x >= n || y >= n || wall[y * n + x]) break;
      next.push([y * n + x, d]);
    }
    for (const [np, nd] of next) if (!dist.has(key(np, nd))) { dist.set(key(np, nd), c + 1); q.push([np, nd]); }
  }
  return -1;
}

export function makeRobot(seed: string, level: number) {
  const { n, walls, repeat } = ROBOT_LEVELS[level];
  const r = rng(`robot:${seed}:${level}`);
  for (let attempt = 0; ; attempt++) {
    const wall = Array(n * n).fill(false) as boolean[];
    const start = Math.floor(r() * n) * n; // left column
    const goal = Math.floor(r() * n) * n + n - 1; // right column
    const free = shuffle(Array.from({ length: n * n }, (_, i) => i).filter((i) => i !== start && i !== goal), r);
    free.slice(0, walls).forEach((i) => (wall[i] = true));
    const par = robotPar(n, wall, start, goal, repeat);
    if (par > 0 && (par >= Math.min(4 + level, 9) || attempt > 200)) return { n, wall, start, goal, repeat, par };
  }
}

/** Runs the program. Returns the cells visited, and whether the robot crashed or reached the goal. */
export function runRobot(p: ReturnType<typeof makeRobot>, program: Block[]) {
  let pos = p.start, dir: number = 0;
  const path = [pos];
  for (const [cmd, times] of program) {
    for (let t = 0; t < times; t++) {
      if (cmd === "L") dir = (dir + 3) % 4;
      else if (cmd === "R") dir = (dir + 1) % 4;
      else {
        const x = (pos % p.n) + DX[dir], y = Math.floor(pos / p.n) + DY[dir];
        if (x < 0 || y < 0 || x >= p.n || y >= p.n || p.wall[y * p.n + x]) return { path, dir, crashed: true, reached: false };
        pos = y * p.n + x; path.push(pos);
      }
    }
  }
  return { path, dir, crashed: false, reached: pos === p.goal };
}
const validBlocks = (p: ReturnType<typeof makeRobot>, prog: unknown): prog is Block[] =>
  Array.isArray(prog) && prog.length >= 1 && prog.length <= 40 &&
  prog.every((b) => Array.isArray(b) && ["F", "L", "R"].includes(b[0]) && Number.isInteger(b[1]) && b[1] >= 1 && b[1] <= (p.repeat ? 9 : 1));

export function checkRobot(seed: string, level: number, prog: unknown) {
  const p = makeRobot(seed, level);
  if (!validBlocks(p, prog)) return null;
  const run = runRobot(p, prog);
  return run.reached ? { moves: prog.length, onPar: prog.length <= p.par } : null;
}

// ---------- Picture Logic (nonogram) ----------
export const NONO_LEVELS = [{ n: 5 }, { n: 5 }, { n: 6 }, { n: 7 }, { n: 8 }, { n: 9 }, { n: 10 }] as const;
export const lineClue = (cells: boolean[]) => {
  const out: number[] = []; let run = 0;
  for (const c of cells) { if (c) run++; else if (run) { out.push(run); run = 0; } }
  if (run) out.push(run);
  return out.length ? out : [0];
};
export function makeNonogram(seed: string, level: number) {
  const { n } = NONO_LEVELS[level];
  const r = rng(`nono:${seed}:${level}`);
  const density = 0.62 - level * 0.015;
  let grid: boolean[];
  do grid = Array.from({ length: n * n }, () => r() < density); while (grid.every((c) => !c));
  const rows = Array.from({ length: n }, (_, y) => lineClue(grid.slice(y * n, y * n + n)));
  const cols = Array.from({ length: n }, (_, x) => lineClue(Array.from({ length: n }, (_, y) => grid[y * n + x])));
  return { n, rows, cols, solution: grid };
}
/** Any shading that matches every clue counts. */
export function checkNonogram(seed: string, level: number, cells: unknown) {
  const p = makeNonogram(seed, level);
  if (!Array.isArray(cells) || cells.length !== p.n * p.n) return null;
  const g = cells.map(Boolean);
  for (let y = 0; y < p.n; y++) if (lineClue(g.slice(y * p.n, y * p.n + p.n)).join() !== p.rows[y].join()) return null;
  for (let x = 0; x < p.n; x++) if (lineClue(Array.from({ length: p.n }, (_, y) => g[y * p.n + x])).join() !== p.cols[x].join()) return null;
  return { moves: g.filter(Boolean).length, onPar: true };
}

// ---------- Water Jugs ----------
export const JUG_LEVELS = [
  { max: 5, minSteps: 2 }, { max: 6, minSteps: 3 }, { max: 7, minSteps: 4 }, { max: 9, minSteps: 5 },
  { max: 11, minSteps: 6 }, { max: 13, minSteps: 7 }, { max: 15, minSteps: 8 },
] as const;
export type JugMove = "fillA" | "fillB" | "emptyA" | "emptyB" | "AtoB" | "BtoA";
export const JUG_MOVES: JugMove[] = ["fillA", "fillB", "emptyA", "emptyB", "AtoB", "BtoA"];
export function jugStep([a, b]: [number, number], m: JugMove, A: number, B: number): [number, number] {
  switch (m) {
    case "fillA": return [A, b];
    case "fillB": return [a, B];
    case "emptyA": return [0, b];
    case "emptyB": return [a, 0];
    case "AtoB": { const t = Math.min(a, B - b); return [a - t, b + t]; }
    case "BtoA": { const t = Math.min(b, A - a); return [a + t, b - t]; }
  }
}
function jugSteps(A: number, B: number, target: number) {
  const seen = new Map<string, number>([["0,0", 0]]); const q: [number, number][] = [[0, 0]];
  while (q.length) {
    const s = q.shift()!; const d = seen.get(s.join())!;
    if (s[0] === target || s[1] === target) return d;
    for (const m of JUG_MOVES) { const t = jugStep(s, m, A, B); if (!seen.has(t.join())) { seen.set(t.join(), d + 1); q.push(t); } }
  }
  return -1;
}
export function makeJugs(seed: string, level: number) {
  const { max, minSteps } = JUG_LEVELS[level];
  const r = rng(`jugs:${seed}:${level}`);
  let best: { A: number; B: number; target: number; par: number } | null = null;
  for (let t = 0; t < 400; t++) {
    const A = 2 + Math.floor(r() * (max - 2)), B = A + 1 + Math.floor(r() * (max - A));
    if (B > max) continue;
    const target = 1 + Math.floor(r() * (B - 1));
    if (target === A) continue;
    const par = jugSteps(A, B, target);
    if (par < 0) continue;
    if (par >= minSteps) return { A, B, target, par };
    if (!best || par > best.par) best = { A, B, target, par };
  }
  return best!;
}
export function checkJugs(seed: string, level: number, moves: unknown) {
  const p = makeJugs(seed, level);
  if (!Array.isArray(moves) || !moves.length || moves.length > 60 || !moves.every((m) => JUG_MOVES.includes(m))) return null;
  let s: [number, number] = [0, 0];
  for (const m of moves as JugMove[]) s = jugStep(s, m, p.A, p.B);
  return s[0] === p.target || s[1] === p.target ? { moves: moves.length, onPar: moves.length <= p.par } : null;
}

// ---------- Make the Number ----------
export const TARGET_LEVELS = [
  { count: 3, max: 9, ops: "+-" }, { count: 3, max: 9, ops: "+-×" }, { count: 4, max: 9, ops: "+-×" }, { count: 4, max: 10, ops: "+-×÷" },
  { count: 4, max: 12, ops: "+-×÷" }, { count: 5, max: 12, ops: "+-×÷" }, { count: 5, max: 25, ops: "+-×÷" },
] as const;

/** Evaluates + − × ÷ and brackets with whole numbers only (÷ must be exact). Returns null if invalid. */
export function evalExpr(expr: string): { value: number; numbers: number[] } | null {
  const toks = expr.replace(/\s+/g, "").replace(/[x*]/g, "×").replace(/\//g, "÷").replace(/−/g, "-").match(/\d+|[-+×÷()]/g);
  if (!toks || toks.join("") !== expr.replace(/\s+/g, "").replace(/[x*]/g, "×").replace(/\//g, "÷").replace(/−/g, "-")) return null;
  let i = 0; const numbers: number[] = [];
  const atom = (): number | null => {
    const t = toks[i];
    if (t === "(") { i++; const v = sum(); if (v === null || toks[i] !== ")") return null; i++; return v; }
    if (t && /^\d+$/.test(t)) { i++; numbers.push(Number(t)); return Number(t); }
    return null;
  };
  const prod = (): number | null => {
    let v = atom(); if (v === null) return null;
    while (toks[i] === "×" || toks[i] === "÷") {
      const op = toks[i++]; const w = atom(); if (w === null) return null;
      if (op === "×") v *= w; else { if (w === 0 || v % w !== 0) return null; v /= w; }
    }
    return v;
  };
  const sum = (): number | null => {
    let v = prod(); if (v === null) return null;
    while (toks[i] === "+" || toks[i] === "-") { const op = toks[i++]; const w = prod(); if (w === null) return null; v = op === "+" ? v + w : v - w; }
    return v;
  };
  const v = sum();
  return v === null || i !== toks.length ? null : { value: v, numbers };
}
export function makeTarget(seed: string, level: number) {
  const { count, max, ops } = TARGET_LEVELS[level];
  const r = rng(`target:${seed}:${level}`);
  for (;;) {
    const nums = Array.from({ length: count }, () => 1 + Math.floor(r() * max));
    // build a target by combining the numbers left to right with random operations
    let v = nums[0], ok = true, answer = String(nums[0]);
    for (const x of nums.slice(1)) {
      let op = ops[Math.floor(r() * ops.length)] as string;
      if (op === "÷" && (x === 0 || v % x !== 0)) op = "+";
      if (op === "+") v += x; else if (op === "-") v = v - x; else if (op === "×") v *= x; else v /= x;
      answer = `(${answer})${op}${x}`; // one way to make it (kept for checking; never shown before solving)
      if (v <= 0 || v > 200) { ok = false; break; }
    }
    if (ok && v > max && !nums.includes(v)) return { numbers: shuffle([...nums], r), target: v, ops, answer };
  }
}
/** Each given number can be used at most once; using all of them is the "tidy" solution. */
export function checkTarget(seed: string, level: number, expr: unknown) {
  const p = makeTarget(seed, level);
  if (typeof expr !== "string" || expr.length > 80) return null;
  const e = evalExpr(expr);
  if (!e || e.value !== p.target) return null;
  const left = [...p.numbers];
  for (const n of e.numbers) { const k = left.indexOf(n); if (k < 0) return null; left.splice(k, 1); }
  const norm = expr.replace(/[x*]/g, "×").replace(/\//g, "÷");
  if ((/×/.test(norm) && !p.ops.includes("×")) || (/÷/.test(norm) && !p.ops.includes("÷"))) return null; // only this level's operations
  return { moves: e.numbers.length, onPar: left.length === 0 };
}

// ---------- Magic Square ----------
export const MAGIC_LEVELS = [{ n: 3, givens: 5 }, { n: 3, givens: 4 }, { n: 3, givens: 3 }, { n: 3, givens: 2 }, { n: 4, givens: 10 }, { n: 4, givens: 8 }, { n: 4, givens: 7 }] as const;
const BASE3 = [2, 7, 6, 9, 5, 1, 4, 3, 8];
const BASE4 = (() => { const g = Array.from({ length: 16 }, (_, i) => i + 1); for (let i = 0; i < 4; i++) { g[i * 4 + i] = 17 - g[i * 4 + i]; g[i * 4 + 3 - i] = 17 - g[i * 4 + 3 - i]; } return g; })();
function symmetries(g: number[], n: number) {
  const at = (x: number, y: number) => g[y * n + x];
  const tf = [(x: number, y: number) => at(x, y), (x: number, y: number) => at(n - 1 - y, x), (x: number, y: number) => at(n - 1 - x, n - 1 - y), (x: number, y: number) => at(y, n - 1 - x)];
  const out: number[][] = [];
  for (const f of tf) for (const flip of [false, true]) out.push(Array.from({ length: n * n }, (_, i) => f(flip ? n - 1 - (i % n) : i % n, Math.floor(i / n))));
  return out;
}
export const magicSum = (n: number) => (n * (n * n + 1)) / 2;
export function makeMagic(seed: string, level: number) {
  const { n, givens } = MAGIC_LEVELS[level];
  const r = rng(`magic:${seed}:${level}`);
  const all = symmetries(n === 3 ? BASE3 : BASE4, n);
  const solution = all[Math.floor(r() * all.length)];
  const shown = new Set(shuffle(Array.from({ length: n * n }, (_, i) => i), r).slice(0, givens));
  return { n, sum: magicSum(n), givens: solution.map((v, i) => (shown.has(i) ? v : 0)), solution };
}
export function isMagic(g: number[], n: number) {
  const S = magicSum(n);
  if (new Set(g).size !== n * n || g.some((v) => !(v >= 1 && v <= n * n))) return false;
  for (let k = 0; k < n; k++) {
    let row = 0, col = 0;
    for (let j = 0; j < n; j++) { row += g[k * n + j]; col += g[j * n + k]; }
    if (row !== S || col !== S) return false;
  }
  let d1 = 0, d2 = 0;
  for (let k = 0; k < n; k++) { d1 += g[k * n + k]; d2 += g[k * n + n - 1 - k]; }
  return d1 === S && d2 === S;
}
export function checkMagic(seed: string, level: number, grid: unknown) {
  const p = makeMagic(seed, level);
  if (!Array.isArray(grid) || grid.length !== p.n * p.n) return null;
  const g = grid.map(Number);
  if (p.givens.some((v, i) => v && g[i] !== v) || !isMagic(g, p.n)) return null;
  return { moves: p.givens.filter((v) => !v).length, onPar: true };
}
