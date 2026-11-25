import {
  EMPTY_FILTERS,
  applyEscrowFilters,
  countActiveFilters,
  isAmountRangeValid,
  totalsByAsset,
  type EscrowFilters,
} from "./escrow-filters";
import type { EscrowData } from "@/types/dashboard";

type MakeOver = Omit<Partial<EscrowData>, "metadata"> & {
  id: string;
  metadata?: Record<string, unknown>;
};

const make = (over: MakeOver): EscrowData =>
  ({
    status: "pending",
    amount: 100,
    asset: { code: "USDC" },
    createdAt: "2025-01-01T00:00:00Z",
    metadata: {},
    ...over,
  }) as unknown as EscrowData;

const escrows: EscrowData[] = [
  make({
    id: "a",
    status: "pending",
    amount: 50,
    createdAt: "2025-01-01T00:00:00Z",
    metadata: {
      checkInDate: "2025-02-10T15:00:00Z",
      checkOutDate: "2025-02-12T10:00:00Z",
    },
  }),
  make({
    id: "b",
    status: "funded",
    amount: 200,
    createdAt: "2025-01-03T00:00:00Z",
    metadata: {
      checkInDate: "2025-02-20T09:00:00Z",
      checkOutDate: "2025-02-22T10:00:00Z",
    },
  }),
  make({
    id: "c",
    status: "completed",
    amount: 120,
    createdAt: "2025-01-02T00:00:00Z",
    metadata: {
      checkInDate: "2025-03-01T00:00:00Z",
      checkOutDate: "2025-03-05T00:00:00Z",
    },
  }),
  make({
    id: "d",
    status: "cancelled",
    amount: 10,
    createdAt: "2025-01-04T00:00:00Z",
    metadata: {},
  }),
  make({
    id: "e",
    status: "check_in_approved",
    amount: 75,
    createdAt: "2025-01-05T00:00:00Z",
    metadata: {},
  }),
  make({
    id: "f",
    status: "check_out_approved",
    amount: 300,
    createdAt: "2025-01-06T00:00:00Z",
    metadata: {},
  }),
];

const ids = (xs: EscrowData[]) => xs.map((x) => x.id);
const withF = (p: Partial<EscrowFilters>): EscrowFilters => ({
  ...EMPTY_FILTERS,
  ...p,
});

describe("applyEscrowFilters: statuses", () => {
  it.each([
    ["pending", ["a"]],
    ["funded", ["b"]],
    ["completed", ["c"]],
    ["cancelled", ["d"]],
    ["check_in_approved", ["e"]],
    ["check_out_approved", ["f"]],
  ] as const)("filters by %s", (status, expected) => {
    const out = applyEscrowFilters(escrows, withF({ statuses: [status] }));
    expect(ids(out).sort()).toEqual([...expected].sort());
  });

  it("returns everything when no status is selected", () => {
    expect(applyEscrowFilters(escrows, EMPTY_FILTERS)).toHaveLength(
      escrows.length,
    );
  });
});

describe("applyEscrowFilters: amounts", () => {
  it("includes boundary values for min and max", () => {
    const out = applyEscrowFilters(
      escrows,
      withF({ minAmount: 75, maxAmount: 200 }),
    );
    expect(ids(out).sort()).toEqual(["b", "e", "c"].sort());
  });

  it("ignores amount filter and does not filter when min > max", () => {
    const f = withF({ minAmount: 500, maxAmount: 10 });
    expect(isAmountRangeValid(f)).toBe(false);
    expect(applyEscrowFilters(escrows, f)).toHaveLength(escrows.length);
  });
});

describe("applyEscrowFilters: inclusive dates", () => {
  const original = process.env.TZ;
  afterEach(() => {
    process.env.TZ = original;
  });

  it.each(["America/Costa_Rica", "UTC"])(
    "includes a check-in later on the 'to' day (TZ=%s)",
    (tz) => {
      process.env.TZ = tz;
      const out = applyEscrowFilters(
        escrows,
        withF({ checkIn: { from: null, to: "2025-02-10" } }),
      );
      expect(ids(out)).toContain("a");
      expect(ids(out)).not.toContain("b");
    },
  );

  it.each(["America/Costa_Rica", "UTC"])(
    "includes the 'from' day inclusively (TZ=%s)",
    (tz) => {
      process.env.TZ = tz;
      const out = applyEscrowFilters(
        escrows,
        withF({ checkIn: { from: "2025-02-20", to: null } }),
      );
      // "b" checks in on the 'from' day itself; "c" is later, so both match.
      expect(ids(out)).toEqual(["b", "c"]);
    },
  );

  it("excludes escrows without a check-in date when a range is set", () => {
    const out = applyEscrowFilters(
      escrows,
      withF({ checkIn: { from: "2025-01-01", to: null } }),
    );
    expect(ids(out)).not.toContain("d");
  });
});

describe("applyEscrowFilters: sorting", () => {
  it("sorts recent (newest first)", () => {
    const out = applyEscrowFilters(escrows, withF({ sort: "recent" }));
    expect(ids(out)[0]).toBe("f");
  });

  it("sorts amount-high", () => {
    const out = applyEscrowFilters(escrows, withF({ sort: "amount-high" }));
    expect(ids(out)[0]).toBe("f");
  });

  it("sorts amount-low", () => {
    const out = applyEscrowFilters(escrows, withF({ sort: "amount-low" }));
    expect(ids(out)[0]).toBe("d");
  });

  it("sorts checkin (earliest first, missing dates last)", () => {
    const out = applyEscrowFilters(escrows, withF({ sort: "checkin" }));
    expect(ids(out)[0]).toBe("d");
    expect(ids(out).slice(-1)[0]).toBe("c");
  });

  it("does not mutate the input array", () => {
    const copy = [...escrows];
    applyEscrowFilters(escrows, withF({ sort: "amount-low" }));
    expect(escrows).toEqual(copy);
  });
});

describe("countActiveFilters", () => {
  it("is zero for defaults", () => {
    expect(countActiveFilters(EMPTY_FILTERS)).toBe(0);
  });

  it("ignores sort", () => {
    expect(countActiveFilters(withF({ sort: "amount-high" }))).toBe(0);
  });

  it("counts each active filter", () => {
    expect(
      countActiveFilters(
        withF({
          statuses: ["funded", "pending"],
          minAmount: 1,
          checkIn: { from: "2025-01-01", to: "2025-01-31" },
        }),
      ),
    ).toBe(5);
  });
});

describe("totalsByAsset", () => {
  it("never sums different assets together", () => {
    const mixed = [
      make({ id: "x", amount: 100, asset: { code: "XLM" } as never }),
      make({ id: "y", amount: 100, asset: { code: "USDC" } as never }),
      make({ id: "z", amount: 20, asset: { code: "USDC" } as never }),
    ];
    const totals = totalsByAsset(mixed);
    expect(totals).toEqual(
      expect.arrayContaining([
        { asset: "XLM", amount: 100 },
        { asset: "USDC", amount: 120 },
      ]),
    );
    expect(totals).toHaveLength(2);
  });

  it("returns an empty list for no escrows", () => {
    expect(totalsByAsset([])).toEqual([]);
  });
});
