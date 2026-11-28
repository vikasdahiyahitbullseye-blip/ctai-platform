"""Builds a help-book edition (Classes 3–8) with "Learn it" theory pages and, optionally, "More practice" pages.

Inserts each chapter's theory PDF (made by web/scripts/theory-pages.ts) before that chapter's first page.
With a practice folder (made by web/scripts/practice-pages.ts), each chapter's 20 "More practice" questions go
just before the chapter's answer key; the old one-line answer key is replaced by worked solutions in the CBSE
Teacher Handbook style (Answer, Solution, "Hence, option … is the correct answer.", CT competency), followed by the
worked answer key of the "More practice" questions. Every page is renumbered
in the book's own footer style, the new pages get the footer, and the cover gets a small "New" badge.

CBSE edition (--cbse <dir>, made by web/scripts/cbse-edition-pages.ts): each chapter's original question pages and
answer key are replaced by the chapter page, the CBSE Handbook questions, an equal number of matching help-book
questions and worked solutions for both; "More practice" is left out; the front pages get the new question counts.

Usage:
  python3 merge_helpbook.py <class> <original.pdf> <theoryDir> <out.pdf> <InterRegular.ttf> <InterBold.ttf> [practiceDir] [--cbse <cbseDir>]
"""
import html
import io
import re
import subprocess
import sys

from PIL import Image
from pypdf import PdfReader, PdfWriter
from reportlab.lib.colors import Color, HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

args = sys.argv[1:]
cbse_dir = None
if "--cbse" in args:
    k = args.index("--cbse")
    cbse_dir = args[k + 1]
    del args[k:k + 2]
cls, src, theory_dir, out, font_reg, font_bold = args[:6]
practice_dir = args[6] if len(args) > 6 else None
cls = int(cls)
pdfmetrics.registerFont(TTFont("InterR", font_reg))
pdfmetrics.registerFont(TTFont("InterB", font_bold))

# Footer geometry measured from the original books (Inter Regular 6 pt).
# Classes 4–8 share one layout.
CLASS3 = {"footer_x": 36.84, "top": 820.5, "num_right": 559.15, "color": (80, 88, 100), "badge_top": 690}
LATER = {"footer_x": 33.75, "top": 816.0, "num_right": 561.74, "color": (71, 85, 105), "badge_top": 640}
STYLE = CLASS3 if cls == 3 else LATER
FOOTER = f"Computational Thinking · Help Book · Class {cls}"


def chapter_starts(path):
    n = int(re.search(r"Pages:\s+(\d+)", subprocess.run(["pdfinfo", path], capture_output=True, text=True).stdout).group(1))
    starts = {}
    for p in range(1, n + 1):
        t = subprocess.run(["pdftotext", "-layout", "-f", str(p), "-l", str(p), path, "-"], capture_output=True, text=True).stdout
        lines = t.split("\n")[:12]
        head = "\n".join(lines)
        if "Chapter" in head and re.search(r"\d+ questions", head):
            # The chapter number sits on the line under "Chapter" in the coloured box.
            idx = next(i for i, l in enumerate(lines) if "Chapter" in l)
            m = re.search(r"Chapter\s+(\d{1,2})\b", lines[idx]) or next((mm for l in lines[idx + 1:idx + 3] if (mm := re.match(r"^\s*(\d{1,2})\s", l))), None)
            starts[int(m.group(1))] = p
    return n, starts


def answer_key_pages(path, n):
    """First page of each chapter's "Answer key: Chapter N"."""
    keys = {}
    for p in range(1, n + 1):
        t = subprocess.run(["pdftotext", "-layout", "-f", str(p), "-l", str(p), path, "-"], capture_output=True, text=True).stdout
        m = re.search(r"Answer key:\s*Chapter\s+(\d{1,2})", "\n".join(t.split("\n")[:4]))
        if m and int(m.group(1)) not in keys:
            keys[int(m.group(1))] = p
    return keys


