"use client";

import React, { useState } from "react";
import { DashboardReveal } from "@/components/dashboard/ui/DashboardReveal";
import { RefreshCw, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardGlassCard as Card } from "@/components/dashboard/ui/DashboardGlassCard";
import { MetricCard } from "./MetricCard";
import { ChartContainer } from "./ChartContainer";
import { DateRangePicker } from "./DateRangePicker";
import { useAnalyticsData } from "@/hooks/use-analytics-data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface DateRange {
  start: Date;
  end: Date;
}

export const AnalyticsDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRange | null>(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    return { start, end };
  });

  const { data, metrics, isLoading, error, refetch } = useAnalyticsData({
    dateRange,
    refreshInterval: 60000, // Refresh every minute
  });

  const handleRefresh = () => {
    refetch();
    toast.success("Data Refreshed", {
      description: "Analytics data has been updated successfully.",
    });
  };

  const handleDateRangeChange = (newRange: DateRange | null) => {
    setDateRange(newRange);
  };

  if (error) {
    return (
      <Card className="p-8 border-destructive/20 bg-destructive/5">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-destructive mb-2">
            Error Loading Analytics
          </h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 sm:p-6">
      <div className="relative z-10 space-y-8">
        {/* Header */}
        <DashboardReveal className="flex flex-col gap-4 2xl:flex-row 2xl:items-start 2xl:justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
              Analytics Dashboard
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Real-time insights into your escrow platform&#39;s performance
            </p>
          </div>

          <div className="flex w-full flex-wrap items-center gap-3 2xl:w-auto">
            {/* Live Data indicator */}
            <div className="flex items-center gap-2 rounded-md border border-border bg-background/70 px-3 py-2 backdrop-blur-sm">
              <div
                aria-hidden="true"
                className="w-2 h-2 bg-emerald-500 rounded-full"
              />
              <span className="text-xs text-muted-foreground">Live Data</span>
            </div>

            <DateRangePicker
              value={dateRange}
              onChange={handleDateRangeChange}
              className="w-full sm:w-auto"
            />
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={isLoading}
              className={cn(
                "border-slate-700 hover:border-blue-500/30 w-full sm:w-auto",
                isLoading && "opacity-50",
              )}
            >
              <RefreshCw
                className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")}
              />
              Refresh
            </Button>
          </div>
        </DashboardReveal>

        {/* Loading State */}
        {isLoading && (
          <DashboardReveal className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="p-6 border-border">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-24 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-16 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-20"></div>
                </div>
              </Card>
            ))}
          </DashboardReveal>
        )}

        {/* Metrics Grid */}
        {!isLoading && metrics.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-4">
            {metrics.map((metric, index) => (
              <MetricCard
                key={metric.label}
                metric={metric}
                index={index}
                isCurrency={false}
              />
            ))}
          </div>
        )}

        {/* Charts Section */}
        {!isLoading && data.length > 0 && (
          <div className="space-y-8 text-foreground">
            {/* Main Chart */}
            <ChartContainer
              data={data}
              title="Traffic Overview"
              description="Interactive visualization of page views and interactions over time"
              defaultType="line"
              height={450}
              showExport={true}
            />

            {/* Secondary Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartContainer
                data={data}
                title="Engagement"
                description="User interaction trends"
                defaultType="area"
                height={350}
                showExport={false}
              />

              <ChartContainer
                data={data}
                title="User Growth"
                description="Active user metrics"
                defaultType="bar"
                height={350}
                showExport={false}
              />
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && data.length === 0 && (
          <DashboardReveal className="text-center py-16">
            <Card className="p-12 border-border max-w-md mx-auto">
              <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No Data Available
              </h3>
              <p className="text-muted-foreground mb-6">
                Start navigating the site to generate analytics data.
              </p>
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Data
              </Button>
            </Card>
          </DashboardReveal>
        )}
      </div>
    </Card>
  );
};
