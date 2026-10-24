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
      new Date(2026, 5, 15),
      new Date(2026, 11, 31, 14, 30),
      new Date(2027, 0, 1, 8, 15),
      new Date(2028, 1, 29), // leap year
    ];
    dates.forEach((date) => {
      const iso = toIsoDate(date);
      const roundTripped = fromIsoDate(iso);
      expect(roundTripped.getFullYear()).toBe(date.getFullYear());
      expect(roundTripped.getMonth()).toBe(date.getMonth());
      expect(roundTripped.getDate()).toBe(date.getDate());
    });
  });

  describe("isIsoDate", () => {
    it.each(["2026-01-01", "1999-12-31", "2028-02-29"])(
      "accepts valid ISO date %s",
      (value) => {
        expect(isIsoDate(value)).toBe(true);
      },
    );

    it.each([
      "2026-1-1",
      "26-01-01",
      "2026/01/01",
      "2026-13-01",
      "2026-02-30",
      "2027-02-29", // not a leap year
      "not-a-date",
      "",
    ])("rejects %s", (value) => {
      expect(isIsoDate(value)).toBe(false);
    });
  });

  describe("isIsoMonth", () => {
    it.each(["2026-01", "2026-12", "1999-06"])(
      "accepts valid ISO month %s",
      (value) => {
        expect(isIsoMonth(value)).toBe(true);
      },
    );

    it.each(["2026-1", "26-01", "2026/01", "2026-13", "2026-00", "abc"])(
      "rejects %s",
      (value) => {
        expect(isIsoMonth(value)).toBe(false);
      },
    );
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

  describe("toIsoDate", () => {
    it("formats the local calendar day with zero padding", () => {
      expect(toIsoDate(new Date(2026, 0, 5, 23, 30))).toBe("2026-01-05");
      expect(toIsoDate(new Date(2026, 11, 31, 0, 5))).toBe("2026-12-31");
    });
  });

  describe("localToday", () => {
    it("reads the local calendar day, not the UTC day", () => {
      expect(localToday(new Date(2026, 0, 5, 23, 30))).toBe("2026-01-05");
      expect(localToday(new Date(2026, 11, 31, 0, 5))).toBe("2026-12-31");
      expect(localToday(new Date(2026, 8, 15))).toBe("2026-09-15");
    });
  });

  describe("formatDateRangeSummary", () => {
    it("returns 'Any dates' when checkIn or checkOut missing", () => {
      expect(formatDateRangeSummary()).toBe("Any dates");
      expect(formatDateRangeSummary("2026-11-01")).toBe("Any dates");
      expect(formatDateRangeSummary(undefined, "2026-11-05")).toBe("Any dates");
    });

    it("formats same month and year", () => {
      expect(formatDateRangeSummary("2026-11-01", "2026-11-05")).toBe(
        "Nov 1 – 5",
      );
    });

    it("formats different months same year", () => {
      expect(formatDateRangeSummary("2026-11-28", "2026-12-02")).toBe(
        "Nov 28 – Dec 2",
      );
    });

    it("formats different years", () => {
      expect(formatDateRangeSummary("2026-12-30", "2027-01-02")).toBe(
        "Dec 30, 2026 – Jan 2, 2027",
      );
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
