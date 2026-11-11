import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { PART_LABEL } from "@/lib/constants";
import { PageHeader, btn } from "@/components/ui";
import { LearnView } from "@/components/LearnView";
import { RECORDED, isRecorded } from "@/lib/videos";

export default async function TeacherLearn({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireUser("TEACHER", "ADMIN");
  const r = await prisma.resource.findUnique({ where: { id }, include: { chapter: true } });
  if (!r || !["MODULE", "VIDEO"].includes(r.kind) || (r.kind === "VIDEO" && !isRecorded(r))) notFound();
  const siblings = r.chapterId ? await prisma.resource.findMany({ where: { chapterId: r.chapterId, OR: [{ kind: "MODULE" }, { kind: "VIDEO", ...RECORDED }] }, orderBy: [{ kind: "asc" }, { position: "asc" }], select: { id: true, title: true, kind: true } }) : [];
  return (
    <div className="space-y-5">
      <PageHeader title={r.title} subtitle={r.chapter ? `Class ${r.classLevel} · ${PART_LABEL[r.chapter.part]} · Chapter ${r.chapter.number}` : undefined} action={<Link href={`/teacher/library?cls=${r.classLevel}`} className={btn.secondary}>← Library</Link>} />
      {siblings.length > 1 && <nav className="flex flex-wrap gap-2">{siblings.map((s) => <Link key={s.id} href={`/teacher/learn/${s.id}`} className={s.id === r.id ? btn.primary : btn.secondary}>{s.kind === "MODULE" ? "📘 Module" : `🎬 ${s.title.split(":")[0]}`}</Link>)}</nav>}
      <LearnView r={r} forStudent={false} />
    </div>
  );
}
