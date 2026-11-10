// Picture question families. Each builds a colourful figure spec (src/lib/figures.ts) and computes the answer.
import { type Family, type D, int, pick, sample, textOptions, NAMES } from "./util";
import { type Cell, type Colour, type Fig, flipH, flipV, rotCW, rotCCW, rot180, cellKey, shortestPath } from "../../../src/lib/figures";

const BRIGHT: Colour[] = ["red", "orange", "yellow", "green", "teal", "blue", "purple", "pink"];
// Colours that look alike are kept in one group, so any colours picked together are easy to tell apart.
const GROUPS: Colour[][] = [["red", "pink"], ["orange", "yellow"], ["green", "teal"], ["blue"], ["purple"]];
const distinct = (r: () => number, n: number): Colour[] => sample(r, GROUPS, n).map((g) => pick(r, g));

/** Random connected shape of k cells on an n×n grid. */
function blob(r: () => number, n: number, k: number, colours: Colour[]): Cell[] {
  const cells = new Map<string, [number, number]>();
  const start: [number, number] = [int(r, 0, n - 1), int(r, 0, n - 1)];
  cells.set(start.join(","), start);
  let guard = 0;
  while (cells.size < k && guard++ < 500) {
    const [cr, cc] = pick(r, [...cells.values()]);
    const [dr, dc] = pick(r, [[1, 0], [-1, 0], [0, 1], [0, -1]]);
    const nr = cr + dr, nc = cc + dc;
    if (nr >= 0 && nc >= 0 && nr < n && nc < n) cells.set(`${nr},${nc}`, [nr, nc]);
  }
  return [...cells.values()].map(([a, b], i) => [a, b, colours[i % colours.length]] as Cell);
}

/** A shape whose given transforms all look different from each other (so the options are unambiguous). */
function chiralBlob(r: () => number, n: number, k: number, colours: Colour[], transforms: ((n: number, c: Cell[]) => Cell[])[]): Cell[] | null {
  for (let t = 0; t < 60; t++) {
    const b = blob(r, n, k, colours);
    const keys = [cellKey(b), ...transforms.map((f) => cellKey(f(n, b)))];
    if (new Set(keys).size === keys.length) return b;
  }
  return null;
}

const px = (n: number, cells: Cell[], alt: string, mirror?: "right" | "bottom" | "middle"): Fig => ({ kind: "pixels", n, cells, alt, ...(mirror ? { mirror } : {}) });
const sizeFor = (d: D): [number, number, number] => (d === 1 ? [3, 4, 2] : d === 2 ? [4, 6, 2] : [5, 8, 3]);

function pictureChoice(d: D, stem: string, fig: Fig, opts: { fig: Fig; label: string }[], solution: string, skills: string[]) {
  return { d, skills, type: "MCQ" as const, stem, figure: fig, options: opts.map((o) => o.label), optionFigures: opts.map((o) => o.fig), answer: 0, solution };
}

// ---------- Mirror, water, turn ----------
export const mirrorPicture: Family = {
  id: "pic-mirror", ds: [1, 2, 3],
  make(c, d) {
    const [n, k, nc] = sizeFor(d);
    const cols = distinct(c.r, nc);
    const b = chiralBlob(c.r, n, k, cols, [flipH, flipV, rot180]);
    if (!b) return null;
    const choice = (cells: Cell[], label: string) => ({ fig: px(n, cells, "Picture choice"), label });
    return pictureChoice(d, "The picture is held in front of a **mirror** (on its right). Which picture shows its **mirror image**?", px(n, b, "A coloured grid picture next to a mirror", "right"),
      [choice(flipH(n, b), "the mirror image (flipped left to right)"), choice(b, "the same picture, not flipped"), choice(flipV(n, b), "flipped upside down"), choice(rot180(n, b), "turned halfway round")],
      "A mirror swaps left and right but keeps top and bottom the same. Squares near the mirror stay near the mirror.", ["ABSTRACT"]);
  },
};

export const waterPicture: Family = {
  id: "pic-water", ds: [2, 3],
  make(c, d) {
    const [n, k, nc] = sizeFor(d);
    const b = chiralBlob(c.r, n, k, distinct(c.r, nc), [flipH, flipV, rot180]);
    if (!b) return null;
    const choice = (cells: Cell[], label: string) => ({ fig: px(n, cells, "Picture choice"), label });
    return pictureChoice(d, "The picture is just above still **water**. Which picture shows its **water image** (its reflection in the water)?", px(n, b, "A coloured grid picture above water", "bottom"),
      [choice(flipV(n, b), "the water image (flipped top to bottom)"), choice(flipH(n, b), "flipped left to right (a mirror image)"), choice(b, "the same picture"), choice(rot180(n, b), "turned halfway round")],
      "Water flips a picture upside down: the top row becomes the bottom row, but left stays left and right stays right.", ["ABSTRACT"]);
  },
};

