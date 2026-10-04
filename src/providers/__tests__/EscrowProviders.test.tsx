/**
 * The Trustless Work API must match the Stellar network the wallet kit
 * signs for, whatever NODE_ENV the build runs with.
 */
import { render } from "@testing-library/react";
import type { ReactNode } from "react";

const mockConfigProps = jest.fn();

// virtual: the package's CJS entry (dist/index.cjs) is missing upstream.
jest.mock(
  "@trustless-work/escrow",
  () => ({
    TrustlessWorkConfig: (props: { baseURL: string; children: ReactNode }) => {
      mockConfigProps(props);
      return props.children;
    },
  }),
  { virtual: true },
);
jest.mock("@/components/tw-blocks/providers/EscrowProvider", () => ({
  EscrowProvider: ({ children }: { children: ReactNode }) => children,
}));

import { EscrowProviders } from "../EscrowProviders";
import {
  STELLAR_NETWORK,
  TRUSTLESS_WORK_API_URL,
} from "@/features/escrow/config";

it("uses the testnet API while the wallet kit is on testnet", () => {
  expect(STELLAR_NETWORK).toBe("testnet");
  expect(TRUSTLESS_WORK_API_URL).toBe("https://dev.api.trustlesswork.com");

  render(<EscrowProviders>child</EscrowProviders>);

  expect(mockConfigProps).toHaveBeenCalledWith(
    expect.objectContaining({ baseURL: "https://dev.api.trustlesswork.com" }),
  );
});
