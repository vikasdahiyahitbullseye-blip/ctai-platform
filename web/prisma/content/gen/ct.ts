// Computational-thinking question families. Every answer and solution is computed, so keys are correct by construction.
// Numbers scale with the class (ctx.cls) so the same family suits Class 3 and Class 8.
import { type Family, type Ctx, type D, int, pick, sample, fmt, numOptions, textOptions, NAMES, DAYS, DIRS } from "./util";

const ord = (n: number) => `${n}${n % 100 >= 11 && n % 100 <= 13 ? "th" : ["th", "st", "nd", "rd"][n % 10] ?? "th"}`;
const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? "" : "s"}`;

const big = (c: Ctx) => (c.cls <= 3 ? 1 : c.cls <= 5 ? 2 : 3); // 1 small, 2 medium, 3 large numbers

// ---------------- Patterns ----------------
export const seqNext: Family = {
  id: "seq-next", ds: [1, 2],
  make(c, d) {
    const start = int(c.r, 1, [20, 50, 200][big(c) - 1]);
    const step = d === 1 ? pick(c.r, [2, 5, 10, 3]) : pick(c.r, [4, 6, 7, 9, 11, 12, 15, 25]);
    const down = d === 2 && c.r() < 0.4;
    const a = Array.from({ length: 5 }, (_, i) => (down ? start + 6 * step - i * step : start + i * step));
    const ans = down ? a[4] - step : a[4] + step;
    return { d, skills: ["PATTERN"], type: "NUMERIC", stem: `What comes next?\n\n${a.map(fmt).join(", ")}, ___`, answer: ans, solution: `Each number is ${step} ${down ? "less" : "more"} than the one before. ${fmt(a[4])} ${down ? "−" : "+"} ${step} = ${fmt(ans)}.`, hint: "Find how much changes each time." };
  },
};

export const seqMissing: Family = {
  id: "seq-missing", ds: [2],
  make(c, d) {
    const start = int(c.r, 2, [30, 100, 500][big(c) - 1]);
    const step = pick(c.r, [3, 4, 5, 6, 8, 10, 20, 25]);
    const a = Array.from({ length: 6 }, (_, i) => start + i * step);
    const hole = int(c.r, 1, 4);
    const shown = a.map((v, i) => (i === hole ? "___" : fmt(v)));
    return { d, skills: ["PATTERN", "DECOMPOSITION"], type: "NUMERIC", stem: `Find the missing number.\n\n${shown.join(", ")}`, answer: a[hole], solution: `The numbers go up by ${step}. ${fmt(a[hole - 1])} + ${step} = ${fmt(a[hole])}.` };
  },
};

export const seqGrowing: Family = {
  id: "seq-growing", ds: [2, 3],
  make(c, d) {
    const start = int(c.r, 1, 20);
    const d0 = int(c.r, 1, 3);
    const inc = d === 2 ? 1 : pick(c.r, [2, 3]);
    const a = [start];
    for (let i = 0; i < 4; i++) a.push(a[i] + d0 + i * inc);
    const ans = a[4] + d0 + 4 * inc;
    const gaps = [0, 1, 2, 3].map((i) => d0 + i * inc);
    return { d, skills: ["PATTERN"], type: "NUMERIC", stem: `What comes next?\n\n${a.join(", ")}, ___`, answer: ans, solution: `The gaps are ${gaps.join(", ")} — each gap grows by ${inc}. Next gap: ${d0 + 4 * inc}. ${a[4]} + ${d0 + 4 * inc} = ${ans}.`, hint: "Look at the gaps between the numbers." };
  },
};

export const seqGeometric: Family = {
  id: "seq-geometric", ds: [2, 3],
  make(c, d) {
    const k = d === 2 ? 2 : pick(c.r, [3, 2]);
    const start = d === 2 ? int(c.r, 1, 5) : int(c.r, 2, 4);
    const a = Array.from({ length: 4 }, (_, i) => start * k ** i);
    const ans = a[3] * k;
    return { d, skills: ["PATTERN"], type: "NUMERIC", stem: `What comes next?\n\n${a.map(fmt).join(", ")}, ___`, answer: ans, solution: `Each number is ${k} times the one before. ${fmt(a[3])} × ${k} = ${fmt(ans)}.` };
  },
};

export const seqInterleaved: Family = {
  id: "seq-interleaved", ds: [3],
  make(c, d) {
    const a0 = int(c.r, 1, 9), as = int(c.r, 1, 3);
    const b0 = int(c.r, 10, 40), bs = pick(c.r, [5, 10, -2, -3]);
    const terms: number[] = [];
    for (let i = 0; i < 3; i++) terms.push(a0 + i * as, b0 + i * bs);
    const ans = a0 + 3 * as;
    return { d, skills: ["PATTERN", "DECOMPOSITION"], type: "NUMERIC", stem: `Two patterns are mixed together. What comes next?\n\n${terms.join(", ")}, ___`, answer: ans, solution: `Odd places: ${a0}, ${a0 + as}, ${a0 + 2 * as} (add ${as}). Even places: ${b0}, ${b0 + bs}, ${b0 + 2 * bs}. The next term is in an odd place: ${a0 + 2 * as} + ${as} = ${ans}.`, hint: "Look at every second number." };
  },
};

export const nthTerm: Family = {
  id: "nth-term", ds: [2, 3],
  make(c, d) {
    const a = int(c.r, 1, 9), s = int(c.r, 2, 7), n = d === 2 ? int(c.r, 8, 12) : int(c.r, 15, 30);
    const ans = a + (n - 1) * s;
    return { d, skills: ["GENERALISATION", "PATTERN"], type: "NUMERIC", stem: `The pattern ${a}, ${a + s}, ${a + 2 * s}, ${a + 3 * s}, … continues. What is the **${ord(n)}** number?`, answer: ans, solution: `It starts at ${a} and adds ${s} each time. The ${ord(n)} number is ${a} + ${n - 1} × ${s} = ${ans}.`, hint: "How many jumps from the 1st number to the nth?" };
  },
};

const UNITS: string[][] = [["🔴", "🔵"], ["🔴", "🔵", "🔵"], ["▲", "●", "■"], ["⭐", "⭐", "🌙"], ["🍎", "🍌", "🍇", "🍌"], ["🟡", "🟢", "🟢", "🟣"], ["🐟", "🐟", "🐢"], ["🌸", "🍃", "🍃"], ["⬆", "➡", "⬇", "⬅"], ["🎈", "🎁"]];
export const emojiPattern: Family = {
  id: "emoji-pattern", ds: [1, 2, 3],
  make(c, d) {
    const unit = pick(c.r, UNITS);
    const L = unit.length;
    const shownN = d === 1 ? L * 2 + int(c.r, 0, L - 1) : L * 2;
    const shown = Array.from({ length: shownN }, (_, i) => unit[i % L]);
    const all = [...new Set(unit)];
    const distract = [...all, ...["🟤", "⬛", "🔶"]];
    if (d === 1) {
      const ans = unit[shownN % L];
      const o = textOptions(ans, distract);
      return { d, skills: ["PATTERN"], type: "MCQ", stem: `What comes next?\n\n${shown.join(" ")} ___`, ...o, solution: `The group ${unit.join(" ")} repeats. The next one is ${ans}.` };
    }
    const n = d === 2 ? int(c.r, L * 3 + 1, L * 5) : int(c.r, 15, 40);
    const ans = unit[(n - 1) % L];
    const o = textOptions(ans, distract);
    return { d, skills: ["PATTERN", "GENERALISATION"], type: "MCQ", stem: `This pattern keeps repeating:\n\n${shown.join(" ")} …\n\nWhat is the **${ord(n)}** item?`, ...o, solution: `The group has ${L} items. ${n} = ${plural(Math.floor((n - 1) / L), "full group")} and ${((n - 1) % L) + 1} more, so the ${ord(n)} item is the ${ord(((n - 1) % L) + 1)} item of the group: ${ans}.`, hint: "How many items are in one repeating group?" };
  },
};

export const letterPattern: Family = {
  id: "letter-pattern", ds: [1, 2, 3],
  make(c, d) {
    const step = d === 1 ? 2 : d === 2 ? pick(c.r, [3, 4]) : 0;
    if (d === 3) {
      const s0 = int(c.r, 0, 3);
      const pos = [s0, s0 + 1, s0 + 3, s0 + 6, s0 + 10];
      const ans = String.fromCharCode(65 + s0 + 15);
      const o = textOptions(ans, [String.fromCharCode(65 + s0 + 14), String.fromCharCode(65 + s0 + 16), String.fromCharCode(65 + s0 + 13)]);
      return { d, skills: ["PATTERN", "ABSTRACT"], type: "MCQ", stem: `What comes next?\n\n${pos.map((p) => String.fromCharCode(65 + p)).join(", ")}, ___`, ...o, solution: `The jumps in the alphabet are 1, 2, 3, 4, so the next jump is 5: ${String.fromCharCode(65 + s0 + 10)} + 5 letters = ${ans}.` };
    }
    const s0 = int(c.r, 0, 6);
    const pos = [0, 1, 2, 3].map((i) => s0 + i * step);
    const ans = String.fromCharCode(65 + s0 + 4 * step);
    const o = textOptions(ans, [String.fromCharCode(65 + s0 + 4 * step - 1), String.fromCharCode(65 + s0 + 4 * step + 1), String.fromCharCode(65 + s0 + 3 * step + 1)]);
    return { d, skills: ["PATTERN"], type: "MCQ", stem: `What comes next?\n\n${pos.map((p) => String.fromCharCode(65 + p)).join(", ")}, ___`, ...o, solution: `Each letter is ${step} places after the one before. ${String.fromCharCode(65 + s0 + 3 * step)} + ${step} = ${ans}.` };
  },
};

// ---------------- Numbers ----------------
export const placeCompose: Family = {
  id: "place-compose", ds: [1, 2],
  make(c, d) {
    const th = c.cls >= 4 ? int(c.r, 1, 9) : 0;
    const h = int(c.r, 1, 9), t = d === 2 ? 0 : int(c.r, 1, 9), o = int(c.r, 0, 9);
    const n = th * 1000 + h * 100 + t * 10 + o;
    const parts = [th ? `${th} thousands` : "", `${h} hundreds`, `${t} tens`, `${o} ones`].filter(Boolean).join(", ");
    return { d, skills: ["DECOMPOSITION"], type: "NUMERIC", stem: `Which number has **${parts}**?`, answer: n, solution: `${[th ? th * 1000 : 0, h * 100, t * 10, o].filter((x) => x).join(" + ")} = ${fmt(n)}.${t === 0 ? " Remember the 0 in the tens place." : ""}` };
  },
};

export const digitValue: Family = {
  id: "digit-value", ds: [1, 2],
  make(c, d) {
    const len = c.cls <= 3 ? 3 : c.cls <= 5 ? int(c.r, 4, 5) : int(c.r, 5, 7);
    const digits = Array.from({ length: len }, (_, i) => (i === 0 ? int(c.r, 1, 9) : int(c.r, 0, 9)));
    const pos = int(c.r, 0, len - 2);
    let dig = digits[pos];
    if (dig === 0) { digits[pos] = int(c.r, 1, 9); dig = digits[pos]; }
    const n = Number(digits.join(""));
    const value = dig * 10 ** (len - 1 - pos);
    const o = numOptions(c.r, value, [dig, dig * 10 ** Math.max(0, len - 2 - pos), dig * 10 ** (len - pos)]);
    return { d, skills: ["DECOMPOSITION"], type: "MCQ", stem: `In **${fmt(n)}**, what is the value of the digit **${dig}** that is in the ${["ones", "tens", "hundreds", "thousands", "ten-thousands", "lakhs", "ten-lakhs"][len - 1 - pos]} place?`, ...o, solution: `The ${dig} is in the ${["ones", "tens", "hundreds", "thousands", "ten-thousands", "lakhs", "ten-lakhs"][len - 1 - pos]} place, so its value is ${dig} × ${fmt(10 ** (len - 1 - pos))} = ${fmt(value)}.` };
  },
};

export const digitsMake: Family = {
  id: "digits-make", ds: [2, 3],
  make(c, d) {
    const len = c.cls <= 3 ? 3 : c.cls <= 5 ? 4 : 5;
    const pool = sample(c.r, [1, 2, 3, 4, 5, 6, 7, 8, 9], len - (d === 3 ? 1 : 0));
    if (d === 3) pool.push(0);
    const wantLargest = c.r() < 0.5;
    const sorted = [...pool].sort((a, b) => (wantLargest ? b - a : a - b));
    if (!wantLargest && sorted[0] === 0) { const i = sorted.findIndex((x) => x > 0); [sorted[0], sorted[i]] = [sorted[i], sorted[0]]; }
    const ans = Number(sorted.join(""));
    return { d, skills: ["DECOMPOSITION", d === 3 ? "EVALUATION" : "ABSTRACT"], type: "NUMERIC", stem: `Make the **${wantLargest ? "largest" : "smallest"}** ${len}-digit number using the digits **${[...pool].sort(() => c.r() - 0.5).join(", ")}** (each once).`, answer: ans, solution: wantLargest ? `Put the digits in order from biggest to smallest: ${fmt(ans)}.` : `Put the digits from smallest to biggest${pool.includes(0) ? ", but a number can't start with 0, so the smallest non-zero digit goes first" : ""}: ${fmt(ans)}.`, hint: d === 3 ? "Can a number start with 0?" : undefined };
  },
};

export const orderNumbers: Family = {
  id: "order-numbers", ds: [1, 2],
  make(c, d) {
    const base = [100, 1000, 10000][big(c) - 1];
    const set = new Set<number>();
    while (set.size < 4) set.add(d === 1 ? int(c.r, base / 10, base) : int(c.r, base, base * 2));
    const nums = [...set];
    const asc = c.r() < 0.6;
    const order = nums.map((v, i) => ({ v, i })).sort((a, b) => (asc ? a.v - b.v : b.v - a.v)).map((x) => x.i);
    return { d, skills: ["ALGORITHMIC"], type: "ORDER", stem: `Arrange from **${asc ? "smallest to largest" : "largest to smallest"}**.`, options: nums.map(fmt), answer: order, solution: `Compare the digits from the left: ${order.map((i) => fmt(nums[i])).join(asc ? " < " : " > ")}.` };
  },
};

export const whoAmI: Family = {
  id: "who-am-i", ds: [2, 3],
  make(c, d) {
    const t = int(c.r, 2, 9), o = int(c.r, 0, 9);
    if (t === o) return null;
    const n = 10 * t + o;
    const clues = [`My digits add up to **${t + o}**.`, `My tens digit is **${Math.abs(t - o)} ${t > o ? "more" : "less"}** than my ones digit.`];
    if (d === 3) clues.push(`I am ${n % 2 ? "odd" : "even"}.`);
    return { d, skills: ["DECOMPOSITION"], type: "NUMERIC", stem: `I am a 2-digit number.\n${clues.map((x) => `- ${x}`).join("\n")}\n\nWho am I?`, answer: n, solution: `Try pairs of digits that add to ${t + o} and differ by ${Math.abs(t - o)}: tens ${t}, ones ${o}. The number is ${n}.`, hint: "List digit pairs that add up to the total." };
  },
};

export const compareSign: Family = {
  id: "compare-sign", ds: [1, 2],
  make(c, d) {
    const base = [100, 1000, 100000][big(c) - 1];
    const a = int(c.r, base, base * 9);
    let b = d === 1 ? int(c.r, base, base * 9) : Number(String(a).split("").reverse().join(""));
    if (b === a || b < base) b = a + int(c.r, 1, 9) * (base / 10);
    const ans = a < b ? 0 : 1;
    return { d, skills: ["EVALUATION"], type: "MCQ", stem: `Which sign makes this true?\n\n${fmt(a)} ☐ ${fmt(b)}`, options: ["<", ">", "="], answer: ans, solution: `Compare from the biggest place value: ${fmt(a)} ${a < b ? "<" : ">"} ${fmt(b)}.` };
  },
};

// ---------------- Stories with numbers ----------------
const ITEMS = [["pencil", "notebook"], ["balloon", "toy car"], ["samosa", "lassi"], ["bangle", "keychain"], ["mango", "banana"], ["kite", "spool of thread"], ["ticket", "snack packet"]];
const PLACES = ["at the mela", "at the school canteen", "at a stationery shop", "at the village market", "at the book fair"];

export const moneyChange: Family = {
  id: "money-change", ds: [1, 2, 3],
  make(c, d) {
    const [a, b] = pick(c.r, ITEMS);
    const pa = int(c.r, 2, c.cls <= 3 ? 20 : 60) * (c.cls <= 3 ? 1 : 5);
    const pb = int(c.r, 2, c.cls <= 3 ? 15 : 40) * (c.cls <= 3 ? 1 : 5);
    const na = d === 1 ? 1 : int(c.r, 2, 4), nb = d === 3 ? int(c.r, 1, 3) : 0;
    const cost = na * pa + nb * pb;
    const note = [20, 50, 100, 200, 500, 2000].find((x) => x > cost)!;
    const who = pick(c.r, NAMES);
    const ans = note - cost;
    const place = pick(c.r, PLACES);
    return { d, skills: ["DECOMPOSITION"], type: "NUMERIC", stem: `${place[0].toUpperCase()}${place.slice(1)}, a ${a} costs **₹${pa}**${nb ? ` and a ${b} costs **₹${pb}**` : ""}. ${who} buys **${na} ${a}${na > 1 ? "s" : ""}**${nb ? ` and **${nb} ${b}${nb > 1 ? "s" : ""}**` : ""} and pays with a **₹${note}** note. How much change (in ₹) does ${who} get?`, answer: ans, solution: `Cost: ${na} × ₹${pa}${nb ? ` + ${nb} × ₹${pb}` : ""} = ₹${cost}. Change: ₹${note} − ₹${cost} = ₹${ans}.`, hint: d > 1 ? "First find the total cost." : undefined };
  },
};

export const shareLeft: Family = {
  id: "share-left", ds: [1, 2, 3],
  make(c, d) {
    const k = int(c.r, 2, c.cls <= 3 ? 5 : 9);
    const each = int(c.r, 2, c.cls <= 3 ? 6 : 15);
    const rem = d === 1 ? 0 : int(c.r, 1, k - 1);
    const total = k * each + rem;
    const thing = pick(c.r, ["marbles", "stickers", "laddoos", "pencils", "cards", "coconuts", "seeds"]);
    if (d === 1) return { d, skills: ["DECOMPOSITION"], type: "NUMERIC", stem: `**${total} ${thing}** are shared equally among **${k} friends**. How many does each friend get?`, answer: each, solution: `${total} ÷ ${k} = ${each}.` };
    if (d === 2) return { d, skills: ["DECOMPOSITION"], type: "NUMERIC", stem: `**${total} ${thing}** are shared equally among **${k} children**, as many as possible to each. How many are **left over**?`, answer: rem, solution: `Each child gets ${each} (${k} × ${each} = ${k * each}). ${total} − ${k * each} = ${rem} left over.` };
    return { d, skills: ["DECOMPOSITION", "EVALUATION"], type: "NUMERIC", stem: `**${total} ${thing}** must be packed in bags of **${k}**. Every ${thing.slice(0, -1)} must be packed. How many bags are needed?`, answer: each + 1, solution: `${each} full bags hold ${k * each}. ${rem} are left, so one more bag is needed: ${each + 1} bags.`, hint: "What happens to the ones left over?" };
  },
};

export const twoStep: Family = {
  id: "two-step", ds: [1, 2, 3],
  make(c, d) {
    const who = pick(c.r, NAMES);
    const thing = pick(c.r, ["stickers", "marbles", "shells", "stamps", "beads", "cards"]);
    const m = c.cls <= 3 ? 1 : c.cls <= 5 ? 5 : 20;
    const start = int(c.r, 20, 60) * m, give = int(c.r, 3, 15) * m, get = int(c.r, 2, 12) * m;
    if (d === 1) return { d, skills: ["DECOMPOSITION"], type: "NUMERIC", stem: `${who} has **${fmt(start)} ${thing}** and gets **${fmt(get)} more**. How many now?`, answer: start + get, solution: `${fmt(start)} + ${fmt(get)} = ${fmt(start + get)}.` };
    if (d === 2) return { d, skills: ["DECOMPOSITION", "ALGORITHMIC"], type: "NUMERIC", stem: `${who} has **${fmt(start)} ${thing}**. ${who} gives away **${fmt(give)}** and then gets **${fmt(get)}** from a friend. How many ${thing} does ${who} have now?`, answer: start - give + get, solution: `${fmt(start)} − ${fmt(give)} = ${fmt(start - give)}, then ${fmt(start - give)} + ${fmt(get)} = ${fmt(start - give + get)}.`, hint: "Do one step at a time." };
    return { d, skills: ["DECOMPOSITION", "ABSTRACT"], type: "NUMERIC", stem: `${who} gave away **${fmt(give)} ${thing}** and then got **${fmt(get)}** more. Now ${who} has **${fmt(start - give + get)}**. How many did ${who} have **at the start**?`, answer: start, solution: `Work backwards: ${fmt(start - give + get)} − ${fmt(get)} = ${fmt(start - give)}, then + ${fmt(give)} = ${fmt(start)}.`, hint: "Undo the steps in reverse order." };
  },
};

export const missingNumber: Family = {
  id: "missing-number", ds: [1, 2, 3],
  make(c, d) {
    const m = c.cls <= 3 ? 1 : c.cls <= 5 ? 10 : 100;
    if (d === 3 && c.cls >= 4) {
      const a = int(c.r, 2, 9), x = int(c.r, 3, 15), b = int(c.r, 1, 20);
      return { d, skills: ["ALGORITHMIC", "ABSTRACT"], type: "NUMERIC", stem: `I think of a number, **multiply it by ${a}** and then **add ${b}**. I get **${a * x + b}**. What was my number?`, answer: x, solution: `Undo in reverse: ${a * x + b} − ${b} = ${a * x}, then ${a * x} ÷ ${a} = ${x}.`, hint: "Work backwards." };
    }
    const a = int(c.r, 10, 60) * m, b = int(c.r, 5, 40) * m;
    if (d === 1) return { d, skills: ["ALGORITHMIC"], type: "NUMERIC", stem: `Find the missing number:\n\n${fmt(a)} + ☐ = ${fmt(a + b)}`, answer: b, solution: `${fmt(a + b)} − ${fmt(a)} = ${fmt(b)}.` };
    return { d, skills: ["ALGORITHMIC"], type: "NUMERIC", stem: `Find the missing number:\n\n☐ − ${fmt(b)} = ${fmt(a)}`, answer: a + b, solution: `Add back what was taken away: ${fmt(a)} + ${fmt(b)} = ${fmt(a + b)}.` };
  },
};

export const groupsTotal: Family = {
  id: "groups-total", ds: [1, 2, 3],
  make(c, d) {
    const ctxs = [["rows of chairs", "chairs in each row", "chairs"], ["packets", "biscuits in each packet", "biscuits"], ["autos", "wheels on each auto", "wheels"], ["boxes", "crayons in each box", "crayons"], ["trays", "eggs on each tray", "eggs"], ["buses", "children on each bus", "children"]];
    const [g, per, all] = pick(c.r, ctxs);
    const n = int(c.r, 2, c.cls <= 3 ? 6 : 12), k = all === "wheels" ? 3 : int(c.r, 3, c.cls <= 3 ? 8 : 25);
    if (d < 3) return { d, skills: ["DECOMPOSITION"], type: "NUMERIC", stem: `There are **${n} ${g}** with **${k} ${per}**. How many ${all} in all?`, answer: n * k, solution: `${n} groups of ${k}: ${n} × ${k} = ${n * k}.` };
    const extra = int(c.r, 2, 9);
    return { d, skills: ["DECOMPOSITION", "ALGORITHMIC"], type: "NUMERIC", stem: `There are **${n} ${g}** with **${k} ${per}**, and **${extra}** more ${all} on their own. Then **${Math.min(extra + k, n * k)}** ${all} are taken away. How many ${all} are left?`, answer: n * k + extra - Math.min(extra + k, n * k), solution: `${n} × ${k} = ${n * k}; + ${extra} = ${n * k + extra}; − ${Math.min(extra + k, n * k)} = ${n * k + extra - Math.min(extra + k, n * k)}.` };
  },
};

export const headsLegs: Family = {
  id: "heads-legs", ds: [3],
  make(c, d) {
    const pairs = [["hens", 2, "goats", 4], ["ducks", 2, "cows", 4], ["bicycles", 2, "tricycles", 3], ["scooters", 2, "cars", 4]] as const;
    const [a, la, b, lb] = pick(c.r, pairs);
    const nb = int(c.r, 1, 6), na = int(c.r, 1, 6);
    const heads = na + nb, legs = na * la + nb * lb;
    const unit = a === "bicycles" || a === "scooters" ? ["vehicles", "wheels"] : ["heads", "legs"];
    return { d, skills: ["DECOMPOSITION", "ABSTRACT"], type: "NUMERIC", stem: `There are some ${a} and ${b}. Together they have **${heads} ${unit[0]}** and **${legs} ${unit[1]}**. How many **${b}** are there?`, answer: nb, solution: `If all ${heads} were ${a}: ${heads * la} ${unit[1]}. There are ${legs - heads * la} extra, and each of the ${b} adds ${lb - la} extra, so ${b}: ${(legs - heads * la) / (lb - la)}. Check: ${na} × ${la} + ${nb} × ${lb} = ${legs}.`, hint: `Imagine all of them were ${a} first.` };
  },
};

export const combos: Family = {
  id: "combos", ds: [2, 3],
  make(c, d) {
    const sets = [["shirts", "shorts", "outfits"], ["kinds of bread", "fillings", "sandwiches"], ["flavours of ice cream", "toppings", "desserts"], ["routes from home to the market", "routes from the market to school", "ways to go from home to school via the market"]];
    const [a, b, w] = pick(c.r, sets);
    const x = int(c.r, 2, 4), y = int(c.r, 2, 5), z = d === 3 ? int(c.r, 2, 3) : 1;
    const ans = x * y * z;
    return { d, skills: ["DECOMPOSITION", "ALGORITHMIC"], type: "NUMERIC", stem: d === 3 ? `You choose 1 from **${x} ${a}**, 1 from **${y} ${b}** and 1 of **${z} drinks**. How many different combinations can you make?` : `You can choose 1 of **${x} ${a}** and 1 of **${y} ${b}**. How many different ${w} are possible?`, answer: ans, solution: `For each of the ${x} choices there are ${y}${z > 1 ? ` × ${z}` : ""} choices: ${x} × ${y}${z > 1 ? ` × ${z}` : ""} = ${ans}.`, hint: "List the options for the first choice." };
  },
};

// ---------------- Measurement ----------------
const CONV = [["m", "cm", 100], ["kg", "g", 1000], ["L", "mL", 1000], ["km", "m", 1000]] as const;
export const unitConvert: Family = {
  id: "unit-convert", ds: [1, 2],
  make(c, d) {
    const [bigU, small, f] = pick(c.r, CONV);
    const a = int(c.r, 1, 9), b = d === 2 ? int(c.r, 1, f / (f === 100 ? 2 : 4)) * (f === 100 ? 1 : 10) : 0;
    return { d, skills: ["DECOMPOSITION"], type: "NUMERIC", stem: `How many **${small}** are there in **${a} ${bigU}${b ? ` ${b} ${small}` : ""}**?`, answer: a * f + b, solution: `1 ${bigU} = ${fmt(f)} ${small}. ${a} × ${fmt(f)}${b ? ` + ${b}` : ""} = ${fmt(a * f + b)} ${small}.` };
  },
};

export const orderMeasures: Family = {
  id: "order-measures", ds: [2, 3],
  make(c, d) {
    const [bigU, small, f] = pick(c.r, CONV);
    const vals = new Set<number>();
    while (vals.size < 4) vals.add(int(c.r, Math.round(f * 0.5), f * 2) - (int(c.r, Math.round(f * 0.5), f * 2) % (f === 100 ? 5 : 50)));
    const v = [...vals];
    const label = (x: number, i: number) => (i % 2 === 0 && x >= f ? `${Math.floor(x / f)} ${bigU}${x % f ? ` ${x % f} ${small}` : ""}` : `${fmt(x)} ${small}`);
    const opts = v.map(label);
    const order = v.map((x, i) => ({ x, i })).sort((a, b) => a.x - b.x).map((o) => o.i);
    return { d, skills: ["ALGORITHMIC", "DECOMPOSITION"], type: "ORDER", stem: `Arrange from **smallest to largest**.`, options: opts, answer: order, solution: `Change everything to ${small}: ${v.map(fmt).join(", ")}. In order: ${order.map((i) => opts[i]).join(", ")}.`, hint: `Write all of them in ${small} first.` };
  },
};

export const fencePosts: Family = {
  id: "fence-posts", ds: [3],
  make(c, d) {
    const gap = pick(c.r, [2, 3, 4, 5]), gaps = int(c.r, 3, 9);
    const len = gap * gaps;
    const thing = pick(c.r, [["fence posts", "m"], ["trees", "m"], ["flags", "m"], ["lamp posts", "m"]]);
    return { d, skills: ["DECOMPOSITION", "GENERALISATION"], type: "NUMERIC", stem: `${thing[0][0].toUpperCase() + thing[0].slice(1)} are placed **${gap} ${thing[1]} apart** along a straight path **${len} ${thing[1]} long**, with one at **both ends**. How many ${thing[0]} are there?`, answer: gaps + 1, solution: `${len} ÷ ${gap} = ${gaps} gaps. With one at each end there is one more ${thing[0].slice(0, -1)} than gaps: ${gaps + 1}.`, hint: "Draw it and count gaps and posts." };
  },
};

export const balance: Family = {
  id: "balance", ds: [2, 3],
  make(c, d) {
    const objs = pick(c.r, [["apples", "mangoes", "bananas", "mango"], ["marbles", "blocks", "balls", "block"], ["pencils", "erasers", "sharpeners", "eraser"]]);
    const a = int(c.r, 2, 4), b = int(c.r, 2, 3);
    if (d === 2) {
      const k = int(c.r, 2, 4);
      return { d, skills: ["DECOMPOSITION", "ABSTRACT"], type: "NUMERIC", stem: `On a balance, **${a} ${objs[0]}** balance **1 ${objs[3]}**. How many ${objs[0]} balance **${k} ${objs[1]}**?`, answer: a * k, solution: `Each of the ${objs[1]} needs ${a} ${objs[0]}: ${k} × ${a} = ${a * k}.` };
    }
    return { d, skills: ["DECOMPOSITION", "ABSTRACT"], type: "NUMERIC", stem: `On a balance:\n- **${a * b} ${objs[0]}** balance **${b} ${objs[1]}**.\n- **1** of the ${objs[1]} balances **${a * 2} ${objs[2]}**.\n\nHow many ${objs[2]} balance **1** of the ${objs[0]}?`, answer: 2, solution: `${a * b} ${objs[0]} = ${b} ${objs[1]}, so 1 of the ${objs[1]} = ${a} ${objs[0]}. That also equals ${a * 2} ${objs[2]}, so ${a} ${objs[0]} = ${a * 2} ${objs[2]} and 1 of the ${objs[0]} = 2 ${objs[2]}.`, hint: "Find what one of the middle objects equals." };
  },
};

// ---------------- Time & calendar ----------------
export const dayAfter: Family = {
  id: "day-after", ds: [1, 2, 3],
  make(c, d) {
    const s = int(c.r, 0, 6), n = d === 1 ? int(c.r, 1, 5) : d === 2 ? int(c.r, 8, 15) : int(c.r, 20, 100);
    const ans = DAYS[(s + n) % 7];
    const o = textOptions(ans, [DAYS[(s + n + 1) % 7], DAYS[(s + n + 6) % 7], DAYS[(s + n + 2) % 7]]);
    return { d, skills: ["ALGORITHMIC", "PATTERN"], type: "MCQ", stem: `Today is **${DAYS[s]}**. What day will it be **${plural(n, "day")}** from today?`, ...o, solution: `Every 7 days the same weekday comes back. ${n} = ${plural(Math.floor(n / 7), "week")} + ${plural(n % 7, "day")}, so count ${n % 7} day${n % 7 === 1 ? "" : "s"} on from ${DAYS[s]}: ${ans}.`, hint: n >= 7 ? "Remove whole weeks first." : undefined };
  },
};

export const timeAfter: Family = {
  id: "time-after", ds: [1, 2, 3],
  make(c, d) {
    const h = int(c.r, 6, 11), m = d === 1 ? 0 : pick(c.r, [10, 15, 20, 30, 40, 45, 50]);
    const dh = int(c.r, 1, 4), dm = d === 3 ? pick(c.r, [25, 35, 45, 50]) : d === 2 ? pick(c.r, [15, 30]) : 0;
    const total = h * 60 + m + dh * 60 + dm;
    const H = Math.floor(total / 60), M = total % 60;
    const show = (hh: number, mm: number) => `${((hh + 11) % 12) + 1}:${String(mm).padStart(2, "0")} ${hh >= 12 ? "pm" : "am"}`;
    const ans = show(H, M);
    const o = textOptions(ans, [show(H, (M + 10) % 60), show(H + 1, M), show(H - 1, M)]);
    return { d, skills: ["ALGORITHMIC"], type: "MCQ", stem: `A ${pick(c.r, ["train", "bus", "class trip", "cricket match", "movie"])} starts at **${show(h, m)}** and lasts **${dh} hour${dh > 1 ? "s" : ""}${dm ? ` ${dm} minutes` : ""}**. When does it end?`, ...o, solution: `${show(h, m)} + ${dh} h = ${show(h + dh, m)}${dm ? `; + ${dm} min = ${ans}` : ""}.` };
  },
};

export const calendarDate: Family = {
  id: "calendar-date", ds: [2, 3],
  make(c, d) {
    const s = int(c.r, 0, 6), d1 = int(c.r, 1, 9), gap = d === 2 ? 7 * int(c.r, 1, 3) : int(c.r, 9, 20);
    const ans = DAYS[(s + gap) % 7];
    const o = textOptions(ans, [DAYS[(s + gap + 1) % 7], DAYS[(s + gap + 6) % 7], DAYS[s]]);
    return { d, skills: ["ALGORITHMIC", "PATTERN"], type: "MCQ", stem: `In a month, the **${ord(d1)}** is a **${DAYS[s]}**. What day is the **${ord(d1 + gap)}**?`, ...o, solution: `${d1 + gap} − ${d1} = ${gap} days later. ${gap} = ${plural(Math.floor(gap / 7), "week")} + ${plural(gap % 7, "day")} → ${ans}.` };
  },
};

// ---------------- Space & logic ----------------
export const turns: Family = {
  id: "turns", ds: [1, 2, 3],
  make(c, d) {
    const s = int(c.r, 0, 3);
    const moves = d === 1 ? [pick(c.r, ["right", "left"])] : d === 2 ? [pick(c.r, ["right", "left"]), pick(c.r, ["right", "left", "half"])] : [pick(c.r, ["right", "left", "half"]), pick(c.r, ["right", "left"]), pick(c.r, ["right", "half", "left"])];
    const delta = { right: 1, left: 3, half: 2 } as const;
    let dir = s;
    for (const m of moves) dir = (dir + delta[m as keyof typeof delta]) % 4;
    const words = moves.map((m) => (m === "half" ? "makes a half turn" : c.cls >= 5 ? `turns a quarter turn ${m === "right" ? "clockwise" : "anticlockwise"}` : `turns ${m}`));
    const ans = DIRS[dir];
    const o = textOptions(ans, DIRS);
    const nm = pick(c.r, NAMES);
    return { d, skills: ["ALGORITHMIC", "ABSTRACT"], type: "MCQ", stem: `${nm} faces **${DIRS[s]}**, then ${words.join(", then ")}. Which way is ${nm} facing now?`, ...o, solution: `Start ${DIRS[s]}. ${moves.map((m) => (m === "half" ? "Half turn → opposite" : m === "right" ? "Right/clockwise → next direction clockwise" : "Left/anticlockwise → next direction anticlockwise")).join(". ")}. Final: ${ans}.`, hint: d > 1 ? "Do one turn at a time." : undefined };
  },
};

export const gridWalk: Family = {
  id: "grid-walk", ds: [1, 2, 3],
  make(c, d) {
    const steps: [string, number][] = [];
    const n = d + 1;
    for (let i = 0; i < n; i++) { let dir = pick(c.r, DIRS); while (i > 0 && dir === steps[i - 1][0]) dir = pick(c.r, DIRS); steps.push([dir, int(c.r, 1, 5)]); }
    let x = 0, y = 0;
    for (const [dir, k] of steps) { if (dir === "North") y += k; if (dir === "South") y -= k; if (dir === "East") x += k; if (dir === "West") x -= k; }
    const desc = (xx: number, yy: number) => (xx === 0 && yy === 0 ? "Back at the start" : [yy ? `${Math.abs(yy)} block${Math.abs(yy) > 1 ? "s" : ""} ${yy > 0 ? "North" : "South"}` : "", xx ? `${Math.abs(xx)} block${Math.abs(xx) > 1 ? "s" : ""} ${xx > 0 ? "East" : "West"}` : ""].filter(Boolean).join(" and ") + " of the start");
    const ans = desc(x, y);
    const o = textOptions(ans, [desc(-x, y), desc(x, -y), desc(y, x), desc(x + 1, y), "Back at the start"]);
    if (o.options.length < 4) return null;
    const walker = pick(c.r, NAMES);
    return { d, skills: ["ALGORITHMIC", "ABSTRACT"], type: "MCQ", stem: `On a street grid, ${walker} walks ${steps.map(([dir, k]) => `**${k} block${k > 1 ? "s" : ""} ${dir}**`).join(", then ")}. Where is ${walker} now?`, ...o, solution: `North/South total: ${y >= 0 ? `${y} North` : `${-y} South`}. East/West total: ${x >= 0 ? `${x} East` : `${-x} West`}. So: ${ans}.`, hint: "Add up the North–South steps and the East–West steps separately." };
  },
};

export const queuePos: Family = {
  id: "queue-pos", ds: [1, 2, 3],
  make(c, d) {
    const total = int(c.r, 6, c.cls <= 3 ? 12 : 30), pos = int(c.r, 2, total - 1), who = pick(c.r, NAMES);
    if (d === 3) return { d, skills: ["DECOMPOSITION", "ALGORITHMIC"], type: "NUMERIC", stem: `In a line, ${who} is **${ord(pos)} from the front** and **${ord(total - pos + 1)} from the back**. How many children are in the line?`, answer: total, solution: `${pos - 1} in front + ${who} + ${total - pos} behind = ${total}. (Or ${pos} + ${total - pos + 1} − 1 because ${who} is counted twice.)`, hint: "Is anyone counted twice?" };
    return { d, skills: ["ALGORITHMIC"], type: "NUMERIC", stem: `There are **${total} children** in a line. ${who} is **${ord(pos)} from the ${d === 1 ? "left" : "front"}**. What is ${who}'s position from the ${d === 1 ? "right" : "back"}?`, answer: total - pos + 1, solution: `${total} − ${pos} + 1 = ${total - pos + 1}.` };
  },
};

