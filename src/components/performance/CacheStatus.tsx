"use client";

import React, { useEffect, useState } from 'react';
import { useApolloClient } from '@apollo/client';
import { getCacheStats } from '@/utils/cache-utils';

export const CacheStatus: React.FC = () => {
    const client = useApolloClient();
    const [stats, setStats] = useState({ entityCount: 0, sizeBytes: 0 });

    useEffect(() => {
        const updateStats = () => {
            setStats(getCacheStats(client));
        };

        updateStats();
        // Update every 5 seconds
        const interval = setInterval(updateStats, 5000);
        return () => clearInterval(interval);
    }, [client]);

    return (
        <div className="flex items-center gap-4 text-[10px] text-gray-400 uppercase tracking-widest bg-gray-900/50 px-3 py-1 rounded-full border border-gray-800">
            <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span>Entities: {stats.entityCount}</span>
            </div>
            <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                <span>Size: {(stats.sizeBytes / 1024).toFixed(1)}KB</span>
            </div>
        </div>
    );
};