def overlay(w, h, number, with_footer_text, badge=False, footer=None):
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=(w, h))
    r, g, b = STYLE["color"]
    baseline = h - (STYLE["top"] + 4.6)
    # Cover the old page number and write the new one.
    c.setFillColor(HexColor("#ffffff"))
    c.rect(STYLE["num_right"] - 28, baseline - 3, 32, 11, stroke=0, fill=1)
    c.setFillColor(Color(r / 255, g / 255, b / 255))
    c.setFont("InterR", 6)
    c.drawRightString(STYLE["num_right"], baseline, str(number))
    if with_footer_text:
        c.drawString(STYLE["footer_x"], baseline, footer or FOOTER)
    if badge:
        text = ("NEW in this edition: CBSE handbook questions with Teacher Handbook solutions in every chapter" if cbse_dir else
                ("NEW in this edition: 'Learn it' theory, 'More practice' questions and an Artificial Intelligence part" if cls >= 6
                 else "NEW in this edition: 'Learn it' theory before every chapter and 'More practice' questions after it") if practice_dir
                else "NEW in this edition: a 'Learn it' theory page before every chapter")
        tw = pdfmetrics.stringWidth(text, "InterB", 10)
        y = h - STYLE["badge_top"]
        c.setFillColor(HexColor("#f97316"))
        c.roundRect((w - tw) / 2 - 14, y - 7, tw + 28, 22, 11, stroke=0, fill=1)
        c.setFillColor(HexColor("#ffffff"))
        c.setFont("InterB", 10)
        c.drawCentredString(w / 2, y, text)
    c.save()
    buf.seek(0)
    return PdfReader(buf).pages[0]


# Corrections printed over the original pages: answer-key solutions that showed raw lists such as "[1, 3, 4, 6, 7]".
# Each entry: (text of the line from the "[" on, as printed) -> replacement.
CORRECTIONS = {
    4: {"[1, 5, 7, 9]; 3 never appears.": "1, 5, 7 and 9; 3 never appears.", "[1, 3, 5, 9]; 7 never appears.": "1, 3, 5 and 9; 7 never appears.",
        "[1, 3, 4, 6, 7].": "1, 3, 4, 6 and 7 — that is 5 values.", "[3, 6, 8].": "3, 6 and 8 — that is 3 values.",
        "[7, 9] work. That is 2 numbers.": "7 and 9 work. That is 2 numbers.", "[2, 4] work. That is 2 numbers.": "2 and 4 work. That is 2 numbers."},
    6: {"[7, 4, 9, 3] (in some order): two of them add up to a third, and the remaining digit is": "7, 4, 9 and 3 (in some order): two of them add up to a third, and the remaining digit is",
        "[6, 9, 2, 3] (in some order): two of them multiply to give a third, and the remaining": "6, 9, 2 and 3 (in some order): two of them multiply to give a third, and the remaining"},
}


