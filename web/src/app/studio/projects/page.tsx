import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Card, PageHeader, Pill } from "@/components/ui";

export default async function StudioKits() {
  await requireUser("CONTENT", "SUPERADMIN");
  const kits = await prisma.projectKit.findMany({ include: { _count: { select: { milestones: true, criteria: true, runs: true } } }, orderBy: [{ classLevel: "asc" }, { code: "asc" }] });
  return (
    <div className="space-y-6">
      <PageHeader title="Project kits" subtitle="Classes 6–8 need two 20-hour interdisciplinary projects a year (CBSE). Classes 3–5 kits are optional enrichment." />
      <div className="grid gap-4 md:grid-cols-2">
        {kits.map((k) => (
          <Card key={k.id} title={<span>{k.emoji} {k.title}</span>} action={<Pill tone={k.published ? "good" : "default"}>{k.published ? "Published" : "Draft"}</Pill>}>
            <p className="text-sm text-ink-2">{k.tagline}</p>
            <p className="mt-2 text-xs text-muted">Class {k.classLevel} · {k.hours} hours · {k._count.milestones} milestones · {k._count.criteria} rubric criteria · used {k._count.runs}×</p>
            <Link href={`/studio/projects/${k.id}`} className="mt-3 inline-block text-sm font-semibold text-brand">Edit kit →</Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
