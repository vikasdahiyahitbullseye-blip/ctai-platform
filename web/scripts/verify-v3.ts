// Independent check of the balanced-bank (v3) questions: every question is solved again from what the student
// sees — the figure data and the question text — with separate code, and compared with the stored answer key.
// Run after seeding: npx tsx scripts/verify-v3.ts   (exit code 1 on any mismatch)
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const N = (s: string) => Number(s.replace(/,/g, ""));
const nums = (s: string) => (s.replace(/(\d),(?=\d)/g, "$1").match(/-?\d+(\.\d+)?/g) ?? []).map(Number);
const clean = (v: unknown) => String(v).toLowerCase().replace(/[₹°%`*]/g, "").replace(/,/g, "").replace(/\s*(cm|ml|l|g|units|degrees|percentage points)$/, "").trim();
const ORD = (s: string) => Number(s.match(/(\d+)(?:st|nd|rd|th)/)?.[1]);
const hm = (m: number) => { const x = ((m % 720) + 720) % 720; const h = Math.floor(x / 60); return `${h === 0 ? 12 : h}:${String(x % 60).padStart(2, "0")}`; };
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const COMPASS = ["North", "East", "South", "West"];
const ICON_NAME: Record<string, string> = { "🏫": "school", "🌳": "tree", "🏠": "house", "⛲": "fountain", "🏪": "shop", "🏥": "hospital", "🐄": "cow", "🚉": "station", "🎡": "big wheel", "⛺": "tent", "🍎": "apple", "⭐": "star" };

type Q = { stem: string; type: string; options: string[]; answer: any; figure: any; family: string };
type Solver = (q: Q, ask: string) => string | number | null;
/** The part of the stem after the story: the question (MCQ/numeric), or the sentence (fill-in / true-false). */
const lastPara = (s: string) => s.split("\n\n").pop()!;

const S: Record<string, Solver> = {
  "v3-grow-dots": (q, a) => { const f = q.figure.frames.map((x: any) => x.count); const b = f[1] - f[0]; if (f[2] - f[1] !== b) return "BAD FIGURE"; const ex = a.match(/exactly (\d+) counters/); if (ex) return (N(ex[1]) - f[0]) / b + 1; const k = Number(a.match(/Step (\d+)/)![1]); return f[0] + (k - 1) * b; },
  "v3-grow-sticks": (q, a) => { const ex = a.match(/(?:exactly |With )(\d+) matchsticks/); if (ex) return (N(ex[1]) - 1) / 3; const k = Number(a.match(/(\d+) squares/)![1]); return 3 * k + 1; },
  "v3-beads": (q, a) => {
    const c: string[] = q.figure.colours; let L = 1; while (L < c.length && !c.every((x, i) => x === c[i % L])) L++;
    const cnt = a.match(/(\w+) beads (?:are there )?among the first (\d+)/);
    if (cnt) { const n = N(cnt[2]); let k = 0; for (let i = 0; i < n; i++) if (c[i % L] === cnt[1]) k++; return k; }
    const k = ORD(a); return c[(k - 1) % L];
  },
  "v3-calendar": (q, a) => {
    const m = q.figure.marks.map((x: any) => x.d), k = m[1] - m[0], all: number[] = []; for (let x = m[0]; x <= q.figure.days; x += k) all.push(x);
    if (/4th class/.test(a)) return all[3]; if (/classes in /.test(a) || /How many classes/.test(a)) return all.length;
    const last = all[all.length - 1]; return DAYS[(((q.figure.start + last - 1) % 7) + 6) % 7];
  },
  "v3-numgrid": (q, a) => {
    const m = q.figure.marks.map((x: any) => x.v), k = m[1] - m[0];
    if (/next/.test(a)) return m[2] + k;
    if (/from 1 to (\d+)|From 1 to (\d+)/.test(a)) { const top = Number(a.match(/1 to (\d+)/)![1]); return Math.floor((top - m[0]) / k) + 1; }
    return m[0] + (ORD(a) - 1) * k;
  },
  "v3-clock-seq": (q, a) => { const gap = Number(q.stem.match(/every (\d+) minutes/)![1]); return hm(q.figure.h * 60 + q.figure.m + (ORD(a) - 1) * gap); },
  "v3-shape-features": (q, a) => {
    const it: any[] = q.figure.items; const m = a.match(/neither (\w+)s nor (\w+)/); if (m) return it.filter((x) => x.shape !== m[1] && x.colour !== m[2]).length;
    const two = a.match(/(red|blue|green|yellow) (\w+)s/); if (two) return it.filter((x) => x.colour === two[1] && x.shape === two[2]).length;
    const one = a.match(/(triangle|circle|square|star|heart)s/)!; return it.filter((x) => x.shape === one[1]).length;
  },
  "v3-venn": (q, a) => { const f = q.figure, A = N(f.a), B = N(f.b), C = N(f.both), O = f.outside ? N(f.outside.split(": ")[1]) : 0; if (/NOT|not choose/.test(a)) return /did not choose (\w+)|NOT choose (\w+)/.test(a) && a.includes(f.right) ? A + O : B + O; if (/were asked/.test(a)) return A + B + C; return A + C; },
  "v3-area-split": (q, a) => {
    const cells: number[][] = q.figure.cells; const set = new Set(cells.map(([r, c]) => `${r},${c}`)); let per = 0;
    for (const [r, c] of cells) for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (!set.has(`${r + dr},${c + dc}`)) per++;
    if (/perimeter/.test(a)) return per; const full = a.match(/(\d+) by (\d+) rectangle/); if (full) return N(full[1]) * N(full[2]) - cells.length; return cells.length;
  },
  "v3-area-model": (q) => q.figure.widths.reduce((s: number, w: number) => s + w, 0) * q.figure.height,
  "v3-count-shapes": (q) => { const t = q.stem.match(/(\d) by (\d) grid/); if (t) { const k = Number(t[1]); let s = 0; for (let i = 1; i <= k; i++) s += i * i; return s; } const n = Number(q.stem.match(/into (\d) boxes/)![1]); return (n * (n + 1)) / 2; },
  "v3-grid-walk": (q) => {
    const kid = q.figure.items.find((x: any) => x.icon === "🧒"); let r = kid.r, c = kid.c;
    for (const [, n, dir] of q.stem.matchAll(/move (\d) (up|down|left|right)/g)) { const k = Number(n); if (dir === "up") r -= k; if (dir === "down") r += k; if (dir === "left") c -= k; if (dir === "right") c += k; }
    const hit = q.figure.items.find((x: any) => x.r === r && x.c === c && x.icon !== "🧒"); return hit ? ICON_NAME[hit.icon] : "NOTHING";
  },
  "v3-grid-ref": (q, a) => {
    const it: any[] = q.figure.items; const ref = (x: any) => `${String.fromCharCode(65 + x.c)}${x.r + 1}`.toLowerCase(); const byName = (n: string) => it.find((x) => ICON_NAME[x.icon] === n);
    const north = a.match(/due north of the ([\w ]+?)(?: \(| is)/); if (north) { const p = byName(north[1]); const o = it.filter((x) => x !== p && x.c === p.c && x.r < p.r); return o.length === 1 ? ICON_NAME[o[0].icon] : "AMBIGUOUS"; }
    const mv = q.stem.match(/starts at the ([\w ]+?) and moves (.*)\./); if (mv) { const p = byName(mv[1]); let r = p.r, c = p.c; for (const [, n, d] of mv[2].matchAll(/(\d) squares? (?:to the )?(right|left|down|up)/g)) { const k = Number(n); if (d === "right") c += k; if (d === "left") c -= k; if (d === "down") r += k; if (d === "up") r -= k; } return ref({ r, c }); }
    const nm = a.match(/the ([\w ]+?) (?:is in|in which)/i) ?? a.match(/is the ([\w ]+?)\?/) ?? a.match(/In which square is the ([\w ]+)\?/); const p = byName((nm ?? a.match(/The ([\w ]+?) is in square/))![1]); return ref(p);
  },
  "v3-read-picture": (q, a) => {
    const f = q.figure;
    if (f.kind === "money") { const tot = f.items.reduce((s: number, v: number) => s + v, 0); const cost = q.stem.match(/costs ₹(\d+)/); return cost ? N(cost[1]) - tot : tot; }
    if (f.kind === "ruler") { const goal = q.stem.match(/that is (\d+) cm long/); return goal ? N(goal[1]) - f.length : f.length; }
    if (f.kind === "jug") return /1 litre/.test(q.stem) ? 1000 - f.level : f.level;
    if (f.kind === "balance") return f.right.reduce((s: number, v: number) => s + v, 0) / f.left.n;
    if (f.kind === "pictograph") { const i = (l: string) => f.labels.indexOf(l); const more = a.match(/more .*?on (\w+) than on (\w+)/); if (more) return (f.counts[i(more[1])] - f.counts[i(more[2])]) * f.per; const d = a.match(/on (\w+)\?|on (\w+)\./)!; return f.counts[i(d[1] ?? d[2])] * f.per; }
    if (f.kind === "abacus") { const v = f.beads.reduce((s: number, b: number) => s * 10 + b, 0); const add = q.stem.match(/adds ([\d,]+) to it/); return add ? v + N(add[1]) : v; }
    if (f.kind === "fraction") { const g = (x: number, y: number): number => (y ? g(y, x % y) : x); if (/NOT given away|not given away/.test(a)) return `${f.parts - f.shaded}/${f.parts}`; if (/simplest/.test(a)) { const k = g(f.shaded, f.parts); return `${f.shaded / k}/${f.parts / k}`; } return `${f.shaded}/${f.parts}`; }
    return null;
  },
  "v3-total-parts": (q) => {
    const prices = Object.fromEntries([...q.stem.matchAll(/(?:an?|one) ([\w -]+?) costs ₹(\d+)/g)].map((m) => [m[1], N(m[2])]));
    if (Object.keys(prices).length) {
      let total = 0;
      if (q.figure) { /* counts come from the picture: match icons to items by order of the price list */ return null; }
      const buys = q.stem.match(/buys (.*?)\./)![1];
      for (const [, n, item] of buys.matchAll(/(\d+) ([\w -]+?)(?=,| and |$)/g)) { const key = Object.keys(prices).find((k) => item === k || item === `${k}s` || item === `${k}es` || item.replace(/ies$/, "y") === k || item.replace(/es$/, "") === k || item.replace(/s$/, "") === k || (k.includes(" of ") && item.replace(/^(\w+?)s of/, "$1 of") === k)); if (!key) return `UNPARSED ${item}`; total += N(n) * prices[key]; }
      const note = q.stem.match(/with a ₹(\d+) note|\(₹(\d+) in all\)/); return note ? N(note[1] ?? note[2]) - total : total;
    }
    let t = 0; for (const [, g, e] of q.stem.matchAll(/(\d+) groups of (\d+)/g)) t += N(g) * N(e); const away = q.stem.match(/Then (\d+) of the/); return away ? t - N(away[1]) : t;
  },
  "v3-jumps": (q) => { const start = q.figure.marks[0].v; const f = q.stem.match(/(\d+) times forward\*\*, (\d+) each/)!; const b = q.stem.match(/(\d+) times backward/); return start + N(f[1]) * N(f[2]) - (b ? N(b[1]) * N(f[2]) : 0); },
  "v3-turns": (q) => {
    let d = COMPASS.indexOf(q.stem.match(/facing \*\*(\w+)\*\*/)![1]);
    for (const m of q.stem.matchAll(/turn (\d+)° (right|left)|quarter turn (right|left)|half turn/g)) { const deg = m[1] ? N(m[1]) : m[3] ? 90 : 180; const side = m[2] ?? m[3] ?? "right"; d = (d + (side === "right" ? deg / 90 : 4 - deg / 90)) % 4; }
    return COMPASS[d];
  },
  "v3-clock-add": (q) => { let t = q.figure.h * 60 + q.figure.m; for (const m of q.stem.matchAll(/(?:(\d+) hours?)?\s*(?:(\d+) minutes)? pass/g)) t += (m[1] ? N(m[1]) * 60 : 0) + (m[2] ? N(m[2]) : 0); return hm(t); },
  "v3-data-bars": (q, a) => {
    const f = q.figure, v: number[] = f.values, i = (l: string) => f.labels.indexOf(l), tot = v.reduce((s, x) => s + x, 0);
    if (/total/.test(a) && !/percentage|%/.test(a)) return tot; const more = a.match(/(\w+) has ____ more than (\w+)|more does (\w+) have than (\w+)/); if (more) return v[i(more[1] ?? more[3])] - v[i(more[2] ?? more[4])];
    const pc = a.match(/(\w+) is ____%|percentage of the total is (\w+)/); if (pc) return (v[i(pc[1] ?? pc[2])] / tot) * 100; if (/range/.test(a)) return Math.max(...v) - Math.min(...v); return null;
  },
  "v3-bias-bars": (q, a) => { const v: number[] = q.figure.values; if (/collect/.test(a)) return Math.max(...v) - Math.min(...v); return q.figure.labels[v.indexOf(Math.min(...v))]; },
  "v3-fairness": (q, a) => {
    const f = q.figure, n = Number(f.title.match(/out of (\d+)/)[1]), acc = f.values.map((x: number) => (x / n) * 100), lo = acc[0] < acc[1] ? 0 : 1;
    if (/gap|different/.test(a)) return Math.abs(acc[0] - acc[1]); if (/accuracy/.test(a)) return acc[f.labels.indexOf(a.match(/For ([\w ]+), the accuracy|accuracy for ([\w ]+)\?/)!.slice(1).find(Boolean))]; return f.labels[lo];
  },
  "v3-accuracy-ticks": (q, a) => { const it: any[] = q.figure.items; const right = it.filter((x) => x.mark === "tick").length; return /wrong/.test(a) ? it.length - right : (right / it.length) * 100; },
  "v3-machine": (q) => {
    const ops = q.stem.match(/\*\*(.*?)\*\*/)![1].split(", then ");
    const f = (x: number, o: string) => { const k = N(o.match(/\d+/)?.[0] ?? "2"); return o.startsWith("double") ? 2 * x : o.startsWith("add") ? x + k : o.startsWith("subtract") ? x - k : x * k; };
    const g = (x: number, o: string) => { const k = N(o.match(/\d+/)?.[0] ?? "2"); return o.startsWith("double") ? x / 2 : o.startsWith("add") ? x - k : o.startsWith("subtract") ? x + k : x / k; };
    const out = q.stem.match(/\*\*(-?\d+)\*\* comes out/); if (out) return ops.reduceRight((x, o) => g(x, o), N(out[1]));
    return ops.reduce((x, o) => f(x, o), N(q.stem.match(/puts in the number (-?\d+)/)![1]));
  },
  "v3-repeat-until": (q) => { const start = N(q.stem.match(/starts with ₹?(\d+)/)![1]); const step = N(q.stem.match(/repeat\*\* adding (\d+)/)![1]); const goal = N(q.stem.match(/at least ₹?(\d+)/)![1]); return Math.ceil((goal - start) / step); },
  "v3-letter-code": (q) => {
    const A = "ABCDEFGHIJKLMNOPQRSTUVWXYZ", k = N(q.stem.match(/letter (\d+) place/)![1]); const sh = (w: string, s: number) => w.split("").map((c) => A[(A.indexOf(c) + s + 26) % 26]).join("");
    const enc = q.stem.match(/write \*\*([A-Z]+)\*\*|([A-Z]{3,}) is written as/); if (enc) return sh(enc[1] ?? enc[2], k); return sh(q.stem.match(/secret word .*?: \*\*([A-Z]+)\*\*/)![1], -k);
  },
  "v3-sort-pass": (q) => { const v = q.stem.match(/cards are: \*\*(.*?)\*\*/)![1].split(", ").map(Number); const passes = /two passes/.test(q.stem) ? 2 : 1; for (let p = 0; p < passes; p++) for (let i = 0; i < v.length - 1; i++) if (v[i] > v[i + 1]) [v[i], v[i + 1]] = [v[i + 1], v[i]]; return v.join(", "); },
  "v3-nearest": (q) => {
    const ex = [...q.stem.matchAll(/(\d+), (\d+) → (\w+)/g)].map((m) => [N(m[1]), N(m[2]), m[3]] as const); const nw = q.stem.match(/has [\w ()]+? (\d+) and [\w ()]+? (\d+)\./)!;
    const d = ex.map(([x, y]) => Math.abs(x - N(nw[1])) + Math.abs(y - N(nw[2]))); return ex[d.indexOf(Math.min(...d))][2];
  },
  "v3-ai-rules": (q, a) => {
    const r = q.stem.match(/If (.+?) is more than (\d+) \*\*(and|or)\*\* (.+?) is more than (\d+), the answer is ([A-Z ]+); otherwise it is ([A-Z ]+)\./)!;
    const dec = (x: number, y: number) => ((r[3] === "and" ? x > N(r[2]) && y > N(r[5]) : x > N(r[2]) || y > N(r[5])) ? r[6] : r[7]);
    const today = q.stem.match(/is \*\*(\d+)\*\* and the .* is \*\*(\d+)\*\*/); if (today) return dec(N(today[1]), N(today[2]));
    return [...q.stem.matchAll(/\((\d+), (\d+)\)/g)].filter((m) => dec(N(m[1]), N(m[2])) === r[6]).length;
  },
  "v3-regroup": (q) => { const P: Record<string, number> = { lakhs: 1e5, "ten thousands": 1e4, thousands: 1e3, hundreds: 100, tens: 10, ones: 1 }; let t = 0; for (const [, n, p] of q.stem.match(/\*\*(.*?)\*\*/)![1].matchAll(/(\d+) (lakhs|ten thousands|thousands|hundreds|tens|ones)/g)) t += N(n) * P[p]; return t; },
  "v3-angle-parts": (q) => { if (/straight line/.test(q.stem)) { const [a, b] = nums(q.stem.match(/are (\d+)° and (\d+)°/)![0]); return 180 - a - b; } if (/complete turn/.test(q.stem)) return 360 - nums(q.stem.match(/are ([\d°, ]+)\./)![1]).reduce((s, x) => s + x, 0); return [...q.stem.split("The picture")[0].matchAll(/a (quarter|half) turn/g)].reduce((s, m) => s + (m[1] === "quarter" ? 90 : 180), 0); },
  "v3-mean-data": (q, a) => { const v = nums(q.stem.match(/each day: ([\d, ]+)\./)![1]); const s = v.reduce((x, y) => x + y, 0); const t = a.match(/mean becomes (\d+)/); if (t) return N(t[1]) * (v.length + 1) - s; if (/range/.test(a)) return Math.max(...v) - Math.min(...v); return s / v.length; },
  "v3-train-split": (q, a) => { const [tot, pct] = [N(q.stem.match(/has (\d+)/)![1]), N(q.stem.match(/(\d+)%/)![1])]; const test = tot * (100 - pct) / 100; const acc = q.stem.match(/model is (\d+)% accurate/); return acc ? test * N(acc[1]) / 100 : test; },
  "v3-groups": (q) => {
    const help = q.stem.match(/has (\d+) .*?First, (\d+) helpers get (\d+) each\. The rest are packed in boxes of (\d+)/); if (help) return Math.ceil((N(help[1]) - N(help[2]) * N(help[3])) / N(help[4]));
    const pack = q.stem.match(/packs (\d+) .*? Each box holds (\d+)/); if (pack) return Math.ceil(N(pack[1]) / N(pack[2]));
    const g = N(q.stem.match(/groups of (\d+)/)![1]); const n = q.figure ? q.figure.items.length : N(q.stem.match(/There are (\d+)/)![1]); return n % g;
  },
  "v3-schedule": (q) => {
    const mins = [...q.stem.matchAll(/\((\d+) minutes\)/g)].map((m) => N(m[1])); const brk = q.stem.match(/a (\d+)-minute break/); const used = mins.reduce((s, x) => s + x, 0) + (brk ? N(brk[1]) * (mins.length - 1) : 0);
    const by = q.stem.match(/by (\d+):(\d+)/); if (by) return hm(N(by[1]) * 60 + N(by[2]) - used);
    const t0 = q.figure ? q.figure.h * 60 + q.figure.m : (() => { const m = q.stem.match(/starts at (\d+):(\d+)/)!; return N(m[1]) * 60 + N(m[2]); })(); return hm(t0 + used);
  },
  "v3-number-seq": (q, a) => {
    const t = nums(q.stem.match(/Day 1 to Day 4(?: are)?:? ([\d, ]+)/)![1]).slice(0, 4); const k = Number(a.match(/Day (\d+)/)![1]);
    const d1 = t.map((x, i) => (i ? x - t[i - 1] : 0)).slice(1);
    if (d1.every((x) => x === d1[0])) return t[0] + (k - 1) * d1[0];
    if (t.every((x, i) => !i || x === t[i - 1] * 2)) return t[0] * 2 ** (k - 1);
    const s = d1[1] - d1[0]; if (d1[2] - d1[1] !== s) return "NO RULE"; let v = t[0], step = d1[0]; for (let i = 1; i < k; i++) { v += step; step += s; } return v;
  },
  "v3-sort-rule": (q) => {
    const rule = q.stem.match(/rule for (?:the|\w+'s) box is: \*\*(.*?)\*\*/)![1]; const cards = nums(q.stem.match(/(?:in the box:|has the cards) ([\d, ]+)\./)![1]);
    const ds = (n: number) => String(n).split("").reduce((s, x) => s + Number(x), 0);
    const T: Record<string, (n: number) => boolean> = { "even numbers": (n) => n % 2 === 0, "multiples of 5": (n) => n % 5 === 0, "multiples of 3": (n) => n % 3 === 0, "multiples of 4": (n) => n % 4 === 0, "numbers with a digit sum of 9": (n) => ds(n) === 9, "multiples of 6": (n) => n % 6 === 0, "prime numbers": (n) => { if (n < 2) return false; for (let k = 2; k * k <= n; k++) if (n % k === 0) return false; return true; }, "square numbers": (n) => Number.isInteger(Math.sqrt(n)), "multiples of 9": (n) => n % 9 === 0 };
    const out = cards.filter((n) => !T[rule](n)); return out.length === 1 ? out[0] : `AMBIGUOUS ${out}`;
  },
  "v3-password": (q, a) => {
    const ok = (p: string) => p.length >= 10 && /[A-Z]/.test(p) && /[a-z]/.test(p) && /\d/.test(p) && /[^A-Za-z0-9]/.test(p);
    if (q.type === "TRUE_FALSE") return null; const good = q.options.map((o) => o.replace(/`/g, "")).filter(ok); return good.length === 1 ? `\`${good[0]}\`` : "AMBIGUOUS";
  },
  "v3-model": (q) => {
    const val = (e: string) => Function(`return (${e.replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-")})`)() as number;
    let want: number;
    const d1 = q.stem.match(/has (\d+) bags .*?Each bag has (\d+) .*?also has (\d+) more/); const d2 = q.stem.match(/buys (\d+) .*?Each costs ₹(\d+)\. .*?pays with a ₹(\d+) note/); const d3 = q.stem.match(/had (\d+) packets .*?with (\d+) in each packet\. (\d+) of them were used up\. The rest were shared equally among (\d+) friends, and each friend also got (\d+)/);
    if (d1) want = N(d1[1]) * N(d1[2]) + N(d1[3]); else if (d2) want = N(d2[3]) - N(d2[1]) * N(d2[2]); else if (d3) want = (N(d3[1]) * N(d3[2]) - N(d3[3])) / N(d4(d3)) + N(d3[5]); else return null;
    function d4(m: RegExpMatchArray) { return m[4]; }
    const right = q.options.filter((o) => Math.abs(val(o) - want) < 1e-9);
    return q.type === "TRUE_FALSE" ? null : right.length === 1 ? right[0] : `AMBIGUOUS ${right}`;
  },
};

