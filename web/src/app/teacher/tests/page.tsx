import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Card, PageHeader, LinkButton, Pill, Empty } from "@/components/ui";

export default async function TestsList() {
  const user = await requireUser("TEACHER", "ADMIN");
  const tests = await prisma.assessment.findMany({
    where: { schoolId: user.schoolId, kind: "TEST" },
    include: { items: true, assignments: { include: { section: true } }, _count: { select: { attempts: { where: { submittedAt: { not: null } } } } } },
    orderBy: { createdAt: "desc" },
  });
  return (
    <div>
      <PageHeader title="Tests" subtitle="Papers you have generated — print them or assign them online" action={<LinkButton href="/teacher/generator">+ New test</LinkButton>} />
      <Card>
        {tests.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead><tr className="text-left text-xs text-muted"><th className="py-2 font-medium">Title</th><th className="py-2 font-medium">Class</th><th className="py-2 font-medium">Assigned to</th><th className="py-2 text-right font-medium">Questions</th><th className="py-2 text-right font-medium">Submissions</th><th className="py-2 text-right font-medium">Created</th></tr></thead>
              <tbody>
                {tests.map((t) => (
                  <tr key={t.id} className="border-t border-line">
                    <td className="py-2.5"><Link href={`/teacher/tests/${t.id}`} className="font-medium text-brand">{t.title}</Link></td>
                    <td className="py-2.5">{t.classLevel}</td>
                    <td className="py-2.5">{t.assignments.length ? t.assignments.map((a) => <Pill key={a.id} tone="brand">{a.section.classLevel}-{a.section.section}</Pill>) : <Pill>Not assigned</Pill>}</td>
                    <td className="py-2.5 text-right tabular-nums">{t.items.length}</td>
                    <td className="py-2.5 text-right tabular-nums">{t._count.attempts}</td>
                    <td className="py-2.5 text-right text-muted">{t.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <Empty>No tests yet. Create one with the test generator.</Empty>}
      </Card>
    </div>
  );
}
