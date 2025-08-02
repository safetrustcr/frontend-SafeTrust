'use client';

import type React from 'react';

import { ApolloProvider } from '@apollo/client';
import { apolloClient } from '@/config/apollo';

export function ApolloClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>;
}
