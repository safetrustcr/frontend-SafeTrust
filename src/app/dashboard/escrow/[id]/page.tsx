import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { EscrowOverviewCard } from "@/components/escrow/EscrowOverviewCard";
import { EscrowStatusBadge } from "@/components/dashboard/EscrowStatusBadge";
import { InvoiceHeader } from "@/components/escrow/InvoiceHeader";
import { ProcessStepper } from "@/components/escrow/ProcessStepper";
import { EscrowPartyInfo } from "@/components/escrow/views/EscrowPartyInfo";
import { MilestoneProgress } from "@/components/dashboard/milestone-progress";
import { getStubEscrow } from "@/lib/mockData/stubEscrow";
import { formatEscrowAmount } from "@/lib/formatEscrowAmount";
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
          className="flex items-center gap-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Escrows
        </Link>
      </div>

      <InvoiceHeader invoiceNumber={escrow.invoiceNumber} status={escrow.status} />

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-6">
        <div className="space-y-6">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm shadow-slate-100/50 dark:border-slate-700 dark:bg-slate-900">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400">Escrow amount</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {formattedAmount}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Escrow address</p>
                  <p className="font-mono text-sm text-gray-900 dark:text-white break-all">
                    {escrow.id}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Issued</p>
                  <p className="text-sm text-gray-900 dark:text-white">{escrow.issued}</p>
                </div>
              </div>

              <div className="flex flex-col justify-between rounded-3xl border border-gray-100 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800">
                <div>
                  <p className="text-sm text-gray-400">Current Status</p>
                  <EscrowStatusBadge status={escrow.status} />
                </div>
                <div className="mt-6">
                  <p className="text-sm text-gray-400">Booking subject</p>
                  <p className="text-sm text-gray-900 dark:text-white">{escrow.subject}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm shadow-slate-100/50 dark:border-slate-700 dark:bg-slate-900">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Process</h2>
              <p className="text-sm text-gray-400 mb-4">
                Timeline view of the escrow status and milestone progress.
              </p>
              <ProcessStepper currentStep={2} />
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm shadow-slate-100/50 dark:border-slate-700 dark:bg-slate-900">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Milestone progress</h2>
              <p className="text-sm text-gray-400 mb-4">
                Review milestone completion, pending steps, and due dates.
              </p>
              <MilestoneProgress milestones={milestoneData} />
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <EscrowPartyInfo variant="tenant" tenant={escrow.tenant} />
            <EscrowPartyInfo variant="owner" owner={escrow.owner} />
            <EscrowPartyInfo variant="beneficiary" beneficiary={escrow.beneficiary} />
          </div>
        </div>

        <div className="space-y-6">
          <EscrowOverviewCard />
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm shadow-slate-100/50 dark:border-slate-700 dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Invoice details</h2>
            <div className="mt-4 grid gap-3">
              <div className="flex justify-between text-sm text-gray-500 dark:text-slate-400">
                <span>Due date</span>
                <span>{escrow.dueDate}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500 dark:text-slate-400">
                <span>Amount billed</span>
                <span>{formattedAmount}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500 dark:text-slate-400">
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
