import { GraphQLClient } from 'graphql-request';
import { useAuthStore } from '@/stores/authStore';

const HASURA_URL = process.env.NEXT_PUBLIC_HASURA_URL || 'http://localhost:8080/v1/graphql';

export const createGraphQLClient = () => {
  const { token } = useAuthStore.getState();
  
  return new GraphQLClient(HASURA_URL, {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
};

export const graphqlClient = new GraphQLClient(HASURA_URL);