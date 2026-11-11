# Importing the CBSE handbook questions

The CBSE CT & AI questions on the platform come from CBSE's Student and Teacher Handbooks (2026-27).
The handbooks are not stored in this repository.

The scripts need Python with `pypdf` and `Pillow`, plus poppler-utils (`pdftotext`, `pdftoppm`).

1. **Merge split handbooks:** if a Teacher Handbook comes in two parts, merge them into one PDF (pypdf `PdfWriter.append`).
2. **Extract the CT questions:** run this for each class (3–8):

   ```bash
   python3 th_extract.py CTAI_Pri6TH_2026-27.pdf 6 out
   ```

   It writes `out/th6.json` (question, options, CBSE answer, solution) and figure crops in `out/img`.
3. **Clean the crops:** removes box borders and stray marks:

   ```bash
   python3 clean.py
   ```

   Run it in the folder that holds `out/`.
4. **Write the platform data:** writes `web/prisma/content/cbse/ct.json` and `web/public/cbse/*.webp`:

   ```bash
   python3 convert.py ../../web
   ```

5. **Load the data:** reseed with `npm run seed`.

The AI-chapter exercises are typed in by hand in `web/prisma/content/cbse/ai6.ts`, `ai7.ts` and `ai8.ts`, because their layout varies between books.

Look through the figure crops after importing a new edition. Every imported question starts as "not yet reviewed" in the review queue.
