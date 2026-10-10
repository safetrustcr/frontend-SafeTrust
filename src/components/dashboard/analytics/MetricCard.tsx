"use client";

import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { DashboardGlassCard as Card } from "@/components/dashboard/ui/DashboardGlassCard";
import { MetricData, formatNumber, formatCurrency } from "@/lib/chart-utils";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  metric: MetricData;
  index: number;
  isCurrency?: boolean;
}

// Tints per metric color, aligned with the dApp's slate/blue design tokens.
const iconStyles: Record<MetricData["color"], string> = {
  primary: "bg-blue-500/10 text-blue-400",
  success: "bg-green-500/10 text-emerald-700 dark:text-emerald-400",
  warning: "bg-amber-500/10 text-amber-400",
  info: "bg-cyan-500/10 text-cyan-400",
};

export const MetricCard: React.FC<MetricCardProps> = ({
  metric,
  index,
  isCurrency = false,
}) => {
  const Icon = metric.icon;

  const getTrendIcon = (trend: MetricData["trend"]) => {
    switch (trend) {
      case "up":
        return <ArrowUp className="w-4 h-4" />;
      case "down":
        return <ArrowDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  const getTrendColor = (trend: MetricData["trend"]) => {
    switch (trend) {
      case "up":
        return "text-emerald-700 dark:text-emerald-400";
      case "down":
        return "text-red-700 dark:text-red-400";
      default:
        return "text-muted-foreground";
    }
  };

  const formatValue = (value: number) => {
    if (isCurrency) {
      return formatCurrency(value);
    }
    return formatNumber(Number(value.toFixed(2)));
  };

  return (
    <div className="h-full min-w-0">
      <Card
        revealDelay={index * 0.06}
        className={cn(
          "h-full min-w-0 overflow-hidden",
          "transition-shadow duration-200",
          "hover:shadow-[0_0_30px_hsl(217_91%_60%/0.2)] hover:border-blue-500/30",
        )}
      >
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-blue-600/5 opacity-30" />

        <div className="relative p-4 sm:p-5">
          {/* Header with icon and trend */}
          <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
            <div className="flex min-w-0 items-center gap-3">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg",
                  iconStyles[metric.color],
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-medium text-muted-foreground">
                {metric.label}
              </h3>
            </div>
            <div
              className={cn(
                "flex items-center gap-1 text-sm font-medium",
                getTrendColor(metric.trend),
              )}
            >
              {getTrendIcon(metric.trend)}
              <span>{Math.abs(metric.change).toFixed(1)}%</span>
            </div>
          </div>

          {/* Main value */}
          <div className="space-y-2">
            <div className="break-words text-2xl sm:text-3xl font-bold tabular-nums text-foreground">
              {formatValue(metric.value)}
            </div>

            {/* Change indicator */}
            <div
              className={cn(
                "flex items-center gap-1 text-sm",
                getTrendColor(metric.trend),
              )}
            >
              <span>
                {metric.trend === "up"
                  ? "+"
                  : metric.trend === "down"
                    ? "-"
                    : ""}
                {Math.abs(metric.change).toFixed(1)}% from last period
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
