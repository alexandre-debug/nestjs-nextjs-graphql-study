import { gql } from '@apollo/client';

export const GET_USERS = gql`
  query GetUsers($role: String, $search: String) {
    users(role: $role, search: $search) {
      id
      name
      email
      role
      createdAt
    }
  }
`;

export const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      name
      email
      role
      createdAt
      activityLogs {
        id
        action
        timestamp
        metadata
      }
    }
  }
`;
