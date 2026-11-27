// CBSE-level question families, part 2: numbers, digits, fractions, integers, measurement, money and time.
// Long, multi-step stems in the CBSE handbook style; every answer is computed.
import { type Family, type D, type Item, int, pick, sample, fmt, NAMES, DAYS, sol } from "./util";

const ord = (n: number) => `${n}${n % 100 >= 11 && n % 100 <= 13 ? "th" : ["th", "st", "nd", "rd"][n % 10] ?? "th"}`;
const isPrime = (n: number) => { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; };
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
const ONES = ["ZERO", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE", "TEN", "ELEVEN", "TWELVE", "THIRTEEN", "FOURTEEN", "FIFTEEN", "SIXTEEN", "SEVENTEEN", "EIGHTEEN", "NINETEEN", "TWENTY"];

// ---------- number names, codes (Classes 3–5) ----------
export const nameClues: Family = {
  id: "c-name-clues", ds: [2, 3],
  make(c, d) {
    const max = c.cls <= 3 ? 20 : 20;
    const facts = (n: number) => { const w = ONES[n]; const v = [...w].filter((x) => "AEIOU".includes(x)).length; return { len: w.length, v, cons: w.length - v, even: n % 2 === 0, first: w[0], last: w[w.length - 1] }; };
    const n = int(c.r, 1, max);
    const f = facts(n);
    const pool: [string, (m: number) => boolean][] = [
      [`My name has ${f.len} letters.`, (m: number) => facts(m).len === f.len],
      [`I am ${f.even ? "an even" : "an odd"} number.`, (m: number) => facts(m).even === f.even],
      [`My name has ${f.v} vowel${f.v === 1 ? "" : "s"}.`, (m: number) => facts(m).v === f.v],
      [`My name starts with ${f.first}.`, (m: number) => facts(m).first === f.first],
      [`My name ends with ${f.last}.`, (m: number) => facts(m).last === f.last],
      [`I am ${n > 10 ? "more" : "less"} than 10.`, (m: number) => (n > 10 ? m > 10 : m < 10)],
      [`My name has more consonants than vowels.`, (m: number) => facts(m).cons > facts(m).v],
    ].filter((x) => (x[1] as (m: number) => boolean)(n)) as [string, (m: number) => boolean][];
    let live = [...Array(max).keys()].map((i) => i + 1);
    const used: string[] = [], usedCl: [string, (m: number) => boolean][] = [];
    for (const cl of sample(c.r, pool, pool.length)) {
      const nx = live.filter(cl[1]);
      if (nx.length < live.length) { used.push(cl[0]); usedCl.push(cl); live = nx; }
      if (live.length === 1) break;
    }
    if (live.length !== 1 || used.length < (d === 3 ? 3 : 2)) return null;
    const wrong = sample(c.r, [...Array(max).keys()].map((i) => i + 1).filter((m: number) => m !== n), 3);
    return item(d, ["DECOMPOSITION", "PATTERN"], `Read the clue cards. I am a number from 1 to ${max}.\n${used.map((x, i) => `- Clue ${i + 1}: ${x}`).join("\n")}\n\nWhich number am I?`, mcq(String(n), wrong), sol(`Write the number name of each option and check it against the clues, one clue at a time:`, [n, ...wrong].sort((x, y) => x - y).map((m) => { const bad = usedCl.findIndex((cl) => !cl[1](m)); return bad < 0 ? `${m} (${ONES[m]}) — fits every clue` : `${m} (${ONES[m]}) — does not fit Clue ${bad + 1}`; }), `Only ${n} (${ONES[n]}) fits all the clues: its name has ${f.len} letters and ${f.v} vowel${f.v === 1 ? "" : "s"}.`, `So, the number is ${n}.`), "Write the number names and test each clue.");
  },
};

export const caesar2: Family = {
  id: "c-caesar", ds: [2, 3],
  make(c, d) {
    const words = ["SCHOOL", "PENCIL", "GARDEN", "TIGER", "RIVER", "MANGO", "PLANET", "CASTLE", "ROCKET", "CANDLE"];
    const w = pick(c.r, words), k = int(c.r, 2, 9);
    const enc = (s: string, sh: number) => [...s].map((ch) => String.fromCharCode(((ch.charCodeAt(0) - 65 + sh + 260) % 26) + 65)).join("");
    if (d === 2) {
      const ans = enc(w, k);
      return item(d, ["ALGORITHMIC", "PATTERN"], `In a Caesar cipher every letter moves forward by the same number of places, and after Z we go back to A. With a shift of ${k}, the word ${w} is written in code. Which of these is the coded word?`, mcq(ans, [enc(w, k + 1), enc(w, k - 1), enc(w, -k)]), sol(`Each letter moves ${k} place${k > 1 ? "s" : ""} forward in the alphabet (after Z we start again at A). Code the word letter by letter:`, [...w].map((ch, i) => `${ch} → ${ans[i]}`), `So, ${w} is written as ${ans}.`));
    }
    const w2 = pick(c.r, words.filter((x) => x !== w));
    return item(d, ["ALGORITHMIC", "PATTERN"], `Riya sends coded words using a Caesar cipher (every letter moves forward by the same number of places, and after Z comes A). She writes ${w} as ${enc(w, k)}. Using the SAME shift, how will she write ${w2}?`, mcq(enc(w2, k), [enc(w2, k + 1), enc(w2, -k), enc(w2, k - 1)]), sol(`First find the shift by comparing one letter of the word with its code: ${w[0]} became ${enc(w, k)[0]}, which is ${k} place${k > 1 ? "s" : ""} forward.`, `Now shift every letter of ${w2} by ${k}:`, [...w2].map((ch, i) => `${ch} → ${enc(w2, k)[i]}`), `So, ${w2} is written as ${enc(w2, k)}.`));
  },
};

// ---------- digits and places ----------
export const digitClues: Family = {
  id: "c-digit-clues", ds: [2, 3],
  make(c, d) {
    const digits = c.cls <= 4 ? 3 : 4;
    const lo = 10 ** (digits - 1), hi = 10 ** digits - 1;
    const n = int(c.r, lo, hi);
    const ds = String(n).split("").map(Number);
    const sum = ds.reduce((a, b) => a + b, 0);
    const places = ["ones", "tens", "hundreds", "thousands"];
    const pool: [string, (m: number) => boolean][] = [
      [`The sum of my digits is ${sum}.`, (m: number) => String(m).split("").map(Number).reduce((a, b) => a + b, 0) === sum],
      [`I am ${n % 2 ? "odd" : "even"}.`, (m: number) => m % 2 === n % 2],
      [`My ${places[digits - 1]} digit is ${ds[0]}.`, (m: number) => String(m)[0] === String(ds[0])],
      [`My tens digit is ${ds[digits - 2] > ds[digits - 1] ? "greater" : ds[digits - 2] < ds[digits - 1] ? "smaller" : "equal"} ${ds[digits - 2] === ds[digits - 1] ? "to" : "than"} my ones digit.`, (m: number) => { const a = Math.floor(m / 10) % 10, b = m % 10; return ds[digits - 2] > ds[digits - 1] ? a > b : ds[digits - 2] < ds[digits - 1] ? a < b : a === b; }],
      [`All my digits are different.`, (m: number) => new Set(String(m)).size === digits],
      [`I am between ${fmt(Math.floor(n / 100) * 100)} and ${fmt(Math.floor(n / 100) * 100 + 100)}.`, (m: number) => m > Math.floor(n / 100) * 100 && m < Math.floor(n / 100) * 100 + 100],
      [`I am a multiple of ${n % 5 === 0 ? 5 : n % 3 === 0 ? 3 : n % 4 === 0 ? 4 : 1}.`, (m: number) => m % (n % 5 === 0 ? 5 : n % 3 === 0 ? 3 : n % 4 === 0 ? 4 : 1) === 0],
      [`My ones digit is ${ds[digits - 1]}.`, (m: number) => m % 10 === ds[digits - 1]],
    ].filter((x) => !(x[0] as string).includes("multiple of 1") && (x[1] as (m: number) => boolean)(n)) as [string, (m: number) => boolean][];
    let live = [...Array(hi - lo + 1).keys()].map((i) => i + lo);
    const used: string[] = [], usedCl: [string, (m: number) => boolean][] = [];
    for (const cl of sample(c.r, pool, pool.length)) { const nx = live.filter(cl[1]); if (nx.length < live.length) { used.push(cl[0]); usedCl.push(cl); live = nx; } if (live.length === 1) break; }
    if (live.length !== 1 || used.length < 3) return null;
    const wrong = [n + 9, n - 9, n + 90, n - 90, n + 1, n + 10].filter((x) => x >= lo && x <= hi);
    const o = numMcq(c.r, n, wrong);
    if (!o) return null;
    const check = o.options.map((x) => Number(x.replace(/,/g, ""))).sort((x, y) => x - y).map((m) => { const bad = usedCl.find((cl) => !cl[1](m)); return bad ? `${fmt(m)} — does not fit: "${bad[0].replace(/\.$/, "")}"` : `${fmt(m)} — fits every clue`; });
    return item(d, ["DECOMPOSITION"], `I am a ${digits}-digit number. Use all the clues to find me.\n${used.map((x) => `- ${x}`).join("\n")}\n\nWhich number am I?`, o, sol(`Check each option against the clues, one clue at a time. As soon as a clue fails, the option is out:`, check, `Only ${fmt(n)} fits all ${used.length} clues (for example, its digits add up to ${sum}).`, `So, the number is ${fmt(n)}.`), "Use the clue that tells you a digit first.");
  },
};

export const pickSums: Family = {
  id: "c-pick-sums", ds: [2, 3],
  make(c, d) {
    const [a, b] = who(c.r, 2);
    const set = sample(c.r, [...Array(c.cls <= 5 ? 20 : 40).keys()].map((i) => i + 1), 6).sort((x, y) => x - y);
    const hi = d === 2;
    const combos: number[][] = [];
    for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++) for (let k = j + 1; k < 6; k++) combos.push([set[i], set[j], set[k]]);
    const sums = combos.map((x) => x[0] + x[1] + x[2]);
    const sorted = [...new Set(sums)].sort((x, y) => (hi ? y - x : x - y));
    const best = combos[sums.indexOf(sorted[0])], second = combos.filter((_, i) => sums[i] === sorted[1]);
    if (second.length !== 1) return null;
    const common = best.filter((x) => second[0].includes(x));
    if (common.length !== 2) return null;
    const ans = `${common[0]} and ${common[1]}`;
    const wrong = [`${best[0]} and ${best[2]}`, `${set[0]} and ${set[5]}`, `${second[0][0]} and ${second[0][2]}`, `${set[2]} and ${set[3]}`];
    return item(d, ["DECOMPOSITION", "ALGORITHMIC"], `${a} and ${b} each pick three different numbers from the set {${set.join(", ")}}.\n- ${a}'s three numbers give the ${hi ? "highest" : "lowest"} possible sum.\n- ${b}'s three numbers give the second ${hi ? "highest" : "lowest"} possible sum.\n\nWhich pair of numbers did BOTH of them pick?`, mcq(ans, wrong), sol(`${a} picks the numbers that give the ${hi ? "highest" : "lowest"} sum: ${best.join(", ")}, with sum ${sorted[0]}.`, `The next ${hi ? "highest" : "lowest"} sum is ${sorted[1]}, made by ${second[0].join(", ")}.`, `Compare the two sets and find the numbers in both.`, `So, the numbers in common are ${ans}.`));
  },
};