export const ordering: Family = {
  id: "ordering", ds: [2, 3],
  make(c, d) {
    const people = sample(c.r, NAMES, d === 2 ? 3 : 4);
    const attr = pick(c.r, [["taller", "tallest", "shortest"], ["older", "oldest", "youngest"], ["faster", "fastest", "slowest"], ["heavier", "heaviest", "lightest"]]);
    const clues = people.slice(0, -1).map((p, i) => `${p} is ${attr[0]} than ${people[i + 1]}.`);
    const order = [...Array(clues.length).keys()].sort(() => c.r() - 0.5).map((i) => clues[i]);
    const askLeast = c.r() < 0.5;
    const ans = askLeast ? people[people.length - 1] : people[0];
    const o = textOptions(ans, [...people, "We can't tell"]);
    return { d, skills: ["ALGORITHMIC", "DECOMPOSITION"], type: "MCQ", stem: `${order.map((x) => `- ${x}`).join("\n")}\n\nWho is the **${askLeast ? attr[2] : attr[1]}**?`, ...o, solution: `Put them in order: ${people.join(" > ")} (${attr[0]} first). The ${askLeast ? attr[2] : attr[1]} is ${ans}.`, hint: "Make a chain from the clues." };
  },
};

export const handshakes: Family = {
  id: "handshakes", ds: [3],
  make(c, d) {
    const n = int(c.r, 4, c.cls <= 5 ? 7 : 12);
    const ctxs = [[`${n} friends meet and each shakes hands once with every other friend. How many handshakes?`, "handshakes"], [`${n} teams play a tournament where every team plays every other team once. How many matches?`, "matches"], [`${n} points are marked, no three in a line. How many line segments join every pair?`, "segments"]];
    const [stem] = pick(c.r, ctxs);
    const ans = (n * (n - 1)) / 2;
    return { d, skills: ["GENERALISATION", "DECOMPOSITION"], type: "NUMERIC", stem, answer: ans, solution: `The first pairs with ${n - 1}, the next with ${n - 2} new ones, … : ${Array.from({ length: n - 1 }, (_, i) => n - 1 - i).join(" + ")} = ${ans}.`, hint: "Count new pairs one person at a time." };
  },
};

