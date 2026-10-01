/**
 * @jest-environment node
 */
import { Keypair, Networks, TransactionBuilder } from "@stellar/stellar-sdk";

const serverKp = Keypair.random();
process.env.SEP10_SIGNING_SECRET = serverKp.secret();
process.env.STELLAR_NETWORK = "testnet";
process.env.SEP10_HOME_DOMAIN = "safetrust.app";

import { POST as challengeHandler } from "../challenge/route";
import { POST as verifyHandler } from "../verify/route";

describe("SEP-10 Wallet Authentication API", () => {
  const clientKp = Keypair.random();
  const network = Networks.TESTNET;

  it("returns 400 for invalid account in challenge", async () => {
    const req = new Request("http://localhost/api/auth/wallet/challenge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ account: "INVALID_KEY" }),
    });
    const res = await challengeHandler(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("INVALID_ACCOUNT");
  });

  it("returns valid SEP-10 challenge for valid account", async () => {
    const req = new Request("http://localhost/api/auth/wallet/challenge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ account: clientKp.publicKey() }),
    });
    const res = await challengeHandler(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.transaction).toBeDefined();
    expect(data.network_passphrase).toBe(network);
  });

  it("successfully verifies valid signed challenge and returns customToken", async () => {
    // 1. Get challenge
    const challengeReq = new Request(
      "http://localhost/api/auth/wallet/challenge",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account: clientKp.publicKey() }),
      },
    );
    const challengeRes = await challengeHandler(challengeReq);
    const { transaction } = await challengeRes.json();

    // 2. Sign transaction with client keypair
    const tx = TransactionBuilder.fromXDR(transaction, network);
    tx.sign(clientKp);
    const signedTx = tx.toXDR();

    // 3. Verify transaction
    const verifyReq = new Request("http://localhost/api/auth/wallet/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transaction: signedTx }),
    });
    const verifyRes = await verifyHandler(verifyReq);
    expect(verifyRes.status).toBe(200);
    const verifyData = await verifyRes.json();
    expect(verifyData.customToken).toBeDefined();
    expect(verifyData.account).toBe(clientKp.publicKey());
  });

  it("returns 401 for wrong signer", async () => {
    const challengeReq = new Request(
      "http://localhost/api/auth/wallet/challenge",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account: clientKp.publicKey() }),
      },
    );
    const challengeRes = await challengeHandler(challengeReq);
    const { transaction } = await challengeRes.json();

    // Sign with a different keypair
    const wrongKp = Keypair.random();
    const tx = TransactionBuilder.fromXDR(transaction, network);
    tx.sign(wrongKp);
    const signedTx = tx.toXDR();

    const verifyReq = new Request("http://localhost/api/auth/wallet/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transaction: signedTx }),
    });
    const verifyRes = await verifyHandler(verifyReq);
    expect(verifyRes.status).toBe(401);
  });

  it("returns 401 for malformed transaction", async () => {
    const verifyReq = new Request("http://localhost/api/auth/wallet/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transaction: "not-a-valid-xdr" }),
    });
    const verifyRes = await verifyHandler(verifyReq);
    expect(verifyRes.status).toBe(401);
  });
});
