"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import type { EscrowLifecycleStatus, EscrowUserRole } from "../model/lifecycle";
import { EscrowActionPanel } from "./EscrowActionPanel";

export interface EscrowDetailLifecycleSectionProps {
  escrowId: string;
  status: EscrowLifecycleStatus;
  amount: number;
  currency?: string;
  checkOutDate?: string;
  hostAddress?: string;
  guestAddress?: string;
  initialRole?: EscrowUserRole;
}

export function EscrowDetailLifecycleSection({
  escrowId,
  status: initialStatus,
  amount,
  currency = "USDC",
  checkOutDate,
  hostAddress,
  guestAddress,
  initialRole = "guest",
}: EscrowDetailLifecycleSectionProps) {
  const [status, setStatus] =
    React.useState<EscrowLifecycleStatus>(initialStatus);
  const [role, setRole] = React.useState<EscrowUserRole>(initialRole);
  const [signingStatus, setSigningStatus] = React.useState<
    "idle" | "awaiting-signature" | "submitting" | "done" | "failed"
  >("idle");

  const handleMarkStayCompleted = () => {
    setSigningStatus("awaiting-signature");
    setTimeout(() => {
      setSigningStatus("submitting");
      setTimeout(() => {
        setSigningStatus("done");
        setStatus("stay_completed");
      }, 700);
    }, 700);
  };

  const handleApproveAndRelease = () => {
    setSigningStatus("awaiting-signature");
    setTimeout(() => {
      setSigningStatus("submitting");
      setTimeout(() => {
        setSigningStatus("done");
        setStatus("released");
      }, 700);
    }, 700);
  };

  const handleApproveStay = () => {
    setSigningStatus("awaiting-signature");
    setTimeout(() => {
      setSigningStatus("submitting");
      setTimeout(() => {
        setSigningStatus("done");
        setStatus("approved");
      }, 700);
    }, 700);
  };

  const handleOpenDispute = (_data: {
    reason: string;
    description: string;
  }) => {
    setSigningStatus("awaiting-signature");
    setTimeout(() => {
      setSigningStatus("submitting");
      setTimeout(() => {
        setSigningStatus("done");
        setStatus("disputed");
      }, 700);
    }, 700);
  };

  return (
    <div className="space-y-4">
      {/* Role and demo switch banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl border border-border bg-muted/40 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground">View as role:</span>
          <div className="flex gap-1">
            {(["guest", "host", "platform", "resolver"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`px-2.5 py-1 rounded-lg capitalize transition-colors ${
                  role === r
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <Link
          href="/dashboard/escrow/demo"
          className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Interactive Lifecycle Testbench</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Role Action Panel */}
      <EscrowActionPanel
        escrowId={escrowId}
        status={status}
        role={role}
        amount={amount}
        currency={currency}
        checkOutDate={checkOutDate}
        hostAddress={hostAddress}
        guestAddress={guestAddress}
        signingStatus={signingStatus}
        onMarkStayCompleted={handleMarkStayCompleted}
        onApproveStay={handleApproveStay}
        onApproveAndRelease={handleApproveAndRelease}
        onOpenDispute={handleOpenDispute}
        onDoneSigning={() => setSigningStatus("idle")}
        onCancelSigning={() => setSigningStatus("idle")}
      />
    </div>
  );
}
