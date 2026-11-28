"""view2.py out.png key1 key2 ... (key = 'c ch-label' as c:ch-label) — original pictures with 10% grid + answer + solution tail."""
import json, sys
from PIL import Image, ImageDraw, ImageFont
W = "/home/user/ctai-platform/web"
h = json.load(open(f"{W}/prisma/content/helpbook/hb.json"))
font = ImageFont.truetype("/tmp/claude-0/-home-user-ctai-platform/8c2fbdbb-0cd2-522a-a96f-b710ee37c879/scratchpad/survey/fonts/Inter-Bold.ttf", 13)
tiles = []
for k in sys.argv[2:]:
    c, key = k.split(":"); c = int(c); ch, lab = key.split("-", 1)
    r = [r for r in h if r["c"] == c and r["ch"] == int(ch) and r["label"] == lab][0]
    im = Image.open(f"{W}/public/{r['fig'][0]}").convert("RGB")
    s = min(560 / im.width, 380 / im.height); im = im.resize((round(im.width * s), round(im.height * s)))
    t = Image.new("RGB", (max(im.width + 30, 300), im.height + 46), "white"); t.paste(im, (24, 22)); d = ImageDraw.Draw(t)
    for q in range(11):
        x = 24 + im.width * q / 10; y = 22 + im.height * q / 10
        col = (255, 0, 255) if q % 5 == 0 else (255, 170, 255)
        d.line([(x, 22), (x, 22 + im.height)], fill=col, width=1); d.line([(24, y), (24 + im.width, y)], fill=col, width=1)
        d.text((x - 6, 22 + im.height + 2), str(q * 10), fill=(200, 0, 200), font=font); d.text((0, y - 7), str(q * 10), fill=(200, 0, 200), font=font)
    d.text((2, 2), f"{c}:{key} ans {'abcd'[r['answer']]} {r['options'][r['answer']][:30]}", fill="red", font=font)
    tiles.append(t)
Wd = 1200; x = y = rowh = 0; pos = []
for t in tiles:
    if x + t.width > Wd: x, y, rowh = 0, y + rowh + 6, 0
    pos.append((x, y)); x += t.width + 6; rowh = max(rowh, t.height)
sheet = Image.new("RGB", (Wd, y + rowh), "white")
for t, p in zip(tiles, pos): sheet.paste(t, p)
sheet.save(sys.argv[1]); print(len(tiles))
