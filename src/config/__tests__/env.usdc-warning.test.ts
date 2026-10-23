/* eslint-disable @typescript-eslint/no-require-imports */
const TESTNET_USDC = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";
const MAINNET_USDC = "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN";
const CUSTOM = "GAK6DAPPQDDPSQRXTLWD6SGCOYAXWYP7XKSQNMEIZW6TSW7GKVASZIAH";

describe("NEXT_PUBLIC_USDC_ISSUER startup check", () => {
  const env = process.env as Record<string, string | undefined>;
  const saved = {
    NODE_ENV: env.NODE_ENV,
    NEXT_PUBLIC_USDC_ISSUER: env.NEXT_PUBLIC_USDC_ISSUER,
    NEXT_PUBLIC_TRUSTLESS_NETWORK: env.NEXT_PUBLIC_TRUSTLESS_NETWORK,
  };
  let warn: jest.SpyInstance;

  beforeEach(() => {
    warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    env.NODE_ENV = "development";
    env.NEXT_PUBLIC_TRUSTLESS_NETWORK = "testnet";
  });
  afterEach(() => {
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) delete env[key];
      else env[key] = value;
    }
    warn.mockRestore();
  });

  const load = (issuer: string | undefined) => {
    // process.env stores strings: assigning undefined would set "undefined".
    if (issuer === undefined) delete env.NEXT_PUBLIC_USDC_ISSUER;
    else env.NEXT_PUBLIC_USDC_ISSUER = issuer;
    jest.isolateModules(() => require("../env"));
  };

  it("is silent when unset or matching the network", () => {
    load(undefined);
    load(TESTNET_USDC);
    expect(warn).not.toHaveBeenCalled();
  });

  it("warns about the other network's issuer, naming the active network", () => {
    load(MAINNET_USDC);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toMatch(
      /mainnet USDC issuer, but the app runs on testnet/,
    );
  });

  it("notes a valid custom issuer, which is still honored", () => {
    load(CUSTOM);
    expect(warn.mock.calls[0][0]).toMatch(/Using the override/);
  });

  it("rejects a malformed issuer at startup", () => {
    expect(() => load("not-a-key")).toThrow(/Invalid Stellar public key/);
  });

  it("never warns outside development", () => {
    env.NODE_ENV = "production";
    load(MAINNET_USDC);
    expect(warn).not.toHaveBeenCalled();
  });
});
