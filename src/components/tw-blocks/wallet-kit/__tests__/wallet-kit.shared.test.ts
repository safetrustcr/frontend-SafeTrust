/**
 * Escrow signing must use the wallet the guest selected in the auth flow.
 * Both modules have to expose the same StellarWalletsKit instance.
 */
jest.mock("@creit.tech/stellar-wallets-kit", () => {
  // Track construction so the test can verify browser-side initialization is lazy.
  const constructed = jest.fn();
  class FakeKit {
    private selected: string;
    constructor(config: { selectedWalletId: string }) {
      constructed(config);
      this.selected = config.selectedWalletId;
    }
    setWallet(id: string) {
      this.selected = id;
    }
    async signTransaction(xdr: string, opts: { networkPassphrase: string }) {
      return {
        signedTxXdr: `${xdr}|signed-by:${this.selected}|${opts.networkPassphrase}`,
      };
    }
  }
  return {
    __constructed: constructed,
    StellarWalletsKit: FakeKit,
    WalletNetwork: { TESTNET: "TESTNET" },
    allowAllModules: () => [],
    FREIGHTER_ID: "freighter",
    XBULL_ID: "xbull",
    FreighterModule: jest.fn(),
    AlbedoModule: jest.fn(),
  };
});

import { kit as authKit } from "@/components/auth/wallet/constants/wallet-kit.constant";
import { kit as escrowKit, signTransaction } from "../wallet-kit";

const constructed = (
  jest.requireMock("@creit.tech/stellar-wallets-kit") as {
    __constructed: jest.Mock;
  }
).__constructed;

it("shares one kit instance between auth and escrow signing", () => {
  expect(escrowKit).toBe(authKit);
  expect(constructed).not.toHaveBeenCalled();
});

it("signs escrow transactions with the wallet chosen at connect time", async () => {
  authKit.setWallet("xbull"); // what the auth flow does on connect

  await expect(
    signTransaction({ unsignedTransaction: "XDR", address: "GABC" }),
  ).resolves.toBe("XDR|signed-by:xbull|TESTNET");
  expect(constructed).toHaveBeenCalledTimes(1);
});
