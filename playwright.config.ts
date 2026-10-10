import { defineConfig, devices } from "@playwright/test";

// A dedicated port so a `npm run dev` on :3000 is never mistaken for the
// E2E build (it would lack the E2E env and serve stale code).
const PORT = 3100;

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  timeout: 60000,
  // A cold production server can take a few seconds to answer the first
  // request to each route.
  expect: { timeout: 10_000 },
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "mobile",
      use: {
        ...devices["Pixel 7"],
        viewport: { width: 390, height: 844 },
      },
    },
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 800 },
      },
    },
  ],
  webServer: {
    command: `npm run build && npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    // Always build fresh; set PW_REUSE_SERVER=1 to iterate against a running
    // E2E server started with the same env.
    reuseExistingServer: process.env.PW_REUSE_SERVER === "1",
    timeout: 180 * 1000,
    env: {
      NEXT_PUBLIC_USE_AUTH_EMULATOR: "true",
      NEXT_PUBLIC_DEMO_MODE: "true",
      NEXT_PUBLIC_FIREBASE_API_KEY: "demo-key",
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "demo-safetrust.firebaseapp.com",
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: "demo-safetrust",
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "demo-safetrust.appspot.com",
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "0",
      NEXT_PUBLIC_FIREBASE_APP_ID: "1:0:web:demo",
    },
  },
});