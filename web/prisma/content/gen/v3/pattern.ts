// Pattern Recognition engines.
import type { Colour, Fig } from "../../../../src/lib/figures";
import { COLOUR_NAMES } from "../../../../src/lib/figures";
import { type Engine, type Problem, int, pick, sample, fmt, NAMES, MONTHS, DAYS, near, ord, hm, timeAccept, withUnit } from "./core";

const COLS: Colour[] = ["red", "blue", "green", "yellow", "purple", "orange", "pink"];
const niceStep = (max: number) => [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000].find((s) => max / s <= 8) ?? 1000;

export const growDots: Engine = {
  id: "v3-grow-dots", skill: "PATTERN", tags: ["any"], part: "CT", pic: "always",
  make(c, d) {
    const a = int(c.r, 1, 4), b = int(c.r, 1, 4);
    if (a + 2 * b > 12 || a + 2 * b < 4) return null;
    const who = pick(c.r, NAMES);
    const shape = pick(c.r, ["circle", "square", "triangle"] as const), colour = pick(c.r, COLS);
    const figure: Fig = { kind: "sequence", frames: [a, a + b, a + 2 * b].map((n) => ({ kind: "dots", count: n, colour, shape, alt: `${n} counter${n === 1 ? "" : "s"}` }) as Fig), alt: `Steps 1, 2 and 3 of a growing pattern: ${a}, ${a + b} and ${a + 2 * b} dots` };
    const ctx = c.cls <= 4 ? `${who} makes a growing pattern with counters ${c.theme.place}. Each step adds the same number as before.` : `${who} arranges counters in a growing pattern ${c.theme.place}. The picture shows Step 1, Step 2 and Step 3. Each new step adds the same number of counters as before.`;
    const term = (k: number) => a + (k - 1) * b;
    let p: Partial<Problem>;
    if (d === 1) {
      const k = int(c.r, 4, 6);
      p = { ask: `How many counters will Step ${k} have?`, say: `Step ${k} will have ____ counters.`, answer: term(k), wrong: near(c.r, term(k), [term(k - 1), term(k + 1), k * b, term(k) + 1]), solution: `The pattern starts at ${a} and adds ${b} each step: ${[1, 2, 3, 4, 5, 6].slice(0, k).map(term).join(", ")}. So Step ${k} has ${term(k)}.` };
    } else if (d === 2) {
      const k = int(c.r, 9, c.cls <= 4 ? 12 : 20);
      p = { ask: `How many counters will Step ${k} have?`, say: `Step ${k} will have ____ counters.`, answer: term(k), wrong: near(c.r, term(k), [k * b, a + k * b, term(k - 1), a * k]), solution: `Each step adds ${b}. From Step 1 to Step ${k} there are ${k - 1} jumps of ${b}: ${a} + ${k - 1} × ${b} = ${term(k)}.`, hint: `Count the jumps from Step 1 to Step ${k}.` };
    } else {
      const k = int(c.r, 12, c.cls <= 4 ? 20 : 40), n = term(k);
      p = { skills: ["PATTERN", "GENERALISATION"], ask: `Which step will have exactly ${n} counters?`, say: `Step ____ will have exactly ${n} counters.`, answer: k, wrong: near(c.r, k, [k - 1, k + 1, Math.round(n / b), k + 2]), solution: `Step k has ${a} + (k − 1) × ${b}. So (k − 1) × ${b} = ${n} − ${a} = ${n - a}, k − 1 = ${k - 1} and k = ${k}.`, hint: "Write a rule for Step k first." };
    }
    return { skills: ["PATTERN"], d, ctx, figure, ...p } as Problem;
  },
};