export const countSquares: Family = {
  id: "count-squares", ds: [3],
  make(c, d) {
    if (c.cls <= 4 || c.r() < 0.4) {
      const n = int(c.r, 2, 5);
      return { d, skills: ["DECOMPOSITION", "ABSTRACT"], type: "NUMERIC", stem: `A strip has **${n} squares in a row**. How many **rectangles** of any length can you find (squares count too)?`, answer: (n * (n + 1)) / 2, solution: `Length 1: ${n}, length 2: ${n - 1}, … length ${n}: 1. Total ${Array.from({ length: n }, (_, i) => n - i).join(" + ")} = ${(n * (n + 1)) / 2}.` };
    }
    const n = int(c.r, 2, 5);
    const ans = (n * (n + 1) * (2 * n + 1)) / 6;
    return { d, skills: ["DECOMPOSITION", "GENERALISATION"], type: "NUMERIC", stem: `How many **squares of all sizes** are there in a **${n} × ${n}** grid?`, answer: ans, solution: `${Array.from({ length: n }, (_, i) => `${i + 1}×${i + 1}: ${(n - i) ** 2}`).join(", ")}. Total ${ans}.` };
  },
};

export const paintedCube: Family = {
  id: "painted-cube", ds: [3],
  make(c, d) {
    const n = int(c.r, 3, 5);
    const ask = pick(c.r, [["no", (n - 2) ** 3, `The unpainted cubes form the inner (${n}−2)³ = ${(n - 2) ** 3} cube.`], ["exactly 3", 8, "Only the 8 corner cubes have 3 painted faces."], ["exactly 2", 12 * (n - 2), `Edge cubes (not corners): 12 edges × ${n - 2} = ${12 * (n - 2)}.`], ["exactly 1", 6 * (n - 2) ** 2, `Face-centre cubes: 6 faces × ${n - 2}² = ${6 * (n - 2) ** 2}.`]] as const);
    return { d, skills: ["ABSTRACT", "DECOMPOSITION"], type: "NUMERIC", stem: `A ${n} × ${n} × ${n} cube is built from small cubes and its **outside is painted**. How many small cubes have **${ask[0]}** painted face${ask[0] === "exactly 1" ? "" : "s"}?`, answer: ask[1], solution: ask[2], hint: "Think about corners, edges, faces and the hidden middle." };
  },
};

