import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { studentSection } from "@/lib/student";
import { dashboardSkills } from "@/lib/constants";
import { skillName } from "@/lib/progress";
import { Card, PageHeader, Progress, btn, Empty } from "@/components/ui";
import { startPractice } from "@/app/actions/student";

export default async function PracticePage() {
  const user = await requireUser("STUDENT");
  const section = await studentSection(user.id);
  if (!section) return <Empty>Not enrolled.</Empty>;
  const chapters = await prisma.chapter.findMany({
    where: { classLevel: section.classLevel },
    orderBy: [{ part: "desc" }, { number: "asc" }],
    include: { _count: { select: { questions: { where: { isPuzzle: false } } } } },
  });
  const responses = await prisma.response.findMany({
    where: { attempt: { userId: user.id }, correct: { not: null } },
    select: { correct: true, question: { select: { chapterId: true } } },
  });
  const stats = new Map<string, { n: number; c: number }>();
  for (const r of responses) {
    const s = stats.get(r.question.chapterId) ?? { n: 0, c: 0 };
    s.n++;
    if (r.correct) s.c++;
    stats.set(r.question.chapterId, s);
  }
  const parts = [...new Set(chapters.map((c) => c.part))];

  return (
    <div>
      <PageHeader title="Practice" subtitle="Each set has 15 questions covering every kind of question in the chapter. Questions get harder when you're on a roll and easier when you need help." />
      <Card title="Practise a thinking skill" className="mb-6">
        <div className="flex flex-wrap gap-2">
          {dashboardSkills(section.classLevel).map((s) => (
            <form key={s} action={startPractice}>
              <input type="hidden" name="skill" value={s} />
              <button className={btn.secondary}>{skillName(s)}</button>
            </form>
          ))}
        </div>
      </Card>
      {parts.map((part) => (
        <Card key={part} title={part === "CT" ? "Computational Thinking — chapters" : part === "AI" ? "Artificial Intelligence — chapters" : "EVS worksheets"} className="mb-6">
          <ul className="grid gap-3 sm:grid-cols-2">
            {chapters.filter((c) => c.part === part).map((c) => {
              const s = stats.get(c.id);
              const acc = s ? Math.round((s.c / s.n) * 100) : null;
              const available = c._count.questions > 0;
              return (
                <li key={c.id} className="flex flex-col justify-between gap-3 rounded-xl border border-line p-4">
                  <div>
                    <div className="text-xs font-medium text-muted">Chapter {c.number}</div>
                    <div className="font-semibold">{c.title}</div>
                  </div>
                  {available ? (
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <Progress value={acc ?? 0} label={`Accuracy in ${c.title}`} />
                        <div className="mt-1 text-xs text-muted">{acc === null ? "Not started" : `${acc}% correct · ${s!.n} answered`}</div>
                      </div>
                      <form action={startPractice}>
                        <input type="hidden" name="chapterId" value={c.id} />
                        <button className={btn.primary}>Practise</button>
                      </form>
                    </div>
                  ) : (
                    <div className="text-xs text-muted">Questions coming soon</div>
                  )}
                </li>
              );
            })}
          </ul>
        </Card>
      ))}
    </div>
  );
}