def correction_overlay(path, page_index, w, h):
    """Covers each listed text and prints the corrected text in the same place, size and colours."""
    fixes = CORRECTIONS.get(cls)
    if not fixes:
        return None, 0
    xml = subprocess.run(["pdftotext", "-bbox-layout", "-f", str(page_index), "-l", str(page_index), path, "-"], capture_output=True, text=True).stdout
    todo = []
    for line in re.findall(r"<line [^>]*>(.*?)</line>", xml, re.S):
        words = [(float(a), float(b), float(c), float(d), html.unescape(t)) for a, b, c, d, t in re.findall(r'<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">(.*?)</word>', line)]
        text = " ".join(x[4] for x in words)
        for old, new in fixes.items():
            if old in text:
                k = next(i for i, x in enumerate(words) if x[4].startswith("["))
                todo.append((words, k, new))
    if not todo:
        return None, 0
    png = subprocess.run(["pdftoppm", "-r", "72", "-f", str(page_index), "-l", str(page_index), "-png", path], capture_output=True).stdout
    img = Image.open(io.BytesIO(png)).convert("RGB")
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=(w, h))
    for words, k, new in todo:
        x0, y0, _, y1, _ = words[k]
        x1 = words[-1][2]
        # Font size from a long word on the line; colours sampled from the page.
        ref = max(words, key=lambda x: x[2] - x[0])
        size = (ref[2] - ref[0]) / pdfmetrics.stringWidth(ref[4], "InterR", 1)
        bg = img.getpixel((max(0, int(x0) - 3), int((y0 + y1) / 2)))
        ink = min((img.getpixel((int(xx), int(yy))) for xx in range(int(ref[0]), int(ref[2])) for yy in range(int(y0), int(y1))), key=sum)
        c.setFillColorRGB(*[v / 255 for v in bg])
        c.rect(x0 - 0.8, h - y1 + 1, x1 - x0 + 2.5, y1 - y0 - 2, stroke=0, fill=1)
        c.setFillColorRGB(*[v / 255 for v in ink])
        c.setFont("InterR", size)
        c.drawString(x0, h - (y0 + (y1 - y0) * 0.72), new)
    c.save()
    buf.seek(0)
    return PdfReader(buf).pages[0], len(todo)


AI_TITLES = {
    6: ["Introduction to Artificial Intelligence and Everyday Examples", "Basic Data Concepts", "Simple Pattern Recognition and Decision Making", "Ethics and Digital Responsibility"],
    7: ["AI Domains and Applications", "AI in Industries", "Data Visualization and Analysis", "Ethics and AI Bias Awareness"],
    8: ["AI Project Lifecycle", "Artificial Intelligence and Its Applications", "Data and Fairness in AI", "Ethics and Responsible AI"],
}


def page_blocks(path, page_index):
    xml = subprocess.run(["pdftotext", "-bbox-layout", "-f", str(page_index), "-l", str(page_index), path, "-"], capture_output=True, text=True).stdout
    out = []
    for a, b, c2, d, body in re.findall(r'<block xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">(.*?)</block>', xml, re.S):
        attrs = (float(a), float(b), float(c2), float(d))
        words = [(float(a), float(b), float(c), float(d), html.unescape(t)) for a, b, c, d, t in re.findall(r'<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">(.*?)</word>', body)]
        out.append((attrs, " ".join(x[4] for x in words), words))
    return out


