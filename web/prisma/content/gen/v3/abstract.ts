// Abstraction engines: keep only the information that matters, choose a model of the story, read a picture.
import type { Colour, Fig } from "../../../../src/lib/figures";
import { type Engine, type Problem, type Val, int, pick, sample, fmt, NAMES, near, rupees, withUnit, plural, cap, gcd, hm, sol } from "./core";

const has = (tags: string[], ...t: string[]) => t.some((x) => tags.includes(x));
const pr = (r: () => number, [lo, hi]: [number, number]) => (hi ? int(r, lo, hi) : int(r, 5, 40));

// ---------- Which information is not needed? ----------
export const notNeeded: Engine = {
  id: "v3-not-needed", skill: "ABSTRACT", tags: ["any"], part: "CT", pic: "never",
  make(c, d) {
    const [who, pal] = sample(c.r, NAMES, 2);
    const kind = has(c.theme.tags, "money") && c.r() < 0.5 ? "money" : has(c.theme.tags, "time") && c.r() < 0.5 ? "time" : "count";
    const boxy = c.theme.items.filter((x) => !/box|packet|bag|bottle|block|cup/.test(x.one));
    const [t1, t2] = sample(c.r, boxy.length >= 2 ? boxy : c.theme.items, 2);
    let facts: string[], question: string, need: string[], extra: string, answer: string;
    if (kind === "money" && t1.price[1] && t2.price[1]) {
      const q1 = int(c.r, 2, 6), q2 = int(c.r, 2, 5), p1 = pr(c.r, t1.price), p2 = pr(c.r, t2.price);
      need = [`${who} buys ${q1} ${t1.many}`, `one ${t1.one} costs ₹${p1}`, `${who} buys ${q2} ${t2.many}`, `one ${t2.one} costs ₹${p2}`];
      extra = d === 1 ? `the shop has a blue door` : d === 2 ? `the shop is ${int(c.r, 2, 9)} km from ${who}'s home` : `${pal} buys ${int(c.r, 2, 6)} ${t1.many} at the same shop`;
      question = `How much money does ${who} spend in all?`;
      answer = `${q1} × ₹${p1} + ${q2} × ₹${p2} = ₹${q1 * p1 + q2 * p2}`;
    } else if (kind === "time") {
      const a = int(c.r, 2, 6) * 5, b = int(c.r, 2, 8) * 5, s = int(c.r, 1, 3) * 5;
      need = [`${who} spends ${a} minutes on the first activity`, `the second activity takes ${b} minutes`, `there is a ${s}-minute break between them`, `${who} starts at 10 o'clock`];
      extra = d === 1 ? `${who} wears a red cap` : d === 2 ? `${int(c.r, 12, 40)} children take part` : `${pal} finishes ${int(c.r, 5, 20)} minutes earlier`;
      question = `At what time does ${who} finish the second activity?`;
      answer = `10:00 + ${a} + ${s} + ${b} minutes = ${hm(600 + a + s + b)}`;
    } else {
      const bx = int(c.r, 3, 9), per = int(c.r, 4, 12), loose = int(c.r, 2, 9);
      need = [`${who} packs ${t1.many} in ${bx} baskets`, `each basket holds ${per} ${t1.many}`, `${loose} more ${t1.many} are lying on the table`];
      extra = d === 1 ? `the baskets are yellow` : d === 2 ? `the baskets are kept on a ${int(c.r, 2, 5)}-metre shelf` : `${pal} packs ${int(c.r, 3, 9)} baskets of ${t2.many}`;
      question = `How many ${t1.many} does ${who} have in all?`;
      answer = `${bx} × ${per} + ${loose} = ${bx * per + loose}`;
    }
    facts = sample(c.r, need, need.length);
    const opts = [extra, ...facts.slice(0, 3)];
    const ctx = `${c.theme.place[0].toUpperCase()}${c.theme.place.slice(1)}: ${sample(c.r, [...facts, extra], facts.length + 1).map((f) => `${f}.`).map(cap).join(" ")}\n\n${question}`;
    return { skills: ["ABSTRACT"], d, ctx, ask: "Which piece of information is **not needed** to answer this question?", say: "To answer the question, we do not need to know that ____.", answer: extra, wrong: opts.slice(1), fill: false, solution: sol(`To answer "${question}", check each fact and ask whether the answer changes without it.`, facts.map((f) => `${cap(f)} — needed.`).concat([`${cap(extra)} — not needed; it does not change the answer.`]), `Working with only the needed facts: ${answer}.`, `So, "${extra}" is the information that is not needed.`), hint: "Try answering the question. Which fact did you never use?" };
  },
};

