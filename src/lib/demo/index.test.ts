import { generateMockEscrows } from "./index";

describe("generateMockEscrows", () => {
  it("returns stable, labelled demo data for the same user", () => {
    const first = generateMockEscrows(12, "user-one");
    const refreshed = generateMockEscrows(12, "user-one");

    expect(refreshed).toEqual(first);
    expect(first.every((escrow) => escrow.isDemo)).toBe(true);
    expect(first[0]).toMatchObject({
      contractId: "DEMO-0001",
      marker: "DEMO",
      metadata: { counterparty: "Demo host" },
    });
  });

  it("generates different histories for different users", () => {
    expect(generateMockEscrows(12, "user-one")).not.toEqual(
      generateMockEscrows(12, "user-two"),
    );
  });
});
