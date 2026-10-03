import {
  ALBEDO_ID,
  FREIGHTER_ID,
  WalletNetwork,
  type ISupportedWallet,
} from "@creit.tech/stellar-wallets-kit";
import { getNetworkDetails, isAllowed } from "@stellar/freighter-api";

// The installed @creit.tech/stellar-wallets-kit build is ESM-only, which
// Jest's default CJS transform can't parse from node_modules. Mocking it
// keeps this suite isolated from that and from real wallet extensions.
jest.mock("@creit.tech/stellar-wallets-kit", () => ({
  FREIGHTER_ID: "freighter",
  ALBEDO_ID: "albedo",
  WalletNetwork: {
    PUBLIC: "Public Global Stellar Network ; September 2015",
    TESTNET: "Test SDF Network ; September 2015",
    FUTURENET: "Test SDF Future Network ; October 2022",
    SANDBOX: "Local Sandbox Stellar Network ; September 2022",
    STANDALONE: "Standalone Network ; February 2017",
  },
}));

jest.mock("@stellar/freighter-api", () => ({
  isAllowed: jest.fn(),
  getNetworkDetails: jest.fn(),
}));

const mockGetSupportedWallets = jest.fn();

jest.mock("@/lib/stellar/wallet-kit", () => ({
  getWalletKit: () => ({ getSupportedWallets: mockGetSupportedWallets }),
  STELLAR_NETWORK: "Test SDF Network ; September 2015",
}));

import { getWalletReadiness, listWalletsWithReadiness } from "./wallet-status";

const mockIsAllowed = isAllowed as jest.MockedFunction<typeof isAllowed>;
const mockGetNetworkDetails = getNetworkDetails as jest.MockedFunction<
  typeof getNetworkDetails
>;
const makeWallet = (
  overrides: Partial<ISupportedWallet> = {},
): ISupportedWallet => ({
  id: FREIGHTER_ID,
  name: "Freighter",
  type: "WALLET",
  isAvailable: true,
  isPlatformWrapper: false,
  icon: "freighter.svg",
  url: "https://freighter.app/",
  ...overrides,
});

describe("getWalletReadiness", () => {
  const originalUserAgent = window.navigator.userAgent;

  afterEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(window.navigator, "userAgent", {
      value: originalUserAgent,
      configurable: true,
    });
  });

  it("returns ready when installed, allowed, and on the expected network", async () => {
    mockIsAllowed.mockResolvedValue({ isAllowed: true });
    mockGetNetworkDetails.mockResolvedValue({
      network: "TESTNET",
      networkUrl: "",
      networkPassphrase: WalletNetwork.TESTNET,
    });

    const readiness = await getWalletReadiness(makeWallet());

    expect(readiness).toEqual({ state: "ready" });
  });

  it("returns not-installed with the install URL when isAvailable is false on desktop", async () => {
    Object.defineProperty(window.navigator, "userAgent", {
      value: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      configurable: true,
    });

    const readiness = await getWalletReadiness(
      makeWallet({ isAvailable: false, url: "https://freighter.app/" }),
    );

    expect(readiness).toEqual({
      state: "not-installed",
      installUrl: "https://freighter.app/",
    });
  });

  it("returns mobile-unsupported when not available on a mobile user agent", async () => {
    Object.defineProperty(window.navigator, "userAgent", {
      value: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
      configurable: true,
    });

    const readiness = await getWalletReadiness(
      makeWallet({ isAvailable: false }),
    );

    expect(readiness).toEqual({ state: "mobile-unsupported" });
  });

  it("returns web-wallet for Albedo without checking Freighter APIs", async () => {
    const readiness = await getWalletReadiness(
      makeWallet({ id: ALBEDO_ID, name: "Albedo", isAvailable: true }),
    );

    expect(readiness).toEqual({ state: "web-wallet" });
    expect(mockIsAllowed).not.toHaveBeenCalled();
    expect(mockGetNetworkDetails).not.toHaveBeenCalled();
  });

  it("returns not-allowed when Freighter is installed but the site isn't authorised", async () => {
    mockIsAllowed.mockResolvedValue({ isAllowed: false });
    mockGetNetworkDetails.mockResolvedValue({
      network: "TESTNET",
      networkUrl: "",
      networkPassphrase: WalletNetwork.TESTNET,
    });

    const readiness = await getWalletReadiness(makeWallet());

    expect(readiness).toEqual({ state: "not-allowed" });
  });

  it("returns wrong-network when Freighter's passphrase doesn't match the expected network", async () => {
    mockIsAllowed.mockResolvedValue({ isAllowed: true });
    mockGetNetworkDetails.mockResolvedValue({
      network: "PUBLIC",
      networkUrl: "",
      networkPassphrase: WalletNetwork.PUBLIC,
    });

    const readiness = await getWalletReadiness(makeWallet());

    expect(readiness).toEqual({
      state: "wrong-network",
      expected: WalletNetwork.TESTNET,
      actual: "PUBLIC",
    });
  });

  it("does not gate on network when Freighter's network details call errors", async () => {
    mockIsAllowed.mockResolvedValue({ isAllowed: true });
    mockGetNetworkDetails.mockResolvedValue({
      network: "",
      networkUrl: "",
      networkPassphrase: "",
      error: { code: -1, message: "not available" },
    });

    const readiness = await getWalletReadiness(makeWallet());

    expect(readiness).toEqual({ state: "ready" });
  });

  it("does not call Freighter-specific APIs for other wallet modules", async () => {
    const readiness = await getWalletReadiness(
      makeWallet({ id: "lobstr", name: "LOBSTR", isAvailable: true }),
    );

    expect(readiness).toEqual({ state: "ready" });
    expect(mockIsAllowed).not.toHaveBeenCalled();
    expect(mockGetNetworkDetails).not.toHaveBeenCalled();
  });
});

describe("listWalletsWithReadiness", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("pairs each supported wallet with its computed readiness", async () => {
    mockGetSupportedWallets.mockResolvedValue([
      makeWallet({ id: ALBEDO_ID, name: "Albedo" }),
      makeWallet({
        id: "lobstr",
        name: "LOBSTR",
        isAvailable: false,
        url: "https://lobstr.co",
      }),
    ]);

    const results = await listWalletsWithReadiness();

    expect(results).toEqual([
      {
        wallet: expect.objectContaining({ id: ALBEDO_ID }),
        readiness: { state: "web-wallet" },
      },
      {
        wallet: expect.objectContaining({ id: "lobstr" }),
        readiness: { state: "not-installed", installUrl: "https://lobstr.co" },
      },
    ]);
  });
});
