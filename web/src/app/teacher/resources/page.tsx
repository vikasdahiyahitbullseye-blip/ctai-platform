import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { teacherSections } from "@/lib/teacher";
import { Card, PageHeader, Pill, Empty } from "@/components/ui";
import { Markdown } from "@/components/Markdown";

export default async function TeacherResources({ searchParams }: { searchParams: Promise<{ open?: string }> }) {
  const user = await requireUser("TEACHER", "ADMIN");
  const { open } = await searchParams;
  const levels = [...new Set((await teacherSections(user.id)).map((s) => s.section.classLevel))];
  const items = await prisma.resource.findMany({ where: { status: "PUBLISHED", audience: { in: ["TEACHER", "BOTH"] }, OR: [{ classLevel: null }, { classLevel: { in: levels } }] }, include: { chapter: true, file: true }, orderBy: [{ classLevel: "asc" }, { title: "asc" }] });
  return (
    <div className="space-y-6">
      <PageHeader title="Teaching resources" subtitle="Lesson plans, activity cards, templates and guides for your classes." />
      {items.length === 0 && <Empty>No resources yet.</Empty>}
      {items.map((r) => (
        <Card key={r.id} title={<span id={r.id}>{r.title}</span>} action={<span className="flex gap-1"><Pill>{r.kind.replace("_", " ").toLowerCase()}</Pill><Pill tone="brand">Class {r.classLevel ?? "all"}</Pill></span>}>
          {r.description && <p className="text-sm text-muted">{r.description}{r.chapter ? ` · Chapter: ${r.chapter.title}` : ""}</p>}
          {r.url && <p className="mt-2 text-sm">🔗 <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-brand underline">{r.url}</a></p>}
          {r.file && <p className="mt-2 text-sm">📎 <a href={`/api/files/${r.file.id}`} target="_blank" className="text-brand underline">{r.file.filename}</a></p>}
          {r.body && <details className="mt-3" open={open === r.id}><summary className="cursor-pointer text-sm font-semibold text-brand">Open</summary><div className="mt-3"><Markdown text={r.body} /></div></details>}
        </Card>
      ))}
    </div>
  );
}
