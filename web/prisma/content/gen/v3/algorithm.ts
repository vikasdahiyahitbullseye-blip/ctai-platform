// Algorithmic Thinking engines: follow, trace and reverse step-by-step instructions.
import type { Colour, Fig } from "../../../../src/lib/figures";
import { type Engine, int, pick, sample, fmt, NAMES, near, rupees, withUnit, hm, timeAccept, dur, ord, cap } from "./core";

const MAP_ICONS: [string, string][] = [["🏫", "school"], ["🌳", "tree"], ["🏠", "house"], ["⛲", "fountain"], ["🏪", "shop"], ["🐄", "cow"], ["🎡", "big wheel"], ["⛺", "tent"], ["🍎", "apple"], ["⭐", "star"]];
const DIR = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] } as const;

export const gridWalk: Engine = {
  id: "v3-grid-walk", skill: "ALGORITHMIC", tags: ["any"], part: "CT", pic: "always",
  make(c, d) {
    const rows = 5, cols = 5;
    const sr = int(c.r, 0, 4), sc = int(c.r, 0, 4);
    const nMoves = d === 1 ? 2 : d === 2 ? 3 : 4;
    let r = sr, cc = sc, guard = 0; const steps: [keyof typeof DIR, number][] = [];
    for (let i = 0; i < nMoves; i++) {
      const OPP: Record<string, string> = { up: "down", down: "up", left: "right", right: "left" };
      const opts = (Object.keys(DIR) as (keyof typeof DIR)[]).filter((k) => !steps.length || (k !== steps[steps.length - 1][0] && k !== OPP[steps[steps.length - 1][0]]));
      const k = pick(c.r, opts), [dr, dc] = DIR[k];
      const maxN = Math.max(0, ...[1, 2, 3].filter((n) => r + dr * n >= 0 && r + dr * n < rows && cc + dc * n >= 0 && cc + dc * n < cols));
      if (!maxN) { i--; if (++guard > 50) return null; continue; }
      const n = int(c.r, 1, maxN); steps.push([k, n]); r += dr * n; cc += dc * n;
    }
    if (r === sr && cc === sc) return null;
    const icons = sample(c.r, MAP_ICONS.slice(1), 4);
    const goal = { r, c: cc };
    const decoys: { r: number; c: number }[] = [];
    // decoys: where you end if one step is misread (turned the wrong way / one square short)
    const alt = (f: (s: [keyof typeof DIR, number], i: number) => [keyof typeof DIR, number]) => steps.reduce((p, s, i) => { const [k, n] = f(s, i); return { r: p.r + DIR[k][0] * n, c: p.c + DIR[k][1] * n }; }, { r: sr, c: sc });
    const flip: Record<string, keyof typeof DIR> = { up: "down", down: "up", left: "right", right: "left" };
    for (const cand of [alt((s, i) => (i === nMoves - 1 ? [flip[s[0]], s[1]] : s)), alt((s, i) => (i === 0 ? [s[0], Math.max(1, s[1] - 1)] : s)), alt((s, i) => (i === 1 ? [flip[s[0]], s[1]] : s)), { r: sr + (r > sr ? 1 : -1), c: cc }])
      if (cand.r >= 0 && cand.r < rows && cand.c >= 0 && cand.c < cols && !(cand.r === goal.r && cand.c === goal.c) && !(cand.r === sr && cand.c === sc) && !decoys.some((x) => x.r === cand.r && x.c === cand.c)) decoys.push(cand);
    if (decoys.length < 3) return null;
    const items = [{ r: sr, c: sc, icon: "🧒" }, { r: goal.r, c: goal.c, icon: icons[0][0] }, ...decoys.slice(0, 3).map((p, i) => ({ r: p.r, c: p.c, icon: icons[i + 1][0] }))];
    const figure: Fig = { kind: "gridmap", rows, cols, items, alt: `A 5 by 5 map. The child is at ${String.fromCharCode(65 + sc)}${sr + 1}.` };
    const who = pick(c.r, NAMES);
    const prog = steps.map(([k, n]) => `move ${n} ${k}`).join(", then ");
    return { skills: ["ALGORITHMIC"], d, ctx: `${who} (🧒) plays a map game ${c.theme.place}. ${who} follows these instructions exactly: **${prog}**. (Up means towards the top of the map.)`, figure, ask: `Where does ${who} end up?`, say: `${who} ends up at the ____.`, answer: icons[0][1], wrong: icons.slice(1).map(([, n]) => n), solution: `Start at ${String.fromCharCode(65 + sc)}${sr + 1}. ${steps.map(([k, n]) => `Move ${n} ${k}`).join(", ")}: you reach ${String.fromCharCode(65 + goal.c)}${goal.r + 1}, where the ${icons[0][1]} is.`, hint: "Trace the moves with your finger, one at a time." };
  },
};