export const palindromeMin: Family = {
  id: "c-palindrome", ds: [3],
  make(c, d) {
    const len = c.cls <= 5 ? 4 : 5;
    const gap = int(c.r, 4, 8);
    const best = pick(c.r, ["smallest", "largest"] as const);
    let ans: number | null = null, ex = 0;
    for (let n = 10 ** (len - 1); n < 10 ** len; n++) {
      const s = String(n); if (s !== [...s].reverse().join("")) continue;
      const ds = [...s].map(Number);
      if (!ds.some((x) => x % 2 === 0) || !ds.some((x) => x % 2 === 1)) continue;
      if (Math.max(...ds) - Math.min(...ds) !== gap) continue;
      const sum = ds.reduce((a, b) => a + b, 0);
      if (ans === null || (best === "smallest" ? sum < ans : sum > ans)) { ans = sum; ex = n; }
    }
    if (ans === null) return null;
    return item(d, ["DECOMPOSITION", "ABSTRACT"], `I am a ${len}-digit number made of both even and odd digits. I read the same forwards and backwards (a palindrome), and the greatest difference between any two of my digits is ${gap}. What is the ${best} possible sum of my digits?`, numMcq(c.r, ans, [ans + 1, ans - 1, ans + 2, ans - 2, ans + gap]), sol(`A ${len}-digit palindrome reads the same both ways, so its outer digits repeat. Its digit sum is ${len === 4 ? "2 × (the first two digits)" : "2 × (the first two digits) + the middle digit"}.`, `Choose digits that follow the rules (the digits differ by ${gap} and include an even and an odd digit), keeping the sum as ${best === "smallest" ? "small" : "large"} as possible.`, `For example, ${ex} fits the rules and has digit sum ${ans}; no palindrome that fits has a ${best === "smallest" ? "smaller" : "larger"} digit sum.`, `So, the ${best} digit sum is ${ans}.`));
  },
};

