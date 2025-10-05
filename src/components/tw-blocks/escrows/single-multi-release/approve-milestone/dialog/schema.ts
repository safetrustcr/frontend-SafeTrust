import { z } from "zod";

export const approveMilestoneSchema = z.object({
  milestoneIndex: z
    .string({ required_error: "Milestone is required" })
    .min(1, { message: "Milestone is required" }),
});

export type ApproveMilestoneValues = z.infer<typeof approveMilestoneSchema>;
