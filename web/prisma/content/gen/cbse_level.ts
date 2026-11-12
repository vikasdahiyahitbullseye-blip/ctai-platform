// CBSE-level question families: multi-clue, multi-step questions written in the style and length of the CBSE CT
// handbook questions (30–60 words, four options). Every answer is computed (logic puzzles are solved by brute force and
// only kept when the clues give exactly one answer), so the keys are correct by construction.
import { type Family, type D, type Item, int, pick, sample, fmt, NAMES } from "./util";

// ---------- helpers ----------
const ord = (n: number) => `${n}${n % 100 >= 11 && n % 100 <= 13 ? "th" : ["th", "st", "nd", "rd"][n % 10] ?? "th"}`;
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a));
function perms<T>(a: T[]): T[][] {
  if (a.length <= 1) return [a];
  return a.flatMap((x, i) => perms([...a.slice(0, i), ...a.slice(i + 1)]).map((p) => [x, ...p]));
}
/** Four options with the answer first (positions are shuffled later when the bank is seeded). */
function mcq(answer: string, wrong: (string | number)[]): { options: string[]; answer: number } | null {
  const w = [...new Set(wrong.map(String).filter((x) => x !== answer))];
  if (w.length < 3) return null;
  return { options: [answer, ...w.slice(0, 3)], answer: 0 };
}
function numMcq(r: () => number, answer: number, near: number[], fmtf: (n: number) => string = fmt) {
  const cands = [...new Set(near.filter((x) => Number.isFinite(x) && x !== answer && x >= 0))];
  let k = 1;
  while (cands.length < 3) { const c = answer + (k % 2 ? k : -k) * Math.max(1, Math.round(Math.abs(answer) * 0.08)); if (c >= 0 && c !== answer && !cands.includes(c)) cands.push(c); k++; }
  return mcq(fmtf(answer), sample(r, cands, 3).map(fmtf));
}
const item = (d: D, skills: string[], stem: string, o: { options: string[]; answer: number } | null, solution: string, hint?: string): Item | null =>
  o ? { d, skills, type: "MCQ", stem, options: o.options, answer: o.answer, solution, hint } : null;
const who = (r: () => number, n: number) => sample(r, NAMES, n);

// ---------- generic ordering puzzle (lengths, heights, weights, marks) ----------
type Theme = { noun: string; nouns: string; adj: string; more: string; less: string; most: string; least: string };
const THEMES: Theme[] = [
  { noun: "rope", nouns: "ropes", adj: "long", more: "longer", less: "shorter", most: "longest", least: "shortest" },
  { noun: "bag", nouns: "bags", adj: "heavy", more: "heavier", less: "lighter", most: "heaviest", least: "lightest" },
  { noun: "tower", nouns: "towers", adj: "tall", more: "taller", less: "shorter", most: "tallest", least: "shortest" },
  { noun: "box", nouns: "boxes", adj: "heavy", more: "heavier", less: "lighter", most: "heaviest", least: "lightest" },
];
const COLOURS = ["Red", "Blue", "Green", "Yellow", "White"];

