"""Extracts CT questions with CBSE's answers and solutions from a CBSE CT&AI Teacher Handbook.
Usage: python3 -I th_extract.py <TH.pdf> <class> <outdir>
Writes outdir/th<class>.json and figure crops outdir/img/cbse-<class>-ct<NN>-<k>.png
"""
import json, re, subprocess, sys, os, html
from PIL import Image

pdf, cls, out = sys.argv[1], int(sys.argv[2]), sys.argv[3]
os.makedirs(f"{out}/img", exist_ok=True)
DPI, SC = 150, 150 / 72

xml = subprocess.run(["pdftotext", "-bbox-layout", pdf, "-"], capture_output=True, text=True).stdout
pages = []
for pm in re.finditer(r'<page width="([\d.]+)" height="([\d.]+)">(.*?)</page>', xml, re.S):
    lines = []
    for lm in re.finditer(r'<line xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">(.*?)</line>', pm.group(3), re.S):
        words = re.findall(r'<word xMin="([\d.]+)" yMin="[\d.]+" xMax="([\d.]+)" yMax="[\d.]+">(.*?)</word>', lm.group(5))
        lines.append({"x0": float(lm.group(1)), "y0": float(lm.group(2)), "x1": float(lm.group(3)), "y1": float(lm.group(4)),
                      "t": " ".join(html.unescape(w[2]) for w in words), "words": [(float(a), float(b), html.unescape(c)) for a, b, c in words]})
    lines.sort(key=lambda l: (round(l["y0"] / 2), l["x0"]))
    pages.append({"w": float(pm.group(1)), "h": float(pm.group(2)), "lines": lines})

# Stream of (page, line) in reading order, with chapter boundaries for the CT part (stop at the AI part).
stream, chapter, seen_one, ct_titles = [], None, 0, {}
for pi, p in enumerate(pages):
    for l in p["lines"]:
        t = l["t"].strip()
        m = re.match(r"^Chapter (\d+):\s*(.*)$", t)
        if m and l["x0"] > 40:
            if int(m.group(1)) == 1:
                seen_one += 1
            if seen_one >= 2:
                break
            chapter = int(m.group(1)); ct_titles[chapter] = m.group(2); continue
        if chapter is None or re.match(r"^Page \d+$", t):
            continue
        stream.append((pi, chapter, l))
    if seen_one >= 2:
        break

def is_sep(t): return bool(re.match(r"^_{8,}$", t.replace(" ", "")))
qmin = min((l["x0"] for _, _, l in stream if re.match(r"^\d{1,2}\.\s", l["t"])), default=38)

blocks, cur = [], None
for pi, ch, l in stream:
    t = l["t"].strip()
    m = re.match(r"^(\d{1,2})\.\s+(.*)$", t)
    starts_q = m and l["x0"] < qmin + 6
    if starts_q or is_sep(t) or (cur and cur["ch"] != ch):
        if cur: blocks.append(cur)
        cur = None
        if is_sep(t): continue
    if starts_q:
        ll = dict(l); ll["t"] = m.group(2)
        if len(l["words"]) > 1: ll["x0"] = l["words"][1][0]
        cur = {"ch": ch, "num": int(m.group(1)), "lines": [(pi, ll)]}
    elif cur:
        if re.match(r"^Answer\s*:", t): cur["answered"] = True; cur["ans_x"] = l["x0"]
        if re.match(r"^CT Competenc", t): cur["comp"] = True
        elif (cur.get("comp") and len(t) > 35) or (cur.get("answered") and (l["x0"] < qmin + 4 or l["x0"] > cur["ans_x"] + 25) and len(t) > 25 and not re.match(r"^\(?[a-d]\)", t) and not re.match(r"^(Answer|Solution|Thus|Hence|So)\b", t)):
            # A long line after the short competency list starts the next (unnumbered) block, e.g. the Thinking Spot.
            blocks.append(cur); cur = {"ch": ch, "num": None, "lines": [(pi, l)]}; continue
        cur["lines"].append((pi, l))
    elif len(t) > 25:
        cur = {"ch": ch, "num": None, "lines": [(pi, l)]}  # unnumbered block (Thinking Spot or activity text)
if cur: blocks.append(cur)

render = {}
def page_png(pi):
    if pi not in render:
        base = f"{out}/_th{cls}"
        subprocess.run(["pdftoppm", "-r", str(DPI), "-png", "-f", str(pi + 1), "-l", str(pi + 1), "-singlefile", pdf, base], check=True)
        render.clear(); render[pi] = Image.open(base + ".png").convert("RGB")
    return render[pi]

def crop_band(pi, y0, y1, name, xr=None):
    im = page_png(pi)
    x0, x1 = xr or (30, pages[pi]["w"] - 30)
    box = (int(x0 * SC), int(y0 * SC), int(x1 * SC), int(y1 * SC))
    if box[3] - box[1] < 10: return None
    g = im.crop(box).convert("L").point(lambda v: 255 if v < 200 else 0)
    bb = g.getbbox()
    if not bb or bb[3] - bb[1] < 12: return None
    pad = 6
    c = im.crop((box[0] + bb[0] - pad, box[1] + bb[1] - pad, box[0] + bb[2] + pad, box[1] + bb[3] + pad))
    c.save(f"{out}/img/{name}.png")
    return {"src": f"{name}.png", "w": c.size[0], "h": c.size[1]}

