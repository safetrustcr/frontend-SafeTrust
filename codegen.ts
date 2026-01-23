import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: {
    [process.env.NEXT_PUBLIC_HASURA_GRAPHQL_URL || 'http://localhost:8080/v1/graphql']: {
      headers: {
        'x-hasura-admin-secret': process.env.NEXT_PUBLIC_HASURA_ADMIN_SECRET || '',
      },
    },
  },
  documents: [
    'src/graphql/**/*.{ts,tsx,graphql,gql}',
    'src/components/**/*.{ts,tsx}',
    'src/app/**/*.{ts,tsx}',
  ],
  generates: {
    './src/graphql/generated/': {
      preset: 'client',
      config: {
        useTypeImports: true,
        defaultScalarType: 'unknown',
        strictScalars: true,
        scalars: {
          UUID: 'string',
          timestamptz: 'string',
          jsonb: 'Record<string, any>',
          numeric: 'number',
        },
      },
      plugins: [],
    },
    './src/graphql/generated/introspection.json': {
      plugins: ['introspection'],
    },
    './src/graphql/generated/schema.graphql': {
      plugins: ['schema-ast'],
    },
  },
  hooks: {
    afterAllFileWrite: ['prettier --write'],
  },
};

export default config;
