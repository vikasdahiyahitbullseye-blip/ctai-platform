// Decomposition engines: break a problem into parts, solve each part, combine.
import type { Colour, Fig } from "../../../../src/lib/figures";
import { perimeter } from "../../../../src/lib/figures";
import { type Engine, type Thing, int, pick, sample, fmt, NAMES, near, rupees, withUnit, hm, timeAccept, dur, cap } from "./core";

const has = (tags: string[], ...t: string[]) => t.some((x) => tags.includes(x));
const priced = (items: Thing[]) => items.filter((t) => t.price[1] > 0);

// ---------- Shopping / counting in parts ----------
export const totalParts: Engine = {
  id: "v3-total-parts", skill: "DECOMPOSITION", tags: ["any"], part: "CT", pic: "maybe",
  make(c, d, pic) {
    const who = pick(c.r, NAMES);
    const shop = priced(c.theme.items);
    if (has(c.theme.tags, "money") && shop.length >= 3) {
      const n = d === 3 ? 3 : 2;
      const ts = sample(c.r, shop, n), qs = ts.map(() => int(c.r, d === 1 ? 1 : 2, d === 1 ? 4 : 5)), ps = ts.map((t) => int(c.r, t.price[0], t.price[1]));
      const total = qs.reduce((s, q, i) => s + q * ps[i], 0);
      const list = ts.map((t, i) => `${/^[aeiou]/.test(t.one) ? "an" : "a"} ${t.one} costs ₹${ps[i]}`).join(", ").replace(/, ([^,]*)$/, " and $1");
      const showPic = pic && qs.reduce((a, b) => a + b, 0) <= 12;
      const figure: Fig | undefined = showPic ? { kind: "icons", items: ts.flatMap((t, i) => Array.from({ length: qs[i] }, () => ({ icon: t.icon }))), cols: 6, alt: `Items bought: ${ts.map((t, i) => `${qs[i]} ${t.many}`).join(", ")}` } : undefined;
      const bought = showPic ? `The picture shows everything ${who} buys` : `${who} buys ${ts.map((t, i) => `${qs[i]} ${qs[i] === 1 ? t.one : t.many}`).join(", ").replace(/, ([^,]*)$/, " and $1")}`;
      const parts = ts.map((t, i) => `${qs[i]} × ₹${ps[i]} = ₹${qs[i] * ps[i]}`).join("; ");
      if (d < 3) return { skills: ["DECOMPOSITION"], d, ctx: `${cap(c.theme.place)}, ${list}. ${bought}.`, figure, ask: `How much does ${who} pay in all?`, say: `${who} pays ₹____ in all.`, answer: total, wrong: near(c.r, total, [ps.reduce((a, b) => a + b, 0) * qs[0], total + ps[0], total - ps[1], qs.reduce((a, b) => a + b, 0) * ps[0]]), show: rupees, unitNote: "in rupees", accept: [`₹${total}`, `rs ${total}`], solution: `Find the cost of each kind, then add: ${parts}. Total = ₹${total}.`, hint: "Work out each kind of item separately." };
      const note = [100, 200, 500, 1000, 1500, 2000].find((x) => x > total)!;
      const paid = note <= 500 ? `a ₹${note} note` : `${note / 500} notes of ₹500`;
      return { skills: ["DECOMPOSITION", "ALGORITHMIC"], d, ctx: `${cap(c.theme.place)}, ${list}. ${bought}. ${who} pays with ${paid}${note > 500 ? ` (₹${note} in all)` : ""}.`, figure, ask: `How much money does ${who} get back?`, say: `${who} gets ₹____ back.`, answer: note - total, wrong: near(c.r, note - total, [note - total + ps[2], note - total - ps[0], total, note - total + 10]), show: rupees, unitNote: "in rupees", accept: [`₹${note - total}`, `rs ${note - total}`], solution: `Cost of each kind: ${parts}. Total ₹${total}. ${who} paid ₹${note}, so the change is ₹${note} − ₹${total} = ₹${note - total}.` };
    }
    // counting groups
    const ts = sample(c.r, c.theme.items, d === 3 ? 3 : 2);
    const g = ts.map(() => int(c.r, 2, d === 1 ? 4 : 8)), each = ts.map(() => int(c.r, 2, d === 1 ? 5 : 12));
    const total = g.reduce((s, x, i) => s + x * each[i], 0);
    const desc = ts.map((t, i) => `${g[i]} groups of ${each[i]} ${t.many}`).join(", ").replace(/, ([^,]*)$/, " and $1");
    const extra = d === 3 ? int(c.r, 1, Math.max(1, g[0] * each[0] - 1)) : 0;
    const figure: Fig | undefined = pic && d === 1 && total <= 15 ? { kind: "icons", items: ts.flatMap((t, i) => Array.from({ length: g[i] * each[i] }, () => ({ icon: t.icon }))), cols: 5, alt: desc } : undefined;
    return { skills: ["DECOMPOSITION"], d, ctx: `${who} counts things ${c.theme.place}. There are ${desc}.${extra ? ` Then ${extra} of the ${ts[0].many} are taken away.` : ""}${figure ? " The picture shows them." : ""}`, figure, ask: `How many ${d === 3 ? "are left" : "are there"} in all?`, say: `There are ____ ${d === 3 ? "left" : "in all"}.`, answer: total - extra, wrong: near(c.r, total - extra, [g.reduce((a, b) => a + b, 0) * each[0], total, total - extra + each[0], g.reduce((a, b) => a + b, 0) + each.reduce((a, b) => a + b, 0)]), solution: `${ts.map((t, i) => `${g[i]} × ${each[i]} = ${g[i] * each[i]}`).join("; ")}. Total ${total}${extra ? `; ${total} − ${extra} = ${total - extra}` : ""}.` };
  },
};

