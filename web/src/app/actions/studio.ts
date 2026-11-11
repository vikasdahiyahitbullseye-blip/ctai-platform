"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser, audit } from "@/lib/auth";
import { normaliseQuestion, type QuestionDraft } from "@/lib/questionInput";
import { parseCsvObjects } from "@/lib/csv";
import { saveUpload } from "@/lib/files";

const staff = () => requireUser("CONTENT", "SUPERADMIN");

async function chapterFor(classLevel: number, part: string, number: number) {
  return prisma.chapter.findUnique({ where: { classLevel_part_number: { classLevel, part, number } } });
}

async function nextCode(classLevel: number, part: string, ch: number, skill: string, type: string) {
  const prefix = `C${classLevel}-${part}-${type === "SHORT" ? "S" : ""}${String(ch).padStart(2, "0")}-${skill.slice(0, 3)}-`;
  const last = await prisma.question.findMany({ where: { code: { startsWith: prefix } }, select: { code: true } });
  const max = last.reduce((m, q) => Math.max(m, Number(q.code.split("-").pop())), 0);
  return `${prefix}${String(max + 1).padStart(4, "0")}`;
}

function draftFromForm(form: FormData): QuestionDraft {
  return {
    classLevel: Number(form.get("classLevel")),
    part: String(form.get("part")),
    chapterNumber: Number(form.get("chapterNumber")),
    type: String(form.get("type")),
    difficulty: Number(form.get("difficulty")),
    skills: form.getAll("skills").map(String),
    stem: String(form.get("stem") ?? ""),
    options: String(form.get("options") ?? "").split("\n").map((s) => s.trim()).filter(Boolean),
    answerRaw: String(form.get("answer") ?? ""),
    solution: String(form.get("solution") ?? ""),
    hint: String(form.get("hint") ?? "") || undefined,
    marks: Number(form.get("marks") || 0) || undefined,
    isPuzzle: form.get("isPuzzle") === "on",
  };
}

export async function saveQuestion(id: string | null, _: unknown, form: FormData) {
  const user = await staff();
  const intent = String(form.get("intent") ?? "draft");
  const n = normaliseQuestion(draftFromForm(form));
  if (!n.ok) return { error: n.error };
  const d = n.data;
  const chapter = await chapterFor(d.classLevel, d.part, d.chapterNumber);
  if (!chapter) return { error: "That chapter does not exist for this class." };
  const data = {
    classLevel: d.classLevel, chapterId: chapter.id, type: d.type, difficulty: d.difficulty, skills: d.skills.join(","), stem: d.stem,
    options: JSON.stringify(d.options), answer: JSON.stringify(d.answer), solution: d.solution, hint: d.hint ?? null,
    marks: d.marks ?? (d.difficulty === 3 ? 2 : 1), timeSec: 45 + d.difficulty * 30, isPuzzle: !!d.isPuzzle,
  };
  let qid = id;
  if (id) {
    const old = await prisma.question.findUniqueOrThrow({ where: { id } });
    const status = intent === "submit" ? "IN_REVIEW" : old.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
    // Picture options must stay parallel to the text options; drop them if the option count changed.
    const figs = old.optionFigures ? (JSON.parse(old.optionFigures) as unknown[]) : null;
    const keepFigs = !!figs && figs.length === d.options.length && (d.type === "MCQ" || d.type === "MULTI");
    await prisma.question.update({ where: { id }, data: { ...data, ...(figs && !keepFigs ? { optionFigures: null } : {}), status, version: { increment: 1 }, reviewNote: null, approval: "UNREVIEWED", approvedById: null, approvedAt: null } }); // changed content needs fresh approval
    await audit(user, "QUESTION_UPDATED", old.code);
  } else {
    const code = await nextCode(d.classLevel, d.part, d.chapterNumber, d.skills[0], d.type);
    const q = await prisma.question.create({ data: { ...data, code, status: intent === "submit" ? "IN_REVIEW" : "DRAFT", authorId: user.id } });
    qid = q.id;
    await audit(user, "QUESTION_CREATED", code);
  }
  revalidatePath("/studio/questions");
  redirect(`/studio/questions/${qid}?saved=1`);
}