export const rotatePicture: Family = {
  id: "pic-rotate", ds: [2, 3],
  make(c, d) {
    const [n, k, nc] = sizeFor(d);
    const b = chiralBlob(c.r, n, k, distinct(c.r, nc), [rotCW, rotCCW, flipH, rot180]);
    if (!b) return null;
    const half = d === 3 && c.r() < 0.4;
    const choice = (cells: Cell[], label: string) => ({ fig: px(n, cells, "Picture choice"), label });
    const opts = half
      ? [choice(rot180(n, b), "turned halfway round"), choice(rotCW(n, b), "a quarter turn clockwise"), choice(flipV(n, b), "flipped upside down"), choice(flipH(n, b), "flipped left to right")]
      : [choice(rotCW(n, b), "a quarter turn clockwise"), choice(rotCCW(n, b), "a quarter turn anticlockwise"), choice(flipH(n, b), "flipped left to right"), choice(rot180(n, b), "turned halfway round")];
    if (new Set(opts.map((o) => cellKey((o.fig as { cells: Cell[] }).cells))).size < 4) return null;
    return pictureChoice(d, half ? "The picture is turned **halfway round** (a half turn). Which picture shows the result?" : "The picture is turned a **quarter turn clockwise** ↻ (like a clock's hand from 12 to 3). Which picture shows the result?", px(n, b, "A coloured grid picture"),
      opts, half ? "A half turn moves the top row to the bottom and reverses it — the same as turning twice by a quarter." : "In a quarter turn clockwise, the top row becomes the right-hand column, read from top to bottom.", ["ABSTRACT", "ALGORITHMIC"]);
  },
};

export const symmetryComplete: Family = {
  id: "pic-symmetry-complete", ds: [2, 3],
  make(c, d) {
    const n = 6, k = d === 2 ? 5 : 8;
    const cols = distinct(c.r, 2);
    const left = new Map<string, Cell>();
    while (left.size < k) { const r0 = int(c.r, 0, n - 1), c0 = int(c.r, 0, n / 2 - 1); left.set(`${r0},${c0}`, [r0, c0, cols[left.size % cols.length]]); }
    const leftCells = [...left.values()];
    const mirrored = flipH(n, leftCells);
    const already = sample(c.r, mirrored, int(c.r, 1, Math.max(1, k - 3)));
    const missing = k - already.length;
    return { d, skills: ["ABSTRACT", "DECOMPOSITION"], type: "NUMERIC", stem: "The dotted purple line is a **line of symmetry**. Some squares on the right are already coloured. How many **more** squares must be coloured on the right so that both halves match?", figure: px(n, [...leftCells, ...already], "A half-coloured grid with a line of symmetry down the middle", "middle"), answer: missing, solution: `The left half has ${k} coloured squares, so the right half needs the same ${k} (mirrored). ${already.length} ${already.length === 1 ? "is" : "are"} already coloured, so ${k} − ${already.length} = ${missing} more.`, hint: "Count the left side, then the matching squares already on the right." };
  },
};

export const oddMirror: Family = {
  id: "pic-odd-one-out", ds: [3],
  make(c, d) {
    const n = 4;
    const b = chiralBlob(c.r, n, 5, distinct(c.r, 2), [rotCW, rot180, rotCCW, flipH]);
    if (!b) return null;
    const rots = [b, rotCW(n, b), rot180(n, b), rotCCW(n, b)];
    const flipped = flipH(n, b);
    if (rots.some((x) => cellKey(x) === cellKey(flipped))) return null;
    const keep = sample(c.r, [0, 1, 2, 3], 3);
    const choice = (cells: Cell[], label: string) => ({ fig: px(n, cells, "Picture choice"), label });
    return { d, skills: ["ABSTRACT", "EVALUATION"], type: "MCQ", stem: "Three of these pictures are the **same picture turned** round. One is **flipped** (a mirror image). Which one is different?", options: ["the flipped (mirror) picture", ...keep.map((i) => ["the picture as it is", "turned a quarter clockwise", "turned halfway", "turned a quarter anticlockwise"][i])], optionFigures: [choice(flipped, "").fig, ...keep.map((i) => choice(rots[i], "").fig)], answer: 0, solution: "Turning a picture never changes which way round it is. A flipped (mirror) picture cannot be turned to match the others." };
  },
};

