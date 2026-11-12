# Hitbullseye CT & AI — Product Specification

Version 0.2 · November 2026 · Status: draft for review

This document specifies the complete Hitbullseye solution for the CBSE Computational Thinking and Artificial Intelligence (CT & AI) curriculum, Classes 3–8. It is the working spec for the platform being built in this repository.

---

## 1. Positioning

**What CBSE already gives schools for free** (verified against the official documents, March–April 2026):

- Curriculum framework for Classes 3–8.
- Student Handbook and Teacher Handbook per class. The Teacher Handbooks include an answer and a worked solution for every question, CT-skill tags on every question, and timed lesson plans for activities.
- Teacher training: regional workshops, district workshops, expert talks, and DD PM e-Vidya videos.
- Announced as "coming soon": an AI project list with rubrics, and short concept handouts for the AI sections.

**What Hitbullseye sells: everything CBSE gives, made usable at scale.**

| Gap in CBSE resources | Hitbullseye product |
|---|---|
| About 10–13 questions per chapter only | Large graded question bank: practice, revision, retests |
| No tests, papers, or assessment tools | Test generator (online + print), chapter/term papers, rubric and observation-journal tools |
| CT required in EVS (TWAU), but only Maths handbooks exist | EVS CT worksheets, Classes 3–5 |
| Two 20-hour projects/year required, no implementation material | Session-by-session project kits built on CBSE's project list |
| PDFs only | Online practice, auto-marking, gamification, analytics |
| One-off training | In-school onboarding and ongoing support |

**Rule:** we never reproduce CBSE handbook questions. All items are original. Where useful we reference CBSE material by chapter and question number.

---

## 2. CBSE curriculum facts (source of truth)

| | Classes 3–5 (Preparatory) | Classes 6–8 (Middle) |
|---|---|---|
| Hours/year | 50 (indicative) | 100: 40 Advanced CT, 20 AI, 40 projects (2 × 20 h) |
| Delivery | Integrated into Maths and TWAU; follows the NCERT Maths chapter sequence | CT inside Maths (and other subjects); AI is a separate strand |
| Taught by | Maths and subject teachers | Subject teachers (CT); Computer teacher (AI and projects) |
| Assessment | Written tests with CT puzzles; group activities (e.g. treasure hunts); Teacher Observation Journal | Written tests, group activities, practical exams, observation journal, thematic projects, reflections, rubrics |
| AI | None | 4 chapters × 5 h per class |
| Start | Session 2026-27 (CBSE Circular 18/2026, 13 April 2026) | |

**CT skill strands** (learning outcomes, all classes): Abstract Thinking, Pattern Recognition, Decomposition, Algorithmic Thinking.

**Additional competency tags** used in the Teacher Handbooks: Generalisation, Evaluation.

**Chapter structure** (CBSE handbook chapter = our unit):

- **Class 3 (14):** What's in a Name?; Toy Joy; Double Century; Vacation with My Nani Maa; Fun with Shapes; House of Hundreds – I; Raksha Bandhan; Fair Share; House of Hundreds – II; Fun at Class Party!; Filling and Lifting; Give and Take; Time Goes On; The Surajkund Fair.
- **Class 4 (14):** Shapes Around Us; Hide and Seek; Patterns Around Us; Thousands Around Us; Sharing and Measuring; Measuring Length; The Cleanest Village; Weigh It, Pour It; Equal Groups; Elephants, Tigers, and Leopards; Fun with Symmetry; Ticking Clocks and Turning Calendar; The Transport Museum; Data Handling.
- **Class 5 (15):** We the Travellers – I; Fractions; Angles as Turns; We the Travellers – II; Far and Near; The Dairy Farm; Shapes and Patterns; Weight and Capacity; Coconut Farm; Symmetrical Designs; Grandmother's Quilt; Racing Seconds; Animal Jumps; Maps and Locations; Data Through Pictures.
- **Class 6:**
  - CT (10): Patterns in Mathematics; Lines and Angles; Number Play; Data Handling and Presentation; Prime Time; Perimeter and Area; Fractions; Playing with Constructions; Symmetry; The Other Side of Zero.
  - AI (4): Introduction to AI and Everyday Examples; Basic Data Concepts; Simple Pattern Recognition and Decision Making; Ethics and Digital Responsibility.
