import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { teacherSections } from "@/lib/teacher";
import { Card, PageHeader, LinkButton, Pill, Empty } from "@/components/ui";

export default async function HomeworkList() {
  const user = await requireUser("TEACHER", "ADMIN");
  const sectionIds = (await teacherSections(user.id)).map((s) => s.section.id);
  const hw = await prisma.assessment.findMany({
    where: { kind: "ASSIGNMENT", assignments: { some: { sectionId: { in: sectionIds } } } },
    include: { items: true, tasks: true, assignments: { include: { section: { include: { _count: { select: { enrollments: true } } } } } }, attempts: { select: { submittedAt: true, needsMarking: true } } },
    orderBy: { createdAt: "desc" },
  });
  const toMark = hw.reduce((s, h) => s + h.attempts.filter((a) => a.needsMarking).length, 0);
  return (
    <div className="space-y-6">
      <PageHeader title="Homework" subtitle="Mix auto-marked questions with hands-on activities students do at home (written answers or photos)." action={<LinkButton href="/teacher/assignments/new">+ New homework</LinkButton>} />
      {toMark > 0 && <div className="rounded-2xl border border-warn bg-warn-soft p-4 text-sm text-warn">📥 {toMark} submission{toMark > 1 ? "s" : ""} waiting for marking.</div>}
      <Card>
        {hw.length === 0 ? <Empty>No homework yet.</Empty> : (
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-muted"><th className="py-2">Title</th><th>Class</th><th>Due</th><th className="text-right">Content</th><th className="text-right">Handed in</th><th className="text-right">To mark</th></tr></thead>
            <tbody>
              {hw.map((h) => {
                const a = h.assignments[0];
                const sub = h.attempts.filter((x) => x.submittedAt).length;
                const mark = h.attempts.filter((x) => x.needsMarking).length;
                return (
                  <tr key={h.id} className="border-t border-line">
                    <td className="py-2"><Link href={`/teacher/assignments/${h.id}`} className="font-medium text-brand">{h.title}</Link></td>
                    <td>{a ? `${a.section.classLevel}-${a.section.section}` : "—"}</td>
                    <td className="text-muted">{a?.dueAt ? a.dueAt.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}</td>
                    <td className="text-right text-xs">{h.items.length} Q · {h.tasks.length} activity</td>
                    <td className="text-right tabular-nums">{sub}/{a?.section._count.enrollments ?? 0}</td>
                    <td className="text-right">{mark ? <Pill tone="warn">{mark}</Pill> : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
