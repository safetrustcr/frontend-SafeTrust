"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Flag, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

interface ReportButtonProps {
  onReport?: () => void;
  className?: string;
}

export default function ReportButton({
  onReport,
  className,
}: ReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");

  const handleOpen = () => {
    if (onReport) onReport();
    setIsOpen(true);
  };

  const handleSubmit = () => {
    setIsOpen(false);
    setReason("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleOpen}
        className={cn(
          "text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors",
          className,
        )}
      >
        <Flag className="w-4 h-4 mr-2" />
        Report this listing
      </Button>

      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Report Listing
          </DialogTitle>
          <DialogDescription>
            Why are you reporting this listing? This will be reviewed by our
            trust and safety team.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Textarea
            placeholder="Please describe the issue..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={!reason.trim()}
          >
            Submit Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
