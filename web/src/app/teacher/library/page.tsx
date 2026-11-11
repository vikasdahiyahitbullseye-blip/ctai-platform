import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { teacherSections } from "@/lib/teacher";
import { LIBRARY_TARGETS } from "@/lib/library";
import { PART_LABEL } from "@/lib/constants";
import { Card, PageHeader, Pill, btn } from "@/components/ui";

const PARTS = ["CT", "AI", "EVS"];
const SETS: { type: string; title: string; icon: string; target: (chapters: number) => string }[] = [
  { type: "CHAPTER_TEST", title: "Chapter tests", icon: "✅", target: () => "12–15" },
  { type: "WORKSHEET", title: "Worksheets", icon: "📝", target: () => String(LIBRARY_TARGETS.WORKSHEET) },
  { type: "ASSIGNMENT", title: "Assignments", icon: "🏠", target: () => String(LIBRARY_TARGETS.ASSIGNMENT) },
  { type: "MONTHLY", title: "Monthly assessments", icon: "🗓️", target: () => String(LIBRARY_TARGETS.MONTHLY) },
  { type: "TERM", title: "Term examination papers", icon: "🎓", target: () => String(LIBRARY_TARGETS.TERM) },
  { type: "MOCK", title: "Full-length practice papers", icon: "📄", target: () => String(LIBRARY_TARGETS.MOCK) },
];

