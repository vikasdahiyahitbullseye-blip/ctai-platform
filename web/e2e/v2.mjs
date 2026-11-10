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
  await page.fill('textarea[name="csv"]', `name,class,section,roll,house\nTest Kid ${stamp},4,B,1,Kalam\nSecond Kid,4,B,2,\nBad Row,9,Z,3,`);
  await page.click('button:has-text("Check file")');
  await page.waitForSelector("text=with errors");
  check(await page.locator("text=does not exist").count() > 0, "import should flag bad class");
  await page.fill('textarea[name="csv"]', `name,class,section,roll,house\nTest Kid ${stamp},4,B,1,Kalam\nSecond Kid,4,B,2,`);
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
  await Promise.all([page.waitForURL(/\/student\/play\//), page.locator("li", { hasText: "Every drop counts" }).locator('button:has-text("Start")').click()]);
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
  await page.click("text=Homework: Every drop counts");
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
  check(before > 3000, `expected thousands awaiting approval, got ${before}`);
  await page.goto(`${BASE}/review?cls=5&source=GENERATED`);
  await shot(page, "v2-11-review-queue");
  const ticks = page.locator('input[name="ids"]');
  const shown = await ticks.count();
  check(shown === 20, `expected 20 in the queue, got ${shown}`);
  await ticks.nth(0).uncheck(); // leave one out
  await Promise.all([page.waitForLoadState("networkidle"), page.click('button:has-text("Approve ticked questions")')]);
  await page.goto(`${BASE}/review`);
  const after = await awaiting();
  check(before - after === 19, `approving 19 should drop the queue by 19 (was ${before}, now ${after})`);
  // Reject one with a reason
  await page.goto(`${BASE}/review?cls=3`);
  const first = page.locator("ol > li").first();
  const code = (await first.locator("code").first().textContent()).trim();
  await first.locator('input[placeholder^="Reason"]').fill("Picture is unclear");
  await Promise.all([page.waitForLoadState("networkidle"), first.locator('button:has-text("Reject")').click()]);
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