export const growSticks: Engine = {
  id: "v3-grow-sticks", skill: "PATTERN", tags: ["shape", "pattern", "count", "algebra", "number"], part: "CT", pic: "always",
  make(c, d) {
    const who = pick(c.r, NAMES);
    const figure: Fig = { kind: "sequence", frames: [1, 2, 3].map((n) => ({ kind: "matchsticks", squares: n, alt: `${n} square${n > 1 ? "s" : ""}` }) as Fig), alt: "A row of 1, 2 and 3 squares made with matchsticks: 4, 7 and 10 sticks" };
    const ctx = c.cls <= 4 ? `${who} makes squares in a row with matchsticks ${c.theme.place}: 1 square needs 4 sticks, 2 squares need 7 and 3 squares need 10.` : `${who} makes a row of squares with matchsticks ${c.theme.place}. One square needs 4 sticks, two squares in a row need 7 sticks and three squares need 10 sticks, as in the picture. The squares share their sides.`;
    const s = (k: number) => 3 * k + 1;
    if (d === 1) { const k = pick(c.r, [4, 5, 6]); return { skills: ["PATTERN"], d, ctx, figure, ask: `How many matchsticks are needed for ${k} squares in a row?`, say: `${k} squares in a row need ____ matchsticks.`, answer: s(k), wrong: near(c.r, s(k), [4 * k, s(k) - 1, s(k) + 3, 3 * k]), solution: `Each new square adds 3 sticks: 4, 7, 10, 13, 16, 19. So ${k} squares need ${s(k)}.` }; }
    if (d === 2) { const k = int(c.r, 10, 30); return { skills: ["PATTERN"], d, ctx, figure, ask: `How many matchsticks are needed for ${k} squares in a row?`, say: `${k} squares in a row need ____ matchsticks.`, answer: s(k), wrong: near(c.r, s(k), [4 * k, 3 * k, s(k) + 3, 3 * k + 4]), solution: `The first square needs 4 sticks and every other square adds 3: 4 + ${k - 1} × 3 = ${s(k)} (rule: 3 × squares + 1).`, hint: "Each new square shares one side with the square before it." }; }
    const k = int(c.r, 15, 60), n = s(k);
    return { skills: ["PATTERN", "GENERALISATION"], d, ctx, figure, ask: `${who} has exactly ${n} matchsticks and uses all of them. How many squares are in the row?`, say: `With ${n} matchsticks, ${who} makes a row of ____ squares.`, answer: k, wrong: near(c.r, k, [Math.floor(n / 4), k + 1, k - 1, Math.round(n / 3)]), solution: `Sticks = 3 × squares + 1. So 3 × squares = ${n} − 1 = ${n - 1}, and squares = ${n - 1} ÷ 3 = ${k}.` };
  },
};

export const beadPattern: Engine = {
  id: "v3-beads", skill: "PATTERN", tags: ["any"], part: "CT", pic: "always",
  make(c, d) {
    const L = d === 1 ? int(c.r, 2, 3) : d === 2 ? int(c.r, 3, 4) : int(c.r, 4, 5);
    const pool = sample(c.r, COLS, 3);
    const unit = Array.from({ length: L }, (_, i) => (i < pool.length ? pool[i] : pick(c.r, pool)));
    if (new Set(unit).size < 2) return null;
    const shown = Array.from({ length: Math.min(14, L * 3) }, (_, i) => unit[i % L]);
    const who = pick(c.r, NAMES);
    const figure: Fig = { kind: "beads", colours: shown, alt: `A string of beads: ${shown.map((x) => COLOUR_NAMES[x]).join(", ")}` };
    const ctx = c.cls <= 4 ? `${who} makes a bead string ${c.theme.place}. The picture shows the first ${shown.length} beads; the pattern keeps repeating.` : `${who} is making a bead string ${c.theme.place}. The beads follow a repeating pattern, and the picture shows the first ${shown.length} beads. ${who} keeps going with the same pattern.`;
    const at = (k: number) => COLOUR_NAMES[unit[(k - 1) % L]];
    if (d < 3) {
      const k = d === 1 ? int(c.r, shown.length + 2, 24) : int(c.r, 30, 99);
      const ans = at(k);
      const others = [...new Set([at(k + 1), at(k - 1), ...COLS.map((x) => COLOUR_NAMES[x])])].filter((x) => x !== ans);
      return { skills: ["PATTERN"], d, ctx, figure, ask: `What colour is the ${ord(k)} bead?`, say: `The ${ord(k)} bead is ____.`, answer: ans, wrong: others.slice(0, 3), solution: `The pattern repeats every ${L} beads (${unit.map((x) => COLOUR_NAMES[x]).join(", ")}). ${k} = ${Math.floor((k - 1) / L)} × ${L} + ${((k - 1) % L) + 1}, so the ${ord(k)} bead is bead number ${((k - 1) % L) + 1} of the pattern: ${ans}.`, hint: `Find how many beads make one repeat.` };
    }
    const col = pick(c.r, [...new Set(unit)]), per = unit.filter((x) => x === col).length;
    const N = int(c.r, 40, 100), full = Math.floor(N / L), rest = N % L;
    const ans = full * per + unit.slice(0, rest).filter((x) => x === col).length;
    return { skills: ["PATTERN", "DECOMPOSITION"], d, ctx, figure, ask: `How many ${COLOUR_NAMES[col]} beads are there among the first ${N} beads?`, say: `There are ____ ${COLOUR_NAMES[col]} beads among the first ${N} beads.`, answer: ans, wrong: near(c.r, ans, [ans + 1, ans - 1, Math.round(N / L), full * per]), solution: `One repeat has ${L} beads with ${per} ${COLOUR_NAMES[col]}. ${N} = ${full} × ${L} + ${rest}: ${full} full repeats give ${full * per}${rest ? `, and the first ${rest} bead${rest > 1 ? "s" : ""} of the next repeat add ${ans - full * per}` : ""}. Total ${ans}.` };
  },
};

