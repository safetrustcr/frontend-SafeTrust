"use client";

import React, { useState } from 'react';
import { useApolloClient } from '@apollo/client';

export const CacheInspector: React.FC = () => {
    const client = useApolloClient();
    const [isOpen, setIsOpen] = useState(false);
    const [cacheData, setCacheData] = useState<any>(null);

    const refreshCache = () => {
        setCacheData(client.cache.extract());
    };

    if (process.env.NODE_ENV !== 'development') return null;

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <button
                onClick={() => {
                    setIsOpen(!isOpen);
                    if (!isOpen) refreshCache();
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 transition"
            >
                {isOpen ? 'Close Inspector' : '🔍 Cache Inspector'}
            </button>

            {isOpen && (
                <div className="absolute bottom-12 right-0 w-96 h-96 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl overflow-hidden flex flex-col">
                    <div className="p-3 border-b border-gray-700 flex justify-between items-center bg-gray-800">
                        <h3 className="text-white font-bold">Apollo Cache State</h3>
                        <button onClick={refreshCache} className="text-xs text-blue-400 hover:text-blue-300">Refresh</button>
                    </div>
                    <div className="flex-1 overflow-auto p-4">
                        <pre className="text-green-400 text-xs font-mono">
                            {JSON.stringify(cacheData, null, 2)}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
};
