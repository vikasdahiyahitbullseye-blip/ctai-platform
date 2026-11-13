// More picture families: fractions, place value, number lines, measuring, money, sorting, angles, calendars,
// number grids, growing patterns, area models, binary cards, beads and AI training data.
import { type Family, type Ctx, type D, int, pick, sample, textOptions } from "./util";
import { type Colour, type Fig, perimeter } from "../../../src/lib/figures";

const GROUPS: Colour[][] = [["red", "pink"], ["orange", "yellow"], ["green", "teal"], ["blue"], ["purple"]];
const distinct = (r: () => number, n: number): Colour[] => sample(r, GROUPS, n).map((g) => pick(r, g));
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
const frac = (a: number, b: number) => `${a}/${b}`;
const range = (n: number) => Array.from({ length: n }, (_, i) => i);
const choice = (fig: Fig, label: string) => ({ fig, label });
function pictureMcq(d: D, skills: string[], stem: string, figure: Fig | undefined, opts: { fig: Fig; label: string }[], solution: string, hint?: string) {
  if (new Set(opts.map((o) => JSON.stringify(o.fig))).size < opts.length || new Set(opts.map((o) => o.label)).size < opts.length) return null;
  return { d, skills, type: "MCQ" as const, stem, ...(figure ? { figure } : {}), options: opts.map((o) => o.label), optionFigures: opts.map((o) => o.fig), answer: 0, solution, ...(hint ? { hint } : {}) };
}

// ---------- Fractions ----------
function fracFig(r: () => number, d: D, parts: number, shaded: number, colour: Colour): Fig {
  const shape = d === 3 && parts % 2 === 0 && parts >= 6 ? "grid" : pick(r, ["circle", "bar"] as const);
  return { kind: "fraction", shape, parts, shaded, colour, ...(shape === "grid" ? { rows: 2 } : {}), alt: `A shape cut into ${parts} equal parts with some shaded` };
}
export const fractionName: Family = {
  id: "pic-fraction-name", ds: [1, 2, 3],
  make(c, d) {
    const parts = d === 1 ? int(c.r, 2, 4) : d === 2 ? int(c.r, 3, 8) : pick(c.r, [6, 8, 10, 12]);
    const k = int(c.r, 1, parts - 1);
    const fig = fracFig(c.r, d, parts, k, pick(c.r, ["red", "blue", "green", "orange", "purple"] as Colour[]));
    if (d === 3) {
      const g = gcd(k, parts);
      if (g === 1) return null;
      const o = textOptions(frac(k / g, parts / g), [frac(k, parts - k), frac(parts - k, parts), frac(k / g, parts), frac((parts - k) / g, parts / g)]);
      return { d, skills: ["ABSTRACT", "PATTERN"], type: "MCQ", stem: "What fraction of the shape is shaded? Give it in its **simplest form**.", figure: fig, ...o, solution: `${k} of ${parts} equal parts are shaded: ${frac(k, parts)}. Divide top and bottom by ${g}: ${frac(k / g, parts / g)}.` };
    }
    const o = textOptions(frac(k, parts), [frac(parts - k, parts), frac(k, parts + 1), frac(parts, k), frac(k, parts - k || 1)]);
    return { d, skills: ["ABSTRACT"], type: "MCQ", stem: "What fraction of the shape is shaded?", figure: fig, ...o, solution: `The shape has ${parts} equal parts and ${k} ${k === 1 ? "is" : "are"} shaded, so ${frac(k, parts)} is shaded.`, hint: "Count all the equal parts first. That number goes at the bottom." };
  },
};
export const fractionPick: Family = {
  id: "pic-fraction-pick", ds: [1, 2, 3],
  make(c, d) {
    const parts = d === 1 ? pick(c.r, [2, 3, 4]) : int(c.r, 4, 8);
    const k = int(c.r, 1, parts - 1);
    const col = pick(c.r, ["red", "blue", "green", "orange", "purple"] as Colour[]);
    const shape = pick(c.r, ["circle", "bar"] as const);
    const f = (p: number, s: number): Fig => ({ kind: "fraction", shape, parts: p, shaded: s, colour: col, alt: "Picture choice" });
    const wrongs = ([[parts, parts - k, `${parts - k} of ${parts} parts shaded`], [parts + 1, k, `${k} of ${parts + 1} parts shaded`], [parts, k === 1 ? 2 : k - 1, `${k === 1 ? 2 : k - 1} of ${parts} parts shaded`], [parts - 1, k, `${k} of ${parts - 1} parts shaded`]] as [number, number, string][]).filter(([p, s]) => p >= 2 && s >= 1 && s < p && !(p === parts && s === k));
    const opts = [choice(f(parts, k), `${k} of ${parts} parts shaded`), ...wrongs.slice(0, 3).map(([p, s, l]) => choice(f(p, s), l))];
    if (d === 3) {
      // Equivalent fraction: which picture shows the same amount as k/parts? Use double the parts.
      const opts3 = [choice(f(parts * 2, k * 2), `${k * 2} of ${parts * 2} parts shaded`), choice(f(parts * 2, k), `${k} of ${parts * 2} parts shaded`), choice(f(parts * 2, k * 2 - 1), `${k * 2 - 1} of ${parts * 2} parts shaded`), choice(f(parts, parts - k === k ? k - 1 || 1 : parts - k), `other`)];
      if (parts * 2 > 12) return null;
      opts3[3].label = `${(opts3[3].fig as { shaded: number }).shaded} of ${parts} parts shaded`;
      return pictureMcq(d, ["ABSTRACT", "EVALUATION"], `Which picture shows the **same amount** as **${frac(k, parts)}**?`, undefined, opts3, `${frac(k, parts)} = ${frac(k * 2, parts * 2)}: cutting every part in two doubles both numbers, so the shaded amount stays the same.`);
    }
    if (opts.length < 4) return null;
    return pictureMcq(d, ["ABSTRACT"], `Which picture shows **${frac(k, parts)}** shaded?`, undefined, opts, `${frac(k, parts)} means ${parts} equal parts with ${k} shaded.`);
  },
};
export const fractionCompare: Family = {
  id: "pic-fraction-compare", ds: [2, 3],
  make(c, d) {
    const [p1, p2] = d === 2 ? (() => { const p = int(c.r, 3, 8); return [p, p]; })() : [int(c.r, 2, 6), int(c.r, 3, 8)];
    const k1 = int(c.r, 1, p1 - 1), k2 = int(c.r, 1, p2 - 1);
    const v1 = k1 / p1, v2 = k2 / p2;
    const [ca, cb] = distinct(c.r, 2);
    const fig: Fig = { kind: "sequence", frames: [{ kind: "fraction", shape: "circle", parts: p1, shaded: k1, colour: ca, alt: "first" }, { kind: "fraction", shape: "circle", parts: p2, shaded: k2, colour: cb, alt: "second" }], alt: "Two circles with parts shaded" };
    const ans = Math.abs(v1 - v2) < 1e-9 ? "Both the same" : v1 > v2 ? `The ${ca} one` : `The ${cb} one`;
    const o = textOptions(ans, [`The ${ca} one`, `The ${cb} one`, "Both the same"]);
    return { d, skills: ["ABSTRACT", "EVALUATION"], type: "MCQ", stem: "Which circle has **more** of it shaded?", figure: fig, ...o, solution: `${ca}: ${frac(k1, p1)}, ${cb}: ${frac(k2, p2)}. ${ans === "Both the same" ? "These are equal, so both have the same amount shaded." : `So ${ans.replace("The ", "the ")} has more shaded.`}` };
  },
};

