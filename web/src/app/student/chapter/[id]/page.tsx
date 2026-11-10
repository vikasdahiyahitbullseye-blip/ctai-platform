import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { studentSection } from "@/lib/student";
import { starsFor } from "@/lib/adventure";
import { PART_LABEL } from "@/lib/constants";
import { SubjectLinks } from "@/components/SubjectLinks";
import { Markdown } from "@/components/Markdown";
import { Mascot, SpeechBubble } from "@/components/kid";
import { startPractice } from "@/app/actions/student";

export default async function StudentChapter({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser("STUDENT");
  const section = await studentSection(user.id);
  const ch = await prisma.chapter.findUnique({ where: { id }, include: { links: { where: { subject: { not: "MATHS" } } }, resources: { where: { status: "PUBLISHED", audience: { in: ["STUDENT", "BOTH"] } } } } });
  if (!ch || ch.classLevel !== section?.classLevel) notFound();
  const rs = await prisma.response.findMany({ where: { attempt: { userId: user.id }, correct: { not: null }, question: { chapterId: id } }, select: { correct: true } });
  const stars = starsFor(rs.length, rs.filter((r) => r.correct).length);
  return (
    <div className="space-y-6">
      <Link href="/student/map" className="text-sm font-bold text-brand">← Back to map</Link>
      <section className="rounded-[2rem] bg-gradient-to-br from-[#6c4dff] to-[#20c997] p-6 text-white shadow-lg">
        <p className="text-sm font-bold opacity-90">{PART_LABEL[ch.part]} · Island {ch.number}</p>
        <h1 className="text-3xl font-extrabold">{ch.title}</h1>
        <div className="mt-1 text-2xl">{"⭐".repeat(stars)}<span className="opacity-40">{"⭐".repeat(3 - stars)}</span></div>
        {ch.focus && <p className="mt-2 max-w-2xl font-semibold opacity-95">{ch.focus}</p>}
        <form action={startPractice} className="mt-4"><input type="hidden" name="chapterId" value={ch.id} /><button className="kbtn kbtn-accent text-lg">▶ Play 8 questions</button></form>
        <p className="mt-2 text-sm opacity-90">{rs.length ? `You've answered ${rs.length} questions here.` : "You haven't visited this island yet."}</p>
      </section>
      {ch.links.length > 0 && (
        <section>
          <div className="mb-3 flex items-start gap-3"><Mascot size={52} mood="think" /><SpeechBubble>Did you know? The thinking you do here also helps in other subjects!</SpeechBubble></div>
          <h2 className="mb-3 text-2xl font-extrabold">🔗 Where else will you use this?</h2>
          <SubjectLinks links={ch.links} kid />
        </section>
      )}
      {ch.resources.map((r) => (
        <section key={r.id} className="rounded-[2rem] border-2 border-line bg-surface p-6">
          <h2 className="text-xl font-extrabold">📄 {r.title}</h2>
          {r.body && <div className="mt-3"><Markdown text={r.body} /></div>}
        </section>
      ))}
    </div>
  );
}
