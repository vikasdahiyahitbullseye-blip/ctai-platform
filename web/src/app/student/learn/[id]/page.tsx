import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { studentSection } from "@/lib/student";
import { LearnView } from "@/components/LearnView";

export default async function StudentLearn({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser("STUDENT");
  const section = await studentSection(user.id);
  const r = await prisma.resource.findUnique({ where: { id }, include: { chapter: true } });
  if (!r || !["MODULE", "VIDEO"].includes(r.kind) || r.classLevel !== section?.classLevel || r.status !== "PUBLISHED") notFound();
  return (
    <div className="space-y-5">
      {r.chapter && <Link href={`/student/chapter/${r.chapter.id}`} className="text-sm font-bold text-brand">← Back to {r.chapter.title}</Link>}
      <h1 className="text-3xl font-extrabold">{r.kind === "MODULE" ? "📘" : "🎬"} {r.title.replace(/^Learning module: /, "")}</h1>
      <LearnView r={r} forStudent />
    </div>
  );
}
