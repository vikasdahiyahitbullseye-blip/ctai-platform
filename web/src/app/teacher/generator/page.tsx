import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { teacherSections } from "@/lib/teacher";
import { PageHeader } from "@/components/ui";
import { GeneratorForm } from "./GeneratorForm";

export default async function GeneratorPage({ searchParams }: { searchParams: Promise<{ section?: string }> }) {
  const { section } = await searchParams;
  const user = await requireUser("TEACHER", "ADMIN");
  const sections = await teacherSections(user.id);
  const levels = [...new Set(sections.map((s) => s.section.classLevel))];
  const chapters = await prisma.chapter.findMany({
    where: { classLevel: { in: levels.length ? levels : [3, 4, 5, 6, 7, 8] } },
    orderBy: [{ classLevel: "asc" }, { part: "desc" }, { number: "asc" }],
    include: { questions: { where: { isPuzzle: false, status: "PUBLISHED" }, select: { difficulty: true } } },
  });
  return (
    <div>
      <PageHeader title="Test generator" subtitle="Choose what to test; we assemble a balanced paper from the question bank. You can review, swap questions, print or assign it online next." />
      <GeneratorForm
        sections={sections.map((s) => ({ id: s.section.id, label: `Class ${s.section.classLevel}-${s.section.section}`, classLevel: s.section.classLevel }))}
        chapters={chapters.map((c) => ({
          id: c.id, classLevel: c.classLevel, part: c.part, number: c.number, title: c.title,
          counts: [1, 2, 3].map((d) => c.questions.filter((q) => q.difficulty === d).length),
        }))}
        defaultSection={section}
      />
    </div>
  );
}
