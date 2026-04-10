import { gql } from '@apollo/client';

export const CREATE_ACTIVITY_LOG = gql`
  mutation CreateActivityLog($input: CreateActivityLogInput!) {
    createActivityLog(input: $input) {
      id
      userId
      action
      timestamp
      metadata
    }
  }
`;