// ---------- Sharing and arrays ----------
const TREATS = [["🍬", "sweets"], ["🍪", "biscuits"], ["🍎", "apples"], ["🥭", "mangoes"], ["🖍️", "crayons"], ["🎈", "balloons"], ["⚽", "balls"], ["🥥", "coconuts"]];
export const share: Family = {
  id: "pic-share", ds: [1, 2, 3],
  make(c, d) {
    const [icon, name] = pick(c.r, TREATS);
    const g = d === 1 ? pick(c.r, [2, 3]) : int(c.r, 3, 6), each = int(c.r, 2, d === 1 ? 4 : 5), left = d === 3 ? int(c.r, 1, g - 1) : 0;
    const n = g * each + left;
    const fig: Fig = { kind: "icons", items: range(n).map(() => ({ icon })), cols: Math.min(8, n), alt: `${n} ${name}` };
    if (d === 3) return { d, skills: ["DECOMPOSITION"], type: "NUMERIC", stem: `These ${icon} ${name} are shared **equally** among **${g}** friends. How many are **left over**?`, figure: fig, answer: left, solution: `${n} ÷ ${g} = ${each} each, with ${left} left over (${g} × ${each} = ${g * each}).` };
    return { d, skills: ["DECOMPOSITION"], type: "NUMERIC", stem: `Share these ${icon} ${name} **equally** among **${g}** friends. How many does each friend get?`, figure: fig, answer: each, solution: `There are ${n}. ${n} ÷ ${g} = ${each}.`, hint: "Count them all, then make equal groups." };
  },
};
export const arrayCount: Family = {
  id: "pic-array", ds: [1, 2, 3],
  make(c, d) {
    const icon = pick(c.r, ["🌻", "🥥", "🍓", "⭐", "🧁", "🐣", "🌷", "🥚"]);
    const rows = int(c.r, 2, d === 1 ? 3 : 5), cols = int(c.r, 3, d === 1 ? 5 : 8);
    const fig: Fig = { kind: "icons", items: range(rows * cols).map(() => ({ icon })), cols, alt: `${rows} rows of ${cols}` };
    if (d === 3) {
      const add = int(c.r, 2, 4);
      return { d, skills: ["PATTERN", "DECOMPOSITION"], type: "NUMERIC", stem: `${add} more rows just like these are added. How many ${icon} will there be **altogether**?`, figure: fig, answer: (rows + add) * cols, solution: `Each row has ${cols}. ${rows} + ${add} = ${rows + add} rows, and ${rows + add} × ${cols} = ${(rows + add) * cols}.` };
    }
    return { d, skills: ["PATTERN", "DECOMPOSITION"], type: "NUMERIC", stem: `How many ${icon} are there? (Use rows, don't count one by one!)`, figure: fig, answer: rows * cols, solution: `${rows} rows of ${cols}: ${rows} × ${cols} = ${rows * cols}.`, hint: "Count one row, then count the rows." };
  },
};
export const powerSquare: Family = {
  id: "pic-power-square", ds: [2, 3],
  make(c, d) {
    const n = int(c.r, 3, 6);
    const icon = pick(c.r, ["🟦", "🟧", "🟩", "🟪"]);
    const fig: Fig = { kind: "icons", items: range(n * n).map(() => ({ icon })), cols: n, alt: `A square array ${n} by ${n}` };
    if (d === 2) return { d, skills: ["PATTERN", "ABSTRACT"], type: "MCQ", stem: "Which power tells how many tiles are in this square?", figure: fig, ...textOptions(`${n}²`, [`2${superscript(n)}`, `${n}³`, `${n} × 2`]), solution: `${n} rows of ${n} = ${n} × ${n} = ${n}² = ${n * n}.` };
    return { d, skills: ["PATTERN", "ABSTRACT"], type: "NUMERIC", stem: `This square has ${n}² tiles. How many tiles would a square with **one more row and one more column** have?`, figure: fig, answer: (n + 1) ** 2, solution: `(${n} + 1)² = ${n + 1} × ${n + 1} = ${(n + 1) ** 2}.` };
  },
};
const superscript = (n: number) => String(n).split("").map((ch) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[Number(ch)]).join("");

// ---------- Place value (abacus) ----------
const PLACES = ["O", "T", "H", "Th", "TTh", "L"];
export const abacus: Family = {
  id: "pic-abacus", ds: [1, 2, 3],
  make(c, d) {
    const nPlaces = Math.min(6, c.cls === 3 ? 3 : c.cls === 4 ? 4 : c.cls <= 6 ? 5 : 6) - (d === 1 && c.cls > 3 ? 1 : 0);
    const beads = range(nPlaces).map((i) => (i === 0 ? int(c.r, 1, 9) : int(c.r, d === 1 ? 1 : 0, 9)));
    const labels = PLACES.slice(0, nPlaces).reverse();
    const value = beads.reduce((a, b) => a * 10 + b, 0);
    const fig: Fig = { kind: "abacus", labels, beads, alt: "An abacus showing a number" };
    const key = labels.map((l) => l).join(", ");
    if (d === 3) {
      const i = int(c.r, 0, nPlaces - 2);
      if (beads[i] === 9) return null;
      const place = 10 ** (nPlaces - 1 - i), nv = value + place;
      return { d, skills: ["ABSTRACT", "PATTERN"], type: "NUMERIC", stem: `One more bead is put on the **${labels[i]}** rod. What number does the abacus show now?`, figure: fig, answer: nv, solution: `The abacus shows ${value.toLocaleString("en-IN")}. One bead on the ${labels[i]} rod is worth ${place.toLocaleString("en-IN")}, so the new number is ${nv.toLocaleString("en-IN")}.`, hint: `Rods: ${key} (L = lakhs, TTh = ten thousands, Th = thousands, H = hundreds, T = tens, O = ones).` };
    }
    return { d, skills: ["ABSTRACT"], type: "NUMERIC", stem: "What number does the abacus show?", figure: fig, answer: value, solution: `Read each rod from left to right: ${labels.map((l, i) => `${beads[i]} ${l}`).join(", ")} = ${value.toLocaleString("en-IN")}.`, hint: "Count the beads on each rod. An empty rod means 0." };
  },
};

// ---------- Number lines ----------
function numberLine(id: string, cfg: (c: Ctx, d: D) => { min: number; step: number; ticks: number; labelEvery: number; decimals?: number }): Family {
  return {
    id, ds: [1, 2, 3],
    make(c, d) {
      const { min, step, ticks, labelEvery, decimals = 0 } = cfg(c, d);
      const max = min + step * ticks;
      const round = (v: number) => Number(v.toFixed(decimals));
      let idx = int(c.r, 1, ticks - 1);
      if (idx % labelEvery === 0) idx++;
      if (idx >= ticks) return null;
      const v = round(min + idx * step);
      if (d === 3) {
        const move = int(c.r, 2, 5) * (c.r() < 0.5 ? -1 : 1);
        const end = round(v + move * step);
        if (end < min || end > max) return null;
        const fig: Fig = { kind: "numberline", min, max, step, labelEvery, decimals, marks: [{ v, label: "A", colour: "red" }], alt: "A number line with point A marked" };
        return { d, skills: ["ABSTRACT", "ALGORITHMIC"], type: "NUMERIC", stem: `Start at point **A**. Move **${Math.abs(move)} small step${Math.abs(move) > 1 ? "s" : ""} to the ${move > 0 ? "right" : "left"}**. Where do you land?`, figure: fig, answer: end, solution: `A is at ${v}. Each small step is ${step}, so ${Math.abs(move)} steps ${move > 0 ? "right adds" : "left takes away"} ${round(Math.abs(move) * step)}: ${end}.`, hint: "First work out what each small step is worth." };
      }
      const fig: Fig = { kind: "numberline", min, max, step, labelEvery, decimals, marks: [{ v, label: "?", colour: "red" }], alt: "A number line with an arrow at a missing number" };
      return { d, skills: ["ABSTRACT", "PATTERN"], type: "NUMERIC", stem: "What number is the **red arrow** pointing to?", figure: fig, answer: v, solution: `Each small step is ${step}. Count on from the nearest labelled number: the arrow is at ${v}.`, hint: "Find how much each small step is worth." };
    },
  };
}
export const numline = numberLine("pic-numline", (c, d) => {
  const step = c.cls <= 3 ? (d === 1 ? 1 : pick(c.r, [2, 5, 10])) : pick(c.r, d === 1 ? [1, 5, 10] : [10, 50, 100]);
  const start = c.cls <= 3 ? int(c.r, 0, 15) * 10 : int(c.r, 1, 30) * 100;
  return { min: start, step, ticks: 10, labelEvery: d === 1 ? 2 : 5 };
});
export const numlineInt = numberLine("pic-numline-int", (c) => ({ min: -int(c.r, 5, 9), step: 1, ticks: int(c.r, 12, 15), labelEvery: 2 }));
export const numlineDec = numberLine("pic-numline-dec", (c) => ({ min: int(c.r, 0, 8), step: 0.1, ticks: 20, labelEvery: 10, decimals: 1 }));

