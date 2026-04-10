import { gql } from '@apollo/client';

export const GET_ACTIVITY_LOGS = gql`
  query GetActivityLogs($filters: ActivityLogFiltersInput) {
    activityLogs(filters: $filters) {
      id
      userId
      action
      timestamp
      metadata
      user {
        id
        name
        email
        role
      }
    }
  }
`;
