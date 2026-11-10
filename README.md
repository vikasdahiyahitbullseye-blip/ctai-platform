# Hitbullseye CT & AI Platform (prototype v0.2)

Practice, assessment, gamification and analytics for the CBSE Computational Thinking & AI curriculum (Classes 3–8).

- Product spec: [`docs/SPEC.md`](docs/SPEC.md)
- App: [`web/`](web) — Next.js 15 + TypeScript + Prisma (SQLite in dev; switch to PostgreSQL for production)

## Run locally

Requires Node.js 20+.

```bash
cd web
npm install
cp .env.example .env
npm run db:setup     # creates the database and loads curriculum, questions and a demo school
npm run dev          # http://localhost:3000
```

Demo logins (password `demo123`):

| Username | Role |
|---|---|
| `student3` … `student8` | One student in each of Classes 3-A to 8-A |
| `teacher` | Teacher for Classes 3-A to 8-A |
| `rohan` | Computer teacher for AI in 6-A, 7-A, 8-A (runs the Weather Watchers project) |
| `admin` | School admin |
| `content` | Hitbullseye content team |
| `superadmin` | Hitbullseye super-admin |

`npm run seed` reloads the demo data (it replaces everything in the database).

## Checks

```bash
cd web
npm test                                   # unit tests: scoring, mastery, gamification, test generator, content integrity
npm run build
npm run start &                            # then, with Playwright available:
node e2e/smoke.mjs http://localhost:3000   # core student + teacher flows (run on freshly seeded data)
node e2e/v2.mjs http://localhost:3000      # admin, content review, homework marking, projects, avatars (fresh data)
```

## What's in v0.2

See `docs/SPEC.md` §14 for v0.2: school admin tools, content studio, super-admin, projects, homework with teacher marking, cross-subject connections, and the new student design (adventure map, avatars, missions, houses, class challenges).

## What was in v0.1

**Student:** home with level/XP/streak/badges, Puzzle of the Day, adaptive practice by chapter or skill with hints and worked solutions, timed tests with autosave and question palette, results review, skill progress, badges, weekly leaderboard (or class team points for Classes 3–5).

**Teacher:** class dashboards (KPIs, student × skill mastery heatmap, chapter accuracy, students needing support), test generator (chapters, skills, types, difficulty mix, avoids recently used questions), swap/remove questions, assign online, printable Sets A/B/C with answer keys (PDF via print), Word export, item analysis, question bank browser, observation journal, leaderboard toggle.

**Admin:** school overview (sections, teachers, weekly activity), now with full management (see v0.2).

**Content:** curriculum chapters for all six classes (CBSE 2026-27 handbooks) plus EVS themes for Classes 3–5; 4,736 questions — at least 40 per chapter for every chapter of Classes 3–8 (782 written individually, 3,955 generated from question families, including 784 colourful picture questions: 8 in every chapter); 5 project kits; teaching resources; subject connections. Content for the other classes is to be authored (see SPEC §5 targets).

## Code map

| Path | What |
|---|---|
| `web/prisma/schema.prisma` | Data model |
| `web/prisma/content/` | Original question content (Class 3, Class 6) |
| `web/prisma/seed.ts` | Curriculum + demo school + simulated activity |
| `web/src/lib/generator.ts` | Blueprint-driven paper assembly |
| `web/src/lib/mastery.ts` | Skill mastery model |
| `web/src/lib/gamification.ts` | XP, levels, streaks, badges |
| `web/src/lib/attempts.ts` | Answering, grading, adaptive practice |
| `web/src/lib/paper.ts` | Paper versions + answer keys (print / DOCX) |
| `web/src/app/student/*` | Student screens |
| `web/src/app/teacher/*` | Teacher screens |

Uploaded files are stored in `web/storage/uploads` (set `STORAGE_DIR` to change). Use S3-compatible storage in production.

## Question bank status

**3,952 questions; every one of the 98 chapters (CT, AI and EVS, Classes 3–8) has at least 40 practice items.**

| Class | Written individually | Generated from families | Total |
|---|---|---|---|
| 3 | 149 | 656 | 805 |
| 4 | 141 | 664 | 805 |
| 5 | 149 | 696 | 845 |
| 6 | 132 | 435 | 567 |
| 7 | 109 | 376 | 485 |
| 8 | 101 | 344 | 445 |

- **Written individually** (`prisma/content/class*.ts`): original items with worked solutions, aligned to CBSE grade-wise learning outcomes.
- **Generated** (`prisma/content/gen/`): 160+ *question families*. Each family is a hand-designed question idea whose numbers, names and settings vary. The code works out the answer and step-by-step solution, so every key is correct by construction. AI and EVS questions come from banks of hand-written real-life situations (e.g. "A traffic camera reads number plates" → Computer Vision). `prisma/content/gen/index.ts` (`PLAN`) maps families to chapters and tops every chapter up to 40 with a 35/40/25 easy/medium/hard mix. Generation is deterministic.
- **Picture questions** (`prisma/content/gen/pictures.ts`, `pictures2.ts`): every chapter has 8 picture questions on top of its 40 (`PICTURE_PLAN` picks the picture families that suit each chapter). There are 52 picture families (counting each sorting topic separately):
  - *Shapes and space:* mirror images, water images, quarter/half turns, completing a symmetric picture, spot-the-flipped-one, cube towers, angle types, parallel/perpendicular lines, area and perimeter on a grid, area models (distributive law).
  - *Grids and maps:* robot moves, shortest path round rocks, grid references and compass directions.
  - *Numbers:* abacus place value, number lines (whole numbers, integers, decimals), animal jumps on a number line, number grids (primes, multiples), fraction pictures (name, pick, compare, equivalent), sharing, arrays, square numbers, binary dot cards.
  - *Patterns:* turning arrows, growing dots, two-change sequences, bead patterns, bead ratios, matchstick patterns (with the rule 3n + 1).
  - *Measuring and money:* rulers (including not starting at 0), balance scales, measuring jugs, coins and notes, calendars, clocks (including a clock in a mirror).
  - *Data and EVS:* bar graphs and pictographs with topic themes (rainfall, water, electricity, waste, farm), counting coloured shapes, sorting pictures (fruit/vegetables, animals, plants, transport, wet/dry waste) and odd one out.
  - *AI:* an AI's right/wrong answers (accuracy), and unbalanced training photos (which animal will it get wrong; how many photos to add for fairness).

  Pictures are stored as small JSON drawing specs (`src/lib/figures.ts`) and drawn as sharp SVG (`src/components/Figure.tsx`) with a bright palette on a white panel, so they look the same in light/dark mode and in print. Colours that look alike (red/pink, orange/yellow, green/teal) are never used together in one question, and only widely supported emoji are used. Answer options can themselves be pictures. Pictures show in practice, tests, homework, results, the question bank, worksheets and printed papers; the Word (.docx) export marks picture questions and points to the printable version.
- Generated items are stored with `source = GENERATED` and their family id. They are published for the demo and shown with a "Generated" label; filter them in **Content studio → Questions → Generated only**.
- Multiple-choice options are reordered when loaded so the correct answer's position is balanced.
- Tests (`src/lib/__tests__/`) check every chapter reaches 40 and every answer key is valid. They also check for duplicates, broken text, the difficulty mix and answer balance, recompute answers for several families, and confirm the bank is the same every time it is generated.

**Before release:** subject experts should review the bank in the content studio, both written and generated questions.
