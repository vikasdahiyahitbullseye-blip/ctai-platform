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
