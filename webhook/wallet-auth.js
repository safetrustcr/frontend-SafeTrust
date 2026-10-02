const express = require("express");
const rateLimit = require("express-rate-limit");
const { Keypair, Networks, StrKey, WebAuth } = require("@stellar/stellar-sdk");
const admin = require("firebase-admin");
const { consumeChallenge, rememberChallenge } = require("./wallet-auth-store");

const router = express.Router();

const SERVER_KP = Keypair.fromSecret(process.env.SEP10_SIGNING_SECRET || Keypair.random().secret());             // dedicated key, not a funds account
const NETWORK = process.env.STELLAR_NETWORK === "mainnet" ? Networks.PUBLIC : Networks.TESTNET;
const HOME_DOMAIN = process.env.SEP10_HOME_DOMAIN || "safetrust.app";                                    // e.g. "safetrust.app"
const WEB_AUTH_DOMAIN = process.env.SEP10_WEB_AUTH_DOMAIN || HOME_DOMAIN;             // e.g. "api.safetrust.app"
const TIMEOUT_S = 300;

const limiter = rateLimit({ windowMs: 60_000, limit: 20, standardHeaders: true, legacyHeaders: false });

router.post("/wallet/challenge", limiter, async (req, res) => {
  const { account } = req.body ?? {};
  if (!StrKey.isValidEd25519PublicKey(account)) {
    return res.status(400).json({ error: "INVALID_ACCOUNT" });
  }
  try {
    const transaction = WebAuth.buildChallengeTx(SERVER_KP, account, HOME_DOMAIN, TIMEOUT_S, NETWORK, WEB_AUTH_DOMAIN);
    await rememberChallenge(transaction, TIMEOUT_S);   // store hash → single use
    res.json({ transaction, network_passphrase: NETWORK });
  } catch (err) {
    req.log?.warn?.({ err: err.message }, "sep10 challenge failed");
    res.status(400).json({ error: "INVALID_ACCOUNT" });
  }
});

router.post("/wallet/verify", limiter, async (req, res) => {
  const { transaction } = req.body ?? {};
  if (typeof transaction !== "string") return res.status(400).json({ error: "MISSING_TRANSACTION" });

  try {
    const { clientAccountID } = WebAuth.readChallengeTx(transaction, SERVER_KP.publicKey(), NETWORK, HOME_DOMAIN, WEB_AUTH_DOMAIN);
    // Throws if not signed by the client's master key (works for unfunded accounts too).
    WebAuth.verifyChallengeTxSigners(transaction, SERVER_KP.publicKey(), NETWORK, [clientAccountID], HOME_DOMAIN, WEB_AUTH_DOMAIN);

    if (!(await consumeChallenge(transaction))) {
      return res.status(401).json({ error: "CHALLENGE_REUSED_OR_EXPIRED" });
    }

    const uid = `stellar:${clientAccountID}`;
    try {
      await admin.auth().getUser(uid);
    } catch {
      await admin.auth().createUser({ uid });
    }
    const customToken = await admin.auth().createCustomToken(uid, { wallet: clientAccountID, auth_method: "sep10" });

    res.json({ customToken, account: clientAccountID });
  } catch (err) {
    req.log?.warn?.({ err: err.message }, "sep10 verify failed");
    res.status(401).json({ error: "INVALID_CHALLENGE" });
  }
});

module.exports = router;
