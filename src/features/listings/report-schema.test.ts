import {
  isApartmentId,
  isReportCategory,
  validateReportInput,
} from "./report-schema";

describe("listing report validation", () => {
  it("accepts only known categories", () => {
    expect(isReportCategory("safety")).toBe(true);
    expect(isReportCategory("unknown")).toBe(false);
  });

  it("requires a category and details for other reports", () => {
    expect(validateReportInput("", "")).toBe("Choose a category for this report.");
    expect(validateReportInput("other", "too short")).toBe(
      "Please provide at least 10 characters of details.",
    );
    expect(validateReportInput("other", "long enough")).toBeNull();
    expect(validateReportInput("safety", "")).toBeNull();
  });

  it("limits details to 1000 characters", () => {
    expect(validateReportInput("safety", "x".repeat(1001))).toBe(
      "Details must be 1000 characters or fewer.",
    );
  });

  it("accepts backend UUID apartment IDs, not fixture IDs", () => {
    expect(isApartmentId("123e4567-e89b-42d3-a456-426614174000")).toBe(true);
    expect(isApartmentId("1")).toBe(false);
  });
});
