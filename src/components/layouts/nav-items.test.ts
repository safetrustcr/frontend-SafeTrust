import { isActive, NAV_ITEMS } from "./nav-items";

describe("isActive", () => {
  const apartmentItem = NAV_ITEMS.find((i) => i.label === "My apartments");

  it("should match /dashboard/apartments", () => {
    expect(isActive("/dashboard/apartments", apartmentItem!)).toBe(true);
  });

  it("should NOT match /dashboard/apartments/123/offers", () => {
    expect(isActive("/dashboard/apartments/123/offers", apartmentItem!)).toBe(false);
  });

  it("should match /dashboard/apartments/123/edit", () => {
    expect(isActive("/dashboard/apartments/123/edit", apartmentItem!)).toBe(true);
  });
});
