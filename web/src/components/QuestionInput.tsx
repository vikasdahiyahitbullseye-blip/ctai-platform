"use client";
import type { ClientQuestion } from "@/lib/questions";
import type { AnswerValue } from "@/lib/scoring";
import { Markdown } from "./Markdown";

const letter = (n: number) => String.fromCharCode(97 + n);

export function QuestionInput({ q, value, onChange, disabled, big }: { q: ClientQuestion; value: AnswerValue; onChange: (v: AnswerValue) => void; disabled?: boolean; big?: boolean }) {
  const optBase = `flex w-full items-center gap-3 rounded-xl border-2 px-4 text-left transition ${big ? "py-4 text-lg" : "py-3"} disabled:cursor-default`;
  const sel = "border-brand bg-brand-soft";
  const unsel = "border-line bg-surface hover:border-brand/50";
  return (
    <div className="space-y-5">
      <Markdown text={q.stem} className={big ? "text-xl leading-relaxed" : "text-lg leading-relaxed"} />
      {q.type === "MCQ" && (
        <div className="grid gap-2 sm:grid-cols-2" role="radiogroup">
          {q.options.map((o, idx) => (
            <button key={o.i} type="button" role="radio" aria-checked={value === o.i} disabled={disabled} onClick={() => onChange(o.i)} className={`${optBase} ${value === o.i ? sel : unsel}`}>
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-2 text-sm font-bold">{letter(idx)}</span>
              <span>{o.text}</span>
            </button>
          ))}
        </div>
      )}
      {q.type === "MULTI" && (
        <div className="grid gap-2 sm:grid-cols-2">
          <p className="text-sm text-muted sm:col-span-2">Choose all that apply.</p>
          {q.options.map((o) => {
            const arr = Array.isArray(value) ? (value as number[]) : [];
            const on = arr.includes(o.i);
            return (
              <button key={o.i} type="button" role="checkbox" aria-checked={on} disabled={disabled} onClick={() => onChange(on ? arr.filter((x) => x !== o.i) : [...arr, o.i])} className={`${optBase} ${on ? sel : unsel}`}>
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 ${on ? "border-brand bg-brand text-white" : "border-line"}`}>{on ? "✓" : ""}</span>
                <span>{o.text}</span>
              </button>
            );
          })}
        </div>
      )}
      {q.type === "TRUE_FALSE" && (
        <div className="grid grid-cols-2 gap-3" role="radiogroup">
          {[true, false].map((v) => (
            <button key={String(v)} type="button" role="radio" aria-checked={value === v} disabled={disabled} onClick={() => onChange(v)} className={`${optBase} justify-center font-semibold ${value === v ? sel : unsel}`}>
              {v ? "True" : "False"}
            </button>
          ))}
        </div>
      )}
      {(q.type === "NUMERIC" || q.type === "FILL_BLANK") && (
        <label className="block max-w-xs">
          <span className="text-sm text-muted">{q.type === "NUMERIC" ? "Type your number" : "Type your answer"}</span>
          <input
            type="text"
            inputMode={q.type === "NUMERIC" ? "decimal" : "text"}
            value={value === null || value === undefined ? "" : String(value)}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            className={`mt-1 w-full rounded-xl border-2 border-line bg-surface px-4 outline-none focus:border-brand ${big ? "py-4 text-2xl" : "py-3 text-lg"}`}
            autoComplete="off"
          />
        </label>
      )}
      {q.type === "ORDER" && <OrderInput q={q} value={value} onChange={onChange} disabled={disabled} />}
    </div>
  );
}

function OrderInput({ q, value, onChange, disabled }: { q: ClientQuestion; value: AnswerValue; onChange: (v: AnswerValue) => void; disabled?: boolean }) {
  const order: number[] = Array.isArray(value) && value.length === q.options.length ? (value as number[]) : q.options.map((o) => o.i);
  const text = (i: number) => q.options.find((o) => o.i === i)?.text;
  const move = (idx: number, dir: -1 | 1) => {
    const next = [...order];
    const j = idx + dir;
    if (j < 0 || j >= next.length) return;
    [next[idx], next[j]] = [next[j], next[idx]];
    onChange(next);
  };
  return (
    <ol className="space-y-2">
      <p className="text-sm text-muted">Use the arrows to put the items in order (top = first).</p>
      {order.map((i, idx) => (
        <li key={i} className="flex items-center gap-3 rounded-xl border-2 border-line bg-surface px-3 py-2">
          <span className="w-6 text-center font-bold text-muted">{idx + 1}</span>
          <span className="flex-1">{text(i)}</span>
          <button type="button" aria-label={`Move ${text(i)} up`} disabled={disabled || idx === 0} onClick={() => move(idx, -1)} className="rounded-lg px-2 py-1 hover:bg-surface-2 disabled:opacity-30">▲</button>
          <button type="button" aria-label={`Move ${text(i)} down`} disabled={disabled || idx === order.length - 1} onClick={() => move(idx, 1)} className="rounded-lg px-2 py-1 hover:bg-surface-2 disabled:opacity-30">▼</button>
        </li>
      ))}
    </ol>
  );
}

export function hasAnswer(q: ClientQuestion, v: AnswerValue): boolean {
  if (v === null || v === undefined || v === "") return false;
  if (q.type === "MULTI") return Array.isArray(v) && v.length > 0;
  return true;
}

/** Normalises UI values before sending (ORDER defaults to the displayed order). */
export function finalAnswer(q: ClientQuestion, v: AnswerValue): AnswerValue {
  if (q.type === "ORDER") return Array.isArray(v) && v.length === q.options.length ? v : q.options.map((o) => o.i);
  if (q.type === "NUMERIC" && typeof v === "string") return v.trim();
  return v;
}
