import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { formatEscrowAmount } from "@/lib/format";
import {
  EscrowContractCard,
  EscrowOverviewCard,
  EscrowPartyInfo,
  getStubEscrow,
  InvoiceHeader,
  ProcessStepper,
} from "@/features/escrow";
import { EscrowStatusBadge } from "@/components/dashboard/EscrowStatusBadge";
import { MilestoneProgress } from "@/components/dashboard/milestone-progress";
import type { Milestone } from "@/types/dashboard";

const milestoneData: Milestone[] = [
  {
    id: "check_in",
    name: "check_in",
    status: "completed",
    dueDate: "2025-02-01",
    completedAt: "2025-01-28",
  },
  {
    id: "stay",
    name: "stay",
    status: "in_progress",
    dueDate: "2025-02-10",
  },
  {
    id: "check_out",
    name: "check_out",
    status: "pending",
    dueDate: "2025-02-15",
  },
];

export default async function EscrowDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const stub = getStubEscrow(id);

  // When the real Hasura query is wired (BE-03), replace getStubEscrow with a
  // server-side fetch filtered by the authenticated user's id. If the query
  // returns null (id doesn't exist or belongs to another user), call notFound()
  // so the page shows 404 instead of revealing that the id exists.
  if (!stub) {
    notFound();
  }
  const amount = 4000;
  const currency = "USDC";
  const formattedAmount = formatEscrowAmount(amount, currency);
  const escrow = {
    ...stub,
    status: "FUNDED" as const,
    amount,
    currency,
    subtotal: formattedAmount,
    discount: formatEscrowAmount(0, currency),
    total: formattedAmount,
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-2 text-sm w-fit">
        <Link
          href="/dashboard/escrow"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Escrows
        </Link>
      </div>

      <InvoiceHeader
        invoiceNumber={escrow.invoiceNumber}
        status={escrow.status}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-6">
        <div className="space-y-6">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Escrow amount</p>
                  <p className="text-2xl font-semibold text-foreground">
                    {formattedAmount}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Escrow address
                  </p>
                  <p className="font-mono text-sm text-foreground break-all">
                    {escrow.id}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Issued</p>
                  <p className="text-sm text-foreground">{escrow.issued}</p>
                </div>
              </div>

              <div className="flex flex-col justify-between rounded-3xl border border-border bg-muted p-5">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Current Status
                  </p>
                  <EscrowStatusBadge status={escrow.status} />
                </div>
                <div className="mt-6">
                  <p className="text-sm text-muted-foreground">
                    Booking subject
                  </p>
                  <p className="text-sm text-foreground">{escrow.subject}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-foreground">Process</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Timeline view of the escrow status and milestone progress.
              </p>
              <ProcessStepper currentStep={2} />
            </div>

            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-foreground">
                Milestone progress
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Review milestone completion, pending steps, and due dates.
              </p>
              <MilestoneProgress milestones={milestoneData} />
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <EscrowPartyInfo variant="tenant" tenant={escrow.tenant} />
            <EscrowPartyInfo variant="owner" owner={escrow.owner} />
            <EscrowPartyInfo
              variant="beneficiary"
              beneficiary={escrow.beneficiary}
            />
          </div>
        </div>

        <div className="space-y-6">
          <EscrowOverviewCard />
          <EscrowContractCard contractId={escrow.contractId} />
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground">
              Invoice details
            </h2>
            <div className="mt-4 grid gap-3">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Due date</span>
                <span>{escrow.dueDate}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Amount billed</span>
                <span>{formattedAmount}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Billing details</span>
                <span>{escrow.billingDetails}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
