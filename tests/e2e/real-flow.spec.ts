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
  await page.getByRole("button", { name: "Continue to Setup" }).click();
  await expect(page.getByRole("button", { name: "Deal Words" })).toBeVisible();
  await saveShot(page, "players-real");
  await saveShot(page, "players");

  // Setup
  await saveShot(page, "setup-real");
  await saveShot(page, "setup");
  await page.getByRole("button", { name: "Deal Words" }).click();

  // Reveal (pass-and-play) — no "Reveal all (test)" button visible
  await expect(page.getByRole("heading", { name: "Pass & Reveal" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Reveal all (test)" })).toHaveCount(0);
  await saveShot(page, "pass-to");
  await saveShot(page, "pass-to");
  // Tap to reveal and capture
  const flip = page.locator("button.flip").first();
  await flip.click();
  await page.locator(".flip-inner[data-open=\"true\"]").first().waitFor({ state: "attached", timeout: 2000 });
  await page.waitForTimeout(150); // let animation fully settle
  // Assert the revealed content actually includes the assigned word or Mr. White
  const visibleText = await page.locator("button.flip .flip-back").first().innerText();
  const secret = await page.evaluate(() => {
    const st = JSON.parse(localStorage.getItem("subtext_state")!);
    const roles = new Map(st.assignedRoles.map((r: any) => [r.playerId, r.role]));
    const pid = st.players[0].id; // Alice
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
  await page.getByRole("button", { name: "Next Player" }).click();
  // Quickly step through the rest (robust against variable counts)
  for (let i = 0; i < 10; i++) {
    const hasNext = await page.getByRole("button", { name: /Next Player|Finish Reveal/ }).isVisible().catch(() => false);
    if (!hasNext) break;
    await page.locator("button.flip").first().click(); // reveal
    await page.locator("button.flip").first().click(); // hide
    await page.getByRole("button", { name: /Next Player|Finish Reveal/ }).click();
  }
  // Last player
  // Move to last player if still on the fourth
  const maybeNext = page.getByRole("button", { name: "Next Player" });
  if (await maybeNext.isVisible().catch(() => false)) await maybeNext.click();
  await page.locator("button.flip").first().click(); // reveal last
  await page.locator("button.flip").first().click(); // hide last
  await page.getByRole("button", { name: "Start Round" }).click();

  await expect(page.getByRole("heading", { name: "Round" })).toBeVisible();
  await saveShot(page, "round-real");
  await page.getByRole("button", { name: "Proceed to Voting" }).click();

  // Vote and eliminate any player
  await expect(page.getByRole("heading", { name: "Voting" })).toBeVisible();
  await saveShot(page, "vote-real");
  const firstBtn = page.getByRole("button", { name: "Alice" });
  await firstBtn.click();
  await page.getByRole("button", { name: /Confirm Elimination/ }).click();

  // Elimination or Mr. White Guess
  // Wait for any fade-in to complete
  await page.waitForTimeout(650);
  const isElim = await page.getByRole("heading", { name: "Eliminated" }).isVisible().catch(() => false);
  if (isElim) {
    await saveShot(page, "elimination-real");
  } else {
    await expect(page.getByRole("heading", { name: "Mr. White Guess" })).toBeVisible();
    await saveShot(page, "mrwhite-guess-real");
  }
});
