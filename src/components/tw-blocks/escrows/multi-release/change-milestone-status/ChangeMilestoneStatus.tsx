"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { useEscrowsMutations } from "@/components/tw-blocks/tanstack/useEscrowsMutations";
import { ChangeMilestoneStatusPayload } from "@trustless-work/escrow/types";
import { toast } from "sonner";
import {
  ErrorResponse,
  handleError,
} from "@/components/tw-blocks/handle-errors/handle";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ChangeMilestoneStatusProps = {
  contractId: string;
  milestoneId: string | number;
  newStatus: string;
  walletAddress: string;
  onSuccess?: (data?: any) => void;
  customMetadata?: Record<string, any>;
  confirmationMessage?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  children?: React.ReactNode;
  evidence?: string;
};

export const ChangeMilestoneStatus = ({
  contractId,
  milestoneId,
  newStatus,
  walletAddress,
  onSuccess,
  customMetadata,
  confirmationMessage,
  variant = "default",
  size = "default",
  className,
  children,
  evidence,
}: ChangeMilestoneStatusProps) => {
  const { changeMilestoneStatus } = useEscrowsMutations();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  async function handleClick() {
    try {
      if (!newStatus || newStatus.trim().length === 0) {
        toast.error("Status is required");
        return;
      }

      if (confirmationMessage && !window.confirm(confirmationMessage)) {
        return;
      }

      setIsSubmitting(true);

      const payload: ChangeMilestoneStatusPayload = {
        contractId,
        milestoneIndex: String(milestoneId),
        newStatus,
        newEvidence: evidence || undefined,
        serviceProvider: walletAddress,
      };

      await changeMilestoneStatus.mutateAsync({
        payload,
        type: "multi-release",
        address: walletAddress,
      });

      toast.success("Milestone status updated successfully");

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
          <span>Updating...</span>
        </div>
      ) : (
        children || "Update Status"
      )}
    </Button>
  );
};