def student_overlay(path, page_index, w, h):
    """Student edition: hides notes for teachers and question counts; lists the AI chapters (Classes 6–8)."""
    if page_index > 3 and not any(p == page_index for p in starts.values()):
        return None
    blocks = page_blocks(path, page_index)
    targets = [b for b in blocks if b[1].startswith("For teachers:") or b[1].startswith("Twice as many questions") or re.fullmatch(r"\d+ questions", b[1])]
    edition = next((b for b in blocks if b[1].startswith("Complete edition:")), None) if cls >= 6 else None
    contents = [b for b in blocks if re.fullmatch(r"\d+ questions", b[1])] if page_index == 2 else []
    if not targets and not edition:
        return None
    png = subprocess.run(["pdftoppm", "-r", "72", "-f", str(page_index), "-l", str(page_index), "-png", path], capture_output=True).stdout
    img = Image.open(io.BytesIO(png)).convert("RGB")
    px = lambda x, y: img.getpixel((min(img.width - 1, max(0, int(x))), min(img.height - 1, max(0, int(y)))))
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=(w, h))
    for (x0, y0, x1, y1), text, _ in targets:
        pill = re.fullmatch(r"\d+ questions", text) and page_index != 2
        pad = 7 if pill else 1.5
        bg = px(x1 + 12, (y0 + y1) / 2) if pill else px(x1 + 6, (y0 + y1) / 2) if re.fullmatch(r"\d+ questions", text) else px(x0 - 4, y0 - 3)
        c.setFillColorRGB(*[v / 255 for v in bg])
        c.rect(x0 - pad, h - y1 - (3 if pill else 1), x1 - x0 + 2 * pad, y1 - y0 + (6 if pill else 2), stroke=0, fill=1)
    if edition:
        (x0, y0, x1, y1), text, words = edition
        bg = px(x0 - 6, (y0 + y1) / 2)
        c.setFillColorRGB(*[v / 255 for v in bg])
        c.rect(x0 - 2, h - y1, x1 - x0 + 4, y1 - y0, stroke=0, fill=1)
        ink = min((px(xx, yy) for xx in range(int(x0), int(x1)) for yy in range(int(y0), int(y1))), key=sum)
        size = (x1 - x0) / pdfmetrics.stringWidth(text, "InterB", 1)
        new = f"{text} and AI Chapters 1 to 4"
        c.setFillColorRGB(*[v / 255 for v in ink])
        c.setFont("InterB", size)
        c.drawCentredString((x0 + x1) / 2, h - (y0 + (y1 - y0) * 0.72), new)
    if contents and cls >= 6:
        # Add the AI chapters under the chapter list, in the same row style.
        rows = sorted(b[0][1] for b in contents)
        step = rows[-1] - rows[-2]
        last = next(b for b in blocks if b[1] == "The Other Side of Zero" or (abs(b[0][1] - rows[-1]) < 1 and b[0][0] < 300 and b[0][0] > 60))
        num_x = min(b[0][0] for b in blocks if abs(b[0][1] - rows[-1]) < 1)
        title_x = last[0][0]
        size = (last[0][2] - last[0][0]) / pdfmetrics.stringWidth(last[1], "InterR", 1)
        ink = min((px(xx, yy) for xx in range(int(title_x), int(last[0][2])) for yy in range(int(last[0][1]), int(last[0][3]))), key=sum)
        y = rows[-1] + step + 6
        c.setFillColorRGB(*[v / 255 for v in ink])
        c.setFont("InterB", size + 1)
        c.drawString(num_x, h - (y + step * 0.6), "Artificial Intelligence")
        for k, title in enumerate(AI_TITLES[cls]):
            yy = y + step * (k + 1)
            c.setStrokeColor(HexColor("#e2e8f0"))
            c.setLineWidth(0.6)
            c.line(num_x, h - yy + 1, 550, h - yy + 1)
            c.setFont("InterR", size)
            c.drawString(num_x, h - (yy + step * 0.6), f"AI {k + 1}")
            c.drawString(title_x, h - (yy + step * 0.6), title)
    c.save()
    buf.seek(0)
    return PdfReader(buf).pages[0]


def cbse_counts():
    """Questions per chapter in the CBSE edition: the CBSE handbook questions plus as many help-book questions."""
    import json
    summary = json.load(open(f"{cbse_dir}/cbse-edition.json"))
    return {int(k.split("-")[1]): v["cbse"] + v["helpbook"] for k, v in summary.items() if k.startswith(f"{cls}-")}


