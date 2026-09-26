import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { auth } from "@/lib/firebase";
import { clientEnv } from "@/config/env";

const authLink = setContext(async (_, { headers }) => {
  const currentUser = auth.currentUser;
  const token = currentUser ? await currentUser.getIdToken() : null;
  return {
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(
    createHttpLink({
      uri: clientEnv.NEXT_PUBLIC_HASURA_GRAPHQL_URL,
      fetchOptions: { cache: "no-store" },
    })
  ),
  cache: new InMemoryCache(),
});
