"use client";

import * as React from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DISPUTE_REASONS } from "../model/lifecycle";

export interface OpenDisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { reason: string; description: string }) => void;
  isSubmitting?: boolean;
}

const MAX_DESCRIPTION_LENGTH = 500;

export function OpenDisputeModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}: OpenDisputeModalProps) {
  const [reason, setReason] = React.useState<string>("");
  const [description, setDescription] = React.useState<string>("");
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setReason("");
      setDescription("");
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason) {
      setError("Please select a reason for the dispute.");
      return;
    }

    if (description.length > MAX_DESCRIPTION_LENGTH) {
      setError(
        `Description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters.`,
      );
      return;
    }

    setError(null);
    onSubmit({ reason, description: description.trim() });
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && !isSubmitting && onClose()}
    >
      <DialogContent className="max-w-md sm:rounded-2xl">
        <form noValidate onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <DialogTitle className="text-lg">Open a Dispute</DialogTitle>
            </div>
            <DialogDescription className="text-sm text-muted-foreground pt-1">
              Opening a dispute freezes funds in escrow. A neutral dispute
              resolver will review the case and execute an on-chain split or
              resolution.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div
              role="alert"
              className="p-3 text-xs rounded-xl bg-destructive/10 border border-destructive/20 text-destructive font-medium"
            >
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="dispute-reason" className="text-sm font-medium">
              Dispute Reason <span className="text-destructive">*</span>
            </Label>
            <select
              id="dispute-reason"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError(null);
              }}
              className="w-full h-10 px-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              required
              disabled={isSubmitting}
            >
              <option value="" disabled>
                Select a reason…
              </option>
              {DISPUTE_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="dispute-description"
                className="text-sm font-medium"
              >
                Description & Evidence
              </Label>
              <span
                className={`text-xs ${
                  description.length > MAX_DESCRIPTION_LENGTH
                    ? "text-destructive font-semibold"
                    : "text-muted-foreground"
                }`}
              >
                {description.length}/{MAX_DESCRIPTION_LENGTH}
              </span>
            </div>
            <Textarea
              id="dispute-description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Explain the issue with the stay, listing discrepancies, or reason for disputing release…"
              className="min-h-[100px] resize-none text-sm"
              maxLength={MAX_DESCRIPTION_LENGTH}
              disabled={isSubmitting}
            />
          </div>

          <div className="rounded-xl border border-border bg-muted/40 p-3 text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground">What happens next?</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Escrow payout is placed on hold</li>
              <li>Host and Guest evidence is inspected by the resolver</li>
              <li>Resolver issues the final split binding transaction</li>
            </ul>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={isSubmitting}
              className="rounded-xl"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  Opening dispute…
                </>
              ) : (
                "Confirm and Open Dispute"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
