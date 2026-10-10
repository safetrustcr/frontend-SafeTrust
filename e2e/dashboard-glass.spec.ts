import { test, expect, waitForHydration } from "./fixtures";
import { MOCK_USERS, mockFirebaseAuth } from "./support/mock-auth";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

test.beforeEach(async ({ page }, testInfo) => {
  if (testInfo.project.name === "desktop") {
    await page.addInitScript(() =>
      localStorage.setItem("safetrust-theme", "dark"),
    );
  }
  await mockFirebaseAuth(page);
  await page.goto("/login");
  await waitForHydration(page.locator("form"));
  await page.getByLabel("Email").fill(MOCK_USERS.host.email);
  await page.getByLabel("Password").fill(MOCK_USERS.host.password);
  await page.getByRole("button", { name: "Login", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard\/escrow-dashboard$/);
  await expect(
    page.getByRole("heading", { name: "Escrow Dashboard", exact: true }),
  ).toBeVisible();
});

test("glass dashboard and host tables fit the viewport", async ({
  page,
}, testInfo) => {
  // Email login and dashboard browsing must not register wallet custom elements.
  expect(
    await page.evaluate(() =>
      [
        "stellar-wallets-modal",
        "stellar-wallets-button",
        "stellar-accounts-selector",
      ].some((name) => Boolean(customElements.get(name))),
    ),
  ).toBe(false);
  await expect(page.locator(".dashboard-glass-effect").first()).toBeAttached();
  const heading = page.getByRole("heading", {
    name: "Escrow Dashboard",
    exact: true,
  });
  expect((await heading.boundingBox())!.y).toBeGreaterThanOrEqual(64);
  await page.getByRole("button", { name: "Analytics", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Analytics Dashboard", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Avg Actions/User", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(page.viewportSize()!.width);
  await page.screenshot({
    path: `/tmp/safetrust-glass-analytics-${testInfo.project.name}.png`,
  });
  for (const route of [
    "/dashboard/users",
    "/dashboard/apartments",
    "/dashboard/hotels",
  ]) {
    await page.goto(route);
    await expect(page.locator(".dashboard-glass-card").first()).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(page.viewportSize()!.width);
  }
});

test("profile editing works with reduced motion and a failed glass chunk", async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  // Use a new document so the glass chunk isn't already loaded by the dashboard.
  const manifest = JSON.parse(
    readFileSync(resolve(".next/react-loadable-manifest.json"), "utf8"),
  );
  const files: string[] =
    manifest["components/dashboard/ui/DashboardGlassCard.tsx -> ./GlassSurface"]
      .files;
  for (const file of files.filter((file) => file.endsWith(".js"))) {
    await page.route(`**/_next/${file}`, (route) =>
      route.abort("blockedbyclient"),
    );
  }
  await page.goto("/dashboard/users");
  await page.getByRole("button", { name: "Edit Profile", exact: true }).click();
  await page.getByLabel("First Name", { exact: true }).fill("Updated");
  await expect(page.getByLabel("First Name", { exact: true })).toHaveValue(
    "Updated",
  );
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Edit Profile", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: `/tmp/safetrust-glass-users-${testInfo.project.name}.png`,
  });
});

test("dashboard panels contain their content and overlays stay readable", async ({
  page,
}, testInfo) => {
  const layoutProblems = () =>
    page.locator("main").evaluate((main) => {
      const cards = [
        ...main.querySelectorAll<HTMLElement>(".dashboard-glass-card"),
      ];
      const problems: string[] = [];
      for (const card of cards) {
        const r = card.getBoundingClientRect();
        const content = card.querySelector<HTMLElement>(
          ".dashboard-glass-content",
        )!;
        if (content.getBoundingClientRect().bottom > r.bottom + 1)
          problems.push("content outside card");
      }
      for (let i = 0; i < cards.length; i++) {
        for (let j = i + 1; j < cards.length; j++) {
          if (cards[i].contains(cards[j]) || cards[j].contains(cards[i]))
            continue;
          const a = cards[i].getBoundingClientRect(),
            b = cards[j].getBoundingClientRect();
          if (
            Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 &&
            Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1
          )
            problems.push("overlapping sibling cards");
        }
      }
      return problems;
    });
  for (const width of [320, 768, 1280]) {
    await page.setViewportSize({ width, height: 844 });
    await expect.poll(layoutProblems).toEqual([]);
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
      .toBeLessThanOrEqual(width);
  }
  await page.setViewportSize(testInfo.project.use.viewport!);
  await page.getByRole("button", { name: "Analytics", exact: true }).click();
  await page
    .getByRole("button", { name: "Select analytics date range" })
    .click();
  const popover = page
    .locator("[data-radix-popper-content-wrapper]")
    .filter({ has: page.getByText("Quick Select", { exact: true }) });
  await expect(popover).toBeVisible();
  const rect = await popover.boundingBox();
  expect(rect!.width).toBeLessThanOrEqual(480);
  expect(rect!.x).toBeGreaterThanOrEqual(0);
  expect(rect!.x + rect!.width).toBeLessThanOrEqual(
    page.viewportSize()!.width + 0.5,
  );
  const surface = popover.locator('[data-state="open"]').first();
  expect(
    await surface.evaluate((el) => getComputedStyle(el).backgroundColor),
  ).not.toBe("rgba(0, 0, 0, 0)");
  const previous = popover.getByRole("button", { name: /previous month/i });
  const next = popover.getByRole("button", { name: /next month/i });
  await expect(previous).toBeVisible();
  await expect(next).toBeVisible();
  const a = (await previous.boundingBox())!,
    b = (await next.boundingBox())!;
  expect(a.x + a.width).toBeLessThanOrEqual(b.x + 0.5);
  await page.screenshot({
    path: `/tmp/safetrust-dashboard-calendar-${testInfo.project.name}.png`,
  });
  await page.keyboard.press("Escape");
  await expect(popover).toHaveCount(0);
  await expect.poll(layoutProblems).toEqual([]);
});
