import {
  toIsoDate,
  fromIsoDate,
  localToday,
  isIsoDate,
  isIsoMonth,
  addDays,
  nightsBetween,
  addMonths,
  formatDateRangeSummary,
} from "./date-only";

describe("date-only timezone-safe conversions", () => {
  it("converts Date to ISO YYYY-MM-DD using local calendar day (no UTC drift)", () => {
    const localDate = new Date(2026, 10, 1, 0, 0, 0); // Nov 1, 2026 local
    expect(toIsoDate(localDate)).toBe("2026-11-01");

    const endOfYear = new Date(2026, 11, 31, 23, 59, 59);
    expect(toIsoDate(endOfYear)).toBe("2026-12-31");

    const newYear = new Date(2027, 0, 1, 0, 0, 0);
    expect(toIsoDate(newYear)).toBe("2027-01-01");
  });

  it("converts ISO YYYY-MM-DD to local midnight Date (never UTC shift)", () => {
    const d1 = fromIsoDate("2026-11-01");
    expect(d1.getFullYear()).toBe(2026);
    expect(d1.getMonth()).toBe(10); // 0-indexed November
    expect(d1.getDate()).toBe(1);
    expect(d1.getHours()).toBe(0);

    const leapDay = fromIsoDate("2028-02-29");
    expect(leapDay.getFullYear()).toBe(2028);
    expect(leapDay.getMonth()).toBe(1); // February
    expect(leapDay.getDate()).toBe(29);
  });

  it("round-trips between Date and ISO string accurately", () => {
    const dates = [
      "2026-01-01",
      "2026-02-28",
      "2026-11-01",
      "2026-12-31",
      "2028-02-29", // Leap day
    ];
    for (const iso of dates) {
      expect(toIsoDate(fromIsoDate(iso))).toBe(iso);
    }
  });

  it("handles leap year calculations around Feb 29, 2028", () => {
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
    expect(addDays("2028-02-29", 1)).toBe("2028-03-01");
    expect(nightsBetween("2028-02-28", "2028-03-01")).toBe(2);
  });

  it("calculates nights between dates correctly across boundaries", () => {
    expect(nightsBetween("2026-11-01", "2026-11-06")).toBe(5);
    expect(nightsBetween("2026-11-28", "2026-12-03")).toBe(5);
    expect(nightsBetween("2026-12-30", "2027-01-02")).toBe(3);
  });

  it("validates isIsoDate and rejects invalid calendar days", () => {
    expect(isIsoDate("2026-11-01")).toBe(true);
    expect(isIsoDate("2028-02-29")).toBe(true);
    expect(isIsoDate("2026-02-29")).toBe(false); // 2026 is not leap year
    expect(isIsoDate("2026-02-30")).toBe(false);
    expect(isIsoDate("2026-13-01")).toBe(false);
    expect(isIsoDate("invalid")).toBe(false);
  });

  it("computes localToday and validates isIsoMonth correctly", () => {
    const today = localToday();
    expect(isIsoDate(today)).toBe(true);
    expect(isIsoMonth("2026-11")).toBe(true);
    expect(isIsoMonth("2026-13")).toBe(false);
    expect(isIsoMonth("invalid")).toBe(false);
  });

  it("adds months correctly across year boundaries", () => {
    expect(addMonths("2026-11", 2)).toBe("2027-01");
    expect(addMonths("2026-05", 3)).toBe("2026-08");
  });

  it("formats date range summary with short month and days", () => {
    expect(formatDateRangeSummary(undefined, undefined)).toBe("Any dates");
    expect(formatDateRangeSummary("2026-11-01", "2026-11-06")).toBe(
      "Nov 1 – 6",
    );
    expect(formatDateRangeSummary("2026-11-28", "2026-12-03")).toBe(
      "Nov 28 – Dec 3",
    );
  });
});

describe("addDays", () => {
  it("shifts within a month", () => {
    expect(addDays("2026-03-02", 0)).toBe("2026-03-02");
    expect(addDays("2026-03-02", 9)).toBe("2026-03-11");
  });

  it("crosses month and year boundaries in both directions", () => {
    expect(addDays("2026-01-31", 1)).toBe("2026-02-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2026-01-01", -1)).toBe("2025-12-31");
  });

  it("is unaffected by DST transitions (UTC day arithmetic)", () => {
    // A timezone with a DST jump must not lose or repeat a calendar day.
    expect(addDays("2026-03-08", 1)).toBe("2026-03-09");
    expect(addDays("2026-11-01", 1)).toBe("2026-11-02");
    expect(addDays("2026-03-08", -1)).toBe("2026-03-07");
  });
});

describe("localToday", () => {
  it("formats the local calendar day", () => {
    expect(localToday(new Date(2026, 2, 15, 12, 30))).toBe("2026-03-15");
    expect(localToday(new Date(2026, 0, 1, 0, 0))).toBe("2026-01-01");
  });

  it("uses the local day even when UTC is already tomorrow or still yesterday", () => {
    expect(localToday(new Date(2026, 5, 30, 23, 30))).toBe("2026-06-30");
    expect(localToday(new Date(2026, 5, 1, 0, 30))).toBe("2026-06-01");
  });
});

describe("isIsoDate edge cases", () => {
  it("rejects malformed or impossible dates", () => {
    expect(isIsoDate("")).toBe(false);
    expect(isIsoDate("garbage")).toBe(false);
    expect(isIsoDate("2026-3-2")).toBe(false);
    expect(isIsoDate("02-03-2026")).toBe(false);
    expect(isIsoDate("2026-02-30")).toBe(false);
    expect(isIsoDate("2026-13-01")).toBe(false);
  });

  it("accepts real calendar days", () => {
    expect(isIsoDate("2026-03-02")).toBe(true);
    expect(isIsoDate("2024-02-29")).toBe(true);
  });
});
