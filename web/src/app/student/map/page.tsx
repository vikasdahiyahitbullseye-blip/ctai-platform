import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { studentSection } from "@/lib/student";
import { adventure } from "@/lib/adventure";
import { Empty } from "@/components/ui";
import { Mascot, SpeechBubble } from "@/components/kid";

const WORLDS: Record<string, { name: string; icon: string; bg: string; island: string }> = {
  EVS: { name: "Nature Trail", icon: "🌿", bg: "from-[#d9f7e6] to-[#c7f0ff] dark:from-[#0f2e22] dark:to-[#0e2433]", island: "🌳" },
  CT: { name: "Thinking Islands", icon: "🏝️", bg: "from-[#cfeaff] to-[#e6dcff] dark:from-[#0e2440] dark:to-[#221a46]", island: "🏝️" },
  AI: { name: "AI Galaxy", icon: "🤖", bg: "from-[#2b2366] to-[#14103a]", island: "🪐" },
};
const OFFSETS = ["ml-[4%]", "ml-[30%]", "ml-[56%]", "ml-[30%]"];

export default async function MapPage() {
  const user = await requireUser("STUDENT");
  const section = await studentSection(user.id);
  if (!section) return <Empty>Not in a class yet.</Empty>;
  const adv = await adventure(prisma, user.id, section.classLevel);
  const parts = [...new Set(adv.islands.map((i) => i.part))];
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">🗺️ My adventure map</h1>
          <p className="font-semibold text-muted">Every chapter is an island. Practise to collect up to 3 stars on each!</p>
        </div>
        <div className="rounded-2xl border-2 border-line bg-surface px-5 py-3 text-center"><div className="text-3xl font-extrabold">⭐ {adv.totalStars}</div><div className="text-xs font-bold text-muted">of {adv.maxStars} stars</div></div>
      </div>
      <div className="flex items-start gap-3"><Mascot size={56} mood="cheer" /><SpeechBubble>1 star = tried it · 2 stars = getting good · 3 stars = island master!</SpeechBubble></div>
      {parts.map((part) => {
        const w = WORLDS[part];
        const list = adv.islands.filter((i) => i.part === part);
        return (
          <section key={part} className={`overflow-hidden rounded-[2rem] bg-gradient-to-b p-6 ${w.bg}`}>
            <h2 className={`text-2xl font-extrabold ${part === "AI" ? "text-white" : ""}`}>{w.icon} {w.name}</h2>
            <ol className="relative mt-4 space-y-2">
              {list.map((i, idx) => {
                const isNext = adv.next?.id === i.id;
                const empty = i.questions === 0;
                return (
                  <li key={i.id} className={`${OFFSETS[idx % OFFSETS.length]} w-[min(18rem,62%)]`}>
                    {idx > 0 && <div className={`mb-1 h-6 border-l-4 border-dotted ${part === "AI" ? "border-white/40" : "border-ink/20"} ${idx % 4 === 1 || idx % 4 === 2 ? "-ml-6" : "ml-6"}`} aria-hidden />}
                    {empty ? (
                      <div className="flex items-center gap-3 rounded-3xl border-2 border-dashed border-ink/20 bg-surface/50 p-3 opacity-70">
                        <span className="text-3xl grayscale" aria-hidden>{w.island}</span>
                        <div><div className="text-xs font-bold text-muted">Island {i.number}</div><div className="font-extrabold">{i.title}</div><div className="text-xs font-bold text-muted">☁️ Coming soon</div></div>
                      </div>
                    ) : (
                      <Link href={`/student/chapter/${i.id}`} className={`pop-in flex items-center gap-3 rounded-3xl border-2 bg-surface p-3 shadow-md transition hover:-translate-y-1 hover:shadow-lg ${isNext ? "border-accent ring-4 ring-accent/30" : "border-line"}`}>
                        <span className={`text-4xl ${i.stars === 0 ? "" : "drop-shadow"}`} aria-hidden>{w.island}</span>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-muted">Island {i.number}{isNext && <span className="ml-2 rounded-full bg-accent px-2 py-0.5 text-white">Next!</span>}</div>
                          <div className="truncate font-extrabold">{i.title}</div>
                          <div className="text-lg leading-none" aria-label={`${i.stars} of 3 stars`}>{"⭐".repeat(i.stars)}<span className="opacity-30">{"⭐".repeat(3 - i.stars)}</span></div>
                        </div>
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
    </div>
  );
}
