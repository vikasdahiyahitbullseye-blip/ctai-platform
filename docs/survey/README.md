# Teacher feedback survey (PDF)

`Teacher-Feedback-Survey.pdf` is a 6-page A4 survey for teachers. It can be filled in on a computer (Adobe Acrobat Reader, Microsoft Edge or Google Chrome: click the circles and boxes, type in the fields, save and send back) or printed and filled by hand.

Sections: A About you · B Content quality (with a table for reporting wrong questions by code) · C Relevance and coverage · D Amount of content · E Design for students · F Teacher tools · G Fitting it into school life · H Training and support · I Overall (rating, likelihood to recommend 0–10, most valuable features, comments).

Before sending, fill in **Please return by** and **Send to** on page 1, then save a copy to share.

## Rebuilding it

Requires Python 3 with `reportlab` and `fonttools`, and the Inter font (`/usr/share/fonts/opentype/inter`).

```bash
python3 otf2ttf.py            # converts Inter to TrueType in ./fonts (ReportLab can't embed CFF fonts)
python3 make_survey.py Teacher-Feedback-Survey.pdf fonts
```

Questions live in `build()` in `make_survey.py`.
