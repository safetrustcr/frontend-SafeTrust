import {
  addDays,
  addMonths,
  isIsoDate,
  isIsoMonth,
  localToday,
  nightsBetween,
} from "./date-only";

// Every helper must be timezone-independent: run this suite with
// TZ=America/Costa_Rica (UTC-6) and TZ=Asia/Tokyo (UTC+9) and expect the
// same results. Never parse ISO dates with `new Date("YYYY-MM-DD")`: that
// is UTC midnight, still the previous day in Costa Rica.
describe("date-only", () => {
  describe("isIsoDate", () => {
    it.each([
      "2026-10-15",
      "2026-02-28",
      "2028-02-29", // leap day
      "2026-12-31",
    ])("accepts %s", (value) => {
      expect(isIsoDate(value)).toBe(true);
    });

    it.each([
      ["2026-02-30", "impossible calendar day"],
      ["2026-13-01", "month out of range"],
      ["2026-00-10", "month zero"],
      ["2026-04-31", "30-day month has no 31st"],
      ["2027-02-29", "not a leap year"],
      ["2026-1-05", "single-digit month"],
      ["26-10-15", "two-digit year"],
      ["2026-11-01T00:00:00Z", "timestamp, not a calendar date"],
      ["2026/11/01", "wrong separator"],
      ["", "empty string"],
    ])("rejects %s (%s)", (value) => {
      expect(isIsoDate(value)).toBe(false);
    });
  });

  describe("isIsoMonth", () => {
    it.each(["2026-10", "2026-11", "2026-12", "2027-01"])(
      "accepts %s",
      (value) => {
        expect(isIsoMonth(value)).toBe(true);
      },
    );

    it.each([
      "2026-00",
      "2026-13",
      "2026-1",
      "26-11",
      "2026-11-01",
      "2026-13-01",
      "november-2026",
    ])("rejects %s", (value) => {
      expect(isIsoMonth(value)).toBe(false);
    });
  });

  describe("addDays", () => {
    it.each([
      ["2026-10-15", 1, "2026-10-16"],
      ["2026-10-31", 1, "2026-11-01"],
      ["2026-12-31", 1, "2027-01-01"],
      ["2028-02-28", 1, "2028-02-29"], // leap year
      ["2027-02-28", 1, "2027-03-01"], // non-leap year
      ["2026-10-15", -1, "2026-10-14"],
      ["2026-11-01", -1, "2026-10-31"],
      ["2026-10-15", 0, "2026-10-15"],
      ["2026-10-15", 400, "2027-11-19"],
    ])("addDays(%s, %i) === %s", (iso, days, expected) => {
      expect(addDays(iso, days)).toBe(expected);
    });
  });

  describe("nightsBetween", () => {
    it.each([
      ["2026-11-01", "2026-11-06", 5],
      ["2026-11-01", "2026-11-02", 1],
      ["2026-11-01", "2026-11-01", 0],
      ["2026-12-31", "2027-01-01", 1],
      ["2028-02-28", "2028-03-01", 2], // leap year
      ["2026-11-06", "2026-11-01", -5], // reversed
      ["2026-10-15", "2027-01-13", 90],
    ])("nightsBetween(%s, %s) === %i", (start, end, nights) => {
      expect(nightsBetween(start, end)).toBe(nights);
    });
  });

  describe("addMonths", () => {
    it.each([
      ["2026-10", 0, "2026-10"],
      ["2026-10", 1, "2026-11"],
      ["2026-10", 2, "2026-12"],
      ["2026-10", 3, "2027-01"],
      ["2026-10", 11, "2027-09"],
      ["2026-01", -1, "2025-12"],
    ])("addMonths(%s, %i) === %s", (month, count, expected) => {
      expect(addMonths(month, count)).toBe(expected);
    });
  });

  describe("localToday", () => {
    it("reads the local calendar day, not the UTC day", () => {
      expect(localToday(new Date(2026, 0, 5, 23, 30))).toBe("2026-01-05");
      expect(localToday(new Date(2026, 11, 31, 0, 5))).toBe("2026-12-31");
      expect(localToday(new Date(2026, 8, 15))).toBe("2026-09-15");
    });
  });

  it("treats a UTC-midnight ISO date as the same calendar day in any TZ", () => {
    // In Costa Rica (UTC-6) `new Date("2026-11-01").getDate()` is 31; these
    // helpers must not depend on that, or Back/Forward links break by TZ.
    expect(isIsoDate("2026-11-01")).toBe(true);
    expect(addDays("2026-11-01", 1)).toBe("2026-11-02");
    expect(nightsBetween("2026-11-01", "2026-11-02")).toBe(1);
  });
});