/** Second-person review: the author cannot approve their own question (super-admin can). */
export async function reviewQuestion(id: string, decision: "approve" | "reject" | "retire" | "restore", form?: FormData) {
  const user = await staff();
  const q = await prisma.question.findUniqueOrThrow({ where: { id } });
  if (decision === "approve") {
    if (q.authorId === user.id && user.role !== "SUPERADMIN") throw new Error("Another reviewer must approve your question.");
    await prisma.question.update({ where: { id }, data: { status: "PUBLISHED", reviewNote: null, ...(user.role === "SUPERADMIN" ? { approval: "APPROVED", approvedById: user.id, approvedAt: new Date() } : {}) } });
  } else if (decision === "reject") {
    await prisma.question.update({ where: { id }, data: { status: "DRAFT", reviewNote: String(form?.get("note") ?? "") || "Changes requested" } });
  } else if (decision === "retire") {
    await prisma.question.update({ where: { id }, data: { status: "RETIRED" } });
  } else {
    await prisma.question.update({ where: { id }, data: { status: "DRAFT" } });
  }
  await audit(user, `QUESTION_${decision.toUpperCase()}`, q.code);
  revalidatePath(`/studio/questions/${id}`);
  revalidatePath("/studio");
}

export async function importQuestions(_: unknown, form: FormData) {
  const user = await staff();
  let csv = String(form.get("csv") ?? "");
  const file = form.get("file");
  if (file instanceof File && file.size) csv = await file.text();
  const rows = parseCsvObjects(csv);
  if (!rows.length) return { error: "No rows found. Use the template's header row." };
  const results: { line: number; ok: boolean; message: string }[] = [];
  for (const [i, r] of rows.entries()) {
    const draft: QuestionDraft = {
      classLevel: Number(r.class), part: (r.part || "CT").toUpperCase(), chapterNumber: Number(r.chapter), type: (r.type || "").toUpperCase(),
      difficulty: Number(r.difficulty), skills: (r.skills || "").split("|").map((s) => s.trim().toUpperCase()).filter(Boolean),
      stem: (r.question || "").replace(/\\n/g, "\n"), options: (r.options || "").split("|").map((s) => s.trim()).filter(Boolean),
      answerRaw: r.answer || "", solution: r.solution || "", hint: r.hint || undefined,
    };
    const n = normaliseQuestion(draft);
    if (!n.ok) { results.push({ line: i + 2, ok: false, message: n.error }); continue; }
    const chapter = await chapterFor(n.data.classLevel, n.data.part, n.data.chapterNumber);
    if (!chapter) { results.push({ line: i + 2, ok: false, message: "Chapter not found" }); continue; }
    const code = await nextCode(n.data.classLevel, n.data.part, n.data.chapterNumber, n.data.skills[0], n.data.type);
    await prisma.question.create({ data: { code, classLevel: n.data.classLevel, chapterId: chapter.id, type: n.data.type, difficulty: n.data.difficulty, skills: n.data.skills.join(","), stem: n.data.stem, options: JSON.stringify(n.data.options), answer: JSON.stringify(n.data.answer), solution: n.data.solution, hint: n.data.hint, marks: n.data.difficulty === 3 ? 2 : 1, status: "DRAFT", authorId: user.id } });
    results.push({ line: i + 2, ok: true, message: code });
  }
  await audit(user, "QUESTIONS_IMPORTED", `${results.filter((r) => r.ok).length} drafts`);
  revalidatePath("/studio/questions");
  return { results };
}

