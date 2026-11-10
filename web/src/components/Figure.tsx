// Renders picture-question specs as crisp, colourful SVG on a white panel (same look in light/dark mode and in print).
import React from "react";
import { PALETTE, type Fig, type Colour } from "@/lib/figures";

const INK = "#1f2937";
const GRID = "#cbd5e1";

function shade(hex: string, f: number) {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v: number) => Math.max(0, Math.min(255, Math.round(v * f)));
  return `rgb(${ch(n >> 16)}, ${ch((n >> 8) & 255)}, ${ch(n & 255)})`;
}

export function Figure({ fig, size = "md" }: { fig: Fig; size?: "sm" | "md" }) {
  const maxW = size === "sm" ? 150 : undefined;
  if (fig.kind === "sequence") {
    return (
      <div className="inline-flex flex-wrap items-center gap-2 rounded-2xl border-2 border-slate-200 bg-white p-3" role="img" aria-label={fig.alt}>
        {fig.frames.map((f, i) => (
          <div key={i} className="flex h-[96px] w-[96px] items-center justify-center rounded-xl border-2 border-slate-200 bg-white">
            {f ? <Svg fig={f} maxW={88} bare /> : <span className="text-4xl font-black text-slate-400">?</span>}
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className={`inline-block rounded-2xl border-2 border-slate-200 bg-white ${size === "sm" ? "p-1.5" : "p-3"}`}>
      <Svg fig={fig} maxW={maxW} />
    </div>
  );
}

function Svg({ fig, maxW, bare }: { fig: Fig; maxW?: number; bare?: boolean }) {
  const { w, h, body } = draw(fig);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={maxW ?? w} style={{ maxWidth: "100%", height: "auto", display: "block" }} role={bare ? undefined : "img"} aria-label={bare ? undefined : fig.alt}>
      {body}
    </svg>
  );
}

function shapePath(shape: string, cx: number, cy: number, s: number, colour: string) {
  const stroke = shade(colour, 0.7);
  switch (shape) {
    case "triangle":
      return <polygon points={`${cx},${cy - s} ${cx + s * 0.95},${cy + s * 0.75} ${cx - s * 0.95},${cy + s * 0.75}`} fill={colour} stroke={stroke} strokeWidth={2.5} strokeLinejoin="round" />;
    case "square":
      return <rect x={cx - s * 0.8} y={cy - s * 0.8} width={s * 1.6} height={s * 1.6} rx={3} fill={colour} stroke={stroke} strokeWidth={2.5} />;
    case "circle":
      return <circle cx={cx} cy={cy} r={s * 0.85} fill={colour} stroke={stroke} strokeWidth={2.5} />;
    case "star": {
      const pts = Array.from({ length: 10 }, (_, i) => {
        const a = (Math.PI / 5) * i - Math.PI / 2, r = i % 2 ? s * 0.45 : s;
        return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
      }).join(" ");
      return <polygon points={pts} fill={colour} stroke={stroke} strokeWidth={2} strokeLinejoin="round" />;
    }
    default: // heart
      return <path d={`M ${cx} ${cy + s * 0.8} C ${cx - s * 1.4} ${cy - s * 0.2}, ${cx - s * 0.6} ${cy - s * 1.2}, ${cx} ${cy - s * 0.35} C ${cx + s * 0.6} ${cy - s * 1.2}, ${cx + s * 1.4} ${cy - s * 0.2}, ${cx} ${cy + s * 0.8} Z`} fill={colour} stroke={stroke} strokeWidth={2} />;
  }
}

function draw(fig: Fig): { w: number; h: number; body: React.ReactNode } {
  switch (fig.kind) {
    case "pixels": {
      const cs = 30, pad = 8, n = fig.n;
      const gw = n * cs;
      const extraR = fig.mirror === "right" ? 34 : 0, extraB = fig.mirror === "bottom" ? 34 : 0;
      const w = gw + pad * 2 + extraR, h = gw + pad * 2 + extraB;
      return {
        w, h,
        body: (
          <g>
            <rect x={pad} y={pad} width={gw} height={gw} fill="#f8fafc" />
            {fig.cells.map(([r, c, k], i) => <rect key={i} x={pad + c * cs + 1.5} y={pad + r * cs + 1.5} width={cs - 3} height={cs - 3} rx={4} fill={PALETTE[k]} stroke={shade(PALETTE[k], 0.72)} strokeWidth={2} />)}
            {Array.from({ length: n + 1 }, (_, i) => (
              <g key={i}>
                <line x1={pad} y1={pad + i * cs} x2={pad + gw} y2={pad + i * cs} stroke={GRID} strokeWidth={1.2} />
                <line x1={pad + i * cs} y1={pad} x2={pad + i * cs} y2={pad + gw} stroke={GRID} strokeWidth={1.2} />
              </g>
            ))}
            {fig.mirror === "right" && (
              <g>
                <rect x={pad + gw + 10} y={pad - 2} width={12} height={gw + 4} rx={3} fill="#bae6fd" stroke="#0284c7" strokeWidth={2} />
                <text x={pad + gw + 30} y={pad + gw / 2} fontSize={12} fontWeight={700} fill="#0369a1" transform={`rotate(90 ${pad + gw + 30} ${pad + gw / 2})`} textAnchor="middle">MIRROR</text>
              </g>
            )}
            {fig.mirror === "bottom" && (
              <g>
                <path d={`M ${pad} ${pad + gw + 14} ${Array.from({ length: n * 2 }, (_, i) => `q ${cs / 4} ${i % 2 ? 6 : -6} ${cs / 2} 0`).join(" ")}`} fill="none" stroke="#0284c7" strokeWidth={3} />
                <text x={pad + gw / 2} y={pad + gw + 32} fontSize={12} fontWeight={700} fill="#0369a1" textAnchor="middle">WATER</text>
              </g>
            )}
            {fig.mirror === "middle" && <line x1={pad + gw / 2} y1={pad - 4} x2={pad + gw / 2} y2={pad + gw + 4} stroke="#7c3aed" strokeWidth={3.5} strokeDasharray="8 5" />}
          </g>
        ),
      };
    }
    case "gridmap": {
      const cs = 48, padL = 26, padT = 26;
      const w = padL + fig.cols * cs + 10 + (fig.compass ? 44 : 0), h = padT + fig.rows * cs + 10;
      const centre = (r: number, c: number) => [padL + c * cs + cs / 2, padT + r * cs + cs / 2];
      return {
        w, h,
        body: (
          <g>
            {Array.from({ length: fig.rows }, (_, r) => Array.from({ length: fig.cols }, (_, c) => (
              <rect key={`${r}-${c}`} x={padL + c * cs} y={padT + r * cs} width={cs} height={cs} fill={(r + c) % 2 ? "#ecfccb" : "#dcfce7"} stroke="#86efac" strokeWidth={1.5} />
            )))}
            {Array.from({ length: fig.cols }, (_, c) => <text key={c} x={padL + c * cs + cs / 2} y={17} fontSize={14} fontWeight={800} fill={INK} textAnchor="middle">{String.fromCharCode(65 + c)}</text>)}
            {Array.from({ length: fig.rows }, (_, r) => <text key={r} x={12} y={padT + r * cs + cs / 2 + 5} fontSize={14} fontWeight={800} fill={INK} textAnchor="middle">{r + 1}</text>)}
            {fig.path && fig.path.length > 1 && (
              <polyline points={fig.path.map(([r, c]) => centre(r, c).join(",")).join(" ")} fill="none" stroke="#f97316" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 9" />
            )}
            {fig.items.map((it, i) => {
              const [x, y] = centre(it.r, it.c);
              return <text key={i} x={x} y={y + 10} fontSize={28} textAnchor="middle">{it.icon}</text>;
            })}
            {fig.compass && (
              <g transform={`translate(${padL + fig.cols * cs + 30}, ${padT + 30})`}>
                <circle r={18} fill="#fff" stroke={INK} strokeWidth={2} />
                <polygon points="0,-15 6,2 -6,2" fill="#ef4444" />
                <polygon points="0,15 6,-2 -6,-2" fill="#94a3b8" />
                <text y={-22} fontSize={12} fontWeight={800} textAnchor="middle" fill={INK}>N</text>
              </g>
            )}
          </g>
        ),
      };
    }
    case "shapes": {
      const cs = 52;
      const w = fig.cols * cs + 12, h = fig.rows * cs + 12;
      return {
        w, h,
        body: (
          <g>
            <rect x={2} y={2} width={w - 4} height={h - 4} rx={12} fill="#fffbeb" />
            {fig.items.map((it, i) => <g key={i}>{shapePath(it.shape, 6 + it.c * cs + cs / 2, 6 + it.r * cs + cs / 2, (it.size ?? 1) * 18, PALETTE[it.colour])}</g>)}
          </g>
        ),
      };
    }
    case "arrow": {
      const col = PALETTE[fig.colour];
      return { w: 90, h: 90, body: <g transform={`rotate(${fig.dir * 90} 45 45)`}><polygon points="45,8 76,42 56,42 56,82 34,82 34,42 14,42" fill={col} stroke={shade(col, 0.7)} strokeWidth={3} strokeLinejoin="round" /></g> };
    }
    case "dots": {
      const col = PALETTE[fig.colour];
      const per = fig.count <= 4 ? 2 : 3;
      const rows = Math.ceil(fig.count / per);
      return {
        w: 90, h: 90,
        body: <g>{Array.from({ length: fig.count }, (_, i) => shapePath(fig.shape, 18 + (i % per) * (54 / Math.max(1, per - 1)) + (per === 2 ? 9 : 0), 18 + Math.floor(i / per) * (54 / Math.max(1, rows - 1 || 1)) + (rows === 1 ? 27 : 0), 10, col))}</g>,
      };
    }
    case "bars": {
      const n = fig.values.length, max = Math.ceil(Math.max(...fig.values) / fig.step) * fig.step;
      const left = 44, top = 34, ch = 190, bw = 46, gap = 26;
      const w = left + n * (bw + gap) + 10, h = top + ch + 46;
      const y = (v: number) => top + ch - (v / max) * ch;
      const colours = Object.values(PALETTE);
      return {
        w, h,
        body: (
          <g>
            <text x={w / 2} y={20} fontSize={15} fontWeight={800} textAnchor="middle" fill={INK}>{fig.title}</text>
            {Array.from({ length: max / fig.step + 1 }, (_, i) => (
              <g key={i}>
                <line x1={left} x2={w - 6} y1={y(i * fig.step)} y2={y(i * fig.step)} stroke="#e2e8f0" strokeWidth={1.2} />
                <text x={left - 8} y={y(i * fig.step) + 4} fontSize={12} textAnchor="end" fill="#475569" fontWeight={700}>{i * fig.step}</text>
              </g>
            ))}
            <line x1={left} x2={left} y1={top - 6} y2={top + ch} stroke={INK} strokeWidth={2} />
            <line x1={left} x2={w - 6} y1={top + ch} y2={top + ch} stroke={INK} strokeWidth={2} />
            {fig.values.map((v, i) => {
              const x = left + gap / 2 + i * (bw + gap), col = colours[i % colours.length];
              return (
                <g key={i}>
                  <rect x={x} y={y(v)} width={bw} height={top + ch - y(v)} rx={5} fill={col} stroke={shade(col, 0.7)} strokeWidth={2} />
                  {fig.showValues && <text x={x + bw / 2} y={y(v) - 6} fontSize={13} fontWeight={800} textAnchor="middle" fill={INK}>{v}</text>}
                  <text x={x + bw / 2} y={top + ch + 18} fontSize={12} fontWeight={700} textAnchor="middle" fill={INK}>{fig.labels[i]}</text>
                </g>
              );
            })}
          </g>
        ),
      };
    }
    case "pictograph": {
      const rowH = 40, labW = 90, iconW = 30, top = 34;
      const maxIcons = Math.max(...fig.counts);
      const w = labW + maxIcons * iconW + 20, h = top + fig.labels.length * rowH + 34;
      return {
        w: Math.max(w, 260), h,
        body: (
          <g>
            <text x={Math.max(w, 260) / 2} y={20} fontSize={15} fontWeight={800} textAnchor="middle" fill={INK}>{fig.title}</text>
            {fig.labels.map((l, i) => (
              <g key={i}>
                <rect x={4} y={top + i * rowH} width={Math.max(w, 260) - 8} height={rowH - 4} rx={8} fill={i % 2 ? "#f1f5f9" : "#fef3c7"} />
                <text x={12} y={top + i * rowH + 24} fontSize={13} fontWeight={800} fill={INK}>{l}</text>
                {Array.from({ length: fig.counts[i] }, (_, k) => <text key={k} x={labW + k * iconW + 14} y={top + i * rowH + 27} fontSize={22} textAnchor="middle">{fig.icon}</text>)}
              </g>
            ))}
            <text x={12} y={h - 10} fontSize={13} fontWeight={800} fill="#7c3aed">Key: {fig.icon} = {fig.per}</text>
          </g>
        ),
      };
    }
    case "clock": {
      const R = 92, C = 104;
      const ha = ((fig.h % 12) + fig.m / 60) * 30, ma = fig.m * 6;
      const hand = (a: number, len: number) => [C + len * Math.sin((a * Math.PI) / 180), C - len * Math.cos((a * Math.PI) / 180)];
      const [hx, hy] = hand(ha, 50), [mx, my] = hand(ma, 74);
      const face = (
        <g>
          <circle cx={C} cy={C} r={R} fill="#fff7ed" stroke="#f97316" strokeWidth={7} />
          {Array.from({ length: 60 }, (_, i) => { const [x1, y1] = hand(i * 6, R - 6), [x2, y2] = hand(i * 6, i % 5 ? R - 12 : R - 18); return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={INK} strokeWidth={i % 5 ? 1.5 : 3.5} />; })}
          {Array.from({ length: 12 }, (_, i) => { const [x, y] = hand((i + 1) * 30, R - 32); return <text key={i} x={x} y={y + 6} fontSize={17} fontWeight={800} textAnchor="middle" fill={INK}>{i + 1}</text>; })}
          <line x1={C} y1={C} x2={hx} y2={hy} stroke="#2563eb" strokeWidth={9} strokeLinecap="round" />
          <line x1={C} y1={C} x2={mx} y2={my} stroke="#dc2626" strokeWidth={5} strokeLinecap="round" />
          <circle cx={C} cy={C} r={8} fill={INK} />
        </g>
      );
      return {
        w: 208, h: fig.mirror ? 228 : 208,
        body: (
          <g>
            {fig.mirror ? <g transform={`translate(${2 * C},0) scale(-1,1)`}>{face}</g> : face}
            {fig.mirror && <text x={C} y={222} fontSize={12} fontWeight={800} fill="#0369a1" textAnchor="middle">SEEN IN A MIRROR</text>}
          </g>
        ),
      };
    }
    case "cubes": {
      const s = 34, dx = 14, dy = 12;
      const cols = fig.heights.length, maxH = Math.max(...fig.heights);
      const w = cols * s + dx + 16, h = maxH * s + dy + 16;
      const base = PALETTE[fig.colour];
      const cubes: React.ReactNode[] = [];
      fig.heights.forEach((hgt, i) => {
        for (let k = 0; k < hgt; k++) {
          const x = 8 + i * s, y = h - 8 - (k + 1) * s;
          cubes.push(
            <g key={`${i}-${k}`}>
              <polygon points={`${x + s},${y} ${x + s + dx},${y - dy} ${x + s + dx},${y - dy + s} ${x + s},${y + s}`} fill={shade(base, 0.68)} stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
              <polygon points={`${x},${y} ${x + dx},${y - dy} ${x + s + dx},${y - dy} ${x + s},${y}`} fill={shade(base, 1.18)} stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
              <rect x={x} y={y} width={s} height={s} fill={base} stroke={INK} strokeWidth={1.5} />
            </g>,
          );
        }
      });
      return { w, h, body: <g>{cubes}</g> };
    }
  }
  return { w: 10, h: 10, body: null };
}

export const colourName = (c: Colour) => c;
