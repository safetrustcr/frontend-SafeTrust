import { loadDevMessages, loadErrorMessages } from "@apollo/client/dev";

if (process.env.NODE_ENV === "development") {
  loadDevMessages();
  loadErrorMessages();
}

import {
  ApolloClient,
  ApolloLink,
  createHttpLink,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { RetryLink } from "@apollo/client/link/retry";
import { setContext } from "@apollo/client/link/context";
import { toast } from "react-toastify";
import { createAdvancedCache } from "@/lib/apollo-cache";
import { configureDevTools } from "@/lib/apollo-devtools";
import { setupCachePersistence } from "@/lib/cache-persistence";
import { split } from "@apollo/client";
import { getMainDefinition } from "@apollo/client/utilities";
import { createWsLink } from "@/lib/subscription-client";

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_HASURA_GRAPHQL_URL,
  fetchOptions: { cache: "no-store" },
});

const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      "x-hasura-admin-secret": process.env.NEXT_PUBLIC_HASURA_ADMIN_SECRET,
      "x-hasura-role": "admin",
    },
  };
});

const errorLink = onError((args: any) => {
  const { graphQLErrors, networkError } = args;
  if (graphQLErrors)
    graphQLErrors.forEach(({ message, locations, path }: any) =>
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
      ),
    );
  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
    toast.error(`Network error: ${networkError.message}`);
  }
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

const cache = createAdvancedCache();

export const apolloClient = new ApolloClient({
  cache,
  link: (() => {
    const httpChain = ApolloLink.from([retryLink, errorLink, authLink, httpLink]);
    const wsLink = createWsLink();
    if (!wsLink) return httpChain;
    
    return split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === "OperationDefinition" &&
          definition.operation === "subscription"
        );
      },
      wsLink,
      httpChain
    );
  })(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-and-network",
      errorPolicy: "all",
      notifyOnNetworkStatusChange: true,
    },
    query: {
      fetchPolicy: "network-only",
      errorPolicy: "all",
    },
    mutate: {
      errorPolicy: "all",
    },
  },
});

// Initialize persistence and devtools
if (typeof window !== "undefined") {
  setupCachePersistence(cache);
  configureDevTools(apolloClient);
}
