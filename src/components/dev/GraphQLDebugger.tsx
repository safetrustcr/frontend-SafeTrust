"use client";

import React from 'react';
import { CacheInspector } from './CacheInspector';
import { QueryPerformance } from './QueryPerformance';

export const GraphQLDebugger: React.FC = () => {
    if (process.env.NODE_ENV !== 'development') return null;

    return (
        <>
            <CacheInspector />
            <QueryPerformance />
        </>
    );
};
