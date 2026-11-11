"""Converts extracted Teacher Handbook items into the platform's data file and WebP figures.
Usage: python3 -I convert.py <web dir>"""
import json, re, sys, os
from PIL import Image
web = sys.argv[1]
os.makedirs(f"{web}/public/cbse", exist_ok=True)
SK = {"abstract": "ABSTRACT", "abstraction": "ABSTRACT", "pattern recognition": "PATTERN", "decomposition": "DECOMPOSITION",
      "algorithmic thinking": "ALGORITHMIC", "generalisation": "GENERALISATION", "generalization": "GENERALISATION", "evaluation": "EVALUATION"}
RULES = [
    ("PATTERN", r"series|pattern|sequence|what will come in place|odd one out|next term|same theme|same manner|follows the same"),
    ("ABSTRACT", r"fold|mirror|view|cube|net\b|rotate|turn|symmetr|shape|figure|image|grid|square|triangle|rectangle|dice|block"),
    ("ALGORITHMIC", r"step|rule|code|coded|cipher|operator|expression|machine|instruction|move|press|click|order of|algorithm"),
    ("DECOMPOSITION", r"clue|each of|friends|sitting|arrange|different|condition|following statements|total|how many|maximum|minimum"),
]
def skills(i):
    found = []
    for c in i.get("competencies", []):
        k = SK.get(c.strip().lower())
        if k and k not in found: found.append(k)
    if not found:
        t = i["stem"].lower()
        for k, rx in RULES:
            if re.search(rx, t): found.append(k)
            if len(found) == 2: break
    return found or ["DECOMPOSITION"]

out, total_bytes = [], 0
for c in [3, 4, 5, 6, 7, 8]:
    for i in json.load(open(f"out/th{c}.json")):
        if len(i["options"]) < 2: continue
        a = i["answer"].strip().lower()
        m = re.match(r"^\(?([a-d])\)?(\W|$)", a) or re.match(r"^option\s*\(?([a-d])", a)
        if not m: continue
        ans = ord(m.group(1)) - 97
        if ans >= len(i["options"]): continue
        fig = None
        if i["figure"]:
            src = i["figure"]["src"].replace(".png", ".webp")
            im = Image.open("out/img/" + i["figure"]["src"]).convert("RGB")
            im.save(f"{web}/public/cbse/{src}", "WEBP", quality=82, method=6)
            total_bytes += os.path.getsize(f"{web}/public/cbse/{src}")
            fig = [src, im.size[0], im.size[1]]
        opts = ["" if (i["picOptions"] or re.fullmatch(r"\([a-d]\)", o)) else o for o in i["options"]]
        sol = re.sub(r"\n(?=[a-z(])", " ", i["solution"]).strip()
        # clue bullets on their own lines
        stem = re.sub(r"\s*[•●]\s*", "\n- ", i["stem"])
        stem = re.sub(r"\s+-\s+(?=[A-Z(])", "\n- ", stem).strip()
        i = {**i, "stem": stem}
        out.append({"c": c, "ch": i["chapter"], "seq": i["seq"], "num": i["num"], "page": i["page"], "stem": i["stem"], "options": opts,
                    "answer": ans, "solution": sol, "skills": skills(i), "fig": fig})
json.dump(out, open(f"{web}/prisma/content/cbse/ct.json", "w"), ensure_ascii=False, separators=(",", ":"))
from collections import Counter
print(len(out), "CT items;", sum(1 for x in out if x["fig"]), "figures,", round(total_bytes / 1e6, 1), "MB;", dict(Counter(x["c"] for x in out)))
print(Counter(s for x in out for s in x["skills"]))
