// Logic games: puzzle generators and solution checkers. Pure functions, shared by the browser (to play) and the
// server (to rebuild the puzzle from its seed and check the solution before giving XP).

export type GameId = "SUDOKU" | "HANOI" | "LIGHTS" | "SLIDE" | "CODE";
export type Tier = "easy" | "normal" | "challenge";

export const GAMES: Record<GameId, { name: string; icon: string; blurb: string; skill: string; how: string[] }> = {
  SUDOKU: {
    name: "Sudoku",
    icon: "🔢",
    blurb: "Fill the grid so every row, column and box has each number once.",
    skill: "Logical reasoning",
    how: ["Every row, every column and every thick-bordered box must contain each number exactly once.", "Tap a square, then tap a number. Tap ✕ to clear it.", "Look for a square where only one number can fit."],
  },
  HANOI: {
    name: "Tower of Hanoi",
    icon: "🗼",
    blurb: "Move the whole tower to the last peg, one disc at a time.",
    skill: "Algorithmic thinking",
    how: ["Move all the discs to the right-hand peg.", "Move one disc at a time: tap a peg to pick up its top disc, then tap the peg to put it on.", "A bigger disc can never go on a smaller one.", "The fewest moves for n discs is 2ⁿ − 1. Can you find the pattern?"],
  },
  LIGHTS: {
    name: "Lights Out",
    icon: "💡",
    blurb: "Switch every light off. Each tap flips a light and its neighbours.",
    skill: "Pattern recognition",
    how: ["Tapping a light switches it and the lights above, below, left and right of it (on ↔ off).", "Turn every light off.", "Tapping the same light twice undoes it, so the order of taps does not matter."],
  },
  SLIDE: {
    name: "Sliding tiles",
    icon: "🧩",
    blurb: "Slide the tiles back into order, 1 to the last number.",
    skill: "Decomposition",
    how: ["Tap a tile next to the gap to slide it.", "Put the numbers in order, left to right and top to bottom, with the gap at the end.", "Solve the top row first, then the next, one part at a time."],
  },
  CODE: {
    name: "Code breaker",
    icon: "🔐",
    blurb: "Crack the secret code using clues after each guess.",
    skill: "Deduction",
    how: ["The secret code uses different digits (no digit twice).", "After each guess: 🟢 = right digit in the right place, 🟡 = right digit in the wrong place.", "Use the clues from all your guesses to work out the code before you run out of tries."],
  },
};

export const TIERS: Record<Tier, { label: string; shift: number }> = { easy: { label: "Easy", shift: -1 }, normal: { label: "Normal", shift: 0 }, challenge: { label: "Challenge", shift: 1 } };

/** Level 0–6: Class 3 normal = 0 … Class 8 normal = 5; Easy/Challenge move one level down/up. */
export function levelFor(classLevel: number, tier: Tier) {
  return Math.max(0, Math.min(6, classLevel - 3 + TIERS[tier].shift));
}

export const LEVELS = {
  SUDOKU: [{ n: 4, givens: 8 }, { n: 4, givens: 6 }, { n: 4, givens: 5 }, { n: 6, givens: 16 }, { n: 6, givens: 13 }, { n: 9, givens: 36 }, { n: 9, givens: 30 }],
  HANOI: [{ discs: 3 }, { discs: 3 }, { discs: 4 }, { discs: 4 }, { discs: 5 }, { discs: 5 }, { discs: 6 }],
  LIGHTS: [{ n: 3, taps: 3 }, { n: 3, taps: 5 }, { n: 4, taps: 5 }, { n: 4, taps: 7 }, { n: 5, taps: 6 }, { n: 5, taps: 8 }, { n: 5, taps: 10 }],
  SLIDE: [{ n: 3, scramble: 8 }, { n: 3, scramble: 14 }, { n: 3, scramble: 22 }, { n: 3, scramble: 34 }, { n: 4, scramble: 30 }, { n: 4, scramble: 45 }, { n: 4, scramble: 60 }],
  CODE: [{ len: 3, digits: 4, tries: 8 }, { len: 3, digits: 5, tries: 8 }, { len: 3, digits: 10, tries: 10 }, { len: 4, digits: 6, tries: 10 }, { len: 4, digits: 10, tries: 10 }, { len: 4, digits: 10, tries: 8 }, { len: 5, digits: 10, tries: 10 }],
} as const;

/** XP for a solved game (before the daily limit): more for harder levels, a bonus for a tidy solution. */
export function gameXp(level: number, onPar: boolean) {
  return 8 + level * 2 + (onPar ? 5 : 0);
}
export const DAILY_XP_GAMES = 5;

