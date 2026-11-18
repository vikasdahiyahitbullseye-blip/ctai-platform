"""Repairs help-book figures that are clipped in the books themselves (a drawing runs under the answer cards or the
question text, so part of it never prints). The hidden labels are still in the PDF text, so they are drawn back in.
Usage (after hb_extract.py): python3 -I hb_fix_clipped.py <dir with HB3.pdf..HB8.pdf> <out dir>"""
import json, os, re, subprocess, sys, html
from PIL import Image, ImageDraw, ImageFont

src, out = sys.argv[1], sys.argv[2]
DPI = 150; SC = DPI / 72
FONT_BOLD = next((f for f in ["/usr/share/fonts/opentype/inter/Inter-Bold.otf", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"] if os.path.exists(f)))
FONT_REG = next((f for f in ["/usr/share/fonts/opentype/inter/Inter-SemiBold.otf", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"] if os.path.exists(f)))

def page(book, n):
    b = f"{out}/_fix"; subprocess.run(["pdftoppm", "-r", str(DPI), "-png", "-f", str(n), "-l", str(n), "-singlefile", f"{src}/{book}", b], check=True)
    return Image.open(b + ".png").convert("RGB")

def words(book, n):
    xml = subprocess.run(["pdftotext", "-bbox-layout", "-f", str(n), "-l", str(n), f"{src}/{book}", "-"], capture_output=True, text=True).stdout
    return [(float(a), float(b), float(c), float(d), html.unescape(t)) for a, b, c, d, t in re.findall(r'<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">(.*?)</word>', xml)]

px = lambda v: v * SC

def text_at(d, x, y, s, size, fill, anchor="la", bold=True):
    f = ImageFont.truetype(FONT_BOLD if bold else FONT_REG, int(px(size)))
    d.text((px(x), px(y)), s, font=f, fill=fill, anchor=anchor)

def circle_label(d, cx, cy, r, s, fill, ink):
    d.ellipse([px(cx - r), px(cy - r), px(cx + r), px(cy + r)], fill=fill)
    text_at(d, cx, cy, s, 10.5, ink, anchor="mm")

def darkest(im, box):
    reg = im.crop(tuple(int(px(v)) for v in box)); return min(reg.get_flattened_data() if hasattr(reg, 'get_flattened_data') else reg.getdata(), key=sum)

def save(im, box, name):
    c = im.crop(tuple(int(px(v)) for v in box))
    g = c.convert("L").point(lambda v: 255 if v < 245 else 0); bb = g.getbbox()
    c = c.crop((max(0, bb[0] - 8), max(0, bb[1] - 8), min(c.size[0], bb[2] + 8), min(c.size[1], bb[3] + 8)))
    c.save(f"{out}/img/{name}.png"); return [f"{name}.png", c.size[0], c.size[1]]

fixed = {}
# Class 6, chapter 3, Q9 and Q10: the lowest numbered dots run under the answer cards.
im = page("HB6.pdf", 19); d = ImageDraw.Draw(im)
navy = darkest(im, (115, 238, 130, 252))
for (name, box, white_from, dots) in [("hb-6-ch03-9", (62, 218, 230, 352), 338.5, [(122.5, 334.6, "4")]),
                                       ("hb-6-ch03-10", (62, 413, 230, 548), 534.5, [(152.5, 531.0, "7")])]:
    d.rectangle([px(box[0]), px(white_from), px(box[2]), px(box[3])], fill="white")
    for cx, cy, s in dots: circle_label(d, cx, cy, 9.5, s, navy, "white")
    fixed[name] = save(im, box, name)

# Class 4, chapter 3, Q11 and Q12: the last step's number runs under the answer cards.
im = page("HB4.pdf", 21); d = ImageDraw.Draw(im)
ink = darkest(im, (86, 112, 97, 131))
def baseline(im, box):
    """y (points) of the longest horizontal dark line in the box: the floor the steps stand on"""
    g = im.crop(tuple(int(px(v)) for v in box)).convert("L"); gp = g.load(); best = (0, 0)
    for y in range(g.size[1]):
        run = longest = 0
        for x in range(g.size[0]):
            run = run + 1 if gp[x, y] < 120 else 0; longest = max(longest, run)
        best = max(best, (longest, y))
    return box[1] + best[1] / SC
for (name, box, label, lx) in [("hb-4-ch03-11", (62, 74, 330, 176), "2", 298.5), ("hb-4-ch03-12", (62, 280, 372, 382), "18", 299.0)]:
    base = baseline(im, box) + 0.6
    box = (box[0], box[1], box[2], box[3] + 14)
    d.rectangle([px(box[0]), px(base + 7.5), px(box[2]), px(box[3])], fill="white")  # the cards' top edge
    d.rectangle([px(lx - 12), px(base + 0.8), px(lx + 12), px(box[3])], fill="white")  # under the last step
    text_at(d, lx, base + 0.5, label, 12, ink, anchor="mt")
    fixed[name] = save(im, box, name)

# Class 7, chapter 5, Q19 and Q20: the top corner's letter is hidden under the question text.
W = words("HB7.pdf", 34); im = page("HB7.pdf", 34); d = ImageDraw.Draw(im)
for (name, ytop_word, ybot, letter) in [("hb-7-ch05-19", 40, 224, "A"), ("hb-7-ch05-20", 265, 463, "K")]:
    last = max(w[3] for w in W if ytop_word <= w[1] < ytop_word + 60 and 66 <= w[0] <= 76)  # bottom of the question text (its lines start at the left margin)
    box = (50, last + 1, 545, ybot)
    g = im.crop(tuple(int(px(v)) for v in box)).convert("L"); gp = g.load()
    top = next((x, y) for y in range(g.size[1]) for x in range(g.size[0]) if gp[x, y] < 120)  # top of the letter's remains
    xs = [x for x in range(max(0, top[0] - 20), min(g.size[0], top[0] + 20)) if gp[x, top[1]] < 120]
    cx = (min(xs) + max(xs)) // 2
    y = top[1]
    while y < g.size[1] and gp[cx, y] < 120: y += 1          # crossbar of the hidden letter
    while y < g.size[1] and gp[cx, y] >= 120: y += 1         # between its legs
    ax, ay = box[0] + cx / SC, box[1] + y / SC                 # top of the corner dot
    canvas = Image.new("RGB", (int(px(box[2] - box[0])), int(px(box[3] - box[1] + 14))), "white")
    canvas.paste(im.crop(tuple(int(px(v)) for v in box)), (0, int(px(14))))
    cd = ImageDraw.Draw(canvas)
    cd.rectangle([px(ax - box[0] - 7), 0, px(ax - box[0] + 7), px(14 + ay - box[1] - 1.5)], fill="white")
    vfont = ImageFont.truetype(FONT_BOLD, int(px(10.5)))
    cd.text((px(ax - box[0]), px(14 + ay - box[1] - 2)), letter, font=vfont, fill=darkest(im, (ax - 2, ay, ax + 2, ay + 6)), anchor="mb")
    g = canvas.convert("L").point(lambda v: 255 if v < 245 else 0); bb = g.getbbox()
    c = canvas.crop((max(0, bb[0] - 8), max(0, bb[1] - 8), min(canvas.size[0], bb[2] + 8), min(canvas.size[1], bb[3] + 8)))
    c.save(f"{out}/img/{name}.png"); fixed[name] = [f"{name}.png", c.size[0], c.size[1]]

# Class 6, chapter 1, Q7: the label "Term 1" is cut at the card's left edge.
W = words("HB6.pdf", 4); im = page("HB6.pdf", 4); d = ImageDraw.Draw(im)
t2 = next(w for w in W if w[4] == "Term" and 85 < w[0] < 100 and 130 < w[1] < 145)
stem_end = max(w[3] for w in W if w[1] < t2[1] - 30 and w[1] > 30 and w[0] < 455)
d.rectangle([px(50), px(t2[1] - 1), px(t2[0] - 2.5), px(t2[3] + 1)], fill="white")
lab = darkest(im, (t2[0], t2[1], t2[2], t2[3]))
f = ImageFont.truetype(FONT_REG, int(px(t2[3] - t2[1]) * 0.72))
d.text((px(t2[0] - 4.5), px(t2[3] - 2.3)), "Term 1", font=f, fill=lab, anchor="rs")
fixed["hb-6-ch01-7"] = save(im, (50, stem_end + 2, 300, t2[3] + 4), "hb-6-ch01-7")

# point the questions at the repaired files
for c in [3, 4, 5, 6, 7, 8]:
    p = f"{out}/hb{c}.json"; items = json.load(open(p)); n = 0
    for it in items:
        name = f"hb-{c}-ch{it['ch']:02d}-{it['label']}"
        if name in fixed: it["fig"] = fixed[name]; n += 1
    json.dump(items, open(p, "w"), indent=1, ensure_ascii=False)
os.remove(f"{out}/_fix.png")
print("repaired:", ", ".join(sorted(fixed)))
