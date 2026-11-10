import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { QUESTION_TYPES, DIFFICULTY } from "@/lib/constants";
import { formatAnswer } from "@/lib/scoring";
import { Card, PageHeader, Pill, Stat, Empty, btn } from "@/components/ui";
import { Markdown } from "@/components/Markdown";
import { StemFigure, OptionList } from "@/components/QuestionFigures";
import { approveSelected, approveOne, rejectOne, reopenOne } from "@/app/actions/review";

type SP = { state?: string; cls?: string; ch?: string; source?: string; type?: string };
const PAGE = 20;
const STATE_LABEL: Record<string, string> = { UNREVIEWED: "Awaiting approval", APPROVED: "Approved", REJECTED: "Rejected" };

export default async function ReviewQueue({ searchParams }: { searchParams: Promise<SP> }) {
  const user = await requireUser("REVIEWER", "SUPERADMIN");
  const sp = await searchParams;
  const state = sp.state && STATE_LABEL[sp.state] ? sp.state : "UNREVIEWED";
  const cls = sp.cls ? Number(sp.cls) : undefined;
  const source = sp.source ?? "";

  // Live questions are the ones that matter for approval; rejected ones are retired.
  const base = { status: state === "REJECTED" ? "RETIRED" : "PUBLISHED", approval: state };
  const where = {
    ...base,
    ...(cls ? { classLevel: cls } : {}),
    ...(sp.ch ? { chapterId: sp.ch } : {}),
    ...(source ? { source } : {}),
    ...(sp.type ? { type: sp.type } : {}),
  };
  const [questions, matching, counts, byClass, chapters] = await Promise.all([
    prisma.question.findMany({ where, include: { chapter: true }, orderBy: [{ classLevel: "asc" }, { chapter: { part: "desc" } }, { chapter: { number: "asc" } }, { code: "asc" }], take: PAGE }),
    prisma.question.count({ where }),
    prisma.question.groupBy({ by: ["approval"], where: { OR: [{ status: "PUBLISHED" }, { approval: "REJECTED" }] }, _count: true }),
    prisma.question.groupBy({ by: ["classLevel", "approval"], where: { status: "PUBLISHED" }, _count: true }),
    cls ? prisma.chapter.findMany({ where: { classLevel: cls }, orderBy: [{ part: "desc" }, { number: "asc" }] }) : Promise.resolve([]),
  ]);
  const count = (a: string) => counts.find((c) => c.approval === a)?._count ?? 0;
  const live = count("UNREVIEWED") + count("APPROVED");
  const pct = live ? Math.round((count("APPROVED") / live) * 100) : 0;
  const cell = (c: number, a: string) => byClass.find((r) => r.classLevel === c && r.approval === a)?._count ?? 0;
  const qs = (patch: Partial<SP>) => {
    const p = new URLSearchParams(Object.entries({ state, cls: sp.cls, ch: sp.ch, source, type: sp.type, ...patch }).filter(([, v]) => v) as [string, string][]);
    return `/review?${p.toString()}`;
  };
  const sel = "rounded-xl border border-line bg-surface px-3 py-2 text-sm";

  return (
    <div className="space-y-6">
      <PageHeader title="Question approval" subtitle={user.role === "SUPERADMIN" ? "You can approve as super-admin." : "Check each question, then approve it or reject it with a reason."} />

      <div className="grid gap-4 sm:grid-cols-4" data-awaiting={count("UNREVIEWED")}>
        <Stat label="Approved" value={count("APPROVED")} sub={`${pct}% of live questions`} />
        <Stat label="Awaiting approval" value={count("UNREVIEWED")} sub="still usable by students" />
        <Stat label="Rejected" value={count("REJECTED")} sub="removed from use" />
        <Stat label="Live questions" value={live} />
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-surface-2" aria-label={`${pct}% approved`}><div className="h-full bg-good" style={{ width: `${pct}%` }} /></div>

      <Card title="By class">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-sm">
            <thead><tr className="text-left text-xs text-muted"><th className="py-2">Class</th><th className="text-right">Awaiting</th><th className="text-right">Approved</th><th /></tr></thead>
            <tbody>
              {[3, 4, 5, 6, 7, 8].map((c) => (
                <tr key={c} className="border-t border-line">
                  <td className="py-2 font-medium">Class {c}</td>
                  <td className="text-right">{cell(c, "UNREVIEWED")}</td>
                  <td className="text-right">{cell(c, "APPROVED")}</td>
                  <td className="text-right"><Link className="text-brand" href={`/review?state=UNREVIEWED&cls=${c}&source=`}>Review →</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <form className="flex flex-wrap items-end gap-2" action="/review">
          <select name="state" defaultValue={state} className={sel}>{Object.entries(STATE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
          <select name="cls" defaultValue={sp.cls ?? ""} className={sel}><option value="">All classes</option>{[3, 4, 5, 6, 7, 8].map((c) => <option key={c} value={c}>Class {c}</option>)}</select>
          {cls && <select name="ch" defaultValue={sp.ch ?? ""} className={sel}><option value="">All chapters</option>{chapters.map((ch) => <option key={ch.id} value={ch.id}>{ch.part} {ch.number}: {ch.title}</option>)}</select>}
          <select name="source" defaultValue={source} className={sel}><option value="">Generated + written</option><option value="GENERATED">Generated only</option><option value="AUTHORED">Written only</option></select>
          <select name="type" defaultValue={sp.type ?? ""} className={sel}><option value="">All types</option>{Object.entries(QUESTION_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
          <button className={btn.secondary}>Show</button>
        </form>
        <p className="mt-2 text-xs text-muted">{matching} question{matching === 1 ? "" : "s"} match · showing {Math.min(PAGE, matching)} at a time{state === "UNREVIEWED" ? ". Approved ones leave this list, so the next ones appear." : "."}</p>
      </Card>

      {questions.length === 0 ? <Card><Empty>{state === "UNREVIEWED" ? "Nothing waiting here. 🎉" : "No questions here."}</Empty></Card> : (
        <form action={approveSelected} className="space-y-4">
          {state === "UNREVIEWED" && (
            <div className="sticky top-2 z-10 flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-surface p-3 shadow-sm">
              <button className={btn.primary}>✓ Approve ticked questions</button>
              <span className="text-sm text-muted">All {questions.length} below are ticked. Untick any you are unsure of, or reject them with a reason.</span>
            </div>
          )}
          <ol className="space-y-4">
            {questions.map((q, i) => {
              const opts = JSON.parse(q.options) as string[];
              return (
                <li key={q.id} className="rounded-2xl border border-line bg-surface p-4">
                  <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
                    {state === "UNREVIEWED" && <input type="checkbox" name="ids" value={q.id} defaultChecked aria-label={`Approve ${q.code}`} className="h-5 w-5 accent-[var(--color-brand)]" />}
                    <span className="text-sm font-bold">{i + 1}.</span>
                    <code className="font-mono text-muted">{q.code}</code>
                    <Pill tone="brand">Class {q.classLevel} · {q.chapter.part} {q.chapter.number}: {q.chapter.title}</Pill>
                    <Pill>{DIFFICULTY[q.difficulty as 1 | 2 | 3]}</Pill>
                    <Pill>{QUESTION_TYPES[q.type as keyof typeof QUESTION_TYPES]}</Pill>
                    {q.source === "GENERATED" && <Pill tone="warn">Generated{q.family ? ` · ${q.family}` : ""}</Pill>}
                    {(q.figure || q.optionFigures) && <Pill>🖼️ Picture</Pill>}
                    {user.role === "SUPERADMIN" && <Link href={`/studio/questions/${q.id}`} className="ml-auto text-brand">Edit in studio</Link>}
                  </div>
                  <Markdown text={q.stem} />
                  <StemFigure json={q.figure} />
                  {q.type !== "ORDER" && <OptionList options={opts} figuresJson={q.optionFigures} />}
                  {q.type === "ORDER" && <p className="mt-2 text-sm text-muted">Items: {opts.join(" · ")}</p>}
                  <div className="mt-3 rounded-xl bg-good-soft p-3 text-sm">
                    <div><strong>Answer:</strong> {formatAnswer(q.type, opts, JSON.parse(q.answer))}</div>
                    <div className="mt-1 text-ink-2"><strong>Solution:</strong> <Markdown text={q.solution} className="inline" /></div>
                    {q.hint && <div className="mt-1 text-ink-2"><strong>Hint:</strong> {q.hint}</div>}
                  </div>
                  {q.reviewNote && <p className="mt-2 text-sm text-bad">Reason: {q.reviewNote}</p>}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {state === "UNREVIEWED" ? (
                      <>
                        <button formAction={approveOne.bind(null, q.id)} className={btn.secondary}>✓ Approve this one</button>
                        <input name={`note-${q.id}`} placeholder="Reason, if rejecting (e.g. wrong answer, unclear picture)" className="min-w-[16rem] flex-1 rounded-xl border border-line bg-surface px-3 py-2 text-sm" />
                        <button formAction={rejectOne.bind(null, q.id)} className={btn.ghost}>✗ Reject</button>
                      </>
                    ) : (
                      <button formAction={reopenOne.bind(null, q.id)} className={btn.ghost}>↺ {state === "REJECTED" ? "Restore and send back for approval" : "Undo approval"}</button>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
          {matching > PAGE && <p className="text-center text-sm text-muted">{matching - PAGE} more after these. {state !== "UNREVIEWED" && <Link className="text-brand" href={qs({})}>Refresh</Link>}</p>}
        </form>
      )}
    </div>
  );
}
