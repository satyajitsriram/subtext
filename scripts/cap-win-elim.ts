/* eslint-disable no-console */
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

async function main() {
  const base = process.env.BASE_URL || "http://localhost:43123";
  const outDir = "public/screenshots";
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });

  // Elimination reveal
  await page.goto(base, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    const players = [
      { id: "p1", name: "A", score: 0 },
      { id: "p2", name: "B", score: 0 },
      { id: "p3", name: "C", score: 0 },
    ];
    const st = {
      players,
      alivePlayerIds: players.map((p) => p.id),
      assignedRoles: [
        { playerId: "p1", role: "CIVILIAN" },
        { playerId: "p2", role: "UNDERCOVER" },
        { playerId: "p3", role: "MR_WHITE" },
      ],
      civilianWord: "pancake",
      undercoverWord: "crepe",
      usedWordIndices: [],
      settings: {
        numUndercovers: 1,
        numMrWhites: 1,
        revealOnElimination: true,
        allowRecheckWord: true,
        soundsEnabled: false,
        tieBreaker: "revote",
        includeSpicy: false,
        categories: [],
        difficulties: ["easy", "medium", "hard"],
        specials: { goddessOfJustice: false, lovers: false, mrMeme: false, revenger: false, duelists: false, ghost: false, falafelVendor: false, boomerang: false, joyFool: false },
      },
      specials: {},
      rounds: [{ roundNumber: 1, speakingOrder: ["p1", "p2", "p3"], eliminatedPlayerId: "p2" }],
      status: "voting",
    };
    localStorage.setItem("subtext_state", JSON.stringify(st));
    window.location.href = "/eliminated";
  });
  await page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 10000 }).catch(() => {});
  await page.screenshot({ path: path.join(outDir, "elimination-reveal.png") });

  // Win screen
  await page.goto(base, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    const players = [
      { id: "p1", name: "A", score: 2 },
      { id: "p2", name: "B", score: 2 },
    ];
    const st = {
      players,
      alivePlayerIds: ["p1", "p2"],
      usedWordIndices: [],
      settings: {
        numUndercovers: 1,
        numMrWhites: 1,
        revealOnElimination: true,
        allowRecheckWord: true,
        soundsEnabled: false,
        tieBreaker: "revote",
        includeSpicy: false,
        categories: [],
        difficulties: ["easy", "medium", "hard"],
        specials: { goddessOfJustice: false, lovers: false, mrMeme: false, revenger: false, duelists: false, ghost: false, falafelVendor: false, boomerang: false, joyFool: false },
      },
      specials: {},
      rounds: [],
      status: "finished",
      winners: { group: "CIVILIANS", playerIds: ["p1", "p2"] },
    };
    localStorage.setItem("subtext_state", JSON.stringify(st));
    window.location.href = "/win";
  });
  await page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 10000 }).catch(() => {});
  await page.screenshot({ path: path.join(outDir, "win.png") });

  await browser.close();
  console.log("Elimination + Win captured");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
