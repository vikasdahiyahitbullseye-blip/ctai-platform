import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { studentSection, assignedWork } from "@/lib/student";
import { Card, PageHeader, Pill, btn, Empty } from "@/components/ui";
import { startAssigned } from "@/app/actions/student";

const STATUS = {
  DUE: <Pill tone="brand">To do</Pill>,
  IN_PROGRESS: <Pill tone="warn">In progress</Pill>,
  SUBMITTED: <Pill tone="good">Submitted</Pill>,
  MISSED: <Pill tone="bad">Missed</Pill>,
} as const;

export default async function TestsPage() {
  const user = await requireUser("STUDENT");
  const section = await studentSection(user.id);
  if (!section) return <Empty>Not enrolled.</Empty>;
  const work = await assignedWork(user.id, section.id);
  return (
    <div>
      <PageHeader title="Tests & assignments" subtitle="Work set by your teacher" />
      <Card>
        {work.length ? (
          <ul className="divide-y divide-line">
            {work.map((w) => (
              <li key={w.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 font-semibold">{w.kind === "ASSIGNMENT" ? "📝" : "🧪"} {w.title} {STATUS[w.status as keyof typeof STATUS]}{w.needsMarking && <Pill tone="warn">Being marked</Pill>}</div>
                  <div className="mt-0.5 text-sm text-muted">
                    {w.kind === "ASSIGNMENT" ? "Homework · " : "Test · "}{w.questions} questions{w.tasks ? ` + ${w.tasks} activit${w.tasks > 1 ? "ies" : "y"}` : ""} · {w.marks} marks{w.durationMin ? ` · ${w.durationMin} min` : ""}
                    {w.dueAt ? ` · due ${w.dueAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}` : ""}
                  </div>
                </div>
                {w.status === "SUBMITTED" ? (
                  <Link href={`/student/result/${w.attemptId}`} className={btn.secondary}>
                    {w.score ?? 0}/{w.maxScore} · View
                  </Link>
                ) : w.status !== "MISSED" ? (
                  <form action={startAssigned.bind(null, w.id)}><button className={btn.primary}>{w.status === "IN_PROGRESS" ? "Continue" : "Start"}</button></form>
                ) : null}
              </li>
            ))}
          </ul>
        ) : <Empty>No tests yet.</Empty>}
      </Card>
    </div>
  );
}
