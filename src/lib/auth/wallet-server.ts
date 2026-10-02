import { createHash } from "node:crypto";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { Horizon, Keypair, Networks, WebAuth } from "stellar-sdk";

const CHALLENGE_COLLECTION = "stellarWalletChallenges";
const CHALLENGE_TTL_SECONDS = 5 * 60;
const FIREBASE_APP_NAME = "safetrust-wallet-auth";

type WalletAuthConfig = {
  serverKeypair: Keypair;
  homeDomain: string;
  webAuthDomain: string;
  networkPassphrase: string;
  horizonUrl: string;
};

export class WalletAuthServiceError extends Error {
  constructor(
    public status: 400 | 401 | 503,
    message: string,
  ) {
    super(message);
    this.name = "WalletAuthServiceError";
  }
}

function getWalletAuthConfig(): WalletAuthConfig {
  const secret = process.env.STELLAR_AUTH_SECRET;
  const homeDomain = process.env.STELLAR_AUTH_HOME_DOMAIN;
  const webAuthDomain = process.env.STELLAR_AUTH_WEB_AUTH_DOMAIN ?? homeDomain;
  const network = process.env.STELLAR_NETWORK ?? "testnet";

  if (!secret || !homeDomain || !webAuthDomain) {
    throw new WalletAuthServiceError(
      503,
      "Wallet authentication is not configured.",
    );
  }

  if (network !== "testnet" && network !== "mainnet") {
    throw new WalletAuthServiceError(
      503,
      "Wallet authentication is not configured.",
    );
  }

  try {
    const serverKeypair = Keypair.fromSecret(secret);
    const isMainnet = network === "mainnet";
    return {
      serverKeypair,
      homeDomain,
      webAuthDomain,
      networkPassphrase:
        process.env.STELLAR_NETWORK_PASSPHRASE ??
        (isMainnet ? Networks.PUBLIC : Networks.TESTNET),
      horizonUrl:
        process.env.STELLAR_HORIZON_URL ??
        (isMainnet
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

function getFirebaseAdmin() {
  const projectId =
    process.env.FIREBASE_ADMIN_PROJECT_ID ??
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(
    /\\n/g,
    "\n",
  );

  if (!projectId || !clientEmail || !privateKey) {
    throw new WalletAuthServiceError(
      503,
      "Wallet authentication is not configured.",
    );
  }

  let app = getApps().find((candidate) => candidate.name === FIREBASE_APP_NAME);
  if (!app) {
    app = initializeApp(
      {
        credential: cert({ projectId, clientEmail, privateKey }),
        projectId,
      },
      FIREBASE_APP_NAME,
    );
  }

  return {
    auth: getAuth(app),
    firestore: getFirestore(app),
  };
}

function getChallengeId(
  transaction: ReturnType<typeof WebAuth.readChallengeTx>,
) {
  return transaction.tx.hash().toString("hex");
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
  const { firestore } = getFirebaseAdmin();

  try {
    await firestore
      .collection(CHALLENGE_COLLECTION)
      .doc(getChallengeId(challenge))
      .create({
        account: clientAccount,
        expiresAt: Timestamp.fromMillis(
          Date.now() + CHALLENGE_TTL_SECONDS * 1000,
        ),
      });
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
  const { auth, firestore } = getFirebaseAdmin();
  const challengeRef = firestore
    .collection(CHALLENGE_COLLECTION)
    .doc(challengeId);

  let storedChallenge;
  try {
    storedChallenge = await challengeRef.get();
  } catch {
    throw new WalletAuthServiceError(
      503,
      "Wallet authentication is temporarily unavailable.",
    );
  }

  const record = storedChallenge.data();
  if (
    !storedChallenge.exists ||
    record?.account !== challenge.clientAccountID ||
    !(record.expiresAt instanceof Timestamp) ||
    record.expiresAt.toMillis() <= Date.now()
  ) {
    throw new WalletAuthServiceError(
      401,
      "Invalid or expired wallet challenge.",
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
    const consumed = await firestore.runTransaction(async (dbTransaction) => {
      const currentChallenge = await dbTransaction.get(challengeRef);
      const currentRecord = currentChallenge.data();
      if (
        !currentChallenge.exists ||
        currentRecord?.account !== challenge.clientAccountID ||
        !(currentRecord.expiresAt instanceof Timestamp) ||
        currentRecord.expiresAt.toMillis() <= Date.now()
      ) {
        return false;
      }
      dbTransaction.delete(challengeRef);
      return true;
    });

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

  const uid = `stellar_${createHash("sha256")
    .update(challenge.clientAccountID)
    .digest("hex")}`;
  try {
    const customToken = await auth.createCustomToken(uid, {
      authProvider: "stellar",
      stellarAddress: challenge.clientAccountID,
    });
    return { customToken, walletAddress: challenge.clientAccountID };
  } catch {
    throw new WalletAuthServiceError(
      503,
      "Wallet authentication is temporarily unavailable.",
    );
  }
}

export function hasTrustedWalletAuthOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;

  try {
    const receivedOrigin = new URL(origin).origin;
    const allowedOrigins = new Set([new URL(request.url).origin]);
    for (const value of (process.env.WALLET_AUTH_ALLOWED_ORIGINS ?? "").split(
      ",",
    )) {
      const trimmed = value.trim();
      if (!trimmed) continue;

      try {
        allowedOrigins.add(new URL(trimmed).origin);
      } catch {
        // Ignore malformed optional configuration entries.
      }
    }
    return allowedOrigins.has(receivedOrigin);
  } catch {
    return false;
  }
}