def cbse_front_overlay(path, page_index, w, h, counts):
    """CBSE edition: new question counts and wording on the cover and the "How to use" / contents page."""
    blocks = page_blocks(path, page_index)
    total = sum(counts.values())
    cover = f"The CBSE handbook questions with Teacher Handbook solutions, and as many help-book questions on the same ideas ({total} in all)."
    teachers = (f"For teachers: each chapter follows the matching chapter of the Class {cls} Maths book and the CBSE handbook. "
                "It has the CBSE questions, then one help-book question on the same idea for each; worked solutions are at the end of each chapter.")
    todo = []
    for b in blocks:
        if b[1].startswith("Twice as many questions"):
            todo.append((b, cover, "centre"))
        elif b[1].startswith("For teachers:"):
            todo.append((b, teachers, "left"))
    rows = sorted((b for b in blocks if re.fullmatch(r"\d+ questions", b[1])), key=lambda b: b[0][1]) if page_index <= 3 else []
    for k, b in enumerate(rows, start=1):
        if k in counts:
            todo.append((b, f"{counts[k]} questions", "right"))
    if not todo:
        return None
    png = subprocess.run(["pdftoppm", "-r", "72", "-f", str(page_index), "-l", str(page_index), "-png", path], capture_output=True).stdout
    img = Image.open(io.BytesIO(png)).convert("RGB")
    px = lambda x, y: img.getpixel((min(img.width - 1, max(0, int(x))), min(img.height - 1, max(0, int(y)))))
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=(w, h))
    for ((x0, y0, x1, y1), text, words), new, align in todo:
        lines = max(1, len({round(wd[1]) for wd in words}))
        ref = max(words, key=lambda wd: wd[2] - wd[0])
        size = (ref[2] - ref[0]) / pdfmetrics.stringWidth(ref[4], "InterR", 1)
        ink = min((px(xx, yy) for xx in range(int(ref[0]), int(ref[2])) for yy in range(int(ref[1]), int(ref[3]))), key=sum)
        bg = px(x0 - 3, y0 - 2) if align != "right" else px(x1 + 4, (y0 + y1) / 2)
        c.setFillColorRGB(*[v / 255 for v in bg])
        c.rect(x0 - 1.5, h - y1 - 1, x1 - x0 + 3, y1 - y0 + 2, stroke=0, fill=1)
        c.setFillColorRGB(*[v / 255 for v in ink])
        # Wrap into the block's width; shrink the type a little if the text needs more lines than the block has.
        width = x1 - x0 if align != "right" else 200
        while True:
            out_lines, cur = [], ""
            for word in new.split():
                t = f"{cur} {word}".strip()
                if pdfmetrics.stringWidth(t, "InterR", size) > width and cur:
                    out_lines.append(cur)
                    cur = word
                else:
                    cur = t
            out_lines.append(cur)
            if len(out_lines) <= lines or size < 5:
                break
            size *= 0.97
        step = (y1 - y0) / lines
        c.setFont("InterR", size)
        for k, line in enumerate(out_lines):
            yb = h - (y0 + step * k + step * 0.74)
            if align == "centre":
                c.drawCentredString((x0 + x1) / 2, yb, line)
            elif align == "right":
                c.drawRightString(x1, yb, line)
            else:
                c.drawString(x0, yb, line)
    c.save()
    buf.seek(0)
    return PdfReader(buf).pages[0]


orig = PdfReader(src)
n, starts = chapter_starts(src)
assert sorted(starts) == list(range(1, len(starts) + 1)), f"chapter starts not found cleanly: {starts}"
keys = answer_key_pages(src, n) if practice_dir and not cbse_dir else {}
if practice_dir and not cbse_dir:
    assert sorted(keys) == sorted(starts), f"answer keys not found for every chapter: {keys}"
# The last page of each chapter: the page before the next chapter starts (or the last page of the book).
ends = {ch: (starts[ch + 1] - 1 if ch + 1 in starts else n) for ch in starts}
writer = PdfWriter()
page_no = 0
inserted = {"theory": 0, "practice": 0, "keys": 0, "answers": 0, "corrections": 0, "ai": 0}
replaced = 0


def add_new(path, kind, footer=None):
    global page_no
    for tp in PdfReader(path).pages:
        page_no += 1
        inserted[kind] += 1
        w, h = float(tp.mediabox.width), float(tp.mediabox.height)
        tp.merge_page(overlay(w, h, page_no, with_footer_text=True, footer=footer))
        writer.add_page(tp)


counts = cbse_counts() if cbse_dir else {}
if cbse_dir:
    assert sorted(counts) == sorted(starts), f"CBSE pages missing for some chapters: {sorted(counts)}"
