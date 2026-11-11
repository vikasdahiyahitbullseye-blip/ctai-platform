import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Card, PageHeader, Pill, LinkButton, Empty } from "@/components/ui";

const RESOURCE_KINDS: Record<string, string> = { MODULE: "Learning module", VIDEO: "Concept video", WORKSHEET: "Worksheet", LESSON_PLAN: "Lesson plan", ACTIVITY_CARD: "Activity card", SLIDES: "Slides", TEMPLATE: "Template", GUIDE: "Guide" };

export default async function StudioResources({ searchParams }: { searchParams: Promise<{ kind?: string; cls?: string; ready?: string }> }) {
  await requireUser("CONTENT", "SUPERADMIN");
  const sp = await searchParams;
  const items = await prisma.resource.findMany({ where: { status: { not: "INTERNAL" }, ...(sp.kind ? { kind: sp.kind } : {}), ...(sp.cls ? { classLevel: Number(sp.cls) } : {}), ...(sp.ready === "no" ? { url: null, fileId: null } : {}) }, include: { chapter: true, file: true }, orderBy: [{ classLevel: "asc" }, { kind: "asc" }, { position: "asc" }, { createdAt: "desc" }], take: 300 });
  const sel = "rounded-xl border border-line bg-surface px-3 py-2 text-sm";
  return (
    <div className="space-y-6">
      <PageHeader title="Resources" subtitle="Lesson plans, worksheets, activity cards, templates and videos shown to teachers and students." action={<LinkButton href="/studio/resources/new">+ New resource</LinkButton>} />
      <Card>
        <form className="flex flex-wrap items-end gap-2">
          <select name="kind" defaultValue={sp.kind ?? ""} className={sel}><option value="">All types</option>{Object.entries(RESOURCE_KINDS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
          <select name="cls" defaultValue={sp.cls ?? ""} className={sel}><option value="">All classes</option>{[3, 4, 5, 6, 7, 8].map((c) => <option key={c} value={c}>Class {c}</option>)}</select>
          <select name="ready" defaultValue={sp.ready ?? ""} className={sel}><option value="">With or without media</option><option value="no">No link or file yet (e.g. videos to record)</option></select>
          <button className="rounded-xl border border-line px-3 py-2 text-sm font-semibold">Filter</button>
          <span className="text-xs text-muted">{items.length} shown</span>
        </form>
      </Card>
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
