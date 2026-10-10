import { CheckCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type NotificationType = "success" | "info" | "warning";

interface NotificationItemProps {
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  onClick: () => void;
}

const ICON_MAP = {
  success: <CheckCircle className="h-5 w-5 text-green-400" />,
  info: <Info className="h-5 w-5 text-blue-400" />,
  warning: <AlertTriangle className="h-5 w-5 text-yellow-400" />,
};

export function NotificationItem({
  type,
  title,
  message,
  timestamp,
  read,
  onClick,
}: NotificationItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-lg border p-4 transition-colors",
        read
          ? "border-gray-700 bg-transparent"
          : "border-purple-700/40 bg-purple-900/10 hover:bg-purple-900/20"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">{ICON_MAP[type]}</div>
        <div className="flex-1 space-y-0.5">
          <p className={cn("text-sm font-medium", read ? "text-gray-300" : "text-white")}>
            {title}
          </p>
          <p className="text-xs text-gray-400">{message}</p>
          <p className="text-xs text-gray-500">{timestamp}</p>
        </div>
        {!read && (
          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-purple-500" aria-label="Unread" />
        )}
      </div>
    </button>
  );
}
