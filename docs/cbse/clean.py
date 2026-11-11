"""Post-processes figure crops: removes box-border lines (long thin vertical/horizontal rules at the edges),
re-trims to the remaining ink, and drops crops that are left nearly empty."""
import json
from PIL import Image
import numpy as np

def clean(path):
    im = Image.open(path).convert("RGB")
    a = np.asarray(im.convert("L")) < 200
    h, w = a.shape
    keep = a.copy()
    # vertical rules: columns where ink covers >70% of the height
    # only rules within 14 px of the crop's edges (box borders), never lines inside the figure
    edge = 14
    for x in list(range(min(edge, w))) + list(range(max(0, w - edge), w)):
        if a[:, x].mean() > 0.7: keep[:, x] = False
    for y in list(range(min(edge, h))) + list(range(max(0, h - edge), h)):
        if a[y, :].mean() > 0.85: keep[y, :] = False
    ys, xs = np.nonzero(keep)
    if len(xs) < 150: return None
    x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    # drop isolated specks at the top (e.g. a descender from the line above)
    rows = keep[y0:y1 + 1].sum(axis=1)
    while y1 - y0 > 20 and rows[:3].sum() < 6 and keep[y0:y0 + 8].sum() < 25:
        y0 += 1; rows = keep[y0:y1 + 1].sum(axis=1)
    if (x1 - x0) < 25 or (y1 - y0) < 18: return None
    pad = 6
    out = im.crop((max(0, x0 - pad), max(0, y0 - pad), min(w, x1 + pad + 1), min(h, y1 + pad + 1)))
    out.save(path)
    return out.size

dropped = 0
for c in [3, 4, 5, 6, 7, 8]:
    d = json.load(open(f"out/th{c}.json"))
    for i in d:
        if not i["figure"]: continue
        r = clean("out/img/" + i["figure"]["src"])
        if r is None:
            i["figure"] = None; dropped += 1
        else:
            i["figure"]["w"], i["figure"]["h"] = r
    json.dump(d, open(f"out/th{c}.json", "w"), indent=1, ensure_ascii=False)
print("dropped", dropped)
