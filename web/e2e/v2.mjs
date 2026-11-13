// End-to-end checks for management, content workflow, homework marking, projects and gamification.
// Usage: node e2e/v2.mjs [baseUrl] [screenshotDir]   (run on freshly seeded data)
import { createRequire } from "node:module";
import fs from "node:fs";
const { chromium } = createRequire(import.meta.url)("playwright");

const BASE = process.argv[2] ?? "http://localhost:3000";
const SHOTS = process.argv[3] ?? "e2e/screenshots";
fs.mkdirSync(SHOTS, { recursive: true });
const errors = [];
const log = (...a) => console.log("•", ...a);
const browser = await chromium.launch();
const stamp = Date.now() % 100000;

async function session(username, password = "demo123") {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 } });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(`${username} at ${page.url()}: ${e.message}`));
  page.on("dialog", (d) => d.accept());
  await page.goto(`${BASE}/login`);
  await page.fill('input[name="username"]', username);
  await page.fill('input[name="password"]', password);
  await Promise.all([page.waitForURL((u) => !u.pathname.startsWith("/login")), page.click('button:has-text("Sign in")')]);
  return { ctx, page };
}
const shot = (page, name) => page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: true });
const check = (cond, msg) => { if (!cond) errors.push(msg); };

// ---------- School admin ----------
let newStudent;
{
  const { page, ctx } = await session("admin");
  await page.goto(`${BASE}/admin/classes`);
  await page.selectOption('select[name="classLevel"]', "4");
  await page.fill('input[name="section"]', "B");
  await page.click('button:has-text("Add class")');
  await page.waitForSelector("text=Class 4-B");
  log("admin: class 4-B created");
  // Map a teacher to 4-B
  const card = page.locator("section", { has: page.locator("h2", { hasText: "Class 4-B" }) });
  await card.locator('select[name="teacherId"]').selectOption({ label: "Ms. Anjali Mehra" });
  await card.locator('button:has-text("Assign")').click();
  await card.locator("li", { hasText: "Ms. Anjali Mehra" }).first().waitFor();
  log("admin: teacher mapped");
  // Bulk import
  await page.goto(`${BASE}/admin/import`);
  await page.fill('textarea[name="csv"]', `name,class,section,roll\nTest Kid ${stamp},4,B,1\nSecond Kid,4,B,2\nBad Row,9,Z,3`);
  await page.click('button:has-text("Check file")');
  await page.waitForSelector("text=with errors");
  check(await page.locator("text=does not exist").count() > 0, "import should flag bad class");
  await page.fill('textarea[name="csv"]', `name,class,section,roll\nTest Kid ${stamp},4,B,1\nSecond Kid,4,B,2`);
  await page.click('button:has-text("Check file")');
  await page.waitForSelector("text=no errors");
  await page.click('button:has-text("Create 2 student accounts")');
  await page.waitForSelector("text=logins created");
  await shot(page, "v2-01-admin-import-credentials");
  const row = page.locator("tr", { hasText: `Test Kid ${stamp}` });
  newStudent = { username: (await row.locator("td").nth(2).innerText()).trim(), password: (await row.locator("td").nth(3).innerText()).trim() };
  log("admin: imported, new login", newStudent.username);
  await page.goto(`${BASE}/admin/audit`);
  check(await page.locator("text=STUDENTS_IMPORTED").count() > 0, "audit log missing import");
  await ctx.close();
}
// New student can sign in
{
  const { page, ctx } = await session(newStudent.username, newStudent.password);
  check(page.url().endsWith("/student"), "new student did not land on /student: " + page.url());
  log("new student signs in ok");
  await ctx.close();
}

// ---------- Content workflow: author → reviewer ----------
let qUrl;
{
  const { page, ctx } = await session("content");
  await page.goto(`${BASE}/studio/questions/new`);
  await page.selectOption('select[name="classLevel"]', "4");
  await page.selectOption('select[name="chapterNumber"]', "3");
  await page.check('input[value="PATTERN"]');
  await page.fill('textarea[name="stem"]', `What comes next? 3, 6, 9, 12, ___ (${stamp})`);
  await page.fill('textarea[name="options"]', "13\n14\n15\n16");
  await page.fill('input[name="answer"]', "c");
  await page.fill('textarea[name="solution"]', "The numbers go up by 3. 12 + 3 = 15.");
  await shot(page, "v2-02-studio-editor");
  await Promise.all([page.waitForURL(/studio\/questions\/.+\?saved=1/), page.click('button:has-text("send for review")')]);
  qUrl = page.url().split("?")[0];
  check(await page.locator("text=Waiting for another reviewer").count() > 0, "author should not be able to approve own question");
  log("content: question submitted for review");
  await ctx.close();
}
{
  const { page, ctx } = await session("superadmin");
  await page.goto(qUrl);
  await page.click('button:has-text("Approve")');
  await page.waitForSelector("text=PUBLISHED");
  log("superadmin: question approved");
  await page.goto(`${BASE}/hq`);
  await shot(page, "v2-03-hq");
  await ctx.close();
}

