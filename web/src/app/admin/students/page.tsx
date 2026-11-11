import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Card, PageHeader, btn, Empty } from "@/components/ui";
import { AddStudentForm, ResetPasswordButton } from "../forms";
import { setActive, updateStudent } from "@/app/actions/admin";

export default async function StudentsPage({ searchParams }: { searchParams: Promise<{ section?: string; q?: string }> }) {
  const user = await requireUser("ADMIN");
  const sp = await searchParams;
  const sections = await prisma.classSection.findMany({ where: { schoolId: user.schoolId }, orderBy: [{ classLevel: "asc" }, { section: "asc" }] });
  const sectionId = sp.section ?? sections[0]?.id;
  const students = await prisma.user.findMany({
    where: { schoolId: user.schoolId, role: "STUDENT", ...(sp.q ? { name: { contains: sp.q } } : { enrollments: { some: { sectionId } } }) },
    include: { enrollments: { include: { section: true } } },
    orderBy: [{ rollNo: "asc" }, { name: "asc" }],
  });
  const sel = "rounded-lg border border-line bg-surface px-2 py-1 text-xs";
  const sectionOpts = sections.map((s) => ({ id: s.id, label: `Class ${s.classLevel}-${s.section}` }));
  return (
    <div className="space-y-6">
      <PageHeader title="Students" subtitle="Students don't need an email. Each gets a username and password you can print as a login slip." action={<Link href="/admin/import" className={btn.secondary}>⬆ Bulk import from Excel/CSV</Link>} />
      <Card title="Add one student">{sections.length ? <AddStudentForm sections={sectionOpts} schoolName={user.school.name} /> : <Empty>Create a class first.</Empty>}</Card>
      <Card>
        <form className="mb-4 flex flex-wrap items-end gap-2">
          <label className="text-xs text-muted">Class<br /><select name="section" defaultValue={sectionId} className="rounded-xl border border-line bg-surface px-3 py-2 text-sm">{sectionOpts.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}</select></label>
          <label className="text-xs text-muted">Search all classes<br /><input name="q" defaultValue={sp.q ?? ""} placeholder="Name" className="rounded-xl border border-line bg-surface px-3 py-2 text-sm" /></label>
          <button className={btn.secondary}>Show</button>
        </form>
        {students.length === 0 ? <Empty>No students found.</Empty> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead><tr className="text-left text-xs text-muted"><th className="py-2">Roll</th><th>Name</th><th>Username</th><th>Class (edit)</th><th className="text-right">Actions</th></tr></thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className={`border-t border-line ${s.active ? "" : "opacity-50"}`}>
                    <td className="py-2">{s.rollNo ?? "—"}</td>
                    <td className="font-medium">{s.name}</td>
                    <td className="font-mono text-xs">{s.username}</td>
                    <td>
                      <form action={updateStudent.bind(null, s.id)} className="flex flex-wrap items-center gap-1">
                        <input type="hidden" name="name" value={s.name} />
                        <input type="hidden" name="rollNo" value={s.rollNo ?? ""} />
                        <select name="sectionId" defaultValue={s.enrollments[0]?.sectionId} className={sel}>{sectionOpts.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}</select>
                        <button className="text-xs font-medium text-brand">Save</button>
                      </form>
                    </td>
                    <td className="space-x-3 text-right">
                      <ResetPasswordButton userId={s.id} schoolName={user.school.name} />
                      <form action={setActive.bind(null, s.id, !s.active)} className="inline"><button className={`text-xs font-medium ${s.active ? "text-bad" : "text-good"}`}>{s.active ? "Deactivate" : "Reactivate"}</button></form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
