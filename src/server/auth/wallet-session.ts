import "server-only";
import { createHash } from "node:crypto";
import { Timestamp, type Transaction } from "firebase-admin/firestore";
import { getWalletFirebaseAdmin } from "@/server/firebase-admin";

const CHALLENGE_COLLECTION = "stellarWalletChallenges";

export async function storeWalletChallenge(
  challengeId: string,
  account: string,
  ttlSeconds: number,
) {
  const { firestore } = getWalletFirebaseAdmin();
  await firestore
    .collection(CHALLENGE_COLLECTION)
    .doc(challengeId)
    .create({
      account,
      expiresAt: Timestamp.fromMillis(Date.now() + ttlSeconds * 1000),
    });
}

export async function getWalletChallenge(challengeId: string) {
  const { firestore } = getWalletFirebaseAdmin();
  const snapshot = await firestore
    .collection(CHALLENGE_COLLECTION)
    .doc(challengeId)
    .get();
  const record = snapshot.data();
  return {
    exists: snapshot.exists,
    account: record?.account,
    expiresAt: record?.expiresAt,
  };
}

export async function consumeWalletChallenge(
  challengeId: string,
  account: string,
) {
  const { firestore } = getWalletFirebaseAdmin();
  const challengeRef = firestore
    .collection(CHALLENGE_COLLECTION)
    .doc(challengeId);

  return firestore.runTransaction(async (dbTransaction: Transaction) => {
    const snapshot = await dbTransaction.get(challengeRef);
    const record = snapshot.data();
    if (
      !snapshot.exists ||
      record?.account !== account ||
      !(record.expiresAt instanceof Timestamp) ||
      record.expiresAt.toMillis() <= Date.now()
    ) {
      return false;
    }
    dbTransaction.delete(challengeRef);
    return true;
  });
}

export async function mintWalletSession(account: string) {
  const { auth } = getWalletFirebaseAdmin();
  const uid = `stellar_${createHash("sha256").update(account).digest("hex")}`;
  return auth.createCustomToken(uid, {
    authProvider: "stellar",
    stellarAddress: account,
  });
}
