import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { teacherSections } from "@/lib/teacher";
import { PageHeader } from "@/components/ui";
import { HomeworkForm } from "./HomeworkForm";

export default async function NewHomework({ searchParams }: { searchParams: Promise<{ chapter?: string }> }) {
  const user = await requireUser("TEACHER", "ADMIN");
  const { chapter } = await searchParams;
  const sections = await teacherSections(user.id);
  const chapters = await prisma.chapter.findMany({
    where: { classLevel: { in: sections.map((s) => s.section.classLevel) } },
    include: { _count: { select: { questions: { where: { isPuzzle: false, status: "PUBLISHED" } } } } },
    orderBy: [{ classLevel: "asc" }, { part: "asc" }, { number: "asc" }],
  });
  return (
    <div>
      <PageHeader title="New homework" subtitle="Questions are marked automatically. Activities (e.g. 'keep a water diary', 'find 3 AI apps at home') are marked by you." />
      <HomeworkForm
        sections={sections.map((s) => ({ id: s.section.id, label: `Class ${s.section.classLevel}-${s.section.section}`, classLevel: s.section.classLevel }))}
        chapters={chapters.map((c) => ({ id: c.id, classLevel: c.classLevel, label: `${c.part === "CT" ? "" : c.part + " "}${c.number}. ${c.title}`, n: c._count.questions }))}
        preselect={chapter}
      />
    </div>
  );
}