// ---------- Grids and maps ----------
const OBJECTS = [["🍎", "the apple"], ["⭐", "the star"], ["🌳", "the tree"], ["🏠", "the house"], ["🎈", "the balloon"], ["🍌", "the banana"], ["⚽", "the ball"], ["🌸", "the flower"]];
const ARROW = { U: "⬆", D: "⬇", L: "⬅", R: "➡" } as const;
export const gridRobot: Family = {
  id: "pic-grid-robot", ds: [1, 2, 3],
  make(c, d) {
    const rows = 5, cols = 5;
    const start: [number, number] = [int(c.r, 1, 3), int(c.r, 0, 2)];
    let [r, col] = start;
    const path: [number, number][] = [[r, col]];
    let text = "";
    const step = (dr: number, dc: number) => { r += dr; col += dc; path.push([r, col]); };
    if (d === 3) {
      let facing = 0; // 0 N, 1 E, 2 S, 3 W
      const cmds: string[] = [];
      for (let i = 0; i < 3; i++) {
        const f = int(c.r, 1, 2);
        const [dr, dc] = [[-1, 0], [0, 1], [1, 0], [0, -1]][facing];
        const nr = r + dr * f, nc = col + dc * f;
        if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) { facing = (facing + 1) % 4; cmds.push("Turn right"); continue; }
        for (let j = 0; j < f; j++) step(dr, dc);
        cmds.push(`Forward ${f}`);
        if (i < 2) { const t = pick(c.r, ["Turn right", "Turn left"]); facing = (facing + (t === "Turn right" ? 1 : 3)) % 4; cmds.push(t); }
      }
      text = `The robot 🤖 starts facing **North** (up) and follows: **${cmds.join(" → ")}**.`;
    } else {
      const moves: (keyof typeof ARROW)[] = [];
      for (let i = 0; i < (d === 1 ? 2 : 5); i++) {
        const opts = (["U", "D", "L", "R"] as const).filter((m) => { const [dr, dc] = { U: [-1, 0], D: [1, 0], L: [0, -1], R: [0, 1] }[m]; return r + dr >= 0 && r + dr < rows && col + dc >= 0 && col + dc < cols; });
        const m = pick(c.r, opts);
        const [dr, dc] = { U: [-1, 0], D: [1, 0], L: [0, -1], R: [0, 1] }[m];
        const times = d === 1 ? int(c.r, 1, 2) : 1;
        for (let t = 0; t < times; t++) if (r + dr >= 0 && r + dr < rows && col + dc >= 0 && col + dc < cols) { step(dr, dc); moves.push(m); }
      }
      text = d === 1
        ? `The robot 🤖 moves **${groupMoves(moves)}**.`
        : `The robot 🤖 follows these arrows: **${moves.map((m) => ARROW[m]).join(" ")}** (each arrow is one square).`;
    }
    const end: [number, number] = [r, col];
    if (end[0] === start[0] && end[1] === start[1]) return null;
    const objs = sample(c.r, OBJECTS, 4);
    const spots: [number, number][] = [end];
    while (spots.length < 4) { const s: [number, number] = [int(c.r, 0, rows - 1), int(c.r, 0, cols - 1)]; if (!spots.some((p) => p[0] === s[0] && p[1] === s[1]) && !(s[0] === start[0] && s[1] === start[1])) spots.push(s); }
    const fig: Fig = { kind: "gridmap", rows, cols, items: [{ r: start[0], c: start[1], icon: "🤖" }, ...spots.map((s, i) => ({ r: s[0], c: s[1], icon: objs[i][0] }))], alt: "A 5 by 5 grid with a robot and some objects" };
    const o = textOptions(`${objs[0][0]} ${objs[0][1]}`, objs.slice(1).map((x) => `${x[0]} ${x[1]}`));
    return { d, skills: ["ALGORITHMIC"], type: "MCQ", stem: `${text}\n\nWhere does the robot stop?`, figure: fig, ...o, solution: `Follow the moves one at a time from the robot's square. It stops on square ${String.fromCharCode(65 + end[1])}${end[0] + 1}, where ${objs[0][1]} is.`, hint: "Trace the path with your finger." };
  },
};
function groupMoves(m: string[]) {
  const words: Record<string, string> = { U: "up", D: "down", L: "left", R: "right" };
  const out: string[] = [];
  for (let i = 0; i < m.length;) { let j = i; while (j < m.length && m[j] === m[i]) j++; out.push(`${j - i} ${words[m[i]]}`); i = j; }
  return out.join(", then ");
}

