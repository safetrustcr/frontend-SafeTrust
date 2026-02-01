import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useInitializeEscrowSchema } from "./schema";
import { z } from "zod";
import {
  InitializeMultiReleaseEscrowPayload,
  InitializeMultiReleaseEscrowResponse,
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

  const { getMultiReleaseFormSchema } = useInitializeEscrowSchema();
  const formSchema = getMultiReleaseFormSchema();
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
      milestones: [{ description: "", amount: "" }],
    },
    mode: "onChange",
  });

  const milestones = form.watch("milestones");
  const isAnyMilestoneEmpty = milestones.some(
    (milestone) => milestone.description === ""
  );

  const handleAddMilestone = () => {
    const currentMilestones = form.getValues("milestones");
    const updatedMilestones = [
      ...currentMilestones,
      { description: "", amount: "" },
    ];
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
        { description: "Design the wireframe", amount: 2 },
        { description: "Develop the wireframe", amount: 2 },
        { description: "Deploy the wireframe", amount: 2 },
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

      // Get receiver address (service provider receives the funds)
      const receiverAddress = payload.roles?.serviceProvider || payload.roles?.receiver || "";

      // Remove receiver from roles (not allowed in multi-release API)
      const { receiver, ...rolesWithoutReceiver } = payload.roles;

      /**
       * Create the final payload for the initialize escrow mutation
       * 
       * IMPORTANT for Multi-Release:
       * - Do NOT include roles.receiver (API rejects it)
       * - Each milestone MUST have receiver field
       * - Do NOT include receiverMemo, trustline.decimals, or trustline.issuer
       * - The API expects: trustline.address and trustline.symbol (string)
       *
       * @param payload - The payload from the form
       * @returns The final payload for the initialize escrow mutation
       */
      const finalPayload: InitializeMultiReleaseEscrowPayload = {
        engagementId: payload.engagementId,
        title: payload.title,
        description: payload.description,
        platformFee:
          typeof payload.platformFee === "string"
            ? Number(payload.platformFee)
            : payload.platformFee,
        signer: signerAddress,
        roles: rolesWithoutReceiver, // roles WITHOUT receiver
        milestones: payload.milestones.map((milestone) => ({
          description: milestone.description,
          amount:
            typeof milestone.amount === "string"
              ? Number(milestone.amount)
              : milestone.amount,
          receiver: receiverAddress, // Each milestone needs receiver
        })),
        trustline: {
          address: useIssuerAsAddress ? trustlineIssuer : trustlineAddress,
          symbol: trustlineSymbol,
        },
      };

      /**
       * Call the initialize escrow mutation
       *
       * @param payload - The final payload for the initialize escrow mutation
       * @param type - The type of the escrow
       * @param address - The address of the escrow
       */
      const response: InitializeMultiReleaseEscrowResponse =
        (await deployEscrow.mutateAsync({
          payload: finalPayload,
          type: "multi-release",
          address: walletAddress || "",
        })) as InitializeMultiReleaseEscrowResponse;

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
