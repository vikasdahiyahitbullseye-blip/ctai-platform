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
def fit(im, b, cap):
    """Grow the box while drawing touches an edge (up to the caps); step back off frame lines that run along an edge."""
    g = im.convert("L"); px = g.load()
    x0, y0, x1, y1 = b
    def dark(ax0, ay0, ax1, ay1): return sum(1 for y in range(max(0, ay0), ay1) for x in range(max(0, ax0), ax1) if px[x, y] < 170)
    for _ in range(60):
        moved = False
        for side in ("top", "bottom", "left", "right"):
            if side == "top": n, L = dark(x0, y0, x1, y0 + 2), x1 - x0
            elif side == "bottom": n, L = dark(x0, y1 - 2, x1, y1), x1 - x0
            elif side == "left": n, L = dark(x0, y0, x0 + 2, y1), y1 - y0
            else: n, L = dark(x1 - 2, y0, x1, y1), y1 - y0
            if n < 3 or n > 1.2 * L: continue  # clean edge, or a frame line lying along it (kept whole)
            if side == "top" and y0 - 3 >= cap[1]: y0 -= 3; moved = True
            elif side == "bottom" and y1 + 3 <= cap[3]: y1 += 3; moved = True
            elif side == "left" and x0 - 3 >= cap[0]: x0 -= 3; moved = True
            elif side == "right" and x1 + 3 <= cap[2]: x1 += 3; moved = True
        if not moved: break
    pad = 4  # a little white space round the drawing
    return (max(cap[0], x0 - pad), max(cap[1], y0 - pad), min(cap[2], x1 + pad), min(cap[3], y1 + pad))

