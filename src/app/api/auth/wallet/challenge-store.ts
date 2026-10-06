import { Networks, TransactionBuilder } from "@stellar/stellar-sdk";

const NETWORK =
  process.env.STELLAR_NETWORK === "mainnet"
    ? Networks.PUBLIC
    : Networks.TESTNET;

const memoryChallenges = new Map<string, number>();
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function hashOf(xdr: string): string {
  try {
    return TransactionBuilder.fromXDR(xdr, NETWORK).hash().toString("hex");
  } catch {
    return xdr;
  }
}

export function rememberChallenge(transaction: string, ttlSeconds: number) {
  memoryChallenges.set(hashOf(transaction), Date.now() + ttlSeconds * 1000);
}

export function consumeChallenge(transaction: string): boolean {
  const hash = hashOf(transaction);
  const expiry = memoryChallenges.get(hash);
  if (!expiry) {
    return false;
  }
  memoryChallenges.delete(hash);
  if (expiry < Date.now()) {
    return false;
  }
  return true;
}

export function checkRateLimit(
  ip: string,
  limit = 20,
  windowMs = 60_000,
): boolean {
  const now = Date.now();
  let record = rateLimitMap.get(ip);
  if (!record || now > record.resetTime) {
    record = { count: 1, resetTime: now + windowMs };
    rateLimitMap.set(ip, record);
    return true;
  }
  if (record.count >= limit) {
    return false;
  }
  record.count++;
  return true;
}

export function resetRateLimits() {
  memoryChallenges.clear();
  rateLimitMap.clear();
}
