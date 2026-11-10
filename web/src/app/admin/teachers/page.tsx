import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Card, PageHeader, Pill } from "@/components/ui";
import { AddTeacherForm, ResetPasswordButton } from "../forms";
import { setActive } from "@/app/actions/admin";

export default async function TeachersPage() {
  const user = await requireUser("ADMIN");
  const staff = await prisma.user.findMany({ where: { schoolId: user.schoolId, role: { in: ["TEACHER", "ADMIN"] } }, include: { teaching: { include: { section: true } } }, orderBy: [{ role: "desc" }, { name: "asc" }] });
  return (
    <div className="space-y-6">
      <PageHeader title="Teachers & staff" subtitle="New staff get a temporary password and must choose their own at first sign-in." />
      <Card title="Add a teacher or admin"><AddTeacherForm schoolName={user.school.name} /></Card>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead><tr className="text-left text-xs text-muted"><th className="py-2">Name</th><th>Username</th><th>Role</th><th>Teaches</th><th className="text-right">Actions</th></tr></thead>
            <tbody>
              {staff.map((t) => (
                <tr key={t.id} className={`border-t border-line ${t.active ? "" : "opacity-50"}`}>
                  <td className="py-2 font-medium">{t.name}</td>
                  <td className="font-mono text-xs">{t.username}</td>
                  <td>{t.role === "ADMIN" ? <Pill tone="warn">Admin</Pill> : <Pill>Teacher</Pill>}</td>
                  <td className="text-xs">{[...new Set(t.teaching.map((a) => `${a.section.classLevel}-${a.section.section} ${a.subject}`))].join(", ") || "—"}</td>
                  <td className="space-x-3 text-right">
                    <ResetPasswordButton userId={t.id} schoolName={user.school.name} />
                    {t.id !== user.id && <form action={setActive.bind(null, t.id, !t.active)} className="inline"><button className={`text-xs font-medium ${t.active ? "text-bad" : "text-good"}`}>{t.active ? "Deactivate" : "Reactivate"}</button></form>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
