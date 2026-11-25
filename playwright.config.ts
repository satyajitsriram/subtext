import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 120_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: "http://127.0.0.1:43124",
    browserName: "chromium",
    headless: true,
    viewport: { width: 390, height: 844 },
    ignoreHTTPSErrors: true,
    actionTimeout: 10_000,
    screenshot: "off",
    video: "off",
  },
  webServer: {
    command: "npm run build && npm run start:prod",
    url: "http://127.0.0.1:43124",
    reuseExistingServer: true,
    timeout: 180_000,
  },
  projects: [
    {
      name: "chromium-mobile",
      use: { ...devices["Pixel 7"] },
    },
  ],
});