// ---------------- Geometry ----------------
const SYM = [["a square", 4], ["a rectangle (not a square)", 2], ["an equilateral triangle", 3], ["a regular pentagon", 5], ["a regular hexagon", 6], ["an isosceles triangle (not equilateral)", 1], ["a scalene triangle", 0], ["a regular octagon", 8], ["a rhombus (not a square)", 2], ["a kite", 1]] as const;
export const symmetryLines: Family = {
  id: "symmetry-lines", ds: [1, 2, 3],
  make(c, d) {
    const pool = SYM.filter((_, i) => (d === 1 ? i < 3 : d === 2 ? i < 6 : true));
    const [shape, n] = pick(c.r, pool);
    return { d, skills: ["ABSTRACT"], type: "NUMERIC", stem: `How many lines of symmetry does **${shape}** have?`, answer: n, solution: n === 0 ? "No fold makes the two halves match, so it has 0 lines of symmetry." : `It has ${n} line${n > 1 ? "s" : ""} of symmetry${shape.includes("regular") ? " — a regular polygon has as many lines as sides" : ""}.` };
  },
};

const MIRROR_YES = ["A", "H", "I", "M", "O", "T", "U", "V", "W", "X", "Y"];
const MIRROR_NO = ["B", "C", "D", "E", "F", "G", "J", "K", "L", "N", "P", "R", "S", "Z"];
const WATER_YES = ["B", "C", "D", "E", "H", "I", "K", "O", "X"];
const WATER_NO = ["A", "F", "G", "J", "L", "M", "N", "P", "R", "T", "U", "V", "W", "Y", "Z"];
export const mirrorLetter: Family = {
  id: "mirror-letter", ds: [1, 2],
  make(c, d) {
    const water = d === 2 && c.cls >= 5;
    const yes = pick(c.r, water ? WATER_YES : MIRROR_YES);
    const no = sample(c.r, water ? WATER_NO : MIRROR_NO, 3);
    const o = textOptions(yes, no);
    return { d, skills: ["ABSTRACT"], type: "MCQ", stem: water ? "In a **water image** (reflection in a lake), top and bottom are flipped. Which capital letter looks **the same** in its water image?" : "You hold a mirror **beside** a capital letter. Which letter looks **the same** in the mirror?", ...o, solution: water ? `${yes} has matching top and bottom halves (a horizontal line of symmetry).` : `${yes} has matching left and right halves (a vertical line of symmetry). ${no.join(", ")} look reversed.` };
  },
};

