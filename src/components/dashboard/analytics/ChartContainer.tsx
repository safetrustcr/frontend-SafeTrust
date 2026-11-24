"use client";

import React, { useId, useState } from "react";
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
  ResponsiveContainer,
} from "recharts";
import {
  Download,
  BarChart3,
  LineChart as LineChartIcon,
  Table2,
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

type ChartType = "line" | "bar" | "area";

interface ChartContainerProps {
  data: AnalyticsData[];
  title: string;
  description?: string;
  defaultType?: ChartType;
  heightClassName?: string;
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

const formatShortDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

const metricButtons = [
  { key: "pageViews", label: "Page Views", color: "#3b82f6" },
  { key: "clicks", label: "Clicks", color: "#22c55e" },
  { key: "users", label: "Users", color: "#f59e0b" },
] as const;

const describeChange = (current: number, previous: number | undefined) => {
  if (previous === undefined || previous === 0) return "";
  const change = Math.round(((current - previous) / previous) * 100);
  if (change === 0) return ", unchanged from the previous day";
  return `, ${change > 0 ? "up" : "down"} ${Math.abs(change)}% from the previous day`;
};

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
  heightClassName = "h-60 sm:h-80 lg:h-[400px]",
  showExport = true,
  className,
}) => {
  const motionEnabled = useMotionEnabled();
  const [chartType, setChartType] = useState<ChartType>(defaultType);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([
    "pageViews",
    "clicks",
  ]);
  const [showTable, setShowTable] = useState(false);
  const titleId = useId();
  const summaryId = useId();
  const viewId = useId();

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
      margin: { top: 5, right: 8, left: 0, bottom: 5 },
    };

    const commonElements = (
      <>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey="date"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          minTickGap={24}
          interval="preserveStartEnd"
          tickFormatter={formatShortDate}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          width={48}
          tickFormatter={formatNumber}
        />
        <Tooltip content={<CustomTooltip />} />
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

  const activeMetrics = metricButtons.filter(({ key }) =>
    selectedMetrics.includes(key),
  );

  const buildSummary = () => {
    if (data.length === 0) return "No data for the selected range.";
    if (activeMetrics.length === 0)
      return "Select a metric to see its summary.";
    const last = data[data.length - 1];
    const previous = data[data.length - 2];
    const range =
      data.length > 1
        ? `${formatShortDate(data[0].date)} to ${formatShortDate(last.date)}`
        : formatShortDate(last.date);
    const parts = activeMetrics.map(({ key, label }) => {
      const metric = key as keyof Pick<
        AnalyticsData,
        "pageViews" | "clicks" | "users"
      >;
      return `${label}: ${last[metric].toLocaleString()}${describeChange(last[metric], previous?.[metric])}.`;
    });
    return `Latest day of ${range}. ${parts.join(" ")}`;
  };

  const chartTypeButtons = [
    { type: "line" as ChartType, icon: LineChartIcon, label: "Line" },
    { type: "bar" as ChartType, icon: BarChart3, label: "Bar" },
    { type: "area" as ChartType, icon: TrendingUp, label: "Area" },
  ];

  return (
    <DashboardReveal className={className}>
      <Card className="border-border overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-border">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <div>
              <h3
                id={titleId}
                className="text-xl font-semibold text-foreground"
              >
                {title}
              </h3>
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
                    className="h-8 px-3"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline ml-1">{label}</span>
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                aria-pressed={showTable}
                aria-controls={viewId}
                onClick={() => setShowTable((prev) => !prev)}
              >
                <Table2 className="w-4 h-4" />
                <span className="ml-1">View as table</span>
              </Button>

              {/* Export Button */}
              {showExport && (
                <Button
                  variant="outline"
                  size="sm"
                  aria-label="Export chart"
                  onClick={handleExport}
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
                aria-pressed={selectedMetrics.includes(key)}
                onClick={() => toggleMetric(key)}
                className="h-7 text-xs"
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
        <figure
          aria-labelledby={titleId}
          aria-describedby={summaryId}
          className="m-0 p-4 sm:p-6"
        >
          <div id={viewId}>
            {showTable ? (
              <div className={`${heightClassName} overflow-auto`}>
                <table className="w-full text-sm">
                  <caption className="sr-only">{title}</caption>
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th scope="col" className="py-2 pr-4 font-medium">
                        Date
                      </th>
                      {activeMetrics.map(({ key, label }) => (
                        <th
                          key={key}
                          scope="col"
                          className="py-2 pr-4 text-right font-medium"
                        >
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row) => (
                      <tr key={row.date} className="border-b border-border/50">
                        <th
                          scope="row"
                          className="py-2 pr-4 text-left font-normal"
                        >
                          {new Date(row.date).toLocaleDateString()}
                        </th>
                        {activeMetrics.map(({ key }) => (
                          <td key={key} className="py-2 pr-4 text-right">
                            {row[key].toLocaleString()}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <DashboardReveal key={chartType} className={heightClassName}>
                <ResponsiveContainer width="100%" height="100%">
                  {renderChart()}
                </ResponsiveContainer>
              </DashboardReveal>
            )}
          </div>
          <figcaption id={summaryId} className="mt-3 text-sm text-foreground">
            {buildSummary()}
          </figcaption>
        </figure>
      </Card>
    </DashboardReveal>
  );
};
