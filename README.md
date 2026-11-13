# Hitbullseye CT & AI Platform (prototype v0.2)

Practice, assessment, gamification and analytics for the CBSE Computational Thinking & AI curriculum (Classes 3–8).

- Product spec: [`docs/SPEC.md`](docs/SPEC.md)
- App: [`web/`](web) — Next.js 15 + TypeScript + Prisma (SQLite in dev; switch to PostgreSQL for production)

## Run locally

### 1. Install the tools (once)

- **Node.js 20 or newer** (the "LTS" version) from https://nodejs.org. Check in a terminal: `node -v`.
- **Git** from https://git-scm.com (or download the code as a ZIP from GitHub and unzip it).

On Windows, use **PowerShell** or **Command Prompt** for the commands below.

### 2. Get the code and set it up (once)

```bash
git clone https://github.com/vikasdahiyahitbullseye-blip/ctai-platform
cd ctai-platform/web
npm install
```

Copy the settings file. On Windows:

```bash
copy .env.example .env
```

On Mac or Linux:

```bash
cp .env.example .env
```

Create the database and load the curriculum, all questions and a demo school (takes 1–2 minutes):

```bash
npm run db:setup
```

### 3. Start it (every time)

```bash
npm run dev
```

Open http://localhost:3000 and sign in with a demo login below. Stop it with `Ctrl + C`.

The first page you open after starting can take 10–20 seconds while it compiles; later pages are quick. For a faster, production-like run: `npm run build`, then `npm start`.

### Demo logins (password `demo123`)

| Username | Role |
|---|---|
| `student3` … `student8` | One student in each of Classes 3-A to 8-A |
| `teacher` | Teacher for Classes 3-A to 8-A |
| `rohan` | Computer teacher for AI in 6-A, 7-A, 8-A (runs the Weather Watchers project) |
| `admin` | School admin |
| `content` | Hitbullseye content team (writes and edits questions) |
| `reviewer` | Hitbullseye question reviewer (approves questions) |
| `superadmin` | Hitbullseye super-admin (all schools, approvals, staff accounts) |

`npm run seed` reloads the demo data. **It replaces everything in the database**, including any approvals you have made.

### If something goes wrong

- `npm install` fails with `ECONNRESET`, `ETIMEDOUT` or `EPERM`: check your internet connection, close editors or terminals that have the folder open, delete the `node_modules` folder and run `npm install` again. On office networks a proxy or antivirus can block downloads.
- `Port 3000 is in use`: another copy is running. Close it, or run `npm run dev -- -p 3001` and open http://localhost:3001.
- Errors about the database or Prisma: run `npm run db:setup` again.

## Year plan and content library

**Teaching time (CBSE CT & AI Curriculum 2026-27, §3.4 and §10.2), in 40-minute periods:**

| Classes | CBSE hours a year | In the period plan | Outside the timetable |
|---|---|---|---|
| 3–5 | 50 (inside Maths and EVS/TWAU) | 50 h = **75 periods** | — |
| 6–8 | 100 = 40 CT + 20 AI + 40 projects | 60 h = **90 periods** (60 CT, 30 AI) | 40 h: two 20-hour projects |

- **Chapter-wise periods:** CBSE sets 5 hours for each AI chapter (7–8 periods) but no hours for individual CT chapters. CT chapters therefore share the CT time equally, and EVS (TWAU) themes get 60% of a CT chapter. 5 periods are kept for getting started, 2 revision periods and 2 term exams. The content team can change any chapter's periods in **Content studio → Teaching plan**, which rebuilds that class's plan and library. Uploaded videos and teachers' ticked periods are kept.
- **Period-by-period plan** (`src/lib/plan.ts`, stored as `Lesson` rows): every period has a type (Introduce, Explore, Practise, Hands-on activity, Chapter check, Revision, Term exam), a month and week, a learning objective, a 40-minute lesson flow (warm-up, main part, wrap-up), the resources to use and the homework to set. Term 1 runs April–September and Term 2 October–February; June is the summer break.
- **Period names:** periods are named by chapter, not numbered through the year: *Chapter 1-1* is the first period of Chapter 1, *Chapter 1-2* the second (AI and EVS chapters: *AI Chapter 1-1*, *EVS Chapter 1-1*). The other periods are *Getting started*, *Term 1 revision* and *Term 1 exam*.
- **Teachers** open **Year plan**: pick a class section, tick periods as taught, see whether they are on track for the week, open each lesson plan, and print the whole plan.

