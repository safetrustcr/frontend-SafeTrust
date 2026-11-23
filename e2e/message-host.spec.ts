import {
  test,
  expect,
  expectHealthyPage,
  expectPathname,
  waitForHydration,
} from "./fixtures";
import { MOCK_USERS, mockFirebaseAuth } from "./support/mock-auth";

const guest = MOCK_USERS.guest;
const threadPath = (listingId: string) =>
  `/guest/messages/demo-${listingId}-${guest.uid}`;

async function login(page: import("@playwright/test").Page) {
  const form = page.locator("form");
  await waitForHydration(form);
  await expect(form).toHaveAttribute("data-hydrated", "true");
  await page.getByLabel("Email").fill(guest.email);
  await page.getByLabel("Password").fill(guest.password);
  await page.getByRole("button", { name: "Login", exact: true }).click();
}

test.describe("Message host", () => {
  test.beforeEach(async ({ page }) => {
    await mockFirebaseAuth(page);
  });

  test("signed out: Message host → login → that listing's conversation", async ({
    page,
    isMobile,
  }) => {
    await page.goto("/rent/1");
    const messageHost = page.locator('a[href="/guest/messages/new?listing=1"]');
    await expect(messageHost).toHaveText("Message host");
    await messageHost.click();

    await expect(page).toHaveURL(
      /\/login\?redirect=%2Fguest%2Fmessages%2Fnew%3Flisting%3D1$/,
    );
    await login(page);

    await expectPathname(page, threadPath("1"));
    await expect(
      page.getByRole("link", {
        name: "Casa Níspero, Barrio Escalante",
        exact: true,
      }),
    ).toHaveAttribute("href", "/rent/1");
    await expect(
      page.getByRole("heading", { level: 2, name: "Alberto Casas" }),
    ).toBeVisible();

    // A fresh load of the thread URL waits for auth instead of 404ing.
    await page.reload();
    await expect(
      page.getByRole("heading", { level: 2, name: "Alberto Casas" }),
    ).toBeVisible();
    await expect(page.getByText("We couldn't find that page")).toHaveCount(0);

    // The guest inbox has the site header, not the host dashboard sidebar.
    await expect(page.getByRole("link", { name: "Hotels" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "My apartments" })).toHaveCount(
      0,
    );

    if (isMobile) {
      await page.getByRole("link", { name: "Back to messages" }).click();
      await expectPathname(page, "/guest/messages");
      await expect(
        page.getByRole("link", { name: /Casa Níspero/ }),
      ).toBeVisible();
    } else {
      const list = page.getByRole("complementary", { name: "Conversations" });
      await expect(
        list.getByRole("link", { name: /Casa Níspero/ }),
      ).toHaveAttribute("aria-current", "page");
    }
    await expectHealthyPage(page);
  });

  test("unknown listing goes to the inbox without creating anything", async ({
    page,
  }) => {
    await page.goto("/login?redirect=/guest/messages/new?listing=999");
    await login(page);

    await expectPathname(page, "/guest/messages");
    await expect(page.getByRole("link", { name: /demo-999/ })).toHaveCount(0);
  });

  test("someone else's conversation is a 404", async ({ page }) => {
    await page.goto("/login?redirect=/guest/messages/demo-1-someone-else");
    await login(page);

    await expectPathname(page, "/guest/messages/demo-1-someone-else");
    await expect(
      page.getByRole("heading", { name: "We couldn't find that page" }),
    ).toBeVisible();
  });

  test("an old dashboard Message host link opens the thread in the guest inbox", async ({
    page,
  }) => {
    await page.goto("/login?redirect=/dashboard/messages/new?listing=1");
    await login(page);

    await expectPathname(page, threadPath("1"));
    await expect(
      page.getByRole("heading", { level: 2, name: "Alberto Casas" }),
    ).toBeVisible();
  });
});
