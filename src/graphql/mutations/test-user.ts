import { gql } from '@apollo/client';

export const CREATE_TEST_USER = gql`
  mutation CreateTestUser($email: String!, $firstName: String!, $lastName: String!) {
    insert_users_one(
      object: { email: $email, first_name: $firstName, last_name: $lastName }
    ) {
      id
      email
      first_name
      last_name
      created_at
    }
  }
`;
