// Editing people and schools: school admin, group admin, HQ super-admin, and staff's own contact details.
// Run against a freshly seeded server: NODE_PATH=$(npm root -g) node e2e/people.mjs [baseUrl] [screenshotDir]
import { createRequire } from "node:module";
import fs from "node:fs";
const { chromium } = createRequire(import.meta.url)("playwright");

const BASE = process.argv[2] ?? "http://localhost:3000";
const SHOTS = process.argv[3] ?? "e2e/screenshots";
fs.mkdirSync(SHOTS, { recursive: true });
const errors = [];
const log = (...a) => console.log("•", ...a);
const check = (cond, msg) => { if (!cond) errors.push(msg); };
const browser = await chromium.launch();

async function session(username, password = "demo123") {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(`${username} at ${page.url()}: ${e.message}`));
  page.on("dialog", (d) => d.accept());
  await page.goto(`${BASE}/login`);
  await page.fill('input[name="username"]', username);
  await page.fill('input[name="password"]', password);
  await Promise.all([page.waitForURL((u) => !u.pathname.startsWith("/login")), page.click('button:has-text("Sign in")')]);
  return { ctx, page };
}
let saves = 0;
/** Clicks Save and returns the new message (waits until the shown message is a fresh one). */
const save = async (page) => {
  const msg = page.locator('form [role="status"], form [role="alert"]');
  await page.evaluate(() => document.querySelectorAll('form [role="status"], form [role="alert"]').forEach((e) => e.setAttribute("data-old", "1")));
  await page.click('button:has-text("Save changes")');
  await page.waitForFunction(() => [...document.querySelectorAll('form [role="status"], form [role="alert"]')].some((e) => !e.hasAttribute("data-old")), null, { timeout: 15000 });
  saves++;
  return msg.first().textContent();
};

