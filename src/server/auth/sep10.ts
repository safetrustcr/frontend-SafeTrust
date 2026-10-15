import "server-only";
import { Timestamp } from "firebase-admin/firestore";
import { Horizon, Keypair, Networks, WebAuth } from "@stellar/stellar-sdk";
import { serverEnv } from "@/config/env.server";
import {
  consumeWalletChallenge,
  getWalletChallenge,
  mintWalletSession,
  storeWalletChallenge,
} from "./wallet-session";

const CHALLENGE_TTL_SECONDS = 5 * 60;

type WalletAuthConfig = {
  serverKeypair: Keypair;
  homeDomain: string;
  webAuthDomain: string;
  networkPassphrase: string;
  horizonUrl: string;
};

export class WalletAuthServiceError extends Error {
  constructor(
    public status: 400 | 401 | 429 | 503,
    message: string,
  ) {
    super(message);
    this.name = "WalletAuthServiceError";
  }
}

const rateLimitMap = new Map<string, number[]>();

export function checkRateLimit(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequests = 20;

  if (rateLimitMap.size > 10000) {
    for (const [key, timestamps] of rateLimitMap.entries()) {
      const active = timestamps.filter(
        (timestamp) => now - timestamp < windowMs,
      );
      if (active.length === 0) {
        rateLimitMap.delete(key);
      } else {
        rateLimitMap.set(key, active);
      }
    }
  }

  let timestamps = rateLimitMap.get(ip) ?? [];
  timestamps = timestamps.filter((timestamp) => now - timestamp < windowMs);
  if (timestamps.length >= maxRequests) {
    throw new WalletAuthServiceError(429, "Rate limit exceeded.");
  }
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
}

function getWalletAuthConfig(): WalletAuthConfig {
  try {
    const network = serverEnv.STELLAR_NETWORK;
    const isPublic = network === "public";
    return {
      serverKeypair: Keypair.fromSecret(serverEnv.STELLAR_AUTH_SECRET),
      homeDomain: serverEnv.STELLAR_AUTH_HOME_DOMAIN,
      webAuthDomain: serverEnv.STELLAR_AUTH_WEB_AUTH_DOMAIN,
      networkPassphrase:
        serverEnv.STELLAR_NETWORK_PASSPHRASE ??
        (isPublic ? Networks.PUBLIC : Networks.TESTNET),
      horizonUrl:
        serverEnv.STELLAR_HORIZON_URL ??
        (isPublic
          ? "https://horizon.stellar.org"
          : "https://horizon-testnet.stellar.org"),
    };
  } catch {
    throw new WalletAuthServiceError(
      503,
      "Wallet authentication is not configured.",
    );
  }
}

function getChallengeId(challenge: ReturnType<typeof WebAuth.readChallengeTx>) {
  return challenge.tx.hash().toString("hex");
}

export async function issueWalletChallenge(account: string) {
  const config = getWalletAuthConfig();
  let clientAccount: string;
  try {
    clientAccount = Keypair.fromPublicKey(account).publicKey();
  } catch {
    throw new WalletAuthServiceError(400, "Invalid Stellar account.");
  }

  const transaction = WebAuth.buildChallengeTx(
    config.serverKeypair,
    clientAccount,
    config.homeDomain,
    CHALLENGE_TTL_SECONDS,
    config.networkPassphrase,
    config.webAuthDomain,
  );
  const challenge = WebAuth.readChallengeTx(
    transaction,
    config.serverKeypair.publicKey(),
    config.networkPassphrase,
    config.homeDomain,
    config.webAuthDomain,
  );

  try {
    await storeWalletChallenge(
      getChallengeId(challenge),
      clientAccount,
      CHALLENGE_TTL_SECONDS,
    );
  } catch {
    throw new WalletAuthServiceError(
      503,
      "Wallet authentication is temporarily unavailable.",
    );
  }

  return {
    transaction,
    network_passphrase: config.networkPassphrase,
  };
}

export async function verifyWalletChallenge(transaction: string) {
  const config = getWalletAuthConfig();
  let challenge: ReturnType<typeof WebAuth.readChallengeTx>;
  try {
    challenge = WebAuth.readChallengeTx(
      transaction,
      config.serverKeypair.publicKey(),
      config.networkPassphrase,
      config.homeDomain,
      config.webAuthDomain,
    );
  } catch {
    throw new WalletAuthServiceError(
      401,
      "Invalid or expired wallet challenge.",
    );
  }

  const challengeId = getChallengeId(challenge);
  try {
    const storedChallenge = await getWalletChallenge(challengeId);
    if (
      !storedChallenge.exists ||
      storedChallenge.account !== challenge.clientAccountID ||
      !(storedChallenge.expiresAt instanceof Timestamp) ||
      storedChallenge.expiresAt.toMillis() <= Date.now()
    ) {
      throw new WalletAuthServiceError(
        401,
        "Invalid or expired wallet challenge.",
      );
    }
  } catch (error) {
    if (error instanceof WalletAuthServiceError) throw error;
    throw new WalletAuthServiceError(
      503,
      "Wallet authentication is temporarily unavailable.",
    );
  }

  let account;
  try {
    account = await new Horizon.Server(config.horizonUrl).loadAccount(
      challenge.clientAccountID,
    );
  } catch (error) {
    const status =
      typeof error === "object" && error !== null && "response" in error
        ? (error.response as { status?: number } | undefined)?.status
        : undefined;
    if (status === 404) {
      throw new WalletAuthServiceError(401, "Invalid wallet signature.");
    }
    throw new WalletAuthServiceError(
      503,
      "Wallet authentication is temporarily unavailable.",
    );
  }

  try {
    WebAuth.verifyChallengeTxThreshold(
      transaction,
      config.serverKeypair.publicKey(),
      config.networkPassphrase,
      account.thresholds.med_threshold,
      account.signers,
      config.homeDomain,
      config.webAuthDomain,
    );
  } catch {
    throw new WalletAuthServiceError(401, "Invalid wallet signature.");
  }

  try {
    const consumed = await consumeWalletChallenge(
      challengeId,
      challenge.clientAccountID,
    );
    if (!consumed) {
      throw new WalletAuthServiceError(
        401,
        "Wallet challenge was already used.",
      );
    }
  } catch (error) {
    if (error instanceof WalletAuthServiceError) throw error;
    throw new WalletAuthServiceError(
      503,
      "Wallet authentication is temporarily unavailable.",
    );
  }

  try {
    const customToken = await mintWalletSession(challenge.clientAccountID);
    return {
      customToken,
      account: challenge.clientAccountID,
      walletAddress: challenge.clientAccountID,
    };
  } catch {
    throw new WalletAuthServiceError(
      503,
      "Wallet authentication is temporarily unavailable.",
    );
  }
}

export function hasTrustedWalletAuthOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const receivedOrigin = new URL(origin).origin;
    const allowedOrigins = new Set([new URL(request.url).origin]);
    for (const value of (serverEnv.WALLET_AUTH_ALLOWED_ORIGINS ?? "").split(
      ",",
    )) {
      const trimmed = value.trim();
      if (!trimmed) continue;
      try {
        allowedOrigins.add(new URL(trimmed).origin);
      } catch {
        // Malformed optional origins do not affect configured valid origins.
      }
    }
    return allowedOrigins.has(receivedOrigin);
  } catch {
    return false;
  }
}
