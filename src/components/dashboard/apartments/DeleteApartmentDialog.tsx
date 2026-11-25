"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { describeApartmentError } from "@/features/apartments";

interface DeleteApartmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apartmentName: string;
  /** Removes the apartment. A rejection keeps the dialog open with its message. */
  onConfirm: () => Promise<void>;
}

export function DeleteApartmentDialog({
  open,
  onOpenChange,
  apartmentName,
  onConfirm,
}: DeleteApartmentDialogProps) {
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenChange = (next: boolean) => {
    if (removing) return;
    setError(null);
    onOpenChange(next);
  };

  const handleConfirm = async () => {
    setRemoving(true);
    setError(null);
    try {
      await onConfirm();
      setRemoving(false);
      onOpenChange(false);
    } catch (removeError) {
      setError(describeApartmentError(removeError).message);
      setRemoving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove apartment</DialogTitle>
          <DialogDescription>
            Remove <strong>{apartmentName}</strong>? It will no longer be
            listed. Existing bookings and offers aren&apos;t affected.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <p
            role="alert"
            className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
          >
            {error}
          </p>
        )}
        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={removing}
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={removing}
            onClick={handleConfirm}
          >
            {removing ? "Removing..." : "Remove"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
