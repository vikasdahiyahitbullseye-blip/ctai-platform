// Bulk edit of students and staff through Excel, and bulk import of new teachers.
// Bulk edit of students through Excel: download, edit, upload, preview, apply. Also: Excel bulk import of new students.
// Run against a freshly seeded server: NODE_PATH=$(npm root -g) node e2e/bulk.mjs [baseUrl] [screenshotDir]
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const ExcelJS = require("exceljs");

const BASE = process.argv[2] ?? "http://localhost:3000";
const SHOTS = process.argv[3] ?? "e2e/screenshots";
fs.mkdirSync(SHOTS, { recursive: true });
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "bulk-"));
const errors = [];
const log = (...a) => console.log("•", ...a);
const check = (cond, msg) => { if (!cond) errors.push(msg); };
const browser = await chromium.launch();

async function session(username) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(`${username} at ${page.url()}: ${e.message}`));
  await page.goto(`${BASE}/login`);
  await page.fill('input[name="username"]', username);
  await page.fill('input[name="password"]', "demo123");
  await Promise.all([page.waitForURL((u) => !u.pathname.startsWith("/login")), page.click('button:has-text("Sign in")')]);
  return { ctx, page };
}

const { page, ctx } = await session("admin");
await page.goto(`${BASE}/admin/bulk-edit`);
{
  const v = await page.locator('select[name="section"] option', { hasText: "Class 6-A" }).getAttribute("value");
  await page.selectOption('select[name="section"]', v);
}
const [dl] = await Promise.all([page.waitForEvent("download"), page.click('button:has-text("Download Excel file")')]);
const file = path.join(tmp, dl.suggestedFilename());
await dl.saveAs(file);
check(dl.suggestedFilename() === "students-class-6A.xlsx", `download name, got ${dl.suggestedFilename()}`);

// Edit like a person would in Excel
const wb = new ExcelJS.Workbook();
await wb.xlsx.readFile(file);
const ws = wb.worksheets[0];
const head = Array.from(ws.getRow(1).values, (v) => String(v ?? ""));
const col = (h) => head.findIndex((x) => (x ?? "").startsWith(h));
check(col("Student ID") === 1 && col("Parent/guardian phone") > 0, "export should have the expected columns");
const rows = [];
ws.eachRow((r, n) => { if (n > 1) rows.push(r); });
check(rows.length === 16, `Class 6-A should export 16 students, got ${rows.length}`);
const diya = rows.find((r) => r.getCell(col("Username")).value === "student6");
check(!!diya, "student6 should be in the export");
diya.getCell(col("Name")).value = "Diya V. Verma";
diya.getCell(col("Roll no")).value = "31";
diya.getCell(col("Parent/guardian phone")).value = "+91 98111 22233";
diya.getCell(col("Date of birth")).value = new Date(Date.UTC(2015, 7, 14)); // a real Excel date cell
const r2 = rows.find((r) => r !== diya);
const r2name = r2.getCell(col("Name")).value;
r2.getCell(col("Class")).value = "7";
r2.getCell(col("Admission no")).value = "ADM-7001";
const r3 = rows.find((r) => r !== diya && r !== r2);
r3.getCell(col("Status")).value = "inactive";
// errors on two rows
const r4 = rows.find((r) => ![diya, r2, r3].includes(r));
r4.getCell(col("Class")).value = "9";
const r5 = rows.find((r) => ![diya, r2, r3, r4].includes(r));
r5.getCell(col("Username")).value = "teacher";
await wb.xlsx.writeFile(file);

await page.setInputFiles('input[type="file"]', file);
await page.click('button:has-text("Check changes")');
await page.waitForSelector("text=/with errors|no errors/");
await page.screenshot({ path: `${SHOTS}/bulk-01-preview-errors.png`, fullPage: true });
check(await page.locator("text=2 with errors").count() === 1, "two rows should have errors");
check(await page.locator("text=/Class 9-A does not exist/").count() === 1, "unknown class should be reported");
check(await page.locator('text=/Username "teacher" is already taken/').count() === 1, "taken username should be reported");
check(await page.locator('button:has-text("Save changes")[disabled]').count() === 1, "save must be disabled while there are errors");