const COMPASS = ["North", "East", "South", "West"];
export const turns: Engine = {
  id: "v3-turns", skill: "ALGORITHMIC", tags: ["map", "angle", "shape", "time"], part: "CT", pic: "maybe",
  make(c, d, pic) {
    const start = int(c.r, 0, 3), who = pick(c.r, NAMES);
    const n = d === 1 ? 2 : d === 2 ? 3 : 4;
    const useDeg = c.cls >= 5 && d >= 2;
    const ts = Array.from({ length: n }, () => [pick(c.r, ["right", "left"]), useDeg ? pick(c.r, [90, 180, 270]) : pick(c.r, [1, 1, 2])] as [string, number]);
    let f = start;
    for (const [s, a] of ts) { const q = useDeg ? a / 90 : a; f = (f + (s === "right" ? q : 4 - q)) % 4; }
    if (f === start && d === 1) return null;
    const txt = ts.map(([s, a]) => (useDeg ? `turn ${a}° ${s}` : a === 1 ? `make a quarter turn ${s}` : `make a half turn`)).join(", then ");
    const figure: Fig | undefined = pic ? { kind: "arrow", dir: start as 0 | 1 | 2 | 3, colour: pick(c.r, ["red", "blue", "green"] as Colour[]), alt: `An arrow pointing ${COMPASS[start]}` } : undefined;
    const robot = c.theme.key === "5-CT-3" ? "a toy robot" : pick(c.r, ["a toy robot", "a weathervane", "a toy car"]);
    return { skills: useDeg ? ["ALGORITHMIC", "ABSTRACT"] : ["ALGORITHMIC"], d, ctx: `${who} programs ${robot} ${c.theme.place}. It starts facing **${COMPASS[start]}**${figure ? " (see the arrow; North is up)" : ""}. The program says: ${txt}.${useDeg ? " A quarter turn is 90°." : ""}`, figure, ask: "Which way does it face at the end?", say: "At the end it faces ____.", answer: COMPASS[f], wrong: COMPASS.filter((x) => x !== COMPASS[f]), solution: `Track the direction after each turn: ${COMPASS[start]}${ts.map(([s, a]) => { const q = useDeg ? a / 90 : a; return ` → ${s} ${q * 90}°`; }).join("")}. It ends facing ${COMPASS[f]}.` };
  },
};

