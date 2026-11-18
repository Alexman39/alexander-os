import { defineConfig, devices } from "@playwright/test";
import { E2E_OWNER_GITHUB_ID, OWNER_STATE, PORT } from "./tests/e2e/auth-constants";

const CI = !!process.env.CI;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  reporter: CI ? [["list"], ["github"]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    // Verified with reduced motion so assertions never race animations.
    contextOptions: { reducedMotion: "reduce" },
  },
  projects: [
    { name: "unit", testMatch: /unit\/.*\.spec\.ts/ },
    // Creates signed-in test identities in the test database; removed by "cleanup".
    { name: "setup", testMatch: /e2e\/auth\.setup\.ts/, teardown: "cleanup" },
    { name: "cleanup", testMatch: /e2e\/auth\.teardown\.ts/ },
    {
      name: "desktop",
      testMatch: /e2e\/.*\.spec\.ts/,
      dependencies: ["setup"],
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 }, storageState: OWNER_STATE },
    },
    {
      name: "mobile",
      testMatch: /e2e\/mobile\.spec\.ts/,
      dependencies: ["setup"],
      use: { ...devices["Pixel 7"], storageState: OWNER_STATE },
    },
  ],
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}/sign-in`,
    reuseExistingServer: !CI,
    timeout: 60_000,
    // Process env overrides .env.local: the test server trusts only the fake owner.
    env: {
      OWNER_GITHUB_ID: E2E_OWNER_GITHUB_ID,
      BETTER_AUTH_URL: `http://localhost:${PORT}`,
      DEMO_MODE: "true",
    },
  },
});
