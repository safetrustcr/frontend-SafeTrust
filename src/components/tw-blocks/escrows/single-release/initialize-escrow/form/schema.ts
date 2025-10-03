import { z } from "zod";
import { isValidWallet } from "../../../../wallet-kit/validators";

export const useInitializeEscrowSchema = () => {
  const getBaseSchema = () => {
    return z.object({
      trustline: z.object({
        address: z.string().min(1, {
          message: "Trustline address is required.",
        }),
        decimals: z.number().default(10000000),
      }),
      roles: z.object({
        approver: z
          .string()
          .min(1, {
            message: "Approver is required.",
          })
          .refine((value) => isValidWallet(value), {
            message: "Approver must be a valid wallet.",
          }),
        serviceProvider: z
          .string()
          .min(1, {
            message: "Service provider is required.",
          })
          .refine((value) => isValidWallet(value), {
            message: "Service provider must be a valid wallet.",
          }),
        platformAddress: z
          .string()
          .min(1, {
            message: "Platform address is required.",
          })
          .refine((value) => isValidWallet(value), {
            message: "Platform address must be a valid wallet.",
          }),
        releaseSigner: z
          .string()
          .min(1, {
            message: "Release signer is required.",
          })
          .refine((value) => isValidWallet(value), {
            message: "Release signer must be a valid wallet.",
          }),
        disputeResolver: z
          .string()
          .min(1, {
            message: "Dispute resolver is required.",
          })
          .refine((value) => isValidWallet(value), {
            message: "Dispute resolver must be a valid wallet.",
          }),
        receiver: z
          .string()
          .min(1, {
            message: "Receiver address is required.",
          })
          .refine((value) => isValidWallet(value), {
            message: "Receiver address must be a valid wallet.",
          }),
      }),
      engagementId: z.string().min(1, {
        message: "Engagement is required.",
      }),
      title: z.string().min(1, {
        message: "Title is required.",
      }),
      description: z.string().min(10, {
        message: "Description must be at least 10 characters long.",
      }),
      platformFee: z
        .union([z.string(), z.number()])
        .refine(
          (val) => {
            if (typeof val === "string") {
              if (val === "" || val === "." || val.endsWith(".")) {
                return true;
              }
              const numVal = Number(val);
              return !isNaN(numVal) && numVal > 0;
            }
            return val > 0;
          },
          {
            message: "Platform fee must be greater than 0.",
          }
        )
        .refine(
          (val) => {
            if (typeof val === "string") {
              if (val === "" || val === "." || val.endsWith(".")) {
                return true;
              }
              const numVal = Number(val);
              if (isNaN(numVal)) return false;
              const decimalPlaces = (numVal.toString().split(".")[1] || "")
                .length;
              return decimalPlaces <= 2;
            }
            const decimalPlaces = (val.toString().split(".")[1] || "").length;
            return decimalPlaces <= 2;
          },
          {
            message: "Platform fee can have a maximum of 2 decimal places.",
          }
        ),
      receiverMemo: z
        .string()
        .optional()
        .refine((val) => !val || val.length >= 1, {
          message: "Receiver Memo must be at least 1.",
        })
        .refine((val) => !val || /^[1-9][0-9]*$/.test(val), {
          message:
            "Receiver Memo must be a whole number greater than 0 (no decimals).",
        }),
    });
  };

  const getSingleReleaseFormSchema = () => {
    const baseSchema = getBaseSchema();

    return baseSchema.extend({
      amount: z
        .union([z.string(), z.number()])
        .refine(
          (val) => {
            if (typeof val === "string") {
              if (val === "" || val === "." || val.endsWith(".")) {
                return true;
              }
              const numVal = Number(val);
              return !isNaN(numVal) && numVal > 0;
            }
            return val > 0;
          },
          {
            message: "Amount must be greater than 0.",
          }
        )
        .refine(
          (val) => {
            if (typeof val === "string") {
              if (val === "" || val === "." || val.endsWith(".")) {
                return true;
              }
              const numVal = Number(val);
              if (isNaN(numVal)) return false;
              const decimalPlaces = (numVal.toString().split(".")[1] || "")
                .length;
              return decimalPlaces <= 2;
            }
            const decimalPlaces = (val.toString().split(".")[1] || "").length;
            return decimalPlaces <= 2;
          },
          {
            message: "Amount can have a maximum of 2 decimal places.",
          }
        ),
      milestones: z
        .array(
          z.object({
            description: z.string().min(1, {
              message: "Milestone description is required.",
            }),
          })
        )
        .min(1, { message: "At least one milestone is required." }),
    });
  };
  return {
    getSingleReleaseFormSchema,
  };
};