- **Class 7:**
  - CT (8): Large Numbers Around Us; Arithmetic Expressions; A Peek Beyond the Point; Expressions using Letter-Numbers; Parallel and Intersecting Lines; Number Play; A Tale of Three Intersecting Lines; Working with Fractions.
  - AI (4): AI Domains and Applications; AI in Industries; Data Visualisation and Analysis; Ethics and AI Bias Awareness.
- **Class 8:**
  - CT (7): A Square and a Cube; Power Play; A Story of Numbers; Quadrilaterals; Number Play; We Distribute Yet Things Multiply; Proportional Reasoning.
  - AI (4): AI Project Lifecycle; Artificial Intelligence and Its Applications; Data and Fairness in AI; Ethics and Responsible AI.

Product extension (not a CBSE chapter): **EVS / TWAU CT worksheets**, Classes 3–5, tagged `strand = EVS`.

---

## 3. Users and roles

| Role | Primary goals |
|---|---|
| Student | Practise, attempt assigned work and tests, see progress, earn rewards |
| Teacher (Maths / subject) | Assign practice and tests, generate papers, track class and skill progress |
| Teacher (Computer) | AI chapters, projects, rubric marking |
| School admin / Principal | Setup, users, coverage and usage, school-wide reports |
| Content team (Hitbullseye) | Author, review and publish questions, worksheets and project kits |
| Parent (Phase 3) | View child's progress and assignments (consent-gated) |
| Hitbullseye super-admin | Tenants, subscriptions, global content |

Multi-tenant: each school is a tenant. Users belong to one school. A teacher is mapped to class-sections and subjects.

---

## 4. Modules

1. **Curriculum and content.** Class → Part (CT / AI / EVS) → Chapter → Learning outcomes; skill tags.
2. **Question bank.** Original items with full metadata (§5), review workflow, versioning.
3. **Practice.** Self-paced, chapter- or skill-wise, 15 questions per round. A round first covers every kind of question the chapter has (format, picture questions, CBSE book questions) and every skill, then follows adaptive difficulty; instant feedback with worked solutions. CBSE book-question rounds cover all of a chapter's CBSE questions in book order.
4. **Assignments and homework.** Teacher-assigned question sets with due dates; online or printable.
5. **Tests and test generator.** Blueprint-driven paper assembly; online delivery or print (PDF and DOCX) with answer key (§7).
6. **Projects.** Kits mapped to CBSE's project list: sessions, worksheets, datasets, submissions, rubric marking.
7. **Observation journal and rubrics.** Teacher records observations against CT skills; rubric library.
8. **Gamification.** XP, levels, badges, streaks, Puzzle of the Day, class challenges, leaderboards (§8).
9. **Analytics and dashboards.** Student, teacher/class, school; skill mastery; item analysis (§9).
10. **Administration.** School setup, bulk user import, class mapping, academic session.
11. **Content authoring (CMS).** Author → reviewer → publish; bulk import (CSV/JSON).

---

## 5. Question schema

| Field | Notes |
|---|---|
| `id` / `code` | Stable code, e.g. `C6-CT-03-PR-0012` (class, part, chapter, skill, serial) |
| `classLevel` | 3–8 |
| `chapterId` | Maps to CBSE handbook chapter |
| `skills[]` | ≥ 1 of: ABSTRACT, PATTERN, DECOMPOSITION, ALGORITHMIC, GENERALISATION, EVALUATION, AI_CONCEPT, DATA, ETHICS |
| `learningOutcome` | Free text or LO id from the framework |
| `type` | MCQ, MULTI (multi-select), TRUE_FALSE, FILL_BLANK, NUMERIC, ORDER (sequence), MATCH, SHORT (teacher-marked), plus future: GRID, DRAG_DROP, IMAGE_HOTSPOT |
| `difficulty` | 1 Easy, 2 Medium, 3 Hard (calibrated later from pilot data) |
| `stem`, `media` | Markdown text; images/diagrams |
| `options`, `answer` | JSON per type; accepted variants for FILL_BLANK / NUMERIC |
| `solution` | Required. Step-wise reasoning, not just the key |
| `hint` | Optional; used in practice mode only |
| `marks`, `timeSec` | Default marks and expected time |
| `language` | `en` (Hindi variant planned) |
| `status` | DRAFT → IN_REVIEW → PUBLISHED → RETIRED |
| `author`, `reviewer`, `version` | Audit trail |
| `stats` | Attempts, p-value (proportion correct), mean time, distractor counts (computed) |