export const gridShortest: Family = {
  id: "pic-grid-shortest", ds: [2, 3],
  make(c, d) {
    const rows = 5, cols = 6;
    const from: [number, number] = [int(c.r, 0, 4), 0], to: [number, number] = [int(c.r, 0, 4), 5];
    const blocked = new Set<string>();
    const nRocks = d === 2 ? 5 : 9;
    while (blocked.size < nRocks) { const k = `${int(c.r, 0, 4)},${int(c.r, 1, 4)}`; if (k !== from.join(",") && k !== to.join(",")) blocked.add(k); }
    const best = shortestPath(rows, cols, blocked, from, to);
    if (best < 0) return null;
    const pair = pick(c.r, [["🐰", "rabbit", "🥕", "carrot"], ["🐭", "mouse", "🧀", "cheese"], ["🐝", "bee", "🌻", "flower"], ["🐶", "puppy", "🦴", "bone"]]);
    const fig: Fig = { kind: "gridmap", rows, cols, items: [{ r: from[0], c: from[1], icon: pair[0] }, { r: to[0], c: to[1], icon: pair[2] }, ...[...blocked].map((k) => { const [a, b] = k.split(",").map(Number); return { r: a, c: b, icon: "🪨" }; })], alt: `A grid with a ${pair[1]}, a ${pair[3]} and rocks` };
    return { d, skills: ["ALGORITHMIC", "EVALUATION"], type: "NUMERIC", stem: `The ${pair[0]} ${pair[1]} wants to reach the ${pair[2]} ${pair[3]}. It can move **one square at a time** — up, down, left or right — but **not through rocks** 🪨. What is the **fewest** number of moves?`, figure: fig, answer: best, solution: `Try different routes around the rocks and count the squares. The shortest route takes ${best} moves${best > Math.abs(to[0] - from[0]) + 5 ? " — the rocks force a detour" : ""}.`, hint: "Count the squares along a route, then look for a shorter one." };
  },
};

const PLACES = [["🏫", "school"], ["🏥", "hospital"], ["🌳", "park"], ["🏪", "shop"], ["🏠", "house"], ["🛕", "temple"], ["🚉", "station"], ["📮", "post office"]];
export const gridMap: Family = {
  id: "pic-grid-map", ds: [1, 2, 3],
  make(c, d) {
    const rows = 5, cols = 5;
    const places = sample(c.r, PLACES, 5);
    const spots: [number, number][] = [];
    while (spots.length < 5) { const s: [number, number] = [int(c.r, 0, rows - 1), int(c.r, 0, cols - 1)]; if (!spots.some((p) => p[0] === s[0] && p[1] === s[1])) spots.push(s); }
    const fig: Fig = { kind: "gridmap", rows, cols, compass: true, items: spots.map((s, i) => ({ r: s[0], c: s[1], icon: places[i][0] })), alt: "A town map on a grid with places marked" };
    const name = (i: number) => `${places[i][0]} ${places[i][1]}`;
    const cell = (s: [number, number]) => `${String.fromCharCode(65 + s[1])}${s[0] + 1}`;
    if (d === 1) {
      const i = int(c.r, 0, 4);
      const o = textOptions(cell(spots[i]), [cell([spots[i][1], spots[i][0]]), cell([spots[i][0], (spots[i][1] + 1) % cols]), cell([(spots[i][0] + 1) % rows, spots[i][1]])]);
      return { d, skills: ["ABSTRACT"], type: "MCQ", stem: `In which square is the **${name(i)}**? (Letter for the column, number for the row.)`, figure: fig, ...o, solution: `It is in column ${String.fromCharCode(65 + spots[i][1])}, row ${spots[i][0] + 1}: ${cell(spots[i])}.` };
    }
    // Directions between two places (North is up).
    const a = int(c.r, 0, 4);
    let b = int(c.r, 0, 4);
    if (b === a) b = (a + 1) % 5;
    const dr = spots[b][0] - spots[a][0], dc = spots[b][1] - spots[a][1];
    const desc = (r0: number, c0: number) => [r0 ? `${Math.abs(r0)} square${Math.abs(r0) > 1 ? "s" : ""} ${r0 < 0 ? "North" : "South"}` : "", c0 ? `${Math.abs(c0)} square${Math.abs(c0) > 1 ? "s" : ""} ${c0 > 0 ? "East" : "West"}` : ""].filter(Boolean).join(" and ");
    if (d === 2) {
      const o = textOptions(desc(dr, dc), [desc(-dr, dc), desc(dr, -dc), desc(-dr, -dc), desc(dc, dr)].filter(Boolean));
      if (o.options.length < 3) return null;
      return { d, skills: ["ALGORITHMIC", "ABSTRACT"], type: "MCQ", stem: `How do you go from the **${name(a)}** to the **${name(b)}**? (North is up.)`, figure: fig, ...o, solution: `From ${cell(spots[a])} to ${cell(spots[b])}: ${desc(dr, dc)}.` };
    }
    const o = textOptions(name(b), [0, 1, 2, 3, 4].filter((i) => i !== b && i !== a).map(name));
    return { d, skills: ["ALGORITHMIC", "ABSTRACT"], type: "MCQ", stem: `Start at the **${name(a)}**. Walk **${desc(dr, dc)}**. Where are you now? (North is up.)`, figure: fig, ...o, solution: `From ${cell(spots[a])}, ${desc(dr, dc)} brings you to ${cell(spots[b])}: the ${places[b][1]}.` };
  },
};

