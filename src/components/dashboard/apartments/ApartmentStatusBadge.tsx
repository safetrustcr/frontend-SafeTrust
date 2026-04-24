import { cn } from "@/lib/utils";

export type ApartmentOccupancyStatus = "inhabited" | "not_inhabited";

export const STATUS_STYLES: Record<ApartmentOccupancyStatus, string> = {
  inhabited: "bg-green-100 text-green-800",
  not_inhabited: "bg-gray-800 text-white",
};

const STATUS_LABEL: Record<ApartmentOccupancyStatus, string> = {
  inhabited: "Inhabited",
  not_inhabited: "Not inhabited",
};

interface ApartmentStatusBadgeProps {
  status: ApartmentOccupancyStatus;
  className?: string;
}

export function ApartmentStatusBadge({ status, className }: ApartmentStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        STATUS_STYLES[status],
        className,
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
