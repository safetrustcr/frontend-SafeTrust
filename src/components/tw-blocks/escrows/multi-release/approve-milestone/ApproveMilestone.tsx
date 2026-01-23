"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { useEscrowsMutations } from "@/components/tw-blocks/tanstack/useEscrowsMutations";
import { useWalletContext } from "@/components/tw-blocks/wallet-kit/WalletProvider";
import { ApproveMilestonePayload } from "@trustless-work/escrow/types";
import { toast } from "sonner";
import {
  ErrorResponse,
  handleError,
} from "@/components/tw-blocks/handle-errors/handle";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ApproveMilestoneProps = {
  contractId: string;
  milestoneId: string | number;
  approverWallet: string;
  onSuccess?: (data?: any) => void;
  customMetadata?: Record<string, any>;
  confirmationMessage?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  children?: React.ReactNode;
};

export const ApproveMilestone = ({
  contractId,
  milestoneId,
  approverWallet,
  onSuccess,
  customMetadata,
  confirmationMessage,
  variant = "default",
  size = "default",
  className,
  children,
}: ApproveMilestoneProps) => {
  const { approveMilestone } = useEscrowsMutations();
  const { walletAddress } = useWalletContext();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  async function handleClick() {
    try {
      if (confirmationMessage && !window.confirm(confirmationMessage)) {
        return;
      }

      setIsSubmitting(true);

      const payload: ApproveMilestonePayload = {
        contractId,
        milestoneIndex: String(milestoneId),
        approver: approverWallet || walletAddress || "",
        newFlag: true,
      };

      await approveMilestone.mutateAsync({
        payload,
        type: "multi-release",
        address: approverWallet || walletAddress || "",
      });

      toast.success("Milestone approved successfully");

      if (onSuccess) {
        onSuccess({ ...payload, customMetadata });
      }
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
      variant={variant}
      size={size}
      className={cn("cursor-pointer", className)}
    >
      {isSubmitting ? (
        <div className="flex items-center">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span>Approving...</span>
        </div>
      ) : (
        children || "Approve Milestone"
      )}
    </Button>
  );
};
