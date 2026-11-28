"""Draws solution marks on book pictures. Coordinates are percentages of the picture (0–100).
Ops: ("ring",x,y,r[,col]) ("box",x0,y0,x1,y1[,col]) ("tick",x,y) ("cross",x,y) ("path",[(x,y),..][,col]) ("text",x,y,"t"[,col]) ("fill",x0,y0,x1,y1[,col])"""
import json, os
from PIL import Image, ImageDraw, ImageFont
W = "/home/user/ctai-platform/web"
FONT = "/tmp/claude-0/-home-user-ctai-platform/8c2fbdbb-0cd2-522a-a96f-b710ee37c879/scratchpad/survey/fonts/Inter-Bold.ttf"
COL = {"red": (220, 38, 38), "green": (22, 163, 74), "blue": (37, 99, 235), "orange": (234, 88, 12), "purple": (147, 51, 234)}
H = {r["c"]: None for r in []}
hb = json.load(open(f"{W}/prisma/content/helpbook/hb.json"))
ROW = {(r["c"], f"{r['ch']}-{r['label']}"): r for r in hb}
_figs = {}
def figs(c):
    if c not in _figs: _figs[c] = json.load(open(f"{W}/prisma/content/helpbook/solutions/figs-c{c}.json"))
    return _figs[c]
def mark(c, key, ops, alt, after=None):
    r = ROW[(c, key)]
    sol = json.load(open(f"{W}/prisma/content/helpbook/solutions/c{c}.json"))[key]
    if after: assert after in sol, (c, key, after)
    im = Image.open(f"{W}/public/{r['fig'][0]}").convert("RGB")
    sc = 2 if im.width < 500 else 1
    im = im.resize((im.width * sc, im.height * sc), Image.LANCZOS)
    w, h = im.size; lw = max(3, round(w / 160))
    fs = max(16, round(w / 22)); band = round(fs * 1.7)
    top = band if any(o[0] == "text" and o[2] < 3 for o in ops) else 0
    bot = band if any(o[0] == "text" and o[2] > 97 for o in ops) else 0
    if top or bot:
        cv = Image.new("RGB", (w, h + top + bot), "white"); cv.paste(im, (0, top)); im = cv
    P = lambda x, y: (x * w / 100, top + y * h / 100)
    d = ImageDraw.Draw(im, "RGBA")
    for op in ops:
        k = op[0]; col = COL.get(op[-1], COL["red"]) if isinstance(op[-1], str) and op[-1] in COL else COL["red"]
        if k == "ring": x, y, rr = op[1:4]; R = rr * w / 100; cx, cy = P(x, y); d.ellipse([cx - R, cy - R, cx + R, cy + R], outline=col, width=lw)
        elif k == "box": d.rounded_rectangle([*P(op[1], op[2]), *P(op[3], op[4])], radius=lw * 2, outline=col, width=lw)
        elif k == "fill": d.rectangle([*P(op[1], op[2]), *P(op[3], op[4])], fill=col + (70,))
        elif k == "path": d.line([P(*p) for p in op[1]], fill=col, width=lw + 1, joint="curve")
        elif k in ("tick", "cross"):
            cx, cy = P(op[1], op[2]); s = w / 30; c2 = COL["green"] if k == "tick" else COL["red"]
            d.ellipse([cx - s, cy - s, cx + s, cy + s], fill=c2)
            if k == "tick": d.line([(cx - s * .5, cy), (cx - s * .1, cy + s * .45), (cx + s * .55, cy - s * .45)], fill="white", width=lw)
            else: d.line([(cx - s * .45, cy - s * .45), (cx + s * .45, cy + s * .45)], fill="white", width=lw); d.line([(cx + s * .45, cy - s * .45), (cx - s * .45, cy + s * .45)], fill="white", width=lw)
        elif k == "text":
            f = ImageFont.truetype(FONT, fs); x, y = P(op[1], op[2]); t = op[3]
            sz = fs
            while sz > 11 and d.textlength(t, font=f) > w - 24:
                sz -= 1; f = ImageFont.truetype(FONT, sz)
            if op[2] < 3: y = top / 2
            elif op[2] > 97: y = top + h + bot / 2
            bb = d.textbbox((x, y), t, font=f, anchor="mm"); dx = max(0, 7 - bb[0]) - max(0, bb[2] - (w - 7)); dy = max(0, 5 - bb[1]) - max(0, bb[3] - (im.height - 5)); x += dx; y += dy
            bb = d.textbbox((x, y), t, font=f, anchor="mm"); d.rounded_rectangle([bb[0] - 5, bb[1] - 3, bb[2] + 5, bb[3] + 3], radius=6, fill=(255, 255, 255, 230), outline=col, width=2); d.text((x, y), t, fill=col, font=f, anchor="mm")
    os.makedirs(f"{W}/public/hb/sol", exist_ok=True)
    name = os.path.basename(r["fig"][0]).replace(".webp", "-sol.webp")
    out = im if im.width <= 900 else im.resize((900, round(im.height * 900 / im.width)), Image.LANCZOS)
    out.save(f"{W}/public/hb/sol/{name}", "WEBP", quality=85)
    f = {"kind": "image", "src": f"hb/sol/{name}", "w": out.width, "h": out.height, "alt": alt}
    figs(c)[key] = {"figs": [f], **({"after": after} if after else {})}
def save():
    import re
    for c, d in _figs.items():
        json.dump(dict(sorted(d.items(), key=lambda kv: (int(kv[0].split("-")[0]), kv[0].split("-")[1].rjust(4)))), open(f"{W}/prisma/content/helpbook/solutions/figs-c{c}.json", "w"), ensure_ascii=False, indent=0)
    print({c: len(d) for c, d in _figs.items()})
OB={"a":(1,26),"b":(28,53),"c":(55,80),"d":(82,99)}
def opt(k,y0=60,y1=98,col="green"):
    x0,x1=OB[k]; return [("box",x0,y0,x1,y1,col),("tick",x1-3,y0+3)]
def optg(k,y0,y1,rows,col="green"):
    """2x2 option grid: rows=((ya0,ya1),(yc0,yc1)); a,b top, c,d bottom"""
    i="abcd".index(k); x0,x1=((1,49),(51,99))[i%2]; ya,yb=rows[i//2]; return [("box",x0,ya,x1,yb,col),("tick",x1-3,ya+3)]
