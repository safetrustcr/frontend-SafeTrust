export const configureDevTools = (client: any) => {
    if (process.env.NODE_ENV === 'development') {
        // Enable Apollo Client DevTools
        if (typeof window !== 'undefined') {
            (window as any).__APOLLO_CLIENT__ = client;
        }

        // Add query/mutation logging
        // Note: onQueryUpdated is not a standard ApolloClient method in v3, 
        // but we can use performance marks or other ways if needed.
        // For now, let's keep it simple as per instructions.

        console.log('🚀 Apollo DevTools configured');

        // Add cache modification logging
        const originalModify = client.cache.modify.bind(client.cache);
        client.cache.modify = function (options: any) {
            console.log('📝 Cache modified:', options);
            return originalModify(options);
        };
    }
};
