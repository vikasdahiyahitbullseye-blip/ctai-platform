// Builds printable paper versions (A/B/C) with matching answer keys. Shared by print view and DOCX export.
import { prisma } from "./db";
import { rng, shuffle, versionOrder } from "./generator";
import { formatAnswer } from "./scoring";
import { parseFig, parseFigs, type Fig } from "./figures";

export type PaperItem = {
  no: number;
  section: string;
  marks: number;
  type: string;
  stem: string;
  options: string[]; // in printed order
  answerText: string; // in terms of printed order
  solution: string;
  figure: Fig | null;
  optionFigures: (Fig | null)[] | null; // in printed order
};

export const VERSION_NAMES = ["A", "B", "C"];

export async function buildPaper(testId: string, version: number) {
  const test = await prisma.assessment.findUniqueOrThrow({
    where: { id: testId },
    include: { items: { include: { question: { include: { chapter: true } } }, orderBy: { position: "asc" } }, createdBy: { include: { school: true } } },
  });
  const ids = test.items.map((i) => i.id);
  const order = versionOrder(ids, test.items.map((i) => i.question.difficulty), version);
  const byId = new Map(test.items.map((i) => [i.id, i]));
  const items: PaperItem[] = order.map((id, n) => {
    const it = byId.get(id)!;
    const q = it.question;
    const original = JSON.parse(q.options) as string[];
    let key = JSON.parse(q.answer);
    let perm = original.map((_, i) => i); // printed position -> original index
    if (version > 0 && (q.type === "MCQ" || q.type === "MULTI")) {
      perm = shuffle(perm, rng(version * 104729 + n));
      const inv = (orig: number) => perm.indexOf(orig);
      key = q.type === "MCQ" ? inv(Number(key)) : (key as number[]).map(inv).sort((a, b) => a - b);
    }
    if (q.type === "ORDER") {
      // Print ORDER items in a fixed scrambled order; answer key lists the correct sequence by text.
      perm = shuffle(perm, rng(version * 7 + n + 11));
      if (perm.every((p, i) => p === key[i])) perm.reverse();
      return { no: n + 1, section: it.section, marks: it.marks, type: q.type, stem: q.stem, options: perm.map((p) => original[p]), answerText: formatAnswer("ORDER", original, key), solution: q.solution, figure: parseFig(q.figure), optionFigures: null };
    }
    const options = perm.map((p) => original[p]);
    const figs = parseFigs(q.optionFigures);
    return { no: n + 1, section: it.section, marks: it.marks, type: q.type, stem: q.stem, options, answerText: formatAnswer(q.type, options, key), solution: q.solution, figure: parseFig(q.figure), optionFigures: figs ? perm.map((p) => figs[p] ?? null) : null };
  });
  return {
    test,
    school: test.createdBy?.school,
    items,
    totalMarks: items.reduce((s, i) => s + i.marks, 0),
    sections: [...new Set(items.map((i) => i.section))].sort(),
  };
}

export function instructionFor(type: string): string | null {
  switch (type) {
    case "MULTI": return "(Tick all correct options.)";
    case "TRUE_FALSE": return "(Write True or False.)";
    case "ORDER": return "(Write the items in the correct order.)";
    default: return null;
  }
}

/** Strips the light markdown used in stems for plain-text outputs. */
export function plain(md: string): string {
  return md.replace(/\*\*([^*]+)\*\*/g, "$1");
}
