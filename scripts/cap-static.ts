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
  await page.goto(`${base}/rules`, { waitUntil: "domcontentloaded" });
  await page.screenshot({ path: path.join(outDir, "rules.png") });
  await page.goto(`${base}/leaderboard`, { waitUntil: "domcontentloaded" });
  await page.screenshot({ path: path.join(outDir, "leaderboard.png") });
  await browser.close();
  console.log("Captured rules and leaderboard");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