export const zerosEnd: Family = {
  id: "c-zeros-end", ds: [2, 3],
  make(c, d) {
    const n = int(c.r, 12, d === 2 ? 25 : 60);
    let fives = 0; for (let k = 5; k <= n; k *= 5) fives += Math.floor(n / k);
    const what = d === 2 ? `the numbers 1, 2, 3, …, ${n}` : `all the whole numbers from 1 to ${n}`;
    return item(d, ["DECOMPOSITION", "PATTERN"], `${what[0].toUpperCase()}${what.slice(1)} are multiplied together. How many zeros are there at the end of the product? (Each zero at the end needs one factor 2 and one factor 5.)`, numMcq(c.r, fives, [Math.floor(n / 10), fives + 1, fives - 1, Math.floor(n / 5)]), sol(`Each zero at the end of a number comes from a factor 10 = 2 × 5. There are many more factors 2 than 5, so count the factors 5.`, [`Multiples of 5 up to ${n}: ${Math.floor(n / 5)}`, ...(n >= 25 ? [`Multiples of 25 give one extra 5 each: ${Math.floor(n / 25)}`] : [])], `Total factors 5 = ${fives}, so there are ${fives} zeros at the end.`, `So, the answer is ${fives}.`));
  },
};

export const meterSteps: Family = {
  id: "c-meter-steps", ds: [2, 3],
  make(c, d) {
    const step = pick(c.r, [125, 250, 375, 30000, 45000, 2500]);
    const target = step >= 2500 ? pick(c.r, [10000000, 1000000, 100000]) : pick(c.r, [100000, 10000]);
    const k = int(c.r, 3, 9);
    const start = target - k * step + pick(c.r, [0, Math.floor(step / 2)]);
    const above = d === 3;
    const need = target - start;
    const stepsExact = Math.ceil(need / step) + (above && need % step === 0 ? 1 : 0);
    const reading = start + stepsExact * step;
    return item(d, ["ALGORITHMIC", "DECOMPOSITION"], `A meter shows ${fmt(start)} and its reading goes up by ${fmt(step)} every minute. What is the first reading that is ${above ? "MORE than" : "at least"} ${fmt(target)}?`, numMcq(c.r, reading, [reading - step, reading + step, target, target + step]), sol(`Find how much more is needed: ${fmt(target)} − ${fmt(start)} = ${fmt(need)}.`, `Each step adds ${fmt(step)}: ${fmt(need)} ÷ ${fmt(step)} = ${(need / step).toFixed(2).replace(/\.00$/, "")}.`, above && need % step === 0 ? `That reaches ${fmt(target)} exactly, so one more step is needed to go past it.` : false, `After ${stepsExact} steps the reading is ${fmt(reading)}.`, `So, the answer is ${stepsExact} steps.`));
  },
};

