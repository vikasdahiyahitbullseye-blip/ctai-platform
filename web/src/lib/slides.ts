// Classroom slide deck (.pptx) for one chapter, built from the learning module, the year plan and the
// question bank. Pictures are rendered to PNG (colour emoji included) so slides look the same everywhere.
import PptxGenJS from "pptxgenjs";
import type { PrismaClient, Question } from "@prisma/client";
import { MODULES } from "../../prisma/content/library";
import { THEORY } from "../../prisma/content/theory";
import { formatAnswer } from "./scoring";
import { parseFig, parseFigs, type Fig } from "./figures";
import { figurePng } from "./figureImage";
import { KIND_LABEL, formatHours, periodLabels, type LessonKind } from "./plan";
import { PART_LABEL } from "./constants";

const W = 13.333, H = 7.5, M = 0.6;
const C = { brand: "3F3CBB", dark: "26237A", accent: "F2792A", ink: "16163A", body: "2F3150", muted: "6B6F8A", tint: "EEF0FF", tint2: "F6F7FC", good: "16A34A", goodSoft: "DCFCE7", line: "C9CCE0", white: "FFFFFF" };
const FONT = "Calibri";
const KIND_EMOJI: Record<string, string> = { INTRODUCE: "💡", EXPLORE: "🔍", PRACTISE: "✏️", ACTIVITY: "🧪", CHECK: "✅" };

type Slide = ReturnType<PptxGenJS["addSlide"]>;
type Run = { text: string; options?: Record<string, unknown> };

const plain = (s: string) => s.replace(/\*\*/g, "");
/** Bold runs from **markdown** plus line breaks. */
function runs(text: string, base: Record<string, unknown> = {}): Run[] {
  const out: Run[] = [];
  const lines = text.split("\n");
  lines.forEach((line, li) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g).filter((p) => p !== "");
    if (!parts.length) parts.push(" ");
    parts.forEach((p, pi) => {
      const bold = p.startsWith("**") && p.endsWith("**");
      out.push({ text: bold ? p.slice(2, -2) : p, options: { ...base, ...(bold ? { bold: true } : {}), ...(pi === parts.length - 1 && li < lines.length - 1 ? { breakLine: true } : {}) } });
    });
  });
  return out;
}
/** Rough text height in inches for a box `w` inches wide at `size` points. */
function textHeight(text: string, size: number, w: number) {
  const perLine = Math.max(10, Math.floor((w * 144) / size));
  const lines = text.split("\n").reduce((a, l) => a + Math.max(1, Math.ceil(plain(l).length / perLine)), 0);
  return (lines * size * 1.3) / 72 + 0.15;
}
/** Splits a question stem into text and pipe-table blocks. */
function stemBlocks(stem: string) {
  const blocks: ({ t: "text"; s: string } | { t: "table"; rows: string[][] })[] = [];
  let buf: string[] = [], tab: string[] = [];
  const flush = () => { if (buf.length) blocks.push({ t: "text", s: buf.join("\n").trim() }); buf = []; };
  const flushTab = () => { if (tab.length) blocks.push({ t: "table", rows: tab.filter((l) => !/^\s*\|[\s|:-]+\|\s*$/.test(l)).map((l) => l.trim().replace(/^\||\|$/g, "").split("|").map((c) => plain(c.trim()))) }); tab = []; };
  for (const line of stem.split("\n")) {
    if (line.trim().startsWith("|")) { flush(); tab.push(line); } else { flushTab(); buf.push(line.trim().startsWith("- ") ? `• ${line.trim().slice(2)}` : line); }
  }
  flush(); flushTab();
  return blocks.filter((b) => b.t === "table" || b.s);
}

