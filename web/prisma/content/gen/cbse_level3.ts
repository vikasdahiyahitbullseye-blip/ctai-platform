// CBSE-level question families, part 3 (mostly Classes 7–8): expressions, decimals, lines and triangles, powers,
// number systems, quadrilaterals, the distributive law and ratios. Every answer is computed.
import { type Family, type D, type Item, int, pick, sample, fmt, NAMES } from "./util";

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a));
function mcq(answer: string, wrong: (string | number)[]) {
  const w = [...new Set(wrong.map(String).filter((x) => x !== answer))];
  return w.length < 3 ? null : { options: [answer, ...w.slice(0, 3)], answer: 0 };
}
function numMcq(r: () => number, answer: number, near: number[], f: (n: number) => string = fmt) {
  const c = [...new Set(near.filter((x) => Number.isFinite(x) && x !== answer && x >= 0))];
  let k = 1;
  while (c.length < 3) { const v = answer + (k % 2 ? k : -k) * Math.max(1, Math.round(Math.abs(answer) * 0.08)); if (v >= 0 && v !== answer && !c.includes(v)) c.push(v); k++; }
  return mcq(f(answer), sample(r, c, 3).map(f));
}
const item = (d: D, skills: string[], stem: string, o: { options: string[]; answer: number } | null, solution: string, hint?: string): Item | null =>
  o ? { d, skills, type: "MCQ", stem, options: o.options, answer: o.answer, solution, hint } : null;
const who = (r: () => number, n: number) => sample(r, NAMES, n);

// ---------- expressions ----------
type Op = "+" | "−" | "×" | "÷";
function evalExpr(nums: number[], ops: Op[]): number | null {
  // × and ÷ first, then + and − from left to right
  const v = [nums[0]]; const o: Op[] = [];
  for (let i = 0; i < ops.length; i++) {
    if (ops[i] === "×") v[v.length - 1] *= nums[i + 1];
    else if (ops[i] === "÷") { if (v[v.length - 1] % nums[i + 1]) return null; v[v.length - 1] /= nums[i + 1]; }
    else { v.push(nums[i + 1]); o.push(ops[i]); }
  }
  let r = v[0]; for (let i = 0; i < o.length; i++) r = o[i] === "+" ? r + v[i + 1] : r - v[i + 1];
  return r;
}
const neg = (v: number) => (v < 0 ? `−${-v}` : String(v));
const show = (nums: number[], ops: Op[]) => nums.map((n, i) => (i ? ` ${ops[i - 1]} ${n}` : String(n))).join("");

export const operatorSwap: Family = {
  id: "c-operator-swap", ds: [2, 3],
  make(c, d) {
    const nums = [int(c.r, 6, 20), int(c.r, 2, 12), int(c.r, 2, 15), int(c.r, 2, 12)];
    const ops = sample(c.r, ["+", "−", "×", "÷"] as Op[], 3);
    const orig = evalExpr(nums, ops); if (orig === null) return null;
    const pairs: [Op, Op][] = [["+", "−"], ["+", "×"], ["−", "×"], ["+", "÷"], ["−", "÷"], ["×", "÷"]];
    const results = pairs.map(([a, b]) => { const sw = ops.map((o) => (o === a ? b : o === b ? a : o)); return sw.join("") === ops.join("") ? null : evalExpr(nums, sw); });
    const target = pick(c.r, ["max", "min"] as const);
    const valid = results.map((v, i) => [v, i] as [number | null, number]).filter((x) => x[0] !== null && Number.isInteger(x[0])) as [number, number][];
    if (valid.length < 4) return null;
    valid.sort((a, b) => (target === "max" ? b[0] - a[0] : a[0] - b[0]));
    if (valid[0][0] === valid[1][0]) return null;
    const lab = (i: number) => `${pairs[i][0]} and ${pairs[i][1]}`;
    return item(d, ["ALGORITHMIC", "DECOMPOSITION"], `In the expression ${show(nums, ops)}, exactly two operators are to be interchanged (every place with one of them gets the other). The usual order of operations is followed (× and ÷ before + and −). Which two operators should be interchanged to get the ${target === "max" ? "MAXIMUM" : "MINIMUM"} possible value?`, mcq(lab(valid[0][1]), valid.slice(1).map((x) => lab(x[1]))), `The expression is ${neg(orig)} as written. Interchanging each pair gives: ${valid.map(([v, i]) => `${lab(i)} → ${neg(v)}`).join("; ")}. The ${target === "max" ? "largest" : "smallest"} value, ${neg(valid[0][0])}, comes from interchanging ${lab(valid[0][1])}.`);
  },
};