// ---------- consecutive numbers, primes, calendars ----------
export const consecutivePrimes: Family = {
  id: "c-consecutive", ds: [3],
  make(c, d) {
    const len = int(c.r, 5, 8);
    const pc = int(c.r, 2, 4), ec = Math.floor(len / 2) + (c.r() < 0.5 ? 0 : 1);
    const fits: number[] = [];
    for (let s = 1; s <= 200; s++) {
      const a = [...Array(len).keys()].map((i) => s + i);
      if (a.filter(isPrime).length === pc && a.filter((x) => x % 2 === 0).length === ec) fits.push(s);
    }
    if (!fits.length || fits.length > 1) return null;
    const s = fits[0];
    const a = [...Array(len).keys()].map((i) => s + i);
    const sum = a.reduce((x, y) => x + y, 0);
    const [p] = who(c.r, 1);
    return item(d, ["DECOMPOSITION", "ABSTRACT"], `${p} thinks of ${len} consecutive natural numbers. Exactly ${pc} of these numbers are prime and exactly ${ec} of them are even. What is the sum of ${p}'s numbers?`, numMcq(c.r, sum, [sum + len, sum - len, sum + 1, sum + 2 * len]), sol(`In ${len} consecutive numbers, the even numbers alternate with the odd ones. Exactly ${ec} even numbers means the first number is ${s % 2 ? "odd" : "even"}.`, `Check the possible starting points and count the primes in each run. Only one run has exactly ${pc} primes:`, [a.join(", "), `primes: ${a.filter(isPrime).join(", ")}`], `Sum = ${a.join(" + ")} = ${sum}.`, `So, the sum is ${sum}.`));
  },
};

export const primeDates: Family = {
  id: "c-prime-dates", ds: [3],
  make(c, d) {
    const days = pick(c.r, [30, 31]);
    const first = int(c.r, 0, 6);
    const primes = [...Array(days).keys()].map((i) => i + 1).filter(isPrime);
    const [x, y, z] = who(c.r, 3);
    const sd = pick(c.r, primes);
    const gap = int(c.r, 2, 14);
    const jd = sd + gap; if (!isPrime(jd) || jd > days) return null;
    const diff = int(c.r, 4, 20);
    const ad = [jd - diff, jd + diff].filter((v) => v >= 1 && v <= days && isPrime(v));
    if (ad.length !== 1) return null;
    const wd = (dt: number) => DAYS[(first + dt - 1) % 7];
    const ans = wd(ad[0]);
    return item(d, ["DECOMPOSITION", "ALGORITHMIC"], `${x}, ${y} and ${z} were born on prime-numbered dates of the same month. The month has ${days} days and starts on a ${DAYS[first]}. ${z} was born on a ${wd(sd)}.\n- ${y} was born ${gap} days after ${z}.\n- The difference between the dates of ${x}'s and ${y}'s birthdays is ${diff}.\n\nOn which day of the week was ${x} born?`, mcq(ans, sample(c.r, DAYS.filter((v) => v !== ans), 3)), sol(`List the prime dates of the month: ${primes.join(", ")}.`, `The 1st is a ${DAYS[first]}, and a date d falls (d − 1) days after it, so we can find the day of every date.`, [`${z}: the prime date on a ${wd(sd)} that also leaves a prime date ${gap} days later is the ${ord(sd)}.`, `So ${y} was born on the ${ord(jd)}.`, `${x}'s date is ${jd} ± ${diff}; only the ${ord(ad[0])} is a prime date in the month.`], `The ${ord(ad[0])} is a ${ans}.`, `So, the answer is ${ans}.`));
  },
};

export const daysLater: Family = {
  id: "c-days-later", ds: [2, 3],
  make(c, d) {
    const today = int(c.r, 0, 6);
    const n = int(c.r, 20, d === 2 ? 120 : 400);
    const back = d === 3 && c.r() < 0.5;
    const extra = d === 3 ? pick(c.r, [["the day after tomorrow", 2], ["the day before yesterday", -2], ["tomorrow", 1]] as [string, number][]) : null;
    const total = (back ? -n : n) + (extra ? extra[1] : 0);
    const ans = DAYS[(((today + total) % 7) + 7) % 7];
    return item(d, ["ALGORITHMIC", "PATTERN"], `Today is ${DAYS[today]}. ${extra ? `What day of the week will it be on ${extra[0]} of the day that is ${n} days ${back ? "before" : "after"} today?` : `What day of the week will it be ${n} days from today?`}`, mcq(ans, sample(c.r, DAYS.filter((v) => v !== ans), 3)), sol(`The days of the week repeat every 7 days, so only the remainder after dividing by 7 matters.`, [`${n} = ${Math.floor(n / 7)} × 7 + ${n % 7}`, `Move ${n % 7} day${n % 7 === 1 ? "" : "s"} ${back ? "back" : "forward"} from ${DAYS[today]}${extra ? `, then ${extra[1] > 0 ? extra[1] + " forward" : -extra[1] + " back"}` : ""}`], `So, the day is ${ans}.`));
  },
};

