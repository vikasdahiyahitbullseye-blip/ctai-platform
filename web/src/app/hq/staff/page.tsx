import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Card, PageHeader, Pill, btn } from "@/components/ui";
import { toggleStaff } from "@/app/actions/hq";
import { CreateStaffForm } from "./CreateStaffForm";

const ROLE_NAME: Record<string, string> = { SUPERADMIN: "Super-admin", REVIEWER: "Question reviewer", CONTENT: "Content team", GROUPADMIN: "School group admin" };

export default async function StaffAccounts() {
  const me = await requireUser("SUPERADMIN");
  const staff = await prisma.user.findMany({ where: { schoolId: me.schoolId }, orderBy: [{ role: "asc" }, { name: "asc" }] });
  const approvals = await prisma.question.groupBy({ by: ["approvedById"], where: { approval: "APPROVED", approvedById: { not: null } }, _count: true });
  return (
    <div className="space-y-6">
      <PageHeader title="Staff accounts" subtitle="Hitbullseye team logins: question reviewers and the content team" />
      <Card title="Add a staff login"><CreateStaffForm /></Card>
      <Card title="Team">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead><tr className="text-left text-xs text-muted"><th className="py-2">Name</th><th>Username</th><th>Role</th><th className="text-right">Questions approved</th><th className="text-right">Status</th></tr></thead>
            <tbody>
              {staff.map((u) => (
                <tr key={u.id} className="border-t border-line">
                  <td className="py-2 font-medium">{u.name}</td>
                  <td><code className="font-mono text-xs">{u.username}</code></td>
                  <td>{ROLE_NAME[u.role] ?? u.role}</td>
                  <td className="text-right">{approvals.find((a) => a.approvedById === u.id)?._count ?? 0}</td>
                  <td className="text-right">
                    {u.role === "SUPERADMIN" ? <Pill tone="good">Active</Pill> : (
                      <form action={toggleStaff.bind(null, u.id)} className="inline-flex items-center gap-2">
                        <Pill tone={u.active ? "good" : "bad"}>{u.active ? "Active" : "Deactivated"}</Pill>
                        <button className={btn.ghost}>{u.active ? "Deactivate" : "Reactivate"}</button>
                      </form>
                    )}
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
