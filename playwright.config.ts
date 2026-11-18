import { existsSync } from "node:fs";

import { defineConfig, devices } from "@playwright/test";

// The credentials of the seed users, kept out of the repo (see .env.e2e.example).
if (existsSync(".env.e2e.local")) process.loadEnvFile(".env.e2e.local");

const externalBaseUrl = process.env.E2E_BASE_URL;
const baseURL = externalBaseUrl ?? "http://localhost:3001";

/**
 * End-to-end tests against the real API (the one in NEXT_PUBLIC_API_URL) and
 * its seed users. They are repeatable: the business flow creates its own
 * product, so it never depends on the stock the seed left.
 */
export default defineConfig({
  testDir: "./e2e",
  // The API is shared state (sessions, stock): one test at a time.
  fullyParallel: false,
  workers: 1,
  forbidOnly: process.env.CI !== undefined,
  retries: process.env.CI !== undefined ? 1 : 0,
  // The charge waits for Wompi: the polling alone may take up to a minute.
  timeout: 120_000,
  expect: { timeout: 10_000 },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    // A click or a fill that finds nothing fails in seconds, not at the end of the test.
    actionTimeout: 15_000,
    locale: "es-CO",
    timezoneId: "America/Bogota",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // Without E2E_BASE_URL, the production build is started here (dev mode
  // compiles each route on its first visit, which makes the timings flaky).
  ...(externalBaseUrl === undefined
    ? {
        webServer: {
          command: "npm run build && npm run start",
          url: baseURL,
          reuseExistingServer: process.env.CI === undefined,
          timeout: 300_000,
        },
      }
    : {}),
});
