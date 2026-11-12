"""Extracts questions + answer keys from a 'Think, Play & Solve' help book (Classes 3-8).
Usage: python3 -I hb_extract.py <pdf> <class> <outdir>"""
import json, re, subprocess, sys, os, html
from PIL import Image
pdf, cls, out = sys.argv[1], int(sys.argv[2]), sys.argv[3]
os.makedirs(f"{out}/img", exist_ok=True)
DPI, SC = 150, 150 / 72
SKILLS = {"pattern recognition": "PATTERN", "abstract thinking": "ABSTRACT", "decomposition": "DECOMPOSITION", "algorithmic thinking": "ALGORITHMIC"}
xml = subprocess.run(["pdftotext", "-bbox-layout", pdf, "-"], capture_output=True, text=True).stdout
pages = []
for pm in re.finditer(r'<page width="([\d.]+)" height="([\d.]+)">(.*?)</page>', xml, re.S):
    ws = [(float(a), float(b), float(c), float(d), html.unescape(t)) for a, b, c, d, t in re.findall(r'<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">(.*?)</word>', pm.group(3))]
    pages.append({"w": float(pm.group(1)), "h": float(pm.group(2)), "words": ws})
def lines_of(ws):
    """Group words into visual lines: words that overlap vertically share a line.
    Smaller raised words (exponents) are written as ^n."""
    ws = sorted(ws, key=lambda w: (w[1] + w[3]) / 2); lines = []
    for w in ws:
        hit = None
        for l in lines[-3:]:
            ov = min(l["y1"], w[3]) - max(l["y0"], w[1])
            if ov > 0.45 * min(l["y1"] - l["y0"], w[3] - w[1]): hit = l; break
        if hit: hit["w"].append(w); hit["y0"] = min(hit["y0"], w[1]); hit["y1"] = max(hit["y1"], w[3])
        else: lines.append({"y0": w[1], "y1": w[3], "w": [w]})
    for l in lines:
        l["w"].sort(key=lambda w: w[0]); l["x0"] = l["w"][0][0]
        hs = sorted(w[3] - w[1] for w in l["w"]); med = hs[len(hs) // 2]; base = max(w[3] for w in l["w"])
        for n_, w in enumerate(list(l["w"])):
            if (w[3] - w[1]) < 0.9 * med and w[3] < base - 2.5 and n_ > 0 and w[0] - l["w"][n_ - 1][2] < 1.5:
                l["w"][n_] = (w[0], w[1], w[2], w[3], "^" + w[4])
        l["t"] = " ".join(w[4] for w in l["w"]).replace(" ^", "^")
    lines.sort(key=lambda l: l["y0"])
    return lines
ptext = [subprocess.run(["pdftotext", "-layout", "-f", str(i + 1), "-l", str(i + 1), pdf, "-"], capture_output=True, text=True).stdout for i in range(len(pages))]

# chapter of each page, answer keys
chap, cur = [None] * len(pages), None
keys, cur_key, prev_key_page = {}, None, False
for i, t in enumerate(ptext):
    head = "\n".join(t.split("\n")[:14])
    m = re.search(r"Answer key: Chapter (\d+)", t)
    cont = prev_key_page and not ("Chapter" in head and re.search(r"\d+ questions", head)) and re.search(r"(?m)^\s{0,4}(\d{1,2}|[AP]\d{0,2})\s+[a-d]\s+\S", t)
    prev_key_page = bool(m or cont)
    if m or cont:
        if m: cur_key = int(m.group(1))
        last = None
        for line in t.split("\n"):
            r = re.match(r"^\s{0,4}(\d{1,2}|[AP]\d{0,2})\s+([a-d])\s+(\S.*)$", line)
            if r:
                last = r.group(1); keys.setdefault(cur_key, {})[last] = [r.group(2), r.group(3).strip()]
            elif last and re.match(r"^\s{10,}\S", line):
                keys[cur_key][last][1] += " " + line.strip()
        chap[i] = None; cur = None; continue
    if "Chapter" in head and re.search(r"\d+ questions", head):
        lines = head.split("\n"); idx = next(k for k, l in enumerate(lines) if "Chapter" in l)
        mm = re.search(r"Chapter\s+(\d{1,2})\b", lines[idx]) or next((x for l in lines[idx + 1:idx + 3] if (x := re.match(r"^\s*(\d{1,2})\s", l))), None)
        cur = int(mm.group(1))
    chap[i] = cur

render = {}
def png(pi):
    if pi not in render:
        b = f"{out}/_p{cls}"; subprocess.run(["pdftoppm", "-r", str(DPI), "-png", "-f", str(pi + 1), "-l", str(pi + 1), "-singlefile", pdf, b], check=True)
        render.clear(); render[pi] = Image.open(b + ".png").convert("RGB")
    return render[pi]
def crop(pi, y0, y1, x0, x1, name, whiten=()):
    im = png(pi).copy()
    if whiten:
        from PIL import ImageDraw
        d = ImageDraw.Draw(im)
        for (a0, b0, a1, b1) in whiten: d.rectangle([a0 * SC, b0 * SC, a1 * SC, b1 * SC], fill="white")
    box = (int(x0 * SC), int(y0 * SC), int(x1 * SC), int(y1 * SC))
    if box[3] - box[1] < 12: return None
    g = im.crop(box).convert("L").point(lambda v: 255 if v < 200 else 0); bb = g.getbbox()
    if not bb or bb[3] - bb[1] < 14 or bb[2] - bb[0] < 20: return None
    c = im.crop((box[0] + bb[0] - 6, box[1] + bb[1] - 6, box[0] + bb[2] + 6, box[1] + bb[3] + 6)); c.save(f"{out}/img/{name}.png")
    return [f"{name}.png", c.size[0], c.size[1]]

LABEL = re.compile(r"^(\d{1,2}|A\d{1,2}|P\d?)$")
items = []
for pi, p in enumerate(pages):
    ch = chap[pi]
    if ch is None: continue
    L = lines_of(p["words"])
    # question starts: a badge word at the far left
    starts = [k for k, l in enumerate(L) if LABEL.match(l["w"][0][4]) and l["w"][0][0] < 62 and (len(l["w"]) == 1 or l["w"][1][0] > 64)]
    for si, k in enumerate(starts):
        label = L[k]["w"][0][4]
        badge = L[k]["w"][0]
        top = badge[1] - 6
        bottom = (L[starts[si + 1]]["w"][0][1] - 6) if si + 1 < len(starts) else p["h"]
        block = []
        for l in L:
            if not (top <= l["y0"] < bottom): continue
            ws = [w for w in l["w"] if w is not badge]
            if ws: block.append({**l, "w": ws, "x0": ws[0][0], "t": " ".join(w[4] for w in ws)})
        if not block: continue
        # skill tag (right side) and footer lines removed
        skills = []
        clean = []
        for l in block:
            ws = [w for w in l["w"] if not (w[0] > 455 and l["y0"] < badge[3] + 24)]
            tag = " ".join(w[4] for w in l["w"] if w[0] > 455 and l["y0"] < badge[3] + 24).lower().strip()
            if tag in SKILLS: skills.append(SKILLS[tag])
            if l["y0"] > p["h"] - 40: continue
            if ws: clean.append({**l, "w": ws, "x0": ws[0][0], "t": " ".join(w[4] for w in ws)})
        if not clean: continue
        stem_x = clean[0]["x0"]; stem, last = [clean[0]["t"]], clean[0]["y1"]; j = 1
        h0 = clean[0]["y1"] - clean[0]["y0"]
        bullets = False
        while j < len(clean):
            l = clean[j]; t = l["t"].strip(); dx = l["x0"] - stem_x; gap = l["y0"] - last
            if any(w[4] == "a" for w in l["w"][:1]) and len(l["w"]) <= 6 and gap > 6: break  # option row
            if (l["y1"] - l["y0"]) > h0 * 1.4 or gap > 10: break
            toks = t.split()
            if stem and re.search(r"[?:][\"”’']?\s*$", stem[-1]) and toks and sum(1 for x in toks if not re.search(r"[A-Za-z]{2,}", x)) >= 0.6 * len(toks): break
            if abs(dx) < 12 and not bullets: stem.append(t)
            elif 10 < dx < 50 or t[:1] in "•●–": stem.append("\n- " + t.lstrip("•●-– ")); bullets = True
            elif abs(dx) < 12 and bullets: stem.append("\n" + t); bullets = False
            else: break
            last = l["y1"]; j += 1
        # options: single-letter badges a, b, c, d (in order); each word below belongs to the nearest badge above-left of it
        badges, expect = [], "a"
        for l in clean[j:]:
            for n_, w in enumerate(l["w"]):
                gap = w[0] - l["w"][n_ - 1][2] if n_ else 99
                if w[4] == expect and gap > 6:
                    badges.append(w); expect = chr(ord(expect) + 1)
                    if expect == "e": break
            if expect == "e": break
        if len(badges) < 2: continue
        otop = min(b[1] for b in badges)
        bottom_y = bottom - 2 if bottom < p["h"] else p["h"] - 40
        for l in L:
            if otop < l["y0"] < bottom_y and re.match(r"^(The Thinking Spot|Activity practice|Activity:|Questions|Answer key)", l["t"].strip()): bottom_y = l["y0"] - 4
        content = {b[4]: [] for b in badges}
        bset = set(id(b) for b in badges)
        for l in clean[j:]:
            for w in l["w"]:
                if any(w is b for b in badges) or w[1] < otop - 4: continue
                # candidate badges: on or above this word, left of it
                cands = [b for b in badges if b[1] - 6 <= w[1] and b[0] - 14 <= w[0]]
                if not cands: continue
                row_y = max(b[1] for b in cands)
                row = [b for b in cands if abs(b[1] - row_y) < 6]
                bb = max(row, key=lambda b: b[0])
                content[bb[4]].append(w)
        letters = [b[4] for b in badges]
        otexts = [" ".join(w[4] for w in sorted(content[x], key=lambda w: (round(w[1] / 4), w[0]))).strip().replace(" ^", "^") for x in letters]
        pic = any(not t for t in otexts)
        if not pic:
            # drawn content in the option cards (besides the words) means the options are pictures
            im = png(pi).convert("L"); words = [w for b in content.values() for w in b]
            rowb = max(w[3] for w in words) + 4 if words else max(b[3] for b in badges) + 4
            right = max([w[2] for w in words] + [b[2] for b in badges]) + 30
            area = (int(min(b[2] for b in badges) * SC + 4), int((otop - 2) * SC), int(min(p["w"] - 50, right) * SC), int(min(bottom_y, rowb + 4) * SC))
            if area[3] > area[1] + 4:
                g = im.crop(area).point(lambda v: 255 if v < 160 else 0)
                from PIL import ImageDraw
                d = ImageDraw.Draw(g)
                for w in words + badges: d.rectangle([(w[0] - 2) * SC - area[0], (w[1] - 2) * SC - area[1], (w[2] + 2) * SC - area[0], (w[3] + 2) * SC - area[1]], fill=0)
                for b in badges: d.ellipse([(b[0] - 8) * SC - area[0], (b[1] - 6) * SC - area[1], (b[2] + 8) * SC - area[0], (b[3] + 6) * SC - area[1]], fill=0)
                ink = g.histogram()[255]
                if ink > 400: pic = True
        if pic: otexts = ["" for _ in otexts]
        if pic:
            bottom_y = min(bottom_y, max(b[3] for b in badges) + 130)
        x1 = max(w[2] for l in clean for w in l["w"])
        if os.environ.get("DBG") == f"{ch}-{label}": print("DBG", last, otop, pic, otexts, [(round(l["x0"]), round(l["y0"]), round(l["y1"]), l["t"][:30]) for l in clean])
        name = f"hb-{cls}-ch{ch:02d}-{label}"
        nxt_y = clean[j]["y0"] - 3 if j < len(clean) else last + 1
        top_y = max(last - 5, min(last + 1, nxt_y))
        # start the crop just right of the question's number circle so it is never included
        left = max(45, badge[2] + 3) if top_y < badge[3] + 4 else 45
        # paint out the stem's own words, the skill tag and the card's accent bar so only the figure remains
        wh = [(w[0] - 1, w[1] - 1, w[2] + 1, w[3]) for l in clean[:j] for w in l["w"]]
        wh += [(0, 0, min(stem_x - 16, min([b[0] for b in badges]) - 9), p["h"])]
        wh += [(455, badge[1] - 4, p["w"], badge[3] + 24), (badge[0] - 14, badge[1] - 14, badge[2] + 12, badge[3] + 14)]
        if pic: fig = crop(pi, top_y, bottom_y, left, p["w"] - 45, name, wh)
        else: fig = crop(pi, top_y, otop - 10, left, p["w"] - 45, name, wh)
        items.append({"c": cls, "ch": ch, "label": label, "page": pi + 1, "stem": re.sub(r" *\n *", "\n", " ".join(stem)).replace(" ^", "^").strip(), "options": otexts, "pic": pic, "skills": skills, "fig": fig})
# attach answers
miss = 0
for it in items:
    k = keys.get(it["ch"], {}).get(it["label"])
    if k: it["answer"], it["solution"] = ord(k[0]) - 97, k[1]
    else: it["answer"] = None; miss += 1
json.dump(items, open(f"{out}/hb{cls}.json", "w"), indent=1, ensure_ascii=False)
from collections import Counter
print(f"class {cls}: {len(items)} questions, {sum(1 for i in items if i['fig'])} figures, {miss} without answer; chapters {dict(sorted(Counter(i['ch'] for i in items).items()))}; keys {sum(len(v) for v in keys.values())}")
