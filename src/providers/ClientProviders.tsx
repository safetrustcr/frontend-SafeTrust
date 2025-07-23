'use client';

import React from 'react';
import { AuthProvider } from '@/providers/AuthProvider';
import { ApolloClientProvider } from './ApolloProviderWrapper';

export const ClientProviders: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <ApolloClientProvider>
      <AuthProvider>{children}</AuthProvider>
    </ApolloClientProvider>
  );
};