// ---------- Homework: student does activity, teacher marks ----------
let hwAttemptUrl;
{
  const { page, ctx } = await session("student3");
  await page.goto(`${BASE}/student/tests`);
  await Promise.all([page.waitForURL(/\/student\/play\//), page.locator("li", { hasText: "Homework: Filling and Lifting" }).locator('button:has-text("Start")').click()]);
  await page.waitForSelector("text=Activity 1");
  const radios = page.locator('[role="radio"]');
  if (await radios.count()) await radios.first().click();
  for (const input of await page.locator('main input[type="text"]').all()) await input.fill("28");
  await page.locator("textarea").last().fill("We used 3 buckets for baths and 1 mug for brushing. Bath used the most water.");
  await page.waitForSelector("text=All changes saved", { timeout: 10000 });
  await shot(page, "v2-04-homework-player");
  await Promise.all([page.waitForURL(/\/student\/result\//), page.click('button:has-text("Hand in homework")')]);
  check(await page.locator("text=Waiting for teacher").count() > 0, "homework result should show waiting for teacher");
  hwAttemptUrl = page.url();
  log("student3: homework handed in");
  await ctx.close();
}
{
  const { page, ctx } = await session("teacher");
  await page.goto(`${BASE}/teacher/assignments`);
  await page.click("text=Homework: Filling and Lifting");
  const row = page.locator("tr", { hasText: "Aarav Sharma" });
  await row.locator("text=Mark →").click();
  await page.waitForSelector("text=Marking: Aarav Sharma");
  await page.locator('input[type="number"]').first().fill("3");
  await page.locator('input[placeholder="Feedback for the student"]').first().fill("Great observation! Add how many litres next time.");
  await page.click('button:has-text("Save marks")');
  await page.waitForSelector("text=fully marked");
  await shot(page, "v2-05-teacher-marking");
  log("teacher: homework marked");
  await ctx.close();
}
{
  const { page, ctx } = await session("student3");
  await page.goto(hwAttemptUrl);
  check(await page.locator("text=Great observation").count() > 0, "student should see teacher feedback");
  log("student3: sees feedback");
  await ctx.close();
}

// ---------- Projects ----------
let teamUrl;
{
  const { page, ctx } = await session("student6");
  await page.goto(`${BASE}/student/projects`);
  await page.click("text=Weather Watchers");
  await page.waitForSelector("text=Step 2");
  teamUrl = page.url();
  const step = page.locator("li", { has: page.locator("h2", { hasText: "Step 2:" }) });
  const summary = step.locator("summary");
  if (!(await step.locator('textarea[name="text"]').isVisible())) await summary.click();
  await step.locator('textarea[name="text"]').fill("Two weeks of data recorded for Kerala, Rajasthan, Delhi and Assam. Kerala had rain on 9 of 10 days.");
  await step.locator('button:has-text("Send to teacher")').click();
  await page.waitForSelector("text=Sent to your teacher");
  await shot(page, "v2-06-student-project");
  log("student6: milestone submitted");
  await ctx.close();
}
{
  const { page, ctx } = await session("rohan");
  await page.goto(`${BASE}/teacher/projects`);
  await page.click("text=Weather Watchers");
  await page.waitForSelector("text=Progress by team");
  await shot(page, "v2-07-teacher-project-run");
  await page.locator("text=Review →").first().click();
  await page.waitForSelector("text=Rubric score");
  const btn = page.locator('button:has-text("Approve")').first();
  await btn.click();
  await page.waitForTimeout(800);
  // Score rubric: choose level 3 for every criterion
  for (const r of await page.locator('input[type="radio"][value="3"]').all()) await r.check();
  await page.click('button:has-text("Save rubric scores")');
  await page.waitForSelector("text=Rubric score ·");
  await shot(page, "v2-08-teacher-team-review");
  log("rohan: milestone approved and rubric scored");
  await ctx.close();
}

// ---------- Gamification: avatar ----------
{
  const { page, ctx } = await session("student6");
  await page.goto(`${BASE}/student/me`);
  await page.click('button[aria-label="Tiger"]');
  await page.click('button:has-text("Save my look")');
  await page.waitForTimeout(800);
  await page.reload();
  check((await page.locator('button[aria-label="Tiger"][aria-pressed="true"]').count()) === 1, "avatar not saved");
  const locked = page.locator('button[aria-label*="unlocks at level"]').first();
  check(await locked.isDisabled(), "locked accessory should be disabled");
  await shot(page, "v2-09-avatar");
  await page.goto(`${BASE}/student/map`);
  await page.locator('a:has-text("Patterns in Mathematics")').click();
  await page.waitForSelector("text=Where else will you use this?");
  await shot(page, "v2-10-student-chapter-links");
  log("student6: avatar + chapter connections ok");
  await ctx.close();
}

// ---------- Question approval: reviewer approves, rejects; super-admin creates a reviewer ----------
{
  const { page, ctx } = await session("reviewer");
  check(page.url().endsWith("/review"), "reviewer should land on /review");
  const awaiting = async () => Number(await page.getAttribute("[data-awaiting]", "data-awaiting"));
  const before = await awaiting();
  check(before > 2000, `expected thousands awaiting approval, got ${before}`);
  await page.goto(`${BASE}/review?cls=5&source=GENERATED`);
  await shot(page, "v2-11-review-queue");
  const ticks = page.locator('input[name="ids"]');
  const shown = await ticks.count();
  check(shown === 20, `expected 20 in the queue, got ${shown}`);
  await ticks.nth(0).uncheck(); // leave one out
  await Promise.all([page.waitForResponse((r) => r.request().method() === "POST" && r.url().includes("/review")), page.click('button:has-text("Approve ticked questions")')]);
  await page.goto(`${BASE}/review`);
  const after = await awaiting();
  check(before - after === 19, `approving 19 should drop the queue by 19 (was ${before}, now ${after})`);
  // Reject one with a reason
  await page.goto(`${BASE}/review?cls=3`);
  const first = page.locator("ol > li").first();
  const code = (await first.locator("code").first().textContent()).trim();
  await first.locator('input[placeholder^="Reason"]').fill("Picture is unclear");
  await Promise.all([page.waitForResponse((r) => r.request().method() === "POST" && r.url().includes("/review")), first.locator('button:has-text("Reject")').click()]);
  await page.goto(`${BASE}/review?state=REJECTED`);
  await page.waitForSelector(`text=${code}`);
  check(await page.locator("text=Reason: Picture is unclear").count() > 0, "reject reason should show");
  log(`reviewer: approved 19, rejected ${code}`);
  for (const p of ["/studio", "/hq", "/admin", "/teacher"]) {
    await page.goto(BASE + p);
    check(page.url().endsWith("/review"), `reviewer reached ${p}`);
  }
  await ctx.close();

  const sa = await session("superadmin");
  await sa.page.goto(`${BASE}/hq`);
  await sa.page.waitForSelector("text=awaiting approval");
  await sa.page.goto(`${BASE}/hq/staff`);
  await sa.page.fill('input[name="name"]', "Priya Reviewer");
  await sa.page.click('button:has-text("Create login")');
  await sa.page.waitForSelector("text=Priya Reviewer >> nth=0");
  check(await sa.page.locator("td:has-text('Question reviewer')").count() >= 2, "new reviewer should be listed");
  await shot(sa.page, "v2-12-staff-accounts");
  await sa.page.goto(`${BASE}/teacher/questions`);
  log("super-admin: approval banner + new reviewer login ok");
  await sa.ctx.close();
}

// ---------- Year plan and content library ----------
{
  const { page, ctx } = await session("teacher");
  await page.goto(`${BASE}/teacher/plan`);
  await page.waitForSelector("text=Periods taught");
  check(await page.locator('li[id^="p"]').count() === 75, "Class 3 plan should have 75 periods");
  check(await page.locator("text=Chapter 1-1").count() > 0 && (await page.locator("text=Getting started").count()) > 0, "periods are named by chapter (Chapter 1-1)");
  check(await page.locator("text=/#\\d+ · wk/").count() === 0, "no period numbers in the plan");
  const untaught = page.locator('button[aria-label$="as taught"]');
  const before = await untaught.count();
  await untaught.first().click();
  await page.waitForFunction((n) => document.querySelectorAll('button[aria-label$="as taught"]').length === n - 1, before);
  await shot(page, "v2-13-year-plan");
  await page.goto(`${BASE}/teacher/plan?cls=8`);
  check(await page.locator('li[id^="p"]').count() === 90, "Class 8 plan should have 90 periods");
  await page.goto(`${BASE}/teacher/library?cls=6`);
  for (const t of ["Worksheets", "Assignments", "Monthly assessments", "Full-length practice papers"]) check(await page.locator(`text=${t}`).count() > 0, `library shows ${t}`);
  await shot(page, "v2-14-library");
  await page.evaluate(() => document.querySelectorAll("details").forEach((d) => (d.open = true)));
  await page.locator("a:has-text('Term 1 examination')").first().click();
  await page.waitForSelector("text=Assign online");
  await Promise.all([page.waitForURL(/\/teacher\/tests\//), page.click("button:has-text('Assign online')")]);
  log("library: term paper copied and assigned to 6-A");
  const slidesHref = await page.evaluate(async () => { const r = await fetch("/teacher/library?cls=4"); const h = await r.text(); return h.match(/\/api\/slides\/[\w-]+/)?.[0]; });
  check(!!slidesHref, "library should link to class slides");
  const deck = await page.request.get(BASE + slidesHref);
  check(deck.status() === 200 && deck.headers()["content-type"].includes("presentationml") && (await deck.body()).length > 50000, "slide deck should download as .pptx");
  log(`slides: ${deck.headers()["content-disposition"].match(/filename="([^"]+)"/)[1]} (${Math.round((await deck.body()).length / 1024)} KB)`);
  await page.goto(`${BASE}/teacher/library?cls=3`);
  const mod = await page.locator("a:has-text('📘 Module')").first().getAttribute("href");
  await page.goto(BASE + mod);
  await page.waitForSelector("text=Worked example");
  check(await page.locator("#learn-it").count() === 1 && (await page.locator("text=Thinking tip").count()) > 0, "Class 3 module should show the Learn it theory");
  log("module: Learn it theory shown");
  await page.goto(`${BASE}/teacher/library?cls=6`);
  await page.goto(BASE + (await page.locator("a:has-text('📘 Module')").first().getAttribute("href")));
  check(await page.locator("#learn-it").count() === 1, `Class 6 module should show the Learn it theory (${page.url()})`);
  log("module: Class 6 Learn it theory shown");
  await ctx.close();

  const { page: st, ctx: sctx } = await session("student3");
  await st.goto(`${BASE}/student/map`);
  await st.goto(BASE + (await st.locator("a[href^='/student/chapter/']:has-text('Toy Joy')").first().getAttribute("href")));
  await st.locator("a:has-text('Learning module')").click();
  await st.waitForSelector("#learn-it");
  log("student: Learn it theory on a CT chapter");
  // CBSE handbook questions: practised from the chapter page, in book order.
  await st.goBack();
  await Promise.all([st.waitForURL(/\/student\/play\//), st.click("button:has-text('CBSE book questions')")]);
  await st.waitForSelector("text=CBSE exercises");
  await st.waitForSelector('[role="radiogroup"], input[type="text"]');
  const cbseTotal = Number((await st.locator("text=/^1 \\/ \\d+$/").first().textContent()).split("/")[1]);
  check(cbseTotal > 8, `CBSE round covers all the chapter's book questions (got ${cbseTotal})`);
  log(`student: CBSE book questions practice (${cbseTotal} questions)`);
  await st.goto(`${BASE}/student/map`);
  check(await st.locator("text=/📗 \\d+ CBSE/").count() > 5, "the map shows CBSE question counts");
  await st.goto(BASE + (await st.locator("a[href^='/student/chapter/']:has-text('Toy Joy')").first().getAttribute("href")));
  await Promise.all([st.waitForURL(/\/student\/play\//), st.click("button:has-text('Play 15 questions')")]);
  await st.waitForSelector("text=/^1 \\/ 15$/");
  log("student: practice rounds of 15, CBSE counts on the map");
  check(await st.locator("text=Script and storyboard").count() === 0, "students must not see video scripts");
  log("student: learning module ok");
  await sctx.close();
}

// ---------- Concept videos: upload only when the super-admin allows a role ----------
{
  const t = await session("teacher");
  await t.page.goto(`${BASE}/teacher/library?cls=3`);
  check(await t.page.locator("a:has-text('🎬 Video')").count() === 0, "unrecorded videos are hidden in the library");
  check(await t.page.locator("a[href='/videos']").count() === 0, "no upload page link before the super-admin allows it");
  const vres = await t.page.goto(`${BASE}/videos`);
  check(vres.status() === 404, "upload page does not exist for teachers by default");
  const sa = await session("superadmin");
  await sa.page.goto(`${BASE}/hq/settings`);
  await sa.page.check('input[name="roles"][value="TEACHER"]');
  await Promise.all([sa.page.waitForURL(/saved=1/), sa.page.click("button:has-text('Save')")]);
  log("superadmin: teachers may upload concept videos");
  await t.page.goto(`${BASE}/videos?cls=3`);
  await t.page.waitForSelector("text=Not recorded");
  const form = t.page.locator("form:has(input[name='url'])").first();
  await form.locator("input[name='url']").fill("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  await Promise.all([t.page.waitForURL(/done=/), form.locator("button:has-text('Save link')").click()]);
  check(await t.page.locator("text=Recording saved").count() === 1, "teacher saved a video link");
  await t.page.goto(`${BASE}/teacher/library?cls=3`);
  check(await t.page.locator("a:has-text('🎬 Video')").count() === 1, "the recorded video now shows in the library");
  await sa.page.goto(`${BASE}/hq/settings`);
  await sa.page.uncheck('input[name="roles"][value="TEACHER"]');
  await Promise.all([sa.page.waitForURL(/saved=1/), sa.page.click("button:has-text('Save')")]);
  check((await t.page.goto(`${BASE}/videos`)).status() === 404, "upload page disappears when the permission is removed");
  await t.ctx.close(); await sa.ctx.close();
  log("videos: upload permission and visibility ok");
}

// ---------- Super-admin: edited class slides ----------
{
  const sa = await session("superadmin");
  await sa.page.goto(`${BASE}/hq/slides?cls=4`);
  const li = sa.page.locator("li[id^='c']").first();
  const href = await li.locator("a:has-text('Download what teachers get')").getAttribute("href");
  const generated = await (await sa.page.request.get(BASE + href)).body();
  // Upload a "edited" deck (the generated one with a marker appended inside the zip comment area is enough to tell them apart).
  const edited = Buffer.concat([generated, Buffer.from("EDITED-DECK-MARKER")]);
  await li.locator("input[type=file]").setInputFiles({ name: "edited.pptx", mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation", buffer: edited });
  await Promise.all([sa.page.waitForURL(/done=/), li.locator("button:has-text('Upload edited deck')").click()]);
  check(await sa.page.locator("text=Edited deck").count() >= 1, "chapter shows Edited deck after upload");
  const t = await session("teacher");
  const got = await (await t.page.request.get(BASE + href)).body();
  check(got.toString("latin1").endsWith("EDITED-DECK-MARKER"), "teachers download the edited deck");
  const li2 = sa.page.locator("li[id^='c']").first();
  await Promise.all([sa.page.waitForURL(/done=/), li2.locator("button:has-text('Go back to the generated deck')").click()]);
  const back = await (await t.page.request.get(BASE + href)).body();
  check(!back.toString("latin1").endsWith("EDITED-DECK-MARKER"), "after revert teachers get the generated deck");
  const bad = await t.page.request.post(BASE + href, { multipart: { op: "revert" } });
  check(bad.status() === 403, "teachers cannot change slides");
  await t.ctx.close(); await sa.ctx.close();
  log("slides: super-admin upload, teacher download, revert ok");
}

// ---------- CBSE handbook questions in the bank ----------
{
  const { page, ctx } = await session("teacher");
  await page.goto(`${BASE}/teacher/questions?cls=6&source=CBSE`);
  check(await page.locator("text=📗 CBSE handbook").count() > 10, "question bank filters CBSE handbook questions");
  check(await page.locator("text=/CBSE CT & AI Student Handbook, Class 6/").count() > 0, "CBSE questions show their source");
  check(await page.locator('img[src^="/cbse/"]').count() > 0, "CBSE figures are shown");
  await ctx.close();
  log("teacher: CBSE handbook questions in the bank");
}

// ---------- Individual performance only (no houses) ----------
{
  const { page, ctx } = await session("student3");
  await page.goto(`${BASE}/student`);
  check(await page.locator("text=My week").count() === 1, "student home shows My week");
  check(await page.locator("text=House cup").count() === 0, "no house cup on the student home");
  await ctx.close();
  log("student: individual performance, no houses");
}

// ---------- Access control ----------
{
  const { page, ctx } = await session("student3");
  for (const p of ["/admin", "/studio", "/hq", "/teacher/projects"]) {
    await page.goto(BASE + p);
    check(page.url().endsWith("/student"), `student reached ${p}`);
  }
  await ctx.close();
  const t = await session("teacher");
  for (const p of ["/admin", "/studio", "/hq"]) {
    await t.page.goto(BASE + p);
    check(t.page.url().endsWith("/teacher"), `teacher reached ${p}`);
  }
  await t.ctx.close();
  log("access control ok");
}

await browser.close();
if (errors.length) { console.error("\nERRORS:\n" + errors.join("\n")); process.exit(1); }
console.log("\nAll v0.2 checks passed.");
