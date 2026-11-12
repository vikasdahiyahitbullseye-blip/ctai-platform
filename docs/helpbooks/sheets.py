import json, sys
from PIL import Image, ImageDraw, ImageFont
font = ImageFont.truetype(sys.argv[1], 15)
cls = int(sys.argv[2]); start = int(sys.argv[3])
d = [i for i in json.load(open(f"out/hb{cls}.json")) if i["fig"]][start:start + 16]
W, colw = 1500, 750
cells = []
for i in d:
    im = Image.open("out/img/" + i["fig"][0]); im.thumbnail((colw - 10, 180)); cells.append((i, im))
rows = [cells[j:j + 2] for j in range(0, len(cells), 2)]
H = sum(max(im.size[1] for _, im in r) + 62 for r in rows)
sh = Image.new("RGB", (W, H), "white"); dr = ImageDraw.Draw(sh); y = 0
for r in rows:
    h = max(im.size[1] for _, im in r) + 62
    for x, (i, im) in enumerate(r):
        dr.text((x * colw + 4, y + 2), f"{i['ch']}-{i['label']} ...{i['stem'][-90:]}", fill=(200, 0, 0), font=font)
        dr.text((x * colw + 4, y + 20), f"opts: {' | '.join(o[:20] for o in i['options'])}  ans={i['answer']}", fill=(0, 0, 160), font=font)
        sh.paste(im, (x * colw + 4, y + 40))
    dr.line([(0, y + h - 2), (W, y + h - 2)], fill=(180, 180, 180), width=2); y += h
sh.save(f"sheet{cls}-{start}.png")