export async function buildChapterDeck(db: PrismaClient, chapterId: string) {
  const ch = await db.chapter.findUniqueOrThrow({ where: { id: chapterId } });
  const key = `${ch.classLevel}-${ch.part}-${ch.number}`;
  const mod = MODULES[key];
  if (!mod) throw new Error(`No module for ${key}`);
  const small = ch.classLevel <= 5;
  const fs = { title: small ? 40 : 36, body: small ? 32 : 28, q: small ? 30 : 26, opt: small ? 28 : 24, note: 14 };
  const [lessons, modRes, kit, test, worksheets, pool] = await Promise.all([
    db.lesson.findMany({ where: { chapterId }, include: { chapter: true }, orderBy: { number: "asc" } }),
    db.resource.findFirst({ where: { chapterId, kind: "MODULE" } }),
    db.projectKit.findFirst({ where: { chapterKey: key, kind: "ACTIVITY" }, include: { criteria: { orderBy: { position: "asc" } } } }),
    db.assessment.findFirst({ where: { chapterId, libType: "CHAPTER_TEST" }, include: { _count: { select: { items: true } } } }),
    db.assessment.count({ where: { chapterId, libType: "WORKSHEET" } }),
    db.question.findMany({ where: { chapterId, status: "PUBLISHED", isPuzzle: false, type: { not: "SHORT" }, source: { not: "CBSE" } } }),
  ]);
  const meta = modRes?.meta ? (JSON.parse(modRes.meta) as { exampleId?: string; tryIds?: string[] }) : {};
  const byId = new Map(pool.map((q) => [q.id, q]));
  const example = meta.exampleId ? byId.get(meta.exampleId) : undefined;
  const tries = (meta.tryIds ?? []).map((id) => byId.get(id)).filter(Boolean) as Question[];
  const used = new Set([example?.id, ...tries.map((q) => q.id)]);
  const pick = (f: (q: Question) => boolean, n: number) => pool.filter((q) => !used.has(q.id) && f(q)).sort((a, b) => a.code.localeCompare(b.code)).slice(0, n).map((q) => (used.add(q.id), q));
  const isPic = (q: Question) => !!(q.figure || q.optionFigures);
  const practice = [...pick(isPic, 2), ...pick((q) => !isPic(q) && q.difficulty >= 2, 2)];

  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "Hitbullseye";
  pptx.company = "Hitbullseye";
  pptx.title = `Class ${ch.classLevel} · ${ch.title}`;
  const footer = `Class ${ch.classLevel} · ${PART_LABEL[ch.part]} · ${ch.title}`;
  pptx.defineSlideMaster({
    title: "CONTENT",
    background: { color: C.white },
    objects: [
      { rect: { x: 0, y: 0, w: W, h: 0.14, fill: { color: C.brand } } },
      { rect: { x: 0, y: 0, w: 2.2, h: 0.14, fill: { color: C.accent } } },
      { text: { text: footer, options: { x: M, y: H - 0.45, w: 10, h: 0.3, fontFace: FONT, fontSize: 11, color: C.muted } } },
    ],
    slideNumber: { x: W - 1.1, y: H - 0.45, w: 0.6, h: 0.3, fontFace: FONT, fontSize: 11, color: C.muted, align: "right" },
  });
  const plabel = periodLabels(lessons);
  const notesOf = (kind: string) => plain(lessons.find((l) => l.kind === kind)?.flow ?? "").replace(/\n\n/g, "\n");

  const content = (kicker: string, title: string, notes?: string) => {
    const s = pptx.addSlide({ masterName: "CONTENT" });
    s.addText(kicker.toUpperCase(), { x: M, y: 0.35, w: W - 2 * M, h: 0.35, fontFace: FONT, fontSize: 13, bold: true, color: C.accent, charSpacing: 2 });
    s.addText(title, { x: M, y: 0.68, w: W - 2 * M, h: 0.75, fontFace: FONT, fontSize: fs.title, bold: true, color: C.dark, valign: "top" });
    if (notes) s.addNotes(notes);
    return s;
  };
  const bullets = (s: Slide, items: string[], y = 1.6, size = fs.body) =>
    s.addText(items.map((t) => ({ text: plain(t), options: { bullet: { code: "25CF" }, paraSpaceAfter: 10 } })), { x: M + 0.1, y, w: W - 2 * M - 0.2, h: H - y - 0.7, fontFace: FONT, fontSize: size, color: C.body, valign: "top" });

  // ---------- Title ----------
  {
    const s = pptx.addSlide();
    s.background = { color: C.dark };
    [[2.4, "34319A"], [1.75, "3F3CBB"], [1.1, "5A57D6"], [0.45, C.accent]].forEach(([r, col]) => s.addShape(pptx.ShapeType.ellipse, { x: W - 2.9 - (r as number), y: 2.3 - (r as number), w: (r as number) * 2, h: (r as number) * 2, fill: { color: col as string }, line: { color: col as string } }));
    s.addShape(pptx.ShapeType.rect, { x: M, y: 1.35, w: 0.9, h: 0.08, fill: { color: C.accent }, line: { color: C.accent } });
    s.addText(`HITBULLSEYE · CT & AI · CLASS ${ch.classLevel}`, { x: M, y: 0.9, w: 8, h: 0.4, fontFace: FONT, fontSize: 14, bold: true, color: "C9C8FF", charSpacing: 2 });
    s.addText(ch.title, { x: M, y: 1.7, w: 8.2, h: 2.4, fontFace: FONT, fontSize: 48, bold: true, color: C.white, valign: "top", fit: "shrink" });
    s.addText(`${PART_LABEL[ch.part]} · Chapter ${ch.number}`, { x: M, y: 4.3, w: 8, h: 0.5, fontFace: FONT, fontSize: 22, color: "E2E1FF" });
    if (ch.periods) s.addText(`${ch.periods} period${ch.periods > 1 ? "s" : ""} of 40 minutes (${formatHours(ch.periods)})`, { x: M, y: 4.85, w: 8, h: 0.45, fontFace: FONT, fontSize: 18, color: "C9C8FF" });
    s.addText(mod.kit.e, { x: W - 3.7, y: 1.4, w: 1.6, h: 1.6, fontSize: 60, align: "center", valign: "middle" });
    s.addNotes(`Deck for ${footer}. Each section matches a period in the year plan. Speaker notes give the 40-minute lesson flow; answers are on the slide after each question and in the notes.`);
  }
  // ---------- Lesson map (teacher) ----------
  if (lessons.length) {
    const s = content("For the teacher", "How this chapter is taught");
    s.addTable(
      [[{ text: "Period", options: { bold: true, color: C.white, fill: { color: C.brand } } }, { text: "Type", options: { bold: true, color: C.white, fill: { color: C.brand } } }, { text: "Month", options: { bold: true, color: C.white, fill: { color: C.brand } } }, { text: "Learning objective", options: { bold: true, color: C.white, fill: { color: C.brand } } }],
        ...lessons.map((l, i) => [plabel.get(l.id)!, KIND_LABEL[l.kind as LessonKind], `${l.month} · wk ${l.week}`, l.objective].map((t) => ({ text: t, options: { fill: { color: i % 2 ? C.white : C.tint2 } } })))],
      { x: M, y: 1.6, w: W - 2 * M, colW: [2.0, 1.9, 1.9, W - 2 * M - 5.8], fontFace: FONT, fontSize: 14, color: C.body, border: { type: "solid", pt: 0.5, color: C.line }, valign: "middle" },
    );
    s.addNotes("Tick each period as taught in the Year plan on the platform. Worksheets, assignments and the chapter test are in the Library.");
  }

  const divider = (kind: LessonKind, extra?: string) => {
    const l = lessons.find((x) => x.kind === kind);
    const s = pptx.addSlide();
    s.background = { color: C.tint };
    s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.35, h: H, fill: { color: C.brand }, line: { color: C.brand } });
    s.addText(KIND_EMOJI[kind] ?? "📘", { x: M + 0.2, y: 1.5, w: 1.6, h: 1.6, fontSize: 64, align: "center", valign: "middle" });
    s.addText(l ? `${plabel.get(l.id)!.toUpperCase()} · ${l.month.toUpperCase()}` : "IF TIME ALLOWS", { x: 2.6, y: 1.6, w: 9, h: 0.45, fontFace: FONT, fontSize: 16, bold: true, color: C.accent, charSpacing: 2 });
    s.addText(KIND_LABEL[kind], { x: 2.6, y: 2.05, w: 9.5, h: 1.0, fontFace: FONT, fontSize: 44, bold: true, color: C.dark });
    s.addText(`🎯 ${l?.objective ?? extra ?? ""}`, { x: 2.6, y: 3.2, w: 9.5, h: 1.2, fontFace: FONT, fontSize: 22, color: C.body, valign: "top" });
    s.addNotes(l ? `Lesson plan (40 min)\n${notesOf(kind)}` : "Use these slides in a neighbouring period if time allows.");
  };

  // ---------- Questions ----------
  let qn = 0;
  const questionSlides = async (q: Question, label: string) => {
    qn++;
    const opts = JSON.parse(q.options) as string[];
    const fig = parseFig(q.figure);
    const ofigs = parseFigs(q.optionFigures);
    const answer = formatAnswer(q.type, opts, JSON.parse(q.answer));
    const s = content(label, label === "Worked example" ? "Let's solve it together" : q.type === "MULTI" ? "Choose all that are right" : "Your turn", `Answer: ${plain(answer)}\n${plain(q.solution)}${q.hint ? `\nHint: ${q.hint}` : ""}`);
    let y = 1.5;
    for (const b of stemBlocks(q.stem)) {
      if (b.t === "text") {
        const h = textHeight(b.s, fs.q, W - 2 * M);
        s.addText(runs(b.s), { x: M, y, w: W - 2 * M, h, fontFace: FONT, fontSize: fs.q, color: C.ink, valign: "top" });
        y += h + 0.05;
      } else {
        const rows = b.rows.map((r, ri) => r.map((c) => ({ text: c, options: ri === 0 ? { bold: true, fill: { color: C.tint } } : {} })));
        const colW = Math.min(2.6, (W - 2 * M) / Math.max(1, b.rows[0].length));
        s.addTable(rows, { x: M, y, colW: Array(b.rows[0].length).fill(colW), fontFace: FONT, fontSize: fs.opt - 2, color: C.ink, border: { type: "solid", pt: 0.75, color: C.line } });
        y += 0.42 * rows.length + 0.15;
      }
    }
    const bottom = H - 0.6;
    const place = async (f: Fig, x: number, top: number, maxW: number, maxH: number, cap = 1.9) => {
      const img = await figurePng(f);
      const sc = Math.min(maxW / (img.w / 96), maxH / (img.h / 96), cap);
      const w = (img.w / 96) * sc, h = (img.h / 96) * sc;
      s.addImage({ data: img.data, x: x + (maxW - w) / 2, y: top, w, h });
      return h;
    };
    if (ofigs?.some(Boolean)) {
      let top = y + 0.1;
      if (fig) top += (await place(fig, M, top, 5, Math.max(1.4, Math.min(2.1, bottom - top - 2.6)), 2.4)) + 0.15;
      const n = opts.length, cw = (W - 2 * M) / n;
      for (let i = 0; i < n; i++) {
        s.addText(String.fromCharCode(65 + i), { x: M + i * cw + (cw - 0.5) / 2, y: top, w: 0.5, h: 0.5, fontFace: FONT, fontSize: 20, bold: true, color: C.white, fill: { color: C.brand }, align: "center", valign: "middle", shape: pptx.ShapeType.ellipse });
        if (ofigs[i]) await place(ofigs[i]!, M + i * cw + 0.15, top + 0.6, cw - 0.3, Math.max(1.2, bottom - top - 0.65), 2.6);
      }
    } else {
      const optW = fig ? 5.6 : W - 2 * M;
      const optX = fig ? W - M - optW : M;
      if (fig) await place(fig, M, y + 0.1, W - 2 * M - optW - 0.3, bottom - y - 0.2);
      if (q.type === "MCQ" || q.type === "MULTI" || q.type === "TRUE_FALSE") {
        const list = q.type === "TRUE_FALSE" ? ["True", "False"] : opts;
        const cols = !fig && list.length > 2 && list.every((o) => o.length < 40) ? 2 : 1;
        const bw = (optW - (cols - 1) * 0.25) / cols;
        const bh = Math.min(1.0, (bottom - y - 0.2) / Math.ceil(list.length / cols) - 0.15);
        list.forEach((o, i) => {
          const cx = optX + (i % cols) * (bw + 0.25), cy = y + 0.15 + Math.floor(i / cols) * (bh + 0.15);
          s.addText([{ text: `${String.fromCharCode(65 + i)}   `, options: { bold: true, color: C.brand } }, ...runs(o)], { x: cx, y: cy, w: bw, h: bh, fontFace: FONT, fontSize: fs.opt, color: C.ink, fill: { color: C.tint2 }, line: { color: C.line, width: 1 }, rectRadius: 0.12, shape: pptx.ShapeType.roundRect, valign: "middle", margin: 8 });
        });
      } else if (q.type === "ORDER") {
        s.addText("Put these in the right order:", { x: optX, y: y + 0.1, w: optW, h: 0.5, fontFace: FONT, fontSize: fs.opt, italic: true, color: C.muted });
        opts.forEach((o, i) => s.addText(plain(o), { x: optX, y: y + 0.7 + i * 0.7, w: optW, h: 0.58, fontFace: FONT, fontSize: fs.opt, color: C.ink, fill: { color: C.tint2 }, line: { color: C.line, width: 1 }, shape: pptx.ShapeType.roundRect, rectRadius: 0.12, margin: 8, valign: "middle" }));
      } else {
        s.addText("Answer:  ____________", { x: optX, y: Math.min(bottom - 1, y + 0.3), w: optW, h: 0.8, fontFace: FONT, fontSize: fs.q, bold: true, color: C.brand });
      }
    }
    // Answer slide
    const a = content(label, "Answer", `Answer: ${plain(answer)}\n${plain(q.solution)}`);
    a.addText(`✓  ${plain(answer)}`, { x: M, y: 1.55, w: W - 2 * M, h: 0.9, fontFace: FONT, fontSize: fs.q + 2, bold: true, color: C.good, fill: { color: C.goodSoft }, shape: pptx.ShapeType.roundRect, rectRadius: 0.12, margin: 10, valign: "middle" });
    let ay = 2.65;
    const correctFig = ofigs?.[Number(JSON.parse(q.answer))] ?? null;
    if (q.type === "MCQ" && correctFig) {
      const img = await figurePng(correctFig);
      const sc = Math.min(3 / (img.w / 96), 2.4 / (img.h / 96), 1.9);
      a.addImage({ data: img.data, x: M, y: ay, w: (img.w / 96) * sc, h: (img.h / 96) * sc });
      a.addText(runs(q.solution), { x: M + 3.4, y: ay, w: W - 2 * M - 3.4, h: H - ay - 0.8, fontFace: FONT, fontSize: fs.body - 2, color: C.body, valign: "top" });
    } else {
      a.addText(runs(q.solution), { x: M, y: ay, w: W - 2 * M, h: H - ay - 0.8, fontFace: FONT, fontSize: fs.body - 2, color: C.body, valign: "top" });
      ay += 0;
    }
  };

  const has = (k: LessonKind) => lessons.some((l) => l.kind === k);

  // ---------- Introduce ----------
  divider("INTRODUCE", mod.o[0]);
  { const s = content("Introduce", "What we will learn", notesOf("INTRODUCE")); bullets(s, mod.o); }
  {
    const s = content("Think about it", "🤔  Think about it", "Ask the class first. Collect a few answers before moving on.");
    s.addText(mod.hook, { x: M + 0.3, y: 1.8, w: W - 2 * M - 0.6, h: 3.8, fontFace: FONT, fontSize: small ? 34 : 30, color: C.ink, fill: { color: C.tint }, shape: pptx.ShapeType.roundRect, rectRadius: 0.2, margin: 24, valign: "middle", align: "center" });
  }
  { const s = content("Introduce", "Key ideas"); bullets(s, mod.ideas); }
  {
    const s = content("Introduce", "Key words");
    s.addTable(mod.terms.map(([t, d]) => [{ text: t, options: { bold: true, color: C.dark, fill: { color: C.tint } } }, { text: d }]), { x: M, y: 1.7, w: W - 2 * M, colW: [4, W - 2 * M - 4], fontFace: FONT, fontSize: fs.body, color: C.body, border: { type: "solid", pt: 0.75, color: C.line }, valign: "middle", rowH: 0.8 });
  }
  // "Learn it" theory (Classes 3–8): one slide per concept, the same content as the help books.
  const theory = THEORY[key];
  if (theory) {
    for (const [i, c] of theory.concepts.entries()) {
      const s = content(`Learn it · idea ${i + 1} of ${theory.concepts.length}`, plain(c.title), [plain(c.text), ...(c.points ?? []).map((p) => `• ${plain(p)}`), c.remember ? `Remember: ${plain(c.remember)}` : ""].filter(Boolean).join("\n"));
      let figW = 0;
      if (c.fig) {
        const img = await figurePng(c.fig);
        const sc = Math.min(5 / (img.w / 96), 4.2 / (img.h / 96), 2.2);
        const w = (img.w / 96) * sc, h = (img.h / 96) * sc;
        figW = w + 0.3;
        s.addImage({ data: img.data, x: W - M - w, y: 1.7, w, h });
      }
      const tw = W - 2 * M - figW;
      const h = c.table ? 2.3 : c.remember ? 4.0 : 4.9;
      const all = [c.text, ...(c.points ?? [])].join("\n");
      const size = [fs.body - 4, fs.body - 8, fs.body - 12, 16].find((z) => textHeight(all, z, tw) + (c.points ? 0.3 : 0) <= h) ?? 16;
      const body: Run[] = runs(c.text, { fontSize: size });
      body[body.length - 1].options = { ...body[body.length - 1].options, breakLine: true };
      for (const p of c.points ?? []) {
        // A typed bullet: pptxgenjs drops or splits list bullets on points that mix bold and plain runs.
        const r = runs(`•  ${p}`, { fontSize: size - 2 });
        r[r.length - 1].options = { ...r[r.length - 1].options, breakLine: true };
        body.push(...r);
      }
      const textH = c.table ? Math.min(h, textHeight(all, size, tw) + (c.points ? 0.3 : 0) + 0.1) : h;
      s.addText(body, { x: M, y: 1.6, w: tw, h: textH, fontFace: FONT, color: C.body, valign: "top", paraSpaceAfter: 6 });
      if (c.table) {
        const ty = 1.6 + textH + 0.1, room = (c.remember ? H - 1.6 : H - 0.7) - ty;
        // Column widths follow the longest text in each column; the font shrinks until the wrapped rows fit the room.
        const cols = c.table[0].length, tableW = Math.min(tw, 3.4 * cols);
        // A column is at least as wide as its longest word (times 1.6), so words are not broken.
        const longest = c.table[0].map((_, j) => Math.max(...c.table!.map((r) => Math.max(plain(r[j] ?? "").length, 1.6 * Math.max(...plain(r[j] ?? "").split(/\s+/).map((w) => w.length)))), 4));
        const colW = longest.map((l) => (tableW * l) / longest.reduce((a, b) => a + b, 0));
        const heightAt = (z: number) => c.table!.reduce((a, r) => a + Math.max(...r.map((t, j) => Math.ceil((plain(t).length * z * 0.46) / 72 / Math.max(0.3, colW[j] - 0.08)))) * z * 1.25 / 72 + 0.06, 0);
        const tsize = [small ? 20 : 18, 16, 14, 13, 12, 11, 10].find((z) => heightAt(z) <= room) ?? 10;
        s.addTable(c.table.map((r, ri) => r.map((t) => ({ text: plain(t), options: ri === 0 ? { bold: true, color: C.dark, fill: { color: C.tint } } : {} }))), { x: M, y: ty, w: tableW, colW, fontFace: FONT, fontSize: tsize, color: C.body, border: { type: "solid", pt: 0.75, color: C.line }, valign: "middle", margin: 2 });
      }
      if (c.remember) s.addText([{ text: "⭐ Remember: ", options: { bold: true } }, ...runs(c.remember)], { x: M, y: H - 1.45, w: W - 2 * M, h: 0.75, fontFace: FONT, fontSize: textHeight(c.remember, fs.body - 10, W - 2 * M) < 0.75 ? fs.body - 10 : 16, color: C.ink, fill: { color: "FFF4E5" }, shape: pptx.ShapeType.roundRect, rectRadius: 0.12, margin: 8, valign: "middle" });
      if (c.example) {
        const e = content("Learn it · worked example", plain(c.example.q), `Answer: ${plain(c.example.answer)}`);
        e.addText(c.example.steps.map((st, j) => ({ text: `${j + 1}.  ${plain(st)}`, options: { breakLine: true, paraSpaceAfter: 8 } })), { x: M + 0.1, y: 1.75, w: W - 2 * M - 0.2, h: 3.9, fontFace: FONT, fontSize: textHeight(c.example.steps.join("\n"), fs.body - 4, W - 2 * M) < 3.6 ? fs.body - 4 : fs.body - 10, color: C.body, valign: "top" });
        e.addText(`✓  ${plain(c.example.answer)}`, { x: M, y: H - 1.55, w: W - 2 * M, h: 0.8, fontFace: FONT, fontSize: fs.body - 4, bold: true, color: C.good, fill: { color: C.goodSoft }, shape: pptx.ShapeType.roundRect, rectRadius: 0.12, margin: 10, valign: "middle" });
      }
    }
    const tip = content("Learn it", "💡  Thinking tip");
    tip.addText(plain(theory.tip), { x: M + 0.3, y: 1.8, w: W - 2 * M - 0.6, h: 3.6, fontFace: FONT, fontSize: small ? 30 : 26, color: C.white, fill: { color: C.brand }, shape: pptx.ShapeType.roundRect, rectRadius: 0.2, margin: 24, valign: "middle", align: "center" });
  }
  if (example) await questionSlides(example, "Worked example");
  if (tries[0]) await questionSlides(tries[0], "Try it 1");

  // ---------- Explore ----------
  if (has("EXPLORE")) divider("EXPLORE", mod.o[1]);
  for (const [i, q] of tries.slice(1).entries()) await questionSlides(q, `Try it ${i + 2}`);
  {
    const s = content("Watch out!", "⚠️  A common mistake");
    s.addText(mod.mistake, { x: M + 0.3, y: 1.8, w: W - 2 * M - 0.6, h: 3.4, fontFace: FONT, fontSize: small ? 30 : 26, color: C.ink, fill: { color: "FFF4E5" }, line: { color: C.accent, width: 2 }, shape: pptx.ShapeType.roundRect, rectRadius: 0.2, margin: 24, valign: "middle" });
  }

  // ---------- Activity ----------
  divider("ACTIVITY", `${mod.kit.t}: ${mod.kit.out}`);
  {
    const s = content("Hands-on activity", `${mod.kit.e}  ${mod.kit.t}`, notesOf("ACTIVITY") || mod.kit.steps.map(([t, , tip]) => `${t}: ${tip}`).join("\n"));
    s.addText([{ text: "You need: ", options: { bold: true } }, { text: mod.kit.mat }], { x: M, y: 1.55, w: W - 2 * M, h: 0.6, fontFace: FONT, fontSize: fs.body - 2, color: C.body });
    const n = mod.kit.steps.length, cw = (W - 2 * M - (n - 1) * 0.3) / n;
    mod.kit.steps.forEach(([t, st], i) => {
      s.addText([{ text: `${i + 1}. ${t}`, options: { bold: true, color: C.dark, fontSize: fs.body, breakLine: true } }, { text: st, options: { fontSize: fs.body - 4, color: C.body } }], { x: M + i * (cw + 0.3), y: 2.35, w: cw, h: 3.6, fontFace: FONT, fill: { color: C.tint2 }, line: { color: C.line, width: 1 }, shape: pptx.ShapeType.roundRect, rectRadius: 0.15, margin: 14, valign: "top" });
    });
    s.addText([{ text: "You will make: ", options: { bold: true } }, { text: mod.kit.out }], { x: M, y: 6.15, w: W - 2 * M, h: 0.55, fontFace: FONT, fontSize: fs.body - 4, color: C.good });
  }
  if (kit?.criteria.length) {
    const s = content("Hands-on activity", "How we will check our work");
    s.addTable([[{ text: "", options: { fill: { color: C.brand } } }, ...["Getting started", "On the way", "Got it", "Super"].map((h) => ({ text: h, options: { bold: true, color: C.white, fill: { color: C.brand } } }))], ...kit.criteria.map((c) => [{ text: c.name, options: { bold: true, fill: { color: C.tint } } }, ...(JSON.parse(c.levels) as string[]).map((l) => ({ text: l }))])], { x: M, y: 1.7, w: W - 2 * M, colW: [2.6, ...Array(4).fill((W - 2 * M - 2.6) / 4)], fontFace: FONT, fontSize: 15, color: C.body, border: { type: "solid", pt: 0.75, color: C.line }, valign: "middle" });
  }

  // ---------- Practise ----------
  divider("PRACTISE", mod.o[2]);
  for (const [i, q] of practice.entries()) await questionSlides(q, `Practice ${i + 1}`);
  if (worksheets) { const s = content("Practise", "📝  Worksheet time", "Print from Library → Worksheets (with answer key), or assign online as homework."); bullets(s, [`This chapter has ${worksheets} worksheet${worksheets > 1 ? "s" : ""} in the Library: practice, picture puzzles and challenge.`, "Work on your own first, then check with a partner.", "Finished early? Try the adaptive practice on the platform."]); }

  // ---------- Check ----------
  divider("CHECK", `Show what you have learnt in "${ch.title}".`);
  {
    const s = content("Check yourself", "Can you do this?", notesOf("CHECK"));
    s.addText(mod.o.map((o) => ({ text: `☐  ${o}`, options: { paraSpaceAfter: 14, breakLine: true } })), { x: M + 0.2, y: 1.7, w: W - 2 * M - 0.4, h: 3.6, fontFace: FONT, fontSize: fs.body + 2, color: C.ink, valign: "top" });
    if (test) s.addText(`Chapter test: ${test._count.items} questions · ${test.durationMin} minutes · on the platform or on paper`, { x: M, y: 5.6, w: W - 2 * M, h: 0.6, fontFace: FONT, fontSize: fs.body - 4, color: C.brand, bold: true });
  }
  {
    const s = content("At home", "🏠  Your task at home", "This task is also part of the chapter's assignment in the Library.");
    s.addText(mod.home, { x: M + 0.3, y: 1.8, w: W - 2 * M - 0.6, h: 3.6, fontFace: FONT, fontSize: small ? 30 : 26, color: C.ink, fill: { color: C.tint }, shape: pptx.ShapeType.roundRect, rectRadius: 0.2, margin: 24, valign: "middle" });
  }
  {
    const s = pptx.addSlide();
    s.background = { color: C.dark };
    s.addText("Well done! 🎉", { x: 0, y: 2.6, w: W, h: 1.2, fontFace: FONT, fontSize: 54, bold: true, color: C.white, align: "center" });
    s.addText(`Next: keep practising "${ch.title}" on the platform`, { x: 0, y: 3.9, w: W, h: 0.6, fontFace: FONT, fontSize: 22, color: "C9C8FF", align: "center" });
  }

  const buffer = (await pptx.write({ outputType: "nodebuffer" })) as Buffer;
  const name = `Class${ch.classLevel}-${ch.part}-${String(ch.number).padStart(2, "0")}-${ch.title.replace(/[^\w]+/g, "-").replace(/^-|-$/g, "")}.pptx`;
  return { buffer, name, slides: qn };
}
