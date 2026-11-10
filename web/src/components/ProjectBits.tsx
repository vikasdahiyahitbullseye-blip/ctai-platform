import { SUBJECTS, SKILLS } from "@/lib/constants";

export function SubjectChips({ codes }: { codes: string[] }) {
  return (
    <span className="flex flex-wrap gap-1.5">
      {codes.filter(Boolean).map((c) => {
        const s = SUBJECTS[c as keyof typeof SUBJECTS];
        return s ? <span key={c} className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold text-white" style={{ background: s.color }}>{s.emoji} {s.name}</span> : null;
      })}
    </span>
  );
}

export function SkillChips({ codes }: { codes: string[] }) {
  return <span className="flex flex-wrap gap-1.5">{codes.filter(Boolean).map((c) => <span key={c} className="rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-medium text-brand-ink">{SKILLS[c as keyof typeof SKILLS] ?? c}</span>)}</span>;
}

export const STATUS_STYLE: Record<string, { label: string; cls: string }> = {
  NONE: { label: "Not started", cls: "bg-surface-2 text-muted" },
  SUBMITTED: { label: "Waiting for review", cls: "bg-warn-soft text-warn" },
  RETURNED: { label: "Needs changes", cls: "bg-bad-soft text-bad" },
  APPROVED: { label: "Approved", cls: "bg-good-soft text-good" },
};
