/**
 * @jest-environment node
 */
import {
  Keypair,
  Networks,
  TransactionBuilder,
  WebAuth,
} from "@stellar/stellar-sdk";

const serverKp = Keypair.random();
process.env.SEP10_SIGNING_SECRET = serverKp.secret();
process.env.STELLAR_NETWORK = "testnet";
process.env.SEP10_HOME_DOMAIN = "safetrust.app";

import { POST as challengeHandler } from "../challenge/route";
import { POST as verifyHandler } from "../verify/route";
import { rememberChallenge, resetRateLimits } from "../challenge-store";

describe("SEP-10 Wallet Authentication API", () => {
  const clientKp = Keypair.random();
  const network = Networks.TESTNET;

  beforeEach(() => {
    resetRateLimits();
  });

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

    const tx = TransactionBuilder.fromXDR(transaction, network);
    tx.sign(clientKp);
    const signedTx = tx.toXDR();

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

  it("returns 401 when replaying the same signed challenge", async () => {
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

    const tx = TransactionBuilder.fromXDR(transaction, network);
    tx.sign(clientKp);
    const signedTx = tx.toXDR();

    // First verification (success)
    const verifyReq1 = new Request("http://localhost/api/auth/wallet/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transaction: signedTx }),
    });
    const verifyRes1 = await verifyHandler(verifyReq1);
    expect(verifyRes1.status).toBe(200);

    // Second verification (replay - should fail)
    const verifyReq2 = new Request("http://localhost/api/auth/wallet/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transaction: signedTx }),
    });
    const verifyRes2 = await verifyHandler(verifyReq2);
    expect(verifyRes2.status).toBe(401);
    const data = await verifyRes2.json();
    expect(data.error).toBe("CHALLENGE_REUSED_OR_EXPIRED");
  });

  it("returns 401 for expired challenge", async () => {
    const expiredTx = WebAuth.buildChallengeTx(
      serverKp,
      clientKp.publicKey(),
      "safetrust.app",
      300,
      network,
      "safetrust.app",
    );
    rememberChallenge(expiredTx, -1); // expired immediately

    const tx = TransactionBuilder.fromXDR(expiredTx, network);
    tx.sign(clientKp);
    const signedTx = tx.toXDR();

    const verifyReq = new Request("http://localhost/api/auth/wallet/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transaction: signedTx }),
    });
    const verifyRes = await verifyHandler(verifyReq);
    expect(verifyRes.status).toBe(401);
    const data = await verifyRes.json();
    expect(data.error).toBe("CHALLENGE_REUSED_OR_EXPIRED");
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
    const data = await verifyRes.json();
    expect(data.error).toBe("INVALID_CHALLENGE");
  });

  it("returns 401 for wrong network", async () => {
    const publicNetwork = Networks.PUBLIC;
    const publicTx = WebAuth.buildChallengeTx(
      serverKp,
      clientKp.publicKey(),
      "safetrust.app",
      300,
      publicNetwork,
      "safetrust.app",
    );
    rememberChallenge(publicTx, 300);

    const tx = TransactionBuilder.fromXDR(publicTx, publicNetwork);
    tx.sign(clientKp);
    const signedTx = tx.toXDR();

    const verifyReq = new Request("http://localhost/api/auth/wallet/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transaction: signedTx }),
    });
    const verifyRes = await verifyHandler(verifyReq);
    expect(verifyRes.status).toBe(401);
    const data = await verifyRes.json();
    expect(data.error).toBe("INVALID_CHALLENGE");
  });

  it("returns 401 for malformed transaction", async () => {
    const verifyReq = new Request("http://localhost/api/auth/wallet/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transaction: "not-a-valid-xdr" }),
    });
    const verifyRes = await verifyHandler(verifyReq);
    expect(verifyRes.status).toBe(401);
    const data = await verifyRes.json();
    expect(data.error).toBe("INVALID_CHALLENGE");
  });

  it("returns 429 when rate limit is exceeded", async () => {
    for (let i = 0; i < 20; i++) {
      const req = new Request("http://localhost/api/auth/wallet/challenge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Forwarded-For": "5.6.7.8",
        },
        body: JSON.stringify({ account: clientKp.publicKey() }),
      });
      const res = await challengeHandler(req);
      expect(res.status).not.toBe(429);
    }

    const req21 = new Request("http://localhost/api/auth/wallet/challenge", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Forwarded-For": "5.6.7.8",
      },
      body: JSON.stringify({ account: clientKp.publicKey() }),
    });
    const res21 = await challengeHandler(req21);
    expect(res21.status).toBe(429);
    const data = await res21.json();
    expect(data.error).toBe("RATE_LIMIT_EXCEEDED");
  });
});
