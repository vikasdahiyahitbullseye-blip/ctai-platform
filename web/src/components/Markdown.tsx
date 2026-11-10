// Minimal, safe renderer for question text: **bold**, line breaks, "- " lists and pipe tables. No raw HTML.
import React from "react";

function inline(text: string, key: string | number): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <React.Fragment key={key}>
      {parts.map((p, i) => (p.startsWith("**") && p.endsWith("**") ? <strong key={i}>{p.slice(2, -2)}</strong> : <React.Fragment key={i}>{p}</React.Fragment>))}
    </React.Fragment>
  );
}

export function Markdown({ text, className = "" }: { text: string; className?: string }) {
  const blocks = text.split(/\n\s*\n/);
  return (
    <div className={`space-y-3 ${className}`}>
      {blocks.map((block, bi) => {
        const lines = block.split("\n").filter((l) => l.trim() !== "");
        if (lines.length >= 2 && lines.every((l) => l.trim().startsWith("|"))) {
          const rows = lines.filter((l) => !/^\s*\|[\s|:-]+\|\s*$/.test(l)).map((l) => l.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim()));
          const [head, ...body] = rows;
          return (
            <table key={bi} className="border-collapse text-sm">
              <thead>
                <tr>{head.map((c, i) => <th key={i} className="border border-line bg-surface-2 px-3 py-1.5 text-left font-semibold">{inline(c, i)}</th>)}</tr>
              </thead>
              <tbody>
                {body.map((r, ri) => (
                  <tr key={ri}>{r.map((c, i) => <td key={i} className="border border-line px-3 py-1.5">{inline(c, i)}</td>)}</tr>
                ))}
              </tbody>
            </table>
          );
        }
        if (lines.every((l) => l.trim().startsWith("- "))) {
          return (
            <ul key={bi} className="list-disc space-y-1 pl-6">
              {lines.map((l, i) => <li key={i}>{inline(l.trim().slice(2), i)}</li>)}
            </ul>
          );
        }
        // Mixed block: leading text then list items.
        return (
          <div key={bi}>
            {lines.map((l, i) =>
              l.trim().startsWith("- ") ? (
                <div key={i} className="flex gap-2 pl-2"><span aria-hidden>•</span><span>{inline(l.trim().slice(2), i)}</span></div>
              ) : (
                <p key={i}>{inline(l, i)}</p>
              ),
            )}
          </div>
        );
      })}
    </div>
  );
}
