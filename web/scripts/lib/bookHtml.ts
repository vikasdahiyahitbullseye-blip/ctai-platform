// Shared HTML for the help-book pages rendered by practice-pages.ts and cbse-edition-pages.ts:
// question cards, worked solutions in the CBSE Teacher Handbook style, and the books' page style.
import { SKILLS } from "../../src/lib/constants";
import { figureSvg } from "../../src/lib/figureImage";
import type { Fig } from "../../src/lib/figures";
import EMOJI from "../../src/lib/emojiImages.json";

export type Q = { code: string; stem: string; type: string; difficulty: number; skills: string[]; options: string[]; answer: unknown; solution: string; solutionFigures: (Fig | null)[] | null; figure: Fig | null; optionFigures: (Fig | null)[] | null; family: string };


// ---------- HTML ----------
export const EMO = EMOJI as Record<string, string>;
export const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
export const emoji = (s: string) => s.replace(/\p{Extended_Pictographic}️?/gu, (e) => { const img = EMO[e] ?? EMO[e.replace(/️/g, "")]; return img ? `<img class="emo" src="data:image/png;base64,${img}">` : e; });
export const md = (s: string) => emoji(esc(s).replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>").replace(/`([^`]+)`/g, "<code>$1</code>").replace(/____/g, '<span class="blank"></span>'));
export const svg = (f: Fig, max: number) => { const { svg: s, w } = figureSvg(f); return `<div class="fig" style="width:${Math.min(w, max)}px">${s.replace(/^<svg /, '<svg style="width:100%;height:auto;display:block" ')}</div>`; };
export const letter = (i: number) => String.fromCharCode(97 + i);

export function questionHtml(q: Q, n: number | string, figMax = 330) {
  const parts = q.stem.split("\n\n");
  const lead = parts.slice(0, -1).map((p) => `<p>${md(p).replace(/\n/g, "<br>")}</p>`).join("");
  let ask = parts[parts.length - 1];
  let tail = "";
  if (q.type === "TRUE_FALSE") { ask = ask.replace(/^True or false\?\s*/, ""); tail = `<div class="tf"><span class="box"></span> True <span class="box"></span> False</div>`; }
  if (q.type === "FILL_BLANK") ask = ask.replace(/^Fill in the blank:\s*/, "");
  if (q.type === "NUMERIC") tail = `<div class="line">Answer: <span class="blank long"></span></div>`;
  const kind = q.type === "TRUE_FALSE" ? "True or false?" : q.type === "FILL_BLANK" ? "Fill in the blank." : q.type === "NUMERIC" ? "Write the number." : "";
  let opts = "";
  if (q.type === "MCQ" && q.options.some((o) => o.trim())) {
    opts = q.optionFigures?.some(Boolean)
      ? `<div class="ofigs">${q.options.map((o, i) => `<div class="ofig"><span class="badge">${letter(i)}</span>${q.optionFigures![i] ? svg(q.optionFigures![i]!, 110) : md(o)}</div>`).join("")}</div>`
      : `<div class="opts ${q.options.some((o) => o.length > 34) ? "one" : ""}">${q.options.map((o, i) => `<div><span class="badge">${letter(i)}</span>${md(o)}</div>`).join("")}</div>`;
  }
  const fig = q.figure ? `<div class="figrow">${svg(q.figure, figMax)}</div>` : "";
  return `<section class="q"><div class="qhead"><span class="qn">${n}</span><span class="tags">${SK(q.skills[0])}</span></div>
  <div class="body">${lead}${fig}<p class="ask">${kind ? `<i>${kind}</i> ` : ""}${md(ask)}</p>${opts}${tail}</div></section>`;
}

export function answerText(q: Q) {
  if (q.type === "MCQ") return `${letter(Number(q.answer))}${q.options[Number(q.answer)] && !q.optionFigures?.some(Boolean) ? ` &nbsp;(${md(q.options[Number(q.answer)])})` : ""}`;
  if (q.type === "TRUE_FALSE") return q.answer ? "True" : "False";
  if (q.type === "FILL_BLANK") return esc(String((q.answer as string[])[0]));
  return esc(String(q.answer));
}

export function style(cls: number) {
  const kid = cls === 3;
  const head = kid ? "'Fredoka', 'Nunito', sans-serif" : "'Inter', sans-serif";
  const fonts = kid ? `<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet">` : `<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">`;
  const size = kid ? 13 : 12;
  return `<meta charset="utf-8">${fonts}<style>
  @page { size: A4; margin: 34pt 0 46pt 0; }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 0 50px; font-family: ${kid ? "'Nunito', sans-serif" : "'Inter', sans-serif"}; font-size: ${size}px; line-height: 1.45; color: #1f2340; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .band { display: flex; gap: 18px; align-items: center; background: #fff4e6; border-radius: 16px; padding: 16px 20px; margin-bottom: 12px; }
  .chip { background: #f97316; color: #fff; border-radius: 12px; min-width: 66px; padding: 8px 10px; text-align: center; font-family: ${head}; }
  .chip small { display: block; font-size: 10px; font-weight: 700; letter-spacing: .04em; } .chip b { display: block; font-size: 28px; line-height: 1.05; }
  .kicker { font-family: ${head}; font-weight: 700; font-size: 11px; letter-spacing: .14em; color: #4f46e5; text-transform: uppercase; }
  h1 { font-family: ${head}; font-weight: 800; font-size: 23px; margin: 2px 0 4px; color: #26237a; }
  .intro { margin: 0; color: #3b3f5c; font-size: ${size - 0.5}px; }
  .q { border: 1px solid #e2e8f0; border-radius: 12px; padding: 9px 14px 10px; margin: 0 0 9px; break-inside: avoid; background: #fff; }
  .qhead { display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px; }
  .qn { display: inline-flex; min-width: 26px; height: 26px; padding: 0 6px; border-radius: 13px; background: #4f46e5; color: #fff; font-weight: 800; align-items: center; justify-content: center; font-family: ${head}; }
  .tags { font-size: 10px; font-weight: 700; color: #64748b; letter-spacing: .02em; }
  p { margin: 0 0 4px; } .ask { font-weight: 600; margin-top: 4px; } .ask i { color: #f97316; font-style: normal; font-weight: 800; }
  .figrow { display: flex; justify-content: center; margin: 5px 0; } .fig { background: #fff; }
  .opts { display: grid; grid-template-columns: 1fr 1fr; gap: 3px 18px; margin-top: 4px; } .opts.one { grid-template-columns: 1fr; }
  .opts div, .ofig { display: flex; gap: 7px; align-items: flex-start; }
  .ofigs { display: flex; gap: 14px; flex-wrap: wrap; margin-top: 4px; }
  .badge { display: inline-flex; width: 18px; height: 18px; border-radius: 50%; background: #e0e7ff; color: #26237a; font-weight: 800; font-size: 11px; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; }
  .blank { display: inline-block; width: 70px; border-bottom: 1.5px solid #1f2340; margin: 0 3px; height: 1em; vertical-align: baseline; } .blank.long { width: 140px; }
  .tf, .line { margin-top: 5px; font-weight: 700; } .box { display: inline-block; width: 13px; height: 13px; border: 1.5px solid #1f2340; border-radius: 3px; margin: 0 4px -2px 14px; } .tf .box:first-child { margin-left: 0; }
  .emo { height: 1.15em; vertical-align: -0.2em; } code { font-family: ui-monospace, monospace; background: #f1f5f9; padding: 0 3px; border-radius: 3px; }
  table { border-collapse: collapse; width: 100%; font-size: ${size - 1.5}px; } th, td { border-bottom: 1px solid #e2e8f0; padding: 4px 6px; text-align: left; vertical-align: top; }
  th { color: #26237a; font-weight: 800; border-bottom: 2px solid #c7d2fe; } td.n { font-weight: 800; width: 26px; } td.a { font-weight: 800; color: #f97316; width: 74px; } tr { break-inside: avoid; }
  .sol { border: 1px solid #e2e8f0; border-radius: 12px; padding: 8px 14px 9px; margin: 0 0 8px; break-inside: avoid; }
  .shead { display: flex; gap: 10px; align-items: center; margin-bottom: 3px; } .shead b { color: #f97316; }
  .shead .qn { min-width: 26px; }
  .slabel { font-weight: 800; color: #26237a; margin-bottom: 2px; }
  .stext ul { margin: 2px 0 4px 18px; padding: 0; } .stext li { margin: 0 0 1px; }
  .stext p.hence { font-weight: 700; color: #26237a; }
  .comp { margin-top: 4px; font-size: 10px; color: #64748b; } .comp b { color: #64748b; }
  </style>`;
}

/** A worked solution as HTML: paragraphs, "- " lists and "[fig:n]" pictures, as in the CBSE Teacher Handbooks. */
export function workedHtml(text: string, figs: (Fig | null)[] | null) {
  return text.split(/\n\s*\n/).map((para) => {
    const lines = para.split("\n");
    const out: string[] = [];
    let list: string[] = [];
    const flush = () => { if (list.length) { out.push(`<ul>${list.map((l) => `<li>${md(l)}</li>`).join("")}</ul>`); list = []; } };
    for (const l of lines) {
      const f = /^\s*\[fig:(\d+)\]\s*$/.exec(l);
      if (f) { flush(); const fig = figs?.[Number(f[1]) - 1]; if (fig) out.push(`<div class="figrow">${svg(fig, 230)}</div>`); continue; }
      if (/^\s*- /.test(l)) { list.push(l.replace(/^\s*- /, "")); continue; }
      flush();
      if (l.trim()) out.push(`<p class="${/^Hence, /.test(l) ? "hence" : ""}">${md(l.trim())}</p>`);
    }
    flush();
    return out.join("");
  }).join("");
}

export type Key = { label: string; answer: string; solution: string; figs: (Fig | null)[] | null; skills: string[] };
export const SK = (k: string) => SKILLS[k as keyof typeof SKILLS] ?? k;
export function keyItem(k: Key) {
  return `<section class="sol"><div class="shead"><span class="qn">${esc(k.label)}</span><span><b>Answer:</b> ${k.answer}</span></div>
  <div class="stext"><div class="slabel">Solution:</div>${workedHtml(k.solution, k.figs)}<div class="comp"><b>CT competency:</b> ${k.skills.map(SK).join(", ")}</div></div></section>`;
}

export function keyHtml(cls: number, n: number, title: string, items: Key[], part: "CT" | "AI", kicker: string) {
  return `<!doctype html><html><head>${style(cls)}</head><body>
  <div class="band"><div class="chip"><small>${part === "AI" ? "AI CHAPTER" : "CHAPTER"}</small><b>${n}</b></div><div><div class="kicker">${kicker}</div><h1>${esc(title)}</h1></div></div>
  ${items.map(keyItem).join("")}</body></html>`;
}

