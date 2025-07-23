'use client';

import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  ApolloLink,
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';
import { setContext } from '@apollo/client/link/context';
import { getAuth } from 'firebase/auth';
import { app } from '@/config/firebase';
import { toast } from 'react-toastify';

const auth = getAuth(app);

const ensureFirebaseInitialized = async () => {
  if (typeof window === 'undefined') return;
  return new Promise<void>((resolve) => {
    const unsubscribe = auth.onAuthStateChanged(() => {
      resolve();
      unsubscribe();
    });
  });
};

const getToken = async () => {
  await ensureFirebaseInitialized();
  const user = auth.currentUser;
  return user ? await user.getIdToken() : null;
};

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_HASURA_GRAPHQL_URL,
  fetchOptions: { cache: 'no-store' },
});

const authLink = setContext(async (_, { headers }) => {
  const token = await getToken();
  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : '',
      'x-hasura-admin-secret': process.env.NEXT_PUBLIC_HASURA_ADMIN_SECRET,
      'x-hasura-role': token ? 'user' : 'public',
    },
  };
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    );
  if (networkError) console.error(`[Network error]: ${networkError}`);
  toast.error(`Network error: ${networkError}`);
});

const retryLink = new RetryLink({
  delay: {
    initial: 300,
    max: Infinity,
    jitter: true,
  },
  attempts: {
    max: 5,
    retryIf: (error, _operation) => !!error,
  },
});

export const apolloClient = new ApolloClient({
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          escrow_transactions: {
            merge(existing = [], incoming: any[]) {
              return [...existing, ...incoming];
            },
          },
        },
      },
      escrow_transactions: {
        keyFields: ['id'],
      },
      users: {
        keyFields: ['id'],
      },
    },
  }),
  link: ApolloLink.from([retryLink, errorLink, authLink, httpLink]),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
      notifyOnNetworkStatusChange: true,
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});
