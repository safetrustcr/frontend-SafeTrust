import { gql } from "@apollo/client";

export const USER_NOTIFICATIONS_SUBSCRIPTION = gql`
  subscription UserNotifications($userId: uuid!) {
    notifications(
      where: { user_id: { _eq: $userId } }
      order_by: { created_at: desc }
      limit: 20
    ) {
      id
      type
      title
      message
      read
      created_at
    }
  }
`;
