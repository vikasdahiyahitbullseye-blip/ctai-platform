# Crops the worked-solution pictures (between "Solution:" and "CT Competency") from a CBSE Teacher Handbook.
# Usage: python3 -I sol_extract.py <TH.pdf> <class> <outdir>  -> outdir/sol<class>.json and outdir/simg/*.png
# The question-parsing part is shared with th_extract.py.
"""Crops the solution pictures; sol_import.py then drops the crops listed in its BAD set and imports the rest."""
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


from PIL import ImageDraw
def sol_figs(lines, si, ci, name, xr):
    """Crop the pictures that sit inside the solution (between 'Solution:' and 'CT Competency')."""
    figs_out, k = [], 0
    seg = lines[si:ci]
    pages_in = []
    for pi, l in seg:
        if pi not in pages_in: pages_in.append(pi)
    for pi in pages_in:
        pl = [l for p_, l in seg if p_ == pi]
        y0 = pl[0]["y1"] if pi == seg[0][0] else 45
        nxt = [l for p_, l in lines[ci:ci+1] if p_ == pi]
        last = max(l["y1"] for l in pl)
        # end at the competency line when it is on this page, else at the last solution line (plus a picture after it, up to the next text of the block on the page)
        later = [l["y0"] for p_, l in lines[ci:] if p_ == pi]
        y1 = nxt[0]["y0"] - 1 if nxt else (min(later) - 1 if later else last + 2)
        y1 = min(y1, pages[pi]["h"] - 70)
        if y1 - y0 < 25: continue
        im = page_png(pi)
        x0, x1 = xr or (30, pages[pi]["w"] - 30)
        box = (int(x0 * SC), int(y0 * SC), int(x1 * SC), int(y1 * SC))
        band = im.crop(box).copy()
        d = ImageDraw.Draw(band)
        for l in pages[pi]["lines"]:
            if l["y1"] > y0 and l["y0"] < y1:
                d.rectangle([(l["x0"] - x0) * SC - 2, (l["y0"] - y0) * SC - 2, (l["x1"] - x0) * SC + 2, (l["y1"] - y0) * SC + 2], fill=(255, 255, 255))
        g = band.convert("L").point(lambda v: 255 if v < 215 else 0)
        bb = g.getbbox()
        if not bb: continue
        if bb[3] - bb[1] < 35 * SC or bb[2] - bb[0] < 60 * SC: continue
        # ink density: skip thin rules/borders
        cnt = sum(1 for v in g.crop(bb).get_flattened_data() if v)
        if cnt < 0.01 * (bb[2] - bb[0]) * (bb[3] - bb[1]) or cnt < 400: continue
        # include text labels overlapping the graphic
        gx0, gy0, gx1, gy1 = bb
        for _ in range(2):
            for l in pages[pi]["lines"]:
                lx0, ly0, lx1, ly1 = ((l["x0"] - x0) * SC, (l["y0"] - y0) * SC, (l["x1"] - x0) * SC, (l["y1"] - y0) * SC)
                if ly1 <= 0 or ly0 >= box[3] - box[1]: continue
                cy = (ly0 + ly1) / 2
                if gy0 <= cy <= gy1 and lx1 > gx0 and lx0 < gx1:
                    gx0, gx1 = min(gx0, lx0), max(gx1, lx1)
                elif ly1 > gy0 - 4 and ly0 < gy1 + 4 and lx1 > gx0 - 10 and lx0 < gx1 + 10 and (lx1 - lx0) < (gx1 - gx0) * 0.6 and (lx1 - lx0) < 160 * SC:
                    gx0, gy0, gx1, gy1 = min(gx0, lx0), min(gy0, ly0), max(gx1, lx1), max(gy1, ly1)
        ga = (bb[2] - bb[0]) * (bb[3] - bb[1])
        if ga < 0.25 * (gx1 - gx0) * (gy1 - gy0): continue
        if any("Thinking Spot" in l["t"] and (l["y0"] - y0) * SC < gy1 and (l["y1"] - y0) * SC > gy0 for l in pages[pi]["lines"]): continue
        pad = 8
        c = im.crop((int(box[0] + max(0, gx0 - pad)), int(box[1] + max(0, gy0 - pad)), int(min(box[2], box[0] + gx1 + pad)), int(min(box[3], box[1] + gy1 + pad))))
        k += 1
        fn = f"{name}-s{k}"
        c.save(f"{out}/simg/{fn}.png")
        figs_out.append({"src": f"{fn}.png", "w": c.size[0], "h": c.size[1]})
    return figs_out

os.makedirs(f"{out}/simg", exist_ok=True)
res, pcount, seqn = [], {}, {}
for b in blocks:
    texts = [l["t"].strip() for _, l in b["lines"]]
    ai = next((i for i, t in enumerate(texts) if re.match(r"^Answer\s*:", t)), None)
    if ai is None: continue
    if b["num"] is None:
        pcount[b["ch"]] = pcount.get(b["ch"], 0) + 1
        num = "P" if pcount[b["ch"]] == 1 else f"P{pcount[b['ch']]}"
    else: num = b["num"]
    seqn[b["ch"]] = seqn.get(b["ch"], 0) + 1
    seq = seqn[b["ch"]]
    lines = b["lines"]
    si = next((i for i in range(ai, len(texts)) if re.match(r"^Solution\s*:", texts[i])), ai)
    ci = next((i for i in range(si, len(texts)) if re.match(r"^CT Competenc", texts[i])), len(texts))
    margin = lines[0][1]["x0"]
    xr = (margin - 10, max(l["x1"] for p_, l in lines) + 10) if b["num"] is None else None
    figs = sol_figs(lines, si, ci, f"cbse-{cls}-ct{b['ch']:02d}-{seq:02d}", xr)
    res.append({"c": cls, "ch": b["ch"], "seq": seq, "num": num, "stem": texts[0][:60], "figs": figs})
json.dump(res, open(f"{out}/sol{cls}.json", "w"), indent=1, ensure_ascii=False)
print(cls, len(res), "items,", sum(1 for r in res if r["figs"]), "with solution pictures,", sum(len(r["figs"]) for r in res), "pictures")
