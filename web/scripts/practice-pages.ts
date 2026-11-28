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
import { CURRICULUM } from "../src/lib/constants";
import { type Q, type Key, esc, md, letter, questionHtml, answerText, style, keyHtml } from "./lib/bookHtml";
import { HELPBOOK, workedSolution, workedFigures, solutionWithAnswer } from "../prisma/content/helpbook";
import { finishSolution } from "../prisma/content/solution";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { chromium } = require("playwright");

export const PER_CHAPTER = 20;

const out = process.argv[2];
const classes = process.argv.slice(3).map(Number).filter(Boolean);
if (!out) throw new Error("Usage: practice-pages.ts <outDir> [class...]");
fs.mkdirSync(out, { recursive: true });
const db = new PrismaClient();

function practiceHtml(cls: number, n: number, title: string, qs: Q[], part: "CT" | "AI") {
  return `<!doctype html><html><head>${style(cls)}</head><body>
  <div class="band"><div class="chip"><small>${part === "AI" ? "AI CHAPTER" : "CHAPTER"}</small><b>${n}</b></div><div><div class="kicker">${part === "AI" ? "Practice" : "More practice"}</div><h1>${esc(title)}</h1></div></div>
  ${qs.map((q, i) => questionHtml(q, i + 1)).join("")}</body></html>`;
}

function answersHtml(cls: number, n: number, title: string, qs: Q[], part: "CT" | "AI") {
  const items = qs.map((q, i): Key => ({ label: String(i + 1), answer: answerText(q), solution: q.solution, figs: q.solutionFigures, skills: q.skills }));
  return keyHtml(cls, n, title, items, part, `Answer key · ${part === "AI" ? "Practice" : "More practice"}`);
}

/** The chapter's own answer key (the help-book questions), in the Teacher Handbook style. Replaces the old one-line key. */
function bookKeyHtml(cls: number, n: number, title: string) {
  const rows = HELPBOOK.filter((r) => r.c === cls && r.ch === n);
  const items = rows.map((r): Key => ({
    label: r.label.startsWith("P") ? `Thinking Spot ${r.label.slice(1)}` : r.label,
    answer: `${letter(r.answer)}${r.options[r.answer] ? ` &nbsp;(${md(String(r.options[r.answer]))})` : ""}`,
    solution: finishSolution({ type: "MCQ", options: r.options, answer: r.answer, solution: workedSolution(r) ?? solutionWithAnswer(r) }),
    figs: workedFigures(r) ?? null, skills: r.skills,
  }));
  return keyHtml(cls, n, title, items, "CT", `Answer key: Chapter ${n}`);
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
      const cands: Q[] = rows.map((r) => ({ code: r.code, stem: r.stem, type: r.type, difficulty: r.difficulty, skills: r.skills.split(","), options: JSON.parse(r.options), answer: JSON.parse(r.answer), solution: r.solution, solutionFigures: r.solutionFigures ? JSON.parse(r.solutionFigures) : null, figure: r.figure ? JSON.parse(r.figure) : null, optionFigures: r.optionFigures ? JSON.parse(r.optionFigures) : null, family: r.family! }));
      const qs = cands;
      if (qs.length !== PER_CHAPTER) throw new Error(`Class ${cls} ${part} chapter ${n}: only ${qs.length} questions`);
      chosen[`${cls}-${part}-${n}`] = qs.map((q) => q.code);
      const tag = `c${cls}-${part === "AI" ? "ai" : "ch"}${String(n).padStart(2, "0")}`;
      const pages: Record<string, number> = {};
      const kinds: [string, string][] = [["practice", practiceHtml(cls, n, title, qs, part)], ["answers", answersHtml(cls, n, title, qs, part)]];
      if (part === "CT") kinds.push(["key", bookKeyHtml(cls, n, title)]);
      for (const [kind, html] of kinds) {
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