**Quality bar:** original, unambiguous, single defensible answer, age-appropriate language, Indian context, no colour-only cues, worked solution present, reviewed by a second person.

**Year-1 content targets (per class):**
- about 40 practice items per CT chapter
- 50 per AI chapter
- 1 chapter test per chapter
- 2 term papers
- 4 practice papers
- 20 Puzzles of the Day per month
- Classes 3–5: EVS worksheets
- Classes 6–8: 4–6 project kits

That is roughly 560–700 items per class (about 3,800 total).

---

## 6. Student experience

- **Home:** greeting, level/XP bar, streak, Puzzle of the Day, "Due soon" assignments, "Continue practice", latest badges.
- **Practice:** choose chapter or skill → 10-question set; difficulty adapts (two right → harder, two wrong → easier); hint button; immediate feedback with solution; XP awarded.
- **Assigned work and tests:** list with status (due, in progress, submitted, marked); test player with timer, question palette, flag for review, autosave, submit confirmation; results page (score, per-question review with solutions, unless the teacher hides them until the due date).
- **Progress:** skill radar (4 CT strands plus AI strands), chapter completion, history.
- **Rewards:** badges earned / locked, level, class leaderboard (if enabled).
- **Classes 3–5 mode:** larger type, fewer words, one question per screen, no leaderboard by default; each student sees their own week (XP, questions answered, accuracy), read-aloud planned.

## 7. Teacher experience

- **Home:** classes taught, pending marking, recent test results, alerts (students needing support).
- **Question bank:** filter by class, chapter, skill, type, difficulty; preview with solution; add to paper.
- **Test generator:**
  1. *Setup:* title, class, section(s), mode (online / print / both), duration, instructions.
  2. *Blueprint:* chapters, skills, difficulty mix (e.g. 40/40/20), question types, number of questions or total marks; option for sections A/B/C.
  3. *Auto-assemble:* picks items satisfying the blueprint, avoiding recently used items for that section; teacher can swap or lock individual items and reshuffle.
  4. *Versions:* A/B/C sets with shuffled questions and options.
  5. *Output:*
     - assign online (window, attempts, show-answers policy)
     - print view → PDF (school name/logo, session, instructions, answer space)
     - DOCX download
     - separate answer key with solutions
  6. Save as template.
- **Assignments:** same builder, lighter (no timer); due date.
- **Marking:** queue for SHORT answers and projects; rubric scoring; feedback comments.
- **Dashboards (§9):** class overview, skill heatmap, student drill-down, item analysis, assignment completion.
- **Observation journal:** quick-add observation (student, skill, rating 1–4, note); appears in the student profile.
- **Gamification controls:** enable/disable leaderboard per section; launch class challenges.

## 8. Gamification rules

Principle: reward **effort and growth**, not only rank. Child-safe: no public exposure outside the class, and no purchasable items.

| Element | Rule (v1) |
|---|---|
| XP | Practice: +10 per correct, +2 per attempt (effort); first-time completion of a set +20. Test: +marks × 2. Puzzle of the Day: +25 if solved. Hints reduce correct XP to +5. |
| Levels | Level n requires `100 × n × (n+1) / 2` cumulative XP (100, 300, 600 …). Named ranks: Explorer, Thinker, Solver, Strategist, Innovator, … |
| Streak | Consecutive days with ≥1 completed activity; weekends do not break a streak (school-calendar friendly). |
| Badges | First Steps (first practice), Sharp Eye (10 PR correct), Pattern Pro / Decomposer / Algorithm Ace / Big Picture (skill mastery Proficient), Puzzle Streak 5, Perfect Score, Comeback (improvement ≥ 20 pts on a retest), Helping Hand (teacher-awarded). |
| Puzzle of the Day | One per class-level per day from a curated pool; same puzzle for everyone; solution unlocks after attempt. |
| Leaderboard | Section-level, weekly XP, opt-in by teacher; shows top 10 plus own rank. Off for Classes 3–5 by default (students see only their own XP). No houses or team points. |
| Class challenge | Teacher sets a target (e.g. 500 correct answers this week); class progress bar. |

