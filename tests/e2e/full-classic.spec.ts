import { test, expect } from "@playwright/test";
import fs from "fs";

const artifacts = "/opt/cursor/artifacts";

async function saveShot(page, name: string) {
  await page.screenshot({ path: `${artifacts}/${name}.png`, fullPage: true });
  const stat = fs.statSync(`${artifacts}/${name}.png`);
  expect(stat.size).toBeGreaterThan(5000);
}

async function gotoPlay(page) {
  await page.goto("/play?e2e=1");
  await expect(page.getByText("Subtext — Classic")).toBeVisible();
  // Home shot
  await saveShot(page, "home");
}

async function addPlayers(page) {
  await gotoPlay(page);
  await page.getByPlaceholder("e.g. Alice, Bob, Carol...").fill("Alice, Bob, Carol, Dave, Erin");
  await page.getByRole("button", { name: "Save Players" }).click();
  await saveShot(page, "after-save");
  const cont = page.getByRole("button", { name: "Continue to Setup" });
  if (await cont.isVisible().catch(() => false)) {
    await cont.click();
  }
  await expect(page.getByRole("button", { name: "Deal Words" })).toBeVisible();
  await saveShot(page, "players-setup");
}

async function dealAndRevealAll(page) {
  await expect(page.getByText("Players: 5")).toBeVisible();
  const inputs = page.locator("input[type=number]");
  await inputs.nth(0).fill("1");
  await inputs.nth(1).fill("1");
  await saveShot(page, "setup");
  await page.getByRole("button", { name: "Deal Words" }).click();
  await expect(page.getByRole("heading", { name: "Pass & Reveal" })).toBeVisible();
  // Use built-in test assist
  await page.getByRole("button", { name: "Reveal all (test)" }).click();
  await saveShot(page, "reveal-shown");
  await page.getByRole("button", { name: "Start Round" }).click();
}

async function captureRoundAndVote(page, pickName: string) {
  await expect(page.getByRole("heading", { name: "Round" })).toBeVisible();
  await expect(page.getByText("Speaking Order")).toBeVisible();
  await saveShot(page, "round");
  await page.getByRole("button", { name: "Proceed to Voting" }).click();
  await expect(page.getByRole("heading", { name: "Voting" })).toBeVisible();
  await saveShot(page, "vote");
  await page.getByRole("button", { name: pickName }).click();
  await page.getByRole("button", { name: /Confirm Elimination|Resolve Tie/ }).click();
}

test("Game A: Mr. White wins by guess", async ({ page }) => {
  await addPlayers(page);
  await dealAndRevealAll(page);
  const mwName = await page.evaluate(() => {
    const st = JSON.parse(localStorage.getItem("subtext_state")!);
    const roles = new Map(st.assignedRoles.map((r: any) => [r.playerId, r.role]));
    const mw = st.players.find((p: any) => roles.get(p.id) === "MR_WHITE");
    return mw.name as string;
  });
  await captureRoundAndVote(page, mwName);
  await expect(page.getByRole("heading", { name: "Mr. White Guess" })).toBeVisible();
  const civWord = await page.evaluate(() => JSON.parse(localStorage.getItem("subtext_state")!).civilianWord as string);
  await page.getByPlaceholder("Type the civilians' word").fill(civWord);
  await saveShot(page, "mrwhite-guess");
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page.getByRole("heading", { name: "Mr. White Wins!" })).toBeVisible();
  await saveShot(page, "win");
  await page.getByRole("button", { name: "Leaderboard" }).click();
  await expect(page.getByRole("heading", { name: "Leaderboard" })).toBeVisible();
  await saveShot(page, "leaderboard");
});

