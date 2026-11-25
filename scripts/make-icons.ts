/* eslint-disable no-console */
import { PNG } from "pngjs";
import fs from "fs";

function makeGradient(size: number, file: string) {
  const png = new PNG({ width: size, height: size });
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) << 2;
      // brand gradient: gold to amber on a dark vignette
      const t = y / (size - 1);
      const r = Math.round(224 - 40 * t);
      const g = Math.round(178 - 60 * t);
      const b = Math.round(17 + 10 * t);
      // simple vignette
      const cx = (x - size / 2) / (size / 2);
      const cy = (y - size / 2) / (size / 2);
      const v = Math.max(0.75, 1 - 0.25 * (cx * cx + cy * cy));
      png.data[idx] = Math.max(0, Math.min(255, Math.round(r * v)));
      png.data[idx + 1] = Math.max(0, Math.min(255, Math.round(g * v)));
      png.data[idx + 2] = Math.max(0, Math.min(255, Math.round(b * v)));
      png.data[idx + 3] = 255;
    }
  }
  png.pack().pipe(fs.createWriteStream(file));
}

function outline(size: number, file: string) {
  const png = new PNG({ width: size, height: size });
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) << 2;
      const border = x < size * 0.08 || y < size * 0.08 || x > size * 0.92 || y > size * 0.92;
      const r = border ? 11 : 18;
      const g = border ? 15 : 24;
      const b = border ? 20 : 34;
      png.data[idx] = r;
      png.data[idx + 1] = g;
      png.data[idx + 2] = b;
      png.data[idx + 3] = 255;
    }
  }
  png.pack().pipe(fs.createWriteStream(file));
}

async function main() {
  fs.mkdirSync("public/icons", { recursive: true });
  makeGradient(192, "public/icons/icon-192.png");
  makeGradient(512, "public/icons/icon-512.png");
  // Maskable versions: darker outline background
  outline(192, "public/icons/maskable-192.png");
  outline(512, "public/icons/maskable-512.png");
  // Apple touch icon
  makeGradient(180, "public/apple-touch-icon.png");
  console.log("Icons written to public/icons and public/apple-touch-icon.png");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
