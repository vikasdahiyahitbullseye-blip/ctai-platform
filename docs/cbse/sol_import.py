"""Imports the worked-solution pictures cropped by sol_extract.py into the platform.
Usage: python3 -I sol_import.py <outdir of sol_extract.py> <web dir>
Writes WebP files to web/public/cbse/sol and adds "sfig" to each matching row of prisma/content/cbse/ct.json.
BAD lists crops that were checked by eye and are not solution pictures (page headers, decorations, whole text boxes).
"""
import json, os, sys
from PIL import Image

src, web = sys.argv[1], sys.argv[2]
BAD = {"3-ct02-10-s2", "3-ct02-11-s1", "4-ct01-10-s1", "4-ct02-10-s1", "4-ct09-10-s2", "4-ct10-10-s1", "4-ct12-13-s1",
       "5-ct15-10-s1", "6-ct05-02-s1", "6-ct05-12-s1", "6-ct10-11-s1", "6-ct10-11-s2", "7-ct07-10-s2", "7-ct08-10-s2",
       "8-ct01-10-s1", "8-ct02-10-s1", "8-ct03-17-s2", "8-ct03-17-s3", "8-ct06-10-s1", "8-ct06-10-s2"}
os.makedirs(f"{web}/public/cbse/sol", exist_ok=True)
path = f"{web}/prisma/content/cbse/ct.json"
ct = json.load(open(path))
idx = {(r["c"], r["ch"], r["seq"]): r for r in ct}
for r in ct:
    r.pop("sfig", None)
n = q = 0
for c in range(3, 9):
    for s in json.load(open(f"{src}/sol{c}.json")):
        row = idx.get((s["c"], s["ch"], s["seq"]))
        if not row:
            continue
        figs = []
        for f in s["figs"]:
            name = f["src"][:-4]
            if name[5:] in BAD:
                continue
            im = Image.open(f"{src}/simg/{f['src']}").convert("RGB")
            if im.width > 900:
                im = im.resize((900, round(im.height * 900 / im.width)), Image.LANCZOS)
            im.save(f"{web}/public/cbse/sol/{name}.webp", "WEBP", quality=82)
            figs.append([f"cbse/sol/{name}.webp", im.width, im.height])
            n += 1
        if figs:
            row["sfig"] = figs
            q += 1
json.dump(ct, open(path, "w"), ensure_ascii=False, separators=(",", ":"))
print(q, "questions,", n, "pictures")
