"use client";

import React, { useState } from "react";
import { DashboardReveal } from "@/components/dashboard/ui/DashboardReveal";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Download,
  BarChart3,
  LineChart as LineChartIcon,
  TrendingUp,
} from "lucide-react";
import { DashboardGlassCard as Card } from "@/components/dashboard/ui/DashboardGlassCard";
import { Button } from "@/components/ui/button";
import {
  AnalyticsData,
  ChartConfig,
  chartConfigs,
  exportToCSV,
  formatNumber,
} from "@/lib/chart-utils";
import { useMotionEnabled } from "@/components/ui/LazyMotionProvider";
import { cn } from "@/lib/utils";

type ChartType = "line" | "bar" | "area";

interface ChartContainerProps {
  data: AnalyticsData[];
  title: string;
  description?: string;
  defaultType?: ChartType;
  height?: number;
  showExport?: boolean;
  className?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    color: string;
    name: string;
    value: number;
    dataKey: string;
    payload: unknown;
  }>;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="border border-border bg-popover text-popover-foreground rounded-lg p-3 shadow-lg">
      <p className="text-sm font-medium text-foreground mb-2">
        {new Date(label!).toLocaleDateString()}
      </p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium text-foreground">
            {formatNumber(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

export const ChartContainer: React.FC<ChartContainerProps> = ({
  data,
  title,
  description,
  defaultType = "line",
  height = 400,
  showExport = true,
  className,
}) => {
  const motionEnabled = useMotionEnabled();
  const [chartType, setChartType] = useState<ChartType>(defaultType);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([
    "pageViews",
    "clicks",
  ]);

  const handleExport = () => {
    exportToCSV(data, `${title.toLowerCase().replace(/\s+/g, "-")}-chart-data`);
  };

  const toggleMetric = (metric: string) => {
    setSelectedMetrics((prev) =>
      prev.includes(metric)
        ? prev.filter((m) => m !== metric)
        : [...prev, metric],
    );
  };

  const getChartConfig = (): ChartConfig[] => {
    const configs = chartConfigs[chartType] || chartConfigs.line;
    return configs.filter((config) => selectedMetrics.includes(config.dataKey));
  };

  const renderChart = () => {
    const config = getChartConfig();

    const commonProps = {
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    const commonElements = (
      <>
        <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
        <XAxis
          dataKey="date"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickFormatter={(value) =>
            new Date(value).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })
          }
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickFormatter={formatNumber}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
      </>
    );

    switch (chartType) {
      case "bar":
        return (
          <BarChart {...commonProps}>
            {commonElements}
            {config.map((item) => (
              <Bar
                isAnimationActive={motionEnabled}
                key={item.dataKey}
                dataKey={item.dataKey}
                name={item.label}
                fill={item.color}
                fillOpacity={item.fillOpacity}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        );

      case "area":
        return (
          <AreaChart {...commonProps}>
            {commonElements}
            {config.map((item) => (
              <Area
                isAnimationActive={motionEnabled}
                key={item.dataKey}
                type="monotone"
                dataKey={item.dataKey}
                name={item.label}
                stroke={item.color}
                fill={item.color}
                fillOpacity={item.fillOpacity}
                strokeWidth={item.strokeWidth}
              />
            ))}
          </AreaChart>
        );

      default: // line
        return (
          <LineChart {...commonProps}>
            {commonElements}
            {config.map((item) => (
              <Line
                isAnimationActive={motionEnabled}
                key={item.dataKey}
                type="monotone"
                dataKey={item.dataKey}
                name={item.label}
                stroke={item.color}
                strokeWidth={item.strokeWidth}
                dot={{ fill: item.color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: item.color, strokeWidth: 2 }}
              />
            ))}
          </LineChart>
        );
    }
  };

  const chartTypeButtons = [
    { type: "line" as ChartType, icon: LineChartIcon, label: "Line" },
    { type: "bar" as ChartType, icon: BarChart3, label: "Bar" },
    { type: "area" as ChartType, icon: TrendingUp, label: "Area" },
  ];

  const metricButtons = [
    { key: "pageViews", label: "Page Views", color: "#3b82f6" },
    { key: "clicks", label: "Clicks", color: "#22c55e" },
    { key: "users", label: "Users", color: "#f59e0b" },
  ];

  return (
    <DashboardReveal className={className}>
      <Card className="border-border bg-background/50 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-700">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-foreground">{title}</h3>
              {description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {description}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Chart Type Selector */}
              <div className="flex items-center gap-1 p-1 bg-muted rounded-lg border border-border">
                {chartTypeButtons.map(({ type, icon: Icon, label }) => (
                  <Button
                    key={type}
                    variant={chartType === type ? "default" : "ghost"}
                    size="sm"
                    aria-label={`${label} chart`}
                    aria-pressed={chartType === type}
                    onClick={() => setChartType(type)}
                    className={cn(
                      "h-8 px-3 text-foreground",
                      chartType === type &&
                        "bg-primary text-primary-foreground",
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline ml-1">{label}</span>
                  </Button>
                ))}
              </div>

              {/* Export Button */}
              {showExport && (
                <Button
                  variant="outline"
                  size="sm"
                  aria-label="Export chart"
                  onClick={handleExport}
                  className="border-slate-700 hover:border-blue-500/30"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline ml-1">Export</span>
                </Button>
              )}
            </div>
          </div>

          {/* Metric Toggles */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <span className="text-sm text-muted-foreground mr-2">Show:</span>
            {metricButtons.map(({ key, label, color }) => (
              <Button
                key={key}
                variant={selectedMetrics.includes(key) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleMetric(key)}
                className={cn(
                  "h-7 text-xs border-slate-700",
                  selectedMetrics.includes(key) &&
                    "bg-primary text-primary-foreground",
                )}
              >
                <div
                  className="w-2 h-2 rounded-full mr-1.5"
                  style={{ backgroundColor: color, color: "white" }}
                />
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="p-4 sm:p-6">
          <DashboardReveal key={chartType} style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </DashboardReveal>
        </div>
      </Card>
    </DashboardReveal>
  );
};
