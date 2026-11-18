import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Card, PageHeader } from "@/components/ui";
import { EditHqStaffForm } from "@/components/EditForms";

export default async function EditHqStaff({ params }: { params: Promise<{ id: string }> }) {
  const me = await requireUser("SUPERADMIN");
  const { id } = await params;
  const u = await prisma.user.findFirst({ where: { id, schoolId: me.schoolId } });
  if (!u) notFound();
  const groups = await prisma.schoolGroup.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });
  return (
    <div className="space-y-6">
      <PageHeader title="Edit staff login" subtitle={`${u.name} · ${u.username}`} action={<Link href="/hq/staff" className="text-sm font-semibold text-brand">← Back to staff accounts</Link>} />
      <Card><EditHqStaffForm staff={{ id: u.id, role: u.role, name: u.name, username: u.username, email: u.email, phone: u.phone, schoolGroupId: u.schoolGroupId }} groups={groups} /></Card>
    </div>
  );
}