// ---------- School admin edits a student ----------
{
  const { page, ctx } = await session("admin");
  await page.goto(`${BASE}/admin/students`);
  await page.click('tr:has-text("student6") >> text=Edit').catch(async () => {
    // student6 is in Class 6-A; show that class first
    await page.selectOption('select[name="section"]', { label: "Class 6-A" }); await page.click('button:has-text("Show")');
    await page.click('tr:has-text("student6") >> text=Edit');
  });
  await page.waitForURL(/\/admin\/people\//);
  await page.fill('input[name="name"]', "Diya Verma Sharma");
  await page.fill('input[name="rollNo"]', "21");
  await page.fill('input[name="admissionNo"]', "DPS/2026/0412");
  await page.fill('input[name="dateOfBirth"]', "2015-08-14");
  await page.fill('input[name="guardianName"]', "Rakesh Verma");
  await page.fill('input[name="guardianPhone"]', "+91 98100 12345");
  await page.selectOption('select[name="sectionId"]', { label: "Class 7-A" });
  check((await save(page)).includes("Saved"), "student edit should save");
  await page.screenshot({ path: `${SHOTS}/people-01-edit-student.png`, fullPage: true });
  // bad input is refused
  await page.fill('input[name="guardianPhone"]', "call me");
  check((await save(page)).includes("Phone"), "invalid phone should be refused");
  await page.fill('input[name="guardianPhone"]', "+91 98100 12345");
  await page.fill('input[name="username"]', "teacher");
  check((await save(page)).includes("already taken"), "duplicate username should be refused");
  await page.fill('input[name="username"]', "diya.verma");
  check((await save(page)).includes("Saved"), "new username should save");
  await page.goto(`${BASE}/admin/students`);
  await page.selectOption('select[name="section"]', { label: "Class 7-A" }); await page.click('button:has-text("Show")');
  await page.waitForSelector("text=Diya Verma Sharma", { timeout: 10000 }).catch(async () => { await page.screenshot({ path: `${SHOTS}/people-debug.png`, fullPage: true }); });
  check(await page.locator("tr:has-text('Diya Verma Sharma') >> text=diya.verma").count() === 1, "list should show the new name and username in the new class");
  log("admin edited a student (name, username, roll, class, guardian)");

  // ---------- School admin edits a teacher ----------
  await page.goto(`${BASE}/admin/teachers`);
  await page.click('tr:has-text("Rohan Iyer") >> text=Edit');
  await page.waitForURL(/\/admin\/people\//);
  await page.fill('input[name="designation"]', "Computer teacher");
  await page.fill('input[name="email"]', "rohan@example.org");
  await page.selectOption('select[name="role"]', "ADMIN");
  check((await save(page)).includes("Saved"), "teacher edit should save");
  await page.goto(`${BASE}/admin/teachers`);
  check(await page.locator("tr:has-text('Rohan Iyer') >> text=Computer teacher").count() === 1, "designation should show in the staff list");
  check(await page.locator("tr:has-text('Rohan Iyer') >> text=Admin").count() === 1, "role change should show");
  // the admin cannot change their own role
  await page.click('tr:has-text("Principal (Demo)") >> text=Edit');
  await page.waitForURL(/\/admin\/people\//);
  check(await page.locator('select[name="role"][disabled]').count() === 1, "own role should be locked");
  log("admin edited a teacher; own role locked");
  await ctx.close();
}
{
  // the student signs in with the new username (same password)
  const { page, ctx } = await session("diya.verma");
  check(page.url().endsWith("/student"), "student should sign in with the new username");
  check(await page.locator("text=Class 7-A").count() > 0, "student should now be in Class 7-A");
  log("student signs in with new username, sees new class");
  await ctx.close();
}

// ---------- Teacher edits own contact details ----------
{
  const { page, ctx } = await session("teacher");
  await page.goto(`${BASE}/account`);
  await page.fill('input[name="phone"]', "+91 99999 00000");
  check((await save(page)).includes("Saved"), "teacher contact should save");
  check(await page.locator('input[name="name"]').count() === 0, "teacher cannot change own name here");
  log("teacher edited own contact details");
  await ctx.close();
}

// ---------- Group admin edits a student in a branch ----------
{
  const { page, ctx } = await session("groupadmin");
  const row = page.locator("tr", { has: page.locator("text=Demo Public School, Noida") });
  await Promise.all([page.waitForURL(/\/admin$/), row.locator('button:has-text("Manage")').click()]);
  await page.goto(`${BASE}/admin/students`);
  await page.click('tr:has-text("n3a01") >> text=Edit');
  await page.waitForURL(/\/admin\/people\//);
  await page.fill('input[name="guardianName"]', "Group Test Parent");
  check((await save(page)).includes("Saved"), "group admin edit should save");
  log("group admin edited a branch student");
  await ctx.close();
}

// ---------- HQ edits a school, a staff login and a group ----------
{
  const { page, ctx } = await session("superadmin");
  await page.click('tr:has-text("Demo Public School, Noida") >> text=Edit');
  await page.waitForURL(/\/hq\/schools\//);
  await page.fill('input[name="name"]', "Demo Public School, Noida Sector 62");
  await page.fill('input[name="code"]', "DPS-DEL");
  { const m = await save(page); check(m.includes("already used"), `a school code used by another school should be refused (got: ${m})`); }
  await page.fill('input[name="code"]', "DPS-NOI62");
  { const m = await save(page); check(m.includes("Saved"), `school edit should save (got: ${m})`); }
  await page.goto(`${BASE}/hq`);
  check(await page.locator("text=Demo Public School, Noida Sector 62").count() > 0, "HQ list should show the new school name");
  await page.goto(`${BASE}/hq/staff`);
  await page.click('tr:has-text("Question Reviewer") >> text=Edit');
  await page.waitForURL(/\/hq\/staff\//);
  await page.fill('input[name="name"]', "Lead Question Reviewer");
  check((await save(page)).includes("Saved"), "HQ staff edit should save");
  await page.screenshot({ path: `${SHOTS}/people-02-hq-staff.png`, fullPage: true });
  log("HQ edited a school and a staff login");
  await ctx.close();
}
{
  // the school admin's activity log records the edits
  const { page, ctx } = await session("admin");
  await page.goto(`${BASE}/admin/audit`);
  check(await page.locator("text=STUDENT_UPDATED").count() > 0, "activity log should record student edits");
  check(await page.locator("text=STAFF_UPDATED").count() > 0, "activity log should record staff edits");
  await ctx.close();
}

await browser.close();
if (errors.length) { console.log("\nERRORS:"); for (const e of errors) console.log(e); process.exit(1); }
console.log("\nAll people-editing checks passed.");
