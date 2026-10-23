/* eslint-disable @typescript-eslint/no-require-imports */
import { act, renderHook, waitFor } from "@testing-library/react";
import {
  fakes,
  GUEST,
  makeBooking,
  QueryWrapper,
  resetFakes,
  seen,
  setEscrowEnv,
} from "../testing/escrow-harness";
import { useBookingEscrowFlow } from "../useBookingEscrow";
import { getUsdcTrustlineAddress } from "../config";
import { validateEscrowSetup } from "../booking-escrow.machine";

jest.mock(
  "@trustless-work/escrow",
  () => require("../testing/escrow-harness").trustlessWorkModule(),
  { virtual: true },
);
jest.mock("@/components/tw-blocks/wallet-kit/wallet-kit", () =>
  require("../testing/escrow-harness").walletKitModule(),
);

// Per-test configuration: an issuer override, or a network without USDC.
let mockIssuerOverride: string | undefined;
let mockNoUsdc = false;
jest.mock("@/config/env", () => {
  const actual = jest.requireActual("@/config/env");
  return {
    ...actual,
    clientEnv: new Proxy(actual.clientEnv, {
      get: (target, key) =>
        key === "NEXT_PUBLIC_USDC_ISSUER" ? mockIssuerOverride : target[key],
    }),
  };
});
jest.mock("@/lib/stellar/assets", () => {
  const actual = jest.requireActual("@/lib/stellar/assets");
  return {
    ...actual,
    usdcFor: (...args: Parameters<typeof actual.usdcFor>) =>
      mockNoUsdc ? null : actual.usdcFor(...args),
  };
});

const TESTNET_USDC = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";
const OVERRIDE = "GAK6DAPPQDDPSQRXTLWD6SGCOYAXWYP7XKSQNMEIZW6TSW7GKVASZIAH";

const renderFlow = () =>
  renderHook(
    () =>
      useBookingEscrowFlow({
        listingId: "1",
        guestAddress: GUEST,
        pollIntervalMs: 10,
        pollTimeoutMs: 80,
      }),
    { wrapper: QueryWrapper },
  );

beforeAll(setEscrowEnv);
beforeEach(() => {
  resetFakes();
  sessionStorage.clear();
  mockIssuerOverride = undefined;
  mockNoUsdc = false;
  jest.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

it("deploys with the active network's USDC issuer by default", async () => {
  expect(getUsdcTrustlineAddress()).toBe(TESTNET_USDC);

  const { result } = renderFlow();
  await waitFor(() => expect(result.current.ready).toBe(true));
  await act(() => result.current.start(makeBooking()));

  expect(result.current.state.step).toBe("funded");
  expect(seen.deploy!.trustline).toEqual({ address: TESTNET_USDC });
});

it("honors a valid NEXT_PUBLIC_USDC_ISSUER in the checkout", async () => {
  mockIssuerOverride = OVERRIDE;

  const { result } = renderFlow();
  await waitFor(() => expect(result.current.ready).toBe(true));
  await act(() => result.current.start(makeBooking()));

  expect(seen.deploy!.trustline).toEqual({ address: OVERRIDE });
});

it("ignores a malformed override instead of sending it", () => {
  mockIssuerOverride = "not-a-key";
  expect(getUsdcTrustlineAddress()).toBe(TESTNET_USDC);
});

it("stops before any wallet prompt when the network has no USDC", async () => {
  mockNoUsdc = true;
  const message = "USDC isn't configured for testnet. Contact support.";
  expect(getUsdcTrustlineAddress()).toBe("");
  expect(validateEscrowSetup(makeBooking(), GUEST)).toEqual([message]);

  const { result } = renderFlow();
  await waitFor(() => expect(result.current.ready).toBe(true));
  await act(() => result.current.start(makeBooking()));

  expect(result.current.error).toBe(message);
  expect(result.current.state.step).toBe("idle");
  expect(fakes.deployApi).not.toHaveBeenCalled();
  expect(fakes.signTransaction).not.toHaveBeenCalled();
});
