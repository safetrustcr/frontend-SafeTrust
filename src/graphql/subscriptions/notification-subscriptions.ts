import { gql } from "@apollo/client";

export const USER_NOTIFICATIONS_SUBSCRIPTION = gql`
  subscription UserNotifications($userId: String!) {
    notifications(
      where: { user_id: { _eq: $userId }, is_read: { _eq: false } }
      order_by: { created_at: desc }
      limit: 20
    ) {
      id
      title
      message
      type
      created_at
      is_read
      related_entity_id
      related_entity_type
    }
  }
`;
