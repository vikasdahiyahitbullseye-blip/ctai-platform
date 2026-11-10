// Seeds the curriculum, original question bank and a demo school with simulated activity.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { CURRICULUM } from "../src/lib/constants";
import { rng, generatePaper } from "../src/lib/generator";
import { saveAnswer, submitAttempt, nextPracticeQuestion } from "../src/lib/attempts";
import { parseSkills } from "../src/lib/progress";
import { class3 } from "./content/class3";
import { class6, class6Short } from "./content/class6";
import { evs3 } from "./content/evs3";
import { class4 } from "./content/class4";
import { class5 } from "./content/class5";
import { class7 } from "./content/class7";
import { class8 } from "./content/class8";
import { class3more } from "./content/class3more";
import { class6more } from "./content/class6more";
import { CONNECTIONS } from "./content/connections";
import { PROJECT_KITS } from "./content/projects";
import { RESOURCES } from "./content/resources";
import { DEFAULT_HOUSES } from "../src/lib/constants";
import { ANIMALS, BACKGROUNDS } from "../src/lib/avatar";
import { saveTaskResponse, markWork } from "../src/lib/attempts";
import type { SeedQuestion } from "./content/types";
import { balanceOptions } from "./content/balance";

const db = new PrismaClient();
const rand = rng(2026);
const pick = <T,>(a: T[]) => a[Math.floor(rand() * a.length)];
const DAY = 86400000;

const FIRST = ["Aarav", "Diya", "Kabir", "Ananya", "Vihaan", "Ishita", "Reyansh", "Myra", "Arjun", "Saanvi", "Aditya", "Kiara", "Rohan", "Meera", "Dhruv", "Tara", "Kunal", "Nisha", "Yash", "Pooja", "Neil", "Riya", "Om", "Zoya", "Advik", "Sara", "Ishaan"];
const LAST = ["Sharma", "Verma", "Iyer", "Khan", "Patel", "Reddy", "Singh", "Das", "Nair", "Gupta", "Joshi", "Mehta", "Bose", "Kaur", "Rao"];

