// Renders the "Learn it" theory pages for the Classes 3–8 help books, one PDF per chapter, in the books' style.
// Usage: NODE_PATH=$(npm root -g) npx tsx scripts/theory-pages.ts <outDir> [class...]
// The PDFs are merged into the help books by docs/helpbooks/merge_helpbook.py.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { THEORY, type Concept } from "../prisma/content/theory";
import { CURRICULUM } from "../src/lib/constants";
import { figureSvg } from "../src/lib/figureImage";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { chromium } = require("playwright");

const out = process.argv[2];
const classes = process.argv.slice(3).map(Number).filter(Boolean);
if (!out) throw new Error("Usage: theory-pages.ts <outDir> [class...]");
fs.mkdirSync(out, { recursive: true });

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const md = (s: string) => esc(s).replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");
const ACCENTS = ["#4f46e5", "#f97316", "#22c55e", "#ec4899"];

function figHtml(c: Concept) {
  if (!c.fig) return { html: "", wide: false };
  const { svg, w } = figureSvg(c.fig);
  const width = Math.min(w * 1.15, 470);
  return { html: `<div class="fig" style="width:${width}px">${svg.replace(/^<svg /, '<svg style="width:100%;height:auto;display:block" ')}</div>`, wide: width > 250 };
}

function conceptHtml(c: Concept, i: number) {
  const f = figHtml(c);
  const body = [
    `<p>${md(c.text)}</p>`,
    c.points ? `<ul>${c.points.map((p) => `<li>${md(p)}</li>`).join("")}</ul>` : "",
    c.table ? `<table>${c.table.map((r, ri) => `<tr>${r.map((cell) => (ri === 0 ? `<th>${md(cell)}</th>` : `<td>${md(cell)}</td>`)).join("")}</tr>`).join("")}</table>` : "",
  ].join("");
  const ex = c.example
    ? `<div class="example"><div class="label">Worked example</div><p class="q">${md(c.example.q)}</p><ol>${c.example.steps.map((s) => `<li>${md(s)}</li>`).join("")}</ol><div class="ans">✓ ${md(c.example.answer)}</div></div>`
    : "";
  const rem = c.remember ? `<div class="remember"><b>⭐ Remember:</b> ${md(c.remember)}</div>` : "";
  const layout = f.html && !f.wide ? `<div class="split"><div>${body}</div>${f.html}</div>` : `${body}${f.html ? `<div class="figrow">${f.html}</div>` : ""}`;
  return `<section class="card" style="--accent:${ACCENTS[i % ACCENTS.length]}"><h2><span class="num">${i + 1}</span>${md(c.title)}</h2>${layout}${ex}${rem}</section>`;
}