// ---------- Counting coloured shapes ----------
const SHAPES = ["triangle", "circle", "square", "star", "heart"] as const;
export const countShapes: Family = {
  id: "pic-count-shapes", ds: [1, 2, 3],
  make(c, d) {
    const cols = 6, rows = 3;
    const kinds = sample(c.r, SHAPES, 3), colours = sample(c.r, ["red", "blue", "green", "yellow", "purple"] as Colour[], 3);
    const n = int(c.r, 10, 15);
    const slots = sample(c.r, [...Array(cols * rows).keys()], n);
    const items = slots.map((s) => ({ r: Math.floor(s / cols), c: s % cols, shape: pick(c.r, kinds), colour: pick(c.r, colours), size: 0.8 + c.r() * 0.35 }));
    const fig: Fig = { kind: "shapes", cols, rows, items, alt: "A picture with many coloured shapes" };
    const count = (f: (x: (typeof items)[number]) => boolean) => items.filter(f).length;
    const plural = (s: string) => `${s}s`;
    let stem: string, ans: number, sol: string;
    if (d === 1) {
      if (c.r() < 0.5) { const k = pick(c.r, kinds); ans = count((x) => x.shape === k); stem = `How many **${plural(k)}** are in the picture?`; sol = `Count only the ${plural(k)}, of any colour: ${ans}.`; }
      else { const col = pick(c.r, colours); ans = count((x) => x.colour === col); stem = `How many **${col}** shapes are in the picture?`; sol = `Count every ${col} shape, whatever its kind: ${ans}.`; }
    } else if (d === 2) {
      const k = pick(c.r, kinds), col = pick(c.r, colours);
      ans = count((x) => x.shape === k && x.colour === col);
      stem = `How many **${col} ${plural(k)}** are there?`; sol = `A shape counts only if it is BOTH ${col} AND a ${k}: ${ans}.`;
    } else if (c.r() < 0.5) {
      const k = pick(c.r, kinds);
      ans = count((x) => x.shape !== k); stem = `How many shapes are **not ${plural(k)}**?`; sol = `There are ${items.length} shapes and ${items.length - ans} ${plural(k)}. ${items.length} − ${items.length - ans} = ${ans}.`;
    } else {
      const [k1, k2] = kinds;
      const a = count((x) => x.shape === k1), b = count((x) => x.shape === k2);
      if (a === b) return null;
      ans = Math.abs(a - b); stem = `How many **more ${plural(a > b ? k1 : k2)}** are there than **${plural(a > b ? k2 : k1)}**?`; sol = `${plural(k1)}: ${a}, ${plural(k2)}: ${b}. Difference: ${ans}.`;
    }
    return { d, skills: ["DECOMPOSITION", "ABSTRACT"], type: "NUMERIC", stem, figure: fig, answer: ans, solution: sol, hint: "Point at each shape as you count, so you don't count any twice." };
  },
};