// fix the errors and upload again
r4.getCell(col("Class")).value = "6";
r5.getCell(col("Username")).value = String(r5.getCell(col("Username")).value) === "teacher" ? "new.username.6a" : "new.username.6a";
await wb.xlsx.writeFile(file);
await page.setInputFiles('input[type="file"]', file);
await page.click('button:has-text("Check changes")');
await page.waitForSelector("text=no errors", { timeout: 15000 }).catch(async () => { await page.screenshot({ path: `${SHOTS}/bulk-debug.png`, fullPage: true }); });
check(await page.locator("text=4 to change").count() === 1, "four students should change");
check(await page.locator("text=Diya V. Verma").count() > 0, "preview should show the new name");
check(await page.locator("text=2015-08-14").count() === 1, "Excel date cell should read as 2015-08-14");
check(await page.locator("text=6-A").count() > 0 && await page.locator("text=7-A").count() > 0, "class move should show 6-A → 7-A");
await page.screenshot({ path: `${SHOTS}/bulk-02-preview.png`, fullPage: true });
await page.click('button:has-text("Save changes for 4 students")');
await page.waitForSelector("text=Saved changes for 4 students");
log("bulk edit: errors caught, then 4 students saved");

// the changes are in place
await page.goto(`${BASE}/admin/students`);
await page.selectOption('select[name="section"]', { label: "Class 7-A" }); await page.click('button:has-text("Show")');
await page.waitForSelector(`text=${r2name}`);
await page.goto(`${BASE}/admin/audit`);
check(await page.locator("text=STUDENTS_BULK_UPDATED").count() === 1, "activity log should record the bulk edit");
await ctx.close();
{
  const s = await session("new.username.6a");
  check(s.page.url().endsWith("/student"), "renamed student should sign in with the new username");
  await s.ctx.close();
}
log("changes verified (class move, new username, activity log)");

// ---------- Bulk import of new students from an .xlsx file ----------
{
  const { page, ctx } = await session("admin");
  const nb = new ExcelJS.Workbook(); const sh = nb.addWorksheet("Sheet1");
  sh.addRow(["Name", "Class", "Section", "Roll"]); sh.addRow(["Kiran Bedi Test", 3, "A", 30]); sh.addRow(["Ravi Test", 8, "A", 31]);
  const f = path.join(tmp, "new.xlsx"); await nb.xlsx.writeFile(f);
  await page.goto(`${BASE}/admin/import`);
  await page.setInputFiles('input[type="file"]', f);
  await page.click('button:has-text("Check file")');
  await page.waitForSelector("text=no errors");
  await page.click('button:has-text("Create 2 student accounts")');
  await page.waitForSelector("text=Kiran Bedi Test");
  log("bulk import from .xlsx ok");
  await ctx.close();
}

