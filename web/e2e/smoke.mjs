// End-to-end smoke test of the main student and teacher flows.
// Usage: node e2e/smoke.mjs [baseUrl] [screenshotDir]
import { createRequire } from "node:module";
// Uses the globally installed Playwright when the project does not install it.
const { chromium } = createRequire(import.meta.url)("playwright");
import fs from "node:fs";

const BASE = process.argv[2] ?? "http://localhost:3000";
const SHOTS = process.argv[3] ?? "e2e/screenshots";
fs.mkdirSync(SHOTS, { recursive: true });
const errors = [];
const log = (...a) => console.log("•", ...a);

const browser = await chromium.launch();
async function session(username) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 }, deviceScaleFactor: 1, acceptDownloads: true });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(`${username} pageerror: ${e.message}`));
  page.on("console", (m) => m.type() === "error" && errors.push(`${username} console: ${m.text()}`));
  await page.goto(`${BASE}/login`);
  await page.fill('input[name="username"]', username);
  await page.fill('input[name="password"]', "demo123");
  await Promise.all([page.waitForURL((u) => !u.pathname.startsWith("/login")), page.click('button:has-text("Sign in")')]);
  return { ctx, page };
}
const shot = (page, name) => page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: true });

/** Answers whatever question is on screen (not necessarily correctly). */
async function answerCurrent(page) {
  const radio = page.locator('[role="radio"]');
  const box = page.locator('[role="checkbox"]');
  const input = page.locator('main input[type="text"]');
  if (await radio.count()) await radio.first().click();
  else if (await box.count()) await box.first().click();
  else if (await input.count()) await input.first().fill("7");
  // ORDER questions submit the displayed order as-is.
}

