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

## Re-fitting figure crops

`cbse_refit.py` re-fits crops whose drawing touches an edge (list them with `../helpbooks/edgecheck.py`). It finds each crop on its Teacher Handbook page (FFT cross-correlation, numpy only), grows a side by at most 60 px (top 12 px) while the drawing continues, trims slivers of neighbouring text lines, and leaves a side as it was if it still touches at its limit (a frame or text, not a cut drawing).

```bash
python3 -I ../helpbooks/edgecheck.py edges.json ../../web/public/cbse/*.webp   # run from web/public for relative names
python3 -I cbse_refit.py <dir with TH3.pdf…TH8.pdf> ../../web edges.json report.json
```

`cbse_extend.py <TH dir> <web dir> <figure names…>` extends a picture-option crop down to the line before "Answer:" so every option row shows (used for `cbse-3-ct05-10` and `cbse-5-ct15-07`).