// ---------- Picture sequences ----------
export const pictureSequence: Family = {
  id: "pic-sequence", ds: [1, 2, 3],
  make(c, d) {
    if (d === 1) {
      const col = pick(c.r, BRIGHT), s0 = int(c.r, 0, 3) as 0 | 1 | 2 | 3, cw = c.r() < 0.6;
      const dirAt = (i: number) => (((s0 + (cw ? i : -i)) % 4) + 4) % 4 as 0 | 1 | 2 | 3;
      const frames: Fig[] = [0, 1, 2, 3].map((i) => ({ kind: "arrow", dir: dirAt(i), colour: col, alt: "arrow" }));
      const right = dirAt(4);
      const opts = [right, ((right + 1) % 4), ((right + 2) % 4), ((right + 3) % 4)].map((dd) => ({ fig: { kind: "arrow", dir: dd as 0 | 1 | 2 | 3, colour: col, alt: "Picture choice" } as Fig, label: ["arrow pointing up", "arrow pointing right", "arrow pointing down", "arrow pointing left"][dd] }));
      return pictureChoice(d, "The arrow turns the same way each time. Which picture comes next?", { kind: "sequence", frames: [...frames, null], alt: "A sequence of arrows turning" }, opts, `Each step the arrow makes a quarter turn ${cw ? "clockwise" : "anticlockwise"}, so the next one points ${opts[0].label.replace("arrow pointing ", "")}.`, ["PATTERN"]);
    }
    const shape = pick(c.r, ["circle", "square", "triangle"] as const);
    if (d === 2) {
      const col = pick(c.r, BRIGHT), start = int(c.r, 1, 2);
      const frames: Fig[] = [0, 1, 2].map((i) => ({ kind: "dots", count: start + i, colour: col, shape, alt: "dots" }));
      const next = start + 3;
      const opts = [next, next + 1, next - 1, next + 2].map((n) => ({ fig: { kind: "dots", count: n, colour: col, shape, alt: "Picture choice" } as Fig, label: `${n} ${shape}s` }));
      return pictureChoice(d, "Look at how the pictures change. Which picture comes next?", { kind: "sequence", frames: [...frames, null], alt: "A sequence of growing groups of shapes" }, opts, `One more ${shape} is added each time: ${start}, ${start + 1}, ${start + 2}, so next is ${next}.`, ["PATTERN"]);
    }
    const [c1, c2] = distinct(c.r, 2), start = int(c.r, 1, 2);
    const colAt = (i: number) => (i % 2 ? c2 : c1);
    const frames: Fig[] = [0, 1, 2, 3].map((i) => ({ kind: "dots", count: start + i, colour: colAt(i), shape, alt: "dots" }));
    const n = start + 4, col = colAt(4), other = colAt(5);
    const opts = [[n, col], [n, other], [n + 1, col], [n - 1, other]].map(([cnt, cc]) => ({ fig: { kind: "dots", count: cnt as number, colour: cc as Colour, shape, alt: "Picture choice" } as Fig, label: `${cnt} ${cc} ${shape}s` }));
    return pictureChoice(d, "**Two things** change each time. Which picture comes next?", { kind: "sequence", frames: [...frames, null], alt: "A sequence of shapes changing in number and colour" }, opts, `The number goes up by 1 (so ${n}) and the colour takes turns (${c1}, ${c2}, …), so next is ${n} ${col} ${shape}s.`, ["PATTERN", "DECOMPOSITION"]);
  },
};

// ---------- Charts ----------
const CHART_THEMES = [["Favourite fruit", ["Mango", "Apple", "Banana", "Guava", "Grapes"]], ["Pets at home", ["Dog", "Cat", "Fish", "Parrot", "Rabbit"]], ["Way to school", ["Walk", "Bus", "Cycle", "Car", "Auto"]], ["Books read", ["Asha", "Ravi", "Meena", "Kabir", "Zoya"]]] as const;
export const barChart: Family = {
  id: "pic-bar-chart", ds: [1, 2, 3],
  make(c, d) {
    const [title, labels0] = pick(c.r, CHART_THEMES);
    const n = d === 1 ? 4 : 5, step = pick(c.r, [2, 5]);
    const labels = labels0.slice(0, n);
    const values: number[] = [];
    while (values.length < n) { const v = step * int(c.r, 1, 8); if (!values.includes(v)) values.push(v); }
    const fig: Fig = { kind: "bars", title, labels: [...labels], values, step, showValues: d === 1, alt: `Bar graph: ${title}` };
    const max = Math.max(...values), min = Math.min(...values);
    if (d === 1) { const o = textOptions(labels[values.indexOf(max)], [...labels]); return { d, skills: ["DATA", "DECOMPOSITION"], type: "MCQ", stem: "Which one has the **biggest** number?", figure: fig, ...o, solution: `The tallest bar is ${labels[values.indexOf(max)]} (${max}).` }; }
    if (d === 2) {
      const i = int(c.r, 0, n - 1);
      return c.r() < 0.5
        ? { d, skills: ["DATA"], type: "NUMERIC", stem: `Read the graph. What number does **${labels[i]}** have?`, figure: fig, answer: values[i], solution: `The top of the ${labels[i]} bar lines up with ${values[i]} on the side scale (each line is ${step}).`, hint: `Each grid line is ${step}.` }
        : { d, skills: ["DATA", "DECOMPOSITION"], type: "NUMERIC", stem: "What is the difference between the **tallest** and the **shortest** bar?", figure: fig, answer: max - min, solution: `${max} − ${min} = ${max - min}.` };
    }
    return { d, skills: ["DATA", "DECOMPOSITION"], type: "NUMERIC", stem: "Read the graph. What is the **total** of all the bars?", figure: fig, answer: values.reduce((a, b) => a + b, 0), solution: `${values.join(" + ")} = ${values.reduce((a, b) => a + b, 0)}.`, hint: `Each grid line is ${step}.` };
  },
};