// ---------- Bulk edit of teachers and admins ----------
{
  const { page, ctx } = await session("admin");
  await page.goto(`${BASE}/admin/bulk-edit?kind=staff`);
  const [dl] = await Promise.all([page.waitForEvent("download"), page.click('a:has-text("Download Excel file")')]);
  const f = path.join(tmp, dl.suggestedFilename()); await dl.saveAs(f);
  check(dl.suggestedFilename() === "teachers-and-staff.xlsx", `staff download name, got ${dl.suggestedFilename()}`);
  const wb = new ExcelJS.Workbook(); await wb.xlsx.readFile(f); const ws = wb.worksheets[0];
  const head = Array.from(ws.getRow(1).values, (v) => String(v ?? ""));
  const col = (h) => head.findIndex((x) => (x ?? "").startsWith(h));
  const rows = []; ws.eachRow((r, n) => { if (n > 1) rows.push(r); });
  const by = (u) => rows.find((r) => r.getCell(col("Username")).value === u);
  check(rows.length === 3, `3 staff expected, got ${rows.length}`);
  check(String(by("teacher").getCell(col("Teaches")).value).includes("6-A CT"), "Teaches column should list classes");
  by("rohan").getCell(col("Role")).value = "admin";
  by("rohan").getCell(col("Designation")).value = "Computer teacher";
  by("rohan").getCell(col("Teaches")).value = "6-A AI; 8-A CT";
  by("teacher").getCell(col("Phone")).value = "+91 98765 43210";
  by("admin").getCell(col("Role")).value = "teacher";          // error: own role
  by("teacher").getCell(col("Teaches")).value = "3-A AI; 6-A CT"; // error: AI in Class 3
  by("rohan").getCell(col("Teaches")).value = "6-A AI; 8-A CT; 9-Z";   // error: bad item
  await wb.xlsx.writeFile(f);
  await page.setInputFiles('input[type="file"]', f);
  await page.click('button:has-text("Check changes")');
  await page.waitForSelector("text=/with errors|no errors/");
  check(await page.locator("td >> text=You cannot change your own role").count() === 1, "own role change should be refused");
  check(await page.locator("text=/AI is taught in Classes 6–8/").count() === 1, "AI for Class 3 should be refused");
  check(await page.locator('text=/"9-Z"|9-Z does not exist/').count() >= 1, "unknown class should be refused");
  await page.screenshot({ path: `${SHOTS}/bulk-03-staff-errors.png`, fullPage: true });
  by("admin").getCell(col("Role")).value = "admin";
  by("teacher").getCell(col("Teaches")).value = "3-A CT; 6-A CT; 6-A AI";
  by("rohan").getCell(col("Teaches")).value = "6-A AI; 8-A CT";
  await wb.xlsx.writeFile(f);
  await page.setInputFiles('input[type="file"]', f);
  await page.click('button:has-text("Check changes")');
  await page.waitForSelector("text=no errors");
  await page.screenshot({ path: `${SHOTS}/bulk-04-staff-preview.png`, fullPage: true });
  await page.click('button:has-text("Save changes for 2 people")');
  await page.waitForSelector("text=Saved changes for 2 people");
  await page.goto(`${BASE}/admin/teachers`);
  check(await page.locator("tr:has-text('Rohan Iyer') >> text=Computer teacher").count() === 1, "designation saved");
  check(await page.locator("tr:has-text('Rohan Iyer') >> text=Admin").count() === 1, "role saved");
  check(await page.locator("tr:has-text('Rohan Iyer') >> text=8-A CT").count() === 1, "teaching assignments saved");
  check(await page.locator("tr:has-text('Anjali Mehra') >> text=/3-A CT, 6-A CT, 6-A AI|3-A CT.*6-A/").count() === 1, "Anjali's classes saved");
  // a students file on the staff tab is refused with a clear message
  await page.goto(`${BASE}/admin/bulk-edit?kind=staff`);
  await page.setInputFiles('input[type="file"]', file);
  await page.click('button:has-text("Check changes")');
  check(await page.waitForSelector("text=This looks like a students file", { timeout: 10000 }).then(() => true, () => false), "students file on the staff tab should be refused");
  await page.goto(`${BASE}/admin/audit`);
  check(await page.locator("text=STAFF_BULK_UPDATED").count() === 1, "activity log should record the staff bulk edit");
  log("staff bulk edit: errors caught, 2 people saved (role, designation, phone, classes)");
  await ctx.close();
}

