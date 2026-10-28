import { StrKey } from "@stellar/stellar-sdk";
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

export type ClientEnv = z.infer<typeof clientSchema>;