export const machine: Engine = {
  id: "v3-machine", skill: "ALGORITHMIC", tags: ["number", "mult", "algebra", "integer", "power", "factor", "pattern", "count", "money", "decimal"], part: "CT", pic: "never",
  make(c, d) {
    const who = pick(c.r, NAMES);
    const opsList: [string, (x: number) => number, (x: number) => number][] = [
      ["double it", (x) => 2 * x, (x) => x / 2], ["add 7", (x) => x + 7, (x) => x - 7], ["subtract 4", (x) => x - 4, (x) => x + 4],
      ["multiply by 3", (x) => 3 * x, (x) => x / 3], ["add 15", (x) => x + 15, (x) => x - 15], ["subtract 9", (x) => x - 9, (x) => x + 9],
    ];
    const k = d === 1 ? 2 : 3;
    const ops = sample(c.r, opsList, k);
    const input = int(c.r, c.cls === 6 && c.theme.tags.includes("integer") ? -9 : 3, c.cls <= 3 ? 20 : 60);
    let x = input; const trail = [x];
    for (const [, f] of ops) { x = f(x); trail.push(x); }
    if (c.cls < 6 && trail.some((v) => v < 0)) return null;
    const rule = ops.map(([s]) => s).join(", then ");
    if (d < 3) return { skills: ["ALGORITHMIC"], d, ctx: `${who} builds a number machine ${c.theme.place}. The machine follows these steps in order: **${rule}**. ${who} puts in the number ${input}.`, ask: "What number comes out?", say: "The number that comes out is ____.", answer: x, wrong: near(c.r, x, [trail[trail.length - 2], ops.slice().reverse().reduce((v, [, f]) => f(v), input), x + 1, x - 2], 3, trail.some((v) => v < 0)), solution: `${trail.map((v, i) => (i ? `${ops[i - 1][0]} → ${v}` : `${v}`)).join(", ")}. Out comes ${x}.` };
    // run it backwards
    const out = x;
    return { skills: ["ALGORITHMIC", "ABSTRACT"], d, ctx: `${who} builds a number machine ${c.theme.place}. It follows these steps in order: **${rule}**. A number goes in and **${out}** comes out.`, ask: "Which number went in?", say: "The number that went in is ____.", answer: input, wrong: near(c.r, input, [ops.reduce((v, [, , g]) => g(v), out), input + 1, out - input, input - 2], 3, trail.some((v) => v < 0)).filter(Number.isInteger), solution: `Work backwards, undoing the steps in reverse order: ${[...ops].reverse().map(([s]) => `undo "${s}"`).join(", ")}. ${[...trail].reverse().join(" → ")}. The number that went in was ${input}.`, hint: "Undo the last step first." };
  },
};

export const repeatUntil: Engine = {
  id: "v3-repeat-until", skill: "ALGORITHMIC", tags: ["money", "count", "capacity", "length", "mult", "time", "number"], part: "CT", pic: "maybe",
  make(c, d, pic) {
    const who = pick(c.r, NAMES);
    const money = c.theme.tags.includes("money") && c.r() < 0.6;
    const cap_ = !money && c.theme.tags.includes("capacity");
    const start = d === 1 ? 0 : int(c.r, 1, 5) * (money ? 10 : 2), step = int(c.r, 2, 9) * (money ? 5 : 1);
    const goal = start + step * int(c.r, 4, 9) + (d === 3 ? int(c.r, 1, step - 1) : 0);
    const days = Math.ceil((goal - start) / step);
    const what = money ? `saves ₹${step} every day` : cap_ ? `pours ${step} litres into a tank every hour` : `adds ${step} ${pick(c.r, c.theme.items).many} to a collection every day`;
    const unitWord = cap_ ? "hours" : "days";
    const have = money ? `₹${start}` : cap_ ? `${start} litres` : `${start}`;
    const target = money ? `at least ₹${goal}` : cap_ ? `at least ${goal} litres` : `at least ${goal}`;
    const figure: Fig | undefined = pic && !money && goal <= 60 ? { kind: "numberline", min: 0, max: Math.ceil((goal + step) / 10) * 10, step: Math.ceil((goal + step) / 10) * 10 > 40 ? 5 : 2, labelEvery: Math.ceil((goal + step) / 10) * 10 > 40 ? 2 : 5, jumps: { from: start, size: step, count: 2, colour: "orange", icon: "🐸" }, marks: [{ v: goal, label: "Goal", colour: "green" }], alt: `Number line: start ${start}, jumps of ${step}, goal ${goal}` } : undefined;
    return { skills: d === 3 ? ["ALGORITHMIC", "DECOMPOSITION"] : ["ALGORITHMIC"], d, ctx: `${who} starts with ${have} ${c.theme.place} and ${what}. Plan: **repeat** adding ${step} **until** the total is ${target}.${figure && c.cls > 4 ? " The number line shows the first two jumps." : ""}`, figure, ask: `After how many ${unitWord} does ${who} stop?`, say: `${who} stops after ____ ${unitWord}.`, answer: days, wrong: near(c.r, days, [days - 1, days + 1, Math.floor(goal / step), days + 2]), solution: `${who} needs ${goal - start} more. Each ${unitWord.slice(0, -1)} adds ${step}: ${Array.from({ length: days }, (_, i) => fmt(start + (i + 1) * step)).join(", ")}. After ${days} ${unitWord} the total is ${fmt(start + days * step)}${d === 3 ? `, which is the first total that reaches ${fmt(goal)}` : ""}.`, hint: d === 3 ? "The total must reach the goal — it can go a little over." : undefined };
  },
};

