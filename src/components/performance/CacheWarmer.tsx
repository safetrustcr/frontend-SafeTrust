"use client";

import React from 'react';
import { useCacheWarming } from '@/hooks/useCacheWarming';
import { GET_ESCROW_TRANSACTIONS } from '@/graphql/mutations/escrow';

/**
 * Component that warms the cache for critical data on mount.
 * Should be placed high in the component tree (e.g., in layout).
 */
export const CacheWarmer: React.FC = () => {
    useCacheWarming([
        {
            query: GET_ESCROW_TRANSACTIONS,
            variables: { limit: 5, offset: 0, order_by: { created_at: 'desc' } }
        },
        // Add other critical queries here
    ]);

    return null; // Side-effect only component
};
