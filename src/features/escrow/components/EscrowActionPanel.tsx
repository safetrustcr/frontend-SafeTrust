"use client";

import * as React from "react";
import {
  AlertTriangle,
  Building,
  CheckCircle2,
  Clock,
  Home,
  Lock,
  Send,
  Shield,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatEscrowAmount } from "@/lib/format";
import { cn } from "@/lib/utils";
import type {
  DisputeDetails,
  EscrowLifecycleStatus,
  EscrowUserRole,
  ReleaseOption,
  WalletSigningStatus,
} from "../model/lifecycle";
import { WalletSigningState } from "./WalletSigningState";
import { OpenDisputeModal } from "./OpenDisputeModal";
import { DisputeResolverView } from "./DisputeResolverView";

export interface EscrowActionPanelProps {
  escrowId: string;
  status: EscrowLifecycleStatus;
  role: EscrowUserRole;
  amount: number;
  currency?: string;
  checkOutDate?: string;
  releaseOption?: ReleaseOption;
  hostAddress?: string;
  guestAddress?: string;
  disputeDetails?: DisputeDetails;
  signingStatus?: WalletSigningStatus;
  signingError?: string | null;
  txHash?: string;
  onMarkStayCompleted?: (note?: string) => void;
  onApproveStay?: () => void;
  onApproveAndRelease?: () => void;
  onReleaseFunds?: () => void;
  onOpenDispute?: (data: { reason: string; description: string }) => void;
  onResolveDispute?: (split: {
    guestAmount: number;
    hostAmount: number;
    resolverNotes?: string;
  }) => void;
  onRetrySigning?: () => void;
  onCancelSigning?: () => void;
  onDoneSigning?: () => void;
  className?: string;
}

const MAX_HOST_NOTE_LENGTH = 500;

