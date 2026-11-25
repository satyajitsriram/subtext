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
  await page.goto(`${base}/setup`, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    const sum = Array.from(document.querySelectorAll("summary")).find((s) =>
      (s.textContent || "").toLowerCase().includes("extra roles")
    ) as HTMLElement | undefined;
    sum?.click();
  });
  await page.screenshot({ path: path.join(outDir, "setup-extras.png") });
  await browser.close();
  console.log("Captured setup-extras");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
