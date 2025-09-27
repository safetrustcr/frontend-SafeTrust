import { z } from "zod";

export const fundEscrowSchema = z.object({
  amount: z.coerce
    .number({ invalid_type_error: "Amount must be a number" })
    .refine((v) => !Number.isNaN(v), { message: "Amount is required" })
    .refine((v) => v > 0, { message: "Amount must be greater than 0" }),
});

export type FundEscrowValues = z.infer<typeof fundEscrowSchema>;
