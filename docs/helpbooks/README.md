# Help books with "Learn it" theory (Classes 3–8)

The Classes 3–8 help books get a 1–2 page "Learn it" theory section before every chapter. The theory text is in
`web/prisma/content/theory/` (the same content the platform shows in modules and class slides). The original help-book PDFs are not stored in this repository.

## Rebuild the books

1. Render the theory pages (one PDF per chapter, in the books' fonts and colours):

   ```bash
   cd web
   NODE_PATH=$(npm root -g) npx tsx scripts/theory-pages.ts ../out/theory
   ```

   You can pass class numbers to render only some classes, for example `... ../out/theory 3`.
   It needs Playwright with Chromium, `pdfinfo`/`pdftotext` (poppler-utils), and internet access for the Google Fonts.

2. Merge the pages into each book (needs `pip install pypdf reportlab` and the Inter font files):

   ```bash
   python3 docs/helpbooks/merge_helpbook.py 3 CT_Class3_HelpBook_Complete.pdf out/theory out/CT_Class3_HelpBook_with_Theory.pdf Inter-Regular.ttf Inter-Bold.ttf
   ```

   The script finds each chapter's first page, inserts that chapter's theory pages before it, renumbers every page in the book's footer style, and adds a "New in this edition" badge to the cover.
   Use the same command for classes 4 to 8 with their books.

## Import the help-book questions into the platform

The help-book questions in `web/prisma/content/helpbook/hb.json` and their pictures in `web/public/hb/` are extracted
from the original help-book PDFs (not stored here). Needs `poppler-utils` and `pip install pillow`.

1. Extract each book (questions, options, answer keys, solutions and picture crops) into `out/`:

   ```bash
   mkdir -p out/img
   python3 -I hb_extract.py HB3.pdf 3 out
   ```

   Repeat for Classes 4–8 (`HB4.pdf` … `HB8.pdf`). What the extractor does:
   - Questions start at a numbered badge (`1`, `A1`, `P`). The skill tag at the top right is removed only when its words spell a skill.
   - Answer badges are recognised as white letters on a coloured circle, so a, b, c, d labels inside a drawing are not taken for options.
   - Option text includes two-line options; a number written over a number becomes a fraction (`4/5`); section headings ("The Thinking Spot") are not option text. Options made only of numbers (small grids) are shown as pictures.
   - Picture crops have the question text and number painted out with the surrounding background colour. Each crop is then *fitted*: it grows while the drawing touches an edge, and light borders and table shading next to the drawing are included.
   - A crop that turns out to be only words (a sum, a sequence, bullet clues) is not kept as a picture: its text is added to the question.
   - Table header and label rows (wide gaps between words) after the end of the question's sentence belong to the picture, not to the question text.

2. Repair the eight figures that are clipped in the books themselves (a drawing runs under the answer cards or the question text; the hidden labels are taken from the PDF text):

   ```bash
   python3 -I hb_fix_clipped.py . out
   ```

3. Check: `python3 -I edgecheck.py edges.json out/img/*.png` lists pictures whose drawing touches an edge (frame lines along an edge are ignored). `python3 sheets.py /path/to/font.ttf 3 0` writes a contact sheet of 16 crops.

4. Convert to the platform format (run from the folder that holds `out/`):

   ```bash
   python3 hb_convert.py /path/to/ctai-platform/web
   ```

   This writes `hb.json` and the WebP pictures (delete the old `web/public/hb/*.webp` first). Then run `npm run db:setup` in `web/`.
