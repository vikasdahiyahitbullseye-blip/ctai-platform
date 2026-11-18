import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Card, PageHeader } from "@/components/ui";
import { EditSchoolForm } from "@/components/EditForms";

export default async function EditSchool({ params }: { params: Promise<{ id: string }> }) {
  await requireUser("SUPERADMIN");
  const { id } = await params;
  const s = await prisma.school.findUnique({ where: { id }, include: { group: true, users: { where: { role: "ADMIN" }, select: { name: true, username: true } } } });
  if (!s || s.isHq) notFound();
  return (
    <div className="space-y-6">
      <PageHeader title="Edit school" subtitle={s.name} action={<Link href="/hq" className="text-sm font-semibold text-brand">← Back to schools</Link>} />
      <Card title="School details"><EditSchoolForm school={{ id: s.id, name: s.name, city: s.city, code: s.code, session: s.session }} /></Card>
      <Card title="People">
        <p className="text-sm text-ink-2">School admins: {s.users.map((u) => `${u.name} (${u.username})`).join(", ") || "none"}. {s.group ? `Part of ${s.group.name}.` : ""}</p>
        <p className="mt-1 text-xs text-muted">The school&apos;s own admin (or its group admin) edits its students, teachers and admins.</p>
      </Card>
    </div>
  );
}
