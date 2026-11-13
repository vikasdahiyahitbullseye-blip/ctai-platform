import { prisma } from "@/lib/db";
import { requireSchoolAdmin } from "@/lib/auth";
import { Card, PageHeader, Pill, btn, Empty } from "@/components/ui";
import { AddSectionForm } from "../forms";
import { assignTeacher, unassignTeacher, deleteSection } from "@/app/actions/admin";

const SUBJECT_LABEL: Record<string, string> = { CT: "CT (Maths/subject)", AI: "AI literacy", PROJECT: "Projects" };

export default async function ClassesPage() {
  const user = await requireSchoolAdmin();
  const [sections, teachers] = await Promise.all([
    prisma.classSection.findMany({ where: { schoolId: user.schoolId }, include: { _count: { select: { enrollments: true } }, teachers: { include: { user: true } } }, orderBy: [{ classLevel: "asc" }, { section: "asc" }] }),
    prisma.user.findMany({ where: { schoolId: user.schoolId, role: "TEACHER", active: true }, orderBy: { name: "asc" } }),
  ]);
  return (
    <div className="space-y-6">
      <PageHeader title="Classes & teacher mapping" subtitle="Create class sections and choose which teachers teach CT, AI and projects in each." />
      <Card title="Add a class section"><AddSectionForm /></Card>
      {sections.length === 0 && <Empty>No classes yet.</Empty>}
      <div className="grid gap-4 md:grid-cols-2">
        {sections.map((s) => (
          <Card key={s.id} title={`Class ${s.classLevel}-${s.section}`} action={<span className="text-sm text-muted">{s._count.enrollments} students</span>}>
            <ul className="mb-4 space-y-2">
              {s.teachers.length === 0 && <li className="text-sm text-muted">No teachers assigned.</li>}
              {s.teachers.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-2 text-sm">
                  <span>{t.user.name} <Pill tone="brand">{SUBJECT_LABEL[t.subject] ?? t.subject}</Pill></span>
                  <form action={unassignTeacher.bind(null, t.id)}><button className="text-xs text-bad">Remove</button></form>
                </li>
              ))}
            </ul>
            <form action={assignTeacher.bind(null, s.id)} className="flex flex-wrap gap-2">
              <select name="teacherId" className="flex-1 rounded-xl border border-line bg-surface px-3 py-2 text-sm">{teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
              <select name="subject" className="rounded-xl border border-line bg-surface px-3 py-2 text-sm">
                <option value="CT">CT</option>
                {s.classLevel >= 6 && <option value="AI">AI</option>}
                {s.classLevel >= 6 && <option value="PROJECT">Projects</option>}
              </select>
              <button className={btn.secondary}>Assign</button>
            </form>
            {s._count.enrollments === 0 && <form action={deleteSection.bind(null, s.id)} className="mt-3"><button className="text-xs text-bad">Delete this empty class</button></form>}
          </Card>
        ))}
      </div>
    </div>
  );
}
