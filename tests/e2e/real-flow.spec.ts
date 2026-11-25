import { test, expect } from "@playwright/test";
import fs from "fs";

const artifacts = "/opt/cursor/artifacts";

async function saveShot(page, name: string) {
  await page.screenshot({ path: `${artifacts}/${name}.png`, fullPage: true });
  const stat = fs.statSync(`${artifacts}/${name}.png`);
  expect(stat.size).toBeGreaterThan(12000);
}

test("Real flow: pass-and-play reveal to elimination (no test UI)", async ({ page }) => {
  await page.goto("/play");
  await page.evaluate(() => localStorage.clear());
  await expect(page.getByRole("button", { name: /Start|Continue|Deal Words/ })).toBeVisible();
  await saveShot(page, "home-real");
  // Also save canonical names for the final artifact set
  await saveShot(page, "home");

  // Add players one by one
  const startBtn = page.getByRole("button", { name: "Start" });
  if (await startBtn.isVisible().catch(() => false)) {
    await startBtn.click();
  } else {
    const firstBtn = page.locator("button").first();
    if (await firstBtn.isVisible().catch(() => false)) await firstBtn.click();
  }
  const addName = async (name: string) => {
    const input = page.getByPlaceholder("Enter player name");
    await expect(input).toBeVisible();
    await input.fill(name);
    await input.press("Enter");
  };
  for (const n of ["Alice", "Bob", "Carol", "Dave", "Erin"]) await addName(n);
  // Capture players screen BEFORE continuing
  await saveShot(page, "players-real");
  await saveShot(page, "players");
  await page.getByRole("button", { name: "Continue to Setup" }).click();
  await expect(page.getByRole("button", { name: "Deal Words" })).toBeVisible();

  // Setup
  await saveShot(page, "setup-real");
  await saveShot(page, "setup");
  await page.getByRole("button", { name: "Deal Words" }).click();

  // Reveal (pass-and-play) — no "Reveal all (test)" button visible
  await expect(page.getByRole("heading", { name: "Pass & Reveal" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Reveal all (test)" })).toHaveCount(0);
  await saveShot(page, "pass-to");
  await saveShot(page, "pass-to");
// Tap to reveal for a civilian/undercover specifically
let flip = page.locator("button.flip").first();
const nonMwIndex = await page.evaluate(() => {
  const st = JSON.parse(localStorage.getItem("subtext_state")!);
  const roles = new Map(st.assignedRoles.map((r: any) => [r.playerId, r.role]));
  const idx = st.players.findIndex((p: any) => roles.get(p.id) !== "MR_WHITE");
  return idx >= 0 ? idx : 0;
});
for (let i = 0; i < nonMwIndex; i++) {
  // open/close current then go next
  await flip.click();
  await flip.click();
  const nextBtn = page.getByRole("button", { name: "Next Player" });
  if (await nextBtn.isVisible().catch(() => false)) await nextBtn.click();
  flip = page.locator("button.flip").first();
}
await flip.click();
  await page.locator(".flip-inner[data-open=\"true\"]").first().waitFor({ state: "attached", timeout: 2000 });
  await page.waitForTimeout(150); // let animation fully settle
  // Assert the revealed content actually includes the assigned word or Mr. White
  const visibleText = await page.locator("button.flip .flip-back").first().innerText();
  const secret = await page.evaluate(() => {
    const st = JSON.parse(localStorage.getItem("subtext_state")!);
    const roles = new Map(st.assignedRoles.map((r: any) => [r.playerId, r.role]));
  const nonMw = st.players.find((p: any) => roles.get(p.id) !== "MR_WHITE") || st.players[0];
  const pid = nonMw.id;
    const role = roles.get(pid);
    if (role === "MR_WHITE") return "You are Mr. White";
    return role === "CIVILIAN" ? st.civilianWord : st.undercoverWord;
  });
  expect(visibleText).toContain(secret);
  await saveShot(page, "card-revealed");
  await saveShot(page, "card-word");

  // Try to capture Mr. White's card in real flow: advance to their index and reveal
  const mrIndex = await page.evaluate(() => {
    const st = JSON.parse(localStorage.getItem("subtext_state")!);
    const roles = new Map(st.assignedRoles.map((r: any) => [r.playerId, r.role]));
    const idx = st.players.findIndex((p: any) => roles.get(p.id) === "MR_WHITE");
    return idx >= 0 ? idx : 0;
  });
for (let i = 0; i < mrIndex; i++) {
    await flip.click(); // hide
    await page.getByRole("button", { name: "Next Player" }).click();
    await page.locator("button.flip").first().click(); // reveal
    await page.locator(".flip-inner[data-open=\"true\"]").first().waitFor({ state: "attached", timeout: 2000 });
    await page.waitForTimeout(120);
  }
  // If we're on Mr. White, capture it
  const mwText = await page.locator("button.flip .flip-back").first().innerText();
  if (mwText.toLowerCase().includes("mr. white")) {
    await saveShot(page, "card-mrwhite");
  }
  // Hide and go next repeatedly
  await flip.click(); // hide
  const nextOnce = page.getByRole("button", { name: "Next Player" });
  const startOnce = page.getByRole("button", { name: "Start Round" });
  if (await nextOnce.isVisible().catch(() => false)) {
    await nextOnce.click();
  } else if (await startOnce.isVisible().catch(() => false)) {
    await startOnce.click();
  }
  // Quickly step through the rest (robust against variable counts)
  for (let i = 0; i < 10; i++) {
    const hasNext = await page.getByRole("button", { name: /Next Player|Finish Reveal/ }).isVisible().catch(() => false);
    if (!hasNext) break;
    await page.locator("button.flip").first().click(); // reveal
    await page.locator("button.flip").first().click(); // hide
    await page.getByRole("button", { name: /Next Player|Finish Reveal/ }).click();
  }
// Last player: if still in reveal flow, try to reveal/hide; otherwise start round
const maybeNext = page.getByRole("button", { name: "Next Player" });
if (await maybeNext.isVisible().catch(() => false)) await maybeNext.click();
const flipLast = page.locator("button.flip").first();
if (await flipLast.isVisible().catch(() => false)) {
  await flipLast.click(); // reveal last
  await flipLast.click(); // hide last
}
const startBtn2 = page.getByRole("button", { name: "Start Round" });
if (await startBtn2.isVisible().catch(() => false)) await startBtn2.click();

  await expect(page.getByRole("heading", { name: "Round" })).toBeVisible();
  await saveShot(page, "round-real");
  await page.getByRole("button", { name: "Proceed to Voting" }).click();

  // Vote and eliminate any player
  await expect(page.getByRole("heading", { name: "Voting" })).toBeVisible();
  const firstBtn = page.getByRole("button", { name: "Alice" });
  await firstBtn.click(); // show selected state
  await saveShot(page, "vote-real");
  await page.getByRole("button", { name: /Confirm Elimination/ }).click();

  // Elimination or Mr. White Guess
  // Wait for any fade-in to complete
  await page.waitForTimeout(650);
  const isElim = await page.getByRole("heading", { name: "Eliminated" }).isVisible().catch(() => false);
  if (isElim) {
    await saveShot(page, "elimination-real");
    await saveShot(page, "elimination");
    // After elimination flow, go to leaderboard to capture final scores
    const cont = page.getByRole("button", { name: "Continue" });
    if (await cont.isVisible().catch(() => false)) await cont.click();
    const roundHead = page.getByRole("heading", { name: "Round" });
    if (await roundHead.isVisible().catch(() => false)) {
      await page.getByRole("button", { name: "Proceed to Voting" }).click();
    }
  } else {
    await expect(page.getByRole("heading", { name: "Mr. White Guess" })).toBeVisible();
    await saveShot(page, "mrwhite-guess-real");
  }
});