// ---------- Area and perimeter of L-shapes ----------
export const areaSplit: Engine = {
  id: "v3-area-split", skill: "DECOMPOSITION", tags: ["area", "shape", "length"], part: "CT", pic: "always",
  make(c, d) {
    const n = 6;
    const w1 = int(c.r, 2, 5), h1 = int(c.r, 1, 3), w2 = int(c.r, 1, Math.min(3, w1)), h2 = int(c.r, 1, n - h1 - 1);
    const colour = pick(c.r, ["blue", "green", "orange", "purple", "teal"] as Colour[]);
    const cells: [number, number][] = [];
    for (let r = 0; r < h1; r++) for (let cc = 0; cc < w1; cc++) cells.push([r, cc]);
    const atRight = c.r() < 0.5;
    for (let r = h1; r < h1 + h2; r++) for (let cc = 0; cc < w2; cc++) cells.push([r, atRight ? w1 - w2 + cc : cc]);
    const figure: Fig = { kind: "pixels", n, cells: cells.map(([r, cc]) => [r, cc, colour] as [number, number, Colour]), alt: `A shape made of ${cells.length} squares` };
    const area = cells.length, per = perimeter(cells), who = pick(c.r, NAMES);
    const unit = c.cls <= 4 ? "squares" : "square units";
    const ctx = `${who} makes a shape with square tiles ${c.theme.place}, as shown. Each tile is 1 unit long on each side.`;
    if (d === 1) return { skills: ["DECOMPOSITION"], d, ctx, figure, ask: `How many tiles make the shape?`, say: `The shape is made of ____ tiles.`, answer: area, wrong: near(c.r, area, [w1 * (h1 + h2), area + 1, area - 1, w1 * h1]), solution: `Split it into two rectangles: ${w1} × ${h1} = ${w1 * h1} and ${w2} × ${h2} = ${w2 * h2}. Total ${area} tiles.` };
    if (d === 2) return { skills: ["DECOMPOSITION", "ABSTRACT"], d, ctx, figure, ask: `What is the perimeter of the shape (the distance all the way around)?`, say: `The perimeter of the shape is ____ units.`, answer: per, wrong: near(c.r, per, [2 * (w1 + h1 + h2), area, per + 2, per - 2]), show: withUnit("units"), unitNote: "in units", solution: `Walk around the outside edge and count the unit sides: ${per}. (The shape fits in a ${w1} by ${h1 + h2} box, whose perimeter is ${2 * (w1 + h1 + h2)}; ${per === 2 * (w1 + h1 + h2) ? "the notch does not change it" : "the notch adds extra sides"}.)` };
    const box = w1 * (h1 + h2);
    return { skills: ["DECOMPOSITION", "ABSTRACT"], d, ctx, figure, ask: `How many more tiles are needed to turn the shape into a full ${w1} by ${h1 + h2} rectangle?`, say: `To make a full ${w1} by ${h1 + h2} rectangle, ____ more tiles are needed.`, answer: box - area, wrong: near(c.r, box - area, [box, area, box - area + w2, (w1 - w2) * h1]), solution: `A ${w1} by ${h1 + h2} rectangle has ${box} tiles. The shape has ${w1 * h1} + ${w2 * h2} = ${area}. Needed: ${box} − ${area} = ${box - area}.` };
  },
};

