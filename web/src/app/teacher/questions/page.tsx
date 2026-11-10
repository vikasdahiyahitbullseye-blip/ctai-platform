import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { formatAnswer } from "@/lib/scoring";
import { skillName, parseSkills } from "@/lib/progress";
import { SKILLS, QUESTION_TYPES, DIFFICULTY } from "@/lib/constants";
import { Markdown } from "@/components/Markdown";
import { StemFigure, OptionList } from "@/components/QuestionFigures";
import { Card, PageHeader, Pill, btn, Empty } from "@/components/ui";

type SP = { cls?: string; ch?: string; skill?: string; type?: string; d?: string; q?: string };

export default async function QuestionBank({ searchParams }: { searchParams: Promise<SP> }) {
  await requireUser("TEACHER", "ADMIN");
  const sp = await searchParams;
  const cls = Number(sp.cls ?? 3);
  const chapters = await prisma.chapter.findMany({ where: { classLevel: cls }, orderBy: [{ part: "desc" }, { number: "asc" }], include: { _count: { select: { questions: true } } } });
  const where = {
    classLevel: cls,
    ...(sp.ch ? { chapterId: sp.ch } : {}),
    ...(sp.skill ? { skills: { contains: sp.skill } } : {}),
    ...(sp.type ? { type: sp.type } : {}),
    ...(sp.d ? { difficulty: Number(sp.d) } : {}),
    ...(sp.q ? { stem: { contains: sp.q } } : {}),
  };
  const [questions, total] = await Promise.all([
    prisma.question.findMany({ where, include: { chapter: true, _count: { select: { responses: true } }, responses: { select: { correct: true }, where: { correct: { not: null } } } }, orderBy: { code: "asc" }, take: 100 }),
    prisma.question.count({ where: { classLevel: cls } }),
  ]);
  const sel = "rounded-xl border border-line bg-surface px-3 py-2 text-sm";

  return (
    <div>
      <PageHeader title="Question bank" subtitle={`${total} original questions for Class ${cls}. Each has a worked solution and CBSE CT-skill tags.`} />
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
            <select name="skill" defaultValue={sp.skill ?? ""} className={sel}><option value="">Any</option>{Object.entries(SKILLS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
          </label>
          <label className="text-xs text-muted">Type<br />
            <select name="type" defaultValue={sp.type ?? ""} className={sel}><option value="">Any</option>{Object.entries(QUESTION_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
          </label>
          <label className="text-xs text-muted">Difficulty<br />
            <select name="d" defaultValue={sp.d ?? ""} className={sel}><option value="">Any</option>{Object.entries(DIFFICULTY).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
          </label>
          <label className="text-xs text-muted">Search<br />
            <input name="q" defaultValue={sp.q ?? ""} placeholder="Words in question" className={sel} />
          </label>
          <button className={btn.primary}>Filter</button>
          <Link href="/teacher/questions" className={btn.ghost}>Reset</Link>
        </form>
      </Card>
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
                  {q.isPuzzle && <Pill tone="warn">Puzzle of the Day</Pill>}{q.source === "GENERATED" && <Pill>Generated</Pill>}
                  <Pill tone="brand">{q.chapter.part === "AI" ? "AI " : ""}Ch {q.chapter.number}: {q.chapter.title}</Pill>
                  <Pill>{DIFFICULTY[q.difficulty as 1 | 2 | 3]}</Pill>
                  <Pill>{QUESTION_TYPES[q.type as keyof typeof QUESTION_TYPES]}</Pill>
                  {parseSkills(q.skills).map((s) => <Pill key={s}>{skillName(s)}</Pill>)}
                  <span className="ml-auto text-muted">{p !== null ? `${p}% correct · ${n} answers` : "Not yet used"}</span>
                </div>
                <Markdown text={q.stem} />
                <StemFigure json={q.figure} />
                <OptionList options={opts} figuresJson={q.optionFigures} />
                <details className="mt-3 text-sm">
                  <summary className="cursor-pointer font-medium text-brand">Answer: {formatAnswer(q.type, opts, JSON.parse(q.answer))}</summary>
                  <div className="mt-2 text-ink-2"><Markdown text={q.solution} /></div>
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
