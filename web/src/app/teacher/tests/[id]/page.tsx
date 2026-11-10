import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { requireTestAccess, teacherSections, itemAnalysis } from "@/lib/teacher";
import { formatAnswer } from "@/lib/scoring";
import { skillName, parseSkills } from "@/lib/progress";
import { DIFFICULTY, QUESTION_TYPES } from "@/lib/constants";
import { Markdown } from "@/components/Markdown";
import { StemFigure, OptionList } from "@/components/QuestionFigures";
import { Card, PageHeader, Pill, Stat, btn, Empty } from "@/components/ui";
import { DistributionChart } from "@/components/Charts";
import { swapItem, removeItem, assignTest } from "@/app/actions/teacher";

export default async function TestDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ new?: string }> }) {
  const { id } = await params;
  const { new: isNew } = await searchParams;
  const user = await requireUser("TEACHER", "ADMIN");
  await requireTestAccess(user, id);
  const test = await prisma.assessment.findUniqueOrThrow({
    where: { id },
    include: {
      items: { include: { question: { include: { chapter: true } } }, orderBy: { position: "asc" } },
      assignments: { include: { section: true } },
      attempts: { include: { user: true }, orderBy: { score: "desc" } },
    },
  });
  const sections = (await teacherSections(user.id)).filter((s) => s.section.classLevel === test.classLevel);
  const meta = JSON.parse(test.blueprint ?? "{}") as { warnings?: string[]; sectionId?: string };
  const started = test.attempts.length > 0;
  const submitted = test.attempts.filter((a) => a.submittedAt);
  const totalMarks = test.items.reduce((s, i) => s + i.marks, 0);
  const diff = [1, 2, 3].map((d) => test.items.filter((i) => i.question.difficulty === d).length);
  const chapters = [...new Map(test.items.map((i) => [i.question.chapterId, i.question.chapter])).values()];
  const analysis = submitted.length ? await itemAnalysis(id) : [];
  const bands = ["0–39%", "40–64%", "65–84%", "85–100%"].map((band, i) => ({
    band,
    count: submitted.filter((a) => {
      const p = ((a.score ?? 0) / (a.maxScore || 1)) * 100;
      return i === 0 ? p < 40 : i === 1 ? p >= 40 && p < 65 : i === 2 ? p >= 65 && p < 85 : p >= 85;
    }).length,
  }));
  const avg = submitted.length ? Math.round((submitted.reduce((s, a) => s + (a.score ?? 0) / (a.maxScore || 1), 0) / submitted.length) * 100) : null;
  const assignedTo = test.assignments[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title={test.title}
        subtitle={`Class ${test.classLevel} · ${test.items.length} questions · ${totalMarks} marks${test.durationMin ? ` · ${test.durationMin} min` : ""}`}
        action={<Link href="/teacher/tests" className={btn.secondary}>All tests</Link>}
      />
      {isNew && <div className="rounded-2xl border border-good bg-good-soft p-4 text-sm text-good" role="status">Paper generated. Review the questions below, swap any you don&apos;t want, then print it or assign it online.</div>}
      {meta.warnings?.length ? <div className="rounded-2xl border border-warn bg-warn-soft p-4 text-sm text-warn">{meta.warnings.map((w) => <p key={w}>⚠ {w}</p>)}</div> : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Print or download">
          <div className="grid gap-2">
            {[0, 1, 2].map((v) => (
              <div key={v} className="flex gap-2">
                <Link target="_blank" href={`/teacher/tests/${id}/print?v=${v}`} className={`${btn.secondary} flex-1`}>🖨 Paper {"ABC"[v]}</Link>
                <Link target="_blank" href={`/teacher/tests/${id}/print?v=${v}&key=1`} className={`${btn.secondary} flex-1`}>Key {"ABC"[v]}</Link>
              </div>
            ))}
            <a href={`/api/tests/${id}/docx?v=0`} className={btn.secondary}>⬇ Word file (Paper A + key)</a>
          </div>
          <p className="mt-3 text-xs text-muted">Papers B and C have the same questions in a different order with shuffled options, to reduce copying.</p>
        </Card>
        <Card title="Assign online" className="lg:col-span-2">
          {sections.length ? (
            <form action={assignTest.bind(null, id)} className="grid gap-4 sm:grid-cols-3">
              <label className="block text-sm">
                <span className="font-medium">Class</span>
                <select name="sectionId" defaultValue={assignedTo?.sectionId ?? meta.sectionId} className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2">
                  {sections.map((s) => <option key={s.section.id} value={s.section.id}>Class {s.section.classLevel}-{s.section.section}</option>)}
                </select>
              </label>
              <label className="block text-sm">
                <span className="font-medium">Due date</span>
                <input type="date" name="dueAt" defaultValue={assignedTo?.dueAt?.toISOString().slice(0, 10)} className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2" />
              </label>
              <label className="block text-sm">
                <span className="font-medium">Show answers</span>
                <select name="showAnswers" defaultValue={assignedTo?.showAnswers ?? "AFTER_SUBMIT"} className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2">
                  <option value="AFTER_SUBMIT">Right after submitting</option>
                  <option value="AFTER_DUE">After the due date</option>
                </select>
              </label>
              <div className="flex flex-wrap items-center gap-3 sm:col-span-3">
                <button className={btn.primary}>{assignedTo ? "Update assignment" : "Assign to class"}</button>
                {test.assignments.map((a) => <Pill key={a.id} tone="good">Assigned to {a.section.classLevel}-{a.section.section}{a.dueAt ? ` · due ${a.dueAt.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}` : ""}</Pill>)}
              </div>
            </form>
          ) : <Empty>You don&apos;t teach a Class {test.classLevel} section.</Empty>}
        </Card>
      </div>

      {submitted.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-4">
            <Stat label="Submitted" value={`${submitted.length}`} sub={`${test.attempts.length - submitted.length} in progress`} />
            <Stat label="Average" value={`${avg}%`} />
            <Stat label="Highest" value={`${Math.max(...submitted.map((a) => a.score ?? 0))}/${totalMarks}`} />
            <Stat label="Lowest" value={`${Math.min(...submitted.map((a) => a.score ?? 0))}/${totalMarks}`} />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card title="Score distribution"><DistributionChart data={bands} /></Card>
            <Card title="Student scores">
              <ul className="max-h-64 divide-y divide-line overflow-y-auto text-sm">
                {submitted.map((a) => (
                  <li key={a.id} className="flex justify-between py-2">
                    <Link href={`/teacher/student/${a.userId}`} className="hover:text-brand">{a.user.name}</Link>
                    <span className="tabular-nums">{a.score}/{a.maxScore}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
          <Card title="Item analysis" action={<span className="text-xs text-muted">% correct per question · common wrong answers</span>}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead><tr className="text-left text-xs text-muted"><th className="py-2 font-medium">Q</th><th className="py-2 font-medium">Question</th><th className="py-2 font-medium">Skill</th><th className="py-2 text-right font-medium">% correct</th><th className="py-2 text-right font-medium">Skipped</th><th className="py-2 pl-4 font-medium">Note</th></tr></thead>
                <tbody>
                  {analysis.map((r) => {
                    const pct = r.p === null ? null : Math.round(r.p * 100);
                    const topWrong = Object.entries(r.distractors).filter(([k]) => Number(k) !== Number(JSON.parse(r.question.answer))).sort((a, b) => b[1] - a[1])[0];
                    return (
                      <tr key={r.position} className="border-t border-line align-top">
                        <td className="py-2 font-semibold">{r.position}</td>
                        <td className="max-w-md py-2"><span className="line-clamp-2">{r.question.stem.replace(/\*\*/g, "").replace(/\n+/g, " ")}</span></td>
                        <td className="py-2 text-xs">{parseSkills(r.question.skills).map(skillName).join(", ")}</td>
                        <td className="py-2 text-right"><span className={`rounded-md px-2 py-0.5 font-semibold tabular-nums ${pct === null ? "" : pct >= 65 ? "bg-good-soft text-good" : pct >= 40 ? "bg-warn-soft text-warn" : "bg-bad-soft text-bad"}`}>{pct ?? "—"}%</span></td>
                        <td className="py-2 text-right tabular-nums">{r.skipped}</td>
                        <td className="py-2 pl-4 text-xs text-muted">
                          {r.flag && <div className="text-warn">{r.flag}</div>}
                          {topWrong && topWrong[1] >= 2 && <div>{topWrong[1]} chose ({String.fromCharCode(97 + Number(topWrong[0]))}) {r.options[Number(topWrong[0])]}</div>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      <Card title="Questions on this paper" action={<span className="text-xs text-muted">Easy {diff[0]} · Medium {diff[1]} · Hard {diff[2]} · {chapters.length} chapter{chapters.length > 1 ? "s" : ""}</span>}>
        {started && <p className="mb-4 text-sm text-muted">Students have started this test, so questions can no longer be changed.</p>}
        <ol className="space-y-4">
          {test.items.map((it) => {
            const q = it.question;
            const opts = JSON.parse(q.options) as string[];
            return (
              <li key={it.id} className="rounded-2xl border border-line p-4">
                <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-sm font-bold">Q{it.position}</span>
                  <Pill>{DIFFICULTY[q.difficulty as 1 | 2 | 3]}</Pill>
                  <Pill>{QUESTION_TYPES[q.type as keyof typeof QUESTION_TYPES]}</Pill>
                  <Pill tone="brand">{q.chapter.part === "AI" ? "AI " : ""}Ch {q.chapter.number}</Pill>
                  {parseSkills(q.skills).map((s) => <Pill key={s}>{skillName(s)}</Pill>)}
                  <span className="ml-auto text-muted">{it.marks} mark{it.marks > 1 ? "s" : ""} · {q.code}</span>
                </div>
                <Markdown text={q.stem} />
                <StemFigure json={q.figure} />
                <OptionList options={opts} figuresJson={q.optionFigures} />
                <details className="mt-3 text-sm">
                  <summary className="cursor-pointer font-medium text-brand">Answer: {formatAnswer(q.type, opts, JSON.parse(q.answer))}</summary>
                  <div className="mt-2 text-ink-2"><Markdown text={q.solution} /></div>
                </details>
                {!started && (
                  <div className="mt-3 flex gap-2">
                    <form action={swapItem.bind(null, id, it.id)}><button className={btn.secondary}>↻ Swap question</button></form>
                    <form action={removeItem.bind(null, id, it.id)}><button className={btn.ghost}>Remove</button></form>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </Card>
    </div>
  );
}
