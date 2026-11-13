"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  GAMES, LEVELS, newSeed, type GameId, type Move,
  makeSudoku, checkSudoku, hanoiStart, hanoiMove, hanoiPar, makeLights, lightsToggle, makeSlide, slideTile, makeCode, codeClue, validGuess,
} from "@/lib/games";
import { submitGame, type GameResult } from "@/app/actions/games";
import { Confetti, Mascot } from "@/components/kid";

type Solved = (solution: unknown, moves: number) => void;

/** Shell: new puzzle, timer, how-to-play, submitting the solution and showing the XP. */
export function GamePlayer({ game, tier, level, xpGamesLeft }: { game: GameId; tier: string; level: number; xpGamesLeft: number }) {
  const [seed, setSeed] = useState<string | null>(null);
  const [started, setStarted] = useState(0);
  const [now, setNow] = useState(0);
  const [result, setResult] = useState<GameResult | null>(null);
  const [lost, setLost] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const info = GAMES[game];

  const fresh = () => {
    setSeed(newSeed());
    setStarted(Date.now());
    setNow(Date.now());
    setResult(null);
    setLost(null);
  };
  useEffect(fresh, []); // the puzzle is random, so make it in the browser only
  useEffect(() => {
    if (result || lost) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [result, lost]);

  const secs = Math.max(0, Math.floor((now - started) / 1000));
  const onSolved: Solved = (solution) => start(async () => setResult(await submitGame(game, tier, seed!, solution, Math.round((Date.now() - started) / 1000))));

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <section className="rounded-[2rem] border-2 border-line bg-surface p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-2xl font-extrabold">{info.icon} {info.name}</h2>
          <div className="flex items-center gap-3 text-sm font-bold">
            <span className="tabular-nums" aria-label="Time">⏱ {Math.floor(secs / 60)}:{String(secs % 60).padStart(2, "0")}</span>
            <button type="button" className="kbtn kbtn-ghost px-3 py-1.5 text-sm" onClick={fresh} disabled={pending}>🔄 New puzzle</button>
          </div>
        </div>
        {!seed ? <p className="py-10 text-center font-bold text-muted">Making a puzzle…</p> : result?.ok ? (
          <div className="pop-in py-6 text-center">
            <Confetti fire={1} />
            <Mascot size={72} mood="cheer" />
            <p className="mt-2 text-3xl font-extrabold text-good">Solved! 🎉</p>
            <p className="mt-1 font-bold">{game === "SUDOKU" ? `${secs} seconds` : `${result.moves} moves · ${secs} seconds`}{result.onPar && game !== "SUDOKU" ? " · ⭐ tidy solution" : ""}</p>
            <p className="mt-2 text-xl font-extrabold text-brand">{result.xp ? `+${result.xp} XP` : "No XP this time — you have used today's 5 XP games. Keep practising for fun!"}</p>
            {result.best !== null && game !== "SUDOKU" && <p className="mt-1 text-sm text-muted">Your best at this level: {Math.min(result.best, result.moves)} moves</p>}
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <button className="kbtn" onClick={fresh}>Play again</button>
              <Link href="/student/games" className="kbtn kbtn-ghost">All games</Link>
            </div>
          </div>
        ) : lost ? (
          <div className="py-6 text-center">
            <Mascot size={72} mood="think" />
            <p className="mt-2 text-2xl font-extrabold">Out of tries!</p>
            <p className="mt-1 font-bold">The code was <span className="font-mono text-2xl tracking-widest">{lost}</span></p>
            <button className="kbtn mt-4" onClick={fresh}>Try a new code</button>
          </div>
        ) : (
          <div key={seed} aria-busy={pending}>
            {game === "SUDOKU" && <SudokuBoard seed={seed} level={level} onSolved={onSolved} />}
            {game === "HANOI" && <HanoiBoard level={level} onSolved={onSolved} />}
            {game === "LIGHTS" && <LightsBoard seed={seed} level={level} onSolved={onSolved} />}
            {game === "SLIDE" && <SlideBoard seed={seed} level={level} onSolved={onSolved} />}
            {game === "CODE" && <CodeBoard seed={seed} level={level} onSolved={onSolved} onLost={setLost} />}
            {result && !result.ok && <p className="mt-3 text-center font-bold text-bad" role="alert">{result.error}</p>}
            {pending && <p className="mt-3 text-center font-bold text-muted">Checking…</p>}
          </div>
        )}
      </section>
      <aside className="space-y-4">
        <section className="rounded-[2rem] border-2 border-line bg-surface p-5">
          <h3 className="text-lg font-extrabold">How to play</h3>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm">{info.how.map((h) => <li key={h}>{h}</li>)}</ul>
          <p className="mt-3 text-xs font-bold text-muted">Thinking skill: {info.skill}</p>
        </section>
        <section className="rounded-[2rem] border-2 border-line bg-accent-soft p-5 text-sm">
          <p className="font-extrabold">⭐ XP</p>
          <p className="mt-1">Solving earns XP; harder levels earn more, plus a bonus for a tidy solution. The first 5 solved games each day earn XP{xpGamesLeft < 5 ? ` (${xpGamesLeft} left today)` : ""}.</p>
        </section>
      </aside>
    </div>
  );
}

