import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { PART_LABEL } from "@/lib/constants";
import { Card, PageHeader, btn, Pill, Empty } from "@/components/ui";
import { SubjectLinks } from "@/components/SubjectLinks";
import { formatHours, KIND_LABEL, type LessonKind } from "@/lib/plan";

export default async function ChapterPlanner({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireUser("TEACHER", "ADMIN");
  const ch = await prisma.chapter.findUnique({ where: { id }, include: { links: true, resources: { where: { status: "PUBLISHED" }, include: { file: true } }, questions: { where: { status: "PUBLISHED" }, select: { difficulty: true, isPuzzle: true, type: true } } } });
  if (!ch) notFound();
  const [lessons, sets] = await Promise.all([
    prisma.lesson.findMany({ where: { chapterId: id }, orderBy: { number: "asc" } }),
    prisma.assessment.findMany({ where: { chapterId: id, libType: { not: null } }, orderBy: { libOrder: "asc" }, select: { id: true, title: true } }),
  ]);
  const diff = [1, 2, 3].map((d) => ch.questions.filter((q) => q.difficulty === d && !q.isPuzzle).length);
  return (
    <div className="space-y-6">
      <PageHeader title={`${ch.number}. ${ch.title}`} subtitle={`Class ${ch.classLevel} · ${PART_LABEL[ch.part]}${ch.periods ? ` · ${ch.periods} periods (${formatHours(ch.periods)})` : ""}`} action={<Link href={`/teacher/curriculum?cls=${ch.classLevel}`} className={btn.secondary}>Curriculum map</Link>} />
      {ch.focus && <Card title="Focus"><p>{ch.focus}</p>{ch.part === "CT" && <p className="mt-2 text-sm text-muted">Teach the NCERT Maths concept first, then use the CT questions in the same period (CBSE companion-book approach). Let students think before discussing — the process matters more than the answer.</p>}</Card>}
      <Card title="Where this thinking shows up in other subjects"><SubjectLinks links={ch.links} /></Card>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Use it in class">
          <p className="mb-3 text-sm">{ch.questions.length} published questions · Easy {diff[0]} · Medium {diff[1]} · Hard {diff[2]}</p>
          <div className="flex flex-wrap gap-2">
            <a href={`/api/slides/${ch.id}`} className={btn.primary}>📊 Class slides (.pptx)</a>
            <Link href={`/teacher/chapter/${ch.id}/worksheet`} target="_blank" className={btn.secondary}>🖨 Printable worksheet</Link>
            <Link href={`/teacher/chapter/${ch.id}/worksheet?key=1`} target="_blank" className={btn.secondary}>Worksheet answer key</Link>
            <Link href={`/teacher/assignments/new?chapter=${ch.id}`} className={btn.secondary}>📝 Set as homework</Link>
            <Link href={`/teacher/generator`} className={btn.secondary}>🧪 Make a test</Link>
            <Link href={`/teacher/questions?cls=${ch.classLevel}&ch=${ch.id}`} className={btn.ghost}>Browse questions</Link>
          </div>
        </Card>
        <Card title="Resources">
          {ch.resources.length ? (
            <ul className="space-y-2 text-sm">{ch.resources.map((r) => <li key={r.id}><Link href={r.kind === "MODULE" || r.kind === "VIDEO" ? `/teacher/learn/${r.id}` : `/teacher/resources?open=${r.id}`} className="font-medium text-brand">{r.kind === "MODULE" ? "📘 " : r.kind === "VIDEO" ? "🎬 " : ""}{r.title}</Link> <Pill>{r.kind.replace("_", " ").toLowerCase()}</Pill>{r.description && <div className="text-xs text-muted">{r.description}</div>}</li>)}</ul>
          ) : <Empty>No chapter-specific resources yet.</Empty>}
        </Card>
      </div>
      {lessons.length > 0 && (
        <Card title="In the year plan" action={<Link href={`/teacher/plan?cls=${ch.classLevel}&open=${lessons[0].number}#p${lessons[0].number}`} className="text-sm text-brand">Open the year plan →</Link>}>
          <ol className="space-y-1 text-sm">{lessons.map((l) => <li key={l.id}><span className="font-mono text-xs text-muted">#{l.number} · {l.month} wk {l.week}</span> · <strong>{KIND_LABEL[l.kind as LessonKind]}</strong> · {l.objective}</li>)}</ol>
        </Card>
      )}
      {sets.length > 0 && (
        <Card title="Library: tests, worksheets and assignments for this chapter">
          <ul className="grid gap-1 text-sm sm:grid-cols-2">{sets.map((a) => <li key={a.id}><Link href={`/teacher/library/${a.id}`} className="text-brand">{a.title}</Link></li>)}</ul>
        </Card>
      )}
    </div>
  );
}
