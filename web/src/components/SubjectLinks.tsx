import { SUBJECTS } from "@/lib/constants";

type Link = { id: string; subject: string; topic: string; how: string; activity: string | null };

export function SubjectLinks({ links, kid }: { links: Link[]; kid?: boolean }) {
  if (!links.length) return <p className="text-sm text-muted">Connections for this chapter are coming soon.</p>;
  return (
    <div className={`grid gap-3 ${kid ? "sm:grid-cols-2" : "md:grid-cols-2"}`}>
      {links.map((l) => {
        const s = SUBJECTS[l.subject as keyof typeof SUBJECTS] ?? { name: l.subject, emoji: "🔗", color: "#64748b" };
        return (
          <div key={l.id} className={`overflow-hidden border-2 bg-surface ${kid ? "rounded-3xl" : "rounded-2xl"}`} style={{ borderColor: s.color }}>
            <div className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white" style={{ background: s.color }}>
              <span className="text-lg" aria-hidden>{s.emoji}</span>{s.name}
            </div>
            <div className="space-y-1.5 p-4 text-sm">
              <div className="font-semibold">{l.topic}</div>
              <div className="text-ink-2">{l.how}</div>
              {l.activity && <div className="rounded-xl bg-surface-2 p-2 text-xs"><strong>Try this:</strong> {l.activity}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
