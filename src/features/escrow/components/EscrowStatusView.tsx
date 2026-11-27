"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Users,
  Building,
  Banknote,
  IdCard,
  LogOut,
  Check,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CopyButton } from "@/components/ui/copy-button";
import { EscrowStatusBadge } from "@/components/dashboard/EscrowStatusBadge";
import { DEMO_BOOKINGS, type BookingItem } from "@/features/bookings";
import { stellarExpertContractUrl, getPlatformWalletAddress } from "../config";
import { cn } from "@/lib/utils";

export interface EscrowStatusData {
  stayName: string;
  stayImage: string;
  stayDates: string;
  guestCount: number;
  amountLocked: number;
  currency: string;
  status:
    "PENDING" | "ACTIVE" | "FUNDED" | "COMPLETED" | "DISPUTED" | "CANCELLED";
  currentStep: number;
  parties: {
    guest: { address: string; roleLabel: string };
    host: { address: string; roleLabel: string };
    platform: { address: string; roleLabel: string };
  };
  contractId: string;
  lastUpdated: string;
}

export function truncateAddress(address: string): string {
  if (!address || address.length <= 12) return address || "—";
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

const EXPLICIT_DEMO_ESCROW_IDS = new Set([
  "demo-escrow",
  "test-escrow",
  "error-once",
]);

export function resolveEscrowStatusData(
  escrowId: string,
  bookings: BookingItem[] = DEMO_BOOKINGS,
): EscrowStatusData | null {
  if (escrowId === "not-found") return null;

  const booking = bookings.find((b) => b.escrowId === escrowId);
  const platformAddr =
    getPlatformWalletAddress() ||
    "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";

  if (!booking) {
    if (!EXPLICIT_DEMO_ESCROW_IDS.has(escrowId)) return null;
    return {
      stayName: "La Sabana Luxury Apartment",
      stayImage: "/img/room1.png",
      stayDates: "Dec 1 - Dec 5, 2026",
      guestCount: 2,
      amountLocked: 850,
      currency: "USDC",
      status: "ACTIVE",
      currentStep: 2,
      parties: {
        guest: {
          address: "GBDEVUYFLXAU2K244F274WWSJ6N7TR3TDNDO7LMWJ5E",
          roleLabel: "Guest, funded the escrow",
        },
        host: {
          address: "GCFMCFQUZ6HNLR4P4QWXZI3VZZ6N7TR3TDNDO7LMHOST",
          roleLabel: "Host, receives the payout",
        },
        platform: {
          address: platformAddr,
          roleLabel: "Platform, verifies completion & dispute resolver",
        },
      },
      contractId: escrowId,
      lastUpdated: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  }

  // Derive lifecycle step from status
  let currentStep = 2;
  if (booking.status === "ACTIVE") currentStep = 3;
  if (booking.status === "COMPLETED") currentStep = 4;
  if (booking.status === "CANCELLED" || booking.status === "DISPUTED")
    currentStep = 2;

  return {
    stayName: booking.listingName,
    stayImage: booking.listingPhoto,
    stayDates: `${booking.checkIn} - ${booking.checkOut}`,
    guestCount: 2,
    amountLocked: booking.amount,
    currency: booking.currency,
    status: booking.status,
    currentStep,
    parties: {
      guest: {
        address: "GBDEVUYFLXAU2K244F274WWSJ6N7TR3TDNDO7LMWJ5E",
        roleLabel: booking.guestName
          ? `Guest (${booking.guestName}), funded the escrow`
          : "Guest, funded the escrow",
      },
      host: {
        address: "GCFMCFQUZ6HNLR4P4QWXZI3VZZ6N7TR3TDNDO7LMHOST",
        roleLabel: booking.hostName
          ? `Host (${booking.hostName}), receives the payout`
          : "Host, receives the payout",
      },
      platform: {
        address: platformAddr,
        roleLabel: "Platform, verifies completion & dispute resolver",
      },
    },
    contractId: booking.escrowId,
    lastUpdated: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

const LIFECYCLE_STEPS = [
  {
    id: 1,
    title: "Escrow created",
    description: "Terms and smart contract deployed on Stellar network.",
    icon: Building,
  },
  {
    id: 2,
    title: "Payment locked",
    description: "Full booking amount securely deposited in escrow.",
    icon: Banknote,
  },
  {
    id: 3,
    title: "Stay active",
    description: "Funds protected during the guest's check-in and stay.",
    icon: IdCard,
  },
  {
    id: 4,
    title: "Payout released",
    description: "Funds released to host upon seamless stay completion.",
    icon: LogOut,
  },
];

export function EscrowLifecycleTimeline({
  currentStep,
}: {
  currentStep: number;
}) {
  return (
    <div className="space-y-6">
      <h3 className="text-base font-semibold text-foreground">
        Escrow Lifecycle
      </h3>
      <div className="relative space-y-6">
        <div
          className="absolute left-[19px] top-3 bottom-3 w-0.5 bg-border"
          aria-hidden="true"
        />

        {LIFECYCLE_STEPS.map((step) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className="relative flex items-start gap-3.5"
              aria-current={isActive ? "step" : undefined}
            >
              <div className="flex h-10 items-center">
                <span
                  className={cn(
                    "relative z-10 flex h-10 w-10 items-center justify-center rounded-full border border-border text-sm font-medium transition-colors",
                    isActive
                      ? "border-primary bg-primary text-primary-foreground font-semibold"
                      : isCompleted
                        ? "border-emerald-600 bg-emerald-600 text-white dark:border-emerald-500 dark:bg-emerald-500"
                        : "bg-muted text-muted-foreground",
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  )}
                </span>
              </div>
              <div className="min-w-0 flex-1 pt-1.5">
                <p
                  className={cn(
                    "text-sm font-medium leading-none",
                    isActive
                      ? "text-foreground font-semibold"
                      : "text-foreground",
                  )}
                >
                  <span className="sr-only">
                    {isActive
                      ? "Current step: "
                      : isCompleted
                        ? "Completed: "
                        : "Upcoming: "}
                  </span>
                  {step.title}
                </p>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function EscrowStatusView({
  initialData,
  rentalId,
  escrowId,
}: {
  initialData?: EscrowStatusData | null;
  rentalId: string;
  escrowId: string;
}) {
  const [data, setData] = useState<EscrowStatusData | null | undefined>(
    initialData,
  );
  const [isRefreshing, startRefreshing] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // If initialData is not provided, simulate loading fixture
  useEffect(() => {
    if (initialData !== undefined) return;

    setData(undefined);
    setError(null);

    if (escrowId === "not-found") {
      setData(null);
      return;
    }

    if (
      escrowId === "error" ||
      (escrowId === "error-once" && retryCount === 0)
    ) {
      const timer = setTimeout(() => {
        setError("Couldn't load this escrow");
      }, 200);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      const resolved = resolveEscrowStatusData(escrowId);
      setData(resolved);
    }, 400);

    return () => clearTimeout(timer);
  }, [escrowId, initialData, retryCount]);

  const handleRefresh = () => {
    startRefreshing(() => {
      setError(null);
      setData((prev) =>
        prev
          ? {
              ...prev,
              lastUpdated: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              }),
            }
          : prev,
      );
    });
  };

  const handleRetry = () => {
    setError(null);
    setData(undefined);
    setRetryCount((c) => c + 1);
  };

  if (error) {
    return (
      <main className="min-h-screen bg-background px-4 py-10">
        <Card className="mx-auto max-w-2xl border-destructive/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
              Couldn&apos;t load this escrow
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              We encountered an issue retrieving the latest on-chain status for
              this escrow. Please verify your connection and try again.
            </p>
            <div className="flex items-center gap-3">
              <Button onClick={handleRetry} variant="default">
                Retry
              </Button>
              <Button asChild variant="outline">
                <Link href={`/rent/${encodeURIComponent(rentalId)}`}>
                  Back to rental
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (data === null) {
    return (
      <main className="min-h-screen bg-background px-4 py-10">
        <Card className="mx-auto max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle
                className="h-5 w-5 text-amber-500"
                aria-hidden="true"
              />
              Escrow not found
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              We couldn&apos;t find an escrow contract with ID{" "}
              <code className="break-all font-mono text-xs">{escrowId}</code>.
            </p>
            <Button asChild variant="outline">
              <Link href={`/rent/${encodeURIComponent(rentalId)}`}>
                Back to rental
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (data === undefined) {
    return (
      <main className="min-h-screen bg-background px-4 py-10" aria-busy="true">
        <div className="mx-auto max-w-3xl space-y-6">
          <Skeleton className="h-6 w-32" />
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8 md:py-12">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <Link
            href={`/rent/${encodeURIComponent(rentalId)}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to rental
          </Link>
        </div>

        {/* Summary Card */}
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4 border-b pb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Escrow Status
              </p>
              <CardTitle className="mt-1 text-xl font-bold">
                {data.stayName}
              </CardTitle>
            </div>
            <EscrowStatusBadge status={data.status} />
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative h-24 w-28 shrink-0 overflow-hidden rounded-xl border bg-muted">
                <Image
                  src={data.stayImage}
                  alt={data.stayName}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                    Dates
                  </span>
                  <p className="text-sm font-medium text-foreground">
                    {data.stayDates}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="h-3.5 w-3.5" aria-hidden="true" />
                    Guests
                  </span>
                  <p className="text-sm font-medium text-foreground">
                    {data.guestCount}{" "}
                    {data.guestCount === 1 ? "guest" : "guests"}
                  </p>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <span className="text-xs text-muted-foreground">
                    Amount locked
                  </span>
                  <p className="text-xl font-bold text-foreground">
                    ${data.amountLocked.toLocaleString()}{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      {data.currency}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="rounded-xl border bg-card p-5">
              <EscrowLifecycleTimeline currentStep={data.currentStep} />
            </div>

            {/* Parties */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-foreground">
                Parties
              </h3>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border bg-card p-4">
                  <p className="text-xs font-medium text-muted-foreground">
                    {data.parties.guest.roleLabel}
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <code
                      className="font-mono text-xs text-foreground"
                      title={data.parties.guest.address}
                    >
                      {truncateAddress(data.parties.guest.address)}
                    </code>
                    <CopyButton
                      text={data.parties.guest.address}
                      label="Copy"
                      className="px-2 py-1 text-xs"
                    />
                  </div>
                </div>

                <div className="rounded-xl border bg-card p-4">
                  <p className="text-xs font-medium text-muted-foreground">
                    {data.parties.host.roleLabel}
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <code
                      className="font-mono text-xs text-foreground"
                      title={data.parties.host.address}
                    >
                      {truncateAddress(data.parties.host.address)}
                    </code>
                    <CopyButton
                      text={data.parties.host.address}
                      label="Copy"
                      className="px-2 py-1 text-xs"
                    />
                  </div>
                </div>

                <div className="rounded-xl border bg-card p-4">
                  <p className="text-xs font-medium text-muted-foreground">
                    {data.parties.platform.roleLabel}
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <code
                      className="font-mono text-xs text-foreground"
                      title={data.parties.platform.address}
                    >
                      {truncateAddress(data.parties.platform.address)}
                    </code>
                    <CopyButton
                      text={data.parties.platform.address}
                      label="Copy"
                      className="px-2 py-1 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Contract & Links */}
            <div className="flex flex-col gap-4 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">
                  Last updated {data.lastUpdated}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="h-8 gap-1.5 text-xs"
                  >
                    <RefreshCw
                      className={cn(
                        "h-3.5 w-3.5",
                        isRefreshing && "animate-spin",
                      )}
                      aria-hidden="true"
                    />
                    Refresh
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={stellarExpertContractUrl(data.contractId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                >
                  View on Stellar Expert
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
