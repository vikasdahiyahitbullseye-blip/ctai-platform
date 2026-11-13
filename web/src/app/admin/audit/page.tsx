import { prisma } from "@/lib/db";
import { requireSchoolAdmin } from "@/lib/auth";
import { Card, PageHeader, Empty } from "@/components/ui";

export default async function AuditPage() {
  const user = await requireSchoolAdmin();
  const logs = await prisma.auditLog.findMany({ where: { schoolId: user.schoolId }, orderBy: { createdAt: "desc" }, take: 200 });
  const actors = new Map((await prisma.user.findMany({ where: { id: { in: [...new Set(logs.map((l) => l.actorId))] } } })).map((u) => [u.id, u.name]));
  return (
    <div>
      <PageHeader title="Activity log" subtitle="Every change to accounts and classes is recorded here." />
      <Card>
        {logs.length === 0 ? <Empty>No admin activity yet.</Empty> : (
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-muted"><th className="py-2">When</th><th>Who</th><th>Action</th><th>Details</th></tr></thead>
            <tbody>{logs.map((l) => <tr key={l.id} className="border-t border-line"><td className="py-2 text-xs text-muted">{l.createdAt.toLocaleString("en-IN")}</td><td>{actors.get(l.actorId) ?? "—"}</td><td className="font-mono text-xs">{l.action}</td><td>{l.detail}</td></tr>)}</tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
