import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Card, PageHeader, Pill, LinkButton, Empty } from "@/components/ui";

const RESOURCE_KINDS: Record<string, string> = { WORKSHEET: "Worksheet", LESSON_PLAN: "Lesson plan", ACTIVITY_CARD: "Activity card", SLIDES: "Slides", VIDEO: "Video", TEMPLATE: "Template", GUIDE: "Guide" };

export default async function StudioResources() {
  await requireUser("CONTENT", "SUPERADMIN");
  const items = await prisma.resource.findMany({ include: { chapter: true, file: true }, orderBy: [{ classLevel: "asc" }, { createdAt: "desc" }] });
  return (
    <div className="space-y-6">
      <PageHeader title="Resources" subtitle="Lesson plans, worksheets, activity cards, templates and videos shown to teachers and students." action={<LinkButton href="/studio/resources/new">+ New resource</LinkButton>} />
      <Card>
        {items.length === 0 ? <Empty>No resources yet.</Empty> : (
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-muted"><th className="py-2">Title</th><th>Type</th><th>Class · chapter</th><th>For</th><th>Status</th></tr></thead>
            <tbody>{items.map((r) => (
              <tr key={r.id} className="border-t border-line">
                <td className="py-2"><Link href={`/studio/resources/${r.id}`} className="font-medium text-brand">{r.title}</Link>{r.file && " 📎"}{r.url && " 🔗"}</td>
                <td>{RESOURCE_KINDS[r.kind] ?? r.kind}</td>
                <td className="text-xs">{r.classLevel ?? "All"}{r.chapter ? ` · ${r.chapter.part} ${r.chapter.number}: ${r.chapter.title}` : ""}</td>
                <td className="text-xs">{r.audience}</td>
                <td><Pill tone={r.status === "PUBLISHED" ? "good" : "default"}>{r.status}</Pill></td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
