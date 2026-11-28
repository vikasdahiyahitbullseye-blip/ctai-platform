// Renders the chapter pages of the CBSE edition of the help books (Classes 3–8). Each CT chapter gets
//   c<class>-ch<nn>-cbse.pdf      chapter opening + "CBSE Handbook questions" + "Help-book questions"
//   c<class>-ch<nn>-cbse-key.pdf  worked solutions for both, in the CBSE Teacher Handbook style
// The CBSE questions are every answered CT question of the CBSE handbook chapter (prisma/content/cbse); the help-book
// questions are the same number chosen by docs/helpbooks/cbse_edition_select.py (one closest match per CBSE question),
// stored in prisma/content/helpbook/cbse-edition.json. Chapter titles and descriptions come from chapter-heads.json.
//   NODE_PATH=$(npm root -g) npx tsx scripts/cbse-edition-pages.ts <outDir> [class...]
// The PDFs are merged into the books by docs/helpbooks/merge_helpbook.py with --cbse.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { CURRICULUM } from "../src/lib/constants";
import type { Fig } from "../src/lib/figures";
import { type Q, type Key, esc, md, letter, questionHtml, style, keyItem, SK } from "./lib/bookHtml";
import { HELPBOOK, workedSolution, workedFigures, solutionWithAnswer } from "../prisma/content/helpbook";
import { cbseQuestions } from "../prisma/content/cbse";
import { finishSolution } from "../prisma/content/solution";
import SELECTION from "../prisma/content/helpbook/cbse-edition.json";
import HEADS from "../prisma/content/helpbook/chapter-heads.json";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { chromium } = require("playwright");

const out = process.argv[2];
const classes = process.argv.slice(3).map(Number).filter(Boolean);
if (!out) throw new Error("Usage: cbse-edition-pages.ts <outDir> [class...]");
fs.mkdirSync(out, { recursive: true });

const SEL = SELECTION as Record<string, { cbse: number[]; hb: string[]; pairs: [number, string, number][] }>;
const HEAD = HEADS as Record<string, { title: string; desc: string }>;
const CBSE = cbseQuestions();
const img = (src: string, w: number, h: number, alt: string): Fig => ({ kind: "image", src, w, h, alt });
const pad = (n: number) => String(n).padStart(2, "0");

type Item = { q: Q; key: Key };

function cbseItems(cls: number, ch: number): Item[] {
  return SEL[`${cls}-${ch}`].cbse.map((seq) => {
    const r = CBSE.find((x) => x.code === `CBSE-${cls}-CT-${pad(ch)}-${pad(seq)}`);
    if (!r) throw new Error(`missing CBSE ${cls}-${ch}-${seq}`);
    const q: Q = { code: r.code, stem: r.stem, type: r.type, difficulty: r.difficulty, skills: r.skills, options: r.options, answer: r.answer, solution: r.solution, solutionFigures: r.solutionFigures ?? null, figure: r.figure, optionFigures: null, family: "" };
    const a = Number(r.answer);
    const key: Key = {
      label: "", answer: `${letter(a)}${r.options[a]?.trim() ? ` &nbsp;(${md(r.options[a])})` : ""}`,
      solution: finishSolution({ type: "MCQ", options: r.options, answer: a, solution: r.solution }), figs: r.solutionFigures ?? null, skills: r.skills,
    };
    return { q, key };
  });
}

function hbItems(cls: number, ch: number): Item[] {
  return SEL[`${cls}-${ch}`].hb.map((label) => {
    const r = HELPBOOK.find((x) => x.c === cls && x.ch === ch && x.label === label);
    if (!r) throw new Error(`missing help-book ${cls}-${ch}-${label}`);
    const q: Q = { code: `HB-${cls}-${ch}-${label}`, stem: r.stem, type: "MCQ", difficulty: r.d, skills: r.skills, options: r.options, answer: r.answer, solution: "", solutionFigures: null, figure: r.fig ? img(r.fig[0], r.fig[1], r.fig[2], "Question picture") : null, optionFigures: null, family: "" };
    const key: Key = {
      label: "", answer: `${letter(r.answer)}${r.options[r.answer] ? ` &nbsp;(${md(String(r.options[r.answer]))})` : ""}`,
      solution: finishSolution({ type: "MCQ", options: r.options, answer: r.answer, solution: workedSolution(r) ?? solutionWithAnswer(r) }), figs: workedFigures(r) ?? null, skills: r.skills,
    };
    return { q, key };
  });
}