export const angleFacts: Family = {
  id: "angle-facts", ds: [1, 2, 3],
  make(c, d) {
    const kind = d === 1 ? "line" : d === 2 ? pick(c.r, ["triangle", "line", "vertical"]) : pick(c.r, ["quad", "isosceles", "triangle"]);
    if (kind === "line") { const a = int(c.r, 20, 160); return { d, skills: ["ABSTRACT", "DECOMPOSITION"], type: "NUMERIC", stem: `Two angles together make a straight line. One is **${a}°**. What is the other?`, answer: 180 - a, solution: `Angles on a straight line add to 180°: 180 − ${a} = ${180 - a}°.` }; }
    if (kind === "vertical") { const a = int(c.r, 20, 160); return { d, skills: ["ABSTRACT"], type: "NUMERIC", stem: `Two straight lines cross. One angle is **${a}°**. What is the angle **opposite** to it?`, answer: a, solution: "Vertically opposite angles are equal." }; }
    if (kind === "triangle") { const a = int(c.r, 30, 80), b = int(c.r, 30, 80); return { d, skills: ["ABSTRACT", "DECOMPOSITION"], type: "NUMERIC", stem: `Two angles of a triangle are **${a}°** and **${b}°**. What is the third angle?`, answer: 180 - a - b, solution: `180 − ${a} − ${b} = ${180 - a - b}°.` }; }
    if (kind === "isosceles") { const top = 2 * int(c.r, 10, 50); return { d, skills: ["ABSTRACT", "DECOMPOSITION"], type: "NUMERIC", stem: `In an isosceles triangle the angle between the two equal sides is **${top}°**. What is each of the other two angles?`, answer: (180 - top) / 2, solution: `The two base angles are equal and share 180 − ${top} = ${180 - top}°: ${(180 - top) / 2}° each.` }; }
    const a = int(c.r, 60, 120), b = int(c.r, 60, 120), e = int(c.r, 60, 110);
    return { d, skills: ["ABSTRACT", "DECOMPOSITION"], type: "NUMERIC", stem: `Three angles of a quadrilateral are **${a}°, ${b}° and ${e}°**. What is the fourth angle?`, answer: 360 - a - b - e, solution: `Angles of a quadrilateral add to 360°: 360 − ${a + b + e} = ${360 - a - b - e}°.` };
  },
};

export const clockAngle: Family = {
  id: "clock-angle", ds: [2, 3],
  make(c, d) {
    const h = int(c.r, 1, 11);
    const ang = Math.min(h, 12 - h) * 30;
    return { d, skills: ["ABSTRACT"], type: "NUMERIC", stem: `What is the **smaller** angle between the hour and minute hands at exactly **${h}:00**?`, answer: ang, solution: `Each hour mark is 360 ÷ 12 = 30°. The hands are ${Math.min(h, 12 - h)} marks apart: ${Math.min(h, 12 - h)} × 30 = ${ang}°.` };
  },
};

export const perimArea: Family = {
  id: "perim-area", ds: [1, 2, 3],
  make(c, d) {
    const l = int(c.r, 3, 15), w = int(c.r, 2, l - 1);
    if (d === 1) return c.r() < 0.5
      ? { d, skills: ["DECOMPOSITION"], type: "NUMERIC", stem: `What is the **perimeter** of a rectangle **${l} cm long and ${w} cm wide**?`, answer: 2 * (l + w), solution: `${l} + ${w} + ${l} + ${w} = ${2 * (l + w)} cm.` }
      : { d, skills: ["DECOMPOSITION"], type: "NUMERIC", stem: `What is the **area** of a rectangle **${l} cm × ${w} cm** (in square cm)?`, answer: l * w, solution: `${l} × ${w} = ${l * w} square cm.` };
    if (d === 2) return c.r() < 0.5
      ? { d, skills: ["DECOMPOSITION", "ABSTRACT"], type: "NUMERIC", stem: `A rectangle has a perimeter of **${2 * (l + w)} cm** and a length of **${l} cm**. What is its width?`, answer: w, solution: `Length + width = ${2 * (l + w)} ÷ 2 = ${l + w}. Width = ${l + w} − ${l} = ${w} cm.` }
      : { d, skills: ["ABSTRACT"], type: "NUMERIC", stem: `A square has an area of **${l * l} square cm**. How long is each side?`, answer: l, solution: `${l} × ${l} = ${l * l}, so each side is ${l} cm.` };
    const L = l + 4, W = w + 4;
    return { d, skills: ["DECOMPOSITION", "ABSTRACT"], type: "NUMERIC", stem: `A garden is **${L} m × ${W} m**. A path **1 m wide** runs along the inside of all four edges. What is the **area of the path** (square m)?`, answer: L * W - (L - 2) * (W - 2), solution: `Whole: ${L * W}. Inside the path: ${L - 2} × ${W - 2} = ${(L - 2) * (W - 2)}. Path: ${L * W - (L - 2) * (W - 2)} square m.`, hint: "Subtract the inner rectangle from the whole." };
  },
};

// ---------------- Fractions & decimals ----------------
export const fractionOf: Family = {
  id: "fraction-of", ds: [1, 2, 3],
  make(c, d) {
    const den = pick(c.r, d === 1 ? [2, 4] : [3, 4, 5, 6, 8, 10]), num = d === 1 ? 1 : int(c.r, 1, den - 1);
    const each = int(c.r, 2, 12), total = den * each;
    const thing = pick(c.r, ["sweets", "pages", "children", "rupees", "marbles", "km"]);
    if (d < 3) return { d, skills: ["DECOMPOSITION"], type: "NUMERIC", stem: `What is **${num}/${den}** of **${total} ${thing}**?`, answer: num * each, solution: num === 1 ? `${total} ÷ ${den} = ${each}.` : `${total} ÷ ${den} = ${each}; × ${num} = ${num * each}.` };
    const den2 = pick(c.r, [2, 3, 4].filter((x) => x !== den && total % x === 0));
    if (!den2) return null;
    const used = (num * total) / den + total / den2;
    if (used >= total) return null;
    return { d, skills: ["DECOMPOSITION", "ALGORITHMIC"], type: "NUMERIC", stem: `A book has **${total} pages**. ${pick(c.r, NAMES)} reads **${num}/${den}** of the book on Monday and **1/${den2}** of the book on Tuesday. How many pages are left?`, answer: total - used, solution: `Monday: ${(num * total) / den}. Tuesday: ${total / den2}. Left: ${total} − ${used} = ${total - used}.`, hint: "Find each day's pages from the whole book." };
  },
};

