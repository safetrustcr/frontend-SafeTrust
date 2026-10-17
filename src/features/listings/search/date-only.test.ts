import { addDays, isIsoDate, localToday } from "./date-only";

describe("addDays", () => {
  it("shifts within a month", () => {
    expect(addDays("2026-03-02", 0)).toBe("2026-03-02");
    expect(addDays("2026-03-02", 9)).toBe("2026-03-11");
  });

  it("crosses month and year boundaries", () => {
    expect(addDays("2026-01-31", 1)).toBe("2026-02-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2026-01-01", -1)).toBe("2025-12-31");
  });

  it("handles leap days", () => {
    expect(addDays("2024-02-28", 1)).toBe("2024-02-29");
    expect(addDays("2026-02-28", 1)).toBe("2026-03-01");
  });

  it("is unaffected by DST transitions (UTC day arithmetic)", () => {
    // A timezone with a DST jump must not lose or repeat a calendar day.
    expect(addDays("2026-03-08", 1)).toBe("2026-03-09");
    expect(addDays("2026-11-01", 1)).toBe("2026-11-02");
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

describe("isIsoDate", () => {
  it("accepts real calendar days", () => {
    expect(isIsoDate("2026-03-02")).toBe(true);
    expect(isIsoDate("2024-02-29")).toBe(true);
  });

  it("rejects malformed or impossible dates", () => {
    expect(isIsoDate("")).toBe(false);
    expect(isIsoDate("garbage")).toBe(false);
    expect(isIsoDate("2026-3-2")).toBe(false);
    expect(isIsoDate("02-03-2026")).toBe(false);
    expect(isIsoDate("2026-02-30")).toBe(false);
    expect(isIsoDate("2026-13-01")).toBe(false);
  });
});
