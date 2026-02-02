# GraphQL Codegen Workflow

## Type Generation

- Run `bun run codegen` to generate types from the Hasura schema.
- Types and hooks are output to `src/graphql/generated/`.
- Use `bun run codegen:watch` during development for automatic updates.

## Usage

- Import queries/mutations from `src/graphql/queries` and use the generated hooks/types.
- Example: see `src/components/EscrowList.tsx` and `src/graphql/queries/escrow-queries.ts`.

## VS Code Integration

- Ensure the recommended extensions in `.vscode/extensions.json` are installed.
- GraphQL auto-completion and validation are enabled via `.vscode/settings.json`.

## Best Practices

- Keep GraphQL operations in dedicated files.
- Use generated types for all GraphQL operations.
- Regenerate types after schema changes.

## Troubleshooting

- If types are not generated, ensure Hasura is running and env variables are set.
- Check `codegen.ts` for correct endpoint and headers.
