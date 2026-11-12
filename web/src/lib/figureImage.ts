// Turns a picture-question spec into a PNG (for slides and other exports). Emoji are replaced by bundled
// colour images (rendered from the open-source Noto Color Emoji font, Apache 2.0) so pictures look the same
// on every computer, whatever emoji fonts it has.
import React from "react";
import sharp from "sharp";
import { draw } from "@/components/Figure";
import type { Fig } from "./figures";
import fs from "node:fs";
import path from "node:path";
import EMOJI from "./emojiImages.json";

const EMOJI_MAP = EMOJI as Record<string, string>;
const FONT = "Inter, 'Segoe UI', Arial, Helvetica, sans-serif";
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

/** Minimal React-element → SVG markup serializer for our drawing trees (Next.js disallows react-dom/server here). */
const KEEP_CASE = new Set(["viewBox", "preserveAspectRatio"]);
function toMarkup(node: React.ReactNode): string {
  if (node == null || node === false || node === true) return "";
  if (typeof node === "string" || typeof node === "number") return esc(String(node));
  if (Array.isArray(node)) return node.map(toMarkup).join("");
  if (React.isValidElement(node)) {
    const el = node as React.ReactElement<Record<string, unknown>>;
    const { children, ...props } = el.props;
    if (el.type === React.Fragment) return toMarkup(children as React.ReactNode);
    if (typeof el.type !== "string") return toMarkup((el.type as (p: unknown) => React.ReactNode)(el.props));
    const attrs = Object.entries(props)
      .filter(([k, v]) => v != null && v !== false && k !== "key" && typeof v !== "object" && typeof v !== "function")
      .map(([k, v]) => `${k === "className" ? "class" : KEEP_CASE.has(k) ? k : k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}="${esc(String(v))}"`)
      .join(" ");
    return `<${el.type}${attrs ? ` ${attrs}` : ""}>${toMarkup(children as React.ReactNode)}</${el.type}>`;
  }
  return "";
}

function body(fig: Fig): { w: number; h: number; markup: string } {
  if (fig.kind === "image") {
    // Embed the picture file so the SVG/PNG works outside the browser (slides, documents).
    const w = Math.round(fig.w * 0.64), h = Math.round(fig.h * 0.64);
    const file = fig.src.includes("/") ? path.join(process.cwd(), "public", ...fig.src.split("/").map((x) => path.basename(x))) : path.join(process.cwd(), "public", "cbse", path.basename(fig.src));
    const data = fs.existsSync(file) ? fs.readFileSync(file).toString("base64") : "";
    return { w, h, markup: `<image href="data:image/webp;base64,${data}" x="0" y="0" width="${w}" height="${h}"/>` };
  }
  if (fig.kind === "sequence") {
    const wide = fig.frames.some((f) => f?.kind === "matchsticks");
    const fw = wide ? 160 : 96, fh = 96, gap = 10, pad = 10;
    const w = pad * 2 + fig.frames.length * fw + (fig.frames.length - 1) * gap, h = fh + pad * 2;
    const parts = fig.frames.map((f, i) => {
      const x = pad + i * (fw + gap);
      const box = `<rect x="${x}" y="${pad}" width="${fw}" height="${fh}" rx="10" fill="#fff" stroke="#e2e8f0" stroke-width="2"/>`;
      if (!f) return `${box}<text x="${x + fw / 2}" y="${pad + fh / 2 + 14}" font-size="40" font-weight="900" fill="#94a3b8" text-anchor="middle">?</text>`;
      const inner = body(f);
      const s = Math.min((fw - 10) / inner.w, (fh - 10) / inner.h);
      const iw = inner.w * s, ih = inner.h * s;
      return `${box}<svg x="${x + (fw - iw) / 2}" y="${pad + (fh - ih) / 2}" width="${iw}" height="${ih}" viewBox="0 0 ${inner.w} ${inner.h}">${inner.markup}</svg>`;
    });
    return { w, h, markup: parts.join("") };
  }
  const d = draw(fig);
  return { w: d.w, h: d.h, markup: toMarkup(d.body) };
}

/** Replaces <text> nodes that contain only an emoji with the bundled colour image. */
function emojiToImages(svg: string) {
  return svg.replace(/<text([^>]*)>([^<]+)<\/text>/g, (whole, attrs: string, content: string) => {
    const key = content.trim();
    const img = EMOJI_MAP[key] ?? EMOJI_MAP[key + "️"] ?? EMOJI_MAP[key.replace(/️/g, "")];
    if (!img) return whole;
    const num = (name: string, dflt = 0) => { const m = attrs.match(new RegExp(`\\b${name}="([-\\d.]+)"`)); return m ? Number(m[1]) : dflt; };
    const size = num("font-size", 16), x = num("x"), y = num("y");
    const anchor = /text-anchor="middle"/.test(attrs) ? "middle" : /text-anchor="end"/.test(attrs) ? "end" : "start";
    const box = size * 1.25;
    const left = anchor === "middle" ? x - box / 2 : anchor === "end" ? x - box : x - size * 0.12;
    const top = y - size * 0.92 - (box - size) / 2;
    return `<image x="${left.toFixed(1)}" y="${top.toFixed(1)}" width="${box.toFixed(1)}" height="${box.toFixed(1)}" href="data:image/png;base64,${img}"/>`;
  });
}

export function figureSvg(fig: Fig) {
  const b = body(fig);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${b.w}" height="${b.h}" viewBox="0 0 ${b.w} ${b.h}" font-family="${esc(FONT)}"><rect width="${b.w}" height="${b.h}" fill="#ffffff"/>${b.markup}</svg>`;
  return { svg: emojiToImages(svg), w: b.w, h: b.h };
}

/** PNG as a data URL, rendered at `scale` × for crisp projection. */
export async function figurePng(fig: Fig, scale = 2) {
  if (fig.kind === "image") {
    // Book figures are already pictures: convert the file straight to PNG (no SVG step).
    const file = fig.src.includes("/") ? path.join(process.cwd(), "public", ...fig.src.split("/").map((x) => path.basename(x))) : path.join(process.cwd(), "public", "cbse", path.basename(fig.src));
    const w = Math.round(fig.w * 0.64), h = Math.round(fig.h * 0.64);
    const png = await sharp(file).png().toBuffer();
    return { data: `image/png;base64,${png.toString("base64")}`, w, h };
  }
  const { svg, w, h } = figureSvg(fig);
  const png = await sharp(Buffer.from(svg), { density: 72 * scale }).png().toBuffer();
  return { data: `image/png;base64,${png.toString("base64")}`, w, h };
}