// ---------- Seeded random numbers ----------
export function rng(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const shuffle = <T,>(a: T[], r: () => number) => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
export const newSeed = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

// ---------- Sudoku ----------
export type Sudoku = { n: number; bh: number; bw: number; givens: number[]; solution: number[] }; // 0 = empty
const boxDims = (n: number) => (n === 4 ? [2, 2] : n === 6 ? [2, 3] : [3, 3]);

function countSolutions(grid: number[], n: number, bh: number, bw: number, limit = 2): number {
  const i = grid.indexOf(0);
  if (i < 0) return 1;
  const r = Math.floor(i / n), c = i % n;
  let found = 0;
  for (let v = 1; v <= n && found < limit; v++) {
    if (!canPlace(grid, n, bh, bw, r, c, v)) continue;
    grid[i] = v;
    found += countSolutions(grid, n, bh, bw, limit - found);
    grid[i] = 0;
  }
  return found;
}
function canPlace(g: number[], n: number, bh: number, bw: number, r: number, c: number, v: number) {
  for (let k = 0; k < n; k++) if (g[r * n + k] === v || g[k * n + c] === v) return false;
  const r0 = r - (r % bh), c0 = c - (c % bw);
  for (let y = r0; y < r0 + bh; y++) for (let x = c0; x < c0 + bw; x++) if (g[y * n + x] === v) return false;
  return true;
}

export function makeSudoku(seed: string, level: number): Sudoku {
  const { n, givens } = LEVELS.SUDOKU[level];
  const [bh, bw] = boxDims(n);
  const r = rng(`sudoku:${seed}:${level}`);
  // A valid grid from the standard pattern, then shuffled: digits, rows inside bands, bands, columns inside stacks, stacks.
  const digits = shuffle(Array.from({ length: n }, (_, i) => i + 1), r);
  const bandOrder = shuffle(Array.from({ length: n / bh }, (_, i) => i), r);
  const rows = bandOrder.flatMap((b) => shuffle(Array.from({ length: bh }, (_, i) => b * bh + i), r));
  const stackOrder = shuffle(Array.from({ length: n / bw }, (_, i) => i), r);
  const cols = stackOrder.flatMap((s) => shuffle(Array.from({ length: bw }, (_, i) => s * bw + i), r));
  const pattern = (y: number, x: number) => (bw * (y % bh) + Math.floor(y / bh) + x) % n;
  const solution = rows.flatMap((y) => cols.map((x) => digits[pattern(y, x)]));
  // Remove numbers one at a time while the puzzle still has exactly one answer.
  const grid = [...solution];
  let filled = n * n;
  for (const i of shuffle(Array.from({ length: n * n }, (_, k) => k), r)) {
    if (filled <= givens) break;
    const keep = grid[i];
    grid[i] = 0;
    if (countSolutions([...grid], n, bh, bw) !== 1) grid[i] = keep;
    else filled--;
  }
  return { n, bh, bw, givens: grid, solution };
}

/** True when `answer` fills the puzzle correctly (any valid completion counts). */
export function checkSudoku(p: Sudoku, answer: number[]) {
  if (!Array.isArray(answer) || answer.length !== p.n * p.n) return false;
  if (p.givens.some((g, i) => g && answer[i] !== g)) return false;
  const g = answer.map(Number);
  for (let i = 0; i < g.length; i++) {
    const v = g[i];
    if (!(v >= 1 && v <= p.n)) return false;
    g[i] = 0;
    const ok = canPlace(g, p.n, p.bh, p.bw, Math.floor(i / p.n), i % p.n, v);
    g[i] = v;
    if (!ok) return false;
  }
  return true;
}

// ---------- Tower of Hanoi ----------
export type Move = [number, number];
export function hanoiStart(discs: number): number[][] {
  return [Array.from({ length: discs }, (_, i) => discs - i), [], []]; // bottom → top
}
/** Applies a move; returns null if it is not allowed. */
export function hanoiMove(pegs: number[][], [from, to]: Move): number[][] | null {
  if (from === to || !pegs[from]?.length || !pegs[to]) return null;
  const disc = pegs[from][pegs[from].length - 1];
  const top = pegs[to][pegs[to].length - 1];
  if (top !== undefined && top < disc) return null;
  const next = pegs.map((p) => [...p]);
  next[from].pop();
  next[to].push(disc);
  return next;
}
export function checkHanoi(level: number, moves: Move[]) {
  const discs = LEVELS.HANOI[level].discs;
  let pegs: number[][] | null = hanoiStart(discs);
  for (const m of moves) {
    pegs = hanoiMove(pegs!, m);
    if (!pegs) return false;
  }
  return pegs![2].length === discs;
}
export const hanoiPar = (level: number) => 2 ** LEVELS.HANOI[level].discs - 1;

// ---------- Lights Out ----------
export function lightsToggle(board: boolean[], n: number, i: number) {
  const next = [...board];
  const r = Math.floor(i / n), c = i % n;
  for (const [y, x] of [[r, c], [r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]]) if (y >= 0 && y < n && x >= 0 && x < n) next[y * n + x] = !next[y * n + x];
  return next;
}
/** Made by pressing random lights on a dark board, so it is always solvable in `taps` presses or fewer. */
export function makeLights(seed: string, level: number) {
  const { n, taps } = LEVELS.LIGHTS[level];
  const r = rng(`lights:${seed}:${level}`);
  let board = Array(n * n).fill(false) as boolean[];
  const presses = shuffle(Array.from({ length: n * n }, (_, i) => i), r).slice(0, taps);
  for (const p of presses) board = lightsToggle(board, n, p);
  if (board.every((b) => !b)) board = lightsToggle(board, n, 0);
  return { n, board, par: taps };
}
export function checkLights(seed: string, level: number, taps: number[]) {
  const p = makeLights(seed, level);
  let b = p.board;
  for (const t of taps) {
    if (!(t >= 0 && t < p.n * p.n)) return false;
    b = lightsToggle(b, p.n, t);
  }
  return b.every((x) => !x);
}

// ---------- Sliding tiles ----------
/** Tiles row by row; 0 is the gap. Scrambled by legal slides from the solved position, so it is always solvable. */
export function makeSlide(seed: string, level: number) {
  const { n, scramble } = LEVELS.SLIDE[level];
  const r = rng(`slide:${seed}:${level}`);
  const solved = [...Array.from({ length: n * n - 1 }, (_, i) => i + 1), 0];
  let tiles = [...solved];
  let last = -1;
  for (let k = 0; k < scramble || tiles.every((t, i) => t === solved[i]); k++) {
    const gap = tiles.indexOf(0);
    const options = slideNeighbours(gap, n).filter((x) => x !== last);
    const pick = options[Math.floor(r() * options.length)];
    last = gap;
    tiles = slideTile(tiles, n, pick)!;
  }
  return { n, tiles, par: scramble };
}
export function slideNeighbours(i: number, n: number) {
  const r = Math.floor(i / n), c = i % n;
  return [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].filter(([y, x]) => y >= 0 && y < n && x >= 0 && x < n).map(([y, x]) => y * n + x);
}
/** Slides the tile at `i` into the gap; null if it is not next to the gap. */
export function slideTile(tiles: number[], n: number, i: number) {
  const gap = tiles.indexOf(0);
  if (!slideNeighbours(gap, n).includes(i)) return null;
  const next = [...tiles];
  [next[gap], next[i]] = [next[i], 0];
  return next;
}
export function checkSlide(seed: string, level: number, moves: number[]) {
  const p = makeSlide(seed, level);
  let t: number[] | null = p.tiles;
  for (const m of moves) {
    t = slideTile(t!, p.n, m);
    if (!t) return false;
  }
  return t!.every((v, i) => v === (i === t!.length - 1 ? 0 : i + 1));
}

// ---------- Code breaker ----------
export function makeCode(seed: string, level: number) {
  const { len, digits, tries } = LEVELS.CODE[level];
  const r = rng(`code:${seed}:${level}`);
  const pool = digits === 10 ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] : Array.from({ length: digits }, (_, i) => i + 1);
  return { len, pool, tries, secret: shuffle([...pool], r).slice(0, len) };
}
export function codeClue(secret: number[], guess: number[]) {
  let exact = 0, near = 0;
  guess.forEach((g, i) => {
    if (secret[i] === g) exact++;
    else if (secret.includes(g)) near++;
  });
  return { exact, near };
}
export function validGuess(p: { len: number; pool: number[] }, g: number[]) {
  return Array.isArray(g) && g.length === p.len && new Set(g).size === g.length && g.every((d) => p.pool.includes(d));
}
export function checkCode(seed: string, level: number, guesses: number[][]) {
  const p = makeCode(seed, level);
  if (!guesses.length || guesses.length > p.tries || !guesses.every((g) => validGuess(p, g))) return false;
  return codeClue(p.secret, guesses[guesses.length - 1]).exact === p.len;
}
export const codePar = (level: number) => Math.ceil(LEVELS.CODE[level].tries / 2);

