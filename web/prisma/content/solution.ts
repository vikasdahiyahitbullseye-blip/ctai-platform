// Finishes a worked solution in the CBSE Teacher Handbook style: the working, then a closing line that names the
// answer ("Hence, option c is the correct answer."). Run after the options are in their final order.
import type { SeedQuestion } from "./types";

const letter = (i: number) => String.fromCharCode(97 + i);
const ENDS = /(correct answer|is correct|are correct|statement is (true|false)|the answer is [^.]+)\.?\s*$/i;

export function conclusion(q: Pick<SeedQuestion, "type" | "options" | "answer">): string {
  switch (q.type) {
    case "MCQ": return `Hence, option ${letter(Number(q.answer))} is the correct answer.`;
    case "MULTI": { const a = (q.answer as number[]).map(letter); return `Hence, options ${a.slice(0, -1).join(", ")}${a.length > 1 ? " and " : ""}${a[a.length - 1]} are correct.`; }
    case "TRUE_FALSE": return `Hence, the statement is ${q.answer ? "true" : "false"}.`;
    case "NUMERIC": return `Hence, the answer is ${q.answer}.`;
    case "FILL_BLANK": return `Hence, the answer is ${(q.answer as string[])[0]}.`;
    case "ORDER": return `Hence, the correct order is ${(q.answer as number[]).map((i) => q.options![i]).join(" → ")}.`;
    default: return "";
  }
}

/** The solution with its closing line (unless the working already ends with one). */
export function finishSolution(q: Pick<SeedQuestion, "type" | "options" | "answer" | "solution">): string {
  const body = q.solution.trim();
  const last = body.split(/\n\s*\n/).pop() ?? "";
  // A fill-in or numeric answer already stated by the working ("So, …") needs no second closing line.
  if ((q.type === "FILL_BLANK" || q.type === "NUMERIC") && /^So,/.test(last)) return body;
  // Multiple choice always ends by naming the option, as the handbook does ("Hence, option c is the correct answer.").
  if ((q.type === "MCQ" || q.type === "MULTI") && /\boptions? \(?[a-d]\)? (is|are) (the )?correct/i.test(last)) return body;
  if (q.type === "TRUE_FALSE" && /statement is (true|false)/i.test(last)) return body;
  if (q.type !== "MCQ" && q.type !== "MULTI" && q.type !== "TRUE_FALSE" && ENDS.test(body) && /^(Hence|Therefore|So)/m.test(last)) return body;
  const end = conclusion(q);
  return end ? `${body}\n\n${end}` : body;
}
