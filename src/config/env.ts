import { z } from "zod";
import { isValidEd25519PublicKey } from "@/lib/stellar/strkey";

// Keep this module free of `@stellar/stellar-sdk`: it is reached from the root
// layout, error boundaries and Sentry instrumentation, so the SDK would land in
// every route's first-load JS and blow the FE-54 bundle budgets.
const stellarAddressSchema = z
  .string()
  .refine((val) => isValidEd25519PublicKey(val), {
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
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
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
  NEXT_PUBLIC_SKIP_AUTH_MIDDLEWARE: z.enum(["true", "false"]).default("false"),
  NEXT_PUBLIC_PLATFORM_FEE_PERCENT: z.string().optional(),
  NEXT_PUBLIC_BOOKING_TAX_RATE: z.string().optional(),
  NEXT_PUBLIC_DEMO_HOST_WALLET_ADDRESS: z.string().optional(),
  NEXT_PUBLIC_DEMO_MODE: z.enum(["true", "false"]).default("false"),
  NEXT_PUBLIC_USE_AUTH_EMULATOR: z.enum(["true", "false"]).default("false"),
  NEXT_PUBLIC_SENTRY_DSN: z
    .string()
    .url()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  NEXT_PUBLIC_SITE_URL: z
    .string()
    .url()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  NEXT_PUBLIC_API_KEY: z.string().optional(),
});

const runtimeClientSchema = clientSchema.extend({
  NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS: z.string().optional(),
  NEXT_PUBLIC_DISPUTE_RESOLVER_ADDRESS: z.string().optional(),
});

function readClientEnv() {
  return {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID:
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
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
    NEXT_PUBLIC_SKIP_AUTH_MIDDLEWARE:
      process.env.NEXT_PUBLIC_SKIP_AUTH_MIDDLEWARE || undefined,
    NEXT_PUBLIC_PLATFORM_FEE_PERCENT:
      process.env.NEXT_PUBLIC_PLATFORM_FEE_PERCENT,
    NEXT_PUBLIC_BOOKING_TAX_RATE: process.env.NEXT_PUBLIC_BOOKING_TAX_RATE,
    NEXT_PUBLIC_DEMO_HOST_WALLET_ADDRESS:
      process.env.NEXT_PUBLIC_DEMO_HOST_WALLET_ADDRESS,
    NEXT_PUBLIC_DEMO_MODE: process.env.NEXT_PUBLIC_DEMO_MODE || undefined,
    NEXT_PUBLIC_USE_AUTH_EMULATOR:
      process.env.NEXT_PUBLIC_USE_AUTH_EMULATOR || undefined,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN || undefined,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || undefined,
    NEXT_PUBLIC_API_KEY: process.env.NEXT_PUBLIC_API_KEY,
  };
}

export type ClientEnv = z.infer<typeof clientSchema>;

function parseClientEnvValue<K extends keyof ClientEnv>(key: K): ClientEnv[K] {
  return runtimeClientSchema.shape[key].parse(
    readClientEnv()[key],
  ) as ClientEnv[K];
}

export const clientEnv = new Proxy({} as ClientEnv, {
  get(_target, prop: string | symbol) {
    if (typeof prop === "string" && prop in clientSchema.shape) {
      return parseClientEnvValue(prop as keyof ClientEnv);
    }
    return undefined;
  },
});
