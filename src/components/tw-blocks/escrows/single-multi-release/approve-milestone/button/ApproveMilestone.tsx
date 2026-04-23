import * as React from "react";
import { Button } from "@/components/ui/button";
import { useEscrowsMutations } from "@/components/tw-blocks/tanstack/useEscrowsMutations";
import { useWalletContext } from "@/components/tw-blocks/wallet-kit/WalletProvider";
import {
  ApproveMilestonePayload,
  MultiReleaseMilestone,
} from "@trustless-work/escrow/types";
import { toast } from "sonner";
import {
  ErrorResponse,
  handleError,
} from "@/components/tw-blocks/handle-errors/handle";
import { useEscrowContext } from "@/components/tw-blocks/providers/EscrowProvider";
import { Loader2 } from "lucide-react";

type ApproveMilestoneButtonProps = {
  milestoneIndex: number | string;
};

export const ApproveMilestoneButton = ({
  milestoneIndex,
}: ApproveMilestoneButtonProps) => {
  const { approveMilestone } = useEscrowsMutations();
  const { selectedEscrow, updateEscrow } = useEscrowContext();
  const { walletAddress } = useWalletContext();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  async function handleClick() {
    try {
      setIsSubmitting(true);

      /**
       * Create the payload for the approve milestone mutation
       *
       * @param milestoneIndex - The index of the milestone to approve
       * @returns The payload for the approve milestone mutation
       */
      const payload: ApproveMilestonePayload = {
        contractId: selectedEscrow?.contractId || "",
        milestoneIndex: String(milestoneIndex),
        approver: walletAddress || "",
      };

      /**
       * Call the approve milestone mutation
       *
       * @param payload - The payload for the approve milestone mutation
       * @param type - The type of the escrow
       * @param address - The address of the escrow
       */
      await approveMilestone.mutateAsync({
        payload,
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
    }
  }

  return (
    <Button
      type="button"
      disabled={isSubmitting}
      onClick={handleClick}
      className="cursor-pointer w-full"
    >
      {isSubmitting ? (
        <div className="flex items-center">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="ml-2">Approving...</span>
        </div>
      ) : (
        "Approve Milestone"
      )}
    </Button>
  );
};
