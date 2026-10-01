const { Networks, TransactionBuilder } = require("@stellar/stellar-sdk");
const { pool } = require("./db");

const NETWORK = process.env.STELLAR_NETWORK === "mainnet" ? Networks.PUBLIC : Networks.TESTNET;
const hashOf = (xdr) => TransactionBuilder.fromXDR(xdr, NETWORK).hash().toString("hex");

async function rememberChallenge(xdr, ttlSeconds) {
  await pool.query(
    "INSERT INTO public.wallet_auth_challenges (tx_hash, expires_at) VALUES ($1, now() + make_interval(secs => $2))",
    [hashOf(xdr), ttlSeconds],
  );
}

/** Returns true exactly once per unexpired challenge (atomic DELETE). */
async function consumeChallenge(xdr) {
  const { rowCount } = await pool.query(
    "DELETE FROM public.wallet_auth_challenges WHERE tx_hash = $1 AND expires_at > now()",
    [hashOf(xdr)],
  );
  return rowCount === 1;
}

module.exports = { rememberChallenge, consumeChallenge };
