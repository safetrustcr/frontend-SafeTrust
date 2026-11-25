import {
  STELLAR_ASSETS,
  STELLAR_CONTRACT_PATTERN,
  STELLAR_ISSUER_PATTERN,
  assetsFor,
  usdcFor,
  usdcIssuerOverrideWarning,
  usdcNotConfiguredMessage,
  type StellarNetworkName,
} from "./assets";

const NETWORKS: StellarNetworkName[] = ["testnet", "mainnet"];
const TESTNET_USDC = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";
const MAINNET_USDC = "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN";
// A valid account id that is no known issuer.
const OVERRIDE = "GAK6DAPPQDDPSQRXTLWD6SGCOYAXWYP7XKSQNMEIZW6TSW7GKVASZIAH";

describe("STELLAR_ASSETS", () => {
  it("uses classic account ids for every issuer", () => {
    for (const asset of STELLAR_ASSETS) {
      expect(asset.issuer).toMatch(STELLAR_ISSUER_PATTERN);
    }
  });

  it("uses Soroban contract ids for every documented contract", () => {
    for (const asset of STELLAR_ASSETS) {
      if (asset.contractId !== undefined) {
        expect(asset.contractId).toMatch(STELLAR_CONTRACT_PATTERN);
      }
    }
  });

  it("never reuses an issuer or contract across networks", () => {
    for (const asset of STELLAR_ASSETS) {
      const elsewhere = STELLAR_ASSETS.filter(
        (other) => other.network !== asset.network,
      );
      expect(elsewhere.map((other) => other.issuer)).not.toContain(
        asset.issuer,
      );
      if (asset.contractId) {
        expect(elsewhere.map((other) => other.contractId)).not.toContain(
          asset.contractId,
        );
      }
    }
  });

  it.each(NETWORKS)("has exactly one USDC on %s", (network) => {
    expect(
      STELLAR_ASSETS.filter(
        (asset) => asset.network === network && asset.code === "USDC",
      ),
    ).toHaveLength(1);
  });

  it("names an official source and Stellar's 7-decimal scale for every asset", () => {
    for (const asset of STELLAR_ASSETS) {
      expect(asset.source).toMatch(/^https:\/\/developers\.stellar\.org\//);
      expect(asset.scale).toBe(10_000_000);
    }
  });

  it("keeps EURC only where its issuer is verified (mainnet)", () => {
    const eurc = STELLAR_ASSETS.filter((asset) => asset.code === "EURC");
    expect(eurc).toEqual([
      expect.objectContaining({
        network: "mainnet",
        issuer: "GDHU6WRG4IEQXM5NZ4BMPKOXHW76MZM4Y2IEMFDVXBSDP6SJY4ITNPP2",
        source:
          "https://developers.stellar.org/docs/tokens/anatomy-of-an-asset",
      }),
    ]);
  });

  it("cannot be mutated at runtime", () => {
    expect(Object.isFrozen(STELLAR_ASSETS)).toBe(true);
  });
});

describe("assetsFor", () => {
  it.each(NETWORKS)("returns only %s assets", (network) => {
    const assets = assetsFor(network);
    expect(assets.length).toBeGreaterThan(0);
    expect(assets.every((asset) => asset.network === network)).toBe(true);
  });
});

describe("usdcFor", () => {
  it.each([
    ["testnet", TESTNET_USDC],
    ["mainnet", MAINNET_USDC],
  ] as const)("selects the %s issuer", (network, issuer) => {
    expect(usdcFor(network)).toMatchObject({ code: "USDC", network, issuer });
  });

  it("honors a valid issuer override without touching the contract id", () => {
    const usdc = usdcFor("testnet", ` ${OVERRIDE} `);
    expect(usdc?.issuer).toBe(OVERRIDE);
    expect(usdc?.contractId).toBe(usdcFor("testnet")?.contractId);
    // The canonical list itself is unchanged.
    expect(usdcFor("testnet")?.issuer).toBe(TESTNET_USDC);
  });

  it.each([
    [
      "a contract id",
      "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA",
    ],
    ["lowercase", OVERRIDE.toLowerCase()],
    ["too short", OVERRIDE.slice(0, 40)],
    ["blank", "   "],
  ])("ignores an invalid override (%s)", (_, override) => {
    expect(usdcFor("mainnet", override)?.issuer).toBe(MAINNET_USDC);
  });

  it("returns null for a network without USDC", () => {
    expect(usdcFor("futurenet" as StellarNetworkName)).toBeNull();
    expect(usdcFor("futurenet" as StellarNetworkName, OVERRIDE)).toBeNull();
    expect(usdcNotConfiguredMessage("mainnet")).toBe(
      "USDC isn't configured for mainnet. Contact support.",
    );
  });
});

describe("usdcIssuerOverrideWarning", () => {
  it("stays quiet when unset or equal to the network's issuer", () => {
    expect(usdcIssuerOverrideWarning("testnet", undefined)).toBeNull();
    expect(usdcIssuerOverrideWarning("testnet", "")).toBeNull();
    expect(usdcIssuerOverrideWarning("testnet", TESTNET_USDC)).toBeNull();
    expect(usdcIssuerOverrideWarning("mainnet", MAINNET_USDC)).toBeNull();
  });

  it("flags a malformed value", () => {
    expect(usdcIssuerOverrideWarning("testnet", "not-a-key")).toMatch(
      /not a Stellar account id .*ignored on testnet/,
    );
  });

  it.each([
    ["testnet", MAINNET_USDC, "mainnet"],
    ["mainnet", TESTNET_USDC, "testnet"],
  ] as const)(
    "flags the other network's issuer on %s",
    (network, override, other) => {
      const warning = usdcIssuerOverrideWarning(network, override);
      expect(warning).toContain(`the ${other} USDC issuer`);
      expect(warning).toContain(`runs on ${network}`);
      expect(warning).toContain(usdcFor(network)!.issuer);
    },
  );

  it("notes a valid custom issuer that is honored", () => {
    expect(usdcIssuerOverrideWarning("mainnet", OVERRIDE)).toMatch(
      /differs from Circle's mainnet USDC issuer .*Using the override/,
    );
  });
});
