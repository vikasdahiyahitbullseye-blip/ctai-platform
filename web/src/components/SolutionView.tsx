// A worked solution in the CBSE Teacher Handbook style: text with pictures placed where the working needs them.
// "[fig:1]" in the text shows the first picture of solutionFigures, "[fig:2]" the second, and so on.
import { Markdown } from "./Markdown";
import { Figure } from "./Figure";
import { parseFigs, type Fig } from "@/lib/figures";

export function SolutionView({ text, figuresJson, figures, className = "" }: { text: string; figuresJson?: string | null; figures?: (Fig | null)[] | null; className?: string }) {
  const figs = figures ?? parseFigs(figuresJson) ?? [];
  const parts = text.split(/\[fig:(\d+)\]/);
  return (
    <div className={`space-y-3 ${className}`}>
      {parts.map((p, i) => {
        if (i % 2 === 1) { const f = figs[Number(p) - 1]; return f ? <div key={i} className="overflow-x-auto"><Figure fig={f} /></div> : null; }
        return p.trim() ? <Markdown key={i} text={p.trim()} /> : null;
      })}
    </div>
  );
}
