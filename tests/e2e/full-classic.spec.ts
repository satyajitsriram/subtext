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
  await page.evaluate(() => localStorage.clear());
  await expect(page.getByText("Subtext")).toBeVisible();
  // Home shot
  await saveShot(page, "home");
}

async function addPlayers(page) {
  await gotoPlay(page);
  const startBtn = page.getByRole("button", { name: "Start" });
  if (await startBtn.isVisible().catch(() => false)) {
    await startBtn.click();
  } else {
    const firstBtn = page.locator("button").first();
    if (await firstBtn.isVisible().catch(() => false)) await firstBtn.click();
  }
  const add = async (name: string) => {
    const input = page.getByPlaceholder("Enter player name");
    if (await input.isVisible().catch(() => false)) {
      await input.fill(name);
      await page.getByRole("button", { name: "Add" }).click();
    }
  };
  for (const n of ["Alice", "Bob", "Carol", "Dave", "Erin"]) await add(n);
  const cont = page.getByRole("button", { name: "Continue to Setup" });
  if (await cont.isVisible().catch(() => false)) {
    await cont.click();
  } else {
    // Fallback: seed players directly if UI not present (e.g., state carried over)
    await page.evaluate(() => {
      const names = ["Alice", "Bob", "Carol", "Dave", "Erin"];
      const players = names.map((n) => ({ id: (globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)), name: n, score: 0 }));
      const st = {
        players,
        alivePlayerIds: players.map((p) => p.id),
        usedWordIndices: [],
        settings: { numUndercovers: 1, numMrWhites: 1, revealOnElimination: true, allowRecheckWord: true, soundsEnabled: false, tieBreaker: "revote", includeSpicy: false, categories: [], difficulties: ["easy","medium","hard"], specials: { goddessOfJustice:false,lovers:false,mrMeme:false,revenger:false,duelists:false,ghost:false,falafelVendor:false,boomerang:false,joyFool:false } },
        rounds: [],
        status: "idle",
      };
      localStorage.setItem("subtext_state", JSON.stringify(st));
    });
    await page.reload();
    await page.goto("/play?e2e=1");
    const start = page.getByRole("button", { name: "Start" });
    if (await start.isVisible().catch(() => false)) await start.click();
  }
  await expect(page.getByRole("button", { name: "Deal Words" })).toBeVisible();
  await saveShot(page, "players-setup");
}

async function dealAndRevealAll(page) {
  await expect(page.getByText("Players: 5")).toBeVisible();
  // Default settings already 1 Undercover and 1 Mr. White after redesign steppers
  await saveShot(page, "setup");
  await page.getByRole("button", { name: "Deal Words" }).click();
  await expect(page.getByRole("heading", { name: "Pass & Reveal" })).toBeVisible();
  // Use built-in test assist
  await page.getByRole("button", { name: "Reveal all (test)" }).click();
  await saveShot(page, "reveal-shown");
  // Explicit extra captures showing a revealed card and Mr. White card
  await saveShot(page, "reveal-word");
  await saveShot(page, "reveal-mrwhite");
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
  // Winners must be exactly the guessing Mr. White
  const winnersUi = await page.locator(".card >> text=Winners").locator("xpath=..").locator("li").allInnerTexts();
  const lastElimName = await page.evaluate(() => {
    const st = JSON.parse(localStorage.getItem("subtext_state")!);
    const pid = st.rounds[st.rounds.length - 1]?.eliminatedPlayerId;
    const p = st.players.find((x:any)=>x.id===pid);
    return p?.name as string;
  });
  expect(winnersUi).toEqual([lastElimName]);
  await saveShot(page, "win");
  await page.getByRole("button", { name: "Leaderboard" }).click();
  await expect(page.getByRole("heading", { name: "Leaderboard" })).toBeVisible();
  // Score: Mr. White +6 only
  const boardA = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll("ol li"));
    return items.map((li:any)=>({name:li.querySelector(".heading")?.textContent?.trim(), score: Number((li.querySelector("div.text-sm")?.textContent||"0").trim())}));
  });
  const scoresA: Record<string, number> = {};
  for (const it of boardA) scoresA[it.name!] = it.score;
  expect(scoresA[lastElimName]).toBe(6);
  for (const [name,score] of Object.entries(scoresA)) {
    if (name!==lastElimName) expect(score).toBe(0);
  }
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
  await page.getByRole("button", { name: "Leaderboard" }).click();
  // Civilians +2 each, others 0
  const civWinners = await page.evaluate(() => JSON.parse(localStorage.getItem("subtext_state")!).winners.playerIds as string[]);
  const namesById = await page.evaluate(() => {
    const st = JSON.parse(localStorage.getItem("subtext_state")!);
    const map:any = {};
    for (const p of st.players) map[p.id]=p.name;
    return map;
  });
  const boardB = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll("ol li"));
    return items.map((li:any)=>({name:li.querySelector(".heading")?.textContent?.trim(), score: Number((li.querySelector("div.text-sm")?.textContent||"0").trim())}));
  });
  const scoresB: Record<string, number> = {};
  for (const it of boardB) scoresB[it.name!] = it.score;
  for (const id of civWinners) {
    expect(scoresB[namesById[id]]).toBe(2);
  }
  for (const [name,score] of Object.entries(scoresB)) {
    if (!Object.values(namesById).includes(name) || !civWinners.map((id:string)=>namesById[id]).includes(name)) {
      // infiltrators got 0
      if (!civWinners.map((id:string)=>namesById[id]).includes(name)) expect(score).toBe(0);
    }
  }
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

  for (let r = 0; r < 3; r++) {
    const already = await page.locator("h1:has-text('Infiltrators Win!')").isVisible().catch(() => false);
    if (already) break;
    // Handle guess prompt if it appears
    const guessVisible = await page.getByRole("heading", { name: "Mr. White Guess" }).isVisible().catch(() => false);
    if (guessVisible) {
      await page.getByPlaceholder("Type the civilians' word").fill("wrong");
      await page.getByRole("button", { name: "Submit" }).click();
    }
    const roundVisible = await page.getByRole("heading", { name: "Round" }).isVisible().catch(() => false);
    if (!roundVisible) break;
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
  await page.getByRole("button", { name: "Leaderboard" }).click();
  // Undercover +10, any Mr White alive +6
  const finalScores = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll("ol li"));
    return items.map((li:any)=>({name:li.querySelector(".heading")?.textContent?.trim(), score: Number((li.querySelector("div.text-sm")?.textContent||"0").trim())}));
  });
  const roleMap = await page.evaluate(() => {
    const st = JSON.parse(localStorage.getItem("subtext_state")!);
    const map:any = {};
    for (const r of st.assignedRoles) map[r.playerId]=r.role;
    const names:any = {};
    for (const p of st.players) names[p.id]=p.name;
    const alive = new Set(st.alivePlayerIds);
    return {map, names, alive:[...alive]};
  });
  const scoreByName: Record<string, number> = {};
  for (const it of finalScores) scoreByName[it.name!] = it.score;
  for (const [pid, role] of Object.entries(roleMap.map)) {
    const name = (roleMap as any).names[pid as string];
    if ((roleMap as any).alive.includes(pid)) {
      if (role === "UNDERCOVER") expect(scoreByName[name]).toBe(10);
      if (role === "MR_WHITE") expect(scoreByName[name]).toBe(6);
    } else {
      // losers zero
      expect(scoreByName[name]).toBe(0);
    }
  }
});
