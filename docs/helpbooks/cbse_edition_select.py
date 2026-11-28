"""Chooses, for every CT chapter of Classes 3–8, as many help-book questions as the CBSE handbook has questions,
so that each CBSE question is paired with the help-book question most like it (same kind of puzzle, skill and picture).
Writes web/prisma/content/helpbook/cbse-edition.json:
  {"<class>-<chapter>": {"cbse": [seq, ...], "hb": [label, ...], "pairs": [[seq, label, score], ...]}}
Usage: python3 docs/helpbooks/cbse_edition_select.py
"""
import json
import math
import re
from collections import Counter
from pathlib import Path

W = Path(__file__).resolve().parents[2] / "web" / "prisma" / "content"
CBSE = json.load(open(W / "cbse" / "ct.json"))
HB = json.load(open(W / "helpbook" / "hb.json"))

STOP = set("the a an of to in is are which what will be and or for from with that this each if on by as at it its how many following given below shown come place following options option picture figure".split())


def words(s):
    out = []
    for w in re.findall(r"[a-z]+", s.lower()):
        if w in STOP or len(w) < 3:
            continue
        for suf in ("ing", "es", "s", "ed"):
            if w.endswith(suf) and len(w) - len(suf) >= 3:
                w = w[: -len(suf)]
                break
        out.append(w)
    return out


def features(stem, options, skills, fig):
    opts_in_pic = bool(fig) and all(not o for o in options)
    return {"w": Counter(words(stem + " " + " ".join(options))), "sk": set(skills), "fig": bool(fig), "pic": opts_in_pic}


def cosine(a, b, idf):
    dot = sum(a[t] * b[t] * idf.get(t, 1) ** 2 for t in a if t in b)
    na = math.sqrt(sum((v * idf.get(t, 1)) ** 2 for t, v in a.items()))
    nb = math.sqrt(sum((v * idf.get(t, 1)) ** 2 for t, v in b.items()))
    return dot / (na * nb) if na and nb else 0.0


def score(c, h, idf):
    sk = len(c["sk"] & h["sk"]) / len(c["sk"] | h["sk"]) if c["sk"] | h["sk"] else 0
    return cosine(c["w"], h["w"], idf) + 0.3 * sk + 0.15 * (c["fig"] == h["fig"]) + 0.1 * (c["pic"] == h["pic"])


result = {}
for cls in range(3, 9):
    for ch in sorted({r["ch"] for r in CBSE if r["c"] == cls}):
        cb = sorted([r for r in CBSE if r["c"] == cls and r["ch"] == ch], key=lambda r: r["seq"])
        hb = [r for r in HB if r["c"] == cls and r["ch"] == ch]
        assert len(hb) >= len(cb), (cls, ch)
        cf = [features(r["stem"], r["options"], r["skills"], r["fig"]) for r in cb]
        hf = [features(r["stem"], r["options"], r["skills"], r["fig"]) for r in hb]
        docs = [set(f["w"]) for f in cf + hf]
        idf = {t: math.log(len(docs) / sum(t in d for d in docs)) + 1 for d in docs for t in d}
        pairs = sorted(((score(c, h, idf), i, j) for i, c in enumerate(cf) for j, h in enumerate(hf)), reverse=True)
        used_c, used_h, chosen = set(), set(), []
        for s, i, j in pairs:  # greedy best-first matching: every CBSE question gets its own closest help-book question
            if i in used_c or j in used_h:
                continue
            used_c.add(i)
            used_h.add(j)
            chosen.append((cb[i]["seq"], hb[j]["label"], round(s, 3)))
        order = {r["label"]: k for k, r in enumerate(hb)}
        result[f"{cls}-{ch}"] = {
            "cbse": [r["seq"] for r in cb],
            "hb": sorted((l for _, l, _ in chosen), key=order.get),
            "pairs": sorted(chosen),
        }
json.dump(result, open(W / "helpbook" / "cbse-edition.json", "w"), indent=1)
tot = {c: sum(len(v["cbse"]) for k, v in result.items() if k.startswith(f"{c}-")) for c in range(3, 9)}
print("CBSE questions per class:", tot, "-> help-book questions kept: the same; total = twice")
