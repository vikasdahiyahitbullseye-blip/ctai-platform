"use client";
// Boards for Robot Coder, Picture Logic, Water Jugs, Make the Number and Magic Square.
import { useEffect, useMemo, useRef, useState } from "react";
import { makeRobot, runRobot, makeNonogram, lineClue, makeJugs, jugStep, makeTarget, evalExpr, makeMagic, isMagic, type Block, type JugMove } from "@/lib/games";

type Solved = (solution: unknown, moves: number) => void;
const key = "rounded-xl px-3 py-2 text-sm font-extrabold shadow-[0_3px_0_rgba(0,0,0,.15)] active:translate-y-0.5 disabled:opacity-40";

// ---------- Robot Coder ----------
const ARROW = ["→", "↓", "←", "↑"];
const CMD: Record<Block[0], string> = { F: "⬆ Forward", L: "↺ Left", R: "↻ Right" };
export function RobotBoard({ seed, level, onSolved }: { seed: string; level: number; onSolved: Solved }) {
  const p = useMemo(() => makeRobot(seed, level), [seed, level]);
  const [prog, setProg] = useState<Block[]>([]);
  const [times, setTimes] = useState(1);
  const [shown, setShown] = useState<{ pos: number; dir: number; trail: number[] } | null>(null);
  const [msg, setMsg] = useState("");
  const [running, setRunning] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);
  const add = (c: Block[0]) => { setMsg(""); setShown(null); setProg((q) => (q.length >= 40 ? q : [...q, [c, c === "F" ? times : 1]])); };
  const run = () => {
    const res = runRobot(p, prog);
    // replay the path one square at a time
    let i = 0; setRunning(true); setMsg("");
    timer.current = setInterval(() => {
      i++;
      setShown({ pos: res.path[Math.min(i, res.path.length - 1)], dir: i >= res.path.length - 1 ? res.dir : 0, trail: res.path.slice(0, i + 1) });
      if (i >= res.path.length - 1) {
        clearInterval(timer.current!); setRunning(false);
        if (res.reached) onSolved(prog, prog.length);
        else setMsg(res.crashed ? "💥 Crash! The robot hit a wall or the edge. Fix your program." : "The robot stopped before the star. Add more blocks.");
      }
    }, 280);
  };
  const pos = shown?.pos ?? p.start, dir = shown?.dir ?? 0;
  return (
    <div className="mx-auto max-w-lg">
      <p className="mb-3 text-center text-sm font-bold">Blocks: {prog.length} · tidy solution: {p.par} blocks or fewer</p>
      <div className="grid gap-1 rounded-2xl bg-surface-2 p-2" style={{ gridTemplateColumns: `repeat(${p.n}, minmax(0, 1fr))` }}>
        {p.wall.map((w, i) => (
          <div key={i} className={`flex aspect-square items-center justify-center rounded-lg text-xl ${w ? "bg-[#475569]" : shown?.trail.includes(i) ? "bg-brand-soft" : "bg-surface"}`} aria-label={w ? "wall" : i === p.goal ? "goal" : undefined}>
            {i === pos ? <span className="flex flex-col items-center leading-none"><span aria-hidden>🤖</span><span className="text-xs font-black text-brand">{ARROW[dir]}</span></span> : i === p.goal ? "⭐" : ""}
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        {(["F", "L", "R"] as const).map((c) => <button key={c} type="button" onClick={() => add(c)} disabled={running} className={`${key} bg-brand text-white`}>{CMD[c]}{c === "F" && p.repeat && times > 1 ? ` ×${times}` : ""}</button>)}
        {p.repeat && (
          <span className="flex items-center gap-1 rounded-xl bg-surface-2 px-2 py-1 text-sm font-bold">
            Repeat <button type="button" className="h-7 w-7 rounded-lg bg-surface" onClick={() => setTimes((t) => Math.max(1, t - 1))} aria-label="Fewer repeats">−</button>
            <span className="w-5 text-center tabular-nums">{times}</span>
            <button type="button" className="h-7 w-7 rounded-lg bg-surface" onClick={() => setTimes((t) => Math.min(9, t + 1))} aria-label="More repeats">+</button>
          </span>
        )}
      </div>
      <ol className="mt-3 flex min-h-12 flex-wrap gap-1.5 rounded-2xl border-2 border-dashed border-line p-2" aria-label="Program">
        {prog.length ? prog.map((b, i) => (
          <li key={i}><button type="button" disabled={running} onClick={() => { setShown(null); setProg((q) => q.filter((_, k) => k !== i)); }} className="rounded-lg bg-accent-soft px-2 py-1 text-xs font-extrabold" title="Remove this block">{i + 1}. {CMD[b[0]]}{b[1] > 1 ? ` ×${b[1]}` : ""} ✕</button></li>
        )) : <li className="text-sm text-muted">Your program appears here. Tap a block to remove it.</li>}
      </ol>
      <p className="mt-2 min-h-6 text-center text-sm font-bold text-bad" role="status">{msg}</p>
      <div className="flex justify-center gap-2">
        <button type="button" className="kbtn kbtn-ghost px-4 py-2 text-sm" onClick={() => { setProg([]); setShown(null); setMsg(""); }} disabled={running || !prog.length}>Clear</button>
        <button type="button" className="kbtn px-6 py-2" onClick={run} disabled={running || !prog.length}>{running ? "Running…" : "▶ Run"}</button>
      </div>
    </div>
  );
}

// ---------- Picture Logic ----------
export function NonogramBoard({ seed, level, onSolved }: { seed: string; level: number; onSolved: Solved }) {
  const p = useMemo(() => makeNonogram(seed, level), [seed, level]);
  const [cells, setCells] = useState<number[]>(() => Array(p.n * p.n).fill(0)); // 0 empty, 1 shaded, 2 marked empty
  const done = useRef(false);
  const shaded = cells.map((c) => c === 1);
  const rowOk = (y: number) => lineClue(shaded.slice(y * p.n, y * p.n + p.n)).join() === p.rows[y].join();
  const colOk = (x: number) => lineClue(Array.from({ length: p.n }, (_, y) => shaded[y * p.n + x])).join() === p.cols[x].join();
  const tap = (i: number) => {
    const next = cells.map((c, k) => (k === i ? (c + 1) % 3 : c));
    setCells(next);
    const s = next.map((c) => c === 1);
    const ok = Array.from({ length: p.n }, (_, k) => lineClue(s.slice(k * p.n, k * p.n + p.n)).join() === p.rows[k].join() && lineClue(Array.from({ length: p.n }, (_, y) => s[y * p.n + k])).join() === p.cols[k].join()).every(Boolean);
    if (ok && !done.current) { done.current = true; onSolved(s, s.filter(Boolean).length); }
  };
  const cell = p.n <= 6 ? "h-10 w-10" : p.n <= 8 ? "h-8 w-8" : "h-7 w-7";
  return (
    <div className="overflow-x-auto">
      <table className="mx-auto border-separate" style={{ borderSpacing: 2 }}>
        <thead>
          <tr><th />{p.cols.map((c, x) => <th key={x} className={`align-bottom text-xs font-extrabold leading-tight ${colOk(x) ? "text-good" : "text-ink-2"}`}>{c.map((v, k) => <div key={k}>{v}</div>)}</th>)}</tr>
        </thead>
        <tbody>
          {p.rows.map((r, y) => (
            <tr key={y}>
              <th className={`whitespace-nowrap pr-2 text-right text-xs font-extrabold ${rowOk(y) ? "text-good" : "text-ink-2"}`}>{r.join(" ")}</th>
              {Array.from({ length: p.n }, (_, x) => {
                const i = y * p.n + x, c = cells[i];
                return <td key={x}><button type="button" onClick={() => tap(i)} aria-label={`Row ${y + 1} column ${x + 1}: ${c === 1 ? "shaded" : c === 2 ? "marked empty" : "blank"}`} className={`${cell} rounded-md border-2 text-sm font-black ${c === 1 ? "border-ink bg-ink" : c === 2 ? "border-line bg-surface text-muted" : "border-line bg-surface"}`}>{c === 2 ? "✕" : ""}</button></td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-center text-xs font-bold text-muted">Clues turn green when their row or column is right.</p>
    </div>
  );
}

// ---------- Water Jugs ----------
const JUG_LABEL: Record<JugMove, string> = { fillA: "Fill A", fillB: "Fill B", emptyA: "Empty A", emptyB: "Empty B", AtoB: "Pour A → B", BtoA: "Pour B → A" };
export function JugsBoard({ seed, level, onSolved }: { seed: string; level: number; onSolved: Solved }) {
  const p = useMemo(() => makeJugs(seed, level), [seed, level]);
  const [moves, setMoves] = useState<JugMove[]>([]);
  const state = moves.reduce<[number, number]>((s, m) => jugStep(s, m, p.A, p.B), [0, 0]);
  const act = (m: JugMove) => {
    const all = [...moves, m]; setMoves(all);
    const s = all.reduce<[number, number]>((x, k) => jugStep(x, k, p.A, p.B), [0, 0]);
    if (s[0] === p.target || s[1] === p.target) onSolved(all, all.length);
  };
  const Jug = ({ label, cap, v }: { label: string; cap: number; v: number }) => (
    <div className="flex flex-col items-center">
      <div className="relative w-20 overflow-hidden rounded-b-2xl border-4 border-t-0 border-ink/60 bg-surface" style={{ height: `${60 + cap * 14}px` }} aria-label={`Jug ${label}: ${v} of ${cap} litres`}>
        <div className="absolute inset-x-0 bottom-0 bg-[#60a5fa] transition-all duration-300" style={{ height: `${(v / cap) * 100}%` }} />
        <span className="absolute inset-x-0 bottom-1 text-center text-lg font-black">{v}</span>
      </div>
      <span className="mt-1 text-sm font-extrabold">Jug {label} · {cap} L</span>
    </div>
  );
  return (
    <div className="mx-auto max-w-md">
      <p className="mb-3 text-center font-bold">Get exactly <span className="rounded-lg bg-accent-soft px-2 text-xl font-black">{p.target} L</span> in either jug · moves: {moves.length} · tidy: {p.par}</p>
      <div className="flex items-end justify-center gap-10"><Jug label="A" cap={p.A} v={state[0]} /><Jug label="B" cap={p.B} v={state[1]} /></div>
      <div className="mt-5 grid grid-cols-2 gap-2">
        {(Object.keys(JUG_LABEL) as JugMove[]).map((m) => <button key={m} type="button" onClick={() => act(m)} className={`${key} bg-brand text-white`}>{JUG_LABEL[m]}</button>)}
      </div>
      <div className="mt-3 flex justify-center gap-2">
        <button type="button" className="kbtn kbtn-ghost px-4 py-2 text-sm" onClick={() => setMoves((m) => m.slice(0, -1))} disabled={!moves.length}>↶ Undo</button>
        <button type="button" className="kbtn kbtn-ghost px-4 py-2 text-sm" onClick={() => setMoves([])} disabled={!moves.length}>↺ Start again</button>
      </div>
    </div>
  );
}

// ---------- Make the Number ----------
type Tok = { t: string; card?: number };
export function TargetBoard({ seed, level, onSolved }: { seed: string; level: number; onSolved: Solved }) {
  const p = useMemo(() => makeTarget(seed, level), [seed, level]);
  const [toks, setToks] = useState<Tok[]>([]);
  const [msg, setMsg] = useState("");
  const expr = toks.map((t) => t.t).join("");
  const val = expr ? evalExpr(expr) : null;
  const used = new Set(toks.filter((t) => t.card !== undefined).map((t) => t.card));
  const ops = ["+", "-", ...(p.ops.includes("×") ? ["×"] : []), ...(p.ops.includes("÷") ? ["÷"] : []), "(", ")"];
  const push = (t: Tok) => { setMsg(""); setToks((q) => [...q, t]); };
  const check = () => {
    if (!val) return setMsg("That calculation is not complete or not allowed (÷ must come out exactly).");
    if (val.value !== p.target) return setMsg(`That makes ${val.value}, not ${p.target}. Keep trying!`);
    onSolved(expr, val.numbers.length);
  };
  return (
    <div className="mx-auto max-w-md">
      <p className="mb-3 text-center font-bold">Make <span className="rounded-xl bg-accent-soft px-3 py-1 text-3xl font-black">{p.target}</span></p>
      <div className="mb-3 flex flex-wrap justify-center gap-2">
        {p.numbers.map((n, i) => <button key={i} type="button" disabled={used.has(i)} onClick={() => push({ t: String(n), card: i })} className={`${key} h-14 w-14 bg-[#fde68a] text-2xl text-ink`}>{n}</button>)}
      </div>
      <div className="mb-3 flex flex-wrap justify-center gap-2">
        {ops.map((o) => <button key={o} type="button" onClick={() => push({ t: o })} className={`${key} h-11 w-11 bg-surface-2 text-xl`} aria-label={o === "-" ? "minus" : o}>{o === "-" ? "−" : o}</button>)}
      </div>
      <div className="flex min-h-14 items-center justify-center rounded-2xl border-2 border-line bg-surface px-3 font-mono text-2xl font-black" aria-live="polite">
        {expr.replace(/-/g, "−") || <span className="font-sans text-sm font-bold text-muted">Tap cards and signs</span>}
        {val && <span className={`ml-3 ${val.value === p.target ? "text-good" : "text-muted"}`}>= {val.value}</span>}
      </div>
      <p className="mt-2 min-h-6 text-center text-sm font-bold text-bad" role="status">{msg}</p>
      <div className="flex justify-center gap-2">
        <button type="button" className="kbtn kbtn-ghost px-4 py-2 text-sm" onClick={() => setToks((q) => q.slice(0, -1))} disabled={!toks.length}>⌫ Back</button>
        <button type="button" className="kbtn kbtn-ghost px-4 py-2 text-sm" onClick={() => setToks([])} disabled={!toks.length}>Clear</button>
        <button type="button" className="kbtn px-6 py-2" onClick={check} disabled={!toks.length}>Check</button>
      </div>
    </div>
  );
}

// ---------- Magic Square ----------
export function MagicBoard({ seed, level, onSolved }: { seed: string; level: number; onSolved: Solved }) {
  const p = useMemo(() => makeMagic(seed, level), [seed, level]);
  const [grid, setGrid] = useState(p.givens);
  const [sel, setSel] = useState(p.givens.indexOf(0));
  const done = useRef(false);
  const n = p.n;
  const sums = {
    rows: Array.from({ length: n }, (_, y) => grid.slice(y * n, y * n + n)),
    cols: Array.from({ length: n }, (_, x) => Array.from({ length: n }, (_, y) => grid[y * n + x])),
  };
  const total = (a: number[]) => (a.every(Boolean) ? a.reduce((s, v) => s + v, 0) : null);
  const tone = (a: number[]) => { const t = total(a); return t === null ? "text-muted" : t === p.sum ? "text-good" : "text-bad"; };
  const put = (v: number) => {
    if (sel < 0 || p.givens[sel]) return;
    const next = grid.map((g, i) => (i === sel ? v : g));
    setGrid(next);
    if (!done.current && next.every(Boolean) && isMagic(next, n)) { done.current = true; onSolved(next, 0); }
  };
  const d1 = Array.from({ length: n }, (_, k) => grid[k * n + k]), d2 = Array.from({ length: n }, (_, k) => grid[k * n + n - 1 - k]);
  return (
    <div className="mx-auto max-w-sm">
      <p className="mb-3 text-center font-bold">Every row, column and diagonal must make <span className="rounded-lg bg-accent-soft px-2 text-xl font-black">{p.sum}</span></p>
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr)) 2.5rem` }}>
        {Array.from({ length: n }, (_, y) => (
          <div key={y} className="contents">
            {Array.from({ length: n }, (_, x) => {
              const i = y * n + x, given = !!p.givens[i];
              const dup = grid[i] && grid.filter((v) => v === grid[i]).length > 1;
              return <button key={x} type="button" onClick={() => setSel(i)} aria-label={`Row ${y + 1} column ${x + 1}${grid[i] ? `, ${grid[i]}` : ", empty"}`} className={`flex aspect-square items-center justify-center rounded-xl border-2 text-2xl font-black ${i === sel ? "border-brand bg-brand-soft" : given ? "border-line bg-surface-2" : "border-line bg-surface"} ${given ? "text-ink" : dup ? "text-bad" : "text-brand"}`}>{grid[i] || ""}</button>;
            })}
            <span className={`flex items-center justify-center text-sm font-black tabular-nums ${tone(sums.rows[y])}`}>{total(sums.rows[y]) ?? "·"}</span>
          </div>
        ))}
        {sums.cols.map((c, x) => <span key={x} className={`text-center text-sm font-black tabular-nums ${tone(c)}`}>{total(c) ?? "·"}</span>)}
        <span className={`text-center text-xs font-black ${tone(d1)}`} title="Diagonals">↘{total(d1) ?? "·"} ↙{total(d2) ?? "·"}</span>
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-1.5">
        {Array.from({ length: n * n }, (_, k) => k + 1).map((v) => <button key={v} type="button" onClick={() => put(v)} className={`${key} h-11 w-11 bg-brand text-white`}>{v}</button>)}
        <button type="button" onClick={() => put(0)} className={`${key} h-11 w-11 bg-surface-2`} aria-label="Clear square">✕</button>
      </div>
    </div>
  );
}
