import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { teacherSections } from "@/lib/teacher";
import { budget, formatHours, KIND_LABEL, CALENDAR, RESERVED_PERIODS, periodLabels, type LessonKind } from "@/lib/plan";
import { PART_LABEL } from "@/lib/constants";
import { Card, PageHeader, Pill, Progress, Stat, btn } from "@/components/ui";
import { Markdown } from "@/components/Markdown";
import { toggleLesson } from "@/app/actions/library";
import { refHref, REF_ICON, type Ref } from "@/lib/libraryLinks";
import { unrecordedVideoIds } from "@/lib/videos";

const KIND_TONE: Record<string, "default" | "brand" | "good" | "warn" | "bad"> = { INTRODUCE: "brand", EXPLORE: "brand", PRACTISE: "default", ACTIVITY: "good", CHECK: "warn", REVISION: "warn", TERM_EXAM: "bad", ORIENTATION: "good" };

/** Week of the academic year (April = week 1, June skipped) for a date; null before April. */
function currentWeek(d: Date) {
  const names = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const month = names[d.getMonth()];
  if (month === "March") return 99;
  let w = 0;
  for (const c of CALENDAR) {
    if (c.month === month) return w + Math.min(c.weeks, Math.ceil(d.getDate() / 7));
    w += c.weeks;
  }
  return month === "June" ? CALENDAR.slice(0, 2).reduce((a, c) => a + c.weeks, 0) : w;
}