export const workBackwards: Family = {
  id: "c-work-backwards", ds: [3],
  make(c, d) {
    const k = pick(c.r, [2, 3, 4]), m = pick(c.r, [6, 9, 12, 15]);
    const blanks = 3;
    const res = pick(c.r, [60, 72, 90, 96, 120, 144, 180]);
    const pats = [...Array(2 ** blanks).keys()].map((b) => [...Array(blanks).keys()].map((i) => ((b >> i) & 1 ? "×" : "−")));
    const ns: [number, string[]][] = [];
    for (const p of pats) {
      let v = res; let ok = true;
      for (let i = blanks - 1; i >= 0; i--) { if (p[i] === "×") { if (v % k) { ok = false; break; } v /= k; } else v += m; }
      if (ok && v >= 0 && Number.isInteger(v)) ns.push([v, p]);
    }
    if (ns.length < 2) return null;
    ns.sort((a, b) => a[0] - b[0]);
    const [n, p] = ns[0];
    const lab = (s: string) => (s === "×" ? `×${k}` : `−${m}`);
    return item(d, ["ALGORITHMIC", "DECOMPOSITION"], `In the expression ((n ___ ) ___ ) ___ = ${res}, every blank must be filled with either "×${k}" or "−${m}", and the operations are done from left to right. If n is a whole number, what is the SMALLEST possible value of n?`, numMcq(c.r, n, ns.slice(1).map((x) => x[0]).concat([n + m, n + k])), `Work backwards from ${res}: undo "×${k}" by dividing by ${k} and undo "−${m}" by adding ${m}. Trying all 8 ways of filling the blanks gives these whole-number values of n: ${ns.map((x) => x[0]).join(", ")}. The smallest is ${n}, using ${p.map(lab).join(", ")}.`);
  },
};

// ---------- decimals ----------
export const decimalShift: Family = {
  id: "c-decimal-shift", ds: [2, 3],
  make(c, d) {
    const places = d === 2 ? 1 : 2;
    const f = places === 1 ? 9 : 99;
    const small = int(c.r, 2, 60) / (places === 1 ? 10 : 100);
    const diff = Math.round(small * f * 1000) / 1000;
    const ans = small;
    const s = (x: number) => String(Math.round(x * 1000) / 1000);
    return item(d, ["ALGORITHMIC", "ABSTRACT"], `Two decimal numbers differ by ${s(diff)}. When the decimal point of the SMALLER number is moved ${places === 1 ? "one place" : "two places"} to the right, the two numbers become equal. What was the smaller number before the point was moved?`, mcq(s(ans), [s(ans * 10), s(diff / 10), s(ans + 0.1), s(diff / (f + 2))]), `Moving the point ${places === 1 ? "one place" : "two places"} to the right multiplies a number by ${places === 1 ? 10 : 100}, so the larger number is ${places === 1 ? 10 : 100} × (smaller). The difference is ${places === 1 ? 10 : 100} × smaller − smaller = ${f} × smaller = ${s(diff)}. So the smaller number is ${s(diff)} ÷ ${f} = ${s(ans)}.`);
  },
};

export const decimalSeries: Family = {
  id: "c-decimal-series", ds: [2, 3],
  make(c, d) {
    const a = int(c.r, 5, 30) / 10 + int(c.r, 10, 60), p = int(c.r, 5, 25) / 10, q = int(c.r, 3, 20) / 10;
    const down = c.r() < 0.5;
    const seq = [a]; for (let i = 0; i < 7; i++) seq.push(seq[i] + (i % 2 === 0 ? (down ? -p : p) : (down ? q : -q)));
    const r1 = (x: number) => Math.round(x * 100) / 100;
    const shown = seq.slice(0, 7).map(r1), ans = r1(seq[7]);
    return item(d, ["PATTERN"], `Find the next term in the series:\n\n${shown.join(", ")}, ___`, mcq(String(ans), [String(r1(ans + p)), String(r1(ans - q)), String(r1(seq[6] + (down ? -p : p))), String(r1(ans + q + q))]), `The differences alternate: ${down ? "−" : "+"}${p}, ${down ? "+" : "−"}${q}, ${down ? "−" : "+"}${p}, ${down ? "+" : "−"}${q}, … The last change shown was ${down ? "+" : "−"}${q}, so the next change is ${down ? "−" : "+"}${p}: ${shown[6]} ${down ? "−" : "+"} ${p} = ${ans}.`);
  },
};