/** Ordering puzzle: entities ranked 1 (least) … n (most), optionally each with a colour. Clues are added until one answer remains. */
export const orderClues: Family = {
  id: "c-order-clues", ds: [2, 3],
  make(c, d) {
    const n = c.cls <= 4 ? 4 : d === 3 ? 5 : 4;
    const t = pick(c.r, THEMES);
    const ids = "ABCDE".slice(0, n).split("");
    const withColour = d === 3 && n === 4;
    const rank = perms([...Array(n).keys()].map((i) => i + 1))[int(c.r, 0, (n === 4 ? 24 : 120) - 1)]; // rank[i] of entity i
    const col = withColour ? sample(c.r, COLOURS.slice(0, 4), 4) : [];
    const name = (i: number) => `${t.noun[0].toUpperCase()}${t.noun.slice(1)} ${ids[i]}`;
    type Sol = { rk: number[]; cl: string[] };
    const sols: Sol[] = [];
    for (const rk of perms([...Array(n).keys()].map((i) => i + 1))) {
      if (!withColour) sols.push({ rk, cl: [] });
      else for (const cl of perms(COLOURS.slice(0, 4))) sols.push({ rk, cl });
    }
    // clue pool: [text, predicate]
    const pool: [string, (s: Sol) => boolean][] = [];
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (i !== j && rank[i] > rank[j]) pool.push([`${name(i)} is ${t.more} than ${t.noun} ${ids[j]}`, (s) => s.rk[i] > s.rk[j]]);
    for (let i = 0; i < n; i++) {
      if (rank[i] === n) pool.push([`${name(i)} is the ${t.most}`, (s) => s.rk[i] === n]);
      if (rank[i] === 1) pool.push([`${name(i)} is the ${t.least}`, (s) => s.rk[i] === 1]);
      if (rank[i] !== n) pool.push([`${name(i)} is not the ${t.most}`, (s) => s.rk[i] !== n]);
      for (let j = 0; j < n; j++) if (j !== i && Math.abs(rank[i] - rank[j]) === 2) pool.push([`Exactly one ${t.noun} is between ${t.noun} ${ids[i]} and ${t.noun} ${ids[j]} in order`, (s) => Math.abs(s.rk[i] - s.rk[j]) === 2]);
    }
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) for (let k = 0; k < n; k++)
      if (i !== j && j !== k && i !== k && rank[j] < rank[i] && rank[i] < rank[k]) pool.push([`${name(i)} is ${t.more} than ${t.noun} ${ids[j]} but ${t.less} than ${t.noun} ${ids[k]}`, (s) => s.rk[j] < s.rk[i] && s.rk[i] < s.rk[k]]);
    if (withColour) {
      for (let i = 0; i < n; i++) {
        const ci = col[i];
        if (rank[i] === n) pool.push([`The ${ci} ${t.noun} is the ${t.most}`, (s) => s.rk[s.cl.indexOf(ci)] === n]);
        if (rank[i] === 1) pool.push([`The ${ci} ${t.noun} is the ${t.least}`, (s) => s.rk[s.cl.indexOf(ci)] === 1]);
        for (const x of COLOURS.slice(0, 4)) if (x !== ci) pool.push([`${name(i)} is not ${x}`, (s) => s.cl[i] !== x]);
        for (let j = 0; j < n; j++) if (j !== i && rank[i] < rank[j]) pool.push([`${name(i)} is ${t.less} than the ${col[j]} ${t.noun}`, (s) => s.rk[i] < s.rk[s.cl.indexOf(col[j])]]);
      }
    }
    const clues: [string, (s: Sol) => boolean][] = [];
    let live = sols;
    const order = sample(c.r, pool, pool.length);
    for (const cl of order) {
      const next = live.filter(cl[1]);
      if (next.length < live.length) { clues.push(cl); live = next; }
      if (live.length === 1) break;
    }
    if (live.length !== 1 || clues.length > 6) return null;
    const s = live[0];
    let q: string, ans: string, wrong: string[];
    if (withColour && c.r() < 0.6) {
      const target = pick(c.r, COLOURS.slice(0, 4));
      q = `Which ${t.noun} is ${target}?`; ans = `${t.noun[0].toUpperCase()}${t.noun.slice(1)} ${ids[s.cl.indexOf(target)]}`;
      wrong = ids.filter((_, i) => s.cl[i] !== target).map((x) => `${t.noun[0].toUpperCase()}${t.noun.slice(1)} ${x}`);
    } else {
      const pos = int(c.r, 2, n - 1);
      q = `Which ${t.noun} is the ${ord(n - pos + 1)} ${t.most}?`;
      const idx = s.rk.indexOf(pos);
      ans = name(idx); wrong = [...Array(n).keys()].filter((i) => i !== idx).map(name);
    }
    const intro = withColour
      ? `There are ${n} ${t.nouns} ${ids.join(", ").replace(/, (\w)$/, " and $1")}. Each ${t.noun} is a different colour from ${COLOURS.slice(0, 4).join(", ").replace(/, (\w+)$/, " and $1")}, and no two are equally ${t.adj}.`
      : `There are ${n} ${t.nouns} ${ids.join(", ").replace(/, (\w)$/, " and $1")}, and no two ${t.nouns} are equally ${t.adj}.`;
    const stem = `${intro}\n${clues.map((x) => `- ${x[0]}`).join("\n")}\n\n${q}`;
    const orderText = [...Array(n).keys()].sort((a, b) => s.rk[b] - s.rk[a]).map((i) => `${ids[i]}${withColour ? ` (${s.cl[i]})` : ""}`).join(", ");
    return item(d, ["DECOMPOSITION", "ABSTRACT"], stem, mcq(ans, wrong), `Use the clues one at a time and keep only the orders that fit all of them. From ${t.most} to ${t.least}, the only order that works is ${orderText}. So the answer is ${ans}.`, "Write the names in a row and move them as each clue tells you.");
  },
};

