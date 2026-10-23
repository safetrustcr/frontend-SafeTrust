import { assetsFor, usdcFor } from "@/lib/stellar/assets";
import { trustlineOptionsFor } from "../trustlines";

const OVERRIDE = "GAK6DAPPQDDPSQRXTLWD6SGCOYAXWYP7XKSQNMEIZW6TSW7GKVASZIAH";

describe("trustlineOptionsFor (legacy initialize-escrow forms)", () => {
  it.each(["testnet", "mainnet"] as const)(
    "lists only %s assets, in the vendored option shape",
    (network) => {
      const options = trustlineOptionsFor(network);
      const assets = assetsFor(network);

      expect(options).toHaveLength(assets.length);
      const usdc = usdcFor(network)!;
      expect(options.find((o) => o.label === "USDC")).toEqual({
        value: usdc.contractId,
        label: "USDC",
        issuer: usdc.issuer,
      });
      const issuers = new Set(assets.map((asset) => asset.issuer));
      for (const option of options) expect(issuers).toContain(option.issuer);
    },
  );

  it("falls back to the issuer as value when no contract id is documented", () => {
    expect(
      trustlineOptionsFor("mainnet").find((o) => o.label === "EURC"),
    ).toEqual({
      value: "GDHU6WRG4IEQXM5NZ4BMPKOXHW76MZM4Y2IEMFDVXBSDP6SJY4ITNPP2",
      label: "EURC",
      issuer: "GDHU6WRG4IEQXM5NZ4BMPKOXHW76MZM4Y2IEMFDVXBSDP6SJY4ITNPP2",
    });
    expect(
      trustlineOptionsFor("testnet").map((option) => option.label),
    ).toEqual(["USDC"]);
  });

  it("applies a valid USDC issuer override, like the checkout", () => {
    const usdc = trustlineOptionsFor("mainnet", OVERRIDE).find(
      (o) => o.label === "USDC",
    );
    expect(usdc?.issuer).toBe(OVERRIDE);
    expect(usdc?.value).toBe(usdcFor("mainnet")!.contractId);
  });
});

describe("trustlineOptions", () => {
  const original = process.env.NEXT_PUBLIC_TRUSTLESS_NETWORK;
  afterEach(() => {
    process.env.NEXT_PUBLIC_TRUSTLESS_NETWORK = original;
  });

  it.each(["testnet", "mainnet"] as const)(
    "follows the active network (%s)",
    (network) => {
      process.env.NEXT_PUBLIC_TRUSTLESS_NETWORK = network;
      jest.isolateModules(() => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { trustlineOptions } = require("../trustlines");
        expect(trustlineOptions).toEqual(trustlineOptionsFor(network));
      });
    },
  );
});
