// Renders the "More practice" pages for the new help-book edition (Classes 3–8): 20 extra questions per chapter,
// made for the books by prisma/content/gen/v3/book.ts and stored in the bank (sourceRef "… · More practice Qn",
// independently re-solved by scripts/verify-v3.ts), rendered in the books' style,
// plus an answer key page for each chapter. Run after seeding:
//   NODE_PATH=$(npm root -g) npx tsx scripts/practice-pages.ts <outDir> [class...]
// The PDFs are merged into the books by docs/helpbooks/merge_helpbook.py.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";
import { CURRICULUM, SKILLS } from "../src/lib/constants";
import { figureSvg } from "../src/lib/figureImage";
import type { Fig } from "../src/lib/figures";
import EMOJI from "../src/lib/emojiImages.json";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { chromium } = require("playwright");

export const PER_CHAPTER = 20;

const out = process.argv[2];
const classes = process.argv.slice(3).map(Number).filter(Boolean);
if (!out) throw new Error("Usage: practice-pages.ts <outDir> [class...]");
fs.mkdirSync(out, { recursive: true });
const db = new PrismaClient();

type Q = { code: string; stem: string; type: string; difficulty: number; skills: string[]; options: string[]; answer: unknown; solution: string; figure: Fig | null; optionFigures: (Fig | null)[] | null; family: string };