/** Two-attribute matching puzzle: people, jobs and salaries (Class 6–8). */
export const matchJobs: Family = {
  id: "c-match-jobs", ds: [3],
  make(c, d) {
    const people = who(c.r, 4);
    const jobs = sample(c.r, ["Teacher", "Pilot", "Chef", "Artist", "Doctor", "Engineer", "Lawyer", "Farmer"], 4);
    const base = pick(c.r, [20000, 30000, 40000]);
    const sal = [0, 1, 2, 3].map((k) => base + k * 10000);
    const jp = perms([0, 1, 2, 3]), sp = perms([0, 1, 2, 3]);
    const J = jp[int(c.r, 0, 23)], S = sp[int(c.r, 0, 23)]; // J[p] = job index, S[p] = salary rank
    type Sol = { j: number[]; s: number[] };
    const all: Sol[] = []; for (const j of jp) for (const s of sp) all.push({ j, s });
    const pj = (s: Sol, job: number) => s.j.indexOf(job);
    const pool: [string, (s: Sol) => boolean][] = [];
    for (let k = 0; k < 4; k++) {
      const p = J.indexOf(k);
      if (S[p] === 0) pool.push([`The ${jobs[k].toLowerCase()} earns the least`, (s) => s.s[pj(s, k)] === 0]);
      if (S[p] === 3) pool.push([`The ${jobs[k].toLowerCase()} earns the most`, (s) => s.s[pj(s, k)] === 3]);
      for (let m = 0; m < 4; m++) if (m !== k) {
        const q = J.indexOf(m);
        if (S[p] > S[q]) pool.push([`The ${jobs[k].toLowerCase()} earns more than the ${jobs[m].toLowerCase()}`, (s) => s.s[pj(s, k)] > s.s[pj(s, m)]]);
        if (S[p] - S[q] === 1) pool.push([`The ${jobs[k].toLowerCase()} earns ₹10,000 more than the ${jobs[m].toLowerCase()}`, (s) => s.s[pj(s, k)] - s.s[pj(s, m)] === 1]);
      }
    }
    for (let p = 0; p < 4; p++) {
      const notJobs = [0, 1, 2, 3].filter((k) => k !== J[p]);
      const [a, b] = sample(c.r, notJobs, 2);
      pool.push([`${people[p]} is neither the ${jobs[a].toLowerCase()} nor the ${jobs[b].toLowerCase()}`, (s) => s.j[p] !== a && s.j[p] !== b]);
      for (let q = 0; q < 4; q++) if (q !== p && S[p] > S[q]) pool.push([`${people[p]} earns more than ${people[q]}`, (s) => s.s[p] > s.s[q]]);
    }
    const clues: [string, (s: Sol) => boolean][] = []; let live = all;
    for (const cl of sample(c.r, pool, pool.length)) {
      const nx = live.filter(cl[1]); if (nx.length < live.length) { clues.push(cl); live = nx; }
      if (live.length === 1) break;
    }
    if (live.length !== 1 || clues.length > 7) return null;
    const t = int(c.r, 0, 3);
    const fmtA = (p: number, j: number[], s: number[]) => `${jobs[j[p]]}, ₹${fmt(sal[s[p]])}`;
    const ans = fmtA(t, J, S);
    const wrong = [fmtA(t, J, S.map((x) => (x + 1) % 4)), `${jobs[(J[t] + 1) % 4]}, ₹${fmt(sal[S[t]])}`, `${jobs[(J[t] + 2) % 4]}, ₹${fmt(sal[(S[t] + 2) % 4])}`];
    const stem = `${people.slice(0, 3).join(", ")} and ${people[3]} have different jobs (${jobs.join(", ")}) and earn different yearly salaries (${sal.map((x) => `₹${fmt(x)}`).join(", ")}) in some order.\n${clues.map((x) => `- ${x[0]}`).join("\n")}\n\nWhat are ${people[t]}'s job and salary?`;
    const table = [0, 1, 2, 3].map((p) => `${people[p]}: ${jobs[J[p]]}, ₹${fmt(sal[S[p]])}`).join("; ");
    return item(d, ["DECOMPOSITION"], stem, mcq(ans, wrong), `Make a table of people, jobs and salaries and use the clues that fix positions first (earns the least / most), then the comparisons. The only arrangement that fits every clue is: ${table}.`, "Start with the clues about the highest and lowest salaries.");
  },
};