export default async function YearPlan({ searchParams }: { searchParams: Promise<{ section?: string; cls?: string; open?: string }> }) {
  const user = await requireUser("TEACHER", "ADMIN");
  const sp = await searchParams;
  const mine = await teacherSections(user.id);
  const section = mine.find((s) => s.section.id === sp.section)?.section ?? (sp.cls ? undefined : mine[0]?.section);
  const cls = section?.classLevel ?? Number(sp.cls ?? 3);
  const [lessons, chapters, logs] = await Promise.all([
    prisma.lesson.findMany({ where: { classLevel: cls }, include: { chapter: true }, orderBy: { number: "asc" } }),
    prisma.chapter.findMany({ where: { classLevel: cls }, orderBy: [{ part: "asc" }, { number: "asc" }] }),
    section ? prisma.lessonLog.findMany({ where: { sectionId: section.id } }) : Promise.resolve([]),
  ]);
  const done = new Map(logs.map((l) => [l.lessonId, l]));
  const label = periodLabels(lessons);
  const hidden = await unrecordedVideoIds(cls);
  const visible = (json: string) => (JSON.parse(json) as Ref[]).filter((r) => !(r.type === "VIDEO" && hidden.has(r.id)));
  const b = budget(cls);
  const week = currentWeek(new Date());
  const expected = lessons.filter((l) => l.week <= week).length;
  const taught = done.size;
  const next = lessons.find((l) => !done.has(l.id));
  const months = [...new Set(lessons.map((l) => l.month))];
  const parts = ["CT", "AI", "EVS"].filter((p) => chapters.some((c) => c.part === p));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Year plan"
        subtitle={`Class ${cls} · ${b.periods} periods of 40 minutes (${b.hours} hours)${b.projectHours ? ` · plus ${b.projectHours} hours of projects outside the timetable` : ""}`}
        action={<Link href={`/teacher/plan/print?cls=${cls}`} target="_blank" className={btn.secondary}>🖨 Print the plan</Link>}
      />
      <form className="flex flex-wrap gap-2">
        {mine.map((s) => <button key={s.section.id} name="section" value={s.section.id} className={section?.id === s.section.id ? btn.primary : btn.secondary}>{s.section.classLevel}-{s.section.section}</button>)}
        <span className="mx-1 self-center text-xs text-muted">or browse:</span>
        {[3, 4, 5, 6, 7, 8].map((c) => <button key={c} name="cls" value={c} className={!section && c === cls ? btn.primary : btn.ghost}>Class {c}</button>)}
      </form>

      {section && (
        <div className="grid gap-4 sm:grid-cols-4">
          <Stat label="Periods taught" value={`${taught} / ${lessons.length}`} />
          <Stat label="Expected by this week" value={Math.min(expected, lessons.length)} sub={`Week ${Math.min(week, 34)} of 34`} />
          <Stat label="Status" value={taught >= expected ? "On track" : `${expected - taught} behind`} tone={taught >= expected ? "good" : "warn"} />
          <Stat label="Next period" value={next ? label.get(next.id)! : "Done"} sub={next?.title} />
        </div>
      )}
      {section && <Progress value={taught} max={lessons.length} label="Periods taught" />}

      <Card title="Chapter-wise time" action={<span className="text-xs text-muted">CBSE: {cls <= 5 ? "50 h a year inside Maths and EVS (TWAU)" : "40 h CT + 20 h AI in class; 40 h projects"}</span>}>
        <div className="grid gap-6 lg:grid-cols-2">
          {parts.map((part) => (
            <div key={part} className="overflow-x-auto">
              <div className="mb-2 text-sm font-semibold">{PART_LABEL[part]}</div>
              <table className="w-full text-sm">
                <thead><tr className="text-left text-xs text-muted"><th className="py-1">Chapter</th><th className="text-right">Periods</th><th className="text-right">Time</th></tr></thead>
                <tbody>
                  {chapters.filter((c) => c.part === part).map((c) => (
                    <tr key={c.id} className="border-t border-line"><td className="py-1">{c.number}. {c.title}</td><td className="text-right tabular-nums">{c.periods}</td><td className="text-right tabular-nums text-muted">{formatHours(c.periods ?? 0)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted">Also in the plan: 1 getting-started period and, each term, 1 revision period and 1 term exam ({RESERVED_PERIODS} periods). CBSE does not set hours for individual CT chapters, so they share the time equally; AI chapters follow CBSE&apos;s 5 hours each.</p>
      </Card>

      {months.map((month) => (
        <Card key={month} title={`${month} · Term ${lessons.find((l) => l.month === month)!.term}`}>
          <ol className="divide-y divide-line">
            {lessons.filter((l) => l.month === month).map((l) => {
              const refs = visible(l.refs);
              const hw = visible(l.homework);
              const log = done.get(l.id);
              return (
                <li key={l.id} id={`p${l.number}`} className={`py-3 ${log ? "opacity-70" : ""}`}>
                  <div className="flex flex-wrap items-start gap-3">
                    {section ? (
                      <form action={toggleLesson.bind(null, l.id, section.id)}>
                        <button aria-label={log ? `Mark ${label.get(l.id)} as not taught` : `Mark ${label.get(l.id)} as taught`} className={`flex h-7 w-7 items-center justify-center rounded-lg border-2 text-sm ${log ? "border-good bg-good text-white" : "border-line bg-surface"}`}>{log ? "✓" : ""}</button>
                      </form>
                    ) : <span className="w-7" />}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-muted">{label.get(l.id)} · wk {l.week}</span>
                        <Pill tone={KIND_TONE[l.kind]}>{KIND_LABEL[l.kind as LessonKind]}</Pill>
                        <span className="font-semibold">{l.title}</span>
                        {log && <span className="text-xs text-good">taught {log.doneOn.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>}
                      </div>
                      <p className="mt-0.5 text-sm text-ink-2">🎯 {l.objective}</p>
                      {(refs.length > 0 || hw.length > 0 || l.kind === "INTRODUCE") && (
                        <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                          {l.kind === "INTRODUCE" && l.chapterId && <a href={`/api/slides/${l.chapterId}`} className="text-brand hover:underline">📊 Class slides</a>}
                          {refs.map((r, i) => <Link key={i} href={refHref(r)} className="text-brand hover:underline">{REF_ICON[r.type]} {r.label}</Link>)}
                          {hw.map((r, i) => <Link key={`h${i}`} href={refHref(r)} className="text-ink-2 hover:underline">🏠 Homework: {r.label}</Link>)}
                        </div>
                      )}
                      <details className="mt-1.5 text-sm" open={sp.open === String(l.number)}>
                        <summary className="cursor-pointer text-xs font-medium text-brand">Lesson plan (40 min)</summary>
                        <div className="mt-2 rounded-xl bg-surface-2 p-3"><Markdown text={l.flow} /></div>
                      </details>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </Card>
      ))}
    </div>
  );
}
