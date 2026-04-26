import * as React from "react";
import { Button } from "@/components/ui/button";
import { useEscrowsMutations } from "@/components/tw-blocks/tanstack/useEscrowsMutations";
import { useWalletContext } from "@/components/tw-blocks/wallet-kit/WalletProvider";
import { ChangeMilestoneStatusPayload } from "@trustless-work/escrow/types";
import { toast } from "sonner";
import {
  ErrorResponse,
  handleError,
} from "@/components/tw-blocks/handle-errors/handle";
import { useEscrowContext } from "@/components/tw-blocks/providers/EscrowProvider";
import { Loader2 } from "lucide-react";

type ChangeMilestoneStatusButtonProps = {
  status: string;
  evidence?: string;
  milestoneIndex: number | string;
};

export const ChangeMilestoneStatusButton = ({
  status,
  evidence,
  milestoneIndex,
}: ChangeMilestoneStatusButtonProps) => {
  const { changeMilestoneStatus } = useEscrowsMutations();
  const { selectedEscrow } = useEscrowContext();
  const { walletAddress } = useWalletContext();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  async function handleClick() {
    try {
      if (!status || status.trim().length === 0) {
        toast.error("Status is required");
        return;
      }

      setIsSubmitting(true);

      /**
       * Create the payload for the change milestone status mutation
       *
       * @param status - The status to change
       * @param evidence - The evidence to change
       * @param milestoneIndex - The index of the milestone to change
       * @returns The payload for the change milestone status mutation
       */
      const payload: ChangeMilestoneStatusPayload = {
        contractId: selectedEscrow?.contractId || "",
        milestoneIndex: String(milestoneIndex),
        newStatus: status,
        newEvidence: evidence || undefined,
        serviceProvider: walletAddress || "",
      };

      /**
       * Call the change milestone status mutation
       *
       * @param payload - The payload for the change milestone status mutation
       * @param type - The type of the escrow
       * @param address - The address of the escrow
       */
      await changeMilestoneStatus.mutateAsync({
        payload,
        type: selectedEscrow?.type || "multi-release",
        address: walletAddress || "",
      });

      toast.success("Milestone status updated successfully");
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
          <span className="ml-2">Updating...</span>
        </div>
      ) : (
        "Update Status"
      )}
    </Button>
  );
};