export const jumps: Family = {
  id: "pic-jumps", ds: [1, 2, 3],
  make(c, d) {
    const size = int(c.r, 2, d === 1 ? 4 : 9), count = d === 1 ? int(c.r, 2, 4) : 3;
    const from = d === 1 ? 0 : int(c.r, 0, 3) * size;
    const animal = pick(c.r, [["🐸", "frog"], ["🐰", "rabbit"], ["🦘", "kangaroo"], ["🦗", "grasshopper"]]);
    const shownJumps = d === 1 ? count : 2;
    const ticks = Math.max(from + size * (shownJumps + 1), 10);
    const fig: Fig = { kind: "numberline", min: 0, max: ticks, step: 1, labelEvery: size <= 5 ? size : 5, jumps: { from, size, count: shownJumps, colour: "green", icon: animal[0] }, alt: `A ${animal[1]} jumping along a number line` };
    if (d === 1) return { d, skills: ["PATTERN", "ALGORITHMIC"], type: "NUMERIC", stem: `The ${animal[0]} ${animal[1]} starts at 0 and makes the jumps shown. Where does it land?`, figure: fig, answer: size * count, solution: `${count} jumps of ${size}: ${range(count).map((i) => size * (i + 1)).join(", ")}. It lands on ${size * count}.` };
    const n = d === 2 ? int(c.r, 5, 8) : int(c.r, 10, 20);
    if (d === 2) return { d, skills: ["PATTERN", "ALGORITHMIC"], type: "NUMERIC", stem: `The ${animal[0]} ${animal[1]} starts at ${from} and keeps making jumps like these. Where is it after **${n} jumps**?`, figure: fig, answer: from + size * n, solution: `Each jump is ${size}. ${n} jumps = ${n} × ${size} = ${n * size}. ${from} + ${n * size} = ${from + n * size}.` };
    const target = from + size * n + (c.r() < 0.5 ? 0 : int(c.r, 1, size - 1));
    const yes = (target - from) % size === 0;
    return { d, skills: ["PATTERN", "EVALUATION"], type: "MCQ", stem: `The ${animal[0]} ${animal[1]} starts at ${from} and keeps jumping like this. Will it land **exactly** on **${target}**?`, figure: fig, ...textOptions(yes ? `Yes, after ${n} jumps` : "No, it jumps over it", yes ? ["No, it jumps over it", `Yes, after ${n + 1} jumps`, `Yes, after ${n - 1} jumps`] : [`Yes, after ${n} jumps`, `Yes, after ${n + 1} jumps`, "Only if it starts at 0"]), solution: `It lands on ${from} + a multiple of ${size}. ${target} − ${from} = ${target - from}, which is ${yes ? `${n} × ${size}, so yes` : `not a multiple of ${size}, so no`}.` };
  },
};

// ---------- Measuring ----------
export const ruler: Family = {
  id: "pic-ruler", ds: [1, 2, 3],
  make(c, d) {
    const start = d === 1 ? 0 : int(c.r, 1, 4);
    const length = d === 3 ? int(c.r, 3, 9) + 0.5 : int(c.r, 3, 10);
    if (start + length > 14) return null;
    const what = pick(c.r, [["pencil", "✏️"], ["crayon", "🖍️"]]);
    const fig: Fig = { kind: "ruler", cm: Math.ceil(start + length) + 1, start, length, colour: pick(c.r, ["yellow", "blue", "green", "red", "purple"] as Colour[]), alt: `A ${what[0]} above a ruler` };
    return { d, skills: ["ABSTRACT", "DECOMPOSITION"], type: "NUMERIC", stem: `How long is the ${what[0]} ${what[1]}, in cm?${start ? " (Careful: it does not start at 0!)" : ""}`, figure: fig, answer: length, solution: start ? `It starts at ${start} cm and ends at ${start + length} cm. ${start + length} − ${start} = ${length} cm.` : `It starts at 0 and ends at ${length}: ${length} cm.`, hint: start ? "Subtract the start from the end." : undefined };
  },
};
export const balance: Family = {
  id: "pic-balance", ds: [1, 2, 3],
  make(c, d) {
    const [icon, name] = pick(c.r, [["🍎", "apple"], ["🥭", "mango"], ["🍍", "pineapple"], ["🥥", "coconut"], ["🍉", "melon"], ["📦", "box"]]);
    const n = d === 1 ? 1 : int(c.r, 2, 4);
    const each = d === 1 ? pick(c.r, [100, 200, 300, 500, 600]) : pick(c.r, [100, 150, 200, 250, 300, 400]);
    const total = n * each;
    const weights: number[] = [];
    let left = total;
    for (const w of [1000, 500, 200, 100, 50]) while (left >= w && weights.length < 3) { weights.push(w); left -= w; }
    if (left) return null;
    const fig: Fig = { kind: "balance", left: { icon, n }, right: weights, unit: "g", alt: `A balance with ${n} ${name}s on one side and weights on the other` };
    if (d === 1) return { d, skills: ["ABSTRACT"], type: "NUMERIC", stem: `The scale is balanced. How heavy is the ${icon} ${name}, in grams?`, figure: fig, answer: total, solution: weights.length > 1 ? `The weights add up to ${weights.join(" + ")} = ${total} g, so the ${name} weighs ${total} g.` : `The scale is level, so the ${name} weighs the same as the ${total} g weight.` };
    return { d, skills: ["ABSTRACT", "DECOMPOSITION"], type: "NUMERIC", stem: `The scale is balanced. All the ${icon} weigh the same. How heavy is **one** ${name}, in grams?`, figure: fig, answer: each, solution: `The weights: ${weights.join(" + ")} = ${total} g. That is ${n} ${name}s, so one weighs ${total} ÷ ${n} = ${each} g.` };
  },
};
export const jug: Family = {
  id: "pic-jug", ds: [1, 2, 3],
  make(c, d) {
    const max = 1000, step = d === 1 ? 100 : 50, labelEvery = d === 1 ? 1 : 4;
    const level = step * int(c.r, 2, max / step - 1);
    const fig: Fig = { kind: "jug", max, step, labelEvery, level, unit: "ml", alt: "A measuring jug with water" };
    if (d === 3) return { d, skills: ["ABSTRACT", "DECOMPOSITION"], type: "NUMERIC", stem: "How many **more** ml of water are needed to fill the jug to **1 litre** (1000 ml)?", figure: fig, answer: max - level, solution: `The jug has ${level} ml. 1000 − ${level} = ${max - level} ml more.`, hint: "Each small mark is 50 ml." };
    return { d, skills: ["ABSTRACT"], type: "NUMERIC", stem: "How much water is in the jug, in ml?", figure: fig, answer: level, solution: `Read the mark at the top of the water: ${level} ml.${step === 50 ? " Each small mark is 50 ml." : ""}`, hint: d === 2 ? "There are 4 small steps between labels. Each is 50 ml." : undefined };
  },
};
export const money: Family = {
  id: "pic-money", ds: [1, 2, 3],
  make(c, d) {
    const pool = c.cls <= 3 ? (d === 1 ? [1, 2, 5, 10] : [1, 2, 5, 10, 20, 50]) : [2, 5, 10, 20, 50, 100, 200];
    const items = range(d === 1 ? int(c.r, 3, 4) : int(c.r, 4, 6)).map(() => pick(c.r, pool));
    const total = items.reduce((a, b) => a + b, 0);
    const fig: Fig = { kind: "money", items, alt: "Some coins and notes" };
    if (d === 3) {
      const [icon, thing] = pick(c.r, [["🧸", "teddy"], ["📚", "book set"], ["🪁", "kite"], ["🎒", "school bag"], ["⚽", "football"]]);
      const cost = int(c.r, Math.ceil(total * 0.4), total - 1);
      return { d, skills: ["DECOMPOSITION", "ALGORITHMIC"], type: "NUMERIC", stem: `You have this money. You buy a ${icon} ${thing} for **₹${cost}**. How much money is left?`, figure: fig, answer: total - cost, solution: `Total: ${[...items].sort((a, b) => b - a).map((v) => `₹${v}`).join(" + ")} = ₹${total}. ₹${total} − ₹${cost} = ₹${total - cost}.` };
    }
    return { d, skills: ["DECOMPOSITION"], type: "NUMERIC", stem: "How much money is there altogether, in ₹?", figure: fig, answer: total, solution: `Start with the biggest: ${[...items].sort((a, b) => b - a).map((v) => `₹${v}`).join(" + ")} = ₹${total}.`, hint: "Add the notes first, then the coins." };
  },
};