export const compareFractions: Family = {
  id: "compare-fractions", ds: [1, 2, 3],
  make(c, d) {
    let fr: [number, number][];
    if (d === 1) { const den = int(c.r, 5, 12); fr = sample(c.r, [...Array(den - 1).keys()].map((i) => [i + 1, den] as [number, number]), 4); }
    else if (d === 2) fr = sample(c.r, [2, 3, 4, 5, 6, 8, 10].map((x) => [1, x] as [number, number]), 4);
    else fr = sample(c.r, [[1, 2], [2, 3], [3, 4], [3, 5], [5, 8], [4, 5], [7, 10], [2, 5]] as [number, number][], 4);
    const val = (f: [number, number]) => f[0] / f[1];
    if (new Set(fr.map(val)).size < 4) return null;
    const best = [...fr].sort((a, b) => val(b) - val(a))[0];
    const o = textOptions(`${best[0]}/${best[1]}`, fr.filter((f) => f !== best).map((f) => `${f[0]}/${f[1]}`));
    return { d, skills: ["ABSTRACT", "EVALUATION"], type: "MCQ", stem: "Which fraction is the **largest**?", ...o, solution: d === 1 ? "Same-sized parts: the biggest top number wins." : d === 2 ? "With top number 1, fewer (bigger) pieces means a bigger fraction." : `As decimals: ${fr.map((f) => `${f[0]}/${f[1]} = ${(val(f)).toFixed(3).replace(/0+$/, "")}`).join(", ")}.` };
  },
};

export const decimalOps: Family = {
  id: "decimal-ops", ds: [1, 2, 3],
  make(c, d) {
    const a = int(c.r, 10, 99) / 10, b = int(c.r, 10, 299) / 100;
    if (d === 1) { const x = int(c.r, 1, 9) / 10, y = int(c.r, 1, 9) / 10; const s = Math.round((x + y) * 10) / 10; return { d, skills: ["DECOMPOSITION"], type: "NUMERIC", stem: `**${x} + ${y} = ?**`, answer: s, solution: `${x * 10} tenths + ${y * 10} tenths = ${Math.round(s * 10)} tenths = ${s}.` }; }
    if (d === 2) { const s = Math.round((a + b) * 100) / 100; return { d, skills: ["DECOMPOSITION"], type: "NUMERIC", stem: `**${a} + ${b} = ?**`, answer: s, solution: `Line up the decimal points: ${a.toFixed(2)} + ${b.toFixed(2)} = ${s.toFixed(2)}.` }; }
    const price = int(c.r, 40, 160), qty = pick(c.r, [0.5, 1.5, 2.5, 0.25]);
    const cost = price * qty;
    if (!Number.isInteger(cost)) return null;
    const note = [100, 200, 500].find((x) => x > cost)!;
    return { d, skills: ["DECOMPOSITION", "ALGORITHMIC"], type: "NUMERIC", stem: `${pick(c.r, NAMES)} buys **${qty} kg** of ${pick(c.r, ["apples", "tomatoes", "grapes", "dal"])} at **₹${price} per kg** and pays with **₹${note}**. How much change?`, answer: note - cost, solution: `${qty} × ${price} = ₹${cost}. ${note} − ${cost} = ₹${note - cost}.` };
  },
};

// ---------------- Number theory (6–8) ----------------
const primesUpTo = (n: number) => [...Array(n + 1).keys()].filter((x) => x > 1 && [...Array(x).keys()].slice(2).every((k) => x % k));
export const primeChoice: Family = {
  id: "prime-choice", ds: [1, 2],
  make(c, d) {
    const primes = primesUpTo(d === 1 ? 30 : 100).filter((p) => p > 10);
    const comps = [...Array(d === 1 ? 30 : 100).keys()].filter((x) => x > 10 && !primes.includes(x) && x % 2 === 1);
    const p = pick(c.r, primes);
    const o = textOptions(String(p), sample(c.r, comps, 3).map(String));
    return { d, skills: ["EVALUATION", "DECOMPOSITION"], type: "MCQ", stem: "Which number is **prime**?", ...o, solution: `${p} has only two factors, 1 and itself. The others can be split: ${o.options.slice(1).map((x) => { const n = Number(x); const f = [3, 5, 7, 11, 13].find((k) => n % k === 0)!; return `${n} = ${f} × ${n / f}`; }).join(", ")}.` };
  },
};

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
export const hcfLcm: Family = {
  id: "hcf-lcm", ds: [2, 3],
  make(c, d) {
    const g = int(c.r, 2, 8), a = g * int(c.r, 2, 6), b = g * int(c.r, 2, 6);
    if (a === b) return null;
    if (d === 2) { const h = gcd(a, b); return { d, skills: ["DECOMPOSITION"], type: "NUMERIC", stem: `What is the **largest** number that divides both **${a}** and **${b}** exactly?`, answer: h, solution: `List the factors and find the biggest common one: HCF(${a}, ${b}) = ${h}.` }; }
    const l = (a * b) / gcd(a, b);
    const ctx = pick(c.r, [`Two buses leave together; one every **${a} minutes**, the other every **${b} minutes**. After how many minutes do they next leave together?`, `Two lights blink together; one every **${a} seconds**, the other every **${b} seconds**. After how many seconds do they next blink together?`, `What is the **smallest** number that both **${a}** and **${b}** divide exactly?`]);
    return { d, skills: ["DECOMPOSITION", "GENERALISATION"], type: "NUMERIC", stem: ctx, answer: l, solution: `Find the first common multiple: LCM(${a}, ${b}) = ${l}.`, hint: "List the multiples of each." };
  },
};

export const divisibility: Family = {
  id: "divisibility", ds: [1, 2, 3],
  make(c, d) {
    const k = d === 1 ? pick(c.r, [2, 5, 10]) : d === 2 ? pick(c.r, [3, 4, 9]) : pick(c.r, [6, 11, 8]);
    const yes = k * int(c.r, 120, 999);
    const nos = new Set<number>();
    while (nos.size < 3) { const n = yes + int(c.r, 1, k - 1) + k * int(c.r, -40, 40); if (n % k && n > 100) nos.add(n); }
    const o = textOptions(fmt(yes), [...nos].map(fmt));
    const rule: Record<number, string> = { 2: "ends in an even digit", 5: "ends in 0 or 5", 10: "ends in 0", 3: "digit sum is a multiple of 3", 9: "digit sum is a multiple of 9", 4: "last two digits make a multiple of 4", 6: "is divisible by both 2 and 3", 11: "alternating digit sum is a multiple of 11", 8: "last three digits make a multiple of 8" };
    return { d, skills: ["DECOMPOSITION", "EVALUATION"], type: "MCQ", stem: `Which number is divisible by **${k}**?`, ...o, solution: `A number is divisible by ${k} if it ${rule[k]}. ${fmt(yes)} = ${k} × ${fmt(yes / k)}.` };
  },
};

export const remainderQ: Family = {
  id: "remainder", ds: [2, 3],
  make(c, d) {
    if (d === 2) { const k = int(c.r, 3, 9), n = int(c.r, 30, 200); return { d, skills: ["DECOMPOSITION"], type: "NUMERIC", stem: `What is the **remainder** when **${n}** is divided by **${k}**?`, answer: n % k, solution: `${k} × ${Math.floor(n / k)} = ${k * Math.floor(n / k)}. ${n} − ${k * Math.floor(n / k)} = ${n % k}.` }; }
    const a = int(c.r, 2, 5), b = a + int(c.r, 1, 3), r = int(c.r, 1, a - 1 || 1);
    const l = (a * b) / gcd(a, b);
    return { d, skills: ["DECOMPOSITION", "GENERALISATION"], type: "NUMERIC", stem: `What is the smallest number **greater than ${r}** that leaves a remainder of **${r}** when divided by **${a}** and also by **${b}**?`, answer: l + r, solution: `The number minus ${r} must be a common multiple of ${a} and ${b}; the smallest is ${l}. Answer: ${l + r}.` };
  },
};

export const factorCount: Family = {
  id: "factor-count", ds: [2, 3],
  make(c, d) {
    const n = pick(c.r, d === 2 ? [12, 18, 20, 16, 15, 28, 30] : [36, 48, 60, 72, 64, 90, 100]);
    const f = [...Array(n + 1).keys()].filter((k) => k && n % k === 0);
    return { d, skills: ["DECOMPOSITION", "ALGORITHMIC"], type: "NUMERIC", stem: `How many **factors** does **${n}** have?`, answer: f.length, solution: `Pair them up: ${f.slice(0, Math.ceil(f.length / 2)).map((x) => `${x}×${n / x}`).join(", ")} → ${f.length} factors.`, hint: "Find factors in pairs." };
  },
};

export const powersQ: Family = {
  id: "powers", ds: [1, 2, 3],
  make(c, d) {
    if (d === 1) { const b = int(c.r, 2, 15), sq = c.r() < 0.6; return { d, skills: ["DECOMPOSITION"], type: "NUMERIC", stem: sq ? `What is **${b}²**?` : `What is the **cube** of **${Math.min(b, 9)}**?`, answer: sq ? b * b : Math.min(b, 9) ** 3, solution: sq ? `${b} × ${b} = ${b * b}.` : `${Math.min(b, 9)} × ${Math.min(b, 9)} × ${Math.min(b, 9)} = ${Math.min(b, 9) ** 3}.` }; }
    if (d === 2) { const b = pick(c.r, [2, 3, 5, 10]), e = int(c.r, 3, b === 2 ? 10 : 5); return { d, skills: ["DECOMPOSITION", "PATTERN"], type: "NUMERIC", stem: `What is **${b}${["⁰", "¹", "²", "³", "⁴", "⁵", "⁶", "⁷", "⁸", "⁹", "¹⁰"][e]}** (${b} multiplied by itself ${e} times)?`, answer: b ** e, solution: `${Array(e).fill(b).join(" × ")} = ${fmt(b ** e)}.` }; }
    const b = pick(c.r, [2, 3, 7, 4]), e = int(c.r, 10, 40);
    const cyc: Record<number, number[]> = { 2: [2, 4, 8, 6], 3: [3, 9, 7, 1], 7: [7, 9, 3, 1], 4: [4, 6, 4, 6] };
    const ans = cyc[b][(e - 1) % 4];
    return { d, skills: ["PATTERN", "GENERALISATION"], type: "NUMERIC", stem: `What is the **last digit** of **${b}** raised to the power **${e}**?`, answer: ans, solution: `Last digits of powers of ${b} repeat: ${cyc[b].join(", ")} (every 4). ${e} leaves remainder ${e % 4 || 4} after removing groups of 4 → ${ans}.`, hint: "Write the last digits of the first few powers." };
  },
};

