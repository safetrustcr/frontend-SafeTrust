import {
  FREIGHTER_ID,
  ALBEDO_ID,
  WalletNetwork,
  type ISupportedWallet,
} from "@creit.tech/stellar-wallets-kit";
import { getNetworkDetails, isAllowed } from "@stellar/freighter-api";
import { kit } from "@/components/auth/wallet/constants/wallet-kit.constant";

export type WalletReadiness =
  | { state: "ready" }
  | { state: "not-installed"; installUrl: string }
  | { state: "web-wallet" } // Albedo: no install, opens a popup
  | { state: "not-allowed" } // installed, site not authorised yet -> will prompt
  | { state: "wrong-network"; expected: string; actual: string }
  | { state: "mobile-unsupported" };

export interface WalletWithReadiness {
  wallet: ISupportedWallet;
  readiness: WalletReadiness;
}

// The kit's own `network` option isn't readable back out, so the expected
// passphrase is pinned to the same network the kit is constructed with
// (see components/auth/wallet/constants/wallet-kit.constant.ts).
const EXPECTED_NETWORK_PASSPHRASE: string = WalletNetwork.TESTNET;

const isMobileUserAgent = (): boolean =>
  typeof navigator !== "undefined" &&
  /Android|iPhone|iPad/i.test(navigator.userAgent);

export function describeNetwork(passphrase: string): string {
  switch (passphrase) {
    case WalletNetwork.PUBLIC:
      return "Mainnet";
    case WalletNetwork.TESTNET:
      return "Testnet";
    case WalletNetwork.FUTURENET:
      return "Futurenet";
    default:
      return "the correct network";
  }
}

export async function getWalletReadiness(
  wallet: ISupportedWallet,
): Promise<WalletReadiness> {
  if (wallet.id === ALBEDO_ID) {
    return { state: "web-wallet" };
  }

  if (!wallet.isAvailable) {
    return isMobileUserAgent()
      ? { state: "mobile-unsupported" }
      : { state: "not-installed", installUrl: wallet.url };
  }

  if (wallet.id === FREIGHTER_ID) {
    const [{ isAllowed: allowed }, net] = await Promise.all([
      isAllowed(),
      getNetworkDetails(),
    ]);

    if (!net.error && net.networkPassphrase !== EXPECTED_NETWORK_PASSPHRASE) {
      return {
        state: "wrong-network",
        expected: EXPECTED_NETWORK_PASSPHRASE,
        actual: net.network,
      };
    }

    if (!allowed) {
      return { state: "not-allowed" };
    }
  }

  return { state: "ready" };
}

export async function listWalletsWithReadiness(): Promise<
  WalletWithReadiness[]
> {
  const wallets = await kit.getSupportedWallets();
  return Promise.all(
    wallets.map(async (wallet) => ({
      wallet,
      readiness: await getWalletReadiness(wallet),
    })),
  );
}
