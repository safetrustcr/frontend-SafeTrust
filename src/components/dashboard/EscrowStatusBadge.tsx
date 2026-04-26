import { cn } from "@/lib/utils";

interface EscrowStatusBadgeProps {
  status: 'PENDING' | 'ACTIVE' | 'FUNDED' | 'COMPLETED' | 'DISPUTED' | 'CANCELLED';
  className?: string;
}

const statusConfig = {
  PENDING: {
    className: "bg-amber-100 text-amber-800 border-amber-200",
    icon: "🟡",
    text: "Pending"
  },
  ACTIVE: {
    className: "bg-green-100 text-green-800 border-green-200", 
    icon: "🟢",
    text: "Active"
  },
  FUNDED: {
    className: "bg-green-100 text-green-800 border-green-200",
    icon: "🟢", 
    text: "Funded"
  },
  COMPLETED: {
    className: "bg-blue-100 text-blue-800 border-blue-200",
    icon: "🔵",
    text: "Completed"
  },
  DISPUTED: {
    className: "bg-red-100 text-red-800 border-red-200",
    icon: "🔴",
    text: "Disputed"
  },
  CANCELLED: {
    className: "bg-gray-100 text-gray-600 border-gray-200",
    icon: "⚪",
    text: "Cancelled"
  }
};

export function EscrowStatusBadge({ status, className }: EscrowStatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border",
        config.className,
        className
      )}
    >
      <span className="text-xs">{config.icon}</span>
      {config.text}
    </span>
  );
}
