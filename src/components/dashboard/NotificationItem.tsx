"use client";

import { AlertTriangle, CheckCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Notification } from "@/hooks/useNotifications";

interface NotificationItemProps extends Omit<Notification, "id"> {
  onClick?: () => void;
}

const ICONS = {
  success: {
    Icon: CheckCircle,
    className: "text-emerald-600 dark:text-emerald-400",
    label: "Success",
  },
  info: {
    Icon: Info,
    className: "text-sky-700 dark:text-sky-300",
    label: "Info",
  },
  warning: {
    Icon: AlertTriangle,
    className: "text-amber-700 dark:text-amber-300",
    label: "Warning",
  },
} as const;

export function NotificationItem({
  type,
  title,
  message,
  timestamp,
  read,
  onClick,
}: NotificationItemProps) {
  const { Icon, className: iconClassName, label } = ICONS[type];

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        read
          ? "border-border bg-card hover:bg-muted/60"
          : "border-sky-300 bg-sky-50 hover:bg-sky-100 dark:border-sky-700 dark:bg-sky-950/40 dark:hover:bg-sky-950/60",
      )}
    >
      <div className="flex items-start gap-3">
        <Icon
          className={cn("mt-0.5 h-5 w-5 shrink-0", iconClassName)}
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1 space-y-0.5">
          <p
            className={cn(
              "break-words text-sm text-card-foreground",
              read ? "font-medium" : "font-semibold",
            )}
          >
            <span className="sr-only">
              {read ? "" : "Unread. "}
              {label}:{" "}
            </span>
            {title}
          </p>
          <p
            className={cn(
              "break-words text-sm",
              read
                ? "text-muted-foreground"
                : "text-slate-700 dark:text-muted-foreground",
            )}
          >
            {message}
          </p>
          <p
            className={cn(
              "break-words text-xs",
              read
                ? "text-muted-foreground"
                : "text-slate-700 dark:text-muted-foreground",
            )}
          >
            {timestamp}
          </p>
        </div>
        {!read && (
          <span
            aria-hidden="true"
            className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-sky-600 dark:bg-sky-400"
          />
        )}
      </div>
    </button>
  );
}
