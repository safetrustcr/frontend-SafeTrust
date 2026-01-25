"use client";

import React, { useEffect, useState } from 'react';
import { performanceMonitor } from '@/utils/performance-monitor';

export const QueryPerformance: React.FC = () => {
    const [metrics, setMetrics] = useState<Record<string, number>>({});

    useEffect(() => {
        const interval = setInterval(() => {
            setMetrics(performanceMonitor.getAllMetrics());
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    if (process.env.NODE_ENV !== 'development') return null;

    return (
        <div className="fixed bottom-4 left-4 z-50 bg-black/80 text-white p-4 rounded-lg border border-gray-700 text-xs font-mono shadow-xl max-w-xs opacity-50 hover:opacity-100 transition-opacity">
            <h4 className="font-bold border-b border-gray-700 pb-2 mb-2 text-blue-400">⚡ Performance Monitor</h4>
            {Object.entries(metrics).length === 0 ? (
                <p className="text-gray-500 italic">No metrics recorded yet...</p>
            ) : (
                <ul className="space-y-1">
                    {Object.entries(metrics).map(([label, avg]) => (
                        <li key={label} className="flex justify-between">
                            <span className="truncate mr-2">{label}:</span>
                            <span className={avg > 500 ? 'text-red-400' : 'text-green-400'}>{avg.toFixed(1)}ms</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
