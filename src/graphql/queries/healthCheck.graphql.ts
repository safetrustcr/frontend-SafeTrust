import { graphql } from "@/graphql/generated";

export const HEALTH_CHECK_QUERY = graphql(`
  query HealthCheck {
    __typename
  }
`);