export const clockAdd: Engine = {
  id: "v3-clock-add", skill: "ALGORITHMIC", tags: ["time", "calendar"], part: "CT", pic: "always",
  make(c, d) {
    const h = int(c.r, 1, 11), m = pick(c.r, d === 1 ? [0, 30] : [0, 10, 15, 20, 35, 40, 45, 50]);
    const t0 = h * 60 + m, who = pick(c.r, NAMES);
    const adds = d === 1 ? [pick(c.r, [30, 60])] : d === 2 ? [int(c.r, 2, 11) * 5, int(c.r, 2, 11) * 5] : [int(c.r, 4, 11) * 5, int(c.r, 1, 2) * 60 + int(c.r, 1, 11) * 5, int(c.r, 3, 9) * 5];
    const end = adds.reduce((s, a) => s + a, t0);
    const figure: Fig = { kind: "clock", h, m, alt: `A clock showing ${hm(t0)}` };
    const steps = adds.map((a) => `${dur(a)} pass`).join(", then ");
    return { skills: ["ALGORITHMIC"], d, ctx: `${who} looks at the clock ${c.theme.place}. Starting from this time, ${steps}.`, figure, ask: "What time is it now?", say: "Now it is ____.", answer: hm(end), wrong: [hm(end + 10), hm(end - 60), hm(end + 60), hm(t0 + adds.slice(0, -1).reduce((s, a) => s + a, 0))], show: String, accept: timeAccept(end), solution: `The clock shows ${hm(t0)}. ${adds.map((a) => `add ${dur(a)}`).join(", then ")}: ${hm(end)}.` };
  },
};

