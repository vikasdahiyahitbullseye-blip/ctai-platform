"""Builds a help-book edition (Classes 3–8) with "Learn it" theory pages.

Inserts each chapter's theory PDF (made by web/scripts/theory-pages.ts) before that chapter's first page,
renumbers every page in the book's own footer style, adds the footer to the new pages, and puts a small
"New" badge on the cover.

Usage:
  python3 merge_helpbook.py <class> <original.pdf> <theoryDir> <out.pdf> <InterRegular.ttf> <InterBold.ttf>
"""
import io
import re
import subprocess
import sys

from pypdf import PdfReader, PdfWriter
from reportlab.lib.colors import Color, HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

cls, src, theory_dir, out, font_reg, font_bold = sys.argv[1:7]
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


def overlay(w, h, number, with_footer_text, badge=False):
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
        c.drawString(STYLE["footer_x"], baseline, FOOTER)
    if badge:
        text = "NEW in this edition: a 'Learn it' theory page before every chapter"
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


orig = PdfReader(src)
n, starts = chapter_starts(src)
assert sorted(starts) == list(range(1, len(starts) + 1)), f"chapter starts not found cleanly: {starts}"
writer = PdfWriter()
page_no = 0
inserted = 0
for i, page in enumerate(orig.pages, start=1):
    chapter = next((ch for ch, p in starts.items() if p == i), None)
    if chapter:
        theory = PdfReader(f"{theory_dir}/c{cls}-ch{chapter:02d}.pdf")
        for tp in theory.pages:
            page_no += 1
            inserted += 1
            w, h = float(tp.mediabox.width), float(tp.mediabox.height)
            tp.merge_page(overlay(w, h, page_no, with_footer_text=True))
            writer.add_page(tp)
    page_no += 1
    w, h = float(page.mediabox.width), float(page.mediabox.height)
    page.merge_page(overlay(w, h, page_no, with_footer_text=False, badge=(i == 1)))
    writer.add_page(page)

# Merging page overlays copies shared fonts and images onto each page; de-duplicate them again.
for pg in writer.pages:
    pg.compress_content_streams()
writer.compress_identical_objects(remove_duplicates=True, remove_unreferenced=True)
writer.add_metadata({"/Title": f"Think, Play & Solve · Help Book · Class {cls} (with Learn it theory)"})
with open(out, "wb") as f:
    writer.write(f)
print(f"Class {cls}: {n} original + {inserted} theory pages = {page_no} pages -> {out}")
