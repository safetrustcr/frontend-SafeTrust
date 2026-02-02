import { useEffect } from 'react';
import { useApolloClient, DocumentNode } from '@apollo/client';

/**
 * Hook to pre-fetch data and warm up the Apollo cache
 */
export function useCacheWarming(queries: { query: DocumentNode, variables?: any }[]) {
    const client = useApolloClient();

    useEffect(() => {
        const warmCache = async () => {
            try {
                await Promise.all(
                    queries.map(({ query, variables }) =>
                        client.query({
                            query,
                            variables,
                            fetchPolicy: 'network-only', // Ensure we hit the network to warm the cache
                        })
                    )
                );
                console.log('🔥 Cache warmed for critical data');
            } catch (error) {
                console.warn('⚠️ Cache warming partially failed:', error);
            }
        };

        warmCache();
    }, [client, queries]);
}