// ---------- patterns ----------
export const wrongTerm: Family = {
  id: "c-wrong-term", ds: [2, 3],
  make(c, d) {
    const kind = pick(c.r, d === 2 ? ["double", "gaps", "times"] : ["double", "gaps", "alt", "squares"]);
    let a: number[] = [], rule = "";
    if (kind === "double") { const k = pick(c.r, [1, 2, 3]); a = [int(c.r, 1, 6)]; for (let i = 0; i < 7; i++) a.push(a[i] * 2 + k); rule = `each term is double the previous term plus ${k}`; }
    if (kind === "gaps") { const g0 = int(c.r, 1, 4), inc = pick(c.r, [1, 2, 3]); a = [int(c.r, 2, 20)]; for (let i = 0; i < 7; i++) a.push(a[i] + g0 + i * inc); rule = `the gaps between terms are ${g0}, ${g0 + inc}, ${g0 + 2 * inc}, … (each gap is ${inc} more than the one before)`; }
    if (kind === "times") { const k = pick(c.r, [2, 3]); a = [int(c.r, 1, 5)]; for (let i = 0; i < 6; i++) a.push(a[i] * k); rule = `each term is ${k} times the previous term`; }
    if (kind === "alt") { const p = int(c.r, 5, 12), m = int(c.r, 2, p - 2); a = [int(c.r, 10, 40)]; for (let i = 0; i < 7; i++) a.push(a[i] + (i % 2 ? -m : p)); rule = `the terms go +${p}, −${m}, +${p}, −${m}, …`; }
    if (kind === "squares") { const s = int(c.r, 1, 5), k = pick(c.r, [0, 1, 2]); a = Array.from({ length: 7 }, (_, i) => (s + i) ** 2 + k); rule = `the terms are ${s}² + ${k}, ${s + 1}² + ${k}, ${s + 2}² + ${k}, …`; }
    const at = int(c.r, 2, a.length - 2);
    const right = a[at];
    const bad = right + pick(c.r, [-3, -2, -1, 1, 2, 3]);
    if (bad <= a[at - 1] && kind !== "alt") return null;
    const shown = a.map((v, i) => (i === at ? bad : v));
    const others = sample(c.r, shown.filter((_, i) => i !== at && i > 0), 3);
    return item(d, ["PATTERN"], `The following number series is based on a pattern, but one term is incorrect. Identify the incorrect term.\n\n${shown.map(fmt).join(", ")}`, mcq(fmt(bad), others.map(fmt)), `The rule is: ${rule}. Following it, the ${ord(at + 1)} term should be ${fmt(right)}, not ${fmt(bad)}. All the other terms fit the rule.`, "Find a rule that fits most of the terms, then check every term against it.");
  },
};

