import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import { ResourceForm } from "../ResourceForm";

export default async function NewResource() {
  await requireUser("CONTENT", "SUPERADMIN");
  const chapters = (await prisma.chapter.findMany({ orderBy: [{ classLevel: "asc" }, { part: "asc" }, { number: "asc" }] })).map((c) => ({ id: c.id, classLevel: c.classLevel, label: `${c.part} ${c.number}: ${c.title}` }));
  return (
    <div>
      <PageHeader title="New resource" />
      <ResourceForm id={null} chapters={chapters} init={{ title: "", kind: "WORKSHEET", audience: "TEACHER", classLevel: null, chapterId: null, description: "", body: "", url: "", published: true }} />
    </div>
  );
}
