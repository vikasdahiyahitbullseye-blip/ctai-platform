import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireSchoolAdmin } from "@/lib/auth";
import { Card, PageHeader, Pill } from "@/components/ui";
import { EditPersonForm } from "@/components/EditForms";
import { ResetPasswordButton } from "../../forms";
import { setActive } from "@/app/actions/admin";

/** Edit one student or staff member of this school. */
export default async function EditPerson({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireSchoolAdmin();
  const { id } = await params;
  const u = await prisma.user.findFirst({ where: { id, schoolId: admin.schoolId, role: { in: ["STUDENT", "TEACHER", "ADMIN"] } }, include: { enrollments: { include: { section: true } }, teaching: { include: { section: true } } } });
  if (!u) notFound();
  const sections = await prisma.classSection.findMany({ where: { schoolId: admin.schoolId }, orderBy: [{ classLevel: "asc" }, { section: "asc" }] });
  const student = u.role === "STUDENT";
  const back = student ? `/admin/students${u.enrollments[0] ? `?section=${u.enrollments[0].sectionId}` : ""}` : "/admin/teachers";
  return (
    <div className="space-y-6">
      <PageHeader title={`Edit ${student ? "student" : u.role === "ADMIN" ? "school admin" : "teacher"}`} subtitle={`${u.name} · ${u.username}`} action={<Link href={back} className="text-sm font-semibold text-brand">← Back to {student ? "students" : "teachers & staff"}</Link>} />
      <Card title="Details">
        <EditPersonForm
          person={{ id: u.id, role: u.role, name: u.name, username: u.username, rollNo: u.rollNo, admissionNo: u.admissionNo, dateOfBirth: u.dateOfBirth, guardianName: u.guardianName, guardianPhone: u.guardianPhone, designation: u.designation, email: u.email, phone: u.phone, sectionId: u.enrollments[0]?.sectionId ?? null }}
          sections={sections.map((s) => ({ id: s.id, label: `Class ${s.classLevel}-${s.section}` }))}
          isSelf={u.id === admin.id}
        />
      </Card>
      <Card title="Account">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span>Status: {u.active ? <Pill tone="good">Active</Pill> : <Pill tone="bad">Deactivated</Pill>}</span>
          {!student && <span className="text-muted">Teaches: {[...new Set(u.teaching.map((t) => `${t.section.classLevel}-${t.section.section} ${t.subject}`))].join(", ") || "—"} (change on the Classes page)</span>}
          <ResetPasswordButton userId={u.id} schoolName={admin.school.name} />
          {u.id !== admin.id && <form action={setActive.bind(null, u.id, !u.active)}><button className={`text-xs font-medium ${u.active ? "text-bad" : "text-good"}`}>{u.active ? "Deactivate" : "Reactivate"}</button></form>}
        </div>
      </Card>
    </div>
  );
}