## 9. Analytics

**Mastery model (v1, transparent):** for each student × skill, take the last 20 scored responses tagged with that skill. Weight each by difficulty (1/1.5/2) and recency (newest = 1.0, decaying 5% per older item). Mastery = weighted accuracy.

| Level | Rule |
|---|---|
| Not enough evidence | < 5 responses, or a single session only |
| Beginning | < 40% |
| Developing | 40–64% |
| Proficient | 65–84% |
| Advanced | ≥ 85% |

Always show the evidence count, not just a level. Observation-journal ratings are displayed alongside but not blended into the score in v1.

**Student dashboard:** XP, level, streak, skill mastery, chapter completion, recent results, trend.

**Teacher / class dashboard:**
- KPI tiles: average score, completion rate, active students this week, items attempted.
- Skill × student heatmap.
- Chapter coverage and performance.
- "Needs support" list (2+ skills at Beginning, or no activity for 7 days).
- Test result distribution.
- Item analysis per test: % correct, distractor choice counts, average time, flag items with p < 0.25 or p > 0.95.

**School dashboard:** usage by class and section, coverage vs pacing, skill mastery by grade, teacher activity.

## 10. Non-functional requirements

- **Privacy (India DPDP Act 2023 and Rules):**
  - verifiable parental consent for under-18 accounts (collected via school)
  - collect the minimum data (name, class, roll number; no phone/email needed for students)
  - no behavioural advertising or tracking
  - data stays within the school tenant
  - deletion and export on request
  - audit log of admin actions
- **Security:** hashed passwords (bcrypt), HTTP-only session cookies, role-based access checks on every server action, tenant isolation on every query.
- **Performance:** works on low-end Android and shared smart-class PCs; pages < 200 KB JS where possible; test autosave tolerant of network drops.
- **Accessibility:** WCAG 2.1 AA target; no colour-only meaning; keyboard navigable.
- **Localisation:** all UI strings externalised; Hindi in Phase 2.
- **Print:** A4 print stylesheet; DOCX export.

## 11. Architecture

| Layer | Choice | Reason |
|---|---|---|
| App | Next.js (App Router) + TypeScript | One codebase for UI and server; server actions; easy deploy |
| DB | PostgreSQL in production; SQLite for local dev/prototype | Prisma ORM keeps the schema portable |
| ORM | Prisma | Typed queries, migrations |
| Auth | Own session auth (bcrypt + signed cookie), roles | No third-party data sharing for children's accounts |
| UI | Tailwind CSS | Fast, consistent |
| Charts | Recharts | Simple, accessible |
| Documents | HTML print view → PDF via browser; `docx` library for Word | No heavy server dependencies |
| Hosting | Docker container + managed Postgres (India region, e.g. AWS Mumbai) | Data residency |
| Media | S3-compatible storage (Phase 2) | |

**Core entities:**
- School, AcademicSession
- User (role), ClassSection, Enrollment, TeacherAssignment
- Chapter, Question
- Assessment (kind: PRACTICE / ASSIGNMENT / TEST / PUZZLE), AssessmentItem, AssessmentAssignment (to sections)
- Attempt, Response
- XpEvent, Badge, UserBadge
- Observation
- Project, ProjectSubmission, Rubric

## 12. Roadmap

