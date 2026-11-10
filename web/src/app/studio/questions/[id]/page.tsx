import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { answerToRaw } from "@/lib/questionInput";
import { PageHeader, Pill, btn } from "@/components/ui";
import { QuestionEditor } from "../QuestionEditor";
import { StemFigure, OptionList } from "@/components/QuestionFigures";
import { reviewQuestion } from "@/app/actions/studio";

export default async function EditQuestion({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const { id } = await params;
  const { saved } = await searchParams;
  const user = await requireUser("CONTENT", "SUPERADMIN");
  const q = await prisma.question.findUnique({ where: { id }, include: { chapter: true, _count: { select: { responses: true } } } });
  if (!q) notFound();
  const chapters = await prisma.chapter.findMany({ select: { classLevel: true, part: true, number: true, title: true }, orderBy: [{ classLevel: "asc" }, { part: "asc" }, { number: "asc" }] });
  const author = q.authorId ? await prisma.user.findUnique({ where: { id: q.authorId } }) : null;
  const canApprove = q.status === "IN_REVIEW" && (q.authorId !== user.id || user.role === "SUPERADMIN");
  return (
    <div className="space-y-4">
      <PageHeader title={<span className="font-mono">{q.code}</span>} subtitle={`Version ${q.version} · by ${author?.name ?? "—"} · used in ${q._count.responses} answers`} action={<Pill tone={q.status === "PUBLISHED" ? "good" : q.status === "IN_REVIEW" ? "warn" : q.status === "RETIRED" ? "bad" : "default"}>{q.status.replace("_", " ")}</Pill>} />
      {saved && <div className="rounded-xl bg-good-soft p-3 text-sm text-good">Saved.</div>}
      {q.reviewNote && <div className="rounded-xl bg-warn-soft p-3 text-sm text-warn">Reviewer note: {q.reviewNote}</div>}
      <div className="flex flex-wrap items-end gap-2 rounded-2xl border border-line bg-surface p-4">
        <span className="mr-2 text-sm font-semibold">Review:</span>
        {canApprove && <form action={reviewQuestion.bind(null, id, "approve")}><button className={btn.primary}>✓ Approve &amp; publish</button></form>}
        {q.status === "IN_REVIEW" && !canApprove && <span className="text-sm text-muted">Waiting for another reviewer to approve.</span>}
        {q.status === "IN_REVIEW" && (
          <form action={reviewQuestion.bind(null, id, "reject")} className="flex gap-2">
            <input name="note" placeholder="What needs changing?" className="rounded-xl border border-line bg-surface px-3 py-2 text-sm" />
            <button className={btn.secondary}>Request changes</button>
          </form>
        )}
        {q.status === "PUBLISHED" && <form action={reviewQuestion.bind(null, id, "retire")}><button className={btn.secondary}>Retire (remove from use)</button></form>}
        {q.status === "RETIRED" && <form action={reviewQuestion.bind(null, id, "restore")}><button className={btn.secondary}>Restore as draft</button></form>}
      </div>
      {(q.figure || q.optionFigures) && (
        <div className="rounded-2xl border border-line bg-surface p-4 text-sm">
          <div className="font-semibold">🖼️ Picture question</div>
          <p className="text-muted">The pictures are drawn from a generated picture spec. You can edit the wording, solution and hint below; keep the options in the same order so they still match their pictures.</p>
          <StemFigure json={q.figure} />
          <OptionList options={JSON.parse(q.options)} figuresJson={q.optionFigures} />
        </div>
      )}
      <QuestionEditor
        id={id}
        chapters={chapters}
        initial={{ classLevel: q.classLevel, part: q.chapter.part, chapterNumber: q.chapter.number, type: q.type, difficulty: q.difficulty, skills: q.skills.split(","), stem: q.stem, options: JSON.parse(q.options), answer: answerToRaw(q.type, q.answer), solution: q.solution, hint: q.hint ?? "", marks: q.marks, isPuzzle: q.isPuzzle }}
      />
    </div>
  );
}
