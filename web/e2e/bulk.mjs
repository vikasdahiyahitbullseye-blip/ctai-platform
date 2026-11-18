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

await browser.close();
if (errors.length) { console.log("\nERRORS:"); for (const e of errors) console.log(e); process.exit(1); }
console.log("\nAll bulk-edit checks passed.");