export const numberSeq: Engine = {
  id: "v3-number-seq", skill: "PATTERN", tags: ["any"], part: "CT", pic: "maybe",
  make(c, d, pic) {
    const t = pick(c.r, c.theme.items), who = pick(c.r, NAMES);
    const scale = c.cls <= 3 ? 1 : c.cls <= 5 ? 5 : 10;
    const a = int(c.r, 2, 12) * scale, b = int(c.r, 2, 9) * (c.cls <= 3 ? 1 : scale / (c.cls <= 5 ? 5 : 2));
    let terms: number[], rule: string, k: number, ans: number, sol: string, skills = ["PATTERN"];
    if (d === 1) { terms = [0, 1, 2, 3].map((i) => a + i * b); k = 6; ans = a + 5 * b; rule = `adds ${b} each day`; sol = `The number goes up by ${b} every day: ${[0, 1, 2, 3, 4, 5].map((i) => a + i * b).join(", ")}. On Day 6 it is ${ans}.`; }
    else if (d === 2) { terms = [0, 1, 2, 3].map((i) => a + i * b); k = int(c.r, 10, 16); ans = a + (k - 1) * b; rule = `adds ${b} each day`; sol = `Day ${k} is ${k - 1} days after Day 1: ${a} + ${k - 1} × ${b} = ${ans}.`; }
    else if (c.r() < 0.5) { const s = int(c.r, 1, 3) * (c.cls <= 3 ? 1 : scale / (c.cls <= 5 ? 5 : 5)); terms = [a, a + b, a + 2 * b + s, a + 3 * b + 3 * s]; const all = [a]; for (let i = 1; i < 7; i++) all.push(all[i - 1] + b + (i - 1) * s); k = 7; ans = all[6]; rule = "grows by a bigger amount each day"; sol = `The increases are ${b}, ${b + s}, ${b + 2 * s}, … (each is ${s} more than the one before). Continuing: ${all.join(", ")}. Day 7 is ${ans}.`; terms = all.slice(0, 4); skills = ["PATTERN", "GENERALISATION"]; }
    else { const a2 = int(c.r, 2, 6) * (c.cls <= 4 ? 1 : 2); terms = [a2, a2 * 2, a2 * 4, a2 * 8]; k = 7; ans = a2 * 64; rule = "doubles every day"; sol = `Each day is double the day before: ${[0, 1, 2, 3, 4, 5, 6].map((i) => a2 * 2 ** i).join(", ")}. Day 7 is ${ans}.`; skills = ["PATTERN", "GENERALISATION"]; }
    const many = t.many;
    const figure: Fig | undefined = pic ? { kind: "bars", title: `${many[0].toUpperCase()}${many.slice(1)} each day`, labels: ["Day 1", "Day 2", "Day 3", "Day 4"], values: terms, step: niceStep(Math.max(...terms)), showValues: true, alt: `Bar graph: ${terms.join(", ")}` } : undefined;
    const ctx = `${who} counts the ${many} collected each day ${c.theme.place}. ${pic ? "The bar graph shows" : "The counts for"} Day 1 to Day 4${pic ? "" : " are"}: ${terms.map(fmt).join(", ")}. The number ${d === 3 ? "follows the same rule every day" : rule}.`;
    return { skills, d, ctx, figure, ask: `If the pattern continues, how many ${many} will there be on Day ${k}?`, say: `On Day ${k} there will be ____ ${many}.`, answer: ans, wrong: near(c.r, ans, [ans + (terms[1] - terms[0]), ans - (terms[1] - terms[0]), terms[3] * 2, ans + 1]), solution: sol, hint: "Look at how much the number changes from one day to the next." };
  },
};

