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
  await expect(page.getByText("Subtext")).toBeVisible();
  await saveShot(page, "home-real");

  await page.getByPlaceholder("e.g. Alice, Bob, Carol...").fill("Alice, Bob, Carol, Dave, Erin");
  await page.getByRole("button", { name: "Save Players" }).click();
  const cont = page.getByRole("button", { name: "Continue to Setup" });
  if (await cont.isVisible().catch(() => false)) await cont.click();
  await expect(page.getByRole("button", { name: "Deal Words" })).toBeVisible();
  await saveShot(page, "players-real");

  // Setup
  await saveShot(page, "setup-real");
  await page.getByRole("button", { name: "Deal Words" }).click();

  // Reveal (pass-and-play) — no "Reveal all (test)" button visible
  await expect(page.getByRole("heading", { name: "Pass & Reveal" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Reveal all (test)" })).toHaveCount(0);
  await saveShot(page, "pass-to");
  // Tap to reveal and capture
  const flip = page.locator("button.flip").first();
  await flip.click();
  await saveShot(page, "card-revealed");
  // Hide and go next repeatedly
  await flip.click(); // hide
  await page.getByRole("button", { name: "Next Player" }).click();
  // Quickly step through the rest
  for (let i = 0; i < 3; i++) {
    await page.locator("button.flip").first().click(); // reveal
    await page.locator("button.flip").first().click(); // hide
    await page.getByRole("button", { name: /Next Player|Finish Reveal/ }).click();
  }
  // Last player
  await page.locator("button.flip").first().click();
  await page.locator("button.flip").first().click();
  await page.getByRole("button", { name: "Finish Reveal" }).click();
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
  const isElim = await page.getByRole("heading", { name: "Eliminated" }).isVisible().catch(() => false);
  if (isElim) {
    await saveShot(page, "elimination-real");
  } else {
    await expect(page.getByRole("heading", { name: "Mr. White Guess" })).toBeVisible();
    await saveShot(page, "mrwhite-guess-real");
  }
});
