import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { nextPracticeQuestion, practiceSetSize } from "@/lib/attempts";
import { toClient } from "@/lib/questions";
import { PracticePlayer } from "@/components/PracticePlayer";
import { TestPlayer } from "@/components/TestPlayer";
import { AssignmentPlayer } from "@/components/AssignmentPlayer";
import { PageHeader } from "@/components/ui";

export default async function PlayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser("STUDENT");
  const attempt = await prisma.attempt.findUnique({
    where: { id },
    include: { responses: true, taskResponses: { include: { file: true } }, assessment: { include: { items: { include: { question: true }, orderBy: { position: "asc" } }, tasks: { orderBy: { position: "asc" } } } } },
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
        <PracticePlayer attemptId={id} initial={q ? toClient(q, { withHint: true }) : null} answered={attempt.responses.length} total={total} mode="PRACTICE" big={big} skippedIds={attempt.responses.filter((r) => r.answer === null && r.correct === null).map((r) => r.questionId)} />
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
  if (kind === "ASSIGNMENT") {
    const tasks = attempt.assessment.tasks.map((t) => {
      const r = attempt.taskResponses.find((x) => x.taskId === t.id);
      return { id: t.id, title: t.title, prompt: t.prompt, responseType: t.responseType, marks: t.marks, text: r?.text ?? "", file: r?.file ? { id: r.file.id, name: r.file.filename, isImage: r.file.mime.startsWith("image/") } : null };
    });
    return (
      <div>
        <PageHeader title={`📝 ${attempt.assessment.title}`} subtitle={attempt.assessment.instructions ?? undefined} />
        <AssignmentPlayer attemptId={id} questions={questions} saved={saved} tasks={tasks} big={big} />
      </div>
    );
  }
  const deadline = attempt.assessment.durationMin ? attempt.startedAt.getTime() + attempt.assessment.durationMin * 60000 : null;
  return (
    <div>
      <PageHeader title={attempt.assessment.title} subtitle={attempt.assessment.instructions ?? undefined} />
      <TestPlayer attemptId={id} title={attempt.assessment.title} questions={questions} saved={saved} deadline={deadline} big={big} />
    </div>
  );
}
