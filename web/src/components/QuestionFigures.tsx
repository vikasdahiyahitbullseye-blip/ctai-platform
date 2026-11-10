// Shared display of a question's picture and its options (text or pictures) for review, print and bank views.
import { Figure } from "./Figure";
import { parseFig, parseFigs, type Fig } from "@/lib/figures";

const letter = (k: number) => String.fromCharCode(97 + k);

export function StemFigure({ json, fig }: { json?: string | null; fig?: Fig | null }) {
  const f = fig ?? parseFig(json);
  if (!f) return null;
  return <div className="my-2 overflow-x-auto"><Figure fig={f} /></div>;
}

/** Lists options as (a) text… or, for picture answers, as small labelled pictures. */
export function OptionList({ options, figuresJson, figures, className = "mt-2 grid gap-1 text-sm sm:grid-cols-2" }: { options: string[]; figuresJson?: string | null; figures?: (Fig | null)[] | null; className?: string }) {
  if (!options.length) return null;
  const figs = figures ?? parseFigs(figuresJson);
  if (figs?.some(Boolean)) {
    return (
      <div className="mt-2 flex flex-wrap gap-3">
        {options.map((o, k) => (
          <div key={k} className="flex items-start gap-1.5">
            <span className="font-semibold">({letter(k)})</span>
            {figs[k] ? <Figure fig={figs[k]!} size="sm" /> : <span>{o}</span>}
          </div>
        ))}
      </div>
    );
  }
  return <ul className={className}>{options.map((o, k) => <li key={k}>({letter(k)}) {o}</li>)}</ul>;
}