// ---------- One entry point for the server ----------
/** Checks a submitted solution. Returns the number of moves, or null if it does not solve the puzzle. */
export function verifyGame(game: GameId, seed: string, level: number, solution: unknown): { moves: number; onPar: boolean } | null {
  if (!(level >= 0 && level <= 6) || typeof seed !== "string" || seed.length < 6 || seed.length > 40) return null;
  const arr = Array.isArray(solution) ? solution : null;
  if (!arr) return null;
  switch (game) {
    case "SUDOKU": {
      const p = makeSudoku(seed, level);
      return checkSudoku(p, arr as number[]) ? { moves: p.givens.filter((g) => !g).length, onPar: true } : null;
    }
    case "HANOI":
      return checkHanoi(level, arr as Move[]) ? { moves: arr.length, onPar: arr.length <= hanoiPar(level) } : null;
    case "LIGHTS":
      return checkLights(seed, level, arr as number[]) ? { moves: arr.length, onPar: arr.length <= LEVELS.LIGHTS[level].taps } : null;
    case "SLIDE":
      return checkSlide(seed, level, arr as number[]) ? { moves: arr.length, onPar: arr.length <= LEVELS.SLIDE[level].scramble } : null;
    case "CODE":
      return checkCode(seed, level, arr as number[][]) ? { moves: arr.length, onPar: arr.length <= codePar(level) } : null;
  }
  return null;
}
export const isGame = (g: string): g is GameId => g in GAMES;
