import { NextResponse } from "next/server";
import { Networks, StrKey, WebAuth } from "@stellar/stellar-sdk";
import { SERVER_KP } from "../server-kp";
import { rememberChallenge } from "../challenge-store";

const NETWORK =
  process.env.STELLAR_NETWORK === "mainnet"
    ? Networks.PUBLIC
    : Networks.TESTNET;
const HOME_DOMAIN = process.env.SEP10_HOME_DOMAIN || "safetrust.app";
const WEB_AUTH_DOMAIN = process.env.SEP10_WEB_AUTH_DOMAIN || HOME_DOMAIN;
const TIMEOUT_S = 300;

export async function POST(request: Request) {
  try {
    const { account } = await request.json();
    if (!StrKey.isValidEd25519PublicKey(account)) {
      return NextResponse.json({ error: "INVALID_ACCOUNT" }, { status: 400 });
    }

    const backendUrl = process.env.BACKEND_URL;
    if (backendUrl) {
      try {
        const res = await fetch(`${backendUrl}/api/auth/wallet/challenge`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ account }),
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
      } catch {
        // Fallback to local if backend unreachable
      }
    }

    const transaction = WebAuth.buildChallengeTx(
      SERVER_KP,
      account,
      HOME_DOMAIN,
      TIMEOUT_S,
      NETWORK,
      WEB_AUTH_DOMAIN,
    );
    rememberChallenge(transaction, TIMEOUT_S);

    return NextResponse.json({ transaction, network_passphrase: NETWORK });
  } catch (err: unknown) {
    console.error("Wallet challenge API error:", err);
    return NextResponse.json({ error: "INVALID_ACCOUNT" }, { status: 400 });
  }
}