export const calendarMarks: Engine = {
  id: "v3-calendar", skill: "PATTERN", tags: ["time", "calendar", "pattern", "count", "number"], part: "CT", pic: "always",
  make(c, d) {
    const mi = int(c.r, 0, 11), month = MONTHS[mi], days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][mi];
    const start = int(c.r, 0, 6), s = int(c.r, 1, 6), k = d === 1 ? int(c.r, 2, 4) : int(c.r, 3, 7);
    const marks = [s, s + k, s + 2 * k];
    const all: number[] = []; for (let x = s; x <= days; x += k) all.push(x);
    if (all.length < 5) return null;
    const who = pick(c.r, NAMES), act = pick(c.r, ["swimming class", "music class", "chess class", "yoga class", "art class", "dance class"]);
    const colour = pick(c.r, ["red", "blue", "green", "purple"] as Colour[]);
    const figure: Fig = { kind: "calendar", month, start, days, marks: marks.map((x) => ({ d: x, colour })), alt: `Calendar for ${month} with ${marks.join(", ")} marked` };
    const ctx = c.cls <= 4 ? `${who} has a ${act} every ${k} days. The first three are marked on the ${month} calendar.` : `${who} has a ${act} every ${k} days. The first three class days of ${month} are marked on the calendar. The classes go on every ${k} days for the whole month.`;
    const dow = (x: number) => DAYS[(start + x - 1 + 6) % 7]; // calendar starts on Sunday = 0; DAYS starts Monday
    if (d === 1) { const n = all[3]; return { skills: ["PATTERN"], d, ctx, figure, ask: `On which date in ${month} is the 4th class?`, say: `The 4th class is on ${month} ____.`, answer: n, wrong: near(c.r, n, [n + 1, n - 1, n + k, marks[2] + 1]), solution: `Add ${k} each time: ${all.slice(0, 4).join(", ")}. The 4th class is on ${month} ${n}.` }; }
    if (d === 2) { const n = all.length; return { skills: ["PATTERN", "DECOMPOSITION"], d, ctx, figure, ask: `How many classes does ${who} have in ${month}?`, say: `${who} has ____ classes in ${month}.`, answer: n, wrong: near(c.r, n, [n + 1, n - 1, Math.floor(days / k), n + 2]), solution: `The class dates are ${all.join(", ")}. The next would be ${all[all.length - 1] + k}, which is after ${month} ${days}. So there are ${n} classes.` }; }
    const j = all.length - 1, x = all[j];
    const ans = dow(x);
    return { skills: ["PATTERN", "ALGORITHMIC"], d, ctx, figure, ask: `On which day of the week is the last class in ${month}?`, say: `The last class in ${month} is on a ____.`, answer: ans, wrong: DAYS.filter((w) => w !== ans).sort((p, q) => Math.abs(DAYS.indexOf(p) - DAYS.indexOf(ans)) - Math.abs(DAYS.indexOf(q) - DAYS.indexOf(ans))).slice(0, 3), solution: `The class dates are ${all.join(", ")}, so the last class is on ${month} ${x}. In the calendar, ${x} is in the ${dow(x)} column.` };
  },
};

