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
| `student3`, `student6` | Students (Class 3-A, Class 6-A) |
| `teacher` | Teacher, Classes 3-A and 6-A |
| `rohan` | Computer teacher, 6-A (runs the Weather Watchers project) |
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

**Content:** curriculum chapters for all six classes (CBSE 2026-27 handbooks) plus EVS themes for Classes 3–5; 96 original sample questions (Classes 3 and 6, incl. EVS and short answers); 5 project kits; teaching resources; subject connections. Content for the other classes is to be authored (see SPEC §5 targets).

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
