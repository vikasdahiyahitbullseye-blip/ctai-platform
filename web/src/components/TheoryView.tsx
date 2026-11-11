// "Learn it": the theory behind a chapter's questions (Classes 3–5), the same content as the help books.
import { THEORY } from "../../prisma/content/theory";
import { Markdown } from "./Markdown";
import { Figure } from "./Figure";

const ACCENTS = ["border-l-indigo-600", "border-l-orange-500", "border-l-green-500", "border-l-pink-500"];
const DOTS = ["bg-indigo-600", "bg-orange-500", "bg-green-500", "bg-pink-500"];

/** Short text with **bold**, kept inline. */
function B({ text }: { text: string }) {
  return <>{text.split(/(\*\*[^*]+\*\*)/g).map((p, i) => (p.startsWith("**") && p.endsWith("**") ? <strong key={i}>{p.slice(2, -2)}</strong> : p))}</>;
}

export function hasTheory(key: string) {
  return !!THEORY[key];
}

export function TheoryView({ theoryKey }: { theoryKey: string }) {
  const t = THEORY[theoryKey];
  if (!t) return null;
  return (
    <section className="space-y-4" aria-labelledby="learn-it">
      <div className="rounded-2xl bg-brand-soft p-5">
        <div className="text-xs font-bold uppercase tracking-widest text-accent">Learn it · before the questions</div>
        <h2 id="learn-it" className="mt-1 text-xl font-bold">The ideas in this chapter</h2>
        <Markdown text={t.intro} className="mt-1 text-ink-2" />
      </div>
      {t.concepts.map((c, i) => (
        <article key={i} className={`rounded-2xl border border-line border-l-[6px] ${ACCENTS[i % 4]} bg-surface p-5`}>
          <h3 className="flex items-center gap-2 text-lg font-bold">
            <span className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm text-white ${DOTS[i % 4]}`}>{i + 1}</span>
            <span><B text={c.title} /></span>
          </h3>
          <div className="mt-2 flex flex-wrap items-start gap-4">
            <div className="min-w-[240px] flex-1 space-y-2">
              <Markdown text={c.text} />
              {c.points && <ul className="list-disc space-y-1 pl-5">{c.points.map((p, j) => <li key={j}><B text={p} /></li>)}</ul>}
              {c.table && (
                <div className="overflow-x-auto">
                  <table className="text-sm">
                    <thead><tr>{c.table[0].map((h, j) => <th key={j} className="border border-line bg-brand-soft px-3 py-1 text-left"><B text={h} /></th>)}</tr></thead>
                    <tbody>{c.table.slice(1).map((r, ri) => <tr key={ri}>{r.map((cell, j) => <td key={j} className="border border-line px-3 py-1"><B text={cell} /></td>)}</tr>)}</tbody>
                  </table>
                </div>
              )}
            </div>
            {c.fig && <div className="max-w-full overflow-x-auto" role="img" aria-label={c.fig.alt}><Figure fig={c.fig} /></div>}
          </div>
          {c.example && (
            <div className="mt-3 rounded-xl border border-line bg-good-soft p-3">
              <div className="text-xs font-bold uppercase tracking-wider text-good">Worked example</div>
              <Markdown text={c.example.q} className="mt-1 font-semibold" />
              <ol className="mt-1 list-decimal space-y-0.5 pl-5">{c.example.steps.map((s, j) => <li key={j}><B text={s} /></li>)}</ol>
              <div className="mt-2 inline-block rounded-full bg-good px-3 py-0.5 font-semibold text-white">✓ <B text={c.example.answer} /></div>
            </div>
          )}
          {c.remember && <div className="mt-3 rounded-xl border border-line bg-accent-soft p-3"><strong>⭐ Remember:</strong> <B text={c.remember} /></div>}
        </article>
      ))}
      <div className="rounded-2xl bg-brand p-4 text-white"><strong>💡 Thinking tip:</strong> <B text={t.tip} /></div>
    </section>
  );
}