def crop(pi, y0, y1, x0, x1, name, whiten=(), cap=None):
    im = png(pi).copy()
    if whiten:
        from PIL import ImageDraw
        d = ImageDraw.Draw(im)
        src = im.copy()
        for (a0, b0, a1, b1) in whiten:
            # paint with the background round the text (cards can be tinted), not always white
            x0_, y0_, x1_, y1_ = int(a0 * SC), int(b0 * SC), int(a1 * SC), int(b1 * SC)
            ring = [src.getpixel((min(max(x, 0), src.size[0] - 1), min(max(y, 0), src.size[1] - 1))) for x, y in
                    [(x0_ - 3, y0_ - 3), (x1_ + 3, y0_ - 3), (x0_ - 3, y1_ + 3), (x1_ + 3, y1_ + 3), ((x0_ + x1_) // 2, y0_ - 3), ((x0_ + x1_) // 2, y1_ + 3)]]
            light = [c for c in ring if sum(c) > 600] or [(255, 255, 255)]
            tint = [c for c in light if sum(c) < 750]  # a tinted card (Thinking Spot) wins over the white page round it
            light = tint or light
            fill = max(set(light), key=light.count)
            d.rectangle([x0_, y0_, x1_, y1_], fill=fill)
    box = (int(x0 * SC), int(y0 * SC), int(x1 * SC), int(y1 * SC))
    if box[3] - box[1] < 12: return None
    g = im.crop(box).convert("L").point(lambda v: 255 if v < 200 else 0); bb = g.getbbox()
    if not bb or bb[3] - bb[1] < 14 or bb[2] - bb[0] < 20: return None
    # light borders and row shading (tables, cards) just outside the dark drawing belong to it too
    near = (max(0, bb[0] - 16), max(0, bb[1] - 16), min(box[2] - box[0], bb[2] + 16), min(box[3] - box[1], bb[3] + 16))
    lb = im.crop(box).crop(near).convert("L").point(lambda v: 255 if v < 236 else 0).getbbox()
    if lb: bb = (min(bb[0], near[0] + lb[0]), min(bb[1], near[1] + lb[1]), max(bb[2], near[0] + lb[2]), max(bb[3], near[1] + lb[3]))
    b0 = (box[0] + bb[0] - 2, box[1] + bb[1] - 2, box[0] + bb[2] + 2, box[1] + bb[3] + 2)
    cp = tuple(int(v * SC) for v in cap) if cap else (0, 0, im.size[0], im.size[1])
    fb = fit(im, b0, cp)
    c = im.crop(fb); c.save(f"{out}/img/{name}.png")
    return [f"{name}.png", c.size[0], c.size[1], [v / SC for v in fb]]

def is_badge(pi, w):
    """Answer badges are white letters on a coloured circle; letters in drawings or option text are dark on white."""
    im = png(pi); box = (int((w[0] - 2) * SC), int((w[1] - 1) * SC), int((w[2] + 2) * SC), int((w[3] + 1) * SC))
    px = list(im.crop(box).getdata())
    coloured = sum(1 for r, g, b_ in px if max(r, g, b_) - min(r, g, b_) > 60 and r + g + b_ < 640)
    return coloured > 0.3 * len(px)

SUP = str.maketrans("0123456789", "⁰¹²³⁴⁵⁶⁷⁸⁹")
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
        # The skill tag ("Pattern recognition") sits at the top right. Only words that actually spell a skill are
        # removed: an option on a row close to the question (e.g. the 4th option) must not be mistaken for it.
        skills = []
        clean = []
        tagwords = []
        for l in block:
            near = sorted([w for w in l["w"] if w[0] > 455 and l["y0"] < badge[3] + 24], key=lambda w: w[0])
            for n_ in (2, 1):  # the tag is the last one or two words at the right ("Pattern recognition", "Decomposition")
                tag = " ".join(w[4] for w in near[-n_:]).lower().strip()
                if len(near) >= n_ and tag in SKILLS: skills.append(SKILLS[tag]); tagwords += near[-n_:]; break
            ws = [w for w in l["w"] if not any(w is t for t in tagwords)]
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
            # a row with wide gaps between words (table header, labels across a drawing) is not part of the sentence
            # (only once the sentence before it has ended: inline blanks and icons inside a sentence also leave gaps)
            if len(l["w"]) >= 2 and max(l["w"][q + 1][0] - l["w"][q][2] for q in range(len(l["w"]) - 1)) > 14 and re.search(r"[.?!:)][\"”’']?\s*$", stem[-1]): break
            if (len(toks) == 1 and len(toks[0]) <= 2 and toks[0][:1].isalpha()) or (len(toks) >= 2 and all(len(x) == 1 for x in toks) and min(l["w"][q + 1][0] - l["w"][q][2] for q in range(len(l["w"]) - 1)) > 8): break
            if stem and re.search(r"[?:][\"”’']?\s*$", stem[-1]) and toks and sum(1 for x in toks if not re.search(r"[A-Za-z]{2,}", x)) >= 0.6 * len(toks): break
            if abs(dx) < 12 and not bullets: stem.append(t)
            elif (10 < dx < 50 or t[:1] in "•●–") and (t[:1] in "•●–" or len(l["w"]) < 2 or max(l["w"][q + 1][0] - l["w"][q][2] for q in range(len(l["w"]) - 1)) < 10):
                stem.append("\n- " + t.lstrip("•●-– ")); bullets = True
            elif abs(dx) < 12 and bullets: stem.append("\n" + t); bullets = False
            else: break
            last = l["y1"]; j += 1
        # options: single-letter badges a, b, c, d (in order); each word below belongs to the nearest badge above-left of it
        badges, expect = [], "a"
        for l in clean[j:]:
            for n_, w in enumerate(l["w"]):
                gap = w[0] - l["w"][n_ - 1][2] if n_ else 99
                if w[4] == expect and gap > 6 and is_badge(pi, w):
                    badges.append(w); expect = chr(ord(expect) + 1)
                    if expect == "e": break
            if expect == "e": break
        if len(badges) < 2: continue
        otop = min(b[1] for b in badges)
        bottom_y = bottom - 2 if bottom < p["h"] else p["h"] - 40
        for l in L:
            if otop < l["y0"] < bottom_y and re.search(r"(^|\s)(The Thinking Spot|Activity practice|Activity:|Questions|Answer key)\b", l["t"].strip()) and not re.match(r"^[a-d]\s", l["t"].strip()): bottom_y = l["y0"] - 4
        content = {b[4]: [] for b in badges}
        bset = set(id(b) for b in badges)
        for l in clean[j:]:
            for w in l["w"]:
                if any(w is b for b in badges) or w[1] < otop - 14: continue  # two-line option text starts above its badge
                if w[1] >= bottom_y: continue  # the next section's heading ("The Thinking Spot", "Questions") is not option text
                # candidate badges: on or above this word, left of it
                cands = [b for b in badges if b[1] - 14 <= w[1] and b[0] - 14 <= w[0]]  # 2-line option text starts above its badge
                if not cands: continue
                row_y = max(b[1] for b in cands)
                row = [b for b in cands if abs(b[1] - row_y) < 6]
                bb = max(row, key=lambda b: b[0])
                content[bb[4]].append(w)
        # Words above a badge count only as the first line of a 2-line option, i.e. when the option's text continues just
        # below them; otherwise they belong to the drawing above the options.
        for bb in badges:
            ws_ = content[bb[4]]
            content[bb[4]] = [w for w in ws_ if w[3] >= bb[1] - 1 or any(v is not w and w[3] - 1 <= v[1] <= w[3] + 8 for v in ws_)]
        letters = [b[4] for b in badges]
        def otext(ws):
            ws = sorted(ws, key=lambda w: (round(w[1] / 4), w[0]))
            # a number written over another number (a stacked fraction) becomes "a/b"
            if len(ws) == 2 and all(re.fullmatch(r"\d+", w[4]) for w in ws) and (ws[1][1] + ws[1][3]) / 2 - (ws[0][1] + ws[0][3]) / 2 > 8 and min(ws[0][2], ws[1][2]) > max(ws[0][0], ws[1][0]):
                return f"{ws[0][4]}/{ws[1][4]}"
            return " ".join(w[4] for w in ws).strip().replace(" ^", "^")
        otexts = [otext(content[x]) for x in letters]
        pic = any(not t for t in otexts)
        # options that are only several numbers are small grids or tables: show them as pictures
        if all(len(t.split()) >= 3 and all(re.fullmatch(r"[\d?]+", x) for x in t.split()) for t in otexts): pic = True
        if not pic:
            # drawn content in the option cards (besides the words) means the options are pictures
            im = png(pi).convert("L"); words = [w for l in clean[j:] for w in l["w"] if w[1] >= otop - 14 and w[1] < bottom_y]
            rowb = max(w[3] for w in words) + 4 if words else max(b[3] for b in badges) + 4
            right = max([w[2] for w in words] + [b[2] for b in badges]) + 30
            area = (int(min(b[2] for b in badges) * SC + 4), int((otop - 2) * SC), int(min(p["w"] - 50, right) * SC), int(min(bottom_y, rowb + 4) * SC))
            if area[3] > area[1] + 4:
                g = im.crop(area).point(lambda v: 255 if v < 160 else 0)
                from PIL import ImageDraw
                d = ImageDraw.Draw(g)
                for w in words + badges: d.rectangle([(w[0] - 2) * SC - area[0], (w[1] - 2) * SC - area[1], (w[2] + 2) * SC - area[0], (w[3] + 2) * SC - area[1]], fill=0)
                for b in badges: d.ellipse([(b[0] - 8) * SC - area[0], (b[1] - 6) * SC - area[1], (b[2] + 8) * SC - area[0], (b[3] + 6) * SC - area[1]], fill=0)
                gp = g.load(); W, H = g.size
                for y in range(H):
                    if sum(1 for x in range(W) if gp[x, y]) > 0.5 * W:
                        for x in range(W): gp[x, y] = 0
                for x in range(W):
                    if sum(1 for y in range(H) if gp[x, y]) > 0.5 * H:
                        for y in range(H): gp[x, y] = 0
                ink = g.histogram()[255]
                if os.environ.get("DBG") == f"{ch}-{label}": g.save(f"{out}/dbg_ink.png"); print("INK", ink, area)
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
        # (the number circle itself is painted out below, so the crop can start at the card's left edge)
        left = 45
        # paint out the stem's own words, the skill tag and the card's accent bar so only the figure remains
        wh = [(w[0] - 1, w[1] - 1, w[2] + 1, w[3]) for l in clean[:j] for w in l["w"]]
        wh += [(0, 0, min(stem_x - 16, min([b[0] for b in badges]) - 9), p["h"])]
        wh += [(t[0] - 1, t[1] - 1, t[2] + 1, t[3] + 1) for t in tagwords]
        wh += [(badge[0] - 14, badge[1] - 14, badge[2] + 12, min(badge[3] + 14, otop - 3))]
        if pic: fig = crop(pi, top_y, bottom_y, left, p["w"] - 45, name, wh, cap=(36, top_y - 30, p["w"] - 30, bottom_y))
        else: fig = crop(pi, top_y, otop - 10, left, p["w"] - 45, name, wh, cap=(36, top_y - 30, p["w"] - 30, otop - 5))
        stem_t = re.sub(r" *\n *", "\n", " ".join(stem)).replace(" ^", "^").strip()
        if fig and not pic:
            # A "figure" that is only words (a line of a sum, a sequence, bullet clues) is shown as text instead,
            # so it stays readable on a phone.
            fx0, fy0, fx1, fy1 = fig[3]
            inside = [w for w in p["words"] if fx0 <= (w[0] + w[2]) / 2 <= fx1 and fy0 <= (w[1] + w[3]) / 2 <= fy1 and not any(w is t for t in tagwords)]
            if inside:
                g = Image.open(f"{out}/img/{fig[0]}").convert("L")
                from PIL import ImageDraw
                d = ImageDraw.Draw(g)
                for w in inside: d.rectangle([(w[0] - fx0 - 1.5) * SC, (w[1] - fy0 - 1) * SC, (w[2] - fx0 + 1.5) * SC, (w[3] - fy0 + 1) * SC], fill=255)
                left_ink = sum(1 for v in g.getdata() if v < 170)
                if left_ink < 40:
                    tl = [re.sub(r"\^(\d+)", lambda m: m.group(1).translate(SUP), l["t"]) for l in lines_of(inside)]
                    tl = ["- " + x.lstrip("•● ") if x[:1] in "•●" else x for x in tl]
                    # a sentence wrapped onto the next line is joined back; sums, lists and table rows keep their lines
                    merged = [tl[0]]
                    for x in tl[1:]:
                        if re.search(r"[A-Za-z]{2,}$|\d$|,$", merged[-1]) and re.match(r"[a-z(]", x) and not x.startswith("- "): merged[-1] += " " + x
                        else: merged.append(x)
                    tl = merged
                    joiner = " " if not re.search(r"[.?!]$", stem_t) and (tl[0][:1].isdigit() or tl[0][:1].islower()) else "\n"
                    stem_t = stem_t + joiner + "\n".join(tl)
                    os.remove(f"{out}/img/{fig[0]}"); fig = None
        if fig: fig = fig[:3]
        items.append({"c": cls, "ch": ch, "label": label, "page": pi + 1, "stem": stem_t, "options": otexts, "pic": pic, "skills": skills, "fig": fig})
# attach answers
miss = 0
for it in items:
    k = keys.get(it["ch"], {}).get(it["label"])
    if k: it["answer"], it["solution"] = ord(k[0]) - 97, k[1]
    else: it["answer"] = None; miss += 1
json.dump(items, open(f"{out}/hb{cls}.json", "w"), indent=1, ensure_ascii=False)
from collections import Counter
print(f"class {cls}: {len(items)} questions, {sum(1 for i in items if i['fig'])} figures, {miss} without answer; chapters {dict(sorted(Counter(i['ch'] for i in items).items()))}; keys {sum(len(v) for v in keys.values())}")
