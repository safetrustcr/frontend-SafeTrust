import { FREIGHTER_ID } from "@creit.tech/stellar-wallets-kit";
import { signInWithCustomToken } from "firebase/auth";
import { useGlobalAuthenticationStore } from "@/core/store/data";
import { auth } from "@/lib/firebase";
import { setSessionCookie } from "@/lib/auth/session";
import { getWalletKit } from "@/lib/stellar/wallet-kit";

export type WalletAuthErrorCode =
  | "NOT_INSTALLED"
  | "REJECTED"
  | "WRONG_NETWORK"
  | "CHALLENGE_FAILED"
  | "UNAVAILABLE";

export class WalletAuthError extends Error {
  constructor(
    public code: WalletAuthErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "WalletAuthError";
  }
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    throw new WalletAuthError(
      "UNAVAILABLE",
      "Wallet sign-in is temporarily unavailable.",
    );
  }

  if (response.status === 503) {
    throw new WalletAuthError(
      "UNAVAILABLE",
      "Wallet sign-in is temporarily unavailable.",
    );
  }
  if (!response.ok) {
    throw new WalletAuthError(
      "CHALLENGE_FAILED",
      "We couldn't verify your wallet. Please try again.",
    );
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new WalletAuthError(
      "CHALLENGE_FAILED",
      "We couldn't verify your wallet. Please try again.",
    );
  }
}

export async function signInWithFreighter(walletId = FREIGHTER_ID) {
  const kit = getWalletKit();
  const supportedWallets = await kit.getSupportedWallets();
  const wallet = supportedWallets.find((item) => item.id === walletId);
  if (!wallet?.isAvailable) {
    throw new WalletAuthError(
      "NOT_INSTALLED",
      `${wallet?.name ?? "Wallet"} isn't available.`,
    );
  }

  kit.setWallet(walletId);

  let address: string;
  try {
    ({ address } = await kit.getAddress());
  } catch {
    throw new WalletAuthError("REJECTED", "Wallet connection was cancelled.");
  }

  const challenge = await postJson<unknown>("/api/auth/wallet/challenge", {
    account: address,
  });
  if (
    typeof challenge !== "object" ||
    challenge === null ||
    !("transaction" in challenge) ||
    typeof challenge.transaction !== "string" ||
    challenge.transaction.trim() === "" ||
    !("network_passphrase" in challenge) ||
    typeof challenge.network_passphrase !== "string" ||
    challenge.network_passphrase.trim() === ""
  ) {
    throw new WalletAuthError(
      "CHALLENGE_FAILED",
      "We couldn't verify your wallet. Please try again.",
    );
  }

  let signedTxXdr: string;
  try {
    ({ signedTxXdr } = await kit.signTransaction(challenge.transaction, {
      address,
      networkPassphrase: challenge.network_passphrase,
    }));
  } catch (error) {
    const message = String((error as Error)?.message ?? "");
    if (/network/i.test(message)) {
      throw new WalletAuthError(
        "WRONG_NETWORK",
        "Switch your wallet to the correct Stellar network and try again.",
      );
    }
    throw new WalletAuthError("REJECTED", "Wallet signature was cancelled.");
  }

  const verification = await postJson<unknown>("/api/auth/wallet/verify", {
    transaction: signedTxXdr,
  });
  const customToken =
    typeof verification === "object" &&
    verification !== null &&
    "customToken" in verification &&
    typeof verification.customToken === "string"
      ? verification.customToken
      : "";
  if (customToken.trim() === "") {
    throw new WalletAuthError(
      "CHALLENGE_FAILED",
      "We couldn't verify your wallet. Please try again.",
    );
  }

  const credential = await signInWithCustomToken(auth, customToken);
  const idToken = await credential.user.getIdToken();
  setSessionCookie(idToken);
  useGlobalAuthenticationStore.getState().setToken(idToken);
  await useGlobalAuthenticationStore
    .getState()
    .connectWalletStore(address, wallet.name);

  return address;
}
