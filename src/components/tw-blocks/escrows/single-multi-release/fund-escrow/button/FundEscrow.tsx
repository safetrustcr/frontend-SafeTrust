import * as React from "react";
import { Button } from "@/components/ui/button";
import { useEscrowsMutations } from "@/components/tw-blocks/tanstack/useEscrowsMutations";
import { useWalletContext } from "@/components/tw-blocks/wallet-kit/WalletProvider";
import { FundEscrowPayload } from "@trustless-work/escrow/types";
import { toast } from "sonner";
import {
  ErrorResponse,
  handleError,
} from "@/components/tw-blocks/handle-errors/handle";
import { useEscrowContext } from "@/components/tw-blocks/providers/EscrowProvider";
import { Loader2 } from "lucide-react";

type FundEscrowButtonProps = {
  amount: number;
};

export const FundEscrowButton = ({ amount }: FundEscrowButtonProps) => {
  const { fundEscrow } = useEscrowsMutations();
  const { selectedEscrow, updateEscrow } = useEscrowContext();
  const { walletAddress } = useWalletContext();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  async function handleClick() {
    try {
      if (!amount || Number.isNaN(amount)) {
        toast.error("Amount is required");
        return;
      }

      if (amount <= 0) {
        toast.error("Amount must be greater than 0");
        return;
      }

      setIsSubmitting(true);

      /**
       * Create the payload for the fund escrow mutation
       *
       * @returns The payload for the fund escrow mutation
       */
      const payload: FundEscrowPayload = {
        amount: Number(amount),
        contractId: selectedEscrow?.contractId || "",
        signer: walletAddress || "",
      };

      /**
       * Call the fund escrow mutation
       *
       * @param payload - The payload for the fund escrow mutation
       * @param type - The type of the escrow
       * @param address - The address of the escrow
       */
      await fundEscrow.mutateAsync({
        payload,
        type: selectedEscrow?.type || "multi-release",
        address: walletAddress || "",
      });

      updateEscrow({
        ...selectedEscrow,
        amount: (selectedEscrow?.amount || 0) + payload.amount,
      });
      toast.success("Escrow funded successfully");
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
          <span className="ml-2">Funding...</span>
        </div>
      ) : (
        "Fund"
      )}
    </Button>
  );
};
