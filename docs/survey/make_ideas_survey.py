"""Teacher Ideas Survey: for teachers who have NOT used the platform. Asks what content, design and tools they want.

Usage: python3 make_ideas_survey.py Teacher-Ideas-Survey.pdf fonts
Shares the page layout and form helpers with make_survey.py.
"""
import sys
from make_survey import Doc, M, W, H, CW, INK, BODY, MUTED, BRAND, BRAND_DARK, TINT, TINT2, ACCENT, white, HexColor

IMPORTANCE = ["Not needed", "Nice to have", "Important", "Essential", "Not sure"]


def cover(d):
    c = d.c
    band = 196
    c.setFillColor(BRAND_DARK); c.rect(0, H - band, W, band, stroke=0, fill=1)
    cx, cy = W - 92, H - 96
    for r, col in [(66, HexColor("#34319a")), (48, HexColor("#3f3cbb")), (30, HexColor("#5a57d6")), (12, ACCENT)]:
        c.setFillColor(col); c.circle(cx, cy, r, stroke=0, fill=1)
    c.setFillColor(ACCENT); c.rect(M, H - 62, 34, 4, stroke=0, fill=1)
    c.setFont("Inter-SemiBold", 9); c.setFillColor(HexColor("#c9c8ff"))
    c.drawString(M, H - 50, "HITBULLSEYE  ·  CT & AI PLATFORM  ·  CBSE CLASSES 3–8")
    c.setFont("InterDisplay-ExtraBold", 30); c.setFillColor(white)
    c.drawString(M, H - 100, "Teacher Ideas")
    c.drawString(M, H - 134, "Survey")
    c.setFont("Inter-Regular", 10.5); c.setFillColor(HexColor("#e2e1ff"))
    c.drawString(M, H - 160, "You haven’t used our platform yet. Tell us what it should include.")
    c.drawString(M, H - 175, "About 12 minutes  ·  Every question is optional  ·  Your answers stay confidential")
    d.y = H - band - 14

    # What we're building
    top = d.y
    c.setFillColor(TINT); c.roundRect(M, top - 74, CW, 74, 8, stroke=0, fill=1)
    c.setFont("Inter-Bold", 9.5); c.setFillColor(BRAND_DARK); c.drawString(M + 12, top - 18, "What we are building")
    d.wrap_at("An online platform for the CBSE Computational Thinking & AI curriculum, Classes 3 to 8. Students practise "
              "chapter by chapter with puzzles and picture questions, do projects and earn rewards. Teachers set tests and "
              "homework and see reports. We want to build what teachers like you actually need.",
              "Inter-Regular", 8.8, M + 12, top - 33, CW - 24, lead=12)
    d.y = top - 74 - 8

    # How to fill in
    top = d.y
    bh = 92
    c.setFillColor(TINT2); c.roundRect(M, top - bh, CW, bh, 8, stroke=0, fill=1)
    col = (CW - 30) / 2
    c.setFont("Inter-Bold", 9.5); c.setFillColor(BRAND_DARK)
    c.drawString(M + 12, top - 18, "On a computer")
    c.drawString(M + 18 + col, top - 18, "On paper")
    d.wrap_at("Open it in Adobe Acrobat Reader, Microsoft Edge or Google Chrome. Click to choose, type in the white boxes, then save and send it back.", "Inter-Regular", 8.6, M + 12, top - 32, col - 6, lead=11.5)
    d.wrap_at("Print it, tick and write in the spaces, then hand it over or send a clear photo of every page.", "Inter-Regular", 8.6, M + 18 + col, top - 32, col - 6, lead=11.5)
    c.setFont("Inter-Bold", 8.6); c.setFillColor(INK)
    c.drawString(M + 12, top - bh + 14, "Please return by:")
    d.text_field("return_by", M + 95, top - bh + 8, 110, 17, tooltip="Return date")
    c.drawString(M + 220, top - bh + 14, "Send to:")
    d.text_field("return_to", M + 262, top - bh + 8, CW - 274, 17, tooltip="Who to send the completed form to")
    d.y = top - bh - 8
    d.para("In the tables, tick how important each item is to you. Choose Not sure if you have no view.", size=8.6, color=MUTED, gap_after=0)