const extra = (cls: number) => `<style>
  .chap { display: flex; gap: 22px; align-items: center; background: #4f46e5; border-radius: 18px; padding: 20px 24px; margin-bottom: 14px; color: #fff; }
  .chap .num { background: #fff; color: #4f46e5; border-radius: 14px; min-width: 76px; padding: 10px 8px; text-align: center; font-family: ${cls === 3 ? "'Fredoka', sans-serif" : "'Inter', sans-serif"}; }
  .chap .num small { display: block; font-size: 11px; font-weight: 700; } .chap .num b { display: block; font-size: 34px; line-height: 1; }
  .chap h1 { color: #fff; font-size: 27px; margin: 0 0 4px; } .chap p { margin: 0 0 7px; color: #eef0ff; }
  .pills span { display: inline-block; border: 1px solid #c7d2fe; background: rgba(255,255,255,.16); border-radius: 12px; padding: 2px 10px; margin: 0 5px 3px 0; font-size: 10.5px; font-weight: 700; }
  .sect { display: inline-block; background: #eef0ff; color: #4f46e5; border-radius: 14px; padding: 5px 14px; font-weight: 800; font-size: 15px; margin: 6px 0 4px; font-family: ${cls === 3 ? "'Fredoka', sans-serif" : "'Inter', sans-serif"}; }
  .sintro { margin: 0 0 9px; color: #3b3f5c; } .src { font-size: 9.5px; color: #64748b; font-weight: 600; margin-top: 3px; }
  .newsect { break-before: page; }
</style>`;

function questionsHtml(cls: number, ch: number, title: string, desc: string, cb: Item[], hb: Item[]) {
  const skills = [...new Set([...cb, ...hb].map((i) => i.q.skills[0]))].slice(0, 4).map(SK);
  const n = cb.length;
  return `<!doctype html><html><head>${style(cls)}${extra(cls)}</head><body>
  <div class="chap"><div class="num"><small>Chapter</small><b>${ch}</b></div><div><h1>${esc(title)}</h1><p>${esc(desc)}</p>
  <div class="pills">${skills.map((s) => `<span>${esc(s)}</span>`).join("")}<span>${2 * n} questions</span></div></div></div>
  <div class="sect">CBSE Handbook questions</div>
  <p class="sintro">The ${n} questions of this chapter in the CBSE Computational Thinking Student Handbook, Class ${cls}.</p>
  ${cb.map((it, i) => questionHtml(it.q, i + 1, 470)).join("")}
  <div class="newsect"><div class="sect">Help-book questions</div>
  <p class="sintro">${n} questions on the same ideas: one for each CBSE question above.</p>
  ${hb.map((it, i) => questionHtml(it.q, n + i + 1, 470)).join("")}</div></body></html>`;
}

function keysHtml(cls: number, ch: number, title: string, cb: Item[], hb: Item[]) {
  const n = cb.length;
  const items = (list: Item[], start: number) => list.map((it, i) => keyItem({ ...it.key, label: String(start + i) })).join("");
  return `<!doctype html><html><head>${style(cls)}${extra(cls)}</head><body>
  <div class="band"><div class="chip"><small>CHAPTER</small><b>${ch}</b></div><div><div class="kicker">Answer key: Chapter ${ch}</div><h1>${esc(title)}</h1></div></div>
  <div class="sect">CBSE Handbook questions</div><p class="sintro">Solutions from the CBSE Teacher Handbook.</p>${items(cb, 1)}
  <div class="sect">Help-book questions</div><p class="sintro">Worked solutions in the same style.</p>${items(hb, n + 1)}</body></html>`;
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const summary: Record<string, { cbse: number; helpbook: number; pages: number; keyPages: number }> = {};
  for (const cls of classes.length ? classes : [3, 4, 5, 6, 7, 8]) {
    for (let ch = 1; ch <= CURRICULUM[cls].CT.length; ch++) {
      const head = HEAD[`${cls}-${ch}`];
      const cb = cbseItems(cls, ch);
      const hb = hbItems(cls, ch);
      if (cb.length !== hb.length) throw new Error(`Class ${cls} chapter ${ch}: ${cb.length} CBSE but ${hb.length} help-book questions`);
      const pages: number[] = [];
      for (const [kind, html] of [["cbse", questionsHtml(cls, ch, head.title, head.desc, cb, hb)], ["cbse-key", keysHtml(cls, ch, head.title, cb, hb)]] as const) {
        await page.setContent(html, { waitUntil: "networkidle" });
        await page.evaluate(() => document.fonts.ready);
        const file = path.join(out, `c${cls}-ch${pad(ch)}-${kind}.pdf`);
        await page.pdf({ path: file, format: "A4", printBackground: true, preferCSSPageSize: true });
        pages.push(Number(/Pages:\s+(\d+)/.exec(execFileSync("pdfinfo", [file]).toString())![1]));
      }
      summary[`${cls}-${ch}`] = { cbse: cb.length, helpbook: hb.length, pages: pages[0], keyPages: pages[1] };
    }
  }
  fs.writeFileSync(path.join(out, "cbse-edition.json"), JSON.stringify(summary, null, 1));
  const tot: Record<number, number> = {};
  for (const [k, v] of Object.entries(summary)) tot[Number(k.split("-")[0])] = (tot[Number(k.split("-")[0])] ?? 0) + v.cbse + v.helpbook;
  console.log("questions per class:", JSON.stringify(tot));
  await browser.close();
})();
