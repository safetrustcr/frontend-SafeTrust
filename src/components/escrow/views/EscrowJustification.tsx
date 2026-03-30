"use client";

import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Props = {
  value: string;
  readOnly?: boolean;
};

export function EscrowJustification({ value, readOnly = true }: Props) {
  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            Escrow justification
          </h3>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                aria-disabled
                aria-label="PDF is currently unavailable"
                className={cn(
                  "gap-2 opacity-60",
                  "cursor-not-allowed pointer-events-auto",
                )}
              >
                <FileDown className="h-4 w-4" aria-hidden />
                PDF
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {/* TODO: wire PDF generation in a separate issue */}
              PDF generation coming soon
            </TooltipContent>
          </Tooltip>
        </div>
        <Textarea
          readOnly={readOnly}
          defaultValue={value}
          className="min-h-[120px] resize-y bg-muted/30"
        />
      </div>
    </TooltipProvider>
  );
}