// ---------- Sudoku ----------
function SudokuBoard({ seed, level, onSolved }: { seed: string; level: number; onSolved: Solved }) {
  const p = useMemo(() => makeSudoku(seed, level), [seed, level]);
  const [grid, setGrid] = useState(p.givens);
  const [sel, setSel] = useState(p.givens.indexOf(0));
  const done = useRef(false);
  const n = p.n;
  const clash = (i: number) => {
    const v = grid[i];
    if (!v) return false;
    const r = Math.floor(i / n), c = i % n, r0 = r - (r % p.bh), c0 = c - (c % p.bw);
    return grid.some((w, j) => j !== i && w === v && (Math.floor(j / n) === r || j % n === c || (Math.floor(j / n) >= r0 && Math.floor(j / n) < r0 + p.bh && j % n >= c0 && j % n < c0 + p.bw)));
  };
  const put = (v: number) => {
    if (sel < 0 || p.givens[sel]) return;
    const next = [...grid];
    next[sel] = v;
    setGrid(next);
    if (!done.current && next.every(Boolean) && checkSudoku(p, next)) {
      done.current = true;
      onSolved(next, 0);
    }
  };
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      const d = Number(e.key);
      if (d >= 1 && d <= n) put(d);
      else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") put(0);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  });
  const full = grid.every(Boolean);
  return (
    <div className="mx-auto max-w-md">
      <div className="grid overflow-hidden rounded-xl border-4 border-ink" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }} role="grid" aria-label={`${n} by ${n} Sudoku`}>
        {grid.map((v, i) => {
          const r = Math.floor(i / n), c = i % n;
          const given = !!p.givens[i];
          const border = `${c % p.bw === p.bw - 1 && c < n - 1 ? "border-r-[3px] border-r-ink" : "border-r border-r-line"} ${r % p.bh === p.bh - 1 && r < n - 1 ? "border-b-[3px] border-b-ink" : "border-b border-b-line"}`;
          return (
            <button key={i} type="button" role="gridcell" onClick={() => setSel(i)} aria-label={`Row ${r + 1} column ${c + 1}${v ? `, ${v}` : ", empty"}${given ? " (given)" : ""}`}
              className={`flex aspect-square items-center justify-center font-extrabold ${n === 9 ? "text-lg sm:text-xl" : "text-2xl sm:text-3xl"} ${border} ${i === sel ? "bg-brand-soft" : given ? "bg-surface-2" : "bg-surface"} ${given ? "text-ink" : clash(i) ? "text-bad" : "text-brand"}`}>
              {v || ""}
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {Array.from({ length: n }, (_, k) => k + 1).map((d) => <button key={d} type="button" onClick={() => put(d)} className="h-12 w-12 rounded-xl bg-brand text-xl font-extrabold text-white shadow-[0_3px_0_var(--brand-ink)] active:translate-y-0.5">{d}</button>)}
        <button type="button" onClick={() => put(0)} className="h-12 w-12 rounded-xl bg-surface-2 text-xl font-extrabold" aria-label="Clear square">✕</button>
      </div>
      {full && !checkSudoku(p, grid) && <p className="mt-3 text-center font-bold text-bad">Every square is filled, but some numbers clash (shown in red). Keep going!</p>}
    </div>
  );
}

// ---------- Tower of Hanoi ----------
const DISC_COLOURS = ["#ff5e8a", "#ff8a1f", "#ffd43b", "#2fbf71", "#3b82f6", "#8b5cf6"];
function HanoiBoard({ level, onSolved }: { level: number; onSolved: Solved }) {
  const discs = LEVELS.HANOI[level].discs;
  const [pegs, setPegs] = useState(() => hanoiStart(discs));
  const [moves, setMoves] = useState<Move[]>([]);
  const [held, setHeld] = useState<number | null>(null);
  const [msg, setMsg] = useState("");
  const tap = (i: number) => {
    setMsg("");
    if (held === null) {
      if (pegs[i].length) setHeld(i);
      return;
    }
    if (held === i) return setHeld(null);
    const next = hanoiMove(pegs, [held, i]);
    if (!next) {
      setMsg("A bigger disc cannot go on a smaller one.");
      return setHeld(null);
    }
    const all = [...moves, [held, i] as Move];
    setPegs(next);
    setMoves(all);
    setHeld(null);
    if (next[2].length === discs) onSolved(all, all.length);
  };
  const undo = () => {
    const all = moves.slice(0, -1);
    let p = hanoiStart(discs);
    for (const m of all) p = hanoiMove(p, m)!;
    setPegs(p);
    setMoves(all);
    setHeld(null);
  };
  return (
    <div>
      <p className="mb-3 text-center text-sm font-bold">Moves: {moves.length} · fewest possible: {hanoiPar(level)}</p>
      <div className="grid grid-cols-3 gap-2">
        {pegs.map((peg, i) => (
          <button key={i} type="button" onClick={() => tap(i)} aria-label={`Peg ${i + 1}${i === 2 ? " (goal)" : ""}: ${peg.length ? `discs ${[...peg].reverse().join(", ")} from the top` : "empty"}${held === i ? ", disc picked up" : ""}`}
            className={`relative flex h-56 flex-col-reverse items-center rounded-2xl border-2 pb-2 ${held === i ? "border-brand bg-brand-soft" : i === 2 ? "border-good/50 bg-good-soft" : "border-line bg-surface-2"}`}>
            <span className="absolute bottom-2 top-6 left-1/2 w-2 -translate-x-1/2 rounded-full bg-ink/30" aria-hidden />
            {peg.map((d, k) => (
              <span key={d} className={`relative z-10 mb-0.5 h-6 rounded-lg transition ${held === i && k === peg.length - 1 ? "-translate-y-3" : ""}`} style={{ width: `${25 + (d / discs) * 70}%`, background: DISC_COLOURS[(d - 1) % DISC_COLOURS.length] }} aria-hidden />
            ))}
          </button>
        ))}
      </div>
      <p className="mt-2 min-h-6 text-center text-sm font-bold text-bad" role="status">{msg || (held !== null ? "Now tap where to put it." : "")}</p>
      <div className="flex justify-center gap-2"><button type="button" className="kbtn kbtn-ghost px-4 py-2 text-sm" onClick={undo} disabled={!moves.length}>↶ Undo</button></div>
    </div>
  );
}

// ---------- Lights Out ----------
function LightsBoard({ seed, level, onSolved }: { seed: string; level: number; onSolved: Solved }) {
  const p = useMemo(() => makeLights(seed, level), [seed, level]);
  const [board, setBoard] = useState(p.board);
  const [taps, setTaps] = useState<number[]>([]);
  const tap = (i: number) => {
    const next = lightsToggle(board, p.n, i);
    const all = [...taps, i];
    setBoard(next);
    setTaps(all);
    if (next.every((b) => !b)) onSolved(all, all.length);
  };
  return (
    <div className="mx-auto max-w-sm">
      <p className="mb-3 text-center text-sm font-bold">Taps: {taps.length} · can be done in {p.par} or fewer · lights on: {board.filter(Boolean).length}</p>
      <div className="grid gap-2 rounded-2xl bg-ink/90 p-3" style={{ gridTemplateColumns: `repeat(${p.n}, minmax(0, 1fr))` }}>
        {board.map((on, i) => (
          <button key={i} type="button" onClick={() => tap(i)} aria-pressed={on} aria-label={`Light ${Math.floor(i / p.n) + 1}-${(i % p.n) + 1} ${on ? "on" : "off"}`}
            className={`aspect-square rounded-xl transition ${on ? "bg-[#ffd43b] shadow-[0_0_18px_#ffd43b]" : "bg-[#334155]"}`} />
        ))}
      </div>
      <div className="mt-3 flex justify-center"><button type="button" className="kbtn kbtn-ghost px-4 py-2 text-sm" onClick={() => { setBoard(p.board); setTaps([]); }} disabled={!taps.length}>↺ Start again</button></div>
    </div>
  );
}

// ---------- Sliding tiles ----------
function SlideBoard({ seed, level, onSolved }: { seed: string; level: number; onSolved: Solved }) {
  const p = useMemo(() => makeSlide(seed, level), [seed, level]);
  const [tiles, setTiles] = useState(p.tiles);
  const [moves, setMoves] = useState<number[]>([]);
  const tap = (i: number) => {
    const next = slideTile(tiles, p.n, i);
    if (!next) return;
    const all = [...moves, i];
    setTiles(next);
    setMoves(all);
    if (next.every((v, k) => v === (k === next.length - 1 ? 0 : k + 1))) onSolved(all, all.length);
  };
  return (
    <div className="mx-auto max-w-sm">
      <p className="mb-3 text-center text-sm font-bold">Moves: {moves.length} · aim for {p.par} or fewer</p>
      <div className="grid gap-2 rounded-2xl bg-surface-2 p-3" style={{ gridTemplateColumns: `repeat(${p.n}, minmax(0, 1fr))` }}>
        {tiles.map((v, i) => v ? (
          <button key={i} type="button" onClick={() => tap(i)} aria-label={`Tile ${v}`}
            className={`flex aspect-square items-center justify-center rounded-xl text-2xl font-extrabold text-white shadow-[0_4px_0_rgba(0,0,0,.2)] ${v === i + 1 ? "bg-good" : "bg-brand"}`}>{v}</button>
        ) : <span key={i} className="aspect-square rounded-xl border-2 border-dashed border-line" aria-label="Gap" />)}
      </div>
      <div className="mt-3 flex justify-center"><button type="button" className="kbtn kbtn-ghost px-4 py-2 text-sm" onClick={() => { setTiles(p.tiles); setMoves([]); }} disabled={!moves.length}>↺ Start again</button></div>
    </div>
  );
}

// ---------- Code breaker ----------
function CodeBoard({ seed, level, onSolved, onLost }: { seed: string; level: number; onSolved: Solved; onLost: (code: string) => void }) {
  const p = useMemo(() => makeCode(seed, level), [seed, level]);
  const [guess, setGuess] = useState<number[]>([]);
  const [history, setHistory] = useState<{ g: number[]; exact: number; near: number }[]>([]);
  const add = (d: number) => { if (guess.length < p.len && !guess.includes(d)) setGuess([...guess, d]); };
  const submit = () => {
    if (!validGuess(p, guess)) return;
    const clue = codeClue(p.secret, guess);
    const all = [...history, { g: guess, ...clue }];
    setHistory(all);
    setGuess([]);
    if (clue.exact === p.len) onSolved(all.map((h) => h.g), all.length);
    else if (all.length >= p.tries) onLost(p.secret.join(""));
  };
  return (
    <div className="mx-auto max-w-md">
      <p className="mb-3 text-center text-sm font-bold">A {p.len}-digit code using {p.pool[0]}–{p.pool[p.pool.length - 1]}, no digit twice · tries left: {p.tries - history.length}</p>
      <ol className="space-y-2">
        {history.map((h, k) => (
          <li key={k} className="flex items-center justify-between rounded-xl bg-surface-2 px-3 py-2">
            <span className="font-mono text-2xl font-extrabold tracking-[0.4em]">{h.g.join("")}</span>
            <span className="text-lg" aria-label={`${h.exact} right place, ${h.near} wrong place`}>{"🟢".repeat(h.exact)}{"🟡".repeat(h.near)}{h.exact + h.near === 0 ? "✖️" : ""}</span>
          </li>
        ))}
      </ol>
      <div className="my-4 flex justify-center gap-2" aria-live="polite">
        {Array.from({ length: p.len }, (_, k) => <span key={k} className="flex h-14 w-12 items-center justify-center rounded-xl border-2 border-brand bg-surface font-mono text-3xl font-extrabold">{guess[k] ?? ""}</span>)}
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {p.pool.map((d) => <button key={d} type="button" onClick={() => add(d)} disabled={guess.includes(d)} className="h-12 w-12 rounded-xl bg-brand text-xl font-extrabold text-white shadow-[0_3px_0_var(--brand-ink)] disabled:opacity-30">{d}</button>)}
      </div>
      <div className="mt-3 flex justify-center gap-2">
        <button type="button" className="kbtn kbtn-ghost px-4 py-2 text-sm" onClick={() => setGuess(guess.slice(0, -1))} disabled={!guess.length}>⌫ Back</button>
        <button type="button" className="kbtn px-6 py-2" onClick={submit} disabled={guess.length !== p.len}>Guess</button>
      </div>
    </div>
  );
}
