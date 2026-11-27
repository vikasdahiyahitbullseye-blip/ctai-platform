// CBSE CT & AI handbook questions (2026-27), with the answers and solutions from CBSE's Teacher Handbooks.
// CT: every answered question in each CT chapter (activity questions, end-of-chapter questions and the Thinking Spot),
// extracted from the Teacher Handbooks with the figures cropped from the books (public/cbse/*.webp).
// AI (Classes 6–8): each chapter's Exercise, transcribed in ai6.ts / ai7.ts / ai8.ts.
import CT from "./ct.json";
import { AI6 } from "./ai6";
import { AI7 } from "./ai7";
import { AI8 } from "./ai8";
import type { AiExercise } from "./types";

export type CbseQuestion = {
  code: string;
  classLevel: number;
  chapterKey: string; // "<class>-<CT|AI>-<n>"
  skills: string[];
  type: "MCQ" | "FILL_BLANK" | "TRUE_FALSE" | "SHORT";
  difficulty: number;
  stem: string;
  options: string[];
  answer: unknown;
  solution: string;
  figure: { kind: "image"; src: string; w: number; h: number; alt: string } | null;
  /** Pictures from the worked solution in the Teacher Handbook; "[fig:n]" in the solution places picture n. */
  solutionFigures?: { kind: "image"; src: string; w: number; h: number; alt: string }[];
  sourceRef: string;
};

type CtRow = { c: number; ch: number; seq: number; num: number | string; page: number; stem: string; options: string[]; answer: number; solution: string; skills: string[]; fig: [string, number, number] | null; sfig?: [string, number, number][] };
const pad = (n: number) => String(n).padStart(2, "0");
const book = (c: number) => `CBSE CT & AI Student Handbook, Class ${c} (2026-27)`;

/** Puts "[fig:n]" markers in a handbook solution: after the lines that point to a picture ("as shown below", "…:"),
 * and any left over before the closing "Hence/Thus …" line. */
export function placeFigures(solution: string, n: number): string {
  if (!n) return solution;
  const lines = solution.split("\n");
  const out: string[] = [];
  let k = 0;
  for (const l of lines) {
    out.push(l);
    if (k < n && (/\bbelow\b|:\s*$/i.test(l))) out.push(`[fig:${++k}]`);
  }
  const rest: string[] = [];
  while (k < n) rest.push(`[fig:${++k}]`);
  if (rest.length) {
    const last = out.length - 1;
    if (last > 0 && /^(Hence|Thus|Therefore|So)\b/.test(out[last])) out.splice(last, 0, ...rest);
    else out.push(...rest);
  }
  return out.join("\n");
}

export function cbseQuestions(): CbseQuestion[] {
  const out: CbseQuestion[] = [];
  for (const r of CT as CtRow[]) {
    const label = String(r.num).startsWith("P") ? "Thinking Spot" : `Question ${r.num}`;
    out.push({
      code: `CBSE-${r.c}-CT-${pad(r.ch)}-${pad(r.seq)}`,
      classLevel: r.c,
      chapterKey: `${r.c}-CT-${r.ch}`,
      skills: r.skills,
      type: "MCQ",
      difficulty: String(r.num).startsWith("P") ? 3 : 2,
      stem: r.stem,
      options: r.options,
      answer: r.answer,
      solution: placeFigures((r.solution || "See the CBSE Teacher Handbook.").split("\n").filter((l) => !/^\s*[●•▪◦]\s*$/.test(l)).join("\n"), r.sfig?.length ?? 0),
      solutionFigures: r.sfig?.map(([src, w, h], i) => ({ kind: "image" as const, src, w, h, alt: `Worked solution, picture ${i + 1}` })),
      figure: r.fig ? { kind: "image", src: r.fig[0], w: r.fig[1], h: r.fig[2], alt: `Figure for: ${r.stem.slice(0, 120)}` } : null,
      sourceRef: `${book(r.c)} · CT Chapter ${r.ch} · ${label}`,
    });
  }
  const ai: [number, AiExercise[]][] = [[6, AI6], [7, AI7], [8, AI8]];
  for (const [c, list] of ai) {
    for (const ex of list) {
      let k = 0;
      const add = (q: Omit<CbseQuestion, "code" | "classLevel" | "chapterKey" | "sourceRef" | "figure">, section: string) => {
        k++;
        out.push({ ...q, code: `CBSE-${c}-AI-${pad(ex.chapter)}-${pad(k)}`, classLevel: c, chapterKey: `${c}-AI-${ex.chapter}`, figure: null, sourceRef: `${book(c)} · AI Chapter ${ex.chapter} · Exercise: ${section}` });
      };
      const sk = (s: string) => (/(ethic|privacy|bias|password|phishing|plagiar|safe|misinformation|accountab|fair)/i.test(s) ? ["ETHICS"] : /(data|chart|graph|table|dataset)/i.test(s) ? ["DATA"] : ["AI_CONCEPT"]);
      for (const [stem, options, ans] of ex.mcq) add({ skills: sk(stem + options.join(" ")), type: "MCQ", difficulty: 1, stem, options, answer: ans, solution: `Answer: (${String.fromCharCode(97 + ans)}) ${options[ans]}` }, "Multiple choice");
      for (const [stem, ans] of ex.fill) add({ skills: sk(stem), type: "FILL_BLANK", difficulty: 1, stem: `Fill in the blank: ${stem}`, options: [], answer: ans, solution: `Answer: ${ans[0]}` }, "Fill in the blanks");
      for (const [stem, ans] of ex.tf ?? []) add({ skills: sk(stem), type: "TRUE_FALSE", difficulty: 1, stem: `True or false? ${stem}`, options: [], answer: ans, solution: `Answer: ${ans ? "True" : "False"}` }, "True or false");
      for (const t of ex.tables ?? []) {
        const choices = t.choices ?? [...new Set(t.rows.map((r) => r[1]))];
        for (const [desc, ans] of t.rows) add({ skills: sk(t.title + desc), type: "MCQ", difficulty: 1, stem: `${t.title}: **${desc}**`, options: choices, answer: choices.indexOf(ans), solution: `Answer: ${ans}` }, t.title);
      }
      for (const [stem, model] of ex.short) add({ skills: sk(stem), type: "SHORT", difficulty: 2, stem, options: [], answer: [model], solution: `Model answer (CBSE): ${model}` }, "Short answer");
      for (const [stem, model] of ex.apply) add({ skills: sk(stem), type: "SHORT", difficulty: 2, stem, options: [], answer: [model], solution: `Model answer (CBSE): ${model}` }, "Think and apply");
    }
  }
  return out;
}
