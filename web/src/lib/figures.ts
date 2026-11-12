// Picture questions are stored as small JSON drawing specs and rendered as SVG (see components/Figure.tsx).
// Specs never contain raw markup, so they are safe to store and render.

export const PALETTE = {
  red: "#ef4444",
  orange: "#f97316",
  yellow: "#facc15",
  green: "#22c55e",
  teal: "#14b8a6",
  blue: "#3b82f6",
  purple: "#a855f7",
  pink: "#ec4899",
} as const;
export type Colour = keyof typeof PALETTE;
export const COLOUR_NAMES: Record<Colour, string> = { red: "red", orange: "orange", yellow: "yellow", green: "green", teal: "teal", blue: "blue", purple: "purple", pink: "pink" };

/** A set of coloured cells on an n×n grid. */
export type Cell = [number, number, Colour]; // [row, col, colour]

export type Fig =
  | { kind: "pixels"; n: number; cells: Cell[]; mirror?: "right" | "bottom" | "middle"; alt: string }
  | { kind: "gridmap"; rows: number; cols: number; items: { r: number; c: number; icon: string }[]; path?: [number, number][]; compass?: boolean; alt: string }
  | { kind: "shapes"; cols: number; rows: number; items: { r: number; c: number; shape: "triangle" | "circle" | "square" | "star" | "heart"; colour: Colour; size?: number }[]; alt: string }
  | { kind: "sequence"; frames: (Fig | null)[]; alt: string }
  | { kind: "arrow"; dir: 0 | 1 | 2 | 3; colour: Colour; alt: string } // 0 up, 1 right, 2 down, 3 left
  | { kind: "dots"; count: number; colour: Colour; shape: "circle" | "square" | "triangle"; alt: string }
  | { kind: "bars"; title: string; labels: string[]; values: number[]; step: number; showValues?: boolean; alt: string }
  | { kind: "pictograph"; title: string; labels: string[]; counts: number[]; icon: string; per: number; alt: string }
  | { kind: "clock"; h: number; m: number; mirror?: boolean; alt: string }
  | { kind: "cubes"; heights: number[]; colour: Colour; alt: string }
  | { kind: "fraction"; shape: "circle" | "bar" | "grid"; parts: number; shaded: number; colour: Colour; rows?: number; alt: string }
  | { kind: "abacus"; labels: string[]; beads: number[]; alt: string }
  | { kind: "numberline"; min: number; max: number; step: number; labelEvery: number; decimals?: number; marks?: { v: number; label: string; colour: Colour }[]; jumps?: { from: number; size: number; count: number; colour: Colour; icon?: string }; alt: string }
  | { kind: "ruler"; cm: number; start: number; length: number; colour: Colour; alt: string }
  | { kind: "balance"; left: { icon: string; n: number }; right: number[]; unit: string; alt: string }
  | { kind: "jug"; max: number; step: number; labelEvery: number; level: number; unit: string; alt: string }
  | { kind: "money"; items: number[]; alt: string }
  | { kind: "icons"; items: { icon: string; mark?: "tick" | "cross" }[]; cols: number; alt: string }
  | { kind: "angle"; deg: number; colour: Colour; alt: string }
  | { kind: "lines"; segs: [number, number, number, number][]; colour: Colour; alt: string } // coordinates in a 0–100 box
  | { kind: "calendar"; month: string; start: number; days: number; marks: { d: number; colour: Colour }[]; alt: string } // start: 0 = Sunday
  | { kind: "numgrid"; from: number; to: number; cols: number; marks: { v: number; colour: Colour }[]; alt: string }
  | { kind: "matchsticks"; squares: number; alt: string }
  | { kind: "areamodel"; height: number; widths: number[]; labels: string[]; hLabel: string; alt: string }
  | { kind: "binary"; bits: number[]; alt: string } // most significant first; 1 = card face up
  | { kind: "beads"; colours: Colour[]; alt: string }
  | { kind: "lettergrid"; rows: string[]; colour: Colour; alt: string } // one character per cell, "." = no cell (cube nets, letter grids)
  | { kind: "image"; src: string; w: number; h: number; alt: string } // a picture file: "name.webp" in public/cbse (CBSE figures) or "folder/name.webp" in public (e.g. hb/ for help-book figures)
  | { kind: "venn"; left: string; right: string; a: string; both: string; b: string; outside?: string; alt: string };

// ---------- pixel transforms ----------
export const flipH = (n: number, cells: Cell[]): Cell[] => cells.map(([r, c, k]) => [r, n - 1 - c, k]);
export const flipV = (n: number, cells: Cell[]): Cell[] => cells.map(([r, c, k]) => [n - 1 - r, c, k]);
export const rotCW = (n: number, cells: Cell[]): Cell[] => cells.map(([r, c, k]) => [c, n - 1 - r, k]);
export const rotCCW = (n: number, cells: Cell[]): Cell[] => cells.map(([r, c, k]) => [n - 1 - c, r, k]);
export const rot180 = (n: number, cells: Cell[]): Cell[] => rotCW(n, rotCW(n, cells));
export const cellKey = (cells: Cell[]) => cells.map(([r, c, k]) => `${r},${c},${k}`).sort().join(";");

/** Shortest path length on a grid (4 directions) avoiding blocked cells; -1 if unreachable. */
export function shortestPath(rows: number, cols: number, blocked: Set<string>, from: [number, number], to: [number, number]): number {
  const q: [number, number, number][] = [[from[0], from[1], 0]];
  const seen = new Set([`${from[0]},${from[1]}`]);
  while (q.length) {
    const [r, c, d] = q.shift()!;
    if (r === to[0] && c === to[1]) return d;
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr, nc = c + dc, k = `${nr},${nc}`;
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols || blocked.has(k) || seen.has(k)) continue;
      seen.add(k);
      q.push([nr, nc, d + 1]);
    }
  }
  return -1;
}

/** Perimeter (in unit edges) of a set of grid cells. */
export function perimeter(cells: [number, number][]): number {
  const set = new Set(cells.map(([r, c]) => `${r},${c}`));
  let p = 0;
  for (const [r, c] of cells) for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (!set.has(`${r + dr},${c + dc}`)) p++;
  return p;
}

export function parseFig(json: string | null | undefined): Fig | null {
  if (!json) return null;
  try { return JSON.parse(json) as Fig; } catch { return null; }
}
export function parseFigs(json: string | null | undefined): (Fig | null)[] | null {
  if (!json) return null;
  try { return JSON.parse(json) as (Fig | null)[]; } catch { return null; }
}
