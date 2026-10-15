import { z } from "zod";

const edgeSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  SKIP_AUTH_MIDDLEWARE: z
    .enum(["true", "false"])
    .default("false")
    .transform(
      (value) => value === "true" && process.env.NODE_ENV !== "production",
    ),
  NEXT_PUBLIC_SKIP_AUTH_MIDDLEWARE: z.enum(["true", "false"]).default("false"),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1).optional(),
  NEXT_PUBLIC_USE_AUTH_EMULATOR: z.enum(["true", "false"]).default("false"),
  FIREBASE_AUTH_EMULATOR_HOST: z
    .string()
    .min(1)
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

function readEdgeEnv() {
  return {
    NODE_ENV: process.env.NODE_ENV,
    SKIP_AUTH_MIDDLEWARE: process.env.SKIP_AUTH_MIDDLEWARE,
    NEXT_PUBLIC_SKIP_AUTH_MIDDLEWARE:
      process.env.NEXT_PUBLIC_SKIP_AUTH_MIDDLEWARE,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID:
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || undefined,
    NEXT_PUBLIC_USE_AUTH_EMULATOR:
      process.env.NEXT_PUBLIC_USE_AUTH_EMULATOR || undefined,
    FIREBASE_AUTH_EMULATOR_HOST: process.env.FIREBASE_AUTH_EMULATOR_HOST,
  };
}

type EdgeEnv = z.infer<typeof edgeSchema>;

function getEdgeEnvValue<K extends keyof EdgeEnv>(key: K): EdgeEnv[K] {
  return edgeSchema.shape[key].parse(readEdgeEnv()[key]) as EdgeEnv[K];
}

export const edgeEnv = new Proxy({} as EdgeEnv, {
  get(_target, prop: string | symbol) {
    if (typeof prop === "string" && prop in edgeSchema.shape) {
      return getEdgeEnvValue(prop as keyof EdgeEnv);
    }
    return undefined;
  },
});