// ---------- letter-numbers and ages ----------
export const agesSum: Family = {
  id: "c-ages", ds: [2, 3],
  make(c, d) {
    if (d === 2) {
      const n = int(c.r, 3, 5), t = int(c.r, 3, 8), now = int(c.r, 30, 90);
      if (now - n * t < n) return null;
      const ans = now - n * t;
      return item(d, ["ALGORITHMIC", "ABSTRACT"], `The sum of the present ages of ${n} cousins is ${now} years. What was the sum of their ages ${t} years ago? (Every cousin was already born then.)`, numMcq(c.r, ans, [now - t, now - (n - 1) * t, ans + t, now + n * t]), `Each cousin was ${t} years younger, so the sum was ${n} × ${t} = ${n * t} years less: ${now} − ${n * t} = ${ans}.`);
    }
    const [p] = who(c.r, 1);
    const kid = int(c.r, 6, 14), mult = pick(c.r, [3, 4]), mom = kid * mult;
    const years = int(c.r, 4, 12);
    const sum = mom + kid;
    // in `years` years the mother will be how many times... ask the daughter's age from sum and ratio now
    return item(d, ["ALGORITHMIC", "DECOMPOSITION"], `The sum of the ages of a mother and her daughter ${p} is ${sum} years. The mother is ${mult} times as old as ${p}. How old will ${p} be ${years} years from now?`, numMcq(c.r, kid + years, [kid, mom + years, kid + years + mult, sum / 2]), `Let ${p}'s age be a. Then the mother is ${mult}a, and a + ${mult}a = ${mult + 1}a = ${sum}, so a = ${kid}. In ${years} years ${p} will be ${kid + years}.`);
  },
};

// ---------- lines, angles, triangles ----------
export const lineIntersections: Family = {
  id: "c-intersections", ds: [3],
  make(c, d) {
    if (c.r() < 0.5) {
      const g1 = int(c.r, 3, 5), g2 = int(c.r, 2, 4), single = int(c.r, 1, 3);
      const n = g1 + g2 + single;
      const ans = (n * (n - 1)) / 2 - (g1 * (g1 - 1)) / 2 - (g2 * (g2 - 1)) / 2;
      return item(d, ["ABSTRACT", "DECOMPOSITION"], `${n} straight lines are drawn on a page. ${g1} of them are parallel to each other, another ${g2} are parallel to each other, and no other two lines are parallel. No three lines pass through the same point. How many points of intersection are there?`, numMcq(c.r, ans, [(n * (n - 1)) / 2, ans + g2, ans - g1, ans + 1]), `If no lines were parallel, every pair would meet: ${n} × ${n - 1} ÷ 2 = ${(n * (n - 1)) / 2} points. Parallel lines never meet: subtract the pairs inside each group, ${(g1 * (g1 - 1)) / 2} and ${(g2 * (g2 - 1)) / 2}. Total = ${ans}.`);
    }
    const m = int(c.r, 3, 6), k = int(c.r, 3, 6);
    const ans = ((m * (m - 1)) / 2) * ((k * (k - 1)) / 2);
    return item(d, ["ABSTRACT", "DECOMPOSITION"], `${m} parallel lines are crossed by ${k} other parallel lines (the two sets are not parallel to each other). How many parallelograms of ALL sizes are formed in the figure?`, numMcq(c.r, ans, [(m - 1) * (k - 1), ans + m, m * k, ans - k]), `Each parallelogram uses 2 lines from each set. Ways to choose 2 of ${m}: ${(m * (m - 1)) / 2}; 2 of ${k}: ${(k * (k - 1)) / 2}. Total = ${(m * (m - 1)) / 2} × ${(k * (k - 1)) / 2} = ${ans}.`);
  },
};

export const triangleCount: Family = {
  id: "c-triangle-count", ds: [2, 3],
  make(c, d) {
    const P = int(c.r, 9, 20);
    const kind = d === 2 ? "any" : pick(c.r, ["scalene", "isosceles"] as const);
    const list: number[][] = [];
    for (let a = 1; a <= P; a++) for (let b = a; b <= P; b++) { const cc = P - a - b; if (cc < b) continue; if (a + b <= cc) continue; if (kind === "scalene" && (a === b || b === cc)) continue; if (kind === "isosceles" && !(a === b || b === cc)) continue; list.push([a, b, cc]); }
    if (list.length < 2) return null;
    const ans = list.length;
    return item(d, ["DECOMPOSITION", "ABSTRACT"], `How many different ${kind === "any" ? "" : `${kind} `}triangles can be made with a perimeter of ${P} cm, if every side is a whole number of centimetres? (Triangles with the same three side lengths count once.)`, numMcq(c.r, ans, [ans + 1, ans - 1, ans + 2, Math.floor(P / 3)]), `List the sides in order a ≤ b ≤ c with a + b + c = ${P}, keeping only those where a + b > c (two sides together must be longer than the third)${kind !== "any" ? ` and that are ${kind}` : ""}: ${list.map((x) => x.join("-")).join(", ")}. That is ${ans}.`);
  },
};

