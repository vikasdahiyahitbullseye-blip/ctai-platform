import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { studentSummary } from "@/lib/progress";
import { parseAvatar, ANIMALS, BACKGROUNDS, ACCESSORIES } from "@/lib/avatar";
import { AvatarBuilder } from "./AvatarBuilder";

export default async function MePage() {
  const user = await requireUser("STUDENT");
  const s = await studentSummary(prisma, user.id);
  const house = user.houseId ? await prisma.house.findUnique({ where: { id: user.houseId } }) : null;
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold">🙂 Me</h1>
      <AvatarBuilder initial={parseAvatar(user.avatar)} level={s.level} animals={ANIMALS} backgrounds={BACKGROUNDS} accessories={ACCESSORIES} />
      <section className="grid gap-4 sm:grid-cols-4">
        {[["Level", `${s.level}`, s.rank], ["Total XP", `⭐ ${s.xp}`, `${s.toNext} to next level`], ["Streak", `🔥 ${s.streak}`, "days in a row"], ["House", house ? `${house.emoji} ${house.name}` : "—", "your team"]].map(([l, v, sub]) => (
          <div key={l} className="rounded-3xl border-2 border-line bg-surface p-4"><div className="text-xs font-bold uppercase text-muted">{l}</div><div className="text-2xl font-extrabold">{v}</div><div className="text-xs font-semibold text-muted">{sub}</div></div>
        ))}
      </section>
      <div className="flex flex-wrap gap-3">
        <Link href="/student/progress" className="kbtn">📈 My skill progress</Link>
        <Link href="/student/rewards" className="kbtn kbtn-ghost">🏆 Badges &amp; leaderboard</Link>
        <Link href="/account" className="kbtn kbtn-ghost">🔑 Change password</Link>
      </div>
    </div>
  );
}
