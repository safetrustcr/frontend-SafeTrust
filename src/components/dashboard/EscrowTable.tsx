import { useRef, useState } from "react";
import { MoreHorizontal, FileText, Receipt, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import type { BookingAction, EscrowData } from "@/types/dashboard";
import { CancelBookingDialog } from "./CancelBookingDialog";
import { useRouter } from "next/navigation";

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

  const formatCurrency = (amount: number, currency: string) => {
    const options = { minimumFractionDigits: 2, maximumFractionDigits: 6 };
    try {
      return new Intl.NumberFormat("en-US", {
        ...options,
        style: "currency",
        currency: currency === "XLM" ? "USD" : currency,
      }).format(amount);
    } catch {
      // Not an ISO 4217 code (e.g. USDC): show the plain amount and the code.
      return `${new Intl.NumberFormat("en-US", options).format(amount)} ${currency}`;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch {
      return "Invalid date";
    }
  };

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      className="bg-white dark:bg-slate-800 rounded-md border border-gray-200 dark:border-slate-700 outline-none"
    >
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-700">
            <TableHead className="w-[50px] text-gray-600 dark:text-gray-300 font-semibold">
              <Checkbox aria-label="Select all escrows" />
            </TableHead>
            <TableHead className="text-gray-600 dark:text-gray-300 font-semibold">
              Booking ID
            </TableHead>
            <TableHead className="text-gray-600 dark:text-gray-300 font-semibold">
              Hotel
            </TableHead>
            <TableHead className="text-gray-600 dark:text-gray-300 font-semibold">
              Check-in
            </TableHead>
            <TableHead className="text-gray-600 dark:text-gray-300 font-semibold">
              Check-out
            </TableHead>
            <TableHead className="text-gray-600 dark:text-gray-300 font-semibold">
              Amount
            </TableHead>
            <TableHead className="text-gray-600 dark:text-gray-300 font-semibold">
              Status
            </TableHead>
            <TableHead className="text-right text-gray-600 dark:text-gray-300 font-semibold">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {escrows.length === 0 ? (
            <TableRow className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <TableCell
                colSpan={8}
                className="h-24 text-center text-gray-600 dark:text-slate-400"
              >
                No escrows found
              </TableCell>
            </TableRow>
          ) : (
            escrows.map((escrow) => (
              <TableRow
                key={escrow.id}
                className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700/50"
              >
                <TableCell>
                  <Checkbox
                    aria-label={`Select escrow ${escrow.metadata?.bookingId || escrow.id}`}
                  />
                </TableCell>
                <TableCell className="font-mono text-sm text-gray-600 dark:text-gray-400">
                  {escrow.metadata?.bookingId || "N/A"}
                </TableCell>
                <TableCell className="text-gray-900 dark:text-white">
                  <div className="font-medium">
                    {escrow.metadata?.hotelName || "N/A"}
                  </div>
                  <div className="text-xs text-muted-foreground dark:text-slate-400">
                    {escrow.marker.slice(0, 6)}...{escrow.marker.slice(-4)}
                  </div>
                </TableCell>
                <TableCell className="text-gray-900 dark:text-white">
                  {formatDate(escrow.metadata?.checkInDate)}
                </TableCell>
                <TableCell className="text-gray-900 dark:text-white">
                  {formatDate(escrow.metadata?.checkOutDate)}
                </TableCell>
                <TableCell className="text-gray-900 dark:text-white">
                  {formatCurrency(escrow.amount, escrow.asset.code)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={statusBadgeVariant[escrow.status] || "outline"}
                    className="whitespace-nowrap"
                  >
                    {statusText[escrow.status] || escrow.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end items-center gap-2">
                    {getActionButton(escrow)}
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        asChild
                        onPointerDown={() =>
                          (menuTriggerId.current = escrow.id)
                        }
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
                              `/dashboard/escrow/${escrow.id}#contract`,
                            )
                          }
                        >
                          <FileText className="h-4 w-4 mr-2" />
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
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {cancelTarget && (
        <CancelBookingDialog
          escrow={cancelTarget}
          onClose={() => setCancelTarget(null)}
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            const trigger = Array.from(
              containerRef.current?.querySelectorAll<HTMLElement>(
                "[data-escrow-trigger]",
              ) ?? [],
            ).find((el) => el.dataset.escrowTrigger === menuTriggerId.current);
            (trigger ?? containerRef.current)?.focus();
          }}
          onCancelled={(updated) => onRowUpdated?.(updated)}
        />
      )}
    </div>
  );
}
