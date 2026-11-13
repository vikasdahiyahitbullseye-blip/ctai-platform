// v0.5 checks: leaderboards (home, scopes, friend groups), logic games, school-group admin.
// Run against a freshly seeded server: NODE_PATH=$(npm root -g) node e2e/v3.mjs [baseUrl] [screenshotDir]
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
import fs from "node:fs";

const BASE = process.argv[2] ?? "http://localhost:3000";
const SHOTS = process.argv[3] ?? "e2e/screenshots";
fs.mkdirSync(SHOTS, { recursive: true });
const errors = [];
const log = (...a) => console.log("•", ...a);
const check = (cond, msg) => { if (!cond) errors.push(msg); };
const browser = await chromium.launch();

async function session(username, viewport = { width: 1280, height: 860 }) {
  const ctx = await browser.newContext({ viewport });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(`${username} at ${page.url()}: ${e.message}`));
  page.on("dialog", (d) => d.accept());
  await page.goto(`${BASE}/login`);
  await page.fill('input[name="username"]', username);
  await page.fill('input[name="password"]', "demo123");
  await Promise.all([page.waitForURL((u) => !u.pathname.startsWith("/login")), page.click('button:has-text("Sign in")')]);
  return { ctx, page };
}
const shot = (page, name) => page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: true });

// ---------- Leaderboard on the student home page ----------
let code;
{
  const { page, ctx } = await session("student6");
  const board = page.locator("#leaderboard");
  await board.waitFor();
  for (const tab of ["My section", "Class 6", "Whole school", "All our schools", "🧠 Puzzle Pals"]) check(await board.locator(`[role="tab"]:has-text("${tab}")`).count() === 1, `home leaderboard should have the "${tab}" tab`);
  check(await board.locator("text=(you)").count() === 1, "home leaderboard should show the student's own row");
  await shot(page, "v3-01-home-leaderboard");
  await Promise.all([page.waitForURL(/board=chain/), board.locator('[role="tab"]:has-text("All our schools")').click()]);
  check(await page.locator("#leaderboard >> text=Demo Public School, Noida").count() > 0, "group-of-schools board should include the Noida branch");
  await Promise.all([page.waitForURL(/period=all/), page.locator('#leaderboard a:has-text("All time")').click()]);
  check(await page.locator('#leaderboard a[aria-current="true"]:has-text("All time")').count() === 1, "period switch should stick");
  log("home leaderboard ok");

  // Friend groups
  await page.goto(`${BASE}/student/leaderboard`);
  await page.fill('input[name="name"]', "stupid team");
  await page.click('button:has-text("Create group")');
  check(await page.waitForSelector("text=friendly group name", { timeout: 10000 }).then(() => true, () => false), "rude group name should be refused");
  await page.fill('input[name="name"]', "Code Crew");
  await page.locator('label:has(input[value="🦊"])').click();
  await page.click('button:has-text("Create group")');
  await page.waitForSelector("text=Group created!");
  code = (await page.locator("text=Join code:").locator("span").textContent()).trim();
  check(/^[A-Z2-9]{6}$/.test(code), `join code should be 6 characters, got ${code}`);
  check(await page.locator('[role="tab"]:has-text("🦊 Code Crew")').count() === 1, "new group should get a tab");
  await shot(page, "v3-02-group-created");
  log("group created:", code);
  await ctx.close();
}
{
  const { page, ctx } = await session("student7");
  await page.goto(`${BASE}/student/leaderboard`);
  await page.fill('input[name="code"]', "NOPE99");
  await page.click('button:has-text("Join")');
  check(await page.waitForSelector("text=No group has that code", { timeout: 10000 }).then(() => true, () => false), "unknown code should be refused");
  await page.fill('input[name="code"]', code.toLowerCase());
  await page.click('button:has-text("Join")');
  check(await page.waitForSelector("text=You joined", { timeout: 10000 }).then(() => true, () => false), "join should confirm");
  check(await page.locator("ol >> text=Diya Verma").count() === 1, "group board should list the creator");
  check(await page.locator("ol >> text=(you)").count() === 1, "group board should list the new member");
  await shot(page, "v3-03-group-joined");
  await page.click('button:has-text("Leave group")');
  await page.waitForSelector("text=You left");
  check(await page.locator('[role="tab"]:has-text("Code Crew")').count() === 0, "leaving should remove the tab");
  log("join and leave ok");
  await ctx.close();
}
{
  // Class 3 now sees the leaderboard on the home page too.
  const { page, ctx } = await session("student3", { width: 390, height: 844 });
  check(await page.locator('#leaderboard [role="tab"]').count() >= 3, "class 3 home should show leaderboard tabs");
  await shot(page, "v3-04-class3-home-phone");
  await ctx.close();
}