export const angleRatio: Family = {
  id: "c-angle-ratio", ds: [2, 3],
  make(c, d) {
    const parts = sample(c.r, [1, 2, 3, 4, 5, 6, 7], 3).sort((a, b) => a - b);
    const sum = parts[0] + parts[1] + parts[2];
    if (180 % sum) return null;
    const unit = 180 / sum;
    const ask = pick(c.r, ["largest", "smallest", "middle"] as const);
    const ans = (ask === "largest" ? parts[2] : ask === "smallest" ? parts[0] : parts[1]) * unit;
    const extra = d === 3 ? ` One side of the triangle is then extended, making an exterior angle next to the ${ask} angle.` : "";
    const q = d === 3 ? `What is that exterior angle?` : `What is the ${ask} angle?`;
    const value = d === 3 ? 180 - ans : ans;
    return item(d, ["ALGORITHMIC", "ABSTRACT"], `The angles of a triangle are in the ratio ${parts.join(" : ")}.${extra} ${q}`, numMcq(c.r, value, [ans, 180 - value, value + unit, unit * parts[1]].filter((x) => x > 0 && x < 360), (n) => `${n}°`), `The parts add to ${parts.join(" + ")} = ${sum}, and the angles add to 180°, so one part is ${unit}°. The angles are ${parts.map((p) => p * unit).join("°, ")}°. The ${ask} angle is ${ans}°${d === 3 ? `, and the exterior angle next to it is 180° − ${ans}° = ${value}°` : ""}.`);
  },
};

// ---------- squares, cubes, powers ----------
export const paintedCube: Family = {
  id: "c-painted-cube", ds: [2, 3],
  make(c, d) {
    const n = int(c.r, 3, 9);
    const faces = pick(c.r, d === 2 ? [3, 0] : [2, 1, 0]);
    const val = { 3: 8, 2: 12 * (n - 2), 1: 6 * (n - 2) ** 2, 0: (n - 2) ** 3 }[faces] as number;
    const others = [8, 12 * (n - 2), 6 * (n - 2) ** 2, (n - 2) ** 3, n ** 3 - (n - 2) ** 3].filter((v) => v !== val);
    return item(d, ["ABSTRACT", "DECOMPOSITION"], `A solid cube of side ${n} cm is painted on all its faces and then cut into ${n ** 3} small cubes of side 1 cm. How many small cubes have ${faces === 0 ? "NO face painted" : `exactly ${faces} face${faces === 1 ? "" : "s"} painted`}?`, numMcq(c.r, val, others), `${faces === 3 ? "Only the 8 corner cubes have 3 painted faces." : faces === 2 ? `Cubes with 2 painted faces lie along the 12 edges, leaving out the 2 corners of each edge: 12 × (${n} − 2) = ${val}.` : faces === 1 ? `Cubes with 1 painted face are in the middle of each of the 6 faces: 6 × (${n} − 2)² = ${val}.` : `The unpainted cubes form an inner cube of side ${n} − 2 = ${n - 2}: ${n - 2}³ = ${val}.`}`);
  },
};

export const lastDigit: Family = {
  id: "c-last-digit", ds: [3],
  make(c, d) {
    const a = int(c.r, 11, 29), b = int(c.r, 20, 90), x = int(c.r, 11, 29), y = int(c.r, 20, 90);
    const op = pick(c.r, ["+", "×"] as const);
    const ld = (base: number, e: number) => { let r = 1; for (let i = 0; i < e; i++) r = (r * (base % 10)) % 10; return r; };
    const l1 = ld(a, b), l2 = ld(x, y);
    const ans = op === "+" ? (l1 + l2) % 10 : (l1 * l2) % 10;
    const cyc = (base: number) => { const s: number[] = []; let r = base % 10; while (!s.includes(r)) { s.push(r); r = (r * (base % 10)) % 10; } return s; };
    return item(d, ["PATTERN", "ALGORITHMIC"], `What is the last digit of ${a}^${b} ${op} ${x}^${y}? (Only the last digits of the powers matter.)`, numMcq(c.r, ans, [(ans + 1) % 10, (ans + 3) % 10, l1, l2, (ans + 5) % 10]), `Last digits of powers repeat in a cycle. Powers of ${a % 10} end in ${cyc(a).join(", ")} (repeating); ${b} leaves remainder ${b % cyc(a).length || cyc(a).length} in that cycle, so ${a}^${b} ends in ${l1}. Powers of ${x % 10} end in ${cyc(x).join(", ")}; ${x}^${y} ends in ${l2}. ${l1} ${op} ${l2} ends in ${ans}.`);
  },
};