// ---------- Bulk import of new teachers ----------
{
  const { page, ctx } = await session("admin");
  await page.goto(`${BASE}/admin/teachers`);
  await Promise.all([page.waitForURL(/import\?kind=staff/), page.click('a:has-text("Import new staff from Excel")')]);
  const [dl] = await Promise.all([page.waitForEvent("download"), page.click('a:has-text("Download a template (Excel)")')]);
  const f = path.join(tmp, dl.suggestedFilename());
  await dl.saveAs(f);
  check(dl.suggestedFilename() === "teachers_template.xlsx", `template name, got ${dl.suggestedFilename()}`);
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(f);
  const ws = wb.worksheets[0];
  check(ws.getRow(1).getCell(1).value === "Name" && ws.getRow(1).getCell(6).value === "Teaches", "template headings");
  // keep the sample "Anjali Mehra" row (she already exists → warning); add rows with mistakes
  ws.addRow(["Kiran Bedi", "teacher", "PRT", "not-an-email", "", "3-A AI"]);
  ws.addRow(["Kiran Bedi", "", "", "", "", ""]);
  ws.addRow(["Suresh Nair", "cook", "", "", "", "9-Z CT"]);
  await wb.xlsx.writeFile(f);
  await page.setInputFiles('input[type="file"]', f);
  await page.click('button:has-text("Check file")');
  await page.waitForSelector('[data-testid="staff-import-summary"]');
  check(await page.locator("text=/valid email/").count() === 1, "bad email should be flagged");
  check(await page.locator("text=/AI is taught in Classes 6–8/").count() === 1, "AI for Class 3 should be flagged");
  check(await page.locator("text=/also on row/").count() === 1, "repeated name should be flagged");
  check(await page.locator("text=Role: write teacher or admin").count() === 1, "unknown role should be flagged");
  check(await page.locator("text=/9-Z does not exist/").count() === 1, "unknown class should be flagged");
  check(await page.locator("text=/called Anjali Mehra already exists/").count() === 1, "existing name should be a warning");
  check(await page.locator('button:has-text("Create 6 staff accounts")').isDisabled(), "import must be blocked while rows have errors");
  await page.screenshot({ path: `${SHOTS}/bulk-05-staff-import-errors.png`, fullPage: true });
  // fix: remove the bad rows, drop the Anjali duplicate, add a clean teacher
  ws.spliceRows(2, 1); // Anjali (sample row 1)
  for (let n = ws.rowCount; n >= 2; n--) if (["Kiran Bedi", "Suresh Nair"].includes(ws.getRow(n).getCell(1).value)) ws.spliceRows(n, 1);
  ws.addRow(["Kiran Bedi", "Teacher", "TGT Computer Science", "kiran.bedi@example.com", "+91 98111 22233", "6-A CT; 6-A AI"]);
  await wb.xlsx.writeFile(f);
  await page.setInputFiles('input[type="file"]', f);
  await page.click('button:has-text("Check file")');
  await page.waitForSelector("text=no errors");
  check(await page.locator('[data-testid="staff-import-summary"]').innerText().then((t) => t.includes("3 people (2 teachers, 1 admin)")), "summary should count teachers and admins");
  await page.click('button:has-text("Create 3 staff accounts")');
  await page.waitForSelector("text=3 logins created");
  const slip = page.locator("tr:has-text('Kiran Bedi')");
  const user = (await slip.locator("td").nth(2).textContent()).trim();
  const pass = (await slip.locator("td").nth(3).textContent()).trim();
  check(user === "kiran.bedi", `username should be kiran.bedi, got ${user}`);
  check(await page.locator("tr:has-text('Neha Kapoor') >> text=School admin").count() === 1, "role should show on the slip");
  await page.screenshot({ path: `${SHOTS}/bulk-06-staff-import-done.png`, fullPage: true });
  await page.goto(`${BASE}/admin/teachers`);
  check(await page.locator("tr:has-text('Kiran Bedi') >> text=TGT Computer Science").count() === 1, "designation saved on import");
  check(await page.locator("tr:has-text('Kiran Bedi') >> text=/6-A AI/").count() === 1, "classes saved on import");
  check(await page.locator("tr:has-text('Neha Kapoor') >> text=Admin").count() === 1, "admin role saved on import");
  // the same file again: the email is now taken
  await page.goto(`${BASE}/admin/import?kind=staff`);
  await page.setInputFiles('input[type="file"]', f);
  await page.click('button:has-text("Check file")');
  check(await page.waitForSelector("text=/Email already belongs to kiran.bedi/", { timeout: 10000 }).then(() => true, () => false), "re-importing should catch the existing email");
  // a bulk-edit file on the import tab is refused
  const [dl2] = await Promise.all([page.waitForEvent("download"), page.goto(`${BASE}/admin/bulk-edit?kind=staff`).then(() => page.click('a:has-text("Download Excel file")'))]);
  const f2 = path.join(tmp, "existing-staff.xlsx");
  await dl2.saveAs(f2);
  await page.goto(`${BASE}/admin/import?kind=staff`);
  await page.setInputFiles('input[type="file"]', f2);
  await page.click('button:has-text("Check file")');
  check(await page.waitForSelector("text=/list of existing staff/", { timeout: 10000 }).then(() => true, () => false), "existing-staff file should be refused on import");
  await page.goto(`${BASE}/admin/audit`);
  check(await page.locator("text=STAFF_IMPORTED").count() === 1, "activity log should record the import");
  await ctx.close();

  // the new teacher signs in with the temporary password and must choose a new one
  const c2 = await browser.newContext();
  const p2 = await c2.newPage();
  p2.on("pageerror", (e) => errors.push(`kiran at ${p2.url()}: ${e.message}`));
  await p2.goto(`${BASE}/login`);
  await p2.fill('input[name="username"]', user);
  await p2.fill('input[name="password"]', pass);
  await Promise.all([p2.waitForURL((u) => !u.pathname.startsWith("/login")), p2.click('button:has-text("Sign in")')]);
  check(/account\?first=1/.test(p2.url()), `new teacher should be asked to change password, got ${p2.url()}`);
  await c2.close();
  log("teacher import: errors caught, 3 accounts created with classes, login works");
}

await browser.close();
if (errors.length) { console.log("\nERRORS:"); for (const e of errors) console.log(e); process.exit(1); }
console.log("\nAll bulk-edit checks passed.");
