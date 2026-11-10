"""Teacher feedback survey for the Hitbullseye CT & AI platform: a fillable, printable A4 PDF."""
import sys
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor, white, transparent
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import simpleSplit

FONTS = sys.argv[2] if len(sys.argv) > 2 else "fonts"
for n in ["Inter-Regular", "Inter-Medium", "Inter-SemiBold", "Inter-Bold", "Inter-Italic", "InterDisplay-Bold", "InterDisplay-ExtraBold"]:
    pdfmetrics.registerFont(TTFont(n, f"{FONTS}/{n}.ttf"))

# Palette (matches the app: indigo brand, orange XP accent)
INK = HexColor("#16163a")
BODY = HexColor("#2f3150")
MUTED = HexColor("#6b6f8a")
BRAND = HexColor("#3f3cbb")
BRAND_DARK = HexColor("#26237a")
TINT = HexColor("#eef0ff")
TINT2 = HexColor("#f6f7fc")
ACCENT = HexColor("#f2792a")
LINE = HexColor("#c9cce0")
FIELD_BG = HexColor("#fbfbff")

W, H = A4
M = 42  # side margin
TOP = H - 52
BOTTOM = 56
CW = W - 2 * M


class Doc:
    def __init__(self, path):
        self.c = canvas.Canvas(path, pagesize=A4)
        self.c.setTitle("Teacher Feedback Survey: Hitbullseye CT & AI")
        self.c.setAuthor("Hitbullseye")
        self.c.setSubject("Feedback from teachers on content, design and classroom use")
        self.page = 1
        self.y = TOP
        self.name = "Teacher Feedback Survey"  # shown in the running head and footer
        self.split_room = None  # if set, a table may split across pages when at least this much room is left
        self.fields = 0

    # ---------- page furniture ----------
    def footer(self):
        c = self.c
        c.setStrokeColor(LINE); c.setLineWidth(0.6); c.line(M, 38, W - M, 38)
        c.setFont("Inter-Regular", 7.5); c.setFillColor(MUTED)
        c.drawString(M, 26, f"Hitbullseye CT & AI  ·  {self.name}")
        c.drawRightString(W - M, 26, f"Page {self.page}")

    def running_head(self):
        c = self.c
        c.setFillColor(BRAND); c.rect(0, H - 10, W, 10, stroke=0, fill=1)
        c.setFillColor(ACCENT); c.rect(0, H - 10, 90, 10, stroke=0, fill=1)
        c.setFont("Inter-SemiBold", 8); c.setFillColor(MUTED)
        c.drawRightString(W - M, H - 30, self.name)

    def new_page(self):
        self.footer()
        self.c.showPage()
        self.page += 1
        self.running_head()
        self.y = TOP

    def need(self, h):
        if self.y - h < BOTTOM:
            self.new_page()

    # ---------- text ----------
    def para(self, text, font="Inter-Regular", size=9.5, color=BODY, lead=None, x=M, width=CW, gap_after=4):
        lead = lead or size * 1.42
        lines = simpleSplit(text, font, size, width)
        self.need(len(lines) * lead)
        c = self.c
        c.setFont(font, size); c.setFillColor(color)
        for ln in lines:
            self.y -= lead
            c.drawString(x, self.y + lead * 0.28, ln)
        self.y -= gap_after

    def wrap_at(self, text, font, size, x, y, width, color=BODY, lead=None):
        lead = lead or size * 1.35
        lines = simpleSplit(text, font, size, width)
        self.c.setFont(font, size); self.c.setFillColor(color)
        for i, ln in enumerate(lines):
            self.c.drawString(x, y - i * lead, ln)
        return len(lines) * lead

    # ---------- fields ----------
    def text_field(self, name, x, y, w, h, multiline=False, tooltip=""):
        self.fields += 1
        self.c.acroForm.textfield(name=name, tooltip=tooltip or name, x=x, y=y, width=w, height=h,
                                  fontName="Helvetica", fontSize=9 if multiline else 10, borderColor=LINE, fillColor=FIELD_BG,
                                  textColor=INK, borderWidth=0.8, forceBorder=True, fieldFlags="multiline" if multiline else "")

    def checkbox(self, name, x, y, size=10, tooltip=""):
        self.fields += 1
        self.c.acroForm.checkbox(name=name, tooltip=tooltip or name, x=x, y=y, size=size, buttonStyle="check",
                                 borderColor=BRAND, fillColor=white, textColor=BRAND_DARK, borderWidth=0.9, forceBorder=True)

    def radio(self, name, value, x, y, size=10, tooltip=""):
        self.fields += 1
        # Draw the printed circle ourselves; the field on top is invisible until chosen (then a filled dot).
        c = self.c
        c.setStrokeColor(BRAND); c.setLineWidth(0.9); c.setFillColor(white)
        c.circle(x + size / 2, y + size / 2, size / 2 - 0.4, stroke=1, fill=1)
        c.acroForm.radio(name=name, value=value, tooltip=tooltip or f"{name}: {value}", x=x, y=y, size=size,
                         buttonStyle="circle", shape="square", borderColor=transparent, fillColor=transparent,
                         textColor=BRAND_DARK, borderWidth=0, forceBorder=False, selected=False)

    # ---------- blocks ----------
    @staticmethod
    def table_height(rows, scale, first_col=0.5):
        sw = CW * first_col
        cw = (CW - sw) / len(scale)
        hh = max(len(simpleSplit(x, "Inter-SemiBold", 7.4, cw - 4)) for x in scale) * 9 + 10
        return hh + sum(max(22, len(simpleSplit(t, "Inter-Regular", 8.8, sw - 30)) * 11.5 + 9) for _, t in rows) + 6

    def section(self, letter, title, intro=None, keep=110):
        """Section heading; `keep` = height of the first block, kept on the same page as the heading."""
        intro_h = len(simpleSplit(intro, "Inter-Regular", 8.8, CW)) * 12.5 + 4 if intro else 0
        room = self.y - BOTTOM
        if self.split_room and room >= self.split_room + 56 + intro_h:
            keep = min(keep, 120)  # plenty of room: start here and let the table split
        self.need(14 + 42 + intro_h + min(keep, TOP - BOTTOM - 80))
        self.y -= 14
        c = self.c
        top = self.y
        c.setFillColor(TINT); c.roundRect(M, top - 34, CW, 34, 8, stroke=0, fill=1)
        c.setFillColor(BRAND); c.roundRect(M + 8, top - 27, 20, 20, 5, stroke=0, fill=1)
        c.setFont("InterDisplay-Bold", 11); c.setFillColor(white); c.drawCentredString(M + 18, top - 21.5, letter)
        c.setFont("InterDisplay-Bold", 13.5); c.setFillColor(BRAND_DARK); c.drawString(M + 38, top - 22, title)
        self.y = top - 34 - 8
        if intro:
            self.para(intro, size=8.8, color=MUTED, gap_after=4)

    def qlabel(self, num, text, hint=None, keep=24):
        """Question label with its number in the margin column; `keep` = height of the answer area kept with it."""
        width = CW - 22
        lines = simpleSplit(text, "Inter-SemiBold", 9.8, width)
        hl = simpleSplit(hint, "Inter-Italic", 8.2, width) if hint else []
        self.need(len(lines) * 13.5 + len(hl) * 11 + 12 + keep)
        self.y -= 8
        c = self.c
        c.setFont("Inter-Bold", 9); c.setFillColor(ACCENT); c.drawString(M, self.y - 10, num)
        c.setFont("Inter-SemiBold", 9.8); c.setFillColor(INK)
        for i, ln in enumerate(lines):
            c.drawString(M + 22, self.y - 10 - i * 13.5, ln)
        self.y -= len(lines) * 13.5
        if hl:
            c.setFont("Inter-Italic", 8.2); c.setFillColor(MUTED)
            for i, ln in enumerate(hl):
                c.drawString(M + 22, self.y - 8 - i * 11, ln)
            self.y -= len(hl) * 11
        self.y -= 4

    def line_field(self, name, label=None, x=None, w=None, h=18):
        x = M + 22 if x is None else x
        w = (CW - 22) if w is None else w
        self.need(h + (12 if label else 0) + 4)
        if label:
            self.c.setFont("Inter-Medium", 8.2); self.c.setFillColor(MUTED); self.c.drawString(x, self.y - 9, label)
            self.y -= 12
        self.y -= h
        self.text_field(name, x, self.y, w, h, tooltip=label or name)
        self.y -= 4

    def box_field(self, name, lines=4, tooltip=""):
        h = lines * 15 + 8
        self.need(h + 6)
        self.y -= h
        self.text_field(name, M + 22, self.y, CW - 22, h, multiline=True, tooltip=tooltip)
        # faint writing lines for paper use
        c = self.c
        c.setStrokeColor(HexColor("#e6e8f3")); c.setLineWidth(0.5)
        for i in range(1, lines + 1):
            ly = self.y + h - 4 - i * 15
            if ly > self.y + 3:
                c.line(M + 28, ly, M + CW - 6, ly)
        self.y -= 6

    @staticmethod
    def options_height(items, cols=3, other=False):
        colw = (CW - 22) / cols
        rows = [items[i:i + cols] for i in range(0, len(items), cols)]
        return sum(max(len(simpleSplit(t, "Inter-Regular", 9, colw - 20)) for t in r) * 12 + 6 for r in rows) + (22 if other else 0)

    def options(self, name, items, kind="check", cols=3, other=False):
        """Tick-box (any) or radio (one) options in a grid."""
        colw = (CW - 22) / cols
        rows = [items[i:i + cols] for i in range(0, len(items), cols)]
        for row in rows:
            heights = [len(simpleSplit(t, "Inter-Regular", 9, colw - 20)) for t in row]
            rh = max(heights) * 12 + 6
            self.need(rh)
            for j, t in enumerate(row):
                x = M + 22 + j * colw
                idx = items.index(t)
                if kind == "check":
                    self.checkbox(f"{name}_{idx + 1}", x, self.y - 11, tooltip=t)
                else:
                    self.radio(name, f"opt{idx + 1}", x, self.y - 11, tooltip=t)
                self.wrap_at(t, "Inter-Regular", 9, x + 15, self.y - 9.5, colw - 20, lead=12)
            self.y -= rh
        if other:
            self.need(22)
            self.c.setFont("Inter-Regular", 9); self.c.setFillColor(BODY)
            self.c.drawString(M + 22, self.y - 12, "Other:")
            self.text_field(f"{name}_other", M + 58, self.y - 16, CW - 58, 16, tooltip="Other")
            self.y -= 22

    def scale_table(self, name, rows, scale, first_col=0.5, title_note=None):
        """A matrix: statement per row, one radio per scale column."""
        c = self.c
        sw = CW * first_col
        cw = (CW - sw) / len(scale)
        hdr_lines = max(len(simpleSplit(s, "Inter-SemiBold", 7.4, cw - 4)) for s in scale)
        hh = hdr_lines * 9 + 10

        def header():
            self.need(hh + 26)
            c.setFillColor(BRAND); c.roundRect(M, self.y - hh, CW, hh, 5, stroke=0, fill=1)
            c.setFillColor(white)
            c.setFont("Inter-SemiBold", 8)
            c.drawString(M + 8, self.y - hh / 2 - 3, title_note or "")
            for k, s in enumerate(scale):
                lines = simpleSplit(s, "Inter-SemiBold", 7.4, cw - 4)
                cx = M + sw + cw * k + cw / 2
                c.setFont("Inter-SemiBold", 7.4)
                start = self.y - (hh - len(lines) * 9) / 2 - 7
                for i, ln in enumerate(lines):
                    c.drawCentredString(cx, start - i * 9, ln)
            self.y -= hh

        row_h = [max(22, len(simpleSplit(t, "Inter-Regular", 8.8, sw - 30)) * 11.5 + 9) for _, t in rows]
        total = hh + sum(row_h) + 6
        if total < TOP - BOTTOM and not (self.split_room and self.y - BOTTOM >= self.split_room):
            self.need(total)  # keep a table that fits on one page in one piece
        header()
        for i, (code, text) in enumerate(rows):
            lines = simpleSplit(text, "Inter-Regular", 8.8, sw - 30)
            rh = max(22, len(lines) * 11.5 + 9)
            if self.y - rh < BOTTOM:
                self.new_page(); header()
            if i % 2 == 0:
                c.setFillColor(TINT2); c.rect(M, self.y - rh, CW, rh, stroke=0, fill=1)
            c.setFont("Inter-Bold", 8); c.setFillColor(ACCENT); c.drawString(M + 6, self.y - 13, code)
            self.wrap_at(text, "Inter-Regular", 8.8, M + 28, self.y - 13, sw - 30, lead=11.5)
            for k, s in enumerate(scale):
                cx = M + sw + cw * k + cw / 2
                self.radio(f"{name}_{code}", f"v{k + 1}", cx - 5.5, self.y - rh / 2 - 5.5, size=11, tooltip=f"{code} {text[:60]}: {s}")
            self.y -= rh
        c.setStrokeColor(LINE); c.setLineWidth(0.6); c.line(M, self.y, M + CW, self.y)
        self.y -= 6

    def grid_inputs(self, name, headers, widths, rows=4):
        """A small table of text inputs (e.g. error reports)."""
        c = self.c
        x0 = M + 22
        total = CW - 22
        ws = [total * w for w in widths]
        self.need(18 + rows * 22)
        c.setFillColor(TINT); c.rect(x0, self.y - 16, total, 16, stroke=0, fill=1)
        c.setFont("Inter-SemiBold", 7.8); c.setFillColor(BRAND_DARK)
        x = x0
        for hd, w in zip(headers, ws):
            c.drawString(x + 5, self.y - 11, hd); x += w
        self.y -= 18
        for r in range(rows):
            x = x0
            for k, w in enumerate(ws):
                self.text_field(f"{name}_r{r + 1}_c{k + 1}", x + 1, self.y - 19, w - 3, 18, tooltip=f"{headers[k]} (row {r + 1})")
                x += w
            self.y -= 22
        self.y -= 2

    def nps(self, name):
        c = self.c
        self.need(48)
        x0 = M + 22
        step = (CW - 22) / 11
        for k in range(11):
            cx = x0 + step * k + step / 2
            col = HexColor("#fde2e2") if k <= 6 else HexColor("#fff1d6") if k <= 8 else HexColor("#dcf5e5")
            c.setFillColor(col); c.roundRect(cx - step / 2 + 2, self.y - 34, step - 4, 34, 5, stroke=0, fill=1)
            c.setFont("Inter-Bold", 10); c.setFillColor(INK); c.drawCentredString(cx, self.y - 12, str(k))
            self.radio(name, f"n{k}", cx - 5.5, self.y - 29, size=11, tooltip=f"{k} out of 10")
        self.y -= 38
        c.setFont("Inter-Medium", 7.8); c.setFillColor(MUTED)
        c.drawString(x0, self.y - 8, "Not at all likely")
        c.drawRightString(M + CW, self.y - 8, "Extremely likely")
        self.y -= 14

    def stars(self, name):
        c = self.c
        self.need(36)
        x = M + 22
        labels = ["1  Poor", "2  Fair", "3  Good", "4  Very good", "5  Excellent"]
        for k, lab in enumerate(labels):
            bx = x + k * 96
            c.setFillColor(TINT2); c.roundRect(bx, self.y - 26, 90, 24, 6, stroke=0, fill=1)
            self.radio(name, f"s{k + 1}", bx + 7, self.y - 19.5, size=11, tooltip=lab)
            c.setFont("Inter-SemiBold", 8.8); c.setFillColor(INK); c.drawString(bx + 23, self.y - 17.5, lab)
        self.y -= 32

    def save(self):
        self.footer()
        self.c.save()


