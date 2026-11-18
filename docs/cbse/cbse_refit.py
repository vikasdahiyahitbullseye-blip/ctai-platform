"""Re-fits CBSE handbook figure crops whose drawing touches an edge: finds each crop on its Teacher Handbook page
(FFT cross-correlation), then grows the box until the drawing ends, or trims slivers of neighbouring text.
Usage: python3 -I cbse_refit.py <dir with TH3.pdf..TH8.pdf> <web dir> <edges.json> <report.json>"""
import json, os, subprocess, sys
import numpy as np
from PIL import Image

th, web, edges_file, report_file = sys.argv[1:5]
DPI = 150
items = json.load(open(f"{web}/prisma/content/cbse/ct.json"))
by_src = {i["fig"][0]: i for i in items if i.get("fig")}
edges = json.load(open(edges_file))
cache = {}

def page(c, n):
    k = (c, n)
    if k not in cache:
        b = fos.path.join(os.path.dirname(os.path.abspath(edges_file)), "_th")
        subprocess.run(["pdftoppm", "-r", str(DPI), "-png", "-f", str(n), "-l", str(n), "-singlefile", f"{th}/TH{c}.pdf", b], check=True)
        cache.clear(); cache[k] = Image.open(b + ".png").convert("RGB")
    return cache[k]

def locate(pg, crop):
    """best (x, y, score) of crop inside page, by normalised SSD computed with FFTs"""
    P = np.asarray(pg.convert("L"), dtype=np.float64) / 255; T = np.asarray(crop.convert("L"), dtype=np.float64) / 255
    if T.shape[0] > P.shape[0] or T.shape[1] > P.shape[1]: return None
    H, W = P.shape; h, w = T.shape
    F = np.fft.rfft2(P); corr = np.fft.irfft2(F * np.conj(np.fft.rfft2(T, s=P.shape)), s=P.shape)
    ii = np.cumsum(np.cumsum(np.pad(P * P, ((1, 0), (1, 0))), 0), 1)
    win = ii[h:, w:] - ii[:-h, w:] - ii[h:, :-w] + ii[:-h, :-w]
    ssd = win - 2 * corr[: H - h + 1, : W - w + 1] + (T * T).sum()
    y, x = np.unravel_index(np.argmin(ssd), ssd.shape)
    return int(x), int(y), float(ssd[y, x] / (h * w))

def dark(g, x0, y0, x1, y1):
    return int((g[max(0, y0):max(0, y1), max(0, x0):max(0, x1)] < 170).sum())

report = {}
for src, sides in edges.items():
    name = os.path.basename(src)
    it = by_src.get(name)
    if not it: continue
    crop = Image.open(f"{web}/public/cbse/{name}").convert("RGB")
    best = None
    for n in (it["page"], it["page"] - 1, it["page"] + 1):
        if n < 1: continue
        r = locate(page(it["c"], n), crop)
        if r and (best is None or r[2] < best[2]): best = (*r, n)
    if not best or best[2] > 0.01: report[name] = "not found"; continue
    x, y, score, n = best
    pg = page(it["c"], n); g = np.asarray(pg.convert("L")); H, W = g.shape
    x0, y0, x1, y1 = x, y, x + crop.size[0], y + crop.size[1]
    pic_options = any(not o for o in it.get("options", [])) if it.get("options") else False
    margin = int(30 * DPI / 72)
    orig = (x0, y0, x1, y1)
    LIMIT = {"top": 12, "bottom": 60, "left": 60, "right": 60}  # a real cut needs only a little more room
    for _ in range(80):
        moved = False
        for side in ("top", "bottom", "left", "right"):
            if side == "top": n_, L = dark(g, x0, y0, x1, y0 + 2), x1 - x0
            elif side == "bottom": n_, L = dark(g, x0, y1 - 2, x1, y1), x1 - x0
            elif side == "left": n_, L = dark(g, x0, y0, x0 + 2, y1), y1 - y0
            else: n_, L = dark(g, x1 - 2, y0, x1, y1), y1 - y0
            if n_ < 3 or n_ > 1.2 * L: continue
            if side in ("top", "bottom") and not (side == "bottom" and pic_options):
                # slivers of the line above/below: step back to the nearest clean row (up to 30 px)
                rng = range(y0 + 1, y0 + 31) if side == "top" else range(y1 - 2, y1 - 32, -1)
                clean = next((r for r in rng if dark(g, x0, r, x1, r + 1) == 0), None)
                if clean is not None:
                    if side == "top": y0 = clean
                    else: y1 = clean + 1
                    moved = True; continue
            if side == "top" and y0 > margin and orig[1] - y0 < LIMIT["top"]: y0 -= 3; moved = True
            elif side == "bottom" and y1 < H - margin and y1 - orig[3] < LIMIT["bottom"]: y1 += 3; moved = True
            elif side == "left" and x0 > margin and orig[0] - x0 < LIMIT["left"]: x0 -= 3; moved = True
            elif side == "right" and x1 < W - margin and x1 - orig[2] < LIMIT["right"]: x1 += 3; moved = True
        if not moved: break
    # a side that still touches at its limit ran into a frame or text, not a cut drawing: keep it as it was
    still = lambda side: (dark(g, x0, y0, x1, y0 + 2) if side == "top" else dark(g, x0, y1 - 2, x1, y1) if side == "bottom" else dark(g, x0, y0, x0 + 2, y1) if side == "left" else dark(g, x1 - 2, y0, x1, y1)) >= 3
    if y0 < orig[1] and still("top"): y0 = orig[1]
    if y1 > orig[3] and still("bottom"): y1 = orig[3]
    if x0 < orig[0] and still("left"): x0 = orig[0]
    if x1 > orig[2] and still("right"): x1 = orig[2]
    if (x0, y0, x1, y1) == orig: report[name] = "unchanged"; continue
    pad = 5
    # white space only on sides that grew; a side that was trimmed or kept stays exactly where it is
    box = (max(0, x0 - (pad if x0 < orig[0] else 0)), max(0, y0 - (pad if y0 < orig[1] else 0)), min(W, x1 + (pad if x1 > orig[2] else 0)), min(H, y1 + (pad if y1 > orig[3] else 0)))
    out = pg.crop(box)
    if out.size == crop.size and box[:2] == (x - pad, y - pad): report[name] = "unchanged"; continue
    out.save(f"{web}/public/cbse/{name}", "WEBP", quality=82, method=6)
    it["fig"][1], it["fig"][2] = out.size
    report[name] = f"{crop.size} -> {out.size}"
json.dump(items, open(f"{web}/prisma/content/cbse/ct.json", "w"), ensure_ascii=False, separators=(",", ":"))
json.dump(report, open(report_file, "w"), indent=0)
from collections import Counter
print(Counter(v if v in ("unchanged", "not found") else "refitted" for v in report.values()))
