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

The help-book questions in `web/prisma/content/helpbook/hb.json` and their pictures in `web/public/hb/` were extracted
from the original help-book PDFs (not stored here) with three scripts. They need `poppler-utils` and `pip install pillow`.

1. Extract each book (questions, options, answer keys, solutions and picture crops) into `out/`:

   ```bash
   mkdir -p out/img
   python3 hb_extract.py CT_Class3_HelpBook.pdf 3 out
   ```

   Repeat for Classes 4–8. Questions start at a numbered badge (`1`, `A1`, `P`); the skill tag is read from the right margin.
   Picture crops have the question text and badge painted out.

2. Optional check: `python3 sheets.py /path/to/font.ttf 3 0` writes a contact sheet of 16 picture crops (class 3, from item 0).

3. Convert to the platform format (run from the folder that holds `out/`):

   ```bash
   python3 hb_convert.py /path/to/ctai-platform/web
   ```

   This writes `hb.json` and the WebP pictures. Then run `npm run seed` (or `npm run db:setup`) in `web/`.
