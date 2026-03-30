import { InMemoryCache, FieldPolicy, TypePolicy } from '@apollo/client';

// Advanced type policies for SafeTrust entities
const typePolicies: Record<string, TypePolicy> = {
  escrow_transactions: {
    keyFields: ['id'],
    fields: {
      escrow_transaction_users: {
        merge(existing = [], incoming: any[]) {
          return incoming;
        }
      },
      amount: {
        merge: true, // Always use incoming value for amount updates
      }
    }
  },
  escrow_transaction_users: {
    keyFields: ['id'],
    fields: {
      funding_status: {
        merge: true, // Always use latest funding status
      }
    }
  },
  users: {
    keyFields: ['id'],
    fields: {
      escrow_transactions: {
        merge: false, // Replace array completely
      }
    }
  },
  // Blockchain-related entities
  blockchain_transactions: {
    keyFields: ['transaction_hash'],
    fields: {
      confirmations: {
        merge: true,
      },
      status: {
        merge: true,
      }
    }
  }
};

// Field policies for complex data handling
const fieldPolicies: Record<string, FieldPolicy> = {
  // Custom pagination for escrow lists
  escrow_transactions: {
    keyArgs: ['where', 'order_by'],
    merge(existing = [], incoming, { args }) {
      if (args?.offset === 0) {
        return incoming;
      }
      return [...existing, ...incoming];
    }
  }
};

export const createAdvancedCache = () => {
  return new InMemoryCache({
    typePolicies,
    dataIdFromObject: (object: any) => {
      // Custom ID generation for cache normalization
      if (object.__typename && object.id) {
        return `${object.__typename}:${object.id}`;
      }
      return undefined;
    },
  });
};