// ---------- Sorting pictures (EVS) ----------
type Group = { name: string; noun: string; icons: [string, string][] };
const G = (name: string, noun: string, icons: [string, string][]): Group => ({ name, noun, icons });
const TOPICS: Record<string, Group[]> = {
  food: [G("fruit", "fruits", [["🍎", "apple"], ["🍌", "banana"], ["🍇", "grapes"], ["🍊", "orange"], ["🍓", "strawberry"], ["🍍", "pineapple"], ["🥭", "mango"], ["🍉", "watermelon"]]), G("vegetable", "vegetables", [["🥕", "carrot"], ["🥦", "broccoli"], ["🌽", "corn"], ["🍆", "brinjal"], ["🥔", "potato"], ["🧅", "onion"], ["🥒", "cucumber"]]), G("food from animals", "foods from animals", [["🥛", "milk"], ["🥚", "egg"], ["🧀", "cheese"], ["🍯", "honey"]])],
  animals: [G("bird", "birds", [["🐦", "sparrow"], ["🦜", "parrot"], ["🦆", "duck"], ["🦉", "owl"], ["🦚", "peacock"], ["🐓", "rooster"]]), G("water animal", "water animals", [["🐟", "fish"], ["🐠", "tropical fish"], ["🐙", "octopus"], ["🐬", "dolphin"], ["🦀", "crab"], ["🐳", "whale"]]), G("four-legged animal", "four-legged animals", [["🐄", "cow"], ["🐐", "goat"], ["🐘", "elephant"], ["🐕", "dog"], ["🐈", "cat"], ["🐎", "horse"], ["🦁", "lion"], ["🐅", "tiger"]])],
  plants: [G("flower", "flowers", [["🌻", "sunflower"], ["🌷", "tulip"], ["🌹", "rose"], ["🌼", "daisy"], ["🌺", "hibiscus"]]), G("tree", "trees", [["🌳", "leafy tree"], ["🌴", "palm tree"], ["🌲", "pine tree"]]), G("fruit", "fruits", [["🍎", "apple"], ["🍌", "banana"], ["🥭", "mango"], ["🍊", "orange"]])],
  transport: [G("land vehicle", "land vehicles", [["🚗", "car"], ["🚌", "bus"], ["🚲", "bicycle"], ["🛺", "auto"], ["🚂", "train"], ["🚜", "tractor"], ["🏍️", "motorbike"]]), G("water vehicle", "water vehicles", [["🚢", "ship"], ["⛵", "sailboat"], ["🛶", "canoe"], ["🚤", "speedboat"]]), G("air vehicle", "air vehicles", [["✈️", "aeroplane"], ["🚁", "helicopter"], ["🛩️", "small plane"], ["🪂", "parachute"]])],
  waste: [G("wet (food) waste", "pieces of wet waste", [["🍌", "banana peel"], ["🍉", "watermelon rind"], ["🥚", "egg shell"], ["🍎", "apple core"], ["🥬", "vegetable peels"]]), G("dry waste that can be recycled", "pieces of recyclable dry waste", [["📰", "newspaper"], ["🥫", "tin can"], ["🧴", "plastic bottle"], ["📦", "cardboard box"], ["🍾", "glass bottle"]])],
};
export function iconCount(topic: string): Family {
  return {
    id: `pic-icons:${topic}`, ds: [1, 2, 3],
    make(c, d) {
      const groups = TOPICS[topic];
      const n = d === 1 ? 6 : d === 2 ? 9 : 12;
      const legsQ = d === 3 && topic === "animals";
      const items: { icon: string; g: number }[] = range(n).map(() => { const g = legsQ ? pick(c.r, [0, 2]) : int(c.r, 0, groups.length - 1); return { icon: pick(c.r, groups[g].icons)[0], g }; });
      const fig: Fig = { kind: "icons", items: items.map((x) => ({ icon: x.icon })), cols: d === 1 ? 6 : d === 2 ? 5 : 6, alt: "A set of pictures to sort" };
      const g = int(c.r, 0, groups.length - 1);
      const cnt = items.filter((x) => x.g === g).length;
      if (legsQ) {
        const legs = items.reduce((a, x) => a + (x.g === 0 ? 2 : x.g === 2 ? 4 : 0), 0);
        if (!legs) return null;
        return { d, skills: ["DECOMPOSITION", "ABSTRACT"], type: "NUMERIC", stem: "How many **legs** do all these animals have **altogether**? (Birds have 2 legs.)", figure: fig, answer: legs, solution: `Birds: ${items.filter((x) => x.g === 0).length} × 2; four-legged animals: ${items.filter((x) => x.g === 2).length} × 4. Total ${legs} legs.` };
      }
      if (d === 3) {
        const other = items.length - cnt;
        return { d, skills: ["DECOMPOSITION", "ABSTRACT"], type: "NUMERIC", stem: `How many of these are **not** ${groups[g].noun}?`, figure: fig, answer: other, solution: `There are ${items.length} pictures and ${cnt} ${groups[g].noun}, so ${items.length} − ${cnt} = ${other} are not.` };
      }
      return { d, skills: ["ABSTRACT", "DECOMPOSITION"], type: "NUMERIC", stem: `How many of these are **${groups[g].noun}**?`, figure: fig, answer: cnt, solution: `The ${groups[g].noun}: ${items.filter((x) => x.g === g).map((x) => x.icon).join(" ") || "none"}: ${cnt}.` };
    },
  };
}
export function oddIcon(topic: string): Family {
  return {
    id: `pic-odd-icon:${topic}`, ds: [1, 2],
    make(c, d) {
      // Plants: flowers vs trees only (fruits also come from plants, so "fruit" as the odd one out is arguable).
      const groups = topic === "plants" ? TOPICS.plants.filter((g) => g.name === "flower" || g.name === "tree") : TOPICS[topic];
      const [gi, go] = sample(c.r, range(groups.length), 2);
      const same = sample(c.r, groups[gi].icons, 3), odd = pick(c.r, groups[go].icons);
      if (groups[gi].icons.some(([i]) => i === odd[0])) return null;
      const one = (x: [string, string]): Fig => ({ kind: "icons", items: [{ icon: x[0] }], cols: 1, alt: x[1] });
      return pictureMcq(d, ["ABSTRACT", "EVALUATION"], "Three of these belong together. Which one is the **odd one out**?", undefined, [choice(one(odd), odd[1]), ...same.map((s) => choice(one(s), s[1]))], `${same.map((s) => s[1]).join(", ")} are all ${groups[gi].noun}. The ${odd[1]} is a ${groups[go].name}.`);
    },
  };
}

