import { StrKey } from "stellar-sdk";
import { z } from "zod";

const stellarAddressSchema = z
  .string()
  .refine((val) => StrKey.isValidEd25519PublicKey(val), {
    message: "Invalid Stellar public key",
  });

const defaultTrustlessApiUrl =
  process.env.NODE_ENV === "production"
    ? "https://api.trustlesswork.com"
    : "https://dev.api.trustlesswork.com";

const defaultTrustlessNetwork =
  process.env.NODE_ENV === "production" ? "mainnet" : "testnet";

/**
 * Client-safe config. Each key must be referenced *statically* (process.env.NEXT_PUBLIC_X)
 * so Next.js can inline it at build time. Never spread process.env.
 */
export const clientSchema = z.object({
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1),
  NEXT_PUBLIC_TRUSTLESS_API_URL: z
    .string()
    .url()
    .default(defaultTrustlessApiUrl),
  NEXT_PUBLIC_TRUSTLESS_API_KEY: z.string().default(""),
  NEXT_PUBLIC_TRUSTLESS_NETWORK: z
    .enum(["testnet", "mainnet"])
    .default(defaultTrustlessNetwork),
  NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS: stellarAddressSchema.optional(),
  NEXT_PUBLIC_DISPUTE_RESOLVER_ADDRESS: stellarAddressSchema.optional(),
  NEXT_PUBLIC_USDC_ISSUER: stellarAddressSchema.optional(),
  NEXT_PUBLIC_HASURA_GRAPHQL_URL: z
    .string()
    .url()
    .default("http://localhost:8080/v1/graphql"),
  NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: z.string().optional(),
});

export const clientEnv = clientSchema.parse({
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  NEXT_PUBLIC_TRUSTLESS_API_URL:
    process.env.NEXT_PUBLIC_TRUSTLESS_API_URL || undefined,
  NEXT_PUBLIC_TRUSTLESS_API_KEY:
    process.env.NEXT_PUBLIC_TRUSTLESS_API_KEY ?? "",
  NEXT_PUBLIC_TRUSTLESS_NETWORK:
    process.env.NEXT_PUBLIC_TRUSTLESS_NETWORK || undefined,
  NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS:
    process.env.NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS || undefined,
  NEXT_PUBLIC_DISPUTE_RESOLVER_ADDRESS:
    process.env.NEXT_PUBLIC_DISPUTE_RESOLVER_ADDRESS || undefined,
  NEXT_PUBLIC_USDC_ISSUER: process.env.NEXT_PUBLIC_USDC_ISSUER || undefined,
  NEXT_PUBLIC_HASURA_GRAPHQL_URL:
    process.env.NEXT_PUBLIC_HASURA_GRAPHQL_URL || undefined,
  NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID:
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || undefined,
});
