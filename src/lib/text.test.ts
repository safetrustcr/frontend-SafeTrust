import { normalizeSearchText } from "./text";

describe("normalizeSearchText", () => {
  it("folds accents and case", () => {
    expect(normalizeSearchText("San José")).toBe("san jose");
    expect(normalizeSearchText("LIMÓN")).toBe("limon");
    expect(normalizeSearchText("Río Segundo")).toBe("rio segundo");
  });

  it("collapses and trims whitespace", () => {
    expect(normalizeSearchText("  san   jose \t")).toBe("san jose");
  });
});
