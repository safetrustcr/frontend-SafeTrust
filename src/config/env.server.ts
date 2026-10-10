import "server-only";
import { z } from "zod";

export const serverSchema = z.object({
  BACKEND_URL: z
    .string()
    .url()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  SKIP_AUTH_MIDDLEWARE: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true" && process.env.NODE_ENV !== "production"), // can never be on in prod
});

export type ServerEnv = z.infer<typeof serverSchema>;

export const serverEnv = new Proxy({} as ServerEnv, {
  get(_target, prop: string | symbol) {
    if (typeof prop === "string" && prop in serverSchema.shape) {
      return serverSchema.parse(process.env)[prop as keyof ServerEnv];
    }
    return undefined;
  },
});
