import { useCallback, useEffect, useState } from "react";
import { Eye, MousePointerClick, Users, BarChart3 } from "lucide-react";
import {
  AnalyticsData,
  MetricData,
  calculateChange,
  generateMockData,
} from "@/lib/chart-utils";

interface UseAnalyticsDataOptions {
  dateRange: { start: Date; end: Date } | null;
  refreshInterval?: number;
}

interface UseAnalyticsDataReturn {
  data: AnalyticsData[];
  metrics: MetricData[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Provides analytics data for the escrow dashboard.
 *
 * TODO: wire to real escrow analytics data (Batch N).
 * For now this returns deterministic mock data so the dashboard can be
 * developed and reviewed independently of the analytics backend.
 */
export const useAnalyticsData = ({
  dateRange,
  refreshInterval = 60000, // 1 minute default
}: UseAnalyticsDataOptions): UseAnalyticsDataReturn => {
  const [data, setData] = useState<AnalyticsData[]>([]);
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateDaysBetween = useCallback((start: Date, end: Date): number => {
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  }, []);

  const generateMetrics = useCallback(
    (analyticsData: AnalyticsData[]): MetricData[] => {
      if (analyticsData.length < 1) return [];

      const latest = analyticsData[analyticsData.length - 1];
      const previous =
        analyticsData.length > 1
          ? analyticsData[analyticsData.length - 2]
          : { pageViews: 0, clicks: 0, users: 0 };

      const totalPageViews = analyticsData.reduce(
        (sum, item) => sum + item.pageViews,
        0,
      );
      const totalClicks = analyticsData.reduce(
        (sum, item) => sum + item.clicks,
        0,
      );
      const totalUsers = analyticsData.reduce(
        (sum, item) => sum + item.users,
        0,
      );
      // Using peak daily active users as a simplified engagement metric.
      const maxDailyUsers = Math.max(
        ...analyticsData.map((item) => item.users),
      );

      return [
        {
          label: "Total Page Views",
          value: totalPageViews,
          change: calculateChange(latest.pageViews, previous.pageViews),
          trend: latest.pageViews >= previous.pageViews ? "up" : "down",
          icon: Eye,
          color: "primary",
        },
        {
          label: "Total Interactions",
          value: totalClicks,
          change: calculateChange(latest.clicks, previous.clicks),
          trend: latest.clicks >= previous.clicks ? "up" : "down",
          icon: MousePointerClick,
          color: "success",
        },
        {
          label: "Active Users (Peak)",
          value: maxDailyUsers,
          change: calculateChange(latest.users, previous.users),
          trend: latest.users >= previous.users ? "up" : "down",
          icon: Users,
          color: "info",
        },
        {
          label: "Avg Actions/User",
          value:
            totalUsers > 0 ? (totalPageViews + totalClicks) / totalUsers : 0,
          change: 0, // Simplified
          trend: "neutral",
          icon: BarChart3,
          color: "warning",
        },
      ];
    },
    [],
  );

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const days = dateRange
        ? calculateDaysBetween(dateRange.start, dateRange.end)
        : 30;

      // TODO: wire to real escrow analytics data (Batch N).
      // Replace generateMockData with a call to the escrow analytics service.
      let processedData = generateMockData(days);

      if (dateRange) {
        processedData = processedData.filter((item) => {
          const itemDate = new Date(`${item.date}T00:00:00`);
          return itemDate >= dateRange.start && itemDate <= dateRange.end;
        });
      }

      setData(processedData);
      setMetrics(generateMetrics(processedData));
    } catch (err) {
      setError("Failed to fetch analytics data");
      console.error("Analytics data fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange, calculateDaysBetween, generateMetrics]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up automatic refresh
  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval]);

  return {
    data,
    metrics,
    isLoading,
    error,
    refetch,
  };
};