// ---------- AI with pictures ----------
const PETS: [string, string][] = [["🐱", "cats"], ["🐶", "dogs"], ["🐰", "rabbits"], ["🐹", "hamsters"], ["🐦", "birds"], ["🐢", "tortoises"]];
export const aiAccuracy: Family = {
  id: "pic-ai-accuracy", ds: [1, 2, 3],
  make(c, d) {
    const total = d === 1 ? 8 : d === 2 ? 10 : pick(c.r, [20, 5]);
    const right = int(c.r, Math.ceil(total / 2), total - 1);
    const marks = sample(c.r, range(total), right);
    const pets = sample(c.r, PETS, 2);
    const fig: Fig = { kind: "icons", items: range(total).map((i) => ({ icon: pick(c.r, pets)[0], mark: marks.includes(i) ? "tick" : "cross" })), cols: total > 10 ? 10 : 5, alt: "Pictures labelled by an AI, with ticks for correct and crosses for wrong" };
    const stem0 = `An AI looked at these photos and named each animal. ✅ = it was **right**, ❌ = it was **wrong**.`;
    if (d === 1) return { d, skills: ["AI_CONCEPT", "DATA"], type: "NUMERIC", stem: `${stem0} How many did it get **wrong**?`, figure: fig, answer: total - right, solution: `Count the red crosses: ${total - right}.` };
    const pct = (right / total) * 100;
    return { d, skills: ["AI_CONCEPT", "DATA", "EVALUATION"], type: "NUMERIC", stem: `${stem0} What is its **accuracy** as a percentage?`, figure: fig, answer: pct, solution: `It got ${right} out of ${total} right. ${right} ÷ ${total} × 100 = ${pct}%.`, hint: "Accuracy = right answers ÷ all answers × 100." };
  },
};
export const aiDataset: Family = {
  id: "pic-ai-dataset", ds: [1, 2, 3],
  make(c, d) {
    const pets = sample(c.r, PETS, 3);
    const counts = [int(c.r, 5, 8), int(c.r, 3, 6), 1];
    if (counts[0] === counts[1]) counts[0]++;
    const order = sample(c.r, range(3), 3);
    const items = order.flatMap((i) => range(counts[i]).map(() => ({ icon: pets[i][0] })));
    const shuffled = sample(c.r, items, items.length);
    const fig: Fig = { kind: "icons", items: shuffled, cols: 8, alt: "Photos used to train an AI" };
    if (d === 3) {
      const need = (counts[0] - counts[2]) + (counts[0] - counts[1]);
      return { d, skills: ["AI_CONCEPT", "ETHICS", "DATA"], type: "NUMERIC", stem: "These photos are used to **train** an AI. To make it fair, every animal should have **as many photos as the most common one**. How many **more** photos are needed in total?", figure: fig, answer: need, solution: `${pets[0][1]}: ${counts[0]}, ${pets[1][1]}: ${counts[1]}, ${pets[2][1]}: ${counts[2]}. Extra: (${counts[0]} − ${counts[1]}) + (${counts[0]} − ${counts[2]}) = ${need}.` };
    }
    const o = textOptions(`${pets[2][0]} ${pets[2][1]}`, [`${pets[0][0]} ${pets[0][1]}`, `${pets[1][0]} ${pets[1][1]}`, "All the same"]);
    return { d, skills: ["AI_CONCEPT", "ETHICS"], type: "MCQ", stem: `An AI learns to recognise animals from these photos. Which animal will it **most likely get wrong**?`, figure: fig, ...o, solution: `An AI learns from examples. There is only ${counts[2]} photo of ${pets[2][1]}, so it has hardly learnt what they look like. More (and more varied) examples make it fairer.` };
  },
};

// ---------- Geometry ----------
export const angleType: Family = {
  id: "pic-angle", ds: [1, 2, 3],
  make(c, d) {
    const kind = pick(c.r, d === 1 ? ["acute", "right", "obtuse"] : ["acute", "right", "obtuse", "straight"]);
    const deg = kind === "acute" ? pick(c.r, [25, 35, 45, 60, 70]) : kind === "right" ? 90 : kind === "obtuse" ? pick(c.r, [110, 125, 140, 155]) : 180;
    const fig: Fig = { kind: "angle", deg, colour: pick(c.r, ["red", "blue", "green", "purple", "orange"] as Colour[]), alt: "An angle between two arms" };
    if (d === 3) {
      if (kind === "straight") return null;
      const more = 180 - deg;
      return { d, skills: ["ABSTRACT"], type: "MCQ", stem: "The coloured arm turns further **anticlockwise** until the two arms make a **straight line**. Roughly how many more degrees does it turn?", figure: fig, ...textOptions(`${more}°`, [`${deg}°`, `${(more + 40) % 180 || 20}°`, `${360 - deg}°`]), solution: `The angle is about ${deg}°. A straight line is 180°, so it turns 180° − ${deg}° = ${more}° more.` };
    }
    const name = { acute: "Acute (less than a right angle)", right: "Right angle (exactly 90°)", obtuse: "Obtuse (more than a right angle, less than a straight line)", straight: "Straight angle (180°)" } as Record<string, string>;
    return { d, skills: ["ABSTRACT"], type: "MCQ", stem: "What kind of angle is this?", figure: fig, ...textOptions(name[kind], Object.values(name)), solution: `This angle is ${deg}°, so it is ${({ acute: "an acute angle", right: "a right angle", obtuse: "an obtuse angle", straight: "a straight angle" } as Record<string, string>)[kind]}. Compare it with the corner of a page (90°).` };
  },
};
export const linesPick: Family = {
  id: "pic-lines", ds: [1, 2, 3],
  make(c, d) {
    const a = int(c.r, -30, 30) * (Math.PI / 180);
    const seg = (cx: number, cy: number, ang: number, len: number): [number, number, number, number] => [cx - (len / 2) * Math.cos(ang), cy - (len / 2) * Math.sin(ang), cx + (len / 2) * Math.cos(ang), cy + (len / 2) * Math.sin(ang)];
    const r1 = (v: number) => Math.round(v);
    const S = (s: [number, number, number, number]) => s.map(r1) as [number, number, number, number];
    const col = pick(c.r, ["red", "green", "purple"] as Colour[]);
    const mk = (segs: [number, number, number, number][], alt: string): Fig => ({ kind: "lines", segs: segs.map(S), colour: col, alt });
    const parallel = mk([seg(50, 30, a, 90), seg(50, 70, a, 90)], "Two parallel lines");
    const perp = mk([seg(50, 50, a, 90), seg(50, 50, a + Math.PI / 2, 90)], "Two perpendicular lines");
    const cross = mk([seg(50, 50, a, 90), seg(50, 50, a + Math.PI / 4 + int(c.r, 0, 1) * 0.3, 90)], "Two lines crossing");
    const meet = mk([seg(50, 25, a + 0.12, 90), seg(50, 75, a - 0.12, 90)], "Two lines that will meet if made longer");
    if (d === 1) return pictureMcq(d, ["ABSTRACT"], "Which picture shows **parallel** lines (they never meet, however long you draw them)?", undefined, [choice(parallel, "parallel"), choice(cross, "crossing"), choice(perp, "perpendicular"), choice(meet, "lines that get closer")], "Parallel lines stay the same distance apart all along, like railway tracks.");
    if (d === 2) return pictureMcq(d, ["ABSTRACT"], "Which picture shows **perpendicular** lines (they meet at a right angle)?", undefined, [choice(perp, "perpendicular"), choice(cross, "crossing, not at a right angle"), choice(parallel, "parallel"), choice(meet, "lines that get closer")], "Perpendicular lines cross to make four right angles, like the corner of a page.");
    return pictureMcq(d, ["ABSTRACT", "EVALUATION"], "Which pair of lines is **not parallel**, even though the lines do **not touch** in the picture?", undefined, [choice(meet, "they get closer, so they would meet"), choice(parallel, "parallel"), choice(perp, "perpendicular (they touch)"), choice(cross, "crossing (they touch)")], "Lines that get closer together will meet if you extend them, so they are not parallel. The crossing pairs already meet.");
  },
};

