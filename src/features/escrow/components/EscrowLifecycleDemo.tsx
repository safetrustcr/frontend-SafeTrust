"use client";

import * as React from "react";
import { Building, Eye, Layers, Scale, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { formatEscrowAmount } from "@/lib/format";
import { cn } from "@/lib/utils";
import type {
  DisputeDetails,
  EscrowLifecycleStatus,
  EscrowUserRole,
  ReleaseOption,
  WalletSigningStatus,
} from "../model/lifecycle";
import { LIFECYCLE_FIXTURES } from "../data/lifecycle-fixtures";
import { ProcessStepper } from "./ProcessStepper";
import { EscrowActionPanel } from "./EscrowActionPanel";
import {
  PlatformReleasesView,
  type ApprovedEscrowItem,
} from "./PlatformReleasesView";

export function EscrowLifecycleDemo() {
  const [selectedFixtureKey, setSelectedFixtureKey] =
    React.useState<string>("stay_completed");
  const [activeRole, setActiveRole] = React.useState<EscrowUserRole>("guest");
  const [releaseOption, setReleaseOption] =
    React.useState<ReleaseOption>("guest");
  const [signingStatus, setSigningStatus] =
    React.useState<WalletSigningStatus>("idle");
  const [signingError, setSigningError] = React.useState<string | null>(null);

  // Editable state clone for interaction
  const fixture = LIFECYCLE_FIXTURES[selectedFixtureKey];
  const [currentStatus, setCurrentStatus] =
    React.useState<EscrowLifecycleStatus>(fixture.status);
  const [disputeDetails, setDisputeDetails] = React.useState<
    DisputeDetails | undefined
  >(fixture.disputeDetails);

  // Sync when fixture dropdown changes
  React.useEffect(() => {
    setCurrentStatus(fixture.status);
    setDisputeDetails(fixture.disputeDetails);
    setSigningStatus("idle");
    setSigningError(null);
  }, [fixture]);

  // Interactive callbacks simulating live on-chain lifecycle transitions
  const handleMarkStayCompleted = (note?: string) => {
    setSigningStatus("awaiting-signature");
    setTimeout(() => {
      setSigningStatus("submitting");
      setTimeout(() => {
        setSigningStatus("done");
        setCurrentStatus("stay_completed");
        if (note) {
          // Log or note applied
        }
      }, 700);
    }, 700);
  };

  const handleApproveStay = () => {
    setSigningStatus("awaiting-signature");
    setTimeout(() => {
      setSigningStatus("submitting");
      setTimeout(() => {
        setSigningStatus("done");
        setCurrentStatus("approved");
      }, 700);
    }, 700);
  };

  const handleApproveAndRelease = () => {
    setSigningStatus("awaiting-signature");
    setTimeout(() => {
      setSigningStatus("submitting");
      setTimeout(() => {
        setSigningStatus("done");
        setCurrentStatus("released");
      }, 700);
    }, 700);
  };

  const handleReleaseFunds = () => {
    setSigningStatus("awaiting-signature");
    setTimeout(() => {
      setSigningStatus("submitting");
      setTimeout(() => {
        setSigningStatus("done");
        setCurrentStatus("released");
      }, 700);
    }, 700);
  };

  const handleOpenDispute = (data: { reason: string; description: string }) => {
    setSigningStatus("awaiting-signature");
    setTimeout(() => {
      setSigningStatus("submitting");
      setTimeout(() => {
        setSigningStatus("done");
        setDisputeDetails({
          reason: data.reason,
          description: data.description,
          openedBy: activeRole === "guest" ? "Guest" : "Host",
          openedAt: new Date().toISOString().split("T")[0],
        });
        setCurrentStatus("disputed");
      }, 700);
    }, 700);
  };

  const handleResolveDispute = (_split: {
    guestAmount: number;
    hostAmount: number;
    resolverNotes?: string;
  }) => {
    setSigningStatus("awaiting-signature");
    setTimeout(() => {
      setSigningStatus("submitting");
      setTimeout(() => {
        setSigningStatus("done");
        setCurrentStatus("resolved");
      }, 700);
    }, 700);
  };

  // Mock approved escrows for Platform Releases View (Option A)
  const approvedEscrows: ApprovedEscrowItem[] = React.useMemo(() => {
    if (currentStatus === "approved") {
      return [
        {
          id: fixture.id,
          contractId: fixture.contractId,
          listingName: fixture.listingName,
          amount: fixture.amount,
          currency: fixture.currency,
          guestAddress: fixture.guestAddress,
          hostAddress: fixture.hostAddress,
          approvedAt: "2025-02-15",
        },
      ];
    }
    return [];
  }, [currentStatus, fixture]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Demo Controls Header */}
      <div className="rounded-3xl border border-primary/20 bg-primary/5 p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-primary/10 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-2xl bg-primary text-primary-foreground">
              <Layers className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                Escrow Lifecycle Interactive Testbench
              </h2>
              <p className="text-xs text-muted-foreground">
                Issue #758 · Verify every state, role permission, release
                option, and dispute split.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary w-fit">
            SafeTrust Soroban Escrow
          </span>
        </div>

        {/* State and Role Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* State preset selector */}
          <div className="space-y-1.5">
            <Label
              htmlFor="demo-fixture-select"
              className="text-xs font-semibold"
            >
              Select Lifecycle State
            </Label>
            <select
              id="demo-fixture-select"
              value={selectedFixtureKey}
              onChange={(e) => setSelectedFixtureKey(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-input bg-background text-foreground text-xs font-medium focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {Object.entries(LIFECYCLE_FIXTURES).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>

          {/* Role selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Simulate Role</Label>
            <div className="flex rounded-xl border border-input bg-background p-1">
              {(
                [
                  { role: "guest", label: "Guest", icon: User },
                  { role: "host", label: "Host", icon: Building },
                  { role: "platform", label: "Admin", icon: Shield },
                  { role: "resolver", label: "Resolver", icon: Scale },
                  { role: "viewer", label: "Viewer", icon: Eye },
                ] as const
              ).map(({ role, label, icon: Icon }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setActiveRole(role)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-colors",
                    activeRole === role
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="h-3 w-3" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Release Option Switcher */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              Release Design Option
            </Label>
            <div className="flex rounded-xl border border-input bg-background p-1">
              <button
                type="button"
                onClick={() => setReleaseOption("guest")}
                className={cn(
                  "flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-colors",
                  releaseOption === "guest"
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Option B (Guest Release)
              </button>
              <button
                type="button"
                onClick={() => setReleaseOption("platform")}
                className={cn(
                  "flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-colors",
                  releaseOption === "platform"
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Option A (Platform Release)
              </button>
            </div>
          </div>
        </div>

        {/* Signing state simulator */}
        <div className="pt-2 border-t border-primary/10 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-muted-foreground font-medium">
            Test Wallet-Signing UI:
          </span>
          <div className="flex flex-wrap gap-1.5">
            <Button
              type="button"
              variant={signingStatus === "idle" ? "secondary" : "outline"}
              size="sm"
              onClick={() => {
                setSigningStatus("idle");
                setSigningError(null);
              }}
              className="h-7 text-xs rounded-lg"
            >
              Idle
            </Button>
            <Button
              type="button"
              variant={
                signingStatus === "awaiting-signature" ? "secondary" : "outline"
              }
              size="sm"
              onClick={() => {
                setSigningStatus("awaiting-signature");
                setSigningError(null);
              }}
              className="h-7 text-xs rounded-lg"
            >
              Awaiting Signature
            </Button>
            <Button
              type="button"
              variant={signingStatus === "submitting" ? "secondary" : "outline"}
              size="sm"
              onClick={() => {
                setSigningStatus("submitting");
                setSigningError(null);
              }}
              className="h-7 text-xs rounded-lg"
            >
              Submitting
            </Button>
            <Button
              type="button"
              variant={signingStatus === "done" ? "secondary" : "outline"}
              size="sm"
              onClick={() => {
                setSigningStatus("done");
                setSigningError(null);
              }}
              className="h-7 text-xs rounded-lg"
            >
              Done
            </Button>
            <Button
              type="button"
              variant={signingStatus === "failed" ? "destructive" : "outline"}
              size="sm"
              onClick={() => {
                setSigningStatus("failed");
                setSigningError("User rejected the signing request in wallet.");
              }}
              className="h-7 text-xs rounded-lg"
            >
              Failed
            </Button>
          </div>
        </div>
      </div>

      {/* Main Presentation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-8">
        <div className="space-y-6">
          {/* Action Panel */}
          <section aria-labelledby="action-panel-heading">
            <h3 id="action-panel-heading" className="sr-only">
              Role Action Panel
            </h3>
            <EscrowActionPanel
              escrowId={fixture.id}
              status={currentStatus}
              role={activeRole}
              amount={fixture.amount}
              currency={fixture.currency}
              checkOutDate={fixture.checkOutDate}
              releaseOption={releaseOption}
              hostAddress={fixture.hostAddress}
              guestAddress={fixture.guestAddress}
              disputeDetails={disputeDetails}
              signingStatus={signingStatus}
              signingError={signingError}
              txHash="4a5b6c7d8e9f0123456789abcdef0123456789abcdef0123456789abcdef0123"
              onMarkStayCompleted={handleMarkStayCompleted}
              onApproveStay={handleApproveStay}
              onApproveAndRelease={handleApproveAndRelease}
              onReleaseFunds={handleReleaseFunds}
              onOpenDispute={handleOpenDispute}
              onResolveDispute={handleResolveDispute}
              onRetrySigning={() => {
                setSigningStatus("submitting");
                setTimeout(() => setSigningStatus("done"), 800);
              }}
              onCancelSigning={() => {
                setSigningStatus("idle");
                setSigningError(null);
              }}
              onDoneSigning={() => {
                setSigningStatus("idle");
                setSigningError(null);
              }}
            />
          </section>

          {/* Option A Admin Releases Table */}
          {releaseOption === "platform" && activeRole === "platform" && (
            <PlatformReleasesView
              escrows={approvedEscrows}
              onRelease={handleReleaseFunds}
            />
          )}

          {/* Context Card */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
            <h4 className="text-base font-bold text-foreground">
              Escrow Context & Active State Summary
            </h4>
            <dl className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <dt className="text-muted-foreground">Listing</dt>
                <dd className="font-semibold text-foreground">
                  {fixture.listingName}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Escrow Balance</dt>
                <dd className="font-mono font-semibold text-foreground">
                  {formatEscrowAmount(fixture.amount, fixture.currency)}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Check-in / Check-out</dt>
                <dd className="text-foreground">
                  {fixture.checkInDate} → {fixture.checkOutDate}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Active Role View</dt>
                <dd className="capitalize font-semibold text-primary">
                  {activeRole}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Timeline Stepper */}
        <aside className="rounded-3xl border border-border bg-card p-6 shadow-sm h-fit">
          <ProcessStepper
            status={currentStatus}
            stepDetails={fixture.stepDetails}
          />
        </aside>
      </div>
    </div>
  );
}
