import { Keypair } from "@stellar/stellar-sdk";

export const SERVER_KP = Keypair.fromSecret(
  process.env.SEP10_SIGNING_SECRET || Keypair.random().secret(),
);