export const binaryQ: Family = {
  id: "binary", ds: [1, 2, 3],
  make(c, d) {
    const n = d === 1 ? int(c.r, 2, 15) : d === 2 ? int(c.r, 16, 63) : int(c.r, 64, 200);
    const b = n.toString(2);
    if (c.r() < 0.5) return { d, skills: ["ABSTRACT"], type: "NUMERIC", stem: `What is binary **${b}** in our usual (decimal) numbers?`, answer: n, solution: `${b.split("").map((x, i) => `${x}×${2 ** (b.length - 1 - i)}`).join(" + ")} = ${n}.` };
    return { d, skills: ["ABSTRACT", "ALGORITHMIC"], type: "FILL_BLANK", stem: `Write **${n}** in **binary**.`, answer: [b], solution: `${n} = ${b.split("").map((x, i) => (x === "1" ? 2 ** (b.length - 1 - i) : 0)).filter(Boolean).join(" + ")} → ${b}.`, hint: "Use place values 1, 2, 4, 8, 16, 32, …" };
  },
};

export const integersQ: Family = {
  id: "integers", ds: [1, 2, 3],
  make(c, d) {
    if (d === 1) { const a = int(c.r, -9, -1), b = int(c.r, 1, 12); return { d, skills: ["DECOMPOSITION"], type: "NUMERIC", stem: `**${String(a).replace("-", "−")} + ${b} = ?**`, answer: a + b, solution: `Start at ${String(a).replace("-", "−")} on the number line and move ${b} steps right: ${String(a + b).replace("-", "−")}.` }; }
    if (d === 2) { const t = int(c.r, -5, 12), drop = int(c.r, 5, 20); return { d, skills: ["DECOMPOSITION"], type: "NUMERIC", stem: `The temperature in ${pick(c.r, ["Leh", "Shimla", "Srinagar", "Gulmarg"])} is **${t}°C**. At night it drops by **${drop}°C**. What is it now?`, answer: t - drop, solution: `${t} − ${drop} = ${String(t - drop).replace("-", "−")}°C.` }; }
    const vals = [int(c.r, -20, -1), int(c.r, 1, 20), int(c.r, -15, -1), int(c.r, 1, 15)];
    return { d, skills: ["DECOMPOSITION"], type: "NUMERIC", stem: `A shop's daily results: ${vals.map((v) => (v >= 0 ? `profit ₹${v * 10}` : `loss ₹${-v * 10}`)).join(", ")}. What is the total result in ₹? (Write a loss as a negative number.)`, answer: vals.reduce((a, b) => a + b, 0) * 10, solution: `${vals.map((v) => v * 10).join(" + ").replace(/\+ -/g, "− ")} = ${vals.reduce((a, b) => a + b, 0) * 10}.` };
  },
};

export const algebraQ: Family = {
  id: "algebra", ds: [1, 2, 3],
  make(c, d) {
    const x = int(c.r, 2, 9);
    if (d === 1) { const a = int(c.r, 2, 9), b = int(c.r, 1, 15); return { d, skills: ["ALGORITHMIC"], type: "NUMERIC", stem: `If **n = ${x}**, what is **${a}n + ${b}**?`, answer: a * x + b, solution: `${a} × ${x} + ${b} = ${a * x + b}.` }; }
    if (d === 2) { const b = int(c.r, 1, 9); return { d, skills: ["ALGORITHMIC"], type: "NUMERIC", stem: `If **x = ${x}**, what is **x² − ${b}x**?`, answer: x * x - b * x, solution: `${x * x} − ${b * x} = ${x * x - b * x}.` }; }
    const a = int(c.r, 2, 7), b = int(c.r, 1, 20), r = a * x + b;
    return { d, skills: ["ALGORITHMIC", "ABSTRACT"], type: "NUMERIC", stem: `Solve for **y**:\n\n${a}y + ${b} = ${r}`, answer: x, solution: `${a}y = ${r} − ${b} = ${r - b}, so y = ${r - b} ÷ ${a} = ${x}.` };
  },
};

export const ratioQ: Family = {
  id: "ratio", ds: [1, 2, 3],
  make(c, d) {
    if (d === 1) { const n = int(c.r, 2, 6), p = int(c.r, 5, 40), m = int(c.r, 2, 9); return { d, skills: ["DECOMPOSITION"], type: "NUMERIC", stem: `**${n} ${pick(c.r, ["pens", "notebooks", "bananas", "tickets"])}** cost **₹${n * p}**. How much do **${m}** cost?`, answer: m * p, solution: `One costs ₹${n * p} ÷ ${n} = ₹${p}. ${m} × ${p} = ₹${m * p}.` }; }
    if (d === 2) { const a = int(c.r, 1, 5), b = int(c.r, a + 1, 9), k = int(c.r, 10, 50); return { d, skills: ["DECOMPOSITION"], type: "NUMERIC", stem: `Share **₹${(a + b) * k}** in the ratio **${a} : ${b}**. What is the **larger** share?`, answer: b * k, solution: `${a + b} parts → 1 part = ₹${k}. Larger share = ${b} × ${k} = ₹${b * k}.` }; }
    const w = int(c.r, 2, 6), days = pick(c.r, [6, 8, 9, 10, 12, 15, 18, 20]);
    const m = pick(c.r, [2, 3, 4, 5].filter((k) => days % k === 0));
    if (!m) return null;
    const w2 = w * m;
    return { d, skills: ["DECOMPOSITION", "EVALUATION"], type: "NUMERIC", stem: `**${w} workers** finish a job in **${days} days**. At the same rate, how many days would **${w2} workers** take?`, answer: (w * days) / w2, solution: `Total work = ${w} × ${days} = ${w * days} worker-days. ${w * days} ÷ ${w2} = ${(w * days) / w2} days. More workers → fewer days.` };
  },
};

export const percentQ: Family = {
  id: "percent", ds: [1, 2, 3],
  make(c, d) {
    const p = pick(c.r, d === 1 ? [10, 25, 50] : [5, 15, 20, 30, 40, 60, 75]), base = 20 * int(c.r, 2, 30);
    if (d < 3) return { d, skills: ["DECOMPOSITION"], type: "NUMERIC", stem: `What is **${p}%** of **${base}**?`, answer: (p * base) / 100, solution: `${p}% = ${p}/100. ${base} × ${p} ÷ 100 = ${(p * base) / 100}.` };
    const off = pick(c.r, [10, 20, 25]), price = 40 * int(c.r, 5, 30);
    return { d, skills: ["DECOMPOSITION", "ALGORITHMIC"], type: "NUMERIC", stem: `A ${pick(c.r, ["school bag", "pair of shoes", "cricket bat", "water bottle"])} costs **₹${price}**. There is a **${off}% discount**. What is the sale price?`, answer: price - (price * off) / 100, solution: `Discount: ${off}% of ${price} = ₹${(price * off) / 100}. Sale price: ${price} − ${(price * off) / 100} = ₹${price - (price * off) / 100}.` };
  },
};

export const dataTable: Family = {
  id: "data-table", ds: [1, 2, 3],
  make(c, d) {
    const themes = [["Favourite fruit", ["Mango", "Banana", "Apple", "Guava", "Papaya"]], ["Favourite sport", ["Cricket", "Football", "Kabaddi", "Badminton", "Hockey"]], ["Way to school", ["Walk", "Bus", "Cycle", "Car", "Auto"]], ["Trees in the park", ["Neem", "Peepal", "Mango", "Banyan", "Ashoka"]]] as const;
    const [title, cats] = pick(c.r, themes);
    const names = sample(c.r, cats, 4);
    const mult = c.cls <= 4 ? 1 : 2;
    const vals: number[] = [];
    while (vals.length < 4) { const v = int(c.r, 2, 15) * mult; if (!vals.includes(v)) vals.push(v); }
    const table = `${title}:\n\n| Choice | Number |\n|---|---|\n${names.map((n, i) => `| ${n} | ${vals[i]} |`).join("\n")}`;
    const total = vals.reduce((a, b) => a + b, 0);
    const mx = Math.max(...vals), mn = Math.min(...vals);
    const q = d === 1 ? pick(c.r, ["total", "most"]) : d === 2 ? pick(c.r, ["diff", "pair"]) : pick(c.r, ["mean", "pict"]);
    if (q === "total") return { d, skills: ["DECOMPOSITION", "DATA"], type: "NUMERIC", stem: `${table}\n\nHow many in total?`, answer: total, solution: `${vals.join(" + ")} = ${total}.` };
    if (q === "most") { const o = textOptions(names[vals.indexOf(mx)], names); return { d, skills: ["DECOMPOSITION", "DATA"], type: "MCQ", stem: `${table}\n\nWhich is the **most** popular?`, ...o, solution: `${names[vals.indexOf(mx)]} has the biggest number (${mx}).` }; }
    if (q === "diff") return { d, skills: ["DECOMPOSITION", "DATA"], type: "NUMERIC", stem: `${table}\n\nWhat is the difference between the **most** and the **least** popular?`, answer: mx - mn, solution: `${mx} − ${mn} = ${mx - mn}.` };
    if (q === "pair") return { d, skills: ["DECOMPOSITION", "DATA"], type: "NUMERIC", stem: `${table}\n\nHow many chose **${names[0]}** or **${names[2]}** altogether?`, answer: vals[0] + vals[2], solution: `${vals[0]} + ${vals[2]} = ${vals[0] + vals[2]}.` };
    if (q === "mean") { if (total % 4) return null; return { d, skills: ["DATA", "DECOMPOSITION"], type: "NUMERIC", stem: `${table}\n\nWhat is the **average** (mean) per choice?`, answer: total / 4, solution: `Total ${total} ÷ 4 = ${total / 4}.` }; }
    const per = pick(c.r, [2, 5].filter((k) => vals[1] % k === 0));
    if (!per) return null;
    return { d, skills: ["ABSTRACT", "DATA"], type: "NUMERIC", stem: `${table}\n\nIn a pictograph, **1 symbol = ${per}**. How many symbols are drawn for **${names[1]}**?`, answer: vals[1] / per, solution: `${vals[1]} ÷ ${per} = ${vals[1] / per} symbols.` };
  },
};

export const caesar: Family = {
  id: "caesar", ds: [2, 3],
  make(c, d) {
    const words = ["CAT", "SUN", "TREE", "BOOK", "MANGO", "RIVER", "TIGER", "KITE", "LAMP", "CODE", "DATA", "ROBOT"];
    const w = pick(c.r, words), k = d === 2 ? int(c.r, 1, 2) : int(c.r, 3, 5);
    const enc = w.split("").map((ch) => String.fromCharCode(((ch.charCodeAt(0) - 65 + k) % 26) + 65)).join("");
    if (d === 2) return { d, skills: ["ALGORITHMIC", "PATTERN"], type: "FILL_BLANK", stem: `In a secret code, every letter moves **${k} step${k > 1 ? "s" : ""} forward** in the alphabet (A→${String.fromCharCode(65 + k)}). How is **${w}** written in code?`, answer: [enc], solution: `${w.split("").map((ch, i) => `${ch}→${enc[i]}`).join(", ")}: ${enc}.` };
    return { d, skills: ["ALGORITHMIC", "ABSTRACT"], type: "FILL_BLANK", stem: `A message was coded by moving every letter **${k} steps forward** in the alphabet (Z wraps round to A). The coded word is **${enc}**. What was the original word?`, answer: [w], solution: `Move each letter ${k} steps back: ${enc.split("").map((ch, i) => `${ch}→${w[i]}`).join(", ")}: ${w}.`, hint: "Decoding means moving backwards." };
  },
};