export const pictograph: Family = {
  id: "pic-pictograph", ds: [1, 2, 3],
  make(c, d) {
    const theme = pick(c.r, [["Cycles in the school stand", ["Mon", "Tue", "Wed", "Thu"], "🚲"], ["Mangoes picked", ["Ravi", "Sita", "Arun", "Lata"], "🥭"], ["Trees planted", ["Class 3", "Class 4", "Class 5", "Class 6"], "🌳"], ["Ice creams sold", ["Mon", "Tue", "Wed", "Thu"], "🍦"]] as const);
    const per = d === 1 ? 2 : pick(c.r, [5, 10]);
    const counts = theme[1].map(() => int(c.r, 1, 6));
    if (new Set(counts).size < 3) return null;
    const fig: Fig = { kind: "pictograph", title: theme[0], labels: [...theme[1]], counts, icon: theme[2], per, alt: `Pictograph: ${theme[0]}` };
    const vals = counts.map((x) => x * per);
    if (d < 3) { const i = int(c.r, 0, 3); return { d, skills: ["DATA", "ABSTRACT"], type: "NUMERIC", stem: `Look at the key. How many for **${theme[1][i]}**?`, figure: fig, answer: vals[i], solution: `${counts[i]} pictures × ${per} = ${vals[i]}.`, hint: "Each picture stands for more than one." }; }
    const a = vals.indexOf(Math.max(...vals)), b = vals.indexOf(Math.min(...vals));
    return { d, skills: ["DATA", "DECOMPOSITION"], type: "NUMERIC", stem: `How many **more** for **${theme[1][a]}** than for **${theme[1][b]}**?`, figure: fig, answer: vals[a] - vals[b], solution: `${theme[1][a]}: ${counts[a]} × ${per} = ${vals[a]}; ${theme[1][b]}: ${counts[b]} × ${per} = ${vals[b]}. Difference ${vals[a] - vals[b]}.` };
  },
};

// ---------- Clocks ----------
const t = (h: number, m: number) => `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")}`;
export const clockRead: Family = {
  id: "pic-clock", ds: [1, 2, 3],
  make(c, d) {
    if (d === 3) {
      const h = pick(c.r, [1, 2, 3, 4, 5, 7, 8, 9, 10, 11]);
      const real = 12 - h;
      const o = textOptions(t(real, 0), [t(h, 0), t((real % 12) + 1, 0), t((h + 6) % 12 || 12, 0)]);
      return { d, skills: ["ABSTRACT", "EVALUATION"], type: "MCQ", stem: "This is a clock **seen in a mirror**. What is the **real** time?", figure: { kind: "clock", h: real, m: 0, mirror: true, alt: "A clock seen in a mirror" }, ...o, solution: `On a normal clock face, the hour hand in the mirror would point to ${h}. A mirror swaps left and right, so the real hour is 12 − ${h} = ${real}: ${t(real, 0)}. Tip: the back-to-front numbers show where the real ${real} is.`, hint: "Imagine the clock flipped back the right way round." };
    }
    const h = int(c.r, 1, 12), m = d === 1 ? pick(c.r, [0, 30]) : 5 * int(c.r, 1, 11);
    const wrong = [t(h, (m + 30) % 60), t((h % 12) + 1, m), t(h, (60 - m) % 60), t(m / 5 || 12, h * 5 % 60)].filter((x) => x !== t(h, m));
    const o = textOptions(t(h, m), wrong);
    return { d, skills: ["ABSTRACT"], type: "MCQ", stem: "What time does the clock show? (The **short blue** hand shows the hour, the **long red** hand shows the minutes.)", figure: { kind: "clock", h, m, alt: `A clock showing ${t(h, m)}` }, ...o, solution: `The hour hand is ${m ? `just past ${h}` : `on ${h}`} and the minute hand points to ${m === 0 ? "12 (o'clock)" : `${m / 5} (that is ${m} minutes)`}: ${t(h, m)}.` };
  },
};