// ---------- integers ----------
export const liftMoves: Family = {
  id: "c-lift-moves", ds: [2, 3],
  make(c, d) {
    const start = int(c.r, 1, 6);
    const moves = [...Array(d === 2 ? 5 : 7)].map(() => (c.r() < 0.55 ? -1 : 1) * int(c.r, 2, 8));
    const floors = [start]; moves.forEach((m: number) => floors.push(floors[floors.length - 1] + m));
    const ask = pick(c.r, ["lowest", "final", "highest"] as const);
    const ans = ask === "lowest" ? Math.min(...floors) : ask === "highest" ? Math.max(...floors) : floors[floors.length - 1];
    const f = (v: number) => (v < 0 ? `−${-v}` : String(v));
    return item(d, ["ALGORITHMIC"], `A lift in a mall starts at floor ${start} (the ground floor is 0 and floors below it are basements −1, −2, …). It makes these moves one after another: ${moves.map((m: number) => `${m > 0 ? "up" : "down"} ${Math.abs(m)}`).join(", ")}. ${ask === "final" ? "On which floor does the lift stop at the end?" : `What is the ${ask} floor the lift reaches?`}`, mcq(f(ans), [f(ans + 1), f(ans - 1), f(ans === 0 ? 3 : -ans), f(ans + 2)]), sol(`Follow the lift's moves one at a time and write down the floor after each move:`, floors.slice(1).map((fl, i) => `After move ${i + 1}: ${f(fl)}`), `So, the ${ask === "final" ? "last" : ask} floor is ${f(ans)}.`));
  },
};

export const tokenBox: Family = {
  id: "c-token-box", ds: [2, 3],
  make(c, d) {
    const p = int(c.r, 3, 12), m = int(c.r, 4, 15);
    const ns = int(c.r, 3, 8), nt = int(c.r, 2, 7);
    const now = ns * p - nt * m;
    const target = now + pick(c.r, [2 * p, 3 * p, -2 * m, -3 * m, p - m]);
    const options: [string, number][] = [[`2 squares`, 2 * p], [`3 squares`, 3 * p], [`2 triangles`, -2 * m], [`3 triangles`, -3 * m], [`1 square and 1 triangle`, p - m]];
    const good = options.filter((o) => now + o[1] === target);
    if (good.length !== 1) return null;
    const wrong = options.filter((o) => o !== good[0]).map((o) => o[0]);
    const f = (v: number) => (v < 0 ? `−${-v}` : String(v));
    return item(d, ["ALGORITHMIC", "DECOMPOSITION"], `In a box, each square stands for +${p} and each triangle stands for −${m}. The box has ${ns} squares and ${nt} triangles. Which of these must be put into the box so that the total of all the shapes becomes exactly ${f(target)}?`, mcq(good[0][0], sample(c.r, wrong, 3)), sol(`Work out the total so far: ${ns} × ${p} + ${nt} × (−${m}) = ${f(now)}.`, `The target is ${f(target)}, so we need ${f(target)} − (${f(now)}) = ${f(target - now)} more.`, `Check each choice:`, options.map((o) => `${o[0]} → ${f(o[1])}`), `Only ${good[0][0]} gives ${f(target - now)}.`, `So, the answer is ${good[0][0]}.`));
  },
};

export const numberMachine: Family = {
  id: "c-number-machine", ds: [2, 3],
  make(c, d) {
    const T = pick(c.r, [50, 100, 200, 300]), a = pick(c.r, [10, 25, 50]), b = pick(c.r, [2, 3]);
    const flip = d === 3;
    const run = (x: number) => { const y = x > T ? x - a : x * b; return flip ? -y : y; };
    const inputs = sample(c.r, [...Array(T * 2).keys()].map((i) => i - Math.floor(T / 2)).filter((v) => v !== 0), 4);
    const outs = inputs.map(run);
    if (new Set(outs).size !== 4) return null;
    const f = (v: number) => (v < 0 ? `−${-v}` : String(v));
    return item(d, ["ALGORITHMIC"], `A number machine works with these rules:\n- If the input is greater than ${T}, subtract ${a}.\n- Otherwise, multiply the input by ${b}.\n${flip ? "- After this, the sign of the number is reversed (positive becomes negative and negative becomes positive).\n" : ""}\nWhich input gives the output ${f(outs[0])}?`, mcq(f(inputs[0]), inputs.slice(1).map(f)), sol(`Apply the machine's rules to each choice:`, inputs.map((x, i) => `${f(x)} → ${f(outs[i])}`), `Only ${f(inputs[0])} gives ${f(outs[0])}.`, `So, the answer is ${f(inputs[0])}.`));
  },
};