// ---------- Student (Class 3) ----------
{
  const { page } = await session("student3");
  await page.waitForSelector("text=Puzzle of the Day");
  await shot(page, "01-student-home");
  log("student home ok");

  // Adaptive practice set
  await page.click('button:has-text("Play this island")');
  await page.waitForURL(/\/student\/play\//);
  for (let i = 0; i < 8; i++) {
    await page.waitForSelector('button:has-text("Check answer")');
    await answerCurrent(page);
    await page.click('button:has-text("Check answer")');
    await page.waitForSelector('[role="status"]');
    if (i === 0) await shot(page, "02-practice-feedback");
    const finish = page.locator('button:has-text("Finish")');
    if (await finish.count()) {
      await Promise.all([page.waitForURL(/\/student\/result\//), finish.click()]);
      break;
    }
    await Promise.all([page.waitForSelector('button:has-text("Check answer")'), page.click('button:has-text("Next question")')]);
  }
  await page.waitForSelector("text=Your score");
  await shot(page, "03-practice-result");
  log("practice set ok:", await page.locator("text=/\\d+\\/\\d+/").first().textContent());

  // Puzzle of the day
  await page.goto(`${BASE}/student`);
  const solve = page.locator('button:has-text("Solve it")');
  if (await solve.count()) {
    await solve.click();
    await page.waitForURL(/\/student\/play\//);
    await answerCurrent(page);
    await page.click('button:has-text("Check answer")');
    await page.waitForSelector('[role="status"]');
    await Promise.all([page.waitForURL(/\/student\/result\//), page.click('button:has-text("Finish")')]);
    log("puzzle ok");
  } else log("puzzle already done today");

  // Assigned test
  await page.goto(`${BASE}/student/tests`);
  await shot(page, "04-student-tests");
  await Promise.all([page.waitForURL(/\/student\/play\//), page.locator('button:has-text("Start")').first().click()]);
  await page.waitForSelector("text=Question 1 of");
  await shot(page, "05-test-player");
  const total = Number((await page.locator("text=/Question 1 of \\d+/").textContent()).match(/of (\d+)/)[1]);
  for (let i = 0; i < total; i++) {
    await answerCurrent(page);
    if (i < total - 1) await page.click('button:has-text("Next →")');
  }
  await page.waitForSelector("text=All changes saved", { timeout: 10000 });
  await page.click('button:has-text("Finish test")');
  await Promise.all([page.waitForURL(/\/student\/result\//), page.locator('[role="dialog"] button:has-text("Submit")').click()]);
  await page.waitForSelector("text=Your score");
  await shot(page, "06-test-result");
  log("test submitted ok");

  await page.goto(`${BASE}/student/progress`);
  await shot(page, "07-student-progress");
  await page.goto(`${BASE}/student/rewards`);
  await shot(page, "08-student-rewards");
  log("progress + rewards ok");
}

// ---------- Teacher ----------
let newTestUrl;
{
  const { page } = await session("teacher");
  await shot(page, "09-teacher-home");
  await page.click("text=Open dashboard →");
  await page.waitForSelector("text=Skill mastery by student");
  await shot(page, "10-class-dashboard");
  log("class dashboard ok");

  // Item analysis on a completed test
  await page.goto(`${BASE}/teacher/tests`);
  await page.click("text=Chapter Test: What's in a Name?");
  await page.waitForSelector("text=Item analysis");
  await shot(page, "11-test-results-item-analysis");
  log("item analysis ok");

  // Generate a new Class 6 test
  await page.goto(`${BASE}/teacher/generator`);
  await page.selectOption('select[name="sectionId"]', { label: "Class 6-A" });
  await page.fill('input[name="title"]', "Smoke Test Paper");
  await page.click("text=Select all with questions");
  await page.fill('input[name="count"]', "12");
  await shot(page, "12-generator");
  await Promise.all([page.waitForURL(/\/teacher\/tests\/.+\?new=1/), page.click('button:has-text("Generate paper")')]);
  newTestUrl = page.url().split("?")[0];
  const qCount = await page.locator("li:has(button:has-text('Swap question'))").count();
  log("generated paper with", qCount, "questions");
  if (qCount !== 12) errors.push(`expected 12 questions, got ${qCount}`);
  const firstStem = await page.locator("ol > li").first().innerText();
  await page.locator('button:has-text("Swap question")').first().click();
  await page.waitForFunction((s) => document.querySelector("ol > li")?.innerText !== s, firstStem, { timeout: 10000 });
  log("swap ok");
  await shot(page, "13-generated-test");

  // Assign to Class 6-A
  await page.fill('input[name="dueAt"]', new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10));
  await page.click('button:has-text("Assign to class")');
  await page.waitForSelector("text=Assigned to 6-A");
  log("assigned ok");

  // Print views + DOCX
  const pa = await page.context().newPage();
  await pa.goto(`${newTestUrl}/print?v=1`);
  await pa.waitForSelector("text=Set B");
  await shot(pa, "14-print-paper-B");
  await pa.goto(`${newTestUrl}/print?v=1&key=1`);
  await pa.waitForSelector("text=Answer Key");
  await shot(pa, "15-print-key-B");
  const [dl] = await Promise.all([page.waitForEvent("download"), page.click("text=Word file")]);
  const p = await dl.path();
  const size = fs.statSync(p).size;
  log("docx downloaded:", dl.suggestedFilename(), size, "bytes");
  if (size < 5000) errors.push("docx too small");

  await page.goto(`${BASE}/teacher/questions?cls=6`);
  await shot(page, "16-question-bank");
}

// ---------- Student (Class 6) sees the new test ----------
{
  const { page } = await session("student6");
  await page.goto(`${BASE}/student/tests`);
  const seen = await page.locator("text=Smoke Test Paper").count();
  log("student6 sees new test:", seen > 0);
  if (!seen) errors.push("student6 does not see the newly assigned test");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${BASE}/student`);
  await shot(page, "17-student-home-mobile");
}

// ---------- Access control ----------
{
  const { page } = await session("student3");
  await page.goto(`${BASE}/teacher`);
  if (!page.url().endsWith("/student")) errors.push("student could open teacher area: " + page.url());
  const r = await page.request.get(`${newTestUrl.replace("/teacher/tests", "/api/tests")}/docx`);
  if (r.status() !== 401) errors.push(`student could download docx: ${r.status()}`);
  log("access control ok");
}

await browser.close();
if (errors.length) {
  console.error("\nERRORS:\n" + errors.join("\n"));
  process.exit(1);
}
console.log("\nAll smoke checks passed.");
