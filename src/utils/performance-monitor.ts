export class PerformanceMonitor {
    private static instance: PerformanceMonitor;
    private metrics: Map<string, number[]> = new Map();

    private constructor() { }

    static getInstance() {
        if (!PerformanceMonitor.instance) {
            PerformanceMonitor.instance = new PerformanceMonitor();
        }
        return PerformanceMonitor.instance;
    }

    startMeasure(label: string) {
        if (typeof window !== 'undefined' && window.performance) {
            performance.mark(`${label}-start`);
        }
    }

    endMeasure(label: string) {
        if (typeof window !== 'undefined' && window.performance) {
            performance.mark(`${label}-end`);
            performance.measure(label, `${label}-start`, `${label}-end`);

            const measure = performance.getEntriesByName(label, 'measure')[0];
            if (measure) {
                this.logMetric(label, measure.duration);
                performance.clearMarks(`${label}-start`);
                performance.clearMarks(`${label}-end`);
                performance.clearMeasures(label);
            }
        }
    }

    private logMetric(label: string, duration: number) {
        const current = this.metrics.get(label) || [];
        current.push(duration);
        if (current.length > 50) current.shift(); // Keep last 50
        this.metrics.set(label, current);

        if (process.env.NODE_ENV === 'development') {
            console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`);
        }
    }

    getAverage(label: string) {
        const values = this.metrics.get(label) || [];
        if (values.length === 0) return 0;
        return values.reduce((a, b) => a + b, 0) / values.length;
    }

    getAllMetrics() {
        const averages: Record<string, number> = {};
        this.metrics.forEach((values, label) => {
            averages[label] = this.getAverage(label);
        });
        return averages;
    }
}

export const performanceMonitor = PerformanceMonitor.getInstance();