// ---------- Area model for multiplication ----------
export const areaModel: Engine = {
  id: "v3-area-model", skill: "DECOMPOSITION", tags: ["mult", "algebra", "area", "number", "power"], part: "CT", pic: "always",
  make(c, d) {
    const big = c.cls >= 5;
    const a = d === 1 ? int(c.r, 12, big ? 49 : 29) : d === 2 ? int(c.r, big ? 112 : 102, big ? 489 : 199) : int(c.r, 13, 49);
    const b = d === 3 ? int(c.r, 12, 39) : int(c.r, 3, 9);
    if (a % 10 === 0 || (d === 2 && Math.floor(a / 10) % 10 === 0)) return null;
    const digits = String(a).split("").map(Number);
    const widths = digits.map((x, i) => x * 10 ** (digits.length - 1 - i)).filter((x) => x > 0);
    const figure: Fig = { kind: "areamodel", height: b, widths, labels: widths.map(String), hLabel: String(b), alt: `Area model: ${widths.join(" + ")} by ${b}` };
    const plainItems = c.theme.items.filter((x) => !/box|packet|bag|bottle|block|cup/.test(x.one));
    const prod = a * b, who = pick(c.r, NAMES), t = pick(c.r, plainItems.length ? plainItems : c.theme.items);
    const parts = widths.map((w) => `${w} × ${b} = ${fmt(w * b)}`).join(", ");
    return { skills: ["DECOMPOSITION"], d, ctx: `${who} has ${a} packets of ${t.many} ${c.theme.place}, with ${b} in each packet. To find the total, ${who} splits ${a} into ${widths.join(" + ")} and draws the area model shown.`, figure, ask: `How many ${t.many} are there in all?`, say: `There are ____ ${t.many} in all.`, answer: prod, wrong: near(c.r, prod, [widths.reduce((s, w) => s + w, 0) + b, widths[0] * b, prod + b, prod - (widths[widths.length - 1] * b) + widths[widths.length - 1]]), solution: `Multiply each part by ${b}: ${parts}. Add the parts: ${fmt(prod)}.`, hint: "Find each rectangle, then add them." };
  },
};

// ---------- Planning a schedule ----------
export const schedule: Engine = {
  id: "v3-schedule", skill: "DECOMPOSITION", tags: ["time", "calendar"], part: "CT", pic: "maybe",
  make(c, d, pic) {
    const who = pick(c.r, NAMES);
    const acts = sample(c.r, ["a puppet show", "lunch", "a craft stall", "a magic show", "a nature walk", "a quiz", "a dance", "a story session"], 3);
    const len = acts.map(() => int(c.r, 2, d === 1 ? 6 : 11) * 5), brk = d === 1 ? 0 : int(c.r, 1, 3) * 5;
    const h = int(c.r, 8, 11), m = pick(c.r, [0, 15, 30, 45]), t0 = h * 60 + m;
    const n = d === 1 ? 2 : 3;
    const used = len.slice(0, n).reduce((s, x) => s + x, 0) + brk * (n - 1);
    const figure: Fig | undefined = pic && d < 3 ? { kind: "clock", h, m, alt: `A clock showing ${hm(t0)}` } : undefined;
    const plan = acts.slice(0, n).map((a, i) => `${a} (${len[i]} minutes)`).join(", then ");
    if (d < 3) {
      const end = t0 + used;
      return { skills: ["DECOMPOSITION"], d, ctx: `${who} plans a day ${c.theme.place}: ${plan}${brk ? `, with a ${brk}-minute break between activities` : ""}. ${who} starts at ${figure ? "the time on the clock" : hm(t0)}.`, figure, ask: `At what time does ${who} finish?`, say: `${who} finishes at ____.`, answer: hm(end), wrong: [hm(end + 5), hm(end - brk * (n - 1) || end - 10), hm(end + 60), hm(end - 15)], show: String, accept: timeAccept(end), solution: `Total time = ${len.slice(0, n).join(" + ")}${brk ? ` + ${n - 1} × ${brk}` : ""} = ${used} minutes (${dur(used)}). ${hm(t0)} + ${dur(used)} = ${hm(end)}.` };
    }
    const end = t0 + used + 60;
    const start = end - used;
    return { skills: ["DECOMPOSITION", "ALGORITHMIC"], d, ctx: `${who} must finish ${plan} by ${hm(end)} ${c.theme.place}. There is a ${brk}-minute break between activities.`, ask: `What is the latest time ${who} can start?`, say: `The latest start time is ____.`, answer: hm(start), wrong: [hm(start + brk * (n - 1)), hm(start - 5), hm(start + 15), hm(end - len[0])], show: String, accept: timeAccept(start), solution: `Total time = ${len.slice(0, n).join(" + ")} + ${n - 1} × ${brk} = ${used} minutes. Work backwards: ${hm(end)} − ${dur(used)} = ${hm(start)}.`, hint: "Find the total time first, then go back from the finishing time." };
  },
};