AGREE = ["Strongly disagree", "Disagree", "Not sure", "Agree", "Strongly agree", "Not used / N/A"]


def build(path):
    d = Doc(path)
    c = d.c

    # ---------- Cover band ----------
    band = 196
    c.setFillColor(BRAND_DARK); c.rect(0, H - band, W, band, stroke=0, fill=1)
    # simple target mark: rings echo the app logo
    cx, cy = W - 92, H - 96
    for r, col in [(66, HexColor("#34319a")), (48, HexColor("#3f3cbb")), (30, HexColor("#5a57d6")), (12, ACCENT)]:
        c.setFillColor(col); c.circle(cx, cy, r, stroke=0, fill=1)
    c.setFillColor(ACCENT); c.rect(M, H - 62, 34, 4, stroke=0, fill=1)
    c.setFont("Inter-SemiBold", 9); c.setFillColor(HexColor("#c9c8ff"))
    c.drawString(M, H - 50, "HITBULLSEYE  ·  CT & AI PLATFORM  ·  CBSE CLASSES 3–8")
    c.setFont("InterDisplay-ExtraBold", 30); c.setFillColor(white)
    c.drawString(M, H - 100, "Teacher Feedback")
    c.drawString(M, H - 134, "Survey")
    c.setFont("Inter-Regular", 10.5); c.setFillColor(HexColor("#e2e1ff"))
    c.drawString(M, H - 160, "Help us check and improve the questions, projects, design and teacher tools.")
    c.drawString(M, H - 175, "About 15 minutes  ·  Every question is optional  ·  Your answers stay confidential")
    d.y = H - band - 14

    # How to fill in
    top = d.y
    bh = 92
    c.setFillColor(TINT2); c.roundRect(M, top - bh, CW, bh, 8, stroke=0, fill=1)
    col = (CW - 30) / 2
    c.setFont("Inter-Bold", 9.5); c.setFillColor(BRAND_DARK)
    c.drawString(M + 12, top - 18, "On a computer")
    c.drawString(M + 18 + col, top - 18, "On paper")
    d.wrap_at("Open this file in Adobe Acrobat Reader, Microsoft Edge or Google Chrome. Click a circle or box to choose, type in the white boxes, then save the file and send it back.", "Inter-Regular", 8.6, M + 12, top - 32, col - 6, lead=11.5)
    d.wrap_at("Print it, tick the circles or boxes and write in the spaces. Then hand it over or send a clear photo or scan of every page.", "Inter-Regular", 8.6, M + 18 + col, top - 32, col - 6, lead=11.5)
    c.setFont("Inter-Bold", 8.6); c.setFillColor(INK)
    c.drawString(M + 12, top - bh + 14, "Please return by:")
    d.text_field("return_by", M + 95, top - bh + 8, 110, 17, tooltip="Return date")
    c.drawString(M + 220, top - bh + 14, "Send to:")
    d.text_field("return_to", M + 262, top - bh + 8, CW - 274, 17, tooltip="Who to send the completed form to")
    d.y = top - bh - 10

    d.para("When we ask you to agree or disagree, choose Not used / N/A if you have not used that part. Where a question mentions a feature you have not seen, a quick look in the app is enough; a guess is fine too.", size=8.6, color=MUTED, gap_after=0)

    # ---------- A. About you ----------
    d.section("A", "About you and your school")
    d.need(60)
    half = (CW - 22 - 12) / 2
    y0 = d.y
    d.line_field("A_school", "School name", w=half)
    yA = d.y
    d.y = y0
    d.line_field("A_city", "City / town", x=M + 22 + half + 12, w=half)
    d.y = min(yA, d.y)
    y0 = d.y
    d.line_field("A_name", "Your name (optional)", w=half)
    yA = d.y
    d.y = y0
    d.line_field("A_contact", "Email or phone (optional, for a follow-up call)", x=M + 22 + half + 12, w=half)
    d.y = min(yA, d.y)
    d.qlabel("A1", "Which subjects do you teach?", keep=Doc.options_height(["Computer Science / ICT", "Mathematics", "EVS / Science", "English", "Primary class teacher (all subjects)", "Coordinator / head of department"], cols=3, other=True))
    d.options("A1", ["Computer Science / ICT", "Mathematics", "EVS / Science", "English", "Primary class teacher (all subjects)", "Coordinator / head of department"], cols=3, other=True)
    d.qlabel("A2", "Which classes do you teach Computational Thinking or AI to?", keep=Doc.options_height(["Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8"], cols=6, other=False))
    d.options("A2", ["Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8"], cols=6)
    d.qlabel("A3", "How many years have you been teaching?", keep=Doc.options_height(["Less than 2", "2–5", "6–10", "11–20", "More than 20"], cols=5, other=False))
    d.options("A3", ["Less than 2", "2–5", "6–10", "11–20", "More than 20"], kind="radio", cols=5)
    d.qlabel("A4", "How much have you used the platform so far?", keep=Doc.options_height(["Not yet, only seen a demo", "Explored it on my own", "Used it with a class 1–3 times", "Use it with classes most weeks"], cols=2, other=False))
    d.options("A4", ["Not yet, only seen a demo", "Explored it on my own", "Used it with a class 1–3 times", "Use it with classes most weeks"], kind="radio", cols=2)
    d.qlabel("A5", "Which devices do your students use it on?", "Tick all that apply.", keep=Doc.options_height(["Computer lab desktops", "Smartboard / projector (whole class)", "Laptops", "Tablets", "Phones at home", "Printed worksheets only"], cols=3, other=False))
    d.options("A5", ["Computer lab desktops", "Smartboard / projector (whole class)", "Laptops", "Tablets", "Phones at home", "Printed worksheets only"], cols=3)
    d.qlabel("A6", "How reliable is the internet where you teach?", keep=Doc.options_height(["Reliable", "Sometimes slow or drops", "Often unavailable", "No internet in class"], cols=4, other=False))
    d.options("A6", ["Reliable", "Sometimes slow or drops", "Often unavailable", "No internet in class"], kind="radio", cols=4)

    # ---------- B. Content quality ----------
    d.section("B", "Content quality", "Practice questions, test questions, solutions and hints.", keep=Doc.table_height([
        ("B1", "Questions match the CBSE Computational Thinking & AI syllabus for each class."),
        ("B2", "Answers and worked solutions are correct."),
        ("B3", "The language is right for the age of my students."),
        ("B4", "The mix of easy, medium and hard questions is right."),
        ("B5", "Examples feel familiar to Indian students (names, places, money, festivals)."),
        ("B6", "Picture questions (grids, mirror images, charts, clocks) are clear and easy to read."),
        ("B7", "Questions marked “Generated” are as good as the hand-written ones."),
        ("B8", "Hints help students without giving the answer away."),
        ("B9", "Questions build real thinking skills, not just memory."),
    ], AGREE))
    d.scale_table("B", [
        ("B1", "Questions match the CBSE Computational Thinking & AI syllabus for each class."),
        ("B2", "Answers and worked solutions are correct."),
        ("B3", "The language is right for the age of my students."),
        ("B4", "The mix of easy, medium and hard questions is right."),
        ("B5", "Examples feel familiar to Indian students (names, places, money, festivals)."),
        ("B6", "Picture questions (grids, mirror images, charts, clocks) are clear and easy to read."),
        ("B7", "Questions marked “Generated” are as good as the hand-written ones."),
        ("B8", "Hints help students without giving the answer away."),
        ("B9", "Questions build real thinking skills, not just memory."),
    ], AGREE, title_note="Tick one circle in each row")
    d.qlabel("B10", "Did you find any mistakes? Please note them here.", "Each question shows a code such as C5-CT-G10-ABS-0041 in the teacher’s question bank. Wrong answers, unclear wording, confusing pictures or spelling errors all help.", keep=18 + 5 * 22)
    d.grid_inputs("B10", ["Question code", "Class & chapter", "What is wrong, and what it should be"], [0.24, 0.2, 0.56], rows=5)

    # ---------- C. Relevance and coverage ----------
    d.section("C", "Relevance and coverage", keep=Doc.table_height([
        ("C1", "The content covers every chapter I need to teach."),
        ("C2", "It prepares students for school tests and CBSE learning outcomes."),
        ("C3", "Links to Maths, EVS and other subjects are useful in my lessons."),
        ("C4", "The AI chapters (Classes 6–8) are up to date and easy to explain."),
        ("C5", "Projects fit our school year and can be done with our resources."),
    ], AGREE))
    d.scale_table("C", [
        ("C1", "The content covers every chapter I need to teach."),
        ("C2", "It prepares students for school tests and CBSE learning outcomes."),
        ("C3", "Links to Maths, EVS and other subjects are useful in my lessons."),
        ("C4", "The AI chapters (Classes 6–8) are up to date and easy to explain."),
        ("C5", "Projects fit our school year and can be done with our resources."),
    ], AGREE, title_note="Tick one circle in each row")
    d.qlabel("C6", "Which chapters or topics feel thin, missing or not relevant?", keep=59)
    d.box_field("C6", lines=3, tooltip="Chapters or topics that feel thin, missing or not relevant")
    d.qlabel("C7", "What would you like us to add?", "Tick all that apply.", keep=Doc.options_height(["Unplugged (no-computer) activities", "Block coding (e.g. Scratch)", "Python basics (Classes 7–8)", "More hands-on AI activities", "Ready lesson plans", "Classroom slides", "Short explainer videos", "Worksheets in Hindi", "Notes for parents", "Olympiad / competition practice", "Rubrics for projects", "Printable posters"], cols=3, other=True))
    d.options("C7", ["Unplugged (no-computer) activities", "Block coding (e.g. Scratch)", "Python basics (Classes 7–8)", "More hands-on AI activities", "Ready lesson plans", "Classroom slides", "Short explainer videos", "Worksheets in Hindi", "Notes for parents", "Olympiad / competition practice", "Rubrics for projects", "Printable posters"], cols=3, other=True)

    # ---------- D. Amount ----------
    d.section("D", "Amount of content", "Is there too little, about the right amount or too much of each?", keep=Doc.table_height([
        ("D1", "Practice questions per chapter (about 48, including 8 picture questions)"),
        ("D2", "Questions available for making tests"),
        ("D3", "Picture-based questions"),
        ("D4", "Projects per class"),
        ("D5", "Homework activities"),
        ("D6", "Teacher resources (guides, answer keys, worksheets)"),
        ("D7", "Puzzle of the Day and challenges"),
    ], ["Too little", "A bit less than needed", "About right", "A bit too much", "Too much", "Not used"], 0.46))
    d.scale_table("D", [
        ("D1", "Practice questions per chapter (about 48, including 8 picture questions)"),
        ("D2", "Questions available for making tests"),
        ("D3", "Picture-based questions"),
        ("D4", "Projects per class"),
        ("D5", "Homework activities"),
        ("D6", "Teacher resources (guides, answer keys, worksheets)"),
        ("D7", "Puzzle of the Day and challenges"),
    ], ["Too little", "A bit less than needed", "About right", "A bit too much", "Too much", "Not used"], first_col=0.46, title_note="Tick one circle in each row")

    # ---------- E. Design for students ----------
    d.section("E", "Design and ease of use for students", keep=Doc.table_height([
        ("E1", "The student pages look attractive for their age."),
        ("E2", "Students find their way around without much help."),
        ("E3", "Class 3–4 students can read and use it with little help."),
        ("E4", "Points, badges, avatars and houses keep students motivated."),
        ("E5", "Text size and colours are easy to read, also on a projector."),
        ("E6", "Pages load quickly on our devices and internet."),
        ("E7", "Feedback after each answer helps students learn from mistakes."),
    ], AGREE))
    d.scale_table("E", [
        ("E1", "The student pages look attractive for their age."),
        ("E2", "Students find their way around without much help."),
        ("E3", "Class 3–4 students can read and use it with little help."),
        ("E4", "Points, badges, avatars and houses keep students motivated."),
        ("E5", "Text size and colours are easy to read, also on a projector."),
        ("E6", "Pages load quickly on our devices and internet."),
        ("E7", "Feedback after each answer helps students learn from mistakes."),
    ], AGREE, title_note="Tick one circle in each row")
    d.qlabel("E8", "Anything students found confusing, boring or hard to use?", keep=59)
    d.box_field("E8", lines=3, tooltip="Anything students found confusing, boring or hard to use")

    # ---------- F. Teacher tools ----------
    d.section("F", "Tools for teachers", keep=Doc.table_height([
        ("F1", "The test generator saves me time."),
        ("F2", "Printed test papers and answer keys are ready to use."),
        ("F3", "The class dashboard shows me which students need help."),
        ("F4", "Setting and marking homework is manageable."),
        ("F5", "Running a project (teams, milestones, rubrics) is clear."),
        ("F6", "Adding classes and students is easy."),
        ("F7", "Chapter worksheets are useful in class."),
    ], AGREE))
    d.scale_table("F", [
        ("F1", "The test generator saves me time."),
        ("F2", "Printed test papers and answer keys are ready to use."),
        ("F3", "The class dashboard shows me which students need help."),
        ("F4", "Setting and marking homework is manageable."),
        ("F5", "Running a project (teams, milestones, rubrics) is clear."),
        ("F6", "Adding classes and students is easy."),
        ("F7", "Chapter worksheets are useful in class."),
    ], AGREE, title_note="Tick one circle in each row")
    d.qlabel("F8", "About how much time does the platform save you in a typical week?", keep=Doc.options_height(["None", "Less than 1 hour", "1–2 hours", "2–4 hours", "More than 4 hours"], cols=5, other=False))
    d.options("F8", ["None", "Less than 1 hour", "1–2 hours", "2–4 hours", "More than 4 hours"], kind="radio", cols=5)

    # ---------- G. Classroom fit ----------
    d.section("G", "Fitting it into school life")
    d.qlabel("G1", "How many periods a week does your timetable give to CT / AI?", keep=Doc.options_height(["None yet", "1", "2", "3 or more"], cols=4, other=False))
    d.options("G1", ["None yet", "1", "2", "3 or more"], kind="radio", cols=4)
    d.qlabel("G2", "Where would students mostly use it?", keep=Doc.options_height(["Computer lab", "Classroom on a smartboard", "At home", "A mix of these"], cols=4, other=False))
    d.options("G2", ["Computer lab", "Classroom on a smartboard", "At home", "A mix of these"], kind="radio", cols=4)
    d.qlabel("G3", "What makes it hard to use the platform more?", "Tick all that apply.", keep=Doc.options_height(["Not enough periods", "Not enough devices", "Internet problems", "Students forget logins", "Need more training", "Exam or syllabus pressure", "Language (students need Hindi)", "Parents not involved"], cols=3, other=True))
    d.options("G3", ["Not enough periods", "Not enough devices", "Internet problems", "Students forget logins", "Need more training", "Exam or syllabus pressure", "Language (students need Hindi)", "Parents not involved"], cols=3, other=True)
    d.qlabel("G4", "Which language should the content be in?", keep=Doc.options_height(["English only", "Hindi only", "English with Hindi support", "Another regional language"], cols=4, other=False))
    d.options("G4", ["English only", "Hindi only", "English with Hindi support", "Another regional language"], kind="radio", cols=4)

    # ---------- H. Training and support ----------
    d.section("H", "Training and support")
    d.qlabel("H1", "How confident do you feel teaching Computational Thinking and AI?", keep=Doc.options_height(["Not confident", "A little confident", "Fairly confident", "Very confident"], cols=4, other=False))
    d.options("H1", ["Not confident", "A little confident", "Fairly confident", "Very confident"], kind="radio", cols=4)
    d.qlabel("H2", "What support would help you most?", "Tick all that apply.", keep=Doc.options_height(["Short how-to videos", "Live online training", "In-school workshop", "Printed teacher manual", "WhatsApp / phone helpline", "Sample lesson recordings"], cols=3, other=True))
    d.options("H2", ["Short how-to videos", "Live online training", "In-school workshop", "Printed teacher manual", "WhatsApp / phone helpline", "Sample lesson recordings"], cols=3, other=True)

    # ---------- I. Overall ----------
    d.section("I", "Overall")
    d.qlabel("I1", "Overall, how would you rate the platform?", keep=56)
    d.stars("I1")
    d.qlabel("I2", "How likely are you to recommend it to a teacher at another school?", keep=56)
    d.nps("I2")
    d.qlabel("I3", "Which features are most valuable to you?", "Tick up to three.", keep=Doc.options_height(["Practice questions", "Picture questions", "Test generator", "Printed papers & answer keys", "Class dashboard & reports", "Homework", "Projects", "Puzzle of the Day", "Games: points, badges, avatars", "Links to other subjects", "Chapter worksheets", "Teacher resources"], cols=3, other=False))
    d.options("I3", ["Practice questions", "Picture questions", "Test generator", "Printed papers & answer keys", "Class dashboard & reports", "Homework", "Projects", "Puzzle of the Day", "Games: points, badges, avatars", "Links to other subjects", "Chapter worksheets", "Teacher resources"], cols=3)
    d.qlabel("I4", "If you could change one thing, what would it be?", keep=44)
    d.box_field("I4", lines=2, tooltip="One thing you would change")
    d.qlabel("I5", "Any other comments or ideas?", keep=59)
    d.box_field("I5", lines=3, tooltip="Other comments or ideas")
    d.qlabel("I6", "Would you be happy to try new features with your class and give feedback?", keep=Doc.options_height(["Yes", "Maybe", "No"], cols=3, other=False))
    d.options("I6", ["Yes", "Maybe", "No"], kind="radio", cols=3)

    # Thank-you (may sit closer to the footer than normal content)
    if d.y - 46 < 44:
        d.new_page()
    d.y -= 6
    c.setFillColor(BRAND_DARK); c.roundRect(M, d.y - 38, CW, 38, 9, stroke=0, fill=1)
    c.setFillColor(ACCENT); c.circle(M + 20, d.y - 19, 7, stroke=0, fill=1)
    c.setFont("InterDisplay-Bold", 13); c.setFillColor(white); c.drawString(M + 36, d.y - 23.5, "Thank you!")
    c.setFont("Inter-Regular", 8.8); c.setFillColor(HexColor("#dcdbff"))
    c.drawString(M + 112, d.y - 23, "Your answers go straight into improving what your students use.")
    d.y -= 44

    d.save()
    print(f"pages={d.page} fields={d.fields}")


if __name__ == "__main__":
    build(sys.argv[1] if len(sys.argv) > 1 else "survey.pdf")
