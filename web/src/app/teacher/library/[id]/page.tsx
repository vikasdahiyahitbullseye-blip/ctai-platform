import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { teacherSections } from "@/lib/teacher";
import { LIB_LABEL } from "@/lib/library";
import { DIFFICULTY, QUESTION_TYPES } from "@/lib/constants";
import { formatAnswer } from "@/lib/scoring";
import { Card, PageHeader, Pill, btn } from "@/components/ui";
import { Markdown } from "@/components/Markdown";
import { StemFigure, OptionList } from "@/components/QuestionFigures";
import { useLibraryItem } from "@/app/actions/library";

export default async function LibraryItem({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser("TEACHER", "ADMIN");
  const a = await prisma.assessment.findUnique({ where: { id }, include: { items: { include: { question: { include: { chapter: true } } }, orderBy: { position: "asc" } }, tasks: { orderBy: { position: "asc" } } } });
  if (!a || !a.libType) notFound();
  const coverage = await prisma.chapter.findMany({ where: { id: { in: JSON.parse(a.coverage ?? "[]") as string[] } }, orderBy: [{ part: "asc" }, { number: "asc" }] });
  const sections = (await teacherSections(user.id)).filter((s) => s.section.classLevel === a.classLevel);
  const marks = a.items.reduce((s, i) => s + i.marks, 0) + a.tasks.reduce((s, t) => s + t.marks, 0);
  const homework = a.libType === "ASSIGNMENT" || a.libType === "WORKSHEET";
  const copies = await prisma.assessment.count({ where: { sourceId: a.id, schoolId: user.schoolId } });

  return (
    <div className="space-y-6">
      <PageHeader
        title={a.title}
        subtitle={`Class ${a.classLevel} · ${LIB_LABEL[a.libType]} · ${a.items.length} questions${a.tasks.length ? ` + ${a.tasks.length} task` : ""} · ${marks} marks${a.durationMin ? ` · ${a.durationMin} min` : ""} · ${a.code}`}
        action={<Link href={`/teacher/library?cls=${a.classLevel}`} className={btn.secondary}>← Library</Link>}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Print">
          <p className="mb-3 text-sm text-ink-2">Three versions with shuffled question and option order (to discourage copying), plus answer keys.</p>
          <div className="flex flex-wrap gap-2">
            {["A", "B", "C"].map((v, i) => <Link key={v} href={`/teacher/tests/${a.id}/print?v=${i}`} target="_blank" className={btn.secondary}>🖨 Set {v}</Link>)}
            <Link href={`/teacher/tests/${a.id}/print?v=0&key=1`} target="_blank" className={btn.ghost}>Answer key</Link>
            <a href={`/api/tests/${a.id}/docx?v=0`} className={btn.ghost}>⬇ Word (.docx)</a>
          </div>
        </Card>
        <Card title="Use with my class">
          {sections.length ? (
            <form action={useLibraryItem.bind(null, a.id)} className="flex flex-wrap items-end gap-2">
              <label className="text-sm font-medium">Class<select name="sectionId" className="mt-1 block rounded-xl border border-line bg-surface px-3 py-2 text-sm">{sections.map((s) => <option key={s.section.id} value={s.section.id}>{s.section.classLevel}-{s.section.section}</option>)}</select></label>
              <label className="text-sm font-medium">Due date<input type="date" name="dueAt" className="mt-1 block rounded-xl border border-line bg-surface px-3 py-2 text-sm" /></label>
              <button className={btn.primary}>{homework ? "Set as homework" : "Assign online"}</button>
            </form>
          ) : <p className="text-sm text-muted">You don&apos;t teach a Class {a.classLevel} section. You can still print it.</p>}
          <p className="mt-2 text-xs text-muted">Makes your own copy (you can swap or remove questions) and assigns it. Students answer online; marking is automatic{a.tasks.length ? " except the task, which you mark" : ""}.{copies ? ` Your school has used this ${copies} time${copies > 1 ? "s" : ""}.` : ""}</p>
        </Card>
      </div>
      <Card title="Covers">
        <div className="flex flex-wrap gap-2">{coverage.map((c) => <Link key={c.id} href={`/teacher/chapter/${c.id}`}><Pill tone="brand">{c.part} {c.number}: {c.title}</Pill></Link>)}</div>
        {a.instructions && <p className="mt-3 text-sm text-ink-2">{a.instructions}</p>}
      </Card>
      {a.tasks.length > 0 && (
        <Card title="Task">
          {a.tasks.map((t) => <div key={t.id}><div className="font-semibold">{t.title} <span className="text-xs font-normal text-muted">· {t.marks} marks · teacher-marked</span></div><Markdown text={t.prompt} className="mt-1 text-sm" /></div>)}
        </Card>
      )}
      <Card title="Questions">
        <ol className="space-y-4">
          {a.items.map((it) => {
            const q = it.question;
            const opts = JSON.parse(q.options) as string[];
            return (
              <li key={it.id} className="rounded-2xl border border-line p-4">
                <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-sm font-bold">Q{it.position}</span>
                  {it.section === "B" && <Pill tone="warn">Section B</Pill>}
                  <Pill>{DIFFICULTY[q.difficulty as 1 | 2 | 3]}</Pill>
                  <Pill>{QUESTION_TYPES[q.type as keyof typeof QUESTION_TYPES]}</Pill>
                  <Pill tone="brand">{q.chapter.part} ch {q.chapter.number}</Pill>
                  <span className="ml-auto text-muted">{it.marks} mark{it.marks > 1 ? "s" : ""} · {q.code}</span>
                </div>
                <Markdown text={q.stem} />
                <StemFigure json={q.figure} />
                {q.type !== "ORDER" && <OptionList options={opts} figuresJson={q.optionFigures} />}
                <details className="mt-3 text-sm">
                  <summary className="cursor-pointer font-medium text-brand">Answer: {formatAnswer(q.type, opts, JSON.parse(q.answer))}</summary>
                  <div className="mt-2 text-ink-2"><Markdown text={q.solution} /></div>
                </details>
              </li>
            );
          })}
        </ol>
      </Card>
    </div>
  );
}
