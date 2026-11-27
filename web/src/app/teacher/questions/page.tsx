import Link from "next/link";
import { SolutionView } from "@/components/SolutionView";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { formatAnswer } from "@/lib/scoring";
import { skillName, parseSkills } from "@/lib/progress";
import { SKILLS, QUESTION_TYPES, DIFFICULTY, dashboardSkills } from "@/lib/constants";
import { Markdown } from "@/components/Markdown";
import { StemFigure, OptionList } from "@/components/QuestionFigures";
import { Card, PageHeader, Pill, btn, Empty } from "@/components/ui";

type SP = { cls?: string; ch?: string; skill?: string; type?: string; d?: string; q?: string; source?: string; pic?: string };

export default async function QuestionBank({ searchParams }: { searchParams: Promise<SP> }) {
  await requireUser("TEACHER", "ADMIN");
  const sp = await searchParams;
  const cls = Number(sp.cls ?? 3);
  // Only the live bank (retired first-generation questions are kept for history but not shown).
  const live = { classLevel: cls, status: "PUBLISHED" };
  const chapters = await prisma.chapter.findMany({ where: { classLevel: cls }, orderBy: [{ part: "desc" }, { number: "asc" }], include: { _count: { select: { questions: { where: { status: "PUBLISHED" } } } } } });
  const chapter = chapters.find((c) => c.id === sp.ch);
  const picWhere = sp.pic === "yes" ? { OR: [{ figure: { not: null } }, { optionFigures: { not: null } }] } : sp.pic === "no" ? { figure: null, optionFigures: null } : {};
  const where = {
    ...live,
    ...(sp.ch ? { chapterId: sp.ch } : {}),
    ...(sp.skill ? { skills: { contains: sp.skill } } : {}),
    ...(sp.type ? { type: sp.type } : {}),
    ...(sp.d ? { difficulty: Number(sp.d) } : {}),
    ...(sp.q ? { stem: { contains: sp.q } } : {}),
    ...(sp.source === "CBSE" ? { source: "CBSE" } : sp.source === "OURS" ? { source: { not: "CBSE" } } : {}),
    ...picWhere,
  };
  // Counts for each filter choice, within the chosen chapter (or the whole class).
  const scope = { ...live, ...(sp.ch ? { chapterId: sp.ch } : {}) };
  const [questions, total, matching, byType, byDiff, scoped] = await Promise.all([
    prisma.question.findMany({ where, include: { chapter: true, _count: { select: { responses: true } }, responses: { select: { correct: true }, where: { correct: { not: null } } } }, orderBy: { code: "asc" }, take: 100 }),
    prisma.question.count({ where: live }),
    prisma.question.count({ where }),
    prisma.question.groupBy({ by: ["type"], where: scope, _count: true }),
    prisma.question.groupBy({ by: ["difficulty"], where: scope, _count: true }),
    prisma.question.findMany({ where: scope, select: { skills: true, figure: true, optionFigures: true } }),
  ]);
  const skillCount = (k: string) => scoped.filter((q) => q.skills.split(",").includes(k)).length;
  const withPic = scoped.filter((q) => q.figure || q.optionFigures).length;
  const skillChoices = chapter ? (chapter.part === "AI" ? ["AI_CONCEPT", "DATA", "ETHICS"] : ["ABSTRACT", "PATTERN", "DECOMPOSITION", "ALGORITHMIC"]) : dashboardSkills(cls);
  const typeChoices = (Object.keys(QUESTION_TYPES) as (keyof typeof QUESTION_TYPES)[]).filter((k) => byType.some((t) => t.type === k));
  const sel = "rounded-xl border border-line bg-surface px-3 py-2 text-sm";

  return (
    <div>
      <PageHeader title="Question bank" subtitle={`${total.toLocaleString("en-IN")} questions for Class ${cls}. Each has a worked solution and CBSE skill tags. The numbers in brackets show how many questions each choice has${chapter ? " in this chapter" : ""}.`} />
      <Card className="mb-6">
        <form className="flex flex-wrap items-end gap-3">
          <label className="text-xs text-muted">Class<br />
            <select name="cls" defaultValue={cls} className={sel}>{[3, 4, 5, 6, 7, 8].map((c) => <option key={c} value={c}>Class {c}</option>)}</select>
          </label>
          <label className="text-xs text-muted">Chapter<br />
            <select name="ch" defaultValue={sp.ch ?? ""} className={`${sel} max-w-64`}>
              <option value="">All chapters</option>
              {chapters.map((c) => <option key={c.id} value={c.id}>{c.part === "AI" ? "AI " : ""}Ch {c.number}: {c.title} ({c._count.questions})</option>)}
            </select>
          </label>
          <label className="text-xs text-muted">Skill<br />
            <select name="skill" defaultValue={sp.skill ?? ""} className={sel}><option value="">Any</option>{skillChoices.map((k) => <option key={k} value={k}>{SKILLS[k as keyof typeof SKILLS]} ({skillCount(k)})</option>)}</select>
          </label>
          <label className="text-xs text-muted">Type<br />
            <select name="type" defaultValue={sp.type ?? ""} className={sel}><option value="">Any</option>{typeChoices.map((k) => <option key={k} value={k}>{QUESTION_TYPES[k]} ({byType.find((t) => t.type === k)?._count ?? 0})</option>)}</select>
          </label>
          <label className="text-xs text-muted">Difficulty<br />
            <select name="d" defaultValue={sp.d ?? ""} className={sel}><option value="">Any</option>{Object.entries(DIFFICULTY).map(([k, v]) => <option key={k} value={k}>{v} ({byDiff.find((x) => x.difficulty === Number(k))?._count ?? 0})</option>)}</select>
          </label>
          <label className="text-xs text-muted">From<br />
            <select name="source" defaultValue={sp.source ?? ""} className={sel}><option value="">All questions</option><option value="OURS">Our question bank</option><option value="CBSE">CBSE handbook</option></select>
          </label>
          <label className="text-xs text-muted">Pictures<br />
            <select name="pic" defaultValue={sp.pic ?? ""} className={sel}><option value="">Any</option><option value="yes">With a picture ({withPic})</option><option value="no">Text only ({scoped.length - withPic})</option></select>
          </label>
          <label className="text-xs text-muted">Search<br />
            <input name="q" defaultValue={sp.q ?? ""} placeholder="Words in question" className={sel} />
          </label>
          <button className={btn.primary}>Filter</button>
          <Link href="/teacher/questions" className={btn.ghost}>Reset</Link>
        </form>
      </Card>
      <p className="mb-3 text-sm text-muted">{matching.toLocaleString("en-IN")} matching question{matching === 1 ? "" : "s"}{matching > questions.length ? ` — showing the first ${questions.length}` : ""}.</p>
      {questions.length === 0 ? <Empty>No questions match. Content for this class/chapter is still being authored.</Empty> : (
        <ul className="space-y-4">
          {questions.map((q) => {
            const opts = JSON.parse(q.options) as string[];
            const n = q.responses.length;
            const p = n ? Math.round((q.responses.filter((r) => r.correct).length / n) * 100) : null;
            return (
              <li key={q.id} className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
                <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
                  <code className="font-mono text-muted">{q.code}</code>
                  {q.isPuzzle && <Pill tone="warn">Puzzle of the Day</Pill>}{q.source === "GENERATED" && <Pill>Generated</Pill>}{q.source === "CBSE" && <Pill tone="good">📗 CBSE handbook</Pill>}{q.approval === "APPROVED" ? <Pill tone="good">✓ Approved</Pill> : <Pill>Not yet reviewed</Pill>}
                  <Pill tone="brand">{q.chapter.part === "AI" ? "AI " : ""}Ch {q.chapter.number}: {q.chapter.title}</Pill>
                  <Pill>{DIFFICULTY[q.difficulty as 1 | 2 | 3]}</Pill>
                  <Pill>{QUESTION_TYPES[q.type as keyof typeof QUESTION_TYPES]}</Pill>
                  {parseSkills(q.skills).map((s) => <Pill key={s}>{skillName(s)}</Pill>)}
                  <span className="ml-auto text-muted">{p !== null ? `${p}% correct · ${n} answers` : "Not yet used"}</span>
                </div>
                {q.sourceRef && <p className="mb-1 text-xs text-muted">{q.sourceRef}</p>}
                <Markdown text={q.stem} />
                <StemFigure json={q.figure} />
                <OptionList options={opts} figuresJson={q.optionFigures} />
                <details className="mt-3 text-sm">
                  <summary className="cursor-pointer font-medium text-brand">Answer: {formatAnswer(q.type, opts, JSON.parse(q.answer))}</summary>
                  <div className="mt-2 text-ink-2"><SolutionView text={q.solution} figuresJson={q.solutionFigures} /></div>
                  {q.hint && <div className="mt-2 text-muted">Hint: {q.hint}</div>}
                </details>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
