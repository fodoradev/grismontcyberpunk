import { defineConfig } from "@playwright/test";

// Runs against the dev server with the local database from .env.local and emails written to .outbox/.
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 90_000,
  use: { baseURL: "http://127.0.0.1:3100" },
  webServer: { command: "npm run dev -- --port 3100", url: "http://127.0.0.1:3100", reuseExistingServer: true, timeout: 120_000 },
});
