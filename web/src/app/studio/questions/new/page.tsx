import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import { QuestionEditor } from "../QuestionEditor";

export default async function NewQuestion() {
  await requireUser("CONTENT", "SUPERADMIN");
  const chapters = await prisma.chapter.findMany({ select: { classLevel: true, part: true, number: true, title: true }, orderBy: [{ classLevel: "asc" }, { part: "asc" }, { number: "asc" }] });
  return (
    <div>
      <PageHeader title="New question" subtitle="Original questions only. Every question needs a worked solution and at least one skill tag." />
      <QuestionEditor id={null} chapters={chapters} initial={{ classLevel: 4, part: "CT", chapterNumber: 1, type: "MCQ", difficulty: 1, skills: [], stem: "", options: ["", "", "", ""], answer: "", solution: "", hint: "", marks: 1, isPuzzle: false }} />
    </div>
  );
}