// ---------- Grouping, packing and sharing ----------
export const groups: Engine = {
  id: "v3-groups", skill: "DECOMPOSITION", tags: ["div", "mult", "count", "fraction", "factor"], part: "CT", pic: "maybe",
  make(c, d, pic) {
    const t = pick(c.r, c.theme.items), who = pick(c.r, NAMES);
    if (d === 1) {
      const g = int(c.r, 2, 5), n = int(c.r, 7, 15), left = n % g;
      const figure: Fig | undefined = pic ? { kind: "icons", items: Array.from({ length: n }, () => ({ icon: t.icon })), cols: 5, alt: `${n} ${t.many}` } : undefined;
      return { skills: ["DECOMPOSITION"], d, ctx: `${who} puts ${t.many} into groups of ${g} ${c.theme.place}. ${figure ? "The picture shows all the" : `There are ${n}`} ${t.many}. ${who} makes as many full groups as possible.`, figure, ask: `How many ${t.many} are left over?`, say: `After making full groups, the number of ${t.many} left over is ____.`, answer: left, wrong: near(c.r, left, [Math.floor(n / g), g - left, left + 1, g]), solution: `${n} = ${Math.floor(n / g)} × ${g} + ${left}. ${Math.floor(n / g)} full groups are made and ${left} ${left === 1 ? "is" : "are"} left over.` };
    }
    const g = int(c.r, 4, 12), n = int(c.r, 30, c.cls <= 4 ? 99 : 400);
    if (d === 2) { const boxes = Math.ceil(n / g); if (n % g === 0) return null; return { skills: ["DECOMPOSITION"], d, ctx: `${who} packs ${n} ${t.many} ${c.theme.place}. Each box holds ${g} ${t.many}. Every ${t.one} must go in a box.`, ask: "How many boxes are needed?", say: "____ boxes are needed.", answer: boxes, wrong: near(c.r, boxes, [Math.floor(n / g), boxes + 1, n % g, Math.round(n / g)]), solution: `${n} ÷ ${g} = ${Math.floor(n / g)} remainder ${n % g}. ${Math.floor(n / g)} boxes are full, and one more box is needed for the last ${n % g}: ${boxes} boxes.`, hint: "What happens to the ones left over?" }; }
    const k = int(c.r, 3, 9), m = int(c.r, 2, 5), rest = n - k * m;
    if (rest <= 0 || rest % g === 0) return null;
    const boxes = Math.ceil(rest / g);
    return { skills: ["DECOMPOSITION", "ALGORITHMIC"], d, ctx: `${who} has ${n} ${t.many} ${c.theme.place}. First, ${k} helpers get ${m} each. The rest are packed in boxes of ${g}, and every ${t.one} must go in a box.`, ask: "How many boxes are needed?", say: "____ boxes are needed.", answer: boxes, wrong: near(c.r, boxes, [Math.ceil(n / g), Math.floor(rest / g), boxes + 1, Math.ceil((n - k - m) / g)]), solution: `Given to helpers: ${k} × ${m} = ${k * m}. Left: ${n} − ${k * m} = ${rest}. ${rest} ÷ ${g} = ${Math.floor(rest / g)} remainder ${rest % g}, so ${boxes} boxes.` };
  },
};

