import { gql } from '@apollo/client';

export const ACTIVITY_LOG_CREATED = gql`
  subscription OnActivityLogCreated {
    activityLogCreated {
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

export const USER_ACTIVITY_UPDATED = gql`
  subscription OnUserActivityUpdated($userId: ID!) {
    userActivityUpdated(userId: $userId) {
      id
      userId
      action
      timestamp
      metadata
    }
  }
`;