export const numGrid: Engine = {
  id: "v3-numgrid", skill: "PATTERN", tags: ["number", "mult", "factor", "pattern", "count", "place"], part: "CT", pic: "always",
  make(c, d) {
    const k = d === 1 ? int(c.r, 2, 5) : int(c.r, 3, 9), a = int(c.r, 1, k + 3);
    const marks = [a, a + k, a + 2 * k];
    const colour = pick(c.r, ["blue", "green", "orange", "pink"] as Colour[]);
    const figure: Fig = { kind: "numgrid", from: 1, to: 50, cols: 10, marks: marks.map((v) => ({ v, colour })), alt: `Numbers 1 to 50 with ${marks.join(", ")} circled` };
    const who = pick(c.r, NAMES);
    const ctx = c.cls <= 4 ? `${who} circles ${marks.join(", ")} on a number chart ${c.theme.place} and goes on with the same rule.` : `${who} circles numbers on a number chart ${c.theme.place}. The first three circled numbers are ${marks.join(", ")}, as shown. ${who} keeps circling numbers using the same rule.`;
    if (d === 1) { const n = a + 3 * k; return { skills: ["PATTERN"], d, ctx, figure, ask: "Which number will be circled next?", say: "The next circled number is ____.", answer: n, wrong: near(c.r, n, [n + 1, n - 1, a + 2 * k + 1, n + k]), solution: `The circled numbers go up by ${k}: ${marks.join(", ")}, ${n}.` }; }
    if (d === 2) { const j = int(c.r, 8, 15), n = a + (j - 1) * k; return { skills: ["PATTERN"], d, ctx, figure, ask: `If the chart went on past 50, what would be the ${ord(j)} circled number?`, say: `If the chart went on past 50, the ${ord(j)} circled number would be ____.`, answer: n, wrong: near(c.r, n, [n + k, n - k, j * k, n + 1]), solution: `Start at ${a} and add ${k} for each of the next ${j - 1} numbers: ${a} + ${j - 1} × ${k} = ${n}.` }; }
    const top = pick(c.r, [100, 100, 200]); const n = Math.floor((top - a) / k) + 1;
    return { skills: ["PATTERN", "GENERALISATION"], d, ctx, figure, ask: `If the chart went from 1 to ${top}, how many numbers would be circled?`, say: `From 1 to ${top}, ____ numbers would be circled.`, answer: n, wrong: near(c.r, n, [n + 1, n - 1, Math.floor(top / k), n + 2]), solution: `The circled numbers are ${a}, ${a + k}, ${a + 2 * k}, …, ${a + (n - 1) * k}. Counting jumps: (${a + (n - 1) * k} − ${a}) ÷ ${k} = ${n - 1} jumps, so ${n} numbers. The next one, ${a + n * k}, is more than ${top}.` };
  },
};

export const clockSeq: Engine = {
  id: "v3-clock-seq", skill: "PATTERN", tags: ["time"], part: "CT", pic: "always",
  make(c, d) {
    const gap = d === 1 ? pick(c.r, [30, 60]) : d === 2 ? pick(c.r, [15, 20, 25, 45]) : pick(c.r, [35, 40, 50, 55, 75]);
    const h = int(c.r, 1, 9), m = pick(c.r, [0, 5, 10, 15, 20, 30, 40, 45]);
    const t0 = h * 60 + m;
    const what = pick(c.r, ["a bus leaves", "a puppet show starts", "a toy train ride starts", "a boat ride starts", "a quiz round starts"]);
    const figure: Fig = { kind: "clock", h, m, alt: `A clock showing ${hm(t0)}` };
    const who = pick(c.r, NAMES);
    const n = d === 1 ? 3 : d === 2 ? int(c.r, 4, 6) : int(c.r, 5, 8);
    const tn = t0 + (n - 1) * gap;
    const ctx = `${who} is ${c.theme.place}. Nearby, ${what} every ${gap} minutes. The clock shows when the first one ${what.split(" ").pop() === "leaves" ? "leaves" : "starts"}. ${who} wants to know the times of the later ones.`;
    const show = (v: number | string) => String(v);
    return { skills: ["PATTERN", "ALGORITHMIC"].slice(0, d === 1 ? 1 : 2), d, ctx, figure, ask: `At what time does the ${ord(n)} one ${what.split(" ").pop() === "leaves" ? "leave" : "start"}?`, say: `The ${ord(n)} one ${what.split(" ").pop() === "leaves" ? "leaves" : "starts"} at ____.`, answer: hm(tn), wrong: [hm(tn - gap), hm(tn + gap), hm(tn + 5), hm(t0 + n * gap)], show, accept: timeAccept(tn), solution: `The first is at ${hm(t0)}. Add ${gap} minutes ${n - 1} times: ${Array.from({ length: n }, (_, i) => hm(t0 + i * gap)).join(", ")}.`, hint: `Add ${gap} minutes each time.` };
  },
};

export const PATTERN_ENGINES = [growDots, growSticks, beadPattern, numberSeq, calendarMarks, numGrid, clockSeq];
void withUnit;
