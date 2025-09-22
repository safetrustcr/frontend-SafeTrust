import { gql } from "@apollo/client";

export const HEALTH_CHECK_QUERY = gql`
  query HealthCheck {
    __typename
  }
`;
