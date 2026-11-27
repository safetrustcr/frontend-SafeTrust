import { useRef, useState } from "react";
import { MoreHorizontal, FileText, Receipt, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type Column, ResponsiveTable } from "@/components/ui/responsive-table";
import { format } from "date-fns";
import type { BookingAction, EscrowData } from "@/types/dashboard";
import { CancelBookingDialog } from "./CancelBookingDialog";
import { useRouter } from "next/navigation";
import { formatEscrowAmount } from "@/lib/format";

interface EscrowTableProps {
  escrows: EscrowData[];
  onRowUpdated?: (row: EscrowData) => void;
}

const statusBadgeVariant = {
  pending: "outline",
  funded: "default",
  check_in_approved: "secondary",
  check_out_approved: "secondary",
  completed: "default",
  cancelled: "destructive",
} as const;

const statusText = {
  pending: "Pending",
  funded: "Funded",
  check_in_approved: "Check-in Approved",
  check_out_approved: "Check-out Approved",
  completed: "Completed",
  cancelled: "Cancelled",
} as const;

const can = (escrow: EscrowData, action: BookingAction) =>
  escrow.allowedActions?.includes(action) ?? false;

export function EscrowTable({ escrows, onRowUpdated }: EscrowTableProps) {
  const router = useRouter();
  const [cancelTarget, setCancelTarget] = useState<EscrowData | null>(null);
  const menuTriggerId = useRef<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleViewDetails = (escrowId: string) => {
    router.push(`/dashboard/escrow/${escrowId}`);
  };

  const getActionButton = (escrow: EscrowData) => (
    <Button
      variant="outline"
      size="sm"
      onClick={() => handleViewDetails(escrow.id)}
      aria-label={`View escrow ${escrow.metadata?.bookingId || escrow.id}`}
    >
      View
    </Button>
  );

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch {
      return "Invalid date";
    }
  };

  const columns: Column<EscrowData>[] = [
    {
      key: "hotel",
      header: "Hotel",
      primary: true,
      cell: (escrow) => (
        <div className="text-foreground">
          <div className="font-medium">
            {escrow.metadata?.hotelName || "N/A"}
          </div>
          <div className="text-xs font-normal text-muted-foreground">
            {escrow.marker.slice(0, 6)}...{escrow.marker.slice(-4)}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (escrow) => (
        <Badge
          variant={statusBadgeVariant[escrow.status] || "outline"}
          className="whitespace-nowrap"
        >
          {statusText[escrow.status] || escrow.status}
        </Badge>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      className: "text-foreground",
      cell: (escrow) => formatEscrowAmount(escrow.amount, escrow.asset.code),
    },
    {
      key: "checkIn",
      header: "Check-in",
      className: "text-foreground",
      cell: (escrow) => formatDate(escrow.metadata?.checkInDate),
    },
    {
      key: "checkOut",
      header: "Check-out",
      className: "text-foreground",
      cell: (escrow) => formatDate(escrow.metadata?.checkOutDate),
    },
    {
      key: "bookingId",
      header: "Booking ID",
      hideOnMobile: true,
      className: "font-mono text-sm text-muted-foreground",
      cell: (escrow) => escrow.metadata?.bookingId || "N/A",
    },
  ];

  const rowActions = (escrow: EscrowData) => (
    <div className="flex shrink-0 items-center justify-end gap-2">
      {getActionButton(escrow)}
      <DropdownMenu>
        <DropdownMenuTrigger
          asChild
          onPointerDown={() => (menuTriggerId.current = escrow.id)}
          onKeyDown={() => (menuTriggerId.current = escrow.id)}
        >
          <Button
            variant="ghost"
            className="h-8 w-8 p-0"
            aria-label="Open menu"
            data-escrow-trigger={escrow.id}
          >
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            className="cursor-pointer"
            onSelect={() =>
              router.push(
                `/dashboard/escrow/${encodeURIComponent(escrow.id)}#contract`,
              )
            }
          >
            <FileText className="mr-2 h-4 w-4" aria-hidden="true" />
            View contract
          </DropdownMenuItem>
          {escrow.status === "completed" && (
            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={() => handleViewDetails(escrow.id)}
            >
              <Receipt className="h-4 w-4 mr-2" />
              View receipt
            </DropdownMenuItem>
          )}
          {can(escrow, "cancel") && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive cursor-pointer"
                onSelect={() => setCancelTarget(escrow)}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancel booking…
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      className="rounded-md border border-border outline-none"
    >
      <ResponsiveTable
        columns={columns}
        rows={escrows}
        getRowKey={(escrow) => escrow.id}
        rowActions={rowActions}
        emptyMessage="No escrows found."
      />
      {cancelTarget && (
        <CancelBookingDialog
          escrow={cancelTarget}
          onClose={() => setCancelTarget(null)}
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            // Both layouts are in the DOM; only one trigger per row is visible.
            const trigger = Array.from(
              containerRef.current?.querySelectorAll<HTMLElement>(
                "[data-escrow-trigger]",
              ) ?? [],
            ).find(
              (el) =>
                el.dataset.escrowTrigger === menuTriggerId.current &&
                el.offsetParent !== null,
            );
            (trigger ?? containerRef.current)?.focus();
          }}
          onCancelled={(updated) => onRowUpdated?.(updated)}
        />
      )}
    </div>
  );
}