**Content library per class** (built by `src/lib/library.ts` from the question bank and `prisma/content/library/modules*.ts`):

| Asset | Target per class | Built | How |
|---|---|---|---|
| Chapter learning modules | 12–15 | 11–21 (one per chapter) | Goals, hook, key ideas, key words, a common mistake, a worked example, Try-it questions (with pictures), an activity and an at-home task. Written for all 98 chapters. |
| Practice questions | 600 | 612–1,008 | Written + generated questions, including picture questions. |
| Chapter tests | 12–15 | 11–21 (one per chapter) | 10–12 questions, 25–30 min. |
| Worksheets | 40 | 40 | Practice, Picture puzzles, Challenge, Warm-up and Mixed, spread over chapters by teaching time. |
| Assignments | 24 | 24 | 6 questions + a task (at-home task, reflection journal or "teach it back"). |
| Monthly assessments | 8 | 8 | April, May, July, August, October, November, December, January; each covers the chapters taught that month. |
| Term examination papers | 2 | 2 | Sections A and B; 25–30 questions. |
| Full-length practice papers | 4 | 4 | Two before each term exam, with no questions repeated from the term paper. |
| Projects / activity kits | 12 | 12–22 | A one-period activity kit for every chapter, plus the multi-week projects. |
| Concept videos | 20 | 20 scripts | A storyboard with scenes, timings, on-screen text and narration for each video. Uploading is off until the super-admin allows a role in **HQ → Settings** (content team, reviewers, school admins, teachers or super-admins). People in an allowed role get a **Concept videos** page to add a YouTube link, a video link or an MP4/WebM file (up to 200 MB, `VIDEO_MAX_MB`). Nobody else sees the upload page or the scripts, and teachers and students see a video only once it has a recording. |

**Class slides:** every chapter (98 decks) has a PowerPoint deck (.pptx, which also opens in Google Slides and Keynote). Teachers download it from the Library, the chapter page or the chapter's Introduce period in the Year plan. A deck follows the chapter's periods: title, lesson map, Introduce (goals, think-about-it, key ideas, key words, worked example, Try it), Explore, Hands-on activity (steps and rubric), Practise (picture questions included), Check (I can… checklist, chapter test, at-home task). Every question is followed by an answer slide, and the speaker notes carry the 40-minute lesson plan. Decks are built on demand from the module, the plan and the question bank (`src/lib/slides.ts`), so edits to content show up in the next download. **Editing a deck:** the super-admin opens **HQ → Class slides**, downloads a chapter's deck, edits it in PowerPoint (or Google Slides, saved as .pptx) and uploads it. Teachers then download the edited deck everywhere the slides are linked. **Go back to the generated deck** removes the edited version. An edited deck does not pick up later content changes, and `npm run seed` removes edited decks. Pictures are exported as images with colour emoji (`src/lib/figureImage.ts`, emoji images from Noto Color Emoji, Apache 2.0) so they look the same on every computer.

**CBSE handbook questions (Classes 3–8):** 1,024 questions from the CBSE CT & AI Student Handbooks (2026-27), with CBSE's answers and solutions from the Teacher Handbooks:
- **CT chapters:** every answered question, including activity questions and the Thinking Spot (769 questions). Figures are cropped from the books and stored in `web/public/cbse`.
- **AI chapters (Classes 6–8):** each chapter's Exercise (255 items): multiple choice, fill in the blanks, true or false, classify/identify tables (as multiple choice), and short answers (marked by the teacher, with CBSE's model answer).