export const powerOrder: Family = {
  id: "c-power-order", ds: [3],
  make(c, d) {
    const terms = sample(c.r, [[2, 5], [2, 8], [3, 3], [3, 4], [4, 3], [5, 2], [5, 3], [6, 2], [7, 2], [2, 6], [3, 5], [4, 4], [9, 2], [2, 7], [10, 2]] as [number, number][], 6);
    const vals = terms.map(([b, e]) => b ** e);
    if (new Set(vals).size !== 6) return null;
    const sorted = [...terms].sort((p, q) => p[0] ** p[1] - q[0] ** q[1]);
    const stay = terms.filter((t, i) => sorted[i] === t).length;
    const sup = (n: number) => String(n).split("").map((x) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[Number(x)]).join("");
    return item(d, ["PATTERN", "DECOMPOSITION"], `Each term is written in exponent form:\n\n${terms.map(([b, e]) => `${b}${sup(e)}`).join(", ")}\n\nThe terms are rearranged in ascending order of their values, from left to right. How many terms stay in the SAME position as in the original arrangement?`, numMcq(c.r, stay, [stay + 1, stay - 1, stay + 2, 0, 6]), `Values: ${terms.map(([b, e]) => `${b}${sup(e)} = ${b ** e}`).join(", ")}. In ascending order: ${sorted.map(([b, e]) => `${b}${sup(e)}`).join(", ")}. Comparing position by position, ${stay} term${stay === 1 ? "" : "s"} stay${stay === 1 ? "s" : ""} in place.`);
  },
};

export const squareCubeFactor: Family = {
  id: "c-make-cube", ds: [2, 3],
  make(c, d) {
    const cube = d === 3;
    const primes = sample(c.r, [2, 3, 5, 7], 3);
    const ex = primes.map(() => int(c.r, 1, cube ? 4 : 3));
    const n = primes.reduce((s, p, i) => s * p ** ex[i], 1);
    if (n > 20000) return null;
    const k = primes.reduce((s, p, i) => s * p ** ((cube ? 3 - (ex[i] % 3) : 2 - (ex[i] % 2)) % (cube ? 3 : 2)), 1);
    if (k === 1) return null;
    const fac = primes.map((p, i) => `${p}${ex[i] > 1 ? `^${ex[i]}` : ""}`).join(" × ");
    return item(d, ["DECOMPOSITION", "ABSTRACT"], `${fmt(n)} × k is a perfect ${cube ? "cube" : "square"}, where k is a natural number. What is the smallest possible value of k?`, numMcq(c.r, k, [k * primes[0], primes[0], k * 2, Math.max(1, k / primes[1])].filter(Number.isInteger)), `Split ${fmt(n)} into primes: ${fac}. In a perfect ${cube ? "cube" : "square"} every prime appears a multiple of ${cube ? 3 : 2} times, so multiply by the missing factors: k = ${k}.`);
  },
};

// ---------- number systems ----------
export const baseConvert: Family = {
  id: "c-base", ds: [2, 3],
  make(c, d) {
    if (d === 3 && c.r() < 0.5) {
      const b = int(c.r, 5, 9), x = int(c.r, 1, b - 1), y = int(c.r, 2, b - 1);
      const val = (b + x) * y; // "1x" in base b times y
      const digits = val.toString(b);
      if (digits.length > 3) return null;
      return item(d, ["ALGORITHMIC", "ABSTRACT"], `In which base is the statement 1${x} × ${y} = ${digits} true?`, mcq(`Base ${b}`, [b - 1, b + 1, 10, b + 2].filter((v) => v > Math.max(x, y) && v !== b).map((v) => `Base ${v}`)), `In base b, 1${x} means b + ${x}. Try the bases: in base ${b}, 1${x} = ${b + x}, and ${b + x} × ${y} = ${val}, which is written ${digits} in base ${b}.`);
    }
    const base = d === 2 ? 2 : 3;
    const n = int(c.r, 20, base === 2 ? 120 : 200);
    const s = n.toString(base);
    const near = [n + 1, n - 1, n + base, n * 1 + 2].map((v) => v.toString(base));
    return item(d, ["ALGORITHMIC", "PATTERN"], `Pipes of lengths ${base === 2 ? "1, 2, 4, 8, 16, 32, 64 inches (one of each)" : "1, 3, 9, 27, 81 inches (up to two of each)"} are used to measure heights, so a height is written in base ${base}. How is a height of ${n} inches written in base ${base}?`, mcq(s, near), `Divide by ${base} again and again and read the remainders from the bottom up, or take the biggest pipe that fits each time. ${n} = ${s.split("").map((dg, i) => `${dg} × ${base ** (s.length - 1 - i)}`).join(" + ")}, so it is written ${s}.`);
  },
};

