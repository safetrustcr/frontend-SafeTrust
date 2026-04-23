import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { updateGlobalConnectionState } from "@/hooks/useConnectionStatus";

export function createWsLink() {
  if (typeof window === "undefined") {
    return null;
  }

  return new GraphQLWsLink(
    createClient({
      url: process.env.NEXT_PUBLIC_HASURA_WS_URL || "ws://localhost:8080/v1/graphql",
      connectionParams: () => ({
        headers: {
          "x-hasura-admin-secret":
            process.env.NEXT_PUBLIC_HASURA_ADMIN_SECRET,
          "x-hasura-role": "admin",
        },
      }),
      shouldRetry: () => true,
      on: {
        connected: () => updateGlobalConnectionState("connected"),
        connecting: () => updateGlobalConnectionState("reconnecting"),
        closed: () => updateGlobalConnectionState("disconnected"),
        error: () => updateGlobalConnectionState("disconnected"),
      }
    }),
  );
}
