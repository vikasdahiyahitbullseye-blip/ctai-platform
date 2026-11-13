import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { CURRICULUM } from "@/lib/constants";
import { Card, PageHeader, Stat, LinkButton, Pill, Empty } from "@/components/ui";

const TARGET_PER_CHAPTER = 40;

export default async function StudioHome() {
  await requireUser("CONTENT", "SUPERADMIN");
  const [bySource, byStatus, byClass, review] = await Promise.all([
    prisma.question.groupBy({ by: ["source"], _count: true }),
    prisma.question.groupBy({ by: ["status"], _count: true }),
    prisma.question.groupBy({ by: ["classLevel"], where: { status: "PUBLISHED", isPuzzle: false }, _count: true }),
    prisma.question.findMany({ where: { status: "IN_REVIEW" }, include: { chapter: true }, orderBy: { updatedAt: "asc" }, take: 20 }),
  ]);
  const count = (s: string) => byStatus.find((b) => b.status === s)?._count ?? 0;
  return (
    <div className="space-y-6">
      <PageHeader title="Content studio" subtitle="Write, review and publish questions, resources and project kits for every school." action={<LinkButton href="/studio/questions/new">+ New question</LinkButton>} />
      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Published" value={count("PUBLISHED")} tone="good" />
        <Stat label="In review" value={count("IN_REVIEW")} tone={count("IN_REVIEW") ? "warn" : "default"} />
        <Stat label="Drafts" value={count("DRAFT")} />
        <Stat label="Retired" value={count("RETIRED")} />
      </div>
      <Card title="Where the questions come from">
        <p className="text-sm text-ink-2">
          <strong>{bySource.find((b) => b.source === "AUTHORED")?._count ?? 0}</strong> written individually ·{" "}
          <strong>{bySource.find((b) => b.source === "GENERATED")?._count ?? 0}</strong> generated from question families (computed answers, published for the demo and flagged for review).{" "}
          <Link href="/studio/questions?source=GENERATED" className="font-semibold text-brand">Review generated questions →</Link>
        </p>
      </Card>
      <Card title="Review queue" action={<span className="text-xs text-muted">Questions need a second person&apos;s approval</span>}>
        {review.length ? (
          <ul className="divide-y divide-line text-sm">
            {review.map((q) => <li key={q.id} className="flex justify-between gap-3 py-2"><Link href={`/studio/questions/${q.id}`} className="font-medium text-brand">{q.code}</Link><span className="truncate text-muted">{q.stem.replace(/\*\*/g, "").slice(0, 80)}</span></li>)}
          </ul>
        ) : <Empty>Nothing waiting for review.</Empty>}
      </Card>
      <Card title="Coverage against Year-1 targets" action={<span className="text-xs text-muted">Target ≈ {TARGET_PER_CHAPTER} practice questions per chapter</span>}>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs text-muted"><th className="py-2">Class</th><th>Chapters</th><th className="text-right">Published</th><th className="text-right">Target</th><th className="w-1/3 pl-4">Progress</th></tr></thead>
          <tbody>
            {Object.entries(CURRICULUM).map(([cls, parts]) => {
              const chapters = (parts.CT?.length ?? 0) + (parts.AI?.length ?? 0);
              const target = chapters * TARGET_PER_CHAPTER;
              const have = byClass.find((b) => b.classLevel === Number(cls))?._count ?? 0;
              const pct = Math.round((have / target) * 100);
              return (
                <tr key={cls} className="border-t border-line">
                  <td className="py-2 font-medium">Class {cls}</td><td>{chapters}</td><td className="text-right tabular-nums">{have}</td><td className="text-right tabular-nums">{target}</td>
                  <td className="pl-4"><div className="flex items-center gap-2"><div className="h-2 flex-1 rounded-full bg-surface-2"><div className="h-full rounded-full bg-brand" style={{ width: `${Math.min(100, pct)}%` }} /></div><Pill>{pct}%</Pill></div></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