export function EscrowActionPanel({
  escrowId: _escrowId,
  status,
  role,
  amount,
  currency = "USDC",
  checkOutDate,
  releaseOption = "guest",
  hostAddress,
  guestAddress: _guestAddress,
  disputeDetails,
  signingStatus = "idle",
  signingError,
  txHash,
  onMarkStayCompleted,
  onApproveStay,
  onApproveAndRelease,
  onReleaseFunds,
  onOpenDispute,
  onResolveDispute,
  onRetrySigning,
  onCancelSigning,
  onDoneSigning,
  className,
}: EscrowActionPanelProps) {
  const [hostNote, setHostNote] = React.useState<string>("");
  const [isDisputeModalOpen, setIsDisputeModalOpen] =
    React.useState<boolean>(false);
  const [isConfirmReleaseOpen, setIsConfirmReleaseOpen] =
    React.useState<boolean>(false);

  // Check if checkout has occurred based on checkOutDate
  const isCheckOutPast = React.useMemo(() => {
    if (!checkOutDate) return true;
    const checkoutTime = new Date(checkOutDate).getTime();
    return Date.now() >= checkoutTime;
  }, [checkOutDate]);

  // If currently in a wallet signing state, show the signing UI
  if (signingStatus !== "idle") {
    let actionTitle = "Transaction";
    if (status === "funded" && role === "host")
      actionTitle = "Mark stay completed";
    else if (status === "stay_completed" && role === "guest") {
      actionTitle =
        releaseOption === "guest" ? "Approve and release" : "Approve stay";
    } else if (status === "approved" && role === "platform")
      actionTitle = "Release funds";
    else if (status === "disputed" && role === "resolver")
      actionTitle = "Resolve dispute";

    return (
      <div
        className={cn("rounded-3xl border bg-card p-6 shadow-sm", className)}
      >
        <WalletSigningState
          status={signingStatus}
          actionTitle={actionTitle}
          txHash={txHash}
          error={signingError}
          onRetry={onRetrySigning}
          onCancel={onCancelSigning}
          onDone={onDoneSigning}
        />
      </div>
    );
  }

  // DISPUTED STATE
  if (status === "disputed") {
    if (role === "resolver" && onResolveDispute) {
      return (
        <DisputeResolverView
          totalBalance={amount}
          currency={currency}
          disputeDetails={disputeDetails}
          onResolve={onResolveDispute}
          className={className}
        />
      );
    }

    return (
      <div
        className={cn(
          "rounded-3xl border border-destructive/30 bg-destructive/5 p-6 space-y-4 shadow-sm",
          className,
        )}
        aria-label="Dispute status panel"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-destructive/10 text-destructive">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-bold text-base text-foreground">
              Escrow Disputed
            </h4>
            <p className="text-xs text-muted-foreground">
              Funds are safely paused in the contract awaiting resolver
              determination.
            </p>
          </div>
        </div>

        {disputeDetails && (
          <div className="rounded-2xl border border-border bg-background p-4 space-y-1 text-sm">
            <p className="font-semibold text-foreground">
              Claim: {disputeDetails.reason}
            </p>
            {disputeDetails.description && (
              <p className="text-xs text-muted-foreground">
                &quot;{disputeDetails.description}&quot;
              </p>
            )}
            <p className="text-xs text-muted-foreground pt-1">
              Opened by {disputeDetails.openedBy} · {disputeDetails.openedAt}
            </p>
          </div>
        )}
      </div>
    );
  }

  // RESOLVED STATE
  if (status === "resolved") {
    return (
      <div
        className={cn(
          "rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-6 space-y-3 shadow-sm",
          className,
        )}
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-bold text-base text-foreground">
              Dispute Resolved
            </h4>
            <p className="text-xs text-muted-foreground">
              The dispute resolver has executed the binding payout allocation.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // RELEASED STATE
  if (status === "released") {
    return (
      <div
        className={cn(
          "rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-6 space-y-3 shadow-sm",
          className,
        )}
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-bold text-base text-foreground">
              Escrow Funds Released
            </h4>
            <p className="text-xs text-muted-foreground">
              Full escrow balance of {formatEscrowAmount(amount, currency)} has
              been transferred to the host payout wallet.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // APPROVED STATE
  if (status === "approved") {
    if (releaseOption === "platform" && role === "platform" && onReleaseFunds) {
      return (
        <div
          className={cn(
            "rounded-3xl border border-border bg-card p-6 space-y-4 shadow-sm",
            className,
          )}
          aria-label="Platform release panel"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
                <Send className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-base text-foreground">
                  Platform Release Action
                </h4>
                <p className="text-xs text-muted-foreground">
                  Guest approved the stay. The platform release signer can now
                  transfer funds.
                </p>
              </div>
            </div>
            <span className="font-bold font-mono text-base text-foreground">
              {formatEscrowAmount(amount, currency)}
            </span>
          </div>

          <div className="rounded-2xl border border-border bg-muted/40 p-4 text-xs space-y-1">
            <p className="text-muted-foreground">
              Recipient Host:{" "}
              <span className="font-mono font-medium text-foreground">
                {hostAddress ?? "Registered Host Wallet"}
              </span>
            </p>
          </div>

          <Button
            type="button"
            className="w-full h-12 rounded-2xl text-base font-semibold"
            onClick={onReleaseFunds}
          >
            <Send className="h-4 w-4 mr-2" />
            Release Funds to Host ({formatEscrowAmount(amount, currency)})
          </Button>
        </div>
      );
    }

    return (
      <div
        className={cn(
          "rounded-3xl border border-border bg-card p-6 space-y-3 shadow-sm",
          className,
        )}
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-bold text-base text-foreground">
              Approved, release in progress
            </h4>
            <p className="text-xs text-muted-foreground">
              {role === "guest"
                ? "You approved the stay. SafeTrust platform is executing on-chain release."
                : "Stay has been approved. On-chain release is in progress."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // STAY COMPLETED STATE (Host has completed, Guest acts)
  if (status === "stay_completed") {
    if (role === "guest") {
      return (
        <>
          <div
            className={cn(
              "rounded-3xl border border-border bg-card p-6 space-y-5 shadow-sm",
              className,
            )}
            aria-label="Guest review action panel"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
                  <Home className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-foreground">
                    Stay Completed by Host
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Please inspect your stay experience to approve or dispute
                    the escrow.
                  </p>
                </div>
              </div>
              <span className="font-bold font-mono text-base text-foreground">
                {formatEscrowAmount(amount, currency)}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              {releaseOption === "guest" ? (
                <Button
                  type="button"
                  className="w-full sm:flex-1 h-12 rounded-2xl text-base font-semibold"
                  onClick={() => setIsConfirmReleaseOpen(true)}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Approve and Release
                </Button>
              ) : (
                <Button
                  type="button"
                  className="w-full sm:flex-1 h-12 rounded-2xl text-base font-semibold"
                  onClick={onApproveStay}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Approve Stay
                </Button>
              )}

              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto h-12 rounded-2xl text-destructive hover:bg-destructive/10 border-destructive/30"
                onClick={() => setIsDisputeModalOpen(true)}
              >
                <AlertTriangle className="h-4 w-4 mr-1.5" />
                Open Dispute
              </Button>
            </div>
          </div>

          {/* Option B Confirmation Dialog */}
          <Dialog
            open={isConfirmReleaseOpen}
            onOpenChange={setIsConfirmReleaseOpen}
          >
            <DialogContent className="max-w-md sm:rounded-2xl">
              <DialogHeader>
                <DialogTitle>Approve and Release Funds?</DialogTitle>
                <DialogDescription className="pt-2 text-sm leading-relaxed">
                  You are approving the stay completion and confirming immediate
                  release of{" "}
                  <strong className="text-foreground">
                    {formatEscrowAmount(amount, currency)}
                  </strong>{" "}
                  from escrow to host{" "}
                  <span className="font-mono text-foreground font-medium">
                    {hostAddress ?? "the host"}
                  </span>
                  . This transaction is irrevocable.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2 sm:gap-0 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsConfirmReleaseOpen(false)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setIsConfirmReleaseOpen(false);
                    onApproveAndRelease?.();
                  }}
                  className="rounded-xl"
                >
                  Confirm and Release
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Dispute Modal */}
          {onOpenDispute && (
            <OpenDisputeModal
              isOpen={isDisputeModalOpen}
              onClose={() => setIsDisputeModalOpen(false)}
              onSubmit={(data) => {
                setIsDisputeModalOpen(false);
                onOpenDispute(data);
              }}
            />
          )}
        </>
      );
    }

    return (
      <div
        className={cn(
          "rounded-3xl border border-border bg-card p-6 space-y-3 shadow-sm",
          className,
        )}
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-muted text-muted-foreground">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-bold text-base text-foreground">
              Stay Marked Completed
            </h4>
            <p className="text-xs text-muted-foreground">
              {role === "host"
                ? "You marked this stay completed. Waiting for guest review and approval."
                : "Host completed the stay. Waiting for guest review."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // FUNDED STATE (Stay in progress)
  if (status === "funded") {
    if (role === "host") {
      if (isCheckOutPast) {
        return (
          <div
            className={cn(
              "rounded-3xl border border-border bg-card p-6 space-y-4 shadow-sm",
              className,
            )}
            aria-label="Host stay completion panel"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
                  <Building className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-foreground">
                    Conclude Stay
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Check-out date has passed. Confirm the guest has concluded
                    their stay.
                  </p>
                </div>
              </div>
              <span className="font-bold font-mono text-base text-foreground">
                {formatEscrowAmount(amount, currency)}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="host-completion-note"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Completion Note (Optional)
                </Label>
                <span
                  className={`text-xs ${
                    hostNote.length > MAX_HOST_NOTE_LENGTH
                      ? "text-destructive font-semibold"
                      : "text-muted-foreground"
                  }`}
                >
                  {hostNote.length}/{MAX_HOST_NOTE_LENGTH}
                </span>
              </div>
              <Textarea
                id="host-completion-note"
                value={hostNote}
                onChange={(e) => setHostNote(e.target.value)}
                placeholder="Notes on checkout inspection, key handover, or room condition…"
                className="min-h-[80px] resize-none text-sm"
                maxLength={MAX_HOST_NOTE_LENGTH}
              />
            </div>

            <Button
              type="button"
              className="w-full h-12 rounded-2xl text-base font-semibold"
              onClick={() =>
                onMarkStayCompleted?.(hostNote.trim() || undefined)
              }
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Mark Stay Completed
            </Button>
          </div>
        );
      }

      return (
        <div
          className={cn(
            "rounded-3xl border border-border bg-card p-6 space-y-3 shadow-sm",
            className,
          )}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-muted text-muted-foreground">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-base text-foreground">
                Stay In Progress
              </h4>
              <p className="text-xs text-muted-foreground">
                Scheduled checkout: {checkOutDate ?? "upcoming"}. The &quot;Mark
                stay completed&quot; action unlocks after checkout.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        className={cn(
          "rounded-3xl border border-border bg-card p-6 space-y-3 shadow-sm",
          className,
        )}
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
            <Lock className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-bold text-base text-foreground">
              Payment Locked in Escrow
            </h4>
            <p className="text-xs text-muted-foreground">
              {role === "guest"
                ? `Your payment of ${formatEscrowAmount(amount, currency)} is securely held in escrow throughout your stay.`
                : `Guest payment of ${formatEscrowAmount(amount, currency)} is securely held in escrow.`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // CREATED STATE
  return (
    <div
      className={cn(
        "rounded-3xl border border-border bg-card p-6 space-y-3 shadow-sm",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-2xl bg-muted text-muted-foreground">
          <Shield className="h-6 w-6" />
        </div>
        <div>
          <h4 className="font-bold text-base text-foreground">
            Escrow Contract Initialized
          </h4>
          <p className="text-xs text-muted-foreground">
            Awaiting deposit of {formatEscrowAmount(amount, currency)} to lock
            funds.
          </p>
        </div>
      </div>
    </div>
  );
}