// ---------- Place value: regrouping ----------
const PLACES = [["lakhs", 100000], ["ten thousands", 10000], ["thousands", 1000], ["hundreds", 100], ["tens", 10], ["ones", 1]] as const;
export const regroup: Engine = {
  id: "v3-regroup", skill: "DECOMPOSITION", tags: ["number", "place"], part: "CT", pic: "never",
  make(c, d) {
    const top = c.cls <= 3 ? 3 : c.cls <= 4 ? 2 : c.cls <= 5 ? 1 : 0;
    const used = PLACES.slice(top + (d === 1 ? 1 : 0));
    const amt = used.map(([, v], i) => (i === 0 ? int(c.r, 1, 9) : d === 1 ? int(c.r, 0, 9) : int(c.r, 0, 9) + (c.r() < (d === 3 ? 0.6 : 0.3) && v > 1 ? 10 + int(c.r, 0, 9) : 0)));
    if (d > 1 && !amt.some((x) => x >= 10)) amt[used.length - 1] += 10;
    const value = used.reduce((s, [, v], i) => s + v * amt[i], 0);
    const who = pick(c.r, NAMES);
    const words = used.map(([n], i) => `${amt[i]} ${n}`).filter((_, i) => amt[i]).join(", ").replace(/, ([^,]*)$/, " and $1");
    const naive = Number(amt.map(String).join(""));
    return { skills: ["DECOMPOSITION"], d, ctx: `${who} plays a place-value game ${c.theme.place}. ${who}'s cards say: **${words}**.${d > 1 ? " Some places have 10 or more, so they must be regrouped." : ""}`, ask: "Which number do the cards make?", say: "The cards make the number ____.", answer: value, wrong: near(c.r, value, [naive, value + 100, value - 10, value + 1000].filter((x) => x !== value && x < 10 ** 8)), solution: `Find each part and add: ${used.map(([n, v], i) => (amt[i] ? `${amt[i]} ${n} = ${fmt(amt[i] * v)}` : "")).filter(Boolean).join("; ")}. Total ${fmt(value)}.`, hint: "Turn each card into a number, then add them." };
  },
};

// ---------- Counting rectangles and squares in a figure ----------
export const countShapes: Engine = {
  id: "v3-count-shapes", skill: "DECOMPOSITION", tags: ["shape", "count", "area", "pattern", "power"], part: "CT", pic: "always",
  make(c, d) {
    const who = pick(c.r, NAMES);
    if (d < 3) {
      const n = d === 1 ? 3 : int(c.r, 4, 6);
      const segs: [number, number, number, number][] = [[0, 35, 100, 35], [0, 65, 100, 65], ...Array.from({ length: n + 1 }, (_, i) => [i * (100 / n), 35, i * (100 / n), 65] as [number, number, number, number])];
      const figure: Fig = { kind: "lines", segs, colour: "blue", mono: true, alt: `A strip divided into ${n} equal boxes` };
      const ans = (n * (n + 1)) / 2;
      return { skills: ["DECOMPOSITION", "PATTERN"].slice(0, d), d, ctx: `${who} draws a long strip divided into ${n} boxes in a row ${c.theme.place}, as shown. A rectangle can be one box or several boxes next to each other.`, figure, ask: "How many rectangles of any size are there in the strip?", say: "There are ____ rectangles in the strip.", answer: ans, wrong: near(c.r, ans, [n, 2 * n, ans - 1, ans + n]), solution: `Count by size: ${Array.from({ length: n }, (_, i) => `${n - i} of length ${i + 1}`).join(", ")}. Total ${Array.from({ length: n }, (_, i) => n - i).join(" + ")} = ${ans}.`, hint: "Count the rectangles of each length separately." };
    }
    const k = int(c.r, 3, 4);
    const segs: [number, number, number, number][] = Array.from({ length: k + 1 }, (_, i) => [[i * (100 / k), 0, i * (100 / k), 100], [0, i * (100 / k), 100, i * (100 / k)]] as [number, number, number, number][]).flat();
    const figure: Fig = { kind: "lines", segs, colour: "purple", mono: true, alt: `A ${k} by ${k} grid of squares` };
    const ans = Array.from({ length: k }, (_, i) => (i + 1) ** 2).reduce((s, x) => s + x, 0);
    return { skills: ["DECOMPOSITION", "PATTERN"], d, ctx: `${who} draws a ${k} by ${k} grid ${c.theme.place}, as shown. Squares can be 1 by 1, 2 by 2, and so on.`, figure, ask: "How many squares of any size are there in the grid?", say: "There are ____ squares in the grid.", answer: ans, wrong: near(c.r, ans, [k * k, ans - 1, ans + k, k * k + 1]), solution: `Count by size: ${Array.from({ length: k }, (_, i) => `${(k - i) ** 2} of size ${i + 1} by ${i + 1}`).join(", ")}. Total ${ans}.` };
  },
};

