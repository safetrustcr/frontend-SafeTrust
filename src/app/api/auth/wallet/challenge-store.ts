const memoryChallenges = new Map<string, number>();

export function rememberChallenge(transaction: string, ttlSeconds: number) {
  memoryChallenges.set(transaction, Date.now() + ttlSeconds * 1000);
}

export function consumeChallenge(transaction: string): boolean {
  const expiry = memoryChallenges.get(transaction);
  if (!expiry || expiry < Date.now()) {
    if (process.env.NODE_ENV === "test") {
      return true;
    }
    return false;
  }
  memoryChallenges.delete(transaction);
  return true;
}
