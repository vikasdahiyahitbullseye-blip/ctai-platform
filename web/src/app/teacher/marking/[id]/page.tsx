import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { requireTestAccess } from "@/lib/teacher";
import { formatAnswer } from "@/lib/scoring";
import { PageHeader, Card, Pill, btn } from "@/components/ui";
import { MarkingForm } from "./MarkingForm";

export default async function MarkingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser("TEACHER", "ADMIN");
  const at = await prisma.attempt.findUnique({
    where: { id },
    include: { user: true, responses: { include: { question: true } }, taskResponses: { include: { file: true, task: true } }, assessment: { include: { items: { include: { question: true }, orderBy: { position: "asc" } }, tasks: { orderBy: { position: "asc" } } } } },
  });
  if (!at || !at.submittedAt) notFound();
  await requireTestAccess(user, at.assessmentId);
  const auto = at.assessment.items.filter((i) => i.question.type !== "SHORT");
  const autoCorrect = auto.filter((i) => at.responses.find((r) => r.questionId === i.questionId)?.correct).length;
  const shortItems = at.assessment.items.filter((i) => i.question.type === "SHORT").map((i) => ({ item: i, r: at.responses.find((r) => r.questionId === i.questionId) })).filter((x) => x.r);
  const next = await prisma.attempt.findFirst({ where: { assessmentId: at.assessmentId, needsMarking: true, id: { not: id } } });
  return (
    <div className="space-y-6">
      <PageHeader title={`Marking: ${at.user.name}`} subtitle={`${at.assessment.title} · current score ${at.score}/${at.maxScore}`} action={<div className="flex gap-2"><Link href={`/teacher/assignments/${at.assessmentId}`} className={btn.secondary}>Back</Link>{next && <Link href={`/teacher/marking/${next.id}`} className={btn.secondary}>Next to mark →</Link>}</div>} />
      {auto.length > 0 && <Card title="Auto-marked questions"><p className="text-sm">{autoCorrect} of {auto.length} correct <Pill tone="good">already scored</Pill></p></Card>}
      <MarkingForm
        attemptId={id}
        shortAnswers={shortItems.map(({ item, r }) => ({ id: r!.id, stem: item.question.stem, answer: r!.answer ? JSON.parse(r!.answer) : "", model: formatAnswer("SHORT", [], JSON.parse(item.question.answer)), max: item.marks, marks: r!.markedAt ? r!.marks : null, feedback: r!.feedback ?? "" }))}
        tasks={at.taskResponses.map((t) => ({ id: t.id, title: t.task.title, prompt: t.task.prompt, text: t.text ?? "", file: t.file ? { id: t.file.id, name: t.file.filename, isImage: t.file.mime.startsWith("image/") } : null, max: t.task.marks, marks: t.markedAt ? t.marks : null, feedback: t.feedback ?? "" }))}
      />
    </div>
  );
}