async function main() {
  // Wipe in dependency order.
  for (const m of ["missionClaim", "classChallenge", "rubricScore", "projectReflection", "milestoneSubmission", "projectTeamMember", "projectTeam", "projectRun", "rubricCriterion", "projectMilestone", "projectKit", "taskResponse", "assignmentTask", "subjectLink", "resource", "storedFile", "auditLog", "observation", "userBadge", "xpEvent", "response", "attempt", "assessmentAssignment", "assessmentItem", "assessment", "question", "chapter", "teacherAssignment", "enrollment", "classSection", "user", "house", "school"] as const) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db as any)[m].deleteMany();
  }

  // Curriculum
  const chapterId: Record<string, string> = {};
  for (const [cls, parts] of Object.entries(CURRICULUM)) {
    for (const [part, titles] of Object.entries(parts)) {
      for (const [i, title] of (titles as string[]).entries()) {
        const key = `${cls}-${part}-${i + 1}`;
        const conn = CONNECTIONS[key];
        const c = await db.chapter.create({ data: { classLevel: Number(cls), part, number: i + 1, title, hours: part === "AI" ? 5 : null, focus: conn?.focus } });
        chapterId[key] = c.id;
        const links = [...(conn?.links ?? [])];
        if (part === "CT") links.unshift({ subject: "MATHS", topic: `NCERT Mathematics — "${title}"`, how: "This CT chapter is the companion to the Maths chapter of the same name: teach the Maths concept, then use these thinking questions in the same period." });
        for (const l of links) await db.subjectLink.create({ data: { chapterId: c.id, ...l } });
      }
    }
  }

  // Question bank
  const counters: Record<string, number> = {};
  const addQuestions = async (cls: number, list: SeedQuestion[]) => {
    for (const raw of list) {
      const q = balanceOptions(raw);
      const part = q.part ?? "CT";
      const key = `${cls}-${part}-${q.ch}`;
      counters[key] = (counters[key] ?? 0) + 1;
      const code = `C${cls}-${part}-${q.type === "SHORT" ? "S" : ""}${String(q.ch).padStart(2, "0")}-${q.skills[0].slice(0, 3)}-${String(counters[key]).padStart(4, "0")}`;
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
  await addQuestions(6, [...class6, ...class6Short]);
  await addQuestions(3, evs3);
  await addQuestions(3, class3more);
  await addQuestions(6, class6more);
  await addQuestions(4, class4);
  await addQuestions(5, class5);
  await addQuestions(7, class7);
  await addQuestions(8, class8);

  // School and people
  const hash = await bcrypt.hash("demo123", 10);
  const hq = await db.school.create({ data: { name: "Hitbullseye (HQ)", city: "New Delhi", isHq: true, code: "HQ" } });
  await db.user.create({ data: { schoolId: hq.id, role: "SUPERADMIN", name: "Hitbullseye Super Admin", username: "superadmin", passwordHash: await bcrypt.hash("demo123", 10) } });
  const contentUser = await db.user.create({ data: { schoolId: hq.id, role: "CONTENT", name: "Content Team (Demo)", username: "content", passwordHash: await bcrypt.hash("demo123", 10) } });
  await db.question.updateMany({ data: { authorId: contentUser.id } });

  const school = await db.school.create({ data: { name: "Demo Public School", city: "New Delhi", code: "DPS-DEL" } });
  const houses = [];
  for (const h of DEFAULT_HOUSES) houses.push(await db.house.create({ data: { schoolId: school.id, ...h } }));
  const admin = await db.user.create({ data: { schoolId: school.id, role: "ADMIN", name: "Principal (Demo)", username: "admin", passwordHash: hash } });
  const teacher = await db.user.create({ data: { schoolId: school.id, role: "TEACHER", name: "Ms. Anjali Mehra", username: "teacher", passwordHash: hash } });
  const computerTeacher = await db.user.create({ data: { schoolId: school.id, role: "TEACHER", name: "Mr. Rohan Iyer", username: "rohan", passwordHash: hash } });
  void admin;

  const sections = {
    "3A": await db.classSection.create({ data: { schoolId: school.id, classLevel: 3, section: "A", leaderboard: false } }),
    "6A": await db.classSection.create({ data: { schoolId: school.id, classLevel: 6, section: "A" } }),
    "4A": await db.classSection.create({ data: { schoolId: school.id, classLevel: 4, section: "A", leaderboard: false } }),
    "5A": await db.classSection.create({ data: { schoolId: school.id, classLevel: 5, section: "A", leaderboard: false } }),
    "7A": await db.classSection.create({ data: { schoolId: school.id, classLevel: 7, section: "A" } }),
    "8A": await db.classSection.create({ data: { schoolId: school.id, classLevel: 8, section: "A" } }),
  };
  await db.teacherAssignment.createMany({
    data: [
      { userId: teacher.id, sectionId: sections["3A"].id, subject: "CT" },
      { userId: teacher.id, sectionId: sections["6A"].id, subject: "CT" },
      { userId: teacher.id, sectionId: sections["6A"].id, subject: "AI" },
      { userId: computerTeacher.id, sectionId: sections["6A"].id, subject: "AI" },
      { userId: teacher.id, sectionId: sections["4A"].id, subject: "CT" },
      { userId: teacher.id, sectionId: sections["5A"].id, subject: "CT" },
      { userId: teacher.id, sectionId: sections["7A"].id, subject: "CT" },
      { userId: teacher.id, sectionId: sections["8A"].id, subject: "CT" },
      { userId: computerTeacher.id, sectionId: sections["7A"].id, subject: "AI" },
      { userId: computerTeacher.id, sectionId: sections["8A"].id, subject: "AI" },
    ],
  });

  const now = Date.now();
  const students: { id: string; cls: number; ability: number; demo: boolean }[] = [];
  const used = new Set<string>();
  for (const [key, size] of [["3A", 14], ["6A", 16], ["4A", 8], ["5A", 8], ["7A", 8], ["8A", 8]] as const) {
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
          name: demo ? ({ 3: "Aarav Sharma", 4: "Kabir Iyer", 5: "Meera Nair", 6: "Diya Verma", 7: "Arjun Khan", 8: "Saanvi Rao" } as Record<number, string>)[sec.classLevel] : name,
          username: demo ? `student${sec.classLevel}` : `${sec.classLevel}${sec.section.toLowerCase()}${String(i + 1).padStart(2, "0")}`,
          rollNo: String(i + 1),
          passwordHash: hash,
          houseId: houses[i % houses.length].id,
          avatar: JSON.stringify({ animal: demo ? ({ 3: "fox", 4: "tiger", 5: "peacock", 6: "owl", 7: "dolphin", 8: "robot" } as Record<number, string>)[sec.classLevel] : ANIMALS[Math.floor(rand() * ANIMALS.length)].id, bg: BACKGROUNDS[Math.floor(rand() * BACKGROUNDS.length)].id, accessory: null }),
        },
      });
      await db.enrollment.create({ data: { userId: u.id, sectionId: sec.id } });
      // Ability spread: a few strugglers, most middling, a few strong.
      const ability = demo ? 0.72 : Math.min(0.95, Math.max(0.2, 0.35 + rand() * 0.6));
      students.push({ id: u.id, cls: sec.classLevel, ability, demo });
    }
  }

  const chaptersWithQs = async (cls: number) =>
    (await db.chapter.findMany({ where: { classLevel: cls, part: { not: "EVS" }, questions: { some: { isPuzzle: false } } }, select: { id: true } })).map((c) => c.id);
  const chMap: Record<number, string[]> = {};
  for (const c of [3, 4, 5, 6, 7, 8]) chMap[c] = await chaptersWithQs(c);

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
    const pool = (await db.question.findMany({ where: { classLevel: cls, isPuzzle: false, type: { not: "SHORT" }, chapterId: { in: chapters } } })).map((q) => ({ id: q.id, chapterId: q.chapterId, skills: parseSkills(q.skills), type: q.type, difficulty: q.difficulty, marks: q.marks }));
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

  // Resources
  for (const r of RESOURCES) {
    await db.resource.create({ data: { title: r.title, kind: r.kind, audience: r.audience, classLevel: r.classLevel, chapterId: r.ch ? chapterId[r.ch] : null, description: r.description, body: r.body } });
  }

  // Project kits
  const kitIds: Record<string, string> = {};
  for (const k of PROJECT_KITS) {
    const kit = await db.projectKit.create({
      data: {
        code: k.code, classLevel: k.classLevel, title: k.title, tagline: k.tagline, emoji: k.emoji, drivingQuestion: k.drivingQuestion, overview: k.overview,
        subjects: k.subjects.join(","), skills: k.skills.join(","), hours: k.hours, finalProduct: k.finalProduct,
        milestones: { create: k.milestones.map((m, i) => ({ position: i + 1, phase: m.phase, title: m.title, sessions: m.sessions, studentTask: m.studentTask, teacherGuide: m.teacherGuide, deliverable: m.deliverable, evidence: m.evidence ?? "ANY" })) },
        criteria: { create: k.rubric.map((c, i) => ({ position: i + 1, name: c.name, levels: JSON.stringify(c.levels) })) },
      },
    });
    kitIds[k.code] = kit.id;
  }

  // An active Weather Watchers project in 6-A, two weeks in.
  const run = await db.projectRun.create({ data: { kitId: kitIds["P6-WEATHER"], sectionId: sections["6A"].id, teacherId: computerTeacher.id, startedAt: new Date(now - 14 * DAY), dueAt: new Date(now + 40 * DAY) } });
  const s6 = students.filter((x) => x.cls === 6);
  const teamNames = ["Cloud Chasers", "Monsoon Mappers", "Sunny Side", "Storm Trackers"];
  const ms = await db.projectMilestone.findMany({ where: { kitId: kitIds["P6-WEATHER"] }, orderBy: { position: "asc" } });
  for (let t = 0; t < 4; t++) {
    const members = s6.filter((_, i) => i % 4 === t);
    const team = await db.projectTeam.create({ data: { runId: run.id, name: teamNames[t], members: { create: members.map((m) => ({ userId: m.id })) } } });
    const lead = members[0].id;
    await db.milestoneSubmission.create({ data: { teamId: team.id, milestoneId: ms[0].id, submittedById: lead, text: ["States: Kerala, Rajasthan, Delhi, Assam. Questions: Which is wettest? Which has the biggest day–night temperature difference? Does the coast keep temperatures steady?", "We chose Tamil Nadu, Punjab, Meghalaya and Gujarat. Roles: Diya records, Kabir checks, Meera charts, Arjun presents.", "Kerala, Himachal Pradesh, Bihar and Maharashtra. We want to know if hill states are colder every day.", "Goa, Delhi, Odisha, Rajasthan. Question: does rain follow a pattern across the week?"][t], status: "APPROVED", feedback: "Good contrasting choice of states. Make sure your questions can be answered with the data you collect.", submittedAt: new Date(now - 12 * DAY), reviewedAt: new Date(now - 11 * DAY) } });
    if (t < 3) await db.milestoneSubmission.create({ data: { teamId: team.id, milestoneId: ms[1].id, submittedById: lead, text: "Week 1 data recorded for all four states (see table). Source: newspaper weather page and IMD website. Missing one day for Assam — will fill from the website.", status: t === 2 ? "RETURNED" : "SUBMITTED", feedback: t === 2 ? "Two days are missing rainfall values. Please complete and resubmit." : null, submittedAt: new Date(now - 2 * DAY), reviewedAt: t === 2 ? new Date(now - DAY) : null } });
  }
  // A finished Class 3 mini project with scores and a showcase.
  const run3 = await db.projectRun.create({ data: { kitId: kitIds["P3-ROUTINE"], sectionId: sections["3A"].id, teacherId: teacher.id, startedAt: new Date(now - 20 * DAY), dueAt: new Date(now - 6 * DAY), status: "COMPLETED" } });
  const s3 = students.filter((x) => x.cls === 3);
  const ms3 = await db.projectMilestone.findMany({ where: { kitId: kitIds["P3-ROUTINE"] }, orderBy: { position: "asc" } });
  const crit3 = await db.rubricCriterion.findMany({ where: { kitId: kitIds["P3-ROUTINE"] } });
  for (let t = 0; t < 3; t++) {
    const members = s3.filter((_, i) => i % 3 === t);
    const team = await db.projectTeam.create({ data: { runId: run3.id, name: ["Robo Rockets", "Step Stars", "Bug Busters"][t], showcase: t === 0, members: { create: members.map((m) => ({ userId: m.id })) } } });
    for (const m of ms3) {
      await db.milestoneSubmission.create({ data: { teamId: team.id, milestoneId: m.id, submittedById: members[0].id, text: m.phase === "PRESENT" ? "Our robot put on shoes before socks! We moved 'wear socks' before 'wear shoes'." : m.phase === "REFLECT" ? "Robots can't guess. Every step must be said clearly and in order." : "1. Wake up 2. Brush teeth 3. Bath 4. Wear uniform 5. Wear socks 6. Wear shoes 7. Eat breakfast 8. Pack bag 9. Go to bus", status: "APPROVED", feedback: "Lovely work!", submittedAt: new Date(now - 10 * DAY), reviewedAt: new Date(now - 8 * DAY) } });
    }
    for (const c of crit3) await db.rubricScore.create({ data: { teamId: team.id, criterionId: c.id, level: Math.min(4, 2 + ((t + c.position) % 3)) } });
    for (const m of members.slice(0, 2)) await db.projectReflection.create({ data: { teamId: team.id, userId: m.id, learned: "Instructions must be in the right order.", challenge: "We forgot small steps like opening the tap.", nextTime: "Test with a friend sooner." } });
  }

  // Homework with an activity task (teacher-marked) for 3-A and 6-A.
  const makeHomework = async (cls: number, sectionId: string, title: string, qFilter: object, task: { title: string; prompt: string }, daysAgo: number, dueIn: number) => {
    const qs = await db.question.findMany({ where: { classLevel: cls, isPuzzle: false, ...qFilter }, take: 4, orderBy: { code: "asc" } });
    const hw = await db.assessment.create({
      data: {
        kind: "ASSIGNMENT", title, classLevel: cls, schoolId: school.id, createdById: teacher.id, createdAt: new Date(now - daysAgo * DAY),
        instructions: "Answer the questions, then do the activity at home and describe what you found.",
        items: { create: qs.map((q, i) => ({ questionId: q.id, position: i + 1, marks: q.marks })) },
        tasks: { create: [{ position: 1, title: task.title, prompt: task.prompt, responseType: "ANY", marks: 4 }] },
      },
      include: { items: { include: { question: true } }, tasks: true },
    });
    await db.assessmentAssignment.create({ data: { assessmentId: hw.id, sectionId, dueAt: new Date(now + dueIn * DAY), createdAt: new Date(now - daysAgo * DAY) } });
    for (const s of students.filter((x) => x.cls === cls && !x.demo)) {
      if (rand() > 0.6) continue;
      const at = new Date(now - (daysAgo - 1) * DAY);
      const attempt = await db.attempt.create({ data: { userId: s.id, assessmentId: hw.id, startedAt: at } });
      for (const it of hw.items) await saveAnswer(db, attempt.id, it.questionId, answerFor(it.question, rand() < pCorrect(s.ability, it.question.difficulty)), { at });
      await saveTaskResponse(db, attempt.id, hw.tasks[0].id, { text: pick(task.title.includes("water") ? ["Bath 20 L, brushing 2 L (tap off!), cooking 10 L. Total 32 L. Brushing with tap off saved the most.", "My family used 3 buckets for baths. We can use 1 mug for brushing.", "We found a leaking tap in the kitchen and told my father to fix it."] : ["Smart speaker (NLP), phone face unlock (computer vision), YouTube suggestions (recommendations).", "Google Maps traffic, spam filter in email, voice typing on phone.", "Photo app that groups faces, Alexa, auto-correct on keyboard."]) });
      await submitAttempt(db, attempt.id, new Date(at.getTime() + 3600000));
      if (rand() < 0.4) {
        const fresh = await db.attempt.findUniqueOrThrow({ where: { id: attempt.id }, include: { taskResponses: true } });
        await markWork(db, attempt.id, { responses: [], tasks: fresh.taskResponses.map((t) => ({ id: t.id, marks: 2 + Math.floor(rand() * 3), feedback: "Good observations — try to add numbers next time." })) });
      }
    }
  };
  await makeHomework(3, sections["3A"].id, "Homework: Every drop counts", { chapter: { part: "EVS", number: 5 } }, { title: "My water diary", prompt: "Keep a **water diary** for one day at home. How many buckets or mugs did your family use for bathing, brushing and cooking? Which activity used the most water? Write or upload a photo of your diary." }, 3, 3);
  await makeHomework(6, sections["6A"].id, "Homework: AI around my home", { chapter: { part: "AI", number: 1 } }, { title: "AI spotter", prompt: "Find **three** things at home or in your family's phones that use AI. For each one, write what it does and which AI domain it belongs to (Computer Vision, NLP or Data Science)." }, 4, 2);

  // Class challenges
  await db.classChallenge.create({ data: { sectionId: sections["3A"].id, title: "Brain Builders Week: 300 correct answers as a class!", metric: "CORRECT_ANSWERS", target: 300, rewardXp: 30, startsAt: new Date(now - 4 * DAY), endsAt: new Date(now + 3 * DAY), createdById: teacher.id } });
  await db.classChallenge.create({ data: { sectionId: sections["6A"].id, title: "Puzzle Marathon: 40 puzzles solved", metric: "PUZZLES", target: 40, rewardXp: 40, startsAt: new Date(now - 6 * DAY), endsAt: new Date(now + 8 * DAY), createdById: teacher.id } });

  const counts = await Promise.all([db.question.count(), db.attempt.count(), db.response.count(), db.userBadge.count()]);
  console.log(`Seeded: ${counts[0]} questions, ${counts[1]} attempts, ${counts[2]} responses, ${counts[3]} badges.`);
  console.log("Logins (password demo123): teacher, rohan, student3–student8, admin, content, superadmin");
}

main().finally(() => db.$disconnect());
