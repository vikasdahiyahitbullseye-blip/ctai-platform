"""Reads each chapter's title and one-line description from the original help books (for the CBSE edition's chapter pages).
Usage: python3 docs/helpbooks/chapter_heads.py <uploadsDir> <out.json>"""
import glob, json, re, subprocess, sys
up, out = sys.argv[1:3]
res = {}
for cls in range(3, 9):
    src = glob.glob(f"{up}/*Class{cls}_HelpBook_Complete.pdf")[0]
    n = int(re.search(r"Pages:\s+(\d+)", subprocess.run(["pdfinfo", src], capture_output=True, text=True).stdout).group(1))
    SK = ("Pattern recognition", "Decomposition", "Algorithmic thinking", "Abstract thinking")
    for p in range(1, n + 1):
        lay = subprocess.run(["pdftotext", "-layout", "-f", str(p), "-l", str(p), src, "-"], capture_output=True, text=True).stdout.split("\n")[:12]
        head = "\n".join(lay)
        if not ("Chapter" in head and re.search(r"\d+ questions", head)):
            continue
        L = [l.strip() for l in lay if l.strip()]
        i = next(k for k, l in enumerate(L) if l.startswith("Chapter"))
        title = L[i][len("Chapter"):].strip()
        j = i + 1
        if not title:
            title, j = L[i + 1], i + 2
        m = re.match(r"(\d{1,2})\s*(.*)$", L[j])
        ch, desc = int(m.group(1)), [m.group(2)]
        nxt = L[j + 1]
        if not nxt.startswith(SK) and not re.search(r"\d+ questions", nxt):
            desc.append(nxt)
        res[f"{cls}-{ch}"] = {"title": re.sub(r"\s{2,}", " ", title), "desc": " ".join(d for d in desc if d)}
json.dump(res, open(out, "w"), indent=1, ensure_ascii=False)
print(len(res))