export const repeatCount: Family = {
  id: "c-repeat-count", ds: [2, 3],
  make(c, d) {
    const shift = pick(c.r, [0, 1, 2]);
    const start = shift + int(c.r, 1, 2);
    const seq: number[] = [];
    for (let v = start; seq.length < 200; v++) for (let k = 0; k < v - shift; k++) seq.push(v);
    const shownLen = int(c.r, 10, 14);
    const next = seq.slice(shownLen, shownLen + 20);
    const counts = new Map<number, number>(); next.forEach((v) => counts.set(v, (counts.get(v) ?? 0) + 1));
    const cand = [...counts.keys()].filter((v) => v > seq[shownLen - 1]);
    if (!cand.length) return null;
    const x = pick(c.r, cand);
    const ans = counts.get(x)!;
    return item(d, ["PATTERN", "ALGORITHMIC"], `The following series follows a fixed pattern:\n\n${seq.slice(0, shownLen).join(", ")}, …\n\nIf the pattern continues, how many times does the number ${x} appear in the NEXT 20 terms (after the terms shown)?`, numMcq(c.r, ans, [ans + 1, ans - 1, x - shift, x, ans + 2].filter((v) => v > 0)), `Each number v appears (v − ${shift}) times. Writing the next 20 terms: ${next.join(", ")}. The number ${x} appears ${ans} times in them.`);
  },
};

export const blockFirst: Family = {
  id: "c-block-first", ds: [2, 3],
  make(c, d) {
    const kinds = [
      { desc: "In term k there are k columns, and the columns have 1, 2, 3, … blocks", f: (k: number) => (k * (k + 1)) / 2, why: "1 + 2 + … + k" },
      { desc: "Each term is a plus sign: one block in the centre and k blocks on each of its four arms", f: (k: number) => 4 * k + 1, why: "4k + 1" },
      { desc: "Term k is a k × k square of blocks", f: (k: number) => k * k, why: "k × k" },
      { desc: "Term k is a rectangle of blocks k rows tall and (k + 1) blocks wide", f: (k: number) => k * (k + 1), why: "k × (k + 1)" },
      { desc: "Term k is an L-shape: a column of k blocks with a row of k blocks along the bottom, sharing the corner block", f: (k: number) => 2 * k - 1, why: "2k − 1" },
    ];
    const kd = pick(c.r, kinds);
    const firstK = int(c.r, d === 2 ? 5 : 7, d === 2 ? 9 : 14);
    const N = kd.f(firstK) - int(c.r, 1, Math.max(1, kd.f(firstK) - kd.f(firstK - 1) - 1));
    if (kd.f(firstK - 1) > N) return null;
    const vals = [firstK - 2, firstK - 1, firstK, firstK + 1].map((k) => `${k}: ${kd.f(k)}`);
    return item(d, ["PATTERN", "ABSTRACT"], `The first terms of a block series are shown in a book. ${kd.desc}. If the pattern continues, which term will be the first to contain more than ${N} blocks?`, mcq(`${ord(firstK)} term`, [firstK - 1, firstK + 1, firstK - 2, firstK + 2].map((k) => `${ord(k)} term`)), `Term k has ${kd.why} blocks. Blocks in terms ${vals.join(", ")}. The ${ord(firstK - 1)} term has ${kd.f(firstK - 1)} (not more than ${N}) and the ${ord(firstK)} term has ${kd.f(firstK)}, so the ${ord(firstK)} term is the first.`, "Write a rule for the number of blocks in term k.");
  },
};

export const circleSteps: Family = {
  id: "c-circle-steps", ds: [2, 3],
  make(c, d) {
    if (d === 2) {
      const n = pick(c.r, [12, 14, 15, 16, 18, 20, 24]), k = int(c.r, 2, n - 2), s = int(c.r, 1, n);
      const steps = n / gcd(n, k);
      return item(d, ["PATTERN", "ALGORITHMIC"], `A circle has ${n} equally spaced points numbered 1 to ${n}. Start at point ${s} and keep adding ${k}, joining each point to the next one you reach (after point ${n} you go round to point 1 again), until you arrive back at point ${s}. How many steps are needed?`, numMcq(c.r, steps, [n, k, n / k > 1 ? Math.round(n / k) : n - 1, steps * 2, n - steps]), `Steps = number of points ÷ the biggest number that divides both ${n} and ${k}. HCF(${n}, ${k}) = ${gcd(n, k)}, so ${n} ÷ ${gcd(n, k)} = ${steps} steps.`);
    }
    const shapes: Record<number, string> = { 3: "a triangle (3 steps)", 4: "a square (4 steps)", 5: "a pentagon (5 steps)", 6: "a hexagon (6 steps)" };
    const target = pick(c.r, [3, 4, 5, 6]);
    const opts: [number, number][] = [];
    for (let tries = 0; opts.length < 4 && tries < 300; tries++) {
      const n = pick(c.r, [12, 15, 16, 18, 20, 24, 30]), k = int(c.r, 2, n - 1);
      const st = n / gcd(n, k);
      if (opts.some((o) => o[0] === n && o[1] === k)) continue;
      if (opts.length === 0 ? st === target : st !== target) opts.push([n, k]);
    }
    if (opts.length < 4) return null;
    const lab = opts.map(([n, k]) => `The ${n}-point circle, adding ${k}`);
    return item(d, ["PATTERN", "ALGORITHMIC"], `Some circles have equally spaced numbered points. Starting at any point, you keep adding the same number and join the points you reach until you come back to the start. Which of these will make ${shapes[target]}?`, mcq(lab[0], lab.slice(1)), `The number of steps is (points) ÷ HCF(points, number added). ${opts.map(([n, k]) => `${n} ÷ HCF(${n}, ${k}) = ${n / gcd(n, k)}`).join("; ")}. Only the first gives ${target} steps.`);
  },
};