They are stored with `source = CBSE` and a `sourceRef` such as "CBSE CT & AI Student Handbook, Class 6 (2026-27) · CT Chapter 5 · Question 3". They show up in four places:
- **Students:** each chapter page has a "CBSE book questions (N)" button. One round covers all N of the chapter's book questions in book order, starting with the ones not yet answered correctly. Normal practice rounds have 15 questions and cover every kind of question in the chapter (each format, picture questions, CBSE book questions) and every skill before following the adaptive difficulty.
- **Teachers:** each chapter page has a CBSE exercises card (print the questions, or an answer key with CBSE's solutions). The question bank and the review queue can be filtered to CBSE questions.
- **Test generator:** choose "Our bank + CBSE handbook", "Our question bank only" or "CBSE handbook exercises only".
- **Unchanged:** the library, class slides and demo tests keep using our own bank.

All CBSE questions start as "not yet reviewed" so a reviewer can check the automated transcription. The data is in `web/prisma/content/cbse/` (`ct.json` for CT; `ai6.ts`, `ai7.ts`, `ai8.ts` for AI). The CBSE handbooks themselves are not in the repository.

**Learn it theory (Classes 3–8):** every CT chapter of Classes 3–8 (68 chapters, 270 concepts) has a short theory section that explains the ideas its questions practise, with pictures, worked examples, "Remember" notes and a thinking tip. The content is in `web/prisma/content/theory/` and appears in three places:

- the chapter's learning module (teachers and students, under "Learn it · before the questions");
- the chapter's class slides (one slide per idea, one per worked example, and the thinking tip, in the Introduce section);
- the help books: new PDF editions with 1–2 "Learn it" pages before every chapter. See `docs/helpbooks/README.md` to rebuild them.

Teachers open **Library** to browse by class, print any paper (sets A/B/C, answer key, Word), or press **Use with my class**. That makes the teacher's own copy, which they can edit, and assigns it (tests online; worksheets and assignments as homework). Students find each chapter's module and recorded videos under **Learn** on the chapter page.

Classes 7 and 8 get a little more generated practice per chapter (43 and 48) so every class reaches 600+.

## Approving questions

Every question has an approval state: **Awaiting approval**, **Approved** or **Rejected**.

- Hand-written questions start **Approved**. Generated questions (including all picture questions) start **Awaiting approval**. They can still be used in practice, tests and homework while they wait, and teachers see a "Not yet reviewed" label on them in the question bank.
- Sign in as `reviewer` (or `superadmin`) and open **Approve questions** (`/review`). Filter by class, chapter, type, and generated or written. Each question is shown in full: the pictures, options, answer and worked solution.
- All questions on the page start ticked. Untick any you are unsure of, then press **Approve ticked questions**. The next 20 appear. You can also approve one at a time.
- **Reject** needs a short reason (e.g. "picture unclear"). A rejected question is removed from use, and the reason shows to the content team. **Restore** puts it back in use and back in the queue; **Undo approval** sends an approved question back to the queue.
- If the content team edits a question, it goes back to **Awaiting approval**, because changed content needs a fresh check.
- The super-admin can create more reviewer logins under **HQ → Staff accounts**, see how many questions each person approved, and deactivate logins. Every approval and rejection is recorded in the audit log.

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

See `docs/SPEC.md` §14 for v0.2: school admin tools, content studio, super-admin, projects, homework with teacher marking, cross-subject connections, and the new student design (adventure map, avatars, missions, class challenges).

## What was in v0.1

**Student:** home with level/XP/streak/badges, Puzzle of the Day, adaptive practice by chapter or skill with hints and worked solutions, timed tests with autosave and question palette, results review, skipping (see below), skill progress, badges, leaderboards (section, class, school, group of schools and friend groups), logic games.

**Skipping questions:**
- *Practice and CBSE book rounds:* **Skip** moves to the next question. A skipped question uses its place in the round, earns no XP, and is not counted as right or wrong in accuracy, mastery or the adaptive difficulty. Skipped questions wait in a **⏭ Skipped** tray above the question ("Go back to 1", "Go back to 2"…) and can be answered any time before the round ends; at the end of the round the student is offered the skipped ones again before finishing. **End round and see results** stops a round early. Results mark skipped questions "⏭ Skipped" and the score card counts them. Puzzle of the Day stays one try only.
- *Tests:* the button reads **Skip for now →** on an unanswered question; **✕ Clear my answer** removes an answer. Before submitting, the dialog lists the unanswered question numbers (click one to go back). Unanswered questions score 0 and show as "Not answered"; teachers see them in the item analysis "Skipped" column.
- *Homework:* questions can be left blank or cleared; handing in says how many are still blank.
- Submitting a test or homework (or the timer running out) first sends every answer still being saved, so quick last answers are not lost.

**Leaderboards** (`src/lib/leaderboard.ts`, `/student/leaderboard`, and a card on the student home page):
- Boards: *My section*, *Class N* (all sections of the class in the school), *Whole school*, *All our schools* (the same class across a group of schools, when the school is in one), and the student's *friend groups*. Each shows *This week* or *All time* XP; ties share a rank; the student's own row is always shown.
- A teacher can turn class leaderboards off for a section (class dashboard → Gamification). Students of that section are then left off every public board but can still use friend groups. Leaderboards are on by default for all classes.
- **Friend groups:** a student creates a group (name + badge) and shares its 6-character join code; classmates from the **same school** join with the code. Up to 40 members per group and 6 groups per student. Names are checked (2–30 characters, no links, numbers or rude words). The creator can remove members or delete the group; leaving passes ownership on. Teachers see every group their students are in on the class dashboard and can remove one.

**Logic games** (`src/lib/games/`, `/student/games`): Sudoku (4×4, 6×6, 9×9), Tower of Hanoi (3–6 discs), Lights Out (3×3–5×5), Sliding tiles (3×3, 4×4) and Code breaker (3–5 digits). Each game has 7 levels: a student's class sets the Normal level (Class 3 = level 1 … Class 8 = level 6) and Easy/Challenge move one level down or up. Every puzzle is made from a random seed; the server rebuilds it from the seed and checks the solution before giving XP (8 + 2 × level, +5 for a tidy solution such as the fewest Hanoi moves). The first 5 solved games a day earn XP, and the same puzzle never earns twice. Plays are stored in `GamePlay`.

**Groups of schools (chains):** HQ creates a *group of schools* and its **group admin** login (HQ → Groups of schools), and puts schools in the group (Group column of the schools table). The group admin (`/group`) sees every school side by side (students, teachers, students active in the last 7 days, tests set, average score, school admins), class-wise activity per school, and the top students across the group. **Manage →** opens any of the group's schools in the normal school-admin pages (classes, teachers, students, bulk import, activity log), scoped to that school (`requireSchoolAdmin` in `src/lib/auth.ts`); "← All schools" goes back. The group admin can also create principal (school admin) logins for each school. Group admins cannot open HQ, teacher or student pages. Demo: `groupadmin` manages *Demo Public School* and *Demo Public School, Noida* (`admin2`, `teacher2`, students `n3a01`…, `n6a01`…).

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

**Current bank (v0.4, raised to CBSE handbook level): 4,448 live questions. Every CT chapter has 42–63 practice items and every AI and EVS chapter has 40.**

| Class | Help book | Help-book Thinking Spot puzzles | New CBSE-level CT | AI / EVS scenarios | CBSE handbook | Live total |
|---|---|---|---|---|---|---|
| 3 | 293 | 28 | 168 | 239 | 161 | 889 |
| 4 | 300 | 28 | 168 | 240 | 162 | 898 |
| 5 | 312 | 30 | 180 | 240 | 170 | 932 |
| 6 | 206 | 20 | 120 | 97 | 206 | 649 |
| 7 | 180 | 16 | 96 | 85 | 184 | 561 |
| 8 | 153 | 14 | 84 | 126 | 141 | 518 |

- **Help-book questions** (`prisma/content/helpbook/hb.json`, family `HELPBOOK`, codes `HB-<class>-CT-<chapter>-<label>`): all 1,580 exercise, Thinking Spot and activity questions from the *Think, Play & Solve* help books, Classes 3–8, with the books' answer keys and solutions. 722 book pictures are stored as WebP files in `public/hb/`. They start **Approved**. Thinking Spot items feed Puzzle of the Day. The extraction scripts are in `docs/helpbooks/` (see its README).
- **New CBSE-level CT questions** (`prisma/content/gen/cbse_level.ts`, `cbse_level2.ts`, `cbse_level3.ts`, 50 families): longer, multi-step questions written to match the difficulty and length of the CBSE handbook exercises (ordering and seating clues, coding/decoding, clocks and calendars, number machines, working backwards, counting figures, painted cubes, bases and Roman numerals, ratio and money plans, and more). Different numbers and settings from the book questions, same topics. `CBSE_PLAN` in `prisma/content/gen/index.ts` maps them to chapters and tops each CT chapter up to at least 40 with the help-book and CBSE questions. They start **Awaiting approval**.
- **AI and EVS scenarios** (`prisma/content/gen/scenario.ts`, 21 families): scenario questions of 40–60 words (training data and bias, accuracy and confusion counts, train/test splits, rule-based vs learning systems, ethics, online safety, the AI project cycle; water, plants, animals, food chains, maps, rainfall, waste, energy, travel, family and queues). Auto-marked, answers computed. They start **Awaiting approval**.
- **CBSE handbook questions:** see the section above. They are not changed.
- **The earlier bank (4,861 easier questions) is retired.** Retired questions are kept in the database (so past attempts and results still show) but are not used in practice, tests, homework, the library, slides or Puzzle of the Day. Library tests, worksheets, papers, modules and class slides are rebuilt from the new bank by `npm run seed`.

The rest of this section describes the picture families. They are now retired with the earlier bank, but the code and drawing kinds are still used by the studio and by CBSE pictures:

- **Picture questions** (`prisma/content/gen/pictures.ts`, `pictures2.ts`): every chapter has 8 picture questions on top of its 40 (`PICTURE_PLAN` picks the picture families that suit each chapter). There are 52 picture families (counting each sorting topic separately):
  - *Shapes and space:* mirror images, water images, quarter/half turns, completing a symmetric picture, spot-the-flipped-one, cube towers, angle types, parallel/perpendicular lines, area and perimeter on a grid, area models (distributive law).
  - *Grids and maps:* robot moves, shortest path round rocks, grid references and compass directions.
  - *Numbers:* abacus place value, number lines (whole numbers, integers, decimals), animal jumps on a number line, number grids (primes, multiples), fraction pictures (name, pick, compare, equivalent), sharing, arrays, square numbers, binary dot cards.
  - *Patterns:* turning arrows, growing dots, two-change sequences, bead patterns, bead ratios, matchstick patterns (with the rule 3n + 1).
  - *Measuring and money:* rulers (including not starting at 0), balance scales, measuring jugs, coins and notes, calendars, clocks (including a clock in a mirror).
  - *Data and EVS:* bar graphs and pictographs with topic themes (rainfall, water, electricity, waste, farm), counting coloured shapes, sorting pictures (fruit/vegetables, animals, plants, transport, wet/dry waste) and odd one out.
  - *AI:* an AI's right/wrong answers (accuracy), and unbalanced training photos (which animal will it get wrong; how many photos to add for fairness).

  Sample screenshots: [docs/screenshots/picture-questions-samples.png](docs/screenshots/picture-questions-samples.png) and [docs/screenshots/picture-questions-more-samples.png](docs/screenshots/picture-questions-more-samples.png).

  Pictures are stored as small JSON drawing specs (`src/lib/figures.ts`) and drawn as sharp SVG (`src/components/Figure.tsx`) with a bright palette on a white panel, so they look the same in light/dark mode and in print. Colours that look alike (red/pink, orange/yellow, green/teal) are never used together in one question, and only widely supported emoji are used. Answer options can themselves be pictures. Pictures show in practice, tests, homework, results, the question bank, worksheets and printed papers; the Word (.docx) export marks picture questions and points to the printable version.
- Generated items are stored with `source = GENERATED` and their family id. They are usable straight away, labelled "Generated", and wait in the approval queue (see **Approving questions**).
- Multiple-choice options are reordered when loaded so the correct answer's position is balanced.
- Tests (`src/lib/__tests__/`) check every chapter reaches 40 and every answer key is valid. They also check for duplicates, broken text, the difficulty mix and answer balance, recompute answers for several families, and confirm the bank is the same every time it is generated.

**Before release:** subject experts should work through the approval queue (`/review`) for the generated questions.