// ---------- Which number sentence fits the story? ----------
const val = (e: string) => Function(`return (${e.replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-")})`)() as number;
export const pickModel: Engine = {
  id: "v3-model", skill: "ABSTRACT", tags: ["any"], part: "CT", pic: "never",
  make(c, d) {
    const who = pick(c.r, NAMES), t = pick(c.r, c.theme.items);
    let ctx: string, right: string, wrongs: string[], why: string;
    const a = int(c.r, 3, 9), b = int(c.r, 4, 12), e = int(c.r, 2, 9);
    if (d === 1) {
      ctx = `${who} has ${a} bags ${c.theme.place}. Each bag has ${b} ${t.many}. ${who} also has ${e} more ${t.many} in hand.`;
      right = `${a} × ${b} + ${e}`; wrongs = [`${a} + ${b} × ${e}`, `(${a} + ${e}) × ${b}`, `${a} × (${b} + ${e})`, `${a} + ${b} + ${e}`];
      why = `${a} bags of ${b} make ${a} × ${b}; then add the ${e} extra.`;
    } else if (d === 2) {
      const p = t.price[1] ? pr(c.r, t.price) : int(c.r, 5, 30), q = int(c.r, 2, 6), note = [50, 100, 200, 500].find((n) => n > p * q) ?? 500;
      if (note <= p * q) return null;
      ctx = `${who} buys ${q} ${t.many} ${c.theme.place}. Each costs ₹${p}. ${who} pays with a ₹${note} note and gets some money back.`;
      right = `${note} − ${q} × ${p}`; wrongs = [`(${note} − ${q}) × ${p}`, `${note} − ${q} + ${p}`, `${q} × ${p} + ${note}`, `${note} − ${p}`];
      why = `The cost is ${q} × ${p}; the money back is the note minus the cost.`;
    } else {
      const k = int(c.r, 2, 5), x = int(c.r, 3, 8), y = int(c.r, 2, 6);
      const total = a * b - x;
      if (total <= 0 || total % k) return null;
      ctx = `${who} had ${a} packets of ${t.many} ${c.theme.place}, with ${b} in each packet. ${x} of them were used up. The rest were shared equally among ${k} friends, and each friend also got ${y} from ${who}'s teacher.`;
      right = `(${a} × ${b} − ${x}) ÷ ${k} + ${y}`; wrongs = [`${a} × ${b} − ${x} ÷ ${k} + ${y}`, `(${a} × ${b} − ${x}) ÷ (${k} + ${y})`, `(${a} + ${b} − ${x}) ÷ ${k} + ${y}`, `${a} × (${b} − ${x}) ÷ ${k} + ${y}`];
      why = `First find what is left (${a} × ${b} − ${x}), then share it among ${k} (÷ ${k}), then add the ${y} extra each friend got. The brackets make the subtraction happen before the sharing.`;
    }
    const rv = val(right);
    const ws = wrongs.filter((w) => Math.abs(val(w) - rv) > 1e-9);
    if (ws.length < 3) return null;
    const q = d === 3 ? "how many each friend has now" : d === 2 ? "how much money comes back" : `how many ${t.many} there are in all`;
    return { skills: d === 3 ? ["ABSTRACT", "DECOMPOSITION"] : ["ABSTRACT"], d, ctx, ask: `Which number sentence shows ${q}?`, say: `The number sentence ____ shows ${q}.`, answer: right, wrong: ws, fill: false, solution: sol(`Break the story into steps and write each step as a number operation.`, why, `Check the other number sentences: each one either uses the numbers in the wrong order or combines them in the wrong way, so it gives a different value.`, `So, the number sentence is ${right}, and its value is ${fmt(rv)}.`), hint: "Act out the story step by step and write each step." };
  },
};