export const romanCompare: Family = {
  id: "c-roman", ds: [2, 3],
  make(c, d) {
    const roman = (n: number) => { const t: [number, string][] = [[1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]]; let s = ""; for (const [v, r] of t) while (n >= v) { s += r; n -= v; } return s; };
    const items = [...Array(4)].map(() => {
      const n = int(c.r, 14, d === 2 ? 400 : 1999);
      const truth = c.r() < 0.5;
      const op = pick(c.r, ["<", ">", "="] as const);
      let m: number;
      if (op === "=") m = truth ? n : n + pick(c.r, [-10, 10, 1, -1]);
      else if (op === "<") m = truth ? n + int(c.r, 1, 9) : n - int(c.r, 0, 9);
      else m = truth ? n - int(c.r, 1, 9) : n + int(c.r, 0, 9);
      const ok = op === "=" ? n === m : op === "<" ? n < m : n > m;
      return { text: `${roman(n)} ${op} ${m}`, ok };
    });
    const ans = items.filter((x) => x.ok).length;
    return item(d, ["ALGORITHMIC", "DECOMPOSITION"], `How many of these comparisons are correct?\n\n${items.map((x, i) => `${"abcd"[i]}) ${x.text}`).join("\n")}`, numMcq(c.r, ans, [0, 1, 2, 3, 4]), `Change each Roman numeral into a number (a smaller symbol before a bigger one is subtracted, e.g. XC = 90). ${items.map((x, i) => `${"abcd"[i]}) ${x.ok ? "correct" : "wrong"}`).join("; ")}. So ${ans} ${ans === 1 ? "is" : "are"} correct.`);
  },
};

// ---------- quadrilaterals ----------
export const rectCount: Family = {
  id: "c-rect-count", ds: [2, 3],
  make(c, d) {
    const r = int(c.r, 1, 4), k = int(c.r, 2, 6);
    const ans = ((r + 1) * r / 2) * ((k + 1) * k / 2);
    return item(d, ["ABSTRACT", "DECOMPOSITION"], `A rectangle is divided by straight lines into a grid of ${r} row${r > 1 ? "s" : ""} and ${k} columns of equal small squares. How many rectangles of ALL sizes (squares included) are there in the figure?`, numMcq(c.r, ans, [r * k, ans - r * k, (r + 1) * (k + 1), ans + k]), `A rectangle is fixed by choosing 2 of the ${r + 1} horizontal lines and 2 of the ${k + 1} vertical lines: ${(r + 1) * r / 2} × ${(k + 1) * k / 2} = ${ans}.`);
  },
};

export const quadAngles: Family = {
  id: "c-quad-angles", ds: [2, 3],
  make(c, d) {
    const kind = pick(c.r, ["trapezium", "parallelogram", "rhombus"] as const);
    const a = int(c.r, 40, 80);
    if (kind === "trapezium") return item(d, ["ABSTRACT", "ALGORITHMIC"], `In trapezium ABCD, side AB is parallel to side DC and angle A = ${a}°. Angle C is ${int(c.r, 2, 6) * 10}° more than angle A. What is angle D?`, numMcq(c.r, 180 - a, [a, 360 - 2 * a, 90 + a / 2, 180 - a + 10], (n) => `${n}°`), `AD crosses the two parallel sides, so angles A and D are co-interior and add up to 180°: angle D = 180° − ${a}° = ${180 - a}°. (Angle C is extra information.)`);
    if (kind === "parallelogram") { const b = 180 - a; return item(d, ["ABSTRACT", "ALGORITHMIC"], `In parallelogram PQRS, angle P is ${b - a}° less than angle Q. What is angle R?`, numMcq(c.r, a, [b, 180 - a + 10, 90, a + 10], (n) => `${n}°`), `Neighbouring angles of a parallelogram add up to 180°, so P + Q = 180° and Q − P = ${b - a}°: P = ${a}°, Q = ${b}°. Opposite angles are equal, so angle R = angle P = ${a}°.`); }
    const ang = 2 * int(c.r, 25, 70);
    return item(d, ["ABSTRACT", "ALGORITHMIC"], `One angle of a rhombus is ${ang}°. The diagonal drawn from that corner makes what angle with each side of the rhombus?`, numMcq(c.r, ang / 2, [ang, 90 - ang / 2, 180 - ang, 90], (n) => `${n}°`), `A diagonal of a rhombus bisects the angles at the corners it joins, so it makes ${ang}° ÷ 2 = ${ang / 2}° with each side.`);
  },
};

