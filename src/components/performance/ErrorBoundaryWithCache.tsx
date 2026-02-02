"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { apolloClient } from '@/config/apollo';
import { clearPersistedCache } from '@/lib/cache-persistence';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundaryWithCache extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    private handleReset = async () => {
        // Clear Apollo cache and local storage on critical error
        await apolloClient.clearStore();
        await clearPersistedCache();
        // Reload page
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            return (
                <div className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-gray-900/50 rounded-2xl border border-red-500/20 text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">Something went wrong</h2>
                    <p className="text-gray-400 mb-8 max-w-md">
                        The application encountered an unexpected error. This might be due to corrupted local data.
                    </p>
                    <div className="flex gap-4">
                        <button
                            onClick={() => this.setState({ hasError: false })}
                            className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={this.handleReset}
                            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow-lg shadow-red-600/20"
                        >
                            Reset Cache & Reload
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