// ---------- Read the picture ----------
type Reader = { tags: string[]; make: (c: Parameters<Engine["make"]>[0], d: 1 | 2 | 3) => Problem | null };
const READERS: Reader[] = [
  { tags: ["money"], make(c, d) { // money in a purse
    const den = c.cls <= 3 ? [1, 2, 5, 10, 20, 50] : [2, 5, 10, 20, 50, 100, 200, 500];
    const n = d === 1 ? int(c.r, 3, 4) : int(c.r, 5, 7);
    const items = Array.from({ length: n }, () => pick(c.r, den)).sort((x, y) => y - x);
    const total = items.reduce((s, v) => s + v, 0), who = pick(c.r, NAMES), t = pick(c.r, c.theme.items);
    const figure: Fig = { kind: "money", items, alt: `Notes and coins: ${items.map((v) => `₹${v}`).join(", ")}` };
    if (d < 3) return { skills: ["ABSTRACT", "DECOMPOSITION"].slice(0, d), d: d as 1 | 2, ctx: `${who} empties a money box ${c.theme.place}. The picture shows the notes and coins inside. Only their values matter, not their size or colour.`, figure, ask: `How much money is in the box?`, say: `There is ₹____ in the box.`, answer: total, wrong: near(c.r, total, [total - items[items.length - 1], total + items[0], total + 10, total - 5]), show: rupees, unitNote: "in rupees", accept: [`₹${total}`, `rs ${total}`, `rs. ${total}`, `${total} rupees`], solution: sol(`Only the value written on each note and coin matters, not its size or colour.`, `Add the values one by one:`, [items.map((v) => `₹${v}`).join(" + ") + ` = ₹${total}`], `So, there is ₹${total} in the box.`)};
    const cost = total + int(c.r, 1, 9) * (c.cls <= 3 ? 5 : 10);
    return { skills: ["ABSTRACT", "DECOMPOSITION"], d, ctx: `${who} wants to buy a ${t.one} that costs ₹${cost} ${c.theme.place}. The picture shows all the money ${who} has.`, figure, ask: `How much more money does ${who} need?`, say: `${who} needs ₹____ more.`, answer: cost - total, wrong: near(c.r, cost - total, [cost - total + items[0], total, cost - total + 10, cost - total - 5].filter((x) => x > 0)), show: rupees, unitNote: "in rupees", accept: [`₹${cost - total}`, `rs ${cost - total}`], solution: sol(`First find how much money ${who} has. Add the values of the notes and coins in the picture:`, [items.map((v) => `₹${v}`).join(" + ") + ` = ₹${total}`], `The ${t.one} costs ₹${cost}, so the money still needed is:`, [`₹${cost} − ₹${total} = ₹${cost - total}`], `So, ${who} needs ₹${cost - total} more.`)};
  } },
  { tags: ["length", "decimal"], make(c, d) { // ruler that does not start at 0
    const start = d === 1 ? 0 : int(c.r, 1, 4), len = int(c.r, 3, 9), cm = Math.max(start + len + 1, 10);
    const obj = pick(c.r, ["pencil", "crayon", "ribbon", "twig", "nail", "key"]), who = pick(c.r, NAMES);
    const figure: Fig = { kind: "ruler", cm, start, length: len, colour: pick(c.r, ["red", "blue", "green", "orange"] as Colour[]), alt: `A ${obj} from ${start} cm to ${start + len} cm on a ruler` };
    if (d < 3) return { skills: ["ABSTRACT"], d, ctx: `${who} measures a ${obj} ${c.theme.place} with a ruler, as shown.${start ? ` The ${obj} does not start at 0.` : ""}`, figure, ask: `How long is the ${obj}?`, say: `The ${obj} is ____ cm long.`, answer: len, wrong: near(c.r, len, [start + len, len + 1, len - 1, start + len + 1]), show: withUnit("cm"), unitNote: "in cm", solution: sol(start ? `The ${obj} does not start at the 0 mark, so we cannot read its length directly.` : `The ${obj} starts at the 0 mark.`, `It starts at ${start} cm and ends at ${start + len} cm.`, [`Length = end − start = ${start + len} − ${start} = ${len} cm`], `So, the ${obj} is ${len} cm long.`), hint: "Where does it start, and where does it end?" };
    const goal = len + int(c.r, 3, 9);
    return { skills: ["ABSTRACT", "DECOMPOSITION"], d, ctx: `${who} needs a ${obj} that is ${goal} cm long ${c.theme.place}. The picture shows the ${obj} ${who} has, placed on a ruler${start ? " (it does not start at 0)" : ""}.`, figure, ask: `How many more centimetres does ${who} need?`, say: `${who} needs ____ cm more.`, answer: goal - len, wrong: near(c.r, goal - len, [goal - start - len, goal - start, goal - len + 1, start + len]), show: withUnit("cm"), unitNote: "in cm", solution: sol(`First find the length of the ${obj} from the ruler. It starts at ${start} cm and ends at ${start + len} cm:`, [`Length = ${start + len} − ${start} = ${len} cm`], `${who} needs ${goal} cm, so:`, [`More needed = ${goal} − ${len} = ${goal - len} cm`], `So, ${who} needs ${goal - len} cm more.`)};
  } },
  { tags: ["capacity"], make(c, d) { // measuring jug
    const big = d === 3 || c.r() < 0.4;
    const max = big ? 1000 : 10, step = big ? 50 : 1, labelEvery = big ? 4 : 2, unit = big ? "mL" : "L";
    const level = big ? int(c.r, 2, 18) * 50 : int(c.r, 2, 9);
    const who = pick(c.r, NAMES);
    const figure: Fig = { kind: "jug", max, step, labelEvery, level, unit, alt: `A measuring jug filled to ${level} ${unit}` };
    if (d < 3) return { skills: ["ABSTRACT"], d, ctx: `${who} pours water into a measuring jug ${c.theme.place}. Only every ${labelEvery === 4 ? "fourth" : "second"} line has a number, so read the lines carefully.`, figure, ask: `How much water is in the jug?`, say: `The jug has ____ ${unit} of water.`, answer: level, wrong: near(c.r, level, [level + step, level - step, level + step * labelEvery, level - step * 2]), show: withUnit(unit), unitNote: `in ${unit}`, solution: sol(`Only every ${labelEvery === 4 ? "fourth" : "second"} line has a number. Find what one small line stands for: the numbered lines go up by ${step * labelEvery} ${unit} and there are ${labelEvery} gaps between them, so each small line is ${step * labelEvery} ÷ ${labelEvery} = ${step} ${unit}.`, `The water is ${level % (step * labelEvery) === 0 ? "exactly at" : `${(level % (step * labelEvery)) / step} line${(level % (step * labelEvery)) / step > 1 ? "s" : ""} above`} the ${Math.floor(level / (step * labelEvery)) * step * labelEvery} ${unit} mark.`, `So, the jug has ${level} ${unit} of water.`)};
    return { skills: ["ABSTRACT", "DECOMPOSITION"], d, ctx: `${who} needs exactly 1 litre of water ${c.theme.place}. The jug in the picture shows how much water ${who} has poured so far. (1 litre = 1000 mL.)`, figure, ask: `How many more millilitres must ${who} pour?`, say: `${who} must pour ____ mL more.`, answer: 1000 - level, wrong: near(c.r, 1000 - level, [level, 1000 - level + 50, 1000 - level - 50, 100 - level / 10]), show: withUnit("mL"), unitNote: "in mL", solution: sol(`Each small line is 50 mL, and the water reaches ${level} mL.`, `${who} needs exactly 1 litre. Change litres to millilitres: 1 L = 1000 mL.`, [`More water needed = 1000 − ${level} = ${1000 - level} mL`], `So, ${who} must pour ${1000 - level} mL more.`)};
  } },
  { tags: ["weight"], make(c, d) { // balance
    const t = pick(c.r, c.theme.items), n = d === 1 ? 1 : d === 2 ? int(c.r, 2, 3) : int(c.r, 3, 5);
    const each = n === 1 ? pick(c.r, [100, 200, 250, 300, 500, 700]) : pick(c.r, [50, 100, 150, 200, 250]);
    const tot = each * n;
    const right: number[] = []; let left = tot;
    for (const w of [1000, 500, 200, 100, 50]) while (left >= w && right.length < 6) { right.push(w); left -= w; }
    if (left) return null;
    const figure: Fig = { kind: "balance", left: { icon: t.icon, n }, right, unit: "g", alt: `${n} ${t.many} balance weights of ${right.join(", ")} g` };
    const who = pick(c.r, NAMES);
    return { skills: n > 1 ? ["ABSTRACT", "DECOMPOSITION"] : ["ABSTRACT"], d, ctx: `${who} weighs ${n === 1 ? `a ${t.one}` : `${n} identical ${t.many}`} ${c.theme.place} on a balance. The pans are level, as shown.`, figure, ask: `How much does ${n === 1 ? "the" : "one"} ${t.one} weigh?`, say: `One ${t.one} weighs ____ g.`, answer: each, wrong: near(c.r, each, [tot, each + 50, each - 50, Math.round(tot / (n + 1))]), show: withUnit("g"), unitNote: "in grams", solution: sol(`The pans are level, so both sides weigh the same.`, `Add the weights on the right pan:`, [`${right.join(" g + ")} g = ${tot} g`], n > 1 ? `The left pan has ${n} identical ${t.many}, so they share this weight equally: ${tot} ÷ ${n} = ${each} g.` : `The left pan has one ${t.one}, so it weighs ${tot} g.`, `So, one ${t.one} weighs ${each} g.`)};
  } },
  { tags: ["data", "count"], make(c, d) { // pictograph with a key
    const WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], labels = sample(c.r, WEEK, 4).sort((x, y) => WEEK.indexOf(x) - WEEK.indexOf(y));
    const per = d === 1 ? 2 : d === 2 ? pick(c.r, [5, 10]) : pick(c.r, [10, 20, 25]);
    const counts = labels.map(() => int(c.r, 1, 7));
    const t = pick(c.r, c.theme.items), who = pick(c.r, NAMES);
    const figure: Fig = { kind: "pictograph", title: `${cap(t.many)} each day`, labels, counts, icon: t.icon, per, alt: `Pictograph: ${labels.map((l, i) => `${l} ${counts[i]} icons`).join(", ")}; key ${per}` };
    const i = int(c.r, 0, 3), j = (i + 1 + int(c.r, 0, 2)) % 4;
    if (d < 3) return { skills: ["ABSTRACT", "DATA"], d, ctx: `${who} made this pictograph of ${t.many} ${c.theme.place}. Look at the key before you count.`, figure, ask: `How many ${t.many} were there on ${labels[i]}?`, say: `There were ____ ${t.many} on ${labels[i]}.`, answer: counts[i] * per, wrong: near(c.r, counts[i] * per, [counts[i], counts[i] * per + per, (counts[i] - 1) * per, counts[i] + per]), solution: sol(`First read the key: each picture stands for ${per} ${t.many}.`, `${labels[i]} has ${counts[i]} picture${counts[i] > 1 ? "s" : ""}.`, [`${counts[i]} × ${per} = ${counts[i] * per}`], `So, there were ${counts[i] * per} ${t.many} on ${labels[i]}.`)};
    if (counts[i] === counts[j]) return null;
    const diff = Math.abs(counts[i] - counts[j]) * per;
    return { skills: ["ABSTRACT", "DATA"], d, ctx: `${who} made this pictograph of ${t.many} ${c.theme.place}. Look at the key before you count.`, figure, ask: `How many more ${t.many} were there on ${counts[i] > counts[j] ? labels[i] : labels[j]} than on ${counts[i] > counts[j] ? labels[j] : labels[i]}?`, say: `There were ____ more on ${counts[i] > counts[j] ? labels[i] : labels[j]} than on ${counts[i] > counts[j] ? labels[j] : labels[i]}.`, answer: diff, wrong: near(c.r, diff, [Math.abs(counts[i] - counts[j]), diff + per, (counts[i] + counts[j]) * per, diff - per].filter((x) => x > 0)), solution: sol(`First read the key: each picture stands for ${per} ${t.many}.`, [`${counts[i] > counts[j] ? labels[i] : labels[j]}: ${Math.max(counts[i], counts[j])} pictures = ${Math.max(counts[i], counts[j])} × ${per} = ${Math.max(counts[i], counts[j]) * per}`, `${counts[i] > counts[j] ? labels[j] : labels[i]}: ${Math.min(counts[i], counts[j])} pictures = ${Math.min(counts[i], counts[j])} × ${per} = ${Math.min(counts[i], counts[j]) * per}`], `Difference = ${Math.max(counts[i], counts[j]) * per} − ${Math.min(counts[i], counts[j]) * per} = ${diff}.`, `So, there were ${diff} more on ${counts[i] > counts[j] ? labels[i] : labels[j]}.`)};
  } },
  { tags: ["number", "place"], make(c, d) { // abacus
    const cols = c.cls <= 3 ? ["H", "T", "O"] : c.cls <= 5 ? ["Th", "H", "T", "O"] : ["TTh", "Th", "H", "T", "O"];
    const beads = cols.map((_, i) => (i === 0 ? int(c.r, 1, 9) : d === 1 ? int(c.r, 1, 9) : int(c.r, 0, 9)));
    const value = beads.reduce((s, b) => s * 10 + b, 0);
    const figure: Fig = { kind: "abacus", labels: cols, beads, alt: `Abacus with ${cols.map((l, i) => `${beads[i]} on ${l}`).join(", ")}` };
    const who = pick(c.r, NAMES);
    if (d < 3) return { skills: ["ABSTRACT"], d, ctx: `${who} shows a number on an abacus ${c.theme.place}. Each rod stands for a place value (${cols.join(", ")}).`, figure, ask: "Which number does the abacus show?", say: "The abacus shows the number ____.", answer: value, wrong: near(c.r, value, [Number([...beads].reverse().join("")), value + 10 ** (cols.length - 2), value - 1, Number([beads[0], beads[2], beads[1], ...beads.slice(3)].join(""))]), solution: sol(`Each rod stands for one place. Count the beads on each rod and write that digit in its place:`, cols.map((l, i) => `${l}: ${beads[i]} bead${beads[i] === 1 ? "" : "s"}`), `Reading the digits from left to right gives ${fmt(value)}.`, `So, the abacus shows ${fmt(value)}.`)};
    const k = int(c.r, 1, cols.length - 1), add = 10 ** (cols.length - 1 - k) * int(c.r, 1, 3);
    return { skills: ["ABSTRACT", "DECOMPOSITION"], d, ctx: `${who} shows a number on an abacus ${c.theme.place}. Then ${who} adds ${fmt(add)} to it.`, figure, ask: `Which number does ${who} get?`, say: `${who} gets ____.`, answer: value + add, wrong: near(c.r, value + add, [value + add * 10, value + (Math.floor(add / 10) || 2), value - add, value + 1]), solution: sol(`First read the abacus: ${cols.map((l, i) => `${beads[i]} ${l}`).join(", ")}, which is ${fmt(value)}.`, `Then add ${fmt(add)}:`, [`${fmt(value)} + ${fmt(add)} = ${fmt(value + add)}`], `So, ${who} gets ${fmt(value + add)}.`)};
  } },
  { tags: ["fraction"], make(c, d) {
    const parts = d === 1 ? pick(c.r, [3, 4, 5, 6]) : pick(c.r, [6, 8, 10, 12]), k = int(c.r, 1, parts - 1);
    const g = gcd(k, parts);
    if (d === 3 && g === 1) return null;
    const figure: Fig = { kind: "fraction", shape: parts > 8 ? "grid" : pick(c.r, ["circle", "bar"] as const), parts, shaded: k, colour: pick(c.r, ["red", "blue", "green", "orange"] as Colour[]), ...(parts > 8 ? { rows: 2 } : {}), alt: `${k} of ${parts} equal parts shaded` };
    const who = pick(c.r, NAMES), t = pick(c.r, c.theme.items);
    const show = (v: Val) => String(v);
    if (d === 1) return { skills: ["ABSTRACT"], d, ctx: `${who} cuts a cake into equal parts ${c.theme.place} and colours the parts that were eaten.`, figure, ask: "What fraction of the cake was eaten (shaded)?", say: "____ of the cake was eaten.", answer: `${k}/${parts}`, wrong: [`${parts - k}/${parts}`, `${k}/${parts - k}`, `${parts}/${k}`, `${k}/${parts + 1}`], show, solution: sol(`Count the equal parts of the cake: there are ${parts}. This number goes at the bottom of the fraction.`, `Count the shaded parts: there are ${k}. This number goes at the top.`, `So, ${k}/${parts} of the cake was eaten.`)};
    if (d === 2) return { skills: ["ABSTRACT"], d, ctx: `${who} shares ${t.many} ${c.theme.place}. The picture shows a tray cut into equal parts; the shaded parts are already given away.`, figure, ask: "What fraction of the tray is NOT given away yet?", say: "____ of the tray is not given away yet.", answer: `${parts - k}/${parts}`, wrong: [`${k}/${parts}`, `${parts - k}/${k}`, `${k}/${parts - k}`, `${parts - k}/${parts + 1}`], show, solution: sol(`The tray has ${parts} equal parts, and ${k} of them are shaded (given away).`, [`Parts not given away = ${parts} − ${k} = ${parts - k}`], `So, ${parts - k}/${parts} of the tray is not given away yet.`)};
    return { skills: ["ABSTRACT", "GENERALISATION"], d, ctx: `${who} shades part of a shape ${c.theme.place}, as shown.`, figure, ask: "What fraction is shaded, in its simplest form?", say: "In simplest form, ____ of the shape is shaded.", answer: `${k / g}/${parts / g}`, wrong: [`${k}/${parts}`, `${(parts - k) / g}/${parts / g}`, `${k / g}/${parts}`, `${k}/${parts / g}`], show, solution: sol(`The shape has ${parts} equal parts and ${k} are shaded, so ${k}/${parts} is shaded.`, `To write it in its simplest form, divide the top and the bottom by their biggest common factor, ${g}:`, [`${k} ÷ ${g} = ${k / g}`, `${parts} ÷ ${g} = ${parts / g}`], `So, in simplest form, ${k / g}/${parts / g} of the shape is shaded.`)};
  } },
];
export const readPicture: Engine = {
  id: "v3-read-picture", skill: "ABSTRACT", tags: ["money", "length", "decimal", "capacity", "weight", "data", "count", "number", "place", "fraction"], part: "CT", pic: "always",
  make(c, d) {
    const ok = READERS.filter((x) => has(c.theme.tags, ...x.tags));
    if (!ok.length) return null;
    return pick(c.r, ok).make(c, d);
  },
};

