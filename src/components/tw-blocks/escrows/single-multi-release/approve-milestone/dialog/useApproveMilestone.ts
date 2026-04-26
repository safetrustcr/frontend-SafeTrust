import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { approveMilestoneSchema, type ApproveMilestoneValues } from "./schema";
import { toast } from "sonner";
import {
  ApproveMilestonePayload,
  MultiReleaseMilestone,
} from "@trustless-work/escrow";
import { useEscrowContext } from "@/components/tw-blocks/providers/EscrowProvider";
import { useEscrowsMutations } from "@/components/tw-blocks/tanstack/useEscrowsMutations";
import {
  ErrorResponse,
  handleError,
} from "@/components/tw-blocks/handle-errors/handle";
import { useWalletContext } from "@/components/tw-blocks/wallet-kit/WalletProvider";

export function useApproveMilestone() {
  const { approveMilestone } = useEscrowsMutations();
  const { selectedEscrow, updateEscrow } = useEscrowContext();
  const { walletAddress } = useWalletContext();

  const form = useForm<ApproveMilestoneValues>({
    resolver: zodResolver(approveMilestoneSchema),
    defaultValues: {
      milestoneIndex: "0",
    },
    mode: "onChange",
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = form.handleSubmit(async (payload) => {
    try {
      setIsSubmitting(true);

      const finalPayload: ApproveMilestonePayload = {
        contractId: selectedEscrow?.contractId || "",
        milestoneIndex: payload.milestoneIndex,
        approver: walletAddress || "",
      };

      await approveMilestone.mutateAsync({
        payload: finalPayload,
        type: selectedEscrow?.type || "multi-release",
        address: walletAddress || "",
      });

      toast.success("Milestone approved flag updated successfully");

      updateEscrow({
        ...selectedEscrow,
        milestones: selectedEscrow?.milestones.map((milestone, index) => {
          if (index === Number(payload.milestoneIndex)) {
            if (selectedEscrow?.type === "single-release") {
              return { ...milestone, approved: true };
            } else {
              return {
                ...milestone,
                flags: {
                  ...(milestone as MultiReleaseMilestone).flags,
                  approved: true,
                },
              };
            }
          }
          return milestone;
        }),
      });
    } catch (error) {
      toast.error(handleError(error as ErrorResponse).message);
    } finally {
      setIsSubmitting(false);
      form.reset();
    }
  });

  return { form, handleSubmit, isSubmitting };
}
