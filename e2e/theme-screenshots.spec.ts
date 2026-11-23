import { expectPathname, test, waitForHydration } from "./fixtures";
import { MOCK_USERS, mockFirebaseAuth } from "./support/mock-auth";
import fs from "node:fs";
import path from "node:path";

const OUT_DIR = path.join(process.cwd(), "docs/screenshots/issue-751");

test.use({
  allowedConsoleErrors: [/useTrustlessWorkClient/],
});

test("capture theme screenshots for issue #751", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Desktop screenshots only");

  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  // 1. Register page (light & dark) - logged out
  await page.addInitScript(() =>
    localStorage.setItem("safetrust-theme", "light"),
  );
  await page.goto("/register");
  await waitForHydration(page.locator("form"));
  await page.screenshot({
    path: path.join(OUT_DIR, "after-register-light.png"),
    fullPage: true,
  });

  await page.evaluate(() => {
    localStorage.setItem("safetrust-theme", "dark");
    document.documentElement.classList.add("dark");
  });
  await page.screenshot({
    path: path.join(OUT_DIR, "after-register-dark.png"),
    fullPage: true,
  });

  // 2. Log in as host for dashboard pages
  await mockFirebaseAuth(page);
  await page.goto("/login");
  await waitForHydration(page.locator("form"));
  await page.getByLabel("Email").fill(MOCK_USERS.host.email);
  await page.getByLabel("Password").fill(MOCK_USERS.host.password);
  await page.getByRole("button", { name: "Login", exact: true }).click();
  await expectPathname(page, "/dashboard/escrow-dashboard");

  // Escrow Dashboard - light & dark
  await page.evaluate(() => {
    localStorage.setItem("safetrust-theme", "light");
    document.documentElement.classList.remove("dark");
  });
  await page.goto("/dashboard/escrow-dashboard");
  await page.waitForLoadState("networkidle");
  await page.screenshot({
    path: path.join(OUT_DIR, "after-escrow-dashboard-light.png"),
    fullPage: true,
  });

  await page.evaluate(() => {
    localStorage.setItem("safetrust-theme", "dark");
    document.documentElement.classList.add("dark");
  });
  await page.screenshot({
    path: path.join(OUT_DIR, "after-escrow-dashboard-dark.png"),
    fullPage: true,
  });

  // Escrow Detail - light & dark
  await page.evaluate(() => {
    localStorage.setItem("safetrust-theme", "light");
    document.documentElement.classList.remove("dark");
  });
  await page.goto("/dashboard/escrow/escrow_1");
  await page.waitForLoadState("networkidle");
  await page.screenshot({
    path: path.join(OUT_DIR, "after-escrow-detail-light.png"),
    fullPage: true,
  });

  await page.evaluate(() => {
    localStorage.setItem("safetrust-theme", "dark");
    document.documentElement.classList.add("dark");
  });
  await page.screenshot({
    path: path.join(OUT_DIR, "after-escrow-detail-dark.png"),
    fullPage: true,
  });

  // Hotel Form - light & dark
  await page.evaluate(() => {
    localStorage.setItem("safetrust-theme", "light");
    document.documentElement.classList.remove("dark");
  });
  await page.goto("/dashboard/hotels/new");
  await page.waitForLoadState("networkidle");
  await page.screenshot({
    path: path.join(OUT_DIR, "after-hotel-form-light.png"),
    fullPage: true,
  });

  await page.evaluate(() => {
    localStorage.setItem("safetrust-theme", "dark");
    document.documentElement.classList.add("dark");
  });
  await page.screenshot({
    path: path.join(OUT_DIR, "after-hotel-form-dark.png"),
    fullPage: true,
  });
});
