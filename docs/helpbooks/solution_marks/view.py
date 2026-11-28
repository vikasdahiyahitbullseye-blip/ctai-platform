"""view.py <class> <chapter> [labels,..]: sheet of the chapter's book pictures (without solution pictures) with a 10% grid."""
import json, sys
from PIL import Image, ImageDraw, ImageFont
W = "/home/user/ctai-platform/web"
c, ch = int(sys.argv[1]), int(sys.argv[2]); only = [x for x in sys.argv[3].split(",") if x] if len(sys.argv) > 3 else None
h = json.load(open(f"{W}/prisma/content/helpbook/hb.json"))
F = json.load(open(f"{W}/prisma/content/helpbook/solutions/figs-c{c}.json"))
rows = [r for r in h if r["c"] == c and r["ch"] == ch and r["fig"] and f"{ch}-{r['label']}" not in F and (not only or r["label"] in only)]
font = ImageFont.truetype("/tmp/claude-0/-home-user-ctai-platform/8c2fbdbb-0cd2-522a-a96f-b710ee37c879/scratchpad/survey/fonts/Inter-Bold.ttf", 13)
tiles = []
for r in rows:
    im = Image.open(f"{W}/public/{r['fig'][0]}").convert("RGB")
    s = min(560 / im.width, 400 / im.height); im = im.resize((round(im.width * s), round(im.height * s)))
    t = Image.new("RGB", (im.width + 30, im.height + 46), "white"); t.paste(im, (24, 22)); d = ImageDraw.Draw(t)
    for k in range(11):
        x = 24 + im.width * k / 10; y = 22 + im.height * k / 10
        d.line([(x, 22), (x, 22 + im.height)], fill=(255, 0, 255) if k % 5 == 0 else (255, 170, 255), width=1)
        d.line([(24, y), (24 + im.width, y)], fill=(255, 0, 255) if k % 5 == 0 else (255, 170, 255), width=1)
        d.text((x - 6, 22 + im.height + 2), str(k * 10), fill=(200, 0, 200), font=font); d.text((0, y - 7), str(k * 10), fill=(200, 0, 200), font=font)
    d.text((2, 2), f"{c}-{ch}-{r['label']}  ans {'abcd'[r['answer']]}", fill="red", font=font)
    tiles.append(t)
Wd = 1200; x = y = rowh = 0; pos = []
for t in tiles:
    if x + t.width > Wd: x, y, rowh = 0, y + rowh + 6, 0
    pos.append((x, y)); x += t.width + 6; rowh = max(rowh, t.height)
sheet = Image.new("RGB", (Wd, y + rowh), "white")
for t, p in zip(tiles, pos): sheet.paste(t, p)
sheet.save(sys.argv[4] if len(sys.argv) > 4 else "v.png"); print(len(rows), [r["label"] for r in rows])
