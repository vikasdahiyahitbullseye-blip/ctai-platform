// Validates and normalises question data coming from the studio editor or CSV import.
import { z } from "zod";
import { QUESTION_TYPES, SKILLS } from "./constants";
import { isCorrect } from "./scoring";

export type QuestionDraft = {
  classLevel: number; part: string; chapterNumber: number; type: string; difficulty: number; skills: string[];
  stem: string; options: string[]; answerRaw: string; solution: string; hint?: string; marks?: number; isPuzzle?: boolean;
};

const base = z.object({
  classLevel: z.number().int().min(3).max(8),
  part: z.enum(["CT", "AI"]),
  chapterNumber: z.number().int().min(1),
  type: z.enum(Object.keys(QUESTION_TYPES) as [string, ...string[]]),
  difficulty: z.number().int().min(1).max(3),
  skills: z.array(z.enum(Object.keys(SKILLS) as [string, ...string[]])).min(1, "Choose at least one skill"),
  stem: z.string().trim().min(5, "Question text is too short"),
  options: z.array(z.string().trim().min(1)),
  answerRaw: z.string().trim().min(1, "Answer is required"),
  solution: z.string().trim().min(10, "Please write a worked solution (at least a sentence)"),
  hint: z.string().trim().optional(),
  marks: z.number().int().min(1).max(10).optional(),
  isPuzzle: z.boolean().optional(),
});

/**
 * answerRaw formats: MCQ "b" or "2"(1-based) · MULTI "a,c" · TRUE_FALSE "true/false" · NUMERIC "36"
 * FILL_BLANK "word|variant" · ORDER: options are entered in correct order, answerRaw ignored ("in order") · SHORT: model answer
 */
export function normaliseQuestion(d: QuestionDraft): { ok: true; data: { options: string[]; answer: unknown } & Omit<QuestionDraft, "answerRaw"> } | { ok: false; error: string } {
  const p = base.safeParse({ ...d, answerRaw: d.type === "ORDER" ? "in order" : d.answerRaw });
  if (!p.success) return { ok: false, error: p.error.issues[0].message };
  const v = p.data;
  const idx = (t: string) => {
    const s = t.trim().toLowerCase();
    if (/^[a-h]$/.test(s)) return s.charCodeAt(0) - 97;
    const n = Number(s);
    return Number.isInteger(n) ? n - 1 : -1;
  };
  let answer: unknown;
  const needsOptions = ["MCQ", "MULTI", "ORDER"].includes(v.type);
  if (needsOptions && v.options.length < 2) return { ok: false, error: "Add at least two options." };
  const options = needsOptions ? v.options : [];
  switch (v.type) {
    case "MCQ": answer = idx(v.answerRaw); if ((answer as number) < 0 || (answer as number) >= options.length) return { ok: false, error: "MCQ answer must be one of the option letters." }; break;
    case "MULTI": answer = v.answerRaw.split(/[,\s]+/).filter(Boolean).map(idx); if ((answer as number[]).some((i) => i < 0 || i >= options.length) || !(answer as number[]).length) return { ok: false, error: "Multi-select answer must list option letters, e.g. a,c" }; break;
    case "TRUE_FALSE": if (!/^(true|false|t|f)$/i.test(v.answerRaw)) return { ok: false, error: "Answer must be true or false." }; answer = /^t/i.test(v.answerRaw); break;
    case "NUMERIC": answer = Number(v.answerRaw.replace(/,/g, "")); if (!Number.isFinite(answer as number)) return { ok: false, error: "Numeric answer must be a number." }; break;
    case "FILL_BLANK": answer = v.answerRaw.split("|").map((x) => x.trim()).filter(Boolean); break;
    case "ORDER": answer = options.map((_, i) => i); break;
    case "SHORT": answer = [v.answerRaw]; break;
  }
  const sample = v.type === "FILL_BLANK" ? (answer as string[])[0] : answer;
  if (v.type !== "SHORT" && !isCorrect(v.type, answer as never, sample as never)) return { ok: false, error: "The answer key could not be validated." };
  return { ok: true, data: { classLevel: v.classLevel, part: v.part, chapterNumber: v.chapterNumber, type: v.type, difficulty: v.difficulty, skills: v.skills, stem: v.stem, options, answer, solution: v.solution, hint: v.hint || undefined, marks: v.marks, isPuzzle: v.isPuzzle } };
}

export function answerToRaw(type: string, answerJson: string): string {
  const a = JSON.parse(answerJson);
  switch (type) {
    case "MCQ": return String.fromCharCode(97 + Number(a));
    case "MULTI": return (a as number[]).map((i) => String.fromCharCode(97 + i)).join(",");
    case "TRUE_FALSE": return String(a);
    case "FILL_BLANK": return (a as string[]).join("|");
    case "SHORT": return Array.isArray(a) ? a[0] : String(a);
    default: return String(a);
  }
}