// ---------- fractions ----------
export const fractionShare: Family = {
  id: "c-fraction-share", ds: [2, 3],
  make(c, d) {
    const [p, q, s] = who(c.r, 3);
    const k = pick(c.r, [3, 4, 5]), a = pick(c.r, [1, 2]), b = pick(c.r, [3, 5]);
    if (a >= b) return null;
    // keeps 1/k, gives a/b of the rest to q, the remaining R go to s
    const unit = k * b; // total must be a multiple of k*b
    const total = unit * int(c.r, 2, c.cls <= 5 ? 6 : 10);
    const rest = total - total / k, toQ = (rest * a) / b, R = rest - toQ;
    if (!Number.isInteger(toQ)) return null;
    const things = pick(c.r, ["sweets", "marbles", "stickers", "pencils"]);
    return item(d, ["DECOMPOSITION", "ALGORITHMIC"], `${p} received some ${things} for a festival and shared them with the family.\n- ${p} keeps 1/${k} of the ${things}.\n- ${p} gives ${a}/${b} of what is left to ${q}.\n- The remaining ${R} ${things} go to ${s}.\n\nHow many ${things} did ${p} receive in all?`, numMcq(c.r, total, [total + unit, total - unit, R * k, rest]), sol(`Work backwards with fractions of the whole.`, [`After keeping 1/${k}, ${k - 1}/${k} of the ${things} are left.`, `${q} gets ${a}/${b} of that, so ${b - a}/${b} of ${k - 1}/${k} = ${(b - a) * (k - 1)}/${b * k} of all the ${things} remain.`, `This is ${R}, so 1/${b * k} of the total is ${R} ÷ ${(b - a) * (k - 1)} = ${R / ((b - a) * (k - 1))}.`, `Total = ${b * k} × ${R / ((b - a) * (k - 1))} = ${total}.`], `So, there were ${total} ${things} in all.`), "Work out what fraction of the whole is left at the end.");
  },
};

export const examWrong: Family = {
  id: "c-exam-wrong", ds: [3],
  make(c, d) {
    const [p, q] = who(c.r, 2);
    for (let tries = 0; tries < 30; tries++) {
      const k = pick(c.r, [3, 4, 5]), m = int(c.r, 3, 9);
      const [rn, rd] = pick(c.r, [[3, 4], [4, 5], [5, 6], [2, 3]] as [number, number][]);
      // N/k + m = 2N (1 − rn/rd)  ->  N (2(rd−rn)/rd − 1/k) = m
      const coef = (2 * (rd - rn)) / rd - 1 / k;
      if (coef <= 0) continue;
      const N = m / coef;
      if (!Number.isInteger(N) || N < 10 || N > 80 || N % k) continue;
      const right = N - N / k;
      return item(d, ["DECOMPOSITION", "ALGORITHMIC"], `${p} and ${q} take the same test and each attempts all the questions.\n- ${p} says: "1/${k} of my answers were wrong."\n- ${q} says: "${m} of my answers were wrong."\nTogether they got ${rn}/${rd} of all their answers right. How many questions did ${p} get right?`, numMcq(c.r, right, [N, N / k, right + m, right - m]), sol(`Let each test have N questions.`, [`Wrong answers of both together: N/${k} + ${m}.`, `There are 2N answers in all, and ${rd - rn}/${rd} of them are wrong: 2N × ${rd - rn}/${rd} = ${2 * (rd - rn)}N/${rd}.`, `So N/${k} + ${m} = ${2 * (rd - rn)}N/${rd}, which gives N = ${N}.`, `${p} got ${N} − ${N / k} = ${right} right.`], `So, the answer is ${right}.`));
    }
    return null;
  },
};

export const tankFraction: Family = {
  id: "c-tank", ds: [2, 3],
  make(c, d) {
    const den = pick(c.r, [4, 5, 6, 8]);
    const a = int(c.r, 1, den - 2), b = int(c.r, a + 1, den - 1);
    const cap = den * int(c.r, 5, 30);
    const added = ((b - a) * cap) / den;
    return item(d, ["DECOMPOSITION"], `A water tank is ${a}/${den} full. After ${added} litres more are poured in, it is ${b}/${den} full. A tap then lets out water at 5 litres a minute. How many litres can the tank hold when it is full?`, numMcq(c.r, cap, [cap + den, added * den, added * b, cap - den]), sol(`The ${added} litres raised the water from ${a}/${den} to ${b}/${den} of the tank.`, [`Fraction filled = ${b}/${den} − ${a}/${den} = ${b - a}/${den}`, `1/${den} of the tank = ${added} ÷ ${b - a} = ${added / (b - a)} litres`, `Full tank = ${den} × ${added / (b - a)} = ${cap} litres`], `(The information about the tap is not needed.)`, `So, the tank holds ${cap} litres.`));
  },
};