// ---------- Sorting rule: which one does not fit? ----------
const RULES: { name: string; min: number; test: (n: number) => boolean; why: (n: number) => string }[] = [
  { name: "even numbers", min: 3, test: (n) => n % 2 === 0, why: (n) => `${n} ends in ${n % 10}, so it is odd` },
  { name: "multiples of 5", min: 3, test: (n) => n % 5 === 0, why: (n) => `${n} does not end in 0 or 5` },
  { name: "multiples of 3", min: 4, test: (n) => n % 3 === 0, why: (n) => `the digits of ${n} add up to ${String(n).split("").reduce((s, x) => s + Number(x), 0)}, which is not a multiple of 3` },
  { name: "multiples of 4", min: 5, test: (n) => n % 4 === 0, why: (n) => `${n} ÷ 4 leaves a remainder of ${n % 4}` },
  { name: "numbers with a digit sum of 9", min: 4, test: (n) => String(n).split("").reduce((s, x) => s + Number(x), 0) === 9, why: (n) => `the digits of ${n} add up to ${String(n).split("").reduce((s, x) => s + Number(x), 0)}` },
  { name: "multiples of 6", min: 5, test: (n) => n % 6 === 0, why: (n) => `${n} is ${n % 2 ? "odd" : "not a multiple of 3"}` },
  { name: "prime numbers", min: 6, test: (n) => n > 1 && [...Array(n).keys()].slice(2).every((k) => k * k > n || n % k), why: (n) => `${n} has a factor other than 1 and itself` },
  { name: "square numbers", min: 6, test: (n) => Number.isInteger(Math.sqrt(n)), why: (n) => `${n} is not a whole number times itself` },
  { name: "multiples of 9", min: 6, test: (n) => n % 9 === 0, why: (n) => `the digits of ${n} do not add up to a multiple of 9` },
];
export const sortRule: Engine = {
  id: "v3-sort-rule", skill: "ABSTRACT", tags: ["number", "mult", "factor", "count", "place", "pattern"], part: "CT", pic: "never",
  make(c, d) {
    const rules = RULES.filter((x) => x.min <= c.cls);
    const hard = rules.slice(2), rule = d === 1 ? rules[int(c.r, 0, 1)] : pick(c.r, d === 3 && hard.length ? hard : rules);
    const hi = c.cls <= 3 ? 99 : c.cls <= 5 ? 300 : 999, lo = d === 1 ? 10 : 20;
    const ins: number[] = [], outs: number[] = [];
    for (let i = 0; i < 400 && (ins.length < 4 || outs.length < 3); i++) { const n = int(c.r, lo, hi); if (rule.test(n)) { if (!ins.includes(n)) ins.push(n); } else if (!outs.includes(n)) outs.push(n); }
    if (ins.length < 4 || outs.length < 3) return null;
    const odd = outs[0], who = pick(c.r, NAMES);
    const box = sample(c.r, [...ins.slice(0, 3), odd], 4);
    return { skills: ["ABSTRACT"], d, ctx: c.cls <= 4 ? `The rule for ${who}'s box is: **${rule.name}**. The box has the cards ${box.join(", ")}. One card is in the wrong place.` : `${who} sorts number cards ${c.theme.place}. The rule for the box is: **${rule.name}**. These cards are in the box: ${box.join(", ")}. One card is in the wrong place.`, ask: "Which card does NOT follow the rule?", say: "The card that does not follow the rule is ____.", answer: odd, wrong: ins.slice(0, 3), solution: sol(`Check every card against the rule: ${rule.name}.`, [...ins.slice(0, 3).map((x) => `${x} — follows the rule.`), `${odd} — does not follow the rule: ${rule.why(odd)}.`], `So, the card that does NOT follow the rule is ${odd}.`), hint: "Check each card against the rule." };
  },
};