// ---------- Calendar ----------
const MONTHS: [string, number][] = [["January", 31], ["February", 28], ["March", 31], ["April", 30], ["May", 31], ["June", 30], ["July", 31], ["August", 31], ["September", 30], ["October", 31], ["November", 30], ["December", 31]];
const WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const calendar: Family = {
  id: "pic-calendar", ds: [1, 2, 3],
  make(c, d) {
    const [month, days] = pick(c.r, MONTHS);
    const start = int(c.r, 0, 6), date = int(c.r, 3, days - 3);
    const dow = (dd: number) => WEEK[(start + dd - 1) % 7];
    const fig: Fig = { kind: "calendar", month, start, days, marks: [{ d: date, colour: "purple" }], alt: `Calendar for ${month}` };
    if (d === 1) return { d, skills: ["ABSTRACT"], type: "MCQ", stem: `The coloured date is the school fair. On which **day of the week** is it?`, figure: fig, ...textOptions(dow(date), [dow(date + 1), dow(date + 6), dow(date + 2)]), solution: `Look up from ${date} to the top of its column: ${dow(date)}.` };
    if (d === 2) {
      const day = int(c.r, 0, 6);
      const cnt = range(days).filter((k) => (start + k) % 7 === day).length;
      return { d, skills: ["ABSTRACT", "DECOMPOSITION"], type: "NUMERIC", stem: `How many **${WEEK[day]}s** are there in ${month} this year?`, figure: { ...fig, marks: [] }, answer: cnt, solution: `Count down the ${WEEK[day].slice(0, 3)} column: ${cnt}.` };
    }
    const add = pick(c.r, [7, 10, 14, 15, 20]);
    const end = date + add;
    const ans = WEEK[(start + end - 1) % 7];
    const sol = end > days ? `${date} + ${add} = ${end}, which goes past the end of ${month} (${days} days). Days of the week repeat every 7, so ${add} days later is ${add % 7 === 0 ? "the same day" : `${add % 7} days on`}: ${ans}.` : `${date} + ${add} = ${end}. That is a ${ans}. (Every 7 days the day of the week repeats.)`;
    return { d, skills: ["PATTERN", "ALGORITHMIC"], type: "MCQ", stem: `Nani arrives on the coloured date and stays for **${add} days**. She leaves ${add} days later. On which day of the week does she leave?`, figure: fig, ...textOptions(ans, [WEEK[(start + end) % 7], WEEK[(start + end - 2) % 7], WEEK[(start + date - 1) % 7]]), solution: sol };
  },
};

// ---------- Number grid ----------
const isPrime = (n: number) => n > 1 && range(Math.floor(Math.sqrt(n)) - 1).every((i) => n % (i + 2) !== 0);
export const numgridPrime: Family = {
  id: "pic-numgrid-prime", ds: [1, 2, 3],
  make(c, d) {
    const from = d === 1 ? 1 : pick(c.r, [1, 11, 21, 31, 41, 51]), to = from + 29;
    const vals = sample(c.r, range(30).map((i) => from + i), d === 1 ? 5 : 7).sort((a, b) => a - b);
    const fig: Fig = { kind: "numgrid", from, to, cols: 10, marks: vals.map((v) => ({ v, colour: "orange" as Colour })), alt: `A number grid from ${from} to ${to} with some numbers circled` };
    const primes = vals.filter(isPrime);
    if (d === 3) {
      const all = range(30).map((i) => from + i).filter(isPrime);
      return { d, skills: ["PATTERN", "ABSTRACT"], type: "NUMERIC", stem: `How many **prime numbers** are there on this whole grid (${from} to ${to})?`, figure: { ...fig, marks: [] }, answer: all.length, solution: `The primes from ${from} to ${to} are ${all.join(", ")}: ${all.length}.`, hint: "A prime has exactly two factors: 1 and itself." };
    }
    return { d, skills: ["PATTERN", "ABSTRACT"], type: "NUMERIC", stem: "How many of the **circled** numbers are **prime**?", figure: fig, answer: primes.length, solution: `Circled: ${vals.join(", ")}. Prime ones: ${primes.join(", ") || "none"}, so ${primes.length}.`, hint: "A prime has exactly two factors: 1 and itself (1 is not prime)." };
  },
};
export const numgridMultiples: Family = {
  id: "pic-numgrid-multiples", ds: [1, 2, 3],
  make(c, d) {
    const k = d === 1 ? pick(c.r, [2, 5, 10]) : pick(c.r, [3, 4, 6, 7, 9]);
    const from = d === 1 ? 1 : pick(c.r, [1, 21, 41]), to = from + 29;
    const mult = range(30).map((i) => from + i).filter((v) => v % k === 0);
    const col: Colour = pick(c.r, ["green", "blue", "pink", "orange"] as Colour[]);
    if (d === 3) {
      const show = mult.slice(0, -1);
      const missing = mult[mult.length - 1];
      const decoy = sample(c.r, range(30).map((i) => from + i).filter((v) => v % k !== 0 && v > show[show.length - 1]), 3);
      if (decoy.length < 3) return null;
      const fig: Fig = { kind: "numgrid", from, to, cols: 10, marks: show.map((v) => ({ v, colour: col })), alt: "A number grid with a pattern coloured" };
      return { d, skills: ["PATTERN", "ALGORITHMIC"], type: "MCQ", stem: "The coloured numbers follow a rule. Which number should be coloured **next**?", figure: fig, ...textOptions(String(missing), decoy.map(String)), solution: `The coloured numbers are multiples of ${k} (${show.slice(0, 3).join(", ")}, …). The next is ${missing}.` };
    }
    const fig: Fig = { kind: "numgrid", from, to, cols: 10, marks: mult.map((v) => ({ v, colour: col })), alt: "A number grid with a pattern coloured" };
    return { d, skills: ["PATTERN"], type: "MCQ", stem: "What is the rule for the **coloured** numbers?", figure: fig, ...textOptions(`multiples of ${k}`, [2, 3, 4, 5, 6, 7, 9, 10].filter((x) => x !== k && (k % x !== 0)).slice(0, 3).map((x) => `multiples of ${x}`)), solution: `${mult.slice(0, 4).join(", ")}, … go up in steps of ${k}: they are the multiples of ${k}.` };
  },
};

