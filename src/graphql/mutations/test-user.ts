import { graphql } from "@/graphql/generated";

export const CREATE_TEST_USER = graphql(`
  mutation CreateTestUser(
    $email: String!
    $firstName: String!
    $lastName: String!
  ) {
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
`);

export const UPDATE_USER = graphql(`
  mutation UpdateUser($id: uuid!, $firstName: String, $lastName: String) {
    update_users_by_pk(
      pk_columns: { id: $id }
      _set: { first_name: $firstName, last_name: $lastName }
    ) {
      id
      email
      first_name
      last_name
      updated_at
    }
  }
`);

export const DELETE_USER = graphql(`
  mutation DeleteUser($id: uuid!) {
    delete_users_by_pk(id: $id) {
      id
      email
    }
  }
`);
