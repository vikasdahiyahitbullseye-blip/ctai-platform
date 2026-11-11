// Where each kind of plan/library reference opens, plus display helpers shared by teacher pages.
export type Ref = { type: string; id: string; label: string };
export const REF_ICON: Record<string, string> = { MODULE: "📘", VIDEO: "🎬", TEST: "✅", WORKSHEET: "📝", ASSIGNMENT: "🏠", MONTHLY: "🗓️", TERM: "🎓", MOCK: "📄", KIT: "🧪" };
export function refHref(r: Ref) {
  if (r.type === "MODULE" || r.type === "VIDEO") return `/learn/${r.id}`;
  if (r.type === "KIT") return `/teacher/projects/kit/${r.id}`;
  return `/teacher/library/${r.id}`;
}