// ---------- Resources ----------
export async function saveResource(id: string | null, _: unknown, form: FormData) {
  const user = await staff();
  const title = String(form.get("title") ?? "").trim();
  if (title.length < 3) return { error: "Title is required." };
  const classLevel = Number(form.get("classLevel")) || null;
  const chapterId = String(form.get("chapterId") ?? "") || null;
  const kind = String(form.get("kind") ?? "WORKSHEET");
  // Video recordings are added only on the Concept videos page (roles allowed by the super-admin).
  const isVideo = kind === "VIDEO";
  let fileId: string | undefined;
  if (!isVideo) try {
    const f = await saveUpload(form.get("file") as File | null, user.id);
    if (f) fileId = f.id;
  } catch (e) {
    return { error: (e as Error).message };
  }
  const data = {
    title, kind, audience: String(form.get("audience") ?? "TEACHER"), classLevel, chapterId,
    description: String(form.get("description") ?? "") || null, body: String(form.get("body") ?? "") || null, ...(isVideo ? {} : { url: String(form.get("url") ?? "") || null }),
    status: form.get("published") === "on" ? "PUBLISHED" : "DRAFT", ...(fileId ? { fileId } : {}),
  };
  if ("url" in data && data.url && !/^https:\/\//.test(data.url)) return { error: "Links must start with https://" };
  const r = id ? await prisma.resource.update({ where: { id }, data }) : await prisma.resource.create({ data });
  await audit(user, id ? "RESOURCE_UPDATED" : "RESOURCE_CREATED", title);
  revalidatePath("/studio/resources");
  redirect(`/studio/resources/${r.id}?saved=1`);
}

export async function deleteResource(id: string) {
  const user = await staff();
  const r = await prisma.resource.delete({ where: { id } });
  await audit(user, "RESOURCE_DELETED", r.title);
  redirect("/studio/resources");
}

// ---------- Project kits ----------
export async function saveKit(id: string, form: FormData) {
  const user = await staff();
  const get = (k: string) => String(form.get(k) ?? "").trim();
  await prisma.projectKit.update({ where: { id }, data: { title: get("title"), tagline: get("tagline"), emoji: get("emoji") || "🧪", drivingQuestion: get("drivingQuestion"), overview: get("overview"), finalProduct: get("finalProduct"), subjects: form.getAll("subjects").map(String).join(","), published: form.get("published") === "on" } });
  const ms = await prisma.projectMilestone.findMany({ where: { kitId: id } });
  for (const m of ms) {
    await prisma.projectMilestone.update({ where: { id: m.id }, data: { title: get(`m_${m.id}_title`) || m.title, sessions: Number(get(`m_${m.id}_sessions`)) || m.sessions, studentTask: get(`m_${m.id}_studentTask`) || m.studentTask, teacherGuide: get(`m_${m.id}_teacherGuide`) || m.teacherGuide, deliverable: get(`m_${m.id}_deliverable`) || m.deliverable } });
  }
  const cs = await prisma.rubricCriterion.findMany({ where: { kitId: id } });
  for (const c of cs) {
    const levels = [1, 2, 3, 4].map((l) => get(`c_${c.id}_${l}`));
    if (levels.every(Boolean)) await prisma.rubricCriterion.update({ where: { id: c.id }, data: { name: get(`c_${c.id}_name`) || c.name, levels: JSON.stringify(levels) } });
  }
  await audit(user, "KIT_UPDATED", get("title"));
  revalidatePath(`/studio/projects/${id}`);
  redirect(`/studio/projects/${id}?saved=1`);
}

// ---------- Subject connections ----------
export async function addLink(chapterId: string, form: FormData) {
  const user = await staff();
  const subject = String(form.get("subject")), topic = String(form.get("topic") ?? "").trim(), how = String(form.get("how") ?? "").trim();
  if (!topic || !how) throw new Error("Topic and explanation are required");
  await prisma.subjectLink.create({ data: { chapterId, subject, topic, how, activity: String(form.get("activity") ?? "").trim() || null } });
  await audit(user, "LINK_ADDED", topic);
  revalidatePath("/studio/connections");
}

export async function deleteLink(id: string) {
  const user = await staff();
  await prisma.subjectLink.delete({ where: { id } });
  await audit(user, "LINK_DELETED", id);
  revalidatePath("/studio/connections");
}

export async function saveFocus(chapterId: string, form: FormData) {
  await staff();
  await prisma.chapter.update({ where: { id: chapterId }, data: { focus: String(form.get("focus") ?? "").trim() || null } });
  revalidatePath("/studio/connections");
}