// ---------- Logic games ----------
{
  const { page, ctx } = await session("student6");
  await page.goto(`${BASE}/student/games`);
  check(await page.locator("h2").filter({ hasText: /Sudoku|Tower of Hanoi|Lights Out|Sliding tiles|Code breaker/ }).count() === 5, "five games should be listed");
  await shot(page, "v3-05-games");
  for (const g of ["sudoku", "lights", "slide", "code"]) {
    await page.goto(`${BASE}/student/games/${g}?tier=normal`);
    await page.waitForSelector("text=How to play");
    await page.waitForFunction(() => !document.body.innerText.includes("Making a puzzle"));
    await shot(page, `v3-06-game-${g}`);
  }
  // Tower of Hanoi, Easy for Class 6 = 4 discs: play the optimal 15 moves.
  await page.goto(`${BASE}/student/games/hanoi?tier=easy`);
  await page.waitForSelector("text=fewest possible: 15");
  const moves = [];
  const solve = (n, a, b, c) => { if (!n) return; solve(n - 1, a, c, b); moves.push([a, b]); solve(n - 1, c, b, a); };
  solve(4, 0, 2, 1);
  const peg = (i) => page.locator(`button[aria-label^="Peg ${i + 1}"]`);
  for (const [a, b] of moves) { await peg(a).click(); await peg(b).click(); }
  await page.waitForSelector("text=Solved!");
  check(await page.locator("text=/\\+\\d+ XP/").count() > 0, "solving should award XP");
  check(await page.locator("text=⭐ tidy solution").count() === 1, "optimal Hanoi should be on par");
  await shot(page, "v3-07-hanoi-solved");
  await page.goto(`${BASE}/student/games/hanoi?tier=easy`);
  await page.waitForSelector("text=fewest possible: 15");
  await peg(0).click(); await peg(1).click(); await peg(0).click(); await peg(1).click();
  check(await page.locator("text=A bigger disc cannot go on a smaller one.").count() === 1, "illegal Hanoi move should be refused");
  log("games ok");
  await ctx.close();
}

// ---------- Teacher sees friend groups ----------
{
  const { page, ctx } = await session("teacher");
  await page.goto(`${BASE}/teacher`);
  const card = page.locator("section, div").filter({ has: page.locator("text=Class 6-A") }).filter({ has: page.locator('a[href^="/teacher/class/"]') }).last();
  await card.locator('a[href^="/teacher/class/"]').first().click();
  await page.waitForSelector("text=Friend groups (");
  check(await page.locator("text=🧠 Puzzle Pals").count() === 1, "teacher should see the demo group");
  check(await page.locator("text=🦊 Code Crew").count() === 1, "teacher should see the new group");
  log("teacher group list ok");
  await ctx.close();
}

// ---------- Group admin ----------
{
  const { page, ctx } = await session("groupadmin");
  check(page.url().endsWith("/group"), `group admin should land on /group, got ${page.url()}`);
  check(await page.locator("td >> text=Demo Public School, Noida").count() >= 1, "group page should list the Noida branch");
  check(await page.locator("td >> text=Demo Public School").count() >= 2, "group page should list both schools");
  await shot(page, "v3-08-group-home");
  const row = page.locator("tr", { has: page.locator("text=Demo Public School, Noida") });
  await Promise.all([page.waitForURL(/\/admin$/), row.locator('button:has-text("Manage")').click()]);
  check(await page.locator("h1:has-text('Demo Public School, Noida')").count() === 1, "admin pages should open on the chosen school");
  await page.goto(`${BASE}/admin/students`);
  check(await page.locator("text=n3a01").count() >= 1, "branch students should be listed");
  check(await page.locator("text=student6").count() === 0, "other school's students must not show");
  await shot(page, "v3-09-group-admin-in-branch");
  await Promise.all([page.waitForURL(/\/group$/), page.click('a:has-text("All schools")')]);
  for (const p of ["/hq", "/teacher", "/student"]) {
    await page.goto(BASE + p);
    check(page.url().endsWith("/group"), `group admin reached ${p}`);
  }
  await page.selectOption('select[name="schoolId"]', { label: "Demo Public School, Noida" });
  await page.fill('input[name="name"]', "Vice Principal Noida");
  await page.click('button:has-text("Create login")');
  await page.waitForSelector("text=Vice Principal Noida");
  log("group admin ok");
  await ctx.close();
}
{
  // A school admin outside the group's chosen school cannot use the group page.
  const { page, ctx } = await session("admin");
  await page.goto(`${BASE}/group`);
  check(page.url().endsWith("/admin"), "school admin must not open /group");
  check(await page.locator("h1:has-text('Demo Public School')").count() === 1, "school admin stays on own school");
  await ctx.close();
}
{
  const { page, ctx } = await session("superadmin");
  await page.waitForSelector("text=Groups of schools");
  check(await page.locator("text=Demo Group of Schools").count() > 0, "HQ should list the demo group");
  await shot(page, "v3-10-hq-groups");
  await ctx.close();
}

await browser.close();
if (errors.length) {
  console.log("\nERRORS:");
  for (const e of errors) console.log(e);
  process.exit(1);
}
console.log("\nAll v0.5 checks passed.");