// ---------- measurement, money, time ----------
export const foldPerimeter: Family = {
  id: "c-fold-perimeter", ds: [2, 3],
  make(c, d) {
    let [L, W] = [pick(c.r, [32, 48, 64, 24, 40]), pick(c.r, [8, 12, 16, 20])];
    if (W > L) [L, W] = [W, L];
    const per: number[] = [2 * (L + W)];
    let a = L, b = W;
    for (let i = 0; i < 6; i++) { if (a >= b) a /= 2; else b /= 2; per.push(2 * (a + b)); }
    const k = int(c.r, 1, 4);
    if (!Number.isInteger(per[k]) || per.slice(0, k).includes(per[k])) return null;
    return item(d, ["ABSTRACT", "ALGORITHMIC"], `A paper sheet measures ${L} cm × ${W} cm. Each time it is folded in half, the LONGER side is halved (if the sheet is a square, any side may be halved). How many times must the sheet be folded so that the perimeter of the folded sheet becomes ${per[k]} cm?`, numMcq(c.r, k, [k + 1, k - 1, k + 2, 0]), sol(`Find the perimeter after each fold:`, per.slice(0, k + 2).map((x, i) => `After ${i} fold${i === 1 ? "" : "s"}: ${x} cm`), `The perimeter first becomes ${per[k]} cm after ${k} fold${k === 1 ? "" : "s"}.`, `So, the answer is ${k}.`));
  },
};

export const matchGrid: Family = {
  id: "c-match-grid", ds: [2, 3],
  make(c, d) {
    const r = int(c.r, 2, d === 2 ? 4 : 6), k = int(c.r, r, r + 3);
    if (c.r() < 0.5) {
      const sticks = (r + 1) * k + (k + 1) * r;
      return item(d, ["PATTERN", "ALGORITHMIC"], `A grid of squares with ${r} rows and ${k} columns is made of matchsticks, where each side of a small square is one matchstick. How many matchsticks are needed to make the whole grid?`, numMcq(c.r, sticks, [4 * r * k, sticks - r, sticks + k, (r + 1) * (k + 1)]), sol(`Count the sticks in two parts: the horizontal lines and the vertical lines.`, [`Horizontal: ${r + 1} lines of ${k} sticks = ${(r + 1) * k}`, `Vertical: ${k + 1} lines of ${r} sticks = ${(k + 1) * r}`], `Total = ${(r + 1) * k} + ${(k + 1) * r} = ${sticks}.`, `So, ${sticks} sticks are needed.`));
    }
    let sq = 0; for (let s = 1; s <= r; s++) sq += (r - s + 1) * (k - s + 1);
    return item(d, ["ABSTRACT", "PATTERN"], `A rectangle is divided into a grid of equal small squares, ${r} rows by ${k} columns. How many squares of ALL sizes can be found in the grid?`, numMcq(c.r, sq, [r * k, sq - 1, sq + r, r * k + (r - 1) * (k - 1)]), sol(`Count the squares of each size separately:`, [...Array(r).keys()].map((s2) => `Side ${s2 + 1}: ${(r - s2)} × ${(k - s2)} = ${(r - s2) * (k - s2)}`), `Total = ${[...Array(r).keys()].map((s2) => (r - s2) * (k - s2)).join(" + ")} = ${sq}.`, `So, there are ${sq} squares.`));
  },
};

export const moneyPlan: Family = {
  id: "c-money-plan", ds: [2, 3],
  make(c, d) {
    const [p] = who(c.r, 1);
    const items = sample(c.r, [["notebook", 35], ["pen", 15], ["box of crayons", 60], ["water bottle", 85], ["eraser", 5], ["ruler", 12], ["storybook", 120]] as [string, number][], 3);
    const qty = items.map(() => int(c.r, 1, d === 2 ? 3 : 4));
    const cost = items.reduce((s, it, i) => s + it[1] * qty[i], 0);
    const note = [100, 200, 500, 2000].find((n) => n > cost);
    if (!note) return null;
    const discount = d === 3 ? pick(c.r, [10, 20]) : 0;
    const pay = cost - discount;
    const change = note - pay;
    return item(d, ["DECOMPOSITION", "ALGORITHMIC"], `${p} buys ${items.map((it, i) => `${qty[i]} ${qty[i] > 1 ? (it[0].startsWith("box") ? it[0].replace("box", "boxes") : `${it[0]}s`) : it[0]} at ₹${it[1]} each`).join(", ")}.${discount ? ` The shopkeeper gives ₹${discount} off the total bill.` : ""} ${p} pays with a ₹${note} note. How much change should ${p} get back?`, numMcq(c.r, change, [note - cost, change + 10, change - 5, cost], (n) => `₹${n}`), sol(`Break the bill into parts:`, items.map((it, i) => `${qty[i]} × ₹${it[1]} = ₹${qty[i] * it[1]}`), `Total = ₹${cost}${discount ? `; after the discount of ₹${discount}, the bill is ₹${pay}` : ""}.`, `Change = ₹${note} − ₹${pay} = ₹${change}.`, `So, the change is ₹${change}.`), "Find the full bill first.");
  },
};

