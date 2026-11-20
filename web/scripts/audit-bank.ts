// Question bank audit: checks every question for broken keys, contradictions between answer and solution,
// bad figures, duplicates and text glitches. Run: npx tsx scripts/audit-bank.ts [--all] [--json out.json]
// (default: live questions only; --all also checks retired ones). Exits with code 1 if any ERROR is found.
import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

type Issue = { code: string; level: "ERROR" | "WARN"; msg: string };
const db = new PrismaClient();
const norm = (s: string) => s.toLowerCase().replace(/\*\*|`/g, "").replace(/\s+/g, " ").trim();
const numsIn = (s: string) => (s.replace(/(\d),(?=\d)/g, "$1").match(/-?\d+(\.\d+)?/g) ?? []).map(Number);
const FIG_KINDS = new Set(["pixels", "gridmap", "shapes", "sequence", "arrow", "dots", "bars", "pictograph", "clock", "cubes", "fraction", "abacus", "numberline", "ruler", "balance", "jug", "money", "icons", "angle", "lines", "calendar", "numgrid", "matchsticks", "areamodel", "binary", "beads", "lettergrid", "image", "venn"]);

function checkFig(f: any, where: string, out: Issue[], code: string) {
  if (!f || typeof f !== "object") return out.push({ code, level: "ERROR", msg: `${where}: figure is not an object` });
  if (!FIG_KINDS.has(f.kind)) return out.push({ code, level: "ERROR", msg: `${where}: unknown figure kind ${f.kind}` });
  if (f.kind === "image") { const p = path.join("public", f.src.includes("/") ? f.src : `cbse/${f.src}`); if (!fs.existsSync(p)) out.push({ code, level: "ERROR", msg: `${where}: image file missing ${p}` }); }
  if (f.kind === "sequence") (f.frames ?? []).forEach((x: any, i: number) => x && checkFig(x, `${where} frame ${i + 1}`, out, code));
  if (f.kind === "dots" && (f.count < 1 || f.count > 12)) out.push({ code, level: "WARN", msg: `${where}: ${f.count} dots will be crowded` });
  if (f.kind === "icons" && f.items.length > 20) out.push({ code, level: "WARN", msg: `${where}: ${f.items.length} icons` });
  if (f.kind === "bars" && (f.values.length !== f.labels.length || Math.max(...f.values) / f.step > 12)) out.push({ code, level: "WARN", msg: `${where}: bar chart scale` });
  if (f.kind === "pictograph" && f.counts.length !== f.labels.length) out.push({ code, level: "ERROR", msg: `${where}: pictograph rows` });
  if (f.kind === "calendar" && (f.marks ?? []).some((m: any) => m.d < 1 || m.d > f.days)) out.push({ code, level: "ERROR", msg: `${where}: calendar mark outside month` });
  if (f.kind === "numgrid" && (f.marks ?? []).some((m: any) => m.v < f.from || m.v > f.to)) out.push({ code, level: "ERROR", msg: `${where}: number-grid mark outside grid` });
  if (f.kind === "gridmap" && f.items.some((it: any) => it.r < 0 || it.c < 0 || it.r >= f.rows || it.c >= f.cols)) out.push({ code, level: "ERROR", msg: `${where}: map item off the grid` });
  if (f.kind === "pixels" && f.cells.some(([r, c]: number[]) => r < 0 || c < 0 || r >= f.n || c >= f.n)) out.push({ code, level: "ERROR", msg: `${where}: pixel off the grid` });
  if (f.kind === "abacus" && f.beads.some((b: number) => b < 0 || b > 9)) out.push({ code, level: "ERROR", msg: `${where}: abacus rod with ${f.beads} beads` });
  if (f.kind === "jug" && (f.level < 0 || f.level > f.max)) out.push({ code, level: "ERROR", msg: `${where}: jug level outside scale` });
  if (f.kind === "ruler" && f.start + f.length > f.cm) out.push({ code, level: "ERROR", msg: `${where}: object longer than ruler` });
  if (f.kind === "numberline" && (f.marks ?? []).some((m: any) => m.v < f.min || m.v > f.max)) out.push({ code, level: "ERROR", msg: `${where}: number-line mark off the line` });
  if (f.kind === "money" && f.items.some((v: number) => ![1, 2, 5, 10, 20, 50, 100, 200, 500].includes(v))) out.push({ code, level: "ERROR", msg: `${where}: unknown note or coin` });
  if (f.kind === "fraction" && (f.shaded < 0 || f.shaded > f.parts)) out.push({ code, level: "ERROR", msg: `${where}: fraction shading` });
}

async function main() {
  const all = process.argv.includes("--all");
  const qs = await db.question.findMany({ where: all ? {} : { status: "PUBLISHED" }, include: { chapter: true }, orderBy: { code: "asc" } });
  const issues: Issue[] = [];
  const seen = new Map<string, string>();
  for (const q of qs) {
    const add = (level: Issue["level"], msg: string) => issues.push({ code: q.code, level, msg });
    let options: string[] = [], answer: any, figure: any = null, optFigs: any = null;
    try { options = JSON.parse(q.options); } catch { add("ERROR", "options are not valid JSON"); }
    try { answer = JSON.parse(q.answer); } catch { add("ERROR", "answer is not valid JSON"); }
    try { figure = q.figure ? JSON.parse(q.figure) : null; optFigs = q.optionFigures ? JSON.parse(q.optionFigures) : null; } catch { add("ERROR", "figure is not valid JSON"); }
    const text = [q.stem, q.solution, q.hint ?? "", ...options].join("\n");
    if (/undefined|NaN|\[object |\$\{|Infinity/.test(text)) add(q.source === "CBSE" ? "WARN" : "ERROR", "template text left in question");
    if ((q.stem.match(/\*\*/g) ?? []).length % 2) add("WARN", "unbalanced bold markers in stem");
    if (/\b(\w+) \1\b/i.test(q.stem.replace(/\d+ \d+/g, "")) && !/\b(that that|had had|very very|bye bye|is is)\b/i.test(q.stem)) { const m = q.stem.match(/\b(\w+) \1\b/i)!; if (!/^\d+$/.test(m[1]) && m[1].length > 1) add("WARN", `repeated word "${m[0]}"`); }
    if (!q.stem.trim()) add("ERROR", "empty stem");
    if (!q.solution.trim()) add("WARN", "no solution");
    if (![1, 2, 3].includes(q.difficulty)) add("ERROR", `difficulty ${q.difficulty}`);
    if (!q.skills.trim()) add("ERROR", "no skill tags");
    switch (q.type) {
      case "MCQ": {
        if (options.length < 3) add(q.source === "CBSE" ? "WARN" : "ERROR", `only ${options.length} options`);
        // Book questions may draw options (a)–(d) inside the picture; those options have no text of their own.
        const inPicture = figure?.kind === "image" && options.some((o) => !String(o).trim());
        if (options.some((o) => !String(o).trim()) && !inPicture) add("ERROR", "empty option");
        const texts = options.map((o) => norm(String(o))).filter(Boolean);
        if (new Set(texts).size !== texts.length && !optFigs) add("ERROR", `duplicate options: ${options.join(" | ")}`);
        if (options.length < 4 && q.source !== "CBSE") add("WARN", `${options.length} options (CBSE questions have 4)`);
        if (!Number.isInteger(answer) || answer < 0 || answer >= options.length) { add("ERROR", `answer index ${answer} out of range`); break; }
        if (optFigs && optFigs.length !== options.length) add("ERROR", "option pictures do not match options");
        const sol = q.solution;
        const letter = sol.match(/Answer:?\s*\(?([a-d])\)/i);
        if (letter && letter[1].toLowerCase().charCodeAt(0) - 97 !== answer) add("ERROR", `solution says (${letter[1]}) but key is (${String.fromCharCode(97 + answer)})`);
        // A numeric right answer should appear in the solution; a solution that ends on another option's number is suspicious.
        const right = String(options[answer]);
        const rn = numsIn(right), sn = numsIn(sol);
        if (rn.length === 1 && sn.length && !sn.includes(rn[0]) && q.source !== "CBSE") {
          const other = options.findIndex((o, i) => i !== answer && numsIn(String(o)).length === 1 && numsIn(String(o))[0] === sn[sn.length - 1]);
          add(other >= 0 ? "ERROR" : "WARN", other >= 0 ? `solution ends on ${sn[sn.length - 1]} = option (${String.fromCharCode(97 + other)}), key is ${right}` : `answer ${right} not mentioned in the solution`);
        }
        break;
      }
      case "TRUE_FALSE":
        if (typeof answer !== "boolean") add("ERROR", `true/false answer is ${JSON.stringify(answer)}`);
        else if (/^(True|False)\b/.test(q.solution) && q.solution.startsWith(answer ? "False" : "True")) add("ERROR", "solution contradicts the true/false key");
        break;
      case "NUMERIC":
        if (typeof answer !== "number" || !Number.isFinite(answer)) add("ERROR", `numeric answer is ${JSON.stringify(answer)}`);
        else if (!numsIn(q.solution).includes(answer)) add("WARN", `numeric answer ${answer} not in solution`);
        break;
      case "FILL_BLANK":
        if (!Array.isArray(answer) || !answer.length || answer.some((a: unknown) => !String(a).trim())) add("ERROR", "fill-in answer list is empty");
        else if (!q.stem.includes("____")) add("WARN", "fill-in question has no blank");
        break;
      case "MULTI":
        if (!Array.isArray(answer) || !answer.length || answer.some((i: number) => i < 0 || i >= options.length)) add("ERROR", "multi-select key out of range");
        break;
      case "ORDER":
        if (!Array.isArray(answer) || [...answer].sort().join() !== options.map((_, i) => i).join()) add("ERROR", "order key is not a permutation");
        break;
      case "SHORT":
        if (!Array.isArray(answer) || !String(answer[0] ?? "").trim()) add("WARN", "short answer has no model answer");
        break;
      default: add("ERROR", `unknown type ${q.type}`);
    }
    if (figure) checkFig(figure, "figure", issues, q.code);
    if (optFigs) optFigs.forEach((f: any, i: number) => f && checkFig(f, `option ${i + 1} picture`, issues, q.code));
    if (q.status === "PUBLISHED") {
      const key = `${q.chapterId}|${q.type}|${norm(q.stem)}|${options.map((o) => norm(String(o))).sort().join("|")}|${q.figure ?? ""}`;
      if (seen.has(key)) add(q.source === "CBSE" ? "WARN" : "ERROR", `duplicate of ${seen.get(key)}`);
      else seen.set(key, q.code);
    }
  }
  const errors = issues.filter((i) => i.level === "ERROR"), warns = issues.filter((i) => i.level === "WARN");
  const byMsg = new Map<string, number>();
  for (const i of issues) { const k = `${i.level} ${i.msg.replace(/\d+/g, "#").replace(/".*?"/g, '"…"').slice(0, 70)}`; byMsg.set(k, (byMsg.get(k) ?? 0) + 1); }
  console.log(`Checked ${qs.length} questions: ${errors.length} errors, ${warns.length} warnings.`);
  for (const [k, n] of [...byMsg].sort((a, b) => b[1] - a[1])) console.log(`  ${String(n).padStart(5)}  ${k}`);
  const jsonAt = process.argv.indexOf("--json");
  if (jsonAt > 0) fs.writeFileSync(process.argv[jsonAt + 1], JSON.stringify(issues, null, 1));
  await db.$disconnect();
  if (errors.length) process.exit(1);
}
main();
