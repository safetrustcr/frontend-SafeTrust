import {
  test,
  expect,
  expectHealthyPage,
  expectPathname,
  waitForHydration,
} from "./fixtures";
import { MOCK_USERS, mockFirebaseAuth } from "./support/mock-auth";

test.use({ video: "on" });

test.beforeEach(async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  if (testInfo.project.name === "desktop") {
    await page.addInitScript(() =>
      localStorage.setItem("safetrust-theme", "dark"),
    );
  }
  await mockFirebaseAuth(page);
  await page.goto("/login?redirect=/dashboard/profile");
  await waitForHydration(page.locator("form"));
  await page.getByLabel("Email", { exact: true }).fill(MOCK_USERS.host.email);
  await page
    .getByLabel("Password", { exact: true })
    .fill(MOCK_USERS.host.password);
  await page.getByRole("button", { name: "Login", exact: true }).click();
  await expectPathname(page, "/dashboard/profile");
});

test("profile sidebar opens the overview and a property's existing applicant table", async ({
  page,
}, testInfo) => {
  await page
    .getByRole("navigation", { name: "Profile settings" })
    .getByRole("link", { name: "Offers", exact: true })
    .click();
  await expectPathname(page, "/dashboard/apartments/offers");
  await expect(
    page.getByRole("heading", { name: "Offers", exact: true }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("navigation", { name: "Profile settings" })
      .getByRole("link", { name: "Offers", exact: true }),
  ).toHaveAttribute("aria-current", "page");

  const main = page.getByRole("main");
  const list = main.getByRole("list", { name: "Property offers" });
  await expect(list.getByRole("listitem")).toHaveCount(6);
  await expect(list.getByText("No offers yet", { exact: true })).toHaveCount(5);
  await expect(main.getByText("Demo", { exact: true })).toBeVisible();
  await expect(main.getByRole("table")).toHaveCount(0);
  await expect(main.getByText(/Diego Duarte|6483252|XR6/)).toHaveCount(0);
  await page.screenshot({
    path: testInfo.outputPath("overview.png"),
    fullPage: true,
  });
  await expectHealthyPage(page);

  // The whole row must work with a keyboard as well as a pointer.
  const property = list.getByRole("link", {
    name: /La Sabana Sur Studio.*10 offers/,
  });
  await property.focus();
  await expect(property).toBeFocused();
  await page.keyboard.press("Enter");
  await expectPathname(page, "/dashboard/apartments/1/offers");
  await expect(
    main.getByRole("heading", { name: "La Sabana Sur Studio" }),
  ).toBeVisible();
  const isMobile = testInfo.project.name === "mobile";
  await expect(main.getByRole("table")).toBeVisible({ visible: !isMobile });
  await expect(main.getByText(/Diego Duarte/)).toHaveCount(10);
  await expect(
    main
      .getByRole("button", { name: /^Accept offer from Diego Duarte/ })
      .filter({ visible: true }),
  ).toHaveCount(5);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(page.viewportSize()!.width);
  await page.screenshot({
    path: testInfo.outputPath("property-offers.png"),
    fullPage: true,
  });
  await expect(main.getByText("Demo", { exact: true })).toBeVisible();
  await expect(
    main
      .getByRole("navigation", { name: "Profile settings" })
      .getByRole("link", { name: "Offers", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await expectHealthyPage(page);

  await main.getByRole("link", { name: "Back to offers" }).click();
  await expectPathname(page, "/dashboard/apartments/offers");
  await main
    .getByRole("link", { name: /Los Yoses Apartment.*No offers yet/ })
    .click();
  await expectPathname(page, "/dashboard/apartments/2/offers");
  await expect(
    main.getByRole("heading", { name: "Los Yoses Apartment" }),
  ).toBeVisible();
  await expect(
    main.getByRole("heading", { name: "No offers yet" }),
  ).toBeVisible();
  await expect(main.getByText("Property not found")).toHaveCount(0);
  await expectHealthyPage(page);
});

test("an unknown UUID stays on its URL and offers a way back", async ({
  page,
}, testInfo) => {
  const pathname =
    "/dashboard/apartments/3f1c2b0a-a246-4519-a8ca-b94494429623/offers";
  await page.goto(pathname);
  await expect(
    page.getByRole("heading", { name: "Property not found" }),
  ).toBeVisible();
  await expectPathname(page, pathname);
  await page.screenshot({
    path: testInfo.outputPath("property-not-found.png"),
    fullPage: true,
  });
  await expect(
    page
      .getByRole("navigation", { name: "Profile settings" })
      .getByRole("link", { name: "Offers", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await expectHealthyPage(page);
  await page.getByRole("link", { name: "Back to offers" }).click();
  await expectPathname(page, "/dashboard/apartments/offers");
  await expect(
    page.getByRole("list", { name: "Property offers" }),
  ).toBeVisible();
});

test("offers cards keep Accept and Reject in reach at 360px", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto("/dashboard/apartments/1/offers");
  const main = page.getByRole("main");
  const accept = main
    .getByRole("button", { name: /^Accept offer from / })
    .filter({ visible: true })
    .first();
  const reject = main
    .getByRole("button", { name: /^Reject offer from / })
    .filter({ visible: true })
    .first();
  await accept.scrollIntoViewIfNeeded();
  for (const button of [accept, reject]) {
    await expect(button).toBeVisible();
    const box = (await button.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(360);
    expect(box.height).toBeGreaterThanOrEqual(44);
  }
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(360);
});