// ---------- Cube stacks ----------
export const cubeStack: Family = {
  id: "pic-cubes", ds: [1, 2, 3],
  make(c, d) {
    const cols = d === 1 ? int(c.r, 2, 3) : int(c.r, 3, 5);
    const heights = Array.from({ length: cols }, () => int(c.r, 1, d === 1 ? 3 : 5));
    const total = heights.reduce((a, b) => a + b, 0);
    const fig: Fig = { kind: "cubes", heights, colour: pick(c.r, ["blue", "orange", "green", "purple", "pink"] as Colour[]), alt: "Towers of cubes in a row" };
    if (d < 3) return { d, skills: ["ABSTRACT", "DECOMPOSITION"], type: "NUMERIC", stem: "How many cubes are there in these towers? (No cubes are hidden.)", figure: fig, answer: total, solution: `Count each tower: ${heights.join(" + ")} = ${total}.`, hint: "Count one tower at a time." };
    const max = Math.max(...heights), need = heights.reduce((a, b) => a + (max - b), 0);
    if (!need) return null;
    return { d, skills: ["ABSTRACT", "DECOMPOSITION"], type: "NUMERIC", stem: "How many **more** cubes are needed to make every tower as tall as the tallest one?", figure: fig, answer: need, solution: `The tallest tower has ${max}. Extra needed: ${heights.map((x) => max - x).join(" + ")} = ${need}.` };
  },
};

export const PICTURE_FAMILIES: Record<string, Family> = Object.fromEntries([mirrorPicture, waterPicture, rotatePicture, symmetryComplete, oddMirror, gridRobot, gridShortest, gridMap, countShapes, pictureSequence, barChart, pictograph, clockRead, cubeStack].map((f) => [f.id, f]));

/** Picture families per chapter; each listed chapter gets PICTURES_PER_CHAPTER picture questions on top of its 40. */
export const PICTURES_PER_CHAPTER = 8;
export const PICTURE_PLAN: Record<string, string[]> = {
  "3-CT-1": ["pic-sequence", "pic-count-shapes"], "3-CT-2": ["pic-cubes", "pic-count-shapes"], "3-CT-5": ["pic-mirror", "pic-count-shapes", "pic-symmetry-complete"], "3-CT-10": ["pic-sequence", "pic-count-shapes"], "3-CT-13": ["pic-clock"], "3-CT-14": ["pic-grid-robot", "pic-grid-map", "pic-grid-shortest"], "3-EVS-6": ["pic-grid-map", "pic-grid-robot"],
  "4-CT-1": ["pic-cubes", "pic-count-shapes"], "4-CT-2": ["pic-grid-robot", "pic-grid-shortest", "pic-cubes"], "4-CT-3": ["pic-sequence"], "4-CT-10": ["pic-bar-chart", "pic-pictograph"], "4-CT-11": ["pic-mirror", "pic-water", "pic-symmetry-complete"], "4-CT-12": ["pic-clock"], "4-CT-14": ["pic-bar-chart", "pic-pictograph"],
  "5-CT-3": ["pic-rotate", "pic-clock", "pic-sequence"], "5-CT-7": ["pic-sequence", "pic-count-shapes"], "5-CT-10": ["pic-mirror", "pic-water", "pic-symmetry-complete", "pic-odd-one-out"], "5-CT-12": ["pic-clock"], "5-CT-14": ["pic-grid-map", "pic-grid-robot", "pic-grid-shortest"], "5-CT-15": ["pic-pictograph", "pic-bar-chart"], "5-EVS-3": ["pic-grid-map", "pic-grid-shortest"],
  "6-CT-1": ["pic-sequence"], "6-CT-4": ["pic-bar-chart", "pic-pictograph"], "6-CT-8": ["pic-grid-robot", "pic-rotate"], "6-CT-9": ["pic-mirror", "pic-water", "pic-rotate", "pic-odd-one-out", "pic-symmetry-complete"], "6-AI-2": ["pic-bar-chart"], "6-AI-3": ["pic-sequence", "pic-bar-chart"],
  "7-CT-7": ["pic-odd-one-out", "pic-rotate"], "7-AI-3": ["pic-bar-chart", "pic-pictograph"],
  "8-CT-1": ["pic-cubes"], "8-CT-4": ["pic-odd-one-out", "pic-rotate"], "8-AI-1": ["pic-grid-shortest"],
};
export type { D };
void NAMES;
