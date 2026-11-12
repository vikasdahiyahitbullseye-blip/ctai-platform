"""Writes the help-book questions as platform data (web/prisma/content/helpbook/hb.json) and WebP figures (web/public/hb).
Usage: python3 -I hb_convert.py <web dir>"""
import json, re, sys, os
from PIL import Image
web = sys.argv[1]
os.makedirs(f"{web}/public/hb", exist_ok=True); os.makedirs(f"{web}/prisma/content/helpbook", exist_ok=True)
RULES = [
    ("PATTERN", r"series|pattern|sequence|what will come in place|odd one out|next term|same rule|same way|follows"),
    ("ABSTRACT", r"fold|mirror|view|cube|net\b|rotate|turn|symmetr|shape|figure|picture|grid|square|triangle|dice|block|map"),
    ("ALGORITHMIC", r"step|rule|code|coded|cipher|operat|machine|instruction|move|press|click|order|swap|round"),
    ("DECOMPOSITION", r"clue|each|friends|sitting|arrange|different|condition|statements|total|how many|maximum|minimum"),
]
out, nbytes = [], 0
for c in [3, 4, 5, 6, 7, 8]:
    for i in json.load(open(f"out/hb{c}.json")):
        if i["answer"] is None or i["answer"] >= len(i["options"]) or len(i["options"]) < 2: continue
        skills = list(dict.fromkeys(i["skills"]))
        if not skills:
            t = i["stem"].lower()
            skills = [k for k, rx in RULES if re.search(rx, t)][:2] or ["DECOMPOSITION"]
        fig = None
        if i["fig"]:
            src = i["fig"][0].replace(".png", ".webp")
            im = Image.open("out/img/" + i["fig"][0]).convert("RGB")
            im.save(f"{web}/public/hb/{src}", "WEBP", quality=82, method=6); nbytes += os.path.getsize(f"{web}/public/hb/{src}")
            fig = ["hb/" + src, im.size[0], im.size[1]]
        words = len(i["stem"].split())
        d = 3 if i["label"].startswith("P") or words >= 45 else 1 if (words <= 12 and not fig) else 2
        out.append({"c": c, "ch": i["ch"], "label": i["label"], "stem": i["stem"], "options": i["options"], "answer": i["answer"],
                    "solution": i.get("solution", ""), "skills": skills, "d": d, "fig": fig})
json.dump(out, open(f"{web}/prisma/content/helpbook/hb.json", "w"), ensure_ascii=False, separators=(",", ":"))
from collections import Counter
print(len(out), "questions;", sum(1 for x in out if x["fig"]), "figures,", round(nbytes / 1e6, 1), "MB;", dict(Counter(x["c"] for x in out)), "difficulty", dict(Counter(x["d"] for x in out)))