// ---------- HTML ----------
const EMO = EMOJI as Record<string, string>;
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const emoji = (s: string) => s.replace(/\p{Extended_Pictographic}️?/gu, (e) => { const img = EMO[e] ?? EMO[e.replace(/️/g, "")]; return img ? `<img class="emo" src="data:image/png;base64,${img}">` : e; });
const md = (s: string) => emoji(esc(s).replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>").replace(/`([^`]+)`/g, "<code>$1</code>").replace(/____/g, '<span class="blank"></span>'));
const svg = (f: Fig, max: number) => { const { svg: s, w } = figureSvg(f); return `<div class="fig" style="width:${Math.min(w, max)}px">${s.replace(/^<svg /, '<svg style="width:100%;height:auto;display:block" ')}</div>`; };
const letter = (i: number) => String.fromCharCode(97 + i);

function questionHtml(q: Q, n: number) {
  const parts = q.stem.split("\n\n");
  const lead = parts.slice(0, -1).map((p) => `<p>${md(p).replace(/\n/g, "<br>")}</p>`).join("");
  let ask = parts[parts.length - 1];
  let tail = "";
  if (q.type === "TRUE_FALSE") { ask = ask.replace(/^True or false\?\s*/, ""); tail = `<div class="tf"><span class="box"></span> True <span class="box"></span> False</div>`; }
  if (q.type === "FILL_BLANK") ask = ask.replace(/^Fill in the blank:\s*/, "");
  if (q.type === "NUMERIC") tail = `<div class="line">Answer: <span class="blank long"></span></div>`;
  const kind = q.type === "TRUE_FALSE" ? "True or false?" : q.type === "FILL_BLANK" ? "Fill in the blank." : q.type === "NUMERIC" ? "Write the number." : "";
  let opts = "";
  if (q.type === "MCQ") {
    opts = q.optionFigures?.some(Boolean)
      ? `<div class="ofigs">${q.options.map((o, i) => `<div class="ofig"><span class="badge">${letter(i)}</span>${q.optionFigures![i] ? svg(q.optionFigures![i]!, 110) : md(o)}</div>`).join("")}</div>`
      : `<div class="opts ${q.options.some((o) => o.length > 34) ? "one" : ""}">${q.options.map((o, i) => `<div><span class="badge">${letter(i)}</span>${md(o)}</div>`).join("")}</div>`;
  }
  const fig = q.figure ? `<div class="figrow">${svg(q.figure, 330)}</div>` : "";
  return `<section class="q"><div class="qhead"><span class="qn">${n}</span><span class="tags">${SKILLS[q.skills[0] as keyof typeof SKILLS]}</span></div>
  <div class="body">${lead}${fig}<p class="ask">${kind ? `<i>${kind}</i> ` : ""}${md(ask)}</p>${opts}${tail}</div></section>`;
}

function answerText(q: Q) {
  if (q.type === "MCQ") return `${letter(Number(q.answer))}`;
  if (q.type === "TRUE_FALSE") return q.answer ? "True" : "False";
  if (q.type === "FILL_BLANK") return esc(String((q.answer as string[])[0]));
  return esc(String(q.answer));
}

function style(cls: number) {
  const kid = cls === 3;
  const head = kid ? "'Fredoka', 'Nunito', sans-serif" : "'Inter', sans-serif";
  const fonts = kid ? `<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet">` : `<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">`;
  const size = kid ? 13 : 12;
  return `<meta charset="utf-8">${fonts}<style>
  @page { size: A4; margin: 34pt 0 46pt 0; }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 0 50px; font-family: ${kid ? "'Nunito', sans-serif" : "'Inter', sans-serif"}; font-size: ${size}px; line-height: 1.45; color: #1f2340; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .band { display: flex; gap: 18px; align-items: center; background: #fff4e6; border-radius: 16px; padding: 16px 20px; margin-bottom: 12px; }
  .chip { background: #f97316; color: #fff; border-radius: 12px; min-width: 66px; padding: 8px 10px; text-align: center; font-family: ${head}; }
  .chip small { display: block; font-size: 10px; font-weight: 700; letter-spacing: .04em; } .chip b { display: block; font-size: 28px; line-height: 1.05; }
  .kicker { font-family: ${head}; font-weight: 700; font-size: 11px; letter-spacing: .14em; color: #4f46e5; text-transform: uppercase; }
  h1 { font-family: ${head}; font-weight: 800; font-size: 23px; margin: 2px 0 4px; color: #26237a; }
  .intro { margin: 0; color: #3b3f5c; font-size: ${size - 0.5}px; }
  .q { border: 1px solid #e2e8f0; border-radius: 12px; padding: 9px 14px 10px; margin: 0 0 9px; break-inside: avoid; background: #fff; }
  .qhead { display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px; }
  .qn { display: inline-flex; min-width: 26px; height: 26px; padding: 0 6px; border-radius: 13px; background: #4f46e5; color: #fff; font-weight: 800; align-items: center; justify-content: center; font-family: ${head}; }
  .tags { font-size: 10px; font-weight: 700; color: #64748b; letter-spacing: .02em; }
  p { margin: 0 0 4px; } .ask { font-weight: 600; margin-top: 4px; } .ask i { color: #f97316; font-style: normal; font-weight: 800; }
  .figrow { display: flex; justify-content: center; margin: 5px 0; } .fig { background: #fff; }
  .opts { display: grid; grid-template-columns: 1fr 1fr; gap: 3px 18px; margin-top: 4px; } .opts.one { grid-template-columns: 1fr; }
  .opts div, .ofig { display: flex; gap: 7px; align-items: flex-start; }
  .ofigs { display: flex; gap: 14px; flex-wrap: wrap; margin-top: 4px; }
  .badge { display: inline-flex; width: 18px; height: 18px; border-radius: 50%; background: #e0e7ff; color: #26237a; font-weight: 800; font-size: 11px; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; }
  .blank { display: inline-block; width: 70px; border-bottom: 1.5px solid #1f2340; margin: 0 3px; height: 1em; vertical-align: baseline; } .blank.long { width: 140px; }
  .tf, .line { margin-top: 5px; font-weight: 700; } .box { display: inline-block; width: 13px; height: 13px; border: 1.5px solid #1f2340; border-radius: 3px; margin: 0 4px -2px 14px; } .tf .box:first-child { margin-left: 0; }
  .emo { height: 1.15em; vertical-align: -0.2em; } code { font-family: ui-monospace, monospace; background: #f1f5f9; padding: 0 3px; border-radius: 3px; }
  table { border-collapse: collapse; width: 100%; font-size: ${size - 1.5}px; } th, td { border-bottom: 1px solid #e2e8f0; padding: 4px 6px; text-align: left; vertical-align: top; }
  th { color: #26237a; font-weight: 800; border-bottom: 2px solid #c7d2fe; } td.n { font-weight: 800; width: 26px; } td.a { font-weight: 800; color: #f97316; width: 74px; } tr { break-inside: avoid; }
  </style>`;
}

function practiceHtml(cls: number, n: number, title: string, qs: Q[], part: "CT" | "AI") {
  return `<!doctype html><html><head>${style(cls)}</head><body>
  <div class="band"><div class="chip"><small>${part === "AI" ? "AI CHAPTER" : "CHAPTER"}</small><b>${n}</b></div><div><div class="kicker">${part === "AI" ? "Practice" : "More practice"}</div><h1>${esc(title)}</h1></div></div>
  ${qs.map((q, i) => questionHtml(q, i + 1)).join("")}</body></html>`;
}

function answersHtml(cls: number, n: number, title: string, qs: Q[], part: "CT" | "AI") {
  return `<!doctype html><html><head>${style(cls)}</head><body>
  <div class="band"><div class="chip"><small>${part === "AI" ? "AI CHAPTER" : "CHAPTER"}</small><b>${n}</b></div><div><div class="kicker">Answer key · ${part === "AI" ? "Practice" : "More practice"}</div><h1>${esc(title)}</h1></div></div>
  <table><tr><th>Q</th><th>Answer</th><th>Solution</th></tr>${qs.map((q, i) => `<tr><td class="n">${i + 1}</td><td class="a">${answerText(q)}</td><td>${md(q.solution.replace(/\n+/g, " "))}</td></tr>`).join("")}</table></body></html>`;
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const summary: Record<string, unknown> = {};
  const chosen: Record<string, string[]> = {};
  for (const cls of classes.length ? classes : [3, 4, 5, 6, 7, 8]) {
    const list = [...CURRICULUM[cls].CT.map((title, i) => ({ part: "CT" as const, n: i + 1, title })), ...(CURRICULUM[cls].AI ?? []).map((title, i) => ({ part: "AI" as const, n: i + 1, title }))];
    for (const { part, n, title } of list) {
      const label = part === "AI" ? `AI Chapter ${n} · Practice Q` : `Chapter ${n} · More practice Q`;
      const rows = (await db.question.findMany({ where: { classLevel: cls, status: "PUBLISHED", sourceRef: { contains: `Class ${cls} · ${label}` } } }))
        .sort((x, y) => Number(x.sourceRef!.split("Q").pop()) - Number(y.sourceRef!.split("Q").pop()));
      const cands: Q[] = rows.map((r) => ({ code: r.code, stem: r.stem, type: r.type, difficulty: r.difficulty, skills: r.skills.split(","), options: JSON.parse(r.options), answer: JSON.parse(r.answer), solution: r.solution, figure: r.figure ? JSON.parse(r.figure) : null, optionFigures: r.optionFigures ? JSON.parse(r.optionFigures) : null, family: r.family! }));
      const qs = cands;
      if (qs.length !== PER_CHAPTER) throw new Error(`Class ${cls} ${part} chapter ${n}: only ${qs.length} questions`);
      chosen[`${cls}-${part}-${n}`] = qs.map((q) => q.code);
      const tag = `c${cls}-${part === "AI" ? "ai" : "ch"}${String(n).padStart(2, "0")}`;
      const pages: Record<string, number> = {};
      for (const [kind, html] of [["practice", practiceHtml(cls, n, title, qs, part)], ["answers", answersHtml(cls, n, title, qs, part)]] as const) {
        await page.setContent(html, { waitUntil: "networkidle" });
        await page.evaluate(() => document.fonts.ready);
        const file = path.join(out, `${tag}-${kind}.pdf`);
        await page.pdf({ path: file, format: "A4", printBackground: true, preferCSSPageSize: true });
        pages[kind] = Number(/Pages:\s+(\d+)/.exec(execFileSync("pdfinfo", [file]).toString())![1]);
      }
      const count = (f: (q: Q) => string | number | boolean) => qs.reduce<Record<string, number>>((m, q) => { const k = String(f(q)); m[k] = (m[k] ?? 0) + 1; return m; }, {});
      summary[`${cls}-${part}-${n}`] = { ...pages, d: count((q) => q.difficulty), skill: count((q) => q.skills[0]), type: count((q) => q.type), pics: qs.filter((q) => q.figure || q.optionFigures).length };
    }
  }
  // Opening page of the Artificial Intelligence part (Classes 6–8).
  for (const cls of (classes.length ? classes : [3, 4, 5, 6, 7, 8]).filter((c) => CURRICULUM[c].AI)) {
    const ai = CURRICULUM[cls].AI!;
    await page.setContent(`<!doctype html><html><head>${style(cls)}<style>
      .part { margin-top: 120px; text-align: center; } .part .kicker { font-size: 13px; } .part h1 { font-size: 40px; margin: 8px 0 10px; }
      .part p { max-width: 430px; margin: 0 auto 28px; color: #3b3f5c; font-size: 13px; }
      .list { max-width: 440px; margin: 0 auto; text-align: left; } .row { display: flex; gap: 14px; align-items: center; padding: 10px 14px; border-radius: 12px; background: #eef0ff; margin-bottom: 10px; font-weight: 700; }
      .row .chip { min-width: 58px; padding: 6px 8px; } .row .chip b { font-size: 20px; }
    </style></head><body><div class="part"><div class="kicker">Part 2</div><h1>Artificial Intelligence</h1>
      <p>Learn how machines learn from data, where AI is used, and how to use it fairly and safely. Each chapter has a Learn it section, practice questions and an answer key.</p>
      <div class="list">${ai.map((t, i) => `<div class="row"><div class="chip"><small>AI CHAPTER</small><b>${i + 1}</b></div><div>${esc(t)}</div></div>`).join("")}</div></div></body></html>`, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await page.pdf({ path: path.join(out, `c${cls}-ai-part.pdf`), format: "A4", printBackground: true, preferCSSPageSize: true });
  }
  fs.writeFileSync(path.join(out, "practice.json"), JSON.stringify({ summary, chosen }, null, 1));
  console.log(JSON.stringify(summary));
  await browser.close();
  await db.$disconnect();
})();
