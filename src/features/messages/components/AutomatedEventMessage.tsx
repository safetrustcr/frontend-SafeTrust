import { Shield, CheckCircle, AlertCircle, DollarSign } from "lucide-react";

type AutomatedMessage = {
  id: string;
  body: string;
  event_type: string | null;
  created_at: string;
};

const EVENT_STYLES: Record<
  string,
  { icon: typeof Shield; iconClass: string; surfaceClass: string }
> = {
  escrow_funded: {
    icon: DollarSign,
    iconClass: "text-success",
    surfaceClass: "border-success/20 bg-success/10",
  },
  milestone_approved: {
    icon: CheckCircle,
    iconClass: "text-info",
    surfaceClass: "border-info/20 bg-info/10",
  },
  escrow_completed: {
    icon: CheckCircle,
    iconClass: "text-violet-600 dark:text-violet-400",
    surfaceClass: "border-violet-500/20 bg-violet-500/10",
  },
  escrow_disputed: {
    icon: AlertCircle,
    iconClass: "text-destructive",
    surfaceClass: "border-destructive/20 bg-destructive/10",
  },
  default: {
    icon: Shield,
    iconClass: "text-muted-foreground",
    surfaceClass: "border-border bg-muted",
  },
};

export function AutomatedEventMessage({
  message,
}: {
  message: AutomatedMessage;
}) {
  const style =
    EVENT_STYLES[message.event_type ?? "default"] ?? EVENT_STYLES.default;
  const Icon = style.icon;

  return (
    <div
      className={`mx-8 my-1 flex items-center gap-3 rounded-xl border px-4 py-3 ${style.surfaceClass}`}
    >
      <Icon size={16} strokeWidth={2.2} className={style.iconClass} />
      <div>
        <p className="m-0 whitespace-pre-wrap text-[0.85rem] font-medium text-foreground">
          {message.body}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {new Date(message.created_at).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