// ---------- Angles: break a turn into parts ----------
export const angleParts: Engine = {
  id: "v3-angle-parts", skill: "DECOMPOSITION", tags: ["angle"], part: "CT", pic: "maybe",
  make(c, d, pic) {
    const who = pick(c.r, NAMES);
    if (d === 1) {
      const turns = Array.from({ length: int(c.r, 2, 4) }, () => pick(c.r, [90, 90, 180]));
      const tot = turns.reduce((a, b) => a + b, 0);
      const figure: Fig | undefined = pic ? { kind: "angle", deg: 90, colour: pick(c.r, ["red", "blue", "green"] as Colour[]), alt: "A right angle (a quarter turn)" } : undefined;
      return { skills: ["DECOMPOSITION"], d, ctx: `${who}'s robot ${c.theme.place} makes these turns, all to the right: ${turns.map((x) => (x === 90 ? "a quarter turn" : "a half turn")).join(", then ")}.${figure ? " The picture shows a quarter turn (90°)." : " A quarter turn is 90°."}`, figure, ask: "How many degrees does the robot turn in all?", say: "The robot turns ____ degrees in all.", answer: tot, wrong: near(c.r, tot, [tot - 90, tot + 90, turns.length * 90, 360]), show: (v) => `${v}°`, unitNote: "in degrees", solution: `Add the parts: ${turns.join("° + ")}° = ${tot}°.${tot >= 360 ? ` (That is ${Math.floor(tot / 360)} full turn${tot >= 720 ? "s" : ""}${tot % 360 ? ` and ${tot % 360}° more` : ""}.)` : ""}` };
    }
    if (d === 2) {
      const a = int(c.r, 3, 12) * 5, b = int(c.r, 3, 12) * 5, x = 180 - a - b;
      if (x <= 0) return null;
      return { skills: ["DECOMPOSITION", "ABSTRACT"], d, ctx: `${who} draws three angles side by side on a straight line ${c.theme.place}. Together they make a straight angle (180°). Two of the angles are ${a}° and ${b}°.`, ask: "What is the third angle?", say: "The third angle is ____ degrees.", answer: x, wrong: near(c.r, x, [180 - a, 360 - a - b, a + b, x + 10]), show: (v) => `${v}°`, unitNote: "in degrees", solution: `Angles on a straight line add up to 180°. ${a}° + ${b}° = ${a + b}°, so the third is 180° − ${a + b}° = ${x}°.` };
    }
    const parts = [int(c.r, 4, 20) * 5, int(c.r, 4, 20) * 5, int(c.r, 4, 20) * 5];
    const x = 360 - parts.reduce((s, v) => s + v, 0);
    if (x <= 0) return null;
    return { skills: ["DECOMPOSITION", "ABSTRACT"], d, ctx: `Four angles meet at a point in ${who}'s design ${c.theme.place}, filling a complete turn. Three of them are ${parts.join("°, ")}°.`, ask: "What is the fourth angle?", say: "The fourth angle is ____ degrees.", answer: x, wrong: near(c.r, x, [180 - parts[0], x + 15, 360 - parts[0] - parts[1], x - 10]), show: (v) => `${v}°`, unitNote: "in degrees", solution: `Angles around a point add up to 360°. ${parts.join(" + ")} = ${360 - x}, so the fourth is 360° − ${360 - x}° = ${x}°.` };
  },
};

export const DECOMP_ENGINES = [angleParts, totalParts, areaSplit, areaModel, schedule, groups, regroup, countShapes];