// ---------- Growing patterns / algebra ----------
export const matchsticks: Family = {
  id: "pic-matchsticks", ds: [1, 2, 3],
  make(c, d) {
    const fig: Fig = { kind: "sequence", frames: [1, 2, 3].map((n) => ({ kind: "matchsticks", squares: n, alt: `${n} squares` }) as Fig), alt: "Matchstick squares in a row: 1, 2 and 3 squares" };
    if (d === 1) return { d, skills: ["PATTERN"], type: "NUMERIC", stem: "Matchsticks make squares in a row. How many matchsticks are needed for **4 squares**?", figure: fig, answer: 13, solution: "4, 7, 10 … each new square needs 3 more sticks. 10 + 3 = 13." };
    if (d === 2) { const n = int(c.r, 5, 12); return { d, skills: ["PATTERN", "ALGORITHMIC"], type: "NUMERIC", stem: `How many matchsticks are needed for **${n} squares** in a row?`, figure: fig, answer: 3 * n + 1, solution: `The first square needs 4; each new one adds 3. So ${n} squares need 4 + 3 × ${n - 1} = ${3 * n + 1}.` }; }
    return c.r() < 0.5
      ? { d, skills: ["PATTERN", "ABSTRACT"], type: "MCQ", stem: "Which rule gives the number of matchsticks for **n** squares?", figure: fig, ...textOptions("3n + 1", ["4n", "3n", "n + 3"]), solution: "Each square adds 3 sticks, plus 1 to start the row: 3n + 1. Check: n = 2 gives 7 ✓." }
      : (() => { const s = pick(c.r, [31, 46, 61, 100]); const n = (s - 1) / 3; return Number.isInteger(n) ? { d, skills: ["PATTERN", "ALGORITHMIC"], type: "NUMERIC" as const, stem: `Aarav uses **${s} matchsticks** to make squares like these. How many squares does he make?`, figure: fig, answer: n, solution: `3n + 1 = ${s}, so 3n = ${s - 1} and n = ${n}.` } : null; })();
  },
};
export const areaModel: Family = {
  id: "pic-area-model", ds: [2, 3],
  make(c, d) {
    const h = int(c.r, 3, 9), a = pick(c.r, [10, 20, 30]), b = int(c.r, 2, 9);
    if (d === 2) {
      const fig: Fig = { kind: "areamodel", height: h, widths: [a, b], labels: [String(a), String(b)], hLabel: String(h), alt: "A rectangle split into two parts" };
      return { d, skills: ["DECOMPOSITION", "ABSTRACT"], type: "NUMERIC", stem: `Find the **total area** of the rectangle. (${h} × ${a + b} = ${h} × ${a} + ${h} × ${b})`, figure: fig, answer: h * (a + b), solution: `${h} × ${a} = ${h * a} and ${h} × ${b} = ${h * b}. Total ${h * a} + ${h * b} = ${h * (a + b)}.` };
    }
    const fig: Fig = { kind: "areamodel", height: h, widths: [a, b], labels: [String(a), "?"], hLabel: String(h), alt: "A rectangle split into two parts, one width unknown" };
    return { d, skills: ["DECOMPOSITION", "ALGORITHMIC"], type: "NUMERIC", stem: `The **total area** of the whole rectangle is **${h * (a + b)}**. What is the missing width **?**`, figure: fig, answer: b, solution: `The left part is ${h} × ${a} = ${h * a}. The right part is ${h * (a + b)} − ${h * a} = ${h * b}, so ? = ${h * b} ÷ ${h} = ${b}.` };
  },
};
export const shapeMeasure: Family = {
  id: "pic-perimeter", ds: [1, 2, 3],
  make(c, d) {
    const n = 6, k = d === 1 ? int(c.r, 3, 5) : int(c.r, 6, 10);
    const cells = new Map<string, [number, number]>([["2,2", [2, 2]]]);
    while (cells.size < k) { const [r, cc] = pick(c.r, [...cells.values()]); const [dr, dc] = pick(c.r, [[1, 0], [-1, 0], [0, 1], [0, -1]]); const nr = r + dr, nc = cc + dc; if (nr >= 0 && nc >= 0 && nr < n && nc < n) cells.set(`${nr},${nc}`, [nr, nc]); }
    const list = [...cells.values()];
    const col = pick(c.r, ["blue", "green", "orange", "purple", "pink"] as Colour[]);
    const fig: Fig = { kind: "pixels", n, cells: list.map(([r, cc]) => [r, cc, col]), alt: "A shape made of squares on a grid" };
    const area = list.length, per = perimeter(list);
    const askArea = d === 1 || (d === 2 && c.r() < 0.5);
    return askArea
      ? { d, skills: ["DECOMPOSITION", "ABSTRACT"], type: "NUMERIC", stem: "Each small square is **1 square cm**. What is the **area** of the coloured shape, in square cm?", figure: fig, answer: area, solution: `Count the coloured squares: ${area}, so the area is ${area} sq cm.` }
      : { d, skills: ["DECOMPOSITION", "ABSTRACT"], type: "NUMERIC", stem: "Each small square has sides of **1 cm**. What is the **perimeter** (distance all the way round) of the coloured shape, in cm?", figure: fig, answer: per, solution: `Walk round the outside edge and count the square sides: ${per} cm.`, hint: "Count only the outside edges, not the lines between coloured squares." };
  },
};

// ---------- Binary cards ----------
export const binaryCards: Family = {
  id: "pic-binary", ds: [1, 2, 3],
  make(c, d) {
    const n = d === 1 ? 4 : 5;
    const val = int(c.r, 1, 2 ** n - 1);
    const bits = val.toString(2).padStart(n, "0").split("").map(Number);
    const fig: Fig = { kind: "binary", bits, alt: "Binary dot cards, some face up" };
    if (d === 3) {
      const t = int(c.r, 5, 2 ** n - 2);
      const tb = t.toString(2).padStart(n, "0").split("").map(Number);
      const flip = (b: number[], i: number) => b.map((x, j) => (j === i ? 1 - x : x));
      const card = (b: number[]): Fig => ({ kind: "binary", bits: b, alt: "Picture choice" });
      const show = (b: number[]) => b.map((x, i) => (x ? 2 ** (n - 1 - i) : 0)).filter(Boolean).join(" + ") || "0";
      const wrong = [flip(tb, 0), flip(tb, n - 1), flip(tb, Math.floor(n / 2))];
      return pictureMcq(d, ["ABSTRACT", "PATTERN"], `Each card shows dots: 16, 8, 4, 2, 1. Which set of face-up cards shows **${t}** dots?`, undefined, [choice(card(tb), show(tb)), ...wrong.map((w) => choice(card(w), show(w)))], `${t} = ${show(tb)}. In binary that is ${tb.join("")}.`);
    }
    return { d, skills: ["ABSTRACT", "PATTERN"], type: "NUMERIC", stem: d === 1 ? "Add up the dots on the **face-up** cards. How many dots are showing?" : "Face-up = 1, face-down = 0. What number do these cards show?", figure: fig, answer: val, solution: `${bits.map((b, i) => (b ? 2 ** (n - 1 - i) : 0)).filter(Boolean).join(" + ")} = ${val}. In binary: ${bits.join("")}.` };
  },
};