// ---------- Grid references (maps) ----------
const MAP_ICONS: [string, string][] = [["🏫", "school"], ["🌳", "tree"], ["🏠", "house"], ["⛲", "fountain"], ["🏪", "shop"], ["🏥", "hospital"], ["🐄", "cow"], ["🚉", "station"], ["🎡", "big wheel"], ["⛺", "tent"]];
const ref = (r: number, cc: number) => `${String.fromCharCode(65 + cc)}${r + 1}`;
export const gridRef: Engine = {
  id: "v3-grid-ref", skill: "ABSTRACT", tags: ["map", "shape", "angle"], part: "CT", pic: "always",
  make(c, d) {
    const rows = d === 1 ? 4 : 5, cols = d === 1 ? 4 : 6;
    const icons = sample(c.r, MAP_ICONS, 5);
    const cells = new Set<string>(); const items: { r: number; c: number; icon: string }[] = [];
    for (const [ic] of icons) { let rr = 0, cc = 0, k = 0; do { rr = int(c.r, 0, rows - 1); cc = int(c.r, 0, cols - 1); k++; } while (cells.has(`${rr},${cc}`) && k < 50); cells.add(`${rr},${cc}`); items.push({ r: rr, c: cc, icon: ic }); }
    const figure: Fig = { kind: "gridmap", rows, cols, items, compass: d === 3, alt: `A map grid with ${icons.map(([, n]) => n).join(", ")}` };
    const name = (i: number) => icons[i][1], who = pick(c.r, NAMES);
    const ctx = `${who} draws a map ${c.theme.place}. Columns are lettered A, B, C, … and rows are numbered 1, 2, 3, … from the top. A square is named by its column letter and then its row number, like B3.`;
    if (d === 1) { const i = int(c.r, 0, 4), a = ref(items[i].r, items[i].c); return { skills: ["ABSTRACT"], d, ctx, figure, ask: `In which square is the ${name(i)}?`, say: `The ${name(i)} is in square ____.`, answer: a, wrong: [ref(items[i].c % rows, items[i].r % cols), ref(items[i].r, (items[i].c + 1) % cols), ref((items[i].r + 1) % rows, items[i].c), `${items[i].r + 1}${String.fromCharCode(65 + items[i].c)}`].filter((x) => x !== a), accept: [a.toLowerCase()], solution: sol(`Find the ${name(i)} on the map. Read the letter at the top of its column, then the number at the start of its row.`, [`Column: ${a[0]}`, `Row: ${a.slice(1)}`], `So, the ${name(i)} is in square ${a}.`)}; }
    if (d === 2) { const i = int(c.r, 0, 4), dr = int(c.r, -1, 2), dc = int(c.r, -2, 2); const r2 = items[i].r + dr, c2 = items[i].c + dc; if (r2 < 0 || c2 < 0 || r2 >= rows || c2 >= cols || (dr === 0 && dc === 0)) return null; const a = ref(r2, c2); const moves = [dc ? `${Math.abs(dc)} square${Math.abs(dc) > 1 ? "s" : ""} to the ${dc > 0 ? "right" : "left"}` : "", dr ? `${Math.abs(dr)} square${Math.abs(dr) > 1 ? "s" : ""} ${dr > 0 ? "down" : "up"}` : ""].filter(Boolean).join(" and "); return { skills: ["ABSTRACT", "ALGORITHMIC"], d, ctx: `${ctx} ${who} starts at the ${name(i)} and moves ${moves}.`, figure, ask: `In which square does ${who} end up?`, say: `${who} ends up in square ____.`, answer: a, wrong: [ref(items[i].r - dr < 0 || items[i].r - dr >= rows ? items[i].r : items[i].r - dr, c2), ref(r2, items[i].c - dc < 0 || items[i].c - dc >= cols ? items[i].c : items[i].c - dc), ref(items[i].r, items[i].c), ref(Math.min(rows - 1, r2 + 1), c2)].filter((x) => x !== a), accept: [a.toLowerCase()], solution: sol(`The ${name(i)} is in square ${ref(items[i].r, items[i].c)}.`, [dc ? `Moving ${Math.abs(dc)} square${Math.abs(dc) > 1 ? "s" : ""} to the ${dc > 0 ? "right" : "left"} changes the column from ${ref(0, items[i].c)[0]} to ${a[0]}.` : `The column stays ${a[0]}.`, dr ? `Moving ${Math.abs(dr)} square${Math.abs(dr) > 1 ? "s" : ""} ${dr > 0 ? "down" : "up"} changes the row from ${items[i].r + 1} to ${a.slice(1)}.` : `The row stays ${a.slice(1)}.`], `[fig:1]`, `So, ${who} ends up in square ${a}.`), solutionFigures: [{ ...figure, path: [[items[i].r, items[i].c], [items[i].r, c2], [r2, c2]] as [number, number][], alt: `The route from ${ref(items[i].r, items[i].c)} to ${a}` }]}; }
    // d3: which place is in the same column/row as another, using the compass (north is up)
    const i = int(c.r, 0, 4);
    const north = items.filter((it, k) => k !== i && it.c === items[i].c && it.r < items[i].r);
    if (north.length !== 1) return null;
    const ansI = items.indexOf(north[0]);
    return { skills: ["ABSTRACT"], d, ctx: `${ctx} North is towards the top of the map.`, figure, ask: `Which place is due north of the ${name(i)} (in the same column, higher up)?`, say: `The place due north of the ${name(i)} is the ____.`, answer: name(ansI), wrong: icons.map(([, n]) => n).filter((n, k) => k !== ansI && k !== i), solution: sol(`North is towards the top of the map. A place due north of the ${name(i)} must be in the same column (${ref(0, items[i].c)[0]}) and higher up.`, `The ${name(i)} is in ${ref(items[i].r, items[i].c)}. Going up column ${ref(0, items[i].c)[0]}, the only other place is the ${name(ansI)} in ${ref(north[0].r, north[0].c)}.`, `So, the place due north of the ${name(i)} is the ${name(ansI)}.`)};
  },
};