function chapterHtml(cls: number, n: number, title: string) {
  const t = THEORY[`${cls}-CT-${n}`];
  const kid = cls === 3;
  const fonts = kid
    ? `<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet">`
    : `<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">`;
  const head = kid ? "'Fredoka', 'Nunito', sans-serif" : "'Inter', sans-serif";
  const bodyFont = kid ? "'Nunito', sans-serif" : "'Inter', sans-serif";
  const size = kid ? 13.5 : 12.5;
  return `<!doctype html><html><head><meta charset="utf-8">${fonts}<style>
  @page { size: A4; margin: 34pt 0 46pt 0; }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 0 50px; font-family: ${bodyFont}; font-size: ${size}px; line-height: 1.5; color: #1f2340; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .band { display: flex; gap: 18px; align-items: center; background: #eef0ff; border-radius: 16px; padding: 18px 22px; margin-bottom: 16px; }
  .chip { background: #4f46e5; color: #fff; border-radius: 12px; min-width: 66px; padding: 8px 10px; text-align: center; font-family: ${head}; }
  .chip small { display: block; font-size: 10px; font-weight: 700; opacity: .9; letter-spacing: .04em; }
  .chip b { display: block; font-size: 28px; line-height: 1.05; }
  .kicker { font-family: ${head}; font-weight: 700; font-size: 11px; letter-spacing: .14em; color: #f97316; text-transform: uppercase; }
  h1 { font-family: ${head}; font-weight: ${kid ? 700 : 800}; font-size: 25px; margin: 2px 0 4px; color: #26237a; }
  .intro { margin: 0; color: #3b3f5c; }
  .card { background: #f8fafc; border: 1px solid #e2e8f0; border-left: 5px solid var(--accent); border-radius: 12px; padding: 12px 16px 12px; margin: 0 0 12px; }
  h2 { font-family: ${head}; font-weight: ${kid ? 700 : 700}; font-size: 17px; margin: 0 0 6px; color: #1f2340; display: flex; align-items: center; gap: 8px; }
  .num { display: inline-flex; width: 22px; height: 22px; border-radius: 50%; background: var(--accent); color: #fff; font-size: 12px; align-items: center; justify-content: center; flex-shrink: 0; }
  h2 { break-after: avoid; }
  .fig, table, .example, .remember, .split { break-inside: avoid; }
  p { margin: 0 0 6px; orphans: 3; widows: 3; }
  ul { margin: 2px 0 6px 18px; padding: 0; } li { margin: 1px 0; }
  .split { display: grid; grid-template-columns: 1fr auto; gap: 14px; align-items: start; }
  .figrow { display: flex; justify-content: center; margin: 6px 0 4px; }
  .fig { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 6px; }
  table { border-collapse: collapse; margin: 6px 0 6px; font-size: ${size - 1}px; }
  th, td { border: 1px solid #cbd5e1; padding: 3px 9px; text-align: left; }
  th { background: #e0e7ff; color: #26237a; font-weight: 700; }
  .example { background: #ecfdf5; border: 1px solid #bbf7d0; border-radius: 10px; padding: 8px 12px; margin-top: 8px; }
  .example .label { font-family: ${head}; font-weight: 700; color: #15803d; font-size: 12px; text-transform: uppercase; letter-spacing: .08em; }
  .example .q { font-weight: 700; margin: 2px 0 2px; }
  .example ol { margin: 0 0 4px 18px; padding: 0; }
  .ans { display: inline-block; background: #16a34a; color: #fff; font-weight: 700; border-radius: 999px; padding: 2px 12px; }
  .remember { background: #fff7ed; border: 1px solid #fed7aa; border-radius: 10px; padding: 6px 12px; margin-top: 8px; }
  .tip { break-inside: avoid; break-before: avoid; background: #4f46e5; color: #fff; border-radius: 12px; padding: 10px 16px; margin-top: 4px; }
  .tip b { font-family: ${head}; }
  </style></head><body>
  <div class="band"><div class="chip"><small>CHAPTER</small><b>${n}</b></div><div><div class="kicker">Learn it · before the questions</div><h1>${esc(title)}</h1><p class="intro">${md(t.intro)}</p></div></div>
  ${t.concepts.map(conceptHtml).join("")}
  <div class="tip"><b>💡 Thinking tip:</b> ${md(t.tip)}</div>
  </body></html>`;
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const summary: Record<string, number> = {};
  for (const cls of classes.length ? classes : [3, 4, 5]) {
    const titles = CURRICULUM[cls].CT;
    for (const [i, title] of titles.entries()) {
      const n = i + 1;
      await page.setContent(chapterHtml(cls, n, title), { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      const file = path.join(out, `c${cls}-ch${String(n).padStart(2, "0")}.pdf`);
      const pageCount = () => Number(/Pages:\s+(\d+)/.exec(execFileSync("pdfinfo", [file]).toString())![1]);
      const lastPageWords = (p: number) => execFileSync("pdftotext", ["-f", String(p), "-l", String(p), file, "-"]).toString().split(/\s+/).filter(Boolean).length;
      // If only a few lines spill onto an extra page, shrink slightly (not below 86%) to keep the chapter tidy.
      let pages = 0;
      for (const scale of [1, 0.95, 0.9, 0.86]) {
        await page.pdf({ path: file, format: "A4", printBackground: true, preferCSSPageSize: true, scale });
        pages = pageCount();
        if (pages === 1 || lastPageWords(pages) >= 70) break;
      }
      if (pages > 1 && lastPageWords(pages) < 70) await page.pdf({ path: file, format: "A4", printBackground: true, preferCSSPageSize: true });
      summary[`${cls}-${n}`] = pageCount();
    }
  }
  fs.writeFileSync(path.join(out, "pages.json"), JSON.stringify(summary, null, 1));
  console.log(summary);
  await browser.close();
})();