// ---------- distributive law ----------
export const quickProduct: Family = {
  id: "c-quick-product", ds: [2, 3],
  make(c, d) {
    const base = pick(c.r, [20, 30, 40, 50, 60, 70, 80, 100]), e = int(c.r, 1, 9);
    if (d === 2) {
      const a = base - e, b = base + e;
      return item(d, ["ALGORITHMIC", "PATTERN"], `Using (x − y)(x + y) = x² − y², find ${a} × ${b} quickly. (Think of both numbers as being the same distance from ${base}.)`, numMcq(c.r, a * b, [base * base, a * b + e * e * 2, base * base + e * e, a * b - 10]), `${a} × ${b} = (${base} − ${e})(${base} + ${e}) = ${base}² − ${e}² = ${base * base} − ${e * e} = ${a * b}.`);
    }
    const [p] = who(c.r, 1);
    const m = int(c.r, 3, 9), ap = int(c.r, 2, 8);
    const x = int(c.r, 20, 60), y = int(c.r, 10, 40);
    const b1 = m * x + ap * y, b2 = ap * x + m * y;
    const k = (m + ap) / 2;
    if (!Number.isInteger(k)) return null;
    return item(d, ["ALGORITHMIC", "ABSTRACT"], `At a fruit stall, ${m} mangoes and ${ap} apples cost ₹${b1}, while ${ap} mangoes and ${m} apples cost ₹${b2}. ${p} wants to buy ${k} mangoes and ${k} apples. How much will ${p} pay?`, numMcq(c.r, (b1 + b2) / 2, [b1, b2, b1 + b2, (b1 + b2) / 2 + k], (n) => `₹${n}`), `Add the two bills: ${m + ap} mangoes and ${m + ap} apples cost ₹${b1} + ₹${b2} = ₹${b1 + b2}. Half of that is ${k} mangoes and ${k} apples: ₹${(b1 + b2) / 2}. No need to find each price.`);
  },
};

// ---------- ratios and proportions ----------
export const ratioMix: Family = {
  id: "c-ratio", ds: [2, 3],
  make(c, d) {
    const kind = pick(c.r, ["mix", "share", "pipes", "workers"] as const);
    if (kind === "mix") {
      const a = int(c.r, 2, 5), b = int(c.r, 1, a - 1), t = (a + b) * int(c.r, 4, 12);
      const milk = (t * a) / (a + b), water = (t * b) / (a + b);
      const [na, nb] = pick(c.r, [[1, 1], [3, 2], [2, 1]] as [number, number][]);
      const needWater = (milk * nb) / na - water;
      if (!Number.isInteger(needWater) || needWater <= 0) return null;
      return item(d, ["DECOMPOSITION", "ALGORITHMIC"], `A ${t}-litre mixture contains milk and water in the ratio ${a} : ${b}. How many litres of water must be added so that the ratio of milk to water becomes ${na} : ${nb}?`, numMcq(c.r, needWater, [water, milk - water, needWater + b, t / (a + b)]), `Milk = ${a}/${a + b} × ${t} = ${milk} L and water = ${water} L. Adding water does not change the milk. For ${na} : ${nb}, water must be ${milk} × ${nb}/${na} = ${(milk * nb) / na} L, so add ${(milk * nb) / na} − ${water} = ${needWater} L.`);
    }
    if (kind === "share") {
      const [p, q] = who(c.r, 2); const a = int(c.r, 2, 5), b = int(c.r, a + 1, 9), unit = pick(c.r, [25, 50, 100, 120]);
      const diff = (b - a) * unit;
      return item(d, ["DECOMPOSITION"], `${p} and ${q} share their prize money in the ratio ${a} : ${b}. ${q} gets ₹${diff} more than ${p}. How much prize money was there altogether?`, numMcq(c.r, (a + b) * unit, [b * unit, diff * 2, (a + b) * unit + unit, a * unit], (n) => `₹${n}`), `The difference ${b} − ${a} = ${b - a} parts is ₹${diff}, so one part is ₹${unit}. Altogether ${a + b} parts = ₹${(a + b) * unit}.`);
    }
    if (kind === "pipes") {
      const a = pick(c.r, [6, 10, 12, 15]), b = pick(c.r, [3, 4, 5, 20, 30]); if (a === b) return null;
      const empt = d === 3;
      const rate = empt ? 1 / Math.min(a, b) - 1 / Math.max(a, b) : 1 / a + 1 / b;
      const time = 1 / rate;
      if (!Number.isInteger(Math.round(time * 100) / 100) && Math.abs(time - Math.round(time)) > 1e-9) return null;
      const t = Math.round(time);
      return item(d, ["ALGORITHMIC", "DECOMPOSITION"], empt ? `A tank is filled by pipe A in ${Math.min(a, b)} minutes. Pipe B can empty the full tank in ${Math.max(a, b)} minutes. If both pipes are opened together on an empty tank, how many minutes will it take to fill the tank?` : `A tank can be filled by pipe A alone in ${a} hours and by pipe B alone in ${b} hours. If both pipes are opened together, how many hours will they take to fill the empty tank?`, numMcq(c.r, t, [a + b, Math.abs(a - b), (a + b) / 2, t + 1].filter(Number.isInteger)), empt ? `Pipe A fills 1/${Math.min(a, b)} of the tank per minute and pipe B empties 1/${Math.max(a, b)}. Net gain: 1/${Math.min(a, b)} − 1/${Math.max(a, b)} = 1/${t} per minute, so it takes ${t} minutes.` : `Pipe A fills 1/${a} of the tank each hour and pipe B fills 1/${b}. Together 1/${a} + 1/${b} = 1/${t} each hour, so ${t} hours.`);
    }
    const w1 = int(c.r, 4, 12), d1 = int(c.r, 6, 20), w2 = int(c.r, 2, 15);
    if ((w1 * d1) % w2) return null;
    return item(d, ["DECOMPOSITION", "ALGORITHMIC"], `${w1} workers can finish a job in ${d1} days. How many days would ${w2} workers take to finish the same job, working at the same speed?`, numMcq(c.r, (w1 * d1) / w2, [(d1 * w2) / w1, d1, d1 + (w1 - w2), (w1 * d1) / w2 + 2].filter((v) => Number.isInteger(v) && v > 0)), `The job needs ${w1} × ${d1} = ${w1 * d1} worker-days. With ${w2} workers: ${w1 * d1} ÷ ${w2} = ${(w1 * d1) / w2} days (fewer workers take more days).`);
  },
};

