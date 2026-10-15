import "server-only";
import { z } from "zod";

const stellarSecretSchema = z
  .string()
  .regex(/^S[A-Z2-7]{55}$/, "Stellar secret seed");
const optionalString = z
  .string()
  .min(1)
  .optional()
  .or(z.literal("").transform(() => undefined));

export const serverSchema = z.object({
  BACKEND_URL: z
    .string()
    .url()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  STELLAR_AUTH_SECRET: stellarSecretSchema,
  STELLAR_AUTH_HOME_DOMAIN: z.string().min(1),
  STELLAR_AUTH_WEB_AUTH_DOMAIN: z.string().min(1),
  STELLAR_NETWORK: z.enum(["testnet", "public"]).default("testnet"),
  STELLAR_HORIZON_URL: z
    .string()
    .url()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  STELLAR_NETWORK_PASSPHRASE: z
    .string()
    .min(1)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  WALLET_AUTH_ALLOWED_ORIGINS: optionalString,
  FIREBASE_ADMIN_PROJECT_ID: z
    .string()
    .min(1)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z
    .string()
    .min(1)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  FIREBASE_ADMIN_CLIENT_EMAIL: z.string().email(),
  FIREBASE_ADMIN_PRIVATE_KEY: z.string().min(1),
  SEP10_SIGNING_SECRET: stellarSecretSchema
    .optional()
    .or(z.literal("").transform(() => undefined)),
  SEP10_HOME_DOMAIN: z
    .string()
    .min(1)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  SEP10_WEB_AUTH_DOMAIN: z
    .string()
    .min(1)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  FIREBASE_AUTH_EMULATOR_HOST: z
    .string()
    .min(1)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  SKIP_AUTH_MIDDLEWARE: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true" && process.env.NODE_ENV !== "production"), // can never be on in prod
});

export type ServerEnv = z.infer<typeof serverSchema>;

let warnedAboutSep10Env = false;

function parseServerValue(prop: keyof ServerEnv) {
  const legacyAliases = {
    STELLAR_AUTH_SECRET: "SEP10_SIGNING_SECRET",
    STELLAR_AUTH_HOME_DOMAIN: "SEP10_HOME_DOMAIN",
    STELLAR_AUTH_WEB_AUTH_DOMAIN: "SEP10_WEB_AUTH_DOMAIN",
  } as const;
  const legacy = legacyAliases[prop as keyof typeof legacyAliases];
  let value = process.env[prop];

  if (!value && legacy && process.env[legacy]) {
    value = process.env[legacy];
    if (!warnedAboutSep10Env) {
      console.warn(
        `Deprecated environment variable ${legacy} is in use. Replace it with ${prop}.`,
      );
      warnedAboutSep10Env = true;
    }
  }

  return serverSchema.shape[prop].parse(value);
}

export const serverEnv = new Proxy({} as ServerEnv, {
  get(_target, prop: string | symbol) {
    if (typeof prop === "string" && prop in serverSchema.shape) {
      return parseServerValue(prop as keyof ServerEnv);
    }
    return undefined;
  },
});
