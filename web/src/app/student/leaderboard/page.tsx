import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { studentSection } from "@/lib/student";
import { board, boardsFor, parsePeriod, parseScope, GROUP_EMOJI, GROUP_LIMITS } from "@/lib/leaderboard";
import { BoardList, BoardTabs } from "@/components/Leaderboard";
import { Empty, PageHeader } from "@/components/ui";
import { createGroup, joinGroup, leaveGroup, removeMember, deleteGroup } from "@/app/actions/groups";

export default async function LeaderboardPage({ searchParams }: { searchParams: Promise<{ board?: string; period?: string; msg?: string }> }) {
  const user = await requireUser("STUDENT");
  const section = await studentSection(user.id);
  if (!section) return <Empty>Not enrolled.</Empty>;
  const sp = await searchParams;
  const { list } = await boardsFor(user.id, section);
  let scope = parseScope(sp.board);
  if (!list.some((b) => b.scope === scope)) scope = list[0]?.scope ?? "section";
  const period = parsePeriod(sp.period);
  const rows = list.length ? await board(user.id, section, scope, period) : null;
  const current = list.find((b) => b.scope === scope);
  const group = scope.startsWith("group:")
    ? await prisma.studentGroup.findUnique({ where: { id: scope.slice(6) }, include: { members: { include: { user: { select: { id: true, name: true } } }, orderBy: { joinedAt: "asc" } } } })
    : null;
  const myGroups = list.filter((b) => b.scope.startsWith("group:")).length;
  const input = "w-full rounded-2xl border-2 border-line bg-surface px-4 py-2.5 font-bold outline-none focus:border-brand";

  return (
    <div className="space-y-6">
      <PageHeader title="🏆 Leaderboard" subtitle="Who earned the most XP? Compare with your section, your class, your school, or a group of friends." />
      {sp.msg && <p className="rounded-2xl bg-accent-soft px-4 py-3 font-bold" role="status">{sp.msg}</p>}

      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <section className="rounded-[2rem] border-2 border-line bg-surface p-6 shadow-sm">
          {list.length ? (
            <>
              <BoardTabs base="/student/leaderboard" boards={list} scope={scope} period={period} />
              <h2 className="mt-4 text-xl font-extrabold">{current?.title}</h2>
              {rows ? <BoardList rows={rows} me={user.id} top={20} /> : <p className="text-muted">This board is not available.</p>}
            </>
          ) : (
            <p className="font-semibold text-ink-2">Your teacher has turned class leaderboards off. You can still make a group with friends and compare XP there →</p>
          )}
          {!section.leaderboard && list.length > 0 && <p className="mt-4 text-xs text-muted">Your teacher has turned class leaderboards off, so only your groups are shown.</p>}
        </section>

        <aside className="space-y-4">
          {group && (
            <section className="rounded-[2rem] border-2 border-accent bg-accent-soft p-5">
              <h2 className="text-lg font-extrabold">{group.emoji} {group.name}</h2>
              <p className="mt-1 text-sm font-semibold">Join code: <span className="rounded-lg bg-surface px-2 py-0.5 font-mono text-lg tracking-widest">{group.code}</span></p>
              <p className="text-xs text-ink-2">Friends in your school type this code to join. {group.members.length}/{GROUP_LIMITS.maxMembers} members.</p>
              <ul className="mt-3 space-y-1 text-sm">
                {group.members.map((m) => (
                  <li key={m.userId} className="flex items-center justify-between gap-2">
                    <span className="font-semibold">{m.user.name}{m.userId === group.ownerId ? " 👑" : ""}</span>
                    {group.ownerId === user.id && m.userId !== user.id && (
                      <form action={removeMember.bind(null, group.id, m.userId)}><button className="text-xs font-bold text-muted hover:text-bad">Remove</button></form>
                    )}
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex flex-wrap gap-3 text-sm font-bold">
                <form action={leaveGroup.bind(null, group.id)}><button className="text-ink-2 hover:text-bad">Leave group</button></form>
                {group.ownerId === user.id && <form action={deleteGroup.bind(null, group.id)}><button className="text-bad">Delete group</button></form>}
              </div>
            </section>
          )}

          <section className="rounded-[2rem] border-2 border-line bg-surface p-5">
            <h2 className="text-lg font-extrabold">➕ Make a group</h2>
            <p className="text-sm text-ink-2">Start your own leaderboard and invite friends from your school.</p>
            <form action={createGroup} className="mt-3 space-y-3">
              <label className="block text-sm font-bold">Group name<input name="name" required maxLength={GROUP_LIMITS.nameMax} placeholder="e.g. Puzzle Pals" className={`${input} mt-1`} /></label>
              <fieldset>
                <legend className="text-sm font-bold">Pick a badge</legend>
                <div className="mt-1 flex flex-wrap gap-1">
                  {GROUP_EMOJI.map((e, i) => (
                    <label key={e} className="cursor-pointer">
                      <input type="radio" name="emoji" value={e} defaultChecked={i === 0} className="peer sr-only" />
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-line text-xl peer-checked:border-brand peer-checked:bg-brand-soft peer-focus-visible:ring-2">{e}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <button className="kbtn w-full" disabled={myGroups >= GROUP_LIMITS.maxGroupsPerStudent}>Create group</button>
            </form>
          </section>

          <section className="rounded-[2rem] border-2 border-line bg-surface p-5">
            <h2 className="text-lg font-extrabold">🔑 Join a group</h2>
            <form action={joinGroup} className="mt-3 flex gap-2">
              <input name="code" required maxLength={8} placeholder="Code" aria-label="Group join code" autoCapitalize="characters" className={`${input} font-mono uppercase tracking-widest`} />
              <button className="kbtn kbtn-accent shrink-0">Join</button>
            </form>
            <p className="mt-2 text-xs text-muted">You can be in up to {GROUP_LIMITS.maxGroupsPerStudent} groups. Groups are only for students in your school, and your teacher can see them.</p>
          </section>
        </aside>
      </div>
    </div>
  );
}