for i, page in enumerate(orig.pages, start=1):
    chapter = next((ch for ch, p in starts.items() if p == i), None)
    if chapter:
        add_new(f"{theory_dir}/c{cls}-ch{chapter:02d}.pdf", "theory")
    if cbse_dir:
        # The chapter's original question pages and answer key make way for the CBSE edition pages.
        if chapter:
            add_new(f"{cbse_dir}/c{cls}-ch{chapter:02d}-cbse.pdf", "practice")
            add_new(f"{cbse_dir}/c{cls}-ch{chapter:02d}-cbse-key.pdf", "keys")
        if any(starts[ch] <= i <= ends[ch] for ch in starts):
            replaced += 1
            continue
        page_no += 1
        w, h = float(page.mediabox.width), float(page.mediabox.height)
        front = cbse_front_overlay(src, i, w, h, counts)
        if front:
            page.merge_page(front)
        page.merge_page(overlay(w, h, page_no, with_footer_text=False, badge=(i == 1)))
        writer.add_page(page)
        continue
    key_of = next((ch for ch, p in keys.items() if p == i), None)
    if key_of:
        add_new(f"{practice_dir}/c{cls}-ch{key_of:02d}-practice.pdf", "practice")
        # The chapter's answer key, now with worked solutions in the CBSE Teacher Handbook style, replaces the old key.
        add_new(f"{practice_dir}/c{cls}-ch{key_of:02d}-key.pdf", "keys")
    in_old_key = practice_dir and any(p <= i <= ends[ch] for ch, p in keys.items())
    end_of = next((ch for ch, p in ends.items() if p == i), None)
    if in_old_key:
        replaced += 1
        if end_of:
            add_new(f"{practice_dir}/c{cls}-ch{end_of:02d}-answers.pdf", "answers")
        continue
    page_no += 1
    w, h = float(page.mediabox.width), float(page.mediabox.height)
    clean = student_overlay(src, i, w, h) if practice_dir else None
    if clean:
        page.merge_page(clean)
    fix, nfix = correction_overlay(src, i, w, h)
    if fix:
        page.merge_page(fix)
        inserted["corrections"] += nfix
    page.merge_page(overlay(w, h, page_no, with_footer_text=False, badge=(i == 1)))
    writer.add_page(page)
    if practice_dir and end_of:
        add_new(f"{practice_dir}/c{cls}-ch{end_of:02d}-answers.pdf", "answers")

# The Artificial Intelligence part (Classes 6–8): a part page, then for each AI chapter its theory, practice and answers.
if practice_dir and cls >= 6:
    ai_footer = f"Artificial Intelligence · Help Book · Class {cls}"
    add_new(f"{practice_dir}/c{cls}-ai-part.pdf", "ai", ai_footer)
    for k in range(1, 5):
        add_new(f"{theory_dir}/c{cls}-ai{k:02d}.pdf", "ai", ai_footer)
        add_new(f"{practice_dir}/c{cls}-ai{k:02d}-practice.pdf", "ai", ai_footer)
        add_new(f"{practice_dir}/c{cls}-ai{k:02d}-answers.pdf", "ai", ai_footer)

# Merging page overlays copies shared fonts and images onto each page; de-duplicate them again.
for pg in writer.pages:
    pg.compress_content_streams()
writer.compress_identical_objects(remove_duplicates=True, remove_unreferenced=True)
writer.add_metadata({"/Title": f"Think, Play & Solve · Help Book · Class {cls} ({'CBSE edition: CBSE handbook questions and matching help-book questions' if cbse_dir else 'new edition: Learn it theory and More practice' if practice_dir else 'with Learn it theory'})"})
with open(out, "wb") as f:
    writer.write(f)
if cbse_dir:
    print(f"Class {cls}: {n - replaced} front pages + {inserted['theory']} theory + {inserted['practice']} question pages + {inserted['keys']} worked-solution pages + {inserted['ai']} AI-part pages = {page_no} pages; {sum(counts.values())} chapter questions -> {out}")
    sys.exit(0)
print(f"Class {cls}: {n - replaced} original (old answer keys replaced: {replaced}) + {inserted['theory']} theory + {inserted['practice']} practice + {inserted['keys']} worked-solution key + {inserted['answers']} answer-key pages + {inserted['ai']} AI-part pages = {page_no} pages ({inserted['corrections']} corrected lines) -> {out}")
