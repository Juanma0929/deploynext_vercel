import { defineConfig, devices } from "@playwright/test";

/**
 * Where the tests point.
 *
 * By default they build the application and run it here, against the deployed
 * API, so a pull request is checked with its own code and not with whatever is
 * in production. Setting PLAYWRIGHT_BASE_URL points them at a running
 * deployment instead, which is how the production environment gets a smoke
 * check after a release.
 */
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3001";
const startsItsOwnServer = process.env.PLAYWRIGHT_BASE_URL === undefined;
const isCI = process.env.CI !== undefined;

export default defineConfig({
  testDir: "./e2e",

  // Serial on purpose. Every test logs in by itself, but they share the two
  // accounts of the API, and POST /auth/logout invalidates every token of that
  // user on every device: a test that logs out would kill the session of
  // another one running at the same time. Running one at a time is what makes
  // the suite give the same result when it runs twice in a row.
  fullyParallel: false,
  workers: 1,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  reporter: isCI ? [["github"], ["html", { open: "never" }]] : [["list"]],

  use: {
    baseURL,
    // The API runs on a free instance that can take a while to answer the
    // first request after it has been idle.
    actionTimeout: 20_000,
    navigationTimeout: 60_000,
    trace: "on-first-retry",
  },

  expect: { timeout: 20_000 },

  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],

  ...(startsItsOwnServer
    ? {
        webServer: {
          command: "npm run build && npm run start -- -p 3001",
          url: baseURL,
          reuseExistingServer: !isCI,
          timeout: 180_000,
        },
      }
    : {}),
});
