// Coverage of the live question bank: for every chapter, how many questions each filter choice has
// (difficulty, skill, question type, with/without picture). Fails if any choice has fewer than 10.
// Run after seeding: npx tsx scripts/bank-coverage.ts [--csv out.csv]
import fs from "node:fs";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const MIN = 10;
async function main() {
  const chapters = await db.chapter.findMany({ orderBy: [{ classLevel: "asc" }, { part: "desc" }, { number: "asc" }], include: { questions: { where: { status: "PUBLISHED", isPuzzle: false }, select: { difficulty: true, skills: true, type: true, figure: true, optionFigures: true, stem: true, source: true } } } });
  const rows: string[] = ["chapter,total,easy,medium,hard,skill_min,skills,mcq,true_false,fill_blank,numeric,short,pictures,picture_pct,text_only,median_length"];
  const fails: string[] = [];
  let all = 0;
  for (const c of chapters) {
    const qs = c.questions.filter((q) => q.type !== "SHORT"), short = c.questions.length - qs.length;
    all += c.questions.length;
    const name = `${c.classLevel}-${c.part}-${c.number}`;
    const d = [1, 2, 3].map((k) => qs.filter((q) => q.difficulty === k).length);
    const skills = c.part === "AI" ? ["AI_CONCEPT", "DATA", "ETHICS"] : ["ABSTRACT", "PATTERN", "DECOMPOSITION", "ALGORITHMIC"];
    const sk = skills.map((s) => qs.filter((q) => q.skills.split(",").includes(s)).length);
    const ty = ["MCQ", "TRUE_FALSE", "FILL_BLANK", "NUMERIC"].map((t) => qs.filter((q) => q.type === t).length);
    const pics = qs.filter((q) => q.figure || q.optionFigures).length;
    const lens = qs.map((q) => q.stem.length).sort((a, b) => a - b);
    for (const [label, n] of [["Easy", d[0]], ["Medium", d[1]], ["Hard", d[2]], ...skills.map((s, i) => [s, sk[i]] as const), ["MCQ", ty[0]], ["True/False", ty[1]], ["Fill-in", ty[2]], ["Numeric", ty[3]], ["With picture", pics], ["Text only", qs.length - pics], ...(c.part === "AI" ? [["Short answer", short] as const] : [])] as const)
      if (n < MIN) fails.push(`${name} ${c.title}: ${label} has ${n}`);
    rows.push([name, qs.length, ...d, Math.min(...sk), skills.map((s, i) => `${s}=${sk[i]}`).join(" "), ...ty, short, pics, Math.round((pics / qs.length) * 100), qs.length - pics, lens[lens.length >> 1]].join(","));
  }
  console.log(rows.join("\n"));
  console.log(`\n${chapters.length} chapters, ${all.toLocaleString("en-IN")} live questions (excluding the Puzzle of the Day).`);
  if (fails.length) { console.log(`\n${fails.length} filter choices have fewer than ${MIN} questions:`); fails.forEach((f) => console.log(`  ${f}`)); }
  else console.log(`Every chapter has at least ${MIN} questions for every filter choice.`);
  const csvAt = process.argv.indexOf("--csv");
  if (csvAt > 0) fs.writeFileSync(process.argv[csvAt + 1], rows.join("\n"));
  await db.$disconnect();
  if (fails.length) process.exit(1);
}
main();
