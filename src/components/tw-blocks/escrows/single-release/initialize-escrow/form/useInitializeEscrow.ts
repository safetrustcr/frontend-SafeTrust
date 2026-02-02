import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useInitializeEscrowSchema } from "./schema";
import { z } from "zod";
import {
  InitializeSingleReleaseEscrowPayload,
  InitializeSingleReleaseEscrowResponse,
} from "@trustless-work/escrow/types";
import { toast } from "sonner";
import { useWalletContext } from "@/components/tw-blocks/wallet-kit/WalletProvider";
import { useEscrowsMutations } from "@/components/tw-blocks/tanstack/useEscrowsMutations";
import {
  ErrorResponse,
  handleError,
} from "@/components/tw-blocks/handle-errors/handle";
import { useEscrowContext } from "@/components/tw-blocks/providers/EscrowProvider";
import { trustlineOptions } from "@/components/tw-blocks/wallet-kit/trustlines";

export function useInitializeEscrow() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const { getSingleReleaseFormSchema } = useInitializeEscrowSchema();
  const formSchema = getSingleReleaseFormSchema();
  const { setSelectedEscrow } = useEscrowContext();

  const { walletAddress } = useWalletContext();
  const { deployEscrow } = useEscrowsMutations();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      engagementId: "",
      title: "",
      description: "",
      platformFee: undefined,
      amount: undefined,
      receiverMemo: "",
      trustline: {
        address: "",
        decimals: 10000000,
      },
      roles: {
        approver: "",
        serviceProvider: "",
        platformAddress: "",
        receiver: "",
        releaseSigner: "",
        disputeResolver: "",
      },
      milestones: [{ description: "" }],
    },
    mode: "onChange",
  });

  const milestones = form.watch("milestones");
  const isAnyMilestoneEmpty = milestones.some(
    (milestone) => milestone.description === ""
  );

  const handleAddMilestone = () => {
    const currentMilestones = form.getValues("milestones");
    const updatedMilestones = [...currentMilestones, { description: "" }];
    form.setValue("milestones", updatedMilestones);
  };

  const handleRemoveMilestone = (index: number) => {
    const currentMilestones = form.getValues("milestones");
    const updatedMilestones = currentMilestones.filter((_, i) => i !== index);
    form.setValue("milestones", updatedMilestones);
  };

  const fillTemplateForm = () => {
    const usdc = trustlineOptions.find((t) => t.label === "USDC");

    const templateData: z.infer<typeof formSchema> = {
      engagementId: "ENG-001",
      title: "Design Landing Page",
      description: "Landing for the new product of the company.",
      platformFee: 5,
      amount: 5,
      receiverMemo: "123",
      trustline: {
        address: usdc?.value || "",
        decimals: 10000000,
      },
      roles: {
        approver: walletAddress || "",
        serviceProvider: walletAddress || "",
        platformAddress: walletAddress || "",
        receiver: walletAddress || "",
        releaseSigner: walletAddress || "",
        disputeResolver: walletAddress || "",
      },
      milestones: [
        { description: "Design the wireframe" },
        { description: "Develop the wireframe" },
        { description: "Deploy the wireframe" },
      ],
    };

    // Set form values
    Object.entries(templateData).forEach(([key, value]) => {
      form.setValue(key as keyof z.infer<typeof formSchema>, value);
    });

    // Explicitly set the trustline field
    form.setValue("trustline.address", usdc?.value || "");
    form.setValue("trustline.decimals", 10000000);
  };

  const handleSubmit = form.handleSubmit(async (payload) => {
    try {
      setIsSubmitting(true);

      // Use the approver address as the signer (they're the same - the person initiating)
      // Priority: 1) roles.approver from form, 2) walletAddress from context, 3) localStorage
      let signerAddress = payload.roles?.approver || walletAddress;
      
      if (!signerAddress) {
        try {
          const stored = localStorage.getItem("address-wallet");
          if (stored) {
            const parsed = JSON.parse(stored);
            signerAddress = parsed?.state?.address || parsed?.address || "";
          }
        } catch (e) {
          console.warn("Failed to get wallet from SafeTrust store:", e);
        }
      }

      if (!signerAddress) {
        toast.error("Please connect your wallet first");
        setIsSubmitting(false);
        return;
      }

      // Find the trustline symbol and issuer from the address
      const selectedTrustline = trustlineOptions.find(
        (t) => t.value === payload.trustline?.address
      );
      const trustlineSymbol = selectedTrustline?.label || "USDC";
      const trustlineIssuer = (selectedTrustline as any)?.issuer;
      
      // If the address is a Soroban contract (starts with C), use the issuer instead
      // The API may not accept Soroban contract addresses directly
      const trustlineAddress = payload.trustline?.address || "";
      const useIssuerAsAddress = trustlineAddress.startsWith("C") && trustlineIssuer;

      /**
       * Create the final payload for the initialize escrow mutation
       * 
       * IMPORTANT: Do NOT include receiverMemo, trustline.decimals, or trustline.issuer
       * The API expects: trustline.address (may need issuer for Soroban contracts) and trustline.symbol (string)
       *
       * @param payload - The payload from the form
       * @returns The final payload for the initialize escrow mutation
       */
      const finalPayload: InitializeSingleReleaseEscrowPayload = {
        engagementId: payload.engagementId,
        title: payload.title,
        description: payload.description,
        amount:
          typeof payload.amount === "string"
            ? Number(payload.amount)
            : payload.amount,
        platformFee:
          typeof payload.platformFee === "string"
            ? Number(payload.platformFee)
            : payload.platformFee,
        signer: signerAddress,
        roles: payload.roles,
        milestones: payload.milestones,
        trustline: {
          address: useIssuerAsAddress ? trustlineIssuer : trustlineAddress,
        },
      };

      /**
       * Call the initialize escrow mutation
       *
       * @param payload - The final payload for the initialize escrow mutation
       * @param type - The type of the escrow
       * @param address - The address of the escrow
       */
      const response: InitializeSingleReleaseEscrowResponse =
        (await deployEscrow.mutateAsync({
          payload: finalPayload,
          type: "single-release",
          address: walletAddress || "",
        })) as InitializeSingleReleaseEscrowResponse;

      toast.success("Escrow initialized successfully");

      setSelectedEscrow({ ...finalPayload, contractId: response.contractId });
    } catch (error) {
      toast.error(handleError(error as ErrorResponse).message);
    } finally {
      setIsSubmitting(false);
      form.reset();
    }
  });

  return {
    form,
    isSubmitting,
    milestones,
    isAnyMilestoneEmpty,
    fillTemplateForm,
    handleSubmit,
    handleAddMilestone,
    handleRemoveMilestone,
  };
}
