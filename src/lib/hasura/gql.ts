import { clientEnv } from "@/config/env";
import { auth } from "@/lib/firebase";

/**
 * A failed Hasura request. `code` is the GraphQL `extensions.code`
 * (e.g. "constraint-violation"), or "UNAUTHENTICATED" / "NETWORK" when the
 * request never got a GraphQL answer.
 */
export class GraphQLError extends Error {
  readonly code: string;

  constructor(message: string, code: string = message) {
    super(message);
    this.name = "GraphQLError";
    this.code = code;
  }
}

type GraphQLResponse<T> = {
  data?: T;
  errors?: Array<{ message: string; extensions?: { code?: string } }>;
};

/** The signed-in user's Firebase uid (Hasura's x-hasura-user-id). */
export async function currentUid(): Promise<string> {
  await auth.authStateReady();
  const uid = auth.currentUser?.uid;
  if (!uid) throw new GraphQLError("UNAUTHENTICATED");
  return uid;
}

/**
 * Runs a query against Hasura as the signed-in user (Firebase ID token).
 * Never uses the admin secret: permissions are enforced by Hasura roles.
 */
export async function gql<T>(query: string, variables?: object): Promise<T> {
  await auth.authStateReady();
  const user = auth.currentUser;
  if (!user) throw new GraphQLError("UNAUTHENTICATED");

  let body: GraphQLResponse<T>;
  try {
    const token = await user.getIdToken();
    const response = await fetch(clientEnv.NEXT_PUBLIC_HASURA_GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query, variables }),
    });
    body = await response.json();
  } catch {
    throw new GraphQLError("NETWORK");
  }

  const [first] = body.errors ?? [];
  if (first) {
    throw new GraphQLError(first.message, first.extensions?.code ?? "UNKNOWN");
  }
  if (!body.data) throw new GraphQLError("NETWORK");
  return body.data;
}