| Phase | Scope | Target |
|---|---|---|
| **0 — Prototype (this build)** | Auth and roles; curriculum for all classes; sample original questions (Class 3 and Class 6); student practice, tests, results, XP/levels/badges/streak, Puzzle of the Day, leaderboard; teacher question bank, test generator (online + print + DOCX + answer key), class dashboard, skill heatmap, item analysis; observation journal | Now |
| 1 — MVP pilot | Content for all 6 classes (Year-1 targets); admin bulk import; assignments; short-answer marking; rubric engine; Postgres + deployment; 5–10 pilot schools | Feb–Mar 2027 |
| 2 — Launch 2027-28 | Project kits module; EVS worksheets; school dashboard; Hindi; PWA/offline; parent view; content CMS with review workflow | Apr 2027 |
| 3 — Growth | Adaptive recommendations; inter-school CT challenge/Olympiad; class challenges; more item types (grid, drag-drop); LMS/ERP integration, SSO | 2027-28 |

## 13. Open questions

1. Pricing model: per student per year vs school licence.
2. Bundling print books with platform access.
3. Content team size and authoring timeline for about 3,800 items.
4. Hosting provider and budget.
5. Brand name for the product.
6. Whether to run a Hitbullseye CT & AI Olympiad as lead generation.

---

## 14. v0.2 additions (built)

### 14.1 Who manages what

| Role | Area | Manages |
|---|---|---|
| Hitbullseye super-admin | `/hq` | Schools (create, suspend), each school's first admin login, platform usage; approves content |
| Hitbullseye content team | `/studio` | Questions (editor with live preview, CSV import, draft → review → published → retired, second-person approval), resources (lesson plans, worksheets, templates, files, links), project kits (milestones, teacher guides, rubrics), subject connections |
| School admin | `/admin` | Class sections; teacher ↔ section mapping (CT / AI / Projects); teachers and admins; students (add, edit, move, deactivate); Excel/CSV bulk import with row-by-row validation; password resets; printable login slips; activity log |
| Teacher | `/teacher` | Tests, homework, marking, projects, observation journal, class challenges, leaderboard |

New staff get a temporary password and must change it at first sign-in. Students don't need an email.

### 14.2 Projects (Classes 6–8: 2 × 20 h; Classes 3–5: optional)

- **Kit:** driving question, subjects, skills, 4–6 milestones (Define → Collect → Explore → Create → Present → Reflect), with a student task, teacher guide and deliverable for each, plus a 4-level rubric.
- **Flow:**
  1. The teacher launches a kit for a section; teams are made automatically and can be edited.
  2. Teams submit each milestone (text, link, photo or file).
  3. The teacher approves the submission (+30 XP each) or sends it back with feedback.
  4. The teacher scores the rubric; every student writes an individual reflection.
  5. The best work goes into the class showcase.
- **Seeded kits:**
  - Class 3: My Morning Robot
  - Class 5: Water Detectives
  - Class 6: Weather Watchers
  - Class 7: Nutri-Quest
  - Class 8: Game On!
- Themes follow CBSE's webinar examples and will be re-mapped when CBSE publishes its official list.

### 14.3 Homework

- An assignment combines auto-marked questions with up to 3 activities (written answer and/or photo upload).
- Short-answer questions are teacher-marked.
- The marking queue shows the student's work, the model answer, marks and feedback. The score updates and the student sees the feedback.

### 14.4 Cross-subject connections

- Every CT chapter is linked to its NCERT Maths chapter (the CBSE companion-book model).
- Chapters also carry authored links to EVS, Science, Social Science, English, Art, PE, Computer Studies and daily life, each with a one-line "how" and an activity idea.
- **Teachers:** curriculum map (chapters × skills × subjects), a chapter planner, and printable worksheets with answer keys.
- **Students:** "Where else will you use this?" on each chapter page.
- **EVS (TWAU) CT worksheets** for Classes 3–5, by theme. Theme names should be checked against the NCERT TWAU textbook in use.

### 14.5 Gamification v2 and student design

- **Design:** a separate playful theme ("Think Quest"), with rounded type, chunky buttons, a mascot ("Bitto"), confetti on correct answers, and mobile bottom navigation. Reduced-motion is respected.
- **Adventure map:** chapters are islands in worlds (Nature Trail = EVS, Thinking Islands = CT, AI Galaxy). Each island earns 0–3 stars:

  | Stars | Rule |
  |---|---|
  | 1 | ≥ 3 answers |
  | 2 | ≥ 6 answers and ≥ 60% correct |
  | 3 | ≥ 8 answers and ≥ 85% correct |