// ---------- Sorting shapes by their features ----------
const SHAPES = ["triangle", "circle", "square", "star", "heart"] as const;
const SCOL: Colour[] = ["red", "blue", "green", "yellow"];
export const shapeFeatures: Engine = {
  id: "v3-shape-features", skill: "ABSTRACT", tags: ["any"], part: "CT", pic: "always",
  make(c, d) {
    const cols = d === 1 ? 4 : 5, rows = d === 1 ? 2 : 3;
    const shapes = SHAPES.slice(0, d === 1 ? 3 : 4), colours = SCOL.slice(0, d === 1 ? 2 : 3);
    const items = Array.from({ length: rows * cols }, (_, k) => ({ r: Math.floor(k / cols), c: k % cols, shape: pick(c.r, shapes), colour: pick(c.r, colours), size: pick(c.r, d === 3 ? [0.7, 1] : [1]) }));
    const figure: Fig = { kind: "shapes", cols, rows, items, alt: `${items.length} shapes of different kinds and colours` };
    const who = pick(c.r, NAMES), sh = pick(c.r, shapes), co = pick(c.r, colours);
    const ctx = c.cls <= 4 ? `${who} sorts these picture cards ${c.theme.place}.` : `${who} sorts picture cards ${c.theme.place}. Each card has one shape, as shown. ${who} looks only at the feature the question asks about and ignores the rest.`;
    let ans: number, ask: string, say: string, why: string;
    if (d === 1) { ans = items.filter((x) => x.shape === sh).length; ask = `How many ${sh}s are there?`; say = `There are ____ ${sh}s.`; why = `Ignore the colours and count only the ${sh}s: ${ans}.`; }
    else if (d === 2) { ans = items.filter((x) => x.shape === sh && x.colour === co).length; ask = `How many ${co} ${sh}s are there?`; say = `There are ____ ${co} ${sh}s.`; why = `A card is counted only if it is a ${sh} AND ${co}: ${ans}.`; }
    else { ans = items.filter((x) => x.shape !== sh && x.colour !== co).length; ask = `How many cards are neither ${sh}s nor ${co}?`; say = `____ cards are neither ${sh}s nor ${co}.`; why = `Leave out every ${sh} and every ${co} card. ${items.length} cards − ${items.filter((x) => x.shape === sh || x.colour === co).length} that are ${sh}s or ${co} = ${ans}.`; }
    if (!ans) return null;
    const alt = d === 1 ? items.filter((x) => x.colour === co).length : d === 2 ? items.filter((x) => x.shape === sh).length : items.filter((x) => x.shape !== sh).length;
    return { skills: d === 3 ? ["ABSTRACT", "DECOMPOSITION"] : ["ABSTRACT"], d, ctx, figure, ask, say, answer: ans, wrong: near(c.r, ans, [alt, ans + 1, ans - 1, items.filter((x) => x.colour === co).length]), solution: sol(`Look at the cards one by one and check only the feature the question asks about.`, why)};
  },
};