export const timePlan: Family = {
  id: "c-time-plan", ds: [2, 3],
  make(c, d) {
    const [p] = who(c.r, 1);
    const start = int(c.r, 7, 15) * 60 + pick(c.r, [0, 10, 15, 20, 30, 40, 45]);
    const acts = sample(c.r, [["reads a story book", [20, 25, 35, 40]], ["practises the keyboard", [15, 30, 45]], ["plays football", [40, 45, 50, 75]], ["does homework", [35, 50, 55, 70]], ["helps in the kitchen", [15, 20, 25]], ["paints a picture", [25, 35, 40]]] as [string, number[]][], d === 2 ? 3 : 4);
    const dur = acts.map((a) => pick(c.r, a[1]));
    const gap = d === 3 ? pick(c.r, [5, 10]) : 0;
    const end = start + dur.reduce((s, x) => s + x, 0) + gap * (acts.length - 1);
    const t = (m: number) => { const h = Math.floor(m / 60), mm = m % 60; return `${h > 12 ? h - 12 : h}:${String(mm).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`; };
    return item(d, ["ALGORITHMIC", "DECOMPOSITION"], `${p} starts at ${t(start)} and does these one after another: ${acts.map((a, i) => `${a[0]} for ${dur[i]} minutes`).join(", ")}.${gap ? ` ${p} takes a ${gap}-minute break between activities.` : ""} At what time does ${p} finish the last activity?`, mcq(t(end), [t(end + 10), t(end - 15), t(end + 60), t(end - gap * (acts.length - 1) || end + 5)]), sol(`Add the time for each part of the plan:`, [`Activities: ${dur.join(" + ")} minutes`, ...(gap ? [`Gaps: ${acts.length - 1} × ${gap} minutes`] : [])], `Total time = ${end - start} minutes = ${Math.floor((end - start) / 60)} h ${(end - start) % 60} min.`, `${t(start)} + ${Math.floor((end - start) / 60)} h ${(end - start) % 60} min = ${t(end)}.`, `So, the answer is ${t(end)}.`));
  },
};

export const ribbonCut: Family = {
  id: "c-ribbon", ds: [2, 3],
  make(c, d) {
    const total = pick(c.r, [3, 4, 5, 6, 8]) * 100 + pick(c.r, [0, 20, 50]);
    const [p, q] = who(c.r, 2);
    const a = pick(c.r, [45, 60, 75, 85, 120]), na = int(c.r, 2, 4), b = pick(c.r, [30, 35, 40, 55]), nb = int(c.r, 1, 3);
    const used = a * na + b * nb;
    if (used >= total) return null;
    const left = total - used;
    const m = (cm: number) => (cm >= 100 ? `${Math.floor(cm / 100)} m ${cm % 100} cm` : `${cm} cm`).replace(" 0 cm", "");
    return item(d, ["DECOMPOSITION", "ALGORITHMIC"], `A ribbon is ${m(total)} long. ${p} cuts ${na} pieces of ${a} cm each for gift boxes, and ${q} then cuts ${nb} piece${nb > 1 ? "s" : ""} of ${b} cm for a card. How much ribbon is left? (1 m = 100 cm)`, mcq(m(left), [m(left + 10), m(Math.max(5, left - 10)), m(total - a * na), m(left + 100)]), sol(`Work in centimetres. Total length = ${total} cm.`, [`Used: ${na} × ${a} + ${nb} × ${b} = ${a * na} + ${b * nb} = ${used} cm`, `Left = ${total} − ${used} = ${left} cm`], `So, ${m(left)} is left.`));
  },
};

export const remainderGroups: Family = {
  id: "c-groups-left", ds: [2, 3],
  make(c, d) {
    const [p] = who(c.r, 1);
    const ms = d === 2 ? sample(c.r, [2, 3, 4, 5], 2) : sample(c.r, [3, 4, 5, 6, 7], 3);
    const rem = pick(c.r, [1, 2]);
    if (ms.some((m: number) => m <= rem)) return null;
    const lo = int(c.r, 10, 40), hi = lo + (d === 2 ? 30 : 60);
    const fits = [...Array(hi - lo + 1).keys()].map((i) => i + lo).filter((n) => ms.every((m: number) => n % m === rem));
    if (fits.length !== 1) return null;
    const n = fits[0];
    const thing = pick(c.r, ["children", "books", "marbles", "flowers"]);
    return item(d, ["DECOMPOSITION", "PATTERN"], `${p} has between ${lo} and ${hi} ${thing}. When they are put in groups of ${ms.slice(0, -1).join(", ")} or ${ms[ms.length - 1]}, there are always ${rem} ${thing} left over. How many ${thing} does ${p} have?`, numMcq(c.r, n, [n + 1, n - 1, n + ms[0], n - ms[1]].filter((v) => v >= lo && v <= hi)), sol(`The number leaves remainder ${rem} when divided by each of ${ms.join(", ")}, so it is ${rem} more than a common multiple of these numbers.`, `The common multiples are the multiples of their LCM, ${ms.reduce((x, y) => (x * y) / gcd(x, y))}. Check the numbers between ${lo} and ${hi}:`, ms.map((mm: number) => `${n} = ${Math.floor(n / mm)} × ${mm} + ${rem}`), `So, the number is ${n}.`));
  },
};

export const CBSE_B: Family[] = [nameClues, caesar2, digitClues, pickSums, palindromeMin, zerosEnd, meterSteps, consecutivePrimes, primeDates, daysLater, liftMoves, tokenBox, numberMachine, fractionShare, examWrong, tankFraction, foldPerimeter, matchGrid, moneyPlan, timePlan, ribbonCut, remainderGroups];
