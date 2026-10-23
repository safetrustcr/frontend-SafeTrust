import { auth } from "@/lib/firebase";
import { getWalletKit } from "@/lib/stellar/wallet-kit";

export interface LinkedWallet {
  address: string;
  isPrimary: boolean;
  isSignInMethod: boolean;
}

export interface ListWalletsResponse {
  wallets: LinkedWallet[];
}

const WALLET_ERROR_MESSAGES: Record<string, string> = {
  WALLET_ALREADY_REGISTERED:
    "This wallet is already linked to another account.",
  WALLET_CHALLENGE_EXPIRED: "The wallet verification expired. Please try again.",
  INVALID_WALLET_SIGNATURE:
    "The wallet signature could not be verified. Please try again.",
  UNSUPPORTED_STELLAR_ACCOUNT_TYPE:
    "This Stellar account type is not supported.",
  WALLET_IS_SIGN_IN_METHOD:
    "This wallet is used to sign in and cannot be removed.",
  BACKEND_NOT_CONFIGURED:
    "Linked wallets need the SafeTrust backend.",
};

export class AccountApiError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "AccountApiError";
  }
}

async function accountRequest<T>(
  path: string,
  token: string,
  options: { method?: string; body?: unknown } = {},
): Promise<T> {
  const response = await fetch(path, {
    method: options.method ?? "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body === undefined ? {} : { "Content-Type": "application/json" }),
    },
    ...(options.body === undefined
      ? {}
      : { body: JSON.stringify(options.body) }),
    cache: "no-store",
  });

  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const record =
      payload && typeof payload === "object"
        ? (payload as Record<string, unknown>)
        : {};
    const code =
      typeof record.error === "string"
        ? record.error
        : typeof record.code === "string"
          ? record.code
          : "ACCOUNT_REQUEST_FAILED";
    throw new AccountApiError(
      WALLET_ERROR_MESSAGES[code] ?? code,
      code,
      response.status,
    );
  }
  return payload as T;
}

function normalizeWallets(payload: unknown): LinkedWallet[] {
  if (Array.isArray(payload)) {
    return normalizeWallets({ wallets: payload });
  }
  if (!payload || typeof payload !== "object") return [];
  const data = payload as Record<string, unknown>;
  const entries = Array.isArray(data.wallets)
    ? data.wallets
    : Array.isArray(data.data)
      ? data.data
      : [];
  return entries.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const wallet = entry as Record<string, unknown>;
    const address =
      typeof wallet.address === "string"
        ? wallet.address
        : typeof wallet.wallet_address === "string"
          ? wallet.wallet_address
          : null;
    if (!address) return [];
    return [
      {
        address,
        isPrimary: wallet.isPrimary === true || wallet.is_primary === true,
        isSignInMethod:
          wallet.isSignInMethod === true ||
          wallet.is_sign_in_method === true ||
          wallet.sign_in_method === true ||
          wallet.is_sign_in_wallet === true ||
          wallet.wallet_type === "sign_in",
      },
    ];
  });
}

export async function listWallets(token: string): Promise<ListWalletsResponse> {
  const result = await accountRequest<unknown>("/api/account/wallets", token);
  return { wallets: normalizeWallets(result) };
}

export async function unlinkWallet(address: string, token: string) {
  return accountRequest<unknown>(
    `/api/account/wallets/${encodeURIComponent(address)}`,
    token,
    { method: "DELETE" },
  );
}

export async function makePrimary(address: string, token: string) {
  return accountRequest<unknown>(
    `/api/account/wallets/${encodeURIComponent(address)}/primary`,
    token,
    { method: "POST", body: {} },
  );
}

export async function linkCurrentWallet(): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("UNAUTHENTICATED");

  const { address } = await getWalletKit().getAddress();
  const token = await user.getIdToken();
  const { challengeId, challenge } = await accountRequest<{
    challengeId: string;
    challenge: string;
  }>("/api/account/wallets/link/challenge", token, {
    method: "POST",
    body: { wallet_address: address },
  });
  if (!challengeId || !challenge) {
    throw new Error("INVALID_WALLET_CHALLENGE");
  }
  const { signedMessage } = await getWalletKit().signMessage(challenge, {
    address,
  });
  await accountRequest<unknown>("/api/account/wallets/link/verify", token, {
    method: "POST",
    body: { challengeId, signature: signedMessage },
  });
}
