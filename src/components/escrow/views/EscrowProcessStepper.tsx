"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EscrowViewKind } from "./getViewForStatus";

const STEPS = [
  { label: "Invoice" },
  { label: "Paid" },
  { label: "Deposit held" },
  { label: "Released" },
] as const;

function filledThroughForView(view: EscrowViewKind): number {
  switch (view) {
    case "paid":
      return 2;
    case "blocked":
      return 3;
    case "released":
      return 4;
    default:
      return 0;
  }
}

export function EscrowProcessStepper({ view }: { view: EscrowViewKind }) {
  const filledThrough = filledThroughForView(view);
  if (filledThrough === 0) return null;

  return (
    <nav aria-label="Escrow process" className="w-full border-b border-border pb-6">
      <ol className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
        {STEPS.map((step, index) => {
          const stepNumber = index + 1;
          const isFilled = stepNumber <= filledThrough;
          return (
            <li key={step.label} className="flex items-center gap-3">
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold",
                  isFilled
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-muted-foreground/30 bg-muted text-muted-foreground",
                )}
              >
                {isFilled ? <Check className="h-4 w-4" aria-hidden /> : stepNumber}
              </span>
              <span
                className={cn(
                  "text-sm font-medium",
                  isFilled ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
