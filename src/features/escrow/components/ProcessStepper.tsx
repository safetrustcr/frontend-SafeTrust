"use client";

import React from "react";
import {
  Check,
  Building,
  Lock,
  Home,
  CheckCircle2,
  Send,
  AlertTriangle,
  Scale,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { stellarExpertTxUrl } from "../config";
import type {
  EscrowLifecycleStatus,
  TimelineStepDetail,
} from "../model/lifecycle";

export interface ProcessStepperProps {
  /** Numerical step (1 to 5) for backward compatibility */
  currentStep?: number;
  /** Explicit lifecycle status */
  status?: EscrowLifecycleStatus;
  /** Detailed step metadata (actors, dates, txHashes) */
  stepDetails?: Partial<
    Record<EscrowLifecycleStatus, Partial<TimelineStepDetail>>
  >;
  className?: string;
}

interface StepConfig {
  key: EscrowLifecycleStatus;
  title: string;
  defaultDescription: string;
  defaultActor?: string;
  icon: React.ElementType;
}

const STANDARD_STEPS: StepConfig[] = [
  {
    key: "created",
    title: "Escrow created",
    defaultDescription: "Escrow contract deployed on Stellar testnet.",
    defaultActor: "Guest created the escrow",
    icon: Building,
  },
  {
    key: "funded",
    title: "Payment locked",
    defaultDescription: "Payment securely locked in escrow smart contract.",
    defaultActor: "Guest deposited funds",
    icon: Lock,
  },
  {
    key: "stay_completed",
    title: "Stay completed",
    defaultDescription: "Host confirmed guest checkout and stay completion.",
    defaultActor: "Host marked the stay completed",
    icon: Home,
  },
  {
    key: "approved",
    title: "Approved",
    defaultDescription: "Guest reviewed and approved the completed stay.",
    defaultActor: "Guest approved the stay",
    icon: CheckCircle2,
  },
  {
    key: "released",
    title: "Released",
    defaultDescription: "Funds released from escrow to host payout wallet.",
    defaultActor: "Funds released to host",
    icon: Send,
  },
];

const DISPUTE_STEPS: StepConfig[] = [
  {
    key: "created",
    title: "Escrow created",
    defaultDescription: "Escrow contract deployed on Stellar testnet.",
    defaultActor: "Guest created the escrow",
    icon: Building,
  },
  {
    key: "funded",
    title: "Payment locked",
    defaultDescription: "Payment securely locked in escrow smart contract.",
    defaultActor: "Guest deposited funds",
    icon: Lock,
  },
  {
    key: "disputed",
    title: "Disputed",
    defaultDescription:
      "A dispute was raised. Funds are frozen until resolution.",
    defaultActor: "Guest opened a dispute",
    icon: AlertTriangle,
  },
  {
    key: "resolved",
    title: "Resolved",
    defaultDescription: "Dispute resolved and funds split between parties.",
    defaultActor: "Dispute resolver resolved the escrow",
    icon: Scale,
  },
];

const STATUS_ORDER: Record<EscrowLifecycleStatus, number> = {
  created: 1,
  funded: 2,
  stay_completed: 3,
  approved: 4,
  released: 5,
  disputed: 3,
  resolved: 4,
};

function resolveCurrentStatus(
  status?: EscrowLifecycleStatus,
  currentStep?: number,
): EscrowLifecycleStatus {
  if (status) return status;
  switch (currentStep) {
    case 1:
      return "created";
    case 2:
      return "funded";
    case 3:
      return "stay_completed";
    case 4:
      return "approved";
    case 5:
      return "released";
    default:
      return "funded";
  }
}

export const ProcessStepper = ({
  currentStep,
  status,
  stepDetails,
  className,
}: ProcessStepperProps) => {
  const currentStatus = resolveCurrentStatus(status, currentStep);
  const isDisputeFlow =
    currentStatus === "disputed" || currentStatus === "resolved";
  const steps = isDisputeFlow ? DISPUTE_STEPS : STANDARD_STEPS;

  const currentOrder = STATUS_ORDER[currentStatus];

  return (
    <div className={cn("space-y-6", className)} aria-label="Escrow timeline">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">Escrow Timeline</h3>
        {isDisputeFlow && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border border-destructive/30 bg-destructive/10 text-destructive">
            <AlertTriangle className="h-3 w-3" /> Dispute Flow
          </span>
        )}
      </div>

      <ol className="relative space-y-6" role="list">
        {/* Vertical line connecting steps */}
        <div
          className="absolute left-[19px] top-3 bottom-3 w-0.5 bg-border"
          aria-hidden="true"
        />

        {steps.map((step, index) => {
          const detail = stepDetails?.[step.key];
          const stepOrder = isDisputeFlow ? index + 1 : STATUS_ORDER[step.key];

          const isCurrent = step.key === currentStatus;
          const isCompleted = isDisputeFlow
            ? (currentStatus === "resolved" && step.key === "disputed") ||
              stepOrder < currentOrder
            : stepOrder < currentOrder;

          const isDisputeNode = step.key === "disputed";
          const isResolvedNode = step.key === "resolved";
          const Icon = step.icon;

          const title = detail?.title ?? step.title;
          const description = detail?.description ?? step.defaultDescription;
          const actor = detail?.actor ?? step.defaultActor;
          const date = detail?.date;
          const txHash = detail?.txHash;
          const txUrl =
            detail?.txUrl ?? (txHash ? stellarExpertTxUrl(txHash) : undefined);

          return (
            <li
              key={step.key}
              className="relative flex items-start group"
              {...(isCurrent ? { "aria-current": "step" } : {})}
            >
              <div className="flex items-center h-10">
                <span
                  className={cn(
                    "relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors",
                    isCompleted &&
                      "bg-emerald-500 border-emerald-500 text-white",
                    isCurrent &&
                      !isDisputeNode &&
                      "bg-primary border-primary text-primary-foreground ring-4 ring-primary/20",
                    isCurrent &&
                      isDisputeNode &&
                      "bg-destructive border-destructive text-destructive-foreground ring-4 ring-destructive/20",
                    isCurrent &&
                      isResolvedNode &&
                      "bg-emerald-600 border-emerald-600 text-white ring-4 ring-emerald-500/20",
                    !isCompleted &&
                      !isCurrent &&
                      "bg-muted border-border text-muted-foreground",
                  )}
                  aria-hidden="true"
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </span>
              </div>

              <div className="ml-4 min-w-0 flex-1 pt-1">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <p
                    className={cn(
                      "text-sm font-semibold leading-5",
                      isCurrent
                        ? "text-foreground font-bold"
                        : "text-muted-foreground",
                    )}
                  >
                    {title}
                    {isCurrent && (
                      <span className="sr-only"> (Current step)</span>
                    )}
                  </p>
                  {date && (
                    <time className="text-xs text-muted-foreground font-mono">
                      {date}
                    </time>
                  )}
                </div>

                {actor && (
                  <p className="text-xs text-primary dark:text-primary font-medium mt-0.5">
                    {actor}
                  </p>
                )}

                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {description}
                </p>

                {txUrl && (
                  <div className="mt-1.5">
                    <a
                      href={txUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary underline hover:opacity-80"
                    >
                      <span>
                        Tx:{" "}
                        {txHash
                          ? `${txHash.slice(0, 8)}…`
                          : "View on stellar.expert"}
                      </span>
                      <ExternalLink className="h-3 w-3" />
                      <span className="sr-only">(opens in new tab)</span>
                    </a>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
};
