import { expect, expectPathname, test, waitForHydration } from "./fixtures";
import { MOCK_USERS, mockFirebaseAuth } from "./support/mock-auth";

test("notification state and contrast stay consistent across themes", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "desktop",
    "Theme toggle is desktop-only",
  );
  await page.addInitScript(() =>
    localStorage.setItem("safetrust-theme", "dark"),
  );
  await mockFirebaseAuth(page);

  await page.goto("/login");
  await waitForHydration(page.locator("form"));
  await page.getByLabel("Email").fill(MOCK_USERS.host.email);
  await page.getByLabel("Password").fill(MOCK_USERS.host.password);
  await page.getByRole("button", { name: "Login", exact: true }).click();
  await expectPathname(page, "/dashboard/escrow-dashboard");

  await page.goto("/dashboard/notifications");
  const pageCount = page.getByTestId("notification-unread-count");
  const unreadStatus = page.getByTestId("notification-unread-status");
  const sidebarCount = page.getByTestId("sidebar-notification-unread-count");
  await expect(unreadStatus).toHaveAttribute("aria-live", "polite");
  await expect(unreadStatus).toHaveText("2 unread notifications");
  await expect(pageCount).toContainText("2 unread");
  await expect(pageCount.locator(".sr-only")).toHaveText(
    "2 unread notifications",
  );
  await expect(sidebarCount.filter({ visible: true })).toContainText(
    "2 unread notifications",
  );

  const fundedNotification = page.getByRole("button", {
    name: /Unread\. Success: Escrow funded/,
  });
  await waitForHydration(fundedNotification);
  await fundedNotification.click();
  await expect(unreadStatus).toHaveText("1 unread notification");
  await expect(pageCount).toContainText("1 unread");
  await expect(pageCount.locator(".sr-only")).toHaveText(
    "1 unread notification",
  );
  await expect(sidebarCount.filter({ visible: true })).toContainText(
    "1 unread notifications",
  );
  await expect(
    page.getByRole("button", { name: /Success: Escrow funded/ }),
  ).not.toHaveAccessibleName(/Unread/);

  const title = page
    .getByRole("button", { name: /Success: Escrow funded/ })
    .locator("p")
    .first();
  await expect(title).toHaveCSS("color", "rgb(248, 250, 252)");

  await page.getByRole("button", { name: "Switch to light mode" }).click();
  await expect(page.locator("html")).not.toHaveClass(/dark/);
  await expect(title).not.toHaveCSS("color", "rgb(255, 255, 255)");
  await expect(title).not.toHaveCSS("color", "rgb(248, 250, 252)");

  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(pageCount).toContainText("1 unread");

  await page.getByRole("button", { name: "Mark all as read" }).click();
  await expect(
    page.getByRole("button", { name: "Mark all as read" }),
  ).toHaveCount(0);
  await expect(pageCount).toHaveCount(0);
  await expect(unreadStatus).toHaveText("All notifications are read");
  await expect(sidebarCount.filter({ visible: true })).toHaveCount(0);

  await page.setViewportSize({ width: 320, height: 844 });
  await expect(
    page.getByRole("heading", { name: "Notifications" }),
  ).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
    .toBeLessThanOrEqual(320);
});
