import { persistCache } from 'apollo-cache-persist';
import { InMemoryCache } from '@apollo/client';

export const setupCachePersistence = async (cache: InMemoryCache) => {
    if (typeof window === 'undefined') return;

    try {
        await persistCache({
            cache,
            storage: window.localStorage as any,
            maxSize: 1048576 * 5, // 5MB cache limit
            debug: process.env.NODE_ENV === 'development',
            trigger: 'write', // Persist on every write
            key: 'safetrust-apollo-cache',
        });

        console.log('✅ Apollo cache persistence initialized');
    } catch (error) {
        console.warn('⚠️ Cache persistence setup failed:', error);
    }
};

export const clearPersistedCache = async () => {
    if (typeof window === 'undefined') return;

    try {
        await window.localStorage.removeItem('safetrust-apollo-cache');
        console.log('🗑️ Persisted cache cleared');
    } catch (error) {
        console.error('Failed to clear persisted cache:', error);
    }
};
