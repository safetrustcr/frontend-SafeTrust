import type { NormalizedCacheObject } from '@apollo/client';

/**
 * Dumps the entire Apollo cache to console for debugging
 */
export const debugDumpCache = (client: any) => {
    console.log('📦 Apollo Cache Dump:', client.cache.extract());
};

/**
 * Manually evicts an entity from the cache
 */
export const evictFromCache = (client: any, id: string) => {
    client.cache.evict({ id });
    client.cache.gc();
};

/**
 * Checks if an entity exists in the cache
 */
export const isInCache = (client: any, id: string) => {
    const data = client.cache.extract();
    return !!data[id];
};

/**
 * Gets the cache hit ratio (simplified)
 */
export const getCacheStats = (client: any) => {
    // This is a placeholder as Apollo doesn't provide direct hit/miss stats out of the box
    const data = client.cache.extract();
    return {
        entityCount: Object.keys(data).length,
        sizeBytes: JSON.stringify(data).length,
    };
};