- **Avatar:** choose an animal buddy and background; accessories unlock at levels 2–10. Unlocks are earned, never bought.
- **Weekly missions:** practice sets, puzzles, correct answers, active days; rewards are claimed once a week.
- **Individual performance only:** no houses or team points. Students see their own week (XP vs last week, questions answered, accuracy); admins see the top students by XP this term.
- **Class challenges:** set by the teacher; a shared progress bar and a reward XP claim.
- **New badges:** Team Player, Showcase Star, Homework Hero.

## 15. Question bank at scale (v0.3)

- **Target reached:** at least 40 practice items per chapter, for all 98 chapters (3,952 items).
- **How the bank is made:**
  - Individually written items set the standard and cover each chapter's core ideas.
  - **Question families** add depth: each family is one reviewed question design with varied numbers and settings, and its answer and solution are computed.
  - **Situation banks** (hand-written real-life cases with known categories) power the AI and EVS families.
- **Governance:**
  - Generated items carry `source = GENERATED` and a `family` id.
  - Approval: `Question.approval` = UNREVIEWED | APPROVED | REJECTED, with `approvedById` and `approvedAt`. Written items are seeded APPROVED, generated ones UNREVIEWED (still usable). The REVIEWER role (and SUPERADMIN) approves in `/review`, in bulk or one by one; rejecting retires the question with a reason. Editing a question resets it to UNREVIEWED. HQ → Staff accounts creates reviewer and content logins.
  - Picture questions: `Question.figure` (JSON drawing spec) and `Question.optionFigures` (specs parallel to options) are rendered as SVG by the app; specs never contain markup. Kinds: pixel grid (with mirror / water / symmetry line), grid map, shapes, sequence, arrow, dots, bar chart, pictograph, clock (optionally mirrored), cube towers, fraction (circle/bar/grid), abacus, number line (marks and jumps), ruler, balance, jug, money, emoji icons (with ✓/✗ marks), angle, lines, calendar, number grid, matchsticks, area model, binary cards, beads. Every chapter carries 8 picture questions.
  - Reviewers can approve or retire a whole family by reviewing a sample.
  - Families can be edited centrally, and the bank re-generated.
- **Next:** let the content team author families in the studio (template + parameters + solution) without code.

## 16. Year plan and content library (v0.3)

