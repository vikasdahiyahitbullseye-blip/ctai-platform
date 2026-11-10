import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { nextPracticeQuestion, practiceSetSize } from "@/lib/attempts";
import { toClient } from "@/lib/questions";
import { PracticePlayer } from "@/components/PracticePlayer";
import { TestPlayer } from "@/components/TestPlayer";
import { PageHeader } from "@/components/ui";

export default async function PlayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser("STUDENT");
  const attempt = await prisma.attempt.findUnique({
    where: { id },
    include: { responses: true, assessment: { include: { items: { include: { question: true }, orderBy: { position: "asc" } } } } },
  });
  if (!attempt || attempt.userId !== user.id) notFound();
  if (attempt.submittedAt) redirect(`/student/result/${id}`);
  const big = attempt.assessment.classLevel <= 5;
  const kind = attempt.assessment.kind;

  if (kind === "PRACTICE") {
    const [q, total] = await Promise.all([nextPracticeQuestion(prisma, id), practiceSetSize(prisma, id)]);
    return (
      <div>
        <PageHeader title={`Practice: ${attempt.assessment.title}`} />
        <PracticePlayer attemptId={id} initial={q ? toClient(q, { withHint: true }) : null} answered={attempt.responses.length} total={total} mode="PRACTICE" big={big} />
      </div>
    );
  }
  if (kind === "PUZZLE") {
    const q = attempt.assessment.items[0].question;
    return (
      <div>
        <PageHeader title="🧩 Puzzle of the Day" subtitle="One try only — think it through!" />
        <PracticePlayer attemptId={id} initial={toClient(q)} answered={0} total={1} mode="PUZZLE" big={big} />
      </div>
    );
  }
  const questions = attempt.assessment.items.map((it) => toClient(it.question, { marks: it.marks }));
  const saved = Object.fromEntries(attempt.responses.map((r) => [r.questionId, r.answer ? JSON.parse(r.answer) : null]));
  const deadline = attempt.assessment.durationMin ? attempt.startedAt.getTime() + attempt.assessment.durationMin * 60000 : null;
  return (
    <div>
      <PageHeader title={attempt.assessment.title} subtitle={attempt.assessment.instructions ?? undefined} />
      <TestPlayer attemptId={id} title={attempt.assessment.title} questions={questions} saved={saved} deadline={deadline} big={big} />
    </div>
  );
}