test("Game B: Civilians win (eliminate UC then MW)", async ({ page }) => {
  await addPlayers(page);
  await dealAndRevealAll(page);
  const { ucName, mwName } = await page.evaluate(() => {
    const st = JSON.parse(localStorage.getItem("subtext_state")!);
    const roles = new Map(st.assignedRoles.map((r: any) => [r.playerId, r.role]));
    const uc = st.players.find((p: any) => roles.get(p.id) === "UNDERCOVER");
    const mw = st.players.find((p: any) => roles.get(p.id) === "MR_WHITE");
    return { ucName: uc.name as string, mwName: mw.name as string };
  });
  await captureRoundAndVote(page, ucName);
  await expect(page.getByRole("heading", { name: "Eliminated" })).toBeVisible();
  await saveShot(page, "elimination-reveal");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("heading", { name: "Round" })).toBeVisible();
  await page.getByRole("button", { name: "Proceed to Voting" }).click();
  await page.getByRole("button", { name: mwName }).click();
  await page.getByRole("button", { name: /Confirm Elimination/ }).click();
  await expect(page.getByRole("heading", { name: "Mr. White Guess" })).toBeVisible();
  await page.getByPlaceholder("Type the civilians' word").fill("wrong guess");
  await page.getByRole("button", { name: "Submit" }).click();
  const finished = await page.locator("h1:has-text('Civilians Win!')").isVisible().catch(() => false);
  if (!finished) {
    await expect(page.getByRole("heading", { name: "Round" })).toBeVisible();
    await page.getByRole("button", { name: "Proceed to Voting" }).click();
    const nextName = await page.evaluate(() => {
      const st = JSON.parse(localStorage.getItem("subtext_state")!);
      const roles = new Map(st.assignedRoles.map((r: any) => [r.playerId, r.role]));
      const alive = st.players.filter((p: any) => st.alivePlayerIds.includes(p.id));
      const nonCiv = alive.find((p: any) => roles.get(p.id) !== "CIVILIAN");
      return (nonCiv || alive[0]).name as string;
    });
    await page.getByRole("button", { name: nextName }).click();
    await page.getByRole("button", { name: /Confirm Elimination/ }).click();
  }
  await expect(page.getByRole("heading", { name: "Civilians Win!" })).toBeVisible();
  await saveShot(page, "win-civilians");
});

test("Game C: Infiltrators win (reduce to one civilian)", async ({ page }) => {
  await addPlayers(page);
  await dealAndRevealAll(page);
  // Force a tie face-off in the first round
  await expect(page.getByRole("heading", { name: "Round" })).toBeVisible();
  await page.getByRole("button", { name: "Proceed to Voting" }).click();
  await page.getByText("Mark tie").click();
  const twoNames = await page.evaluate(() => {
    const st = JSON.parse(localStorage.getItem("subtext_state")!);
    const alive = st.players.filter((p: any) => st.alivePlayerIds.includes(p.id));
    return alive.slice(0, 2).map((p: any) => p.name) as string[];
  });
  await page.getByRole("button", { name: twoNames[0] }).click();
  await page.getByRole("button", { name: twoNames[1] }).click();
  await page.getByRole("button", { name: "Start Tie Face-off" }).click();
  await saveShot(page, "tie-faceoff");
  // Revote among tied (pick the first)
  await page.getByRole("button", { name: twoNames[0] }).click();
  await saveShot(page, "revote");
  await page.getByRole("button", { name: "Confirm Elimination" }).click();
  const isElimFirst = await page.getByRole("heading", { name: "Eliminated" }).isVisible().catch(() => false);
  if (isElimFirst) await page.getByRole("button", { name: "Continue" }).click();

  for (let r = 0; r < 2; r++) {
    const already = await page.locator("h1:has-text('Infiltrators Win!')").isVisible().catch(() => false);
    if (already) break;
    await expect(page.getByRole("heading", { name: "Round" })).toBeVisible();
    await page.getByRole("button", { name: "Proceed to Voting" }).click();
    const civName = await page.evaluate(() => {
      const st = JSON.parse(localStorage.getItem("subtext_state")!);
      const roles = new Map(st.assignedRoles.map((r: any) => [r.playerId, r.role]));
      const alive = st.players.filter((p: any) => st.alivePlayerIds.includes(p.id));
      const civ = alive.find((p: any) => roles.get(p.id) === "CIVILIAN");
      return civ ? civ.name : alive[0].name;
    });
    await page.getByRole("button", { name: civName }).click();
    await page.getByRole("button", { name: /Confirm Elimination/ }).click();
    const isElim = await page.getByRole("heading", { name: "Eliminated" }).isVisible().catch(() => false);
    if (isElim) await page.getByRole("button", { name: "Continue" }).click();
    const isGuess = await page.getByRole("heading", { name: "Mr. White Guess" }).isVisible().catch(() => false);
    if (isGuess) {
      await page.getByPlaceholder("Type the civilians' word").fill("wrong");
      await page.getByRole("button", { name: "Submit" }).click();
    }
    const won = await page.locator("h1:has-text('Infiltrators Win!')").isVisible().catch(() => false);
    if (won) break;
  }
  await expect(page.getByRole("heading", { name: "Infiltrators Win!" })).toBeVisible();
  await saveShot(page, "win-infiltrators");
});