export default async function Library({ searchParams }: { searchParams: Promise<{ cls?: string }> }) {
  const user = await requireUser("TEACHER", "ADMIN");
  const levels = [...new Set((await teacherSections(user.id)).map((s) => s.section.classLevel))].sort();
  const cls = Number((await searchParams).cls ?? levels[0] ?? 3);
  const [chapters, sets, resources, kits, practice] = await Promise.all([
    prisma.chapter.findMany({ where: { classLevel: cls }, orderBy: [{ part: "asc" }, { number: "asc" }] }),
    prisma.assessment.findMany({ where: { classLevel: cls, libType: { not: null } }, select: { id: true, libType: true, title: true, chapterId: true, durationMin: true, _count: { select: { items: true, tasks: true } } }, orderBy: { libOrder: "asc" } }),
    prisma.resource.findMany({ where: { classLevel: cls, kind: { in: ["MODULE", "VIDEO"] } }, select: { id: true, kind: true, title: true, chapterId: true, url: true, fileId: true }, orderBy: [{ position: "asc" }] }),
    prisma.projectKit.findMany({ where: { classLevel: cls, published: true }, select: { id: true, kind: true, title: true, emoji: true, chapterKey: true, hours: true }, orderBy: { code: "asc" } }),
    prisma.question.count({ where: { classLevel: cls, status: "PUBLISHED", isPuzzle: false, type: { not: "SHORT" } } }),
  ]);
  const count = (t: string) => sets.filter((s) => s.libType === t).length;
  const modules = resources.filter((r) => r.kind === "MODULE");
  // Only recorded videos are shown; recording is done on the Concept videos page by roles the super-admin allows.
  const videos = resources.filter((r) => r.kind === "VIDEO" && (r.url || r.fileId));
  const tiles = [
    { label: "Chapter learning modules", have: modules.length, target: "12–15" },
    { label: "Practice questions", have: practice, target: String(LIBRARY_TARGETS.PRACTICE) },
    { label: "Chapter tests", have: count("CHAPTER_TEST"), target: "12–15" },
    { label: "Worksheets", have: count("WORKSHEET"), target: String(LIBRARY_TARGETS.WORKSHEET) },
    { label: "Assignments", have: count("ASSIGNMENT"), target: String(LIBRARY_TARGETS.ASSIGNMENT) },
    { label: "Monthly assessments", have: count("MONTHLY"), target: String(LIBRARY_TARGETS.MONTHLY) },
    { label: "Term examination papers", have: count("TERM"), target: String(LIBRARY_TARGETS.TERM) },
    { label: "Full-length practice papers", have: count("MOCK"), target: String(LIBRARY_TARGETS.MOCK) },
    { label: "Projects / activity kits", have: kits.length, target: String(LIBRARY_TARGETS.KITS) },
    { label: "Concept videos", have: videos.length, target: String(LIBRARY_TARGETS.VIDEO) },
  ];
  const chTitle = (id: string | null) => chapters.find((c) => c.id === id);

  return (
    <div className="space-y-6">
      <PageHeader title="Library" subtitle="Ready-made resources for every chapter: open, print with answer keys, or use with your class." action={<Link href={`/teacher/plan?cls=${cls}`} className={btn.secondary}>📅 Year plan</Link>} />
      <form className="flex flex-wrap gap-2">{[3, 4, 5, 6, 7, 8].map((c) => <button key={c} name="cls" value={c} className={c === cls ? btn.primary : btn.secondary}>Class {c}</button>)}</form>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-2xl border border-line bg-surface p-3">
            <div className="text-xs font-medium text-muted">{t.label}</div>
            <div className="mt-1 text-xl font-bold tabular-nums">{t.have}</div>
            <div className="text-xs text-muted">Target {t.target}</div>
          </div>
        ))}
      </div>

      <Card title="📘 Learning modules, 📊 class slides and 🎬 concept videos">
        <p className="-mt-2 mb-3 text-xs text-muted">Slides download as PowerPoint (.pptx) and open in Google Slides too. Each deck follows the chapter&apos;s periods, with answers after every question and the lesson plan in the speaker notes.</p>
        {PARTS.filter((p) => chapters.some((c) => c.part === p)).map((part) => (
          <div key={part} className="mb-4">
            <div className="mb-1 text-sm font-semibold text-muted">{PART_LABEL[part]}</div>
            <ul className="divide-y divide-line">
              {chapters.filter((c) => c.part === part).map((c) => {
                const mod = modules.find((m) => m.chapterId === c.id);
                const vids = videos.filter((v) => v.chapterId === c.id);
                const kit = kits.find((k) => k.chapterKey === `${cls}-${c.part}-${c.number}`);
                return (
                  <li key={c.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2 text-sm">
                    <span className="min-w-[14rem] flex-1 font-medium">{c.number}. {c.title}</span>
                    {mod && <Link href={`/learn/${mod.id}`} className="text-brand">📘 Module</Link>}
                    <a href={`/api/slides/${c.id}`} className="text-brand">📊 Slides</a>
                    {vids.map((v, i) => <Link key={v.id} href={`/learn/${v.id}`} className="text-brand">🎬 Video {i + 1}</Link>)}
                    {kit && <Link href={`/teacher/projects/kit/${kit.id}`} className="text-brand">{kit.emoji} {kit.title}</Link>}
                    <Link href={`/teacher/chapter/${c.id}`} className="text-muted hover:underline">Chapter page →</Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </Card>

      {SETS.map((set) => {
        const list = sets.filter((s) => s.libType === set.type);
        return (
          <Card key={set.type} title={`${set.icon} ${set.title} (${list.length})`}>
            <details open={list.length <= 8}>
              <summary className="mb-2 cursor-pointer text-sm font-medium text-brand">Show all</summary>
              <ul className="grid gap-2 sm:grid-cols-2">
                {list.map((s) => {
                  const ch = chTitle(s.chapterId);
                  return (
                    <li key={s.id}>
                      <Link href={`/teacher/library/${s.id}`} className="block rounded-xl border border-line p-3 hover:bg-surface-2">
                        <div className="font-medium">{s.title}</div>
                        <div className="text-xs text-muted">{ch ? `${PART_LABEL[ch.part].split(" ")[0]} ch ${ch.number} · ` : ""}{s._count.items} questions{s._count.tasks ? ` + ${s._count.tasks} task` : ""}{s.durationMin ? ` · ${s.durationMin} min` : ""}</div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </details>
          </Card>
        );
      })}

      <Card title={`🧪 Projects and activity kits (${kits.length})`}>
        <ul className="grid gap-2 sm:grid-cols-2">
          {kits.map((k) => (
            <li key={k.id}>
              <Link href={`/teacher/projects/kit/${k.id}`} className="flex items-center gap-3 rounded-xl border border-line p-3 hover:bg-surface-2">
                <span className="text-2xl" aria-hidden>{k.emoji}</span>
                <span className="flex-1"><span className="block font-medium">{k.title}</span><span className="text-xs text-muted">{k.kind === "PROJECT" ? `Project · ${k.hours} hours` : "Activity kit · 1 period"}</span></span>
                <Pill tone={k.kind === "PROJECT" ? "brand" : "default"}>{k.kind === "PROJECT" ? "Project" : "Activity"}</Pill>
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
