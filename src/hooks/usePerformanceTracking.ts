import { useEffect } from 'react';
import { performanceMonitor } from '@/utils/performance-monitor';

export function usePerformanceTracking(label: string, isLoading: boolean) {
    useEffect(() => {
        if (isLoading) {
            performanceMonitor.startMeasure(label);
        } else {
            performanceMonitor.endMeasure(label);
        }
    }, [isLoading, label]);
}
