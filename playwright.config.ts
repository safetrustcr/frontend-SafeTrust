import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: "http://localhost:3000",
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
    command: "npm run build && npm start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
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
