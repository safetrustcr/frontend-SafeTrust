"use client";

import React, { useState } from 'react';

export const CacheStatus: React.FC = () => {
  const [stats] = useState({ entityCount: 0, sizeBytes: 0 });

  // TODO: wire in Batch N — reconnect useApolloClient + getCacheStats polling once Apollo is connected to backend

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