def build(path):
    d = Doc(path)
    d.name = "Teacher Ideas Survey"
    d.split_room = 150
    d.c.setTitle("Teacher Ideas Survey: Hitbullseye CT & AI")
    d.c.setSubject("What teachers want from a CT & AI learning platform")
    cover(d)

    # ---------- A ----------
    d.section("A", "About you and your school")
    half = (CW - 22 - 12) / 2
    for left, right in [(("A_school", "School name"), ("A_city", "City / town")), (("A_name", "Your name (optional)"), ("A_contact", "Email or phone (optional, for a follow-up call)"))]:
        y0 = d.y
        d.line_field(left[0], left[1], w=half)
        ya = d.y
        d.y = y0
        d.line_field(right[0], right[1], x=M + 22 + half + 12, w=half)
        d.y = min(ya, d.y)
    items = ["CBSE", "ICSE / ISC", "State board", "IB / Cambridge"]
    d.qlabel("A1", "Which board does your school follow?", keep=Doc.options_height(items, cols=4, other=True))
    d.options("A1", items, kind="radio", cols=4, other=True)
    items = ["Private", "Government", "Government-aided", "Kendriya / Navodaya Vidyalaya"]
    d.qlabel("A2", "What type of school is it?", keep=Doc.options_height(items, cols=4))
    d.options("A2", items, kind="radio", cols=4)
    items = ["Computer Science / ICT", "Mathematics", "EVS / Science", "English", "Primary class teacher (all subjects)", "Coordinator / head of department"]
    d.qlabel("A3", "Which subjects do you teach?", keep=Doc.options_height(items, cols=3, other=True))
    d.options("A3", items, cols=3, other=True)
    items = ["Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8"]
    d.qlabel("A4", "Which classes do you teach?", keep=Doc.options_height(items, cols=6))
    d.options("A4", items, cols=6)
    items = ["Less than 2", "2–5", "6–10", "11–20", "More than 20"]
    d.qlabel("A5", "How many years have you been teaching?", keep=Doc.options_height(items, cols=5))
    d.options("A5", items, kind="radio", cols=5)

    # ---------- B ----------
    d.section("B", "How Computational Thinking and AI are taught today")
    items = ["Not taught yet", "Taught within Computer / ICT periods", "Separate CT / AI periods", "Through Maths or other subjects", "As a club or activity"]
    d.qlabel("B1", "How does your school teach Computational Thinking and AI now?", "Tick all that apply.", keep=Doc.options_height(items, cols=3))
    d.options("B1", items, cols=3)
    items = ["CBSE handbooks", "A publisher’s textbook", "Another app or website", "Our own material", "YouTube and free resources", "Nothing yet"]
    d.qlabel("B2", "What do you use to teach it?", "Tick all that apply.", keep=Doc.options_height(items, cols=3, other=True))
    d.options("B2", items, cols=3, other=True)
    items = ["Not confident", "A little confident", "Fairly confident", "Very confident"]
    d.qlabel("B3", "How confident do you feel teaching these topics?", keep=Doc.options_height(items, cols=4))
    d.options("B3", items, kind="radio", cols=4)
    items = ["Not enough periods", "Few good resources", "Students find it abstract", "Mixed abilities in one class", "Not enough devices", "Internet problems", "Hard to assess thinking skills", "Need training myself", "Syllabus is new to us"]
    d.qlabel("B4", "What are your biggest challenges?", "Tick all that apply.", keep=Doc.options_height(items, cols=3, other=True))
    d.options("B4", items, cols=3, other=True)

    # ---------- C ----------
    rows = [
        ("C1", "Practice questions for every chapter, matched to the CBSE syllabus"),
        ("C2", "Step-by-step solutions and hints for every question"),
        ("C3", "Picture puzzles (grids, mirror images, patterns, charts)"),
        ("C4", "Unplugged activities that need no computer"),
        ("C5", "Group projects with clear steps and rubrics"),
        ("C6", "Block coding (e.g. Scratch) for younger classes"),
        ("C7", "Python basics for Classes 7–8"),
        ("C8", "Hands-on AI activities (e.g. teach a simple model to sort pictures)"),
        ("C9", "Examples from Indian daily life (markets, festivals, cricket, trains)"),
        ("C10", "Links to Maths, EVS, Science and English lessons"),
        ("C11", "Short explainer videos and animations"),
        ("C12", "Olympiad and competition practice"),
        ("C13", "Printable worksheets"),
        ("C14", "Lessons on online safety and responsible AI"),
    ]
    d.section("C", "Content you would like", keep=Doc.table_height(rows, IMPORTANCE))
    d.scale_table("C", rows, IMPORTANCE, title_note="How important is each one?")
    items = ["10–20", "20–40", "40–60", "More than 60", "Not sure"]
    d.qlabel("C15", "How many practice questions would you like per chapter?", keep=Doc.options_height(items, cols=5))
    d.options("C15", items, kind="radio", cols=5)
    items = ["Multiple choice", "True or false", "Fill in the blank", "Put steps in order", "Picture-based questions", "Logic puzzles and riddles", "Short written answers", "Open-ended challenges"]
    d.qlabel("C16", "Which kinds of questions work best with your students?", "Tick all that apply.", keep=Doc.options_height(items, cols=4))
    d.options("C16", items, cols=4)
    items = ["Mostly easy", "Balanced: easy, medium and hard", "Mostly challenging", "Adapts to each student"]
    d.qlabel("C17", "What level of difficulty suits your students?", keep=Doc.options_height(items, cols=4))
    d.options("C17", items, kind="radio", cols=4)
    d.qlabel("C18", "Any topics or activities you especially want to see?", keep=59)
    d.box_field("C18", lines=3, tooltip="Topics or activities you want to see")

    # ---------- D ----------
    rows = [
        ("D1", "Bright, colourful pages"),
        ("D2", "A friendly mascot or characters that guide students"),
        ("D3", "Points, badges and levels"),
        ("D4", "Avatars students can dress up"),
        ("D5", "Class or house challenges (teamwork, not ranking)"),
        ("D6", "Questions read aloud for young readers"),
        ("D7", "Very simple screens with big buttons for Classes 3–4"),
        ("D8", "Works on a phone as well as a computer"),
        ("D9", "Works with slow or patchy internet"),
        ("D10", "Instant feedback that explains mistakes"),
    ]
    d.section("D", "Design for students", keep=Doc.table_height(rows, IMPORTANCE))
    d.scale_table("D", rows, IMPORTANCE, title_note="How important is each one?")
    looks = ["Playful, like a cartoon", "Like a game", "Clean and modern", "Like a textbook"]
    d.qlabel("D11", "What look would suit Classes 3–5?", keep=Doc.options_height(looks, cols=4))
    d.options("D11", looks, kind="radio", cols=4)
    d.qlabel("D12", "What look would suit Classes 6–8?", keep=Doc.options_height(looks, cols=4))
    d.options("D12", looks, kind="radio", cols=4)
    items = ["Whole-class rankings", "Only the top few names", "Only their own progress", "No rankings at all"]
    d.qlabel("D13", "Should students see how they compare with classmates?", keep=Doc.options_height(items, cols=4))
    d.options("D13", items, kind="radio", cols=4)
    d.qlabel("D14", "Is there an app or website your students love? What do they like about it?", keep=44)
    d.box_field("D14", lines=2, tooltip="An app or website your students love, and why")

    # ---------- E ----------
    rows = [
        ("E1", "Make a test in minutes by choosing chapters and difficulty"),
        ("E2", "Printable question papers with answer keys"),
        ("E3", "Automatic marking"),
        ("E4", "Class reports showing weak topics"),
        ("E5", "Report for each student, by skill and chapter"),
        ("E6", "Set homework online and see who has done it"),
        ("E7", "Ready lesson plans for each chapter"),
        ("E8", "Classroom slides to project"),
        ("E9", "Reports to share with parents"),
        ("E10", "Add a whole class of students from a spreadsheet"),
        ("E11", "Mark open answers and projects with rubrics"),
        ("E12", "Lesson and progress updates on WhatsApp"),
    ]
    d.section("E", "Tools for teachers", keep=Doc.table_height(rows, IMPORTANCE))
    d.scale_table("E", rows, IMPORTANCE, title_note="How important is each one?")
    items = ["After every chapter", "Once a month", "Once a term", "Only for exams"]
    d.qlabel("E13", "How often would you test students on this subject?", keep=Doc.options_height(items, cols=4))
    d.options("E13", items, kind="radio", cols=4)
    items = ["On screen", "PDF to print", "Excel / spreadsheet", "Sent to parents"]
    d.qlabel("E14", "How would you like reports?", "Tick all that apply.", keep=Doc.options_height(items, cols=4))
    d.options("E14", items, cols=4)

    # ---------- F ----------
    d.section("F", "Practical details")
    items = ["Computer lab", "Smartboard / projector", "Laptops or tablets", "Phones at home", "Mostly printed sheets"]
    d.qlabel("F1", "Where would students use it?", "Tick all that apply.", keep=Doc.options_height(items, cols=3))
    d.options("F1", items, cols=3)
    items = ["Reliable", "Sometimes slow or drops", "Often unavailable", "No internet in class"]
    d.qlabel("F2", "How reliable is the internet where you teach?", keep=Doc.options_height(items, cols=4))
    d.options("F2", items, kind="radio", cols=4)
    items = ["None", "1", "2", "3 or more"]
    d.qlabel("F3", "How many periods a week could you give to it?", keep=Doc.options_height(items, cols=4))
    d.options("F3", items, kind="radio", cols=4)
    items = ["English only", "Hindi only", "English with Hindi support", "Another regional language"]
    d.qlabel("F4", "Which language should the content be in?", keep=Doc.options_height(items, cols=4, other=True))
    d.options("F4", items, kind="radio", cols=4, other=True)
    items = ["Short how-to videos", "Live online training", "In-school workshop", "Printed teacher manual", "WhatsApp / phone helpline", "Sample lesson recordings"]
    d.qlabel("F5", "What training or support would help you start?", "Tick all that apply.", keep=Doc.options_height(items, cols=3))
    d.options("F5", items, cols=3)

    # ---------- G ----------
    d.section("G", "Your priorities")
    items = ["Syllabus-matched practice", "Picture puzzles and games", "Projects", "Coding", "Hands-on AI activities", "Test generator", "Reports and analytics", "Homework", "Lesson plans and slides", "Parent updates", "Works offline / on phones", "Hindi or regional language"]
    d.qlabel("G1", "If we could build only three things first, which should they be?", "Tick up to three.", keep=Doc.options_height(items, cols=3))
    d.options("G1", items, cols=3)
    items = ["Too much screen time", "Student data privacy", "Cost", "Extra work for teachers", "Content not matching the syllabus", "Students sharing logins", "Advertisements"]
    d.qlabel("G2", "What would worry you about using a platform like this?", "Tick all that apply.", keep=Doc.options_height(items, cols=3, other=True))
    d.options("G2", items, cols=3, other=True)
    items = ["Free only", "Up to ₹200", "₹200–500", "₹500–1,000", "More than ₹1,000", "Not sure / not my decision"]
    d.qlabel("G3", "What might your school pay per student per year for a platform like this?", keep=Doc.options_height(items, cols=3))
    d.options("G3", items, kind="radio", cols=3)
    items = ["Principal", "Management / trust", "Coordinator or HOD", "Teachers", "Not sure"]
    d.qlabel("G4", "Who decides on buying learning platforms at your school?", "Tick all that apply.", keep=Doc.options_height(items, cols=5))
    d.options("G4", items, cols=5)
    d.qlabel("G5", "What would make you choose one platform over another?", keep=44)
    d.box_field("G5", lines=2, tooltip="What would make you choose one platform over another")
    d.qlabel("G6", "Any other ideas or advice for us?", keep=59)
    d.box_field("G6", lines=3, tooltip="Other ideas or advice")
    items = ["Yes", "Maybe", "No"]
    d.qlabel("G7", "Would you like to try the platform free with your class when it is ready?", keep=Doc.options_height(items, cols=3))
    d.options("G7", items, kind="radio", cols=3)

    # Thank-you
    c = d.c
    if d.y - 46 < 44:
        d.new_page()
    d.y -= 6
    c.setFillColor(BRAND_DARK); c.roundRect(M, d.y - 38, CW, 38, 9, stroke=0, fill=1)
    c.setFillColor(ACCENT); c.circle(M + 20, d.y - 19, 7, stroke=0, fill=1)
    c.setFont("InterDisplay-Bold", 13); c.setFillColor(white); c.drawString(M + 36, d.y - 23.5, "Thank you!")
    c.setFont("Inter-Regular", 8.8); c.setFillColor(HexColor("#dcdbff"))
    c.drawString(M + 112, d.y - 23, "Your ideas will shape what we build for teachers and students.")
    d.y -= 44
    d.save()
    print(f"pages={d.page} fields={d.fields}")


if __name__ == "__main__":
    build(sys.argv[1] if len(sys.argv) > 1 else "Teacher-Ideas-Survey.pdf")
