import sys, json, os
from PIL import Image
def edges(path, b=2, thr=170):
    im = Image.open(path).convert("L"); w, h = im.size; px = im.load()
    def ink(x0, y0, x1, y1): return sum(1 for y in range(y0, y1) for x in range(x0, x1) if px[x, y] < thr)
    e = {"top": (ink(0, 0, w, b), w), "bottom": (ink(0, h - b, w, h), w), "left": (ink(0, 0, b, h), h), "right": (ink(w - b, 0, w, h), h)}
    # content cut = some ink on the edge strip, but not a frame line running along it
    return {k: v for k, (v, L) in e.items() if v >= 3 and v <= 1.2 * L}
if __name__ == "__main__":
    files = sys.argv[2:]; res = {f: e for f in files if (e := edges(f))}
    json.dump(res, open(sys.argv[1], "w")); print(len(files), "checked;", len(res), "with content touching an edge")
