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

  // Seed a synthetic state for tie face-off & revote
  await page.goto(base, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    const players = [
      { id: "0001", name: "P1", score: 0 },
      { id: "0002", name: "P2", score: 0 },
      { id: "0003", name: "P3", score: 0 },
      { id: "0004", name: "P4", score: 0 },
    ];
    const alive = players.map((p) => p.id);
    const assignedRoles = [
      { playerId: players[0].id, role: "CIVILIAN" },
      { playerId: players[1].id, role: "CIVILIAN" },
      { playerId: players[2].id, role: "UNDERCOVER" },
      { playerId: players[3].id, role: "MR_WHITE" },
    ];
    const st = {
      players,
      alivePlayerIds: alive,
      assignedRoles,
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
      rounds: [{ roundNumber: 1, speakingOrder: alive.slice(), faceOffIds: [players[0].id, players[2].id] }],
      status: "faceoff",
    };
    localStorage.setItem("subtext_state", JSON.stringify(st));
  });
  await page.goto(`${base}/faceoff`, { waitUntil: "domcontentloaded" });
  await page.screenshot({ path: path.join(outDir, "tie-faceoff.png") });
  await page.goto(`${base}/revote`, { waitUntil: "domcontentloaded" });
  await page.screenshot({ path: path.join(outDir, "revote.png") });

  // Mr. White guess screen
  await page.evaluate(() => {
    const players = [
      { id: "0001", name: "P1", score: 0 },
      { id: "0002", name: "P2", score: 0 },
      { id: "0003", name: "P3", score: 0 },
      { id: "0004", name: "P4", score: 0 },
    ];
    const alive = players.map((p) => p.id);
    const assignedRoles = [
      { playerId: players[0].id, role: "CIVILIAN" },
      { playerId: players[1].id, role: "CIVILIAN" },
      { playerId: players[2].id, role: "UNDERCOVER" },
      { playerId: players[3].id, role: "MR_WHITE" },
    ];
    const st = {
      players,
      alivePlayerIds: alive,
      assignedRoles,
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
      rounds: [{ roundNumber: 1, speakingOrder: alive.slice(), eliminatedPlayerId: players[3].id }],
      status: "voting",
    };
    localStorage.setItem("subtext_state", JSON.stringify(st));
  });
  await page.goto(`${base}/mrwhite`, { waitUntil: "domcontentloaded" });
  await page.screenshot({ path: path.join(outDir, "mrwhite-guess.png") });

  // Elimination reveal screen
  await page.evaluate(() => {
    const players = [
      { id: "0001", name: "P1", score: 0 },
      { id: "0002", name: "P2", score: 0 },
      { id: "0003", name: "P3", score: 0 },
      { id: "0004", name: "P4", score: 0 },
    ];
    const alive = players.map((p) => p.id);
    const assignedRoles = [
      { playerId: players[0].id, role: "CIVILIAN" },
      { playerId: players[1].id, role: "CIVILIAN" },
      { playerId: players[2].id, role: "UNDERCOVER" },
      { playerId: players[3].id, role: "MR_WHITE" },
    ];
    const st = {
      players,
      alivePlayerIds: alive,
      assignedRoles,
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
      rounds: [{ roundNumber: 1, speakingOrder: alive.slice(), eliminatedPlayerId: players[0].id }],
      status: "voting",
    };
    localStorage.setItem("subtext_state", JSON.stringify(st));
  });
  await page.goto(`${base}/eliminated`, { waitUntil: "domcontentloaded" });
  await page.screenshot({ path: path.join(outDir, "elimination-reveal.png") });

  // Win screen
  await page.evaluate(() => {
    const players = [
      { id: "0001", name: "P1", score: 0 },
      { id: "0002", name: "P2", score: 0 },
      { id: "0003", name: "P3", score: 0 },
      { id: "0004", name: "P4", score: 0 },
    ];
    const civIds = [players[0].id, players[1].id];
    const st = {
      players,
      alivePlayerIds: civIds,
      assignedRoles: [],
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
      winners: { group: "CIVILIANS", playerIds: civIds },
    };
    localStorage.setItem("subtext_state", JSON.stringify(st));
  });
  await page.goto(`${base}/win`, { waitUntil: "domcontentloaded" });
  await page.screenshot({ path: path.join(outDir, "win.png") });

  await browser.close();
  console.log("Advanced captures done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
