import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { requireTestAccess } from "@/lib/teacher";
import { Card, PageHeader, Pill, Empty, btn } from "@/components/ui";
import { Markdown } from "@/components/Markdown";

export default async function HomeworkDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  const { id } = await params;
  const { created } = await searchParams;
  const user = await requireUser("TEACHER", "ADMIN");
  await requireTestAccess(user, id);
  const hw = await prisma.assessment.findUniqueOrThrow({
    where: { id },
    include: { items: { include: { question: true }, orderBy: { position: "asc" } }, tasks: { orderBy: { position: "asc" } }, assignments: { include: { section: { include: { enrollments: { include: { user: true }, orderBy: { user: { name: "asc" } } } } } } }, attempts: true },
  });
  const a = hw.assignments[0];
  const students = a?.section.enrollments.map((e) => e.user) ?? [];
  return (
    <div className="space-y-6">
      <PageHeader title={`📝 ${hw.title}`} subtitle={a ? `Class ${a.section.classLevel}-${a.section.section}${a.dueAt ? ` · due ${a.dueAt.toLocaleDateString("en-IN")}` : ""}` : ""} action={<Link href="/teacher/assignments" className={btn.secondary}>All homework</Link>} />
      {created && <div className="rounded-xl bg-good-soft p-3 text-sm text-good">Homework assigned. Students will see it on their home screen.</div>}
      <Card title="Submissions">
        {students.length === 0 ? <Empty>No students in this class.</Empty> : (
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-muted"><th className="py-2">Student</th><th>Status</th><th className="text-right">Score</th><th className="text-right" /></tr></thead>
            <tbody>
              {students.map((s) => {
                const at = hw.attempts.find((x) => x.userId === s.id);
                return (
                  <tr key={s.id} className="border-t border-line">
                    <td className="py-2">{s.name}</td>
                    <td>{!at ? <Pill>Not started</Pill> : !at.submittedAt ? <Pill tone="brand">In progress</Pill> : at.needsMarking ? <Pill tone="warn">To mark</Pill> : <Pill tone="good">Marked</Pill>}</td>
                    <td className="text-right tabular-nums">{at?.submittedAt ? `${at.score}/${at.maxScore}` : "—"}</td>
                    <td className="text-right">{at?.submittedAt && <Link href={`/teacher/marking/${at.id}`} className="font-semibold text-brand">{at.needsMarking ? "Mark →" : "View"}</Link>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
      {hw.tasks.length > 0 && <Card title="Activities">{hw.tasks.map((t) => <div key={t.id} className="mb-3 rounded-xl bg-accent-soft p-3 text-sm"><strong>{t.title}</strong> · {t.marks} marks<Markdown text={t.prompt} /></div>)}</Card>}
      {hw.items.length > 0 && <Card title={`Questions (${hw.items.length})`}><ol className="list-decimal space-y-2 pl-5 text-sm">{hw.items.map((it) => <li key={it.id}>{it.question.stem.replace(/\*\*/g, "").replace(/\n+/g, " ").slice(0, 140)}</li>)}</ol></Card>}
    </div>
  );
}