export const jumps: Engine = {
  id: "v3-jumps", skill: "ALGORITHMIC", tags: ["number", "integer", "mult", "pattern", "count", "decimal", "length"], part: "CT", pic: "always",
  make(c, d) {
    const neg = c.theme.tags.includes("integer");
    const size = int(c.r, 2, d === 1 ? 3 : 5), fwd = int(c.r, 2, 4), back = d === 1 ? 0 : int(c.r, 1, 3);
    const start = neg ? int(c.r, -8, 2) : int(c.r, 0, 6);
    const end = start + fwd * size - back * size;
    const lo = Math.min(start, end, start + fwd * size) - 2, hi = Math.max(start + fwd * size, end) + 2;
    const min = Math.floor(lo / 2) * 2, max = Math.ceil(hi / 2) * 2;
    const figure: Fig = { kind: "numberline", min, max, step: 1, labelEvery: max - min > 20 ? 2 : 1, marks: [{ v: start, label: "Start", colour: "blue" }], alt: `Number line from ${min} to ${max}; start at ${start}` };
    const who = pick(c.r, NAMES);
    return { skills: ["ALGORITHMIC"], d, ctx: `${c.cls <= 4 ? "A frog" : `A frog in ${who}'s game ${c.theme.place}`} starts at the mark on the number line. It jumps **${fwd} times forward**, ${size} each time${back ? `, and then **${back} times backward**, ${size} each time` : ""}.`, figure, ask: "Where does the frog land at the end?", say: "The frog lands on ____.", answer: end, wrong: near(c.r, end, [start + fwd * size, end + size, end - size, start + (fwd + back) * size], 3, neg), solution: `Forward: ${start} + ${fwd} × ${size} = ${start + fwd * size}.${back ? ` Backward: ${start + fwd * size} − ${back} × ${size} = ${end}.` : ""} The frog lands on ${end}.` };
  },
};

const A = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const WORDS = ["CAT", "SUN", "TREE", "BOOK", "KITE", "FAIR", "LAMP", "MANGO", "TIGER", "RIVER", "PLANT", "TRAIN", "CLOUD", "HOUSE", "APPLE", "DREAM"];
const shiftW = (w: string, k: number) => w.split("").map((ch) => A[(A.indexOf(ch) + k + 26) % 26]).join("");
export const letterCode: Engine = {
  id: "v3-letter-code", skill: "ALGORITHMIC", tags: ["letters"], part: "CT", pic: "never",
  make(c, d) {
    const w = pick(c.r, WORDS.filter((x) => (d === 1 ? x.length <= 4 : x.length >= 4))), k = d === 1 ? int(c.r, 1, 2) : int(c.r, 2, 5), who = pick(c.r, NAMES);
    if (d < 3) { const code = shiftW(w, k); return { skills: ["ALGORITHMIC", "PATTERN"].slice(0, d), d, ctx: `${who} writes secret messages ${c.theme.place}. The rule is: replace each letter by the letter ${k} place${k > 1 ? "s" : ""} after it in the alphabet (after Z, start again at A).`, ask: `How does ${who} write **${w}**?`, say: `${w} is written as ____.`, answer: code, wrong: [shiftW(w, k + 1), shiftW(w, -k), shiftW(w, k - 1 || k + 2), code.split("").reverse().join("")].filter((x) => x !== code), accept: [code.toLowerCase()], solution: `Move each letter ${k} forward: ${w.split("").map((ch) => `${ch}→${shiftW(ch, k)}`).join(", ")}. So ${w} becomes ${code}.` }; }
    const code = shiftW(w, k);
    return { skills: ["ALGORITHMIC", "ABSTRACT"], d, ctx: `${who} received a secret word ${c.theme.place}: **${code}**. It was made by replacing each letter with the letter ${k} places after it in the alphabet (after Z comes A).`, ask: "What is the real word?", say: "The real word is ____.", answer: w, wrong: [shiftW(code, k), shiftW(w, 1), shiftW(w, -1), shiftW(code, -k + 1)].filter((x) => x !== w), accept: [w.toLowerCase()], solution: `To decode, move each letter ${k} places back: ${code.split("").map((ch) => `${ch}→${shiftW(ch, -k)}`).join(", ")}. The word is ${w}.`, hint: "Undo the rule: go back instead of forward." };
  },
};

export const sortPass: Engine = {
  id: "v3-sort-pass", skill: "ALGORITHMIC", tags: ["number", "data", "count", "decimal", "factor", "place", "integer"], part: "CT", pic: "never", min: 5,
  make(c, d) {
    const n = d === 1 ? 4 : 5;
    const vals = sample(c.r, Array.from({ length: 40 }, (_, i) => (c.theme.tags.includes("integer") ? i - 15 : i + 3)), n);
    const who = pick(c.r, NAMES);
    const arr = [...vals]; let swaps = 0;
    const passes = d === 3 ? 2 : 1;
    for (let p = 0; p < passes; p++) for (let i = 0; i < n - 1; i++) if (arr[i] > arr[i + 1]) { [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]]; swaps++; }
    const sorted = [...vals].sort((a, b) => a - b);
    if (arr.join() === sorted.join() && d > 1) return null;
    const show = (v: string | number) => String(v);
    const fmtL = (a: number[]) => a.join(", ");
    const wrongs = [fmtL(sorted), fmtL([...vals].reverse()), fmtL(vals.map((v, i) => vals[(i + 1) % n])), fmtL([...arr.slice(1), arr[0]])];
    return { skills: ["ALGORITHMIC"], d, ctx: `${who} sorts number cards from smallest to largest ${c.theme.place}. The cards are: **${fmtL(vals)}**. One *pass* means: compare the 1st and 2nd cards and swap them if the first is bigger, then the 2nd and 3rd, and so on to the end.`, ask: `What is the order of the cards after ${passes === 1 ? "one pass" : "two passes"}?`, say: `After ${passes === 1 ? "one pass" : "two passes"}, the cards are ____.`, answer: fmtL(arr), wrong: wrongs.filter((x) => x !== fmtL(arr)), show, fill: false, solution: `Do the comparisons in order and swap when the left card is bigger (${swaps} swap${swaps === 1 ? "" : "s"} in all). The result is ${fmtL(arr)}.${arr.join() !== sorted.join() ? ` (More passes are needed to finish sorting.)` : ""}`, hint: "The biggest card moves to the end in the first pass." };
  },
};

export const ALGO_ENGINES = [gridWalk, turns, machine, repeatUntil, clockAdd, jumps, letterCode, sortPass];
void rupees; void withUnit; void ord; void cap;