// ---------- angles, turns, clocks, seating ----------
const DIR8 = ["North", "North-East", "East", "South-East", "South", "South-West", "West", "North-West"];
export const circleSeats: Family = {
  id: "c-circle-seats", ds: [2, 3],
  make(c, d) {
    const L = "ABCDEFGH".split("");
    const start = int(c.r, 0, 7);
    // seat positions measured clockwise from A; a person's LEFT is the next seat clockwise (facing the centre)
    const pos: Record<string, number> = { A: 0 };
    const clues: string[] = [];
    const cand = sample(c.r, L.slice(1), 3);
    let prev = "A";
    for (const p of cand) {
      const kind = pick(c.r, d === 2 ? ["left1", "right2", "opp"] : ["left1", "right2", "opp", "left3", "right1"]);
      const off = { left1: 1, right1: -1, right2: -2, left3: 3, opp: 4 }[kind] as number;
      const np = (((pos[prev] + off) % 8) + 8) % 8;
      if (Object.values(pos).includes(np)) return null;
      pos[p] = np;
      clues.push({ left1: `${p} sits immediately to the left of ${prev}`, right1: `${p} sits immediately to the right of ${prev}`, right2: `${p} sits two seats to the right of ${prev}`, left3: `${p} sits three seats to the left of ${prev}`, opp: `${p} sits exactly opposite ${prev}` }[kind] as string);
      prev = p;
    }
    const target = cand[2];
    const diff = pos[target];
    if (c.r() < 0.5) {
      const ans = Math.min(diff * 45, 360 - diff * 45);
      return item(d, ["ABSTRACT", "ALGORITHMIC"], `Eight friends A, B, C, D, E, F, G and H sit at equal gaps around a round table, each facing the centre. A faces ${DIR8[start]}.\n${clues.map((x) => `- ${x}`).join("\n")}\n\nWhat is the smaller angle between the directions in which A and ${target} face?`, mcq(`${ans}°`, [45, 90, 135, 180].filter((x) => x !== ans).map((x) => `${x}°`)), `Facing the centre, a person's left is the next seat clockwise (seen from above). Going clockwise from A: ${Object.entries(pos).map(([k, v]) => `${k} is ${v} seat${v === 1 ? "" : "s"} round`).join(", ")}. With 8 seats each seat turns the facing direction by 360° ÷ 8 = 45°, so ${target} faces ${diff} × 45° = ${diff * 45}° round from A. The smaller angle is ${ans}°.`, "Draw 8 seats and mark A first.");
    }
    const ans = DIR8[(start + diff) % 8];
    return item(d, ["ABSTRACT", "ALGORITHMIC"], `Eight friends A, B, C, D, E, F, G and H sit at equal gaps around a round table, each facing the centre. A faces ${DIR8[start]}.\n${clues.map((x) => `- ${x}`).join("\n")}\n\nIn which direction does ${target} face?`, mcq(ans, sample(c.r, DIR8.filter((x) => x !== ans), 3)), `A person's left is the next seat clockwise when everyone faces the centre. ${target} is ${diff} seat${diff === 1 ? "" : "s"} clockwise from A, and each seat turns the facing direction by 45° clockwise. ${DIR8[start]} turned by ${diff * 45}° is ${ans}.`, "Each seat round the table turns the direction by 45°.");
  },
};