// ---------- Reading a Venn diagram ----------
const VENN: [string, string, string][] = [["Cricket", "Football", "which game they like"], ["Maths club", "Art club", "which club they are in"], ["Dogs", "Cats", "which pets they have at home"], ["Tea", "Milk", "what they drink at breakfast"], ["Hindi", "English", "which language they read storybooks in"], ["Bus", "Metro", "how they travel to the museum"]];
export const vennRead: Engine = {
  id: "v3-venn", skill: "ABSTRACT", tags: ["data", "count", "number", "factor", "mult", "shape", "symmetry", "pattern", "place", "map", "time", "money", "length", "weight", "capacity", "fraction", "decimal", "algebra", "power", "letters", "integer", "area", "angle", "calendar", "div"], part: "CT", pic: "always", min: 4,
  make(c, d) {
    const [L, Rt, verb] = pick(c.r, VENN), a = int(c.r, 3, 15), both = int(c.r, 2, 9), b = int(c.r, 3, 15), out = d === 3 ? int(c.r, 2, 8) : 0;
    const figure: Fig = { kind: "venn", left: L, right: Rt, a: String(a), both: String(both), b: String(b), ...(out ? { outside: `Neither: ${out}` } : {}), alt: `Venn diagram: ${L} only ${a}, both ${both}, ${Rt} only ${b}${out ? `, neither ${out}` : ""}` };
    const who = pick(c.r, NAMES);
    const ctx = c.cls <= 4 ? `${who} asked classmates ${verb}: ${L} or ${Rt}. The middle part of the diagram is for children who chose both.` : `${who} asked classmates ${c.theme.place} ${verb}: ${L} or ${Rt}. The Venn diagram shows how many children gave each answer. The middle part is for children who chose both.`;
    if (d === 1) return { skills: ["ABSTRACT", "DATA"], d, ctx, figure, ask: `How many children chose ${L} (including those who chose both)?`, say: `In all, ____ children chose ${L}.`, answer: a + both, wrong: near(c.r, a + both, [a, a + both + b, both, a + b]), solution: sol(`The ${L} circle has two parts: children who chose only ${L} (${a}) and children in the middle who chose both (${both}).`, [`Children who chose ${L} = ${a} + ${both} = ${a + both}`], `So, ${a + both} children chose ${L}.`)};
    if (d === 2) return { skills: ["ABSTRACT", "DATA"], d, ctx, figure, ask: `How many children were asked, if every child chose at least one?`, say: `____ children were asked.`, answer: a + both + b, wrong: near(c.r, a + both + b, [a + b, a + 2 * both + b, a + both, a + b + both + 1]), solution: sol(`The diagram has three parts: only ${L} (${a}), both (${both}) and only ${Rt} (${b}). Every child is counted in exactly one part.`, [`Total = ${a} + ${both} + ${b} = ${a + both + b}`], `Note: adding the two circles separately (${a + both} + ${both + b}) would count the ${both} children in the middle twice.`, `So, ${a + both + b} children were asked.`)};
    return { skills: ["ABSTRACT", "DATA"], d, ctx, figure, ask: `How many children did NOT choose ${Rt}?`, say: `____ children did not choose ${Rt}.`, answer: a + out, wrong: near(c.r, a + out, [a, out, a + both + out, b + out]), solution: sol(`Children who did NOT choose ${Rt} are everyone outside the ${Rt} circle:`, [`Only ${L}: ${a}`, `Neither: ${out}`], `Total = ${a} + ${out} = ${a + out}.`, `So, ${a + out} children did not choose ${Rt}.`)};
  },
};

export const ABSTRACT_ENGINES = [notNeeded, pickModel, readPicture, sortRule, gridRef, shapeFeatures, vennRead];
void plural;