async function main() {
  const qs = await db.question.findMany({ where: { family: { startsWith: "v3-" }, status: "PUBLISHED" } });
  let checked = 0, skipped = 0; const bad: string[] = []; const perFam: Record<string, [number, number]> = {};
  for (const r of qs) {
    const solver = S[r.family!]; const q: Q = { stem: r.stem, type: r.type, options: JSON.parse(r.options), answer: JSON.parse(r.answer), figure: r.figure ? JSON.parse(r.figure) : null, family: r.family! };
    if (!solver || r.type === "SHORT") { skipped++; continue; }
    let expected: string | number | null;
    try { expected = solver(q, lastPara(q.stem)); } catch (e) { bad.push(`${r.code} [${r.family}] solver failed: ${(e as Error).message}\n${r.stem}`); continue; }
    if (expected === null) { skipped++; continue; }
    const claimed = r.type === "MCQ" ? q.options[q.answer] : r.type === "NUMERIC" ? q.answer : r.type === "FILL_BLANK" ? q.answer[0] : null;
    let ok: boolean;
    if (r.type === "TRUE_FALSE") { const shown = [...q.stem.matchAll(/\*\*(.+?)\*\*/g)].pop()![1]; ok = (clean(shown) === clean(expected)) === q.answer; }
    else ok = clean(claimed) === clean(expected) || (typeof expected === "number" && Math.abs(Number(clean(claimed)) - expected) < 1e-9);
    const pf = (perFam[r.family!] ??= [0, 0]); pf[0]++; if (!ok) pf[1]++;
    checked++;
    if (!ok) bad.push(`${r.code} [${r.family}] ${r.type}: key ${JSON.stringify(r.type === "TRUE_FALSE" ? q.answer : claimed)} but re-solved ${JSON.stringify(expected)}\n${r.stem}`);
  }
  console.log(`Re-solved ${checked} questions independently (${skipped} without a solver, e.g. short answers and text-classification items).`);
  for (const [f, [n, b]] of Object.entries(perFam).sort()) console.log(`  ${f.padEnd(22)} ${String(n).padStart(5)} checked${b ? `, ${b} MISMATCH` : ""}`);
  if (bad.length) { console.log(`\n${bad.length} mismatches:`); for (const b of bad.slice(0, 25)) console.log(`\n${b}`); }
  await db.$disconnect();
  if (bad.length) process.exit(1);
}
main();
