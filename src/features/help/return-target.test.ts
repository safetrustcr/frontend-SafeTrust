import { safeRentReturn } from "./return-target";

describe("safeRentReturn", () => {
  it("preserves a filtered Rent destination and its query string", () => {
    expect(safeRentReturn("/rent?location=San%20Jose&guests=2")).toBe(
      "/rent?location=San%20Jose&guests=2",
    );
  });

  it("falls back to Rent for an unsafe destination", () => {
    expect(safeRentReturn("https://example.com")).toBe("/rent");
  });
});