- Time: Classes 3–5 get 50 h = 75 periods of 40 min. Classes 6–8 get 60 h = 90 periods in class (40 h CT + 20 h AI; 40 h projects outside the timetable). Chapter periods are stored on `Chapter.periods`, with defaults from `src/lib/plan.ts`; content staff can edit them (Studio → Teaching plan).
- Plan: `Lesson` (one row per period: kind, month, week, term, objective, flow, refs, homework) and `LessonLog` (a section's taught periods).
- Library: `Assessment.libType` ∈ CHAPTER_TEST | WORKSHEET | ASSIGNMENT | MONTHLY | TERM | MOCK (kind LIBRARY, schoolId null, unique `code`); teachers' copies keep `sourceId`. `Resource.kind` MODULE (markdown + `meta` question ids) and VIDEO (script in `body`, scenes in `meta`; recording via `url` or `fileId`). Activity kits are `ProjectKit` rows with kind ACTIVITY.
- Targets per class: modules and chapter tests (one per chapter), 600+ practice questions, 40 worksheets, 24 assignments, 8 monthly assessments, 2 term papers, 4 full-length practice papers, 12+ projects/activity kits, 20 concept videos.

- Class slides: `src/lib/slides.ts` builds a .pptx per chapter on demand (`/api/slides/[chapterId]`) from the module, the plan and the bank.

## 17. Learn it theory (Classes 3–8)

- Content: `prisma/content/theory/` (`THEORY`, keyed `<class>-CT-<chapter>`). Each chapter has an intro, 3–5 concepts (text, points, optional figure/table, worked example, remember note) and a thinking tip. Figures use the platform's `Fig` specs, including `lettergrid` and `venn`.
- Shown in the learning module (`TheoryView`, CT chapters of Classes 3–8; the AI chapters and EVS themes have none), in the class slides (Introduce section), and in the help-book PDF editions (`scripts/theory-pages.ts` + `docs/helpbooks/merge_helpbook.py`).

## 18. Concept-video uploads and period names

- `Setting` (key/value) holds platform settings. `videoUploadRoles` lists the roles allowed to upload concept videos; it is empty by default, so uploading is off and the upload page does not exist for anyone. The super-admin changes it in HQ → Settings.
- Allowed roles get `/videos` (all classes): add a YouTube or video link, upload an MP4/WebM file (`POST /api/videos/[id]`, up to `VIDEO_MAX_MB`, default 200), or remove a recording. Video links/files cannot be set from Content studio unless the role is allowed.
- Videos without a recording are hidden everywhere else (library, chapter pages, year plan, print plan, learn pages); teachers and students see only recorded videos, without scripts.
- Year-plan periods are labelled by chapter (`periodLabels` in `src/lib/plan.ts`): "Chapter 1-1", "Chapter 1-2", …; "AI Chapter n-k" / "EVS Chapter n-k"; "Getting started", "Term n revision", "Term n exam". `Lesson.number` stays as the internal order.
- Edited class slides: the super-admin uploads a .pptx per chapter in HQ → Class slides (`POST /api/slides/[chapterId]`, op upload/revert, max 100 MB, zip signature checked). It is stored as an internal `Resource` (kind SLIDES, status INTERNAL, code `DECK-<class>-<part>-<chapter>`), hidden from resource lists. `GET /api/slides/[chapterId]` serves the edited deck when there is one, else builds the deck; `?generated=1` always builds it.

## 19. CBSE handbook questions

- `Question.source = "CBSE"` with `sourceRef` (book, class, chapter, question). Codes: `CBSE-<class>-CT-<chapter>-<n>` and `CBSE-<class>-AI-<chapter>-<n>`.
- CT: extracted from the CBSE Teacher Handbooks (question, options, CBSE answer and solution); figures cropped from the pages as WebP in `public/cbse` and shown with the `image` figure kind. AI (Classes 6–8): end-of-chapter Exercises transcribed with CBSE's solutions; tables become multiple-choice rows; short answers are teacher-marked with CBSE's model answer.
- Students: chapter page "CBSE book questions" practice (book order, not-yet-correct first). Teachers: chapter card (print, answer key), question-bank and review filters, and a "Questions from" choice in the test generator. Library, slides and demo tests exclude CBSE questions.
- All CBSE questions start UNREVIEWED for a reviewer to check the transcription.

## 19. Question bank v0.4: CBSE handbook level

- Feedback: the earlier bank was easier and shorter than the CBSE handbook exercises. All 4,861 earlier questions now have `status = RETIRED` (kept for history; filtered out of practice, tests, homework, the library, slides and Puzzle of the Day by `status = PUBLISHED`).
- Live bank (4,448): help-book questions (1,580, `family = HELPBOOK`, `sourceRef` = book, chapter, question), CBSE handbook questions (`source = CBSE`), new CBSE-level CT families (`cbse_level*.ts`, 50 families) and AI/EVS scenario families (`scenario.ts`, 21 families).
- Help-book pictures use the `image` figure kind (`{kind:"image", src:"hb/…webp", w, h, alt}`); a picture-only MCQ shows the options inside the picture, and slides show it large with "Choose (a), (b), (c) or (d) from the picture."
- Seeding: `generateCbseLevel(have, 40, 12)` tops each CT chapter up to 40 (at least 12 new items), `generateScenario(have, 40, 20)` each AI/EVS chapter. Logic-puzzle families are solved by brute force and kept only when the answer is unique.
- Difficulty: help-book items get 3 for Thinking Spot or 45+ words, 1 for 12 words or fewer without a picture, else 2.
- Known gaps: one help-book question (Class 8 Ch 3 Q9, symbol notation) was skipped; some maths lines are shown as images; Class 3 help-book stems are short (about 20 words) by design of the book.
