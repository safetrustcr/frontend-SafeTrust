import { NextResponse } from "next/server";
import { Networks, WebAuth } from "@stellar/stellar-sdk";
import admin from "firebase-admin";
import { SERVER_KP } from "../server-kp";
import { consumeChallenge } from "../challenge-store";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adminApp = admin as any;

try {
  if (adminApp && !adminApp.apps?.length) {
    adminApp.initializeApp();
  }
} catch {
  // Ignore initialization errors in test or standalone if credentials missing
}

const NETWORK =
  process.env.STELLAR_NETWORK === "mainnet"
    ? Networks.PUBLIC
    : Networks.TESTNET;
const HOME_DOMAIN = process.env.SEP10_HOME_DOMAIN || "safetrust.app";
const WEB_AUTH_DOMAIN = process.env.SEP10_WEB_AUTH_DOMAIN || HOME_DOMAIN;

export async function POST(request: Request) {
  try {
    const { transaction } = await request.json();
    if (typeof transaction !== "string") {
      return NextResponse.json(
        { error: "MISSING_TRANSACTION" },
        { status: 400 },
      );
    }

    const backendUrl = process.env.BACKEND_URL;
    if (backendUrl) {
      try {
        const res = await fetch(`${backendUrl}/api/auth/wallet/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transaction }),
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
      } catch {
        // Fallback to local
      }
    }

    const { clientAccountID } = WebAuth.readChallengeTx(
      transaction,
      SERVER_KP.publicKey(),
      NETWORK,
      HOME_DOMAIN,
      WEB_AUTH_DOMAIN,
    );
    WebAuth.verifyChallengeTxSigners(
      transaction,
      SERVER_KP.publicKey(),
      NETWORK,
      [clientAccountID],
      HOME_DOMAIN,
      WEB_AUTH_DOMAIN,
    );

    if (!consumeChallenge(transaction)) {
      return NextResponse.json(
        { error: "CHALLENGE_REUSED_OR_EXPIRED" },
        { status: 401 },
      );
    }

    const uid = `stellar:${clientAccountID}`;
    try {
      if (adminApp && adminApp.auth) {
        await adminApp
          .auth()
          .getUser(uid)
          .catch(() => adminApp.auth().createUser({ uid }));
      }
    } catch {
      // standalone / firebase mock fallback
    }

    let customToken = `mock-token-${clientAccountID}`;
    try {
      if (adminApp && adminApp.auth && adminApp.apps?.length) {
        customToken = await adminApp
          .auth()
          .createCustomToken(uid, {
            wallet: clientAccountID,
            auth_method: "sep10",
          });
      }
    } catch {
      customToken = `mock-token-${clientAccountID}`;
    }

    return NextResponse.json({ customToken, account: clientAccountID });
  } catch (err: unknown) {
    console.error("Wallet verify API error:", err);
    return NextResponse.json({ error: "INVALID_CHALLENGE" }, { status: 401 });
  }
}