export const ALL_CT: Record<string, Family> = Object.fromEntries([
  seqNext, seqMissing, seqGrowing, seqGeometric, seqInterleaved, nthTerm, emojiPattern, letterPattern, placeCompose, digitValue, digitsMake, orderNumbers, whoAmI, compareSign,
  moneyChange, shareLeft, twoStep, missingNumber, groupsTotal, headsLegs, combos, unitConvert, orderMeasures, fencePosts, balance, dayAfter, timeAfter, calendarDate,
  turns, gridWalk, queuePos, ordering, handshakes, countSquares, paintedCube, symmetryLines, mirrorLetter, angleFacts, clockAngle, perimArea, fractionOf, compareFractions, decimalOps,
  primeChoice, hcfLcm, divisibility, remainderQ, factorCount, powersQ, binaryQ, integersQ, algebraQ, ratioQ, percentQ, dataTable, caesar,
].map((f) => [f.id, f]));
export type { D };

// ---------------- Extra families for chapters with few natural shapes ----------------
export const foldHoles: Family = {
  id: "fold-holes", ds: [2, 3],
  make(c, d) {
    const folds = d === 2 ? int(c.r, 1, 2) : int(c.r, 3, 4), holes = int(c.r, 1, 3);
    return { d, skills: ["ABSTRACT", "GENERALISATION"], type: "NUMERIC", stem: `A sheet of paper is folded in half **${folds} time${folds > 1 ? "s" : ""}**. Then **${holes} hole${holes > 1 ? "s are" : " is"}** punched through all the layers. How many holes are there when the paper is opened?`, answer: holes * 2 ** folds, solution: `Each fold doubles the layers: ${folds} fold${folds > 1 ? "s" : ""} → ${Array(folds).fill(2).join(" × ")} = ${2 ** folds} layers. ${holes} × ${2 ** folds} = ${holes * 2 ** folds} holes.`, hint: "How many layers does each fold make?" };
  },
};

export const mirrorClock: Family = {
  id: "mirror-clock", ds: [2, 3],
  make(c, d) {
    const h = int(c.r, 1, 11);
    if (h === 6) return null;
    const real = 12 - h;
    const o = textOptions(`${real}:00`, [`${h}:00`, `${(real % 12) + 1}:00`, `${((h + 5) % 12) + 1}:00`]);
    return { d, skills: ["ABSTRACT", "EVALUATION"], type: "MCQ", stem: `You see a clock **in a mirror**. The hour hand seems to point at **${h}** and the minute hand at **12**. What is the **real** time?`, ...o, solution: `A mirror flips left and right. For whole hours, real hour = 12 − ${h} = ${real}, so the time is ${real}:00.` };
  },
};

export const palindromeNum: Family = {
  id: "palindrome", ds: [1, 2, 3],
  make(c, d) {
    const len = d === 1 ? 3 : d === 2 ? 4 : 5;
    const half = Array.from({ length: Math.ceil(len / 2) }, (_, i) => (i === 0 ? int(c.r, 1, 9) : int(c.r, 0, 9)));
    const pal = Number([...half, ...half.slice(0, Math.floor(len / 2)).reverse()].join(""));
    const wrong = new Set<number>();
    while (wrong.size < 3) { const w = pal + int(c.r, 1, 9) * 10 ** int(c.r, 0, 1); const s = String(w); if (s !== s.split("").reverse().join("")) wrong.add(w); }
    const o = textOptions(String(pal), [...wrong].map(String));
    return { d, skills: ["PATTERN", "ABSTRACT"], type: "MCQ", stem: "A **palindrome** reads the same forwards and backwards. Which number is a palindrome?", ...o, solution: `${pal} read backwards is ${String(pal).split("").reverse().join("")} — the same.` };
  },
};

export const primeCount: Family = {
  id: "prime-count", ds: [2, 3],
  make(c, d) {
    const a = d === 2 ? pick(c.r, [1, 10, 20, 30]) : pick(c.r, [40, 50, 60, 70, 80]);
    const b = a + (d === 2 ? 10 : 20);
    const ps = [...Array(b + 1).keys()].filter((x) => x > a && x > 1 && [...Array(x).keys()].slice(2).every((k) => x % k));
    return { d, skills: ["DECOMPOSITION", "ALGORITHMIC"], type: "NUMERIC", stem: `How many **prime numbers** are there between **${a} and ${b}**?`, answer: ps.length, solution: `Check each number: ${ps.join(", ")} → ${ps.length}.`, hint: "Cross out even numbers and multiples of 3, 5 and 7 first." };
  },
};

export const primeFactorise: Family = {
  id: "prime-factorise", ds: [2, 3],
  make(c, d) {
    const ps = d === 2 ? sample(c.r, [2, 2, 3, 3, 5], 3) : sample(c.r, [2, 2, 2, 3, 3, 5, 7], 4);
    ps.sort((a, b) => a - b);
    const n = ps.reduce((a, b) => a * b, 1);
    const right = ps.join(" × ");
    const wrong = [`${ps.slice(0, -1).join(" × ")} × ${ps[ps.length - 1] + 2}`, `${n / ps[0]} × ${ps[0]}`, ps.map((p, i) => (i === 0 ? p * 2 : p)).join(" × ")].filter((w) => w !== right);
    const o = textOptions(right, wrong);
    return { d, skills: ["DECOMPOSITION"], type: "MCQ", stem: `Which is the **prime factorisation** of **${n}**?`, ...o, solution: `${n} = ${right}, and every factor here is prime. (Options with 4, 6, 9 or other non-primes, or a different product, are not correct.)` };
  },
};

export const parityQ: Family = {
  id: "parity", ds: [1, 2, 3],
  make(c, d) {
    const k = int(c.r, 2, 9);
    const kinds = d === 1 ? [["even", "even"]] : d === 2 ? [["odd", "even"], ["odd", "odd"]] : [["odd", "odd"]];
    const [a] = pick(c.r, kinds);
    const n = a === "even" ? k : k;
    const result = a === "even" ? "even" : n % 2 === 0 ? "even" : "odd";
    const o = textOptions(`Always ${result}`, [`Always ${result === "even" ? "odd" : "even"}`, "Sometimes odd, sometimes even", "Always zero"]);
    return { d, skills: ["GENERALISATION", "EVALUATION"], type: "MCQ", stem: `The sum of **${n} ${a} numbers** is …`, ...o, solution: a === "even" ? "Adding even numbers always gives an even number." : `Pair up the odd numbers: each pair makes an even number. ${n % 2 === 0 ? `${n} is even, so all pair up: the sum is even.` : `${n} is odd, so one odd number is left over: the sum is odd.`}` };
  },
};

export const digitSumCount: Family = {
  id: "digit-sum-count", ds: [2, 3],
  make(c, d) {
    const digits = d === 2 ? 2 : 3, s = int(c.r, 2, d === 2 ? 9 : 5);
    const lo = 10 ** (digits - 1), hi = 10 ** digits - 1;
    const list = [...Array(hi - lo + 1).keys()].map((i) => i + lo).filter((x) => String(x).split("").reduce((a, b) => a + Number(b), 0) === s);
    return { d, skills: ["DECOMPOSITION", "ALGORITHMIC"], type: "NUMERIC", stem: `How many **${digits}-digit numbers** have digits that add up to **${s}**?`, answer: list.length, solution: `Make an organised list: ${list.join(", ")} → ${list.length}.`, hint: "List them in order of the first digit." };
  },
};

export const powerCompare: Family = {
  id: "power-compare", ds: [2, 3],
  make(c, d) {
    const pairs = d === 2 ? [[2, 5, 5, 2], [3, 4, 4, 3], [2, 6, 6, 2], [10, 2, 2, 7]] : [[2, 10, 10, 3], [3, 5, 5, 3], [2, 8, 4, 4], [5, 3, 3, 5]];
    const [a, b, x, y] = pick(c.r, pairs);
    const A = a ** b, B = x ** y;
    const sup = (e: number) => ["⁰", "¹", "²", "³", "⁴", "⁵", "⁶", "⁷", "⁸", "⁹", "¹⁰"][e];
    const ans = A > B ? `${a}${sup(b)}` : A < B ? `${x}${sup(y)}` : "They are equal";
    const o = textOptions(ans, [`${a}${sup(b)}`, `${x}${sup(y)}`, "They are equal", "Can't be compared"]);
    return { d, skills: ["EVALUATION", "ABSTRACT"], type: "MCQ", stem: `Which is greater: **${a}${sup(b)}** or **${x}${sup(y)}**?`, ...o, solution: `${a}${sup(b)} = ${fmt(A)} and ${x}${sup(y)} = ${fmt(B)}. ${A === B ? "They are equal." : `${ans} is greater.`}` };
  },
};

export const exponentLaw: Family = {
  id: "exponent-law", ds: [1, 2, 3],
  make(c, d) {
    const b = pick(c.r, [2, 3, 5, 7, 10]), m = int(c.r, 2, 9), n = int(c.r, 2, 9);
    const sup = (e: number) => String(e).split("").map((ch) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[Number(ch)]).join("");
    if (d === 1) return { d, skills: ["GENERALISATION"], type: "NUMERIC", stem: `${b}${sup(m)} × ${b}${sup(n)} = ${b} to the power **?**`, answer: m + n, solution: `Same base: add the powers. ${m} + ${n} = ${m + n}.` };
    if (d === 2) { const big = Math.max(m, n) + 3; return { d, skills: ["GENERALISATION"], type: "NUMERIC", stem: `${b}${sup(big)} ÷ ${b}${sup(m)} = ${b} to the power **?**`, answer: big - m, solution: `Same base: subtract the powers. ${big} − ${m} = ${big - m}.` }; }
    const k = int(c.r, 2, 4);
    return { d, skills: ["GENERALISATION"], type: "NUMERIC", stem: `(${b}${sup(m)})${sup(k)} = ${b} to the power **?**`, answer: m * k, solution: `A power of a power: multiply. ${m} × ${k} = ${m * k}.` };
  },
};

Object.assign(ALL_CT, Object.fromEntries([foldHoles, mirrorClock, palindromeNum, primeCount, primeFactorise, parityQ, digitSumCount, powerCompare, exponentLaw].map((f) => [f.id, f])));
