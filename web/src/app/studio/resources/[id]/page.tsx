import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { PageHeader, btn } from "@/components/ui";
import { ResourceForm } from "../ResourceForm";
import { deleteResource } from "@/app/actions/studio";

export default async function EditResource({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const { id } = await params;
  const { saved } = await searchParams;
  await requireUser("CONTENT", "SUPERADMIN");
  const r = await prisma.resource.findUnique({ where: { id }, include: { file: true } });
  if (!r) notFound();
  const chapters = (await prisma.chapter.findMany({ orderBy: [{ classLevel: "asc" }, { part: "asc" }, { number: "asc" }] })).map((c) => ({ id: c.id, classLevel: c.classLevel, label: `${c.part} ${c.number}: ${c.title}` }));
  return (
    <div className="space-y-4">
      <PageHeader title={r.title} action={<form action={deleteResource.bind(null, id)}><button className={btn.ghost}>Delete</button></form>} />
      {saved && <div className="rounded-xl bg-good-soft p-3 text-sm text-good">Saved.</div>}
      <ResourceForm id={id} chapters={chapters} init={{ title: r.title, kind: r.kind, audience: r.audience, classLevel: r.classLevel, chapterId: r.chapterId, description: r.description ?? "", body: r.body ?? "", url: r.url ?? "", published: r.status === "PUBLISHED", fileName: r.file?.filename }} />
    </div>
  );
}
