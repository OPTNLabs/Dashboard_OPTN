import { defineConfig } from "@playwright/test";
import { existsSync } from "node:fs";

const executablePath =
  process.env.PLAYWRIGHT_EXECUTABLE_PATH ||
  (existsSync("/usr/bin/google-chrome") ? "/usr/bin/google-chrome" : undefined);
const e2eMode = process.env.E2E_MODE === "live" ? "live" : "demo";
const demoBaseUrl = "http://127.0.0.1:8082";
const baseURL =
  process.env.E2E_BASE_URL || (e2eMode === "demo" ? demoBaseUrl : "http://127.0.0.1:8080");
const externalServer = Boolean(process.env.E2E_BASE_URL);

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  expect: { timeout: 8_000 },
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  reporter: process.env.CI ? "line" : "list",
  use: {
    baseURL,
    headless: true,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    ...(executablePath ? { launchOptions: { executablePath } } : {}),
  },
  webServer: externalServer
    ? undefined
    : {
        command: e2eMode === "demo" ? "npm run dev -- --port 8082" : "npm run dev",
        url: `${baseURL}/`,
        reuseExistingServer: e2eMode !== "demo",
        timeout: 60_000,
        env:
          e2eMode === "demo"
            ? {
                ...process.env,
                VITE_WALLETCONNECT_PROJECT_ID: "",
                WALLETCONNECT_PROJECT_ID: "",
                CHIPNET_INDEXER_URL: "",
                CHIPNET_BROADCAST_URL: "",
                OPTN_PRESERVE_EMPTY_LOCAL_ENV: "true",
                OPTN_ORIGIN_ALLOWLIST: "http://127.0.0.1:8082,http://localhost:8082",
              }
            : process.env,
      },
});
