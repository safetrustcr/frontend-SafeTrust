"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon } from "lucide-react";
import { EscrowStatusBadge } from "@/components/dashboard/EscrowStatusBadge";
import { PageHeader } from "@/components/layouts/PageHeader";
import { Button } from "@/components/ui/button";
import { Column, ResponsiveTable } from "@/components/ui/responsive-table";

const STUB_ESCROWS = [
  { id: "abc-123", property: "La sabana apartment", amount: 4000, status: "PENDING" as const, createdAt: "2025-01-20" },
  { id: "def-456", property: "Casa verde downtown", amount: 2500, status: "ACTIVE" as const, createdAt: "2025-01-15" },
  { id: "ghi-789", property: "Playa escazu suite", amount: 6000, status: "COMPLETED" as const, createdAt: "2025-01-10" },
];

const FILTER_TABS = ["All", "Pending", "Active", "Completed", "Disputed"] as const;
type Escrow = (typeof STUB_ESCROWS)[number];

export default function EscrowPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<(typeof FILTER_TABS)[number]>("All");
  const filteredEscrows = STUB_ESCROWS.filter(
    (escrow) => activeFilter === "All" || escrow.status.toLowerCase() === activeFilter.toLowerCase(),
  );
  const columns: Column<Escrow>[] = [
    {
      key: "id",
      header: "ID",
      cell: (escrow) => <span className="block break-all font-mono text-sm" title={escrow.id}>{escrow.id}</span>,
    },
    {
      key: "property",
      header: "Property",
      primary: true,
      cell: (escrow) => <span className="block min-w-0 truncate font-medium" title={escrow.property}>{escrow.property}</span>,
    },
    {
      key: "amount",
      header: "Amount",
      cell: (escrow) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(escrow.amount),
    },
    { key: "status", header: "Status", cell: (escrow) => <EscrowStatusBadge status={escrow.status} /> },
    { key: "created", header: "Created", cell: (escrow) => escrow.createdAt },
  ];

  return (
    <div className="min-w-0 space-y-6">
      <PageHeader
        title="My Escrows"
        actions={<Button onClick={() => router.push("/bookings/new/escrow")}><PlusIcon className="mr-2 h-4 w-4" />New Escrow</Button>}
      />
      <nav aria-label="Escrow status" className="flex gap-3 overflow-x-auto border-b border-border">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            aria-current={activeFilter === tab ? "page" : undefined}
            onClick={() => setActiveFilter(tab)}
            className={`shrink-0 border-b-2 px-1 py-2 text-sm font-medium ${activeFilter === tab ? "border-blue-500 text-blue-600 dark:text-blue-400" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {tab}
          </button>
        ))}
      </nav>
      <div className="min-w-0 rounded-lg border bg-card shadow-sm">
        <ResponsiveTable
          columns={columns}
          rows={filteredEscrows}
          getRowKey={(escrow) => escrow.id}
          rowActions={(escrow) => (
            <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/escrow/${escrow.id}`)}>
              View
            </Button>
          )}
          emptyMessage="No escrows found."
        />
      </div>
      <p className="text-sm text-muted-foreground">Showing {filteredEscrows.length} of {STUB_ESCROWS.length} escrows</p>
    </div>
  );
}
