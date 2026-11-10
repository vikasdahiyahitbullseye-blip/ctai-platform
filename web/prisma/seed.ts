// Seeds the curriculum, original question bank and a demo school with simulated activity.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { CURRICULUM } from "../src/lib/constants";
import { rng, generatePaper } from "../src/lib/generator";
import { saveAnswer, submitAttempt, nextPracticeQuestion } from "../src/lib/attempts";
import { parseSkills } from "../src/lib/progress";
import { class3 } from "./content/class3";
import { class6 } from "./content/class6";
import type { SeedQuestion } from "./content/types";

const db = new PrismaClient();
const rand = rng(2026);
const pick = <T,>(a: T[]) => a[Math.floor(rand() * a.length)];
const DAY = 86400000;

const FIRST = ["Aarav", "Diya", "Kabir", "Ananya", "Vihaan", "Ishita", "Reyansh", "Myra", "Arjun", "Saanvi", "Aditya", "Kiara", "Rohan", "Meera", "Dhruv", "Tara", "Kunal", "Nisha", "Yash", "Pooja", "Neil", "Riya", "Om", "Zoya", "Advik", "Sara", "Ishaan"];
const LAST = ["Sharma", "Verma", "Iyer", "Khan", "Patel", "Reddy", "Singh", "Das", "Nair", "Gupta", "Joshi", "Mehta", "Bose", "Kaur", "Rao"];