const timeStr = (h: number, m: number, pm = true) => `${h}:${String(m).padStart(2, "0")}${pm ? " PM" : ""}`;
export const clockArrival: Family = {
  id: "c-clock-arrival", ds: [2, 3],
  make(c, d) {
    const [p, q] = who(c.r, 2);
    const h1 = int(c.r, 1, 11), h2 = int(c.r, 1, 11);
    if (h1 === h2) return null;
    const ang1 = (h1 * 30 + 15) - 180; // hour hand at h1:30 measured clockwise from the minute hand (at 6)
    const x = ((ang1 % 360) + 360) % 360;
    const y = h2 * 30;
    const first = h1 + 0.5 < h2 ? p : q;
    const ans = h1 + 0.5 < h2 ? `${p} came first, at ${timeStr(h1, 30)}` : `${q} came first, at ${timeStr(h2, 0)}`;
    const wrong = [h1 + 0.5 < h2 ? `${q} came first, at ${timeStr(h2, 0)}` : `${p} came first, at ${timeStr(h1, 30)}`, `${first} came first, at ${timeStr(first === p ? h1 : h2, first === p ? 0 : 30)}`, "They arrived at the same time"];
    return item(d, ["ABSTRACT", "DECOMPOSITION"], `${p} and ${q} visit a library in the afternoon or evening (PM).\n- When ${p} arrived, the minute hand pointed at 6 and the hour hand was ${x}° clockwise from the minute hand.\n- When ${q} arrived, the minute hand pointed at 12 and the hour hand was ${y}° clockwise from it.\n\nWhich statement is correct?`, mcq(ans, wrong), `${p}: the minute hand is at 180° (pointing at 6), so the hour hand is at 180° + ${x}° = ${(180 + x) % 360}°. At half past an hour h the hour hand is at 30h + 15°, so h = ${h1}: ${timeStr(h1, 30)}. ${q}: the hour hand at ${y}° with the minute hand at 12 means ${h2}:00, i.e. ${timeStr(h2, 0)}. So: ${ans}.`);
  },
};

export const clockRightAngles: Family = {
  id: "c-clock-right", ds: [3],
  make(c, d) {
    const a = int(c.r, 1, 8), b = a + int(c.r, 2, 4);
    if (b > 12) return null;
    const what = pick(c.r, ["right", "straight"] as const);
    // minutes after 12:00 when the gap is 90/270 (right) or 180 (straight): 5.5 t ≡ target (mod 360)
    const targets = what === "right" ? [90, 270] : [180];
    const times: number[] = [];
    for (let k = 0; k < 30; k++) for (const tg of targets) { const t = (tg + 360 * k) / 5.5; if (t >= a * 60 && t < b * 60) times.push(t); }
    times.sort((x, y) => x - y);
    const ans = times.length;
    const show = times.map((t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`).join(", ");
    return item(d, ["ABSTRACT", "ALGORITHMIC"], `The hour hand and the minute hand of a clock move continuously. How many times are the two hands at ${what === "right" ? "a right angle (90°) to each other" : "a straight line pointing in opposite directions (180°)"} from ${a}:00 to just before ${b}:00?`, numMcq(c.r, ans, [ans + 1, ans - 1, (b - a) * (what === "right" ? 2 : 1), ans + 2].filter((v) => v > 0)), `The minute hand gains 5.5° per minute on the hour hand, so the hands make ${what === "right" ? "a right angle twice" : "a straight line once"} in every 65 5/11 minutes (one full lap of the minute hand over the hour hand). Between ${a}:00 and ${b}:00 this happens at about ${show}, which is ${ans} time${ans === 1 ? "" : "s"}.`);
  },
};

export const CBSE_A: Family[] = [orderClues, matchJobs, wrongTerm, repeatCount, blockFirst, circleSteps, circleSeats, clockArrival, clockRightAngles];