// ---------- Beads ----------
export const beadsPattern: Family = {
  id: "pic-beads-pattern", ds: [1, 2, 3],
  make(c, d) {
    const unitLen = d === 1 ? 2 : d === 2 ? 3 : 4;
    const cols = distinct(c.r, Math.min(unitLen, 3));
    const unit: Colour[] = range(unitLen).map((i) => cols[i % cols.length]);
    if (d === 3) unit[3] = cols[1]; // e.g. A B C B
    if (new Set(unit).size < 2) return null;
    const shown = unitLen * 3;
    const fig: Fig = { kind: "beads", colours: range(shown).map((i) => unit[i % unitLen]), alt: "A string of coloured beads in a repeating pattern" };
    const pos = d === 1 ? shown + 1 : d === 2 ? int(c.r, 15, 30) : int(c.r, 30, 60);
    const ans = unit[(pos - 1) % unitLen];
    return { d, skills: ["PATTERN", "ALGORITHMIC"], type: "MCQ", stem: `The beads repeat in a pattern. What colour is bead number **${pos}**?`, figure: fig, ...textOptions(ans, [...new Set(cols)].filter((x) => x !== ans).concat(["orange", "green", "blue"].filter((x) => !cols.includes(x as Colour)) as Colour[]).slice(0, 3)), solution: `The pattern repeats every ${unitLen} beads (${unit.join(", ")}). ${pos} ÷ ${unitLen} = ${Math.floor(pos / unitLen)} remainder ${pos % unitLen}. ${pos % unitLen === 0 ? `Remainder 0 means the last bead of a group` : `Remainder ${pos % unitLen} means bead ${pos % unitLen} of a group`}: ${ans}.` };
  },
};
export const beadsRatio: Family = {
  id: "pic-beads-ratio", ds: [1, 2, 3],
  make(c, d) {
    const a = int(c.r, 1, 3), b = int(c.r, 2, 4);
    if (a === b) return null;
    const [ca, cb] = distinct(c.r, 2);
    const reps = 3;
    const fig: Fig = { kind: "beads", colours: range(reps).flatMap(() => [...range(a).map(() => ca), ...range(b).map(() => cb)]), alt: "A bead string with a repeating group of two colours" };
    if (d === 1) return { d, skills: ["PATTERN", "ABSTRACT"], type: "MCQ", stem: `For every **${a}** ${ca} bead${a > 1 ? "s" : ""}, how many ${cb} beads are there?`, figure: fig, ...textOptions(String(b), [String(a), String(a + b), String(b + 1)]), solution: `Each group has ${a} ${ca} and ${b} ${cb}: the ratio is ${a} : ${b}.` };
    if (d === 2) { const m = int(c.r, 4, 9); return { d, skills: ["PATTERN", "DECOMPOSITION"], type: "NUMERIC", stem: `A longer string follows the same pattern and has **${a * m} ${ca}** beads. How many **${cb}** beads does it have?`, figure: fig, answer: b * m, solution: `${ca} : ${cb} = ${a} : ${b}. ${a * m} is ${m} × ${a}, so ${cb} = ${m} × ${b} = ${b * m}.` }; }
    const total = (a + b) * int(c.r, 4, 8);
    return { d, skills: ["PATTERN", "DECOMPOSITION"], type: "NUMERIC", stem: `A string follows the same pattern and has **${total} beads** in all. How many are **${ca}**?`, figure: fig, answer: (total / (a + b)) * a, solution: `Each group has ${a + b} beads, of which ${a} are ${ca}. ${total} ÷ ${a + b} = ${total / (a + b)} groups, so ${total / (a + b)} × ${a} = ${(total / (a + b)) * a} ${ca} beads.` };
  },
};

export const MORE_PICTURE_FAMILIES: Family[] = [fractionName, fractionPick, fractionCompare, share, arrayCount, powerSquare, abacus, numline, numlineInt, numlineDec, jumps, ruler, balance, jug, money, ...Object.keys(TOPICS).flatMap((t) => [iconCount(t), oddIcon(t)]), aiAccuracy, aiDataset, angleType, linesPick, calendar, numgridPrime, numgridMultiples, matchsticks, areaModel, shapeMeasure, binaryCards, beadsPattern, beadsRatio];

const F = { frac: ["pic-fraction-name", "pic-fraction-pick", "pic-fraction-compare"], ai: ["pic-ai-dataset", "pic-ai-accuracy"] };
export const MORE_PICTURE_PLAN: Record<string, string[]> = {
  "3-CT-3": ["pic-abacus", "pic-numline", "pic-array"], "3-CT-4": ["pic-calendar", "pic-money", "pic-beads-pattern"], "3-CT-6": ["pic-abacus", "pic-numline"], "3-CT-7": ["pic-array", "pic-beads-pattern", "pic-money"], "3-CT-8": ["pic-share", "pic-fraction-name", "pic-fraction-pick"], "3-CT-9": ["pic-abacus", "pic-numline", "pic-jumps"], "3-CT-11": ["pic-balance", "pic-jug"], "3-CT-12": ["pic-money", "pic-jumps"],
  "4-CT-4": ["pic-abacus", "pic-numline"], "4-CT-5": ["pic-share", ...F.frac.slice(0, 2)], "4-CT-6": ["pic-ruler", "pic-perimeter"], "4-CT-7": ["pic-bar-chart", "pic-pictograph", "pic-icons:waste"], "4-CT-8": ["pic-balance", "pic-jug"], "4-CT-9": ["pic-array", "pic-share", "pic-jumps"], "4-CT-13": ["pic-money", "pic-icons:transport", "pic-calendar"],
  "5-CT-1": ["pic-abacus", "pic-numline"], "5-CT-2": F.frac, "5-CT-4": ["pic-money", "pic-calendar", "pic-numline"], "5-CT-5": ["pic-ruler", "pic-numline", "pic-grid-map"], "5-CT-6": ["pic-pictograph", "pic-jug", "pic-array"], "5-CT-8": ["pic-balance", "pic-jug"], "5-CT-9": ["pic-array", "pic-share"], "5-CT-11": ["pic-perimeter", "pic-symmetry-complete"], "5-CT-13": ["pic-jumps", "pic-numgrid-multiples"],
  "6-CT-2": ["pic-angle", "pic-lines"], "6-CT-3": ["pic-numgrid-multiples", "pic-matchsticks", "pic-beads-pattern"], "6-CT-5": ["pic-numgrid-prime", "pic-numgrid-multiples", "pic-array"], "6-CT-6": ["pic-perimeter", "pic-area-model"], "6-CT-7": F.frac, "6-CT-10": ["pic-numline-int"], "6-AI-1": F.ai, "6-AI-4": F.ai,
  "7-CT-1": ["pic-abacus", "pic-numline"], "7-CT-2": ["pic-array", "pic-money", "pic-area-model"], "7-CT-3": ["pic-numline-dec", "pic-ruler"], "7-CT-4": ["pic-matchsticks", "pic-area-model"], "7-CT-5": ["pic-lines", "pic-angle"], "7-CT-6": ["pic-numgrid-multiples", "pic-numgrid-prime", "pic-matchsticks"], "7-CT-8": F.frac, "7-AI-1": F.ai, "7-AI-2": ["pic-ai-accuracy", "pic-bar-chart"], "7-AI-4": F.ai,
  "8-CT-2": ["pic-binary", "pic-power-square"], "8-CT-3": ["pic-binary", "pic-abacus"], "8-CT-5": ["pic-numgrid-prime", "pic-numgrid-multiples"], "8-CT-6": ["pic-area-model", "pic-matchsticks"], "8-CT-7": ["pic-beads-ratio", "pic-bar-chart", "pic-balance"], "8-AI-2": F.ai, "8-AI-3": F.ai, "8-AI-4": F.ai,
};
