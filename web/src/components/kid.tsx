// Child-friendly building blocks: mascot, avatar, confetti.
"use client";
import { useEffect, useState } from "react";
import { avatarParts, type Avatar } from "@/lib/avatar";

/** "Bitto" — the friendly robot guide. */
export function Mascot({ size = 72, mood = "happy" }: { size?: number; mood?: "happy" | "think" | "cheer" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" role="img" aria-label="Bitto the robot" className="float shrink-0">
      <line x1="60" y1="8" x2="60" y2="22" stroke="#6c4dff" strokeWidth="4" strokeLinecap="round" />
      <circle cx="60" cy="8" r="6" fill="#ff8a1f" />
      <rect x="18" y="22" width="84" height="66" rx="24" fill="#8f75ff" />
      <rect x="28" y="32" width="64" height="44" rx="16" fill="#f4f1ff" />
      {mood === "think" ? (
        <>
          <circle cx="47" cy="52" r="6" fill="#23194d" /><circle cx="73" cy="50" r="6" fill="#23194d" />
          <path d="M48 66 Q60 62 72 66" stroke="#23194d" strokeWidth="4" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d={mood === "cheer" ? "M40 52 Q47 44 54 52" : "M41 53 a6 6 0 0 1 12 0"} stroke="#23194d" strokeWidth="5" fill={mood === "cheer" ? "none" : "#23194d"} strokeLinecap="round" />
          <path d={mood === "cheer" ? "M66 52 Q73 44 80 52" : "M67 53 a6 6 0 0 1 12 0"} stroke="#23194d" strokeWidth="5" fill={mood === "cheer" ? "none" : "#23194d"} strokeLinecap="round" />
          <path d="M46 63 Q60 75 74 63" stroke="#23194d" strokeWidth="4" fill="#ff7aa8" strokeLinecap="round" />
        </>
      )}
      <circle cx="34" cy="64" r="4" fill="#ffb3cf" /><circle cx="86" cy="64" r="4" fill="#ffb3cf" />
      <rect x="40" y="88" width="40" height="18" rx="8" fill="#6c4dff" />
      <rect x="8" y="46" width="12" height="22" rx="6" fill="#ff8a1f" /><rect x="100" y="46" width="12" height="22" rx="6" fill="#ff8a1f" />
    </svg>
  );
}

export function SpeechBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative rounded-2xl border-2 border-line bg-surface px-4 py-3 text-sm font-semibold text-ink shadow-sm">
      {children}
      <span className="absolute -left-2 top-5 h-4 w-4 rotate-45 border-b-2 border-l-2 border-line bg-surface" aria-hidden />
    </div>
  );
}

export function AvatarBadge({ avatar, size = 56, ring = true }: { avatar: Avatar; size?: number; ring?: boolean }) {
  const p = avatarParts(avatar);
  return (
    <span className={`relative inline-flex shrink-0 items-center justify-center rounded-full ${ring ? "ring-4 ring-white/70" : ""}`} style={{ width: size, height: size, background: p.bg }} aria-hidden>
      <span style={{ fontSize: size * 0.55, lineHeight: 1 }}>{p.emoji}</span>
      {p.accessory && <span className="absolute -right-1 -top-1" style={{ fontSize: size * 0.32 }}>{p.accessory}</span>}
    </span>
  );
}

const COLORS = ["#ff8a1f", "#6c4dff", "#ff4d8d", "#20c997", "#ffd43b", "#4dabf7"];
export function Confetti({ fire, pieces = 60 }: { fire: unknown; pieces?: number }) {
  const [bits, setBits] = useState<{ id: number; left: number; dx: number; delay: number; color: string }[]>([]);
  useEffect(() => {
    if (!fire) return;
    const seed = Date.now();
    setBits(Array.from({ length: pieces }, (_, i) => ({ id: seed + i, left: Math.random() * 100, dx: (Math.random() - 0.5) * 300, delay: Math.random() * 0.4, color: COLORS[i % COLORS.length] })));
    const t = setTimeout(() => setBits([]), 2400);
    return () => clearTimeout(t);
  }, [fire, pieces]);
  return (
    <>
      {bits.map((b) => (
        <span key={b.id} className="confetti-piece" style={{ left: `${b.left}vw`, background: b.color, animationDelay: `${b.delay}s`, ["--dx" as string]: `${b.dx}px` }} aria-hidden />
      ))}
    </>
  );
}
