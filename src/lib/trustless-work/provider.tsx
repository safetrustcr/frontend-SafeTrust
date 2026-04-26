"use client";

/**
 * TrustlessWork Provider Component
 *
 * This component wraps the application with TrustlessWork SDK configuration,
 * providing access to escrow functionality throughout the app.
 *
 * @see https://docs.trustlesswork.com/trustless-work/react-library-hooks/getting-started
 */

import React from 'react';
import { TrustlessWorkConfig } from '@trustless-work/escrow';
import { getTrustlessWorkConfig, validateTrustlessWorkConfig } from './config';
import type { TrustlessWorkConfigOptions } from './types';

interface TrustlessWorkProviderProps {
  /**
   * Child components to be wrapped by the provider
   */
  children: React.ReactNode;

  /**
   * Optional custom configuration
   * If not provided, configuration will be loaded from environment variables
   */
  config?: Partial<TrustlessWorkConfigOptions>;
}

/**
 * TrustlessWork Provider Component
 *
 * Wraps the application with TrustlessWork SDK configuration.
 * Automatically loads configuration from environment variables or accepts custom config.
 *
 * @example
 * ```tsx
 * import { TrustlessWorkProvider } from '@/lib/trustless-work/provider';
 *
 * export default function App({ children }) {
 *   return (
 *     <TrustlessWorkProvider>
 *       {children}
 *     </TrustlessWorkProvider>
 *   );
 * }
 * ```
 *
 * @example With custom config
 * ```tsx
 * import { TrustlessWorkProvider } from '@/lib/trustless-work/provider';
 *
 * export default function App({ children }) {
 *   return (
 *     <TrustlessWorkProvider
 *       config={{
 *         apiKey: 'custom-api-key',
 *         baseURL: 'https://dev.api.trustlesswork.com',
 *       }}
 *     >
 *       {children}
 *     </TrustlessWorkProvider>
 *   );
 * }
 * ```
 */
export function TrustlessWorkProvider({
  children,
  config: customConfig,
}: TrustlessWorkProviderProps) {
  // Merge environment config with custom config
  const envConfig = getTrustlessWorkConfig();
  const config: TrustlessWorkConfigOptions = {
    ...envConfig,
    ...customConfig,
  };

  // Validate configuration
  const isValid = validateTrustlessWorkConfig(config);

  if (!isValid) {
    console.error(
      'TrustlessWork Provider: Invalid configuration. Please check your environment variables.'
    );
  }

  // Log configuration in development mode (without exposing API key)
  if (process.env.NODE_ENV === 'development') {
    console.log('TrustlessWork Provider initialized:', {
      baseURL: config.baseURL,
      network: config.network,
      hasApiKey: !!config.apiKey,
    });
  }

  return (
    <TrustlessWorkConfig baseURL={config.baseURL as any} apiKey={config.apiKey}>
      {children}
    </TrustlessWorkConfig>
  );
}

/**
 * HOC to wrap a component with TrustlessWork provider
 *
 * @example
 * ```tsx
 * import { withTrustlessWork } from '@/lib/trustless-work/provider';
 *
 * function MyComponent() {
 *   return <div>My Component</div>;
 * }
 *
 * export default withTrustlessWork(MyComponent);
 * ```
 */
export function withTrustlessWork<P extends object>(
  Component: React.ComponentType<P>
) {
  return function WrappedComponent(props: P) {
    return (
      <TrustlessWorkProvider>
        <Component {...props} />
      </TrustlessWorkProvider>
    );
  };
}
