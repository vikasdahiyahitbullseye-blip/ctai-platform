"use client";
import { useState, useTransition } from "react";
import { saveAvatar } from "@/app/actions/gamify";
import { AvatarBadge, Confetti } from "@/components/kid";
import type { Avatar } from "@/lib/avatar";

type Opt = { id: string; emoji?: string; name?: string; css?: string; level?: number };

export function AvatarBuilder({ initial, level, animals, backgrounds, accessories }: { initial: Avatar; level: number; animals: Opt[]; backgrounds: Opt[]; accessories: Opt[] }) {
  const [a, setA] = useState(initial);
  const [saved, setSaved] = useState(0);
  const [pending, start] = useTransition();
  const opt = (on: boolean) => `flex items-center justify-center rounded-2xl border-4 transition ${on ? "border-brand scale-105" : "border-transparent hover:border-line"}`;
  return (
    <section className="rounded-[2rem] border-2 border-line bg-surface p-6 shadow-sm">
      <Confetti fire={saved} />
      <div className="flex flex-wrap items-center gap-6">
        <AvatarBadge avatar={a} size={128} />
        <div className="flex-1 space-y-4">
          <div>
            <div className="mb-2 font-extrabold">Choose your buddy</div>
            <div className="flex flex-wrap gap-2">{animals.map((x) => <button key={x.id} type="button" aria-label={x.name} aria-pressed={a.animal === x.id} onClick={() => setA({ ...a, animal: x.id })} className={`${opt(a.animal === x.id)} h-14 w-14 bg-surface-2 text-3xl`}>{x.emoji}</button>)}</div>
          </div>
          <div>
            <div className="mb-2 font-extrabold">Background</div>
            <div className="flex flex-wrap gap-2">{backgrounds.map((x) => <button key={x.id} type="button" aria-label={`Background ${x.id}`} aria-pressed={a.bg === x.id} onClick={() => setA({ ...a, bg: x.id })} className={`${opt(a.bg === x.id)} h-12 w-12`} style={{ background: x.css }} />)}</div>
          </div>
          <div>
            <div className="mb-2 font-extrabold">Accessories <span className="text-sm font-semibold text-muted">— unlock more by levelling up!</span></div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setA({ ...a, accessory: null })} aria-pressed={!a.accessory} className={`${opt(!a.accessory)} h-14 w-14 bg-surface-2 text-sm font-bold`}>None</button>
              {accessories.map((x) => {
                const locked = (x.level ?? 0) > level;
                return (
                  <button key={x.id} type="button" disabled={locked} aria-label={locked ? `${x.name}, unlocks at level ${x.level}` : x.name} aria-pressed={a.accessory === x.id} onClick={() => setA({ ...a, accessory: x.id })} className={`${opt(a.accessory === x.id)} relative h-14 w-14 bg-surface-2 text-2xl disabled:cursor-not-allowed`}>
                    <span className={locked ? "opacity-25 grayscale" : ""}>{x.emoji}</span>
                    {locked && <span className="absolute bottom-0.5 rounded-full bg-ink px-1.5 text-[10px] font-bold text-surface">Lv {x.level}</span>}
                  </button>
                );
              })}
            </div>
          </div>
          <button className="kbtn" disabled={pending} onClick={() => start(async () => { const fd = new FormData(); fd.set("animal", a.animal); fd.set("bg", a.bg); fd.set("accessory", a.accessory ?? ""); await saveAvatar(fd); setSaved((n) => n + 1); })}>{pending ? "Saving…" : "Save my look"}</button>
        </div>
      </div>
    </section>
  );
}
