# Teacher surveys (PDF)

Two fillable, printable A4 surveys in the platform's colours:

| File | For | Pages |
|---|---|---|
| `Teacher-Feedback-Survey.pdf` | Teachers who **have used** the platform: rates content, design and tools, and reports wrong questions by code | 6 |
| `Teacher-Ideas-Survey.pdf` | Teachers who **have not seen** the platform: what content, design and tools they want, how important each is, practical constraints and priorities | 6 |

## Teacher feedback survey

`Teacher-Feedback-Survey.pdf` is a 6-page A4 survey for teachers. It can be filled in on a computer (Adobe Acrobat Reader, Microsoft Edge or Google Chrome: click the circles and boxes, type in the fields, save and send back) or printed and filled by hand.

Sections: A About you · B Content quality (with a table for reporting wrong questions by code) · C Relevance and coverage · D Amount of content · E Design for students · F Teacher tools · G Fitting it into school life · H Training and support · I Overall (rating, likelihood to recommend 0–10, most valuable features, comments).

## Teacher ideas survey

Sections: A About you and your school (board, school type) · B How CT and AI are taught today (resources, confidence, challenges) · C Content you would like (14 items rated Not needed / Nice to have / Important / Essential, plus amount, question types, difficulty) · D Design for students (10 items, preferred look for Classes 3–5 and 6–8, rankings) · E Tools for teachers (12 items, testing frequency, report formats) · F Practical details (devices, internet, periods, language, training) · G Your priorities (top three to build first, concerns, price per student, who decides, free pilot).

Before sending either survey, fill in **Please return by** and **Send to** on page 1, then save a copy to share.

## Rebuilding it

Requires Python 3 with `reportlab` and `fonttools`, and the Inter font (`/usr/share/fonts/opentype/inter`).

```bash
python3 otf2ttf.py            # converts Inter to TrueType in ./fonts (ReportLab can't embed CFF fonts)
python3 make_survey.py Teacher-Feedback-Survey.pdf fonts
python3 make_ideas_survey.py Teacher-Ideas-Survey.pdf fonts
```

Questions live in `build()` in each script.