OPT = re.compile(r"^\(?([a-d])\)\s*")
items, pcount, seqn = [], {}, {}
for b in blocks:
    texts = [l["t"].strip() for _, l in b["lines"]]
    ai = next((i for i, t in enumerate(texts) if re.match(r"^Answer\s*:", t)), None)
    if ai is None: continue
    if b["num"] is None:
        pcount[b["ch"]] = pcount.get(b["ch"], 0) + 1
        num = "P" if pcount[b["ch"]] == 1 else f"P{pcount[b['ch']]}"
    else:
        num = b["num"]
    seqn[b["ch"]] = seqn.get(b["ch"], 0) + 1
    seq = seqn[b["ch"]]
    lines = b["lines"]
    pi0 = lines[0][0]
    first = lines[0][1]; margin = first["x0"]
    # stem: consecutive lines at the margin
    k, stem, last_y = 1, [first["t"]], first["y1"]
    while k < ai:
        pi, l = lines[k]
        if pi != pi0 or OPT.match(l["t"].strip()) or abs(l["x0"] - margin) > 30 or l["y0"] - last_y > 8 or l["y1"] - l["y0"] > 16 or re.match(r"^(Answer|Solution)\s*:", l["t"].strip()): break
        stem.append(l["t"].strip()); last_y = l["y1"]; k += 1
    # clue lines (bullets/dashes) at the margin before options
    clues_end = last_y
    j = k
    while j < ai:
        pi, l = lines[j]; t = l["t"].strip()
        if pi == pi0 and abs(l["x0"] - margin) <= 30 and not OPT.match(t) and not re.match(r"^(Answer|Solution)\s*:", t) and l["y0"] - clues_end < 22 and (t[:1] in "-•–●" or len(t) > 30):
            stem.append(t); clues_end = l["y1"]; j += 1
        else: break
    opt_lines = [(pi, l) for pi, l in lines[j:ai] if OPT.match(l["t"].strip())]
    options = []
    for _, l in opt_lines:
        parts = re.split(r"(?:^|\s)\(?([a-d])\)\s*", " " + l["t"].strip())
        for x in range(1, len(parts), 2): options.append((parts[x], parts[x + 1].strip()))
    letters = [o[0] for o in options]
    pic = bool(options) and all(not o[1] for o in options)
    if options and letters != list("abcd")[:len(letters)]: options, pic = [], False
    ans_line = texts[ai]; ans = re.sub(r"^Answer\s*:\s*", "", ans_line).strip()
    # answer may be on the next line
    if not ans and ai + 1 < len(texts): ans = texts[ai + 1]
    # solution and competency
    sol, comp, mode = [], [], None
    for t in texts[ai + 1:]:
        if re.match(r"^Solution\s*:", t): mode = "sol"; rest = re.sub(r"^Solution\s*:\s*", "", t); sol += [rest] if rest else []; continue
        if re.match(r"^CT Competenc", t): mode = "comp"; continue
        if mode == "sol": sol.append(t)
        elif mode == "comp" and len(t) < 40: comp.append(t)
        elif mode == "comp": mode = None
    # figure band: after stem/clues, before options (text options) or through the option row (picture options)
    a_y = next((l["y0"] for pi, l in lines[ai:ai + 1]), None)
    same_page_opts = [l for pi, l in opt_lines if pi == pi0]
    if pic and same_page_opts: y1 = max(l["y1"] for l in same_page_opts) + 2
    elif same_page_opts: y1 = min(l["y0"] for l in same_page_opts) - 1
    else: y1 = a_y - 1 if lines[ai][0] == pi0 else pages[pi0]["h"] - 50
    # inside the Thinking Spot box, keep the crop within the box (its borders are not part of the figure)
    xr = (margin - 22, max(l["x1"] for p_, l in lines if p_ == pi0) + 22) if b["num"] is None else None
    fig = crop_band(pi0, clues_end + 1, y1, f"cbse-{cls}-ct{b['ch']:02d}-{seq:02d}", xr)
    items.append({"cls": cls, "chapter": b["ch"], "chapterTitle": ct_titles.get(b["ch"]), "num": num, "seq": seq, "page": pi0 + 1,
                  "stem": " ".join(stem), "options": [o[1] or f"({o[0]})" for o in options], "picOptions": pic,
                  "answer": ans, "solution": "\n".join(sol).strip(), "competencies": comp, "figure": fig})
json.dump(items, open(f"{out}/th{cls}.json", "w"), indent=1, ensure_ascii=False)
from collections import Counter
print(f"class {cls}: {len(items)} answered items, {sum(1 for i in items if i['options'])} MCQ, {sum(1 for i in items if i['figure'])} with figures")
print(dict(Counter(i["chapter"] for i in items)))
