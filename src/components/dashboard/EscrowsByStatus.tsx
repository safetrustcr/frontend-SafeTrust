import {
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { EscrowData } from "@/types/dashboard";
import { useInView } from "@/hooks/useInView";
import { formatAmount } from "@/lib/format";
import type { LucideIcon } from "lucide-react";

interface EscrowsByStatusProps {
  escrows: EscrowData[];
  userRole: "guest" | "hotel" | "admin";
}

interface EscrowStatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  color: string;
}

function EscrowStatCard({
  title,
  value,
  description,
  icon: Icon,
  color,
}: EscrowStatCardProps) {
  const { ref, isInView } = useInView<HTMLDivElement>();

  return (
    <div ref={ref}>
      {isInView ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">
              {title}
            </CardTitle>
            <Icon className={`h-4 w-4 ${color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">{value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
          </CardContent>
        </Card>
      ) : (
        <Card role="status" aria-label={`Loading ${title}`} aria-busy="true">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="h-4 w-28 animate-pulse rounded bg-muted" />
            <div className="h-4 w-4 animate-pulse rounded bg-muted" />
          </CardHeader>
          <CardContent>
            <div className="mb-2 h-8 w-20 animate-pulse rounded bg-muted" />
            <div className="h-3 w-36 animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function EscrowsByStatus({ escrows, userRole }: EscrowsByStatusProps) {
  const stats = {
    total: escrows.length,
    pending: escrows.filter((e) => e.status === "pending").length,
    funded: escrows.filter((e) => e.status === "funded").length,
    completed: escrows.filter((e) => e.status === "completed").length,
    cancelled: escrows.filter((e) => e.status === "cancelled").length,
  };

  const getTotalAmount = () => {
    return escrows.reduce((sum, escrow) => {
      // Skip cancelled escrows from total
      if (escrow.status === "cancelled") return sum;
      return sum + escrow.amount;
    }, 0);
  };

  const getStatusStats = () => {
    if (userRole === "guest") {
      return [
        {
          title: "Active Bookings",
          value: stats.pending + stats.funded,
          icon: Clock,
          color: "text-blue-500",
          description: "Your active reservations",
        },
        {
          title: "Completed Stays",
          value: stats.completed,
          icon: CheckCircle,
          color: "text-green-500",
          description: "Successfully completed",
        },
      ];
    }

    if (userRole === "hotel") {
      return [
        {
          title: "Pending Check-ins",
          value: stats.pending,
          icon: Clock,
          color: "text-yellow-500",
          description: "Awaiting guest confirmation",
        },
        {
          title: "Active Stays",
          value: stats.funded,
          icon: AlertCircle,
          color: "text-blue-500",
          description: "Guests currently staying",
        },
      ];
    }

    // Admin view
    return [
      {
        title: "Active Escrows",
        value: stats.pending + stats.funded,
        icon: AlertCircle,
        color: "text-blue-500",
        description: "Active in the system",
      },
      {
        title: "Completed",
        value: stats.completed,
        icon: CheckCircle,
        color: "text-green-500",
        description: "Successfully completed",
      },
      {
        title: "Cancelled",
        value: stats.cancelled,
        icon: XCircle,
        color: "text-red-500",
        description: "Cancelled or refunded",
      },
    ];
  };

  return (
    <div className="space-y-4">
      <EscrowStatCard
        title="Total Escrow Value"
        value={formatAmount(getTotalAmount())}
        description={`${stats.total} total ${stats.total === 1 ? "escrow" : "escrows"}`}
        icon={DollarSign}
        color="text-muted-foreground"
      />

      <div className="grid gap-4">
        {getStatusStats().map((stat) => (
          <EscrowStatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            description={stat.description}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>
    </div>
  );
}
