import { Keypair } from "@stellar/stellar-sdk";

let cachedSecret: string | undefined;
let cachedKp: Keypair | undefined;

export function getServerKp(): Keypair {
  const secret = process.env.SEP10_SIGNING_SECRET;
  if (!secret) {
    if (!cachedKp) {
      cachedKp = Keypair.random();
    }
    return cachedKp;
  }
  if (cachedSecret !== secret || !cachedKp) {
    cachedSecret = secret;
    cachedKp = Keypair.fromSecret(secret);
  }
  return cachedKp;
}

export const SERVER_KP = {
  publicKey: () => getServerKp().publicKey(),
  secret: () => getServerKp().secret(),
  sign: (data: Buffer) => getServerKp().sign(data),
  signDecorated: (data: Buffer) => getServerKp().signDecorated(data),
  verify: (data: Buffer, signature: Buffer) =>
    getServerKp().verify(data, signature),
} as unknown as Keypair;