async function main() {
  // Wipe in dependency order.
  for (const m of ["observation", "userBadge", "xpEvent", "response", "attempt", "assessmentAssignment", "assessmentItem", "assessment", "question", "chapter", "teacherAssignment", "enrollment", "classSection", "user", "school"] as const) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db as any)[m].deleteMany();
  }

  // Curriculum
  const chapterId: Record<string, string> = {};
  for (const [cls, parts] of Object.entries(CURRICULUM)) {
    for (const [part, titles] of Object.entries(parts)) {
      for (const [i, title] of (titles as string[]).entries()) {
        const c = await db.chapter.create({ data: { classLevel: Number(cls), part, number: i + 1, title, hours: part === "AI" ? 5 : null } });
        chapterId[`${cls}-${part}-${i + 1}`] = c.id;
      }
    }
  }

  // Question bank
  const counters: Record<string, number> = {};
  const addQuestions = async (cls: number, list: SeedQuestion[]) => {
    for (const q of list) {
      const part = q.part ?? "CT";
      const key = `${cls}-${part}-${q.ch}`;
      counters[key] = (counters[key] ?? 0) + 1;
      const code = `C${cls}-${part}-${String(q.ch).padStart(2, "0")}-${q.skills[0].slice(0, 3)}-${String(counters[key]).padStart(4, "0")}`;
      await db.question.create({
        data: {
          code,
          classLevel: cls,
          chapterId: chapterId[key],
          skills: q.skills.join(","),
          type: q.type,
          difficulty: q.d,
          stem: q.stem,
          options: JSON.stringify(q.options ?? []),
          answer: JSON.stringify(q.answer),
          solution: q.solution,
          hint: q.hint,
          marks: q.d === 3 ? 2 : 1,
          timeSec: 45 + q.d * 30,
          isPuzzle: !!q.puzzle,
        },
      });
    }
  };
  await addQuestions(3, class3);
  await addQuestions(6, class6);

  // School and people
  const hash = await bcrypt.hash("demo123", 10);
  const school = await db.school.create({ data: { name: "Demo Public School", city: "New Delhi" } });
  const admin = await db.user.create({ data: { schoolId: school.id, role: "ADMIN", name: "Principal (Demo)", username: "admin", passwordHash: hash } });
  const teacher = await db.user.create({ data: { schoolId: school.id, role: "TEACHER", name: "Ms. Anjali Mehra", username: "teacher", passwordHash: hash } });
  void admin;

  const sections = {
    "3A": await db.classSection.create({ data: { schoolId: school.id, classLevel: 3, section: "A", leaderboard: false } }),
    "6A": await db.classSection.create({ data: { schoolId: school.id, classLevel: 6, section: "A" } }),
  };
  await db.teacherAssignment.createMany({
    data: [
      { userId: teacher.id, sectionId: sections["3A"].id, subject: "CT" },
      { userId: teacher.id, sectionId: sections["6A"].id, subject: "CT" },
      { userId: teacher.id, sectionId: sections["6A"].id, subject: "AI" },
    ],
  });

  const now = Date.now();
  const students: { id: string; cls: number; ability: number; demo: boolean }[] = [];
  const used = new Set<string>();
  for (const [key, size] of [["3A", 14], ["6A", 16]] as const) {
    const sec = sections[key];
    for (let i = 0; i < size; i++) {
      let name = "";
      do name = `${pick(FIRST)} ${pick(LAST)}`; while (used.has(name));
      used.add(name);
      const demo = i === 0;
      const u = await db.user.create({
        data: {
          schoolId: school.id,
          role: "STUDENT",
          name: demo ? (sec.classLevel === 3 ? "Aarav Sharma" : "Diya Verma") : name,
          username: demo ? `student${sec.classLevel}` : `${sec.classLevel}${sec.section.toLowerCase()}${String(i + 1).padStart(2, "0")}`,
          rollNo: String(i + 1),
          passwordHash: hash,
        },
      });
      await db.enrollment.create({ data: { userId: u.id, sectionId: sec.id } });
      // Ability spread: a few strugglers, most middling, a few strong.
      const ability = demo ? 0.72 : Math.min(0.95, Math.max(0.2, 0.35 + rand() * 0.6));
      students.push({ id: u.id, cls: sec.classLevel, ability, demo });
    }
  }

  const chaptersWithQs = async (cls: number) =>
    (await db.chapter.findMany({ where: { classLevel: cls, questions: { some: { isPuzzle: false } } }, select: { id: true } })).map((c) => c.id);
  const chMap = { 3: await chaptersWithQs(3), 6: await chaptersWithQs(6) } as Record<number, string[]>;

  const answerFor = (q: { type: string; answer: string; options: string }, correct: boolean) => {
    const key = JSON.parse(q.answer);
    if (correct) return key;
    const opts = JSON.parse(q.options) as string[];
    switch (q.type) {
      case "MCQ": return (Number(key) + 1 + Math.floor(rand() * (opts.length - 1))) % opts.length;
      case "MULTI": return [Number(key[0])];
      case "TRUE_FALSE": return !key;
      case "NUMERIC": return Number(key) + (rand() < 0.5 ? 1 : -1) * (1 + Math.floor(rand() * 3));
      case "FILL_BLANK": return "not sure";
      case "ORDER": return [...key].reverse();
      default: return null;
    }
  };
  const pCorrect = (ability: number, difficulty: number) => Math.min(0.97, Math.max(0.05, ability - (difficulty - 2) * 0.18));

  // Practice history over the past 3 weeks (school days mostly).
  for (const s of students) {
    const sessions = s.demo ? 6 : 2 + Math.floor(rand() * 6);
    const days = new Set<number>();
    while (days.size < sessions) {
      const d = 1 + Math.floor(rand() * 21);
      const dow = new Date(now - d * DAY).getDay();
      if (dow !== 0 && dow !== 6) days.add(d);
    }
    if (s.demo) [1, 2, 3].forEach((d) => days.add(d)); // recent streak for demo accounts
    for (const d of [...days].sort((a, b) => b - a)) {
      const at0 = new Date(now - d * DAY + 10 * 3600000 + Math.floor(rand() * 4) * 3600000);
      const ch = pick(chMap[s.cls]);
      const a = await db.assessment.create({ data: { kind: "PRACTICE", title: "Practice", classLevel: s.cls, blueprint: JSON.stringify({ chapterIds: [ch] }) } });
      const attempt = await db.attempt.create({ data: { userId: s.id, assessmentId: a.id, startedAt: at0 } });
      for (let i = 0; i < 8; i++) {
        const q = await nextPracticeQuestion(db, attempt.id, rand);
        if (!q) break;
        const correct = rand() < pCorrect(s.ability, q.difficulty);
        await saveAnswer(db, attempt.id, q.id, answerFor(q, correct), { at: new Date(at0.getTime() + i * 50000), timeSec: 20 + Math.floor(rand() * 60), usedHint: !correct && rand() < 0.2 });
      }
      await submitAttempt(db, attempt.id, new Date(at0.getTime() + 9 * 50000));
    }

    // Puzzles of the Day solved on some days.
    const puzzles = await db.question.findMany({ where: { classLevel: s.cls, isPuzzle: true } });
    const puzzleDays = s.demo ? [1, 2, 3, 4, 7] : [1, 2, 3, 4, 5, 8, 9].filter(() => rand() < 0.45);
    for (const d of puzzleDays) {
      const date = new Date(now - d * DAY);
      const title = `Puzzle of the Day ${date.toISOString().slice(0, 10)}`;
      const q = puzzles[d % puzzles.length];
      let a = await db.assessment.findFirst({ where: { kind: "PUZZLE", classLevel: s.cls, title } });
      if (!a) a = await db.assessment.create({ data: { kind: "PUZZLE", title, classLevel: s.cls, items: { create: { questionId: q.id, position: 1, marks: q.marks } } } });
      const at = new Date(date.getTime() + 8 * 3600000);
      const attempt = await db.attempt.create({ data: { userId: s.id, assessmentId: a.id, startedAt: at } });
      await saveAnswer(db, attempt.id, q.id, answerFor(q, rand() < pCorrect(s.ability, q.difficulty) + 0.1), { at });
    }
  }

  // Teacher-made tests via the generator.
  const makeTest = async (cls: number, sectionId: string, title: string, chapters: string[], count: number, daysAgo: number, dueInDays: number, completion: number) => {
    const pool = (await db.question.findMany({ where: { classLevel: cls, isPuzzle: false, chapterId: { in: chapters } } })).map((q) => ({ id: q.id, chapterId: q.chapterId, skills: parseSkills(q.skills), type: q.type, difficulty: q.difficulty, marks: q.marks }));
    const blueprint = { chapterIds: chapters, count, difficultyMix: { 1: 40, 2: 40, 3: 20 } as const, seed: daysAgo + 7 };
    const gen = generatePaper(pool, blueprint);
    const created = new Date(now - daysAgo * DAY);
    const test = await db.assessment.create({
      data: {
        kind: "TEST", title, classLevel: cls, schoolId: school.id, createdById: teacher.id, createdAt: created, durationMin: 30,
        instructions: "Read each question carefully. Show your thinking on rough paper.",
        blueprint: JSON.stringify(blueprint),
        items: { create: gen.items.map((q, i) => ({ questionId: q.id, position: i + 1, marks: q.marks, section: q.difficulty === 3 ? "B" : "A" })) },
      },
      include: { items: { include: { question: true } } },
    });
    await db.assessmentAssignment.create({ data: { assessmentId: test.id, sectionId, dueAt: new Date(now + dueInDays * DAY), createdAt: created } });
    for (const s of students.filter((x) => x.cls === cls)) {
      if (s.demo && dueInDays > 0) continue; // leave pending work for demo logins
      if (rand() > completion) continue;
      const at = new Date(created.getTime() + (1 + rand() * Math.max(1, daysAgo - 1)) * DAY * 0.5);
      const attempt = await db.attempt.create({ data: { userId: s.id, assessmentId: test.id, startedAt: at } });
      for (const [i, it] of test.items.entries()) {
        if (rand() < 0.04) continue; // occasional skipped question
        await saveAnswer(db, attempt.id, it.questionId, answerFor(it.question, rand() < pCorrect(s.ability, it.question.difficulty)), { at: new Date(at.getTime() + i * 60000) });
      }
      await submitAttempt(db, attempt.id, new Date(at.getTime() + 20 * 60000));
    }
  };
  await makeTest(3, sections["3A"].id, "Chapter Test: What's in a Name? & Fun with Shapes", [chapterId["3-CT-1"], chapterId["3-CT-5"]], 10, 8, -2, 0.95);
  await makeTest(3, sections["3A"].id, "Weekly Check: The Surajkund Fair", [chapterId["3-CT-14"]], 8, 2, 4, 0.6);
  await makeTest(6, sections["6A"].id, "Unit Test: Patterns & Number Play", [chapterId["6-CT-1"], chapterId["6-CT-3"]], 12, 9, -3, 0.9);
  await makeTest(6, sections["6A"].id, "AI Quiz: Introduction to AI & Digital Safety", [chapterId["6-AI-1"], chapterId["6-AI-4"]], 10, 2, 5, 0.55);

  // A few observation-journal entries.
  const notes = ["Explained the pattern rule clearly to the group.", "Needed prompting to break the problem into steps.", "Tried two strategies before asking for help.", "Rushed; skipped checking the answer.", "Helped a classmate debug their directions."];
  for (const s of students.slice(0, 12)) {
    await db.observation.create({ data: { studentId: s.id, observerId: teacher.id, skill: pick(["PATTERN", "DECOMPOSITION", "ALGORITHMIC", "ABSTRACT"]), rating: 1 + Math.floor(rand() * 4), note: pick(notes), createdAt: new Date(now - Math.floor(rand() * 10) * DAY) } });
  }

  const counts = await Promise.all([db.question.count(), db.attempt.count(), db.response.count(), db.userBadge.count()]);
  console.log(`Seeded: ${counts[0]} questions, ${counts[1]} attempts, ${counts[2]} responses, ${counts[3]} badges.`);
  console.log("Logins (password demo123): teacher, student3, student6, admin");
}

main().finally(() => db.$disconnect());
