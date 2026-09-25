import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { EscrowData } from "@/types/escrow";
import { MilestoneProgress } from "./milestone-progress";
import { ApproveMilestone } from "@/components/tw-blocks/escrows/multi-release/approve-milestone/ApproveMilestone";
import { ChangeMilestoneStatus } from "@/components/tw-blocks/escrows/multi-release/change-milestone-status/ChangeMilestoneStatus";
import { useWalletContext } from "@/components/tw-blocks/wallet-kit/WalletProvider";

interface EscrowStatusCardProps {
  escrow: EscrowData;
  userRole: "guest" | "hotel" | "admin";
  onActionComplete?: () => void;
}

const statusColors = {
  pending:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  funded: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  check_in_approved:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  check_out_approved:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  completed:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
} as const;

const statusLabels = {
  pending: "Pending",
  funded: "Funded",
  check_in_approved: "Check-in Approved",
  check_out_approved: "Check-out Approved",
  completed: "Completed",
  cancelled: "Cancelled",
} as const;

export function EscrowStatusCard({
  escrow,
  userRole,
  onActionComplete,
}: EscrowStatusCardProps) {
  const { walletAddress } = useWalletContext();

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (e) {
      return "Invalid date";
    }
  };

  const getActionComponent = () => {
    if (
      userRole === "hotel" &&
      escrow.status === "funded" &&
      escrow.nextMilestone === "check_in"
    ) {
      return (
        <ApproveMilestone
          contractId={escrow.contractId}
          milestoneId="check_in"
          approverWallet={escrow.marker || walletAddress || ""}
          variant="default"
          size="sm"
          onSuccess={onActionComplete}
        />
      );
    }

    if (userRole === "admin" && escrow.status === "check_in_approved") {
      return (
        <ChangeMilestoneStatus
          contractId={escrow.contractId}
          milestoneId="check_out"
          newStatus="completed"
          walletAddress={
            process.env.NEXT_PUBLIC_PLATFORM_WALLET || walletAddress || ""
          }
          variant="default"
          size="sm"
          onSuccess={onActionComplete}
        />
      );
    }

    return null;
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium dark:text-white">
          Booking #{escrow.metadata?.bookingId || "N/A"}
        </CardTitle>
        <Badge
          variant="outline"
          className={`text-xs ${statusColors[escrow.status] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"}`}
        >
          {statusLabels[escrow.status] || escrow.status}
        </Badge>
      </CardHeader>

      <CardContent className="flex-grow">
        <div className="space-y-3">
           <div className="flex justify-between text-sm">
             <span className="text-muted-foreground">Amount:</span>
             <span className="font-medium dark:text-white">
               {(() => {
                 try {
                   return new Intl.NumberFormat("en-US", {
                     style: "currency",
                     currency:
                       escrow.asset.code === "XLM" ? "USD" : escrow.asset.code,
                     minimumFractionDigits: 2,
                     maximumFractionDigits: 6,
                   }).format(escrow.amount);
                 } catch (e) {
                   // Fallback to a simple format
                   const currency =
                     escrow.asset.code === "XLM" ? "USD" : escrow.asset.code;
                   return `${currency} ${escrow.amount.toFixed(2)}`;
                 }
               })()}
             </span>
           </div>

          {escrow.metadata?.hotelName && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Hotel:</span>
              <span className="font-medium dark:text-white">
                {escrow.metadata.hotelName}
              </span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Check-in:</span>
            <span className="font-medium dark:text-white">
              {formatDate(escrow.metadata?.checkInDate)}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Check-out:</span>
            <span className="font-medium dark:text-white">
              {formatDate(escrow.metadata?.checkOutDate)}
            </span>
          </div>

          {escrow.milestones && escrow.milestones.length > 0 && (
            <div className="pt-2">
              <h4 className="text-xs font-medium text-muted-foreground mb-2">
                MILESTONES
              </h4>
              <MilestoneProgress milestones={escrow.milestones} />
            </div>
          )}
        </div>

        {getActionComponent()}
      </CardContent>
    </Card>
  );
}
