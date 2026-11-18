"""Extends a CBSE figure crop down to the line before "Answer:" (so every picture option shows) and left to the margin.
Usage: python3 -I cbse_extend.py <TH dir> <web dir> <figure names...>"""
import json, os, re, subprocess, sys, html
import numpy as np
from PIL import Image
th, web, names = sys.argv[1], sys.argv[2], sys.argv[3:]
DPI = 150; SC = DPI / 72
items = json.load(open(f"{web}/prisma/content/cbse/ct.json"))
for name in names:
    it = next(i for i in items if i.get("fig") and i["fig"][0] == name)
    pdf = f"{th}/TH{it['c']}.pdf"
    best = None
    for n in (it["page"], it["page"] - 1, it["page"] + 1):
        b = os.path.join(web, "_ext")
        subprocess.run(["pdftoppm", "-r", str(DPI), "-png", "-f", str(n), "-l", str(n), "-singlefile", pdf, b], check=True)
        pg = Image.open(b + ".png").convert("RGB"); crop = Image.open(f"{web}/public/cbse/{name}").convert("RGB")
        P = np.asarray(pg.convert("L"), float) / 255; T = np.asarray(crop.convert("L"), float) / 255
        h, w = T.shape; F = np.fft.rfft2(P); corr = np.fft.irfft2(F * np.conj(np.fft.rfft2(T, s=P.shape)), s=P.shape)
        ii = np.cumsum(np.cumsum(np.pad(P * P, ((1, 0), (1, 0))), 0), 1)
        win = ii[h:, w:] - ii[:-h, w:] - ii[h:, :-w] + ii[:-h, :-w]
        ssd = win - 2 * corr[: P.shape[0] - h + 1, : P.shape[1] - w + 1] + (T * T).sum()
        y, x = np.unravel_index(np.argmin(ssd), ssd.shape); score = ssd[y, x] / (h * w)
        if best is None or score < best[0]: best = (score, n, int(x), int(y), pg, w, h)
    score, n, x, y, pg, w, h = best
    xml = subprocess.run(["pdftotext", "-bbox-layout", "-f", str(n), "-l", str(n), pdf, "-"], capture_output=True, text=True).stdout
    ans = [float(m.group(1)) for m in re.finditer(r'<word xMin="[\d.]+" yMin="([\d.]+)" xMax="[\d.]+" yMax="[\d.]+">Answer:</word>', xml)]
    below = [a * SC for a in ans if a * SC > y + h]
    y1 = int(min(below)) - 4 if below else y + h
    # stop at the last ink above "Answer:" (the option text line d) may sit there; keep it only if it is a picture row)
    x0 = int(30 * SC)
    out = pg.crop((x0, y, max(x + w, int(pg.size[0] - 30 * SC)), y1))
    g = out.convert("L").point(lambda v: 255 if v < 200 else 0); bb = g.getbbox()
    out = out.crop((max(0, bb[0] - 6), 0, min(out.size[0], bb[2] + 6), min(out.size[1], bb[3] + 6)))
    out.save(f"{web}/public/cbse/{name}", "WEBP", quality=82, method=6)
    it["fig"][1], it["fig"][2] = out.size
    print(name, "page", n, "score", round(score, 4), "->", out.size)
json.dump(items, open(f"{web}/prisma/content/cbse/ct.json", "w"), ensure_ascii=False, separators=(",", ":"))
