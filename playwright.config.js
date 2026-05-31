const { defineConfig, devices } = require("@playwright/test");

const useExternalServer = process.env.PLAYWRIGHT_EXTERNAL_SERVER === "1";

module.exports = defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    viewport: { width: 1440, height: 900 },
  },
  projects: [
    {
      name: "chrome",
      use: {
        ...devices["Desktop Chrome"],
        channel: "chrome",
      },
    },
  ],
  webServer: useExternalServer
    ? undefined
    : {
        command: "python3 -m http.server 4173 --bind 127.0.0.1",
        url: "http://127.0.0.1:4173",
        reuseExistingServer: true,
        timeout: 120000,
      },
});
