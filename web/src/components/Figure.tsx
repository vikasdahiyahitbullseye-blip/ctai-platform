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
    const wide = fig.frames.some((f) => f?.kind === "matchsticks");
    return (
      <div className="inline-flex flex-wrap items-center gap-2 rounded-2xl border-2 border-slate-200 bg-white p-3" role="img" aria-label={fig.alt}>
        {fig.frames.map((f, i) => (
          <div key={i} className={`flex items-center justify-center rounded-xl border-2 border-slate-200 bg-white ${wide ? "h-[96px] w-[160px]" : "h-[96px] w-[96px]"}`}>
            {f ? <Svg fig={f} maxW={wide ? 150 : 88} bare /> : <span className="text-4xl font-black text-slate-400">?</span>}
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

export function draw(fig: Fig): { w: number; h: number; body: React.ReactNode } {
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
        body: <g>{Array.from({ length: fig.count }, (_, i) => <g key={i}>{shapePath(fig.shape, 18 + (i % per) * (54 / Math.max(1, per - 1)) + (per === 2 ? 9 : 0), 18 + Math.floor(i / per) * (54 / Math.max(1, rows - 1 || 1)) + (rows === 1 ? 27 : 0), 10, col)}</g>)}</g>,
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
            <g><text x={12} y={h - 10} fontSize={13} fontWeight={800} fill="#7c3aed">Key:</text><text x={58} y={h - 9} fontSize={16} textAnchor="middle">{fig.icon}</text><text x={70} y={h - 10} fontSize={13} fontWeight={800} fill="#7c3aed">= {fig.per}</text></g>
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
  if (fig.kind === "sequence") return { w: 10, h: 10, body: null };
  return drawMore(fig);
}

export const colourName = (c: Colour) => c;

// ---------- More picture kinds (numbers, measuring, money, sorting, geometry, data) ----------
type More = Exclude<Fig, { kind: "pixels" | "gridmap" | "shapes" | "sequence" | "arrow" | "dots" | "bars" | "pictograph" | "clock" | "cubes" }>;

const fmtNum = (v: number, d = 0) => (d ? v.toFixed(d) : String(Math.round(v))).replace("-", "−");
const NOTE: Record<number, [string, string]> = { 10: ["#fdba74", "#9a3412"], 20: ["#bef264", "#3f6212"], 50: ["#5eead4", "#115e59"], 100: ["#c4b5fd", "#4c1d95"], 200: ["#fcd34d", "#92400e"], 500: ["#d6d3d1", "#44403c"] };

function drawMore(fig: More): { w: number; h: number; body: React.ReactNode } {
  switch (fig.kind) {
    case "fraction": {
      const col = PALETTE[fig.colour], edge = shade(col, 0.65);
      if (fig.shape === "circle") {
        const R = 70, C = 80;
        const pt = (i: number) => { const a = (2 * Math.PI * i) / fig.parts - Math.PI / 2; return `${C + R * Math.cos(a)},${C + R * Math.sin(a)}`; };
        return {
          w: 160, h: 160,
          body: (
            <g>
              {fig.parts === 1 ? <circle cx={C} cy={C} r={R} fill={fig.shaded ? col : "#fff"} /> : Array.from({ length: fig.parts }, (_, i) => (
                <path key={i} d={`M ${C} ${C} L ${pt(i)} A ${R} ${R} 0 0 1 ${pt(i + 1)} Z`} fill={i < fig.shaded ? col : "#fff"} stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
              ))}
              <circle cx={C} cy={C} r={R} fill="none" stroke={INK} strokeWidth={3} />
            </g>
          ),
        };
      }
      const rows = fig.shape === "grid" ? fig.rows ?? 2 : 1, cols = fig.parts / rows;
      const cw = fig.shape === "grid" ? 36 : Math.min(60, 300 / cols), ch = fig.shape === "grid" ? 36 : 64;
      return {
        w: cols * cw + 12, h: rows * ch + 12,
        body: (
          <g>
            {Array.from({ length: fig.parts }, (_, i) => (
              <rect key={i} x={6 + (i % cols) * cw} y={6 + Math.floor(i / cols) * ch} width={cw} height={ch} fill={i < fig.shaded ? col : "#fff"} stroke={INK} strokeWidth={2} />
            ))}
            <rect x={6} y={6} width={cols * cw} height={rows * ch} fill="none" stroke={edge} strokeWidth={0} />
            <rect x={6} y={6} width={cols * cw} height={rows * ch} fill="none" stroke={INK} strokeWidth={3} />
          </g>
        ),
      };
    }
    case "abacus": {
      const cw = 62, top = 18, rod = 170, n = fig.labels.length;
      const w = n * cw + 24, h = top + rod + 46;
      const colours = ["#ef4444", "#3b82f6", "#22c55e", "#f97316", "#a855f7", "#ec4899", "#14b8a6"];
      return {
        w, h,
        body: (
          <g>
            <rect x={6} y={top + rod - 4} width={w - 12} height={18} rx={6} fill="#a16207" stroke="#713f12" strokeWidth={2} />
            {fig.labels.map((l, i) => {
              const x = 12 + i * cw + cw / 2, col = colours[(n - 1 - i) % colours.length];
              return (
                <g key={i}>
                  <rect x={x - 3} y={top} width={6} height={rod} rx={3} fill="#78716c" />
                  {Array.from({ length: fig.beads[i] }, (_, k) => <ellipse key={k} cx={x} cy={top + rod - 16 - k * 17} rx={22} ry={8} fill={col} stroke={shade(col, 0.65)} strokeWidth={2} />)}
                  <text x={x} y={h - 8} fontSize={15} fontWeight={800} textAnchor="middle" fill={INK}>{l}</text>
                </g>
              );
            })}
          </g>
        ),
      };
    }
    case "numberline": {
      const L = 30, W = 500, top = fig.jumps ? 76 : 50;
      const x = (v: number) => L + ((v - fig.min) / (fig.max - fig.min)) * W;
      const n = Math.round((fig.max - fig.min) / fig.step);
      const ticks = Array.from({ length: n + 1 }, (_, i) => fig.min + i * fig.step);
      const labelled = (i: number) => i % fig.labelEvery === 0;
      const j = fig.jumps;
      return {
        w: L * 2 + W, h: top + 46,
        body: (
          <g>
            <line x1={L - 16} x2={L + W + 16} y1={top} y2={top} stroke={INK} strokeWidth={3} />
            <polygon points={`${L + W + 22},${top} ${L + W + 12},${top - 6} ${L + W + 12},${top + 6}`} fill={INK} />
            <polygon points={`${L - 22},${top} ${L - 12},${top - 6} ${L - 12},${top + 6}`} fill={INK} />
            {ticks.map((v, i) => (
              <g key={i}>
                <line x1={x(v)} x2={x(v)} y1={top - (labelled(i) ? 11 : 7)} y2={top + (labelled(i) ? 11 : 7)} stroke={INK} strokeWidth={labelled(i) ? 3 : 2} />
                {labelled(i) && <text x={x(v)} y={top + 30} fontSize={15} fontWeight={800} textAnchor="middle" fill={INK}>{fmtNum(v, fig.decimals)}</text>}
              </g>
            ))}
            {j && Array.from({ length: j.count }, (_, k) => {
              const a = x(j.from + k * j.size), b = x(j.from + (k + 1) * j.size), col = PALETTE[j.colour];
              return <path key={k} d={`M ${a} ${top - 4} Q ${(a + b) / 2} ${top - 58} ${b} ${top - 4}`} fill="none" stroke={col} strokeWidth={3.5} markerEnd="" />;
            })}
            {j && <text x={x(j.from)} y={top - 14} fontSize={22} textAnchor="middle">{j.icon ?? "🐸"}</text>}
            {fig.marks?.map((m, i) => {
              const col = PALETTE[m.colour];
              return (
                <g key={i}>
                  <polygon points={`${x(m.v)},${top - 6} ${x(m.v) - 9},${top - 24} ${x(m.v) + 9},${top - 24}`} fill={col} stroke={shade(col, 0.65)} strokeWidth={2} />
                  <text x={x(m.v)} y={top - 30} fontSize={16} fontWeight={900} textAnchor="middle" fill={shade(col, 0.7)}>{m.label}</text>
                </g>
              );
            })}
          </g>
        ),
      };
    }
    case "ruler": {
      const u = 34, L = 16, top = 58;
      const w = L * 2 + fig.cm * u, col = PALETTE[fig.colour];
      const x0 = L + fig.start * u, x1 = L + (fig.start + fig.length) * u;
      return {
        w, h: top + 70,
        body: (
          <g>
            <rect x={x0} y={18} width={x1 - x0 - 18} height={26} rx={4} fill={col} stroke={shade(col, 0.65)} strokeWidth={2} />
            <rect x={x0} y={18} width={10} height={26} rx={3} fill="#f9a8d4" stroke={shade(col, 0.65)} strokeWidth={2} />
            <polygon points={`${x1 - 18},18 ${x1},31 ${x1 - 18},44`} fill="#fde68a" stroke={shade(col, 0.65)} strokeWidth={2} strokeLinejoin="round" />
            <polygon points={`${x1 - 6},27.5 ${x1},31 ${x1 - 6},34.5`} fill={INK} />
            <line x1={x0} x2={x0} y1={46} y2={top} stroke="#94a3b8" strokeDasharray="3 3" strokeWidth={1.5} />
            <line x1={x1} x2={x1} y1={34} y2={top} stroke="#94a3b8" strokeDasharray="3 3" strokeWidth={1.5} />
            <rect x={L - 10} y={top} width={fig.cm * u + 20} height={52} rx={6} fill="#fef9c3" stroke="#ca8a04" strokeWidth={2} />
            {Array.from({ length: fig.cm * 2 + 1 }, (_, i) => (
              <g key={i}>
                <line x1={L + (i * u) / 2} x2={L + (i * u) / 2} y1={top} y2={top + (i % 2 ? 9 : 16)} stroke={INK} strokeWidth={i % 2 ? 1.5 : 2.5} />
                {i % 2 === 0 && <text x={L + (i * u) / 2} y={top + 34} fontSize={14} fontWeight={800} textAnchor="middle" fill={INK}>{i / 2}</text>}
              </g>
            ))}
            <text x={L + fig.cm * u - 4} y={top + 47} fontSize={11} fontWeight={700} textAnchor="end" fill="#854d0e">cm</text>
          </g>
        ),
      };
    }
    case "balance": {
      const w = 360, h = 210, beamY = 70;
      const panL = 80, panR = 280;
      const pan = (cx: number) => <path d={`M ${cx - 62} ${beamY + 70} Q ${cx} ${beamY + 100} ${cx + 62} ${beamY + 70} Z`} fill="#e2e8f0" stroke="#64748b" strokeWidth={2.5} />;
      const strings = (cx: number) => <g stroke="#64748b" strokeWidth={2}><line x1={cx} y1={beamY} x2={cx - 58} y2={beamY + 70} /><line x1={cx} y1={beamY} x2={cx + 58} y2={beamY + 70} /></g>;
      const blocks = fig.right;
      return {
        w, h,
        body: (
          <g>
            <polygon points={`${w / 2},${beamY} ${w / 2 - 36},${h - 12} ${w / 2 + 36},${h - 12}`} fill="#a78bfa" stroke="#6d28d9" strokeWidth={2.5} strokeLinejoin="round" />
            <rect x={panL - 6} y={beamY - 6} width={panR - panL + 12} height={12} rx={6} fill="#7c3aed" />
            <circle cx={w / 2} cy={beamY} r={8} fill="#fde047" stroke="#a16207" strokeWidth={2} />
            {strings(panL)}{strings(panR)}
            {pan(panL)}{pan(panR)}
            {Array.from({ length: fig.left.n }, (_, i) => <text key={i} x={panL - ((Math.min(fig.left.n, 4) - 1) * 29) / 2 + (i % 4) * 29} y={beamY + 76 - Math.floor(i / 4) * 26} fontSize={26} textAnchor="middle">{fig.left.icon}</text>)}
            {blocks.map((g, i) => {
              const bw = 52, x = panR - (blocks.length * (bw + 4)) / 2 + i * (bw + 4);
              return (
                <g key={i}>
                  <path d={`M ${x + 6} ${beamY + 36} L ${x + bw - 6} ${beamY + 36} L ${x + bw} ${beamY + 70} L ${x} ${beamY + 70} Z`} fill="#475569" stroke="#1e293b" strokeWidth={2} />
                  <text x={x + bw / 2} y={beamY + 59} fontSize={12} fontWeight={800} fill="#fff" textAnchor="middle">{g} {fig.unit}</text>
                </g>
              );
            })}
            <text x={w / 2} y={beamY - 16} fontSize={12} fontWeight={800} fill="#16a34a" textAnchor="middle">BALANCED</text>
          </g>
        ),
      };
    }
    case "jug": {
      const x0 = 50, top = 20, jw = 120, jh = 220;
      const y = (v: number) => top + jh - (v / fig.max) * (jh - 20);
      const n = fig.max / fig.step;
      return {
        w: 240, h: top + jh + 16,
        body: (
          <g>
            <path d={`M ${x0 + jw} ${top + 30} q 46 0 46 50 q 0 50 -46 50`} fill="none" stroke="#64748b" strokeWidth={8} />
            <rect x={x0} y={y(fig.level)} width={jw} height={top + jh - y(fig.level)} fill="#38bdf8" opacity={0.85} />
            <line x1={x0} x2={x0 + jw} y1={y(fig.level)} y2={y(fig.level)} stroke="#0284c7" strokeWidth={3} />
            <path d={`M ${x0} ${top} L ${x0} ${top + jh} L ${x0 + jw} ${top + jh} L ${x0 + jw} ${top}`} fill="none" stroke="#475569" strokeWidth={4} strokeLinejoin="round" />
            {Array.from({ length: n + 1 }, (_, i) => i).filter((i) => i > 0).map((i) => {
              const v = i * fig.step, lab = i % fig.labelEvery === 0;
              return (
                <g key={i}>
                  <line x1={x0} x2={x0 + (lab ? 26 : 16)} y1={y(v)} y2={y(v)} stroke={INK} strokeWidth={lab ? 3 : 2} />
                  {lab && <text x={x0 + 32} y={y(v) + 5} fontSize={13} fontWeight={800} fill={INK}>{v} {fig.unit}</text>}
                </g>
              );
            })}
          </g>
        ),
      };
    }
    case "money": {
      const items = [...fig.items].sort((a, b) => b - a);
      const parts: React.ReactNode[] = [];
      let x = 8, y = 8, rowH = 0;
      const maxW = 470;
      items.forEach((v, i) => {
        const note = v > 10 || (v === 10 && false);
        const iw = note ? 120 : 64, ih = note ? 60 : 64;
        if (x + iw > maxW) { x = 8; y += rowH + 10; rowH = 0; }
        if (note) {
          const [bg, fg] = NOTE[v] ?? ["#e5e7eb", INK];
          parts.push(
            <g key={i}>
              <rect x={x} y={y} width={iw} height={ih} rx={6} fill={bg} stroke={fg} strokeWidth={2.5} />
              <rect x={x + 6} y={y + 6} width={iw - 12} height={ih - 12} rx={4} fill="none" stroke={fg} strokeWidth={1} strokeDasharray="3 2" />
              <circle cx={x + iw - 26} cy={y + ih / 2} r={14} fill="#fff" opacity={0.6} />
              <text x={x + 40} y={y + ih / 2 + 8} fontSize={22} fontWeight={900} fill={fg} textAnchor="middle">₹{v}</text>
            </g>,
          );
        } else {
          const gold = v === 10 || v === 5;
          parts.push(
            <g key={i}>
              <circle cx={x + 32} cy={y + 32} r={30} fill={gold ? "#fde047" : "#e2e8f0"} stroke={gold ? "#a16207" : "#64748b"} strokeWidth={3} />
              {v === 10 && <circle cx={x + 32} cy={y + 32} r={20} fill="#e2e8f0" stroke="#64748b" strokeWidth={1.5} />}
              <text x={x + 32} y={y + 40} fontSize={20} fontWeight={900} fill={INK} textAnchor="middle">₹{v}</text>
            </g>,
          );
        }
        x += iw + 10; rowH = Math.max(rowH, ih);
      });
      return { w: maxW, h: y + rowH + 10, body: <g>{parts}</g> };
    }
    case "icons": {
      const cs = 58, rows = Math.ceil(fig.items.length / fig.cols);
      const w = Math.min(fig.items.length, fig.cols) * cs + 12, h = rows * cs + 12;
      return {
        w, h,
        body: (
          <g>
            <rect x={2} y={2} width={w - 4} height={h - 4} rx={12} fill="#f0f9ff" />
            {fig.items.map((it, i) => {
              const x = 6 + (i % fig.cols) * cs, y = 6 + Math.floor(i / fig.cols) * cs;
              return (
                <g key={i}>
                  <text x={x + cs / 2} y={y + cs / 2 + 12} fontSize={34} textAnchor="middle">{it.icon}</text>
                  {it.mark && (
                    <g>
                      <circle cx={x + cs - 11} cy={y + 12} r={10} fill={it.mark === "tick" ? "#16a34a" : "#dc2626"} stroke="#fff" strokeWidth={2} />
                      {it.mark === "tick"
                        ? <polyline points={`${x + cs - 16},${y + 12} ${x + cs - 12},${y + 16} ${x + cs - 6},${y + 8}`} fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                        : <g stroke="#fff" strokeWidth={2.5} strokeLinecap="round"><line x1={x + cs - 15} y1={y + 8} x2={x + cs - 7} y2={y + 16} /><line x1={x + cs - 7} y1={y + 8} x2={x + cs - 15} y2={y + 16} /></g>}
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        ),
      };
    }
    case "angle": {
      const col = PALETTE[fig.colour], d = fig.deg;
      const vx = d > 100 ? 140 : 40, vy = 150, L = 120;
      const ex = vx + L * Math.cos((-d * Math.PI) / 180), ey = vy + L * Math.sin((-d * Math.PI) / 180);
      const r = 34, ax = vx + r * Math.cos((-d * Math.PI) / 180), ay = vy + r * Math.sin((-d * Math.PI) / 180);
      return {
        w: d > 100 ? 280 : 180, h: 170,
        body: (
          <g>
            {d === 90
              ? <polyline points={`${vx + 22},${vy} ${vx + 22},${vy - 22} ${vx},${vy - 22}`} fill="none" stroke={shade(col, 0.7)} strokeWidth={3} />
              : <path d={`M ${vx + r} ${vy} A ${r} ${r} 0 ${d > 180 ? 1 : 0} 0 ${ax} ${ay}`} fill={col} fillOpacity={0.35} stroke={shade(col, 0.7)} strokeWidth={3} />}
            <line x1={vx} y1={vy} x2={vx + L} y2={vy} stroke={INK} strokeWidth={5} strokeLinecap="round" />
            <line x1={vx} y1={vy} x2={ex} y2={ey} stroke={col} strokeWidth={5} strokeLinecap="round" />
            <circle cx={vx} cy={vy} r={6} fill={INK} />
          </g>
        ),
      };
    }
    case "lines": {
      const col = PALETTE[fig.colour];
      const others = ["#3b82f6", "#f97316"];
      return { w: 120, h: 120, body: <g>{fig.segs.map(([a, b, c, d], i) => <line key={i} x1={10 + a} y1={10 + b} x2={10 + c} y2={10 + d} stroke={i === 0 ? col : others[(i - 1) % 2]} strokeWidth={6} strokeLinecap="round" />)}</g> };
    }
    case "calendar": {
      const cs = 44, top = 62;
      const rows = Math.ceil((fig.start + fig.days) / 7);
      const w = 7 * cs + 16, h = top + rows * cs + 10;
      return {
        w, h,
        body: (
          <g>
            <rect x={4} y={4} width={w - 8} height={30} rx={8} fill="#ef4444" />
            <text x={w / 2} y={25} fontSize={16} fontWeight={900} fill="#fff" textAnchor="middle">{fig.month}</text>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d, i) => <text key={d} x={8 + i * cs + cs / 2} y={top - 10} fontSize={13} fontWeight={800} fill={i === 0 ? "#dc2626" : INK} textAnchor="middle">{d}</text>)}
            {Array.from({ length: fig.days }, (_, k) => {
              const pos = fig.start + k, x = 8 + (pos % 7) * cs, y = top + Math.floor(pos / 7) * cs;
              const m = fig.marks.find((mm) => mm.d === k + 1);
              return (
                <g key={k}>
                  <rect x={x + 2} y={y + 2} width={cs - 4} height={cs - 4} rx={8} fill={m ? PALETTE[m.colour] : pos % 7 === 0 ? "#fee2e2" : "#f8fafc"} stroke={m ? shade(PALETTE[m.colour], 0.65) : "#e2e8f0"} strokeWidth={m ? 3 : 1.5} />
                  <text x={x + cs / 2} y={y + cs / 2 + 6} fontSize={16} fontWeight={800} fill={m ? "#fff" : INK} textAnchor="middle">{k + 1}</text>
                </g>
              );
            })}
          </g>
        ),
      };
    }
    case "numgrid": {
      const cs = 42, n = fig.to - fig.from + 1, rows = Math.ceil(n / fig.cols);
      return {
        w: fig.cols * cs + 12, h: rows * cs + 12,
        body: (
          <g>
            {Array.from({ length: n }, (_, k) => {
              const v = fig.from + k, x = 6 + (k % fig.cols) * cs, y = 6 + Math.floor(k / fig.cols) * cs;
              const m = fig.marks.find((mm) => mm.v === v);
              return (
                <g key={k}>
                  <rect x={x} y={y} width={cs} height={cs} fill={m ? PALETTE[m.colour] : "#fff"} fillOpacity={m ? 0.3 : 1} stroke={m ? shade(PALETTE[m.colour], 0.7) : "#cbd5e1"} strokeWidth={m ? 3 : 1.2} />
                  {m && <circle cx={x + cs / 2} cy={y + cs / 2} r={17} fill="none" stroke={shade(PALETTE[m.colour], 0.75)} strokeWidth={2.5} />}
                  <text x={x + cs / 2} y={y + cs / 2 + 6} fontSize={16} fontWeight={m ? 900 : 700} fill={INK} textAnchor="middle">{v}</text>
                </g>
              );
            })}
          </g>
        ),
      };
    }
    case "matchsticks": {
      const s = 44, n = fig.squares, ox = 10, oy = 10;
      const stick = (x1: number, y1: number, x2: number, y2: number, k: string) => (
        <g key={k}>
          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#d97706" strokeWidth={6} strokeLinecap="round" />
          <circle cx={x2} cy={y2} r={5} fill="#dc2626" />
        </g>
      );
      const out: React.ReactNode[] = [];
      for (let i = 0; i < n; i++) {
        out.push(stick(ox + i * s + 4, oy, ox + (i + 1) * s - 4, oy, `t${i}`));
        out.push(stick(ox + i * s + 4, oy + s, ox + (i + 1) * s - 4, oy + s, `b${i}`));
      }
      for (let i = 0; i <= n; i++) out.push(stick(ox + i * s, oy + s - 4, ox + i * s, oy + 4, `v${i}`));
      return { w: Math.max(n, 3) * s + 20, h: s + 20, body: <g>{out}</g> }; // same width for every frame, so all frames share one scale
    }
    case "areamodel": {
      const total = fig.widths.reduce((a, b) => a + b, 0);
      const W = 320, H = 110, L = 46, T = 30;
      const cols = ["#93c5fd", "#fdba74", "#86efac", "#f9a8d4"];
      let x = L;
      return {
        w: L + W + 12, h: T + H + 12,
        body: (
          <g>
            {fig.widths.map((wd, i) => {
              const pw = (wd / total) * W, x0 = x; x += pw;
              return (
                <g key={i}>
                  <rect x={x0} y={T} width={pw} height={H} fill={cols[i % cols.length]} stroke={INK} strokeWidth={2.5} />
                  <text x={x0 + pw / 2} y={T - 9} fontSize={16} fontWeight={900} textAnchor="middle" fill={INK}>{fig.labels[i]}</text>
                </g>
              );
            })}
            <text x={L - 12} y={T + H / 2 + 6} fontSize={16} fontWeight={900} textAnchor="end" fill={INK}>{fig.hLabel}</text>
          </g>
        ),
      };
    }
    case "binary": {
      const n = fig.bits.length, cw = 74, chh = 104;
      return {
        w: n * (cw + 10) + 10, h: chh + 40,
        body: (
          <g>
            {fig.bits.map((b, i) => {
              const val = 2 ** (n - 1 - i), x = 10 + i * (cw + 10), y = 8;
              const per = val <= 2 ? val : val <= 8 ? 2 : 4;
              return (
                <g key={i}>
                  {b ? (
                    <g>
                      <rect x={x} y={y} width={cw} height={chh} rx={10} fill="#fff" stroke="#7c3aed" strokeWidth={3} />
                      {Array.from({ length: val }, (_, k) => {
                        const rowsN = Math.ceil(val / per), r = Math.min(8, 30 / Math.max(per, rowsN));
                        return <circle key={k} cx={x + cw / 2 + ((k % per) - (per - 1) / 2) * (r * 2.4)} cy={y + chh / 2 + (Math.floor(k / per) - (rowsN - 1) / 2) * (r * 2.4)} r={r} fill="#f97316" stroke="#c2410c" strokeWidth={1.5} />;
                      })}
                    </g>
                  ) : (
                    <g>
                      <rect x={x} y={y} width={cw} height={chh} rx={10} fill="#1d4ed8" stroke="#1e3a8a" strokeWidth={3} />
                      <rect x={x + 8} y={y + 8} width={cw - 16} height={chh - 16} rx={6} fill="none" stroke="#93c5fd" strokeWidth={2} strokeDasharray="5 4" />
                    </g>
                  )}
                  <text x={x + cw / 2} y={y + chh + 24} fontSize={15} fontWeight={900} textAnchor="middle" fill={INK}>{b ? val : ""}</text>
                </g>
              );
            })}
          </g>
        ),
      };
    }
    case "lettergrid": {
      const cs = 44, cols = Math.max(...fig.rows.map((r) => [...r].length));
      const col = PALETTE[fig.colour];
      return {
        w: cols * cs + 12, h: fig.rows.length * cs + 12,
        body: (
          <g>
            {fig.rows.flatMap((row, r) => [...row].map((ch, c) => ch === "." ? null : (
              <g key={`${r}-${c}`}>
                <rect x={6 + c * cs} y={6 + r * cs} width={cs} height={cs} fill={ch === " " ? "#fff" : `${col}33`} stroke={shade(col, 0.6)} strokeWidth={2} />
                {ch !== " " && <text x={6 + c * cs + cs / 2} y={6 + r * cs + cs / 2 + 7} fontSize={20} fontWeight={800} textAnchor="middle" fill={INK}>{ch}</text>}
              </g>
            )))}
          </g>
        ),
      };
    }
    case "venn": {
      const w = 360, h = 210;
      return {
        w, h,
        body: (
          <g>
            <rect x={2} y={2} width={w - 4} height={h - 4} rx={12} fill="#f8fafc" stroke="#cbd5e1" strokeWidth={2} />
            <circle cx={135} cy={110} r={78} fill="#3b82f6" fillOpacity={0.22} stroke="#2563eb" strokeWidth={3} />
            <circle cx={225} cy={110} r={78} fill="#f97316" fillOpacity={0.22} stroke="#ea580c" strokeWidth={3} />
            <text x={110} y={24} fontSize={14} fontWeight={800} textAnchor="middle" fill="#1d4ed8">{fig.left}</text>
            <text x={250} y={24} fontSize={14} fontWeight={800} textAnchor="middle" fill="#c2410c">{fig.right}</text>
            <text x={100} y={117} fontSize={20} fontWeight={800} textAnchor="middle" fill={INK}>{fig.a}</text>
            <text x={180} y={117} fontSize={20} fontWeight={800} textAnchor="middle" fill={INK}>{fig.both}</text>
            <text x={260} y={117} fontSize={20} fontWeight={800} textAnchor="middle" fill={INK}>{fig.b}</text>
            {fig.outside && <text x={w - 14} y={h - 14} fontSize={13} fontWeight={700} textAnchor="end" fill="#475569">{fig.outside}</text>}
          </g>
        ),
      };
    }
    case "beads": {
      const r = 15, gap = 4, n = fig.colours.length;
      const perRow = 14, rows = Math.ceil(n / perRow);
      return {
        w: Math.min(n, perRow) * (2 * r + gap) + 30, h: rows * (2 * r + 16) + 10,
        body: (
          <g>
            {Array.from({ length: rows }, (_, row) => <line key={row} x1={6} x2={Math.min(n, perRow) * (2 * r + gap) + 24} y1={8 + r + row * (2 * r + 16)} y2={8 + r + row * (2 * r + 16)} stroke="#78716c" strokeWidth={2.5} />)}
            {fig.colours.map((c, i) => {
              const cx = 16 + r + (i % perRow) * (2 * r + gap), cy = 8 + r + Math.floor(i / perRow) * (2 * r + 16);
              return <g key={i}><circle cx={cx} cy={cy} r={r} fill={PALETTE[c]} stroke={shade(PALETTE[c], 0.65)} strokeWidth={2.5} /><circle cx={cx - 5} cy={cy - 5} r={4} fill="#fff" opacity={0.55} /></g>;
            })}
          </g>
        ),
      };
    }
  }
}