export const multiplesCount: Family = {
  id: "c-multiples", ds: [2, 3],
  make(c, d) {
    if (d === 3 && c.r() < 0.5) {
      const N = int(c.r, 12, 120);
      const ans = Math.floor(Math.sqrt(N));
      return item(d, ["PATTERN", "ABSTRACT"], `There are ${N} lamps in a row, numbered 1 to ${N}, all switched OFF. Person 1 flips every lamp, person 2 flips every 2nd lamp, person 3 flips every 3rd lamp, and so on up to person ${N}. (Flipping turns ON to OFF and OFF to ON.) How many lamps are ON at the end?`, numMcq(c.r, ans, [Math.floor(N / 2), ans + 1, ans - 1, Math.floor(N / 3)]), `Lamp n is flipped once for each divisor of n. It ends ON only if it has an odd number of divisors, which happens only for perfect squares. Squares up to ${N}: 1, 4, 9, …, ${ans * ans}, so ${ans} lamps.`);
    }
    const a = int(c.r, 3, 9), b = int(c.r, a + 1, 12), N = int(c.r, 60, 200);
    const l = (a * b) / gcd(a, b);
    const both = Math.floor(N / l), or = Math.floor(N / a) + Math.floor(N / b) - both;
    const ask = pick(c.r, ["or", "neither"] as const);
    const ans = ask === "or" ? or : N - or;
    return item(d, ["DECOMPOSITION", "PATTERN"], `The numbers 1 to ${N} are written on cards. Cards with multiples of ${a} go in Box A and cards with multiples of ${b} go in Box B (a card may go in both boxes). How many cards go in ${ask === "or" ? "at least one box" : "NEITHER box"}?`, numMcq(c.r, ans, [Math.floor(N / a) + Math.floor(N / b), N - ans, ans + both, ans - 1]), `Multiples of ${a}: ${Math.floor(N / a)}. Multiples of ${b}: ${Math.floor(N / b)}. Multiples of both (multiples of ${l}): ${both}, counted twice. In at least one box: ${Math.floor(N / a)} + ${Math.floor(N / b)} − ${both} = ${or}.${ask === "neither" ? ` In neither: ${N} − ${or} = ${ans}.` : ""}`);
  },
};

export const CBSE_C: Family[] = [operatorSwap, workBackwards, decimalShift, decimalSeries, agesSum, lineIntersections, triangleCount, angleRatio, paintedCube, lastDigit, powerOrder, squareCubeFactor, baseConvert, romanCompare, rectCount, quadAngles, quickProduct, ratioMix, multiplesCount];
