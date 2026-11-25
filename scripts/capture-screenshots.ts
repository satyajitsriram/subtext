/* eslint-disable no-console */
import puppeteer from "puppeteer";

async function main() {
  const base = process.env.BASE_URL || "http://localhost:43123";
  const outDir = "public/screenshots";
  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 }); // iPhone 12-ish

  // Ensure directory exists
  await page.goto(base, { waitUntil: "networkidle0" });
  await page.evaluate((dir) => {
    // no-op in browser; node fs not here
  }, outDir);

  const fs = await import("fs");
  const path = await import("path");
  fs.mkdirSync(outDir, { recursive: true });

  async function clickByText(tag: string, text: string) {
    await page.evaluate(
      (t, inner) => {
        const nodes = Array.from(document.querySelectorAll(t));
        const el = nodes.find((n) => (n.textContent || "").toLowerCase().includes(inner.toLowerCase()));
        (el as HTMLElement | undefined)?.click();
      },
      tag,
      text
    );
  }
  // Players
  await page.goto(`${base}/`, { waitUntil: "domcontentloaded" });
  await page.screenshot({ path: path.join(outDir, "home.png") });
  await page.goto(`${base}/players`, { waitUntil: "domcontentloaded" });
  await page.type("textarea", "A, B, C, D, E");
  await clickByText("button", "Save Players");
  await page.screenshot({ path: path.join(outDir, "players-setup.png") });

  // Setup
  await page.goto(`${base}/setup`, { waitUntil: "domcontentloaded" });
  await page.screenshot({ path: path.join(outDir, "setup.png") });

  // Deal words -> Reveal
  await clickByText("button", "Deal Words");
  await page.waitForSelector("button", { timeout: 5000 });
  // Reveal each player's card so Start Round becomes enabled
  await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll("button.flip"));
    for (const c of cards) (c as HTMLElement).click();
  });
  await page.screenshot({ path: path.join(outDir, "reveal.png") });
  // Reveal-shown: flip first card
  await page.evaluate(() => {
    const first = document.querySelector("button.flip") as HTMLElement | null;
    first?.click();
  });
  await page.screenshot({ path: path.join(outDir, "reveal-shown.png") });

  // Begin round by mutating state (to avoid manual taps)
  await page.evaluate(() => {
    const raw = localStorage.getItem("subtext_state");
    if (!raw) return;
    const st = JSON.parse(raw);
    st.status = "in_round";
    st.rounds = [{ roundNumber: 1, speakingOrder: st.alivePlayerIds.slice() }];
    localStorage.setItem("subtext_state", JSON.stringify(st));
    window.location.href = "/round";
  });
  await page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 5000 }).catch(() => {});
  await page.screenshot({ path: path.join(outDir, "round.png") });

  // Go to Voting
  await clickByText("button", "Proceed to Voting");
  await page.waitForSelector("main", { timeout: 5000 });
  await page.screenshot({ path: path.join(outDir, "vote.png") });

  // Tie face-off screen (force)
  await page.evaluate(() => {
    const raw = localStorage.getItem("subtext_state");
    if (!raw) return;
    const st = JSON.parse(raw);
    const ids = st.alivePlayerIds.slice(0, 2);
    const r = st.rounds[st.rounds.length - 1];
    r.faceOffIds = ids;
    localStorage.setItem("subtext_state", JSON.stringify(st));
    window.location.href = "/faceoff";
  });
  await page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 5000 }).catch(() => {});
  await page.screenshot({ path: path.join(outDir, "tie-faceoff.png") });

  // Revote screen
  await page.goto(`${base}/revote`, { waitUntil: "domcontentloaded" });
  await page.screenshot({ path: path.join(outDir, "revote.png") });

  // Elimination reveal (force one elimination)
  await page.evaluate(() => {
    const raw = localStorage.getItem("subtext_state");
    if (!raw) return;
    const st = JSON.parse(raw);
    const target = st.alivePlayerIds[0];
    st.alivePlayerIds = st.alivePlayerIds.slice(1);
    const r = st.rounds[st.rounds.length - 1];
    r.eliminatedPlayerId = target;
    localStorage.setItem("subtext_state", JSON.stringify(st));
    window.location.href = "/eliminated";
  });
  await page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 5000 }).catch(() => {});
  await page.screenshot({ path: path.join(outDir, "elimination-reveal.png") });

  // Rules and Leaderboard
  // Setup Extras screenshot
  await page.goto(`${base}/setup`, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    const sum = Array.from(document.querySelectorAll("summary")).find((s) =>
      (s.textContent || "").toLowerCase().includes("extra roles")
    ) as HTMLElement | undefined;
    sum?.click();
  });
  await page.screenshot({ path: path.join(outDir, "setup-extras.png") });

  await page.goto(`${base}/rules`, { waitUntil: "domcontentloaded" });
  await page.screenshot({ path: path.join(outDir, "rules.png") });
  await page.goto(`${base}/leaderboard`, { waitUntil: "domcontentloaded" });
  await page.screenshot({ path: path.join(outDir, "leaderboard.png") });

  // Find Mr. White and eliminate to reach guess screen
  const mrWhiteIndex = await page.evaluate(() => {
    const raw = localStorage.getItem("subtext_state");
    if (!raw) return -1;
    const st = JSON.parse(raw);
    const roles = new Map(st.assignedRoles.map((r: any) => [r.playerId, r.role]));
    const alive = st.players.filter((p: any) => st.alivePlayerIds.includes(p.id));
    return alive.findIndex((p: any) => roles.get(p.id) === "MR_WHITE");
  });
  if (mrWhiteIndex >= 0) {
    const btns = await page.$$("button");
    if (btns[mrWhiteIndex]) {
      await btns[mrWhiteIndex].click();
      await clickByText("button", "Confirm Elimination");
      await page.waitForSelector("input[placeholder*='civilians']", { timeout: 5000 });
      await page.screenshot({ path: path.join(outDir, "mrwhite-guess.png") });
      // Fill correct guess
      const civilianWord = await page.evaluate(() => {
        const raw = localStorage.getItem("subtext_state");
        if (!raw) return "";
        return (JSON.parse(raw).civilianWord as string) || "";
      });
      await page.type("input[placeholder*='civilians']", civilianWord);
      await clickByText("button", "Submit");
      await page.waitForSelector("h1", { timeout: 5000 }).catch(() => {});
      await page.screenshot({ path: path.join(outDir, "win.png") });
    }
  }

  // Leaderboard
  await page.goto(`${base}/leaderboard`, { waitUntil: "domcontentloaded" });
  await page.screenshot({ path: path.join(outDir, "leaderboard.png") });

  await browser.close();
  console.log("Screenshots saved to", outDir);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
